import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <header className="mb-[38px] flex items-end justify-between gap-7 max-[560px]:mb-[18px] max-[560px]:flex-col">
        <div>
          <p className="mb-0 font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase">Workspace</p>
          <h1 className="my-[10px] mb-[10px] text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[.95] tracking-[-.075em]">Overview</h1>
          <p className="m-0 max-w-[58ch] text-[.92rem] leading-[1.55] text-ink-soft">
            Manage your forms and keep your work organized.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-[14px] max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1" aria-label="Workspace sections">
        <Link href="/dashboard/forms" className="group relative flex min-h-[210px] flex-col items-start border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper-deep)_66%,var(--paper))] p-[22px] transition-[border-color,transform,background-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--paper-deep)]">
          <span className="mb-6 grid size-[38px] place-items-center border border-[var(--line)] bg-[var(--paper)] text-[1.1rem] text-accent" aria-hidden="true">
            ▤
          </span>
          <span className="mb-1.5 font-mono text-[.62rem] tracking-[.08em] text-ink-soft uppercase">Workspace</span>
          <strong className="text-xl tracking-[-.04em]">Forms</strong>
          <span className="mt-[7px] text-[.83rem] text-ink-soft">
            Create, edit, and publish forms.
          </span>
          <span className="absolute right-[22px] bottom-5 text-accent" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
