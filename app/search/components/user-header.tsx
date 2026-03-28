"use client";

import Link from "next/link";
import { usePassengerSession } from "@/components/passenger-auth";

export function UserHeader() {
  const { session, clearSession } = usePassengerSession();

  if (!session) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-lg">👋</span>
          <span>Sign in to access your bookings and get exclusive offers</span>
        </div>
        <Link
          href="/passenger/login"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700"
        >
          Sign In / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-sm font-bold text-white">
          {session.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Hi, {session.fullName}!</p>
          <p className="text-xs text-slate-500">{session.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/passenger/bookings"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          My Bookings
        </Link>
        <button
          onClick={clearSession}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
