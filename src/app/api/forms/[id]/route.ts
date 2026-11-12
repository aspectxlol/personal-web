import { NextResponse } from "next/server";
import {
  buildDraftDefinition,
  parseFormFieldList,
  parseDraftDefinition,
  parseFormSettings,
  parseFormSettingsInput,
  toFormRecord,
} from "@/lib/forms/validation";
import type { FormField, FormSettings } from "@/lib/forms/types";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdminContext } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

function isUuid(value: string) {
  return /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not load this form." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  try {
    return NextResponse.json(
      { form: toFormRecord(data) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Saved form data is invalid. Review this form's fields." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid form update." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: Database["public"]["Tables"]["forms"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  let submittedFields: FormField[] | null = null;
  let submittedSettings: FormSettings | null = null;
  let publishedDefinition: ReturnType<typeof buildDraftDefinition> | null = null;
  let hasUpdate = false;

  if ("title" in input) {
    if (typeof input.title !== "string" || !input.title.trim() || input.title.trim().length > 120) {
      return NextResponse.json({ error: "Form name must be between 1 and 120 characters." }, { status: 400 });
    }
    updates.title = input.title.trim();
    hasUpdate = true;
  }

  if ("description" in input) {
    if (typeof input.description !== "string" || input.description.length > 2000) {
      return NextResponse.json({ error: "Description must be 2,000 characters or fewer." }, { status: 400 });
    }
    updates.description = input.description.trim();
    hasUpdate = true;
  }

  if ("settings" in input) {
    const settings = parseFormSettingsInput(input.settings);
    if (!settings) {
      return NextResponse.json({ error: "One or more form settings are invalid." }, { status: 400 });
    }
    submittedSettings = settings;
    hasUpdate = true;
  }

  if ("accepting_responses" in input) {
    if (typeof input.accepting_responses !== "boolean") {
      return NextResponse.json({ error: "Response availability must be enabled or disabled." }, { status: 400 });
    }
    updates.accepting_responses = input.accepting_responses;
    hasUpdate = true;
  }

  if ("fields" in input) {
    const fields = parseFormFieldList(input.fields);
    if (!fields) {
      return NextResponse.json({ error: "One or more form fields are invalid." }, { status: 400 });
    }
    submittedFields = fields;
    updates.draft_definition = buildDraftDefinition(fields);
    hasUpdate = true;
  }

  if ("fields" in input || "settings" in input) {
    let fields = submittedFields;
    let settings = submittedSettings;
    if (!fields || !settings) {
      const { data, error } = await admin.supabase
        .from("forms")
        .select("draft_definition")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: "Could not load the current form definition." }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "Form not found." }, { status: 404 });
      }
      fields ??= parseDraftDefinition(data.draft_definition);
      settings ??= parseFormSettings(data.draft_definition);
    }
    if (settings.respondentAccess.oneResponsePerAccount) {
      settings.respondentAccess.login = "required";
    }
    updates.draft_definition = buildDraftDefinition(fields, settings);
    submittedFields = fields;
    submittedSettings = settings;
  }

  if ("status" in input) {
    if (input.status !== "draft" && input.status !== "published") {
      return NextResponse.json({ error: "Invalid form status." }, { status: 400 });
    }
    updates.status = input.status;
    hasUpdate = true;

    if (input.status === "published") {
      let fields = submittedFields;
      let settings = submittedSettings;
      if (!fields || !settings) {
        const { data, error } = await admin.supabase
          .from("forms")
          .select("draft_definition")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          return NextResponse.json({ error: "Could not verify this form's questions." }, { status: 500 });
        }
        if (!data) {
          return NextResponse.json({ error: "Form not found." }, { status: 404 });
        }
        fields ??= parseDraftDefinition(data.draft_definition);
        settings ??= parseFormSettings(data.draft_definition);
      }

      if (fields.length === 0) {
        return NextResponse.json(
          { error: "Add at least one question before publishing this form." },
          { status: 400 }
        );
      }
      publishedDefinition = buildDraftDefinition(fields, settings);
    }
  }

  if (!hasUpdate) {
    return NextResponse.json({ error: "No form changes were provided." }, { status: 400 });
  }

  if (publishedDefinition) {
    const { data: latestVersion, error: versionLookupError } = await admin.supabase
      .from("form_versions")
      .select("version_number")
      .eq("form_id", id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (versionLookupError) {
      return NextResponse.json(
        { error: "Could not determine the next published version." },
        { status: 500 }
      );
    }

    const { data: version, error: versionInsertError } = await admin.supabase
      .from("form_versions")
      .insert({
        form_id: id,
        version_number: (latestVersion?.version_number ?? 0) + 1,
        definition: publishedDefinition,
        created_by: admin.user.id,
      })
      .select("id")
      .single();

    if (versionInsertError) {
      return NextResponse.json(
        { error: "Could not create a published form version." },
        { status: 500 }
      );
    }

    updates.published_version_id = version.id;
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not save this form." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  try {
    return NextResponse.json({ form: toFormRecord(data) });
  } catch {
    return NextResponse.json(
      { error: "The saved form could not be read. Review this form's fields." },
      { status: 500 }
    );
  }
}
