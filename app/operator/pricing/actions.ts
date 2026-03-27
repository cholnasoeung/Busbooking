"use server";

import { revalidatePath } from "next/cache";

import {
  addDiscountCampaign,
  setBaseFare,
  setCommission,
  toggleDiscountCampaign,
  updateDynamicPricing,
  updateWeekendHoliday,
} from "@/lib/operator-pricing";

const OPERATOR_ID = "OP-201";

function toFiniteNumber(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return null;
}

export async function setBaseFareAction(formData: FormData) {
  const baseFare = toFiniteNumber(formData.get("baseFare"));
  if (baseFare === null) {
    return;
  }

  await setBaseFare(OPERATOR_ID, baseFare);
  revalidatePath("/operator/pricing");
}

export async function updateDynamicPricingAction(formData: FormData) {
  const peakMultiplier = toFiniteNumber(formData.get("peakMultiplier"));
  const offPeakMultiplier = toFiniteNumber(formData.get("offPeakMultiplier"));
  const minDistanceSurcharge = toFiniteNumber(formData.get("minDistanceSurcharge"));
  const maxDistanceSurcharge = toFiniteNumber(formData.get("maxDistanceSurcharge"));

  if (
    peakMultiplier === null ||
    offPeakMultiplier === null ||
    minDistanceSurcharge === null ||
    maxDistanceSurcharge === null
  ) {
    return;
  }

  await updateDynamicPricing(OPERATOR_ID, {
    peakMultiplier,
    offPeakMultiplier,
    minDistanceSurcharge,
    maxDistanceSurcharge,
  });
  revalidatePath("/operator/pricing");
}

export async function updateWeekendHolidayAction(formData: FormData) {
  const weekendMultiplier = toFiniteNumber(formData.get("weekendMultiplier"));
  const holidayMultiplier = toFiniteNumber(formData.get("holidayMultiplier"));

  if (weekendMultiplier === null || holidayMultiplier === null) {
    return;
  }

  await updateWeekendHoliday(OPERATOR_ID, weekendMultiplier, holidayMultiplier);
  revalidatePath("/operator/pricing");
}

export async function addDiscountCampaignAction(formData: FormData) {
  const name = String(formData.get("campaignName") ?? "").trim();
  const type = String(formData.get("campaignType") ?? "percentage") as
    | "percentage"
    | "flat";
  const value = toFiniteNumber(formData.get("campaignValue"));
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();

  if (!name || value === null || !startsAtRaw) {
    return;
  }

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return;
  }

  const endsAt = endsAtRaw ? new Date(endsAtRaw) : undefined;
  if (endsAt && Number.isNaN(endsAt.getTime())) {
    return;
  }

  await addDiscountCampaign(OPERATOR_ID, {
    name,
    type,
    value,
    startsAt,
    endsAt,
    active: true,
  });
  revalidatePath("/operator/pricing");
}

export async function toggleDiscountCampaignAction(formData: FormData) {
  const campaignId = String(formData.get("campaignId") ?? "").trim();
  const activeValue = String(formData.get("active") ?? "false");

  if (!campaignId) {
    return;
  }

  const active = activeValue === "true";

  await toggleDiscountCampaign(OPERATOR_ID, campaignId, active);
  revalidatePath("/operator/pricing");
}

export async function setCommissionAction(formData: FormData) {
  const percent = toFiniteNumber(formData.get("commissionPercent"));
  const note = String(formData.get("commissionNote") ?? "").trim();

  if (percent === null || percent < 0 || percent > 100) {
    return;
  }

  await setCommission(OPERATOR_ID, {
    percent,
    note: note || "Platform managed commission",
  });
  revalidatePath("/operator/pricing");
}
