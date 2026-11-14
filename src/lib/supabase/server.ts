import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie write failures and retry on the next request.
        }
      },
    },
  });
}

export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
