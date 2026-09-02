"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListPlus, Users, BarChart3 } from "lucide-react";

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/tasks/new", label: "New Task", icon: ListPlus, show: isAdmin },
    { href: "/dashboard/employees", label: "Employees", icon: Users, show: isAdmin },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3, show: isAdmin },
  ];

  return (
    <>
      {links
        .filter((l) => l.show)
        .map((link) => {
          const isActive =
            link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={`link-nav ${isActive ? "active" : ""}`}>
              <Icon size={16} strokeWidth={2} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
    </>
  );
}
