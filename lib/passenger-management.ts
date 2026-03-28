import { createHmac, randomUUID, timingSafeEqual } from "crypto";

import clientPromise from "@/lib/mongodb";
import { listPassengerBookings } from "@/lib/operator-bookings";
import type {
  PassengerAccountStatus,
  PassengerBookingSummary,
  PassengerProfile,
  PassengerSession,
} from "@/lib/passenger-types";

type PassengerDocument = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  tripsCompleted: number;
  lastBooking: string | Date;
  status: PassengerAccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

const DATABASE_NAME = process.env.MONGODB_DB_NAME ?? "bus_booking";
const COLLECTION_NAME = "passengers";
const SESSION_SECRET = process.env.PASSENGER_SESSION_SECRET ?? "passenger-dev-secret";
const RAW_SESSION_MAX_AGE = Number(process.env.PASSENGER_SESSION_MAX_AGE ?? "604800");
const SESSION_MAX_AGE = Number.isFinite(RAW_SESSION_MAX_AGE)
  ? Math.max(300, RAW_SESSION_MAX_AGE)
  : 604800;

export const PASSENGER_SESSION_COOKIE_NAME = "passenger-session";
export const DEFAULT_PASSENGER_REDIRECT = "/search";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function serializeDate(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toISOString();
}

function buildPassengerId() {
  return `PAX-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function toSession(document: PassengerDocument): PassengerSession {
  return {
    id: document.id,
    fullName: document.fullName,
    email: document.email,
    phone: document.phone,
  };
}

function toProfile(document: PassengerDocument): PassengerProfile {
  return {
    ...toSession(document),
    tripsCompleted: document.tripsCompleted ?? 0,
    lastBooking: serializeDate(document.lastBooking),
    status: document.status,
    createdAt: serializeDate(document.createdAt),
    updatedAt: serializeDate(document.updatedAt),
  };
}

async function getCollection() {
  const client = await clientPromise;
  return client.db(DATABASE_NAME).collection<PassengerDocument>(COLLECTION_NAME);
}

async function getPassengerDocumentById(id: string) {
  const collection = await getCollection();
  return collection.findOne({ id });
}

async function getPassengerDocumentByEmail(email: string) {
  const collection = await getCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export function sanitizePassengerRedirect(candidate?: string | null) {
  const value = String(candidate ?? "").trim();
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return DEFAULT_PASSENGER_REDIRECT;
  }

  return value;
}

export function getPassengerSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE;
}

export function createPassengerSessionToken(id: string) {
  const payload = JSON.stringify({
    sub: id,
    iat: Date.now(),
  });
  const encoded = Buffer.from(payload, "utf-8").toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

function verifyPassengerSessionToken(token: string) {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", SESSION_SECRET).update(encoded).digest("hex");
  const actualBuffer = Buffer.from(signature, "utf-8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const body = Buffer.from(encoded, "base64url").toString("utf-8");
    const parsed = JSON.parse(body) as { sub?: string; iat?: number };

    if (!parsed.sub || typeof parsed.iat !== "number") {
      return null;
    }

    if (Date.now() - parsed.iat > SESSION_MAX_AGE * 1000) {
      return null;
    }

    return parsed.sub;
  } catch {
    return null;
  }
}

export async function getPassengerSessionFromCookies(cookieReader: CookieReader) {
  const token = cookieReader.get(PASSENGER_SESSION_COOKIE_NAME)?.value ?? "";
  const passengerId = verifyPassengerSessionToken(token);
  if (!passengerId) {
    return null;
  }

  const document = await getPassengerDocumentById(passengerId);
  if (!document || document.status === "suspended") {
    return null;
  }

  return toSession(document);
}

export async function registerPassengerAccount(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!fullName || !phone || !email) {
    throw new Error("Full name, email, and phone are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const collection = await getCollection();
  const existing = await getPassengerDocumentByEmail(email);

  if (existing?.password) {
    throw new Error("An account with this email already exists.");
  }

  if (existing && !existing.password) {
    const nextStatus = existing.status === "suspended" ? existing.status : "active";
    const nextUpdatedAt = new Date();

    await collection.updateOne(
      { id: existing.id },
      {
        $set: {
          fullName,
          phone,
          email,
          password,
          status: nextStatus,
          updatedAt: nextUpdatedAt,
        },
      }
    );

    return {
      session: {
        id: existing.id,
        fullName,
        email,
        phone,
      } satisfies PassengerSession,
    };
  }

  const now = new Date();
  const document: PassengerDocument = {
    id: buildPassengerId(),
    fullName,
    phone,
    email,
    password,
    tripsCompleted: 0,
    lastBooking: now.toISOString(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(document);

  return { session: toSession(document) };
}

export async function authenticatePassengerAccount(input: {
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    throw new Error("Email and password are required for login.");
  }

  const document = await getPassengerDocumentByEmail(email);
  if (!document || !document.password || document.password !== password) {
    throw new Error("Invalid email or password.");
  }

  if (document.status === "suspended") {
    throw new Error("This passenger account is suspended. Please contact support.");
  }

  return { session: toSession(document) };
}

export async function updatePassengerProfile(
  passengerId: string,
  input: {
    fullName: string;
    phone: string;
    email: string;
  }
) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = normalizeEmail(input.email);

  if (!fullName || !phone || !email) {
    throw new Error("Full name, email, and phone are required.");
  }

  const collection = await getCollection();
  const current = await getPassengerDocumentById(passengerId);
  if (!current) {
    throw new Error("Passenger account not found.");
  }

  const duplicate = await collection.findOne({
    email,
    id: { $ne: passengerId },
  });

  if (duplicate) {
    throw new Error("Another passenger already uses this email.");
  }

  const updatedAt = new Date();
  await collection.updateOne(
    { id: passengerId },
    {
      $set: {
        fullName,
        phone,
        email,
        updatedAt,
      },
    }
  );

  return {
    session: {
      id: passengerId,
      fullName,
      email,
      phone,
    } satisfies PassengerSession,
  };
}

export async function touchPassengerLastBooking(passengerId: string, bookedAt = new Date()) {
  const collection = await getCollection();
  await collection.updateOne(
    { id: passengerId },
    {
      $set: {
        lastBooking: bookedAt.toISOString(),
        updatedAt: new Date(),
      },
    }
  );
}

export async function getPassengerDashboardData(passengerId: string): Promise<{
  profile: PassengerProfile;
  bookings: PassengerBookingSummary[];
}> {
  const document = await getPassengerDocumentById(passengerId);
  if (!document) {
    throw new Error("Passenger account not found.");
  }

  return {
    profile: toProfile(document),
    bookings: await listPassengerBookings(document.id, document.email),
  };
}
