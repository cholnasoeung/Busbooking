import { OptionalUnlessRequiredId } from "mongodb";

import clientPromise from "@/lib/mongodb";

export type DynamicPricingConfig = {
  peakMultiplier: number;
  offPeakMultiplier: number;
  minDistanceSurcharge: number;
  maxDistanceSurcharge: number;
};

export type DiscountCampaign = {
  id: string;
  name: string;
  type: "percentage" | "flat";
  value: number;
  startsAt: Date;
  endsAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CommissionSetting = {
  percent: number;
  note: string;
};

export type PricingProfile = {
  id: string;
  operatorId: string;
  baseFare: number;
  dynamicPricing: DynamicPricingConfig;
  weekendMultiplier: number;
  holidayMultiplier: number;
  discountCampaigns: DiscountCampaign[];
  commission: CommissionSetting;
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";
const collectionName = "operator_pricing";

const defaultProfile: Partial<PricingProfile> = {
  baseFare: 8,
  dynamicPricing: {
    peakMultiplier: 1.25,
    offPeakMultiplier: 0.9,
    minDistanceSurcharge: 0,
    maxDistanceSurcharge: 0,
  },
  weekendMultiplier: 1.1,
  holidayMultiplier: 1.2,
  discountCampaigns: [],
  commission: {
    percent: 15,
    note: "Standard commission",
  },
};

function buildId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureProfile(operatorId: string) {
  const db = await getDb();
  const collection = db.collection<PricingProfile>(collectionName);
  const existing = await collection.findOne({ operatorId });
  if (existing) {
    return existing;
  }

  const profile: PricingProfile = {
    id: buildId("PRICE"),
    operatorId,
    baseFare: defaultProfile.baseFare ?? 0,
    dynamicPricing: { ...defaultProfile.dynamicPricing } as DynamicPricingConfig,
    weekendMultiplier: defaultProfile.weekendMultiplier ?? 1,
    holidayMultiplier: defaultProfile.holidayMultiplier ?? 1,
    discountCampaigns: [],
    commission: { ...defaultProfile.commission } as CommissionSetting,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await collection.insertOne(profile as OptionalUnlessRequiredId<PricingProfile>);
  return profile;
}

export async function getPricingProfile(operatorId: string) {
  const profile = await ensureProfile(operatorId);
  return profile;
}

export async function setBaseFare(operatorId: string, baseFare: number) {
  const db = await getDb();
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId },
    {
      $set: {
        baseFare,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function updateDynamicPricing(operatorId: string, config: DynamicPricingConfig) {
  const db = await getDb();
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId },
    {
      $set: {
        dynamicPricing: config,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function updateWeekendHoliday(operatorId: string, weekend: number, holiday: number) {
  const db = await getDb();
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId },
    {
      $set: {
        weekendMultiplier: weekend,
        holidayMultiplier: holiday,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function addDiscountCampaign(
  operatorId: string,
  campaign: Omit<DiscountCampaign, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  await ensureProfile(operatorId);
  const newCampaign: DiscountCampaign = {
    ...campaign,
    id: buildId("DISC"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId },
    {
      $push: {
        discountCampaigns: newCampaign,
      },
      $set: {
        updatedAt: new Date(),
      },
    }
  );
  return newCampaign;
}

export async function toggleDiscountCampaign(
  operatorId: string,
  campaignId: string,
  active: boolean
) {
  const db = await getDb();
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId, "discountCampaigns.id": campaignId },
    {
      $set: {
        "discountCampaigns.$.active": active,
        updatedAt: new Date(),
      },
    }
  );
}

export async function setCommission(operatorId: string, commission: CommissionSetting) {
  const db = await getDb();
  await db.collection<PricingProfile>(collectionName).updateOne(
    { operatorId },
    {
      $set: {
        commission,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
