// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroStat {
  value: string;
  label: string;
}

interface HeroSectionProps {
  repoCount?: number;
  stats?: HeroStat[];
}

const DEFAULT_STATS: HeroStat[] = [
  { value: "3+", label: "Serious projects" },
  { value: "1yr", label: "Building in public" },
  { value: "∞", label: "Things left to learn" },
];

export default function HeroSection({ repoCount = 0, stats = DEFAULT_STATS }: HeroSectionProps) {
  const allStats: HeroStat[] = [
    { value: `${repoCount}+`, label: "Public repos" },
    ...stats,
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pt-[60px] overflow-hidden"
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* Orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-[10%] -right-[5%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.04) 40%, transparent 70%)",
          animation: "orbFloat 8s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[5%] -left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 65%)",
          animation: "orbFloat 12s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.04); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s 0.0s ease both; }
        .anim-2 { animation: fadeUp 0.6s 0.1s ease both; }
        .anim-3 { animation: fadeUp 0.6s 0.2s ease both; }
        .anim-4 { animation: fadeUp 0.6s 0.3s ease both; }
        .anim-5 { animation: fadeUp 0.6s 0.4s ease both; }
      `}</style>

      <div className="relative z-10 max-w-[1140px] mx-auto px-6 py-16">
        {/* Badge */}
        {/* <div className="anim-1 mb-8">
          <Badge
            variant="outline"
            className="border-cyan-400/25 bg-cyan-400/10 text-cyan-400 font-mono text-[0.7rem] tracking-widest uppercase px-3 py-1 rounded-full gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Available for opportunities in 2025
          </Badge>
        </div> */}

        {/* Headline */}
        <h1 className="anim-2 font-display font-extrabold leading-[1.05] tracking-[-0.03em] text-slate-100 mb-6"
          style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}
        >
          Building the web,{" "}
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            one layer at a time.
          </span>
        </h1>

        {/* Subtext */}
        <p className="anim-3 font-mono text-[1.05rem] text-slate-400 max-w-[46ch] leading-[1.75] mb-10 font-normal">
          I&apos;m <span className="text-cyan-400">Louie Hansen</span> — a developer from Jakarta with a bias for shipping.
          I care about clean systems, good interfaces, and tools that feel inevitable.
        </p>

        {/* CTAs */}
        <div className="anim-4 flex gap-3 flex-wrap">
          <Button asChild className="bg-cyan-400 text-[#080b11] font-semibold hover:bg-sky-300 transition-all hover:-translate-y-px hover:shadow-[0_8px_25px_rgba(56,189,248,0.25)] font-mono text-sm">
            <Link href="#projects">View Projects →</Link>
          </Button>
          <Button asChild variant="outline" className="border-[#1a2540] bg-[#0f1623] text-slate-100 hover:bg-[#141c2e] hover:border-[#2d3f5a] hover:-translate-y-px font-mono text-sm transition-all">
            <Link href="#contact">Get in touch</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="anim-5 flex gap-10 mt-14 pt-8 border-t border-[#1a2540] flex-wrap">
          {allStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-display font-bold text-[1.75rem] tracking-tight text-slate-100 leading-none">
                {stat.value.replace(/\d+/, (n) => n)}
                <span className="text-cyan-400">
                  {/* pull trailing non-numeric suffix like + or yr */}
                </span>
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.08em] text-slate-500 font-mono">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
