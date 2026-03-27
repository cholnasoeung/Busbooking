import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@busbooking.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "busbooking123";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "dev-secret";
const RAW_SESSION_MAX_AGE = Number(process.env.ADMIN_SESSION_MAX_AGE ?? "3600");
const SESSION_MAX_AGE = Number.isFinite(RAW_SESSION_MAX_AGE) ? Math.max(300, RAW_SESSION_MAX_AGE) : 3600;

export const SESSION_COOKIE_NAME = "admin-session";

export const DEFAULT_ADMIN_REDIRECT = "/admin";

export function sanitizeAdminRedirect(candidate?: string | null) {
  const value = String(candidate ?? "").trim();
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("://") ||
    !value.startsWith("/admin")
  ) {
    return DEFAULT_ADMIN_REDIRECT;
  }
  return value;
}

export function verifyAdminCredentials(email: string, password: string) {
  if (!email || !password) return false;
  return email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE;
}

export function createSessionToken(email: string) {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    iat: Date.now(),
  });
  const encoded = Buffer.from(payload, "utf-8").toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", SESSION_SECRET).update(encoded).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf-8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const body = Buffer.from(encoded, "base64url").toString("utf-8");
    const parsed = JSON.parse(body);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.email !== "string" ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.iat > SESSION_MAX_AGE * 1000) {
      return null;
    }

    return parsed.email;
  } catch {
    return null;
  }
}
