"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sirf admin hi yeh action kar sakta hai.");
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
      return "Email ya password galat hai.";
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
    return "Sabhi fields bharna zaroori hai.";
  }
  if (password.length < 6) {
    return "Password kam se kam 6 characters ka hona chahiye.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "Is email se pehle se account bana hua hai.";
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
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
    return "Sabhi fields bharna zaroori hai.";
  }
  if (Number.isNaN(estimatedDays) || estimatedDays <= 0) {
    return "Estimated din sahi se bharein.";
  }

  const session = await auth();

  await prisma.task.create({
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
  if (!session?.user) throw new Error("Login zaroori hai.");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task nahi mila.");

  const isOwner = task.assignedToId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new Error("Aapko yeh task update karne ki permission nahi hai.");

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    }),
    prisma.taskUpdate.create({
      data: {
        taskId,
        authorId: session.user.id,
        message: `Status "${status.replace("_", " ")}" me update kiya.`,
      },
    }),
  ]);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}

export async function addTaskUpdateAction(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Login zaroori hai.");

  const taskId = formData.get("taskId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!message) return "Update likhna zaroori hai.";

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return "Task nahi mila.";

  const isOwner = task.assignedToId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return "Aapko yeh task update karne ki permission nahi hai.";

  await prisma.taskUpdate.create({
    data: { taskId, authorId: session.user.id, message },
  });

  revalidatePath(`/tasks/${taskId}`);
}
