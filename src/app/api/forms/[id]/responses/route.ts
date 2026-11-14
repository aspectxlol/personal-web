import { NextResponse } from "next/server";
import {
  parseFormResponseAnswers,
  parsePublishedFormDefinition,
} from "@/lib/forms/validation";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json(
          { error: "Cross-origin submissions are not allowed." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Cross-origin submissions are not allowed." },
        { status: 403 },
      );
    }
  }

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid response data." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.formVersionId !== "string" ||
    input.formVersionId.length > 80
  ) {
    return NextResponse.json({ error: "Invalid form version." }, { status: 400 });
  }

  const { id: slug } = await params;
  const publicSupabase = createSupabasePublicClient();
  const { data: form, error: formError } = await publicSupabase
    .from("forms")
    .select("id, published_version_id")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("accepting_responses", true)
    .maybeSingle();

  if (formError) {
    return NextResponse.json({ error: "Could not verify this form." }, { status: 500 });
  }
  if (!form?.published_version_id) {
    return NextResponse.json({ error: "This form is not accepting responses." }, { status: 404 });
  }
  if (form.published_version_id !== input.formVersionId) {
    return NextResponse.json(
      { error: "This form has changed. Reload it before submitting." },
      { status: 409 },
    );
  }

  const { data: version, error: versionError } = await publicSupabase
    .from("form_versions")
    .select("id, definition")
    .eq("form_id", form.id)
    .eq("id", form.published_version_id)
    .maybeSingle();

  if (versionError) {
    return NextResponse.json({ error: "Could not verify the published form." }, { status: 500 });
  }
  if (!version) {
    return NextResponse.json({ error: "The published form version was not found." }, { status: 404 });
  }

  const definition = parsePublishedFormDefinition(version.definition);
  if (!definition) {
    return NextResponse.json({ error: "The published form definition is invalid." }, { status: 500 });
  }

  const answers = parseFormResponseAnswers(definition.blocks, input.answers);
  if (!answers) {
    return NextResponse.json(
      { error: "One or more answers are missing or invalid." },
      { status: 400 },
    );
  }

  const settings = definition.settings;
  let respondentUserId: string | null = null;
  let submissionSupabase = publicSupabase;
  if (settings.respondentAccess.login !== "none") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.name !== "AuthSessionMissingError") {
      return NextResponse.json({ error: "Could not verify your sign-in status." }, { status: 500 });
    }
    if (!user && settings.respondentAccess.login === "required") {
      return NextResponse.json({ error: "Sign in before submitting this form." }, { status: 401 });
    }
    if (user) {
      respondentUserId = user.id;
      submissionSupabase = supabase;
    }
  }

  const { error: insertError } = await submissionSupabase
    .from("form_responses")
    .insert({
      form_id: form.id,
      form_version_id: version.id,
      answers,
      respondent_user_id: respondentUserId,
      one_response_per_account: settings.respondentAccess.oneResponsePerAccount,
    });

  if (insertError?.code === "23505") {
    return NextResponse.json(
      { error: "You have already submitted a response to this form." },
      { status: 409 },
    );
  }
  if (insertError) {
    console.error("Could not save a public form response.", insertError);
    return NextResponse.json({ error: "Could not save your response." }, { status: 500 });
  }

  return NextResponse.json(
    { submitted: true },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
