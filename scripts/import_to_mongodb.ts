import { MongoClient } from 'mongodb';
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
dotenv.config();

function resolveMongoUri(): string {
  let uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/dairyos';
  if (uri.startsWith('mongodb+srv://') && !uri.includes('.mongodb.net/')) {
    uri = uri.replace(/\/?(\?.*)?$/, '/dairyos$1');
  }
  return uri;
}

const mongoUri = resolveMongoUri();

async function main() {
  console.log('--- DairyOS MongoDB Importer & Cloud Sync ---');
  console.log(`Connecting to MongoDB URI: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}`);

  const dumpPath = path.resolve(process.cwd(), 'prisma/data_dump.json');
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`data_dump.json not found at ${dumpPath}. Run npm run db:export first!`);
  }

  const rawData = fs.readFileSync(dumpPath, 'utf-8');
  const payload = JSON.parse(rawData);
  const tables = payload.tables;

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('dairyos');
    console.log(`[MongoDB] Connected successfully to database: "${db.databaseName}"`);

    // Helper to sync table
    async function syncCollection(name: string, items: any[], uniqueIndexField?: string) {
      if (!items || items.length === 0) return;
      const col = db.collection(name);
      
      if (uniqueIndexField) {
        try {
          await col.createIndex({ [uniqueIndexField]: 1 }, { unique: true });
        } catch (e: any) {
          // index might already exist
        }
      }

      let insertedCount = 0;
      for (const item of items) {
        // Map id to _id or preserve id
        const doc = { ...item, _id: item.id || item._id };
        await col.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
        insertedCount++;
      }
      console.log(`✅ Synced collection "${name}": ${insertedCount} documents`);
    }

    await syncCollection('farmers', tables.farmers, 'farmerCode');
    await syncCollection('cattle', tables.cattle, 'tagNumber');
    await syncCollection('collections', tables.collections, 'collectionCode');
    await syncCollection('chillingTanks', tables.chillingTanks, 'tankCode');
    await syncCollection('processingBatches', tables.processingBatches, 'batchId');
    await syncCollection('products', tables.products, 'sku');
    await syncCollection('inventory', tables.inventory, 'sku');
    await syncCollection('routes', tables.routes, 'routeCode');
    await syncCollection('salesOrders', tables.salesOrders, 'orderNumber');
    await syncCollection('payments', tables.payments, 'transactionRef');
    await syncCollection('auditLogs', tables.auditLogs);
    await syncCollection('iotDevices', tables.iotDevices, 'deviceCode');

    console.log('\n🌟 MongoDB Data Import Completed Successfully!');
    console.log(`All 12 collections are now live and queryable in MongoDB ("${db.databaseName}").`);
  } catch (err: any) {
    console.error(`[MongoDB Import Error]: ${err.message}`);
    console.log('\nTip: To connect to MongoDB Atlas in the cloud:');
    console.log('1. Put your credentials in atlas-credential.env or .env');
    console.log('2. Re-run: npm run db:mongo:import');
  } finally {
    await client.close();
  }
}

main().catch(console.error);
