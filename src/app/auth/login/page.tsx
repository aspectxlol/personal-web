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
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Protected access</p>
          <h1>Continue with Google</h1>
          <p className="auth-subtitle">
            Sign in with your Google account to access the dashboard.
          </p>

          {error && <p className="auth-message auth-error">{error}</p>}

          <div className="auth-actions auth-actions-vertical">
            <Button
              type="button"
              className="button button-primary"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </Button>
          </div>

          <div className="auth-footer">
            <Link href="/" className="text-link">
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
    <Suspense fallback={<main className="auth-page" />}> 
      <LoginForm />
    </Suspense>
  );
}
