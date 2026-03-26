"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  description: string;
  enabled: boolean;
};

const navItems: NavItem[] = [
  { href: "/admin/users", label: "User Management", description: "Open", enabled: true },
  { href: "/admin/operators/approval", label: "Operator Approval", description: "Open", enabled: true },
  { href: "/admin/route-city", label: "Route & City", description: "Open", enabled: true },
  { href: "/admin/finance", label: "Commission & Finance", description: "Open", enabled: true },
  { href: "#", label: "Commission & Finance", description: "Soon", enabled: false },
  { href: "#", label: "Content", description: "Soon", enabled: false },
  { href: "#", label: "Support & Disputes", description: "Soon", enabled: false },
  { href: "#", label: "Analytics", description: "Soon", enabled: false },
];

export function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-2">
      {navItems.map((item) => {
        const active = item.enabled && pathname?.startsWith(item.href);

        return item.enabled ? (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-amber-300 text-stone-950"
                : "bg-stone-900 text-stone-200 hover:bg-stone-800"
            }`}
          >
            <span>{item.label}</span>
            <span>{active ? "Open" : "Open"}</span>
          </Link>
        ) : (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-400"
          >
            <span>{item.label}</span>
            <span>{item.description}</span>
          </div>
        );
      })}
    </nav>
  );
}
