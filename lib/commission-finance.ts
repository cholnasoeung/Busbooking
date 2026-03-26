import clientPromise from "@/lib/mongodb";

export type CommissionSettings = {
  platformRate: number;
  operatorRate: number;
  updatedAt: Date;
};

export type PayoutSchedule = {
  id: string;
  operatorId: string;
  amount: number;
  payoutDate: Date;
  status: "pending" | "paid" | "failed";
};

export type RefundRule = {
  id: string;
  description: string;
  minNoticeDays: number;
  penaltyPercent: number;
};

export type SettlementReport = {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  totalVolume: number;
  totalCommission: number;
  createdAt: Date;
};

export type TaxInvoiceRule = {
  id: string;
  country: string;
  vatPercent: number;
  notes: string;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getCommissionSettings() {
  const db = await getDb();
  const record = await db.collection<CommissionSettings>("commission_settings").findOne({});
  return (
    record ?? {
      platformRate: 10,
      operatorRate: 90,
      updatedAt: new Date(),
    }
  );
}

export async function setCommissionRates(platformRate: number, operatorRate: number) {
  const db = await getDb();
  await db.collection<CommissionSettings>("commission_settings").updateOne(
    {},
    {
      $set: {
        platformRate,
        operatorRate,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function listPayouts() {
  const db = await getDb();
  return db.collection<PayoutSchedule>("payouts").find().sort({ payoutDate: -1 }).toArray();
}

export async function createPayout(data: {
  operatorId: string;
  amount: number;
  payoutDate: Date;
}) {
  const db = await getDb();
  await db.collection<PayoutSchedule>("payouts").insertOne({
    id: `PAYOUT-${Date.now().toString().slice(-5)}`,
    operatorId: data.operatorId,
    amount: data.amount,
    payoutDate: data.payoutDate,
    status: "pending",
  });
}

export async function listRefundRules() {
  const db = await getDb();
  return db.collection<RefundRule>("refund_rules").find().toArray();
}

export async function upsertRefundRule(rule: RefundRule) {
  const db = await getDb();
  await db.collection<RefundRule>("refund_rules").updateOne(
    { id: rule.id },
    { $set: rule },
    { upsert: true }
  );
}

export async function listSettlementReports() {
  const db = await getDb();
  return db.collection<SettlementReport>("settlement_reports").find().sort({ periodStart: -1 }).toArray();
}

export async function listTaxRules() {
  const db = await getDb();
  return db.collection<TaxInvoiceRule>("tax_rules").find().toArray();
}

