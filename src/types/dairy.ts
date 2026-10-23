export type Role =
  | 'CEO'
  | 'COO'
  | 'Operations Manager'
  | 'Plant Manager'
  | 'Procurement Manager'
  | 'Finance Manager'
  | 'Field Staff'
  | 'Admin';

export type Facility =
  | 'Main Dairy Plant'
  | 'Anand Collection Centre'
  | 'Baroda Bulk Chilling Unit'
  | 'Mehsana Procurement Hub';

export type DateFilter = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'Custom';

export interface Cattle {
  id: string; // e.g. COW-001
  tagNumber: string;
  breed: 'Gir' | 'Sahiwal' | 'Murrah Buffalo' | 'Red Sindhi' | 'HF Cross' | 'Jersey';
  ageYears: number;
  lactation: number; // e.g. 3rd lactation
  lactationStage: 'Early' | 'Mid' | 'Late' | 'Dry';
  lastCalvingDate: string;
  milkYieldLPerDay: number;
  feedCostPerDay: number;
  health: 'Healthy' | 'Observation' | 'Under Treatment' | 'Vaccinated';
  status: 'Milking' | 'Dry' | 'Pregnant' | 'Sick';
  shedLocation: string;
  dailyFeedKg: number;
  vaccinations: { name: string; date: string; status: 'Completed' | 'Upcoming' }[];
  veterinaryNotes: string;
  historicalYields: number[]; // last 7 days
}

export interface Farmer {
  id: string; // e.g. FARM-001
  name: string;
  village: string;
  contactNumber: string;
  cattleCount: number;
  todayMilkL: number;
  morningMilkL: number;
  eveningMilkL: number;
  avgFat: number;
  avgSNF: number;
  ratePerL: number;
  todayPayable: number;
  status: 'Active' | 'Inactive' | 'Under Review';
  bankAccount: string;
  joinedDate: string;
  demoPerformanceScore: number; // 0-100 internal demo rating
  supplyHistory: { date: string; litres: number; fat: number; snf: number }[];
  paymentHistory: { date: string; amount: number; method: string; status: 'Paid' | 'Pending' }[];
}

export interface FeedItem {
  id: string;
  name: string;
  type: 'Green Fodder' | 'Dry Fodder' | 'Concentrate' | 'Mineral Mixture' | 'Other';
  openingStockKg: number;
  purchasedKg: number;
  consumedKg: number;
  closingStockKg: number;
  unitCostPerKg: number;
  stockValue: number;
  daysRemaining: number;
  reorderLevelKg: number;
  supplier: string;
}

export interface FeedFormulaComponent {
  feedId: string;
  feedName: string;
  quantityKg: number;
  costPerKg: number;
}

export interface FeedFormula {
  id: string;
  name: string;
  targetGroup: 'High Yield Milking' | 'Mid Lactation' | 'Dry & Pregnant' | 'Heifers & Calves';
  animalCount: number;
  components: FeedFormulaComponent[];
  dailyQuantityKg: number;
  dailyCost: number;
  costPerAnimal: number;
  estimatedFeedCostPerLitre: number;
}

export interface MilkCollectionRecord {
  id: string;
  collectionCode: string;
  time: string;
  date: string;
  shift: 'Morning' | 'Evening';
  farmerId: string;
  farmerName: string;
  centre: string;
  quantityLitres: number;
  fat: number;
  snf: number;
  temperatureC: number;
  quality: 'PASS' | 'WARNING' | 'FAIL';
  ratePerLitre: number;
  payableAmount: number;
  testedBy: string;
}

export type NewMilkCollection = Omit<MilkCollectionRecord, 'id' | 'collectionCode'> & {
  /** Stable across retries so a timed-out client can safely resubmit once. */
  requestId?: string;
};

