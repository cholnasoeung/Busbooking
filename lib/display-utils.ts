const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(value?: Date | null) {
  if (!value) return "TBD";
  return dateFormatter.format(value);
}

export function formatTime(value?: Date | null) {
  if (!value) return "--:--";
  return timeFormatter.format(value);
}

export function parseSearchDate(value?: string) {
  if (!value) return null;
  const normalized = value.trim();
  let candidate = normalized;

  const slashMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    if (
      !Number.isNaN(month) &&
      !Number.isNaN(day) &&
      !Number.isNaN(year)
    ) {
      const paddedYear = year < 100 ? 2000 + year : year;
      candidate = `${paddedYear.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
  }

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
