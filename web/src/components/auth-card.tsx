import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-5 py-10">
      <Link href="/" className="mb-8 font-display text-3xl font-extrabold text-cream">
        English<span className="text-gold">+</span>
      </Link>
      <main className="w-full max-w-md rounded-3xl bg-cream p-7 shadow-lift sm:p-9">
        <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        <p className="mt-1 mb-6 text-muted-foreground">{description}</p>
        {children}
      </main>
    </div>
  );
}
