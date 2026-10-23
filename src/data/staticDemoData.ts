import type {
  Cattle,
  ChillingTank,
  DistributionRoute,
  Farmer,
  FeedFormula,
  FeedItem,
  InventoryItem,
  MilkCollectionRecord,
  PackagingItem,
  PaymentTransaction,
  ProcessingBatch,
  ProductMaster,
  QualityTestRecord,
  SalesOrder,
} from '../types/dairy';

const TODAY = '2026-10-23';
const farmerName = (index: number) => `Sample Farmer ${String(index + 1).padStart(2, '0')}`;
const villageName = (index: number) => `Sample Village ${String.fromCharCode(65 + (index % 8))}`;

export const INITIAL_FARMERS: Farmer[] = Array.from({ length: 8 }, (_, index) => {
  const number = index + 1;
  const morningMilkL = 35 + number * 2;
  const eveningMilkL = 28 + number;
  const avgFat = +(4.0 + (index % 5) * 0.1).toFixed(1);
  const avgSNF = +(8.4 + (index % 4) * 0.1).toFixed(1);
  const ratePerL = Math.max(0, +(34.5 + (avgFat - 4) * 4.5 + (avgSNF - 8.5) * 2.5).toFixed(2));
  return {
    id: `DEMO-FARM-${String(number).padStart(3, '0')}`,
    name: farmerName(index),
    village: villageName(index),
    contactNumber: 'Not provided in sample data',
    cattleCount: 2 + (index % 5),
    todayMilkL: morningMilkL + eveningMilkL,
    morningMilkL,
    eveningMilkL,
    avgFat,
    avgSNF,
    ratePerL,
    todayPayable: Math.round((morningMilkL + eveningMilkL) * ratePerL),
    status: (index === 6 ? 'Under Review' : 'Active') as Farmer['status'],
    bankAccount: 'No account details in demo',
    joinedDate: '2024-01-01',
    demoPerformanceScore: 80 + (index % 15),
    supplyHistory: [
      { date: '2026-10-21', litres: morningMilkL + eveningMilkL - 4, fat: avgFat, snf: avgSNF },
      { date: '2026-10-22', litres: morningMilkL + eveningMilkL - 2, fat: avgFat, snf: avgSNF },
      { date: TODAY, litres: morningMilkL + eveningMilkL, fat: avgFat, snf: avgSNF },
    ],
    paymentHistory: [],
  };
});

export const INITIAL_CATTLE: Cattle[] = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1;
  const status: Cattle['status'] = index % 9 === 8 ? 'Dry' : index % 11 === 10 ? 'Pregnant' : 'Milking';
  const yieldL = status === 'Milking' ? +(10 + (index % 7) * 0.8).toFixed(1) : 0;
  return {
    id: `DEMO-COW-${String(number).padStart(3, '0')}`,
    tagNumber: `DEMO-TAG-${String(number).padStart(3, '0')}`,
    breed: (['Gir', 'Sahiwal', 'Murrah Buffalo', 'Red Sindhi'][index % 4]) as Cattle['breed'],
    ageYears: 3 + (index % 5),
    lactation: 1 + (index % 4),
    lactationStage: status === 'Dry' ? 'Dry' : (['Early', 'Mid', 'Late'][index % 3]) as Cattle['lactationStage'],
    lastCalvingDate: '2026-03-15',
    milkYieldLPerDay: yieldL,
    feedCostPerDay: 120 + index * 5,
    health: 'Healthy',
    status,
    shedLocation: `Sample Shed ${String.fromCharCode(65 + (index % 3))}`,
    dailyFeedKg: status === 'Milking' ? 22 : 16,
    vaccinations: [{ name: 'Sample vaccination', date: '2026-05-01', status: 'Completed' }],
    veterinaryNotes: 'Synthetic demonstration record.',
    historicalYields: [yieldL - 0.5, yieldL, yieldL + 0.4, yieldL - 0.2, yieldL],
  };
});

