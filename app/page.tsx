import Link from "next/link";

import { SeatSelection } from "@/components/seat-selection";
import { formatDate, formatTime } from "@/lib/display-utils";
import {
  busTypeCatalog,
  listOperatorBuses,
  type BusRecord,
} from "@/lib/operator-bus-management";
import {
  listOperatorRoutes,
  listTripSchedules,
  type OperatorRoute,
  type TripSchedule,
} from "@/lib/operator-route-management";
import { listTrips, type TripRecord } from "@/lib/operator-trips";

const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type HomeTripCard = {
  trip: TripRecord;
  route: OperatorRoute;
  bus?: BusRecord;
  source: "live" | "schedule";
  price: number;
};

function normalizeDay(day: string) {
  return day.trim().toLowerCase().slice(0, 3);
}

function scheduleRunsOnDate(schedule: TripSchedule, targetDate: Date) {
  if (targetDate < schedule.startDate) return false;
  if (schedule.endDate && targetDate > schedule.endDate) return false;

  const day = normalizeDay(daysOfWeek[targetDate.getDay()]);
  const listedDays = new Set((schedule.days ?? []).map(normalizeDay));

  if (listedDays.size === 0) {
    return schedule.recurrence === "daily";
  }

  return listedDays.has(day);
}

function buildScheduleTripDate(schedule: TripSchedule, targetDate: Date) {
  const [hoursRaw, minutesRaw] = schedule.departureTime.split(":").map(Number);
  if (Number.isNaN(hoursRaw) || Number.isNaN(minutesRaw)) {
    return null;
  }

  const tripDate = new Date(targetDate);
  tripDate.setHours(hoursRaw, minutesRaw, 0, 0);
  return tripDate;
}

function findNextScheduleTripDate(schedule: TripSchedule, fromDate: Date) {
  const anchor = new Date(fromDate);
  anchor.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 14; offset += 1) {
    const candidate = new Date(anchor);
    candidate.setDate(anchor.getDate() + offset);

    if (!scheduleRunsOnDate(schedule, candidate)) {
      continue;
    }

    const tripDate = buildScheduleTripDate(schedule, candidate);
    if (tripDate && tripDate >= fromDate) {
      return tripDate;
    }
  }

  return null;
}

function estimatePrice(index: number) {
  return 12 + (index % 4) * 2.5;
}

function statusClassName(status: TripRecord["status"]) {
  switch (status) {
    case "scheduled":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "boarding":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "departed":
    case "arrived":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-stone-200 bg-stone-100 text-stone-700";
  }
}

