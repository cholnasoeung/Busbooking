import type { SearchFilterDefinition } from "@/lib/search-filter-management";
import { createSearchFilterAction, deleteSearchFilterAction } from "../actions";

type FilterManagementCardProps = {
  filters: SearchFilterDefinition[];
};

function renderPayloadSummary(payload: SearchFilterDefinition["payload"]) {
  if ("startHour" in payload && "endHour" in payload) {
    return `${payload.startHour}:00 - ${payload.endHour}:00`;
  }
  if ("busTypes" in payload) {
    return payload.busTypes.join(", ");
  }
  if ("statuses" in payload) {
    return payload.statuses.join(", ");
  }
  return JSON.stringify(payload);
}

export function FilterManagementCard({ filters }: FilterManagementCardProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Filters</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Search filters</h2>
          <p className="mt-1 text-sm text-stone-400">
            Control the filter chips shown on the landing search results page. New filters are seeded automatically and can be tuned here.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          Manage
        </span>
      </div>

      <form action={createSearchFilterAction} className="mt-5 grid gap-3 text-xs text-stone-300">
        <label className="grid gap-2 text-stone-200">
          Label
          <input
            name="label"
            required
            placeholder="Example: Late night"
            className="rounded-2xl border border-white/20 bg-stone-950 px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="grid gap-2 text-stone-200">
          Type
          <select
            name="type"
            defaultValue="time-window"
            className="rounded-2xl border border-white/20 bg-stone-950 px-4 py-3 text-sm text-white"
          >
            <option value="time-window">Time window (e.g., 18-22)</option>
            <option value="bus-type">Bus type (e.g., vip,deluxe)</option>
            <option value="status">Trip status (e.g., scheduled,boarding)</option>
          </select>
        </label>
        <label className="grid gap-2 text-stone-200">
          Payload
          <input
            name="payload"
            required
            placeholder="Payload per type, comma separated"
            className="rounded-2xl border border-white/20 bg-stone-950 px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="grid gap-2 text-stone-200">
          Description (optional)
          <input
            name="description"
            placeholder="Why does this filter exist?"
            className="rounded-2xl border border-white/20 bg-stone-950 px-4 py-3 text-sm text-white"
          />
        </label>
        <p className="text-[0.65rem] text-stone-500">
          Time payload expects a hyphen-separated range (start-end). Bus type and status payloads accept comma-separated values.
        </p>
        <button
          type="submit"
          className="rounded-full border border-amber-400 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-200"
        >
          Add filter
        </button>
      </form>

      <div className="mt-6 space-y-3 text-sm text-stone-300">
        {filters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-xs text-stone-400">
            No filters configured yet.
          </div>
        ) : (
          filters.map((filter) => (
            <article
              key={filter.id}
              className="rounded-3xl border border-white/10 bg-stone-950/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{filter.label}</p>
                  <p className="text-[0.7rem] text-stone-400">
                    {filter.description ?? filter.type}
                  </p>
                </div>
                <form action={deleteSearchFilterAction} className="text-xs">
                  <input type="hidden" name="filterId" value={filter.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-400/60 px-3 py-1 font-semibold text-red-200"
                  >
                    Delete
                  </button>
                </form>
              </div>
              <p className="mt-2 text-[0.7rem] text-stone-400">
                Payload: {renderPayloadSummary(filter.payload)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}