export const INITIAL_COLLECTIONS: MilkCollectionRecord[] = Array.from({ length: 8 }, (_, index) => {
  const farmer = INITIAL_FARMERS[index];
  const quantityLitres = 30 + index * 2.5;
  const fat = +(4.0 + (index % 4) * 0.1).toFixed(1);
  const snf = +(8.5 + (index % 3) * 0.1).toFixed(1);
  const temperatureC = 18 + (index % 4);
  const failed = fat < 3.2 || snf < 7.8 || temperatureC > 24;
  const warning = !failed && (temperatureC > 20 || fat < 3.8);
  const ratePerLitre = failed ? 0 : Math.max(0, +(34.5 + (fat - 4) * 4.5 + (snf - 8.5) * 2.5).toFixed(2));
  return {
    id: `DEMO-COL-INIT-${String(index + 1).padStart(3, '0')}`,
    collectionCode: `DEMO-COL-INIT-${String(index + 1).padStart(3, '0')}`,
    time: `${String(5 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '35' : '10'}`,
    date: TODAY,
    shift: index % 2 ? 'Evening' : 'Morning',
    farmerId: farmer.id,
    farmerName: farmer.name,
    centre: villageName(index),
    quantityLitres,
    fat,
    snf,
    temperatureC,
    quality: failed ? 'FAIL' : warning ? 'WARNING' : 'PASS',
    ratePerLitre,
    payableAmount: Math.round(quantityLitres * ratePerLitre),
    testedBy: 'Sample Quality Desk',
  };
});

export const INITIAL_FEEDS: FeedItem[] = [
  { id: 'DEMO-FEED-01', name: 'Sample Green Fodder', type: 'Green Fodder', openingStockKg: 8000, purchasedKg: 1500, consumedKg: 1800, closingStockKg: 7700, unitCostPerKg: 3.2, stockValue: 24640, daysRemaining: 8, reorderLevelKg: 2000, supplier: 'Sample Supplier A' },
  { id: 'DEMO-FEED-02', name: 'Sample Dry Fodder', type: 'Dry Fodder', openingStockKg: 6000, purchasedKg: 0, consumedKg: 900, closingStockKg: 5100, unitCostPerKg: 6.8, stockValue: 34680, daysRemaining: 11, reorderLevelKg: 1500, supplier: 'Sample Supplier B' },
  { id: 'DEMO-FEED-03', name: 'Sample Dairy Concentrate', type: 'Concentrate', openingStockKg: 3000, purchasedKg: 600, consumedKg: 500, closingStockKg: 3100, unitCostPerKg: 20, stockValue: 62000, daysRemaining: 12, reorderLevelKg: 700, supplier: 'Sample Supplier C' },
  { id: 'DEMO-FEED-04', name: 'Sample Mineral Mix', type: 'Mineral Mixture', openingStockKg: 500, purchasedKg: 80, consumedKg: 35, closingStockKg: 545, unitCostPerKg: 45, stockValue: 24525, daysRemaining: 20, reorderLevelKg: 100, supplier: 'Sample Supplier D' },
];

export const INITIAL_FEED_FORMULAS: FeedFormula[] = [
  { id: 'DEMO-FORM-01', name: 'Sample high-yield ration', targetGroup: 'High Yield Milking', animalCount: 8, components: [{ feedId: 'DEMO-FEED-01', feedName: 'Sample Green Fodder', quantityKg: 18, costPerKg: 3.2 }, { feedId: 'DEMO-FEED-03', feedName: 'Sample Dairy Concentrate', quantityKg: 4, costPerKg: 20 }], dailyQuantityKg: 176, dailyCost: 1059.2, costPerAnimal: 132.4, estimatedFeedCostPerLitre: 9.8 },
  { id: 'DEMO-FORM-02', name: 'Sample maintenance ration', targetGroup: 'Mid Lactation', animalCount: 4, components: [{ feedId: 'DEMO-FEED-02', feedName: 'Sample Dry Fodder', quantityKg: 8, costPerKg: 6.8 }], dailyQuantityKg: 32, dailyCost: 217.6, costPerAnimal: 54.4, estimatedFeedCostPerLitre: 8.2 },
];

