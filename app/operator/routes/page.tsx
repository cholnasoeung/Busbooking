import { RouteManagementWorkspace } from "@/app/operator/routes/components/route-management-workspace";
import { listOperatorRoutes, listTripSchedules } from "@/lib/operator-route-management";
import { listCities } from "@/lib/route-city-management";
import { listSearchFilters } from "@/lib/search-filter-management";

export default async function OperatorRoutesPage() {
  const [routes, schedules, cities, filters] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listTripSchedules(),
    listCities(),
    listSearchFilters(),
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
      filters={filters}
    />
  );
}
