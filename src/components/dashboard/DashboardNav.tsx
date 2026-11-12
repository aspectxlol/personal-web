"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/forms", label: "Forms" },
];

export function DashboardNav({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError("");
    const { error } = await createSupabaseBrowserClient().auth.signOut();
    if (error) {
      setSignOutError(error.message);
      setSigningOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link href="/" className="dashboard-brand" aria-label="Louie Hansen home">
          LH<span>.</span>
          <small>WORKSPACE</small>
        </Link>

        <div className="dashboard-nav-label">Workspace</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboard-nav-link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span aria-hidden="true">{item.label === "Forms" ? "▤" : "⌂"}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user">
            <span className="dashboard-avatar" aria-hidden="true">
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="dashboard-user-email">{email}</span>
          </div>
          {signOutError && (
            <p className="dashboard-signout-error" role="alert">
              {signOutError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="dashboard-signout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
