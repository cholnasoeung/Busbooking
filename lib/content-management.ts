import { OptionalUnlessRequiredId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type PromoBanner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaLink: string;
  active: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CouponCode = {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  value: number;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SeoPage = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PolicyDocument = {
  id: string;
  name: string;
  summary: string;
  content: string;
  lastUpdated: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

type SeedDoc = Record<string, unknown>;

const promoSeed: PromoBanner[] = [
  {
    id: "BANNER-101",
    title: "Early bird fares",
    description: "Save 15% on tickets booked at least two weeks in advance.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    ctaLabel: "Book now",
    ctaLink: "/search",
    active: true,
    priority: 1,
    createdAt: new Date("2026-03-01T09:00:00.000Z"),
    updatedAt: new Date("2026-03-16T10:00:00.000Z"),
  },
  {
    id: "BANNER-102",
    title: "Weekend flash sale",
    description: "Hours left to grab 20% off routes across the Mekong region.",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    ctaLabel: "See offers",
    ctaLink: "/flash-sale",
    active: false,
    priority: 2,
    createdAt: new Date("2026-03-10T08:30:00.000Z"),
    updatedAt: new Date("2026-03-10T09:00:00.000Z"),
  },
];

const couponSeed: CouponCode[] = [
  {
    id: "COUPON-301",
    code: "WELCOME10",
    discountType: "percent",
    value: 10,
    expiresAt: new Date("2026-04-30T00:00:00.000Z"),
    usageLimit: 500,
    usedCount: 128,
    active: true,
    createdAt: new Date("2026-02-28T12:00:00.000Z"),
    updatedAt: new Date("2026-03-20T08:00:00.000Z"),
  },
  {
    id: "COUPON-302",
    code: "MOMENTUM",
    discountType: "flat",
    value: 5,
    expiresAt: new Date("2026-05-15T00:00:00.000Z"),
    usageLimit: 200,
    usedCount: 44,
    active: false,
    createdAt: new Date("2026-03-08T16:00:00.000Z"),
    updatedAt: new Date("2026-03-25T07:30:00.000Z"),
  },
];

const seoSeed: SeoPage[] = [
  {
    id: "SEO-501",
    slug: "about",
    title: "About NextBus",
    metaDescription: "Learn how NextBus connects cities across Southeast Asia with comfortable, modern travel.",
    published: true,
    createdAt: new Date("2026-01-04T08:00:00.000Z"),
    updatedAt: new Date("2026-03-02T11:00:00.000Z"),
  },
  {
    id: "SEO-502",
    slug: "travel-tips",
    title: "Travel tips & safety",
    metaDescription: "Practical checklist for bus travelers, from luggage to on-board safety.",
    published: false,
    createdAt: new Date("2026-02-14T10:00:00.000Z"),
    updatedAt: new Date("2026-03-12T07:00:00.000Z"),
  },
];

const faqSeed: FaqItem[] = [
  {
    id: "FAQ-701",
    question: "How do I change a booking?",
    answer: "Visit your booking history, pick the trip, and select 'Change Date' within the allowed window.",
    category: "Bookings",
    order: 1,
    active: true,
    createdAt: new Date("2026-02-10T12:00:00.000Z"),
    updatedAt: new Date("2026-03-05T09:30:00.000Z"),
  },
  {
    id: "FAQ-702",
    question: "What is the refund timeline?",
    answer: "Refunds follow the policy guardrails and appear in your wallet within 7 business days after approval.",
    category: "Payments",
    order: 2,
    active: true,
    createdAt: new Date("2026-02-10T12:30:00.000Z"),
    updatedAt: new Date("2026-03-08T07:45:00.000Z"),
  },
];

const policySeed: PolicyDocument[] = [
  {
    id: "POL-901",
    name: "Terms of Service",
    summary: "Latest terms covering cancellations, liabilities, and acceptable use.",
    content:
      "Customers are expected to follow the rules set forth in the service agreement when using NextBus services. Cancellations follow the advertised refund policy.",
    lastUpdated: new Date("2026-03-01T08:00:00.000Z"),
  },
  {
    id: "POL-902",
    name: "Privacy Policy",
    summary: "Explains how passenger data is handled and when it is shared.",
    content:
      "We collect only the information necessary to issue tickets and comply with legal requirements. Data is stored securely and never sold to third parties.",
    lastUpdated: new Date("2026-03-16T10:30:00.000Z"),
  },
];

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureSeedCollections() {
  const db = await getDb();

  const collections: Array<{ name: string; seed: SeedDoc[] }> = [
    { name: "promo_banners", seed: promoSeed },
    { name: "content_coupons", seed: couponSeed },
    { name: "seo_pages", seed: seoSeed },
    { name: "faq_items", seed: faqSeed },
    { name: "policy_documents", seed: policySeed },
  ];

  const pending = collections.map(async (entry) => {
    const count = await db.collection(entry.name).countDocuments();
    if (count === 0) {
      await db
        .collection(entry.name)
        .insertMany(entry.seed as OptionalUnlessRequiredId<SeedDoc>[]);
    }
  });

  await Promise.all(pending);
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export async function listPromoBanners() {
  await ensureSeedCollections();
  const db = await getDb();
  return db
    .collection<PromoBanner>("promo_banners")
    .find()
    .sort({ priority: 1, updatedAt: -1 })
    .toArray();
}

export async function createPromoBanner(data: {
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaLink: string;
  priority?: number;
}) {
  const db = await getDb();
  await db.collection<PromoBanner>("promo_banners").insertOne({
    id: buildId("BANNER"),
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl || "",
    ctaLabel: data.ctaLabel,
    ctaLink: data.ctaLink,
    active: true,
    priority: data.priority ?? 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function setPromoBannerActive(id: string, active: boolean) {
  const db = await getDb();
  await db.collection<PromoBanner>("promo_banners").updateOne(
    { id },
    {
      $set: {
        active,
        updatedAt: new Date(),
      },
    }
  );
}

export async function listCouponCodes() {
  await ensureSeedCollections();
  const db = await getDb();
  return db.collection<CouponCode>("content_coupons").find().sort({ expiresAt: 1 }).toArray();
}

export async function createCouponCode(data: {
  code: string;
  discountType: "percent" | "flat";
  value: number;
  expiresAt: Date;
  usageLimit: number;
}) {
  const db = await getDb();
  await db.collection<CouponCode>("content_coupons").insertOne({
    id: buildId("COUPON"),
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    value: data.value,
    expiresAt: data.expiresAt,
    usageLimit: data.usageLimit,
    usedCount: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function setCouponActive(id: string, active: boolean) {
  const db = await getDb();
  await db.collection<CouponCode>("content_coupons").updateOne(
    { id },
    {
      $set: {
        active,
        updatedAt: new Date(),
      },
    }
  );
}

export async function listSeoPages() {
  await ensureSeedCollections();
  const db = await getDb();
  return db.collection<SeoPage>("seo_pages").find().sort({ slug: 1 }).toArray();
}

export async function createSeoPage(data: {
  slug: string;
  title: string;
  metaDescription: string;
  published?: boolean;
}) {
  const db = await getDb();
  const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  await db.collection<SeoPage>("seo_pages").insertOne({
    id: buildId("SEO"),
    slug,
    title: data.title,
    metaDescription: data.metaDescription,
    published: data.published ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function setSeoPagePublished(id: string, published: boolean) {
  const db = await getDb();
  await db.collection<SeoPage>("seo_pages").updateOne(
    { id },
    {
      $set: {
        published,
        updatedAt: new Date(),
      },
    }
  );
}

export async function listFaqItems() {
  await ensureSeedCollections();
  const db = await getDb();
  return db.collection<FaqItem>("faq_items").find().sort({ order: 1 }).toArray();
}

export async function createFaqItem(data: {
  question: string;
  answer: string;
  category: string;
}) {
  const db = await getDb();
  await db.collection<FaqItem>("faq_items").insertOne({
    id: buildId("FAQ"),
    question: data.question,
    answer: data.answer,
    category: data.category || "General",
    order: Date.now(),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function listPolicyDocuments() {
  await ensureSeedCollections();
  const db = await getDb();
  return db.collection<PolicyDocument>("policy_documents").find().sort({ name: 1 }).toArray();
}

export async function updatePolicyDocument(data: {
  id: string;
  summary: string;
  content: string;
}) {
  const db = await getDb();
  await db.collection<PolicyDocument>("policy_documents").updateOne(
    { id: data.id },
    {
      $set: {
        summary: data.summary,
        content: data.content,
        lastUpdated: new Date(),
      },
    }
  );
}
