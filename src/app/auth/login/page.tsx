"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const client = createSupabaseBrowserClient();
    const callbackUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error: signInError } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[linear-gradient(180deg,var(--paper)_0%,color-mix(in_srgb,var(--paper-deep)_55%,var(--paper))_100%)] px-6 py-18">
      <div className="w-full min-w-0 max-w-120">
        <div className="flex min-w-0 flex-col gap-4 border border-(--line) bg-[color-mix(in_srgb,var(--paper-deep)_80%,var(--paper))] p-[clamp(28px,5vw,48px)]">
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">Protected access</p>
          <h1 className="m-0 text-[clamp(2.8rem,6vw,4rem)] leading-[.9]">Continue with Google</h1>
          <p className="m-0 leading-[1.6] text-ink-soft">
            Sign in with your Google account to access the dashboard.
          </p>

          {error && <p className="m-0 text-[.9rem] leading-[1.5] text-accent-dark">{error}</p>}

          <div className="mt-2 flex flex-col items-stretch gap-3">
            <Button
              type="button"
              className="h-auto gap-3 whitespace-normal border border-(--ink) bg-(--ink) px-4.5 py-3.75 text-center text-[.86rem] font-bold text-paper transition-[transform,background-color,color] duration-150 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--accent) active:translate-y-px active:scale-[.98]"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>
          </div>

          <div className="flex justify-start border-t border-(--line) pt-2">
            <Link href="/" className="inline-flex items-center gap-3 border-b border-(--ink) pb-1.25 text-[.86rem] font-bold transition-colors hover:text-accent">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-dvh place-items-center bg-(--paper) px-6 py-18" />}>
      <LoginForm />
    </Suspense>
  );
}
