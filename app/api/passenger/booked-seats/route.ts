import { NextRequest, NextResponse } from "next/server";

import { listBookedSeats } from "@/lib/operator-bookings";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const operatorId = searchParams.get("operatorId") ?? "OP-201";
  const busId = searchParams.get("busId");
  const routeId = searchParams.get("routeId");
  const tripDateValue = searchParams.get("tripDate") ?? searchParams.get("date");

  if (!busId || !routeId || !tripDateValue) {
    return NextResponse.json(
      { message: "Missing bus, route, or trip date parameters." },
      { status: 400 }
    );
  }

  const tripDate = new Date(tripDateValue);
  if (Number.isNaN(tripDate.getTime())) {
    return NextResponse.json({ message: "Invalid trip date." }, { status: 400 });
  }

  try {
    const seats = await listBookedSeats({
      operatorId,
      busId,
      routeId,
      tripDate,
    });
    return NextResponse.json({ seats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load bookings.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
