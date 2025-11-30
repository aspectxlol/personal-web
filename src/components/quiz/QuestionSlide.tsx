"use client";

import { Options, Questions } from "@/index";
import { QCustomImage, QparseFileToReact } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

export default function QuestionSlide({
  Question,
  selectedOption,
  onSelectOption
}: {
  Question: Questions;
  selectedOption: number | null;
  // eslint-disable-next-line no-unused-vars
  onSelectOption: (index: number) => void;
}) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    QparseFileToReact(Question.content).then(res => {
      setContent(res.content);
      setIsLoading(false);
    });
  }, [Question.content]);

  const handleSelectOption = (index: number) => {
    // Single selection: toggle on/off
    if (selectedOption === index) {
      onSelectOption(-1);
    } else {
      onSelectOption(index);
    }
  };

  return (
    <main className="p-4 md:p-8 md:mx-32 my-2 flex flex-col gap-8 md:gap-20">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start max-w-6xl self-center w-full">
        {Question.attachment && (
          <QCustomImage
            src={Question.attachment}
            alt="Question Attachment"
            className="mb-2 max-h-40 md:max-h-60 object-contain rounded-xl flex-shrink-0 w-full md:w-auto"
          />
        )}
        <div className="text-xl md:text-3xl font-semibold md:self-center min-h-20 md:min-h-24 flex items-center">
          {isLoading ?
            <div>
              <span>Loading...</span>
            </div> : content}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full">
        {Question.options.map((option, index) => (
          <OptionsComponent
            key={index}
            index={index}
            option={option}
            isSelected={selectedOption === index}
            onSelect={() => handleSelectOption(index)}
          />
        ))}
      </div>
    </main>
  )
}

function OptionsComponent({
  option,
  index,
  isSelected,
  onSelect
}: {
  option: Options;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    QparseFileToReact(option.content).then(res => {
      setContent(res.content);
      setIsLoading(false);
    });
  }, [option.content]);

  const colors = [
    "border-cyan-400 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 hover:from-cyan-500/20 hover:to-cyan-600/15 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]",
    "border-pink-400 bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:from-pink-500/20 hover:to-pink-600/15 shadow-[0_0_10px_rgba(244,114,182,0.3)] hover:shadow-[0_0_20px_rgba(244,114,182,0.5)]",
    "border-purple-400 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/15 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    "border-lime-400 bg-gradient-to-br from-lime-500/10 to-lime-600/5 hover:from-lime-500/20 hover:to-lime-600/15 shadow-[0_0_10px_rgba(132,204,22,0.3)] hover:shadow-[0_0_20px_rgba(132,204,22,0.5)]",
  ];

  return (
    <div
      onClick={onSelect}
      className={`p-4 md:p-6 border-2 rounded-xl md:rounded-2xl cursor-pointer transition-all duration-200 font-semibold text-base md:text-lg flex items-center justify-center h-20 md:h-24 ${colors[index % colors.length]} ${isSelected ? "ring-2 ring-offset-2 ring-white" : ""}`}
    >
      {isLoading ? (
        <div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="text-center text-lg md:text-2xl">
          {content}
        </div>
      )}
    </div>
  )
}