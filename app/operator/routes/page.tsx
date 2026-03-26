import {
  listOperatorRoutes,
  listTripSchedules,
} from "@/lib/operator-route-management";
import {
  addBoardingPointAction,
  addDropPointAction,
  createRouteAction,
  createScheduleAction,
} from "./actions";

export default async function OperatorRoutesPage() {
  const [routes, schedules] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listTripSchedules(),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
          Route management
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Create routes, boarding points, and trip schedules
        </h1>
        <p className="mt-2 text-sm text-stone-300">
          Define new corridors, attach boarding/drop points, and publish recurring schedules for crew.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
          <h2 className="text-lg font-semibold text-white">Create route</h2>
          <form action={createRouteAction} className="mt-4 grid gap-3 text-xs text-stone-300">
            <input name="routeName" placeholder="Route name" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="fromCity" placeholder="From city" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
              <input name="toCity" placeholder="To city" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            </div>
            <textarea name="stops" rows={2} placeholder="Stops (comma separated)" className="rounded-2xl border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <button type="submit" className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200">
              Save route
            </button>
          </form>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
          <h2 className="text-lg font-semibold text-white">Trip schedule</h2>
          <form action={createScheduleAction} className="mt-4 grid gap-3 text-xs text-stone-300">
            <select name="routeId" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white">
              <option value="">Select route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>{route.routeName}</option>
              ))}
            </select>
            <input name="departureTime" placeholder="Departure time (HH:MM)" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <input name="vehicle" placeholder="Vehicle name" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <select name="recurrence" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            <input name="days" placeholder="Days for custom (mon,tue...)" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <input name="startDate" type="date" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <input name="endDate" type="date" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <button type="submit" className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200">
              Save schedule
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Routes</h2>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">{routes.length} total</span>
          </header>
          <div className="mt-4 space-y-3 text-xs text-stone-400">
            {routes.map((route) => (
              <div key={route.id} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
                <p className="text-sm font-semibold text-white">{route.routeName}</p>
                <p className="text-[0.75rem] text-stone-300">{route.fromCity} → {route.toCity}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem]">
                  <span className="rounded-full border border-white/10 px-2">{route.stops.length} stops</span>
                  <span className="rounded-full border border-white/10 px-2 text-emerald-300">{route.active ? "Active" : "Paused"}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Boarding & drop points</h2>
          </header>
          <form action={addBoardingPointAction} className="mt-4 grid gap-3 text-xs text-stone-300">
            <select name="routeId" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white">
              <option value="">Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>{route.routeName}</option>
              ))}
            </select>
            <input name="name" placeholder="Point name" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <input name="location" placeholder="Location detail" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <button type="submit" className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200">
              Add boarding point
            </button>
          </form>
          <form action={addDropPointAction} className="mt-4 grid gap-3 text-xs text-stone-300">
            <select name="routeId" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white">
              <option value="">Route</option>
              {routes.map((route) => (
                <option key={`drop-${route.id}`} value={route.id}>{route.routeName}</option>
              ))}
            </select>
            <input name="name" placeholder="Drop name" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <input name="location" placeholder="Location detail" className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white" />
            <button type="submit" className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200">
              Add drop point
            </button>
          </form>
        </article>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-stone-900/50 p-6 shadow">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trip schedules</h2>
        </header>
        <div className="mt-4 space-y-3 text-xs text-stone-400">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-2xl border border-white/10 bg-stone-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{schedule.routeId} • {schedule.departureTime}</p>
                <span className="text-[0.65rem] text-stone-300">{schedule.vehicle}</span>
              </div>
              <p className="text-[0.65rem] text-stone-400">
                Recurs {schedule.recurrence} {schedule.days?.join(", ")}
              </p>
              <p className="text-[0.65rem] text-stone-400">
                Starts {schedule.startDate.toLocaleDateString()} {schedule.endDate ? `– ${schedule.endDate.toLocaleDateString()}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
