import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import TaskForm from "@/components/TaskForm";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import { formatDateInput } from "@/lib/utils";
import PageShell from "@/components/PageShell";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const db = getDb();
  const [task, employees] = await Promise.all([
    db.task.findUnique({ where: { id } }),
    db.user.findMany({
      where: { role: "EMPLOYEE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!task) notFound();

  return (
    <PageShell
      title="Edit Task"
      description="Update the details, assignee, or deadline."
      width="narrow"
      actions={
        <Link href={`/tasks/${task.id}`} className="btn btn-ghost">
          <ArrowLeft size={15} /> Back
        </Link>
      }
    >
      <TaskForm
        employees={employees}
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          assignedToId: task.assignedToId,
          priority: task.priority,
          estimatedDays: task.estimatedDays,
          dueDate: formatDateInput(task.dueDate),
        }}
      />

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-medium">Delete this task</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            This permanently removes the task and all of its updates.
          </p>
        </div>
        <DeleteTaskButton taskId={task.id} />
      </div>
    </PageShell>
  );
}
