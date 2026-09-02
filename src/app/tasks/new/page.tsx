import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import TaskForm from "@/components/TaskForm";
import PageShell from "@/components/PageShell";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const employees = await getDb().user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageShell
      title="Assign New Task"
      description="Set the employee, due date, and estimated time."
      width="narrow"
      actions={
        <Link href="/dashboard" className="btn btn-ghost">
          <ArrowLeft size={15} /> Back
        </Link>
      }
    >
      {employees.length === 0 ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          Add an employee first.{" "}
          <Link href="/dashboard/employees" className="font-medium text-[var(--primary)] underline underline-offset-2">
            Go to the Employees page
          </Link>
          .
        </div>
      ) : (
        <TaskForm employees={employees} />
      )}
    </PageShell>
  );
}
