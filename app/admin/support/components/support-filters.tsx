"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type SupportFiltersProps = {
  ticketStatus: string;
  disputeStatus: string;
  investigationStatus: string;
  fraudStatus: string;
  ticketSearch: string;
};

export function SupportFilters({
  ticketStatus,
  disputeStatus,
  investigationStatus,
  fraudStatus,
  ticketSearch,
}: SupportFiltersProps) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(ticketSearch);

  const currentTicketSearch = useMemo(() => searchTerm, [searchTerm]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);

    if (value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    window.location.href = `${pathname}${query ? `?${query}` : ""}`;
  }

  return (
    <div className="grid gap-3 rounded-[28px] border border-stone-200 bg-white p-4 text-xs text-stone-500 shadow">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
            Ticket status
          </span>
          <select
            value={ticketStatus}
            onChange={(event) => setParam("ticketStatus", event.target.value)}
            className="rounded-full border border-stone-200 px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
            Dispute status
          </span>
          <select
            value={disputeStatus}
            onChange={(event) => setParam("disputeStatus", event.target.value)}
            className="rounded-full border border-stone-200 px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="escalated">Escalated</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
            Investigation status
          </span>
          <select
            value={investigationStatus}
            onChange={(event) => setParam("investigationStatus", event.target.value)}
            className="rounded-full border border-stone-200 px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-400">
            Fraud status
          </span>
          <select
            value={fraudStatus}
            onChange={(event) => setParam("fraudStatus", event.target.value)}
            className="rounded-full border border-stone-200 px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={currentTicketSearch}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search tickets"
          className="flex-1 rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
        />
        <button
          type="button"
          onClick={() => setParam("ticketSearch", currentTicketSearch)}
          className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em]"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
