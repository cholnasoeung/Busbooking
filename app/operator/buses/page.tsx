import {
  amenityCatalog,
  Amenity,
  busTypeCatalog,
  listOperatorBuses,
} from "@/lib/operator-bus-management";
import { listOperatorStaff } from "@/lib/operator-portal";
import {
  assignDriverAction,
  createBusAction,
  updateAmenitiesAction,
  updateRegistrationAction,
  updateSeatLayoutAction,
} from "./actions";

function formatDateLabel(value?: Date | null) {
  if (!value) return "Not set";
  return value.toLocaleDateString();
}

function toDateInputValue(value?: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export default async function OperatorBusesPage() {
  const [buses, staff] = await Promise.all([
    listOperatorBuses("OP-201"),
    listOperatorStaff(),
  ]);

  const staffNames = staff.map((member) => member.fullName);

  return (
    <main className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Bus management</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Build, register, and deploy every coach in your fleet.
        </h1>
        <p className="mt-2 text-sm text-stone-300">
          Add new vehicles, map seat layouts, flag amenities, and keep driver rosters aligned
          with each registration record.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)]">
        <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
          <h2 className="text-lg font-semibold text-white">Add a new bus</h2>
          <form action={createBusAction} className="mt-4 grid gap-3 text-xs text-stone-300">
            <input
              name="name"
              placeholder="Bus name"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <select
              name="type"
              className="w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
              defaultValue="standard"
            >
              {busTypeCatalog.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              name="registrationNumber"
              placeholder="Registration number"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <input
              name="registrationAuthority"
              placeholder="Registration authority"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[0.7rem] text-stone-400">
                Inspection due
                <input
                  name="inspectionDue"
                  type="date"
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
              <label className="text-[0.7rem] text-stone-400">
                Insurance due
                <input
                  name="insuranceDue"
                  type="date"
                  className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                />
              </label>
            </div>
            <textarea
              name="seatLayout"
              rows={3}
              placeholder="Seat layout (comma separated seats, newline for each row)"
              className="rounded-2xl border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <input
              name="amenities"
              placeholder="Amenities (comma separated, e.g. Wi-Fi, USB charging)"
              className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
            >
              Save bus
            </button>
          </form>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow">
          <h2 className="text-lg font-semibold text-white">Bus types</h2>
          <p className="mt-2 text-xs text-stone-400">
            Pick the type that matches your coach, then build a layout that mirrors the real
            cabin.
          </p>
          <div className="mt-4 space-y-4 text-xs text-stone-200">
            {busTypeCatalog.map((type) => (
              <div
                key={type.id}
                className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-sm"
              >
                <p className="text-sm font-semibold text-white">{type.label}</p>
                <p className="text-[0.75rem] text-stone-300">{type.description}</p>
                <p className="mt-2 text-[0.65rem] text-stone-400">{type.capacityRange}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-6">
        {buses.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-sm text-stone-400">
            No buses registered yet.
          </div>
        ) : (
          buses.map((bus) => {
            // Normalized seat layout is always a string
            const layoutValue = bus.seatLayout ?? "";
            // Parse seat layout to calculate seat count
            const seatRows = layoutValue
              .split(/\r?\n/)
              .map((row) =>
                row
                  .split(",")
                  .map((seat) => seat.trim())
                  .filter(Boolean)
              )
              .filter((row) => row.length);
            const seatCount = seatRows.reduce((total, row) => total + row.length, 0);
            
            // Safe handling of amenities array
            const amenitiesList = Array.isArray(bus.amenities) ? bus.amenities : [];
            const customAmenities = amenitiesList.filter(
              (amenity) => !amenityCatalog.includes(amenity as Amenity)
            );
            
            // Safe handling of crew array
            const crewList = Array.isArray(bus.crew) ? bus.crew : [];
            const customCrew = crewList.filter((name) => !staffNames.includes(name));

            return (
              <article
                key={bus.id}
                className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow"
              >
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
                      {bus.type?.toUpperCase() ?? "UNKNOWN"}
                    </p>
                    <h2 className="text-2xl font-semibold text-white">{bus.name ?? "Unnamed Bus"}</h2>
                  </div>
                  <div className="text-xs text-stone-300">
                    Seats: <span className="font-semibold text-white">{seatCount}</span>
                  </div>
                </header>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300">
                    <p className="text-[0.65rem] text-stone-400">Registration</p>
                    <p className="text-sm text-white">{bus.registration?.registrationNumber ?? "N/A"}</p>
                    <p className="text-[0.65rem] text-stone-400">
                      {bus.registration?.authority ?? "N/A"}
                    </p>
                    <p className="mt-2 text-[0.65rem]">
                      Inspection due {formatDateLabel(bus.registration?.inspectionDue)}
                    </p>
                    <p className="text-[0.65rem]">
                      Insurance due {formatDateLabel(bus.registration?.insuranceDue)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300">
                    <p className="text-[0.65rem] text-stone-400">Driver</p>
                    <p className="text-sm text-white">{bus.driver?.name ?? "Unassigned"}</p>
                    <p className="text-[0.65rem] text-stone-400">
                      License {bus.driver?.license ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300">
                    <p className="text-[0.65rem] text-stone-400">Amenities</p>
                    <div className="mt-2 flex flex-wrap gap-1 text-[0.65rem]">
                      {amenitiesList.length > 0 ? (
                        amenitiesList.map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full border border-white/20 px-2 py-0.5 text-white"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-500">No amenities</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <form
                    action={updateSeatLayoutAction}
                    className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
                  >
                    <input type="hidden" name="busId" value={bus.id} />
                    <p className="text-[0.65rem] text-stone-400">Seat layout builder</p>
                    <textarea
                      name="seatLayout"
                      rows={4}
                      defaultValue={layoutValue}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <p className="mt-1 text-[0.65rem] text-stone-500">
                      Use newline to split rows and commas to separate seats.
                    </p>
                    <button
                      type="submit"
                      className="mt-3 rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
                    >
                      Update layout
                    </button>
                  </form>

                  <form
                    action={updateAmenitiesAction}
                    className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
                  >
                    <input type="hidden" name="busId" value={bus.id} />
                    <p className="text-[0.65rem] text-stone-400">Amenities setup</p>
                    <div className="mt-2 grid gap-2 text-white">
                      {amenityCatalog.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 text-[0.75rem]">
                          <input
                            type="checkbox"
                            name="amenityOption"
                            value={amenity}
                            defaultChecked={amenitiesList.includes(amenity)}
                            className="h-4 w-4 accent-amber-400"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                    <input
                      name="amenityExtra"
                      defaultValue={customAmenities.join(", ")}
                      placeholder="Custom extras"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <button
                      type="submit"
                      className="mt-3 rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
                    >
                      Save amenities
                    </button>
                  </form>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <form
                    action={updateRegistrationAction}
                    className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
                  >
                    <input type="hidden" name="busId" value={bus.id} />
                    <p className="text-[0.65rem] text-stone-400">Registration details</p>
                    <input
                      name="registrationNumber"
                      defaultValue={bus.registration?.registrationNumber ?? ""}
                      placeholder="Registration number"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <input
                      name="registrationAuthority"
                      defaultValue={bus.registration?.authority ?? ""}
                      placeholder="Authority"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input
                        name="inspectionDue"
                        type="date"
                        defaultValue={toDateInputValue(bus.registration?.inspectionDue)}
                        className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                      />
                      <input
                        name="insuranceDue"
                        type="date"
                        defaultValue={toDateInputValue(bus.registration?.insuranceDue)}
                        className="rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
                    >
                      Update registration
                    </button>
                  </form>

                  <form
                    action={assignDriverAction}
                    className="rounded-2xl border border-white/10 bg-stone-900/60 p-4 text-xs text-stone-300"
                  >
                    <input type="hidden" name="busId" value={bus.id} />
                    <p className="text-[0.65rem] text-stone-400">Driver & crew</p>
                    <input
                      name="driverName"
                      defaultValue={bus.driver?.name ?? ""}
                      placeholder="Driver name"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <input
                      name="driverLicense"
                      defaultValue={bus.driver?.license ?? ""}
                      placeholder="License number"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <p className="mt-3 text-[0.65rem] text-stone-400">Assign staff</p>
                    <div className="mt-2 grid gap-2 text-[0.75rem]">
                      {staff.map((member) => (
                        <label key={member.id} className="flex items-center gap-2 text-white">
                          <input
                            type="checkbox"
                            name="crew"
                            value={member.fullName}
                            defaultChecked={crewList.includes(member.fullName)}
                            className="h-4 w-4 accent-amber-400"
                          />
                          {member.fullName} <span className="text-stone-400">({member.role})</span>
                        </label>
                      ))}
                    </div>
                    <input
                      name="additionalCrew"
                      defaultValue={customCrew.join(", ")}
                      placeholder="External crew (comma separated)"
                      className="mt-2 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                    <button
                      type="submit"
                      className="mt-3 rounded-full border border-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-amber-200"
                    >
                      Save driver & crew
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
