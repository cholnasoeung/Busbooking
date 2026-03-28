"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SearchFormProps = {
  fromCities: string[];
  toCities: string[];
  selectedFrom: string;
  selectedTo: string;
  selectedDateValue: string;
  activeFilter: string | null;
};

export function SearchForm({
  fromCities,
  toCities,
  selectedFrom,
  selectedTo,
  selectedDateValue,
  activeFilter,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(selectedFrom);
  const [to, setTo] = useState(selectedTo);
  const [date, setDate] = useState(selectedDateValue);

  useEffect(() => {
    setFrom(selectedFrom);
    setTo(selectedTo);
    setDate(selectedDateValue);
  }, [selectedFrom, selectedTo, selectedDateValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ from, to, date });

    // Preserve active filter
    if (activeFilter) params.set("filter", activeFilter);

    // Preserve time slots
    const timeSlots = searchParams.get("timeSlots");
    if (timeSlots) params.set("timeSlots", timeSlots);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 appearance-none bg-white"
          >
            {fromCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const temp = from;
            setFrom(to);
            setTo(temp);
          }}
          className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Swap cities"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 appearance-none bg-white"
          >
            {toCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
        />

        <button
          type="submit"
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
        >
          Search
        </button>
      </div>
    </form>
  );
}
