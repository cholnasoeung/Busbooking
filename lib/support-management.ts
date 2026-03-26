import { Filter, OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  passengerId: string;
  assignedTo: string;
  channel: "chat" | "phone" | "email";
  createdAt: Date;
  updatedAt: Date;
};

export type RefundDispute = {
  id: string;
  bookingId: string;
  passengerId: string;
  amount: number;
  reason: string;
  status: "pending" | "escalated" | "approved" | "rejected";
  submittedAt: Date;
  updatedAt: Date;
  resolutionNotes: string;
};

export type InvestigationRecord = {
  id: string;
  bookingId: string;
  operatorId: string;
  status: "pending" | "reviewing" | "closed";
  requestedBy: string;
  findings: string;
  recommendedAction: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FraudAlert = {
  id: string;
  passengerId: string;
  bookingReference: string;
  type: "chargeback" | "identity" | "duplicate";
  riskScore: number;
  status: "new" | "investigating" | "cleared";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

type SeedDoc = Record<string, unknown>;

type SupportTicketFilter = {
  status?: SupportTicket["status"];
  search?: string;
  page?: number;
  pageSize?: number;
};

const ticketSeed: SupportTicket[] = [
  {
    id: "TICKET-1001",
    subject: "Refund not received",
    message: "Passenger claims refund for booking BKG-3302 still pending.",
    priority: "high",
    status: "open",
    passengerId: "PAX-1002",
    assignedTo: "Support Rina",
    channel: "email",
    createdAt: new Date("2026-03-25T09:10:00.000Z"),
    updatedAt: new Date("2026-03-25T09:10:00.000Z"),
  },
  {
    id: "TICKET-1002",
    subject: "Bus delayed entry",
    message: "Driver never updated departure time in the app",
    priority: "medium",
    status: "in_progress",
    passengerId: "PAX-1003",
    assignedTo: "Ops Thom",
    channel: "chat",
    createdAt: new Date("2026-03-23T08:30:00.000Z"),
    updatedAt: new Date("2026-03-25T13:00:00.000Z"),
  },
];

type RefundDisputeFilter = {
  status?: RefundDispute["status"];
  search?: string;
  page?: number;
  pageSize?: number;
};

const disputeSeed: RefundDispute[] = [
  {
    id: "DISPUTE-2001",
    bookingId: "BKG-3302",
    passengerId: "PAX-1002",
    amount: 35,
    reason: "Cancelled by operator, no refund processed",
    status: "pending",
    submittedAt: new Date("2026-03-22T09:00:00.000Z"),
    updatedAt: new Date("2026-03-25T09:00:00.000Z"),
    resolutionNotes: "Waiting for operator confirmation",
  },
  {
    id: "DISPUTE-2002",
    bookingId: "BKG-3309",
    passengerId: "PAX-1004",
    amount: 12,
    reason: "Partial refund lost in transit",
    status: "escalated",
    submittedAt: new Date("2026-03-19T08:00:00.000Z"),
    updatedAt: new Date("2026-03-24T16:45:00.000Z"),
    resolutionNotes: "Finance reviewing bank transfer",
  },
];

type InvestigationFilter = {
  status?: InvestigationRecord["status"];
  search?: string;
  page?: number;
  pageSize?: number;
};

const investigationSeed: InvestigationRecord[] = [
  {
    id: "INV-4001",
    bookingId: "BKG-3302",
    operatorId: "OP-201",
    status: "reviewing",
    requestedBy: "Ops Lead Piseth",
    findings: "Driver list missing manifest entry for passenger.",
    recommendedAction: "Reconcile with CCTV and notify crew",
    createdAt: new Date("2026-03-24T12:00:00.000Z"),
    updatedAt: new Date("2026-03-25T11:00:00.000Z"),
  },
  {
    id: "INV-4002",
    bookingId: "BKG-3309",
    operatorId: "OP-204",
    status: "pending",
    requestedBy: "Support Srey Leak",
    findings: "Incomplete seating data flagged.",
    recommendedAction: "Confirm with operator before refund",
    createdAt: new Date("2026-03-25T06:40:00.000Z"),
    updatedAt: new Date("2026-03-25T07:30:00.000Z"),
  },
];

type FraudFilter = {
  status?: FraudAlert["status"];
  search?: string;
  page?: number;
  pageSize?: number;
};

const fraudSeed: FraudAlert[] = [
  {
    id: "FRAUD-5001",
    passengerId: "PAX-1005",
    bookingReference: "BKG-3311",
    type: "chargeback",
    riskScore: 86,
    status: "new",
    notes: "Two recent chargebacks across different routes.",
    createdAt: new Date("2026-03-25T10:00:00.000Z"),
    updatedAt: new Date("2026-03-25T10:00:00.000Z"),
  },
  {
    id: "FRAUD-5002",
    passengerId: "PAX-1003",
    bookingReference: "BKG-3313",
    type: "duplicate",
    riskScore: 42,
    status: "investigating",
    notes: "Identical passenger details on back-to-back bookings.",
    createdAt: new Date("2026-03-21T08:25:00.000Z"),
    updatedAt: new Date("2026-03-25T08:25:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeedCollections() {
  const db = await getDb();

  const collections: Array<{ name: string; seed: SeedDoc[] }> = [
    { name: "support_tickets", seed: ticketSeed },
    { name: "refund_disputes", seed: disputeSeed },
    { name: "investigations", seed: investigationSeed },
    { name: "fraud_alerts", seed: fraudSeed },
  ];

  const writes = collections.map(async (entry) => {
    const count = await db.collection(entry.name).countDocuments();
    if (count === 0) {
      await db
        .collection(entry.name)
        .insertMany(entry.seed as OptionalUnlessRequiredId<SeedDoc>[]);
    }
  });

  await Promise.all(writes);
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-5)}`;
}

const ticketStatuses: SupportTicket["status"][] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

const disputeStatuses: RefundDispute["status"][] = [
  "pending",
  "escalated",
  "approved",
  "rejected",
];

const investigationStatuses: InvestigationRecord["status"][] = [
  "pending",
  "reviewing",
  "closed",
];

const fraudStatuses: FraudAlert["status"][] = ["new", "investigating", "cleared"];

export type SupportOverview = {
  tickets: Record<SupportTicket["status"], number>;
  disputes: Record<RefundDispute["status"], number>;
  investigations: Record<InvestigationRecord["status"], number>;
  fraudAlerts: Record<FraudAlert["status"], number>;
};

function buildCounts<T extends string>(
  keys: T[],
  values: number[]
): Record<T, number> {
  return Object.fromEntries(
    keys.map((key, index) => [key, values[index] ?? 0])
  ) as Record<T, number>;
}

export async function getSupportOverview(): Promise<SupportOverview> {
  await ensureSeedCollections();
  const db = await getDb();
  const tickets = db.collection<SupportTicket>("support_tickets");
  const disputes = db.collection<RefundDispute>("refund_disputes");
  const investigations = db.collection<InvestigationRecord>("investigations");
  const fraudAlerts = db.collection<FraudAlert>("fraud_alerts");

  const [
    ticketCounts,
    disputeCounts,
    investigationCounts,
    fraudCounts,
  ] = await Promise.all([
    Promise.all(ticketStatuses.map((status) => tickets.countDocuments({ status }))),
    Promise.all(disputeStatuses.map((status) => disputes.countDocuments({ status }))),
    Promise.all(investigationStatuses.map((status) => investigations.countDocuments({ status }))),
    Promise.all(fraudStatuses.map((status) => fraudAlerts.countDocuments({ status }))),
  ]);

  return {
    tickets: buildCounts(ticketStatuses, ticketCounts),
    disputes: buildCounts(disputeStatuses, disputeCounts),
    investigations: buildCounts(investigationStatuses, investigationCounts),
    fraudAlerts: buildCounts(fraudStatuses, fraudCounts),
  };
}

function buildQuery<T>(value: string | undefined, fields: (keyof T)[]): Filter<T> | undefined {
  if (!value) {
    return undefined;
  }

  const pattern = new RegExp(value, "i");
  return {
    $or: fields.map((field) => ({ [field]: pattern })),
  } as Filter<T>;
}

export async function listSupportTickets(filter: SupportTicketFilter = {}) {
  await ensureSeedCollections();
  const db = await getDb();
  const query: Filter<SupportTicket> = {};

  if (filter.status) {
    query.status = filter.status;
  }

  const searchQuery = buildQuery<SupportTicket>(filter.search, [
    "subject",
    "message",
    "passengerId",
    "id",
  ]);

  if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.max(1, filter.pageSize ?? 6);
  const skip = (page - 1) * pageSize;

  return db
    .collection<SupportTicket>("support_tickets")
    .find(query)
    .sort({ priority: 1, updatedAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}

export async function createSupportTicket(data: {
  subject: string;
  message: string;
  priority: SupportTicket["priority"];
  passengerId: string;
  assignedTo: string;
  channel: SupportTicket["channel"];
}) {
  const db = await getDb();
  await db.collection<SupportTicket>("support_tickets").insertOne({
    id: buildId("TICKET"),
    subject: data.subject,
    message: data.message,
    priority: data.priority,
    status: "open",
    passengerId: data.passengerId,
    assignedTo: data.assignedTo,
    channel: data.channel,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateTicketStatus(id: string, status: SupportTicket["status"]) {
  const db = await getDb();
  await db.collection<SupportTicket>("support_tickets").updateOne(
    { id },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );
}

export async function listRefundDisputes(filter: RefundDisputeFilter = {}) {
  await ensureSeedCollections();
  const db = await getDb();
  const query: Filter<RefundDispute> = {};

  if (filter.status) {
    query.status = filter.status;
  }

  const searchQuery = buildQuery<RefundDispute>(filter.search, [
    "bookingId",
    "passengerId",
    "id",
  ]);

  if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.max(1, filter.pageSize ?? 6);
  const skip = (page - 1) * pageSize;

  return db
    .collection<RefundDispute>("refund_disputes")
    .find(query)
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}

export async function updateDisputeStatus(id: string, status: RefundDispute["status"], notes?: string) {
  const db = await getDb();
  await db.collection<RefundDispute>("refund_disputes").updateOne(
    { id },
    {
      $set: {
        status,
        resolutionNotes: notes ?? "",
        updatedAt: new Date(),
      },
    }
  );
}

export async function listInvestigations(filter: InvestigationFilter = {}) {
  await ensureSeedCollections();
  const db = await getDb();
  const query: Filter<InvestigationRecord> = {};

  if (filter.status) {
    query.status = filter.status;
  }

  const searchQuery = buildQuery<InvestigationRecord>(filter.search, [
    "bookingId",
    "operatorId",
    "id",
  ]);

  if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.max(1, filter.pageSize ?? 6);
  const skip = (page - 1) * pageSize;

  return db
    .collection<InvestigationRecord>("investigations")
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}

export async function createInvestigation(data: {
  bookingId: string;
  operatorId: string;
  requestedBy: string;
  findings: string;
  recommendedAction: string;
}) {
  const db = await getDb();
  await db.collection<InvestigationRecord>("investigations").insertOne({
    id: buildId("INV"),
    bookingId: data.bookingId,
    operatorId: data.operatorId,
    status: "pending",
    requestedBy: data.requestedBy,
    findings: data.findings,
    recommendedAction: data.recommendedAction,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateInvestigation(id: string, status: InvestigationRecord["status"], findings?: string) {
  const db = await getDb();
  await db.collection<InvestigationRecord>("investigations").updateOne(
    { id },
    {
      $set: {
        status,
        findings: findings ?? "",
        updatedAt: new Date(),
      },
    }
  );
}

export async function listFraudAlerts(filter: FraudFilter = {}) {
  await ensureSeedCollections();
  const db = await getDb();
  const query: Filter<FraudAlert> = {};

  if (filter.status) {
    query.status = filter.status;
  }

  const searchQuery = buildQuery<FraudAlert>(filter.search, [
    "bookingReference",
    "passengerId",
    "id",
  ]);

  if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.max(1, filter.pageSize ?? 6);
  const skip = (page - 1) * pageSize;

  return db
    .collection<FraudAlert>("fraud_alerts")
    .find(query)
    .sort({ riskScore: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();
}

export async function flagFraud(data: {
  passengerId: string;
  bookingReference: string;
  type: FraudAlert["type"];
  notes: string;
}) {
  const db = await getDb();
  await db.collection<FraudAlert>("fraud_alerts").insertOne({
    id: buildId("FRAUD"),
    passengerId: data.passengerId,
    bookingReference: data.bookingReference,
    type: data.type,
    riskScore: 30,
    status: "new",
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateFraudStatus(id: string, status: FraudAlert["status"]) {
  const db = await getDb();
  await db.collection<FraudAlert>("fraud_alerts").updateOne(
    { id },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );
}
