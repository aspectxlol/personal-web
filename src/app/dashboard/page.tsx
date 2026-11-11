import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  return (
    <main className="auth-page">
      <div className="auth-shell auth-shell-wide">
        <div className="auth-card auth-card-wide">
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            You are signed in as <strong>{user.email}</strong>.
          </p>

          <div className="auth-panel">
            <div>
              <span className="auth-panel-label">Status</span>
              <strong>Authenticated</strong>
            </div>
            <div>
              <span className="auth-panel-label">Provider</span>
              <strong>{user.app_metadata?.provider ?? "email"}</strong>
            </div>
          </div>

          <div className="auth-actions auth-actions-vertical">
            <Link href="/" className="button button-primary">
              Back to portfolio
            </Link>
            <Link href="/auth/login?redirectTo=/dashboard" className="button">
              Switch account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
