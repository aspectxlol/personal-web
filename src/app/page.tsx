"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AuthStatus } from "@/components/AuthStatus";
import { projects } from "@/lib/data";
import { Button } from "@/components/ui/button";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ArrowUpRight() {
  return (
    <span
      aria-hidden="true"
      className="text-lg leading-none transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
    >
      ↗
    </span>
  );
}

type DevQuote = {
  quote: string;
  author: string;
};

const fallbackQuote: DevQuote = {
  quote: "Simplicity is prerequisite for reliability.",
  author: "Edsger W. Dijkstra",
};

function DevQuoteSection() {
  const [quote, setQuote] = useState<DevQuote>(fallbackQuote);

  useEffect(() => {
    let active = true;

    fetch("/dev-quotes.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Quote library request failed: ${response.status}`);
        }
        return response.json() as Promise<DevQuote[]>;
      })
      .then((quotes) => {
        if (!active || quotes.length === 0) return;
        const selected = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote({
          quote: selected.quote.replace(/[—–]/g, "-"),
          author: selected.author,
        });
      })
      .catch(() => {
        // Keep the curated fallback visible when the static quote library is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto flex min-h-dvh w-[min(1320px,calc(100%-48px))] flex-col justify-center border-t border-(--line) py-37.5 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:py-23">
      <Reveal>
        <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">A developer thought</p>
        <p className="m-0 max-w-237.5 text-[clamp(2rem,4.5vw,4.8rem)] leading-[.98] font-semibold tracking-[-.065em]">&ldquo;{quote.quote}&rdquo;</p>
        <p className="mt-7 mb-0 font-mono text-[.72rem] tracking-[.08em] text-accent uppercase">- {quote.author}</p>
      </Reveal>
    </section>
  );
}

function ProjectCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const project = projects[activeIndex];
  const projectCount = projects.length;

  if (!project) return null;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + projectCount) % projectCount);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % projectCount);
  };

  return (
    <Reveal className="flex h-107.5 flex-col justify-between overflow-hidden border border-(--line) bg-(--paper-deep) p-[clamp(28px,5vw,72px)] max-[767px]:h-auto max-[767px]:min-h-115 max-[767px]:p-6" delay={0.1}>
      <div className="flex items-center justify-between gap-5">
        <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(projectCount).padStart(2, "0")}
        </p>
        <div
          className="flex gap-2"
          aria-label="Project carousel controls"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-none border border-(--line) bg-transparent text-[1.1rem] text-ink transition-[background-color,color,transform] duration-150 hover:border-(--ink) hover:bg-(--ink) hover:text-paper active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-35"
            onClick={showPrevious}
            aria-label="Previous project"
            disabled={projectCount < 2}
          >
            ←
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-none border border-(--line) bg-transparent text-[1.1rem] text-ink transition-[background-color,color,transform] duration-150 hover:border-(--ink) hover:bg-(--ink) hover:text-paper active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-35"
            onClick={showNext}
            aria-label="Next project"
            disabled={projectCount < 2}
          >
            →
          </Button>
        </div>
      </div>
      <div className="grid h-55 flex-[0_0_220px] grid-cols-[minmax(0,1.35fr)_minmax(180px,.65fr)] items-end gap-12 max-[767px]:h-auto max-[767px]:min-h-62.5 max-[767px]:flex-auto max-[767px]:grid-cols-1 max-[767px]:gap-7.5">
        <div>
          <p className="mb-4 font-mono text-[.68rem] tracking-[.08em] text-accent uppercase">{project.status}</p>
          <h3 className="mb-4 text-[clamp(2.5rem,5vw,5.5rem)] leading-[.88]">{project.title}</h3>
          <p className="m-0 max-w-[52ch] text-base leading-[1.6] text-ink-soft">{project.description}</p>
        </div>
        <div className="mt-0 grid grid-cols-[72px_1fr] gap-x-4.5 gap-y-2.5 border-t border-(--line) pt-4.5 font-mono text-[.66rem] leading-[1.5]">
          <span className="text-ink-soft uppercase">Stack</span>
          <strong>{project.technologies.join(" / ")}</strong>
        </div>
      </div>
      {project.repository && (
        <a
          href={project.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 self-start border-b border-(--ink) pb-1.25 text-[.86rem] font-bold transition-colors hover:text-accent"
        >
          Open repository <ArrowUpRight />
        </a>
      )}
    </Reveal>
  );
}

