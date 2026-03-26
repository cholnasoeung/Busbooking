"use server";

import { revalidatePath } from "next/cache";

import {
  createCity,
  updateCity,
  deleteCity,
  createStop,
  updateStop,
  deleteStop,
  createZone,
  standardizeCityNames,
} from "@/lib/route-city-management";

export async function createCityAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createCity(name);
  revalidatePath("/admin/route-city/cities");
}

export async function editCityAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  await updateCity(id, name);
  revalidatePath("/admin/route-city/cities");
}

export async function deleteCityAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteCity(id);
  revalidatePath("/admin/route-city/cities");
}

export async function createStopAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "");
  const serviceZone = String(formData.get("serviceZone") ?? "").trim();
  if (!name || !cityId || !serviceZone) return;
  await createStop({ name, cityId, serviceZone });
  revalidatePath("/admin/route-city/stops");
}

export async function updateStopAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const serviceZone = String(formData.get("serviceZone") ?? "").trim();
  if (!id || !name || !serviceZone) return;
  await updateStop(id, { name, serviceZone });
  revalidatePath("/admin/route-city/stops");
}

export async function deleteStopAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteStop(id);
  revalidatePath("/admin/route-city/stops");
}

export async function createZoneAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name || !description) return;
  await createZone({ name, description });
  revalidatePath("/admin/route-city/zones");
}

export async function standardizeCitiesAction() {
  await standardizeCityNames();
  revalidatePath("/admin/route-city/cities");
}
