"use server";

import { revalidatePath } from "next/cache";

import {
  setCommissionRates,
  createPayout,
  upsertRefundRule,
} from "@/lib/commission-finance";

export async function updateCommissionAction(formData: FormData) {
  const platformRate = Number(formData.get("platformRate") ?? "0");
  const operatorRate = Number(formData.get("operatorRate") ?? "0");
  await setCommissionRates(platformRate, operatorRate);
  revalidatePath("/admin/finance");
}

export async function createPayoutAction(formData: FormData) {
  const operatorId = String(formData.get("operatorId") ?? "").trim();
  const amount = Number(formData.get("amount") ?? "0");
  const payoutDate = new Date(String(formData.get("payoutDate") ?? ""));
  if (!operatorId || Number.isNaN(amount) || Number.isNaN(payoutDate.getTime())) return;
  await createPayout({ operatorId, amount, payoutDate });
  revalidatePath("/admin/finance");
}

export async function upsertRefundRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? `rule-${Date.now().toString().slice(-5)}`);
  const description = String(formData.get("description") ?? "").trim();
  const minNoticeDays = Number(formData.get("minNoticeDays") ?? "0");
  const penaltyPercent = Number(formData.get("penaltyPercent") ?? "0");
  if (!description) return;
  await upsertRefundRule({ id, description, minNoticeDays, penaltyPercent });
  revalidatePath("/admin/finance");
}
