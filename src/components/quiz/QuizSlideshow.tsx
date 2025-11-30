"use client";

import { useState } from "react";
import { Quiz } from "@/index";
import QuestionSlide from "./QuestionSlide";

export default function QuizSlideshow({ QuizData }: { QuizData: Quiz }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleNext = () => {
    if (currentSlide < QuizData.questions.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setSelectedOption(null); // Deselect on next
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setSelectedOption(null); // Deselect on previous
    }
  };

  if (!QuizData) {
    return <main>Loading...</main>;
  }

  return (
    <main className="fixed inset-0 flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 md:px-8 lg:px-24 py-4 md:py-6 border-b">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{QuizData.title}</h1>
          <p className="text-sm md:text-base text-gray-300 mt-2">{QuizData.description}</p>
        </div>

        <div className="flex-1 overflow-auto h-full">
          <QuestionSlide
            Question={QuizData.questions[currentSlide]}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-between items-center p-3 md:p-4 px-4 md:px-8 lg:px-24 border-t rounded-t-5xl backdrop-blur">
        <button
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          className="px-3 md:px-4 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg md:rounded-xl disabled:opacity-50 text-sm md:text-base lg:text-lg font-semibold transition-colors"
        >
          Previous
        </button>
        <span className="px-4 md:px-6 py-2 md:py-3 text-white text-sm md:text-base lg:text-lg font-semibold">
          {currentSlide + 1} / {QuizData.questions.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSlide === QuizData.questions.length - 1}
          className="px-3 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg md:rounded-xl disabled:opacity-50 text-sm md:text-base lg:text-lg font-semibold transition-colors"
        >
          Next
        </button>
      </div>
    </main>
  );
}