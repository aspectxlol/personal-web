import Link from "next/link";

interface FooterProps {
  name?: string;
  github?: string;
  location?: string;
}

export default function Footer({
  name = "Louie Hansen",
  github = "aspectxlol",
  location = "Jakarta, ID",
}: FooterProps) {
  return (
    <footer className="border-t border-[#1a2540] py-6 font-mono">
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
        <span className="text-[0.7rem] text-slate-500">
          © {new Date().getFullYear()} {name}
        </span>
        <span className="text-[0.7rem] text-[#2d3f5a]">
          Built with Next.js · {location}
        </span>
        <Link
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.7rem] text-slate-500 hover:text-cyan-400 transition-colors"
        >
          github.com/{github} ↗
        </Link>
      </div>
    </footer>
  );
}
