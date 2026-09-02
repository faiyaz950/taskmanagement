export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysRemaining(dueDate: Date | string) {
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function dueLabel(dueDate: Date | string, status: string) {
  const days = daysRemaining(dueDate);
  if (status === "COMPLETED") return { text: "Completed", tone: "done" as const };
  if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`, tone: "overdue" as const };
  if (days === 0) return { text: "Due today", tone: "soon" as const };
  if (days <= 2) return { text: `${days} day${days === 1 ? "" : "s"} left`, tone: "soon" as const };
  return { text: `${days} days left`, tone: "ok" as const };
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

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getWeekRange(reference: Date = new Date()): DateRange {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: startOfDay(monday), to: endOfDay(sunday) };
}

export function getMonthRange(reference: Date = new Date()): DateRange {
  const from = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const to = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { from: startOfDay(from), to: endOfDay(to) };
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDateRangeLabel(range: DateRange) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const fromLabel = range.from.toLocaleDateString("en-US", opts);
  const toLabel = range.to.toLocaleDateString("en-US", opts);
  return `${fromLabel} – ${toLabel}`;
}
