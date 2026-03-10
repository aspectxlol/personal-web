import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tag?: string;
  className?: string;
}

export default function BlogPostCard({
  slug,
  title,
  excerpt,
  coverImage,
  tag = "Post",
  className,
}: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        "group flex flex-col bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden",
        "hover:border-cyan-400/35 hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Cover image */}
      <div className="aspect-video overflow-hidden relative">
        <Image
          src={coverImage}
          alt={title}
          width={640}
          height={360}
          loading="lazy"
          className="w-full h-full object-cover saturate-[0.8] group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-400"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-5 flex-1">
        <Badge
          variant="outline"
          className="self-start text-[0.6rem] px-1.5 h-5 border-cyan-400/30 text-cyan-400 bg-cyan-400/10 font-mono tracking-widest uppercase"
        >
          {tag}
        </Badge>

        <h3 className="font-display font-semibold text-slate-100 text-[1rem] leading-snug tracking-tight">
          {title}
        </h3>

        <p className="text-[0.775rem] text-slate-400 leading-relaxed font-mono flex-1">
          {excerpt}
        </p>

        <span className="mt-2 text-[0.7rem] text-cyan-400 font-mono flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200">
          Read more →
        </span>
      </div>
    </Link>
  );
}
