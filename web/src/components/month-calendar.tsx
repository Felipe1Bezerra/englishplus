import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  addMonths,
  dayKey,
  formatDateTime,
  formatTime,
  monthKey,
  monthLabel,
  type Month,
} from "@/lib/format";
import type { CalendarClass } from "@/lib/api";
import { Badge, EmptyState } from "./ui";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface MonthCalendarProps {
  month: Month;
  classes: CalendarClass[];
  /** Page that shows this calendar; the month is added as ?mes=. */
  basePath: string;
  /** Where a class links to. */
  classHref: (item: CalendarClass) => string | null;
}

function classLabel(item: CalendarClass): string {
  return item.groupName ?? item.studentName ?? item.title;
}

export function MonthCalendar({ month, classes, basePath, classHref }: MonthCalendarProps) {
  const firstWeekday = new Date(Date.UTC(month.year, month.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate();
  const today = dayKey(new Date());

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${monthKey(month)}-${String(i + 1).padStart(2, "0")}`;
    return {
      key,
      number: i + 1,
      classes: classes.filter((item) => dayKey(item.startsAt) === key),
    };
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">{monthLabel(month)}</h2>
        <div className="flex gap-2">
          <MonthLink basePath={basePath} month={addMonths(month, -1)} label="Mês anterior">
            <ChevronLeft aria-hidden className="size-4" />
          </MonthLink>
          <MonthLink basePath={basePath} month={addMonths(month, 1)} label="Próximo mês">
            <ChevronRight aria-hidden className="size-4" />
          </MonthLink>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-border md:block">
        <div className="grid grid-cols-7 gap-px">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-cream-soft px-2 py-2 text-center text-xs font-bold text-navy"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => (
            <div key={i} className="bg-background" />
          ))}
          {days.map((day) => (
            <div key={day.key} className="min-h-24 bg-card p-1.5">
              <div
                className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                  day.key === today ? "bg-navy text-cream" : "text-muted-foreground"
                }`}
              >
                {day.number}
              </div>
              <div className="space-y-1">
                {day.classes.map((item) => (
                  <ClassChip key={item.id} item={item} href={classHref(item)} />
                ))}
              </div>
            </div>
          ))}
          {Array.from({ length: (7 - ((firstWeekday + daysInMonth) % 7)) % 7 }, (_, i) => (
            <div key={i} className="bg-background" />
          ))}
        </div>
      </div>

      {/* A seven-column grid is unreadable on a phone, so it becomes a list. */}
      <div className="space-y-2 md:hidden">
        {classes.length === 0 && <EmptyState>Nenhuma aula neste mês.</EmptyState>}
        {classes.map((item) => (
          <ClassRow key={item.id} item={item} href={classHref(item)} />
        ))}
      </div>
    </div>
  );
}

function MonthLink({
  basePath,
  month,
  label,
  children,
}: {
  basePath: string;
  month: Month;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`${basePath}?mes=${monthKey(month)}`}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-navy hover:border-navy"
    >
      {children}
    </Link>
  );
}

function ClassChip({ item, href }: { item: CalendarClass; href: string | null }) {
  const isCancelled = item.status === "cancelled";
  const classes = `block truncate rounded-md px-1.5 py-1 text-xs font-medium ${
    isCancelled ? "bg-bad-soft text-bad line-through" : "bg-navy text-cream"
  }`;
  const label = `${formatTime(item.startsAt)} ${classLabel(item)}`;

  return href ? (
    <Link href={href} title={item.title} className={classes}>
      {label}
    </Link>
  ) : (
    <span title={item.title} className={classes}>
      {label}
    </span>
  );
}

function ClassRow({ item, href }: { item: CalendarClass; href: string | null }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="font-semibold text-navy">{item.title}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(item.startsAt)} · {classLabel(item)}
        </p>
      </div>
      {item.status === "cancelled" && <Badge tone="bad">Cancelada</Badge>}
    </>
  );
  const classes =
    "flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3";

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
