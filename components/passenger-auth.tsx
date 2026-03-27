"use client";

import { FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";

export type PassengerSession = {
  fullName: string;
  email: string;
  phone: string;
};

const STORAGE_KEY = "passenger_session";

export function usePassengerSession() {
  const [session, setSession] = useState<PassengerSession | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  function updateSession(value: PassengerSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setSession(value);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  return { session, setSession: updateSession, clearSession };
}

type PassengerAuthFormProps = {
  onSuccess: (session: PassengerSession) => void;
  redirectTo?: string;
};

export function PassengerAuthForm({ onSuccess, redirectTo }: PassengerAuthFormProps) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSuccess({ fullName: name.trim(), email: email.trim(), phone: phone.trim() });
    if (redirectTo) {
      router.push(redirectTo);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <label className="block text-stone-600">
        Full name
        <input
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm focus:border-[#ed3d34]"
        />
      </label>
      <label className="block text-stone-600">
        Email
        <input
          id={`${id}-email`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm focus:border-[#ed3d34]"
        />
      </label>
      <label className="block text-stone-600">
        Phone
        <input
          id={`${id}-phone`}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          required
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm focus:border-[#ed3d34]"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-2xl bg-[#ed3d34] px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white"
      >
        Continue
      </button>
    </form>
  );
}
