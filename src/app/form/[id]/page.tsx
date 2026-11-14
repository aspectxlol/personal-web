import { notFound, redirect } from "next/navigation";
import { FormResponder } from "@/components/forms/FormResponder";
import { devPreviewForm } from "@/lib/forms/dev-preview";
import {
  defaultFormSettings,
  parsePublishedFormDefinition,
} from "@/lib/forms/validation";
import { isDevAuthBypassEnabled } from "@/lib/supabase/admin-config";
import {
  createSupabasePublicClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  if (isDevAuthBypassEnabled() && slug === devPreviewForm.slug) {
    return (
      <FormResponder
        slug={slug}
        versionId="dev-preview-version"
        title={devPreviewForm.title}
        description={devPreviewForm.description}
        blocks={devPreviewForm.blocks}
        settings={defaultFormSettings}
        previewOnly
      />
    );
  }

  const publicSupabase = createSupabasePublicClient();
  const { data: form, error: formError } = await publicSupabase
    .from("forms")
    .select("id, title, description, slug, published_version_id")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("accepting_responses", true)
    .maybeSingle();

  if (formError) {
    throw new Error("Could not load this public form.");
  }
  if (!form?.published_version_id) notFound();

  const { data: version, error: versionError } = await publicSupabase
    .from("form_versions")
    .select("id, definition")
    .eq("form_id", form.id)
    .eq("id", form.published_version_id)
    .maybeSingle();

  if (versionError) {
    throw new Error("Could not load the published form version.");
  }
  if (!version) notFound();

  const definition = parsePublishedFormDefinition(version.definition);
  if (!definition) {
    throw new Error("The published form definition is invalid.");
  }

  const { blocks, settings } = definition;
  if (settings.respondentAccess.login === "required") {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.name !== "AuthSessionMissingError") {
      throw new Error("Could not verify the respondent's sign-in status.");
    }
    if (!user) {
      redirect(`/auth/login?redirectTo=${encodeURIComponent(`/form/${slug}`)}`);
    }
  }

  return (
    <FormResponder
      slug={form.slug ?? slug}
      versionId={version.id}
      title={form.title}
      description={form.description}
      blocks={blocks}
      settings={settings}
    />
  );
}
