import {
  getCommissionSettings,
  listPayouts,
  listRefundRules,
  listSettlementReports,
  listTaxRules,
} from "@/lib/commission-finance";
import {
  createPayoutAction,
  updateCommissionAction,
  upsertRefundRuleAction,
} from "@/app/admin/finance/actions";

export default async function FinancePage() {
  const commission = await getCommissionSettings();
  const payouts = await listPayouts();
  const refundRules = await listRefundRules();
  const settlements = await listSettlementReports();
  const taxRules = await listTaxRules();

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-8 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Commission & Finance
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Platform economics</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form
            action={updateCommissionAction}
            className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 text-xs"
          >
            <p className="text-sm font-semibold text-stone-900">
              Platform commission
            </p>
            <div className="mt-4 flex gap-2">
              <input
                name="platformRate"
                defaultValue={commission.platformRate}
                className="w-1/2 rounded-full border border-stone-200 px-4 py-2 text-xs focus:border-amber-300"
              />
              <input
                name="operatorRate"
                defaultValue={commission.operatorRate}
                className="w-1/2 rounded-full border border-stone-200 px-4 py-2 text-xs focus:border-amber-300"
              />
            </div>
            <button
              type="submit"
              className="mt-4 rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
            >
              Save rates
            </button>
          </form>
        <form
          action={createPayoutAction}
          className="rounded-[24px] border border-stone-200 bg-white p-5 text-xs shadow"
        >
            <p className="text-sm font-semibold text-stone-900">
              Schedule payout
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                name="operatorId"
                placeholder="Operator ID"
                className="rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
              />
              <input
                name="amount"
                placeholder="Amount"
                type="number"
                className="rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
              />
              <input
                name="payoutDate"
                type="date"
                className="rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
              />
            </div>
            <button
              type="submit"
              className="mt-3 rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900"
            >
              Create payout
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Refund rules</h2>
          <form
            action={upsertRefundRuleAction}
            className="mt-3 flex flex-wrap gap-2 text-xs"
          >
            <input
              name="description"
              placeholder="Description"
              className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
            />
            <input
              name="minNoticeDays"
              type="number"
              placeholder="Min notice days"
              className="w-24 rounded-full border border-stone-200 px-3 py-2 focus:border-amber-300"
            />
            <input
              name="penaltyPercent"
              type="number"
              placeholder="Penalty %"
              className="w-24 rounded-full border border-stone-200 px-3 py-2 focus:border-amber-300"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Save rule
            </button>
          </form>
          <div className="mt-4 space-y-2 text-xs text-stone-500">
            {refundRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-stone-100 px-4 py-2">
                <p className="font-semibold text-stone-900">{rule.description}</p>
                <p>
                  {rule.minNoticeDays}d notice — {rule.penaltyPercent}% penalty
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Settlement reports</h2>
            <div className="mt-3 space-y-2 text-xs text-stone-500">
              {settlements.map((report) => (
                <div key={report.id} className="rounded-lg border border-stone-100 px-4 py-3">
                  <p className="font-semibold text-stone-900">
                    {report.periodStart.toDateString()} –{" "}
                    {report.periodEnd.toDateString()}
                  </p>
                  <p>Total volume: ${report.totalVolume.toLocaleString()}</p>
                  <p>Commission: ${report.totalCommission.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">Tax & invoices</h2>
            <div className="mt-3 space-y-2 text-xs text-stone-500">
              {taxRules.map((rule) => (
                <div key={rule.id} className="rounded-lg border border-stone-100 px-4 py-3">
                  <p className="font-semibold text-stone-900">{rule.country}</p>
                  <p>VAT: {rule.vatPercent}%</p>
                  <p>{rule.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Upcoming payouts</h2>
        <div className="mt-3 text-xs text-stone-500">
          {payouts.length ? (
            <ul className="space-y-2">
              {payouts.map((payout) => (
                <li key={payout.id} className="rounded-lg border border-stone-100 px-4 py-2">
                  <p className="font-semibold text-stone-900">{payout.operatorId}</p>
                  <p>
                    {payout.amount} USD — {payout.payoutDate.toDateString()} ({payout.status})
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">No payouts scheduled.</p>
          )}
        </div>
      </section>
    </main>
  );
}
