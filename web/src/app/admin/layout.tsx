import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import type { NavItem } from "@/components/shell-nav";
import { PageSkeleton } from "@/components/ui";
import { requireTeacher } from "@/lib/session";

const NAV: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: "overview", exact: true },
  { href: "/admin/alunos", label: "Alunos", icon: "students" },
  { href: "/admin/turmas", label: "Turmas", icon: "groups" },
  { href: "/admin/calendario", label: "Calendário", icon: "calendar" },
  { href: "/admin/pacotes", label: "Pacotes", icon: "packages" },
  { href: "/admin/cursos", label: "Cursos", icon: "courses" },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: "payments" },
  { href: "/admin/conta", label: "Minha conta", icon: "account" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell nav={NAV} label="Painel do professor">
      <Suspense fallback={<PageSkeleton />}>
        <TeacherGate>{children}</TeacherGate>
      </Suspense>
    </AppShell>
  );
}

async function TeacherGate({ children }: { children: React.ReactNode }) {
  await requireTeacher();
  return children;
}
