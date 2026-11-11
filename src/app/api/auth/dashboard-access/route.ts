import { NextResponse } from "next/server";
import { isAuthorizedDashboardUser } from "@/lib/supabase/admin-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ canAccessDashboard: false }, { status: 401 });
  }

  return NextResponse.json(
    { canAccessDashboard: isAuthorizedDashboardUser(user.id) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
