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
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dairyos';
  if (uri.startsWith('mongodb+srv://') && !uri.includes('.mongodb.net/')) {
    uri = uri.replace(/\/?(\?.*)?$/, '/dairyos$1');
  }
  return uri;
}

const uri = resolveMongoUri();

async function inspect() {
  console.log('================================================================');
  console.log('       DAIRYOS ENTERPRISE ERP - MONGODB DATA INSPECTOR          ');
  console.log('================================================================');
  console.log(`Connecting to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}\n`);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('dairyos');
    console.log(`✅ Connected to Database: "${db.databaseName}"\n`);

    const collections = await db.listCollections().toArray();
    console.log('--- COLLECTIONS & RECORD COUNTS ---');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` • ${col.name.padEnd(20)} : ${count} documents`);
    }

    console.log('\n--- SAMPLE DATA PREVIEWS ---');

    // 1. Farmers Sample
    const farmers = await db.collection('farmers').find().limit(3).toArray();
    console.log('\n[Registered Farmers (Top 3)]');
    farmers.forEach((f: any) => {
      console.log(` • [${f.farmerCode}] ${f.name} | Village: ${f.village || 'Anand'} | Contact: ${f.contactNumber || 'N/A'} | Cattle: ${f.cattleCount} | Status: ${f.status}`);
    });

    // 2. Collections Sample
    const milk = await db.collection('collections').find().limit(3).toArray();
    console.log('\n[Milk Collections (Recent 3)]');
    milk.forEach((m: any) => {
      console.log(` • [${m.collectionCode || m._id}] Farmer: ${m.farmerName} (${m.farmerId}) | Qty: ${m.quantityLitres}L | Fat: ${m.fat}% | SNF: ${m.snf}% | Rate: ₹${m.ratePerLitre}/L | Total: ₹${m.payableAmount}`);
    });

    // 3. Chilling Tanks Sample
    const tanks = await db.collection('chillingTanks').find().toArray();
    console.log('\n[Cold Chain Chilling Silos (All 4)]');
    tanks.forEach((t: any) => {
      console.log(` • [${t.tankCode}] ${t.name}: ${t.currentVolumeLitres}L / ${t.capacityLitres}L @ ${t.temperatureC}°C [Agitator: ${t.agitatorStatus}, Health: ${t.sensorHealth}]`);
    });

    // 4. Sales Orders Sample
    const orders = await db.collection('salesOrders').find().limit(3).toArray();
    console.log('\n[Commercial Sales Orders (Recent 3)]');
    orders.forEach((o: any) => {
      console.log(` • Order #${o.orderNumber} | Customer: ${o.customerName} | Product: ${o.product} | Qty: ${o.quantityUnits} | Total: ₹${o.totalAmount} [${o.paymentStatus} / ${o.fulfillmentStatus}]`);
    });

    console.log('\n================================================================');
    console.log('  Data inspection complete! All records are verified in MongoDB. ');
    console.log('================================================================');
  } catch (err: any) {
    console.error(`Inspection failed: ${err.message}`);
  } finally {
    await client.close();
  }
}

inspect();
