"use server";

import { revalidatePath } from "next/cache";

import {
  assignDriverAndCrew,
  BusType,
  updateBusAmenities,
  updateBusRegistration,
  updateBusSeatLayout,
  createBus,
} from "@/lib/operator-bus-management";

const OPERATOR_ID = "OP-201";

export async function createBusAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = (String(formData.get("type") ?? "standard") as BusType);
  const seatLayout = String(formData.get("seatLayout") ?? "").trim();
  const registrationNumber = String(formData.get("registrationNumber") ?? "").trim();
  const registrationAuthority = String(formData.get("registrationAuthority") ?? "").trim();
  const inspectionDue = String(formData.get("inspectionDue") ?? "").trim();
  const insuranceDue = String(formData.get("insuranceDue") ?? "").trim();
  const amenitiesInput = String(formData.get("amenities") ?? "");
  const amenities = amenitiesInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!name || !registrationNumber || !registrationAuthority || !seatLayout) {
    return;
  }

  await createBus({
    operatorId: OPERATOR_ID,
    name,
    type,
    seatLayout,
    amenities,
    registrationNumber,
    registrationAuthority,
    inspectionDue: inspectionDue || undefined,
    insuranceDue: insuranceDue || undefined,
  });
  revalidatePath("/operator/buses");
}

export async function updateAmenitiesAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "");
  const selections = formData
    .getAll("amenityOption")
    .map((option) => String(option).trim())
    .filter(Boolean);
  const extras = String(formData.get("amenityExtra") ?? "")
    .split(/[,\\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const amenities = Array.from(new Set([...selections, ...extras]));

  if (!busId) return;

  await updateBusAmenities(busId, amenities);
  revalidatePath("/operator/buses");
}

export async function updateSeatLayoutAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "");
  const seatLayout = String(formData.get("seatLayout") ?? "").trim();

  if (!busId || !seatLayout) {
    return;
  }

  await updateBusSeatLayout(busId, seatLayout);
  revalidatePath("/operator/buses");
}

export async function updateRegistrationAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "");
  const registrationNumber = String(formData.get("registrationNumber") ?? "").trim();
  const registrationAuthority = String(formData.get("registrationAuthority") ?? "").trim();
  const inspectionDue = String(formData.get("inspectionDue") ?? "").trim();
  const insuranceDue = String(formData.get("insuranceDue") ?? "").trim();

  if (!busId || !registrationNumber || !registrationAuthority) {
    return;
  }

  await updateBusRegistration(busId, {
    registrationNumber,
    registrationAuthority,
    inspectionDue: inspectionDue || undefined,
    insuranceDue: insuranceDue || undefined,
  });
  revalidatePath("/operator/buses");
}

export async function assignDriverAction(formData: FormData) {
  const busId = String(formData.get("busId") ?? "");
  const driverName = String(formData.get("driverName") ?? "").trim();
  const driverLicense = String(formData.get("driverLicense") ?? "").trim();
  const crewSelections = formData
    .getAll("crew")
    .map((entry) => String(entry).trim())
    .filter(Boolean);
  const additionalCrew = String(formData.get("additionalCrew") ?? "")
    .split(/[,\\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const crew = Array.from(new Set([...crewSelections, ...additionalCrew]));

  if (!busId || !driverName || !driverLicense) {
    return;
  }

  await assignDriverAndCrew(busId, {
    driverName,
    driverLicense,
    crew,
  });
  revalidatePath("/operator/buses");
}
