import { LayoutDashboard, ListPlus, Users, BarChart3, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks/new", label: "New Task", icon: ListPlus, adminOnly: true },
  { href: "/dashboard/employees", label: "Employees", icon: Users, adminOnly: true },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, adminOnly: true },
];

export function navItemsFor(isAdmin: boolean) {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}

/** The dashboard link only matches exactly; the rest match their sub-routes. */
export function isNavItemActive(href: string, pathname: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
