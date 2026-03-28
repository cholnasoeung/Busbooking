"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SerializedSearchFilter = {
  id: string;
  label: string;
  description?: string;
  type: string;
  payload: Record<string, unknown>;
};

type FilterSidebarProps = {
  filterDefinitions: SerializedSearchFilter[];
  selectedFrom: string;
  selectedTo: string;
  selectedDateValue: string;
  activeFilter: string | null;
};

type TimeSlot = {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
};

const timeSlots: TimeSlot[] = [
  { id: "before6am", label: "Before 6 AM", startHour: 0, endHour: 6 },
  { id: "6am-12pm", label: "6 AM - 12 PM", startHour: 6, endHour: 12 },
  { id: "12pm-6pm", label: "12 PM - 6 PM", startHour: 12, endHour: 18 },
  { id: "after6pm", label: "After 6 PM", startHour: 18, endHour: 24 },
];

type FilterSection = {
  id: string;
  title: string;
  icon: string;
};

const filterSections: FilterSection[] = [
  { id: "departure", title: "Departure Time", icon: "🕐" },
  { id: "busType", title: "Bus Type", icon: "🚌" },
  { id: "status", title: "Trip Status", icon: "🎫" },
];

export function FilterSidebar({
  filterDefinitions,
  selectedFrom,
  selectedTo,
  selectedDateValue,
  activeFilter,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["departure", "busType", "status"]));

  // Get selected time slots from URL
  const selectedTimeSlots = searchParams.get("timeSlots")?.split(",") || [];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const buildSearchUrl = (from: string, to: string, date: string, filter?: string, timeSlots?: string[]) => {
    const params = new URLSearchParams({ from, to, date });
    if (filter && filter !== "") params.set("filter", filter);
    if (timeSlots && timeSlots.length > 0) params.set("timeSlots", timeSlots.join(","));
    return `/search?${params.toString()}`;
  };

  const handleTimeSlotToggle = (slotId: string) => {
    const newSelection = selectedTimeSlots.includes(slotId)
      ? selectedTimeSlots.filter((s) => s !== slotId)
      : [...selectedTimeSlots, slotId];

    const url = buildSearchUrl(selectedFrom, selectedTo, selectedDateValue, activeFilter || "", newSelection);
    router.push(url);
  };

  const handleFilterClick = (filterId: string) => {
    const url = buildSearchUrl(selectedFrom, selectedTo, selectedDateValue, filterId, selectedTimeSlots);
    router.push(url);
  };

  const handleClearFilter = () => {
    const url = buildSearchUrl(selectedFrom, selectedTo, selectedDateValue, "", []);
    router.push(url);
  };

  return (
    <aside className="space-y-3">
      {/* Departure Time Filter */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("departure")}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span>{filterSections[0].icon}</span>
            <h3 className="text-sm font-semibold text-slate-800">{filterSections[0].title}</h3>
          </div>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.has("departure") ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has("departure") && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
            {timeSlots.map((slot) => {
              const isSelected = selectedTimeSlots.includes(slot.id);
              return (
                <label key={slot.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTimeSlotToggle(slot.id)}
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">{slot.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Bus Type Filter */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("busType")}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span>{filterSections[1].icon}</span>
            <h3 className="text-sm font-semibold text-slate-800">{filterSections[1].title}</h3>
          </div>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.has("busType") ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has("busType") && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
            {filterDefinitions
              .filter((f) => f.type === "bus-type")
              .map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <label key={filter.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1.5">
                    <input
                      type="radio"
                      name="busType"
                      checked={isActive}
                      onChange={() => handleFilterClick(isActive ? "" : filter.id)}
                      className="h-4 w-4 border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">{filter.label}</span>
                  </label>
                );
              })}
          </div>
        )}
      </div>

      {/* Trip Status Filter */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span>{filterSections[2].icon}</span>
            <h3 className="text-sm font-semibold text-slate-800">{filterSections[2].title}</h3>
          </div>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${expandedSections.has("status") ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.has("status") && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
            {filterDefinitions
              .filter((f) => f.type === "status")
              .map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <label key={filter.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1.5">
                    <input
                      type="radio"
                      name="status"
                      checked={isActive}
                      onChange={() => handleFilterClick(isActive ? "" : filter.id)}
                      className="h-4 w-4 border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-700">{filter.label}</span>
                  </label>
                );
              })}
          </div>
        )}
      </div>

      {/* Clear All Filters */}
      {(activeFilter || selectedTimeSlots.length > 0) && (
        <button
          type="button"
          onClick={handleClearFilter}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
