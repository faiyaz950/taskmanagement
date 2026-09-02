"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { createEmployeeAction } from "@/lib/actions";

export default function NewEmployeeForm() {
  const [error, formAction, isPending] = useActionState(createEmployeeAction, undefined);

  return (
    <form action={formAction} className="card space-y-4 p-6">
      <h2 className="flex items-center gap-2 font-medium">
        <UserPlus size={16} className="text-[var(--primary)]" />
        Add New Employee
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input id="name" name="name" required className="input" placeholder="Employee's name" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="employee@company.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={6}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>
      </div>

      {error && (
        <p className="badge w-full justify-start" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary">
        <UserPlus size={15} />
        {isPending ? "Adding..." : "Add Employee"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        Share these login details with the employee so they can sign in and view their tasks.
      </p>
    </form>
  );
}
