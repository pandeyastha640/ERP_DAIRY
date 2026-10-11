import { PrismaClient } from '@prisma/client';
import {
  INITIAL_CATTLE,
  INITIAL_FARMERS,
  INITIAL_FEEDS,
  INITIAL_CHILLING_TANKS,
  INITIAL_PRODUCTS,
  INITIAL_PACKAGING,
  INITIAL_ROUTES,
  INITIAL_COLLECTIONS,
  INITIAL_SALES,
  INITIAL_PAYMENTS,
} from '../src/data/mockDairyData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Farmers
  console.log(`Seeding ${INITIAL_FARMERS.length} farmers...`);
  for (const f of INITIAL_FARMERS) {
    await prisma.farmer.upsert({
      where: { farmerCode: f.id },
      update: {
        name: f.name,
        village: f.village,
        contactNumber: f.contactNumber,
        cattleCount: f.cattleCount,
        bankAccount: f.bankAccount,
        status: f.status,
      },
      create: {
        farmerCode: f.id,
        name: f.name,
        village: f.village,
        contactNumber: f.contactNumber,
        cattleCount: f.cattleCount,
        bankAccount: f.bankAccount,
        ifscCode: 'BARB0ANANDX',
        status: f.status,
      },
    });
  }

  // 2. Seed Cattle
  console.log(`Seeding ${INITIAL_CATTLE.length} cattle...`);
  for (const c of INITIAL_CATTLE) {
    await prisma.cattle.upsert({
      where: { tagNumber: c.tagNumber },
      update: {
        breed: c.breed,
        ageYears: c.ageYears,
        lactation: c.lactation,
        lactationStage: c.lactationStage,
        milkYieldLPerDay: c.milkYieldLPerDay,
        feedCostPerDay: c.feedCostPerDay,
        health: c.health,
        status: c.status,
        shedLocation: c.shedLocation,
        dailyFeedKg: c.dailyFeedKg,
      },
      create: {
        tagNumber: c.tagNumber,
        breed: c.breed,
        ageYears: c.ageYears,
        lactation: c.lactation,
        lactationStage: c.lactationStage,
        milkYieldLPerDay: c.milkYieldLPerDay,
        feedCostPerDay: c.feedCostPerDay,
        health: c.health,
        status: c.status,
        shedLocation: c.shedLocation,
        dailyFeedKg: c.dailyFeedKg,
      },
    });
  }

  // 3. Seed Feed Items
  console.log(`Seeding ${INITIAL_FEEDS.length} feed inventory items...`);
  for (const fd of INITIAL_FEEDS) {
    await prisma.feedItem.upsert({
      where: { feedCode: fd.id },
      update: {
        name: fd.name,
        type: fd.type,
        openingStockKg: fd.openingStockKg,
        closingStockKg: fd.closingStockKg,
        unitCostPerKg: fd.unitCostPerKg,
        daysRemaining: fd.daysRemaining,
        reorderLevelKg: fd.reorderLevelKg,
        supplier: fd.supplier,
      },
      create: {
        feedCode: fd.id,
        name: fd.name,
        type: fd.type,
        openingStockKg: fd.openingStockKg,
        purchasedKg: fd.purchasedKg,
        consumedKg: fd.consumedKg,
        closingStockKg: fd.closingStockKg,
        unitCostPerKg: fd.unitCostPerKg,
        daysRemaining: fd.daysRemaining,
        reorderLevelKg: fd.reorderLevelKg,
        supplier: fd.supplier,
      },
    });
  }

  // 4. Seed Chilling Tanks
  console.log(`Seeding ${INITIAL_CHILLING_TANKS.length} chilling tanks...`);
  for (const t of INITIAL_CHILLING_TANKS) {
    await prisma.chillingTank.upsert({
      where: { tankCode: t.id },
      update: {
        name: t.name,
        capacityLitres: t.capacityLitres,
        currentVolumeLitres: t.currentVolumeLitres,
        temperatureC: t.temperatureC,
        agitatorStatus: t.agitatorOn ? 'Running' : 'Stopped',
        lastCleaned: t.lastCleaned,
        sensorHealth: t.sensorHealth,
      },
      create: {
        tankCode: t.id,
        name: t.name,
        capacityLitres: t.capacityLitres,
        currentVolumeLitres: t.currentVolumeLitres,
        temperatureC: t.temperatureC,
        agitatorStatus: t.agitatorOn ? 'Running' : 'Stopped',
        lastCleaned: t.lastCleaned,
        sensorHealth: t.sensorHealth,
      },
    });
  }

  // 5. Seed Products
  console.log(`Seeding ${INITIAL_PRODUCTS.length} products...`);
  for (const p of INITIAL_PRODUCTS) {
    await prisma.productMaster.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        category: p.category,
        packSize: p.packSize,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        productionCost: p.productionCost,
        currentStockUnits: p.currentStockUnits,
      },
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        packSize: p.packSize,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        productionCost: p.productionCost,
        currentStockUnits: p.currentStockUnits,
        expiryDays: p.expiryDays,
      },
    });
  }

  // 6. Seed Packaging
  console.log(`Seeding ${INITIAL_PACKAGING.length} packaging items...`);
  for (const pkg of INITIAL_PACKAGING) {
    await prisma.packagingItem.upsert({
      where: { itemCode: pkg.id },
      update: {
        name: pkg.name,
        materialType: pkg.materialType,
        size: pkg.size,
        openingStock: pkg.openingStock,
        closingStock: pkg.closingStock,
        unitCost: pkg.unitCost,
        reorderLevel: pkg.reorderLevel,
        daysRemaining: pkg.daysRemaining,
        status: pkg.status,
      },
      create: {
        itemCode: pkg.id,
        name: pkg.name,
        materialType: pkg.materialType,
        size: pkg.size,
        openingStock: pkg.openingStock,
        purchased: pkg.purchased,
        consumed: pkg.consumed,
        damaged: pkg.damaged,
        closingStock: pkg.closingStock,
        unitCost: pkg.unitCost,
        reorderLevel: pkg.reorderLevel,
        daysRemaining: pkg.daysRemaining,
        status: pkg.status,
      },
    });
  }

  // 7. Seed Routes
  console.log(`Seeding ${INITIAL_ROUTES.length} routes...`);
  for (const r of INITIAL_ROUTES) {
    await prisma.distributionRoute.upsert({
      where: { routeCode: r.routeCode },
      update: {
        routeName: r.routeName,
        vehicleNumber: r.vehicleNumber,
        driverName: r.driverName,
        distributorName: r.distributorName,
        totalDispatchUnits: r.totalDispatchUnits,
        deliveredUnits: r.deliveredUnits,
        returnUnits: r.returnUnits,
        logisticsCost: r.logisticsCost,
        revenueGenerated: r.revenueGenerated,
        departureTime: r.departureTime,
        status: r.status,
        stopsCount: r.stopsCount,
      },
      create: {
        routeCode: r.routeCode,
        routeName: r.routeName,
        vehicleNumber: r.vehicleNumber,
        driverName: r.driverName,
        distributorName: r.distributorName,
        totalDispatchUnits: r.totalDispatchUnits,
        deliveredUnits: r.deliveredUnits,
        returnUnits: r.returnUnits,
        logisticsCost: r.logisticsCost,
        revenueGenerated: r.revenueGenerated,
        departureTime: r.departureTime,
        status: r.status,
        stopsCount: r.stopsCount,
      },
    });
  }

  // 8. Seed Sample Collections
  console.log(`Seeding initial collections...`);
  for (const c of INITIAL_COLLECTIONS.slice(0, 10)) {
    await prisma.milkCollectionRecord.upsert({
      where: { collectionCode: c.collectionCode },
      update: {
        quantityLitres: c.quantityLitres,
        fat: c.fat,
        snf: c.snf,
        payableAmount: c.payableAmount,
      },
      create: {
        collectionCode: c.collectionCode,
        farmerId: c.farmerId,
        farmerName: c.farmerName,
        date: c.date,
        time: c.time,
        shift: c.shift,
        centre: c.centre,
        quantityLitres: c.quantityLitres,
        fat: c.fat,
        snf: c.snf,
        temperatureC: c.temperatureC,
        quality: c.quality,
        ratePerLitre: c.ratePerLitre,
        payableAmount: c.payableAmount,
        testedBy: c.testedBy,
      },
    });
  }

  // 9. Seed Sales Orders
  console.log(`Seeding ${INITIAL_SALES.length} sales orders...`);
  const allOrdersToSeed = [
    ...INITIAL_SALES,
    {
      id: 'ORD-001042',
      orderNumber: 'SO-001042',
      date: '2026-10-06',
      customerName: 'Anand Heritage Milk Cooperative Outlet',
      channel: 'Retail Supermarket',
      product: 'Full Cream Gold Milk 1L',
      quantityUnits: 800,
      unitRate: 64.0,
      totalAmount: 51200,
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Pending Dispatch',
    },
    {
      id: 'ORD-TEST-001',
      orderNumber: 'SO-TEST-001',
      date: '2026-10-06',
      customerName: 'Amul Dairy Parlour Anand',
      channel: 'Distributor',
      product: 'Standard Toned Milk 500ml',
      quantityUnits: 2000,
      unitRate: 27.5,
      totalAmount: 55000,
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Pending Dispatch',
    },
  ];

  for (const so of allOrdersToSeed) {
    await prisma.salesOrder.upsert({
      where: { orderNumber: so.orderNumber },
      update: {
        date: so.date,
        customerName: so.customerName,
        channel: so.channel,
        product: so.product,
        quantityUnits: so.quantityUnits,
        unitRate: so.unitRate,
        totalAmount: so.totalAmount,
        paymentStatus: so.paymentStatus,
        fulfillmentStatus: so.fulfillmentStatus,
      },
      create: {
        orderNumber: so.orderNumber,
        date: so.date,
        customerName: so.customerName,
        channel: so.channel,
        product: so.product,
        quantityUnits: so.quantityUnits,
        unitRate: so.unitRate,
        totalAmount: so.totalAmount,
        paymentStatus: so.paymentStatus,
        fulfillmentStatus: so.fulfillmentStatus,
      },
    });
  }

  // 10. Seed Payment Transactions
  console.log(`Seeding ${INITIAL_PAYMENTS.length} payment transactions...`);
  for (const pay of INITIAL_PAYMENTS) {
    await prisma.paymentTransaction.upsert({
      where: { transactionRef: pay.transactionRef },
      update: {
        recipientName: pay.recipientName,
        partyType: pay.partyType,
        milkLitres: pay.milkLitres || null,
        amount: pay.amount,
        paymentDate: pay.paymentDate,
        paymentMethod: pay.paymentMethod,
        status: pay.status,
        notes: pay.notes || '',
      },
      create: {
        transactionRef: pay.transactionRef,
        recipientName: pay.recipientName,
        partyType: pay.partyType,
        milkLitres: pay.milkLitres || null,
        amount: pay.amount,
        paymentDate: pay.paymentDate,
        paymentMethod: pay.paymentMethod,
        status: pay.status,
        notes: pay.notes || '',
      },
    });
  }

  // 11. Seed Enterprise Users
  const bcrypt = await import('bcryptjs');
  const defaultPasswordHash = await bcrypt.default.hash('password123', 10);

  const demoUsers = [
    { email: 'operations.manager@dairyos.enterprise', name: 'Dhaval Shah', role: 'Operations Manager' },
    { email: 'ceo@dairyos.enterprise', name: 'Vikramaditya Singhania', role: 'CEO' },
    { email: 'procurement.manager@dairyos.enterprise', name: 'Kishan Patel', role: 'Procurement Manager' },
    { email: 'finance.manager@dairyos.enterprise', name: 'Priya Sharma', role: 'Finance Manager' },
    { email: 'field.staff@dairyos.enterprise', name: 'Vikram Joshi', role: 'Field Staff' },
    { email: 'admin@dairyos.enterprise', name: 'System Administrator', role: 'Operations Manager' },
  ];

  console.log(`Seeding ${demoUsers.length} enterprise users...`);
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash: defaultPasswordHash,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: defaultPasswordHash,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
