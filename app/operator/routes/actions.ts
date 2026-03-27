"use server";

import { revalidatePath } from "next/cache";

import {
  addBoardingPoint,
  addDropPoint,
  createRoute,
  createSchedule,
  deleteTripSchedule,
  deleteRoute,
} from "@/lib/operator-route-management";
import {
  createSearchFilter,
  deleteSearchFilter,
  type SearchFilterPayload,
  type SearchFilterType,
} from "@/lib/search-filter-management";

export async function createRouteAction(formData: FormData) {
  const routeName = String(formData.get("routeName") ?? "").trim();
  const operatorId = String(formData.get("operatorId") ?? "OP-201").trim();
  const fromCity = String(formData.get("fromCity") ?? "").trim();
  const toCity = String(formData.get("toCity") ?? "").trim();
  const stops = String(formData.get("stops") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!routeName || !fromCity || !toCity) {
    return;
  }

  await createRoute({ routeName, operatorId, fromCity, toCity, stops });
  revalidatePath("/operator/routes");
}

export async function addBoardingPointAction(formData: FormData) {
  const routeId = String(formData.get("routeId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!routeId || !name || !location) {
    return;
  }

  await addBoardingPoint(routeId, name, location);
  revalidatePath("/operator/routes");
}

export async function addDropPointAction(formData: FormData) {
  const routeId = String(formData.get("routeId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!routeId || !name || !location) {
    return;
  }

  await addDropPoint(routeId, name, location);
  revalidatePath("/operator/routes");
}

export async function createScheduleAction(formData: FormData) {
  const routeId = String(formData.get("routeId") ?? "");
  const departureTime = String(formData.get("departureTime") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const recurrence = String(formData.get("recurrence") ?? "daily") as
    | "daily"
    | "weekly"
    | "custom";
  const daysInput = String(formData.get("days") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const startDate = new Date(String(formData.get("startDate") ?? new Date()));
  const endDateValue = String(formData.get("endDate") ?? "");
  const endDate = endDateValue ? new Date(endDateValue) : undefined;

  if (!routeId || !departureTime || !vehicle || Number.isNaN(startDate.getTime())) {
    return;
  }

  await createSchedule({
    routeId,
    departureTime,
    vehicle,
    recurrence,
    days: daysInput.length ? daysInput : undefined,
    startDate,
    endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined,
  });
  revalidatePath("/operator/routes");
}

export async function deleteScheduleAction(formData: FormData) {
  const scheduleId = String(formData.get("scheduleId") ?? "");
  if (!scheduleId) return;
  await deleteTripSchedule(scheduleId);
  revalidatePath("/operator/routes");
}

export async function deleteRouteAction(formData: FormData) {
  const routeId = String(formData.get("routeId") ?? "");
  if (!routeId) return;
  await deleteRoute(routeId);
  revalidatePath("/operator/routes");
}

export async function createSearchFilterAction(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const type = (String(formData.get("type") ?? "time-window") as SearchFilterType) ?? "time-window";
  const description = String(formData.get("description") ?? "").trim();
  const payloadValue = String(formData.get("payload") ?? "").trim();

  if (!label || !payloadValue) {
    return;
  }

  let payload: SearchFilterPayload | undefined;

  if (type === "time-window") {
    const [startRaw, endRaw] = payloadValue.split("-").map((value) => Number(value.trim()));
    if (!Number.isFinite(startRaw) || !Number.isFinite(endRaw)) {
      return;
    }
    const startHour = Math.max(0, Math.min(23, Math.floor(startRaw)));
    const endHour = Math.max(0, Math.min(24, Math.ceil(endRaw)));
    if (endHour <= startHour) {
      return;
    }
    payload = { startHour, endHour };
  } else if (type === "bus-type") {
    const busTypes = payloadValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (busTypes.length === 0) {
      return;
    }
    payload = { busTypes };
  } else if (type === "status") {
    const statuses = payloadValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (statuses.length === 0) {
      return;
    }
    payload = { statuses };
  }

  if (!payload) {
    return;
  }

  await createSearchFilter({
    label,
    type,
    payload,
    description: description || undefined,
  });

  revalidatePath("/operator/routes");
}

export async function deleteSearchFilterAction(formData: FormData) {
  const filterId = String(formData.get("filterId") ?? "");
  if (!filterId) return;
  await deleteSearchFilter(filterId);
  revalidatePath("/operator/routes");
}
