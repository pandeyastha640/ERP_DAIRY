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
} from '../services/dairyEngine';
import { api } from '../services/api';

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
  recordMilkCollection: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => void;
  launchProcessingBatch: (batch: ProcessingBatch) => void;
  recordSalesOrder: (order: SalesOrder) => void;
  recordPayment: (txn: PaymentTransaction) => void;
  addCattle: (cow: Cattle) => void;
  addFarmer: (farmer: Farmer) => void;
  recordFeedPurchase: (item: { feedId: string; quantityKg: number; costPerKg: number }) => void;
  recordFeedConsumption: (item: { feedId: string; quantityKg: number }) => void;
  restockPackaging: (id: string, qty: number) => void;
  adjustInventory: (id: string, delta: number) => void;
  addRoute: (route: DistributionRoute) => void;
  addProduct: (product: ProductMaster) => void;
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

export const DairyERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session & UI States
  const [currentRole, setCurrentRole] = useState<Role>('Operations Manager');
  const [currentFacility, setCurrentFacility] = useState<Facility>('Main Dairy Plant');
  const [currentDateFilter, setCurrentDateFilter] = useState<DateFilter>('Today');
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

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
  }, []);

  // 1. DYNAMIC MILK POOL RECONCILIATION
  const reconciliation = useMemo(() => {
    return calculateMilkReconciliation(1480, cattleList, collectionsList, batchesList, qualityTestsList);
  }, [cattleList, collectionsList, batchesList, qualityTestsList]);

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
    const newId = `COL-${String(collectionsList.length + 1).padStart(3, '0')}`;
    const newRecord: MilkCollectionRecord = {
      ...record,
      id: newId,
      collectionCode: `CC-01-${new Date().getHours()}H-${Math.floor(100 + Math.random() * 900)}`,
    };

    // 1. Add to collections
    setCollectionsList((prev) => [newRecord, ...prev]);

    // 2. Update specific Farmer's balance & stats
    setFarmersList((prev) =>
      prev.map((f) => {
        if (f.id === record.farmerId) {
          const shiftField = record.shift === 'Morning' ? 'morningMilkL' : 'eveningMilkL';
          return {
            ...f,
            todayMilkL: +(f.todayMilkL + record.quantityLitres).toFixed(1),
            [shiftField]: +(f[shiftField] + record.quantityLitres).toFixed(1),
            todayPayable: f.todayPayable + record.payableAmount,
            supplyHistory: [
              {
                date: record.date,
                litres: record.quantityLitres,
                fat: record.fat,
                snf: record.snf,
              },
              ...f.supplyHistory,
            ],
          };
        }
        return f;
      })
    );

    // 3. Create a pending disbursement transaction in Payments
    if (record.payableAmount > 0) {
      const pendingPayment: PaymentTransaction = {
        id: `PAY-AUTO-${Date.now().toString().slice(-4)}`,
        transactionRef: `TXN-PEND-${Math.floor(10000 + Math.random() * 90000)}`,
        recipientName: `${record.farmerName} (${record.farmerId})`,
        partyType: 'Farmer',
        milkLitres: record.quantityLitres,
        amount: record.payableAmount,
        paymentDate: `${record.date} ${record.time}`,
        paymentMethod: 'Direct Bank IMPS',
        status: 'Pending',
        notes: `${record.shift} shift inward milk clearance @ ₹${record.ratePerLitre}/L`,
      };
      setPaymentsList((prev) => [pendingPayment, ...prev]);
    }

    // 4. Update chilling tank volume (Vat B inward)
    if (record.quality !== 'FAIL') {
      setTanksList((prev) =>
        prev.map((tank) =>
          tank.id === 'TANK-B'
            ? {
                ...tank,
                currentVolumeLitres: Math.min(
                  tank.capacityLitres,
                  tank.currentVolumeLitres + Math.round(record.quantityLitres)
                ),
              }
            : tank
        )
      );
    }

    // 5. Write audit entry
    logAudit({
      module: 'Milk Collection',
      action: 'COLLECTION_RECORDED',
      recordId: newId,
      description: `Inward milk: ${record.quantityLitres} L from ${record.farmerName} (${record.farmerId}) [${record.quality}]`,
      financialImpact: `+₹${record.payableAmount.toLocaleString()} payable generated`,
      milkImpactLitres: record.quantityLitres,
      severity: record.quality === 'FAIL' ? 'warning' : 'info',
    });

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
  };

  /**
   * 2. Launch Processing Batch:
   * Milk Pool -> Processing -> Finished Goods Inventory -> Packaging Stock Deduction
   */
  const launchProcessingBatch = (batch: ProcessingBatch) => {
    setBatchesList((prev) => [batch, ...prev]);

    // 1. Deduct milk from Silo Tanks
    setTanksList((prev) =>
      prev.map((tank) =>
        tank.id === 'TANK-A'
          ? {
              ...tank,
              currentVolumeLitres: Math.max(
                0,
                tank.currentVolumeLitres - Math.round(batch.inputMilkLitres)
              ),
            }
          : tank
      )
    );

    // 2. Increase Finished Goods Inventory for each output product
    batch.products.forEach((prod) => {
      setInventoryList((prev) =>
        prev.map((inv) => {
          if (inv.sku.includes(prod.sku) || inv.name.toLowerCase().includes(prod.productName.toLowerCase())) {
            const addedQty = Math.round(prod.outputQuantity);
            return {
              ...inv,
              inward: inv.inward + addedQty,
              closingBalance: inv.closingBalance + addedQty,
              totalValue: (inv.closingBalance + addedQty) * inv.unitValue,
            };
          }
          return inv;
        })
      );
    });

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

    // 4. Log Audit Trail
    logAudit({
      module: 'Processing',
      action: 'BATCH_LAUNCHED',
      recordId: batch.batchId,
      description: `HTST Batch started with ${batch.inputMilkLitres} L raw milk. Converted to ${batch.products.length} products with ${batch.yieldPercentage}% yield.`,
      financialImpact: `₹${batch.processingCostTotal.toLocaleString()} processing cost`,
      milkImpactLitres: -batch.inputMilkLitres,
      severity: 'info',
    });

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
  };

  /**
   * 3. Record Sales Order:
   * Sales -> Deducts Finished Goods Inventory -> Increases Gross Revenue & Receivables
   */
  const recordSalesOrder = (order: SalesOrder) => {
    setSalesOrdersList((prev) => [order, ...prev]);

    // 1. Deduct finished goods inventory
    setInventoryList((prev) =>
      prev.map((inv) => {
        if (inv.name.toLowerCase().includes(order.product.toLowerCase())) {
          const newClosing = Math.max(0, inv.closingBalance - order.quantityUnits);
          return {
            ...inv,
            outward: inv.outward + order.quantityUnits,
            closingBalance: newClosing,
            totalValue: newClosing * inv.unitValue,
          };
        }
        return inv;
      })
    );

    // 2. If paid immediately, create clearance payment entry
    if (order.paymentStatus === 'Paid') {
      const receiptPayment: PaymentTransaction = {
        id: `PAY-REC-${Date.now().toString().slice(-4)}`,
        transactionRef: `TXN-REC-${Math.floor(10000 + Math.random() * 90000)}`,
        recipientName: order.customerName,
        partyType: 'Distributor',
        amount: order.totalAmount,
        paymentDate: `${order.date} 09:30 AM`,
        paymentMethod: 'Direct Bank IMPS',
        status: 'Completed',
        notes: `Immediate settlement for invoice ${order.orderNumber}`,
      };
      setPaymentsList((prev) => [receiptPayment, ...prev]);
    }

    // 3. Log Audit Trail
    logAudit({
      module: 'Sales',
      action: 'ORDER_INVOICED',
      recordId: order.orderNumber,
      description: `Invoiced ${order.quantityUnits} units of ${order.product} to ${order.customerName} (${order.channel})`,
      financialImpact: `+₹${order.totalAmount.toLocaleString()} revenue`,
      severity: 'info',
    });

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
  };

  /**
   * 4. Record Payment:
   * Settles pending payables or records supplier clearance
   */
  const recordPayment = (txn: PaymentTransaction) => {
    setPaymentsList((prev) => [txn, ...prev]);

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
    }

    logAudit({
      module: 'Payments',
      action: 'PAYMENT_SETTLED',
      recordId: txn.transactionRef,
      description: `Settled payment of ₹${txn.amount.toLocaleString()} to ${txn.recipientName} via ${txn.paymentMethod}`,
      financialImpact: `₹${txn.amount.toLocaleString()} settled`,
      severity: 'info',
    });

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
  };

  /**
   * 5. Add Cattle Herd Member:
   */
  const addCattle = (cow: Cattle) => {
    setCattleList((prev) => [cow, ...prev]);
    logAudit({
      module: 'Cattle Herd',
      action: 'CATTLE_ENROLLED',
      recordId: cow.id,
      description: `Enrolled ${cow.breed} (${cow.tagNumber}) in ${cow.shedLocation}. Milk yield: ${cow.milkYieldLPerDay} L/d`,
      severity: 'info',
    });

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
  };

  /**
   * 6. Add Farmer Producer:
   */
  const addFarmer = (farmer: Farmer) => {
    setFarmersList((prev) => [farmer, ...prev]);
    logAudit({
      module: 'Farmers',
      action: 'FARMER_ENROLLED',
      recordId: farmer.id,
      description: `Registered producer ${farmer.name} (${farmer.village}) with ${farmer.cattleCount} animals`,
      severity: 'info',
    });

    api.farmers.create({
      farmerCode: farmer.id,
      name: farmer.name,
      village: farmer.village,
      contactNumber: farmer.contactNumber,
      cattleCount: farmer.cattleCount,
      bankAccount: farmer.bankAccount,
      status: farmer.status,
    }).catch((err) => console.warn('Backend farmer sync notice:', err.message));
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
  const addRoute = (route: DistributionRoute) => {
    setRoutesList((prev) => [route, ...prev]);
  };

  /**
   * 12. Add Product:
   */
  const addProduct = (product: ProductMaster) => {
    setProductsList((prev) => [product, ...prev]);
  };

  /**
   * 13. Add Quality Test:
   */
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
    addFarmer,
    recordFeedPurchase,
    recordFeedConsumption,
    restockPackaging,
    adjustInventory,
    addRoute,
    addProduct,
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
