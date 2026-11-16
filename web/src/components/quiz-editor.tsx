"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminQuizQuestion } from "@/lib/api";

const INPUT =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70";

const MAX_OPTIONS = 6;

const blankQuestion = (): AdminQuizQuestion => ({
  prompt: "",
  options: ["", ""],
  answerIndex: 0,
  explanation: "",
});

/**
 * Multiple-choice activities for a lesson. The questions travel to the
 * server action as JSON in one hidden field named "quiz".
 */
export function QuizEditor({ initial = [] }: { initial?: AdminQuizQuestion[] }) {
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>(initial);
  const anchor = useRef<HTMLInputElement>(null);

  // After a successful "create", React resets the form; start the editor over too.
  useEffect(() => {
    const form = anchor.current?.form;
    if (!form) return;
    const onReset = () => setQuestions(initial);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [initial]);

  function update(index: number, change: Partial<AdminQuizQuestion>) {
    setQuestions((current) =>
      current.map((question, i) => (i === index ? { ...question, ...change } : question)),
    );
  }

  function updateOption(index: number, optionIndex: number, value: string) {
    const question = questions[index]!;
    update(index, {
      options: question.options.map((option, i) => (i === optionIndex ? value : option)),
    });
  }

  function removeOption(index: number, optionIndex: number) {
    const question = questions[index]!;
    const answerIndex =
      question.answerIndex === optionIndex
        ? 0
        : question.answerIndex > optionIndex
          ? question.answerIndex - 1
          : question.answerIndex;
    update(index, {
      options: question.options.filter((_, i) => i !== optionIndex),
      answerIndex,
    });
  }

  function move(index: number, by: -1 | 1) {
    setQuestions((current) => {
      const next = [...current];
      const [question] = next.splice(index, 1);
      next.splice(index + by, 0, question!);
      return next;
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-semibold text-navy">Atividades</legend>
      <input ref={anchor} type="hidden" name="quiz" value={JSON.stringify(questions)} />

      {questions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma atividade. Os alunos fazem os exercícios no fim da aula e veem a correção na hora.
        </p>
      )}

      {questions.map((question, index) => (
        <div key={index} className="space-y-3 rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-navy">Pergunta {index + 1}</span>
            <div className="flex gap-1 text-sm">
              <SmallButton
                label="Mover para cima"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </SmallButton>
              <SmallButton
                label="Mover para baixo"
                disabled={index === questions.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </SmallButton>
              <SmallButton
                label="Remover pergunta"
                danger
                onClick={() => setQuestions((current) => current.filter((_, i) => i !== index))}
              >
                Remover
              </SmallButton>
            </div>
          </div>

          <input
            className={INPUT}
            placeholder="Enunciado, ex.: Which sentence is correct?"
            aria-label={`Enunciado da pergunta ${index + 1}`}
            value={question.prompt}
            onChange={(event) => update(index, { prompt: event.target.value })}
            required
          />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Marque a alternativa certa.</p>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  className="size-4 shrink-0 accent-navy"
                  aria-label={`Alternativa ${optionIndex + 1} é a certa`}
                  checked={question.answerIndex === optionIndex}
                  onChange={() => update(index, { answerIndex: optionIndex })}
                />
                <input
                  className={INPUT}
                  placeholder={`Alternativa ${optionIndex + 1}`}
                  aria-label={`Alternativa ${optionIndex + 1} da pergunta ${index + 1}`}
                  value={option}
                  onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                  required
                />
                {question.options.length > 2 && (
                  <SmallButton
                    label={`Remover alternativa ${optionIndex + 1}`}
                    danger
                    onClick={() => removeOption(index, optionIndex)}
                  >
                    ✕
                  </SmallButton>
                )}
              </div>
            ))}
            {question.options.length < MAX_OPTIONS && (
              <SmallButton
                label="Adicionar alternativa"
                onClick={() => update(index, { options: [...question.options, ""] })}
              >
                + Alternativa
              </SmallButton>
            )}
          </div>

          <textarea
            className={INPUT}
            rows={2}
            placeholder="Explicação mostrada depois da correção (opcional)"
            aria-label={`Explicação da pergunta ${index + 1}`}
            value={question.explanation}
            onChange={(event) => update(index, { explanation: event.target.value })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => setQuestions((current) => [...current, blankQuestion()])}
        className="rounded-full border border-dashed border-navy/40 px-4 py-2 text-sm font-bold text-navy hover:border-navy"
      >
        + Adicionar pergunta
      </button>
    </fieldset>
  );
}

function SmallButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold disabled:opacity-40 ${
        danger ? "text-bad hover:bg-bad-soft" : "text-navy hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}
