import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DueBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import { formatDate } from "@/lib/utils";
import StatusControl from "@/components/StatusControl";
import AddUpdateForm from "@/components/AddUpdateForm";

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

  const task = await prisma.task.findUnique({
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard" className="link-nav mb-4 !px-0 inline-flex w-fit hover:!bg-transparent">
        <ArrowLeft size={15} /> Dashboard par wapas
      </Link>

      <div className="card animate-fade-up mb-6 p-6 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.status !== "COMPLETED" && <DueBadge dueDate={task.dueDate} status={task.status} />}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">{task.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-[var(--muted)]">Assigned to</p>
            <p className="mt-0.5 font-medium">{task.assignedTo.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Assigned by</p>
            <p className="mt-0.5 font-medium">{task.assignedBy.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Estimate</p>
            <p className="mt-0.5 font-medium">{task.estimatedDays} din</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Deadline</p>
            <p className="mt-0.5 font-medium">{formatDate(task.dueDate)}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <p className="field-label">Status update karein</p>
          <StatusControl taskId={task.id} currentStatus={task.status} />
        </div>
      </div>

      <div className="card animate-fade-up p-6 sm:p-7">
        <h2 className="mb-4 flex items-center gap-2 font-medium">
          <MessageSquare size={16} className="text-[var(--primary)]" />
          Updates
        </h2>
        <div className="mb-6">
          <AddUpdateForm taskId={task.id} />
        </div>

        {task.updates.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Abhi tak koi update nahi hai.</p>
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
    </main>
  );
}
