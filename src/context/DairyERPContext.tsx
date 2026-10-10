import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Role,
  Facility,
  DateFilter,
  Cattle,
  Farmer,
  FeedItem,
  MilkCollectionRecord,
  QualityTestRecord,
  ChillingTank,
  MilkPoolReconciliation,
  ProcessingBatch,
  ProductMaster,
  PackagingItem,
  InventoryItem,
  DistributionRoute,
  Customer,
  Vehicle,
  SalesOrder,
  PaymentTransaction,
  OperationalAlert,
  AIInsight,
  AuditLogEntry,
  HerdEconomicsSummary,
  FarmerProcurementSummary,
  SystemSettings,
} from '../types/dairy';
import {
  INITIAL_CATTLE,
  INITIAL_FARMERS,
  INITIAL_FEEDS,
  INITIAL_COLLECTIONS,
  INITIAL_QUALITY_TESTS,
  INITIAL_CHILLING_TANKS,
  INITIAL_PROCESSING_BATCHES,
  INITIAL_PRODUCTS,
  INITIAL_PACKAGING,
  INITIAL_INVENTORY,
  INITIAL_ROUTES,
  INITIAL_SALES,
  INITIAL_PAYMENTS,
} from '../data/mockDairyData';
import {
  calculateMilkReconciliation,
  deriveHerdEconomics,
  deriveFarmerProcurement,
  calculateProfitability,
  evaluateOperationalAlerts,
  evaluateAIInsights,
  assessMilkCollection,
} from '../services/dairyEngine';
<<<<<<< Updated upstream
import { api } from '../services/api';
=======
import { canPerformAction, permissionError } from '../services/permissions';
import { duplicateIdentifierError, validIsoDate } from '../services/validationRules';
>>>>>>> Stashed changes

interface DairyERPContextType {
  // Session State
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentFacility: Facility;
  setCurrentFacility: (facility: Facility) => void;
  currentDateFilter: DateFilter;
  setCurrentDateFilter: (filter: DateFilter) => void;
  currentModule: string;
  setCurrentModule: (mod: string) => void;
  selectedItemId?: string;
  setSelectedItemId: (id?: string) => void;

  // Master Data
  cattleList: Cattle[];
  farmersList: Farmer[];
  feedsList: FeedItem[];
  collectionsList: MilkCollectionRecord[];
  qualityTestsList: QualityTestRecord[];
  tanksList: ChillingTank[];
  batchesList: ProcessingBatch[];
  productsList: ProductMaster[];
  packagingList: PackagingItem[];
  inventoryList: InventoryItem[];
  routesList: DistributionRoute[];
  customersList: Customer[];
  vehiclesList: Vehicle[];
  salesOrdersList: SalesOrder[];
  paymentsList: PaymentTransaction[];
  auditLogs: AuditLogEntry[];

  // Dynamically Derived Engine Calculations
  reconciliation: MilkPoolReconciliation;
  herdEconomics: HerdEconomicsSummary;
  procurementSummary: FarmerProcurementSummary;
  profitability: ReturnType<typeof calculateProfitability>;
  alerts: OperationalAlert[];
  insights: AIInsight[];

  // Mutating Action Handlers with Cross-System Side Effects
  recordMilkCollection: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => string | undefined;
  launchProcessingBatch: (batch: ProcessingBatch) => string | undefined;
  recordSalesOrder: (order: SalesOrder) => string | undefined;
  recordPayment: (txn: PaymentTransaction) => string | undefined;
  addCattle: (cow: Cattle, existingId?: string) => string | undefined;
  archiveCattle: (id: string) => void;
  addFarmer: (farmer: Farmer, existingId?: string) => string | undefined;
  archiveFarmer: (id: string) => void;
  recordFeedPurchase: (item: { feedId: string; quantityKg: number; costPerKg: number }) => void;
  recordFeedConsumption: (item: { feedId: string; quantityKg: number }) => void;
  restockPackaging: (id: string, qty: number) => void;
  adjustInventory: (id: string, delta: number) => void;
  addRoute: (route: DistributionRoute, existingId?: string) => string | undefined;
  archiveRoute: (id: string) => void;
  addProduct: (product: ProductMaster, existingId?: string) => string | undefined;
  archiveProduct: (id: string) => void;
  addPackaging: (item: PackagingItem, existingId?: string) => string | undefined;
  archivePackaging: (id: string) => void;
  saveCustomer: (customer: Customer, existingId?: string) => string | undefined;
  archiveCustomer: (id: string) => void;
  saveVehicle: (vehicle: Vehicle, existingId?: string) => string | undefined;
  archiveVehicle: (id: string) => void;
  addQualityTest: (test: QualityTestRecord) => void;
  dismissAlert: (id: string) => void;

  // System Settings & Reset
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  orgName: 'DairyOS Operational Cooperative Ltd.',
  fssaiLicense: '10018021003456',
  gstin: '24AAACC1209B1ZK',
  headOffice: 'Plant Yard 4, GIDC Industrial Estate, Anand, Gujarat - 388001',
  baseMilkRate: 34.50,
  fatMultiplier: 4.50,
  snfMultiplier: 2.50,
  maxArrivalTemp: 6.0,
  minFatPct: 3.2,
  minSnfPct: 7.8,
  labourDailyCost: 5200,
  chillingDailyCost: 2600,
  electricityDailyCost: 3100,
  packagingDailyCost: 4850,
  veterinaryDailyCost: 950,
  overheadsDailyCost: 1450,
};

const STORAGE_PREFIX = 'dairy_erp_v2_';

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

const DairyERPContext = createContext<DairyERPContextType | undefined>(undefined);

// Initial Audit Trail Logs
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-101',
    timestamp: '05:42 AM',
    userName: 'Vikram Joshi',
    userRole: 'Field Staff',
    module: 'Milk Collection',
    action: 'RECORD_COLLECTION',
    recordId: 'COL-001',
    description: 'Received 48.5 L milk from Rameshwar Patel (FARM-001) @ 4.4% Fat / 8.7 SNF',
    financialImpact: '₹1,784.80 payable generated',
    milkImpactLitres: 48.5,
    severity: 'info',
  },
  {
    id: 'AUD-102',
    timestamp: '06:05 AM',
    userName: 'Dhaval Shah',
    userRole: 'Operations Manager',
    module: 'Quality Lab',
    action: 'TEMP_WARNING',
    recordId: 'COL-003',
    description: 'Arrival temperature exception: Mukeshbhai Rabari batch measured at 22.4°C. Diverted to flash chiller.',
    severity: 'warning',
  },
  {
    id: 'AUD-103',
    timestamp: '07:30 AM',
    userName: 'Rakesh Parmar',
    userRole: 'Plant Manager',
    module: 'Processing',
    action: 'BATCH_LAUNCH',
    recordId: 'BATCH-104',
    description: 'Deducted 1,000 L raw pool milk to Continuous HTST Line 1. Output yield: 500L Toned Milk, 300L Dahi, 120kg Paneer.',
    financialImpact: '₹5,850 processing cost committed',
    milkImpactLitres: -1000,
    severity: 'info',
  },
  {
    id: 'AUD-104',
    timestamp: '08:30 AM',
    userName: 'Priya Sharma',
    userRole: 'Finance Manager',
    module: 'Payments',
    action: 'IMPS_SETTLEMENT',
    recordId: 'PAY-301',
    description: 'Settled morning milk disbursement to Rameshwar Patel (FARM-001) via Direct Bank IMPS.',
    financialImpact: '-₹1,784.80 cleared',
    severity: 'info',
  },
];

const INITIAL_CUSTOMERS: Customer[] = Array.from(
  new Map(INITIAL_SALES.map((order) => [order.customerName, order.channel])).entries()
).map(([name, channel], index) => ({
  id: `CUST-${String(index + 1).padStart(3, '0')}`,
  name,
  channel,
  contactName: '',
  phone: '',
  billingAddress: '',
}));

