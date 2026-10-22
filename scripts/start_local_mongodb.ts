import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

async function start() {
  console.log('--- Initializing Dedicated Local MongoDB Engine ---');
  const dbDir = path.resolve(process.cwd(), 'mongodb_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'dairyos',
      storageEngine: 'wiredTiger',
      dbPath: dbDir,
    },
  });

  const uri = mongod.getUri();
  console.log(`\n🎉 Dedicated Local MongoDB is RUNNING at: ${uri}`);
  console.log(`Port: 27017 | Database: dairyos | Storage: Persistent WiredTiger`);
  
  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\nStopping MongoDB engine...');
    await mongod.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('Error starting MongoDB:', err);
  process.exit(1);
});
