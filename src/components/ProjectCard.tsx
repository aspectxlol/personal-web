import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-[#3178c6]",
  JavaScript: "bg-[#f7df1e]",
  Java:       "bg-[#f89820]",
  Rust:       "bg-[#ce422b]",
  Go:         "bg-[#00add8]",
  Python:     "bg-[#3572a5]",
  HTML:       "bg-[#e34c26]",
  CSS:        "bg-[#563d7c]",
  Kotlin:     "bg-[#7f52ff]",
  Swift:      "bg-[#f05138]",
};

export interface ProjectCardProps {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  topics?: string[];
  className?: string;
}

export default function ProjectCard({
  name,
  description,
  url,
  language,
  stars,
  topics = [],
  className,
}: ProjectCardProps) {
  const langColor = language ? (LANG_COLORS[language] ?? "bg-cyan-400") : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col gap-3 p-6 bg-[#080b11]",
        "border border-[#1a2540] transition-colors duration-200",
        "hover:bg-[#0f1623]",
        className
      )}
    >
      {/* Top accent line on hover */}
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-display font-semibold text-slate-100 text-[0.95rem] tracking-tight leading-snug">
          {name}
        </span>
        <span className="text-cyan-400 text-sm opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 flex-shrink-0">
          ↗
        </span>
      </div>

      {/* Description */}
      <p className="text-[0.775rem] text-slate-400 leading-relaxed flex-1 font-mono">
        {description ?? "No description yet."}
      </p>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.slice(0, 3).map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-[0.6rem] px-1.5 py-0 h-5 border-white/10 text-slate-500 font-mono"
            >
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-1">
        {langColor && language && (
          <span className="flex items-center gap-1.5 text-[0.7rem] text-slate-400 font-mono">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", langColor)} />
            {language}
          </span>
        )}
        {stars > 0 && (
          <span className="flex items-center gap-1 text-[0.7rem] text-slate-400 font-mono">
            ★ {stars}
          </span>
        )}
      </div>
    </a>
  );
}
