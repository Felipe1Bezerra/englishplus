import type { ReactNode } from "react";
import { isPlaceholder, type Copy } from "@/lib/landing-content";

/** Shows real text, or a highlighted box for information still to be filled in. */
export function Text({ value }: { value: Copy }) {
  if (!isPlaceholder(value)) return <>{value}</>;
  return (
    <span className="inline-block rounded border border-dashed border-gold bg-gold/15 px-2 py-0.5 align-middle font-sans text-sm leading-snug font-bold tracking-normal text-gold-light normal-case not-italic">
      [PREENCHER: {value.placeholder}]
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-gold uppercase">
      {children}
    </span>
  );
}

export function Title({
  children,
  emphasis,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  emphasis?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={`font-serif text-4xl leading-[1.1] font-bold text-balance text-cream sm:text-5xl ${className}`}
    >
      {children}
      {emphasis && (
        <>
          {" "}
          <em className="text-gold">{emphasis}</em>
        </>
      )}
    </Tag>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  emphasis,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  emphasis?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Title emphasis={emphasis} className="mt-5">
        {title}
      </Title>
      {children && <p className="mt-5 text-lg text-cream/70">{children}</p>}
    </div>
  );
}

export function CtaButton({
  href = "#planos",
  children,
  variant = "gold",
}: {
  href?: string;
  children: ReactNode;
  variant?: "gold" | "outline";
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-8 py-4 text-sm font-extrabold tracking-[0.08em] uppercase transition-transform hover:-translate-y-0.5 ${
        variant === "gold"
          ? "bg-gold text-deep shadow-[0_18px_40px_-14px] shadow-gold/50"
          : "border border-cream/30 text-cream hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </a>
  );
}

export function Trust({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-sm text-cream/55">{children}</p>;
}

/** The faint oversized number behind each card, as on the reference page. */
export function BigNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-2 right-4 font-serif text-8xl font-bold text-gold/[0.07] italic select-none"
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}
