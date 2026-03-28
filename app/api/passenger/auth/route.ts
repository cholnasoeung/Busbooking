import { NextResponse } from "next/server";

import {
  authenticatePassengerAccount,
  createPassengerSessionToken,
  getPassengerSessionMaxAgeSeconds,
  PASSENGER_SESSION_COOKIE_NAME,
  registerPassengerAccount,
} from "@/lib/passenger-management";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode === "signup" ? "signup" : "login";

  try {
    const result =
      mode === "signup"
        ? await registerPassengerAccount({
            fullName: String(body?.fullName ?? ""),
            email: String(body?.email ?? ""),
            phone: String(body?.phone ?? ""),
            password: String(body?.password ?? ""),
          })
        : await authenticatePassengerAccount({
            email: String(body?.email ?? ""),
            password: String(body?.password ?? ""),
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
    const message =
      error instanceof Error ? error.message : "Unable to authenticate passenger.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
