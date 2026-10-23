import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Role,
  Facility,
  DateFilter,
  Cattle,
  Farmer,
  FeedItem,
  MilkCollectionRecord,
  NewMilkCollection,
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
import { Language } from '../i18n';

interface DairyERPContextType {
  language: Language;
  setLanguage: (language: Language) => void;
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
  recordMilkCollection: (record: NewMilkCollection) => Promise<MilkCollectionRecord>;
  launchProcessingBatch: (batch: ProcessingBatch) => void;
  recordSalesOrder: (order: SalesOrder) => void;
  recordPayment: (txn: PaymentTransaction) => Promise<PaymentTransaction>;
  addCattle: (cow: Cattle) => void;
  recordCattleMilking: (entry: {
    cattleId: string;
    yieldLitres: number;
    shift?: 'Morning' | 'Evening';
    fat?: number;
    snf?: number;
  }) => void;
  addFarmer: (farmer: Omit<Farmer, 'id'>) => Promise<Farmer>;
  recordFeedPurchase: (item: { feedId: string; quantityKg: number; costPerKg: number }) => void;
  recordFeedConsumption: (item: { feedId: string; quantityKg: number }) => void;
  restockPackaging: (id: string, qty: number) => void;
  adjustInventory: (id: string, delta: number) => void;
  addRoute: (route: DistributionRoute) => void;
  addProduct: (product: ProductMaster) => void;
  addQualityTest: (test: QualityTestRecord) => void;
  transferMilkBetweenTanks: (sourceId: string, targetId: string, litres: number) => void;
  dismissAlert: (id: string) => void;

  // System Settings & Reset
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;

