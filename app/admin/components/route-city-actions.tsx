"use client";

import Link from "next/link";

export function RouteCityActions() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <Link
        href="/admin/route-city/cities"
        className="rounded-full border border-stone-200 px-4 py-2 font-semibold text-stone-900 hover:border-amber-300"
      >
        Add/edit cities
      </Link>
      <Link
        href="/admin/route-city/stops"
        className="rounded-full border border-stone-200 px-4 py-2 font-semibold text-stone-900 hover:border-amber-300"
      >
        Add/edit stops
      </Link>
      <Link
        href="/admin/route-city/zones"
        className="rounded-full border border-stone-200 px-4 py-2 font-semibold text-stone-900 hover:border-amber-300"
      >
        Manage zones
      </Link>
    </div>
  );
}
