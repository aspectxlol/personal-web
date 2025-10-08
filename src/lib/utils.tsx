import { clsx, type ClassValue } from "clsx"
import remarkFrontmatter from "remark-frontmatter"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeReact from "rehype-react"
import { remark } from "remark"
import { VFile } from "vfile"
import { twMerge } from "tailwind-merge"
import remarkParseFrontmatter from "remark-parse-frontmatter"
import type { AnchorHTMLAttributes, ClassAttributes, HTMLAttributes, ImgHTMLAttributes, JSX } from "react"
import * as prod from "react/jsx-runtime"
import Image from "next/image"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export async function parseFile(file: string): Promise<VFile> {
  const result: VFile = await remark()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkParseFrontmatter)
    .process(file)

  return result
}

export async function parseFileToReact(file: string) {
  const result = await remark()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkParseFrontmatter)
    .use(remarkRehype) // Convert markdown AST to HTML AST
    .use(rehypeReact, {
      Fragment: prod.Fragment,
      jsx: prod.jsx,
      jsxs: prod.jsxs,
      components: {
        h1: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement>) => <h1 className={cn("text-4xl font-bold")} {...props} />,
        h2: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLHeadingElement> & HTMLAttributes<HTMLHeadingElement>) => <h2 className={cn("text-3xl font-semibold")} {...props} />,
        p: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLParagraphElement> & HTMLAttributes<HTMLParagraphElement>) => <p className={cn("my-4 leading-relaxed")} {...props} />,
        a: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement>) => <a className={cn("text-blue-600 hover:underline")} {...props} />,
        code: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement>) => <code className={cn("bg-gray-100 rounded px-1")} {...props} />,
        img: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLImageElement> & HTMLAttributes<HTMLImageElement>) => <CustomImage {...props} />,
      }
    })
    .process(file)

  return {
    content: result.result, // This is your React element
    frontmatter: result.data.frontmatter, // Access frontmatter data
    vfile: result
  }
}

function CustomImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!(typeof src === 'string')) return null
  // Check if src is relative (doesn't start with http:// or https:// or /)
  const BASE_URL = 'https://raw.githubusercontent.com/aspectxlol/content-repo/refs/heads/master/post'
  const isRelative = src && !src.startsWith('http') && !src.startsWith('//')
  const fullSrc = isRelative ? `${BASE_URL}/${src}` : src

  // Option 1: Using standard img tag
  return <>
    <Image src={fullSrc} alt={alt || ''} width={1920} height={1080} />
  </>

  // Option 2: Using Next.js Image (recommended for Next.js)
  // return <Image src={fullSrc} alt={alt || ''} width={800} height={600} {...props} />
}