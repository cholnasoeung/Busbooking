import type { OperatorRoute } from "@/lib/operator-route-management";

import { createScheduleAction } from "../actions";

type ScheduleBuilderCardProps = {
  routes: OperatorRoute[];
};

export function ScheduleBuilderCard({ routes }: ScheduleBuilderCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
            Step 3
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Publish recurring trip schedule</h2>
          <p className="mt-2 text-sm text-stone-400">
            After the route and stops are ready, schedule the departure pattern customers can book.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          Schedules
        </span>
      </div>

      <form action={createScheduleAction} method="post" className="mt-5 grid gap-4 text-xs">
        <label className="grid gap-2 text-stone-300">
          Route
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
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-stone-300">
            Departure time
            <input
              name="departureTime"
              type="time"
              required
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
          <label className="grid gap-2 text-stone-300">
            Vehicle
            <input
              name="vehicle"
              required
              placeholder="Example: Express 12"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-stone-300">
            Recurrence
            <select
              name="recurrence"
              defaultValue="daily"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="grid gap-2 text-stone-300">
            Days for custom pattern
            <input
              name="days"
              placeholder="mon,tue,fri"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-stone-300">
            Start date
            <input
              name="startDate"
              type="date"
              required
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
          <label className="grid gap-2 text-stone-300">
            End date
            <input
              name="endDate"
              type="date"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
        </div>

        <p className="text-[0.7rem] text-stone-500">
          Use custom only when the bus does not run every day. Example: <span className="font-mono text-stone-300">mon,wed,fri</span>.
        </p>

        <button
          type="submit"
          className="rounded-full border border-amber-400 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-200"
        >
          Save schedule
        </button>
      </form>
    </article>
  );
}
