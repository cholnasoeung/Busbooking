import {
  createStopAction,
  updateStopAction,
  deleteStopAction,
} from "@/app/admin/route-city/actions";
import { DeleteConfirmButton } from "@/app/admin/users/components/delete-confirm-button";
import { listStops } from "@/lib/route-city-management";
import { listCities } from "@/lib/route-city-management";

export default async function StopsPage() {
  const stops = await listStops();
  const cities = await listCities();

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Stops</h1>
        <p className="text-sm text-stone-500">
          Assign stops to cities and service zones.
        </p>
        <form
          action={createStopAction}
          className="mt-4 flex flex-wrap gap-2 text-xs"
        >
          <input
            name="name"
            required
            placeholder="Stop name"
            className="flex-1 rounded-full border border-stone-200 px-4 py-2 focus:border-amber-300"
          />
          <select
            name="cityId"
            required
            className="w-40 rounded-full border border-stone-200 px-3 py-2 focus:border-amber-300"
          >
            <option value="">City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <input
            name="serviceZone"
            required
            placeholder="Service zone"
            className="w-32 rounded-full border border-stone-200 px-3 py-2 focus:border-amber-300"
          />
          <button
            type="submit"
            className="rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
          >
            Add
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 text-left">Stop</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">Service Zone</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {stops.map((stop) => (
              <tr key={stop.id} className="text-stone-700">
                <td className="px-4 py-4">
                  <div className="font-medium">{stop.name}</div>
                  <div className="text-xs text-stone-500">{stop.id}</div>
                </td>
                <td className="px-4 py-4 text-xs text-stone-500">
                  {cities.find((city) => city.id === stop.cityId)?.name ?? "—"}
                </td>
                <td className="px-4 py-4 text-xs text-stone-500">
                  {stop.serviceZone}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={updateStopAction} className="flex gap-2 text-xs">
                      <input type="hidden" name="id" value={stop.id} />
                      <input
                        name="name"
                        defaultValue={stop.name}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
                      />
                      <input
                        name="serviceZone"
                        defaultValue={stop.serviceZone}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-stone-950 px-4 py-1 text-xs font-semibold text-stone-50 hover:bg-stone-800"
                      >
                        Save
                      </button>
                    </form>
                    <DeleteConfirmButton id={stop.id} action={deleteStopAction} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
