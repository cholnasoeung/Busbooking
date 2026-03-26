import Link from "next/link";

import { getAdminUserManagementData } from "@/lib/admin-user-management";

export default async function AdminUsersPage() {
  const data = await getAdminUserManagementData();
  return (
    <main className="mx-auto space-y-8 w-full max-w-[90rem] px-2 lg:px-4">
      <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow-[0_20px_70px_rgba(28,25,23,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
          Admin Console
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
          User management dashboard
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Pick a workspace to manage passengers, bus operators, or internal
          staff. Each section now has its own page.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_18px_40px_rgba(28,25,23,0.06)]"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              {stat.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        <Link
          href="/admin/users/passengers"
          className="rounded-[28px] border border-stone-200 bg-stone-950 p-6 text-sm font-semibold text-white transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
            Manage passengers
          </p>
          <p className="mt-2 text-xl">Passenger workspace</p>
          <p className="mt-3 text-xs text-stone-300">
            View bookings, suspend accounts, and add new passengers.
          </p>
        </Link>
        <Link
          href="/admin/users/operators"
          className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-950 transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Manage bus operators
          </p>
          <p className="mt-2 text-xl">Operator workspace</p>
          <p className="mt-3 text-xs text-stone-500">
            Approve companies, review documents, and suspend operators.
          </p>
        </Link>
        <Link
          href="/admin/users/staff"
          className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-950 transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Manage staff & admins
          </p>
          <p className="mt-2 text-xl">Staff workspace</p>
          <p className="mt-3 text-xs text-stone-500">
            Grant or revoke internal access and create new admins.
          </p>
        </Link>
        <Link
          href="/admin/operators/approval"
          className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-950 transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Operator approval
          </p>
          <p className="mt-2 text-xl">Approval workspace</p>
          <p className="mt-3 text-xs text-stone-500">
            Review documents and compliance notes before approving.
          </p>
        </Link>
      </section>
    </main>
  );
}
