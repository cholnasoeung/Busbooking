import { buildBookingReports } from "@/lib/operator-reports";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-300">{title}</p>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {detail && <p className="mt-1 text-sm text-stone-400">{detail}</p>}
    </div>
  );
}

export default async function OperatorReportsPage() {
  const reports = await buildBookingReports("OP-201");
  const latestSales = reports.dailySales.at(-1);
  const totalOccupancy =
    reports.occupancy.reduce((sum, entry) => sum + entry.occupancyRate, 0) /
    Math.max(reports.occupancy.length, 1);
  const totalRevenue = reports.revenueByRoute.reduce((sum, entry) => sum + entry.revenue, 0);

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-white shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold">Revenue, occupancy, and booking health.</h1>
        <p className="mt-2 text-sm text-stone-400">
          Snapshot every metric that keeps operators ahead: daily sales, occupancy, cancellations, refunds, and agent activity.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Daily sales"
          value={latestSales ? currencyFormatter.format(latestSales.totalSales) : "$0.00"}
          detail={latestSales ? `Trips: ${latestSales.trips}` : "No trips yet"}
        />
        <SummaryCard
          title="Average occupancy"
          value={formatPercent(totalOccupancy)}
          detail={`${reports.occupancy.length} trips measured`}
        />
        <SummaryCard
          title="Revenue this period"
          value={currencyFormatter.format(totalRevenue)}
          detail={`Route count: ${reports.revenueByRoute.length}`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">Revenue by route</h2>
          {reports.revenueByRoute.length === 0 ? (
            <p className="text-stone-500">No revenue to report.</p>
          ) : (
            <div className="space-y-2">
              {reports.revenueByRoute.map((route) => (
                <div
                  key={route.routeName}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3"
                >
                  <span>{route.routeName}</span>
                  <strong>{currencyFormatter.format(route.revenue)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">Occupancy rates</h2>
          {reports.occupancy.length === 0 ? (
            <p className="text-stone-500">No occupancy data yet.</p>
          ) : (
            <div className="space-y-2">
              {reports.occupancy.map((entry) => (
                <div
                  key={entry.tripId}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.routeName}</p>
                    <p className="text-[0.7rem] text-stone-400">
                      {entry.occupiedSeats}/{entry.totalSeats} seats
                    </p>
                  </div>
                  <strong>{formatPercent(entry.occupancyRate)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">Cancellations</h2>
          {reports.cancellationReport.length === 0 ? (
            <p className="text-stone-500">No cancellations recorded.</p>
          ) : (
            <ul className="space-y-3">
              {reports.cancellationReport.map((entry) => (
                <li key={`${entry.tripId}-${entry.passengerName}`} className="rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{entry.passengerName}</p>
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
                      {entry.tripDate}
                    </span>
                  </div>
                  <p className="text-[0.75rem] text-stone-400">{entry.routeName}</p>
                  {entry.reason && <p className="text-[0.7rem] text-rose-300">Reason: {entry.reason}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">Refunds</h2>
          {reports.refundReport.length === 0 ? (
            <p className="text-stone-500">No refunds yet.</p>
          ) : (
            <ul className="space-y-3">
              {reports.refundReport.map((entry) => (
                <li key={`${entry.tripId}-${entry.amount}`} className="rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{entry.routeName}</p>
                    <strong>{currencyFormatter.format(entry.amount)}</strong>
                  </div>
                  <p className="text-[0.7rem] text-stone-400">{entry.tripDate}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">Popular routes</h2>
          {reports.popularRoutes.length === 0 ? (
            <p className="text-stone-500">No trips yet.</p>
          ) : (
            <ol className="space-y-2 text-sm text-white">
              {reports.popularRoutes.map((route, index) => (
                <li key={route.routeName} className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3">
                  <span>{index + 1}. {route.routeName}</span>
                  <span className="text-stone-400">{route.passengerCount} pax</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-xs text-stone-300 shadow">
          <h2 className="text-lg font-semibold text-white">{reports.agentSales.length ? "Agent sales" : "Agent sales (none)"}</h2>
          {reports.agentSales.length === 0 ? (
            <p className="text-stone-500">No agent bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {reports.agentSales.map((entry) => (
                <li key={entry.agentName} className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-950/60 px-4 py-3">
                  <span>{entry.agentName}</span>
                  <strong>{currencyFormatter.format(entry.revenue)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
