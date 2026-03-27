import type { OperatorRoute } from "@/lib/operator-route-management";

import { addBoardingPointAction, addDropPointAction } from "../actions";

type StopManagementCardProps = {
  routes: OperatorRoute[];
};

export function StopManagementCard({ routes }: StopManagementCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
            Step 2
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Manage boarding and drop points</h2>
          <p className="mt-2 text-sm text-stone-400">
            Pick one saved route and add the real pickup or arrival points that customers will see.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          Stops
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <form
          action={addBoardingPointAction}
          method="post"
          className="rounded-3xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
        >
          <p className="text-sm font-semibold text-white">Add boarding point</p>
          <div className="mt-3 grid gap-3">
            <select
              name="routeId"
              required
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            >
              <option value="">Select route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName}
                </option>
              ))}
            </select>
            <input
              name="name"
              required
              placeholder="Boarding point name"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
            <input
              name="location"
              required
              placeholder="Location details"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-400 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-200"
            >
              Save boarding point
            </button>
          </div>
        </form>

        <form
          action={addDropPointAction}
          method="post"
          className="rounded-3xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
        >
          <p className="text-sm font-semibold text-white">Add drop point</p>
          <div className="mt-3 grid gap-3">
            <select
              name="routeId"
              required
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            >
              <option value="">Select route</option>
              {routes.map((route) => (
                <option key={`drop-${route.id}`} value={route.id}>
                  {route.routeName}
                </option>
              ))}
            </select>
            <input
              name="name"
              required
              placeholder="Drop point name"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
            <input
              name="location"
              required
              placeholder="Location details"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-400 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-200"
            >
              Save drop point
            </button>
          </div>
        </form>
      </div>

      <div className="mt-5 grid gap-3">
        {routes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
            Save a route first, then stop management will be available here.
          </div>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="rounded-2xl border border-white/10 bg-stone-950/40 p-4 text-xs text-stone-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{route.routeName}</p>
                  <p className="text-[0.7rem] text-stone-400">
                    {route.fromCity} to {route.toCity}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[0.65rem]">
                  <span className="rounded-full border border-white/10 px-2 py-1">
                    {route.boardingPoints.length} boarding
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-1">
                    {route.dropPoints.length} drop
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
