export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
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
  if (days < 0) return { text: `${Math.abs(days)} din late`, tone: "overdue" as const };
  if (days === 0) return { text: "Aaj deadline hai", tone: "soon" as const };
  if (days <= 2) return { text: `${days} din bache hain`, tone: "soon" as const };
  return { text: `${days} din bache hain`, tone: "ok" as const };
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
