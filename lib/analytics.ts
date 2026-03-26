import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type BookingRecord = {
  id: string;
  passengerId: string;
  operatorId: string;
  fromCity: string;
  toCity: string;
  routeName: string;
  fare: number;
  status: "completed" | "cancelled" | "failed_payment";
  paymentStatus: "success" | "failed";
  bookingDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversionSession = {
  id: string;
  period: string;
  searches: number;
  bookings: number;
  createdAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

type SeedDoc = Record<string, unknown>;

const bookingSeed: BookingRecord[] = [
  {
    id: "BKG-3301",
    passengerId: "PAX-1001",
    operatorId: "OP-201",
    fromCity: "Siem Reap",
    toCity: "Phnom Penh",
    routeName: "Siem Reap ↔ Phnom Penh",
    fare: 18,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-05T08:00:00.000Z"),
    createdAt: new Date("2026-03-01T07:00:00.000Z"),
    updatedAt: new Date("2026-03-05T10:00:00.000Z"),
  },
  {
    id: "BKG-3302",
    passengerId: "PAX-1002",
    operatorId: "OP-203",
    fromCity: "Phnom Penh",
    toCity: "Sihanoukville",
    routeName: "Phnom Penh ↔ Sihanoukville",
    fare: 22,
    status: "cancelled",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-15T12:00:00.000Z"),
    createdAt: new Date("2026-03-12T11:00:00.000Z"),
    updatedAt: new Date("2026-03-15T13:00:00.000Z"),
  },
  {
    id: "BKG-3303",
    passengerId: "PAX-1003",
    operatorId: "OP-202",
    fromCity: "Phnom Penh",
    toCity: "Siem Reap",
    routeName: "Phnom Penh ↔ Siem Reap",
    fare: 19,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-18T09:00:00.000Z"),
    createdAt: new Date("2026-03-16T08:00:00.000Z"),
    updatedAt: new Date("2026-03-18T09:15:00.000Z"),
  },
  {
    id: "BKG-3304",
    passengerId: "PAX-1001",
    operatorId: "OP-202",
    fromCity: "Battambang",
    toCity: "Phnom Penh",
    routeName: "Battambang ↔ Phnom Penh",
    fare: 25,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-19T11:00:00.000Z"),
    createdAt: new Date("2026-03-15T10:00:00.000Z"),
    updatedAt: new Date("2026-03-19T11:10:00.000Z"),
  },
  {
    id: "BKG-3305",
    passengerId: "PAX-1004",
    operatorId: "OP-204",
    fromCity: "Kampot",
    toCity: "Sihanoukville",
    routeName: "Kampot ↔ Sihanoukville",
    fare: 15,
    status: "failed_payment",
    paymentStatus: "failed",
    bookingDate: new Date("2026-03-20T14:00:00.000Z"),
    createdAt: new Date("2026-03-19T13:30:00.000Z"),
    updatedAt: new Date("2026-03-20T14:05:00.000Z"),
  },
  {
    id: "BKG-3306",
    passengerId: "PAX-1003",
    operatorId: "OP-201",
    fromCity: "Phnom Penh",
    toCity: "Kampong Cham",
    routeName: "Phnom Penh ↔ Kampong Cham",
    fare: 13,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-21T07:30:00.000Z"),
    createdAt: new Date("2026-03-20T06:00:00.000Z"),
    updatedAt: new Date("2026-03-21T08:00:00.000Z"),
  },
  {
    id: "BKG-3307",
    passengerId: "PAX-1005",
    operatorId: "OP-201",
    fromCity: "Siem Reap",
    toCity: "Battambang",
    routeName: "Siem Reap ↔ Battambang",
    fare: 12,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-22T09:00:00.000Z"),
    createdAt: new Date("2026-03-21T08:00:00.000Z"),
    updatedAt: new Date("2026-03-22T09:10:00.000Z"),
  },
  {
    id: "BKG-3308",
    passengerId: "PAX-1004",
    operatorId: "OP-204",
    fromCity: "Phnom Penh",
    toCity: "Sihanoukville",
    routeName: "Phnom Penh ↔ Sihanoukville",
    fare: 22,
    status: "completed",
    paymentStatus: "success",
    bookingDate: new Date("2026-03-23T10:00:00.000Z"),
    createdAt: new Date("2026-03-23T09:00:00.000Z"),
    updatedAt: new Date("2026-03-23T10:10:00.000Z"),
  },
];

const conversionSeed: ConversionSession[] = [
  {
    id: "CONV-1",
    period: "2026-W10",
    searches: 320,
    bookings: 45,
    createdAt: new Date("2026-03-10T00:00:00.000Z"),
  },
  {
    id: "CONV-2",
    period: "2026-W11",
    searches: 410,
    bookings: 60,
    createdAt: new Date("2026-03-17T00:00:00.000Z"),
  },
  {
    id: "CONV-3",
    period: "2026-W12",
    searches: 385,
    bookings: 52,
    createdAt: new Date("2026-03-24T00:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeedCollections() {
  const db = await getDb();
  const entries: Array<{ name: string; seed: SeedDoc[] }> = [
    { name: "bookings", seed: bookingSeed },
    { name: "conversion_sessions", seed: conversionSeed },
  ];

  const writes = entries.map(async (entry) => {
    const count = await db.collection(entry.name).countDocuments();
    if (count === 0) {
      await db
        .collection(entry.name)
        .insertMany(entry.seed as OptionalUnlessRequiredId<SeedDoc>[]);
    }
  });

  await Promise.all(writes);
}

export type BookingMetrics = {
  totalBookings: number;
  revenue: number;
  gmv: number;
  repeatCustomers: number;
  failedPaymentRate: number;
  cancellationRate: number;
  conversionRate: number;
};

export async function getBookingMetrics(): Promise<BookingMetrics> {
  await ensureSeedCollections();
  const db = await getDb();
  const bookings = db.collection<BookingRecord>("bookings");
  const conversions = db.collection<ConversionSession>("conversion_sessions");

  const totalBookingsPromise = bookings.countDocuments();
  const completedRevenuePromise = bookings.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$fare" } } },
  ]).toArray();
  const gmvPromise = bookings.aggregate([
    { $match: { status: { $in: ["completed", "cancelled"] } } },
    { $group: { _id: null, total: { $sum: "$fare" } } },
  ]).toArray();
  const failedCountPromise = bookings.countDocuments({ status: "failed_payment" });
  const cancelledCountPromise = bookings.countDocuments({ status: "cancelled" });
  const completedCountPromise = bookings.countDocuments({ status: "completed" });
  const repeatPromise = bookings.aggregate([
    { $group: { _id: "$passengerId", total: { $sum: 1 } } },
    { $match: { total: { $gt: 1 } } },
    { $count: "repeatCustomers" },
  ]).toArray();
  const conversionPromise = conversions.aggregate([
    {
      $group: {
        _id: null,
        totalSearches: { $sum: "$searches" },
        totalBookings: { $sum: "$bookings" },
      },
    },
  ]).toArray();

  const [
    totalBookings,
    completedRevenue,
    gmvResult,
    failedCount,
    cancelledCount,
    completedCount,
    repeatResults,
    conversionResults,
  ] = await Promise.all([
    totalBookingsPromise,
    completedRevenuePromise,
    gmvPromise,
    failedCountPromise,
    cancelledCountPromise,
    completedCountPromise,
    repeatPromise,
    conversionPromise,
  ]);

  const revenue = completedRevenue[0]?.total ?? 0;
  const gmv = gmvResult[0]?.total ?? 0;
  const repeatCustomers = repeatResults[0]?.repeatCustomers ?? 0;
  const conversionEntry = conversionResults[0];
  const conversionRate =
    conversionEntry && conversionEntry.totalSearches
      ? conversionEntry.totalBookings / conversionEntry.totalSearches
      : 0;
  const attemptCount = failedCount + completedCount;
  const failedPaymentRate = attemptCount ? failedCount / attemptCount : 0;
  const cancellationRate = completedCount + cancelledCount
    ? cancelledCount / (completedCount + cancelledCount)
    : 0;

  return {
    totalBookings,
    revenue,
    gmv,
    repeatCustomers,
    failedPaymentRate,
    cancellationRate,
    conversionRate,
  };
}

export type TopRoute = {
  route: string;
  bookings: number;
  revenue: number;
};

export async function listTopRoutes(limit = 5): Promise<TopRoute[]> {
  await ensureSeedCollections();
  const db = await getDb();
  const result = await db
    .collection<BookingRecord>("bookings")
    .aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$routeName",
          bookings: { $sum: 1 },
          revenue: { $sum: "$fare" },
        },
      },
      { $sort: { bookings: -1, revenue: -1 } },
      { $limit: limit },
    ])
    .toArray();

  return result.map((item) => ({
    route: item._id,
    bookings: item.bookings,
    revenue: item.revenue,
  }));
}
