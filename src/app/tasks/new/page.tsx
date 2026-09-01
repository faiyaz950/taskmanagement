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
        <ArrowLeft size={15} /> Dashboard par wapas
      </Link>

      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Naya Task Assign Karein</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Employee, deadline aur estimated time set karein.</p>

      {employees.length === 0 ? (
        <div className="card p-6 text-sm text-[var(--muted)]">
          Pehle koi employee add karein.{" "}
          <Link href="/dashboard/employees" className="font-medium text-[var(--primary)] underline underline-offset-2">
            Employees page par jayein
          </Link>
          .
        </div>
      ) : (
        <NewTaskForm employees={employees} />
      )}
    </main>
  );
}
