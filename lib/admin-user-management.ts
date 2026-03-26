import clientPromise from "@/lib/mongodb";

export type AccountStatus = "active" | "suspended" | "pending_review";
export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "not_required";

export type StaffRole =
  | "super_admin"
  | "finance_admin"
  | "support_admin"
  | "ops_admin";

export type PassengerRecord = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  tripsCompleted: number;
  lastBooking: string;
  status: AccountStatus;
};

export type OperatorRecord = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  activeRoutes: number;
  status: AccountStatus;
  verification: VerificationStatus;
  submittedAt: string;
  documentsComplete: boolean;
};

export type StaffRecord = {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  accessScope: string;
  lastSignIn: string;
  status: AccountStatus;
};

export type ManagementStat = {
  label: string;
  value: number;
  detail: string;
};

type PassengerDocument = PassengerRecord & {
  createdAt: Date;
  updatedAt: Date;
};

type OperatorDocument = OperatorRecord & {
  createdAt: Date;
  updatedAt: Date;
};

type StaffDocument = StaffRecord & {
  createdAt: Date;
  updatedAt: Date;
};

const databaseName = process.env.MONGODB_DB_NAME ?? "bus_booking";
const passengersCollectionName = "passengers";
const operatorsCollectionName = "operators";
const staffCollectionName = "staff_accounts";

const passengerSeedData: PassengerDocument[] = [
  {
    id: "PAX-1001",
    fullName: "Sokha Chann",
    phone: "+855 12 555 201",
    email: "sokha@example.com",
    tripsCompleted: 14,
    lastBooking: "2026-03-21T08:15:00.000Z",
    status: "active",
    createdAt: new Date("2026-03-01T08:15:00.000Z"),
    updatedAt: new Date("2026-03-21T08:15:00.000Z"),
  },
  {
    id: "PAX-1002",
    fullName: "Dara Vuthy",
    phone: "+855 10 422 774",
    email: "dara@example.com",
    tripsCompleted: 4,
    lastBooking: "2026-03-20T17:40:00.000Z",
    status: "pending_review",
    createdAt: new Date("2026-03-05T09:00:00.000Z"),
    updatedAt: new Date("2026-03-20T17:40:00.000Z"),
  },
  {
    id: "PAX-1003",
    fullName: "Malis Nika",
    phone: "+855 96 884 900",
    email: "malis@example.com",
    tripsCompleted: 28,
    lastBooking: "2026-03-24T11:30:00.000Z",
    status: "active",
    createdAt: new Date("2026-02-11T11:30:00.000Z"),
    updatedAt: new Date("2026-03-24T11:30:00.000Z"),
  },
  {
    id: "PAX-1004",
    fullName: "Rithy Long",
    phone: "+855 77 129 113",
    email: "rithy@example.com",
    tripsCompleted: 2,
    lastBooking: "2026-03-10T06:05:00.000Z",
    status: "suspended",
    createdAt: new Date("2026-03-02T06:05:00.000Z"),
    updatedAt: new Date("2026-03-10T06:05:00.000Z"),
  },
];

const operatorSeedData: OperatorDocument[] = [
  {
    id: "OP-201",
    companyName: "Mekong Express",
    contactName: "Vanna Touch",
    phone: "+855 11 300 901",
    activeRoutes: 18,
    status: "active",
    verification: "verified",
    submittedAt: "2026-03-02T00:00:00.000Z",
    documentsComplete: true,
    createdAt: new Date("2026-03-02T04:00:00.000Z"),
    updatedAt: new Date("2026-03-22T09:00:00.000Z"),
  },
  {
    id: "OP-202",
    companyName: "Virak Buntham",
    contactName: "Sopheak Chhim",
    phone: "+855 12 801 100",
    activeRoutes: 25,
    status: "active",
    verification: "verified",
    submittedAt: "2026-02-25T00:00:00.000Z",
    documentsComplete: true,
    createdAt: new Date("2026-02-25T04:00:00.000Z"),
    updatedAt: new Date("2026-03-18T07:30:00.000Z"),
  },
  {
    id: "OP-203",
    companyName: "Khmer Transit Co.",
    contactName: "Nary Chea",
    phone: "+855 15 440 811",
    activeRoutes: 0,
    status: "pending_review",
    verification: "pending",
    submittedAt: "2026-03-24T00:00:00.000Z",
    documentsComplete: false,
    createdAt: new Date("2026-03-24T04:00:00.000Z"),
    updatedAt: new Date("2026-03-24T04:00:00.000Z"),
  },
  {
    id: "OP-204",
    companyName: "Tonle Sap Travel",
    contactName: "Pich Chanthorn",
    phone: "+855 86 600 441",
    activeRoutes: 6,
    status: "suspended",
    verification: "rejected",
    submittedAt: "2026-03-12T00:00:00.000Z",
    documentsComplete: true,
    createdAt: new Date("2026-03-12T04:00:00.000Z"),
    updatedAt: new Date("2026-03-14T06:00:00.000Z"),
  },
];

