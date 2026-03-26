"use server";

import { revalidatePath } from "next/cache";

import {
  createOperator,
  createPassenger,
  createStaff,
  deleteOperator,
  deletePassenger,
  deleteStaff,
  rejectOperator,
  restoreOperator,
  setPassengerStatus,
  setStaffStatus,
  suspendOperator,
  verifyOperator,
  setOperatorDocumentStatus,
  recordOperatorCompliance,
  type AccountStatus,
  type StaffRole,
} from "@/lib/admin-user-management";

function parseAccountStatus(value: FormDataEntryValue | null): AccountStatus {
  if (
    value === "active" ||
    value === "suspended" ||
    value === "pending_review"
  ) {
    return value;
  }

  return "pending_review";
}

export async function updatePassengerStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = parseAccountStatus(formData.get("status"));

  if (!id) {
    return;
  }

  await setPassengerStatus(id, status);
  revalidatePath("/admin/users");
}

export async function updateStaffStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = parseAccountStatus(formData.get("status"));

  if (!id) {
    return;
  }

  await setStaffStatus(id, status);
  revalidatePath("/admin/users");
}

export async function verifyOperatorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await verifyOperator(id);
  revalidatePath("/admin/users");
}

export async function rejectOperatorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await rejectOperator(id);
  revalidatePath("/admin/users");
}

export async function suspendOperatorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await suspendOperator(id);
  revalidatePath("/admin/users");
}

export async function restoreOperatorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await restoreOperator(id);
  revalidatePath("/admin/users");
}

export async function updateOperatorDocumentStatusAction(
  formData: FormData
) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("documentStatus"));
  const note = String(formData.get("note") ?? "");

  if (!id || (status !== "complete" && status !== "pending" && status !== "issues")) {
    return;
  }

  await setOperatorDocumentStatus(id, status as "complete" | "pending" | "issues", note);
  revalidatePath("/admin/operators/approval");
}

export async function recordOperatorComplianceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("complianceStatus"));
  const note = String(formData.get("note") ?? "");

  if (
    !id ||
    !note ||
    (status !== "pending" &&
      status !== "compliant" &&
      status !== "needs_followup")
  ) {
    return;
  }

  await recordOperatorCompliance(
    id,
    status as "pending" | "compliant" | "needs_followup",
    note
  );
  revalidatePath("/admin/operators/approval");
}

function parseRole(value: FormDataEntryValue | null): StaffRole {
  if (
    value === "super_admin" ||
    value === "finance_admin" ||
    value === "support_admin" ||
    value === "ops_admin"
  ) {
    return value;
  }

  return "ops_admin";
}

export async function createPassengerAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName || !phone || !email) {
    return;
  }

  await createPassenger({ fullName, phone, email });
  revalidatePath("/admin/users");
}

export async function createOperatorAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!companyName || !contactName || !phone) {
    return;
  }

  await createOperator({ companyName, contactName, phone });
  revalidatePath("/admin/users");
}

export async function createStaffAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = parseRole(formData.get("role"));

  if (!fullName || !email) {
    return;
  }

  await createStaff({ fullName, email, role });
  revalidatePath("/admin/users");
}

export async function deletePassengerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await deletePassenger(id);
  revalidatePath("/admin/users");
}

export async function deleteOperatorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await deleteOperator(id);
  revalidatePath("/admin/users");
}

export async function deleteStaffAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await deleteStaff(id);
  revalidatePath("/admin/users");
}
