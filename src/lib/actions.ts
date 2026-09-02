"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { getDb } from "@/lib/prisma";
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
  const dueDate = formData.get("dueDate") as string;
  const priority = formData.get("priority") as string;

  if (!title || !description || !assignedToId || !dueDate || !priority) {
    return "Please fill in all fields.";
  }
  if (Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    return "Please enter a valid estimate in days.";
  }

  const session = await auth();

  await getDb().task.create({
    data: {
      title,
      description,
      assignedToId,
      assignedById: session!.user.id,
      estimatedDays,
      dueDate: new Date(dueDate),
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
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

  await db.$transaction([
    db.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    }),
    db.taskUpdate.create({
      data: {
        taskId,
        authorId: session.user.id,
        message: `Status updated to "${status.replace("_", " ")}".`,
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
