import Link from "next/link";
import { ListChecks, Clock3, Loader, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/TaskList";
import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";

  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : { assignedToId: session.user.id },
    include: { assignedTo: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => t.status !== "COMPLETED" && new Date(t.dueDate) < now).length,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div
        className="relative mb-7 overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--accent) 130%)" }}
      >
        <div className="animate-blob pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              {isAdmin ? "Sabhi Tasks" : `Salam, ${session.user.name?.split(" ")[0]}`}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {isAdmin
                ? "Apni team ko diye gaye tasks aur unka progress dekhein."
                : "Aapko assign kiye gaye tasks aur unki deadline."}
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/tasks/new"
              className="btn shrink-0 bg-white text-[var(--primary)] shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus size={16} />
              Naya Task Assign Karein
            </Link>
          )}
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.total} icon={ListChecks} tone="primary" />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} tone="warning" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} tone="info" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="danger" />
      </div>

      <TaskList tasks={tasks} showAssignee={isAdmin} />
    </main>
  );
}
