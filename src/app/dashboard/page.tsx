import Link from "next/link";
import { ListChecks, Clock3, Loader, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import StatCard from "@/components/StatCard";
import TaskFilters from "@/components/TaskFilters";
import PageShell from "@/components/PageShell";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; assignee?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";
  const filters = await searchParams;
  const db = getDb();

  const status = STATUSES.includes(filters.status ?? "") ? filters.status : undefined;
  const priority = PRIORITIES.includes(filters.priority ?? "") ? filters.priority : undefined;
  const q = filters.q?.trim() || undefined;
  const assignee = isAdmin ? filters.assignee || undefined : undefined;

  const [tasks, employees] = await Promise.all([
    db.task.findMany({
      where: {
        assignedToId: isAdmin ? assignee : session.user.id,
        status: status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined,
        priority: priority as "LOW" | "MEDIUM" | "HIGH" | undefined,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: { assignedTo: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    isAdmin
      ? db.user.findMany({
          where: { role: "EMPLOYEE" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const now = new Date();
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now)
      .length,
  };

  return (
    <PageShell
      title={isAdmin ? "All Tasks" : `Hi, ${session.user.name?.split(" ")[0]}`}
      description={
        isAdmin
          ? "Track the tasks assigned to your team and their progress."
          : "Your assigned tasks and their deadlines."
      }
      actions={
        isAdmin && (
          <Link href="/tasks/new" className="btn btn-primary">
            <Plus size={16} />
            Assign New Task
          </Link>
        )
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={ListChecks} tone="primary" />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} tone="warning" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} tone="info" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="danger" />
      </div>

      <TaskFilters
        values={{ q, status, priority, assignee }}
        employees={isAdmin ? employees : undefined}
      />

      <TaskList tasks={tasks} showAssignee={isAdmin} />
    </PageShell>
  );
}
