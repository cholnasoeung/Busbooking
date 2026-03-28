"use client";

import Link from "next/link";

import { PassengerAuthForm, usePassengerSession } from "@/components/passenger-auth";

type PassengerLoginClientProps = {
  redirectTo: string;
};

export function PassengerLoginClient({ redirectTo }: PassengerLoginClientProps) {
  const { setSession } = usePassengerSession();

  return (
    <>
      <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Passenger access</p>
      <h1 className="mt-3 text-3xl font-semibold">Login to continue booking</h1>
      <p className="mt-1 text-sm text-stone-500">
        Keep your upcoming trips in one place and start seat selection immediately after auth.
      </p>
      <div className="mt-6">
        <PassengerAuthForm onSuccess={setSession} redirectTo={redirectTo} defaultMode="login" />
      </div>
      <p className="mt-4 text-[0.75rem] text-stone-500">
        Need an account?
        <Link href="/passenger/register" className="ml-1 font-semibold text-stone-900 underline">
          Create one
        </Link>
      </p>
    </>
  );
}
