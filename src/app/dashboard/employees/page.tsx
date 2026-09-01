import { redirect } from "next/navigation";
import { Users2 } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import NewEmployeeForm from "@/components/NewEmployeeForm";
import TaskList from "@/components/TaskList";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const employees = await getDb().user.findMany({
    where: { role: "EMPLOYEE" },
    include: {
      tasksAssignedToMe: {
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Employees</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Team members manage karein jinhe aap task assign kar sakte hain.
      </p>

      <div className="mb-9">
        <NewEmployeeForm />
      </div>

      {employees.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 border-dashed p-10 text-center">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "var(--surface)", color: "var(--muted-2)" }}
          >
            <Users2 size={20} strokeWidth={1.75} />
          </span>
          <p className="text-sm text-[var(--muted)]">Abhi koi employee add nahi hua hai.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {employees.map((emp) => (
            <div key={emp.id}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                  >
                    {initials(emp.name)}
                  </span>
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-xs text-[var(--muted)]">{emp.email}</p>
                  </div>
                </div>
                <span className="badge" style={{ background: "var(--surface)", color: "var(--muted)" }}>
                  {emp.tasksAssignedToMe.length} task{emp.tasksAssignedToMe.length === 1 ? "" : "s"}
                </span>
              </div>
              <TaskList tasks={emp.tasksAssignedToMe} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
