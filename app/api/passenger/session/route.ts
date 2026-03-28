import { NextRequest, NextResponse } from "next/server";

import {
  createPassengerSessionToken,
  getPassengerSessionFromCookies,
  getPassengerSessionMaxAgeSeconds,
  PASSENGER_SESSION_COOKIE_NAME,
  updatePassengerProfile,
} from "@/lib/passenger-management";

export async function GET(request: NextRequest) {
  const session = await getPassengerSessionFromCookies(request.cookies);
  if (!session) {
    return NextResponse.json({ message: "Passenger session not found." }, { status: 401 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(request: NextRequest) {
  const session = await getPassengerSessionFromCookies(request.cookies);
  if (!session) {
    return NextResponse.json({ message: "Please sign in to manage your profile." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    const result = await updatePassengerProfile(session.id, {
      fullName: String(body?.fullName ?? ""),
      email: String(body?.email ?? ""),
      phone: String(body?.phone ?? ""),
    });

    const response = NextResponse.json({ session: result.session });
    response.cookies.set({
      name: PASSENGER_SESSION_COOKIE_NAME,
      value: createPassengerSessionToken(result.session.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getPassengerSessionMaxAgeSeconds(),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update passenger profile.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete({
    name: PASSENGER_SESSION_COOKIE_NAME,
    path: "/",
  });
  return response;
}
