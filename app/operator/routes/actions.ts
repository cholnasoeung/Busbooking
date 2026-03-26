"use server";

import { revalidatePath } from "next/cache";

import {
  addBoardingPoint,
  addDropPoint,
  createRoute,
  createSchedule,
} from "@/lib/operator-route-management";

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
