import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true, redirect: "/admin/login" },
    { status: 200 }
  );
  response.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
  return response;
}