const staffSeedData: StaffDocument[] = [
  {
    id: "ADM-01",
    fullName: "Admin Rina",
    email: "rina@busbooking.com",
    role: "super_admin",
    accessScope: "Full platform access",
    lastSignIn: "2026-03-26T09:10:00.000Z",
    status: "active",
    createdAt: new Date("2026-02-18T09:10:00.000Z"),
    updatedAt: new Date("2026-03-26T09:10:00.000Z"),
  },
  {
    id: "ADM-02",
    fullName: "Piseth Khem",
    email: "piseth@busbooking.com",
    role: "ops_admin",
    accessScope: "Operators, routes, trip incidents",
    lastSignIn: "2026-03-26T08:41:00.000Z",
    status: "active",
    createdAt: new Date("2026-02-25T08:41:00.000Z"),
    updatedAt: new Date("2026-03-26T08:41:00.000Z"),
  },
  {
    id: "ADM-03",
    fullName: "Srey Leak",
    email: "support@busbooking.com",
    role: "support_admin",
    accessScope: "Refunds, complaints, booking disputes",
    lastSignIn: "2026-03-25T19:22:00.000Z",
    status: "pending_review",
    createdAt: new Date("2026-03-01T19:22:00.000Z"),
    updatedAt: new Date("2026-03-25T19:22:00.000Z"),
  },
  {
    id: "ADM-04",
    fullName: "Vichea Sim",
    email: "finance@busbooking.com",
    role: "finance_admin",
    accessScope: "Payouts, settlement review, reports",
    lastSignIn: "2026-03-22T14:08:00.000Z",
    status: "suspended",
    createdAt: new Date("2026-03-02T14:08:00.000Z"),
    updatedAt: new Date("2026-03-22T14:08:00.000Z"),
  },
];

function normalizeStatus(status: string | null | undefined): AccountStatus {
  if (status === "active" || status === "suspended" || status === "pending_review") {
    return status;
  }

  return "pending_review";
}

function normalizeVerification(
  verification: string | null | undefined
): VerificationStatus {
  if (
    verification === "verified" ||
    verification === "pending" ||
    verification === "rejected" ||
    verification === "not_required"
  ) {
    return verification;
  }

  return "pending";
}

function normalizeStaffRole(role: string | null | undefined): StaffRole {
  if (
    role === "super_admin" ||
    role === "finance_admin" ||
    role === "support_admin" ||
    role === "ops_admin"
  ) {
    return role;
  }

  return "ops_admin";
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Phnom_Penh",
  }).format(date);
}

function formatDateOnly(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Phnom_Penh",
  }).format(date);
}

async function getDb() {
  const client = await clientPromise;
  return client.db(databaseName);
}

