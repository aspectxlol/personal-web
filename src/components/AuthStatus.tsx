"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessCheckFailed, setAccessCheckFailed] = useState(false);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    let active = true;

    async function syncAuthState(session: Awaited<ReturnType<typeof client.auth.getSession>>["data"]["session"]) {
      setUserEmail(session?.user?.email ?? null);
      setCanAccessDashboard(false);

      if (!session) {
        setAccessCheckFailed(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/dashboard-access", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Dashboard access check failed: ${response.status}`);
        }

        const result: { canAccessDashboard: boolean } = await response.json();
        if (!active) return;
        setCanAccessDashboard(result.canAccessDashboard);
        setAccessCheckFailed(false);
      } catch {
        if (!active) return;
        setCanAccessDashboard(false);
        setAccessCheckFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadSession() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!active) return;
      await syncAuthState(session);
    }

    loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(session);
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
    setCanAccessDashboard(false);
  };

  if (loading) {
    return <span className="font-mono text-[.68rem] tracking-[.06em] text-ink-soft">Loading…</span>;
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-3">
        {canAccessDashboard && (
          <Button asChild variant="link" className="h-auto border-0 bg-transparent p-0 font-mono text-[.7rem] tracking-[.04em] text-accent hover:bg-transparent hover:text-accent">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-auto border-0 bg-transparent p-0 font-mono text-[.68rem] tracking-[.06em] text-ink-soft hover:bg-transparent hover:text-accent"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
        {accessCheckFailed && (
          <span className="font-mono text-[.68rem] tracking-[.06em] text-ink-soft" role="status">
            Dashboard access unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <Button asChild variant="link" className="h-auto border-0 bg-transparent p-0 font-mono text-[.7rem] tracking-[.04em] text-accent hover:bg-transparent hover:text-accent">
      <Link href="/auth/login">Sign in</Link>
    </Button>
  );
}
