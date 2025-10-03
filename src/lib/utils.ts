import { clsx, type ClassValue } from "clsx"
import remarkFrontmatter from "remark-frontmatter"
import remarkParse from "remark-parse"
import { remark } from "remark";
import { VFile } from "vfile";
import { twMerge } from "tailwind-merge"
import remarkParseFrontmatter from "remark-parse-frontmatter"

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