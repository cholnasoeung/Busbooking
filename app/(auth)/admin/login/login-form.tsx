"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/admin" }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("redirect", redirectTo);
    setSubmitting(true);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    setSubmitting(false);

    if (response.ok) {
      const payload = await response.json();
      router.push(payload?.redirect ?? "/admin");
      return;
    }

    const payload = await response.json().catch(() => null);
    setError(payload?.message ?? "Login failed, please try again.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs text-stone-100">
      <label className="block text-[0.75rem] text-stone-300">
        Email address
        <input
          name="email"
          type="email"
          required
          placeholder="admin@busbooking.com"
          className="mt-1 h-11 w-full rounded-2xl border border-white/20 bg-stone-900 px-3 text-white outline-none focus:border-amber-300"
        />
      </label>
      <label className="block text-[0.75rem] text-stone-300">
        Password
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="mt-1 h-11 w-full rounded-2xl border border-white/20 bg-stone-900 px-3 text-white outline-none focus:border-amber-300"
        />
      </label>
      <input type="hidden" name="redirect" value={redirectTo} />
      {error && <p className="text-[0.65rem] text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl border border-amber-400 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 px-4 py-3 text-center text-[0.75rem] font-semibold uppercase tracking-[0.4em] text-stone-900 transition disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-[0.65rem] text-stone-400">
        Use the platform owner credentials (default: `admin@busbooking.com` / `busbooking123`). Override
        using `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` in your `.env.local`.
      </p>
    </form>
  );
}
