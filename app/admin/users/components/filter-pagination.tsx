"use client";

import { usePathname } from "next/navigation";

type FilterPaginationProps = {
  currentStatus: string;
  currentSearch?: string;
  currentPage: number;
};

export function FilterPagination({
  currentStatus,
  currentSearch = "",
  currentPage,
}: FilterPaginationProps) {
  const pathname = usePathname();
  const pageParam = (page: number) => `${page}`;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    window.location.href = `${pathname}?${params}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
      <div className="flex items-center gap-2">
        <span>Status:</span>
        <select
          value={currentStatus}
          onChange={(event) => {
            setParam("status", event.target.value);
            setParam("page", "1");
          }}
          className="rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending_review">Pending review</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => setParam("page", pageParam(currentPage - 1))}
          className="rounded-full border border-stone-200 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setParam("page", pageParam(currentPage + 1))}
          className="rounded-full border border-stone-200 px-3 py-1"
        >
          Next
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          defaultValue={currentSearch}
          placeholder="Search"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setParam("search", (event.target as HTMLInputElement).value);
              setParam("page", "1");
            }
          }}
          className="w-44 rounded-full border border-stone-200 px-3 py-1 text-xs focus:border-amber-300"
        />
        <button
          onClick={() => {
            const input = (
              document.activeElement as HTMLInputElement | null
            )?.value;
            setParam("search", input ?? currentSearch);
            setParam("page", "1");
          }}
          className="rounded-full border border-stone-200 px-3 py-1"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
