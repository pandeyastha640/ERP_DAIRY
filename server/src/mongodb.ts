import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Automatically load credentials from atlas-credential.env or atlas-credentials.env if present
const possibleCredentialFiles = ['atlas-credential.env', 'atlas-credentials.env'];
for (const file of possibleCredentialFiles) {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    break;
  }
}
dotenv.config(); // fallback / default .env

let client: MongoClient | null = null;
let db: Db | null = null;

function resolveMongoUri(): string | null {
  let uri = process.env.MONGODB_URI;
  if (!uri) return null;

  // Ensure database name is explicitly present if not already specified
  if (uri.startsWith('mongodb+srv://') && !uri.includes('.mongodb.net/')) {
    uri = uri.replace(/\/?(\?.*)?$/, '/dairyos$1');
  }
  return uri;
}

export async function connectMongo(): Promise<Db | null> {
  if (db) return db;

  const uri = resolveMongoUri();
  if (!uri) {
    return null;
  }

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    // Default to 'dairyos' if not specified in connection string
    db = client.db('dairyos');
    console.log(`[MongoDB] Connected successfully to database: "${db.databaseName}"`);
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
