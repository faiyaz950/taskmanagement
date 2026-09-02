import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { DueBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";

type TaskListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date;
  estimatedDays: number;
  assignedTo?: { name: string };
};

const PRIORITY_ACCENT: Record<string, string> = {
  LOW: "var(--muted-2)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--danger)",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TaskList({
  tasks,
  showAssignee = false,
}: {
  tasks: TaskListItem[];
  showAssignee?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 border-dashed p-10 text-center">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "var(--surface)", color: "var(--muted-2)" }}
        >
          <ClipboardList size={20} strokeWidth={1.75} />
        </span>
        <p className="text-sm text-[var(--muted)]">No tasks found.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {tasks.map((task, i) => (
        <li key={task.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <Link
            href={`/tasks/${task.id}`}
            className="card card-interactive group flex flex-col gap-3 overflow-hidden p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderLeft: `3px solid ${PRIORITY_ACCENT[task.priority]}` }}
          >
            <div className="flex min-w-0 items-center gap-3">
              {showAssignee && task.assignedTo && (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                >
                  {initials(task.assignedTo.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {showAssignee && task.assignedTo ? `${task.assignedTo.name} · ` : ""}
                  Due: {formatDate(task.dueDate)} · Estimate: {task.estimatedDays} day{task.estimatedDays === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.status !== "COMPLETED" && (
                <DueBadge dueDate={task.dueDate} status={task.status} />
              )}
              <ChevronRight
                size={16}
                className="ml-1 hidden shrink-0 text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5 sm:block"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
