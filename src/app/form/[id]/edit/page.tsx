import { notFound, redirect } from "next/navigation";
import { FormEditor } from "@/components/forms/FormEditor";
import { toFormRecord } from "@/lib/forms/validation";
import { requireAdminContext } from "@/lib/supabase/admin";

export default async function EditFormPage({
  params,
}: PageProps<"/form/[id]/edit">) {
  const { id } = await params;
  const admin = await requireAdminContext();

  if (!admin.ok) {
    redirect(admin.response.status === 401 ? `/auth/login?redirectTo=/form/${id}/edit` : "/");
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load this form from Supabase.");
  }

  if (!data) notFound();

  return <FormEditor initialForm={toFormRecord(data)} />;
}
