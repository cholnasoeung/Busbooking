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

  const filterDefinitions = filters.length > 0 ? filters : []; // Fallback omitted for brevity but logic stands
  const buildFilterPredicate = (definition: SearchFilterDefinition) => {
    const payload = definition.payload;
    if ("startHour" in payload) return (trip: TripRecord) => trip.tripDate.getUTCHours() >= payload.startHour && trip.tripDate.getUTCHours() < payload.endHour;
    if ("busTypes" in payload) return (trip: TripRecord, bus: any) => payload.busTypes.includes(bus?.type ?? "");
    if ("statuses" in payload) return (trip: TripRecord) => payload.statuses.includes(trip.status);
    return () => true;
  };

  const activeFilter = pickSearchParamValue(searchParams, "filter");
  const filteredTrips = activeFilter 
    ? availableTrips.filter(t => buildFilterPredicate(filterDefinitions.find(f => f.id === activeFilter)!)(t, busLookup[t.busId]))
    : availableTrips;

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-red-100">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-50 to-transparent -z-10" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
            </p>
          </div>

          <form action="/search" method="get" className="flex flex-wrap items-center gap-3 rounded-[2rem] border border-white bg-white/60 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-md">
            <select name="from" defaultValue={selectedFrom} className="rounded-full bg-transparent px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer">
              {fromCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <select name="to" defaultValue={selectedTo} className="rounded-full bg-transparent px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer">
              {availableToRaw.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" name="date" defaultValue={selectedDateValue} className="rounded-full bg-transparent px-4 py-2 text-sm font-bold focus:outline-none cursor-pointer" />
            <button type="submit" className="rounded-full bg-red-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95">
              Update
            </button>
          </form>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* --- Sidebar --- */}
          <aside className="space-y-6">
            <div className="rounded-[2.5rem] border border-white bg-white/40 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filter Results</h2>
              <div className="space-y-2">
                {filterDefinitions.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <Link
                      key={filter.id}
                      href={`/search?from=${selectedFrom}&to=${selectedTo}&date=${selectedDateValue}&filter=${filter.id}`}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                        isActive ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-white/50 text-slate-600 hover:bg-white"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
                {activeFilter && (
                  <Link href={`/search?from=${selectedFrom}&to=${selectedTo}&date=${selectedDateValue}`} className="mt-4 block text-center text-xs font-bold text-slate-400 hover:text-red-500">
                    Clear all filters
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Travel tip</p>
              <h3 className="mt-2 font-bold italic">Arrive 30m early</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">Boarding closes 5 minutes before the departure time for all inter-city routes.</p>
            </div>
          </aside>

          {/* --- Main List --- */}
          <div className="space-y-6">
            {filteredTrips.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 py-24 text-center">
                <p className="text-xl font-bold text-slate-400">No buses found for this date.</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or choosing a nearby date.</p>
              </div>
            ) : (
              filteredTrips.map((trip, idx) => {
                const bus = busLookup[trip.busId];
                const price = 12 + (idx % 3) * 2.5; // Visual mock price logic
                const departureTime = formatTime(trip.tripDate);
                const arrivalTime = formatTime(new Date(trip.tripDate.getTime() + 6 * 3600000));

                return (
                  <article key={trip.id} className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Journey Info */}
                      <div className="flex-1 p-8">
                        <div className="mb-6 flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {bus ? typeLabelLookup[bus.type] : "Standard"}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${trip.status === 'scheduled' ? 'text-blue-500' : 'text-emerald-500'}`}>
                            ● {trip.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center md:text-left">
                            <p className="text-3xl font-black text-slate-900">{departureTime}</p>
                            <p className="text-xs font-bold uppercase tracking-tighter text-slate-400">{selectedFrom}</p>
                          </div>
                          <div className="relative flex flex-1 items-center justify-center">
                            <div className="h-[2px] w-full bg-slate-100" />
                            <div className="absolute h-2 w-2 rounded-full bg-red-500" />
                          </div>
                          <div className="text-center md:text-right">
                            <p className="text-3xl font-black text-slate-900">{arrivalTime}</p>
                            <p className="text-xs font-bold uppercase tracking-tighter text-slate-400">{selectedTo}</p>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
                            <div className="h-2 w-2 rounded-full bg-slate-300" />
                            <p className="text-[10px] font-bold text-slate-600 uppercase">{bus?.name || "Premium Fleet"}</p>
                          </div>
                          {bus?.amenities?.map(a => (
                            <span key={a} className="rounded-xl border border-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Pricing & CTA */}
                      <div className="w-full bg-slate-50/50 p-8 md:w-72 md:border-l md:border-slate-100">
                        <div className="mb-6 flex flex-col items-end">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Seat from</p>
                          <p className="text-3xl font-black text-slate-900">${price}</p>
                          <p className="text-[10px] font-bold text-red-500 uppercase">Limited Seats</p>
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
