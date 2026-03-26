import { createZoneAction } from "@/app/admin/route-city/actions";
import { listZones } from "@/lib/route-city-management";

export default async function ZonesPage() {
  const zones = await listZones();

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Service zones</h1>
        <p className="text-sm text-stone-500">
          Define geographic service zones that operators must respect.
        </p>
        <form
          action={createZoneAction}
          className="mt-4 flex flex-wrap gap-2 text-xs"
        >
          <input
            name="name"
            required
            placeholder="Zone name"
            className="rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
          />
          <input
            name="description"
            required
            placeholder="Description"
            className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
          />
          <button
            type="submit"
            className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-200"
          >
            Add zone
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 text-left">Zone</th>
              <th className="px-4 py-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {zones.map((zone) => (
              <tr key={zone.id} className="text-stone-700">
                <td className="px-4 py-4">
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-xs text-stone-500">{zone.id}</div>
                </td>
                <td className="px-4 py-4 text-xs text-stone-500">
                  {zone.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
