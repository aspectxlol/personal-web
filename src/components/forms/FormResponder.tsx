"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { FormBlock, FormSettings } from "@/lib/forms/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/forms/MarkdownContent";

type Answer = string | boolean;
type FormQuestionBlock = Extract<FormBlock, { type: "question" }>;
type FormSectionBlock = Extract<FormBlock, { type: "section" }>;

type SlideshowPage = {
  section: FormSectionBlock | null;
  question: FormQuestionBlock;
};

function getSlideshowPages(blocks: FormBlock[]): SlideshowPage[] {
  let section: FormSectionBlock | null = null;
  const pages: SlideshowPage[] = [];

  for (const block of blocks) {
    if (block.type === "section") {
      section = block;
    } else {
      pages.push({ section, question: block });
    }
  }

  return pages;
}

function getQuestionError(
  question: FormQuestionBlock,
  answer: Answer | undefined,
) {
  if (question.kind === "checkbox") {
    return question.required && answer !== true
      ? "Select this required checkbox before continuing."
      : "";
  }

  if (typeof answer !== "string") {
    return question.required ? "Answer this required question." : "";
  }
  if (question.required && !answer.trim()) {
    return "Answer this required question.";
  }
  if (
    question.kind === "email" &&
    answer.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer.trim())
  ) {
    return `Enter a valid email address for “${question.label}”.`;
  }

  return "";
}

