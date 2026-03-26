import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type OperatorRoute = {
  id: string;
  routeName: string;
  operatorId: string;
  fromCity: string;
  toCity: string;
  stops: string[];
  boardingPoints: string[];
  dropPoints: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BoardingPoint = {
  id: string;
  routeId: string;
  name: string;
  type: "boarding" | "drop";
  location: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TripSchedule = {
  id: string;
  routeId: string;
  departureTime: string;
  vehicle: string;
  recurrence: "daily" | "weekly" | "custom";
  days?: string[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

const routeSeed: OperatorRoute[] = [
  {
    id: "ROUTE-301",
    routeName: "Phnom Penh ↔ Sihanoukville",
    operatorId: "OP-201",
    fromCity: "Phnom Penh",
    toCity: "Sihanoukville",
    stops: ["Olympic Circle", "Central Market", "Highway 4 Plaza"],
    boardingPoints: ["Olympic Circle", "Central Market"],
    dropPoints: ["Sihanoukville Terminal"],
    active: true,
    createdAt: new Date("2026-03-01T08:00:00.000Z"),
    updatedAt: new Date("2026-03-10T09:00:00.000Z"),
  },
];

const scheduleSeed: TripSchedule[] = [
  {
    id: "SCHED-401",
    routeId: "ROUTE-301",
    departureTime: "08:00",
    vehicle: "Express 1",
    recurrence: "daily",
    days: ["mon", "tue", "wed", "thu", "fri"],
    startDate: new Date("2026-03-05T00:00:00.000Z"),
    createdAt: new Date("2026-03-05T00:00:00.000Z"),
    updatedAt: new Date("2026-03-05T00:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeeds() {
  const db = await getDb();
  const entries = [
    { name: "operator_routes", seed: routeSeed },
    { name: "trip_schedules", seed: scheduleSeed },
  ];

  await Promise.all(
    entries.map(async (entry) => {
      const count = await db.collection(entry.name).countDocuments();
      if (count === 0) {
        await db
          .collection(entry.name)
          .insertMany(entry.seed as OptionalUnlessRequiredId<OperatorRoute | TripSchedule>[]);
      }
    })
  );
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

export async function listOperatorRoutes(operatorId: string) {
  await ensureSeeds();
  const db = await getDb();
  return db.collection<OperatorRoute>("operator_routes").find({ operatorId }).sort({ updatedAt: -1 }).toArray();
}

export async function createRoute(data: {
  routeName: string;
  operatorId: string;
  fromCity: string;
  toCity: string;
  stops: string[];
}) {
  const db = await getDb();
  await db.collection<OperatorRoute>("operator_routes").insertOne({
    id: buildId("ROUTE"),
    routeName: data.routeName,
    operatorId: data.operatorId,
    fromCity: data.fromCity,
    toCity: data.toCity,
    stops: data.stops,
    boardingPoints: [],
    dropPoints: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function addBoardingPoint(routeId: string, name: string, location: string) {
  const db = await getDb();
  await db.collection<OperatorRoute>("operator_routes").updateOne(
    { id: routeId },
    {
      $addToSet: {
        boardingPoints: name,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
  await db.collection<BoardingPoint>("boarding_points").insertOne({
    id: buildId("BOARD"),
    routeId,
    name,
    type: "boarding",
    location,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function addDropPoint(routeId: string, name: string, location: string) {
  const db = await getDb();
  await db.collection<OperatorRoute>("operator_routes").updateOne(
    { id: routeId },
    {
      $addToSet: {
        dropPoints: name,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
  await db.collection<BoardingPoint>("boarding_points").insertOne({
    id: buildId("DROP"),
    routeId,
    name,
    type: "drop",
    location,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function listTripSchedules(routeId?: string) {
  await ensureSeeds();
  const db = await getDb();
  const query = routeId ? { routeId } : {};
  return db.collection<TripSchedule>("trip_schedules").find(query).sort({ departureTime: 1 }).toArray();
}

export async function createSchedule(data: {
  routeId: string;
  departureTime: string;
  vehicle: string;
  recurrence: TripSchedule["recurrence"];
  days?: string[];
  startDate: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  await db.collection<TripSchedule>("trip_schedules").insertOne({
    id: buildId("SCHED"),
    routeId: data.routeId,
    departureTime: data.departureTime,
    vehicle: data.vehicle,
    recurrence: data.recurrence,
    days: data.days,
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

