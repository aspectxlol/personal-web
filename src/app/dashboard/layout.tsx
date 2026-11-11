import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { requireAdminContext } from "@/lib/supabase/admin";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const admin = await requireAdminContext();

  if (!admin.ok) {
    redirect(admin.response.status === 401 ? "/auth/login?redirectTo=/dashboard" : "/");
  }

  return <DashboardNav email={admin.user.email ?? "Admin"}>{children}</DashboardNav>;
}
