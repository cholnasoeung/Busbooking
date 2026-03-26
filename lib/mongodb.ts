// import { MongoClient, MongoClientOptions } from "mongodb";

// const uri = process.env.MONGODB_URI;
// const tlsInsecure = process.env.MONGODB_TLS_INSECURE === "1";

// if (!uri) {
//   throw new Error("Missing MONGODB_URI environment variable.");
// }

// declare global {
//   var __mongoClientPromise__: Promise<MongoClient> | undefined;
// }

// const clientOptions: MongoClientOptions = tlsInsecure
//   ? {
//       tls: true,
//       tlsInsecure,
//       tlsAllowInvalidCertificates: true,
//     }
//   : {};

// const client = new MongoClient(uri, clientOptions);

// const clientPromise = global.__mongoClientPromise__ ?? client.connect();

// if (process.env.NODE_ENV !== "production") {
//   global.__mongoClientPromise__ = clientPromise;
// }

// export default clientPromise;
import { MongoClient, MongoClientOptions } from "mongodb";

// Define the global type
interface GlobalWithMongoClient {
  __mongoClientPromise__?: Promise<MongoClient>;
}

// Cast global to our interface
const globalWithMongo = global as GlobalWithMongoClient;

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

// Force SSL options for development
const options: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: "majority",
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Check if we're in development
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the client
  // is preserved across module reloads
  if (!globalWithMongo.__mongoClientPromise__) {
    client = new MongoClient(uri, options);
    globalWithMongo.__mongoClientPromise__ = client.connect();
  }
  clientPromise = globalWithMongo.__mongoClientPromise__;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
