"use server";

import { revalidatePath } from "next/cache";

import {
  createCouponCode,
  createFaqItem,
  createPromoBanner,
  createSeoPage,
  setCouponActive,
  setPromoBannerActive,
  setSeoPagePublished,
  updatePolicyDocument,
} from "@/lib/content-management";

export async function addPromoBannerAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaLink = String(formData.get("ctaLink") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const priority = Number(formData.get("priority") ?? "5");

  if (!title || !ctaLabel) {
    return;
  }

  await createPromoBanner({
    title,
    description,
    ctaLabel,
    ctaLink,
    imageUrl,
    priority: Number.isFinite(priority) ? priority : 5,
  });
  revalidatePath("/admin/content");
}

export async function togglePromoBannerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "true") === "true";

  if (!id) {
    return;
  }

  await setPromoBannerActive(id, active);
  revalidatePath("/admin/content");
}

export async function createCouponAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const discountType = String(formData.get("discountType") ?? "percent");
  const value = Number(formData.get("value") ?? "0");
  const expiresAt = new Date(String(formData.get("expiresAt") ?? ""));
  const usageLimit = Number(formData.get("usageLimit") ?? "0");

  if (!code || Number.isNaN(value) || Number.isNaN(expiresAt.getTime())) {
    return;
  }

  await createCouponCode({
    code,
    discountType: discountType === "flat" ? "flat" : "percent",
    value,
    expiresAt,
    usageLimit: Number.isFinite(usageLimit) ? usageLimit : 0,
  });

  revalidatePath("/admin/content");
}

export async function toggleCouponAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "true") === "true";

  if (!id) {
    return;
  }

  await setCouponActive(id, active);
  revalidatePath("/admin/content");
}

export async function createSeoPageAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const published = String(formData.get("published") ?? "false") === "true";

  if (!slug || !title || !metaDescription) {
    return;
  }

  await createSeoPage({
    slug,
    title,
    metaDescription,
    published,
  });

  revalidatePath("/admin/content");
}

export async function toggleSeoPageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "false") === "true";

  if (!id) {
    return;
  }

  await setSeoPagePublished(id, published);
  revalidatePath("/admin/content");
}

export async function createFaqAction(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const category = String(formData.get("category") ?? "General").trim();

  if (!question || !answer) {
    return;
  }

  await createFaqItem({ question, answer, category: category || "General" });
  revalidatePath("/admin/content");
}

export async function updatePolicyAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!id) {
    return;
  }

  await updatePolicyDocument({ id, summary, content });
  revalidatePath("/admin/content");
}
