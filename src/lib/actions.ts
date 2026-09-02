"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { getDb } from "@/lib/prisma";
import { deadlineFromStart, formatDate, formatDateInput } from "@/lib/utils";
import { AuthError } from "next-auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Only an admin can perform this action.");
  }
  return session;
}

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Incorrect email or password.";
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function createEmployeeAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return "Please fill in all fields.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  const db = getDb();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return "An account with this email already exists.";
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, password: hashed, role: "EMPLOYEE" },
  });

  revalidatePath("/dashboard/employees");
  redirect("/dashboard/employees");
}

export async function createTaskAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const assignedToId = formData.get("assignedToId") as string;
  const estimatedDays = parseFloat(formData.get("estimatedDays") as string);
  const priority = formData.get("priority") as string;

  if (!title || !description || !assignedToId || !priority) {
    return "Please fill in all fields.";
  }
  if (Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    return "Please enter how many days are allowed.";
  }

  const session = await auth();

  // No deadline yet — it is derived when the employee starts the task.
  await getDb().task.create({
    data: {
      title,
      description,
      assignedToId,
      assignedById: session!.user.id,
      estimatedDays,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateTaskAction(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const taskId = formData.get("taskId") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const assignedToId = formData.get("assignedToId") as string;
  const estimatedDays = parseFloat(formData.get("estimatedDays") as string);
  const dueDate = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;

  if (!taskId) return "Task not found.";
  if (!title || !description || !assignedToId || !priority) {
    return "Please fill in all fields.";
  }
  if (Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    return "Please enter how many days are allowed.";
  }

  const db = getDb();
  const existing = await db.task.findUnique({ where: { id: taskId } });
  if (!existing) return "Task not found.";

  // A started task keeps a deadline. The deadline field arrives pre-filled, so
  // only treat it as an override when the admin actually changed it; otherwise
  // recompute from the start date and the (possibly new) duration.
  let nextDueDate = existing.dueDate;
  if (existing.startedAt) {
    const deadlineEdited =
      dueDate && (!existing.dueDate || formatDateInput(existing.dueDate) !== dueDate);

    nextDueDate = deadlineEdited
      ? new Date(`${dueDate}T00:00:00.000Z`)
      : deadlineFromStart(existing.startedAt, estimatedDays);
  }

  await db.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      assignedToId,
      estimatedDays,
      dueDate: nextDueDate,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
    },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  redirect(`/tasks/${taskId}`);
}

export async function deleteTaskAction(taskId: string) {
  await requireAdmin();

  const db = getDb();
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found.");

  await db.task.delete({ where: { id: taskId } });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export type ResetPasswordState = { error?: string; ok?: boolean } | undefined;

export async function resetEmployeePasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireAdmin();

  const employeeId = formData.get("employeeId") as string;
  const password = formData.get("password") as string;

  if (!employeeId || !password) return { error: "Please enter a new password." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const db = getDb();
  const employee = await db.user.findUnique({ where: { id: employeeId } });
  if (!employee || employee.role !== "EMPLOYEE") return { error: "Employee not found." };

  const hashed = await bcrypt.hash(password, 10);
  await db.user.update({ where: { id: employeeId }, data: { password: hashed } });

  revalidatePath("/dashboard/employees");
  return { ok: true };
}

export async function deleteEmployeeAction(employeeId: string) {
  await requireAdmin();

  const db = getDb();
  const employee = await db.user.findUnique({
    where: { id: employeeId },
    include: { _count: { select: { tasksAssignedToMe: true } } },
  });

  if (!employee || employee.role !== "EMPLOYEE") throw new Error("Employee not found.");
  if (employee._count.tasksAssignedToMe > 0) {
    throw new Error("This employee still has tasks. Delete or reassign their tasks first.");
  }

  await db.taskUpdate.deleteMany({ where: { authorId: employeeId } });
  await db.user.delete({ where: { id: employeeId } });

  revalidatePath("/dashboard/employees");
}

export async function updateTaskStatusAction(taskId: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in.");

  const db = getDb();
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found.");

  const isOwner = task.assignedToId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new Error("You don't have permission to update this task.");

  // Starting the task is what sets the clock: the deadline becomes the start
  // day plus the duration the admin allotted. Moving back to Pending clears it
  // so a later start gets a fresh deadline.
  const now = new Date();
  const timing: {
    startedAt?: Date | null;
    dueDate?: Date | null;
    completedAt: Date | null;
  } = { completedAt: status === "COMPLETED" ? now : null };

  if (status === "PENDING") {
    timing.startedAt = null;
    timing.dueDate = null;
  } else if (!task.startedAt) {
    timing.startedAt = now;
    timing.dueDate = deadlineFromStart(now, task.estimatedDays);
  }

  const note =
    timing.dueDate && status === "IN_PROGRESS"
      ? `Started the task. Due by ${formatDate(timing.dueDate)}.`
      : `Status updated to "${status.replace("_", " ")}".`;

  await db.$transaction([
    db.task.update({
      where: { id: taskId },
      data: { status, ...timing },
    }),
    db.taskUpdate.create({
      data: {
        taskId,
        authorId: session.user.id,
        message: note,
      },
    }),
  ]);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}

export async function addTaskUpdateAction(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in.");

  const taskId = formData.get("taskId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!message) return "Please write an update.";

  const db = getDb();
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return "Task not found.";

  const isOwner = task.assignedToId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return "You don't have permission to update this task.";

  await db.taskUpdate.create({
    data: { taskId, authorId: session.user.id, message },
  });

  revalidatePath(`/tasks/${taskId}`);
}
