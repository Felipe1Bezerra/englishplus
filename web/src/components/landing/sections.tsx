/* eslint-disable @next/next/no-img-element -- photos are hosted on Lovable, see lib/site.ts */
import {
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  Gift,
  Headphones,
  Laptop,
  MessagesSquare,
  PenLine,
  Play,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  BASES,
  BENEFITS,
  BONUSES,
  COURSES,
  FOR_YOU,
  FORMATS,
  HERO,
  LESSON_VIDEOS,
  NOT_FOR_YOU,
  PLATFORM_FEATURES,
  STATS,
  STEPS,
  TEACHER,
  TEACHER_PHOTO,
  TESTIMONIALS,
} from "@/lib/landing-content";
import { INSTAGRAM_URL, WHATSAPP_MESSAGE_URL, WHATSAPP_URL } from "@/lib/site";
import { BigNumber, CtaButton, Eyebrow, SectionIntro, Text, Title, Trust } from "./ui";

const SECTION = "mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28";
const GLOW = "bg-[radial-gradient(ellipse_at_top,#1e3459_0%,#070e1c_62%)]";
const FADE = "bg-linear-to-b from-[#13213b] to-deep";
const CARD =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-gold/50";

export function Hero() {
  return (
    <section className={GLOW}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pt-24 lg:pb-28">
        <div className="rise">
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <Title as="h1" emphasis={HERO.titleEmphasis} className="mt-6 sm:text-6xl">
            {HERO.title}
          </Title>
          <p className="mt-6 max-w-xl text-lg text-cream/75">{HERO.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <CtaButton>Quero começar agora</CtaButton>
            <CtaButton href="#metodo" variant="outline">
              Conhecer o método
            </CtaButton>
          </div>
          <Trust>{HERO.trust}</Trust>
        </div>

        <div className="rise relative mx-auto w-full max-w-md">
          <div aria-hidden className="absolute -inset-3 rounded-[28px] border border-gold/30" />
          <img
            src={TEACHER_PHOTO}
            alt="Felipe Bezerra, professor de inglês"
            className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
          />
          <div className="absolute -bottom-5 left-6 rounded-xl border border-gold/40 bg-deep/95 px-5 py-3 shadow-xl">
            <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Professor</p>
            <p className="font-serif text-lg font-bold text-cream">{TEACHER.name}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-white/10 bg-[#0b1527]">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 lg:grid-cols-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <dt className="sr-only">{label}</dt>
            <dd className="font-serif text-4xl font-bold text-gold sm:text-5xl">
              <Text value={value} />
            </dd>
            <dd className="mt-2 text-xs font-bold tracking-[0.18em] text-cream/60 uppercase">
              {label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const BENEFIT_ICONS = [MessagesSquare, PenLine, CircleCheck, Laptop, Headphones, Wallet];

export function Benefits() {
  return (
    <section id="metodo" className="scroll-mt-20">
      <div className={SECTION}>
        <SectionIntro
          eyebrow="O método English+"
          title="Fale inglês com confiança,"
          emphasis="mesmo que você esteja começando agora."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ title, body }, i) => {
            const Icon = BENEFIT_ICONS[i] ?? Sparkles;
            return (
              <article key={title} className={CARD}>
                <BigNumber n={i + 1} />
                <span className="flex size-11 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold text-cream">{title}</h3>
                <p className="mt-3 text-[15px] text-cream/70">{body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Formats() {
  return (
    <section className={FADE}>
      <div className={SECTION}>
        <SectionIntro
          eyebrow={FORMATS.eyebrow}
          title={FORMATS.title}
          emphasis={FORMATS.titleEmphasis}
        >
          {FORMATS.subtitle}
        </SectionIntro>

        <div className="grid gap-5 md:grid-cols-2">
          {FORMATS.options.map(({ label, body }, i) => {
            const Icon = i === 0 ? Laptop : Users;
            return (
              <div
                key={label}
                className="flex min-h-56 flex-col justify-end rounded-3xl border border-gold/30 bg-[radial-gradient(ellipse_at_top_right,#253c66_0%,#0c1629_70%)] p-8"
              >
                <Icon aria-hidden strokeWidth={1.25} className="size-14 text-gold" />
                <p className="mt-6 text-sm font-extrabold tracking-[0.2em] text-gold uppercase">
                  {label}
                </p>
                <p className="mt-2 text-lg text-cream/80">{body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>O problema</Eyebrow>
            <p className="mt-5 font-serif text-2xl leading-snug text-cream">{FORMATS.problem}</p>
          </div>
          <div>
            <Eyebrow>A solução</Eyebrow>
            <p className="mt-5 font-serif text-2xl leading-snug text-cream">
              {FORMATS.solution}
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <p className="text-center font-serif text-2xl font-bold text-cream">
            Aprenda com <em className="text-gold">3 tipos de prática</em>
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {FORMATS.approaches.map(({ label, body }, i) => (
              <div key={label} className="text-center">
                <span className="font-serif text-3xl font-bold text-gold italic">0{i + 1}</span>
                <p className="mt-2 font-bold text-cream">{label}</p>
                <p className="mt-1 text-sm text-cream/65">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Teacher() {
  return (
    <section id="professor" className="scroll-mt-20">
      <div className={`${SECTION} grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]`}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1629]">
          <img
            src={TEACHER_PHOTO}
            alt="Felipe Bezerra"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-deep via-deep/85 to-transparent p-7 pt-24">
            <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">O professor</p>
            <p className="font-serif text-3xl font-bold text-cream">{TEACHER.name}</p>
            <p className="mt-3 text-xs font-bold tracking-[0.18em] text-gold/80 uppercase">
              A missão
            </p>
            <p className="font-serif text-cream/85 italic">{TEACHER.mission}</p>
          </div>
        </div>

        <div>
          <Eyebrow>Conheça o professor</Eyebrow>
          <Title className="mt-5" emphasis="e o English+ nasceu para você destravar.">
            {TEACHER.title}
          </Title>
          {TEACHER.paragraphs.map((paragraph, i) => (
            <p
              key={paragraph}
              className={`mt-6 text-lg text-cream/75 ${
                i === 0
                  ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-gold"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <CtaButton href={WHATSAPP_URL}>Falar com o Felipe</CtaButton>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener"
              className="text-sm font-bold text-cream underline decoration-gold underline-offset-4 hover:text-gold"
            >
              Ver no Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Bases() {
  return (
    <section className={FADE}>
      <div className={SECTION}>
        <SectionIntro
          eyebrow="Como funciona na prática"
          title="As 4 bases"
          emphasis="do método English+"
        >
          Um passo a passo simples para você aprender de maneira fácil, prática e rápida.
        </SectionIntro>

        <ol className="grid gap-5 md:grid-cols-2">
          {BASES.map(({ title, body, takeaway }, i) => (
            <li key={title} className={`${CARD} flex gap-6`}>
              <span className="font-serif text-6xl leading-none font-bold text-gold italic">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-gold/80 uppercase">
                  Base 0{i + 1}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-cream">{title}</h3>
                <p className="mt-3 text-[15px] text-cream/70">{body}</p>
                <p className="mt-4 text-sm font-semibold text-gold">{takeaway}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Courses() {
  return (
    <section id="conteudo" className="scroll-mt-20">
      <div className={SECTION}>
        <SectionIntro
          eyebrow="Do zero ao avançado. Um caminho claro."
          title="Conheça o conteúdo"
          emphasis="que vai destravar seu inglês"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {COURSES.map(({ level, title, topics }, i) => (
            <article
              key={title}
              className={`${CARD} ${i === 2 ? "border-gold/50 bg-gold/[0.04]" : ""}`}
            >
              <BigNumber n={i + 1} />
              <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-gold uppercase">
                <BookOpen aria-hidden className="size-4" /> {level}
              </p>
              <h3 className="mt-3 font-serif text-2xl font-bold text-cream">{title}</h3>
              <ul className="mt-6 space-y-3">
                {topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-3 text-[15px] text-cream/80">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" />
                    {topic}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <CtaButton>Quero me matricular</CtaButton>
        </div>
      </div>
    </section>
  );
}

export function StudentArea() {
  return (
    <section className={FADE}>
      <div className={`${SECTION} grid items-center gap-14 lg:grid-cols-2`}>
        <div>
          <Eyebrow>Sua área de aluno</Eyebrow>
          <Title className="mt-5" emphasis="quando e onde você quiser.">
            Estude no computador ou no celular,
          </Title>
          <div className="mt-10 space-y-7">
            {PLATFORM_FEATURES.map(({ title, body }) => (
              <div key={title} className="border-l-2 border-gold pl-5">
                <p className="font-serif text-xl font-bold text-cream">{title}</p>
                <p className="mt-1 text-cream/70">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* A drawing of the real student dashboard, so it never goes out of date like a screenshot. */}
        <div
          aria-hidden
          className="rounded-3xl border border-white/10 bg-[#0c1629] p-3 shadow-2xl"
        >
          <div className="flex overflow-hidden rounded-2xl bg-cream">
            <div className="hidden w-28 shrink-0 space-y-2 bg-navy p-3 sm:block">
              <p className="font-display text-sm font-extrabold text-cream">
                English<span className="text-gold">+</span>
              </p>
              {["Início", "Calendário", "Aulas"].map((item, i) => (
                <p
                  key={item}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                    i === 0 ? "bg-gold text-navy" : "text-cream/70"
                  }`}
                >
                  {item}
                </p>
              ))}
            </div>
            <div className="flex-1 space-y-3 p-4">
              <p className="font-display text-base font-extrabold text-navy">Oi, Ana!</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Nível", "B1"],
                  ["Presença", "92%"],
                  ["Aulas", "24"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-card p-2">
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                    <p className="font-display text-sm font-extrabold text-navy">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[10px] font-bold text-navy">Próximas aulas</p>
                {["Ter, 19:30 · Conversação B1", "Qui, 19:30 · Conversação B1"].map((row) => (
                  <div key={row} className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] text-foreground">
                      <CalendarDays className="size-3 text-navy" />
                      {row}
                    </span>
                    <span className="rounded-full bg-navy px-2 py-0.5 text-[9px] font-bold text-cream">
                      Entrar
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-cream-soft p-3 text-[10px] text-foreground">
                <span className="font-bold text-navy">Felipe: </span>
                Ótima evolução na conversação! Continue praticando.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LessonVideos() {
  return (
    <section>
      <div className={SECTION}>
        <SectionIntro
          eyebrow="O método na prática"
          title="Dê uma espiada"
          emphasis="em algumas aulas"
        >
          Assista e veja como as aulas funcionam.
        </SectionIntro>
        <div className="grid gap-5 md:grid-cols-3">
          {LESSON_VIDEOS.map(({ title }, i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="flex aspect-video items-center justify-center bg-[radial-gradient(ellipse_at_center,#253c66_0%,#0c1629_75%)]">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold text-deep">
                  <Play aria-hidden className="size-6 translate-x-0.5" fill="currentColor" />
                </span>
              </div>
              <figcaption className="p-5">
                <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Assista</p>
                <p className="mt-1 font-semibold text-cream">
                  <Text value={title} />
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CtaButton>Quero me matricular</CtaButton>
        </div>
      </div>
    </section>
  );
}

export function Fit() {
  return (
    <section className={FADE}>
      <div className={SECTION}>
        <SectionIntro eyebrow="Para você ou não" title="O curso de inglês" emphasis="ideal para você." />
        <div className="grid gap-5 md:grid-cols-2">
          <FitList tone="yes" title="O curso é pra você que" items={FOR_YOU} />
          <FitList tone="no" title="O curso não é pra você que" items={NOT_FOR_YOU} />
        </div>
        <div className="mt-12 text-center">
          <CtaButton>Quero fazer parte</CtaButton>
          <Trust>{HERO.trust}</Trust>
        </div>
      </div>
    </section>
  );
}

function FitList({ tone, title, items }: { tone: "yes" | "no"; title: string; items: string[] }) {
  const isYes = tone === "yes";
  const Icon = isYes ? Check : X;

  return (
    <div
      className={`rounded-3xl border p-8 ${
        isYes ? "border-gold/60 bg-gold/[0.05]" : "border-white/10 bg-white/[0.02] opacity-80"
      }`}
    >
      <p className="flex items-center gap-3 text-xs font-bold tracking-[0.18em] uppercase">
        <span
          className={`flex size-8 items-center justify-center rounded-full ${
            isYes ? "bg-gold text-deep" : "bg-white/10 text-cream/60"
          }`}
        >
          <Icon aria-hidden className="size-4" />
        </span>
        <span className={isYes ? "text-gold" : "text-cream/50"}>
          {isYes ? "A escolha certa" : "Porta errada"}
        </span>
      </p>
      <h3 className="mt-5 font-serif text-2xl font-bold text-cream">
        {title} <em className={isYes ? "text-gold" : "text-cream/50"}>…</em>
      </h3>
      <ol className="mt-6 space-y-4">
        {items.map((item, i) => (
          <li key={item} className="flex gap-4 text-[15px] text-cream/80">
            <span className={`font-mono text-xs ${isYes ? "text-gold" : "text-cream/40"}`}>
              0{i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="depoimentos" className="scroll-mt-20">
      <div className={SECTION}>
        <SectionIntro
          eyebrow="Alunos reais"
          title="Não acredite só na minha palavra."
          emphasis="Ouça quem já destravou."
        >
          Gente comum que travava na hora de falar e hoje conversa em inglês.
        </SectionIntro>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ name, handle, photo, highlight, quote }) => (
            <figure key={name} className={`${CARD} flex flex-col`}>
              <blockquote className="flex-1">
                <p className="font-serif text-xl leading-snug font-bold text-cream">
                  “{highlight}”
                </p>
                <p className="mt-4 text-[15px] text-cream/65">{quote}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <img src={photo} alt="" className="size-11 rounded-full object-cover" />
                <span>
                  <span className="block font-bold tracking-wide text-cream uppercase">
                    {name}
                  </span>
                  <span className="text-xs text-gold">{handle}</span>
                </span>
              </figcaption>
            </figure>
          ))}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/50 bg-gold/[0.06] p-8 text-center">
            <p className="font-serif text-2xl font-bold text-cream">
              Sua história pode ser <em className="text-gold">a próxima.</em>
            </p>
            <div className="mt-6">
              <CtaButton>Começar agora</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Bonuses() {
  return (
    <section className={FADE}>
      <div className={SECTION}>
        <SectionIntro
          eyebrow="Bônus · incluídos no curso"
          title="Bônus que levam seu inglês"
          emphasis="a outro nível."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {BONUSES.map(({ title, body, value }, i) => (
            <article key={i} className={CARD}>
              <span className="flex size-11 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Gift aria-hidden className="size-5" />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold text-cream">
                <Text value={title} />
              </h3>
              <p className="mt-3 text-[15px] text-cream/70">
                <Text value={body} />
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 text-sm text-cream/50">
                {value ? (
                  <>
                    de <Text value={value} />
                  </>
                ) : (
                  "Incluído no plano"
                )}
                <span className="ml-2 font-extrabold tracking-[0.12em] text-gold uppercase">
                  Grátis
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guarantee() {
  return (
    <section>
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="rounded-[32px] border border-gold/30 bg-[radial-gradient(ellipse_at_top,#1e3459_0%,#0a1324_70%)] px-6 py-14 text-center sm:px-14">
          <Seal />
          <div className="mt-10">
            <Eyebrow>Garantia de satisfação</Eyebrow>
          </div>
          <Title className="mt-5" emphasis="sua satisfação.">
            A gente garante
          </Title>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-cream/75">
            Depois da compra, você tem <b className="text-cream">7 dias de garantia</b>. Se
            perceber que o English+ não é para você, é só pedir e devolvemos{" "}
            <b className="text-cream">100% do valor</b>, sem perguntas.
          </p>
          <div className="mt-8">
            <CtaButton href={WHATSAPP_MESSAGE_URL} variant="outline">
              Pedir pelo WhatsApp
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The circular badge with text running around the edge. */
function Seal() {
  return (
    <div className="relative mx-auto size-48">
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <path id="seal-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" className="text-gold/60" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" className="text-gold/40" />
        <text className="fill-gold text-[13px] font-bold tracking-[0.3em] uppercase">
          <textPath href="#seal-ring">Garantia de satisfação ★ English+ ★ 7 dias ★</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-6xl leading-none font-bold text-gold italic">07</span>
        <span className="mt-1 text-xs font-bold tracking-[0.3em] text-cream uppercase">Dias</span>
      </div>
    </div>
  );
}

export function Steps() {
  return (
    <section className={FADE}>
      <div className={SECTION}>
        <SectionIntro
          eyebrow="Simples assim"
          title="Em 4 passos você"
          emphasis="começa a falar inglês"
        >
          Veja como é fácil se matricular e começar agora mesmo.
        </SectionIntro>
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step} className={CARD}>
              <span className="font-serif text-5xl font-bold text-gold italic">0{i + 1}</span>
              <p className="mt-4 text-[15px] text-cream/75">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section>
      <div className="mx-auto max-w-4xl px-5 pb-8 text-center sm:px-8">
        <p className="text-cream/70">Ficou com alguma dúvida? Fale com a gente:</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_MESSAGE_URL}
            target="_blank"
            rel="noopener"
            className="rounded-[10px] bg-whatsapp px-6 py-3 text-sm font-extrabold text-deep"
          >
            WhatsApp
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener"
            className="rounded-[10px] border border-cream/30 px-6 py-3 text-sm font-bold text-cream hover:border-gold hover:text-gold"
          >
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className={GLOW}>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <Title emphasis="as conversas que você sempre quis em inglês?">
          Pronto para finalmente ter
        </Title>
        <div className="mt-10">
          <CtaButton>Quero me matricular</CtaButton>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-cream/65">
          Experimente por 7 dias. Se sentir que não é pra você, devolvemos cada centavo. O risco é
          todo nosso.
        </p>
        <Trust>Garantia de 7 dias · Cancele quando quiser · Compra segura</Trust>
      </div>
    </section>
  );
}
