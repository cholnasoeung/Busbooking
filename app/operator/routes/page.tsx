import { RouteManagementWorkspace } from "@/app/operator/routes/components/route-management-workspace";
import {
  listOperatorRoutes,
  listTripSchedules,
} from "@/lib/operator-route-management";
import { listCities } from "@/lib/route-city-management";

export default async function OperatorRoutesPage() {
  const [routes, schedules, cities] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listTripSchedules(),
    listCities(),
  ]);

  const cityOptions = Array.from(
    new Set([
      ...cities.map((city) => city.name),
      ...routes.flatMap((route) => [route.fromCity, route.toCity]),
    ])
  ).sort((left, right) => left.localeCompare(right));

  return (
    <RouteManagementWorkspace
      routes={routes}
      schedules={schedules}
      cityOptions={cityOptions}
    />
  );
}
