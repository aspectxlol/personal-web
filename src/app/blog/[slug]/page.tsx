import GiscusComponent from "@/components/Giscus";
import { parseFileToReact } from "@/lib/utils";
import Image from "next/image";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  // Await params before accessing its properties
  const { slug } = await params;

  const rawContents = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((res) => res.json());

  // Find file by stripping extension and matching slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileItem = rawContents.find((item: any) => {
    const nameWithoutExt = item.name.replace(/\.(mdx?|md)$/, '');
    return nameWithoutExt === slug;
  });

  const rawRawContents = atob((await fetch(fileItem._links?.self, { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } })
    .then((res) => res.json())
    .catch((err) => console.error(err))).content);

  const { content, frontmatter } = await parseFileToReact(rawRawContents);
  const metadata = frontmatter as {
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-one-dark.min.css"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section with Gradient */}
        <div className="relative border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />

          <article className="relative max-w-5xl mx-auto px-6 py-20">
            {/* Header */}
            <header className="mb-16 text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/20 rounded-full mb-4">
                <time className="text-sm font-medium text-primary">
                  {new Date(metadata.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                {metadata.title}
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                {metadata.excerpt}
              </p>
            </header>

            {/* Cover Image with Enhanced Styling */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={'https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post' + metadata.coverImage}
                  alt={metadata.title}
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </article>
        </div>

        {/* Content Section */}
        <article className="max-w-4xl mx-auto px-6 py-16">
          <div className="prose prose-lg prose-invert max-w-none 
            prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:shadow-lg
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-400
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:marker:text-primary
            prose-hr:border-white/10">
            {content}
          </div>
        </article>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <GiscusComponent />
        </div>
      </div>
    </>
  );
}