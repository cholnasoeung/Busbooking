import { OptionalUnlessRequiredId } from "mongodb";

import clientPromise from "@/lib/mongodb";

export type TripStatus = "scheduled" | "boarding" | "departed" | "delayed" | "arrived" | "cancelled";

export type LivePosition = {
  timestamp: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  note?: string;
};

export type TripRecord = {
  id: string;
  operatorId: string;
  busId: string;
  routeId: string;
  routeName: string;
  tripDate: Date;
  status: TripStatus;
  driver: {
    name: string;
    phone: string;
    vehicle: string;
  };
  delayNotes: string[];
  livePositions: LivePosition[];
  updatedAt: Date;
};

const DB_NAME = process.env.MONGODB_DB_NAME ?? "bus_booking";
const COLLECTION = "operator_trips";

const seedTrips: TripRecord[] = [
  {
    id: "TRIP-1001",
    operatorId: "OP-201",
    busId: "BUS-101",
    routeId: "ROUTE-302",
    routeName: "Phnom Penh → Siem Reap",
    tripDate: new Date("2026-04-05T07:00:00.000Z"),
    status: "scheduled",
    driver: {
      name: "Lina Rith",
      phone: "+855 64 888 010",
      vehicle: "BUS-101",
    },
    delayNotes: [],
    livePositions: [
      {
        timestamp: new Date("2026-03-26T04:00:00.000Z"),
        coordinates: { lat: 11.5621, lng: 104.8885 },
        note: "Departed from Phnom Penh yard",
      },
    ],
    updatedAt: new Date("2026-03-26T04:00:00.000Z"),
  },
  {
    id: "TRIP-1002",
    operatorId: "OP-201",
    busId: "BUS-102",
    routeId: "ROUTE-303",
    routeName: "Phnom Penh → Kampot",
    tripDate: new Date("2026-04-06T09:30:00.000Z"),
    status: "boarding",
    driver: {
      name: "Samnang Sok",
      phone: "+855 94 123 112",
      vehicle: "BUS-102",
    },
    delayNotes: ["15 min crowd at the second stop"],
    livePositions: [
      {
        timestamp: new Date("2026-03-26T05:00:00.000Z"),
        coordinates: { lat: 11.568, lng: 104.888 },
        note: "At main terminal",
      },
    ],
    updatedAt: new Date("2026-03-26T05:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

async function ensureSeed(operatorId: string) {
  const db = await getDb();
  const collection = db.collection<TripRecord>(COLLECTION);
  const count = await collection.countDocuments({ operatorId });
  if (count === 0) {
    await collection.insertMany(
      seedTrips.filter((trip) => trip.operatorId === operatorId) as OptionalUnlessRequiredId<TripRecord>[]
    );
  }
}

export async function listTrips(operatorId: string): Promise<TripRecord[]> {
  await ensureSeed(operatorId);
  const db = await getDb();
  const records = await db
    .collection<TripRecord>(COLLECTION)
    .find({ operatorId })
    .sort({ tripDate: 1 })
    .toArray();

  return records.map((record) => {
    const { _id, ...rest } = record;
    void _id;
    return rest;
  });
}

async function updateTrip(
  operatorId: string,
  tripId: string,
  updater: (current: TripRecord) => Partial<TripRecord>
) {
  const db = await getDb();
  const trip = await db.collection<TripRecord>(COLLECTION).findOne({ operatorId, id: tripId });
  if (!trip) return;
  const updates = updater(trip);
  await db.collection<TripRecord>(COLLECTION).updateOne(
    { operatorId, id: tripId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
}

export async function setTripStatus(operatorId: string, tripId: string, status: TripStatus) {
  await updateTrip(operatorId, tripId, () => ({ status }));
}

export async function addDelayNote(operatorId: string, tripId: string, note: string) {
  if (!note.trim()) return;
  const db = await getDb();
  await db.collection<TripRecord>(COLLECTION).updateOne(
    { operatorId, id: tripId },
    {
      $push: {
        delayNotes: note.trim(),
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
}

export async function recordLivePosition(operatorId: string, tripId: string, position: LivePosition) {
  if (!position?.coordinates) return;
  const db = await getDb();
  await db.collection<TripRecord>(COLLECTION).updateOne(
    { operatorId, id: tripId },
    {
      $push: {
        livePositions: position,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
}