export interface QualityTestRecord {
  id: string;
  batchNumber: string;
  sourceType: 'Own Cattle' | 'Farmer Procurement' | 'Chilling Tank Pool';
  sourceName: string;
  quantityLitres: number;
  fat: number;
  snf: number;
  clr: number; // Corrected Lactometer Reading
  temperatureC: number;
  adulterationTest: 'Negative' | 'Trace' | 'Positive';
  acidityPct: number;
  mbrtHours: number; // Methylene Blue Reduction Test
  result: 'PASS' | 'WARNING' | 'FAIL';
  tester: string;
  testTime: string;
  rejectionReason?: string;
}

export interface ChillingTank {
  id: string;
  name: string;
  capacityLitres: number;
  currentVolumeLitres: number;
  temperatureC: number;
  status: 'Chilling' | 'Holding' | 'Emptying' | 'CIP Cleaning' | 'Maintenance';
  holdingTimeHours: number;
  agitatorOn: boolean;
  lastCleaned: string;
  sensorHealth: 'Optimal' | 'Check Sensor';
}

export interface MilkPoolReconciliation {
  openingStockLitres: number;
  ownProductionLitres: number;
  farmerProcurementLitres: number;
  qualityRejectedLitres: number;
  processingConsumptionLitres: number;
  spillageWastageLitres: number;
  closingStockLitres: number;
  reconciliationStatus?: 'RECONCILED' | 'VARIANCE DETECTED' | 'DISCREPANCY';
}

export interface ProcessingBatchProductOutput {
  productName: string;
  sku: string;
  outputQuantity: number;
  unit: string;
  standardFatPct: number;
  standardSnfPct: number;
}

export interface ProcessingBatch {
  id: string;
  batchId: string;
  date: string;
  pasteurizerLine: string;
  inputMilkLitres: number;
  inputFatPct: number;
  inputSnfPct: number;
  products: ProcessingBatchProductOutput[];
  yieldPercentage: number;
  wastageLitres: number;
  processingCostTotal: number;
  status: 'In Progress' | 'Completed' | 'Quality Quarantined';
  startTime: string;
  completionTime: string;
  operator: string;
}

export interface ProductMaster {
  id: string;
  sku: string;
  name: string;
  category: 'Fresh Milk' | 'Curd & Yogurt' | 'Paneer' | 'Ghee' | 'Butter & Cream' | 'Flavoured Milk';
  packSize: string;
  mrp: number;
  sellingPrice: number;
  productionCost: number;
  currentStockUnits: number;
  expiryDays: number;
  reorderLevelUnits: number;
  status: 'Active' | 'Low Stock' | 'Out of Stock';
  monthlySalesUnits: number;
  grossMarginPct: number;
}

export interface PackagingItem {
  id: string;
  name: string;
  materialType: 'Polypouch' | 'PET Bottle' | 'Tub & Foil' | 'Corrugated Box' | 'Cap & Seal' | 'Glass Bottle';
  size: string;
  openingStock: number;
  purchased: number;
  consumed: number;
  damaged: number;
  closingStock: number;
  unitCost: number;
  reorderLevel: number;
  daysRemaining: number;
  status: 'Sufficient' | 'Low Stock' | 'Critical Stockout';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Raw Milk' | 'Finished Goods' | 'Packaging' | 'Feed' | 'Consumables';
  openingBalance: number;
  inward: number;
  outward: number;
  closingBalance: number;
  unit: string;
  unitValue: number;
  totalValue: number;
  reorderLevel: number;
  status: 'Optimal' | 'Low Stock' | 'Near Expiry' | 'Out of Stock';
  warehouseLocation: string;
}

