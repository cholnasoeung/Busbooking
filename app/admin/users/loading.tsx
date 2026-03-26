export default function Loading() {
  return (
    <div className="grid gap-4 p-2">
      <div className="h-32 animate-pulse rounded-[28px] bg-stone-200" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[24px] bg-stone-200"
          />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-[28px] bg-stone-200" />
    </div>
  );
}
