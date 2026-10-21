import { prisma } from '../server/src/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Querying all backend tables from dev.db...');
  
  const farmers = await prisma.farmer.findMany();
  const cattle = await prisma.cattle.findMany();
  const collections = await prisma.milkCollectionRecord.findMany();
  const chillingTanks = await prisma.chillingTank.findMany();
  const processingBatches = await prisma.processingBatch.findMany();
  const products = await prisma.productMaster.findMany();
  const inventory = await prisma.inventoryItem.findMany();
  const routes = await prisma.distributionRoute.findMany();
  const salesOrders = await prisma.salesOrder.findMany();
  const payments = await prisma.paymentTransaction.findMany();
  const auditLogs = await prisma.auditLogEntry.findMany();
  const iotDevices = await prisma.ioTDevice.findMany();

  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      platform: 'DairyOS Enterprise Cooperative ERP',
      totalFarmers: farmers.length,
      totalCattle: cattle.length,
      totalCollections: collections.length,
      totalSiloTanks: chillingTanks.length,
      totalBatches: processingBatches.length,
      totalProducts: products.length,
      totalInventoryItems: inventory.length,
      totalRoutes: routes.length,
      totalSalesOrders: salesOrders.length,
      totalPayments: payments.length,
      totalAuditLogs: auditLogs.length,
      totalIoTDevices: iotDevices.length,
    },
    tables: {
      farmers,
      cattle,
      collections,
      chillingTanks,
      processingBatches,
      products,
      inventory,
      routes,
      salesOrders,
      payments,
      auditLogs,
      iotDevices,
    },
  };

  const outputPath = path.resolve(process.cwd(), 'prisma/data_dump.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportPayload, null, 2), 'utf-8');

  console.log(`Successfully exported backend data to ${outputPath}!`);
  console.log(`- Farmers: ${farmers.length}`);
  console.log(`- Cattle: ${cattle.length}`);
  console.log(`- Collections: ${collections.length}`);
  console.log(`- Silo Tanks: ${chillingTanks.length}`);
  console.log(`- Batches: ${processingBatches.length}`);
  console.log(`- Sales Orders: ${salesOrders.length}`);
  console.log(`- Audit Logs: ${auditLogs.length}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error exporting data:', err);
  process.exit(1);
});
