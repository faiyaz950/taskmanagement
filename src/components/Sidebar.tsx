import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";
import Logo from "@/components/Logo";
import SidebarNav from "@/components/SidebarNav";

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";
  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex md:w-[76px] lg:w-60">
      <div className="flex h-16 items-center justify-center border-b border-[var(--border)] px-4 lg:justify-start">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size={28} className="logo-mark shrink-0" />
          <span className="hidden text-[15px] font-semibold tracking-tight lg:inline">
            Sabeel <span className="text-[var(--primary)]">TaskFlow</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <p className="mb-2 hidden px-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-2)] lg:block">
          Menu
        </p>
        <SidebarNav isAdmin={isAdmin} />
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center justify-center gap-2.5 lg:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="avatar-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
              title={session.user.name ?? undefined}
            >
              {initials}
            </span>
            <div className="hidden min-w-0 leading-tight lg:block">
              <p className="truncate text-sm font-medium">{session.user.name}</p>
              <p className="text-[11px] text-[var(--muted)]">{isAdmin ? "Admin" : "Employee"}</p>
            </div>
          </div>
          <form action={logoutAction} className="hidden lg:block">
            <button type="submit" className="btn btn-ghost !px-2" aria-label="Logout" title="Logout">
              <LogOut size={16} />
            </button>
          </form>
        </div>
        <form action={logoutAction} className="mt-2 lg:hidden">
          <button type="submit" className="btn btn-ghost w-full !px-2" aria-label="Logout" title="Logout">
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
