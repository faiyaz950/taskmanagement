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
        Naya Employee Add Karein
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="name" className="field-label">
            Naam
          </label>
          <input id="name" name="name" required className="input" placeholder="Employee ka naam" />
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
            placeholder="Kam se kam 6 characters"
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
        {isPending ? "Add ho raha hai..." : "Employee Add Karein"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        Yeh login details employee ko de dein taaki wo login karke apne tasks dekh sakein.
      </p>
    </form>
  );
}