export const INITIAL_QUALITY_TESTS: QualityTestRecord[] = [
  { id: 'DEMO-QC-001', batchNumber: 'DEMO-QC-001', sourceType: 'Farmer Procurement', sourceName: 'Sample collection intake', quantityLitres: 320, fat: 4.4, snf: 8.6, clr: 29, temperatureC: 4.2, adulterationTest: 'Negative', acidityPct: 0.14, mbrtHours: 5, result: 'PASS', tester: 'Sample Lab Operator', testTime: '07:15' },
  { id: 'DEMO-QC-002', batchNumber: 'DEMO-QC-002', sourceType: 'Chilling Tank Pool', sourceName: 'Sample Tank B', quantityLitres: 280, fat: 4.1, snf: 8.4, clr: 28, temperatureC: 8, adulterationTest: 'Trace', acidityPct: 0.17, mbrtHours: 3, result: 'WARNING', tester: 'Sample Lab Operator', testTime: '08:20', rejectionReason: 'Sample exception for demonstration.' },
  { id: 'DEMO-QC-003', batchNumber: 'DEMO-QC-003', sourceType: 'Farmer Procurement', sourceName: 'Sample collection intake', quantityLitres: 42.5, fat: 3.1, snf: 7.4, clr: 22, temperatureC: 18, adulterationTest: 'Positive', acidityPct: 0.22, mbrtHours: 1.5, result: 'FAIL', tester: 'Sample Lab Operator', testTime: '09:05', rejectionReason: 'Sample failed result for demonstration.' },
];

export const INITIAL_CHILLING_TANKS: ChillingTank[] = [
  { id: 'TANK-A', name: 'Sample Raw Milk Silo A', capacityLitres: 5000, currentVolumeLitres: 3200, temperatureC: 3.9, status: 'Holding', holdingTimeHours: 3, agitatorOn: true, lastCleaned: '2026-10-22 22:30', sensorHealth: 'Optimal' },
  { id: 'TANK-B', name: 'Sample Chilling Vat B', capacityLitres: 3000, currentVolumeLitres: 1750, temperatureC: 4.2, status: 'Chilling', holdingTimeHours: 1.5, agitatorOn: true, lastCleaned: '2026-10-23 03:00', sensorHealth: 'Optimal' },
  { id: 'TANK-C', name: 'Sample Process Pool C', capacityLitres: 4000, currentVolumeLitres: 2100, temperatureC: 4.1, status: 'Chilling', holdingTimeHours: 2, agitatorOn: true, lastCleaned: '2026-10-22 20:00', sensorHealth: 'Optimal' },
  { id: 'TANK-D', name: 'Sample Reserve Tank D', capacityLitres: 2000, currentVolumeLitres: 0, temperatureC: 18, status: 'CIP Cleaning', holdingTimeHours: 0, agitatorOn: false, lastCleaned: 'In Progress', sensorHealth: 'Optimal' },
];

export const INITIAL_PROCESSING_BATCHES: ProcessingBatch[] = [
  { id: 'DEMO-BATCH-001', batchId: 'DEMO-BATCH-001', date: TODAY, pasteurizerLine: 'Sample Line 1', inputMilkLitres: 800, inputFatPct: 4.4, inputSnfPct: 8.6, products: [{ productName: 'Sample Toned Milk 500ml', sku: 'DEMO-SKU-02', outputQuantity: 1500, unit: 'Packets', standardFatPct: 3, standardSnfPct: 8.5 }], yieldPercentage: 98, wastageLitres: 16, processingCostTotal: 3200, status: 'Completed', startTime: '07:30', completionTime: '09:30', operator: 'Sample Plant Operator' },
  { id: 'DEMO-BATCH-002', batchId: 'DEMO-BATCH-002', date: TODAY, pasteurizerLine: 'Sample Line 2', inputMilkLitres: 500, inputFatPct: 4.5, inputSnfPct: 8.7, products: [{ productName: 'Sample Curd 400g', sku: 'DEMO-SKU-04', outputQuantity: 900, unit: 'Tubs', standardFatPct: 4, standardSnfPct: 8.5 }], yieldPercentage: 97, wastageLitres: 15, processingCostTotal: 2400, status: 'In Progress', startTime: '10:15', completionTime: '-', operator: 'Sample Plant Operator' },
];

