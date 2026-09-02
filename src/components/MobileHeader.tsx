import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";
import Logo from "@/components/Logo";
import MobileNav from "@/components/MobileNav";

/** Top bar + bottom tab bar, shown only below the sidebar breakpoint. */
export default async function MobileHeader() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/90 px-4 backdrop-blur-lg md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-[15px] font-semibold tracking-tight">
            Sabeel <span className="text-[var(--primary)]">TaskFlow</span>
          </span>
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-ghost !px-2" aria-label="Logout">
            <LogOut size={16} />
          </button>
        </form>
      </header>

      <MobileNav isAdmin={isAdmin} />
    </>
  );
}
