"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
    <div className="grid min-h-dvh grid-cols-[248px_minmax(0,1fr)] bg-[var(--paper)] max-[800px]:grid-cols-1">
      <aside className="sticky top-0 flex h-dvh flex-col border-r border-[var(--line)] bg-[var(--paper-deep)] px-4 pt-7 pb-[18px] max-[800px]:z-[15] max-[800px]:grid max-[800px]:h-auto max-[800px]:grid-cols-[auto_1fr_auto] max-[800px]:items-center max-[800px]:gap-[14px] max-[800px]:border-r-0 max-[800px]:border-b max-[800px]:py-[10px]">
        <Link href="/" className="flex items-baseline gap-3 px-3 pt-1 pb-[30px] text-[1.35rem] font-extrabold tracking-[-0.08em] max-[800px]:p-0" aria-label="Louie Hansen home">
          LH<span className="ml-[-12px] text-accent">.</span>
          <small className="font-mono text-[.58rem] tracking-[.13em] text-ink-soft max-[800px]:hidden">WORKSPACE</small>
        </Link>

        <div className="px-3 pb-[10px] font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase max-[800px]:hidden">Workspace</div>
        <nav className="grid gap-1 max-[800px]:flex max-[800px]:justify-center" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[42px] items-center gap-3 border border-transparent px-3 py-[9px] text-[.88rem] font-semibold text-ink-soft transition-colors hover:bg-[color-mix(in_srgb,var(--paper)_60%,transparent)] hover:text-ink max-[800px]:min-h-[38px] max-[800px]:px-[10px] max-[800px]:py-[7px] max-[800px]:text-[.78rem]",
                  active &&
                    "border-[color-mix(in_srgb,var(--accent)_25%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_9%,var(--paper))] text-accent-dark",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="w-5 text-center text-base" aria-hidden="true">{item.label === "Forms" ? "▤" : "⌂"}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-[10px] border-t border-[var(--line)] px-2 pt-4 max-[800px]:col-span-full max-[800px]:mt-[-5px] max-[800px]:flex max-[800px]:justify-end max-[800px]:border-0 max-[800px]:pt-[6px]">
          <div className="flex min-w-0 items-center gap-[10px] max-[800px]:hidden">
            <span className="grid size-[34px] flex-[0_0_34px] place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[.8rem] font-bold text-accent-dark" aria-hidden="true">
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[.72rem] text-ink-soft">{email}</span>
          </div>
          {signOutError && (
            <p className="m-0 text-[.75rem] text-accent-dark" role="alert">
              {signOutError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-self-start border-0 bg-transparent px-0 py-[5px] font-mono text-[.68rem] text-ink-soft uppercase hover:bg-transparent hover:text-accent-dark disabled:cursor-wait disabled:opacity-60 max-[800px]:py-0"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>
      <main className="min-w-0 p-[clamp(32px,5vw,68px)] max-[800px]:px-[22px] max-[800px]:py-8 max-[560px]:px-4 max-[560px]:py-[26px]">{children}</main>
    </div>
  );
}
