import { cn } from "@/lib/utils";
import React from "react";

interface SectionHeaderProps {
  label: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  titleClassName?: string;
}

export default function SectionHeader({
  label,
  title,
  description,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", className)}>
      {/* Label */}
      <div className="flex items-center gap-3 mb-3">
        <span className="block w-6 h-px bg-cyan-400" />
        <span className="text-[0.65rem] tracking-[0.15em] uppercase text-cyan-400 font-mono">
          {label}
        </span>
      </div>

      {/* Title */}
      <h2
        className={cn(
          "font-display font-bold text-slate-100 leading-tight tracking-tight text-[clamp(1.75rem,4vw,2.75rem)]",
          titleClassName
        )}
      >
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="mt-3 text-sm text-slate-400 max-w-[52ch] leading-relaxed font-mono">
          {description}
        </p>
      )}
    </div>
  );
}