const INITIAL_VEHICLES: Vehicle[] = Array.from(
  new Set(INITIAL_ROUTES.map((route) => route.vehicleNumber.split(' (')[0].trim()))
).map((registration, index) => ({
  id: `VEH-${String(index + 1).padStart(3, '0')}`,
  registration,
  vehicleType: INITIAL_ROUTES.find((route) => route.vehicleNumber.startsWith(registration))?.vehicleNumber.split(' (')[1]?.replace(/\)$/, '') ?? 'Insulated delivery vehicle',
  capacityUnits: Math.max(0, ...INITIAL_ROUTES.filter((route) => route.vehicleNumber.startsWith(registration)).map((route) => route.totalDispatchUnits)),
}));

export const DairyERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session & UI States
  const [currentRole, setCurrentRole] = useState<Role>('Operations Manager');
  const [currentFacility, setCurrentFacility] = useState<Facility>('Main Dairy Plant');
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('Today');
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

<<<<<<< Updated upstream
  // Core Data Stores with persistent localStorage backup
  const [settings, setSettings] = useState<SystemSettings>(() => loadStorage('settings', DEFAULT_SETTINGS));
  const [cattleList, setCattleList] = useState<Cattle[]>(() => loadStorage('cattle', INITIAL_CATTLE));
  const [farmersList, setFarmersList] = useState<Farmer[]>(() => loadStorage('farmers', INITIAL_FARMERS));
  const [feedsList, setFeedsList] = useState<FeedItem[]>(() => loadStorage('feeds', INITIAL_FEEDS));
  const [collectionsList, setCollectionsList] = useState<MilkCollectionRecord[]>(() => loadStorage('collections', INITIAL_COLLECTIONS));
  const [qualityTestsList, setQualityTestsList] = useState<QualityTestRecord[]>(() => loadStorage('quality', INITIAL_QUALITY_TESTS));
  const [tanksList, setTanksList] = useState<ChillingTank[]>(() => loadStorage('tanks', INITIAL_CHILLING_TANKS));
  const [batchesList, setBatchesList] = useState<ProcessingBatch[]>(() => loadStorage('batches', INITIAL_PROCESSING_BATCHES));
  const [productsList, setProductsList] = useState<ProductMaster[]>(() => loadStorage('products', INITIAL_PRODUCTS));
  const [packagingList, setPackagingList] = useState<PackagingItem[]>(() => loadStorage('packaging', INITIAL_PACKAGING));
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(() => loadStorage('inventory', INITIAL_INVENTORY));
  const [routesList, setRoutesList] = useState<DistributionRoute[]>(() => loadStorage('routes', INITIAL_ROUTES));
  const [salesOrdersList, setSalesOrdersList] = useState<SalesOrder[]>(() => loadStorage('sales', INITIAL_SALES));
  const [paymentsList, setPaymentsList] = useState<PaymentTransaction[]>(() => loadStorage('payments', INITIAL_PAYMENTS));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadStorage('audit', INITIAL_AUDIT_LOGS));
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Synchronize state changes to localStorage
  useEffect(() => { saveStorage('settings', settings); }, [settings]);
  useEffect(() => { saveStorage('cattle', cattleList); }, [cattleList]);
  useEffect(() => { saveStorage('farmers', farmersList); }, [farmersList]);
  useEffect(() => { saveStorage('feeds', feedsList); }, [feedsList]);
  useEffect(() => { saveStorage('collections', collectionsList); }, [collectionsList]);
  useEffect(() => { saveStorage('quality', qualityTestsList); }, [qualityTestsList]);
  useEffect(() => { saveStorage('tanks', tanksList); }, [tanksList]);
  useEffect(() => { saveStorage('batches', batchesList); }, [batchesList]);
  useEffect(() => { saveStorage('products', productsList); }, [productsList]);
  useEffect(() => { saveStorage('packaging', packagingList); }, [packagingList]);
  useEffect(() => { saveStorage('inventory', inventoryList); }, [inventoryList]);
  useEffect(() => { saveStorage('routes', routesList); }, [routesList]);
  useEffect(() => { saveStorage('sales', salesOrdersList); }, [salesOrdersList]);
  useEffect(() => { saveStorage('payments', paymentsList); }, [paymentsList]);
  useEffect(() => { saveStorage('audit', auditLogs); }, [auditLogs]);

  // Live Backend Synchronization on mount
  useEffect(() => {
    api.checkHealth()
      .then(async () => {
        try {
          const [farmersRes, cattleRes, tanksRes, batchesRes, salesRes, paymentsRes, qualityRes] = await Promise.all([
            api.farmers.getAll(),
            api.cattle.getAll(),
            api.chilling.getTanks(),
            api.processing.getBatches(),
            api.sales.getOrders(),
            api.payments.getAll(),
            api.quality.getAll(),
          ]);

          if (farmersRes?.data?.length) {
            setFarmersList((prev) => {
              const dbMap = new Map(farmersRes.data.map((f: any) => [f.farmerCode, f]));
              return prev.map((f) => {
                const dbF = dbMap.get(f.id);
                if (dbF) {
                  return {
                    ...f,
                    name: dbF.name,
                    village: dbF.village,
                    contactNumber: dbF.contactNumber,
                    cattleCount: dbF.cattleCount,
                    status: dbF.status,
                  };
                }
                return f;
              });
            });
          }

          if (cattleRes?.data?.length) {
            setCattleList((prev) => {
              const dbMap = new Map(cattleRes.data.map((c: any) => [c.tagNumber, c]));
              return prev.map((c) => {
                const dbC = dbMap.get(c.tagNumber);
                if (dbC) {
                  return {
                    ...c,
                    milkYieldLPerDay: dbC.milkYieldLPerDay,
                    status: dbC.status,
                    health: dbC.health,
                  };
                }
                return c;
              });
            });
          }

          if (tanksRes?.data?.length) {
            setTanksList((prev) => {
              const dbMap = new Map(tanksRes.data.map((t: any) => [t.tankCode, t]));
              return prev.map((t) => {
                const dbT = dbMap.get(t.id);
                if (dbT) {
                  return {
                    ...t,
                    currentVolumeLitres: dbT.currentVolumeLitres,
                    temperatureC: dbT.temperatureC,
                  };
                }
                return t;
              });
            });
          }

          if (salesRes?.data?.length) {
            setSalesOrdersList(salesRes.data.map((s: any) => ({
              id: s.id,
              orderNumber: s.orderNumber,
              date: s.date,
              customerName: s.customerName,
              channel: s.channel,
              product: s.product,
              quantityUnits: s.quantityUnits,
              unitRate: s.unitRate,
              totalAmount: s.totalAmount,
              paymentStatus: s.paymentStatus,
              fulfillmentStatus: s.fulfillmentStatus,
            })));
          }

          if (paymentsRes?.data?.length) {
            setPaymentsList(paymentsRes.data.map((p: any) => ({
              id: p.id,
              transactionRef: p.transactionRef,
              recipientName: p.recipientName,
              partyType: p.partyType,
              milkLitres: p.milkLitres,
              amount: p.amount,
              paymentDate: p.paymentDate,
              paymentMethod: p.paymentMethod,
              status: p.status,
              notes: p.notes,
            })));
          }
        } catch (e) {
          console.warn('Backend sync notice:', e);
        }
      })
      .catch(() => {
        // Backend not available, fallback seamlessly
      });
=======
  // Core Data Stores
  const [cattleList, setCattleList] = useState<Cattle[]>(INITIAL_CATTLE);
  const [farmersList, setFarmersList] = useState<Farmer[]>(INITIAL_FARMERS);
  const [feedsList, setFeedsList] = useState<FeedItem[]>(INITIAL_FEEDS);
  const [collectionsList, setCollectionsList] = useState<MilkCollectionRecord[]>(INITIAL_COLLECTIONS);
  const [qualityTestsList, setQualityTestsList] = useState<QualityTestRecord[]>(INITIAL_QUALITY_TESTS);
  const [tanksList, setTanksList] = useState<ChillingTank[]>(INITIAL_CHILLING_TANKS);
  const [batchesList, setBatchesList] = useState<ProcessingBatch[]>(INITIAL_PROCESSING_BATCHES);
  const [productsList, setProductsList] = useState<ProductMaster[]>(INITIAL_PRODUCTS);
  const [packagingList, setPackagingList] = useState<PackagingItem[]>(INITIAL_PACKAGING);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [routesList, setRoutesList] = useState<DistributionRoute[]>(INITIAL_ROUTES);
  const [customersList, setCustomersList] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [salesOrdersList, setSalesOrdersList] = useState<SalesOrder[]>(INITIAL_SALES);
  const [paymentsList, setPaymentsList] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const openingMilkBalance = useMemo(() => {
    const seededBalance = INITIAL_INVENTORY.find((item) => item.sku === 'RAW-MILK-BULK')?.closingBalance;
    if (seededBalance === undefined) return 1480;

    const baseline = calculateMilkReconciliation(
      0,
      INITIAL_CATTLE,
      INITIAL_COLLECTIONS,
      INITIAL_PROCESSING_BATCHES,
      INITIAL_QUALITY_TESTS
    );
    return (
      seededBalance -
      baseline.ownProductionLitres -
      baseline.farmerProcurementLitres +
      baseline.qualityRejectedLitres +
      baseline.processingConsumptionLitres +
      baseline.spillageWastageLitres
    );
>>>>>>> Stashed changes
  }, []);

  // 1. DYNAMIC MILK POOL RECONCILIATION
  const reconciliation = useMemo(() => {
    return calculateMilkReconciliation(openingMilkBalance, cattleList, collectionsList, batchesList, qualityTestsList);
  }, [openingMilkBalance, cattleList, collectionsList, batchesList, qualityTestsList]);

  // 2. DYNAMIC HERD ECONOMICS
  const herdEconomics = useMemo(() => {
    return deriveHerdEconomics(cattleList);
  }, [cattleList]);

  // 3. DYNAMIC FARMER PROCUREMENT SUMMARY
  const procurementSummary = useMemo(() => {
    return deriveFarmerProcurement(farmersList, collectionsList, settings);
  }, [farmersList, collectionsList, settings]);

  // 4. DYNAMIC MASTER PROFITABILITY ENGINE
  const profitability = useMemo(() => {
    return calculateProfitability(
      salesOrdersList,
      collectionsList,
      cattleList,
      batchesList,
      packagingList,
      routesList,
      reconciliation,
      settings
    );
  }, [salesOrdersList, collectionsList, cattleList, batchesList, packagingList, routesList, reconciliation, settings]);

  // 5. DYNAMIC RULE-BASED ALERTS
  const alerts = useMemo(() => {
    const rawAlerts = evaluateOperationalAlerts(
      feedsList,
      packagingList,
      collectionsList,
      routesList,
      inventoryList,
      batchesList,
      qualityTestsList
    );
    return rawAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [feedsList, packagingList, collectionsList, routesList, inventoryList, batchesList, qualityTestsList, dismissedAlertIds]);

  // 6. DYNAMIC AI INSIGHTS
  const insights = useMemo(() => {
    return evaluateAIInsights(reconciliation, feedsList, herdEconomics);
  }, [reconciliation, feedsList, herdEconomics]);

  // Helper to append audit entry
  const logAudit = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userName' | 'userRole'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: `${currentRole} User`,
      userRole: currentRole,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // ----------------------------------------------------
  // CROSS-SYSTEM MUTATIONS (Milk + Money Flow)
  // ----------------------------------------------------

  /**
   * 1. Record Milk Collection:
   * Farmer -> Collection -> Quality -> Milk Pool -> Farmer Payable in Finance
   */
  const recordMilkCollection = (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => {
    if (!canPerformAction(currentRole, 'collection')) return permissionError(currentRole);
    const farmer = farmersList.find((item) => item.id === record.farmerId);
    if (!farmer) return 'Select a registered farmer before recording milk.';
    if (!record.centre.trim()) return 'Select a collection centre.';
    if (!Number.isFinite(Date.parse(record.date))) return 'Enter a valid collection date.';

    const assessment = assessMilkCollection(
      record.quantityLitres,
      record.fat,
      record.snf,
      record.temperatureC
    );
    if (!assessment.valid) return assessment.error;

    const inwardTank = tanksList.find((tank) => tank.id === 'TANK-B');
    if (
      assessment.quality !== 'FAIL' &&
      inwardTank &&
      inwardTank.currentVolumeLitres + record.quantityLitres > inwardTank.capacityLitres
    ) {
      return `Chilling tank B has room for only ${Math.max(0, inwardTank.capacityLitres - inwardTank.currentVolumeLitres).toLocaleString()} L.`;
    }

    const newId = `COL-${String(collectionsList.length + 1).padStart(3, '0')}`;
    const newRecord: MilkCollectionRecord = {
      ...record,
      farmerName: farmer.name,
      quality: assessment.quality,
      ratePerLitre: assessment.ratePerLitre,
      payableAmount: assessment.payableAmount,
      id: newId,
      collectionCode: `CC-01-${new Date().getHours()}H-${Math.floor(100 + Math.random() * 900)}`,
    };

    const linkedQualityTest: QualityTestRecord = {
      id: `QC-${newId}`,
      linkedCollectionId: newId,
      batchNumber: newRecord.collectionCode,
      sourceType: 'Farmer Procurement',
      sourceName: `${farmer.name} (${farmer.id})`,
      quantityLitres: newRecord.quantityLitres,
      fat: newRecord.fat,
      snf: newRecord.snf,
      temperatureC: newRecord.temperatureC,
      result: newRecord.quality,
      tester: newRecord.testedBy,
      testTime: newRecord.time,
    };

    // 1. Add to collections
    setCollectionsList((prev) => [newRecord, ...prev]);
    setQualityTestsList((prev) => [linkedQualityTest, ...prev]);

    // 2. Update specific Farmer's balance & stats
    setFarmersList((prev) =>
      prev.map((f) => {
        if (f.id === farmer.id) {
          const shiftField = record.shift === 'Morning' ? 'morningMilkL' : 'eveningMilkL';
          return {
            ...f,
            todayMilkL: +(f.todayMilkL + record.quantityLitres).toFixed(1),
            [shiftField]: +(f[shiftField] + record.quantityLitres).toFixed(1),
            todayPayable: f.todayPayable + newRecord.payableAmount,
            supplyHistory: [
              {
                date: record.date,
                litres: record.quantityLitres,
                fat: newRecord.fat,
                snf: newRecord.snf,
              },
              ...f.supplyHistory,
            ],
          };
        }
        return f;
      })
    );

    // 3. Create a pending disbursement transaction in Payments
    if (newRecord.payableAmount > 0) {
      const pendingPayment: PaymentTransaction = {
        id: `PAY-AUTO-${Date.now().toString().slice(-4)}`,
        transactionRef: `TXN-PEND-${Math.floor(10000 + Math.random() * 90000)}`,
        recipientName: `${farmer.name} (${farmer.id})`,
        partyType: 'Farmer',
        milkLitres: record.quantityLitres,
        amount: newRecord.payableAmount,
        paymentDate: `${record.date} ${record.time}`,
        paymentMethod: 'Direct Bank IMPS',
        status: 'Pending',
        notes: `${record.shift} shift inward milk clearance @ ₹${newRecord.ratePerLitre}/L`,
      };
      setPaymentsList((prev) => [pendingPayment, ...prev]);
    }

    // 4. Update chilling tank volume (Vat B inward)
    if (newRecord.quality !== 'FAIL') {
      setTanksList((prev) =>
        prev.map((tank) =>
          tank.id === 'TANK-B'
            ? {
                ...tank,
                currentVolumeLitres: tank.currentVolumeLitres + newRecord.quantityLitres,
              }
            : tank
        )
      );
      setInventoryList((prev) =>
        prev.map((item) =>
          item.sku === 'RAW-MILK-BULK'
            ? {
                ...item,
                inward: item.inward + newRecord.quantityLitres,
                closingBalance: item.closingBalance + newRecord.quantityLitres,
                totalValue: (item.closingBalance + newRecord.quantityLitres) * item.unitValue,
              }
            : item
        )
      );
    }

    // 5. Write audit entry
    logAudit({
      module: 'Milk Collection',
      entity: 'MilkCollection',
      entityId: newId,
      action: 'COLLECTION_RECORDED',
      recordId: newId,
      description: `Inward milk: ${newRecord.quantityLitres} L from ${farmer.name} (${farmer.id}) [${newRecord.quality}]`,
      newValue: newRecord,
      financialImpact: `+₹${newRecord.payableAmount.toLocaleString()} payable generated`,
      milkImpactLitres: record.quantityLitres,
      severity: newRecord.quality === 'FAIL' ? 'warning' : 'info',
    });
<<<<<<< Updated upstream

    // 6. Asynchronously sync to backend database
    api.collections.create({
      farmerId: record.farmerId,
      farmerName: record.farmerName,
      date: record.date,
      time: record.time,
      shift: record.shift,
      centre: record.centre,
      quantityLitres: record.quantityLitres,
      fat: record.fat,
      snf: record.snf,
      temperatureC: record.temperatureC,
      quality: record.quality,
      ratePerLitre: record.ratePerLitre,
      payableAmount: record.payableAmount,
      testedBy: record.testedBy,
    }).catch((err) => console.warn('Backend collection sync notice:', err.message));
=======
    logAudit({
      module: 'Quality Lab',
      entity: 'QualityTest',
      entityId: linkedQualityTest.id,
      action: 'COLLECTION_QUALITY_RECORDED',
      recordId: linkedQualityTest.batchNumber,
      description: `Collection quality recorded for ${farmer.name}: Fat ${linkedQualityTest.fat}%, SNF ${linkedQualityTest.snf}% [${linkedQualityTest.result}]`,
      newValue: linkedQualityTest,
      severity: linkedQualityTest.result === 'FAIL' ? 'critical' : linkedQualityTest.result === 'WARNING' ? 'warning' : 'info',
    });
    return undefined;
>>>>>>> Stashed changes
  };

  /**
   * 2. Launch Processing Batch:
   * Milk Pool -> Processing -> Finished Goods Inventory -> Packaging Stock Deduction
   */
  const launchProcessingBatch = (batch: ProcessingBatch) => {
    if (!canPerformAction(currentRole, 'processing')) return permissionError(currentRole);
    if (!Number.isFinite(batch.inputMilkLitres) || batch.inputMilkLitres <= 0) {
      return 'Processing input must be greater than zero litres.';
    }
    if (!validIsoDate(batch.date)) return 'Enter a valid processing date in YYYY-MM-DD format.';
    const batchIdError = duplicateIdentifierError(batchesList, batch.batchId, (item) => item.batchId, (item) => item.id, 'Batch ID');
    if (batchIdError) return batchIdError;
    if (batch.inputMilkLitres > reconciliation.closingStockLitres) {
      return `Only ${reconciliation.closingStockLitres.toLocaleString()} L are available in the reconciled milk pool.`;
    }

    const rawMilkInventory = inventoryList.find((item) => item.sku === 'RAW-MILK-BULK');
    if (!rawMilkInventory || batch.inputMilkLitres > rawMilkInventory.closingBalance) {
      return `Raw milk inventory has only ${rawMilkInventory?.closingBalance.toLocaleString() ?? 0} L available.`;
    }
    const siloVolume = tanksList
      .filter((tank) => tank.id === 'TANK-A' || tank.id === 'TANK-B')
      .reduce((total, tank) => total + tank.currentVolumeLitres, 0);
    if (batch.inputMilkLitres > siloVolume) {
      return `Silos contain only ${siloVolume.toLocaleString()} L of milk.`;
    }

    const pouchOutput = batch.products.find((product) => product.sku === 'SKU-MILK-TONED-500');
    const packagingUsed = Math.round(pouchOutput?.outputQuantity ?? 0);
    const pouchFilm = packagingList.find((item) => item.id === 'PKG-01');
    if (packagingUsed > 0 && (!pouchFilm || packagingUsed > pouchFilm.closingStock)) {
      return `The batch needs ${packagingUsed.toLocaleString()} milk pouches, but only ${pouchFilm?.closingStock.toLocaleString() ?? 0} are available.`;
    }
    if (batch.products.some((product) => !Number.isFinite(product.outputQuantity) || product.outputQuantity < 0)) {
      return 'Batch output quantities must be valid non-negative numbers.';
    }

    setBatchesList((prev) => [batch, ...prev]);

    let remainingInput = batch.inputMilkLitres;
    const updatedTanks = tanksList.map((tank) => {
      if (tank.id !== 'TANK-A' && tank.id !== 'TANK-B') return tank;
      const deducted = Math.min(tank.currentVolumeLitres, remainingInput);
      remainingInput -= deducted;
      return { ...tank, currentVolumeLitres: tank.currentVolumeLitres - deducted };
    });
    setTanksList(updatedTanks);

<<<<<<< Updated upstream
    // 3. Deduct packaging film / bottles / tubs dynamically based on product outputs
    setPackagingList((prev) => {
      const consumptionMap: Record<string, number> = {};
      batch.products.forEach((prod) => {
        const pName = prod.productName.toLowerCase();
        const sku = prod.sku.toLowerCase();
        if (pName.includes('500ml') || sku.includes('500') || pName.includes('toned milk')) {
          // 500ml polypouch film: 2 pouches per litre
          consumptionMap['PKG-01'] = (consumptionMap['PKG-01'] || 0) + Math.round(prod.outputQuantity * 2);
        } else if (pName.includes('curd') || pName.includes('dahi') || sku.includes('dahi') || pName.includes('400g')) {
          // 400g cup/tub: 2.5 units per kg/litre
          consumptionMap['PKG-03'] = (consumptionMap['PKG-03'] || 0) + Math.round(prod.outputQuantity * 2.5);
        } else if (pName.includes('ghee') || pName.includes('cream') || sku.includes('cream')) {
          // Glass jar / bulk can: 1.5 units per litre
          consumptionMap['PKG-05'] = (consumptionMap['PKG-05'] || 0) + Math.max(1, Math.round(prod.outputQuantity * 1.5));
        } else if (pName.includes('1l') || sku.includes('1l')) {
          // 1L PET Bottle: 1 unit per litre
          consumptionMap['PKG-02'] = (consumptionMap['PKG-02'] || 0) + Math.round(prod.outputQuantity);
        } else {
          consumptionMap['PKG-01'] = (consumptionMap['PKG-01'] || 0) + Math.round(prod.outputQuantity);
        }
      });

      return prev.map((pkg) => {
        const used = consumptionMap[pkg.id] || 0;
        if (used > 0) {
          const scrap = Math.round(used * 0.015); // 1.5% machine scrap
          return {
            ...pkg,
            consumed: pkg.consumed + used,
            damaged: pkg.damaged + scrap,
            closingStock: Math.max(0, pkg.closingStock - used - scrap),
          };
        }
        return pkg;
      });
    });
=======
    setInventoryList((prev) => prev.map((item) => {
      if (item.sku === 'RAW-MILK-BULK') {
        const closingBalance = item.closingBalance - batch.inputMilkLitres;
        return {
          ...item,
          outward: item.outward + batch.inputMilkLitres,
          closingBalance,
          totalValue: closingBalance * item.unitValue,
        };
      }
      const output = batch.products.find((product) =>
        item.category === 'Finished Goods' &&
        item.sku === product.sku.replace(/^SKU-/, 'FG-')
      );
      if (!output) return item;
      const addedQty = Math.round(output.outputQuantity);
      const closingBalance = item.closingBalance + addedQty;
      return {
        ...item,
        inward: item.inward + addedQty,
        closingBalance,
        totalValue: closingBalance * item.unitValue,
      };
    }));
    setProductsList((prev) => prev.map((product) => {
      const output = batch.products.find((item) => item.sku === product.sku);
      return output
        ? { ...product, currentStockUnits: product.currentStockUnits + Math.round(output.outputQuantity) }
        : product;
    }));

    setPackagingList((prev) => prev.map((item) => item.id === 'PKG-01' && packagingUsed > 0
      ? { ...item, consumed: item.consumed + packagingUsed, closingStock: item.closingStock - packagingUsed }
      : item));
    setInventoryList((prev) => prev.map((item) => {
      if (item.sku !== 'PKG-POUCH-500ML' || packagingUsed <= 0) return item;
      const closingBalance = item.closingBalance - packagingUsed;
      return {
        ...item,
        outward: item.outward + packagingUsed,
        closingBalance,
        totalValue: closingBalance * item.unitValue,
      };
    }));
>>>>>>> Stashed changes

    // 4. Log Audit Trail
    logAudit({
      module: 'Processing',
      entity: 'ProcessingBatch',
      entityId: batch.id,
      action: 'BATCH_LAUNCHED',
      recordId: batch.batchId,
      description: `HTST Batch started with ${batch.inputMilkLitres} L raw milk. Converted to ${batch.products.length} products with ${batch.yieldPercentage}% yield.`,
      newValue: batch,
      financialImpact: `₹${batch.processingCostTotal.toLocaleString()} processing cost`,
      milkImpactLitres: -batch.inputMilkLitres,
      severity: 'info',
    });
<<<<<<< Updated upstream

    // 5. Asynchronously sync to backend database
    api.processing.launchBatch({
      batchId: batch.batchId,
      inputMilkLitres: batch.inputMilkLitres,
      inputFatPct: batch.inputFatPct,
      inputSnfPct: batch.inputSnfPct,
      yieldPercentage: batch.yieldPercentage,
      wastageLitres: batch.wastageLitres,
      processingCostTotal: batch.processingCostTotal,
      operator: batch.operator,
      pasteurizerLine: batch.pasteurizerLine,
    }).catch((err) => console.warn('Backend batch sync notice:', err.message));
=======
    return undefined;
>>>>>>> Stashed changes
  };

  /**
   * 3. Record Sales Order:
   * Sales -> Deducts Finished Goods Inventory -> Increases Gross Revenue & Receivables
   */
  const recordSalesOrder = (order: SalesOrder) => {
    if (!canPerformAction(currentRole, 'sales')) return permissionError(currentRole);
    if (!order.customerName.trim()) return 'Enter a customer name before issuing an invoice.';
    if (!order.product.trim()) return 'Select a product before issuing an invoice.';
    if (!Number.isInteger(order.quantityUnits) || order.quantityUnits <= 0) {
      return 'Sales quantity must be a positive whole number.';
    }
    if (!Number.isFinite(order.unitRate) || order.unitRate <= 0) return 'Unit price must be greater than zero.';
    if (!validIsoDate(order.date)) return 'Enter a valid invoice date in YYYY-MM-DD format.';
    const invoiceNumberError = duplicateIdentifierError(salesOrdersList, order.orderNumber, (item) => item.orderNumber, (item) => item.id, 'Invoice number');
    if (invoiceNumberError) return invoiceNumberError;
    const customer = customersList.find((item) => !item.archivedAt && item.name.toLowerCase() === order.customerName.trim().toLowerCase());
    if (!customer) return 'Select an active customer from the customer master.';

    const product = productsList.find((item) => !item.archivedAt && (
      order.productSku
        ? item.sku === order.productSku
        : order.product.toLowerCase().includes(item.name.split(' (')[0].toLowerCase())
    ));
    if (!product) return 'Choose a product in the product master.';
    const inventoryItem = inventoryList.find((item) =>
      item.category === 'Finished Goods' && item.sku === product.sku.replace(/^SKU-/, 'FG-')
    );
    if (!inventoryItem) return `${product.name} has no finished-goods inventory mapping.`;
    if (order.quantityUnits > inventoryItem.closingBalance) {
      return `Only ${inventoryItem.closingBalance.toLocaleString()} units of ${product.name} are available.`;
    }

    const invoiceTotal = order.quantityUnits * order.unitRate;
    const savedOrder: SalesOrder = {
      ...order,
      product: product.name,
      productSku: product.sku,
      totalAmount: invoiceTotal,
      paidAmount: order.paymentStatus === 'Paid' ? invoiceTotal : 0,
    };
    setSalesOrdersList((prev) => [savedOrder, ...prev]);

    setInventoryList((prev) => prev.map((item) => {
      if (item.id !== inventoryItem.id) return item;
      const closingBalance = item.closingBalance - order.quantityUnits;
      return {
        ...item,
        outward: item.outward + order.quantityUnits,
        closingBalance,
        totalValue: closingBalance * item.unitValue,
      };
    }));
    setProductsList((prev) => prev.map((item) => item.sku === product.sku
      ? { ...item, currentStockUnits: Math.max(0, item.currentStockUnits - order.quantityUnits) }
      : item));

    // 2. Track either immediate settlement or an outstanding customer balance.
    if (savedOrder.paymentStatus === 'Paid') {
      const receiptPayment: PaymentTransaction = {
        id: `PAY-REC-${savedOrder.id}`,
        transactionRef: `TXN-REC-${savedOrder.orderNumber}`,
        recipientName: savedOrder.customerName,
        partyType: 'Distributor',
        amount: savedOrder.totalAmount,
        paymentDate: savedOrder.date,
        paymentMethod: 'Direct Bank IMPS',
        status: 'Completed',
        notes: `Immediate settlement for invoice ${savedOrder.orderNumber}`,
      };
      setPaymentsList((prev) => [receiptPayment, ...prev]);
    } else {
      const receivable: PaymentTransaction = {
        id: `PAY-AR-${savedOrder.id}`,
        transactionRef: `AR-${savedOrder.orderNumber}`,
        recipientName: savedOrder.customerName,
        partyType: 'Distributor',
        amount: savedOrder.totalAmount,
        paymentDate: savedOrder.date,
        paymentMethod: 'NEFT',
        status: 'Pending',
        notes: `Outstanding receivable for invoice ${savedOrder.orderNumber}`,
      };
      setPaymentsList((prev) => [receivable, ...prev]);
    }

    // 3. Log Audit Trail
    logAudit({
      module: 'Sales',
      entity: 'SalesInvoice',
      entityId: savedOrder.id,
      action: 'ORDER_INVOICED',
      recordId: savedOrder.orderNumber,
      description: `Invoiced ${savedOrder.quantityUnits} units of ${savedOrder.product} to ${savedOrder.customerName} (${savedOrder.channel})`,
      previousValue: inventoryItem.closingBalance,
      newValue: savedOrder,
      financialImpact: `+₹${savedOrder.totalAmount.toLocaleString()} revenue`,
      severity: 'info',
    });
<<<<<<< Updated upstream

    // 4. Asynchronously sync to backend database
    api.sales.createOrder({
      orderNumber: order.orderNumber,
      date: order.date,
      customerName: order.customerName,
      channel: order.channel,
      product: order.product,
      quantityUnits: order.quantityUnits,
      unitRate: order.unitRate,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    }).catch((err) => console.warn('Sales order sync notice:', err.message));
=======
    return undefined;
>>>>>>> Stashed changes
  };

  /**
   * 4. Record Payment:
   * Settles pending payables or records supplier clearance
   */
  const recordPayment = (txn: PaymentTransaction) => {
    if (!canPerformAction(currentRole, 'payment')) return permissionError(currentRole);
    if (!txn.recipientName.trim()) return 'Enter a recipient before posting a settlement.';
    if (!Number.isFinite(txn.amount) || txn.amount <= 0) return 'Payment amount must be greater than zero.';
    const paymentReferenceError = duplicateIdentifierError(paymentsList, txn.transactionRef, (item) => item.transactionRef, (item) => item.id, 'Payment reference');
    if (paymentReferenceError) return paymentReferenceError;

<<<<<<< Updated upstream
    // If paying a farmer, update the matching pending transaction status and reduce farmer payable
    if (txn.partyType === 'Farmer') {
      setPaymentsList((prev) =>
        prev.map((p) =>
          p.recipientName.includes(txn.recipientName) && p.status === 'Pending'
            ? { ...p, status: 'Completed' }
            : p
        )
      );
      setFarmersList((prev) =>
        prev.map((f) =>
          txn.recipientName.includes(f.name) || txn.recipientName.includes(f.id)
            ? { ...f, todayPayable: Math.max(0, f.todayPayable - txn.amount) }
            : f
        )
      );
    }

    // If receiving from distributor, mark matching order Paid
    if (txn.partyType === 'Distributor') {
      setSalesOrdersList((prev) =>
        prev.map((o) =>
          txn.notes.includes(o.orderNumber) || txn.recipientName.includes(o.customerName)
            ? { ...o, paymentStatus: 'Paid' }
            : o
        )
      );
=======
    const normalizeRecipient = (value: string) => value.trim().toLowerCase();
    const outstanding = paymentsList
      .filter((item) => item.status === 'Pending' && item.partyType === txn.partyType &&
        normalizeRecipient(item.recipientName) === normalizeRecipient(txn.recipientName))
      .reduce((total, item) => total + item.amount, 0);
    if (outstanding <= 0) return `No pending balance was found for ${txn.recipientName}.`;
    if (txn.amount > outstanding) {
      return `Payment exceeds the outstanding balance of ₹${outstanding.toLocaleString()}.`;
    }

    let remainingPayment = txn.amount;
    const updatedPayments = paymentsList.flatMap((item) => {
      if (
        item.status !== 'Pending' ||
        item.partyType !== txn.partyType ||
        normalizeRecipient(item.recipientName) !== normalizeRecipient(txn.recipientName) ||
        remainingPayment <= 0
      ) return [item];
      const applied = Math.min(item.amount, remainingPayment);
      remainingPayment -= applied;
      const remainingBalance = item.amount - applied;
      return remainingBalance > 0 ? [{ ...item, amount: remainingBalance }] : [];
    });
    setPaymentsList([{ ...txn, status: 'Completed' }, ...updatedPayments]);

    if (txn.partyType === 'Distributor') {
      let unallocated = txn.amount;
      setSalesOrdersList((prev) => prev.map((order) => {
        if (order.customerName.toLowerCase() !== normalizeRecipient(txn.recipientName) ||
            order.paymentStatus === 'Paid' || unallocated <= 0) return order;
        const paidSoFar = order.paidAmount ?? 0;
        const applied = Math.min(order.totalAmount - paidSoFar, unallocated);
        unallocated -= applied;
        const paidAmount = paidSoFar + applied;
        return {
          ...order,
          paidAmount,
          paymentStatus: paidAmount >= order.totalAmount ? 'Paid' : 'Partially Paid',
        };
      }));
    } else if (txn.partyType === 'Farmer') {
      setFarmersList((prev) => prev.map((farmer) =>
        txn.recipientName.includes(`(${farmer.id})`)
          ? { ...farmer, todayPayable: Math.max(0, farmer.todayPayable - txn.amount) }
          : farmer
      ));
>>>>>>> Stashed changes
    }

    logAudit({
      module: 'Payments',
      entity: 'PaymentTransaction',
      entityId: txn.id,
      action: 'PAYMENT_SETTLED',
      recordId: txn.transactionRef,
      description: `Settled payment of ₹${txn.amount.toLocaleString()} to ${txn.recipientName} via ${txn.paymentMethod}`,
      previousValue: outstanding,
      newValue: { ...txn, status: 'Completed' },
      financialImpact: `₹${txn.amount.toLocaleString()} settled`,
      severity: 'info',
    });
<<<<<<< Updated upstream

    // Sync to backend database
    api.payments.create({
      transactionRef: txn.transactionRef,
      recipientName: txn.recipientName,
      partyType: txn.partyType,
      milkLitres: txn.milkLitres,
      amount: txn.amount,
      paymentDate: txn.paymentDate,
      paymentMethod: txn.paymentMethod,
      status: txn.status,
      notes: txn.notes,
    }).catch((err) => console.warn('Payment transaction sync notice:', err.message));
=======
    return undefined;
>>>>>>> Stashed changes
  };

  /**
   * 5. Add Cattle Herd Member:
   */
  const addCattle = (cow: Cattle, existingId?: string) => {
    const existing = existingId ? cattleList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Cattle ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(cattleList, cow.id, (item) => item.id, (item) => item.id, 'Cattle ID', existingId);
    if (idError) return idError;
    const tagError = duplicateIdentifierError(cattleList, cow.tagNumber, (item) => item.tagNumber, (item) => item.id, 'Cattle tag', existingId);
    if (tagError) return tagError;
    const savedCow = { ...cow, archivedAt: undefined };
    setCattleList((prev) => existing
      ? prev.map((item) => item.id === existingId ? savedCow : item)
      : [savedCow, ...prev]);
    logAudit({
      module: 'Cattle Herd',
      entity: 'Cattle',
      entityId: cow.id,
      action: existing ? 'CATTLE_UPDATED' : 'CATTLE_ENROLLED',
      recordId: cow.id,
      description: `${existing ? 'Updated' : 'Enrolled'} ${cow.breed} (${cow.tagNumber}) in ${cow.shedLocation}. Milk yield: ${cow.milkYieldLPerDay} L/d`,
      previousValue: existing,
      newValue: savedCow,
      severity: 'info',
    });
<<<<<<< Updated upstream

    api.cattle.create({
      tagNumber: cow.tagNumber,
      breed: cow.breed,
      ageYears: cow.ageYears,
      lactation: cow.lactation,
      lactationStage: cow.lactationStage,
      milkYieldLPerDay: cow.milkYieldLPerDay,
      feedCostPerDay: cow.feedCostPerDay,
      health: cow.health,
      status: cow.status,
      shedLocation: cow.shedLocation,
      dailyFeedKg: cow.dailyFeedKg,
    }).catch((err) => console.warn('Backend cattle sync notice:', err.message));
=======
    return undefined;
  };

  const archiveCattle = (id: string) => {
    const existing = cattleList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setCattleList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Cattle Herd', entity: 'Cattle', entityId: id, action: 'CATTLE_ARCHIVED',
      recordId: id, description: `Archived cattle ${id}; historical records were retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
>>>>>>> Stashed changes
  };

  /**
   * 6. Add Farmer Producer:
   */
  const addFarmer = (farmer: Farmer, existingId?: string) => {
    const existing = existingId ? farmersList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Farmer ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(farmersList, farmer.id, (item) => item.id, (item) => item.id, 'Farmer ID', existingId);
    if (idError) return idError;
    const savedFarmer = { ...farmer, archivedAt: undefined };
    setFarmersList((prev) => existing
      ? prev.map((item) => item.id === existingId ? savedFarmer : item)
      : [savedFarmer, ...prev]);
    logAudit({
      module: 'Farmers',
      entity: 'Farmer', entityId: farmer.id,
      action: existing ? 'FARMER_UPDATED' : 'FARMER_ENROLLED',
      recordId: farmer.id,
      description: `${existing ? 'Updated' : 'Registered'} producer ${farmer.name} (${farmer.village}) with ${farmer.cattleCount} animals`,
      previousValue: existing, newValue: savedFarmer,
      severity: 'info',
    });
<<<<<<< Updated upstream

    api.farmers.create({
      farmerCode: farmer.id,
      name: farmer.name,
      village: farmer.village,
      contactNumber: farmer.contactNumber,
      cattleCount: farmer.cattleCount,
      bankAccount: farmer.bankAccount,
      status: farmer.status,
    }).catch((err) => console.warn('Backend farmer sync notice:', err.message));
=======
    return undefined;
  };

  const archiveFarmer = (id: string) => {
    const existing = farmersList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setFarmersList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Farmers', entity: 'Farmer', entityId: id, action: 'FARMER_ARCHIVED',
      recordId: id, description: `Archived farmer ${existing.name}; procurement and payment history were retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
>>>>>>> Stashed changes
  };

  /**
   * 7. Record Feed Purchase:
   */
  const recordFeedPurchase = (item: { feedId: string; quantityKg: number; costPerKg: number }) => {
    setFeedsList((prev) =>
      prev.map((f) => {
        if (f.id === item.feedId) {
          const newClosing = f.closingStockKg + item.quantityKg;
          return {
            ...f,
            purchasedKg: f.purchasedKg + item.quantityKg,
            closingStockKg: newClosing,
            stockValue: newClosing * f.unitCostPerKg,
            daysRemaining: +(newClosing / (f.consumedKg || 1000)).toFixed(1),
          };
        }
        return f;
      })
    );
    logAudit({
      module: 'Feed',
      action: 'FEED_PURCHASED',
      recordId: item.feedId,
      description: `Received ${item.quantityKg} kg feed inward @ ₹${item.costPerKg}/kg`,
      financialImpact: `₹${(item.quantityKg * item.costPerKg).toLocaleString()} spend committed`,
      severity: 'info',
    });
  };

  /**
   * 8. Record Feed Consumption:
   */
  const recordFeedConsumption = (item: { feedId: string; quantityKg: number }) => {
    setFeedsList((prev) =>
      prev.map((f) => {
        if (f.id === item.feedId) {
          const newClosing = Math.max(0, f.closingStockKg - item.quantityKg);
          return {
            ...f,
            consumedKg: f.consumedKg + item.quantityKg,
            closingStockKg: newClosing,
            stockValue: newClosing * f.unitCostPerKg,
            daysRemaining: +(newClosing / (item.quantityKg || 1000)).toFixed(1),
          };
        }
        return f;
      })
    );
  };

  /**
   * 9. Restock Packaging Material:
   */
  const restockPackaging = (id: string, qty: number) => {
    setPackagingList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newClosing = p.closingStock + qty;
          return {
            ...p,
            purchased: p.purchased + qty,
            closingStock: newClosing,
            status: 'Sufficient',
            daysRemaining: +(newClosing / (p.consumed || 5000)).toFixed(1),
          };
        }
        return p;
      })
    );
    logAudit({
      module: 'Packaging',
      action: 'PACKAGING_RESTOCKED',
      recordId: id,
      description: `Restocked ${qty.toLocaleString()} units. Safety stock replenished.`,
      severity: 'info',
    });
  };

  /**
   * 10. Physical Inventory Adjustment:
   */
  const adjustInventory = (id: string, delta: number) => {
    setInventoryList((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newClosing = Math.max(0, inv.closingBalance + delta);
          return {
            ...inv,
            closingBalance: newClosing,
            totalValue: newClosing * inv.unitValue,
          };
        }
        return inv;
      })
    );
    logAudit({
      module: 'Inventory',
      action: 'STOCK_ADJUSTMENT',
      recordId: id,
      description: `Adjusted inventory level by ${delta > 0 ? `+${delta}` : delta} units`,
      severity: 'warning',
    });
  };

  /**
   * 11. Add Route:
   */
  const addRoute = (route: DistributionRoute, existingId?: string) => {
    const existing = existingId ? routesList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Route ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(routesList, route.id, (item) => item.id, (item) => item.id, 'Route ID', existingId);
    if (idError) return idError;
    const codeError = duplicateIdentifierError(routesList, route.routeCode, (item) => item.routeCode, (item) => item.id, 'Route code', existingId);
    if (codeError) return codeError;
    const vehicleRegistration = route.vehicleNumber.split(' (')[0].trim().toLowerCase();
    if (!vehiclesList.some((item) => !item.archivedAt && item.registration.toLowerCase() === vehicleRegistration)) {
      return 'Select an active registered vehicle for this route.';
    }
    setRoutesList((prev) => existing
      ? prev.map((item) => item.id === existingId ? { ...route, archivedAt: undefined } : item)
      : [route, ...prev]);
    logAudit({
      module: 'Distribution', entity: 'Route', entityId: route.id,
      action: existing ? 'ROUTE_UPDATED' : 'ROUTE_CREATED', recordId: route.routeCode,
      description: `${existing ? 'Updated' : 'Created'} route ${route.routeName} (${route.routeCode}).`,
      previousValue: existing, newValue: route, severity: 'info',
    });
    return undefined;
  };

  const archiveRoute = (id: string) => {
    const existing = routesList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setRoutesList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Distribution', entity: 'Route', entityId: id, action: 'ROUTE_ARCHIVED',
      recordId: existing.routeCode, description: `Archived route ${existing.routeName}; delivery history retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
  };

  /**
   * 12. Add Product:
   */
  const addProduct = (product: ProductMaster, existingId?: string) => {
    const existing = existingId ? productsList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Product ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(productsList, product.id, (item) => item.id, (item) => item.id, 'Product ID', existingId);
    if (idError) return idError;
    const skuError = duplicateIdentifierError(productsList, product.sku, (item) => item.sku, (item) => item.id, 'Product SKU', existingId);
    if (skuError) return skuError;
    setProductsList((prev) => existing
      ? prev.map((item) => item.id === existingId ? { ...product, archivedAt: undefined } : item)
      : [product, ...prev]);
    logAudit({
      module: 'Products', entity: 'Product', entityId: product.id,
      action: existing ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED', recordId: product.sku,
      description: `${existing ? 'Updated' : 'Created'} product ${product.name} (${product.sku}).`,
      previousValue: existing, newValue: product, severity: 'info',
    });
    return undefined;
  };

  const archiveProduct = (id: string) => {
    const existing = productsList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setProductsList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Products', entity: 'Product', entityId: id, action: 'PRODUCT_ARCHIVED',
      recordId: existing.sku, description: `Archived product ${existing.name}; historical transactions retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
  };

  const addPackaging = (item: PackagingItem, existingId?: string) => {
    const existing = existingId ? packagingList.find((entry) => entry.id === existingId) : undefined;
    if (existingId && !existing) return `Packaging item ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(packagingList, item.id, (entry) => entry.id, (entry) => entry.id, 'Packaging ID', existingId);
    if (idError) return idError;
    const nameError = duplicateIdentifierError(packagingList, item.name, (entry) => entry.name, (entry) => entry.id, 'Packaging material', existingId);
    if (nameError) return nameError;
    setPackagingList((prev) => existing
      ? prev.map((entry) => entry.id === existingId ? { ...item, archivedAt: undefined } : entry)
      : [item, ...prev]);
    logAudit({
      module: 'Packaging', entity: 'PackagingItem', entityId: item.id,
      action: existing ? 'PACKAGING_UPDATED' : 'PACKAGING_CREATED', recordId: item.id,
      description: `${existing ? 'Updated' : 'Created'} packaging master ${item.name}.`,
      previousValue: existing, newValue: item, severity: 'info',
    });
    return undefined;
  };

  const archivePackaging = (id: string) => {
    const existing = packagingList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setPackagingList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Packaging', entity: 'PackagingItem', entityId: id, action: 'PACKAGING_ARCHIVED',
      recordId: id, description: `Archived packaging master ${existing.name}; stock history retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
  };

  /**
   * 13. Add Quality Test:
   */
  const saveCustomer = (customer: Customer, existingId?: string) => {
    if (!canPerformAction(currentRole, 'customer')) return permissionError(currentRole);
    const existing = existingId ? customersList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Customer ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(customersList, customer.id, (item) => item.id, (item) => item.id, 'Customer ID', existingId);
    if (idError) return idError;
    const nameError = duplicateIdentifierError(customersList, customer.name, (item) => item.name, (item) => item.id, 'Customer', existingId);
    if (nameError) return nameError;
    const saved = { ...customer, name: customer.name.trim(), archivedAt: undefined };
    setCustomersList((prev) => existing
      ? prev.map((item) => item.id === existingId ? saved : item)
      : [saved, ...prev]);
    logAudit({
      module: 'Sales', entity: 'Customer', entityId: customer.id,
      action: existing ? 'CUSTOMER_UPDATED' : 'CUSTOMER_CREATED', recordId: customer.id,
      description: `${existing ? 'Updated' : 'Created'} customer ${saved.name}.`,
      previousValue: existing, newValue: saved, severity: 'info',
    });
    return undefined;
  };

  const archiveCustomer = (id: string) => {
    const existing = customersList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setCustomersList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Sales', entity: 'Customer', entityId: id, action: 'CUSTOMER_ARCHIVED',
      recordId: id, description: `Archived customer ${existing.name}; invoice history retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
  };

  const saveVehicle = (vehicle: Vehicle, existingId?: string) => {
    if (!canPerformAction(currentRole, 'vehicle')) return permissionError(currentRole);
    const existing = existingId ? vehiclesList.find((item) => item.id === existingId) : undefined;
    if (existingId && !existing) return `Vehicle ${existingId} no longer exists.`;
    const idError = duplicateIdentifierError(vehiclesList, vehicle.id, (item) => item.id, (item) => item.id, 'Vehicle ID', existingId);
    if (idError) return idError;
    const registrationError = duplicateIdentifierError(vehiclesList, vehicle.registration, (item) => item.registration, (item) => item.id, 'Vehicle registration', existingId);
    if (registrationError) return registrationError;
    const saved = { ...vehicle, registration: vehicle.registration.trim(), archivedAt: undefined };
    setVehiclesList((prev) => existing
      ? prev.map((item) => item.id === existingId ? saved : item)
      : [saved, ...prev]);
    logAudit({
      module: 'Distribution', entity: 'Vehicle', entityId: vehicle.id,
      action: existing ? 'VEHICLE_UPDATED' : 'VEHICLE_CREATED', recordId: vehicle.registration,
      description: `${existing ? 'Updated' : 'Created'} vehicle ${saved.registration}.`,
      previousValue: existing, newValue: saved, severity: 'info',
    });
    return undefined;
  };

  const archiveVehicle = (id: string) => {
    const existing = vehiclesList.find((item) => item.id === id);
    if (!existing || existing.archivedAt) return;
    const archived = { ...existing, archivedAt: new Date().toISOString() };
    setVehiclesList((prev) => prev.map((item) => item.id === id ? archived : item));
    logAudit({
      module: 'Distribution', entity: 'Vehicle', entityId: id, action: 'VEHICLE_ARCHIVED',
      recordId: existing.registration, description: `Archived vehicle ${existing.registration}; route history retained.`,
      previousValue: existing, newValue: archived, severity: 'warning',
    });
  };

  const addQualityTest = (test: QualityTestRecord) => {
    setQualityTestsList((prev) => [test, ...prev]);
    logAudit({
      module: 'Quality Lab',
      action: 'QC_TEST_RECORDED',
      recordId: test.batchNumber,
      description: `Lab test completed: ${test.sourceName}. Fat: ${test.fat}%, SNF: ${test.snf}%, Temp: ${test.temperatureC}°C [${test.result}]`,
      severity: test.result === 'FAIL' ? 'critical' : test.result === 'WARNING' ? 'warning' : 'info',
    });

    api.quality.create({
      batchNumber: test.batchNumber,
      sourceType: test.sourceType,
      sourceName: test.sourceName,
      quantityLitres: test.quantityLitres,
      fat: test.fat,
      snf: test.snf,
      clr: test.clr,
      temperatureC: test.temperatureC,
      adulterationTest: test.adulterationTest,
      acidityPct: test.acidityPct,
      mbrtHours: test.mbrtHours,
      result: test.result,
      tester: test.tester,
      testTime: test.testTime,
    }).catch((err) => console.warn('Quality test sync notice:', err.message));
  };

  const dismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit({
      module: 'Settings',
      action: 'SETTINGS_UPDATED',
      recordId: 'SYS-CFG',
      description: 'System enterprise configuration updated',
      severity: 'info',
    });
  };

  const resetAllData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    setSettings(DEFAULT_SETTINGS);
    setCattleList(INITIAL_CATTLE);
    setFarmersList(INITIAL_FARMERS);
    setFeedsList(INITIAL_FEEDS);
    setCollectionsList(INITIAL_COLLECTIONS);
    setQualityTestsList(INITIAL_QUALITY_TESTS);
    setTanksList(INITIAL_CHILLING_TANKS);
    setBatchesList(INITIAL_PROCESSING_BATCHES);
    setProductsList(INITIAL_PRODUCTS);
    setPackagingList(INITIAL_PACKAGING);
    setInventoryList(INITIAL_INVENTORY);
    setRoutesList(INITIAL_ROUTES);
    setSalesOrdersList(INITIAL_SALES);
    setPaymentsList(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDismissedAlertIds([]);
  };

  const value = {
    currentRole,
    setCurrentRole,
    currentFacility,
    setCurrentFacility,
    currentDateFilter,
    setCurrentDateFilter,
    currentModule,
    setCurrentModule,
    selectedItemId,
    setSelectedItemId,

    cattleList,
    farmersList,
    feedsList,
    collectionsList,
    qualityTestsList,
    tanksList,
    batchesList,
    productsList,
    packagingList,
    inventoryList,
    routesList,
    customersList,
    vehiclesList,
    salesOrdersList,
    paymentsList,
    auditLogs,

    reconciliation,
    herdEconomics,
    procurementSummary,
    profitability,
    alerts,
    insights,

    recordMilkCollection,
    launchProcessingBatch,
    recordSalesOrder,
    recordPayment,
    addCattle,
    archiveCattle,
    addFarmer,
    archiveFarmer,
    recordFeedPurchase,
    recordFeedConsumption,
    restockPackaging,
    adjustInventory,
    addRoute,
    archiveRoute,
    addProduct,
    archiveProduct,
    addPackaging,
    archivePackaging,
    saveCustomer,
    archiveCustomer,
    saveVehicle,
    archiveVehicle,
    addQualityTest,
    dismissAlert,

    settings,
    updateSettings,
    resetAllData,
  };

  return <DairyERPContext.Provider value={value}>{children}</DairyERPContext.Provider>;
};

export const useDairyERP = () => {
  const context = useContext(DairyERPContext);
  if (!context) {
    throw new Error('useDairyERP must be used within a DairyERPProvider');
  }
  return context;
};
