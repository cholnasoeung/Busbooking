import { NextRequest, NextResponse } from "next/server";

import { createBooking, type BookingCreationPayload } from "@/lib/operator-bookings";
import {
  getPassengerSessionFromCookies,
  touchPassengerLastBooking,
} from "@/lib/passenger-management";

export async function POST(request: NextRequest) {
  try {
    const passengerSession = await getPassengerSessionFromCookies(request.cookies);
    if (!passengerSession) {
      return NextResponse.json(
        { message: "Please sign in to save your booking." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const tripDate = new Date(body.tripDate);
    if (!body.operatorId || !body.busId || !body.routeId || Number.isNaN(tripDate.getTime())) {
      return NextResponse.json({ message: "Missing or invalid trip metadata." }, { status: 400 });
    }

    const passenger = body.passenger ?? {};
    if (!passenger.seat) {
      return NextResponse.json({ message: "Passenger information is incomplete." }, { status: 400 });
    }

    const payload: BookingCreationPayload = {
      operatorId: String(body.operatorId),
      busId: String(body.busId),
      routeId: String(body.routeId),
      routeName: String(body.routeName ?? body.routeId),
      origin: String(body.origin ?? ""),
      destination: String(body.destination ?? ""),
      tripDate,
      departureTime: String(body.departureTime ?? ""),
      arrivalTime: String(body.arrivalTime ?? ""),
      fare: Number(body.fare ?? 0) || 0,
      passenger: {
        passengerAccountId: passengerSession.id,
        fullName: String(passenger.fullName ?? passengerSession.fullName).trim() || passengerSession.fullName,
        email: passengerSession.email,
        phone: String(passenger.phone ?? passengerSession.phone).trim() || passengerSession.phone,
        seat: String(passenger.seat),
        boardingPoint: passenger.boardingPoint ? String(passenger.boardingPoint) : undefined,
        droppingPoint: passenger.droppingPoint ? String(passenger.droppingPoint) : undefined,
      },
    };

    await createBooking(payload);
    await touchPassengerLastBooking(passengerSession.id);

    return NextResponse.json({ message: "Booking recorded. Check your passenger account for details." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record booking.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
