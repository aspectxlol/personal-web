import { redirect } from "next/navigation";
import { FormsManager } from "@/components/dashboard/FormsManager";
import { devPreviewForm } from "@/lib/forms/dev-preview";
import { toFormRecord } from "@/lib/forms/validation";
import { isDevAuthBypassEnabled } from "@/lib/supabase/admin-config";
import { requireAdminContext } from "@/lib/supabase/admin";

export default async function DashboardFormsPage() {
  if (isDevAuthBypassEnabled()) {
    return <FormsManager initialForms={[devPreviewForm]} previewOnly />;
  }

  const admin = await requireAdminContext();

  if (!admin.ok) {
    redirect(admin.response.status === 401 ? "/auth/login?redirectTo=/dashboard/forms" : "/");
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <FormsManager
        initialForms={[]}
        initialError="Forms could not be loaded. Apply the Supabase forms migration, then reload this page."
      />
    );
  }

  try {
    return <FormsManager initialForms={data.map(toFormRecord)} />;
  } catch {
    return (
      <FormsManager
        initialForms={[]}
        initialError="Saved form data could not be read. Review the forms table fields."
      />
    );
  }
}
