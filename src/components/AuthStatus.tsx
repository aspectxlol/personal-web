"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthStatus() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    let active = true;

    async function loadSession() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!active) return;
      setUserEmail(session?.user?.email ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const client = createSupabaseBrowserClient();
    await client.auth.signOut();
    setUserEmail(null);
  };

  if (loading) {
    return <span className="header-auth-status">Loading…</span>;
  }

  if (userEmail) {
    return (
      <div className="header-auth-menu">
        <Link href="/dashboard" className="header-availability">
          Dashboard
        </Link>
        <button type="button" className="header-auth-button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="header-availability">
      Sign in
    </Link>
  );
}
