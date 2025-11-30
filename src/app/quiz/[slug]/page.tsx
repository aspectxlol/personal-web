import QuizComponent from "@/components/quiz/QuizComponent";
import { Root } from "@/index";
import { notFound } from "next/navigation";

export default async function QuizPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const rawContents: Root = await fetch(
    "https://api.github.com/repos/aspectxlol/content-repo/contents/quiz",
    { headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } }
  ).then((res) => res.json());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileItem = rawContents.find((item: any) => {
    const nameWithoutExt = item.name.replace(/\.(json)$/, "");
    return nameWithoutExt === slug;
  });

  if (!fileItem) {
    return notFound();
  }

  const rawRawContents = atob(
    (
      await fetch(fileItem._links?.self, {
        headers: { authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` },
      })
        .then((res) => res.json())
        .catch((err) => console.error(err))
    ).content
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10">
        <QuizComponent QuizData={JSON.parse(rawRawContents)} />
      </div>
    </main>
  );
}