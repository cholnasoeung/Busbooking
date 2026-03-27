import type {
  OperatorRoute,
  TripSchedule,
} from "@/lib/operator-route-management";

type RouteOverviewProps = {
  routes: OperatorRoute[];
  schedules: TripSchedule[];
};

const workflowSteps = [
  {
    title: "1. Create corridor",
    detail: "Pick the route name, departure city, arrival city, and the main stop sequence.",
  },
  {
    title: "2. Add boarding points",
    detail: "Attach pickup and drop locations to the correct route before publishing trips.",
  },
  {
    title: "3. Publish schedules",
    detail: "Choose the route, departure time, recurrence, and assigned vehicle.",
  },
];

export function RouteOverview({ routes, schedules }: RouteOverviewProps) {
  const activeRoutes = routes.filter((route) => route.active).length;
  const totalBoardingPoints = routes.reduce(
    (total, route) => total + route.boardingPoints.length,
    0
  );
  const totalDropPoints = routes.reduce(
    (total, route) => total + route.dropPoints.length,
    0
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
        Route management
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white">
        Manage routes in clear steps.
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-300">
        We split route setup into route creation, stop management, and schedule publishing so the
        team can update the network faster with fewer mistakes.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-stone-950/50 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Routes</p>
          <p className="mt-2 text-2xl font-semibold text-white">{routes.length}</p>
          <p className="text-xs text-stone-400">{activeRoutes} active right now</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-stone-950/50 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Schedules</p>
          <p className="mt-2 text-2xl font-semibold text-white">{schedules.length}</p>
          <p className="text-xs text-stone-400">Recurring departures published</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-stone-950/50 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Boarding</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalBoardingPoints}</p>
          <p className="text-xs text-stone-400">Pickup points linked to routes</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-stone-950/50 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">Drop points</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalDropPoints}</p>
          <p className="text-xs text-stone-400">Arrival points ready for trips</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {workflowSteps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm"
          >
            <p className="font-semibold text-amber-200">{step.title}</p>
            <p className="mt-2 text-stone-300">{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