async function ensureAdminUserSeedData() {
  const db = await getDb();

  const passengersCollection =
    db.collection<PassengerDocument>(passengersCollectionName);
  const operatorsCollection = db.collection<OperatorDocument>(
    operatorsCollectionName
  );
  const staffCollection = db.collection<StaffDocument>(staffCollectionName);

  const [passengerCount, operatorCount, staffCount] = await Promise.all([
    passengersCollection.countDocuments(),
    operatorsCollection.countDocuments(),
    staffCollection.countDocuments(),
  ]);

  const writes: Promise<unknown>[] = [];

  if (passengerCount === 0) {
    writes.push(passengersCollection.insertMany(passengerSeedData));
  }

  if (operatorCount === 0) {
    writes.push(operatorsCollection.insertMany(operatorSeedData));
  }

  if (staffCount === 0) {
    writes.push(staffCollection.insertMany(staffSeedData));
  }

  if (writes.length > 0) {
    await Promise.all(writes);
  }
}

function buildStats(input: {
  passengerCount: number;
  passengersNeedingAttention: number;
  operatorCount: number;
  pendingOperators: number;
  staffCount: number;
  staffNeedingReview: number;
  suspendedTotal: number;
}): ManagementStat[] {
  return [
    {
      label: "Passengers",
      value: input.passengerCount,
      detail: `${input.passengersNeedingAttention} need attention today`,
    },
    {
      label: "Operators",
      value: input.operatorCount,
      detail: `${input.pendingOperators} pending verification`,
    },
    {
      label: "Staff & Admins",
      value: input.staffCount,
      detail: `${input.staffNeedingReview} accounts under review`,
    },
    {
      label: "Suspended Accounts",
      value: input.suspendedTotal,
      detail: "Across all user groups",
    },
  ];
}

function toPassengerRecord(record: Partial<PassengerDocument> & { id: string }) {
  return {
    id: record.id,
    fullName: record.fullName ?? "Unknown passenger",
    phone: record.phone ?? "-",
    email: record.email ?? "-",
    tripsCompleted: record.tripsCompleted ?? 0,
    lastBooking: formatDateTime(record.lastBooking ?? record.updatedAt),
    status: normalizeStatus(record.status),
  } satisfies PassengerRecord;
}

function toOperatorRecord(record: Partial<OperatorDocument> & { id: string }) {
  return {
    id: record.id,
    companyName: record.companyName ?? "Unknown operator",
    contactName: record.contactName ?? "-",
    phone: record.phone ?? "-",
    activeRoutes: record.activeRoutes ?? 0,
    status: normalizeStatus(record.status),
    verification: normalizeVerification(record.verification),
    submittedAt: formatDateOnly(record.submittedAt ?? record.createdAt),
    documentsComplete: Boolean(record.documentsComplete),
  } satisfies OperatorRecord;
}

function toStaffRecord(record: Partial<StaffDocument> & { id: string }) {
  return {
    id: record.id,
    fullName: record.fullName ?? "Unknown staff",
    email: record.email ?? "-",
    role: normalizeStaffRole(record.role),
    accessScope: record.accessScope ?? "-",
    lastSignIn: formatDateTime(record.lastSignIn ?? record.updatedAt),
    status: normalizeStatus(record.status),
  } satisfies StaffRecord;
}

export async function getAdminUserManagementData(
  status: AccountStatus | "all"
) {
  await ensureAdminUserSeedData();

  const db = await getDb();
  const passengersCollection =
    db.collection<PassengerDocument>(passengersCollectionName);
  const operatorsCollection = db.collection<OperatorDocument>(
    operatorsCollectionName
  );
  const staffCollection = db.collection<StaffDocument>(staffCollectionName);

  const filter = status === "all" ? {} : { status };

  const [passengers, operators, staff, counts] = await Promise.all([
    passengersCollection.find(filter).sort({ updatedAt: -1 }).toArray(),
    operatorsCollection.find(filter).sort({ updatedAt: -1 }).toArray(),
    staffCollection.find(filter).sort({ updatedAt: -1 }).toArray(),
    Promise.all([
      passengersCollection.countDocuments(),
      passengersCollection.countDocuments({ status: "pending_review" }),
      operatorsCollection.countDocuments(),
      operatorsCollection.countDocuments({ verification: "pending" }),
      staffCollection.countDocuments(),
      staffCollection.countDocuments({ status: "pending_review" }),
      passengersCollection.countDocuments({ status: "suspended" }),
      operatorsCollection.countDocuments({ status: "suspended" }),
      staffCollection.countDocuments({ status: "suspended" }),
    ]),
  ]);

  const [
    passengerCount,
    passengersNeedingAttention,
    operatorCount,
    pendingOperators,
    staffCount,
    staffNeedingReview,
    suspendedPassengers,
    suspendedOperators,
    suspendedStaff,
  ] = counts;

  return {
    passengers: passengers.map((record) => toPassengerRecord(record)),
    operators: operators.map((record) => toOperatorRecord(record)),
    staff: staff.map((record) => toStaffRecord(record)),
    stats: buildStats({
      passengerCount,
      passengersNeedingAttention,
      operatorCount,
      pendingOperators,
      staffCount,
      staffNeedingReview,
      suspendedTotal:
        suspendedPassengers + suspendedOperators + suspendedStaff,
    }),
  };
}

