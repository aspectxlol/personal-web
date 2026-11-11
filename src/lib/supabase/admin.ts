import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAuthorizedDashboardUser } from "./admin-config";
import type { Database } from "./database.types";
import { createSupabaseServerClient } from "./server";

type AdminContext =
  | {
      ok: true;
      supabase: SupabaseClient<Database>;
      user: User;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAdminContext(): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  if (!isAuthorizedDashboardUser(user.id)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "You do not have access to forms." }, { status: 403 }),
    };
  }

  return { ok: true, supabase, user };
}