export function FormResponder({
  slug,
  versionId,
  title,
  description,
  blocks,
  settings,
  previewOnly = false,
}: {
  slug: string;
  versionId: string;
  title: string;
  description: string | null;
  blocks: FormBlock[];
  settings: FormSettings;
  previewOnly?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const isSlideshow = settings.presentation.mode === "slideshow";
  const slideshowPages = getSlideshowPages(blocks);
  const currentSlideshowPage = slideshowPages[currentQuestionIndex];
  const visibleBlocks =
    isSlideshow && currentSlideshowPage
      ? [
          ...(currentSlideshowPage.section
            ? [currentSlideshowPage.section]
            : []),
          currentSlideshowPage.question,
        ]
      : blocks;

  const setAnswer = (id: string, value: Answer) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setError("");
  };

  const getTextAnswer = (id: string) => {
    const answer = answers[id];
    return typeof answer === "string" ? answer : "";
  };

  const handleNext = () => {
    const question = currentSlideshowPage?.question;
    if (!question) return;

    const questionError = getQuestionError(question, answers[question.id]);
    if (questionError) {
      setError(questionError);
      return;
    }

    setError("");
    setCurrentQuestionIndex((current) =>
      Math.min(current + 1, slideshowPages.length - 1),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      isSlideshow &&
      currentQuestionIndex < slideshowPages.length - 1
    ) {
      handleNext();
      return;
    }

    const invalidQuestion = blocks.find(
      (block) =>
        block.type === "question" &&
        getQuestionError(block, answers[block.id]),
    );
    if (invalidQuestion?.type === "question") {
      setError(getQuestionError(invalidQuestion, answers[invalidQuestion.id]));
      return;
    }

    if (previewOnly) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/forms/${encodeURIComponent(slug)}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formVersionId: versionId, answers }),
        },
      );

      let result: { error?: string } = {};
      try {
        result = await response.json();
      } catch {
        setError("The server returned an invalid response. Please try again.");
        return;
      }

      if (!response.ok) {
        setError(
          result.error ??
            (response.status === 409
              ? "This form has changed or already has your response."
              : "Could not submit your response. Please try again."),
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="grid min-h-dvh place-items-center bg-(--paper) px-4 py-12">
        <section
          className="w-full max-w-160 border border-(--line) bg-(--paper-deep) p-6 max-[560px]:p-4"
          role="status"
        >
          <p className="mb-2 font-mono text-[.68rem] font-semibold tracking-[.11em] text-accent uppercase">
            Response received
          </p>
          <h1 className="m-0 text-[1.6rem] font-semibold tracking-[-.05em]">
            Thank you
          </h1>
          <p className="mt-2 mb-0 text-[.88rem] leading-[1.55] text-ink-soft">
            {previewOnly
              ? "This was a local preview. Your response was not saved."
              : "Your response has been submitted."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--paper) px-4 py-10 text-ink max-[560px]:px-3 max-[560px]:py-6">
      <div className="mx-auto grid w-full max-w-160 gap-4">
        {previewOnly && (
          <p
            className="m-0 border-l-2 border-(--accent) bg-(--paper-deep) px-3.5 py-2.5 text-[.78rem] text-ink-soft"
            role="status"
          >
            Local preview — responses are not saved.
          </p>
        )}

        <header className="border border-(--line) bg-(--paper-deep) p-6 max-[560px]:p-4">
          <h1 className="m-0 text-[clamp(1.7rem,5vw,2.6rem)] leading-[1.1] font-bold tracking-[-.065em] [&_a]:text-inherit">
            <MarkdownContent content={title} variant="inline" />
          </h1>
          {description && (
            <MarkdownContent
              className="mt-3 text-[.93rem] leading-[1.6] text-ink-soft"
              content={description}
            />
          )}
          {settings.respondentAccess.login === "optional" && (
            <p className="mt-3 mb-0 text-[.78rem] leading-[1.5] text-ink-soft">
              Sign in to associate your response with your account.{" "}
              <Link
                className="text-accent-dark underline underline-offset-2"
                href={`/auth/login?redirectTo=${encodeURIComponent(`/form/${slug}`)}`}
              >
                Sign in
              </Link>
            </p>
          )}
        </header>

        <form
          className="grid gap-3.5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          {isSlideshow && (
            <p
              className="m-0 font-mono text-[.68rem] tracking-[.08em] text-ink-soft uppercase"
              aria-live="polite"
            >
              Question {currentQuestionIndex + 1} of {slideshowPages.length}
            </p>
          )}

          {visibleBlocks.map((block) =>
            block.type === "section" ? (
              <section
                className="ml-3 border-l-2 border-(--accent) bg-(--paper-deep) px-4 py-3.5 max-[560px]:ml-1.5 max-[560px]:px-3"
                key={block.id}
                aria-labelledby={`public-section-${block.id}`}
              >
                <h2
                  className="m-0 text-[1.2rem] leading-[1.25] font-semibold tracking-[-.04em]"
                  id={`public-section-${block.id}`}
                >
                  <MarkdownContent content={block.title} variant="inline" />
                </h2>
                {block.description && (
                  <MarkdownContent
                    className="mt-1.5 text-[.84rem] leading-[1.55] text-ink-soft"
                    content={block.description}
                  />
                )}
              </section>
            ) : (
              <div
                className="grid min-w-0 gap-2.5 border border-(--line) bg-(--paper-deep) p-4.5 max-[560px]:p-3.5"
                key={block.id}
              >
                {block.kind === "checkbox" ? (
                  <Label
                    htmlFor={`answer-${block.id}`}
                    className="flex items-start gap-2.5 whitespace-normal text-[.91rem] leading-[1.5] text-ink"
                  >
                    <Checkbox
                      className="mt-1"
                      id={`answer-${block.id}`}
                      name={block.id}
                      required={block.required}
                      aria-required={block.required}
                      checked={answers[block.id] === true}
                      onCheckedChange={(checked) =>
                        setAnswer(block.id, checked === true)
                      }
                    />
                    <MarkdownContent
                      className="[&_a]:text-ink"
                      content={block.label}
                      variant="inline"
                    />
                    {block.required && (
                      <span className="text-accent" aria-hidden="true">
                        *
                      </span>
                    )}
                  </Label>
                ) : (
                  <>
                    <Label
                      htmlFor={`answer-${block.id}`}
                      className="whitespace-normal text-[.91rem] leading-[1.5] text-ink"
                    >
                      <MarkdownContent content={block.label} variant="inline" />
                      {block.required && (
                        <span className="ml-1 text-accent" aria-hidden="true">
                          *
                        </span>
                      )}
                    </Label>
                    {block.kind === "long_text" ? (
                      <Textarea
                        id={`answer-${block.id}`}
                        name={block.id}
                        autoComplete="off"
                        required={block.required}
                        maxLength={10000}
                        rows={5}
                        value={getTextAnswer(block.id)}
                        onChange={(event) =>
                          setAnswer(block.id, event.target.value)
                        }
                        className="field-sizing-fixed min-h-30 w-full min-w-0 resize-y rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.9rem] text-ink"
                      />
                    ) : (
                      <Input
                        id={`answer-${block.id}`}
                        name={block.id}
                        type={block.kind === "email" ? "email" : "text"}
                        spellCheck={block.kind !== "email"}
                        autoComplete={
                          block.kind === "email" ? "email" : "off"
                        }
                        required={block.required}
                        maxLength={block.kind === "email" ? 254 : 1000}
                        value={getTextAnswer(block.id)}
                        onChange={(event) =>
                          setAnswer(block.id, event.target.value)
                        }
                        className="h-auto min-h-10.5 w-full rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.9rem] text-ink"
                      />
                    )}
                  </>
                )}
              </div>
            ),
          )}

          {error && (
            <p className="m-0 text-[.84rem] leading-[1.5] text-accent-dark" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-between gap-3">
            {isSlideshow && currentQuestionIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-10.5 rounded-[3px] border border-(--line) bg-transparent px-4 py-2.5 font-sans text-[.82rem] font-semibold text-ink hover:bg-(--paper-deep)"
                disabled={submitting}
                onClick={() => {
                  setError("");
                  setCurrentQuestionIndex((current) => Math.max(current - 1, 0));
                }}
              >
                Previous
              </Button>
            ) : (
              <span />
            )}
            {isSlideshow && currentQuestionIndex < slideshowPages.length - 1 ? (
              <Button
                type="button"
                className="min-h-10.5 rounded-[3px] border border-(--ink) bg-(--ink) px-4 py-2.5 font-sans text-[.82rem] font-semibold text-paper hover:border-(--accent) hover:bg-(--accent)"
                disabled={submitting}
                onClick={handleNext}
              >
                Next question
              </Button>
            ) : (
              <Button
                type="submit"
                className="min-h-10.5 rounded-[3px] border border-(--ink) bg-(--ink) px-4 py-2.5 font-sans text-[.82rem] font-semibold text-paper hover:border-(--accent) hover:bg-(--accent)"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit response"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
