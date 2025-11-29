import { Options, Questions } from "@/index";
import { QparseFileToReact } from "@/lib/utils";

export default async function QuestionSlide({ Question }: { Question: Questions }) {
  const { content } = await QparseFileToReact(Question.content);
  return (
    <main className="">
      {content}
      <div>
        {Question.options.map((option, index) => <OptionsComponent key={index} option={option} />)}
      </div>
    </main>
  )
}

async function OptionsComponent({ option }: { option: Options }) {
  const { content } = await QparseFileToReact(option.content);
  return (
    <div className={`my-2 p-4 border rounded hover:bg-gray-100 cursor-pointer ${option.isCorrect ? "bg-green-300" : "bg-white"}`} >
      {content}
    </div >
  )
}