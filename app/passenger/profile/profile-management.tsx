"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { usePassengerSession } from "@/components/passenger-auth";
import type { PassengerBookingSummary, PassengerProfile, PassengerSession } from "@/lib/passenger-types";

type PassengerProfileManagementProps = {
  initialProfile: PassengerProfile;
  initialBookings: PassengerBookingSummary[];
};

function formatDateLabel(value: string) {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTimeLabel(value: string) {
  if (!value) {
    return "--:--";
  }

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(directDate);
  }

  const [hoursRaw, minutesRaw] = value.split(":").map(Number);
  if (Number.isNaN(hoursRaw) || Number.isNaN(minutesRaw)) {
    return value;
  }

  const date = new Date();
  date.setHours(hoursRaw, minutesRaw, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function statusClassName(status: string) {
  switch (status) {
    case "boarded":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":
    case "suspended":
      return "border-red-200 bg-red-50 text-red-700";
    case "checked_in":
    case "in_progress":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export function PassengerProfileManagement({
  initialProfile,
  initialBookings,
}: PassengerProfileManagementProps) {
  const router = useRouter();
  const { setSession, clearSession } = usePassengerSession();
  const [profile, setProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const upcomingTrips = useMemo(
    () =>
      initialBookings.filter((booking) => {
        const tripDate = new Date(booking.tripDate);
        return !Number.isNaN(tripDate.getTime()) && tripDate >= new Date();
      }),
    [initialBookings]
  );

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/passenger/session", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { session?: PassengerSession; message?: string }
        | null;

      if (!response.ok || !payload?.session) {
        throw new Error(payload?.message ?? "Unable to update your profile.");
      }

      const nextSession = payload.session;

      setSession(nextSession);
      setProfile((current) => ({
        ...current,
        fullName: nextSession.fullName,
        email: nextSession.email,
        phone: nextSession.phone,
        updatedAt: new Date().toISOString(),
      }));
      setFeedback({ type: "success", message: "Profile updated successfully." });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await clearSession();
    router.push("/search");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[36px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/search"
              className="inline-flex items-center text-xs font-bold uppercase tracking-[0.35em] text-red-600 transition-colors hover:text-red-700"
            >
              Back to search
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Passenger profile</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                {profile.fullName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage your account details and keep an eye on every booking tied to your passenger
                profile.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-400">
                Upcoming trips
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900">{upcomingTrips.length}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-400">
                Trips completed
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900">{profile.tripsCompleted}</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-slate-400">
                Last activity
              </p>
              <p className="mt-3 text-lg font-bold text-slate-900">
                {formatDateLabel(profile.lastBooking)}
              </p>
            </article>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
                  Account details
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Profile management</h2>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusClassName(
                  profile.status
                )}`}
              >
                {profile.status.replace("_", " ")}
              </span>
            </div>

            <form className="mt-8 grid gap-4" onSubmit={handleSaveProfile}>
              <label className="grid gap-2 text-sm text-slate-600">
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                Email address
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                Phone number
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
              </label>

              {feedback && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    feedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? "Saving..." : "Save profile"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFullName(profile.fullName);
                    setEmail(profile.email);
                    setPhone(profile.phone);
                    setFeedback(null);
                  }}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Log out
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
                Membership
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Passenger status</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Keep your name, phone, and email updated so operators can reach you quickly about
                gate changes, delays, and reschedules.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-400">
                    Account created
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDateLabel(profile.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-slate-400">
                    Last updated
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDateLabel(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
                Booking history
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Your trips</h2>
            </div>
            <p className="text-sm text-slate-500">
              {initialBookings.length} booking{initialBookings.length === 1 ? "" : "s"} linked to
              this profile
            </p>
          </div>

          {initialBookings.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No bookings yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Once you reserve a seat, your trip details will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {initialBookings.map((booking) => (
                <article
                  key={`${booking.bookingId}-${booking.passengerRecordId}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                          {booking.routeName}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClassName(
                            booking.passengerStatus
                          )}`}
                        >
                          {booking.passengerStatus.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {booking.origin} to {booking.destination}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {formatDateLabel(booking.tripDate)} at {formatTimeLabel(booking.departureTime)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
                          Seat
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{booking.seat}</p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
                          Fare
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          USD {booking.farePaid.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
                          Boarding
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {booking.boardingPoint ?? "Assigned later"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white bg-white px-4 py-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
                          Drop-off
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {booking.droppingPoint ?? "Assigned later"}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
