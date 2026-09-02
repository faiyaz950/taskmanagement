// Task dates are stored as UTC midnight of the chosen calendar day (a `<input
// type="date">` value like "2026-09-05" parses as UTC midnight). Everything
// below therefore works in UTC so the calendar day never shifts based on the
// timezone the app happens to run in.

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function utcMidnight(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function daysRemaining(dueDate: Date | string) {
  const diffMs = utcMidnight(new Date(dueDate)) - utcMidnight(new Date());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * The deadline an employee gets by starting a task now: the start day plus the
 * duration the admin allotted. A 1-day task started today is due today, so the
 * duration counts the start day itself.
 */
export function deadlineFromStart(startedAt: Date, estimatedDays: number) {
  const start = new Date(utcMidnight(startedAt));
  start.setUTCDate(start.getUTCDate() + Math.max(0, Math.ceil(estimatedDays) - 1));
  return start;
}

export function dueLabel(dueDate: Date | string | null | undefined, status: string) {
  if (status === "COMPLETED") return { text: "Completed", tone: "done" as const };
  if (!dueDate) return { text: "Not started", tone: "idle" as const };

  const days = daysRemaining(dueDate);
  if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`, tone: "overdue" as const };
  if (days === 0) return { text: "Due today", tone: "soon" as const };
  if (days <= 2) return { text: `${days} day${days === 1 ? "" : "s"} left`, tone: "soon" as const };
  return { text: `${days} days left`, tone: "ok" as const };
}

export function durationLabel(days: number) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export type DateRange = { from: Date; to: Date };

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

export function getWeekRange(reference: Date = new Date()): DateRange {
  const day = reference.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setUTCDate(reference.getUTCDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { from: startOfUtcDay(monday), to: endOfUtcDay(sunday) };
}

export function getMonthRange(reference: Date = new Date()): DateRange {
  const from = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  const to = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0));
  return { from: startOfUtcDay(from), to: endOfUtcDay(to) };
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function resolveReportRange(params: { range?: string; from?: string; to?: string }): {
  range: DateRange;
  preset: "week" | "month" | "custom";
} {
  if (params.from && params.to) {
    const from = new Date(`${params.from}T00:00:00.000Z`);
    const to = new Date(`${params.to}T23:59:59.999Z`);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { range: { from, to }, preset: "custom" };
    }
  }
  if (params.range === "week") {
    return { range: getWeekRange(), preset: "week" };
  }
  return { range: getMonthRange(), preset: "month" };
}

/**
 * Which tasks belong to a report period: those due in the range, plus those
 * that have no deadline yet (never started) but were created in it — otherwise
 * unstarted work would vanish from every report.
 */
export function reportPeriodFilter(range: DateRange) {
  return {
    OR: [
      { dueDate: { gte: range.from, lte: range.to } },
      { AND: [{ dueDate: null }, { createdAt: { gte: range.from, lte: range.to } }] },
    ],
  };
}

export function formatDateRangeLabel(range: DateRange) {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  };
  const fromLabel = range.from.toLocaleDateString("en-US", opts);
  const toLabel = range.to.toLocaleDateString("en-US", opts);
  return `${fromLabel} – ${toLabel}`;
}
