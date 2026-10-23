import React, { useEffect, useState } from 'react';
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
} from './types/dairy';
import { INITIAL_FEED_FORMULAS } from './data/mockDairyData';

import { DairyERPProvider, useDairyERP } from './context/DairyERPContext';
import { api } from './services/api';
import { translate } from './i18n';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickCollectionModal } from './components/operations/QuickCollectionModal';
import { MobileFieldView } from './components/operations/MobileFieldView';
import { MilkMoneyTracerModal } from './components/operations/MilkMoneyTracerModal';
import { AuditLogDrawer } from './components/operations/AuditLogDrawer';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ControlTowerPage } from './pages/ControlTowerPage';
import { MilkOperationsPage } from './pages/MilkOperationsPage';
import { CattleManagementPage } from './pages/CattleManagementPage';
import { FarmerManagementPage } from './pages/FarmerManagementPage';
import { FeedManagementPage } from './pages/FeedManagementPage';
import { MilkCollectionPage } from './pages/MilkCollectionPage';
import { QualityManagementPage } from './pages/QualityManagementPage';
import { ChillingMilkPoolPage } from './pages/ChillingMilkPoolPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ProductManagementPage } from './pages/ProductManagementPage';
import { PackagingManagementPage } from './pages/PackagingManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { DistributionPage } from './pages/DistributionPage';
import { SalesPage } from './pages/SalesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { FinanceProfitabilityPage } from './pages/FinanceProfitabilityPage';
import { ReportsPage } from './pages/ReportsPage';
import { AIIntelligencePage } from './pages/AIIntelligencePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginScreen } from './pages/LoginScreen';

import {
  LayoutDashboard,
  Radio,
  Milk,
  Boxes,
  Users,
  Scale,
  LogOut,
  Smartphone,
  GitFork,
  FileClock,
  ShieldAlert,
} from 'lucide-react';