export async function setPassengerStatus(id: string, status: AccountStatus) {
  const db = await getDb();

  await db.collection<PassengerDocument>(passengersCollectionName).updateOne(
    { id },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export async function createPassenger(data: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const db = await getDb();
  await db.collection<PassengerDocument>(passengersCollectionName).insertOne({
    id: buildId("PAX"),
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    tripsCompleted: 0,
    lastBooking: new Date().toISOString(),
    status: "pending_review",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function createOperator(data: {
  companyName: string;
  contactName: string;
  phone: string;
}) {
  const db = await getDb();
  await db.collection<OperatorDocument>(operatorsCollectionName).insertOne({
    id: buildId("OP"),
    companyName: data.companyName,
    contactName: data.contactName,
    phone: data.phone,
    activeRoutes: 0,
    status: "pending_review",
    verification: "pending",
    submittedAt: new Date().toISOString(),
    documentsComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function createStaff(data: {
  fullName: string;
  email: string;
  role: StaffRole;
}) {
  const db = await getDb();
  await db.collection<StaffDocument>(staffCollectionName).insertOne({
    id: buildId("ADM"),
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    accessScope: "Pending scope definition",
    lastSignIn: new Date().toISOString(),
    status: "pending_review",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function deletePassenger(id: string) {
  const db = await getDb();
  await db.collection<PassengerDocument>(passengersCollectionName).deleteOne({ id });
}

export async function deleteOperator(id: string) {
  const db = await getDb();
  await db.collection<OperatorDocument>(operatorsCollectionName).deleteOne({ id });
}

export async function deleteStaff(id: string) {
  const db = await getDb();
  await db.collection<StaffDocument>(staffCollectionName).deleteOne({ id });
}

export async function setStaffStatus(id: string, status: AccountStatus) {
  const db = await getDb();

  await db.collection<StaffDocument>(staffCollectionName).updateOne(
    { id },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );
}

export async function verifyOperator(id: string) {
  const db = await getDb();

  await db.collection<OperatorDocument>(operatorsCollectionName).updateOne(
    { id },
    {
      $set: {
        status: "active",
        verification: "verified",
        documentsComplete: true,
        updatedAt: new Date(),
      },
    }
  );
}

export async function rejectOperator(id: string) {
  const db = await getDb();

  await db.collection<OperatorDocument>(operatorsCollectionName).updateOne(
    { id },
    {
      $set: {
        status: "suspended",
        verification: "rejected",
        updatedAt: new Date(),
      },
    }
  );
}

export async function suspendOperator(id: string) {
  const db = await getDb();

  await db.collection<OperatorDocument>(operatorsCollectionName).updateOne(
    { id },
    {
      $set: {
        status: "suspended",
        updatedAt: new Date(),
      },
    }
  );
}

export async function restoreOperator(id: string) {
  const db = await getDb();
  const collection = db.collection<OperatorDocument>(operatorsCollectionName);
  const existing = await collection.findOne({ id });

  if (!existing) {
    return;
  }

  const verification =
    existing.verification === "rejected" ? "pending" : existing.verification;
  const status = verification === "pending" ? "pending_review" : "active";

  await collection.updateOne(
    { id },
    {
      $set: {
        status,
        verification,
        updatedAt: new Date(),
      },
    }
  );
}
