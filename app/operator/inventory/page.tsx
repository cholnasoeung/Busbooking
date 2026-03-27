import { listOperatorBuses } from "@/lib/operator-bus-management";
import { listSeatInventories } from "@/lib/operator-inventory";
import {
  blockSeatsAction,
  releaseHeldSeatsAction,
  setBookingLimitAction,
  updateTotalSeatsAction,
} from "./actions";

function formatSeatList(seats: string[]) {
  if (seats.length === 0) {
    return "None";
  }
  return seats.join(", ");
}

function seatSummary(available: number, blocked: number, held: number) {
  return (
    <div className="flex flex-wrap gap-4 text-[0.75rem] text-stone-300">
      <span>
        Available <strong className="text-white">{available}</strong>
      </span>
      <span>
        Blocked <strong className="text-white">{blocked}</strong>
      </span>
      <span>
        Held <strong className="text-white">{held}</strong>
      </span>
    </div>
  );
}

export default async function OperatorInventoryPage() {
  const [buses, inventories] = await Promise.all([
    listOperatorBuses("OP-201"),
    listSeatInventories("OP-201"),
  ]);

  const busMap = new Map(buses.map((bus) => [bus.id, bus]));

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 shadow text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">
          Inventory & seat control
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Manage seat availability, blocks, and limits.</h1>
        <p className="mt-2 text-sm text-stone-400">
          Keep each coach balanced by tuning total capacity, responding to seat holds, and managing
          manual blocks and booking caps from one page.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {inventories.map((inventory) => {
          const bus = busMap.get(inventory.busId);
          const availableSeats = Math.max(
            inventory.totalSeats - inventory.blockedSeats.length - inventory.heldSeats.length,
            0
          );
          return (
            <article
              key={inventory.id}
              className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow text-white"
            >
              <header className="space-y-2">
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-amber-300">
                  {bus?.type?.toUpperCase() ?? "Coach"} • {inventory.busId}
                </p>
                <h2 className="text-xl font-semibold">{bus?.name ?? "Unnamed bus"}</h2>
                {seatSummary(availableSeats, inventory.blockedSeats.length, inventory.heldSeats.length)}
                <p className="text-[0.75rem] text-stone-400">
                  Total seats: <span className="font-semibold text-white">{inventory.totalSeats}</span>
                </p>
              </header>

              <div className="grid gap-4 md:grid-cols-2">
                <form
                  action={updateTotalSeatsAction}
                  className="rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">
                    Seat availability management
                  </p>
                  <label className="mt-3 text-[0.7rem] text-stone-300">
                    Total seats
                    <input
                      name="totalSeats"
                      type="number"
                      min={1}
                      defaultValue={inventory.totalSeats}
                      className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                  </label>
                  <input type="hidden" name="busId" value={inventory.busId} />
                  <p className="mt-1 text-[0.65rem] text-stone-500">
                    Adjust to match the coach layout so availability calculations stay accurate.
                  </p>
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-full border border-amber-400 px-3 py-2 text-[0.7rem] font-semibold text-amber-200"
                  >
                    Update total seats
                  </button>
                </form>

                <form
                  action={setBookingLimitAction}
                  className="rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">
                    Booking limit rules
                  </p>
                  <label className="mt-3 text-[0.7rem] text-stone-300">
                    Max seats per booking
                    <input
                      name="bookingLimit"
                      type="number"
                      min={1}
                      defaultValue={inventory.bookingLimit}
                      className="mt-1 w-full rounded-full border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                  </label>
                  <input type="hidden" name="busId" value={inventory.busId} />
                  <p className="mt-1 text-[0.65rem] text-stone-500">
                    Apply caps to prevent larger-than-intended group reservations.
                  </p>
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-full border border-amber-400 px-3 py-2 text-[0.7rem] font-semibold text-amber-200"
                  >
                    Save booking limit
                  </button>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form
                  action={blockSeatsAction}
                  className="rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">
                    Manual block seats
                  </p>
                  <label className="mt-3 text-[0.7rem] text-stone-300">
                    Seat IDs
                    <textarea
                      name="seatBlock"
                      rows={2}
                      placeholder="A1, A2, B3"
                      className="mt-1 w-full rounded-2xl border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                  </label>
                  <input type="hidden" name="busId" value={inventory.busId} />
                  <p className="mt-1 text-[0.65rem] text-stone-500">
                    Blocks the seats immediately and clears them from held states.
                  </p>
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-full border border-amber-400 px-3 py-2 text-[0.7rem] font-semibold text-amber-200"
                  >
                    Block seats
                  </button>
                </form>

                <form
                  action={releaseHeldSeatsAction}
                  className="rounded-2xl border border-white/10 bg-stone-950/50 p-4 text-xs text-stone-300"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-300">
                    Release held seats
                  </p>
                  <label className="mt-3 text-[0.7rem] text-stone-300">
                    Seat IDs
                    <textarea
                      name="releaseSeats"
                      rows={2}
                      placeholder="B5, C3"
                      className="mt-1 w-full rounded-2xl border border-white/20 bg-stone-950 px-3 py-2 text-white"
                    />
                  </label>
                  <input type="hidden" name="busId" value={inventory.busId} />
                  <p className="mt-1 text-[0.65rem] text-stone-500">
                    Frees held seats so they are bookable again.
                  </p>
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-full border border-amber-400 px-3 py-2 text-[0.7rem] font-semibold text-amber-200"
                  >
                    Release seats
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-dashed border-white/20 bg-stone-950/40 p-3 text-[0.75rem] text-stone-300">
                <p className="text-[0.7rem] text-stone-400">Recently blocked seats</p>
                <p className="text-white">{formatSeatList(inventory.blockedSeats)}</p>
                <p className="mt-2 text-[0.7rem] text-stone-400">Held seats</p>
                <p className="text-white">{formatSeatList(inventory.heldSeats)}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
