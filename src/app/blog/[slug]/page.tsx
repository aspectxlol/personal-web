import { parseFile, parseFileToReact } from "@/lib/utils";
import Image from "next/image";
import { ImgHTMLAttributes } from "react";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  // Await params before accessing its properties
  const { slug } = await params;

  const rawContents = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((res) => res.json());

  // Find file by stripping extension and matching slug
  const fileItem = rawContents.find((item: any) => {
    const nameWithoutExt = item.name.replace(/\.(mdx?|md)$/, '');
    return nameWithoutExt === slug;
  });

  const rawRawContents = atob((await fetch(fileItem._links?.self, { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } })
    .then((res) => res.json())
    .catch((err) => console.log(err))).content);

  const { content, frontmatter } = await parseFileToReact(rawRawContents);
  const metadata = frontmatter as {
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {metadata.title}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {metadata.excerpt}
          </p>
          <time className="text-sm text-gray-500">
            {metadata.date}
          </time>
        </header>

        {/* Cover Image */}
        <div className="mb-8 rounded-xl overflow-hidden">
          <Image src={'https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post' + metadata.coverImage} alt={metadata.title} width={1920} height={1080} />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {content}
        </div>
      </article>
    </div>
  );
}