export const INITIAL_PRODUCTS: ProductMaster[] = [
  { id: 'DEMO-PRD-01', sku: 'DEMO-SKU-01', name: 'Sample Full Cream Milk', category: 'Fresh Milk', packSize: '1 Litre Pouch', mrp: 65, sellingPrice: 62, productionCost: 45, currentStockUnits: 1200, expiryDays: 3, reorderLevelUnits: 400, status: 'Active', monthlySalesUnits: 12000, grossMarginPct: 27.4 },
  { id: 'DEMO-PRD-02', sku: 'DEMO-SKU-02', name: 'Sample Toned Milk', category: 'Fresh Milk', packSize: '500 ml Pouch', mrp: 28, sellingPrice: 26, productionCost: 18, currentStockUnits: 2100, expiryDays: 3, reorderLevelUnits: 500, status: 'Active', monthlySalesUnits: 22000, grossMarginPct: 30.8 },
  { id: 'DEMO-PRD-03', sku: 'DEMO-SKU-03', name: 'Sample Cow Milk', category: 'Fresh Milk', packSize: '500 ml Bottle', mrp: 42, sellingPrice: 40, productionCost: 28, currentStockUnits: 450, expiryDays: 2, reorderLevelUnits: 250, status: 'Active', monthlySalesUnits: 6000, grossMarginPct: 30 },
  { id: 'DEMO-PRD-04', sku: 'DEMO-SKU-04', name: 'Sample Curd', category: 'Curd & Yogurt', packSize: '400 g Tub', mrp: 38, sellingPrice: 35, productionCost: 24, currentStockUnits: 780, expiryDays: 10, reorderLevelUnits: 250, status: 'Active', monthlySalesUnits: 8000, grossMarginPct: 31.4 },
  { id: 'DEMO-PRD-05', sku: 'DEMO-SKU-05', name: 'Sample Paneer', category: 'Paneer', packSize: '200 g Pack', mrp: 92, sellingPrice: 88, productionCost: 65, currentStockUnits: 220, expiryDays: 7, reorderLevelUnits: 100, status: 'Active', monthlySalesUnits: 2200, grossMarginPct: 26.1 },
];

export const INITIAL_PACKAGING: PackagingItem[] = [
  { id: 'DEMO-PKG-01', name: 'Sample 500ml pouch film', materialType: 'Polypouch', size: '500 ml Roll', openingStock: 15000, purchased: 2000, consumed: 3000, damaged: 20, closingStock: 13980, unitCost: 0.4, reorderLevel: 4000, daysRemaining: 9, status: 'Sufficient' },
  { id: 'DEMO-PKG-02', name: 'Sample 1L pouch film', materialType: 'Polypouch', size: '1 Litre Roll', openingStock: 12000, purchased: 0, consumed: 2000, damaged: 10, closingStock: 9990, unitCost: 0.6, reorderLevel: 2500, daysRemaining: 12, status: 'Sufficient' },
  { id: 'DEMO-PKG-03', name: 'Sample curd tubs', materialType: 'Tub & Foil', size: '400 g Tub', openingStock: 5000, purchased: 0, consumed: 1200, damaged: 10, closingStock: 3790, unitCost: 1.8, reorderLevel: 800, daysRemaining: 8, status: 'Sufficient' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'DEMO-INV-01', sku: 'DEMO-RAW-MILK', name: 'Sample chilled raw milk', category: 'Raw Milk', openingBalance: 1200, inward: 2500, outward: 2100, closingBalance: 1600, unit: 'Litres', unitValue: 35, totalValue: 56000, reorderLevel: 500, status: 'Optimal', warehouseLocation: 'Sample cold room' },
  { id: 'DEMO-INV-02', sku: 'DEMO-FG-MILK', name: 'Sample finished milk packs', category: 'Finished Goods', openingBalance: 800, inward: 1200, outward: 900, closingBalance: 1100, unit: 'Units', unitValue: 26, totalValue: 28600, reorderLevel: 250, status: 'Optimal', warehouseLocation: 'Sample store A' },
  { id: 'DEMO-INV-03', sku: 'DEMO-FEED', name: 'Sample feed stock', category: 'Feed', openingBalance: 3000, inward: 600, outward: 500, closingBalance: 3100, unit: 'Kg', unitValue: 20, totalValue: 62000, reorderLevel: 700, status: 'Optimal', warehouseLocation: 'Sample store B' },
];

