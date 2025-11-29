declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

interface Quiz {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  questions: Questions[]
}

interface Questions {
  content: string;
  options: Options[];
}

interface Options {
  content: string;
  isCorrect?: boolean;
}

type QuizState =
  | "idle"
  | "question"
  | "locked"
  | "answered"
  | "transition"
  | "finish"

export type Root = Root2[]

export interface Root2 {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url?: string
  type: string
  _links: Links
}

export interface Links {
  self: string
  git: string
  html: string
}
