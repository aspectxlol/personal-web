import { parseFile } from "@/lib/utils";
import React from "react";
import { Separator } from "@/components/ui/separator";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "@/components/ProjectCard";
import BlogPostCard from "@/components/BlogPostCard";
import SkillsGrid, { type SkillGroup } from "@/components/SkillsGrid";
import ContactLinks, { type ContactLink } from "@/components/ContactLinks";
import Footer from "@/components/Footer";

type BlogPost = {
  name: string;
  metadata: { title: string; excerpt: string; coverImage: string };
};

type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
};

const SKILLS: SkillGroup[] = [
  { title: "Languages", tags: [{ name: "TypeScript", primary: true }, { name: "JavaScript", primary: true }, { name: "Java" }, { name: "Bash" }, { name: "SQL" }] },
  { title: "Frontend",  tags: [{ name: "Next.js", primary: true }, { name: "React", primary: true }, { name: "Tailwind CSS" }, { name: "HTML/CSS" }] },
  { title: "Backend",   tags: [{ name: "Fastify", primary: true }, { name: "Node.js", primary: true }, { name: "Drizzle ORM" }, { name: "PostgreSQL" }, { name: "Redis" }] },
  { title: "Infra",     tags: [{ name: "Linux", primary: true }, { name: "Docker" }, { name: "Self-hosting" }, { name: "Railway" }, { name: "Vercel" }] },
  { title: "Tools",     tags: [{ name: "Git", primary: true }, { name: "GitHub Actions" }, { name: "WebSockets" }, { name: "REST APIs" }] },
  { title: "Exploring", tags: [{ name: "Go" }, { name: "Rust" }, { name: "Godot" }, { name: "ML / XGBoost" }] },
];

const CONTACT_LINKS: ContactLink[] = [
  { platform: "Email",     value: "gamernxt6@gmail.com", href: "mailto:gamernxt6@gmail.com",          icon: "✉️" },
  { platform: "Discord",   value: "@aspectxlol",         href: "https://discord.com/users/aspectxlol", icon: "💬" },
  { platform: "Instagram", value: "@leui.hansen",        href: "https://instagram.com/leui.hansen",    icon: "📸" },
];

export const dynamic = "force-static";
export const revalidate = false;

