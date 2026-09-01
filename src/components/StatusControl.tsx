"use client";

import { useTransition } from "react";
import { Circle, Loader, CheckCircle2 } from "lucide-react";
import { updateTaskStatusAction } from "@/lib/actions";
import { STATUS_LABEL } from "@/lib/utils";

const STATUSES = [
  { value: "PENDING", icon: Circle },
  { value: "IN_PROGRESS", icon: Loader },
  { value: "COMPLETED", icon: CheckCircle2 },
] as const;

export default function StatusControl({ taskId, currentStatus }: { taskId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(({ value, icon: Icon }) => {
        const isActive = value === currentStatus;
        return (
          <button
            key={value}
            type="button"
            disabled={isPending || isActive}
            onClick={() => startTransition(() => updateTaskStatusAction(taskId, value))}
            className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
          >
            <Icon size={14} />
            {STATUS_LABEL[value]}
          </button>
        );
      })}
    </div>
  );
}
