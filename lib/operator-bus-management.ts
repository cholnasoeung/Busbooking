import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type BusRegistrationDetails = {
  registrationNumber: string;
  authority: string;
  inspectionDue?: Date | null;
  insuranceDue?: Date | null;
};

export type BusDriverDetails = {
  name: string;
  license: string;
};

export const busTypeCatalog = [
  {
    id: "standard",
    label: "Standard Express",
    description: "Reliable two-column seating for short and mid-range corridors.",
    capacityRange: "40-45 seats",
  },
  {
    id: "deluxe",
    label: "Deluxe Recliner",
    description: "Extra legroom, premium leather seats, and hot beverage service.",
    capacityRange: "36-40 seats",
  },
  {
    id: "sleeper",
    label: "Sleeper Cabin",
    description: "Dual-tier bunks and privacy curtains for over-night runs.",
    capacityRange: "24-30 seats",
  },
  {
    id: "vip",
    label: "VIP Lounge",
    description: "Semi-private pods with entertainment suites for business travelers.",
    capacityRange: "16-20 seats",
  },
] as const;

export const amenityCatalog = [
  "Wi-Fi",
  "USB charging",
  "Reclining seats",
  "Footrests",
  "Restroom",
  "Meals included",
  "Blankets",
  "Onboard entertainment",
] as const;

export type BusType = (typeof busTypeCatalog)[number]["id"];
export type BusTypeDefinition = (typeof busTypeCatalog)[number];
export type Amenity = (typeof amenityCatalog)[number];

export type LegacySeatLayout = {
  rows?: number;
  columns?: number;
  seatType?: string;
  pattern?: string;
};

