import { Clock, Flag } from "lucide-react";
import { PRIORITY_LABEL, STATUS_LABEL, dueLabel } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
};

const PRIORITY_TONE: Record<string, string> = {
  LOW: "muted",
  MEDIUM: "warning",
  HIGH: "danger",
};

const DUE_TONE: Record<string, string> = {
  overdue: "danger",
  soon: "warning",
  ok: "muted",
  done: "success",
  idle: "muted",
};

function toneStyle(tone: string) {
  if (tone === "muted") {
    return {
      background: "var(--surface)",
      color: "var(--muted)",
      border: "1px solid var(--border)",
    };
  }
  return {
    background: `var(--${tone}-bg)`,
    color: `var(--${tone})`,
  };
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status];
  return (
    <span className="badge" style={toneStyle(tone)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = PRIORITY_TONE[priority];
  return (
    <span className="badge" style={toneStyle(tone)}>
      <Flag size={11} strokeWidth={2.5} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function DueBadge({
  dueDate,
  status,
}: {
  dueDate: Date | string | null | undefined;
  status: string;
}) {
  const { text, tone } = dueLabel(dueDate, status);
  return (
    <span className="badge" style={toneStyle(DUE_TONE[tone])}>
      <Clock size={11} strokeWidth={2.5} />
      {text}
    </span>
  );
}
