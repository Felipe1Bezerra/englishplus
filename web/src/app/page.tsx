import { LandingFooter, LandingHeader, StickyOfferBar } from "@/components/landing/chrome";
import { FaqList } from "@/components/landing/faq-list";
import {
  Bases,
  Benefits,
  Bonuses,
  Contact,
  Courses,
  FinalCta,
  Fit,
  Formats,
  Guarantee,
  Hero,
  LessonVideos,
  Steps,
  StatsBar,
  StudentArea,
  Teacher,
  Testimonials,
} from "@/components/landing/sections";
import { SectionIntro } from "@/components/landing/ui";
import { PackagesSection } from "@/components/packages-section";
import { WhatsappButton } from "@/components/whatsapp-button";
import { FAQ } from "@/lib/landing-content";

/** Section order follows the reference sales page; the words live in lib/landing-content.ts. */
export default function Home() {
  return (
    <div className="bg-deep text-cream">
      <LandingHeader />
      <main>
        <Hero />
        <StatsBar />
        <Benefits />
        <Formats />
        <Teacher />
        <Bases />
        <Courses />
        <StudentArea />
        <LessonVideos />
        <Fit />
        <Testimonials />
        <Bonuses />
        <PackagesSection />
        <Guarantee />
        <Steps />
        <section id="faq" className="scroll-mt-20 bg-linear-to-b from-[#13213b] to-deep">
          <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
            <SectionIntro eyebrow="Perguntas" title="Perguntas" emphasis="frequentes" />
            <FaqList items={FAQ} />
          </div>
        </section>
        <Contact />
        <FinalCta />
      </main>
      <LandingFooter />
      <StickyOfferBar />
      <WhatsappButton />
    </div>
  );
}
