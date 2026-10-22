import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairyos';
let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db | null> {
  if (db) return db;
  
  if (!process.env.MONGODB_URI) {
    // If no MONGODB_URI is provided, log helpful info and return null
    return null;
  }

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db();
    console.log(`[MongoDB] Connected successfully to database: ${db.databaseName}`);
    return db;
  } catch (err: any) {
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB (${err.message}). Using local SQLite primary store.`);
    return null;
  }
}

export function getMongoDb(): Db | null {
  return db;
}

export function isMongoConnected(): boolean {
  return db !== null;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
