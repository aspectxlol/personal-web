"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Writing", href: "/#writing" },
];

export default function Navbar() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center px-6 transition-all duration-300",
        stuck
          ? "bg-[#080b11]/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <nav className="max-w-[1140px] w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/#hero"
          className="font-display font-bold text-[1.05rem] text-slate-100 tracking-tight hover:text-white transition-colors"
        >
          Louie<span className="text-cyan-400">.</span>
        </Link>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs tracking-wide text-slate-400 hover:text-slate-100 hover:bg-white/5 px-3 py-2 rounded-md transition-all duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          asChild
          size="sm"
          variant="outline"
          className="text-cyan-400 border-cyan-400/25 bg-cyan-400/10 hover:bg-cyan-400/20 hover:text-cyan-300 hover:border-cyan-400/40 text-xs h-8"
        >
          <Link href="/#contact">Contact ↗</Link>
        </Button>
      </nav>
    </header>
  );
}
