import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import TaskForm from "@/components/TaskForm";
import DeleteTaskButton from "@/components/DeleteTaskButton";
import { formatDateInput } from "@/lib/utils";

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
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/tasks/${task.id}`} className="link-nav mb-4 !px-0 inline-flex w-fit hover:!bg-transparent">
        <ArrowLeft size={15} /> Back to task
      </Link>

      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Edit Task</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Update the details, assignee, or deadline.</p>

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
    </main>
  );
}
