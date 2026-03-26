import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3eee6_0%,#faf8f4_100%)] px-6 py-16 text-stone-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,#f7d9a8,transparent_26%),linear-gradient(135deg,#1f1b16_0%,#33271c_50%,#8d5625_100%)] px-8 py-10 text-stone-50 shadow-[0_24px_80px_rgba(28,25,23,0.16)]">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
            Bus Booking Platform
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Start with the admin workspace and control your platform users.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200">
            Your first build slice is ready as an admin user-management
            foundation for passengers, operators, and internal staff.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/admin/users"
              className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
            >
              Open Admin User Management
            </Link>
            <span className="rounded-full border border-white/20 px-6 py-3 text-sm text-stone-200">
              Next step: real CRUD + auth
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
