"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  assignRoleToStaff,
  createOperatorStaff,
  createRole,
  deleteStaff,
  disableRole,
  operatorLogin,
  requestPasswordReset,
  resetPassword,
  toggleStaffStatus,
  updateCompanyProfile,
  updateRole,
  updateStaffName,
  updateStaffRole,
  uploadDocument,
  setOperatorActive,
} from "@/lib/operator-portal";

export async function operatorLoginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const secret = String(formData.get("secret") ?? "").trim();
  if (!identifier || !secret) {
    return;
  }

  const profile = await operatorLogin(identifier, secret);
  if (profile) {
    cookies().set("operator-auth", profile.id);
    revalidatePath("/operator/dashboard");
  }
}

export async function logoutAction() {
  cookies().delete("operator-auth");
  revalidatePath("/operator/dashboard");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  await requestPasswordReset(email);
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  const secret = String(formData.get("secret") ?? "").trim();
  if (!token || !secret) return;
  await resetPassword(token, secret);
}

export async function updateCompanyAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const headquarters = String(formData.get("headquarters") ?? "").trim();

  if (!companyName || !contactName || !phone || !email || !headquarters) {
    return;
  }

  await updateCompanyProfile({ companyName, contactName, phone, email, headquarters });
  revalidatePath("/operator/dashboard");
}

export async function uploadDocumentAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("document");
  if (!name || !(file instanceof File)) {
    return;
  }
  await uploadDocument(name, file.name);
  revalidatePath("/operator/dashboard");
}

export async function deactivateOperatorAction(formData: FormData) {
  const active = String(formData.get("active") ?? "false") === "true";
  await setOperatorActive(active);
  revalidatePath("/operator/dashboard");
}

export async function addStaffAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "operations_lead") as
    | "operations_lead"
    | "sales_lead"
    | "support_lead"
    | "finance_lead";

  if (!fullName) {
    return;
  }

  await createOperatorStaff({ fullName, role });
  revalidatePath("/operator/dashboard");
}

export async function editStaffAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!id || !fullName) return;
  await updateStaffName(id, fullName);
  revalidatePath("/operator/dashboard");
}

export async function removeStaffAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteStaff(id);
  revalidatePath("/operator/dashboard");
}

export async function changeStaffRoleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "operations_lead") as
    | "operations_lead"
    | "sales_lead"
    | "support_lead"
    | "finance_lead";

  if (!id) {
    return;
  }

  await updateStaffRole(id, role);
  revalidatePath("/operator/dashboard");
}

export async function assignRoleAction(formData: FormData) {
  const staffId = String(formData.get("staffId") ?? "");
  const roleId = String(formData.get("roleId") ?? "");
  if (!staffId || !roleId) return;
  await assignRoleToStaff(staffId, roleId);
  revalidatePath("/operator/dashboard");
}

export async function toggleStaffStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "active") as "active" | "suspended";

  if (!id) {
    return;
  }

  await toggleStaffStatus(id, status);
  revalidatePath("/operator/dashboard");
}

export async function createRoleAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const permissions = (formData.get("permissions") as FormDataEntryValue | null)
    ? String(formData.get("permissions"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!name) return;
  await createRole({ name, description, permissions });
  revalidatePath("/operator/dashboard");
}

export async function editRoleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const permissions = (formData.get("permissions") as FormDataEntryValue | null)
    ? String(formData.get("permissions"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!id || !name) return;
  await updateRole(id, { name, description, permissions });
  revalidatePath("/operator/dashboard");
}

export async function disableRoleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await disableRole(id);
  revalidatePath("/operator/dashboard");
}
