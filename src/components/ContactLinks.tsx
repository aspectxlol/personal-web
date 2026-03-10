import { cn } from "@/lib/utils";

export interface ContactLink {
  platform: string;
  value: string;
  href: string;
  icon: string;
}

interface ContactLinksProps {
  links: ContactLink[];
  className?: string;
}

export default function ContactLinks({ links, className }: ContactLinksProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group flex items-center gap-4 px-5 py-4",
            "bg-[#0f1623] border border-[#1a2540] rounded-xl",
            "hover:border-cyan-400/35 hover:bg-[#141c2e] hover:translate-x-1",
            "transition-all duration-200"
          )}
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-[#080b11] border border-[#1a2540] flex items-center justify-center text-base flex-shrink-0">
            {link.icon}
          </div>

          {/* Text */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-mono">
              {link.platform}
            </span>
            <span className="text-[0.875rem] text-slate-100 font-mono truncate">
              {link.value}
            </span>
          </div>

          {/* Arrow */}
          <span className="text-slate-600 text-sm group-hover:text-cyan-400 transition-colors duration-200">
            →
          </span>
        </a>
      ))}
    </div>
  );
}
