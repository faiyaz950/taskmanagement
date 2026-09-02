"use client";

import { useActionState } from "react";
import { Save, Send } from "lucide-react";
import { createTaskAction, updateTaskAction } from "@/lib/actions";

type TaskFormValues = {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  priority: string;
  estimatedDays: number;
  /** Empty until the employee starts the task. */
  dueDate: string;
  hasStarted: boolean;
};

export default function TaskForm({
  employees,
  task,
}: {
  employees: { id: string; name: string }[];
  task?: TaskFormValues;
}) {
  const isEdit = Boolean(task);
  const [error, formAction, isPending] = useActionState(
    isEdit ? updateTaskAction : createTaskAction,
    undefined,
  );

  return (
    <form action={formAction} className="card animate-fade-up space-y-5 p-6 sm:p-7">
      {isEdit && <input type="hidden" name="taskId" value={task!.id} />}

      <div>
        <label htmlFor="title" className="field-label">
          Task title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={task?.title}
          className="input"
          placeholder="e.g. Update the homepage design"
        />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Details
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={task?.description}
          className="input resize-none"
          placeholder="Describe what needs to be done and how"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="assignedToId" className="field-label">
            Assign to
          </label>
          <select
            id="assignedToId"
            name="assignedToId"
            required
            defaultValue={task?.assignedToId ?? ""}
            className="input"
          >
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="field-label">
            Priority
          </label>
          <select id="priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"} className="input">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimatedDays" className="field-label">
            Days to complete
          </label>
          <input
            id="estimatedDays"
            name="estimatedDays"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={task?.estimatedDays}
            className="input"
            placeholder="e.g. 2"
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            {task?.hasStarted
              ? "Changing this recalculates the deadline from the start date."
              : "The deadline is set automatically when the employee starts the task."}
          </p>
        </div>

        {task?.hasStarted && (
          <div>
            <label htmlFor="dueDate" className="field-label">
              Deadline
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={task.dueDate}
              className="input"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Override the calculated deadline if you need to extend it.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="badge w-full justify-start" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isEdit ? <Save size={15} /> : <Send size={15} />}
        {isPending ? (isEdit ? "Saving..." : "Assigning...") : isEdit ? "Save Changes" : "Assign Task"}
      </button>
    </form>
  );
}