export default async function Home() {
  // Blog posts
  const rawContents = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((r) => r.json()).catch(() => []);

  const contents = Array.isArray(rawContents)
    ? rawContents
        .filter((item: { name: string }) => item.name.endsWith(".md") || item.name.endsWith(".mdx"))
        .map((item: { name: string; _links: { self: string } }) => ({ name: item.name, url: item._links.self }))
    : [];

  const parsedContent: BlogPost[] = [];
  for (const item of contents) {
    const fileData = await fetch(item.url, {
      headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
    }).then((r) => r.json()).catch(() => null);
    if (!fileData) continue;
    const parsed = await parseFile(atob(fileData.content));
    parsedContent.push({ name: item.name, metadata: parsed.data.frontmatter as BlogPost["metadata"] });
  }

  // GitHub repos — fetch all, use total for stat, show non-forks in grid
  const rawRepos = await fetch(
    "https://api.github.com/users/aspectxlol/repos?sort=pushed&per_page=100",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((r) => r.json()).catch(() => []);

  const allRepos: GithubRepo[] = Array.isArray(rawRepos) ? rawRepos : [];
  const totalRepoCount = allRepos.length;
  const repos = allRepos.filter((r) => !r.fork).slice(0, 6);

  return (
    <div className="bg-[#080b11] text-slate-100 font-mono antialiased h-screen overflow-y-scroll snap-y snap-proximity scroll-smooth [scrollbar-width:thin] [scrollbar-color:#2d3f5a_#080b11]">
      <Navbar />

      {/* Hero — repoCount shows total public repos (including forks) */}
      <div className="snap-start">
        <HeroSection repoCount={totalRepoCount} />
      </div>

      {/* About */}
      <section id="about" className="snap-start py-24 border-t border-[#1a2540]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionHeader label="About" title={<>Going somewhere,<br />fast.</>} />
              <div className="flex flex-col gap-4 text-sm text-slate-400 leading-[1.85]">
                <p>I&apos;m a <strong className="text-slate-200 font-medium">senior high school student</strong> in Jakarta who codes like it&apos;s already my job. Web development is my main arena — <span className="text-cyan-400">TypeScript, Next.js, system design</span> — but I&apos;m always pulling new threads.</p>
                <p>I believe the best developers ship things. So I build: a <strong className="text-slate-200 font-medium">Discord Mafia bot</strong> with AI players, a <strong className="text-slate-200 font-medium">self-hostable PoS system</strong>, a collaborative jam session app, game backends — projects that push me into uncomfortable territory.</p>
                <p>Starting university soon. Looking for an <span className="text-cyan-400">internship or junior role</span> where I can contribute real work from day one. I&apos;m not trying to break in — I&apos;m already in.</p>
              </div>
            </div>
            <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-6 flex flex-col gap-5">
              <span className="text-[0.6rem] tracking-[0.12em] uppercase text-slate-500">Currently</span>
              {[
                { icon: "🎓", title: "Finishing high school",        sub: "Jakarta, Indonesia" },
                { icon: "🔍", title: "Exploring new frameworks",      sub: "Go / Rust on the horizon" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#080b11] border border-[#1a2540] flex items-center justify-center text-sm shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-sm text-slate-200">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="snap-start py-24 border-t border-[#1a2540]">
        <div className="max-w-[1140px] mx-auto px-6">
          <SectionHeader label="Projects" title="Things I've shipped" description="Recent work from my GitHub — ranging from full-stack apps to infrastructure experiments." />
          {repos.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 border border-dashed border-[#1a2540] rounded-xl">Could not load projects right now.</div>
          ) : (
            <>
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a2540] border border-[#1a2540] rounded-xl overflow-hidden">
                {repos.map((repo) => (
                  <ProjectCard key={repo.id} name={repo.name} description={repo.description} url={repo.html_url} language={repo.language} stars={repo.stargazers_count} topics={repo.topics} />
                ))}
              </div>
              <div className="sm:hidden flex gap-3 overflow-x-scroll snap-x snap-mandatory pb-4 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {repos.map((repo) => (
                  <div key={repo.id} className="snap-start shrink-0 w-[80vw]">
                    <ProjectCard name={repo.name} description={repo.description} url={repo.html_url} language={repo.language} stars={repo.stargazers_count} topics={repo.topics} className="rounded-xl border border-[#1a2540] h-full" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="snap-start py-24 border-t border-[#1a2540]">
        <div className="max-w-[1140px] mx-auto px-6">
          <SectionHeader label="Skills" title="The stack" description="Tools I reach for first, frameworks I've shipped with, and infrastructure I actually understand." />
          <SkillsGrid groups={SKILLS} />
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="snap-start py-24 border-t border-[#1a2540]">
        <div className="max-w-[1140px] mx-auto px-6">
          <SectionHeader label="Writing" title="Blog" description="Occasional writing on things I'm building, learning, or thinking about." />
          {parsedContent.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 border border-dashed border-[#1a2540] rounded-xl">No posts yet — check back soon.</div>
          ) : (
            <>
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {parsedContent.map((post) => (
                  <BlogPostCard key={post.name} slug={post.name.replace(/\.mdx?$/, "")} title={post.metadata.title} excerpt={post.metadata.excerpt} coverImage={`https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post${post.metadata.coverImage}`} />
                ))}
              </div>
              <div className="sm:hidden flex gap-3 overflow-x-scroll snap-x snap-mandatory pb-4 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {parsedContent.map((post) => (
                  <div key={post.name} className="snap-start shrink-0 w-[80vw]">
                    <BlogPostCard slug={post.name.replace(/\.mdx?$/, "")} title={post.metadata.title} excerpt={post.metadata.excerpt} coverImage={`https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post${post.metadata.coverImage}`} className="h-full" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="snap-start py-24 border-t border-[#1a2540]">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader label="Contact" title="" className="mb-4" />
              <h2 className="font-display font-bold tracking-tight leading-[1.1] text-slate-100 mb-4" style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>
                Let&apos;s build{" "}
                <span className="bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">something real.</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[42ch]">
                Whether it&apos;s an internship, a collaboration, or just a good conversation about software — I&apos;m open. Fastest response via Discord or email.
              </p>
            </div>
            <ContactLinks links={CONTACT_LINKS} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="snap-start">
        <Separator className="bg-[#1a2540]" />
        <Footer name="Louie Hansen" github="aspectxlol" location="Jakarta, ID" />
      </div>
    </div>
  );
}