import Link from "next/link";
import { busTypeCatalog, listOperatorBuses } from "@/lib/operator-bus-management";
import { listOperatorRoutes } from "@/lib/operator-route-management";
import { formatDate } from "@/lib/display-utils";

const typeLabelLookup = Object.fromEntries(
  busTypeCatalog.map((type) => [type.id, type.label])
) as Record<string, string>;

export default async function Home() {
  const [routes, buses] = await Promise.all([
    listOperatorRoutes("OP-201"),
    listOperatorBuses("OP-201"),
  ]);

  const heroBus = buses[0];
  const activeBuses = buses.filter((bus) => bus.status === "active").length;
  const fromCities = Array.from(new Set(routes.map((route) => route.fromCity)));
  const toCities = Array.from(new Set(routes.map((route) => route.toCity)));
  const todayValue = new Date().toISOString().split("T")[0];
  const defaultFrom = fromCities[0] ?? "Phnom Penh";
  const defaultTo =
    routes.find((route) => route.fromCity === defaultFrom)?.toCity ??
    toCities[0] ??
    "Siem Reap";

  return (
    <main className="min-h-screen bg-[#faf6f2] text-stone-950">
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#ed3d34] via-[#bd1f29] to-[#78131b] px-6 py-16 sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-[120px] sm:h-[520px] sm:w-[520px]"></div>
        <div className="absolute inset-y-0 right-0 w-[260px] rounded-l-full bg-[#ff5d5a]/20 blur-[60px] md:w-[320px]"></div>
        <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/80">redBus</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Book Bus Tickets Online in Cambodia and beyond
            </h1>
            <p className="text-lg text-white/90">
              Manage live fleet insights, publish routes, and delight passengers
              with the confidence of an international platform tuned to your
              database.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/operator/routes"
                className="rounded-[999px] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-stone-900 transition hover:bg-[#f3f3f3]"
              >
                Launch Routes
              </Link>
              <Link
                href="/operator/buses"
                className="rounded-[999px] border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:border-white"
              >
                View Fleet
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-sm rounded-[32px] border border-white/40 bg-white/10 p-6 text-white backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">
              Featured bus
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {heroBus?.name ?? "Awaiting fleet data"}
            </h2>
            <p className="text-sm text-white/90">
              {heroBus ? typeLabelLookup[heroBus.type] : "Operator fleet link"}
            </p>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              {heroBus ? (
                <>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/70">
                      Inspection
                    </p>
                    <p className="text-lg font-semibold">
                      {formatDate(heroBus.registration.inspectionDue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/70">
                      Insurance
                    </p>
                    <p className="text-lg font-semibold">
                      {formatDate(heroBus.registration.insuranceDue)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="col-span-2 text-sm text-white/80">
                  Connect to your Mongo collection to reveal live registration and
                  crew details.
                </p>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80">
              <span className="rounded-full border border-white/40 px-3 py-1">
                {heroBus?.status ?? "Status pending"}
              </span>
              <span className="rounded-full border border-white/40 px-3 py-1">
                {heroBus?.driver?.license ?? "Driver info"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-y border-stone-200 bg-white px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 rounded-[30px] border border-stone-100 bg-[#fff4ef] p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
              Search the fleet
            </p>
            <h3 className="text-3xl font-semibold text-stone-900">
              Pick your corridor, choose the date, and jump to live buses
            </h3>
            <p className="text-sm text-stone-500">
              Route data is drawn straight from MongoDB. Submit the form to land
              on a dedicated results page with all departures, filters, and
              seats.
            </p>
          </div>
          <form
            action="/search"
            method="get"
            className="grid gap-3 rounded-[24px] border border-white/40 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          >
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-500">
                From
              </label>
              <select
                name="from"
                defaultValue={defaultFrom}
                className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-900"
              >
                {fromCities.map((city) => (
                  <option key={`from-${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-500">
                To
              </label>
              <select
                name="to"
                defaultValue={defaultTo}
                className="mt-1 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-900"
              >
                {toCities.map((city) => (
                  <option key={`to-${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[0.6rem] uppercase tracking-[0.35em] text-stone-500">
                Date of journey
              </label>
              <input
                type="date"
                name="date"
                defaultValue={todayValue}
                className="mt-1 w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900"
              />
            </div>
            <button
              type="submit"
              className="mt-1 w-full rounded-2xl bg-[#f0282f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.5em] text-white transition hover:bg-[#d52227]"
            >
              Search buses
            </button>
          </form>
        </div>
      </section>

      <section className="w-full px-6 py-14 sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-stone-500">
                Offers for you
              </p>
              <h2 className="text-3xl font-semibold text-stone-900">
                Save on bus + ferry routes
              </h2>
            </div>
            <Link
              href="/operator/pricing"
              className="text-sm font-semibold text-stone-500 underline decoration-dotted underline-offset-4"
            >
              View more
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                id: "promo-1",
                badge: "Bus",
                title: "Save up to $10 on Bus and Ferry tickets",
                description:
                  "Stack local coupons and loyalty earned across Cambodia departures.",
                gradient: "from-[#ffe1d2] to-[#ffd2c9]",
              },
              {
                id: "promo-2",
                badge: "Bus",
                title: "Save up to 50% on Phnom Penh departures",
                description: "Limited seats remain on the Mekong Cruiser fleet this week.",
                gradient: "from-[#f9e9ff] to-[#d6f0ff]",
              },
              {
                id: "promo-3",
                badge: "Ferry",
                title: "Ferry journeys from Kep",
                description:
                  "Switch to ferry routes at special fares when you book the combo pass.",
                gradient: "from-[#c5f5ff] to-[#d0defc]",
              },
            ].map((offer) => (
              <article
                key={offer.id}
                className={`rounded-[28px] border border-stone-100 bg-gradient-to-br p-6 text-sm shadow-[0_25px_60px_rgba(15,23,42,0.08)] ${offer.gradient}`}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-stone-700">
                  {offer.badge}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {offer.title}
                </h3>
                <p className="mt-2 text-stone-600">{offer.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-t border-stone-200 bg-white px-6 pb-16 pt-12 sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-stone-500">
                Operator fleet
              </p>
              <h2 className="text-3xl font-semibold text-stone-900">
                Live fleet data from your database
              </h2>
              <p className="text-sm text-stone-500">
                {buses.length
                  ? `Showing ${buses.length} vehicle${buses.length === 1 ? "" : "s"}`
                  : "No buses found yet. Seeds are inserted automatically when the collection is empty."}
              </p>
              {buses.length > 0 && (
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-stone-400">
                  {activeBuses} active · {buses.length} total
                </p>
              )}
            </div>
            <Link
              href="/operator/buses"
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
            >
              Manage buses
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {buses.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-stone-200 bg-[#fef6ef] p-10 text-center text-sm text-stone-500">
                Waiting for seeded data... check database connection or seed
                scripts.
              </div>
            ) : (
              buses.map((bus) => {
                const statusClasses =
                  bus.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : bus.status === "maintenance"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600";
                const seatDetails =
                  bus.seatLayout
                    .split("\n")
                    .map((segment) => segment.trim())
                    .filter(Boolean)
                    .join(" • ") || "Custom layout";
                const typeLabel = typeLabelLookup[bus.type] ?? bus.type;

                return (
                  <article
                    key={bus.id}
                    className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_25px_50px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.45em] text-stone-400">
                          {typeLabel}
                        </p>
                        <h3 className="text-2xl font-semibold text-stone-900">
                          {bus.name}
                        </h3>
                        <p className="text-sm text-stone-500">{seatDetails}</p>
                      </div>
                      <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold ${statusClasses}`}
                      >
                        {bus.status}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-4 text-sm text-stone-500 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                          Registration
                        </p>
                        <p className="text-base font-semibold text-stone-900">
                          {bus.registration.registrationNumber}
                        </p>
                        <p className="text-xs text-stone-500">
                          {bus.registration.authority}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                          Inspection due
                        </p>
                        <p className="text-base font-semibold text-stone-900">
                          {formatDate(bus.registration.inspectionDue)}
                        </p>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                          Insurance due
                        </p>
                        <p className="text-base font-semibold text-stone-900">
                          {formatDate(bus.registration.insuranceDue)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-stone-500">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                          Driver
                        </p>
                        <p className="font-semibold text-stone-900">
                          {bus.driver?.name ?? "TBD"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {bus.driver?.license ?? "License pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                          Crew
                        </p>
                        <p className="font-semibold text-stone-900">
                          {bus.crew.length ? bus.crew.join(", ") : "Assign crew"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                      {bus.amenities.length ? (
                        bus.amenities.map((amenity) => (
                          <span
                            key={`${bus.id}-${amenity}`}
                            className="rounded-full border border-stone-200 px-3 py-1 text-[0.6rem] text-stone-600"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400">
                          No amenities listed yet
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
