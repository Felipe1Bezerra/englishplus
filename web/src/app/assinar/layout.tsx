import Link from "next/link";

export default function CheckoutLayout({ children }: LayoutProps<"/assinar">) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-noir px-5 py-10">
      <Link href="/" className="mb-8 font-display text-3xl font-extrabold text-cream">
        English<span className="text-gold">+</span>
      </Link>
      <main className="w-full max-w-lg">{children}</main>
    </div>
  );
}
