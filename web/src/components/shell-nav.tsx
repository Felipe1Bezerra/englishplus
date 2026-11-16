"use client";

import {
  BookOpen,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  overview: LayoutDashboard,
  students: GraduationCap,
  groups: Users,
  calendar: CalendarDays,
  packages: Package,
  courses: BookOpen,
  payments: CreditCard,
  account: Settings,
};

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  /** Set on a section's root, which shouldn't stay highlighted on its sub-pages. */
  exact?: boolean;
}

/** Needs a Suspense boundary, because the URL isn't known while prerendering. */
export function ShellNav({ items }: { items: NavItem[] }) {
  return <ShellNavLinks items={items} pathname={usePathname()} />;
}

/** With no pathname, nothing is highlighted: the static version shown while loading. */
export function ShellNavLinks({ items, pathname }: { items: NavItem[]; pathname?: string }) {
  return (
    <nav
      aria-label="Principal"
      className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3"
    >
      {items.map(({ href, label, icon, exact }) => {
        const Icon = ICONS[icon];
        const isActive = exact ? pathname === href : pathname?.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? "bg-gold text-navy" : "text-cream/75 hover:bg-white/10 hover:text-cream"
            }`}
          >
            <Icon aria-hidden className="size-4.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
