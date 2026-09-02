import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import TaskList from "@/components/TaskList";
import {
  getWeekRange,
  getMonthRange,
  formatDateInput,
  formatDateRangeLabel,
  type DateRange,
} from "@/lib/utils";

function resolveRange(searchParams: { range?: string; from?: string; to?: string }): {
  range: DateRange;
  preset: "week" | "month" | "custom";
} {
  if (searchParams.from && searchParams.to) {
    const from = new Date(`${searchParams.from}T00:00:00`);
    const to = new Date(`${searchParams.to}T23:59:59.999`);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { range: { from, to }, preset: "custom" };
    }
  }
  if (searchParams.range === "week") {
    return { range: getWeekRange(), preset: "week" };
  }
  return { range: getMonthRange(), preset: "month" };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const { range, preset } = resolveRange(params);

  const tasks = await getDb().task.findMany({
    where: { dueDate: { gte: range.from, lte: range.to } },
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = tasks.filter((t) => t.status !== "COMPLETED" && new Date(t.dueDate) < now).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const byEmployee = new Map<string, { name: string; total: number; completed: number }>();
  for (const task of tasks) {
    const entry = byEmployee.get(task.assignedTo.id) ?? { name: task.assignedTo.name, total: 0, completed: 0 };
    entry.total += 1;
    if (task.status === "COMPLETED") entry.completed += 1;
    byEmployee.set(task.assignedTo.id, entry);
  }
  const employeeRows = Array.from(byEmployee.values()).sort((a, b) => b.total - a.total);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Task activity for {formatDateRangeLabel(range)}.
        </p>
      </div>

      <div className="card mb-7 flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/reports?range=week" className={`btn ${preset === "week" ? "btn-primary" : "btn-secondary"}`}>
            This Week
          </Link>
          <Link href="/dashboard/reports?range=month" className={`btn ${preset === "month" ? "btn-primary" : "btn-secondary"}`}>
            This Month
          </Link>
        </div>

        <form className="flex flex-wrap items-center gap-2 sm:ml-auto" action="/dashboard/reports">
          <input
            type="date"
            name="from"
            defaultValue={preset === "custom" ? formatDateInput(range.from) : undefined}
            className="input !w-auto"
            aria-label="From date"
            required
          />
          <span className="text-sm text-[var(--muted)]">to</span>
          <input
            type="date"
            name="to"
            defaultValue={preset === "custom" ? formatDateInput(range.to) : undefined}
            className="input !w-auto"
            aria-label="To date"
            required
          />
          <button type="submit" className={`btn ${preset === "custom" ? "btn-primary" : "btn-secondary"}`}>
            Custom Range
          </button>
        </form>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={total} icon={ListChecks} tone="primary" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Overdue" value={overdue} icon={AlertTriangle} tone="danger" />
        <StatCard label="Completion Rate" value={completionRate} icon={TrendingUp} tone="info" />
      </div>

      <div className="card mb-7 overflow-hidden">
        <div className="border-b border-[var(--border)] p-4">
          <h2 className="font-medium">By Employee</h2>
        </div>
        {employeeRows.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted)]">No tasks in this period.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {employeeRows.map((row) => {
              const rate = row.total === 0 ? 0 : Math.round((row.completed / row.total) * 100);
              return (
                <li key={row.name} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                    >
                      {initials(row.name)}
                    </span>
                    <p className="font-medium">{row.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                    <span>{row.completed}/{row.total} completed</span>
                    <span className="badge" style={{ background: "var(--surface)", color: "var(--foreground)" }}>
                      {rate}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <h2 className="mb-3 font-medium">Tasks in this period</h2>
      <TaskList tasks={tasks} showAssignee />
    </main>
  );
}
