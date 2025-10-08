import { parseFile } from "@/lib/utils";
import React from "react";
import Link from "next/link";
import Image from "next/image";

type BlogPost = {
  name: string;
  metadata: {
    title: string;
    excerpt: string;
    coverImage: string;
  };
};

export default async function Home() {
  const rawContents = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/post",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((res) => res.json());

  const contents = rawContents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: any) => item.name.endsWith(".md") || item.name.endsWith(".mdx"))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      name: item.name,
      url: item._links.self,
    }));

  let parsedContent: BlogPost[] = [];

  for (const item of contents) {
    const fileData = await fetch(item.url, { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } })
      .then((res) => res.json())
      .catch((err) => console.error(err));

    const decodedContent = atob(fileData.content);
    const parsedFile = await parseFile(decodedContent);
    parsedContent.push({
      name: item.name,
      metadata: parsedFile.data.frontmatter as BlogPost["metadata"],
    });
  }

  return (
    <main className="snap-y snap-mandatory h-screen overflow-y-scroll">
      <div className="fixed top-0 left-0 w-full bg-background text-white p-4 z-10">
        <nav className="flex justify-center space-x-8">
          <a href="#hero" className="hover:underline">
            Home
          </a>
          <a href="#work" className="hover:underline">
            Blog & Projects
          </a>
          <a href="#contact" className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
      {/* Section 1: Hero */}
      <section
        className="h-screen flex flex-col justify-center bg-background text-white snap-start px-8 md:px-20 lg:px-52"
        id="hero"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold mb-4 leading-tight">
            Hi, I am <br></br>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              Louie Hansen
            </span>
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-medium">
            Student, Developer, Creator
          </p>
        </div>
      </section>

      {/* Section 2: Blog & Projects */}
      <section
        className="h-screen flex flex-col justify-center items-center bg-background snap-start"
        id="work"
      >
        <div className="max-w-5xl w-full px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Blog Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blog Posts */}
            <div>
              <ul className="space-y-6">
                {parsedContent.length === 0 ? (
                  <li className="bg-white p-4 rounded shadow">
                    <span className="font-bold">Coming soon!</span>
                  </li>
                ) : (
                  parsedContent.map((post) => (
                    <Link href={`/blog/${post.name.replace(/\.mdx?$/, "")}`} key={post.name}>
                      <li
                        key={post.name}
                        className="bg-white rounded-lg shadow flex flex-col md:flex-row overflow-hidden text-black"
                      >
                        <Image
                          src={'https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post' + post.metadata.coverImage}
                          alt={post.metadata.title}
                          width={1920}
                          height={1080}
                          className="w-full md:w-48 h-48 object-cover"
                        />
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xl font-bold mb-2">{post.metadata.title}</h4>
                            <p className="text-gray-700 mb-4">{post.metadata.excerpt}</p>
                          </div>
                        </div>
                      </li>
                    </Link>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Contact */}
      <section
        className="h-screen flex flex-col justify-center items-center bg-background snap-start"
        id="contact"
      >
        <h2 className="text-4xl font-bold mb-8">How to Contact Me</h2>
        <ul className="space-y-4 text-lg">
          <li>
            <span className="font-semibold">Discord:</span> yourDiscord#1234
          </li>
          <li>
            <span className="font-semibold">Email:</span> your.email@example.com
          </li>
          <li>
            <span className="font-semibold">Instagram:</span> @yourinstagram
          </li>
        </ul>
      </section>
    </main>
  );
}