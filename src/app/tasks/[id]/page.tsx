import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import { DueBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { durationLabel, formatDate } from "@/lib/utils";
import StatusControl from "@/components/StatusControl";
import AddUpdateForm from "@/components/AddUpdateForm";
import PageShell from "@/components/PageShell";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await getDb().task.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      assignedBy: { select: { id: true, name: true } },
      updates: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!task) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = task.assignedToId === session.user.id;
  if (!isAdmin && !isOwner) redirect("/dashboard");

  return (
    <PageShell
      title={task.title}
      description={`Assigned to ${task.assignedTo.name} by ${task.assignedBy.name}`}
      actions={
        <>
          <Link href="/dashboard" className="btn btn-ghost">
            <ArrowLeft size={15} /> Back
          </Link>
          {isAdmin && (
            <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
              <Pencil size={14} />
              Edit
            </Link>
          )}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-6">
          <div className="card p-6 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.status !== "COMPLETED" && <DueBadge dueDate={task.dueDate} status={task.status} />}
            </div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--muted-2)]">
              Details
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
          </div>

          <div className="card p-6 sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 font-medium">
              <MessageSquare size={16} className="text-[var(--primary)]" />
              Updates
            </h2>
            <div className="mb-6">
              <AddUpdateForm taskId={task.id} />
            </div>

            {task.updates.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No updates yet.</p>
            ) : (
              <ul className="space-y-5">
                {task.updates.map((update) => (
                  <li key={update.id} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                    >
                      {initials(update.author.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed">{update.message}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {update.author.name} · {formatDate(update.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="card p-5">
            <p className="field-label">Update status</p>
            <StatusControl
              taskId={task.id}
              currentStatus={task.status}
              estimatedDays={task.estimatedDays}
              hasStarted={Boolean(task.startedAt)}
            />
          </div>

          <div className="card divide-y divide-[var(--border)] p-5 text-sm">
            <div className="pb-3">
              <p className="text-xs text-[var(--muted)]">Assigned to</p>
              <p className="mt-0.5 font-medium">{task.assignedTo.name}</p>
            </div>
            <div className="py-3">
              <p className="text-xs text-[var(--muted)]">Assigned by</p>
              <p className="mt-0.5 font-medium">{task.assignedBy.name}</p>
            </div>
            <div className="py-3">
              <p className="text-xs text-[var(--muted)]">Time allowed</p>
              <p className="mt-0.5 font-medium">{durationLabel(task.estimatedDays)}</p>
            </div>
            <div className="py-3">
              <p className="text-xs text-[var(--muted)]">Started on</p>
              <p className="mt-0.5 font-medium">
                {task.startedAt ? formatDate(task.startedAt) : "Not started yet"}
              </p>
            </div>
            <div className="pt-3">
              <p className="text-xs text-[var(--muted)]">Deadline</p>
              <p className="mt-0.5 font-medium">
                {task.dueDate ? formatDate(task.dueDate) : "Set when the task starts"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
