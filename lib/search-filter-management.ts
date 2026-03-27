import clientPromise from "@/lib/mongodb";

export type SearchFilterType = "time-window" | "bus-type" | "status";

export type SearchFilterPayload =
  | { startHour: number; endHour: number }
  | { busTypes: string[] }
  | { statuses: string[] };

export type SearchFilterDefinition = {
  id: string;
  label: string;
  description?: string;
  type: SearchFilterType;
  payload: SearchFilterPayload;
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

const filterSeed: SearchFilterDefinition[] = [
  {
    id: "FILTER-001",
    label: "18:00-24:00",
    description: "Evening departures",
    type: "time-window",
    payload: { startHour: 18, endHour: 24 },
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
  },
  {
    id: "FILTER-002",
    label: "Luxury coaches",
    description: "Deluxe and VIP buses",
    type: "bus-type",
    payload: { busTypes: ["deluxe", "vip"] },
    createdAt: new Date("2026-03-02T00:00:00.000Z"),
    updatedAt: new Date("2026-03-02T00:00:00.000Z"),
  },
  {
    id: "FILTER-003",
    label: "Reschedulable",
    description: "Trips that can still be rescheduled",
    type: "status",
    payload: { statuses: ["scheduled", "boarding"] },
    createdAt: new Date("2026-03-03T00:00:00.000Z"),
    updatedAt: new Date("2026-03-03T00:00:00.000Z"),
  },
  {
    id: "FILTER-004",
    label: "Cancellable",
    description: "Upcoming departures",
    type: "status",
    payload: { statuses: ["scheduled", "boarding", "departed"] },
    createdAt: new Date("2026-03-04T00:00:00.000Z"),
    updatedAt: new Date("2026-03-04T00:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeed() {
  const db = await getDb();
  await Promise.all(
    filterSeed.map((seed) =>
      db.collection<SearchFilterDefinition>("search_filters").updateOne(
        { id: seed.id },
        {
          $setOnInsert: seed,
        },
        { upsert: true }
      )
    )
  );
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

export async function listSearchFilters() {
  await ensureSeed();
  const db = await getDb();
  return db
    .collection<SearchFilterDefinition>("search_filters")
    .find()
    .sort({ label: 1 })
    .toArray();
}

export async function createSearchFilter(data: {
  label: string;
  type: SearchFilterType;
  payload: SearchFilterPayload;
  description?: string;
}) {
  const db = await getDb();
  await db.collection<SearchFilterDefinition>("search_filters").insertOne({
    id: buildId("FILTER"),
    label: data.label,
    description: data.description,
    type: data.type,
    payload: data.payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function deleteSearchFilter(filterId: string) {
  const db = await getDb();
  await db.collection<SearchFilterDefinition>("search_filters").deleteOne({ id: filterId });
}
