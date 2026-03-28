"use client";

import Link from "next/link";

import { PassengerAuthForm, usePassengerSession } from "@/components/passenger-auth";

type PassengerRegisterClientProps = {
  redirectTo: string;
};

export function PassengerRegisterClient({ redirectTo }: PassengerRegisterClientProps) {
  const { setSession } = usePassengerSession();

  return (
    <>
      <p className="text-xs uppercase tracking-[0.4em] text-stone-500">Passenger access</p>
      <h1 className="mt-3 text-3xl font-semibold">Create a passenger account</h1>
      <p className="mt-1 text-sm text-stone-500">
        Save this booking to your profile and pick up from where you left off later.
      </p>
      <div className="mt-6">
        <PassengerAuthForm onSuccess={setSession} redirectTo={redirectTo} defaultMode="signup" />
      </div>
      <p className="mt-4 text-[0.75rem] text-stone-500">
        Already have an account?
        <Link href="/passenger/login" className="ml-1 font-semibold text-stone-900 underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
