import { auth } from "@/auth";
import { getDb } from "@/lib/prisma";
import {
  formatDate,
  formatDateInput,
  reportPeriodFilter,
  resolveReportRange,
  STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/lib/utils";

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const { range } = resolveReportRange({
    range: url.searchParams.get("range") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  const tasks = await getDb().task.findMany({
    where: reportPeriodFilter(range),
    include: {
      assignedTo: { select: { name: true, email: true } },
      assignedBy: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const header = [
    "Task",
    "Assigned To",
    "Email",
    "Assigned By",
    "Status",
    "Priority",
    "Days Allowed",
    "Started On",
    "Deadline",
    "Completed On",
  ];

  const rows = tasks.map((task) =>
    [
      task.title,
      task.assignedTo.name,
      task.assignedTo.email,
      task.assignedBy.name,
      STATUS_LABEL[task.status] ?? task.status,
      PRIORITY_LABEL[task.priority] ?? task.priority,
      task.estimatedDays,
      task.startedAt ? formatDate(task.startedAt) : "",
      task.dueDate ? formatDate(task.dueDate) : "",
      task.completedAt ? formatDate(task.completedAt) : "",
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `taskflow-report-${formatDateInput(range.from)}-to-${formatDateInput(range.to)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
