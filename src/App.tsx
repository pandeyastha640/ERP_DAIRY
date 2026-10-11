import React, { useState } from 'react';
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
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickCollectionModal } from './components/operations/QuickCollectionModal';
import { MobileFieldView } from './components/operations/MobileFieldView';
import { MilkMoneyTracerModal } from './components/operations/MilkMoneyTracerModal';
import { AuditLogDrawer } from './components/operations/AuditLogDrawer';

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
} from 'lucide-react';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dairy_erp_auth') === 'true';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  } = useDairyERP();

  // Search navigation helper
  const handleSelectSearchResult = (moduleName: string, itemId?: string) => {
    setCurrentModule(moduleName);
    setSelectedItemId(itemId);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dairy_erp_auth');
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={(role) => {
          setCurrentRole(role);
          setIsAuthenticated(true);
          localStorage.setItem('dairy_erp_auth', 'true');
          localStorage.setItem('dairy_erp_role', role);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Global Demo Environment Banner */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono select-none text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-emerald-800 font-semibold">CONNECTED DAIRY OPERATING SYSTEM</span>
          <span className="text-slate-500 hidden sm:inline">
            · Continuous Volumetric Mass Balance &amp; Real-time Margin Reconciliation Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTracerOpen(true)}
            className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer font-sans font-medium"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Trace Flow</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-sans"
          >
            <FileClock className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setIsMobileFieldOpen(true)}
            className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer font-sans font-medium"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Field Touch Mode</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-sans"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

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
            onChangeRole={setCurrentRole}
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="max-w-lg bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-center">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-300 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
