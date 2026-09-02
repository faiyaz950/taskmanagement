import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import NewTaskForm from "@/components/NewTaskForm";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const employees = await getDb().user.findMany({
    where: { role: "EMPLOYEE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard" className="link-nav mb-4 !px-0 inline-flex w-fit hover:!bg-transparent">
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Assign New Task</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Set the employee, due date, and estimated time.</p>

      {employees.length === 0 ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          Add an employee first.{" "}
          <Link href="/dashboard/employees" className="font-medium text-[var(--primary)] underline underline-offset-2">
            Go to the Employees page
          </Link>
          .
        </div>
      ) : (
        <NewTaskForm employees={employees} />
      )}
    </main>
  );
}
