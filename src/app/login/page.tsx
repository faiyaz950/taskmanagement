"use client";

import { useActionState } from "react";
import { CheckCircle2, ListChecks, Users2 } from "lucide-react";
import { loginAction } from "@/lib/actions";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ background: "linear-gradient(160deg, var(--primary), var(--accent) 120%)" }}
      >
        <div
          className="animate-blob pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-2xl"
          style={{ background: "rgba(255,255,255,0.10)" }}
        />
        <div
          className="animate-blob-slow pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full blur-2xl"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <Logo size={34} mono />
          <span className="text-lg font-semibold tracking-tight">Sabeel TaskFlow</span>
        </div>

        <div className="relative max-w-sm">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Manage your team&apos;s tasks, all in one place.
          </h1>
          <p className="mt-3 text-sm text-white/80">
            Assign work, set deadlines, and track real-time progress — all from one simple dashboard.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-white/80" /> Deadline and time-estimate tracking
            </li>
            <li className="flex items-center gap-2.5">
              <Users2 size={18} className="shrink-0 text-white/80" /> A personal login for every employee
            </li>
            <li className="flex items-center gap-2.5">
              <ListChecks size={18} className="shrink-0 text-white/80" /> Progress updates and history
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} Sabeel TaskFlow</p>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:text-left">
            <Logo size={40} className="mb-4 inline-flex lg:hidden" />
            <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Sign in to your account</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="badge w-full justify-start" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={isPending} className="btn btn-primary w-full">
              {isPending ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)] lg:text-left">
            Don&apos;t have an account? Ask your admin to create one for you.
          </p>
        </div>
      </div>
    </main>
  );
}
