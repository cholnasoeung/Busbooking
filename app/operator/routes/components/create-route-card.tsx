import { createRouteAction } from "../actions";

type CreateRouteCardProps = {
  cityOptions: string[];
};

export function CreateRouteCard({ cityOptions }: CreateRouteCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
            Step 1
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Create route corridor</h2>
          <p className="mt-2 text-sm text-stone-400">
            Start with the main route, then the stop and schedule sections will reuse it.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
          New route
        </span>
      </div>

      <form action={createRouteAction} className="mt-5 grid gap-4 text-xs">
        <input type="hidden" name="operatorId" value="OP-201" />

        <label className="grid gap-2 text-stone-300">
          Route name
          <input
            name="routeName"
            required
            placeholder="Example: Phnom Penh to Kampot Express"
            className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-stone-300">
            From city
            <input
              name="fromCity"
              list="route-city-options"
              required
              placeholder="Select or type city"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>

          <label className="grid gap-2 text-stone-300">
            To city
            <input
              name="toCity"
              list="route-city-options"
              required
              placeholder="Select or type city"
              className="rounded-full border border-white/20 bg-stone-950 px-4 py-3 text-white"
            />
          </label>
        </div>

        <label className="grid gap-2 text-stone-300">
          Planned stops
          <textarea
            name="stops"
            rows={4}
            placeholder="Olympic Circle, Central Market, Kampot Terminal"
            className="rounded-3xl border border-white/20 bg-stone-950 px-4 py-3 text-white"
          />
        </label>

        <p className="text-[0.7rem] text-stone-500">
          Tip: separate each stop with a comma. Boarding and drop points can be added in the next
          section.
        </p>

        <button
          type="submit"
          className="rounded-full border border-amber-400 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-200"
        >
          Save route
        </button>
      </form>

      <datalist id="route-city-options">
        {cityOptions.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </article>
  );
}