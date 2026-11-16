import Link from "next/link";
import { INSTAGRAM_URL, QUIZ_URL, WHATSAPP_URL } from "@/lib/site";

const NAV = [
  { href: "#metodo", label: "Método" },
  { href: "#professor", label: "Professor" },
  { href: "#conteudo", label: "Conteúdo" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "Dúvidas" },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-display text-2xl font-extrabold text-cream ${className}`}>
      English<span className="text-gold">+</span>
    </Link>
  );
}

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-deep/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-semibold text-cream/70 hover:text-gold">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/entrar" className="text-sm font-bold text-cream hover:text-gold">
            Entrar
          </Link>
          <a
            href="#planos"
            className="rounded-[10px] bg-gold px-4 py-2.5 text-xs font-extrabold tracking-[0.08em] text-deep uppercase sm:px-5 sm:text-sm"
          >
            Ver planos
          </a>
        </div>
      </div>
    </header>
  );
}

/** Always-visible offer strip, like the reference's bottom bar. */
export function StickyOfferBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="leading-tight">
          <p className="text-[11px] font-bold tracking-[0.18em] text-gold uppercase">
            Planos a partir de
          </p>
          <p className="font-display text-lg font-extrabold text-cream">
            R$ 49,90<span className="text-sm font-medium text-cream/60">/mês</span>
          </p>
        </div>
        <a
          href="#planos"
          className="rounded-[10px] bg-gold px-5 py-3 text-xs font-extrabold tracking-[0.08em] text-deep uppercase sm:px-7 sm:text-sm"
        >
          Quero começar
        </a>
      </div>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-deep pt-12 pb-32">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 sm:px-8">
        <Logo className="text-xl" />
        <nav className="flex flex-wrap gap-6 text-sm text-cream/60">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-gold">
              {label}
            </a>
          ))}
          <a href={QUIZ_URL} className="hover:text-gold">
            Qual série assistir?
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="hover:text-gold">
            Instagram
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="hover:text-gold">
            WhatsApp
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-5 pt-5 text-center text-xs text-cream/45 sm:px-8">
        © English+ by Felipe Bezerra — aulas de inglês focadas em conversação.
      </p>
    </footer>
  );
}
