import { Quiz } from "@/index";
import QuestionSlide from "./QuestionSlide";

export default function QuizComponent({ QuizData }: { QuizData: Quiz }) {

  return (
    <main>
      <h1>{QuizData.title}</h1>
      <p>{QuizData.description}</p>

      <div>
        {QuizData.questions.map((question, index) => <QuestionSlide key={index} Question={question} />)}
      </div>
    </main>
  )
}