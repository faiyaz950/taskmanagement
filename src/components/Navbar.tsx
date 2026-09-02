import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";
import NavLinks from "@/components/NavLinks";
import Logo from "@/components/Logo";

export default async function Navbar() {
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
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <Logo size={30} className="logo-mark" />
          <span className="text-[15px] font-semibold tracking-tight">
            Sabeel <span className="text-[var(--primary)]">TaskFlow</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLinks isAdmin={isAdmin} />
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              className="avatar-ring flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
            >
              {initials}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-[11px] text-[var(--muted)]">{isAdmin ? "Admin" : "Employee"}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost !px-2.5" aria-label="Logout">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
