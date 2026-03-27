import { OptionalUnlessRequiredId } from "mongodb";

import clientPromise from "@/lib/mongodb";

export type PassengerStatus = "booked" | "checked_in" | "boarded" | "cancelled" | "rescheduled";

export type PassengerRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  seat: string;
  status: PassengerStatus;
  checkInTime?: Date;
  boardedAt?: Date;
  rescheduledTo?: Date;
  cancellationReason?: string;
  farePaid?: number;
  agent?: string;
};

export type BookingRecord = {
  id: string;
  operatorId: string;
  busId: string;
  routeName: string;
  origin: string;
  destination: string;
  tripDate: Date;
  departureTime: string;
  arrivalTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  passengers: PassengerRecord[];
  createdAt: Date;
  updatedAt: Date;
};

const DB_NAME = process.env.MONGODB_DB_NAME ?? "bus_booking";
const COLLECTION_NAME = "operator_bookings";

const bookingSeed: BookingRecord[] = [
  {
    id: "BOOK-5001",
    operatorId: "OP-201",
    busId: "BUS-101",
    routeName: "Phnom Penh ↔ Siem Reap",
    origin: "Phnom Penh",
    destination: "Siem Reap",
    tripDate: new Date("2026-04-05T00:00:00.000Z"),
    departureTime: "07:00",
    arrivalTime: "13:30",
    status: "scheduled",
    passengers: [
      {
        id: "PASS-3001",
        fullName: "Bora Khem",
        email: "bora@example.com",
        phone: "+855 12 900 111",
        seat: "A3",
        status: "booked",
        farePaid: 12.5,
        agent: "Agent River",
      },
      {
        id: "PASS-3002",
        fullName: "Sreynich Pich",
        email: "sreynich@example.com",
        phone: "+855 92 451 222",
        seat: "A4",
        status: "booked",
      },
      {
        id: "PASS-3003",
        fullName: "Channika Uoy",
        email: "channika@example.com",
        phone: "+855 88 567 333",
        seat: "A5",
        status: "checked_in",
        checkInTime: new Date(),
        farePaid: 12.5,
      },
    ],
    createdAt: new Date("2026-03-18T05:00:00.000Z"),
    updatedAt: new Date("2026-03-26T09:00:00.000Z"),
  },
  {
    id: "BOOK-5002",
    operatorId: "OP-201",
    busId: "BUS-102",
    routeName: "Phnom Penh ↔ Kampot",
    origin: "Phnom Penh",
    destination: "Kampot",
    tripDate: new Date("2026-04-06T00:00:00.000Z"),
    departureTime: "09:30",
    arrivalTime: "15:45",
    status: "in_progress",
    passengers: [
      {
        id: "PASS-3004",
        fullName: "Vanna Touch",
        email: "vanna@example.com",
        phone: "+855 99 821 444",
        seat: "B1",
        status: "checked_in",
        checkInTime: new Date(),
        farePaid: 15,
        agent: "Agent River",
      },
      {
        id: "PASS-3005",
        fullName: "Pisey Hout",
        email: "pisey@example.com",
        phone: "+855 96 333 555",
        seat: "B2",
        status: "booked",
        farePaid: 11,
      },
      {
        id: "PASS-3006",
        fullName: "Sophy Narin",
        email: "sophy@example.com",
        phone: "+855 12 888 666",
        seat: "B3",
        status: "booked",
        farePaid: 11,
        agent: "Agent Coastal",
      },
    ],
    createdAt: new Date("2026-03-19T05:00:00.000Z"),
    updatedAt: new Date("2026-03-25T09:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

async function ensureSeed(operatorId: string) {
  const db = await getDb();
  const collection = db.collection<BookingRecord>(COLLECTION_NAME);
  const count = await collection.countDocuments({ operatorId });
  if (count === 0) {
    await collection.insertMany(
      bookingSeed.filter((record) => record.operatorId === operatorId) as OptionalUnlessRequiredId<BookingRecord>[]
    );
  }
}

export async function listBookings(operatorId: string) {
  await ensureSeed(operatorId);
  const db = await getDb();
  return db
    .collection<BookingRecord>(COLLECTION_NAME)
    .find({ operatorId })
    .sort({ tripDate: 1, departureTime: 1 })
    .toArray();
}

function findPassengerIndex(passengers: PassengerRecord[], passengerId: string) {
  return passengers.findIndex((entry) => entry.id === passengerId);
}

async function updatePassenger(
  operatorId: string,
  bookingId: string,
  passengerId: string,
  updater: (current: PassengerRecord) => Partial<PassengerRecord>
) {
  const db = await getDb();
  const booking = await db
    .collection<BookingRecord>(COLLECTION_NAME)
    .findOne({ operatorId, id: bookingId });

  if (!booking) {
    return;
  }

  const index = findPassengerIndex(booking.passengers, passengerId);
  if (index === -1) {
    return;
  }

  const current = booking.passengers[index];
  const update = updater(current);
  const updatedPassenger = {
    ...current,
    ...update,
  };

  const passengers = [...booking.passengers];
  passengers[index] = updatedPassenger;

  await db.collection<BookingRecord>(COLLECTION_NAME).updateOne(
    { operatorId, id: bookingId },
    {
      $set: {
        passengers,
        updatedAt: new Date(),
      },
    }
  );
}

export async function cancelPassenger(
  operatorId: string,
  bookingId: string,
  passengerId: string,
  reason?: string
) {
  await updatePassenger(operatorId, bookingId, passengerId, () => ({
    status: "cancelled",
    cancellationReason: reason,
  }));
}

export async function reschedulePassenger(
  operatorId: string,
  bookingId: string,
  passengerId: string,
  newDate: string
) {
  const parsed = new Date(newDate);
  if (Number.isNaN(parsed.getTime())) {
    return;
  }

  await updatePassenger(operatorId, bookingId, passengerId, () => ({
    rescheduledTo: parsed,
    status: "rescheduled",
  }));
}

export async function checkInPassenger(operatorId: string, bookingId: string, passengerId: string) {
  await updatePassenger(operatorId, bookingId, passengerId, () => ({
    status: "checked_in",
    checkInTime: new Date(),
  }));
}

export async function recordBoardingScan(
  operatorId: string,
  bookingId: string,
  passengerId: string
) {
  await updatePassenger(operatorId, bookingId, passengerId, () => ({
    status: "boarded",
    boardedAt: new Date(),
  }));
}
