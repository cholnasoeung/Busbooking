import type {
  OperatorRoute,
  TripSchedule,
} from "@/lib/operator-route-management";

import { deleteScheduleAction } from "../actions";

type ScheduleLibraryProps = {
  routes: OperatorRoute[];
  schedules: TripSchedule[];
};

function formatDateLabel(value?: Date) {
  if (!value) {
    return "No end date";
  }

  return value.toLocaleDateString();
}

export function ScheduleLibrary({ routes, schedules }: ScheduleLibraryProps) {
  const routeMap = new Map(routes.map((route) => [route.id, route]));

  return (
    <section className="rounded-[28px] border border-white/10 bg-stone-900/50 p-6 shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Published schedules</h2>
          <p className="mt-1 text-sm text-stone-400">
            Check each departure pattern and make sure it points at the right route.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          {schedules.length} live
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-stone-400">
            No schedules published yet.
          </div>
        ) : (
          schedules.map((schedule) => {
            const route = routeMap.get(schedule.routeId);

            return (
              <article
                key={schedule.id}
                className="rounded-3xl border border-white/10 bg-stone-950/60 p-4 text-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {route?.routeName ?? schedule.routeId}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      {route ? `${route.fromCity} to ${route.toCity}` : "Route lookup unavailable"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-stone-300">
                    <p className="text-base font-semibold text-white">{schedule.departureTime}</p>
                    <p>{schedule.vehicle}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[0.65rem]">
                  <span className="rounded-full border border-amber-400/30 px-2 py-1 text-amber-200">
                    {schedule.recurrence}
                  </span>
                  {schedule.days?.length ? (
                    <span className="rounded-full border border-white/10 px-2 py-1 text-stone-300">
                      {schedule.days.join(", ")}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-xs text-stone-400">
                  Active from {schedule.startDate.toLocaleDateString()} until{" "}
                  {formatDateLabel(schedule.endDate)}
                </p>
                <form action={deleteScheduleAction} method="post" className="mt-3 text-xs">
                  <input type="hidden" name="scheduleId" value={schedule.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-amber-300/80 px-3 py-1 text-[0.65rem] font-semibold text-amber-200 hover:border-amber-400/60"
                  >
                    Delete schedule
                  </button>
                </form>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