const ROLE_ALLOWED_MODULES: Record<Role, string[]> = {
  'CEO': ['dashboard', 'control-tower', 'milk-ops', 'cattle', 'farmers', 'feed', 'milk-collection', 'quality', 'chilling', 'processing', 'products', 'packaging', 'inventory', 'distribution', 'sales', 'payments', 'finance', 'reports', 'ai-intelligence', 'settings'],
  'COO': ['dashboard', 'control-tower', 'milk-ops', 'cattle', 'farmers', 'feed', 'milk-collection', 'quality', 'chilling', 'processing', 'products', 'packaging', 'inventory', 'distribution', 'sales', 'payments', 'finance', 'reports', 'ai-intelligence', 'settings'],
  'Operations Manager': ['dashboard', 'control-tower', 'milk-ops', 'cattle', 'farmers', 'feed', 'milk-collection', 'quality', 'chilling', 'processing', 'products', 'packaging', 'inventory', 'distribution', 'sales', 'payments', 'finance', 'reports', 'ai-intelligence', 'settings'],
  'Admin': ['dashboard', 'control-tower', 'milk-ops', 'cattle', 'farmers', 'feed', 'milk-collection', 'quality', 'chilling', 'processing', 'products', 'packaging', 'inventory', 'distribution', 'sales', 'payments', 'finance', 'reports', 'ai-intelligence', 'settings'],
  'Plant Manager': ['dashboard', 'milk-ops', 'chilling', 'processing', 'products', 'packaging', 'inventory', 'quality', 'control-tower', 'reports', 'settings'],
  'Procurement Manager': ['dashboard', 'milk-ops', 'farmers', 'milk-collection', 'quality', 'cattle', 'feed', 'payments', 'reports'],
  'Finance Manager': ['dashboard', 'payments', 'finance', 'sales', 'reports', 'farmers', 'settings'],
  'Field Staff': ['milk-collection', 'farmers', 'quality'],
};

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickCollectionOpen, setIsQuickCollectionOpen] = useState(false);
  const [isMobileFieldOpen, setIsMobileFieldOpen] = useState(false);
  const [isTracerOpen, setIsTracerOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Unified Central ERP State & Engine
  const {
    currentRole,
    setCurrentRole,
    language,
    setLanguage,
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
    transferMilkBetweenTanks,
    dismissAlert,
    toasts,
    dismissToast,
  } = useDairyERP();

  useEffect(() => {
    let active = true;
    localStorage.removeItem('dairy_erp_auth');
    localStorage.removeItem('dairy_erp_role');

    api.auth.getMe()
      .then((session) => {
        if (!active) return;
        const role = session.user?.role;
        if (!session.success || typeof role !== 'string' || !Object.prototype.hasOwnProperty.call(ROLE_ALLOWED_MODULES, role)) {
          throw new Error('No valid server session is active.');
        }
        setCurrentRole(role as Role);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!active) return;
        setIsAuthenticated(false);
        void api.auth.logout().catch(() => undefined);
      })
      .finally(() => {
        if (active) setIsSessionReady(true);
      });

    return () => { active = false; };
  }, [setCurrentRole]);

  // Search navigation helper
  const handleSelectSearchResult = (moduleName: string, itemId?: string) => {
    setCurrentModule(moduleName);
    setSelectedItemId(itemId);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await api.auth.logout();
      if (!response.success) throw new Error('The server did not confirm logout.');
      setIsAuthenticated(false);
      localStorage.removeItem('dairy_erp_auth');
      localStorage.removeItem('dairy_erp_role');
      setCurrentRole('Operations Manager');
      setCurrentModule('dashboard');
    } catch {
      setLogoutError(translate(language, 'Could not end the server session. Reconnect and try again.'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = (role: Role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('dairyos:authenticated'));
  };

  const allowRoleSwitch = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true';
  const handleRoleSwitch = async (role: Role) => {
    if (!allowRoleSwitch) return;
    try {
      const session = await api.auth.demoSwitch(role);
      if (session.success && session.user?.role && Object.prototype.hasOwnProperty.call(ROLE_ALLOWED_MODULES, session.user.role)) {
        setCurrentRole(session.user.role as Role);
        window.dispatchEvent(new Event('dairyos:authenticated'));
      }
    } catch (error) {
      console.warn('Development demo role switch failed:', error);
    }
  };

  if (!isSessionReady) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-sm text-stone-600">Checking secure session…</div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col antialiased relative selection:bg-emerald-100 selection:text-forest-900">
      {/* 3D Ambient Mesh Lighting Blobs (visible through glassmorphic panels) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-[460px] h-[460px] rounded-full bg-amber-300/15 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-[580px] h-[580px] rounded-full bg-teal-300/15 blur-[140px]" />
      </div>

      {/* Top Global Demo Environment Banner */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/60 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono select-none text-stone-600 shadow-[0_1px_4px_rgba(27,67,50,0.02)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_8px_#059669]" />
          <span className="text-forest-900 font-bold hidden sm:inline">DAIRYOS OPERATIONS WORKSPACE</span>
          <span className="text-forest-900 font-bold sm:hidden">DairyOS</span>
          <span className="text-stone-500 hidden sm:inline">
            &bull; Collection, quality, chilling, sales, and payable records
          </span>
        </div>
        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            aria-label="Switch language / भाषा बदलें"
            className="rounded-lg border border-[#ede8df] bg-white/70 px-2 py-1 text-[10px] font-sans font-semibold text-forest-900 hover:bg-sage-50"
          >
            English | हिन्दी
          </button>
          <span className="text-stone-300 hidden md:inline">|</span>

          <button
            onClick={() => setIsTracerOpen(true)}
            className="hidden md:flex text-forest-800 hover:text-forest-950 hover:underline items-center gap-1 cursor-pointer font-sans font-medium"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Trace Flow</span>
          </button>
          <span className="text-stone-300 hidden md:inline">|</span>
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="hidden md:flex text-stone-600 hover:text-stone-900 items-center gap-1 cursor-pointer font-sans"
          >
            <FileClock className="w-3.5 h-3.5 text-stone-500" />
            <span>Audit Trail</span>
          </button>
          <span className="text-stone-300 hidden md:inline">|</span>
          <button
            onClick={() => setIsMobileFieldOpen(true)}
            className="hidden md:flex text-forest-800 hover:text-forest-950 hover:underline items-center gap-1 cursor-pointer font-sans font-medium"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Field Touch Mode</span>
          </button>
          <span className="text-stone-300 hidden md:inline">|</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer font-sans"
          >
            <LogOut className="w-3 h-3" />
            <span>{isLoggingOut ? (language === 'hi' ? 'बाहर जा रहे हैं…' : 'Signing out…') : (language === 'hi' ? 'साइन आउट' : 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {logoutError && (
        <div role="alert" className="fixed right-4 top-16 z-50 max-w-sm rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-sans text-rose-800 shadow-lg">
          {logoutError}
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(id) => {
            setCurrentModule(id);
            setSelectedItemId(undefined);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {/* Top Bar */}
          <Topbar
            currentRole={currentRole}
            onChangeRole={handleRoleSwitch}
            allowRoleSwitch={allowRoleSwitch}
            currentFacility={currentFacility}
            onChangeFacility={setCurrentFacility}
            currentDateFilter={currentDateFilter}
            onChangeDateFilter={setCurrentDateFilter}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenQuickCollection={() => setIsQuickCollectionOpen(true)}
            onOpenMobileField={() => setIsMobileFieldOpen(true)}
            onOpenTracer={() => setIsTracerOpen(true)}
            onOpenAudit={() => setIsAuditDrawerOpen(true)}
            alerts={alerts}
            onOpenAlertModule={(mod) => setCurrentModule(mod)}
          />

          {/* Module Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
            {!ROLE_ALLOWED_MODULES[currentRole]?.includes(currentModule) ? (
              <div className="p-8 bg-white border border-[#ede8df] rounded-2xl text-center max-w-lg mx-auto my-12 space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-forest-950 font-sans">Role-Based Access Control (RBAC) Notice</h2>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Your current session role <strong className="text-forest-900 font-mono font-bold">{currentRole}</strong> is restricted from accessing the <strong className="text-forest-950 font-mono font-bold">{currentModule}</strong> module under organizational food safety and audit guidelines.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentModule(ROLE_ALLOWED_MODULES[currentRole]?.[0] || 'milk-collection')}
                    className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Return to Permitted View
                  </button>
                </div>
              </div>
            ) : (
              <>
            {currentModule === 'dashboard' && (
              <DashboardPage
                onNavigate={(mod) => setCurrentModule(mod)}
                onOpenTracer={() => setIsTracerOpen(true)}
              />
            )}

            {currentModule === 'control-tower' && (
              <ControlTowerPage
                onNavigate={(mod) => setCurrentModule(mod)}
                onOpenTracer={() => setIsTracerOpen(true)}
              />
            )}

            {currentModule === 'milk-ops' && <MilkOperationsPage />}

            {currentModule === 'cattle' && (
              <CattleManagementPage
                cattleList={cattleList}
                onAddCattle={addCattle}
                selectedCattleId={selectedItemId}
              />
            )}

            {currentModule === 'farmers' && (
              <FarmerManagementPage
                farmers={farmersList}
                onAddFarmer={addFarmer}
                selectedFarmerId={selectedItemId}
              />
            )}

            {currentModule === 'feed' && (
              <FeedManagementPage
                feeds={feedsList}
                formulas={INITIAL_FEED_FORMULAS}
                onAddPurchase={recordFeedPurchase}
                onRecordConsumption={recordFeedConsumption}
              />
            )}

            {currentModule === 'milk-collection' && (
              <MilkCollectionPage
                collections={collectionsList}
                farmers={farmersList}
                onAddCollection={recordMilkCollection}
                onOpenMobileView={() => setIsMobileFieldOpen(true)}
              />
            )}

            {currentModule === 'quality' && (
              <QualityManagementPage
                tests={qualityTestsList}
                onAddTest={addQualityTest}
              />
            )}

            {currentModule === 'chilling' && (
              <ChillingMilkPoolPage
                tanks={tanksList}
                reconciliation={reconciliation}
                onTransferMilk={transferMilkBetweenTanks}
              />
            )}

            {currentModule === 'processing' && (
              <ProcessingPage
                batches={batchesList}
                onCreateBatch={launchProcessingBatch}
              />
            )}

            {currentModule === 'products' && (
              <ProductManagementPage
                products={productsList}
                onAddProduct={addProduct}
                selectedProductId={selectedItemId}
              />
            )}

            {currentModule === 'packaging' && (
              <PackagingManagementPage
                packaging={packagingList}
                onAddStock={restockPackaging}
              />
            )}

            {currentModule === 'inventory' && (
              <InventoryPage
                inventory={inventoryList}
                onAdjustStock={adjustInventory}
              />
            )}

            {currentModule === 'distribution' && (
              <DistributionPage
                routes={routesList}
                onAddRoute={addRoute}
              />
            )}

            {currentModule === 'sales' && (
              <SalesPage
                orders={salesOrdersList}
                onAddOrder={recordSalesOrder}
              />
            )}

            {currentModule === 'payments' && (
              <PaymentsPage
                payments={paymentsList}
                onAddPayment={recordPayment}
              />
            )}

            {currentModule === 'finance' && <FinanceProfitabilityPage />}

            {currentModule === 'reports' && <ReportsPage />}

            {currentModule === 'ai-intelligence' && <AIIntelligencePage />}

            {currentModule === 'settings' && <SettingsPage />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[10px] text-slate-600 shadow-lg">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            currentModule === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentModule('milk-collection')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            currentModule === 'milk-collection' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Collection</span>
        </button>
        <button
          onClick={() => setIsMobileFieldOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-emerald-800 font-bold cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center -mt-3 shadow-md text-white">
            <Smartphone className="w-4 h-4" />
          </div>
          <span>Field Mode</span>
        </button>
        <button
          onClick={() => setCurrentModule('cattle')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            currentModule === 'cattle' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Cattle</span>
        </button>
        <button
          onClick={() => setCurrentModule('control-tower')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer ${
            currentModule === 'control-tower' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Control</span>
        </button>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        cattle={cattleList}
        farmers={farmersList}
        products={productsList}
        batches={batchesList}
        routes={routesList}
        orders={salesOrdersList}
        onSelectResult={handleSelectSearchResult}
      />

      <QuickCollectionModal
        isOpen={isQuickCollectionOpen}
        onClose={() => setIsQuickCollectionOpen(false)}
        farmers={farmersList}
        onSave={recordMilkCollection}
      />

      {/* End-to-End Milk & Money Flow Tracer Modal */}
      <MilkMoneyTracerModal
        isOpen={isTracerOpen}
        onClose={() => setIsTracerOpen(false)}
        onNavigateModule={(mod) => setCurrentModule(mod)}
      />

      {/* Operational Audit Trail Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />

      {/* Mobile Field Touch Drawer Modal */}
      {isMobileFieldOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 cursor-pointer"
          onClick={() => setIsMobileFieldOpen(false)}
        >
          <div className="w-full max-w-md cursor-default" onClick={(e) => e.stopPropagation()}>
            <MobileFieldView
              farmers={farmersList}
              onSaveCollection={recordMilkCollection}
              onClose={() => setIsMobileFieldOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Interactive Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] text-stone-900 p-6">
          <div className="max-w-lg bg-white border border-[#ede8df] rounded-3xl p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-forest-950 font-sans">Application Exception Encountered</h2>
            <p className="text-xs text-stone-600 font-mono bg-cream-50/70 p-3 rounded-xl border border-[#ede8df] text-left overflow-x-auto">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <DairyERPProvider>
        <AppContent />
      </DairyERPProvider>
    </ErrorBoundary>
  );
}
