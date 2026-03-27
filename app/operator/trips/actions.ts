"use server";

import { revalidatePath } from "next/cache";

import { addDelayNote, setTripStatus } from "@/lib/operator-trips";

const OPERATOR_ID = "OP-201";

export async function changeTripStatusAction(formData: FormData) {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const status = String(formData.get("status") ?? "") as
    | "scheduled"
    | "boarding"
    | "departed"
    | "delayed"
    | "arrived"
    | "cancelled";

  if (!tripId || !status) {
    return;
  }

  await setTripStatus(OPERATOR_ID, tripId, status);
  revalidatePath("/operator/trips");
}

export async function addDelayNoteAction(formData: FormData) {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const note = String(formData.get("delayNote") ?? "").trim();

  if (!tripId || !note) {
    return;
  }

  await addDelayNote(OPERATOR_ID, tripId, note);
  revalidatePath("/operator/trips");
}
