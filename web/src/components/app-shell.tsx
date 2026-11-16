import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { SubmitButton } from "./action-form";
import { ShellNav, ShellNavLinks, type NavItem } from "./shell-nav";

export function AppShell({
  nav,
  label,
  children,
}: {
  nav: NavItem[];
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col border-b border-white/10 bg-navy text-cream lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-6 lg:py-6">
          <div>
            <Link href="/" className="font-display text-xl font-extrabold">
              English<span className="text-gold">+</span>
            </Link>
            <p className="text-xs text-cream/60">{label}</p>
          </div>
          <form action={logout} className="lg:hidden">
            <SubmitButton variant="gold" className="px-4! py-1.5!" pendingLabel="Saindo…">
              Sair
            </SubmitButton>
          </form>
        </div>
        <Suspense fallback={<ShellNavLinks items={nav} />}>
          <ShellNav items={nav} />
        </Suspense>
        <form action={logout} className="mt-auto hidden p-5 lg:block">
          <SubmitButton variant="gold" className="w-full" pendingLabel="Saindo…">
            Sair
          </SubmitButton>
        </form>
      </aside>
      <main className="min-w-0 flex-1 bg-background px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
