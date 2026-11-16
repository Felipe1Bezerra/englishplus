import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import type { NavItem } from "@/components/shell-nav";
import { PageSkeleton } from "@/components/ui";
import { requireUser } from "@/lib/session";

const NAV: NavItem[] = [
  { href: "/aluno", label: "Início", icon: "overview", exact: true },
  { href: "/aluno/calendario", label: "Calendário", icon: "calendar" },
  { href: "/aluno/aulas", label: "Cursos e aulas", icon: "courses" },
  { href: "/aluno/conta", label: "Minha conta", icon: "account" },
];

export default function StudentLayout({ children }: LayoutProps<"/aluno">) {
  return (
    <AppShell nav={NAV} label="Área do aluno">
      <Suspense fallback={<PageSkeleton />}>
        <StudentGate>{children}</StudentGate>
      </Suspense>
    </AppShell>
  );
}

async function StudentGate({ children }: { children: React.ReactNode }) {
  await requireUser("/aluno");
  return children;
}
