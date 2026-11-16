import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold text-navy">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-4 text-sm text-muted-foreground">{children}</p>;
}

const BADGE_TONES = {
  neutral: "bg-cream-soft text-navy",
  good: "bg-good-soft text-good",
  bad: "bg-bad-soft text-bad",
  gold: "bg-gold/25 text-navy",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

const INPUT =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70";

export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <input {...props} className={INPUT} />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & ComponentProps<"textarea">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <textarea rows={4} {...props} className={INPUT} />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & ComponentProps<"select">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <select {...props} className={INPUT}>
        {children}
      </select>
    </label>
  );
}

export function Checkbox({ label, ...props }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-foreground">
      <input type="checkbox" {...props} className="size-4 accent-navy" />
      {label}
    </label>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-muted-foreground">
        {children}
      </table>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-9 w-56 rounded-lg bg-cream-soft" />
      <div className="h-5 w-80 max-w-full rounded-lg bg-cream-soft" />
      <div className="h-48 rounded-2xl bg-cream-soft" />
    </div>
  );
}
