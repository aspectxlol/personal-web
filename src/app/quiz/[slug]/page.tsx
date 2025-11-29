import QuizComponent from "@/components/quiz/QuizComponent";
import { Root } from "@/index";
import { notFound } from "next/navigation";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const rawContents: Root = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/quiz",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  )
    .then((res) => res.json());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileItem = rawContents.find((item: any) => {
    const nameWithoutExt = item.name.replace(/\.(json)$/, '');
    return nameWithoutExt === slug;
  });

  if (!fileItem) {
    return notFound();
  }

  const rawRawContents = atob((await fetch(fileItem._links?.self, { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } })
    .then((res) => res.json())
    .catch((err) => console.error(err))).content);

  return (
    <main className="">
      <QuizComponent QuizData={JSON.parse(rawRawContents)} />
    </main>
  )
}