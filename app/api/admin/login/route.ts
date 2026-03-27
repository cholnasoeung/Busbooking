import { NextResponse } from "next/server";

import {
  createSessionToken,
  getSessionMaxAgeSeconds,
  sanitizeAdminRedirect,
  SESSION_COOKIE_NAME,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirect = sanitizeAdminRedirect(String(formData.get("redirect") ?? ""));

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { message: "Invalid credentials, please try again." },
      { status: 401 }
    );
  }

  const token = createSessionToken(email);
  const response = NextResponse.json({ redirect }, { status: 200 });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return response;
}
