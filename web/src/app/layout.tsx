import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "English+ | Inglês para falar de verdade — R$49,90/mês",
    template: "%s | English+",
  },
  description:
    "Curso de inglês com 2 aulas gravadas por semana na plataforma online por R$49,90/mês, além de aulas ao vivo focadas em conversação.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${sora.variable} ${playfair.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
