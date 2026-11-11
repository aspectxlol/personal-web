import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