export type BusRecord = {
  id: string;
  operatorId: string;
  name: string;
  type: BusType;
  seatLayout: string;
  amenities: string[];
  registration: BusRegistrationDetails;
  driver?: BusDriverDetails;
  crew: string[];
  status: "active" | "maintenance" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

const busSeed: BusRecord[] = [
  {
    id: "BUS-101",
    operatorId: "OP-201",
    name: "Mekong Cruiser - L14",
    type: "deluxe",
    seatLayout: ["A1,A2,A3", "B1,B2,B3", "C1,C2,C3", "D1,D2"].join("\n"),
    amenities: ["Wi-Fi", "USB charging", "Reclining seats", "Restroom"],
    registration: {
      registrationNumber: "KH-AX123",
      authority: "Ministry of Public Works",
      inspectionDue: new Date("2026-09-30T00:00:00.000Z"),
      insuranceDue: new Date("2026-12-31T00:00:00.000Z"),
    },
    driver: {
      name: "Sovan Chum",
      license: "DRV-9331",
    },
    crew: ["Dana Sovann", "Sophea Rith"],
    status: "active",
    createdAt: new Date("2026-03-12T05:00:00.000Z"),
    updatedAt: new Date("2026-03-22T10:00:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeeds() {
  try {
    const db = await getDb();
    const count = await db.collection("operator_buses").countDocuments();
    if (count === 0) {
      await db
        .collection<BusRecord>("operator_buses")
        .insertMany(busSeed as OptionalUnlessRequiredId<BusRecord>[]);
    }
  } catch (error) {
    console.error("Failed to seed buses database:", error);
    // Continue without seeding - the functions will return fallback data
  }
}

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function describeLayoutObject(layout: LegacySeatLayout) {
  const chunks: string[] = [];
  if (layout.rows && layout.columns) {
    chunks.push(`${layout.rows}x${layout.columns}`);
  }
  if (layout.seatType) {
    chunks.push(layout.seatType);
  }
  if (layout.pattern) {
    chunks.push(`(${layout.pattern})`);
  }
  return chunks.join(" ") || "Custom layout";
}

export function normalizeSeatLayout(value?: string | string[] | LegacySeatLayout | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "object") {
    return describeLayoutObject(value);
  }
  return String(value);
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

type RawBusDocument = {
  id: string;
  operatorId: string;
  name: string;
  type?: BusType;
  busType?: BusType;
  seatLayout?: string | string[] | LegacySeatLayout | null;
  amenities?: string[];
  registration?: Partial<BusRegistrationDetails> & {
    driver?: BusDriverDetails;
  };
  registrationNumber?: string;
  registrationAuthority?: string;
  inspectionDue?: string | Date | null;
  insuranceDue?: string | Date | null;
  registrationExpiry?: string | Date | null;
  driverName?: string;
  driverLicense?: string;
  crew?: string[];
  assignedStaff?: string[];
  status?: BusRecord["status"];
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function mapDocumentToBus(doc: RawBusDocument): BusRecord {
  const inspectionDueValue =
    doc.registration?.inspectionDue ??
    doc.inspectionDue ??
    doc.registrationExpiry;
  const insuranceDueValue =
    doc.registration?.insuranceDue ?? doc.insuranceDue ?? doc.registrationExpiry;
  const registrationNumberValue =
    doc.registration?.registrationNumber ?? doc.registrationNumber ?? "Unassigned";
  const registrationAuthorityValue =
    doc.registration?.authority ?? doc.registrationAuthority ?? "Unknown authority";
  const crewList =
    doc.crew && doc.crew.length
      ? [...doc.crew]
      : doc.assignedStaff && doc.assignedStaff.length
      ? [...doc.assignedStaff]
      : [];
  const driver =
    doc.registration?.driver ||
    (doc.driverName && doc.driverLicense
      ? { name: doc.driverName, license: doc.driverLicense }
      : undefined);
  const busTypeValue = (doc.type ?? doc.busType ?? "standard") as BusType;

  const registrationDetails: BusRegistrationDetails = {
    registrationNumber: registrationNumberValue,
    authority: registrationAuthorityValue,
    inspectionDue: parseDate(inspectionDueValue),
    insuranceDue: parseDate(insuranceDueValue),
  };

  const status =
    typeof doc.status === "string"
      ? doc.status
      : doc.active === false
      ? "inactive"
      : "active";

  return {
    id: doc.id,
    operatorId: doc.operatorId,
    name: doc.name,
    type: busTypeValue,
    seatLayout: normalizeSeatLayout(doc.seatLayout),
    amenities: doc.amenities ?? [],
    registration: registrationDetails,
    driver,
    crew: crewList,
    status,
    createdAt: doc.createdAt ?? new Date(),
    updatedAt: doc.updatedAt ?? new Date(),
  };
}

export async function listOperatorBuses(operatorId: string): Promise<BusRecord[]> {
  try {
    await ensureSeeds();
    const db = await getDb();
    const records = await db
      .collection<RawBusDocument>("operator_buses")
      .find({ operatorId })
      .sort({ updatedAt: -1 })
      .toArray();

    return records.map(mapDocumentToBus);
  } catch (error) {
    console.error("Failed to list operator buses, returning fallback data:", error);
    // Return fallback data when MongoDB is not available
    return busSeed.filter(bus => bus.operatorId === operatorId);
  }
}

export async function createBus(data: {
  operatorId: string;
  name: string;
  type: BusType;
  seatLayout: string;
  amenities: string[];
  registrationNumber: string;
  registrationAuthority: string;
  inspectionDue?: string;
  insuranceDue?: string;
}) {
  const db = await getDb();
  await db.collection<BusRecord>("operator_buses").insertOne({
    id: buildId("BUS"),
    operatorId: data.operatorId,
    name: data.name,
    type: data.type,
    seatLayout: data.seatLayout,
    amenities: data.amenities,
    registration: {
      registrationNumber: data.registrationNumber,
      authority: data.registrationAuthority,
      inspectionDue: parseDate(data.inspectionDue),
      insuranceDue: parseDate(data.insuranceDue),
    },
    crew: [],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateBusAmenities(busId: string, amenities: string[]) {
  const db = await getDb();
  await db.collection<BusRecord>("operator_buses").updateOne(
    { id: busId },
    {
      $set: {
        amenities,
        updatedAt: new Date(),
      },
    }
  );
}

export async function updateBusSeatLayout(busId: string, seatLayout: string) {
  const db = await getDb();
  await db.collection<BusRecord>("operator_buses").updateOne(
    { id: busId },
    {
      $set: {
        seatLayout,
        updatedAt: new Date(),
      },
    }
  );
}

export async function updateBusRegistration(busId: string, data: {
  registrationNumber: string;
  registrationAuthority: string;
  inspectionDue?: string;
  insuranceDue?: string;
}) {
  const db = await getDb();
  await db.collection<BusRecord>("operator_buses").updateOne(
    { id: busId },
    {
      $set: {
        registration: {
          registrationNumber: data.registrationNumber,
          authority: data.registrationAuthority,
          inspectionDue: parseDate(data.inspectionDue),
          insuranceDue: parseDate(data.insuranceDue),
        },
        updatedAt: new Date(),
      },
    }
  );
}

export async function assignDriverAndCrew(busId: string, data: {
  driverName: string;
  driverLicense: string;
  crew: string[];
}) {
  const db = await getDb();
  await db.collection<BusRecord>("operator_buses").updateOne(
    { id: busId },
    {
      $set: {
        driver: {
          name: data.driverName,
          license: data.driverLicense,
        },
        crew: data.crew,
        updatedAt: new Date(),
      },
    }
  );
}
