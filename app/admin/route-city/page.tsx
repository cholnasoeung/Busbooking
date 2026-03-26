import Link from "next/link";

import { RouteCityActions } from "../components/route-city-actions";

export default function RouteCityLanding() {
  return (
    <main className="space-y-8">
      <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Route & City management
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Plan city coverage</h1>
        <p className="text-sm text-stone-500">
          Define cities, stops, standardized names, and service zones before operators publish routes.
        </p>
        <div className="mt-6">
          <RouteCityActions />
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/route-city/cities"
          className="rounded-[28px] border border-stone-200 bg-stone-950 p-6 text-sm font-semibold text-white transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
            Cities
          </p>
          <p className="mt-2 text-xl">Add / edit cities</p>
          <p className="mt-3 text-xs text-stone-300">
            Normalize names and keep city coverage accurate for routes.
          </p>
        </Link>
        <Link
          href="/admin/route-city/stops"
          className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-950 transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Stops
          </p>
          <p className="mt-2 text-xl">Manage stops</p>
          <p className="mt-3 text-xs text-stone-500">
            Keep boarding and dropping points grouped per city.
          </p>
        </Link>
        <Link
          href="/admin/route-city/zones"
          className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm font-semibold text-stone-950 transition hover:border-amber-300"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
            Service zones
          </p>
          <p className="mt-2 text-xl">Manage service zones</p>
          <p className="mt-3 text-xs text-stone-500">
            Assign stops to zones and describe geographic rules.
          </p>
        </Link>
      </section>
    </main>
  );
}
