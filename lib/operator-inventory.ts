import { OptionalUnlessRequiredId } from "mongodb";

import clientPromise from "@/lib/mongodb";

export type SeatInventoryRecord = {
  id: string;
  operatorId: string;
  busId: string;
  totalSeats: number;
  blockedSeats: string[];
  heldSeats: string[];
  bookingLimit: number;
  createdAt: Date;
  updatedAt: Date;
};

const DB_NAME = process.env.MONGODB_DB_NAME ?? "bus_booking";
const COLLECTION = "operator_inventory";

const seedInventory: SeatInventoryRecord[] = [
  {
    id: "INV-BUS-101",
    operatorId: "OP-201",
    busId: "BUS-101",
    totalSeats: 42,
    blockedSeats: ["A1", "A2", "C3"],
    heldSeats: ["B5"],
    bookingLimit: 6,
    createdAt: new Date("2026-03-20T05:00:00.000Z"),
    updatedAt: new Date("2026-03-24T09:00:00.000Z"),
  },
];

function cleanSeatList(seats: string[] = []) {
  return Array.from(
    new Set(
      seats
        .map((seat) => seat.trim().toUpperCase())
        .filter((seat) => seat.length > 0)
    )
  );
}

async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

async function ensureSeed(operatorId: string) {
  const db = await getDb();
  const collection = db.collection<SeatInventoryRecord>(COLLECTION);
  const count = await collection.countDocuments({ operatorId });
  if (count === 0) {
    await collection.insertMany(
      seedInventory.filter((record) => record.operatorId === operatorId) as OptionalUnlessRequiredId<SeatInventoryRecord>[]
    );
  }
}

export async function listSeatInventories(operatorId: string) {
  await ensureSeed(operatorId);
  const db = await getDb();
  return db.collection<SeatInventoryRecord>(COLLECTION).find({ operatorId }).toArray();
}

export async function blockSeats(operatorId: string, busId: string, seats: string[]) {
  if (!busId || seats.length === 0) {
    return;
  }

  const normalized = cleanSeatList(seats);
  if (normalized.length === 0) {
    return;
  }

  const db = await getDb();
  await db.collection<SeatInventoryRecord>(COLLECTION).updateOne(
    { operatorId, busId },
    {
      $addToSet: {
        blockedSeats: {
          $each: normalized,
        },
      },
      $pull: {
        heldSeats: { $in: normalized },
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
}

export async function releaseHeldSeats(operatorId: string, busId: string, seats: string[]) {
  if (!busId || seats.length === 0) {
    return;
  }
  const normalized = cleanSeatList(seats);
  if (normalized.length === 0) {
    return;
  }

  const db = await getDb();
  await db.collection<SeatInventoryRecord>(COLLECTION).updateOne(
    { operatorId, busId },
    {
      $pull: {
        heldSeats: { $in: normalized },
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
}

export async function setBookingLimit(operatorId: string, busId: string, limit: number) {
  if (!busId || limit < 1) {
    return;
  }

  const db = await getDb();
  await db.collection<SeatInventoryRecord>(COLLECTION).updateOne(
    { operatorId, busId },
    {
      $set: {
        bookingLimit: limit,
        updatedAt: new Date(),
      },
    }
  );
}

export async function updateTotalSeats(operatorId: string, busId: string, totalSeats: number) {
  if (!busId || totalSeats < 1) {
    return;
  }

  const db = await getDb();
  await db.collection<SeatInventoryRecord>(COLLECTION).updateOne(
    { operatorId, busId },
    {
      $set: {
        totalSeats,
        updatedAt: new Date(),
      },
    }
  );
}
