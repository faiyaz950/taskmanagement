"use client";

import { useActionState, useState, useTransition } from "react";
import { KeyRound, Trash2, Check } from "lucide-react";
import { deleteEmployeeAction, resetEmployeePasswordAction } from "@/lib/actions";

export default function EmployeeActions({
  employeeId,
  taskCount,
}: {
  employeeId: string;
  taskCount: number;
}) {
  const [panel, setPanel] = useState<"none" | "password" | "delete">("none");
  const [state, formAction, isSaving] = useActionState(resetEmployeePasswordAction, undefined);
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string>();

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPanel(panel === "password" ? "none" : "password")}
          className="btn btn-secondary !py-1.5 !text-xs"
        >
          <KeyRound size={13} />
          Reset password
        </button>
        <button
          type="button"
          onClick={() => {
            setDeleteError(undefined);
            setPanel(panel === "delete" ? "none" : "delete");
          }}
          className="btn btn-secondary !py-1.5 !text-xs"
          style={{ color: "var(--danger)" }}
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>

      {panel === "password" && (
        <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2">
          <input type="hidden" name="employeeId" value={employeeId} />
          <input
            name="password"
            type="text"
            required
            minLength={6}
            className="input !w-auto !py-1.5 !text-xs"
            placeholder="New password (min 6 chars)"
          />
          <button type="submit" disabled={isSaving} className="btn btn-primary !py-1.5 !text-xs">
            {isSaving ? "Saving..." : "Save"}
          </button>
          {state?.error && (
            <span className="text-xs" style={{ color: "var(--danger)" }}>
              {state.error}
            </span>
          )}
          {state?.ok && (
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--success)" }}>
              <Check size={13} /> Password updated
            </span>
          )}
        </form>
      )}

      {panel === "delete" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {taskCount > 0 ? (
            <span className="text-xs text-[var(--muted)]">
              This employee still has {taskCount} task{taskCount === 1 ? "" : "s"}. Delete or reassign them first.
            </span>
          ) : (
            <>
              <span className="text-xs text-[var(--muted)]">Remove this employee permanently?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  startDelete(async () => {
                    try {
                      await deleteEmployeeAction(employeeId);
                    } catch (err) {
                      setDeleteError(err instanceof Error ? err.message : "Could not remove employee.");
                    }
                  })
                }
                className="btn !py-1.5 !text-xs"
                style={{ background: "var(--danger)", color: "#fff" }}
              >
                {isDeleting ? "Removing..." : "Yes, remove"}
              </button>
              <button
                type="button"
                onClick={() => setPanel("none")}
                className="btn btn-secondary !py-1.5 !text-xs"
              >
                Cancel
              </button>
            </>
          )}
          {deleteError && (
            <span className="text-xs" style={{ color: "var(--danger)" }}>
              {deleteError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
