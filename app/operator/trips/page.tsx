import { listTrips } from "@/lib/operator-trips";
import { addDelayNoteAction, changeTripStatusAction } from "./actions";

const statusOrder = ["scheduled", "boarding", "departed", "delayed", "arrived", "cancelled"] as const;

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  boarding: "Boarding",
  departed: "Departed",
  delayed: "Delayed",
  arrived: "Arrived",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  scheduled: "text-amber-300 border-amber-300",
  boarding: "text-cyan-300 border-cyan-300",
  departed: "text-emerald-300 border-emerald-300",
  delayed: "text-rose-300 border-rose-300",
  arrived: "text-sky-200 border-sky-200",
  cancelled: "text-stone-400 border-stone-400 line-through",
};

const statusSequence = {
  scheduled: ["boarding", "delayed", "cancelled"],
  boarding: ["departed", "delayed", "cancelled"],
  departed: ["arrived", "delayed", "cancelled"],
  delayed: ["departed", "cancelled"],
  arrived: [],
  cancelled: [],
};

export default async function OperatorTripsPage() {
  const trips = await listTrips("OP-201");

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-white shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Trip operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Mark statuses, note delays, and share driver info.</h1>
        <p className="mt-2 text-sm text-stone-400">
          Update every coach with live statuses, contact the driver, and log delay notes alongside GPS positions.
        </p>
      </section>

      <section className="grid gap-6">
        {trips.map((trip) => (
          <article
            key={trip.id}
            className="space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow"
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.4em] text-amber-300">{trip.routeName}</p>
                <h2 className="text-2xl font-semibold text-white">
                  {trip.busId} • {new Date(trip.tripDate).toLocaleDateString()}
                </h2>
                <p className="text-sm text-stone-400">
                  Driver: {trip.driver.name} • Contact <a className="text-amber-200" href={`tel:${trip.driver.phone}`}>{trip.driver.phone}</a>
                </p>
              </div>
              <span
                className={`rounded-full border px-4 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.4em] ${statusColors[trip.status] ?? ""}`}
              >
                {statusLabels[trip.status] ?? "Unknown"}
              </span>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300">
                <p className="uppercase tracking-[0.3em] text-amber-300">Live positions</p>
                <ul className="space-y-2">
                  {trip.livePositions.map((position, index) => (
                    <li key={index} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[0.7rem]">
                      <p>Lat: {position.coordinates.lat.toFixed(4)}, Lng: {position.coordinates.lng.toFixed(4)}</p>
                      <p className="text-[0.65rem] text-stone-400">
                        {position.note ?? "No note"} • {new Date(position.timestamp).toLocaleTimeString()}
                      </p>
                    </li>
                  ))}
                  {trip.livePositions.length === 0 && <li className="text-[0.7rem] text-stone-500">No GPS points yet.</li>}
                </ul>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300">
                <p className="uppercase tracking-[0.3em] text-amber-300">Delay notes</p>
                <ul className="space-y-1 text-[0.75rem] text-stone-200">
                  {trip.delayNotes.length === 0 ? (
                    <li className="text-stone-500">No delay notes.</li>
                  ) : (
                    trip.delayNotes.map((note, idx) => (
                      <li key={idx} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                        {note}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300">
                <p className="uppercase tracking-[0.3em] text-amber-300">Trip status</p>
                <form action={changeTripStatusAction} className="space-y-2">
                  <input type="hidden" name="tripId" value={trip.id} />
                  <select
                    name="status"
                    defaultValue={trip.status}
                    className="w-full rounded-full border border-white/10 bg-stone-900 px-3 py-2 text-white"
                  >
                    {(statusSequence[trip.status] ?? statusOrder).map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full rounded-full border border-amber-400 px-3 py-2 text-[0.7rem] font-semibold text-amber-200"
                  >
                    Mark status
                  </button>
                </form>
                <form action={addDelayNoteAction} className="space-y-2">
                  <input type="hidden" name="tripId" value={trip.id} />
                  <label className="text-[0.7rem] text-stone-400">
                    Delay note
                    <input
                      name="delayNote"
                      placeholder="Describe delay"
                      className="mt-1 w-full rounded-full border border-white/10 bg-stone-900 px-3 py-2 text-white"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-full border border-rose-400 px-3 py-2 text-[0.7rem] font-semibold text-rose-200"
                  >
                    Add note
                  </button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
