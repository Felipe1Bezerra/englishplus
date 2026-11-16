"use client";

import { useState, useTransition } from "react";
import { checkQuiz, type CheckQuizResponse } from "@/app/aluno/aulas/[slug]/actions";
import type { Lesson } from "@/lib/api";

interface QuizProps {
  slug: string;
  questions: Lesson["quiz"];
}

export function Quiz({ slug, questions }: QuizProps) {
  const [answers, setAnswers] = useState<(number | undefined)[]>(() =>
    questions.map(() => undefined),
  );
  const [response, setResponse] = useState<CheckQuizResponse | null>(null);
  const [isChecking, startChecking] = useTransition();

  const result = response?.ok ? response.result : null;
  const completeAnswers = answers.filter((answer) => answer !== undefined);
  const allAnswered = completeAnswers.length === questions.length;

  function selectAnswer(questionIndex: number, optionIndex: number) {
    setAnswers((current) =>
      current.map((answer, i) => (i === questionIndex ? optionIndex : answer)),
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startChecking(async () => {
      setResponse(await checkQuiz(slug, completeAnswers));
    });
  }

  function reset() {
    setAnswers(questions.map(() => undefined));
    setResponse(null);
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {questions.map((question, questionIndex) => {
        const questionResult = result?.results[questionIndex];

        return (
          <fieldset key={questionIndex} disabled={result !== null}>
            <legend className="font-medium">
              {questionIndex + 1}. {question.prompt}
            </legend>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const isSelected = answers[questionIndex] === optionIndex;
                const isCorrect = questionResult?.answerIndex === optionIndex;
                const isWrongPick = questionResult !== undefined && isSelected && !isCorrect;

                return (
                  <label
                    key={optionIndex}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      isCorrect
                        ? "border-good bg-good-soft"
                        : isWrongPick
                          ? "border-bad bg-bad-soft"
                          : "border-border bg-card has-checked:border-navy has-enabled:cursor-pointer has-enabled:hover:border-navy"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      checked={isSelected}
                      onChange={() => selectAnswer(questionIndex, optionIndex)}
                      className="size-4 accent-navy"
                    />
                    <span className="flex-1">{option}</span>
                    {isCorrect && (
                      <span className="text-sm font-medium text-good">Resposta certa</span>
                    )}
                    {isWrongPick && (
                      <span className="text-sm font-medium text-bad">Sua resposta</span>
                    )}
                  </label>
                );
              })}
            </div>
            {questionResult && (
              <p className="mt-2 text-sm text-muted-foreground">{questionResult.explanation}</p>
            )}
          </fieldset>
        );
      })}

      <div aria-live="polite">
        {result && (
          <p className="mb-4 font-display text-2xl font-bold text-navy">
            Você acertou {result.score} de {result.total}.
          </p>
        )}
        {response && !response.ok && <p className="mb-4 text-bad">{response.message}</p>}
      </div>

      {result ? (
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border bg-card px-5 py-2.5 font-medium hover:border-navy"
        >
          Tentar de novo
        </button>
      ) : (
        <button
          type="submit"
          disabled={!allAnswered || isChecking}
          className="rounded-lg bg-navy px-5 py-2.5 font-bold text-cream hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isChecking ? "Corrigindo…" : "Conferir respostas"}
        </button>
      )}
    </form>
  );
}
