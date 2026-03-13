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
          <style>{`
            .post-content {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 0.9rem;
              color: #94a3b8;
              line-height: 1.9;
            }

            /* Headings */
            .post-content h1,
            .post-content h2,
            .post-content h3,
            .post-content h4 {
              color: #f1f5f9;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-top: 2.75rem;
              margin-bottom: 1rem;
              line-height: 1.3;
            }
            .post-content h1 { font-size: 1.75rem; }
            .post-content h2 {
              font-size: 1.2rem;
              padding-bottom: 0.6rem;
              border-bottom: 1px solid #1a2540;
            }
            .post-content h3 { font-size: 1.05rem; color: #cbd5e1; }

            /* Paragraphs */
            .post-content p { margin-bottom: 1.4rem; }

            /* Lists -- the key fix */
            .post-content ul,
            .post-content ol {
              margin: 0.75rem 0 1.5rem 0;
              padding-left: 1.75rem;
              color: #94a3b8;
            }
            .post-content ul { list-style-type: disc; }
            .post-content ol { list-style-type: decimal; }
            .post-content li {
              margin-bottom: 0.45rem;
              padding-left: 0.25rem;
              list-style: inherit;
            }
            .post-content li::marker { color: #22d3ee; }
            .post-content li strong { color: #e2e8f0; }

            /* Inline code */
            .post-content :not(pre) > code {
              color: #22d3ee;
              background: #0f1623;
              border: 1px solid #1a2540;
              padding: 0.15em 0.45em;
              border-radius: 4px;
              font-size: 0.8rem;
            }

            /* Code blocks */
            .post-content pre {
              background: #0a0e18 !important;
              border: 1px solid #1a2540;
              border-radius: 10px;
              padding: 1.25rem 1.5rem;
              overflow-x: auto;
              margin: 1.75rem 0;
              font-size: 0.8rem;
              line-height: 1.75;
            }
            .post-content pre code {
              background: transparent !important;
              border: none !important;
              padding: 0 !important;
              font-size: inherit;
              color: inherit;
            }

            /* Blockquote */
            .post-content blockquote {
              border-left: 2px solid #22d3ee;
              padding: 0.25rem 0 0.25rem 1.25rem;
              margin: 1.75rem 0;
              color: #64748b;
            }

            /* Links */
            .post-content a { color: #22d3ee; text-decoration: none; }
            .post-content a:hover { text-decoration: underline; }

            /* Strong / em */
            .post-content strong { color: #e2e8f0; font-weight: 600; }
            .post-content em { color: #94a3b8; }

            /* HR */
            .post-content hr { border-color: #1a2540; margin: 2.5rem 0; border-top-width: 1px; }

            /* Images */
            .post-content img {
              border-radius: 10px;
              border: 1px solid #1a2540;
              max-width: 100%;
              margin: 1.5rem 0;
            }

            /* Tables */
            .post-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.75rem 0;
              font-size: 0.82rem;
            }
            .post-content th {
              border: 1px solid #1a2540;
              padding: 0.55rem 1rem;
              background: #0f1623;
              color: #cbd5e1;
              text-align: left;
              font-size: 0.68rem;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .post-content td {
              border: 1px solid #1a2540;
              padding: 0.55rem 1rem;
              color: #94a3b8;
            }
            .post-content tr:hover td { background: #0f1623; }
          `}</style>
          <div className="post-content">{content}</div>
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