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
import { SearchForm } from "./components/search-form";
import { FilterSidebar } from "./components/filter-sidebar";
import { UserHeader } from "./components/user-header";
import {
  listSearchFilters,
  type SearchFilterDefinition,
} from "@/lib/search-filter-management";

// --- Logic Helpers (Kept identical to original) ---
const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

type SearchPageParams = Record<string, string | string[] | undefined>;
type SearchPageSearchParams = SearchPageParams | URLSearchParams;

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function normalizeDay(day: string) {
  return day.trim().toLowerCase().slice(0, 3);
}

function findMatchingCity(value: string, options: string[]) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const exactMatch = options.find((option) => option.trim().toLowerCase() === normalized);
  if (exactMatch) return exactMatch;
  return options.find((option) => option.trim().toLowerCase().startsWith(normalized)) ?? null;
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

function pickSearchParamValue(target: SearchPageSearchParams | undefined, key: string): string | null {
  if (!target) return null;
  if (typeof (target as URLSearchParams).get === "function") {
    return (target as URLSearchParams).get(key) ?? null;
  }
  const raw = (target as SearchPageParams)[key];
  if (Array.isArray(raw)) return raw[raw.length - 1] ?? null;
  return raw ?? null;
}

export default async function SearchPage({ searchParams }: { searchParams?: SearchPageParams }) {
  const [routes, buses, trips, schedules, filters] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listOperatorBuses("OP-201"),
    listTrips("OP-201"),
    listTripSchedules(),
    listSearchFilters(),
  ]);

  // --- Search & Filter Logic (Kept identical to original) ---
  const defaultRoute = routes[0];
  const fromCities = Array.from(new Set(routes.map((route) => route.fromCity))).sort((a, b) => a.localeCompare(b));
  const requestedFromRaw = pickSearchParamValue(searchParams, "from");
  const requestedToRaw = pickSearchParamValue(searchParams, "to");
  const selectedFrom = (requestedFromRaw && findMatchingCity(requestedFromRaw, fromCities)) ?? defaultRoute?.fromCity ?? fromCities[0] ?? "Phnom Penh";
  const availableToRaw = Array.from(new Set(routes.filter((route) => route.fromCity === selectedFrom).map((route) => route.toCity)));
  const selectedTo = (requestedToRaw && findMatchingCity(requestedToRaw, availableToRaw)) ?? availableToRaw[0] ?? defaultRoute?.toCity ?? "Siem Reap";
  const selectedDate = parseSearchDate(pickSearchParamValue(searchParams, "date") ?? undefined) ?? new Date();
  const selectedDateLabel = formatDate(selectedDate);
  const selectedDateValue = selectedDate.toISOString().split("T")[0];

  const matchingRouteIds = new Set(routes.filter((r) => r.fromCity === selectedFrom && r.toCity === selectedTo).map((r) => r.id));
  const actualTrips = trips.filter((t) => matchingRouteIds.has(t.routeId) && sameDay(t.tripDate, selectedDate));
  const routeLookup = Object.fromEntries(routes.map((r) => [r.id, r]));
  
  const scheduleTrips = schedules
    .filter((s) => matchingRouteIds.has(s.routeId))
    .filter((s) => buildScheduleTripDate(s, selectedDate) ? scheduleRunsOnDate(s, selectedDate) : false)
    .filter((s) => {
      const tripDate = buildScheduleTripDate(s, selectedDate);
      return tripDate ? !actualTrips.some((t) => t.routeId === s.routeId && Math.abs(t.tripDate.getTime() - tripDate.getTime()) < 60000) : false;
    })
    .map((s) => {
      const tripDate = buildScheduleTripDate(s, selectedDate)!;
      const matchedBus = buses.find((b) => b.name === s.vehicle);
      return {
        id: `${s.id}-${selectedDateValue}`,
        operatorId: "OP-201",
        busId: matchedBus?.id ?? "",
        routeId: s.routeId,
        routeName: routeLookup[s.routeId]?.routeName ?? "Custom departure",
        tripDate,
        status: "scheduled" as const,
        driver: { name: matchedBus?.driver?.name ?? "Dispatch", phone: "", vehicle: s.vehicle },
        delayNotes: [], livePositions: [], updatedAt: new Date(),
      };
    });

  const availableTrips = [...actualTrips, ...scheduleTrips];
  const busLookup = Object.fromEntries(buses.map((bus) => [bus.id, bus]));

  const filterDefinitions = filters.length > 0 ? filters : [];

  // Handle time slot filtering from URL
  const timeSlotsParam = pickSearchParamValue(searchParams, "timeSlots");
  const selectedTimeSlots = timeSlotsParam ? timeSlotsParam.split(",") : [];

  const timeSlotRanges: Record<string, { startHour: number; endHour: number }> = {
    before6am: { startHour: 0, endHour: 6 },
    "6am-12pm": { startHour: 6, endHour: 12 },
    "12pm-6pm": { startHour: 12, endHour: 18 },
    after6pm: { startHour: 18, endHour: 24 },
  };

  // Build filter predicate that works with both actual trips and schedule-based trips
  const buildFilterPredicate = (definition: SearchFilterDefinition) => {
    const payload = definition.payload;
    if ("startHour" in payload) {
      return (trip: TripRecord) => {
        const hour = trip.tripDate.getUTCHours();
        return hour >= payload.startHour && hour < payload.endHour;
      };
    }
    if ("busTypes" in payload) {
      return (trip: TripRecord, bus: any) => {
        // For schedule trips without bus data, check the driver vehicle field
        if (!bus) {
          const vehicleName = trip.driver?.vehicle || "";
          // Try to find matching bus by vehicle name
          const matchedBus = buses.find(b => b.name === vehicleName);
          if (matchedBus) {
            return payload.busTypes.includes(matchedBus.type ?? "");
          }
          return false;
        }
        return payload.busTypes.includes(bus.type ?? "");
      };
    }
    if ("statuses" in payload) {
      return (trip: TripRecord) => payload.statuses.includes(trip.status);
    }
    return () => true;
  };

  // Apply time slot filtering
  let tripsAfterTimeFilter = availableTrips;
  if (selectedTimeSlots.length > 0) {
    tripsAfterTimeFilter = availableTrips.filter((trip) => {
      const tripHour = trip.tripDate.getUTCHours();
      return selectedTimeSlots.some((slotId) => {
        const range = timeSlotRanges[slotId];
        if (!range) return false;
        return tripHour >= range.startHour && tripHour < range.endHour;
      });
    });
  }

  const activeFilter = pickSearchParamValue(searchParams, "filter");
  const activeFilterDefinition = activeFilter ? filterDefinitions.find(f => f.id === activeFilter) : undefined;
  const filteredTrips = activeFilterDefinition
    ? tripsAfterTimeFilter.filter(t => buildFilterPredicate(activeFilterDefinition)(t, busLookup[t.busId]))
    : tripsAfterTimeFilter;

  // Serialize MongoDB objects to plain objects for client components
  const serializedFilters = filterDefinitions.map(f => ({
    id: f.id,
    label: f.label,
    description: f.description,
    type: f.type,
    payload: f.payload,
  }));

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-red-100">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-50 to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* --- User Profile Header --- */}
        <UserHeader />

        {/* --- Top Nav / Search Summary --- */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <Link href="/" className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-red-600 transition-colors hover:text-red-700">
              <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to Home
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {selectedFrom} <span className="text-red-500">→</span> {selectedTo}
            </h1>
            <p className="font-medium text-slate-500">
              {filteredTrips.length} available journeys on <span className="text-slate-900 font-bold">{selectedDateLabel}</span>
              {activeFilterDefinition && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  {activeFilterDefinition.label}
                  <Link href={`/search?from=${encodeURIComponent(selectedFrom)}&to=${encodeURIComponent(selectedTo)}&date=${selectedDateValue}`} className="ml-2 hover:text-red-900">✕</Link>
                </span>
              )}
            </p>
          </div>

          <SearchForm
            fromCities={fromCities}
            toCities={availableToRaw}
            selectedFrom={selectedFrom}
            selectedTo={selectedTo}
            selectedDateValue={selectedDateValue}
            activeFilter={activeFilter}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* --- Sidebar --- */}
          <FilterSidebar
            filterDefinitions={serializedFilters}
            selectedFrom={selectedFrom}
            selectedTo={selectedTo}
            selectedDateValue={selectedDateValue}
            activeFilter={activeFilter}
          />

          {/* --- Main Content --- */}
          <div className="space-y-4">
            {/* Sort Bar */}
            <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-slate-700">{filteredTrips.length} buses available</span>
                {(activeFilterDefinition || selectedTimeSlots.length > 0) && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTimeSlots.length > 0 && (
                        <div className="flex items-center gap-1">
                          {selectedTimeSlots.map((slotId) => {
                            const slotLabels: Record<string, string> = {
                              before6am: "Before 6 AM",
                              "6am-12pm": "6 AM - 12 PM",
                              "12pm-6pm": "12 PM - 6 PM",
                              after6pm: "After 6 PM",
                            };
                            return (
                              <span key={slotId} className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                {slotLabels[slotId] || slotId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {activeFilterDefinition && (
                        <span className="text-red-600">{activeFilterDefinition.label}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Departure</option>
                  <option>Duration</option>
                  <option>Arrival</option>
                  <option>Price (Low to High)</option>
                  <option>Price (High to Low)</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            {/* Bus List */}
            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
                <span className="mb-4 text-6xl">🚌</span>
                <p className="text-xl font-bold text-slate-700">No buses found for this date</p>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or choosing a nearby date</p>
              </div>
            ) : (
              filteredTrips.map((trip, idx) => {
                const bus = busLookup[trip.busId];
                const price = 12 + (idx % 3) * 2.5;
                const departureTime = formatTime(trip.tripDate);
                const arrivalTime = formatTime(new Date(trip.tripDate.getTime() + 6 * 3600000));
                const busType = bus ? typeLabelLookup[bus.type] : "Standard";

                return (
                  <article
                    key={trip.id}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-red-200"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left Section: Time & Route */}
                      <div className="flex flex-1 items-center gap-6 border-b border-slate-100 p-5 md:border-b-0 md:border-r md:w-64">
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-slate-900">{departureTime}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">{selectedFrom}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-400">{Math.floor(6)}h 30m</span>
                          <div className="flex items-center gap-1">
                            <div className="h-[2px] w-8 border-t-2 border-dashed border-slate-300" />
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <div className="h-[2px] w-8 border-t-2 border-dashed border-slate-300" />
                          </div>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-2xl font-bold text-slate-900">{arrivalTime}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">{selectedTo}</p>
                        </div>
                      </div>

                      {/* Middle Section: Bus Info */}
                      <div className="flex flex-1 items-center gap-4 p-5">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{busType}</span>
                            {trip.status === "scheduled" && (
                              <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">On Time</span>
                            )}
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{bus?.name || "Express Bus"}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{trip.driver?.vehicle || bus?.registration?.registrationNumber || "N/A"}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {bus?.amenities?.slice(0, 4).map((amenity) => (
                              <span key={amenity} className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <span>✓</span> {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Price & CTA */}
                      <div className="flex flex-col items-end justify-between border-t border-slate-100 bg-slate-50 p-5 md:border-t-0 md:border-l md:w-48">
                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-500">Starting from</p>
                          <p className="text-2xl font-bold text-slate-900">${price}</p>
                        </div>
                        <SeatSelection
                          trip={trip}
                          bus={bus}
                          price={price}
                          origin={selectedFrom}
                          destination={selectedTo}
                        />
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
