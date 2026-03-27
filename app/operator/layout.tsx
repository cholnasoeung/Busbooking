import Link from "next/link";

export default function OperatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      <div className="flex min-h-screen w-full flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_60px_rgba(15,23,42,0.6)] lg:w-72 lg:sticky lg:top-4 lg:self-start">
          <h2 className="text-xs uppercase tracking-[0.4em] text-amber-300">Operator HQ</h2>
          <p className="mt-4 text-lg font-semibold leading-snug">
            Mekong Express command center.
          </p>
          <nav className="mt-6 flex flex-col gap-3 text-sm text-stone-100">
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/login">
              Login
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/routes">
              Route management
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/buses">
              Bus management
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/pricing">
              Pricing management
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/inventory">
              Inventory & seats
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-2 transition hover:border-amber-300" href="/operator/bookings">
              Booking operations
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
