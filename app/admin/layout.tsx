import Link from "next/link";

const navItems = [
  { href: "/admin/users", label: "User Management", enabled: true },
  { href: "#", label: "Operator Approval", enabled: false },
  { href: "#", label: "Route & City", enabled: false },
  { href: "#", label: "Commission & Finance", enabled: false },
  { href: "#", label: "Content", enabled: false },
  { href: "#", label: "Support & Disputes", enabled: false },
  { href: "#", label: "Analytics", enabled: false },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f0e8_0%,#f4efe8_40%,#f9f7f2_100%)] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="w-full rounded-[28px] border border-stone-200 bg-stone-950 p-6 text-stone-100 shadow-[0_30px_80px_rgba(28,25,23,0.16)] lg:w-72">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
              Platform Owner
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Admin Console</h1>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Control operators, passengers, and internal staff from one
              command center.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) =>
              item.enabled ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl bg-amber-300 px-4 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200"
                >
                  <span>{item.label}</span>
                  <span>Open</span>
                </Link>
              ) : (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-400"
                >
                  <span>{item.label}</span>
                  <span>Soon</span>
                </div>
              )
            )}
          </nav>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
