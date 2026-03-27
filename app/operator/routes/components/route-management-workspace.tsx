import type {
  OperatorRoute,
  TripSchedule,
} from "@/lib/operator-route-management";

import { CreateRouteCard } from "./create-route-card";
import { RouteOverview } from "./route-overview";
import { RoutesLibrary } from "./routes-library";
import { ScheduleBuilderCard } from "./schedule-builder-card";
import { ScheduleLibrary } from "./schedule-library";
import { StopManagementCard } from "./stop-management-card";

type RouteManagementWorkspaceProps = {
  routes: OperatorRoute[];
  schedules: TripSchedule[];
  cityOptions: string[];
};

export function RouteManagementWorkspace({
  routes,
  schedules,
  cityOptions,
}: RouteManagementWorkspaceProps) {
  return (
    <main className="space-y-6">
      <RouteOverview routes={routes} schedules={schedules} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <CreateRouteCard cityOptions={cityOptions} />
          <StopManagementCard routes={routes} />
        </div>

        <div className="space-y-6">
          <ScheduleBuilderCard routes={routes} />
          <RoutesLibrary routes={routes} />
          <ScheduleLibrary routes={routes} schedules={schedules} />
        </div>
      </section>
    </main>
  );
}
