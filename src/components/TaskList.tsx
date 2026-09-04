import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { DueBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { durationLabel, formatDate } from "@/lib/utils";

type TaskListItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  estimatedDays: number;
  assignedTo?: { name: string };
};

const PRIORITY_ACCENT: Record<string, string> = {
  LOW: "var(--muted-2)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--danger)",
};

/** Finished work reads as green; anything still open is coloured by priority. */
function accentColor(task: { status: string; priority: string }) {
  return task.status === "COMPLETED" ? "var(--success)" : PRIORITY_ACCENT[task.priority];
}

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
      <div className="card flex flex-col items-center gap-2 border-dashed p-12 text-center">
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

  // Column widths are shared by the header and every row so the list reads as
  // an aligned table on desktop; below `lg` each row stacks instead.
  const columns = showAssignee
    ? "minmax(0,1fr) 170px 120px 140px 150px 18px"
    : "minmax(0,1fr) 120px 140px 150px 18px";

  return (
    <div className="overflow-hidden">
      <div
        className="mb-2 hidden gap-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-2)] lg:grid"
        style={{ gridTemplateColumns: columns }}
      >
        <span>Task</span>
        {showAssignee && <span>Assigned to</span>}
        <span>Priority</span>
        <span>Status</span>
        <span>Due</span>
        <span />
      </div>

      <ul className="flex flex-col gap-2.5">
        {tasks.map((task, i) => (
          <li key={task.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <Link
              href={`/tasks/${task.id}`}
              className="card card-interactive group flex flex-col gap-3 overflow-hidden p-4 lg:grid lg:items-center lg:gap-4"
              style={{
                borderLeft: `3px solid ${accentColor(task)}`,
                gridTemplateColumns: columns,
              }}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  <span className="lg:hidden">
                    {showAssignee && task.assignedTo ? `${task.assignedTo.name} · ` : ""}
                    {task.dueDate ? `Due: ${formatDate(task.dueDate)} · ` : ""}
                  </span>
                  {durationLabel(task.estimatedDays)} allowed
                </p>
              </div>

              {showAssignee && (
                <div className="hidden min-w-0 items-center gap-2 lg:flex">
                  {task.assignedTo && (
                    <>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                      >
                        {initials(task.assignedTo.name)}
                      </span>
                      <span className="truncate text-sm text-[var(--muted)]">{task.assignedTo.name}</span>
                    </>
                  )}
                </div>
              )}

              <div className="hidden lg:block">
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="hidden lg:block">
                <StatusBadge status={task.status} />
              </div>
              <div className="hidden lg:block">
                {task.status === "COMPLETED" ? (
                  <span className="text-xs text-[var(--muted)]">
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </span>
                ) : (
                  <DueBadge dueDate={task.dueDate} status={task.status} />
                )}
              </div>

              {/* stacked badges, mobile only */}
              <div className="flex flex-wrap items-center gap-2 lg:hidden">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                {task.status !== "COMPLETED" && (
                  <DueBadge dueDate={task.dueDate} status={task.status} />
                )}
              </div>

              <ChevronRight
                size={16}
                className="hidden shrink-0 text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5 lg:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
