import { Quiz } from "@/index";
import QuizSlideshow from "./QuizSlideshow";

export default async function QuizComponent({ QuizData }: { QuizData: Quiz }) {
  if (!QuizData) {
    return <main>Loading...</main>;
  }

  return <main className="h-full">
    <QuizSlideshow QuizData={QuizData} />
  </main>
}