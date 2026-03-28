"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { BusRecord } from "@/lib/operator-bus-management";
import type { TripRecord } from "@/lib/operator-trips";
import { PassengerAuthForm, usePassengerSession } from "@/components/passenger-auth";

type SeatSelectionProps = {
  trip: TripRecord;
  bus?: BusRecord;
  price: number;
  origin: string;
  destination: string;
};

const defaultSeatLayout = "1A,1B,1C\n2A,2B,2C\n3A,3B,3C\n4A,4B,4C";

function parseLayout(layout?: string) {
  const value = layout?.trim() || defaultSeatLayout;
  return value.split(/\r?\n/).map((row) =>
    row
      .split(",")
      .map((seat) => seat.trim())
      .filter(Boolean)
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function SeatSelection({ trip, bus, price, origin, destination }: SeatSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [blockedSeats, setBlockedSeats] = useState<string[]>([]);
  const rows = useMemo(() => parseLayout(bus?.seatLayout), [bus?.seatLayout]);
  const tripTime = formatTime(trip.tripDate);
  const boardingPoints = ["Central Market", "Olympic Circle", "Highway 4 Plaza"];
  const dropPoints = ["Kampot Terminal", "Sihanoukville Port", "Siem Reap Central"];
  const { session: passengerSession, setSession } = usePassengerSession();

  const isAuthenticated = Boolean(passengerSession);
  const canAdvance = currentStep === 1 ? Boolean(selectedSeat) : true;
  const isConfirming = currentStep === 3 && isSubmittingBooking;

  const stepDescriptions = [
    "Select seats",
    "Board / drop points",
    "Passenger information",
  ];

  useEffect(() => {
    if (!isOpen) {
      setBlockedSeats([]);
      return;
    }

    const controller = new AbortController();
    const busId = bus?.id ?? trip.busId;
    const params = new URLSearchParams({
      operatorId: trip.operatorId,
      busId,
      routeId: trip.routeId,
      tripDate: trip.tripDate.toISOString(),
    });

    fetch(`/api/passenger/booked-seats?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.seats && Array.isArray(payload.seats)) {
          setBlockedSeats(
            Array.from(
              new Set(
                payload.seats
                  .map((seat: string) => seat?.trim()?.toUpperCase())
                  .filter(Boolean)
              )
            )
          );
        } else {
          setBlockedSeats([]);
        }
      })
      .catch(() => {
        setBlockedSeats([]);
      });

    return () => controller.abort();
  }, [bus?.id, isOpen, trip.busId, trip.operatorId, trip.routeId, trip.tripDate]);

  const submitBooking = async () => {
    if (!selectedSeat || !passengerSession) {
      setBookingStatus({
        type: "error",
        message: "Pick a seat and sign in before confirming.",
      });
      return;
    }

    setIsSubmittingBooking(true);
    setBookingStatus(null);

    try {
      const response = await fetch("/api/passenger/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operatorId: trip.operatorId,
          busId: trip.busId,
          routeId: trip.routeId,
          routeName: trip.routeName,
          origin,
          destination,
          tripDate: trip.tripDate.toISOString(),
          departureTime: trip.tripDate.toISOString(),
          arrivalTime: new Date(
            trip.tripDate.getTime() + 6 * 60 * 60 * 1000
          ).toISOString(),
          fare: price,
          passenger: {
            fullName: passengerSession.fullName,
            email: passengerSession.email,
            phone: passengerSession.phone,
            seat: selectedSeat,
            boardingPoint: boardingPoints[0] ?? "",
            droppingPoint: dropPoints[0] ?? "",
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to save booking.");
      }

      setBookingStatus({
        type: "success",
        message:
          payload?.message ??
          "Booking saved. You can track it from your profile after signing in.",
      });
      const seatNormalized = selectedSeat?.trim().toUpperCase();
      if (seatNormalized) {
        setBlockedSeats((prev) => Array.from(new Set([...prev, seatNormalized])));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Booking failed.";
      setBookingStatus({ type: "error", message });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleViewSeats = () => {
    if (!isAuthenticated) {
      setShowAuthForm(true);
      setIsOpen(true);
      setCurrentStep(1);
      setSelectedSeat(null);
      setBookingStatus(null);
      return;
    }
    setIsOpen(true);
    setCurrentStep(1);
    setSelectedSeat(null);
    setShowAuthForm(false);
    setBookingStatus(null);
  };

  const handleNext = async () => {
    if (currentStep === 1 && !selectedSeat) return;
    if (currentStep < 3) {
      setCurrentStep((step) => step + 1);
      return;
    }
    await submitBooking();
  };

  return (
    <>
      <button
        onClick={handleViewSeats}
        className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700"
      >
        Book Now
      </button>

      {isOpen && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-auto bg-black/70 p-4 py-6">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Login Required</p>
                <h2 className="text-xl font-semibold text-slate-900">Sign in to continue</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAuthForm(false);
                }}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">🔐 Secure Booking</p>
                <p className="mt-1 text-blue-700">Please sign in or create an account to book your seats. This helps us track your bookings and provide better service.</p>
              </div>

              <PassengerAuthForm
                onSuccess={(session) => {
                  setSession(session);
                  setShowAuthForm(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isOpen && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-auto bg-black/70 p-4 py-6">
          <div className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-stone-400">{trip.routeName}</p>
                <h2 className="text-2xl font-semibold text-stone-900">
                  {trip.driver.vehicle} · {tripTime}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-stone-500 hover:text-stone-900"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 px-6 py-3 text-sm uppercase tracking-[0.35em] text-stone-500">
              {stepDescriptions.map((label, index) => {
                const stepIdx = index + 1;
                const isActive = stepIdx === currentStep;
                return (
                  <div
                    key={label}
                    className={`min-w-[130px] rounded-2xl border px-3 py-2 text-center text-xs font-semibold ${
                      isActive ? "bg-[#ed3d34] text-white shadow" : "border-stone-200 text-stone-400"
                    }`}
                  >
                    {stepIdx}. {label}
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_390px]">
              <div className="space-y-4 p-6">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Select seats</p>
                        <p className="text-sm text-stone-600">Pick an available seat to continue.</p>
                      </div>
                      <div className="grid gap-3 rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 shadow-inner sm:grid-cols-2">
                        {rows.map((row, rowIndex) => (
                          <div key={`row-${rowIndex}`} className="flex gap-3 justify-center">
                            {row.map((seat) => {
                              const normalizedSeat = seat.trim().toUpperCase();
                              const isSelected = selectedSeat === normalizedSeat;
                              const isBlocked = blockedSeats.includes(normalizedSeat);
                              return (
                                <button
                                  key={seat}
                                  type="button"
                                  disabled={isBlocked}
                                  onClick={() => {
                                    if (isBlocked) return;
                                    setSelectedSeat(normalizedSeat);
                                  }}
                                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                                    isBlocked
                                      ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                                      : isSelected
                                      ? "border-green-500 bg-gradient-to-tr from-green-100 to-white text-green-700"
                                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                                  }`}
                                >
                                  {seat}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Boarding point</p>
                    <div className="grid gap-2 text-sm">
                      {boardingPoints.map((point) => (
                        <div key={point} className="rounded-2xl border border-stone-200 px-4 py-3 text-stone-700">
                          {point}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Dropping point</p>
                    <div className="grid gap-2 text-sm">
                      {dropPoints.map((point) => (
                        <div key={point} className="rounded-2xl border border-stone-200 px-4 py-3 text-stone-700">
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Passenger information</p>
                    <input
                      type="text"
                      placeholder="Full name"
                      defaultValue={passengerSession?.fullName ?? ""}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700 focus:border-[#ed3d34]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      defaultValue={passengerSession?.phone ?? ""}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700 focus:border-[#ed3d34]"
                    />
                    <textarea
                      placeholder="Notes (optional)"
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700 focus:border-[#ed3d34]"
                      rows={3}
                    />
                  </div>
                )}

                {bookingStatus && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      bookingStatus.type === "success"
                        ? "border-emerald-400/70 bg-emerald-50 text-emerald-800"
                        : "border-red-400/70 bg-red-50 text-red-800"
                    }`}
                  >
                    {bookingStatus.message}
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 text-xs uppercase tracking-[0.35em] text-stone-500">
                  <span>Current seat: {selectedSeat ?? "Open"}</span>
                  <span>Price: USD {price}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-4 border-l border-stone-200 bg-stone-50 p-6">
                <div className="space-y-2 rounded-2xl border border-stone-200 bg-white/90 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Why book this bus?</p>
                  <p className="text-sm text-stone-600">
                    We show the actual coach, boarding points, and amenities so you can confirm your ride with confidence.
                  </p>
                </div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  <span>Step {currentStep} of 3</span>
                  <span>{stepDescriptions[currentStep - 1]}</span>
                </div>
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep((step) => step - 1)}
                      className="flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!canAdvance || isConfirming}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                      !canAdvance || isConfirming ? "bg-stone-300" : "bg-[#ed3d34]"
                    }`}
                  >
                    {currentStep < 3
                      ? "Next"
                      : isSubmittingBooking
                      ? "Confirming..."
                      : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
