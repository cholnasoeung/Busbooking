import { listBookings, type BookingRecord, type PassengerRecord } from "@/lib/operator-bookings";
import {
  boardingScanAction,
  cancelPassengerAction,
  checkInPassengerAction,
  reschedulePassengerAction,
} from "./actions";

const statusStyles: Record<string, string> = {
  booked: "bg-stone-900 text-amber-300 border border-amber-300",
  checked_in: "bg-emerald-900 text-emerald-300 border border-emerald-500",
  boarded: "bg-cyan-950 text-cyan-300 border border-cyan-400",
  cancelled: "bg-rose-950 text-rose-300 border border-rose-500 line-through",
  rescheduled: "bg-indigo-950 text-indigo-300 border border-indigo-500",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

function passengerStatusBadge(passenger: PassengerRecord) {
  const style = statusStyles[passenger.status] ?? statusStyles.booked;
  return (
    <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${style}`}>
      {passenger.status.replace("_", " ")}
    </span>
  );
}

function manifestList(passengers: PassengerRecord[]) {
  return (
    <ul className="space-y-1 text-xs text-stone-200">
      {passengers.map((passenger) => (
        <li key={passenger.id} className="flex flex-col gap-0.5 rounded-2xl border border-white/5 bg-stone-950/60 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-white">{passenger.fullName}</p>
            {passengerStatusBadge(passenger)}
          </div>
          <div className="flex flex-wrap gap-2 text-[0.65rem] text-stone-400">
            <span>Seat {passenger.seat}</span>
            <span>{passenger.email}</span>
            <span>{passenger.phone}</span>
            {passenger.rescheduledTo && (
              <span>Rescheduled to {formatDate(passenger.rescheduledTo)}</span>
            )}
            {passenger.cancellationReason && (
              <span>Cancelled: {passenger.cancellationReason}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function checkInList(passengers: PassengerRecord[]) {
  const checkedIn = passengers.filter((passenger) => passenger.status === "checked_in");
  if (checkedIn.length === 0) {
    return <p className="text-[0.75rem] text-stone-500">No one checked in yet.</p>;
  }

  return (
    <ul className="space-y-1 text-[0.8rem] text-stone-200">
      {checkedIn.map((passenger) => (
        <li key={passenger.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-stone-950/60 px-3 py-2">
          <span>{passenger.fullName}</span>
          <span className="text-[0.65rem] text-stone-400">
            Checked in {passenger.checkInTime ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(passenger.checkInTime) : "just now"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function OperatorBookingsPage() {
  const bookings = await listBookings("OP-201");

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-stone-900/60 p-6 text-white shadow">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Booking operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Monitor bookings, check-ins, and boarding.</h1>
        <p className="mt-2 text-sm text-stone-400">
          Review every manifest, handle cancellations/reschedules, and mark passengers as boarded using QR scans.
        </p>
      </section>

      <section className="space-y-6">
        {bookings.map((booking: BookingRecord) => (
          <article
            key={booking.id}
            className="space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow"
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-amber-300">
                  {booking.routeName}
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {booking.origin} → {booking.destination}
                </h2>
                <p className="text-sm text-stone-400">
                  {formatDate(booking.tripDate)} • Departure {booking.departureTime} • Arrival {booking.arrivalTime}
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-stone-400">
                {booking.status.replace("_", " ")}
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-amber-300">Passenger manifest</p>
                {manifestList(booking.passengers)}
              </div>
              <div className="space-y-3">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-amber-300">Check-in list</p>
                {checkInList(booking.passengers)}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[0.8rem] uppercase tracking-[0.3em] text-amber-300">
                Passenger actions
              </p>
              <div className="grid gap-4">
                {booking.passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="rounded-2xl border border-white/10 bg-stone-950/60 p-4 text-xs text-stone-300"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{passenger.fullName}</p>
                        <p className="text-[0.65rem] text-stone-400">Seat {passenger.seat}</p>
                      </div>
                      {passengerStatusBadge(passenger)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form className="inline-flex" action={checkInPassengerAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="passengerId" value={passenger.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-amber-400 px-3 py-1 text-[0.65rem] font-semibold text-amber-200"
                        >
                          Check-in passenger
                        </button>
                      </form>
                      <form className="inline-flex" action={boardingScanAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="passengerId" value={passenger.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-cyan-400 px-3 py-1 text-[0.65rem] font-semibold text-cyan-200"
                        >
                          Boarding QR scan
                        </button>
                      </form>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <form className="space-y-2" action={reschedulePassengerAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="passengerId" value={passenger.id} />
                        <label className="text-[0.65rem] text-stone-400">
                          New travel date
                          <input
                            name="newTripDate"
                            type="date"
                            className="mt-1 w-full rounded-full border border-white/10 bg-stone-950 px-3 py-2 text-white"
                          />
                        </label>
                        <button
                          type="submit"
                          className="w-full rounded-full border border-indigo-400 px-3 py-1 text-[0.65rem] font-semibold text-indigo-200"
                        >
                          Reschedule
                        </button>
                      </form>
                      <form className="space-y-2" action={cancelPassengerAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="passengerId" value={passenger.id} />
                        <label className="text-[0.65rem] text-stone-400">
                          Cancel reason
                          <input
                            name="cancellationReason"
                            placeholder="Optional note"
                            className="mt-1 w-full rounded-full border border-white/10 bg-stone-950 px-3 py-2 text-white"
                          />
                        </label>
                        <button
                          type="submit"
                          className="w-full rounded-full border border-rose-400 px-3 py-1 text-[0.65rem] font-semibold text-rose-200"
                        >
                          Cancel ticket
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
