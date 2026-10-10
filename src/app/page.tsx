"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { projects } from "@/lib/data";

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
    <section className="statement section-shell">
      <Reveal>
        <p className="eyebrow">A developer thought</p>
        <p className="statement-text">&ldquo;{quote.quote}&rdquo;</p>
        <p className="quote-author">- {quote.author}</p>
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
    <Reveal className="project-carousel" delay={0.1}>
      <div className="project-carousel-top">
        <p className="project-number">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(projectCount).padStart(2, "0")}
        </p>
        <div
          className="carousel-controls"
          aria-label="Project carousel controls"
        >
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous project"
            disabled={projectCount < 2}
          >
            ←
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next project"
            disabled={projectCount < 2}
          >
            →
          </button>
        </div>
      </div>
      <div className="project-carousel-content">
        <div>
          <p className="project-status">{project.status}</p>
          <h3>{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>
        <div className="project-meta">
          <span>Stack</span>
          <strong>{project.technologies.join(" / ")}</strong>
        </div>
      </div>
      {project.repository && (
        <a
          href={project.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
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
      <header className="site-header">
        <Link href="#top" className="brand-mark" aria-label="Louie Hansen home">
          LH<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="site-nav">
          <Link href="#work">Work</Link>
          <Link href="#about">About</Link>
          <Link href="#contact">Contact</Link>
        </nav>
        <a href="mailto:louiehlinadi@gmail.com" className="header-availability">
          Available for work
        </a>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">Backend engineer / builder</p>
          <h1>
            <em>Louie Hansen.</em>
          </h1>
          <p className="hero-intro">
            Backend engineer building reliable software.
          </p>
          <div className="hero-actions">
            <Link href="#work" className="button button-primary group">
              See selected work <ArrowUpRight />
            </Link>
            <a href="mailto:louiehlinadi@gmail.com" className="text-link">
              Start a conversation <ArrowUpRight />
            </a>
          </div>
        </div>
        <Reveal className="hero-visual hero-signal" delay={0.2}>
          <div className="signal-mark" aria-hidden="true">
            LH
          </div>
          <div className="signal-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-caption">
            <span>01</span>
            <span>Build / ship / learn</span>
          </div>
        </Reveal>
      </section>

      <DevQuoteSection />

      <section id="work" className="work section-shell">
        <Reveal className="section-heading">
          <p className="eyebrow">Selected work</p>
          <h2>Small list. Serious intent.</h2>
        </Reveal>

        <ProjectCarousel />

        <div className="work-note">
          <a
            href="https://github.com/aspectxlol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Browse GitHub <ArrowUpRight />
          </a>
        </div>
      </section>

      <section className="capabilities section-shell">
        <Reveal className="capabilities-intro">
          <p className="eyebrow">What I bring</p>
          <h2>From first commit to reliable release.</h2>
        </Reveal>
        <Reveal className="capability-list" delay={0.1}>
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
            <article key={number} className="capability">
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <ArrowUpRight />
            </article>
          ))}
        </Reveal>
      </section>

      <section id="about" className="about section-shell">
        <Reveal className="about-image about-signal">
          <span>Curiosity index</span>
          <strong>
            Go deep.
            <br />
            Stay useful.
          </strong>
          <small>backend / product / infrastructure</small>
        </Reveal>
        <Reveal className="about-copy" delay={0.15}>
          <p className="eyebrow">A little context</p>
          <h2>Curious enough to go deep.</h2>
          <p>
            I&apos;m an Informatics student at Universitas Bunda Mulia,
            interested in backend engineering, infrastructure, and the systems
            that make software work.
          </p>
          <p>
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
            className="text-link"
          >
            More on LinkedIn <ArrowUpRight />
          </a>
        </Reveal>
      </section>

      <section id="contact" className="contact section-shell">
        <Reveal>
          <p className="eyebrow">Have a good problem?</p>
          <h2>
            Let&apos;s build
            <br />
            something <em>useful.</em>
          </h2>
          <a
            href="mailto:louiehlinadi@gmail.com"
            className="contact-link group"
          >
            louiehlinadi@gmail.com <ArrowUpRight />
          </a>
        </Reveal>
      </section>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Louie Hansen Linadi</span>
        <span>Built with Next.js and care.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
