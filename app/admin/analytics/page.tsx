import { getBookingMetrics, listTopRoutes } from "@/lib/analytics";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

export default async function AnalyticsPage() {
  const [metrics, topRoutes] = await Promise.all([
    getBookingMetrics(),
    listTopRoutes(5),
  ]);

  const stats = [
    {
      label: "Total bookings",
      value: metrics.totalBookings.toLocaleString(),
      detail: "Booked journeys over the period",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.revenue),
      detail: "Settled ticket value",
    },
    {
      label: "GMV",
      value: formatCurrency(metrics.gmv),
      detail: "Total ticket volume (includes cancellations)",
    },
    {
      label: "Repeat customers",
      value: metrics.repeatCustomers.toLocaleString(),
      detail: "Passengers with multiple trips",
    },
    {
      label: "Conversion rate",
      value: formatPercent(metrics.conversionRate),
      detail: "Bookings/searches ratio",
    },
    {
      label: "Failed payment rate",
      value: formatPercent(metrics.failedPaymentRate),
      detail: "Failed payment attempts vs attempts",
    },
    {
      label: "Cancellation rate",
      value: formatPercent(metrics.cancellationRate),
      detail: "Cancellations / completed + cancelled",
    },
  ];

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Analytics dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          Measure the pulse of the platform
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Presentations at a glance for bookings, revenue, conversion, routes, and risk KPIs.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 text-xs text-stone-500 shadow-[0_15px_45px_rgba(28,25,23,0.06)]"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-stone-900">{stat.value}</p>
            <p className="mt-1 text-[0.7rem] text-stone-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Top routes</h2>
            <p className="text-xs text-stone-500">
              Highest-booked corridors and the revenue they contribute.
            </p>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-stone-400">
            Updated live
          </p>
        </div>
        <div className="overflow-hidden rounded-[24px] border border-stone-100">
          <table className="min-w-full text-sm text-stone-600">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 text-left font-normal">Route</th>
                <th className="px-4 py-3 text-center font-normal">Bookings</th>
                <th className="px-4 py-3 text-right font-normal">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {topRoutes.map((route) => (
                <tr key={route.route} className="bg-white text-stone-700">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-stone-900">{route.route}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {route.bookings}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-900">
                    {formatCurrency(route.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
