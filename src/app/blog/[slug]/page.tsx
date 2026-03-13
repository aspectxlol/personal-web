import GiscusComponent from "@/components/Giscus";
import { parseFileToReact } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const rawContents = await fetch(
      "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
      {
        headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
        cache: "no-store",
      }
    ).then((res) => res.json());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileItem = rawContents.find((item: any) => {
      const nameWithoutExt = item.name.replace(/\.(mdx?|md)$/, "");
      return nameWithoutExt === slug;
    });

    if (!fileItem) return { title: "Post Not Found" };

    const rawRawContents = atob(
      (
        await fetch(fileItem._links?.self, {
          headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
          cache: "no-store",
        })
          .then((res) => res.json())
          .catch((err) => console.error(err))
      ).content
    );

    const { frontmatter } = await parseFileToReact(rawRawContents);
    const metadata = frontmatter as {
      title: string;
      excerpt: string;
      coverImage: string;
      date: string;
      tags?: string[];
    };

    const imageUrl =
      "https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post" +
      metadata.coverImage;

    return {
      title: metadata.title,
      description: metadata.excerpt,
      openGraph: {
        title: metadata.title,
        description: metadata.excerpt,
        type: "article",
        publishedTime: metadata.date,
        authors: ["Louie Hansen"],
        images: [{ url: imageUrl, width: 1200, height: 630, alt: metadata.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: metadata.title,
        description: metadata.excerpt,
        images: [imageUrl],
        creator: "@yourtwitter",
      },
      authors: [{ name: "Louie Hansen" }],
      other: {
        "article:published_time": metadata.date,
        "article:author": "Louie Hansen",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: "Blog Post" };
  }
}

export const dynamic = "force-static";
export const revalidate = false;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rawContents = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((res) => res.json());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileItem = rawContents.find((item: any) => {
    const nameWithoutExt = item.name.replace(/\.(mdx?|md)$/, "");
    return nameWithoutExt === slug;
  });

  const rawRawContents = atob(
    (
      await fetch(fileItem._links?.self, {
        headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
      })
        .then((res) => res.json())
        .catch((err) => console.error(err))
    ).content
  );

  const { content, frontmatter } = await parseFileToReact(rawRawContents);
  const metadata = frontmatter as {
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
    tags?: string[];
  };

  const coverUrl =
    "https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post" +
    metadata.coverImage;

  const formattedDate = new Date(metadata.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-one-dark.min.css"
      />

      <div className="min-h-screen bg-[#080b11] text-slate-100 font-mono antialiased">
        <Navbar />

        {/* Back link */}
        <div className="max-w-[860px] mx-auto px-6 pt-10">
          <Link
            href="/#writing"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors tracking-widest uppercase"
          >
            <span className="text-base leading-none">←</span>
            <span>Back to writing</span>
          </Link>
        </div>

        {/* Post header */}
        <header className="max-w-[860px] mx-auto px-6 pt-10 pb-12">
          {/* Date + read time row */}
          <div className="flex items-center gap-3 mb-6">
            <time className="text-xs tracking-widest uppercase text-slate-500">
              {formattedDate}
            </time>
            {metadata.tags && metadata.tags.length > 0 && (
              <>
                <span className="text-[#1a2540]">/</span>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[0.6rem] tracking-widest uppercase rounded border border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] text-slate-100 mb-5">
            {metadata.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-[65ch]">
            {metadata.excerpt}
          </p>

          {/* Divider */}
          <div className="mt-10 h-px bg-[#1a2540]" />
        </header>

        {/* Cover image */}
        <div className="max-w-[860px] mx-auto px-6 mb-14">
          <div className="rounded-xl overflow-hidden border border-[#1a2540]">
            <Image
              src={coverUrl}
              alt={metadata.title}
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
              quality={80}
            />
          </div>
        </div>

        {/* Post content */}
        <article className="max-w-[860px] mx-auto px-6 pb-20">
          <div
            className="
              prose prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-slate-100 prose-headings:tracking-tight prose-headings:font-mono
              prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-[#1a2540] prose-h2:pb-2
              prose-h3:text-lg prose-h3:text-slate-200
              prose-p:text-slate-400 prose-p:leading-[1.85] prose-p:font-mono
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-a:font-mono
              prose-strong:text-slate-200 prose-strong:font-semibold
              prose-code:text-cyan-400 prose-code:bg-[#0f1623] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:border prose-code:border-[#1a2540]
              prose-pre:bg-[#0f1623] prose-pre:border prose-pre:border-[#1a2540] prose-pre:rounded-xl prose-pre:shadow-none
              prose-pre:code:bg-transparent prose-pre:code:border-none prose-pre:code:p-0
              prose-img:rounded-xl prose-img:border prose-img:border-[#1a2540]
              prose-blockquote:border-l-cyan-400 prose-blockquote:border-l-2 prose-blockquote:pl-5 prose-blockquote:text-slate-500 prose-blockquote:not-italic prose-blockquote:font-mono
              prose-ul:text-slate-400 prose-ol:text-slate-400
              prose-li:marker:text-cyan-400
              prose-hr:border-[#1a2540]
              prose-table:border-collapse
              prose-th:border prose-th:border-[#1a2540] prose-th:px-4 prose-th:py-2 prose-th:text-slate-300 prose-th:bg-[#0f1623] prose-th:text-xs prose-th:tracking-widest prose-th:uppercase
              prose-td:border prose-td:border-[#1a2540] prose-td:px-4 prose-td:py-2 prose-td:text-slate-400 prose-td:text-sm
            "
          >
            {content}
          </div>
        </article>

        {/* Tags footer */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="max-w-[860px] mx-auto px-6 pb-16">
            <div className="border-t border-[#1a2540] pt-8 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-600 tracking-widest uppercase mr-2">Tagged</span>
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[0.6rem] tracking-widest uppercase rounded border border-[#1a2540] text-slate-500 bg-[#0f1623] hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="max-w-[860px] mx-auto px-6 pb-24">
          <div className="border-t border-[#1a2540] pt-12">
            <span className="text-[0.6rem] tracking-[0.12em] uppercase text-slate-500 block mb-6">
              Discussion
            </span>
            <GiscusComponent />
          </div>
        </div>
      </div>
    </>
  );
}