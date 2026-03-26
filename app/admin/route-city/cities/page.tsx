import { listCities } from "@/lib/route-city-management";
import {
  createCityAction,
  editCityAction,
  deleteCityAction,
  standardizeCitiesAction,
} from "@/app/admin/route-city/actions";
import { DeleteConfirmButton } from "@/app/admin/users/components/delete-confirm-button";

export default async function CitiesPage() {
  const cities = await listCities();

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold">Cities</h1>
        <p className="text-sm text-stone-500">
          Add or edit city names and normalize them for routing.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <form
            action={createCityAction}
            className="flex flex-wrap gap-2 text-xs"
          >
            <input
              name="name"
              required
              placeholder="City name"
              className="rounded-full border border-stone-200 px-4 py-2 text-xs focus:border-amber-300"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-200"
            >
              Add
            </button>
          </form>
          <form action={standardizeCitiesAction}>
            <button
              type="submit"
              className="rounded-full border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-900 hover:border-amber-300"
            >
              Standardize names
            </button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">
                Normalized
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {cities.map((city) => (
              <tr key={city.id} className="text-stone-700">
                <td className="px-4 py-4">
                  <div className="font-medium">{city.name}</div>
                  <div className="text-xs text-stone-500">{city.id}</div>
                </td>
                <td className="px-4 py-4 text-xs text-stone-500">
                  {city.normalizedName}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={editCityAction} className="flex gap-2 text-xs">
                      <input type="hidden" name="id" value={city.id} />
                      <input
                        name="name"
                        defaultValue={city.name}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-stone-950 px-4 py-1 text-xs font-semibold text-stone-50 hover:bg-stone-800"
                      >
                        Save
                      </button>
                    </form>
                    <DeleteConfirmButton id={city.id} action={deleteCityAction} />
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
