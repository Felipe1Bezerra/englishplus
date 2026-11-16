/** All classes run on Brazil's main time zone, whichever device opens the page. */
export const TIME_ZONE = "America/Sao_Paulo";
const TIME_ZONE_OFFSET = "-03:00";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function brl(cents: number): string {
  return currency.format(cents / 100);
}

/** Drops ",00" so big display prices read cleanly: R$ 800, but R$ 49,90. */
export function priceLabel(cents: number): string {
  return brl(cents).replace(/,00$/, "");
}

/** "800,00" or "R$ 1.600,50" into cents; null when it isn't a price. */
export function parseBrl(value: string): number | null {
  const normalized = value.replace(/[R$\s.]/g, "").replace(",", ".");
  const amount = Number(normalized);
  return normalized && Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (value: string) => dateFormat.format(new Date(value));
export const formatDateTime = (value: string) => dateTimeFormat.format(new Date(value));
export const formatTime = (value: string) => timeFormat.format(new Date(value));

/** A time typed in a form means São Paulo time, not the server's. */
export function localInputToIso(value: string): string {
  return new Date(`${value}:00${TIME_ZONE_OFFSET}`).toISOString();
}

export interface Month {
  year: number;
  /** 1 to 12 */
  month: number;
}

export function parseMonth(value: unknown, fallback: Date): Month {
  const match = typeof value === "string" ? /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value) : null;
  if (match) return { year: Number(match[1]), month: Number(match[2]) };

  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  })
    .format(fallback)
    .split("-");
  return { year: Number(year), month: Number(month) };
}

export function monthKey({ year, month }: Month): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function addMonths({ year, month }: Month, delta: number): Month {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function monthRange(month: Month): { from: string; to: string } {
  const start = (value: Month) =>
    new Date(`${monthKey(value)}-01T00:00:00${TIME_ZONE_OFFSET}`).toISOString();
  return { from: start(month), to: start(addMonths(month, 1)) };
}

export function monthLabel({ year, month }: Month): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** The São Paulo calendar day of a moment, as YYYY-MM-DD. */
export function dayKey(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
