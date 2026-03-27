import {
  addDiscountCampaignAction,
  setBaseFareAction,
  setCommissionAction,
  toggleDiscountCampaignAction,
  updateDynamicPricingAction,
  updateWeekendHolidayAction,
} from "./actions";
import { getPricingProfile } from "@/lib/operator-pricing";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatDate(value?: Date | null) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
}

function formatCampaignValue(value: number, type: "percentage" | "flat") {
  return type === "percentage" ? `${value}%` : currencyFormatter.format(value);
}

export default async function OperatorPricingPage() {
  const profile = await getPricingProfile("OP-201");

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-white shadow">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Pricing management</p>
            <h1 className="text-2xl font-semibold">Control fares, campaigns, and commissions.</h1>
          </div>
          <p className="text-xs text-stone-400">
            Every change revalidates automatically so your operators always see the latest rates.
          </p>
        </header>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action={setBaseFareAction}
            className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">Base fare</p>
            <label className="mt-3 text-[0.75rem] text-stone-300">
              Ticket price (USD)
              <input
                name="baseFare"
                type="number"
                step="0.25"
                defaultValue={profile.baseFare}
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
            <p className="mt-1 text-[0.65rem] text-stone-500">
              This overrides the starting fare that all routes quote by default.
            </p>
            <button
              type="submit"
              className="mt-4 w-full rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Save base fare
            </button>
          </form>

          <form
            action={updateDynamicPricingAction}
            className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">Dynamic pricing</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-[0.75rem] text-stone-300">
                Peak multiplier
                <input
                  name="peakMultiplier"
                  type="number"
                  step="0.05"
                  defaultValue={profile.dynamicPricing.peakMultiplier}
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-[0.75rem] text-stone-300">
                Off-peak multiplier
                <input
                  name="offPeakMultiplier"
                  type="number"
                  step="0.05"
                  defaultValue={profile.dynamicPricing.offPeakMultiplier}
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-[0.75rem] text-stone-300">
                Min distance surcharge
                <input
                  name="minDistanceSurcharge"
                  type="number"
                  step="0.5"
                  defaultValue={profile.dynamicPricing.minDistanceSurcharge}
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-[0.75rem] text-stone-300">
                Max distance surcharge
                <input
                  name="maxDistanceSurcharge"
                  type="number"
                  step="0.5"
                  defaultValue={profile.dynamicPricing.maxDistanceSurcharge}
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
            </div>
            <p className="mt-2 text-[0.65rem] text-stone-500">
              Peak/off-peak multipliers scale the base fare; distance surcharges give you precise control
              over long itineraries.
            </p>
            <button
              type="submit"
              className="mt-4 w-full rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Update dynamic pricing
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          action={updateWeekendHolidayAction}
          className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-xs text-stone-300 shadow"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-amber-300">Weekend & holiday</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[0.75rem] text-stone-300">
              Weekend multiplier
              <input
                name="weekendMultiplier"
                type="number"
                step="0.05"
                defaultValue={profile.weekendMultiplier}
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-[0.75rem] text-stone-300">
              Holiday multiplier
              <input
                name="holidayMultiplier"
                type="number"
                step="0.05"
                defaultValue={profile.holidayMultiplier}
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
          </div>
          <p className="mt-2 text-[0.65rem] text-stone-500">
            Combine these with the base fare to ensure weekends and holidays earn the right premium.
          </p>
          <button
            type="submit"
            className="mt-4 w-full rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
          >
            Save weekend & holiday rates
          </button>
        </form>

        <div className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-xs text-stone-300 shadow">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-amber-300">Commission</p>
          <p className="mt-2 text-[0.75rem] text-white">
            Platform commission settings
          </p>
          <form
            action={setCommissionAction}
            className="mt-4 flex flex-col gap-3"
          >
            <label className="text-[0.75rem] text-stone-300">
              Commission percent
              <input
                name="commissionPercent"
                type="number"
                min={0}
                max={100}
                step="1"
                defaultValue={profile.commission.percent}
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-[0.75rem] text-stone-300">
              Note
              <input
                name="commissionNote"
                defaultValue={profile.commission.note}
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
            <button
              type="submit"
              className="mt-2 w-full rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Save commission
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-xs text-stone-300 shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">Discount campaigns</p>
            <p className="text-[0.8rem] text-stone-400">
              Rewards and promotional boosts that apply on top of the current fares.
            </p>
          </div>
        </div>
        {profile.discountCampaigns.length === 0 ? (
          <p className="text-[0.75rem] text-stone-500">No campaigns configured yet.</p>
        ) : (
          <div className="grid gap-3">
            {profile.discountCampaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-stone-950/80 p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{campaign.name}</p>
                    <p className="text-[0.65rem] text-stone-400">
                      {campaign.type === "percentage" ? "Percentage" : "Flat amount"}
                    </p>
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    {campaign.active ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-stone-300">
                  <span>{formatCampaignValue(campaign.value, campaign.type)}</span>
                  <span>
                    Starts {formatDate(campaign.startsAt)}
                    {campaign.endsAt ? ` • Ends ${formatDate(campaign.endsAt)}` : ""}
                  </span>
                  <form
                    action={toggleDiscountCampaignAction}
                    className="ml-auto"
                  >
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={campaign.active ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] font-semibold text-white hover:border-amber-400"
                    >
                      {campaign.active ? "Pause" : "Activate"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}

        <form
          action={addDiscountCampaignAction}
          className="grid gap-3 rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-amber-300">Add campaign</p>
          <input
            name="campaignName"
            placeholder="Campaign name"
            className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="campaignType"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              defaultValue="percentage"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
            <input
              name="campaignValue"
              type="number"
              step="0.5"
              placeholder="Value"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[0.7rem] text-stone-400">
              Starts
              <input
                name="startsAt"
                type="date"
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
            <label className="text-[0.7rem] text-stone-400">
              Ends
              <input
                name="endsAt"
                type="date"
                className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
          >
            Add campaign
          </button>
        </form>
      </section>
    </main>
  );
}
