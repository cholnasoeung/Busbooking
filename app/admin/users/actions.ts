"use server";

import { revalidatePath } from "next/cache";

import {
  rejectOperator,
  restoreOperator,
  setPassengerStatus,
  setStaffStatus,
  suspendOperator,
  verifyOperator,
  type AccountStatus,
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