export default function Page() {
  return (
    <main>
      <header className="fixed top-0 left-1/2 z-20 flex min-h-19 w-full max-w-none -translate-x-1/2 items-center justify-between gap-6 border-b border-(--line) bg-(--paper) px-[max(24px,calc((100%-1320px)/2))] max-[767px]:min-h-17 max-[767px]:w-full max-[767px]:gap-2 max-[767px]:px-3">
        <Link href="#top" className="text-[1.35rem] font-extrabold tracking-[-.08em]" aria-label="Louie Hansen home">
          LH<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex gap-7.5 font-mono text-[.7rem] tracking-[.12em] text-ink-soft uppercase max-[767px]:gap-2 max-[767px]:text-[.55rem] [&_a]:transition-colors [&_a:hover]:text-accent">
          <Link href="#work">Work</Link>
          <Link href="#about">About</Link>
          <Link href="#contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <AuthStatus />
        </div>
      </header>

      <section id="top" className="mx-auto grid min-h-dvh w-[min(1320px,calc(100%-48px))] grid-cols-[minmax(0,.93fr)_minmax(320px,.72fr)] items-center gap-[clamp(48px,9vw,150px)] pt-35 pb-22 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:grid-cols-1 max-[767px]:gap-13 max-[767px]:pt-28 max-[767px]:pb-18">
        <div className="pb-[7vh] max-[767px]:pb-0">
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">Backend engineer / builder</p>
          <h1>
            <em>Louie Hansen.</em>
          </h1>
          <p className="mb-9 max-w-107.5 text-[clamp(1.05rem,1.7vw,1.3rem)] leading-[1.45] text-ink-soft">
            Backend engineer building reliable software.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="#work" className="group inline-flex items-center gap-3 border border-(--ink) bg-(--ink) px-4.5 py-3.75 text-[.86rem] font-bold text-paper transition-[transform,background-color,color] duration-150 hover:-translate-y-0.5 hover:border-(--accent) hover:bg-(--accent) active:translate-y-px active:scale-[.98]">
              See selected work <ArrowUpRight />
            </Link>
            <a href="mailto:louiehlinadi@gmail.com" className="inline-flex items-center gap-3 border-b border-(--ink) pb-1.25 text-[.86rem] font-bold transition-colors hover:text-accent">
              Start a conversation <ArrowUpRight />
            </a>
          </div>
        </div>
        <Reveal className="relative flex aspect-[.82] w-full max-h-172.5 items-center justify-center overflow-hidden border border-(--line) bg-[linear-gradient(135deg,transparent_49.8%,var(--line)_50%,transparent_50.2%),linear-gradient(45deg,transparent_49.8%,var(--line)_50%,transparent_50.2%),var(--paper-deep)] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_55%,rgb(0_0_0_/_0.48))] after:content-[''] max-[767px]:max-h-none" delay={0.2}>
          <div className="text-[clamp(5rem,12vw,11rem)] font-extrabold leading-[.8] tracking-[-.14em] text-accent" aria-hidden="true">
            LH
          </div>
          <div className="absolute top-[26%] right-[16%] left-[16%] grid gap-2.25" aria-hidden="true">
            <span className="block h-px bg-(--ink) opacity-65" />
            <span className="block h-px w-[68%] justify-self-end bg-(--ink) opacity-65" />
            <span className="block h-px w-[42%] justify-self-end bg-(--ink) opacity-65" />
          </div>
          <div className="absolute right-5 bottom-4.5 left-5 z-[1] flex justify-between font-mono text-[.66rem] tracking-[.08em] text-[#f5f1e9] uppercase">
            <span>01</span>
            <span>Build / ship / learn</span>
          </div>
        </Reveal>
      </section>

      <DevQuoteSection />

      <section id="work" className="mx-auto flex min-h-dvh w-[min(1320px,calc(100%-48px))] flex-col justify-center pt-16 pb-35 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:py-22">
        <Reveal className="mb-15 max-w-145 max-[767px]:mb-9">
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">Selected work</p>
          <h2 className="mb-0 text-[clamp(2.5rem,5vw,5rem)] leading-[.94] font-semibold">Small list. Serious intent.</h2>
        </Reveal>

        <ProjectCarousel />

        <div className="mt-12 flex justify-between gap-5 border-t border-(--line) pt-4.5 font-mono text-[.68rem] tracking-[.08em] text-ink-soft uppercase">
          <a
            href="https://github.com/aspectxlol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border-b border-(--ink) pb-1.25 text-[.86rem] font-bold transition-colors hover:text-accent"
          >
            Browse GitHub <ArrowUpRight />
          </a>
        </div>
      </section>

      <section className="mx-auto grid min-h-dvh w-[min(1320px,calc(100%-48px))] grid-cols-[.85fr_1.15fr] content-center gap-[clamp(48px,10vw,180px)] border-t border-(--line) py-32.5 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:grid-cols-1 max-[767px]:gap-12.5 max-[767px]:py-22">
        <Reveal className="self-start">
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">What I bring</p>
          <h2 className="mb-0 text-[clamp(2.5rem,5vw,5rem)] leading-[.94] font-semibold">From first commit to reliable release.</h2>
        </Reveal>
        <Reveal className="border-t border-(--line)" delay={0.1}>
          {[
            [
              "01",
              "Backend systems",
              "APIs, data models, and services that stay understandable as they grow.",
            ],
            [
              "02",
              "Full-stack products",
              "Thoughtful interfaces connected to the systems behind them.",
            ],
            [
              "03",
              "Infrastructure",
              "Deployment, observability, and the practical work that keeps software moving.",
            ],
          ].map(([number, title, description]) => (
            <article key={number} className="grid grid-cols-[42px_1fr_auto] items-start gap-4.5 border-b border-(--line) py-6">
              <span className="font-mono text-[.66rem] text-accent">{number}</span>
              <div>
                <h3 className="mb-2 text-xl tracking-[-.04em]">{title}</h3>
                <p className="mb-0 max-w-[42ch] leading-[1.55] text-ink-soft">{description}</p>
              </div>
              <ArrowUpRight />
            </article>
          ))}
        </Reveal>
      </section>

      <section id="about" className="mx-auto grid min-h-dvh w-[min(1320px,calc(100%-48px))] grid-cols-[minmax(280px,.8fr)_minmax(0,1fr)] items-center gap-[clamp(48px,11vw,180px)] border-t border-(--line) pt-30 pb-40 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:grid-cols-1 max-[767px]:gap-11.5 max-[767px]:py-22">
        <Reveal className="relative flex aspect-[.83] max-h-155 flex-col justify-between overflow-hidden border border-(--line) bg-[linear-gradient(90deg,transparent_49.8%,var(--line)_50%,transparent_50.2%),var(--paper-deep)] p-7 max-[767px]:max-h-120">
          <span className="relative z-[1] font-mono text-[.68rem] tracking-[.08em] text-accent uppercase">Curiosity index</span>
          <strong className="relative z-[1] text-[clamp(3rem,6vw,6.5rem)] leading-[.84] tracking-[-.09em] text-ink">
            Go deep.
            <br />
            Stay useful.
          </strong>
          <small className="relative z-[1] font-mono text-[.68rem] tracking-[.08em] text-accent uppercase">backend / product / infrastructure</small>
        </Reveal>
        <Reveal className="max-w-132.5" delay={0.15}>
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">A little context</p>
          <h2 className="mb-8.5 text-[clamp(2.5rem,5vw,5rem)] leading-[.94] font-semibold">Curious enough to go deep.</h2>
          <p className="mb-4.5 max-w-[50ch] text-base leading-[1.6] text-ink-soft">
            I&apos;m an Informatics student at Universitas Bunda Mulia,
            interested in backend engineering, infrastructure, and the systems
            that make software work.
          </p>
          <p className="mb-4.5 max-w-[50ch] text-base leading-[1.6] text-ink-soft">
            I care about understanding how things work under the hood, writing
            code that's easy to reason about, and building things that solve
            real problems. Sometimes that means keeping things simple. Sometimes
            it means spending an unreasonable amount of time on a side project
            just to learn something new.
          </p>
          <a
            href="https://linkedin.com/in/louie-hansen-linadi-aa4969290"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4.5 inline-flex items-center gap-3 border-b border-(--ink) pb-1.25 text-[.86rem] font-bold transition-colors hover:text-accent"
          >
            More on LinkedIn <ArrowUpRight />
          </a>
        </Reveal>
      </section>

      <section id="contact" className="mx-auto flex min-h-dvh w-[min(1320px,calc(100%-48px))] flex-col justify-center border-t border-(--line) py-32.5 pb-38.75 max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:py-22">
        <Reveal>
          <p className="mb-5.5 font-mono text-[.68rem] tracking-[.12em] text-accent uppercase">Have a good problem?</p>
          <h2 className="mb-12 text-[clamp(4rem,10vw,10.5rem)] leading-[.84] font-semibold tracking-[-.09em] max-[767px]:text-[clamp(2.75rem,13vw,6rem)]">
            Let&apos;s build
            <br />
            something <em>useful.</em>
          </h2>
          <a
            href="mailto:louiehlinadi@gmail.com"
            className="group inline-flex items-center gap-3 font-mono text-[clamp(.78rem,1.3vw,1rem)] tracking-[.02em] text-accent transition-colors hover:text-accent-dark"
          >
            louiehlinadi@gmail.com <ArrowUpRight />
          </a>
        </Reveal>
      </section>

      <footer className="mx-auto flex w-[min(1320px,calc(100%-48px))] justify-between gap-5 border-t border-(--line) pt-6 pb-8.5 font-mono text-[.64rem] tracking-[.05em] text-ink-soft uppercase max-[767px]:w-[min(100%-32px,1320px)] max-[767px]:flex-wrap">
        <span>© {new Date().getFullYear()} Louie Hansen Linadi</span>
        <span>Built with Next.js and care.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
