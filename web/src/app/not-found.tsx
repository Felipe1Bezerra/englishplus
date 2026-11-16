import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="text-3xl font-extrabold text-navy">Página não encontrada</h1>
      <p className="mt-2 text-muted-foreground">Não encontramos o que você procurava.</p>
      <Link href="/" className="mt-6 inline-block font-bold text-navy underline decoration-gold">
        Voltar ao início
      </Link>
    </div>
  );
}
