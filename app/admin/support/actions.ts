"use server";

import { revalidatePath } from "next/cache";

import {
  createInvestigation,
  createSupportTicket,
  flagFraud,
  updateDisputeStatus,
  updateFraudStatus,
  updateInvestigation,
  updateTicketStatus,
} from "@/lib/support-management";

export async function createTicketAction(formData: FormData) {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const passengerId = String(formData.get("passengerId") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium") as
    | "low"
    | "medium"
    | "high"
    | "critical";
  const channel = String(formData.get("channel") ?? "email") as
    | "chat"
    | "phone"
    | "email";

  if (!subject || !message || !passengerId || !assignedTo) {
    return;
  }

  await createSupportTicket({
    subject,
    message,
    passengerId,
    assignedTo,
    priority,
    channel,
  });

  revalidatePath("/admin/support");
}

export async function updateTicketStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "open") as
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";

  if (!id) {
    return;
  }

  await updateTicketStatus(id, status);
  revalidatePath("/admin/support");
}

export async function updateDisputeStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "pending") as
    | "pending"
    | "escalated"
    | "approved"
    | "rejected";
  const notes = String(formData.get("notes") ?? "");

  if (!id) {
    return;
  }

  await updateDisputeStatus(id, status, notes);
  revalidatePath("/admin/support");
}

export async function createInvestigationAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "").trim();
  const operatorId = String(formData.get("operatorId") ?? "").trim();
  const requestedBy = String(formData.get("requestedBy") ?? "").trim();
  const findings = String(formData.get("findings") ?? "").trim();
  const recommendedAction = String(formData.get("recommendedAction") ?? "").trim();

  if (!bookingId || !operatorId || !requestedBy) {
    return;
  }

  await createInvestigation({
    bookingId,
    operatorId,
    requestedBy,
    findings,
    recommendedAction,
  });

  revalidatePath("/admin/support");
}

export async function updateInvestigationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "pending") as
    | "pending"
    | "reviewing"
    | "closed";
  const findings = String(formData.get("findings") ?? "");

  if (!id) {
    return;
  }

  await updateInvestigation(id, status, findings);
  revalidatePath("/admin/support");
}

export async function flagFraudAction(formData: FormData) {
  const passengerId = String(formData.get("passengerId") ?? "").trim();
  const bookingReference = String(formData.get("bookingReference") ?? "").trim();
  const type = String(formData.get("type") ?? "identity") as
    | "chargeback"
    | "identity"
    | "duplicate";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!passengerId || !bookingReference || !notes) {
    return;
  }

  await flagFraud({ passengerId, bookingReference, type, notes });
  revalidatePath("/admin/support");
}

export async function updateFraudStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new") as
    | "new"
    | "investigating"
    | "cleared";

  if (!id) {
    return;
  }

  await updateFraudStatus(id, status);
  revalidatePath("/admin/support");
}
