import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as
    | "signup"
    | "invite"
    | "magiclink"
    | "recovery"
    | "email_change"
    | "email"
    | "unknown"
    | null;
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
