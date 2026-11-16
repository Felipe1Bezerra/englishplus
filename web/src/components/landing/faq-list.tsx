"use client";

import { useState } from "react";

export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = String(items.length).padStart(2, "0");

  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
      {items.map(({ question, answer }, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={question}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center gap-5 px-5 py-5 text-left sm:px-7"
            >
              <span className="shrink-0 font-mono text-xs text-gold/80">
                {String(i + 1).padStart(2, "0")} / {total}
              </span>
              <span className="flex-1 font-semibold text-cream">{question}</span>
              <span aria-hidden className="text-2xl leading-none text-gold">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="overflow-hidden px-5 pb-0 text-cream/70 sm:pl-[6.5rem]">
                <span className="block pb-5">{answer}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