export default async function Home() {
  const operatorId = "OP-201";
  const [routes, buses, trips, schedules] = await Promise.all([
    listOperatorRoutes(operatorId),
    listOperatorBuses(operatorId),
    listTrips(operatorId),
    listTripSchedules(),
  ]);

  const heroBus = buses[0];
  const activeCount = buses.filter((bus) => bus.status === "active").length;
  const fromCities = Array.from(new Set(routes.map((route) => route.fromCity)));
  const toCities = Array.from(new Set(routes.map((route) => route.toCity)));
  const todayValue = new Date().toISOString().split("T")[0];

  const now = new Date();
  const routeLookup = Object.fromEntries(routes.map((route) => [route.id, route]));
  const busLookup = Object.fromEntries(buses.map((bus) => [bus.id, bus]));

  const liveTrips = trips
    .filter((trip) => trip.tripDate >= now)
    .reduce<HomeTripCard[]>((accumulator, trip, index) => {
      const route = routeLookup[trip.routeId];
      if (!route) {
        return accumulator;
      }

      accumulator.push({
        trip,
        route,
        bus: busLookup[trip.busId],
        source: "live" as const,
        price: estimatePrice(index),
      });

      return accumulator;
    }, []);

  const scheduledTrips = schedules.reduce<HomeTripCard[]>((accumulator, schedule, index) => {
      const route = routeLookup[schedule.routeId];
      if (!route) {
        return accumulator;
      }

      const tripDate = findNextScheduleTripDate(schedule, now);
      if (!tripDate) {
        return accumulator;
      }

      const hasLiveTrip = liveTrips.some(
        (entry) =>
          entry.trip.routeId === schedule.routeId &&
          Math.abs(entry.trip.tripDate.getTime() - tripDate.getTime()) < 60000
      );

      if (hasLiveTrip) {
        return accumulator;
      }

      const matchedBus = buses.find((bus) => bus.name === schedule.vehicle);
      const trip: TripRecord = {
        id: `${schedule.id}-${tripDate.toISOString()}`,
        operatorId,
        busId: matchedBus?.id ?? "",
        routeId: schedule.routeId,
        routeName: route.routeName,
        tripDate,
        status: "scheduled",
        driver: {
          name: matchedBus?.driver?.name ?? "Dispatch",
          phone: "",
          vehicle: schedule.vehicle,
        },
        delayNotes: [],
        livePositions: [],
        updatedAt: schedule.updatedAt,
      };

      accumulator.push({
        trip,
        route,
        bus: matchedBus,
        source: "schedule" as const,
        price: estimatePrice(index + liveTrips.length),
      });

      return accumulator;
    }, []);

  const allTrips = [...liveTrips, ...scheduledTrips].sort(
    (left, right) => left.trip.tripDate.getTime() - right.trip.tripDate.getTime()
  );

  return (
    <main className="min-h-screen bg-[#fcfaf8] text-stone-900 selection:bg-red-100">
      <section className="relative overflow-hidden bg-[#121214] px-6 py-20 text-white lg:px-14">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-[1400px]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Fleet Live Status
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                The pulse of <span className="text-red-500">Cambodia&apos;s</span> roads.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-stone-400">
                Manage your fleet with precision. Track {activeCount} active vehicles and instantly
                sync routes to the global redBus network.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/operator/routes"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-tighter text-black transition hover:scale-105 active:scale-95"
                >
                  Manage Routes
                </Link>
                <Link
                  href="/operator/buses"
                  className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-tighter backdrop-blur-md transition hover:bg-white/10"
                >
                  Fleet Overview
                </Link>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-red-500 to-orange-500 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
              <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                      Premium Fleet
                    </p>
                    <h2 className="mt-1 text-3xl font-bold">
                      {heroBus?.name || "Unassigned"}
                    </h2>
                  </div>
                  <span className="rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1 text-[10px] font-bold uppercase text-green-400">
                    {heroBus?.status || "Offline"}
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-stone-500">
                      Registration
                    </p>
                    <p className="text-sm font-medium">
                      {heroBus?.registration?.registrationNumber || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-stone-500">
                      Type
                    </p>
                    <p className="text-sm font-medium">
                      {heroBus ? typeLabelLookup[heroBus.type] : "Standard"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 text-xs font-bold">
                      {heroBus?.driver?.name?.[0] || "D"}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-stone-500">
                        Assigned Driver
                      </p>
                      <p className="text-sm font-semibold">
                        {heroBus?.driver?.name || "Awaiting Assignment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-12 px-6">
        <div className="mx-auto max-w-5xl rounded-[40px] border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-200/50">
          <form action="/search" method="get" className="grid items-end gap-4 p-4 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-3">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Origin
              </label>
              <select
                name="from"
                className="w-full rounded-2xl border-stone-100 bg-stone-50 py-3 pl-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
              >
                {fromCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-3">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Destination
              </label>
              <select
                name="to"
                className="w-full rounded-2xl border-stone-100 bg-stone-50 py-3 pl-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
              >
                {toCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-3">
              <label className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={todayValue}
                className="w-full rounded-2xl border-stone-100 bg-stone-50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="lg:col-span-3">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#d82c27] py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-black active:scale-[0.98]"
              >
                Find Departures
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-14">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">
              All Trips
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-stone-900">
              Browse every upcoming departure
            </h2>
            <p className="max-w-2xl text-sm text-stone-500">
              See all scheduled and live trips on one page, then jump straight into seat
              selection without leaving home.
            </p>
          </div>
          <p className="text-sm font-semibold text-stone-400">
            {allTrips.length} upcoming trip{allTrips.length === 1 ? "" : "s"}
          </p>
        </div>

        {allTrips.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-stone-200 bg-white px-8 py-14 text-center">
            <p className="text-2xl font-bold text-stone-900">No upcoming trips yet</p>
            <p className="mt-3 text-sm text-stone-500">
              Add trips from the operator workspace and they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {allTrips.map((entry) => {
              const { trip, route, bus, source, price } = entry;
              const departureDate = formatDate(trip.tripDate);
              const departureTime = formatTime(trip.tripDate);
              const arrivalTime = formatTime(
                new Date(trip.tripDate.getTime() + 6 * 60 * 60 * 1000)
              );
              const dateValue = trip.tripDate.toISOString().split("T")[0];
              const busType = bus ? typeLabelLookup[bus.type] : "Scheduled service";
              const amenityList =
                bus?.amenities && bus.amenities.length > 0
                  ? bus.amenities.slice(0, 4)
                  : ["Boarding info included", "Route support"];

              return (
                <article
                  key={trip.id}
                  className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-4 xl:min-w-[340px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                          {source === "live" ? "Live trip" : "Scheduled route"}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] ${statusClassName(
                            trip.status
                          )}`}
                        >
                          {trip.status.replace("_", " ")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold tracking-tight text-stone-900">
                          {route.fromCity} to {route.toCity}
                        </h3>
                        <p className="mt-2 text-sm text-stone-500">
                          {departureDate} • {route.routeName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-3xl font-black text-stone-900">{departureTime}</p>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
                            Departure
                          </p>
                        </div>
                        <div className="flex min-w-[90px] items-center gap-2 text-stone-300">
                          <div className="h-px flex-1 border-t border-dashed border-stone-300" />
                          <span className="text-red-500">•</span>
                          <div className="h-px flex-1 border-t border-dashed border-stone-300" />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-stone-900">{arrivalTime}</p>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
                            Arrival
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:min-w-[320px] xl:flex-1">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">
                          Coach
                        </p>
                        <p className="mt-2 text-lg font-bold text-stone-900">
                          {bus?.name || trip.driver.vehicle || "Operator assigned vehicle"}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">{busType}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {amenityList.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-500"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 xl:min-w-[210px] xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">
                          Seat from
                        </p>
                        <p className="mt-2 text-4xl font-black text-stone-900">
                          ${price.toFixed(0)}
                        </p>
                      </div>

                      {trip.busId ? (
                        <div className="w-full xl:w-[180px]">
                          <SeatSelection
                            trip={trip}
                            bus={bus}
                            price={price}
                            origin={route.fromCity}
                            destination={route.toCity}
                          />
                        </div>
                      ) : (
                        <Link
                          href={`/search?from=${encodeURIComponent(route.fromCity)}&to=${encodeURIComponent(
                            route.toCity
                          )}&date=${dateValue}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-[#d82c27] px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white transition hover:bg-black"
                        >
                          View seats
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-14">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">
              Operator Perks
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-stone-900">
              Promotions & Loyalty
            </h2>
          </div>
          <Link
            href="/operator/pricing"
            className="hidden text-sm font-bold text-stone-400 hover:text-stone-900 sm:block"
          >
            View all rewards →
          </Link>
        </div>

        <div className="grid h-[500px] gap-6 md:grid-cols-12 md:grid-rows-2">
          <article className="group flex flex-col justify-end rounded-[32px] border border-red-100 bg-[#fff1f0] p-10 transition-all hover:bg-[#ffe7e5] md:col-span-8 md:row-span-2">
            <span className="mb-4 inline-block w-fit rounded-full bg-red-100 px-4 py-1 text-[10px] font-black uppercase text-red-600">
              Flash Sale
            </span>
            <h3 className="max-w-sm text-3xl font-bold leading-tight text-stone-900">
              Save $10 on combo Bus & Ferry bookings
            </h3>
            <p className="mt-4 text-stone-600">
              Integrated routes across Sihanoukville and the islands are now 15% cheaper for
              operators to list.
            </p>
          </article>

          <article className="flex flex-col justify-between rounded-[32px] bg-stone-900 p-8 text-white transition-transform hover:scale-[1.02] md:col-span-4 md:row-span-1">
            <h3 className="text-xl font-bold">50% Off PP Routes</h3>
            <p className="text-sm text-stone-400">
              Limited time listing discount for new Mekong routes.
            </p>
          </article>

          <article className="rounded-[32px] border border-stone-200 bg-white p-8 transition-shadow hover:shadow-xl md:col-span-4 md:row-span-1">
            <h3 className="text-xl font-bold">Loyalty Points</h3>
            <p className="mt-2 text-sm text-stone-500">
              Earn 2x points for every online booking processed via redBus Cambodia.
            </p>
          </article>
        </div>
      </section>

      <footer className="bg-[#0a0a0b] py-20 text-stone-500">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-14">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="space-y-6 lg:col-span-2">
              <p className="text-xl font-black italic text-white">redBus</p>
              <p className="max-w-xs text-sm leading-relaxed">
                Empowering Cambodian operators with world-class logistics tools and seamless
                passenger integration.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Platform</h4>
              <nav className="flex flex-col gap-2 text-sm font-medium">
                <Link href="/routes" className="hover:text-white">
                  Route Engine
                </Link>
                <Link href="/buses" className="hover:text-white">
                  Fleet Manager
                </Link>
                <Link href="/analytics" className="hover:text-white">
                  Live Analytics
                </Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Support</h4>
              <p className="text-sm font-medium text-white">support@redbus.com.kh</p>
              <p className="text-sm">+855 23 999 000</p>
            </div>
          </div>
          <div className="mt-20 border-t border-white/5 pt-8 text-center text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} redBus Cambodia · Powered by MongoDB
          </div>
        </div>
      </footer>
    </main>
  );
}
