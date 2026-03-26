"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  id: string;
  href: string;
  label: string;
  description: string;
  enabled: boolean;
};

const navItems: NavItem[] = [
  {
    id: "user-management",
    href: "/admin/users",
    label: "User Management",
    description: "Open",
    enabled: true,
  },
  {
    id: "operator-approval",
    href: "/admin/operators/approval",
    label: "Operator Approval",
    description: "Open",
    enabled: true,
  },
  {
    id: "route-city",
    href: "/admin/route-city",
    label: "Route & City",
    description: "Open",
    enabled: true,
  },
  {
    id: "commission-finance",
    href: "/admin/finance",
    label: "Commission & Finance",
    description: "Open",
    enabled: true,
  },
  {
    id: "content-management",
    href: "/admin/content",
    label: "Content Management",
    description: "Open",
    enabled: true,
  },
  {
    id: "support-disputes",
    href: "/admin/support",
    label: "Support & Disputes",
    description: "Open",
    enabled: true,
  },
  {
    id: "analytics",
    href: "/admin/analytics",
    label: "Analytics",
    description: "Open",
    enabled: true,
  },
];

export function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-2">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-amber-300 text-stone-950"
                : "bg-stone-900 text-stone-200 hover:bg-stone-800"
            }`}
          >
            <span>{item.label}</span>
            <span>{item.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
