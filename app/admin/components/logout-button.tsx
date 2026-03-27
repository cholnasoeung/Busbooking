"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);
    const response = await fetch("/api/admin/logout", {
      method: "POST",
      cache: "no-store",
    });
    setSubmitting(false);
    if (response.ok) {
      router.push("/admin/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={submitting}
      className="rounded-full border border-stone-200 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-stone-700 transition hover:border-amber-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? "Signing out..." : "Log out"}
    </button>
  );
}
