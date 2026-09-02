"use client";

import { useTransition } from "react";
import { Circle, Play, CheckCircle2 } from "lucide-react";
import { updateTaskStatusAction } from "@/lib/actions";
import { deadlineFromStart, durationLabel, formatDate } from "@/lib/utils";

const STATUSES = [
  { value: "PENDING", label: "Pending", icon: Circle },
  { value: "IN_PROGRESS", label: "Start", startedLabel: "In Progress", icon: Play },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle2 },
] as const;

export default function StatusControl({
  taskId,
  currentStatus,
  estimatedDays,
  hasStarted,
}: {
  taskId: string;
  currentStatus: string;
  estimatedDays: number;
  hasStarted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const previewDeadline = deadlineFromStart(new Date(), estimatedDays);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(({ value, label, icon: Icon, ...rest }) => {
          const isActive = value === currentStatus;
          const text =
            value === "IN_PROGRESS" && hasStarted ? (rest as { startedLabel: string }).startedLabel : label;
          return (
            <button
              key={value}
              type="button"
              disabled={isPending || isActive}
              onClick={() => startTransition(() => updateTaskStatusAction(taskId, value))}
              className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
            >
              <Icon size={14} />
              {text}
            </button>
          );
        })}
      </div>

      {!hasStarted && currentStatus !== "COMPLETED" && (
        <p className="mt-2.5 text-xs text-[var(--muted)]">
          {durationLabel(estimatedDays)} allowed. Starting today makes it due{" "}
          <span className="font-medium text-[var(--foreground)]">{formatDate(previewDeadline)}</span>.
        </p>
      )}
    </div>
  );
}
