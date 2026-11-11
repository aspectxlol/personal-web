import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedDashboardUser } from "@/lib/supabase/admin-config";

function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    "";

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";

  return { url, anonKey };
}

export async function middleware(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/form/");

  if (!isProtectedRoute || !url || !anonKey) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuthorizedDashboardUser(user.id)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/form/:path*"],
};
