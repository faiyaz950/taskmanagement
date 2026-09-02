import Link from "next/link";
import { Search, X } from "lucide-react";

export type TaskFilterValues = {
  q?: string;
  status?: string;
  priority?: string;
  assignee?: string;
};

export default function TaskFilters({
  values,
  employees,
}: {
  values: TaskFilterValues;
  employees?: { id: string; name: string }[];
}) {
  const hasFilters = Boolean(values.q || values.status || values.priority || values.assignee);

  return (
    <form action="/dashboard" className="card mb-5 flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="q" className="field-label">
          Search
        </label>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]"
          />
          <input
            id="q"
            name="q"
            defaultValue={values.q ?? ""}
            className="input !pl-9"
            placeholder="Search by title or details"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="field-label">
          Status
        </label>
        <select id="status" name="status" defaultValue={values.status ?? ""} className="input !w-auto">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="field-label">
          Priority
        </label>
        <select id="priority" name="priority" defaultValue={values.priority ?? ""} className="input !w-auto">
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {employees && employees.length > 0 && (
        <div>
          <label htmlFor="assignee" className="field-label">
            Employee
          </label>
          <select id="assignee" name="assignee" defaultValue={values.assignee ?? ""} className="input !w-auto">
            <option value="">All employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        {hasFilters && (
          <Link href="/dashboard" className="btn btn-ghost">
            <X size={14} />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