export const INITIAL_ROUTES: DistributionRoute[] = [
  { id: 'DEMO-ROUTE-01', routeCode: 'DEMO-RT-01', routeName: 'Sample Route 01', shift: 'Morning', vehicleNumber: 'DEMO-VEHICLE-01', driverName: 'Sample Driver 01', distributorName: 'Sample Retail Network A', totalDispatchUnits: 450, deliveredUnits: 430, returnUnits: 20, logisticsCost: 900, revenueGenerated: 18000, departureTime: '04:45', status: 'Completed', stopsCount: 8 },
  { id: 'DEMO-ROUTE-02', routeCode: 'DEMO-RT-02', routeName: 'Sample Route 02', shift: 'Morning', vehicleNumber: 'DEMO-VEHICLE-02', driverName: 'Sample Driver 02', distributorName: 'Sample Retail Network B', totalDispatchUnits: 600, deliveredUnits: 550, returnUnits: 10, logisticsCost: 1100, revenueGenerated: 23000, departureTime: '05:15', status: 'Delayed', stopsCount: 10 },
  { id: 'DEMO-ROUTE-03', routeCode: 'DEMO-RT-03', routeName: 'Sample Evening Route', shift: 'Evening', vehicleNumber: 'DEMO-VEHICLE-03', driverName: 'Sample Driver 03', distributorName: 'Sample Retail Network C', totalDispatchUnits: 300, deliveredUnits: 0, returnUnits: 0, logisticsCost: 700, revenueGenerated: 9000, departureTime: '16:30', status: 'Preparing', stopsCount: 5 },
];

export const INITIAL_SALES: SalesOrder[] = [
  { id: 'DEMO-ORDER-001', orderNumber: 'DEMO-ORDER-001', date: TODAY, customerName: 'Sample Retailer 01', channel: 'Distributor', product: 'Sample Full Cream Milk', quantityUnits: 300, unitRate: 62, totalAmount: 18600, paymentStatus: 'Pending', fulfillmentStatus: 'Pending Dispatch' },
  { id: 'DEMO-ORDER-002', orderNumber: 'DEMO-ORDER-002', date: TODAY, customerName: 'Sample Retailer 02', channel: 'Retail Supermarket', product: 'Sample Toned Milk', quantityUnits: 500, unitRate: 26, totalAmount: 13000, paymentStatus: 'Partially Paid', fulfillmentStatus: 'Dispatched' },
  { id: 'DEMO-ORDER-003', orderNumber: 'DEMO-ORDER-003', date: TODAY, customerName: 'Sample Institution 01', channel: 'Institutional / Horeca', product: 'Sample Curd', quantityUnits: 100, unitRate: 35, totalAmount: 3500, paymentStatus: 'Pending', fulfillmentStatus: 'Delivered' },
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  { id: 'DEMO-PAY-001', transactionRef: 'DEMO-PAY-001', recipientName: farmerName(0), partyType: 'Farmer', milkLitres: 60, amount: 2200, paymentDate: TODAY, paymentMethod: 'UPI', status: 'Simulated', notes: 'SAMPLE ONLY — no funds moved or settlement confirmed.' },
  { id: 'DEMO-PAY-002', transactionRef: 'DEMO-PAY-002', recipientName: 'Sample Feed Supplier', partyType: 'Feed Supplier', amount: 1200, paymentDate: TODAY, paymentMethod: 'NEFT', status: 'Pending', notes: 'Sample payable only.' },
];
