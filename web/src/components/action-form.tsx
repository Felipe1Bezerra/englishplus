"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export interface FormState {
  ok?: boolean;
  error?: string;
}

interface ActionFormProps {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  /** Asks first, for changes that are hard to undo. */
  confirmMessage?: string;
}

export function ActionForm({
  action,
  children,
  className,
  successMessage,
  confirmMessage,
}: ActionFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
      <div aria-live="polite">
        {state.error && <p className="mt-2 text-sm font-medium text-bad">{state.error}</p>}
        {state.ok && successMessage && (
          <p className="mt-2 text-sm font-medium text-good">{successMessage}</p>
        )}
      </div>
    </form>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "gold";
  className?: string;
  pendingLabel?: string;
}

const VARIANTS = {
  primary: "bg-navy text-cream hover:bg-navy-soft",
  secondary: "border border-border bg-card text-navy hover:border-navy",
  danger: "border border-bad/40 bg-card text-bad hover:bg-bad-soft",
  gold: "bg-gold text-navy hover:bg-gold-light",
};

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  pendingLabel = "Salvando…",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
