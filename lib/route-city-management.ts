import clientPromise from "@/lib/mongodb";

export type City = {
  id: string;
  name: string;
  normalizedName: string;
  standardized: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Stop = {
  id: string;
  name: string;
  cityId: string;
  serviceZone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceZone = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

const dbName = process.env.MONGODB_DB_NAME ?? "bus_booking";

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export async function seedRouteCityData() {
  const db = await getDb();
  const cities = db.collection<City>("cities");
  const stops = db.collection<Stop>("stops");
  const zones = db.collection<ServiceZone>("service_zones");

  const [citiesCount, stopsCount, zonesCount] = await Promise.all([
    cities.countDocuments(),
    stops.countDocuments(),
    zones.countDocuments(),
  ]);

  if (citiesCount === 0) {
    await cities.insertMany([
      {
        id: "CITY-PHN",
        name: "Phnom Penh",
        normalizedName: normalizeName("Phnom Penh"),
        standardized: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "CITY-BAT",
        name: "Battambang",
        normalizedName: normalizeName("Battambang"),
        standardized: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }

  if (stopsCount === 0) {
    await stops.insertMany([
      {
        id: "STOP-PP-01",
        name: "Olympic Circle",
        cityId: "CITY-PHN",
        serviceZone: "Zone A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "STOP-PP-02",
        name: "Central Market",
        cityId: "CITY-PHN",
        serviceZone: "Zone A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }

  if (zonesCount === 0) {
    await zones.insertMany([
      {
        id: "ZONE-A",
        name: "Zone A",
        description: "Central Phnom Penh corridors",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "ZONE-B",
        name: "Zone B",
        description: "Suburban service zone",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }
}

export async function listCities() {
  const db = await getDb();
  await seedRouteCityData();
  return db.collection<City>("cities").find().sort({ name: 1 }).toArray();
}

export async function listStops() {
  const db = await getDb();
  await seedRouteCityData();
  return db.collection<Stop>("stops").find().sort({ name: 1 }).toArray();
}

export async function listZones() {
  const db = await getDb();
  await seedRouteCityData();
  return db.collection<ServiceZone>("service_zones").find().toArray();
}

export async function createZone(data: { name: string; description: string }) {
  const db = await getDb();
  await db.collection<ServiceZone>("service_zones").insertOne({
    id: `ZONE-${Date.now().toString().slice(-5)}`,
    name: data.name,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function standardizeCityNames() {
  const db = await getDb();
  const cities = db.collection<City>("cities");
  const all = await cities.find().toArray();
  const bulk = cities.initializeUnorderedBulkOp();
  all.forEach((city) => {
    const normalized = normalizeName(city.name);
    bulk
      .find({ id: city.id })
      .update({
        $set: {
          normalizedName: normalized,
          standardized: true,
          updatedAt: new Date(),
        },
      });
  });
  if (all.length > 0) {
    await bulk.execute();
  }
}

export async function createCity(name: string) {
  const db = await getDb();
  const cities = db.collection<City>("cities");
  await cities.insertOne({
    id: `CITY-${Date.now().toString().slice(-5)}`,
    name,
    normalizedName: normalizeName(name),
    standardized: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateCity(id: string, name: string) {
  const db = await getDb();
  await db.collection<City>("cities").updateOne(
    { id },
    {
      $set: {
        name,
        normalizedName: normalizeName(name),
        standardized: true,
        updatedAt: new Date(),
      },
    }
  );
}

export async function deleteCity(id: string) {
  const db = await getDb();
  await db.collection<City>("cities").deleteOne({ id });
}

export async function createStop(data: {
  name: string;
  cityId: string;
  serviceZone: string;
}) {
  const db = await getDb();
  await db.collection<Stop>("stops").insertOne({
    id: `STOP-${Date.now().toString().slice(-5)}`,
    name: data.name,
    cityId: data.cityId,
    serviceZone: data.serviceZone,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateStop(id: string, data: { name: string; serviceZone: string }) {
  const db = await getDb();
  await db.collection<Stop>("stops").updateOne(
    { id },
    {
      $set: {
        name: data.name,
        serviceZone: data.serviceZone,
        updatedAt: new Date(),
      },
    }
  );
}

export async function deleteStop(id: string) {
  const db = await getDb();
  await db.collection<Stop>("stops").deleteOne({ id });
}