export interface DistributionRoute {
  id: string;
  routeCode: string;
  routeName: string;
  shift: 'Morning' | 'Evening';
  vehicleNumber: string;
  driverName: string;
  distributorName: string;
  totalDispatchUnits: number;
  deliveredUnits: number;
  returnUnits: number;
  logisticsCost: number;
  revenueGenerated: number;
  departureTime: string;
  status: 'En Route' | 'Completed' | 'Delayed' | 'Preparing';
  stopsCount: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  channel: 'Distributor' | 'Retail Supermarket' | 'Direct Consumer' | 'Institutional / Horeca';
  product: string;
  quantityUnits: number;
  unitRate: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  fulfillmentStatus: 'Dispatched' | 'Delivered' | 'Pending Dispatch';
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  recipientName: string;
  partyType: 'Farmer' | 'Distributor' | 'Feed Supplier' | 'Packaging Vendor' | 'Logistics Partner';
  milkLitres?: number;
  amount: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'Direct Bank IMPS' | 'NEFT' | 'Cash' | 'Cheque';
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed' | 'Simulated';
  notes: string;
}

export interface OperatingCostBreakdown {
  milkProcurement: number;
  cattleFeed: number;
  dairyProcessing: number;
  packagingMaterial: number;
  labourStaff: number;
  chillingColdChain: number;
  electricityUtilities: number;
  transportLogistics: number;
  wastageLoss: number;
  healthcareVeterinary: number;
  otherOverheads: number;
}

export interface OperationalAlert {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Feed' | 'Procurement' | 'Packaging' | 'Quality' | 'Logistics' | 'Equipment' | 'Processing' | 'Inventory';
  timestamp: string;
  read: boolean;
  targetModule: string;
}

export interface AIInsight {
  id: string;
  title: string;
  category: 'Procurement' | 'Feed' | 'Logistics' | 'Processing' | 'Margin';
  insight: string;
  whyItMatters: string;
  recommendedAction: string;
  confidence: number;
  metricImpact: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  module: string;
  action: string;
  recordId: string;
  description: string;
  financialImpact?: string;
  milkImpactLitres?: number;
  severity?: 'info' | 'warning' | 'critical';
}

export interface HerdEconomicsSummary {
  totalMilkingCows: number;
  totalDailyYieldL: number;
  avgYieldPerCowL: number;
  totalDailyFeedCost: number;
  avgFeedCostPerCow: number;
  feedCostPerLitre: number;
  totalDailyHealthcareCost: number;
  totalDailyLabourCost: number;
  totalHerdOperatingCost: number;
  totalMilkRevenueAtMarket: number;
  netHerdContribution: number;
  contributionPerLitre: number;
}

export interface FarmerProcurementSummary {
  totalActiveFarmers: number;
  totalSuppliersToday: number;
  totalProcuredL: number;
  avgProcuredPerFarmerL: number;
  weightedAvgFat: number;
  weightedAvgSNF: number;
  weightedAvgRatePerL: number;
  totalPayablesToday: number;
  totalRejectionsL: number;
  totalPayablePending: number;
  averageRatePerLitre: number;
  averageFatPct: number;
  averageSnfPct: number;
}

export interface DerivedERPMetrics {
  reconciliation: MilkPoolReconciliation;
  herdEconomics: HerdEconomicsSummary;
  procurementSummary: FarmerProcurementSummary;
  todayRevenue: number;
  todayOperatingCost: number;
  operatingCostBreakdown: OperatingCostBreakdown;
  grossProfit: number;
  grossMarginPct: number;
  costPerLitre: number;
  revenuePerLitre: number;
  profitPerLitre: number;
  totalInventoryValuation: number;
  totalReceivables: number;
  totalPayablesPending: number;
  alerts: OperationalAlert[];
  insights: AIInsight[];
}

export interface SystemSettings {
  orgName: string;
  fssaiLicense: string;
  gstin: string;
  headOffice: string;
  baseMilkRate: number;
  fatMultiplier: number;
  snfMultiplier: number;
  maxArrivalTemp: number;
  minFatPct: number;
  minSnfPct: number;
  labourDailyCost: number;
  chillingDailyCost: number;
  electricityDailyCost: number;
  packagingDailyCost: number;
  veterinaryDailyCost: number;
  overheadsDailyCost: number;
}