  // Global Interactive Toasts
  toasts: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title?: string; message: string }[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  dismissToast: (id: string) => void;
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

const STORAGE_PREFIX = 'dairy_erp_v3_';

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
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('dairy_language') === 'hi' ? 'hi' : 'en');
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

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title?: string; message: string }[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize state changes to localStorage
  useEffect(() => { localStorage.setItem('dairy_language', language); }, [language]);
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
    const syncBackend = () => api.checkHealth()
      .then(async () => {
        try {
          const [farmersRes, cattleRes, collectionsRes, tanksRes, batchesRes, salesRes, paymentsRes, qualityRes] = await Promise.all([
            api.farmers.getAll(),
            api.cattle.getAll(),
            api.collections.getAll(),
            api.chilling.getTanks(),
            api.processing.getBatches(),
            api.sales.getOrders(),
            api.payments.getAll(),
            api.quality.getAll(),
          ]);

          if (farmersRes?.success) {
            const persistedCollections = Array.isArray(collectionsRes?.data) ? collectionsRes.data : [];
            const today = new Date().toISOString().slice(0, 10);
            setFarmersList((farmersRes.data || []).map((dbF: any) => {
              const farmerCollections = persistedCollections.filter((collection: any) => collection.farmerId === dbF.farmerCode);
              const todaysCollections = farmerCollections.filter((collection: any) => collection.date === today);
              const quantityToday = (items: any[]) => items.reduce((sum, item) => sum + Number(item.quantityLitres || 0), 0);
              const average = (items: any[], key: 'fat' | 'snf') => items.length
                ? items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length
                : 0;
              const recentSupply = [...farmerCollections].slice(0, 6).map((item: any) => ({
                date: item.date,
                litres: Number(item.quantityLitres),
                fat: Number(item.fat),
                snf: Number(item.snf),
              }));
              const latestCollection = farmerCollections[0];
              return {
                id: dbF.farmerCode || dbF.id,
                name: dbF.name,
                village: dbF.village,
                contactNumber: dbF.contactNumber || '',
                cattleCount: Number(dbF.cattleCount) || 0,
                todayMilkL: quantityToday(todaysCollections),
                morningMilkL: quantityToday(todaysCollections.filter((item: any) => item.shift === 'Morning')),
                eveningMilkL: quantityToday(todaysCollections.filter((item: any) => item.shift === 'Evening')),
                avgFat: average(farmerCollections, 'fat'),
                avgSNF: average(farmerCollections, 'snf'),
                ratePerL: Number(latestCollection?.ratePerLitre) || 0,
                todayPayable: todaysCollections.reduce((sum: number, item: any) => sum + Number(item.payableAmount || 0), 0),
                status: (dbF.status || 'Active') as 'Active' | 'Inactive' | 'Under Review',
                bankAccount: dbF.bankAccount || '',
                joinedDate: typeof dbF.createdAt === 'string' ? dbF.createdAt.slice(0, 10) : '',
                demoPerformanceScore: 0,
                supplyHistory: recentSupply,
                paymentHistory: [],
              };
            }));
          }

          if (cattleRes?.data?.length) {
            setCattleList((prev) => {
              const prevMap = new Map(prev.map((c) => [c.tagNumber, c]));
              return cattleRes.data.map((dbC: any) => {
                const existing = prevMap.get(dbC.tagNumber);
                return {
                  id: dbC.id || dbC.tagNumber,
                  tagNumber: dbC.tagNumber,
                  breed: (dbC.breed || existing?.breed || 'Gir') as any,
                  ageYears: Number(dbC.ageYears) || 4,
                  lactation: Number(dbC.lactation) || 2,
                  lactationStage: (dbC.lactationStage || existing?.lactationStage || 'Mid') as any,
                  lastCalvingDate: existing?.lastCalvingDate || '2025-11-15',
                  milkYieldLPerDay: Number(dbC.milkYieldLPerDay) || 12.5,
                  feedCostPerDay: Number(dbC.feedCostPerDay) || 190,
                  health: (dbC.health || existing?.health || 'Healthy') as any,
                  status: (dbC.status || existing?.status || 'Milking') as any,
                  shedLocation: dbC.shedLocation || existing?.shedLocation || 'Shed A-Row 1',
                  dailyFeedKg: Number(dbC.dailyFeedKg) || 28.0,
                  vaccinations: existing?.vaccinations || [{ name: 'FMD', date: '2026-01-10', status: 'Completed' }],
                  veterinaryNotes: existing?.veterinaryNotes || 'Regular health check completed.',
                  historicalYields: existing?.historicalYields || [12, 13, 12.5, 11.8, 12.2, 13, 12.5],
                };
              });
            });
          }

          if (collectionsRes?.success) {
            setCollectionsList((collectionsRes.data || []).map((c: any) => ({
              id: c.id,
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
            })));
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

          if (batchesRes?.data?.length) {
            setBatchesList((prev) => {
              const prevMap = new Map(prev.map((b) => [b.batchId, b]));
              return batchesRes.data.map((b: any) => {
                const existing = prevMap.get(b.batchId);
                return {
                  id: b.id || b.batchId,
                  batchId: b.batchId,
                  date: b.date,
                  pasteurizerLine: b.pasteurizerLine,
                  inputMilkLitres: Number(b.inputMilkLitres),
                  inputFatPct: Number(b.inputFatPct),
                  inputSnfPct: Number(b.inputSnfPct),
                  yieldPercentage: Number(b.yieldPercentage),
                  wastageLitres: Number(b.wastageLitres),
                  processingCostTotal: Number(b.processingCostTotal),
                  status: (b.status || 'In Progress') as any,
                  startTime: b.startTime,
                  completionTime: b.completionTime,
                  operator: b.operator,
                  products: existing?.products || [],
                };
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

          if (qualityRes?.data?.length) {
            setQualityTestsList(qualityRes.data.map((q: any) => ({
              id: q.id,
              batchNumber: q.batchNumber,
              sourceType: q.sourceType,
              sourceName: q.sourceName,
              quantityLitres: q.quantityLitres,
              fat: q.fat,
              snf: q.snf,
              clr: q.clr,
              temperatureC: q.temperatureC,
              adulterationTest: q.adulterationTest,
              acidityPct: q.acidityPct,
              mbrtHours: q.mbrtHours,
              result: q.result,
              tester: q.tester,
              testTime: q.testTime,
            })));
          }
        } catch (e) {
          console.warn('Backend sync notice:', e);
        }
      })
      .catch(() => {
        // Backend not available, fallback seamlessly
      });

    syncBackend();
    window.addEventListener('dairyos:authenticated', syncBackend);

    // 2. Live SSE Real-Time Telemetry & Hardware Event Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/iot/stream');

      eventSource.addEventListener('NEW_COLLECTION', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const col = parsed.payload;
          if (col && col.collectionCode) {
            setCollectionsList((prev) => {
              if (prev.some((c) => c.collectionCode === col.collectionCode)) return prev;
              return [
                {
                  id: col.id || `COL-${Date.now()}`,
                  collectionCode: col.collectionCode,
                  farmerId: col.farmerId,
                  farmerName: col.farmerName,
                  date: col.date,
                  time: col.time,
                  shift: col.shift as 'Morning' | 'Evening',
                  centre: col.centre,
                  quantityLitres: col.quantityLitres,
                  fat: col.fat,
                  snf: col.snf,
                  temperatureC: col.temperatureC,
                  quality: col.quality as 'PASS' | 'WARNING' | 'FAIL',
                  ratePerLitre: col.ratePerLitre,
                  payableAmount: col.payableAmount,
                  testedBy: col.testedBy,
                },
                ...prev,
              ];
            });
          }
        } catch {}
      });

      eventSource.addEventListener('TANK_TELEMETRY', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const tank = parsed.payload;
          if (tank && (tank.tankCode || tank.id)) {
            const code = tank.tankCode || tank.id;
            setTanksList((prev) =>
              prev.map((t) => (t.id === code ? { ...t, ...tank } : t))
            );
          }
        } catch {}
      });
    } catch {}

    return () => {
      window.removeEventListener('dairyos:authenticated', syncBackend);
      if (eventSource) {
        eventSource.close();
      }
    };
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
      settings,
      currentDateFilter
    );
  }, [salesOrdersList, collectionsList, cattleList, batchesList, packagingList, routesList, reconciliation, settings, currentDateFilter]);

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
  const recordMilkCollection = async (record: NewMilkCollection): Promise<MilkCollectionRecord> => {
    // The server owns quality classification, pricing, payable rounding and the
    // atomic collection/payment/tank/audit mutation. Do not update UI state until
    // it confirms the transaction.
    const response = await api.collections.create({
      requestId: record.requestId || (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      farmerId: record.farmerId,
      date: record.date,
      shift: record.shift,
      centre: record.centre,
      quantityLitres: record.quantityLitres,
      fat: record.fat,
      snf: record.snf,
      temperatureC: record.temperatureC,
      testedBy: record.testedBy,
    });

    if (!response.success || !response.data) {
      throw new Error('The server did not confirm the milk collection. Please retry.');
    }

    const saved = response.data as MilkCollectionRecord;
    setCollectionsList((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);

    setFarmersList((prev) => prev.map((farmer) => {
      if (farmer.id !== saved.farmerId) return farmer;
      const shiftField = saved.shift === 'Morning' ? 'morningMilkL' : 'eveningMilkL';
      return {
        ...farmer,
        todayMilkL: +(farmer.todayMilkL + saved.quantityLitres).toFixed(1),
        [shiftField]: +(farmer[shiftField] + saved.quantityLitres).toFixed(1),
        todayPayable: farmer.todayPayable + saved.payableAmount,
        avgFat: saved.fat,
        avgSNF: saved.snf,
        ratePerL: saved.ratePerLitre,
        supplyHistory: [
          { date: saved.date, litres: saved.quantityLitres, fat: saved.fat, snf: saved.snf },
          ...farmer.supplyHistory,
        ],
      };
    }));

    if (saved.payableAmount > 0) {
      const pendingPayment: PaymentTransaction = {
        id: `PAY-${saved.id}`,
        transactionRef: `PENDING-${saved.collectionCode}`,
        recipientName: `${saved.farmerName} (${saved.farmerId})`,
        partyType: 'Farmer',
        milkLitres: saved.quantityLitres,
        amount: saved.payableAmount,
        paymentDate: `${saved.date} ${saved.time}`,
        paymentMethod: 'Direct Bank IMPS',
        status: 'Pending',
        notes: `${saved.shift} shift milk payable; no bank transfer has been made.`,
      };
      setPaymentsList((prev) => [pendingPayment, ...prev.filter((p) => p.id !== pendingPayment.id)]);
    }

    showToast(
      `Saved ${saved.quantityLitres} L for ${saved.farmerName}. Quality: ${saved.quality}; payable: ₹${saved.payableAmount.toLocaleString()}.`,
      'success',
      'Collection saved by server'
    );
    logAudit({
      module: 'Milk Collection',
      action: 'COLLECTION_RECORDED',
      recordId: saved.collectionCode,
      description: `Inward milk: ${saved.quantityLitres} L from ${saved.farmerName} (${saved.farmerId}) [${saved.quality}]`,
      financialImpact: `+₹${saved.payableAmount.toLocaleString()} payable generated`,
      milkImpactLitres: saved.quantityLitres,
      severity: saved.quality === 'FAIL' ? 'warning' : 'info',
    });
    return saved;
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

    showToast(`Commercial Order ${order.orderNumber} created for ${order.customerName}`, 'success', 'Order Invoiced');

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
  const recordPayment = async (txn: PaymentTransaction): Promise<PaymentTransaction> => {
    const response = await api.payments.create({
      transactionRef: txn.transactionRef,
      recipientName: txn.recipientName,
      partyType: txn.partyType,
      milkLitres: txn.milkLitres,
      amount: txn.amount,
      paymentDate: txn.paymentDate,
      paymentMethod: txn.paymentMethod,
      status: txn.status,
      notes: txn.notes,
    });
    if (!response.success || !response.data) {
      throw new Error('The server did not confirm the payment entry. Please retry.');
    }
    const saved = response.data as PaymentTransaction;
    setPaymentsList((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    showToast(
      `Payment entry for ₹${saved.amount.toLocaleString()} is ${saved.status.toLowerCase()}; no settlement was confirmed.`,
      'info',
      'Payment entry saved'
    );
    logAudit({
      module: 'Payments',
      action: 'PAYMENT_ENTRY_RECORDED',
      recordId: saved.transactionRef,
      description: `Recorded ${saved.status.toLowerCase()} payment entry for ${saved.recipientName} via ${saved.paymentMethod}`,
      financialImpact: 'No settlement confirmed',
      severity: 'info',
    });
    return saved;
  };

  /**
   * 5. Add Cattle Herd Member:
   */
  const addCattle = (cow: Cattle) => {
    setCattleList((prev) => [cow, ...prev]);
    showToast(`Enrolled ${cow.breed} (${cow.tagNumber}) in ${cow.shedLocation}`, 'success', 'Cattle Enrolled');
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
   * 5b. Record Daily Cattle Milking (Morning/Evening Parlour Intake):
   */
  const recordCattleMilking = ({
    cattleId,
    yieldLitres,
    shift = 'Morning',
    fat = 4.4,
    snf = 8.6,
  }: {
    cattleId: string;
    yieldLitres: number;
    shift?: 'Morning' | 'Evening';
    fat?: number;
    snf?: number;
  }) => {
    const cow = cattleList.find((c) => c.id === cattleId || c.tagNumber === cattleId);
    if (!cow) {
      showToast(`Cattle identifier ${cattleId} not found in active herd`, 'error');
      return;
    }

    const validLitres = Math.max(0, Number(yieldLitres) || 0);

    setCattleList((prev) =>
      prev.map((c) => {
        if (c.id === cow.id) {
          const oldHistory = Array.isArray(c.historicalYields) && c.historicalYields.length > 0
            ? c.historicalYields
            : [12, 13, 14];
          const newHistory = [...oldHistory.slice(-6), validLitres];
          return {
            ...c,
            milkYieldLPerDay: validLitres,
            status: validLitres > 0 ? 'Milking' : c.status,
            historicalYields: newHistory,
          };
        }
        return c;
      })
    );

    showToast(
      `Recorded ${validLitres} L (${shift}) for ${cow.id} (${cow.tagNumber})`,
      'success',
      'Milking Yield Recorded'
    );

    logAudit({
      module: 'Cattle Herd',
      action: 'MILKING_LOGGED',
      recordId: cow.id,
      description: `Daily parlour milking logged: ${validLitres} L (${shift} shift, ${fat}% Fat, ${snf}% SNF) for ${cow.id} (${cow.breed})`,
      milkImpactLitres: validLitres,
      severity: 'info',
    });
  };

  /**
   * 6. Add Farmer Producer:
   */
  const addFarmer = async (farmer: Omit<Farmer, 'id'>): Promise<Farmer> => {
    const response = await api.farmers.create({
      name: farmer.name,
      village: farmer.village,
      contactNumber: farmer.contactNumber,
      cattleCount: farmer.cattleCount,
      bankAccount: farmer.bankAccount,
      status: farmer.status,
    });
    if (!response.success || !response.data) {
      throw new Error('The server did not confirm farmer registration. Please retry.');
    }
    const saved = response.data;
    const persistedFarmer: Farmer = {
      ...farmer,
      id: saved.farmerCode,
      name: saved.name,
      village: saved.village,
      contactNumber: saved.contactNumber,
      cattleCount: saved.cattleCount,
      bankAccount: saved.bankAccount || '',
      status: saved.status,
      todayMilkL: 0,
      morningMilkL: 0,
      eveningMilkL: 0,
      avgFat: 0,
      avgSNF: 0,
      ratePerL: 0,
      todayPayable: 0,
      supplyHistory: [],
      paymentHistory: [],
    };
    setFarmersList((prev) => [persistedFarmer, ...prev.filter((item) => item.id !== persistedFarmer.id)]);
    showToast(`Registered producer ${persistedFarmer.name} (${persistedFarmer.village}).`, 'success', 'Farmer saved by server');
    logAudit({
      module: 'Farmers',
      action: 'FARMER_ENROLLED',
      recordId: persistedFarmer.id,
      description: `Registered producer ${persistedFarmer.name} (${persistedFarmer.village}) with ${persistedFarmer.cattleCount} animals`,
      severity: 'info',
    });
    return persistedFarmer;
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

  /**
   * 14. Inter-Tank Milk Transfer:
   */
  const transferMilkBetweenTanks = (sourceId: string, targetId: string, litres: number) => {
    setTanksList((prev) =>
      prev.map((t) => {
        if (t.id === sourceId || t.name === sourceId) {
          return { ...t, currentVolumeLitres: Math.max(0, t.currentVolumeLitres - litres) };
        }
        if (t.id === targetId || t.name === targetId) {
          return { ...t, currentVolumeLitres: Math.min(t.capacityLitres, t.currentVolumeLitres + litres) };
        }
        return t;
      })
    );

    logAudit({
      module: 'Cold Silos',
      action: 'INTER_TANK_TRANSFER',
      recordId: `XFR-${Date.now().toString().slice(-4)}`,
      description: `Transferred ${litres} L raw milk from ${sourceId} to ${targetId}`,
      milkImpactLitres: litres,
      severity: 'info',
    });

    api.chilling.transfer(sourceId, litres, targetId).catch((err) =>
      console.warn('Backend transfer sync notice:', err.message)
    );
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
    language,
    setLanguage,
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
    recordCattleMilking,
    addFarmer,
    recordFeedPurchase,
    recordFeedConsumption,
    restockPackaging,
    adjustInventory,
    addRoute,
    addProduct,
    addQualityTest,
    transferMilkBetweenTanks,
    dismissAlert,

    settings,
    updateSettings,
    resetAllData,

    toasts,
    showToast,
    dismissToast,
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
