"use server";

import { revalidatePath } from "next/cache";

import {
  cancelPassenger,
  checkInPassenger,
  recordBoardingScan,
  reschedulePassenger,
} from "@/lib/operator-bookings";

const OPERATOR_ID = "OP-201";

function getString(field: FormData, name: string) {
  return String(field.get(name) ?? "").trim();
}

export async function cancelPassengerAction(formData: FormData) {
  const bookingId = getString(formData, "bookingId");
  const passengerId = getString(formData, "passengerId");
  const reason = getString(formData, "cancellationReason");

  if (!bookingId || !passengerId) {
    return;
  }

  await cancelPassenger(OPERATOR_ID, bookingId, passengerId, reason || undefined);
  revalidatePath("/operator/bookings");
}

export async function reschedulePassengerAction(formData: FormData) {
  const bookingId = getString(formData, "bookingId");
  const passengerId = getString(formData, "passengerId");
  const newDate = String(formData.get("newTripDate") ?? "").trim();

  if (!bookingId || !passengerId || !newDate) {
    return;
  }

  await reschedulePassenger(OPERATOR_ID, bookingId, passengerId, newDate);
  revalidatePath("/operator/bookings");
}

export async function checkInPassengerAction(formData: FormData) {
  const bookingId = getString(formData, "bookingId");
  const passengerId = getString(formData, "passengerId");

  if (!bookingId || !passengerId) {
    return;
  }

  await checkInPassenger(OPERATOR_ID, bookingId, passengerId);
  revalidatePath("/operator/bookings");
}

export async function boardingScanAction(formData: FormData) {
  const bookingId = getString(formData, "bookingId");
  const passengerId = getString(formData, "passengerId");

  if (!bookingId || !passengerId) {
    return;
  }

  await recordBoardingScan(OPERATOR_ID, bookingId, passengerId);
  revalidatePath("/operator/bookings");
}
