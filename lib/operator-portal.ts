import { OptionalUnlessRequiredId } from "mongodb";
import { randomUUID } from "crypto";
import clientPromise from "@/lib/mongodb";

export type OperatorDocument = {
  id: string;
  name: string;
  filename: string;
  status: "uploaded" | "under_review" | "accepted" | "rejected";
  uploadedAt: Date;
};

export type OperatorProfile = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  headquarters: string;
  routesManaged: number;
  staffCount: number;
  updatedAt: Date;
  active: boolean;
  secret: string;
  documents: OperatorDocument[];
};

export type OperatorStaff = {
  id: string;
  fullName: string;
  role: OperatorRole;
  status: "active" | "suspended";
  permissions: string[];
  lastSeen: Date;
};

export type OperatorRole =
  | "operations_lead"
  | "sales_lead"
  | "support_lead"
  | "finance_lead";

export type PermissionDefinition = {
  id: string;
  label: string;
  description: string;
  scopes: string[];
};

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PasswordResetRequest = {
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

type SeedDoc = Record<string, unknown>;

const operatorSeed: OperatorProfile[] = [
  {
    id: "OP-201",
    companyName: "Mekong Express",
    contactName: "Vanna Touch",
    phone: "+855 11 300 901",
    email: "vanna@mekong.com",
    headquarters: "Phnom Penh",
    routesManaged: 18,
    staffCount: 6,
    updatedAt: new Date("2026-03-25T09:30:00.000Z"),
    active: true,
    secret: "operator-demo",
    documents: [
      {
        id: "DOC-701",
        name: "Business registration",
        filename: "registration.pdf",
        status: "accepted",
        uploadedAt: new Date("2026-03-10T10:00:00.000Z"),
      },
    ],
  },
];

const staffSeed: OperatorStaff[] = [
  {
    id: "STAFF-501",
    fullName: "Dana Sovann",
    role: "operations_lead",
    status: "active",
    permissions: ["manage_trips", "view_reports", "assign_routes"],
    lastSeen: new Date("2026-03-26T08:31:00.000Z"),
  },
  {
    id: "STAFF-502",
    fullName: "Sophea Rith",
    role: "support_lead",
    status: "active",
    permissions: ["manage_support_tickets", "view_passengers"],
    lastSeen: new Date("2026-03-25T15:10:00.000Z"),
  },
  {
    id: "STAFF-503",
    fullName: "Bunthoeun Chhank",
    role: "sales_lead",
    status: "suspended",
    permissions: ["launch_discounts", "manage_agents"],
    lastSeen: new Date("2026-03-12T17:20:00.000Z"),
  },
];

const permissionCatalog: PermissionDefinition[] = [
  {
    id: "operations_lead",
    label: "Operations Lead",
    description: "Owns routes, schedules, and boarding manifests.",
    scopes: ["manage_trips", "assign_routes", "review_reports"],
  },
  {
    id: "sales_lead",
    label: "Sales Lead",
    description: "Manages agents, promo codes, and revenue targets.",
    scopes: ["launch_discounts", "manage_agents", "view_revenue"],
  },
  {
    id: "support_lead",
    label: "Support Lead",
    description: "Handles passenger issues and refund disputes.",
    scopes: ["manage_support_tickets", "view_passengers"],
  },
  {
    id: "finance_lead",
    label: "Finance Lead",
    description: "Tracks payouts, commissions, and reconciliations.",
    scopes: ["view_finance", "approve_payouts"],
  },
];

const roleSeed: RoleRecord[] = permissionCatalog.map((item) => ({
  id: item.id,
  name: item.label,
  description: item.description,
  permissions: item.scopes,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeeds() {
  const db = await getDb();
  const entries: Array<{ name: string; seed: SeedDoc[] }> = [
    { name: "operator_profiles", seed: operatorSeed },
    { name: "operator_staff", seed: staffSeed },
    { name: "operator_roles", seed: roleSeed },
  ];

  await Promise.all(
    entries.map(async (entry) => {
      const count = await db.collection(entry.name).countDocuments();
      if (count === 0) {
        await db
          .collection(entry.name)
          .insertMany(entry.seed as OptionalUnlessRequiredId<SeedDoc>[]);
      }
    })
  );
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

async function ensureProfile() {
  await ensureSeeds();
  const db = await getDb();
  const existing = await db.collection<OperatorProfile>("operator_profiles").findOne({});
  if (!existing) {
    await db.collection<OperatorProfile>("operator_profiles").insertOne(operatorSeed[0]);
  }
}

export async function getOperatorProfile(): Promise<OperatorProfile> {
  await ensureProfile();
  const db = await getDb();
  const record = await db.collection<OperatorProfile>("operator_profiles").findOne({});
  if (!record) {
    throw new Error("Operator profile missing.");
  }
  return record;
}

export async function updateCompanyProfile(data: {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  headquarters: string;
}) {
  const db = await getDb();
  await db.collection<OperatorProfile>("operator_profiles").updateOne(
    {},
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
}

export async function listOperatorStaff() {
  await ensureSeeds();
  const db = await getDb();
  return db.collection<OperatorStaff>("operator_staff").find().sort({ fullName: 1 }).toArray();
}

export async function createOperatorStaff(data: {
  fullName: string;
  role: OperatorRole;
}) {
  const db = await getDb();
  await db.collection<OperatorStaff>("operator_staff").insertOne({
    id: buildId("STAFF"),
    fullName: data.fullName,
    role: data.role,
    status: "active",
    permissions:
      permissionCatalog.find((entry) => entry.id === data.role)?.scopes ?? [],
    lastSeen: new Date(),
  });

  await db.collection<OperatorProfile>("operator_profiles").updateOne(
    {},
    {
      $inc: { staffCount: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function updateStaffName(id: string, fullName: string) {
  const db = await getDb();
  await db.collection<OperatorStaff>("operator_staff").updateOne(
    { id },
    {
      $set: {
        fullName,
        lastSeen: new Date(),
      },
    }
  );
}

export async function deleteStaff(id: string) {
  const db = await getDb();
  const result = await db.collection<OperatorStaff>("operator_staff").deleteOne({ id });
  if (result.deletedCount) {
    await db.collection<OperatorProfile>("operator_profiles").updateOne(
      {},
      {
        $inc: { staffCount: -1 },
        $set: { updatedAt: new Date() },
      }
    );
  }
}

export async function updateStaffRole(id: string, role: OperatorRole) {
  const db = await getDb();
  const permissions =
    permissionCatalog.find((entry) => entry.id === role)?.scopes ?? [];
  await db.collection<OperatorStaff>("operator_staff").updateOne(
    { id },
    {
      $set: {
        role,
        permissions,
        lastSeen: new Date(),
      },
    }
  );
}

export async function toggleStaffStatus(id: string, status: "active" | "suspended") {
  const db = await getDb();
  await db.collection<OperatorStaff>("operator_staff").updateOne(
    { id },
    {
      $set: {
        status,
        lastSeen: new Date(),
      },
    }
  );
}

export async function listRoles() {
  await ensureSeeds();
  const db = await getDb();
  return db.collection<RoleRecord>("operator_roles").find().sort({ name: 1 }).toArray();
}

export async function createRole(data: {
  name: string;
  description: string;
  permissions: string[];
}) {
  const db = await getDb();
  await db.collection<RoleRecord>("operator_roles").insertOne({
    id: buildId("ROLE"),
    name: data.name,
    description: data.description,
    permissions: data.permissions,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateRole(id: string, data: { name: string; description: string; permissions: string[] }) {
  const db = await getDb();
  await db.collection<RoleRecord>("operator_roles").updateOne(
    { id },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
}

export async function disableRole(id: string) {
  const db = await getDb();
  await db.collection<RoleRecord>("operator_roles").updateOne(
    { id },
    {
      $set: {
        active: false,
        updatedAt: new Date(),
      },
    }
  );
}

export async function assignRoleToStaff(staffId: string, roleId: string) {
  const db = await getDb();
  const role = await db.collection<RoleRecord>("operator_roles").findOne({ id: roleId, active: true });
  if (!role) {
    return;
  }

  await db.collection<OperatorStaff>("operator_staff").updateOne(
    { id: staffId },
    {
      $set: {
        role: roleId as OperatorRole,
        permissions: role.permissions,
        lastSeen: new Date(),
      },
    }
  );
}

export async function uploadDocument(name: string, filename: string) {
  const doc: OperatorDocument = {
    id: buildId("DOC"),
    name,
    filename,
    status: "under_review",
    uploadedAt: new Date(),
  };
  const db = await getDb();
  await db.collection<OperatorProfile>("operator_profiles").updateOne(
    {},
    {
      $push: {
        documents: doc,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
  return doc;
}

export async function listDocuments() {
  const profile = await getOperatorProfile();
  return profile.documents;
}

export async function setOperatorActive(active: boolean) {
  const db = await getDb();
  await db.collection<OperatorProfile>("operator_profiles").updateOne(
    {},
    {
      $set: {
        active,
        updatedAt: new Date(),
      },
    }
  );
}

export async function operatorLogin(identifier: string, secret: string) {
  await ensureSeeds();
  const db = await getDb();
  const profile = await db.collection<OperatorProfile>("operator_profiles").findOne({});
  if (!profile || !profile.active) {
    return null;
  }

  if (
    identifier === profile.email ||
    identifier === profile.phone ||
    identifier.toLowerCase() === profile.companyName.toLowerCase()
  ) {
    if (secret === profile.secret) {
      await db.collection<OperatorProfile>("operator_profiles").updateOne(
        { id: profile.id },
        { $set: { updatedAt: new Date() } }
      );
      return profile;
    }
  }

  return null;
}

export async function requestPasswordReset(email: string) {
  await ensureSeeds();
  const db = await getDb();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  await db.collection<PasswordResetRequest>("password_resets").insertOne({
    token,
    email,
    expiresAt,
    used: false,
    createdAt: new Date(),
  });
  return token;
}

export async function resetPassword(token: string, newSecret: string) {
  const db = await getDb();
  const request = await db.collection<PasswordResetRequest>("password_resets").findOne({ token });
  if (!request || request.used || request.expiresAt < new Date()) {
    return false;
  }

  await db.collection<OperatorProfile>("operator_profiles").updateOne(
    {},
    {
      $set: {
        secret: newSecret,
        updatedAt: new Date(),
      },
    }
  );

  await db.collection<PasswordResetRequest>("password_resets").updateOne(
    { token },
    { $set: { used: true } }
  );

  return true;
}

export function availablePermissions(): PermissionDefinition[] {
  return permissionCatalog;
}
