export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { busTypeCatalog, listOperatorBuses } from "@/lib/operator-bus-management";
import {
  listOperatorRoutes,
  listTripSchedules,
  type TripSchedule,
} from "@/lib/operator-route-management";
import { listTrips, type TripRecord } from "@/lib/operator-trips";
import {
  formatDate,
  formatTime,
  parseSearchDate,
  sameDay,
} from "@/lib/display-utils";
import { SeatSelection } from "@/components/seat-selection";
import {
  listSearchFilters,
  type SearchFilterDefinition,
} from "@/lib/search-filter-management";

const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

type SearchPageParams = {
  from?: string;
  to?: string;
  date?: string;
  filter?: string | string[];
};

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function normalizeDay(day: string) {
  return day.trim().toLowerCase().slice(0, 3);
}

function scheduleRunsOnDate(schedule: TripSchedule, targetDate: Date) {
  if (targetDate < schedule.startDate) return false;
  if (schedule.endDate && targetDate > schedule.endDate) return false;
  const day = normalizeDay(daysOfWeek[targetDate.getDay()]);
  const listedDays = new Set((schedule.days ?? []).map(normalizeDay));
  if (listedDays.size === 0) return schedule.recurrence === "daily";
  return listedDays.has(day);
}

function buildScheduleTripDate(schedule: TripSchedule, targetDate: Date) {
  const [hoursRaw, minutesRaw] = schedule.departureTime.split(":").map(Number);
  if (Number.isNaN(hoursRaw) || Number.isNaN(minutesRaw)) return null;
  const tripDate = new Date(targetDate);
  tripDate.setHours(hoursRaw, minutesRaw, 0, 0);
  return tripDate;
}

function pickSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[value.length - 1] ?? null;
  }
  return value ?? null;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchPageParams;
}) {
  const [routes, buses, trips, schedules, filters] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listOperatorBuses("OP-201"),
    listTrips("OP-201"),
    listTripSchedules(),
    listSearchFilters(),
  ]);

  const defaultRoute = routes[0];
  const fromCities = Array.from(new Set(routes.map((route) => route.fromCity))).sort((a, b) =>
    a.localeCompare(b)
  );
  const requestedFrom = pickSearchParam(searchParams?.from)?.trim() || undefined;
  const requestedTo = pickSearchParam(searchParams?.to)?.trim() || undefined;

  const selectedFrom =
    requestedFrom ?? defaultRoute?.fromCity ?? fromCities[0] ?? "Phnom Penh";
  const availableToRaw = Array.from(
    new Set(
      routes
        .filter((route) => route.fromCity === selectedFrom)
        .map((route) => route.toCity)
    )
  );
  const availableTo =
    requestedTo && !availableToRaw.includes(requestedTo)
      ? [requestedTo, ...availableToRaw]
      : availableToRaw;
  const selectedTo =
    requestedTo ??
    availableTo[0] ??
    defaultRoute?.toCity ??
    "Siem Reap";
  const selectedDate = parseSearchDate(searchParams?.date) ?? new Date();
  const selectedDateLabel = formatDate(selectedDate);
  const selectedDateValue = selectedDate.toISOString().split("T")[0];

  const matchingRouteIds = new Set(
    routes
      .filter((route) => route.fromCity === selectedFrom && route.toCity === selectedTo)
      .map((route) => route.id)
  );

  const actualTrips = trips.filter(
    (trip) => matchingRouteIds.has(trip.routeId) && sameDay(trip.tripDate, selectedDate)
  );
  const routeLookup = Object.fromEntries(routes.map((route) => [route.id, route]));
  const scheduleTrips = schedules
    .filter((schedule) => matchingRouteIds.has(schedule.routeId))
    .filter((schedule) => {
      const tripDate = buildScheduleTripDate(schedule, selectedDate);
      return tripDate ? scheduleRunsOnDate(schedule, selectedDate) : false;
    })
    .filter((schedule) => {
      const tripDate = buildScheduleTripDate(schedule, selectedDate);
      return tripDate
        ? !actualTrips.some(
            (trip) =>
              trip.routeId === schedule.routeId &&
              Math.abs(trip.tripDate.getTime() - tripDate.getTime()) < 60 * 1000
          )
        : false;
    })
    .map((schedule) => {
      const tripDate = buildScheduleTripDate(schedule, selectedDate)!;
      const route = routeLookup[schedule.routeId];
      const matchedBus = buses.find((bus) => bus.name === schedule.vehicle);
      return {
        id: `${schedule.id}-${selectedDateValue}`,
        operatorId: "OP-201",
        busId: matchedBus?.id ?? "",
        routeId: schedule.routeId,
        routeName: route?.routeName ?? "Custom departure",
        tripDate,
        status: "scheduled" as const,
        driver: {
          name: matchedBus?.driver?.name ?? "Dispatch",
          phone: "",
          vehicle: schedule.vehicle,
        },
        delayNotes: [],
        livePositions: [],
        updatedAt: new Date(),
      };
    });
  const availableTrips = [...actualTrips, ...scheduleTrips];
  const busLookup = Object.fromEntries(buses.map((bus) => [bus.id, bus]));
  type FilterOption = {
    id: string;
    label: string;
    description?: string;
    predicate: (trip: TripRecord, bus?: typeof buses[number]) => boolean;
  };

  const fallbackFilterDefinitions: SearchFilterDefinition[] = [
    {
      id: "fallback-evening",
      label: "18:00-24:00",
      description: "Evening departures",
      type: "time-window",
      payload: { startHour: 18, endHour: 24 },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "fallback-luxury",
      label: "Luxury coaches",
      description: "Deluxe and VIP fleet",
      type: "bus-type",
      payload: { busTypes: ["deluxe", "vip"] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "fallback-reschedulable",
      label: "Reschedulable",
      description: "Trips that are still flexible",
      type: "status",
      payload: { statuses: ["scheduled", "boarding"] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "fallback-cancellable",
      label: "Cancellable",
      description: "Trips that can still be canceled",
      type: "status",
      payload: { statuses: ["scheduled", "boarding", "departed"] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const buildFilterPredicate = (definition: SearchFilterDefinition): FilterOption["predicate"] => {
    const payload = definition.payload;
    if ("startHour" in payload && "endHour" in payload) {
      return (trip) => {
        const hour = trip.tripDate.getUTCHours();
        return hour >= payload.startHour && hour < payload.endHour;
      };
    }
    if ("busTypes" in payload) {
      return (trip, bus) => {
        const type = bus?.type ?? "";
        return payload.busTypes.includes(type);
      };
    }
    if ("statuses" in payload) {
      return (trip) => payload.statuses.includes(trip.status);
    }
    return () => true;
  };

  const filterDefinitions =
    filters.length > 0 ? filters : fallbackFilterDefinitions;

  const filterOptions: FilterOption[] = filterDefinitions.map((definition) => ({
    id: definition.id,
    label: definition.label,
    description: definition.description,
    predicate: buildFilterPredicate(definition),
  }));

  const filterCounts = Object.fromEntries(
    filterOptions.map((option) => [
      option.id,
      availableTrips.filter((trip) =>
        option.predicate(trip, busLookup[trip.busId])
      ).length,
    ])
  );

  const rawFilter = searchParams?.filter;
  const activeFilter =
    Array.isArray(rawFilter)
      ? rawFilter[rawFilter.length - 1]
      : rawFilter;

  const filteredTrips = activeFilter
    ? availableTrips.filter((trip) =>
        filterOptions
          .find((option) => option.id === activeFilter)
          ?.predicate(trip, busLookup[trip.busId]) ?? true
      )
    : availableTrips;

  return (
    <main className="min-h-screen bg-[#f5f5ff] px-6 py-12 text-stone-900 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                Search results
              </p>
              <h1 className="text-3xl font-semibold text-stone-900">
                {filteredTrips.length} bus{filteredTrips.length === 1 ? "" : "es"} found
                <span className="ml-3 text-sm text-stone-500">
                  on {selectedDateLabel}
                </span>
              </h1>
              <p className="text-sm text-stone-500">
                From {selectedFrom} to {selectedTo} · Live data from MongoDB
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
            >
              Back to landing
            </Link>
          </div>
          <form
            id="search-form"
            action="/search"
            method="get"
            className="flex flex-wrap gap-3"
          >
            <select
              name="from"
              defaultValue={selectedFrom}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition focus:border-[#ed3d34]"
            >
            {fromCities.map((city) => (
                <option key={`from-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              name="to"
              defaultValue={selectedTo}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition focus:border-[#ed3d34]"
            >
              {availableTo.length ? (
                availableTo.map((city) => (
                  <option key={`to-${city}`} value={city}>
                    {city}
                  </option>
                ))
              ) : (
                <option value={selectedTo}>{selectedTo}</option>
              )}
            </select>
            <input
              type="date"
              name="date"
              defaultValue={selectedDateValue}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 transition focus:border-[#ed3d34]"
            />
            <input type="hidden" name="filter" value={activeFilter ?? ""} />
            <button
              type="submit"
              className="rounded-2xl bg-[#ed3d34] px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[#c12b30]"
            >
              Update search
            </button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Filter buses
            </h2>
            {filterOptions.map((filter) => {
              const count = filterCounts[filter.id] ?? 0;
              const isActive = activeFilter === filter.id;
              const params = new URLSearchParams({
                from: selectedFrom,
                to: selectedTo,
                date: selectedDateValue,
                filter: filter.id,
              });
              const href = `/search?${params.toString()}`;
              return (
                <Link
                  key={filter.id}
                  href={href}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm font-semibold transition ${
                    isActive
                      ? "border-[#ed3d34] bg-[#ed3d34]/10 text-[#ed3d34]"
                      : "border-stone-200 text-stone-700 hover:border-[#ed3d34]"
                  }`}
                  title={filter.description ?? filter.label}
                >
                  <span>{filter.label}</span>
                  <span className="text-xs text-stone-400">{count}</span>
                </Link>
              );
            })}
            <div className="space-y-2 pt-4">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                Departure window
              </p>
              <p className="text-sm text-stone-500">06:00 – 22:00 every 30 mins</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                Arrival window
              </p>
              <p className="text-sm text-stone-500">10:00 – 02:00 next day</p>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-4">
              <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Sort by:</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
                {["Ratings", "Departure time", "Price"].map((option) => (
                  <span key={option} className="rounded-full border border-stone-200 px-3 py-1">
                    {option}
                  </span>
                ))}
              </div>
            </div>

            {filteredTrips.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
                No trips match the selected corridor, date, or filters. Adjust the filters to see nearby departures.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip, index) => {
                  const bus = busLookup[trip.busId];
                  const seatDetails =
                    bus?.seatLayout
                      .split("\n")
                      .map((segment) => segment.trim())
                      .filter(Boolean)
                      .join(" • ") || "Custom layout";
                  const departureTime = formatTime(trip.tripDate);
                  const arrivalTime = formatTime(
                    new Date(trip.tripDate.getTime() + 6 * 60 * 60 * 1000)
                  );
                  const price = 11 + index * 2;
                  const statusBadge =
                    trip.status === "scheduled"
                      ? "bg-stone-100 text-stone-700"
                      : trip.status === "boarding"
                      ? "bg-emerald-100 text-emerald-800"
                      : trip.status === "arrived"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-amber-100 text-amber-800";
                  const typeLabel = bus ? typeLabelLookup[bus.type] : "Express";

                  return (
                    <article
                      key={trip.id}
                      className="rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(15,23,42,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
                            {typeLabel}
                          </p>
                          <h3 className="text-xl font-semibold text-stone-900">
                            {bus?.name ?? "Awaiting bus data"}
                          </h3>
                          <p className="text-sm text-stone-500">{trip.routeName}</p>
                        </div>
                        <span
                          className={`rounded-full px-4 py-1 text-xs font-semibold ${statusBadge}`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-stone-500">
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-400">
                            Departure
                          </p>
                          <p className="text-lg font-semibold text-stone-900">
                            {departureTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-400">
                            Arrival
                          </p>
                          <p className="text-lg font-semibold text-stone-900">
                            {arrivalTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-400">
                            Duration
                          </p>
                          <p className="text-lg font-semibold text-stone-900">6h 00m</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-xs text-stone-500 sm:grid-cols-3">
                        <div>
                          <p className="font-semibold text-stone-900">
                            {bus?.driver?.name ?? trip.driver.name}
                          </p>
                          <p>Driver</p>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {trip.driver.vehicle}
                          </p>
                          <p>Vehicle</p>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">{seatDetails}</p>
                          <p>Seats</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
                          {(bus?.amenities ?? ["Wi-Fi", "USB charging"]).map(
                            (amenity) => (
                              <span
                                key={`${trip.id}-${amenity}`}
                                className="rounded-full border border-stone-200 px-3 py-1"
                              >
                                {amenity}
                              </span>
                            )
                          )}
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm text-stone-500">redDeal</p>
                          <p className="text-2xl font-semibold text-stone-900">
                            USD {price}
                          </p>
                          <p className="text-xs text-stone-400 line-through">
                            USD {price + 2}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <SeatSelection
                          trip={trip}
                          bus={bus}
                          price={price}
                          origin={selectedFrom}
                          destination={selectedTo}
                        />
                        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-stone-400">
                          {trip.delayNotes.length > 0 ? "Delays expected" : "On time"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
