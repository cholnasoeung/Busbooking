"use server";

import { revalidatePath } from "next/cache";

import {
  blockSeats,
  releaseHeldSeats,
  setBookingLimit,
  updateTotalSeats,
} from "@/lib/operator-inventory";

const OPERATOR_ID = "OP-201";

function parseSeatCodes(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
}

function toPositiveNumber(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return null;
}

export async function blockSeatsAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "").trim();
  const seats = parseSeatCodes(String(formData.get("seatBlock") ?? ""));

  if (!busId || seats.length === 0) {
    return;
  }

  await blockSeats(OPERATOR_ID, busId, seats);
  revalidatePath("/operator/inventory");
}

export async function releaseHeldSeatsAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "").trim();
  const seats = parseSeatCodes(String(formData.get("releaseSeats") ?? ""));

  if (!busId || seats.length === 0) {
    return;
  }

  await releaseHeldSeats(OPERATOR_ID, busId, seats);
  revalidatePath("/operator/inventory");
}

export async function setBookingLimitAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "").trim();
  const limit = toPositiveNumber(formData.get("bookingLimit"));

  if (!busId || limit === null) {
    return;
  }

  await setBookingLimit(OPERATOR_ID, busId, limit);
  revalidatePath("/operator/inventory");
}

export async function updateTotalSeatsAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "").trim();
  const totalSeats = toPositiveNumber(formData.get("totalSeats"));

  if (!busId || totalSeats === null) {
    return;
  }

  await updateTotalSeats(OPERATOR_ID, busId, totalSeats);
  revalidatePath("/operator/inventory");
}
