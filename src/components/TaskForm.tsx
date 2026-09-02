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
  dueDate: string;
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
            Estimated days
          </label>
          <input
            id="estimatedDays"
            name="estimatedDays"
            type="number"
            min="0.5"
            step="0.5"
            required
            defaultValue={task?.estimatedDays}
            className="input"
            placeholder="e.g. 3"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="field-label">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={task?.dueDate}
            className="input"
          />
        </div>
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
