import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { isDevAuthBypassEnabled } from "@/lib/supabase/admin-config";
import { requireAdminContext } from "@/lib/supabase/admin";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  if (isDevAuthBypassEnabled()) {
    return (
      <DashboardNav email="Local preview" previewMode>
        {children}
      </DashboardNav>
    );
  }

  const admin = await requireAdminContext();

  if (!admin.ok) {
    redirect(admin.response.status === 401 ? "/auth/login?redirectTo=/dashboard" : "/");
  }

  return <DashboardNav email={admin.user.email ?? "Admin"}>{children}</DashboardNav>;
}
