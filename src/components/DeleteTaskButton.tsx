"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/lib/actions";

export default function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn btn-secondary"
        style={{ color: "var(--danger)" }}
      >
        <Trash2 size={15} />
        Delete Task
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--muted)]">Are you sure?</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => deleteTaskAction(taskId))}
        className="btn"
        style={{ background: "var(--danger)", color: "#fff" }}
      >
        <Trash2 size={15} />
        {isPending ? "Deleting..." : "Yes, delete"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="btn btn-secondary">
        Cancel
      </button>
    </div>
  );
}
