import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface SkillGroup {
  title: string;
  tags: { name: string; primary?: boolean }[];
}

interface SkillsGridProps {
  groups: SkillGroup[];
  className?: string;
}

export default function SkillsGrid({ groups, className }: SkillsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {groups.map((group) => (
        <div
          key={group.title}
          className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-5 flex flex-col gap-3"
        >
          <span className="text-[0.6rem] tracking-[0.12em] uppercase text-slate-500 font-mono">
            {group.title}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.tags.map((tag) =>
              tag.primary ? (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="text-[0.7rem] font-mono border-cyan-400/30 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors cursor-default"
                >
                  {tag.name}
                </Badge>
              ) : (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className="text-[0.7rem] font-mono border-white/10 text-slate-300 bg-transparent hover:border-cyan-400/30 hover:text-cyan-400 transition-colors cursor-default"
                >
                  {tag.name}
                </Badge>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
