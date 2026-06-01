/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ImgHTMLAttributes } from "react"
import Image from "next/image"
import { compileMDX } from 'next-mdx-remote/rsc'
import matter from 'gray-matter'
import { Counter } from "@/components/mdx/Counter"
import { Toggle } from "@/components/mdx/Toggle"
import { Tabs, TabItem } from "@/components/mdx/Tabs"
import { DynamicDate, DynamicYear, DynamicTime, DynamicRandom } from "@/components/mdx/DynamicContent"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Simple parser for extracting frontmatter from markdown/mdx files
 * Returns the full vfile-like object for compatibility
 */
export function parseFile(fileContent: string) {
  const { data, content } = matter(fileContent);
  
  return {
    data: {
      frontmatter: data,
    },
    content,
  };
}

// MDX Components - styled renderers for all HTML elements
const mdxComponents = {
  h1: (props: any) => <h1 className={cn("text-4xl font-bold mt-8 mb-4")} {...props} />,
  h2: (props: any) => <h2 className={cn("text-2xl font-semibold mt-7 mb-3")} {...props} />,
  h3: (props: any) => <h3 className={cn("text-xl font-semibold mt-6 mb-2")} {...props} />,
  h4: (props: any) => <h4 className={cn("text-lg font-semibold mt-5 mb-2")} {...props} />,
  p: (props: any) => <p className={cn("my-4 leading-relaxed")} {...props} />,
  a: (props: any) => <a className={cn("text-blue-600 hover:underline")} {...props} />,
  code: (props: any) => <code className={cn("font-mono text-sm bg-slate-800/50 px-2 py-1 rounded")} {...props} />,
  pre: (props: any) => <pre className={cn("bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto my-4")} {...props} />,
  img: (props: any) => <CustomImage {...props} />,
  ul: (props: any) => <ul className={cn("list-disc list-inside my-4 space-y-2")} {...props} />,
  ol: (props: any) => <ol className={cn("list-decimal list-inside my-4 space-y-2")} {...props} />,
  li: (props: any) => <li className={cn("text-slate-300")} {...props} />,
  blockquote: (props: any) => <blockquote className={cn("border-l-4 border-slate-600 pl-4 my-4 italic text-slate-400")} {...props} />,
  table: (props: any) => <table className={cn("w-full border-collapse my-4")} {...props} />,
  thead: (props: any) => <thead className={cn("bg-slate-800")} {...props} />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => <tr className={cn("border-b border-slate-600")} {...props} />,
  th: (props: any) => <th className={cn("border border-slate-600 px-3 py-2 bg-slate-800 text-left")} {...props} />,
  td: (props: any) => <td className={cn("border border-slate-600 px-3 py-2")} {...props} />,
  // Custom interactive components
  Counter,
  Toggle,
  Tabs,
  TabItem,
  // Dynamic content components
  DynamicDate,
  DynamicYear,
  DynamicTime,
  DynamicRandom,
};

/**
 * Simplified MDX parser with gray-matter for frontmatter
 * Handles both .md and .mdx files with React components
 */
export async function parseFileToReactWithMDX(fileContent: string) {
  try {
    // Use gray-matter to parse frontmatter and content
    const { data: frontmatter, content } = matter(fileContent);

    // Compile MDX content with components
    const { content: mdxContent } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          useDynamicImport: true,
        },
      },
    });

    return {
      content: mdxContent,
      frontmatter: frontmatter as Record<string, any>,
      isMDX: true,
    };
  } catch (error) {
    console.error('MDX compilation failed:', error);
    throw error;
  }
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function CustomImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!(typeof src === 'string')) return null
  // Check if src is relative (doesn't start with http:// or https:// or /)
  const BASE_URL = 'https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post'
  const isRelative = src && !src.startsWith('http') && !src.startsWith('//')
  const fullSrc = isRelative ? `${BASE_URL}/${src}` : src

  return (
    <Image src={fullSrc} alt={alt || ''} width={1920} height={1080} />
  )
}
