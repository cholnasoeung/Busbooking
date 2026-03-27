import Link from "next/link";
import { busTypeCatalog, listOperatorBuses } from "@/lib/operator-bus-management";
import { listOperatorRoutes } from "@/lib/operator-route-management";
import { listTrips } from "@/lib/operator-trips";
import {
  formatDate,
  formatTime,
  parseSearchDate,
  sameDay,
} from "@/lib/display-utils";

const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

type SearchPageParams = {
  from?: string;
  to?: string;
  date?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: SearchPageParams;
}) {
  const [routes, buses, trips] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listOperatorBuses("OP-201"),
    listTrips("OP-201"),
  ]);

  const defaultRoute = routes[0];
  const selectedFrom =
    searchParams?.from ?? defaultRoute?.fromCity ?? "Phnom Penh";
  const availableTo = routes
    .filter((route) => route.fromCity === selectedFrom)
    .map((route) => route.toCity);
  const selectedTo =
    searchParams?.to ??
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

  const availableTrips = trips.filter(
    (trip) => matchingRouteIds.has(trip.routeId) && sameDay(trip.tripDate, selectedDate)
  );

  const busLookup = Object.fromEntries(buses.map((bus) => [bus.id, bus]));

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
                {availableTrips.length} bus{availableTrips.length === 1 ? "" : "es"} found
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
          <form action="/search" method="get" className="flex flex-wrap gap-3">
            <select
              name="from"
              defaultValue={selectedFrom}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition focus:border-[#ed3d34]"
            >
              {Array.from(new Set(routes.map((route) => route.fromCity))).map((city) => (
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
            {[
              { label: "18:00-24:00", count: 54 },
              { label: "Luxury coaches", count: 26 },
              { label: "Reschedulable", count: 13 },
              { label: "Cancellable", count: 21 },
            ].map((filter) => (
              <button
                key={filter.label}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 px-4 py-2 text-left text-sm font-semibold text-stone-700 transition hover:border-[#ed3d34]"
              >
                <span>{filter.label}</span>
                <span className="text-xs text-stone-400">{filter.count}</span>
              </button>
            ))}
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

            {availableTrips.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-500">
                No trips match the selected corridor and date. Adjust the filters to see nearby departures.
              </div>
            ) : (
              <div className="space-y-4">
                {availableTrips.map((trip, index) => {
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
                        <button className="rounded-full bg-[#ed3d34] px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[#c12b30]">
                          View seats
                        </button>
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
