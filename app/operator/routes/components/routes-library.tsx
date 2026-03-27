import type { OperatorRoute } from "@/lib/operator-route-management";

import { deleteRouteAction } from "../actions";

type RoutesLibraryProps = {
  routes: OperatorRoute[];
};

export function RoutesLibrary({ routes }: RoutesLibraryProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Current routes</h2>
          <p className="mt-1 text-sm text-stone-400">
            Review each route before adding more stops or schedules.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          {routes.length} total
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {routes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
            No routes saved yet.
          </div>
        ) : (
          routes.map((route) => (
              <article
                key={route.id}
                className="rounded-3xl border border-white/10 bg-stone-900/60 p-4 text-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{route.routeName}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {route.fromCity} to {route.toCity}
                    </p>
                  </div>
                <div className="flex flex-wrap gap-2 text-[0.65rem]">
                  <span className="rounded-full border border-white/10 px-2 py-1 text-stone-300">
                    {route.stops.length} planned stops
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-stone-300">
                    {route.boardingPoints.length} boarding
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-stone-300">
                    {route.dropPoints.length} drop
                  </span>
                  <span
                    className={`rounded-full border px-2 py-1 ${
                      route.active
                        ? "border-emerald-400/40 text-emerald-300"
                        : "border-white/10 text-stone-400"
                    }`}
                  >
                    {route.active ? "Active" : "Paused"}
                  </span>
                </div>
              </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem]">
                  {route.stops.length > 0 ? (
                    route.stops.map((stop) => (
                      <span
                        key={`${route.id}-${stop}`}
                        className="rounded-full border border-white/10 bg-stone-950/60 px-2 py-1 text-stone-300"
                      >
                        {stop}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-500">No planned stops yet.</span>
                  )}
                </div>
                <form
                  action={deleteRouteAction}
                  method="post"
                  className="mt-4 text-xs"
                >
                  <input type="hidden" name="routeId" value={route.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/70 px-3 py-1 text-[0.65rem] font-semibold text-red-200 hover:border-red-400/100"
                  >
                    Delete route
                  </button>
                </form>
              </article>
            ))
          )}
      </div>
    </section>
  );
}
