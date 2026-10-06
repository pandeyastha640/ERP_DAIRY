import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { MilkFlowDiagram } from '../components/operations/MilkFlowDiagram';
import { AreaTrendChart, BarComparisonChart } from '../components/charts/Charts';
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  AlertCard,
} from '../components/common/DesignSystem';
import {
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Warehouse,
  Users,
  Filter,
  Factory,
  ShoppingCart,
  ShieldCheck,
  GitFork,
  FileClock,
  Plus,
  Scale,
  Package,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Coins,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
  onOpenTracer?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenTracer }) => {
  const {
    currentFacility,
    currentDateFilter,
    reconciliation,
    profitability,
    herdEconomics,
    procurementSummary,
    alerts,
    insights,
    batchesList,
    salesOrdersList,
    inventoryList,
    packagingList,
    qualityTestsList,
    dismissAlert,
  } = useDairyERP();

  const [activeKpiTab, setActiveKpiTab] = useState<'all' | 'milk' | 'finance' | 'quality'>('all');

  // Summary calculations derived from centralized context
  const totalMilkAvailable =
    reconciliation.openingStockLitres +
    reconciliation.ownProductionLitres +
    reconciliation.farmerProcurementLitres -
    reconciliation.qualityRejectedLitres;

  const totalFinishedGoodsUnits = salesOrdersList.reduce((acc, o) => acc + o.quantityUnits, 0);

  // Quality metrics
  const avgFat =
    qualityTestsList.length > 0
      ? (
          qualityTestsList.reduce((acc, q) => acc + q.fatPct, 0) / qualityTestsList.length
        ).toFixed(2)
      : '4.45';

  const avgSnf =
    qualityTestsList.length > 0
      ? (
          qualityTestsList.reduce((acc, q) => acc + q.snfPct, 0) / qualityTestsList.length
        ).toFixed(2)
      : '8.72';

  const rejectedMilkLitres = reconciliation.qualityRejectedLitres;
  const qualityExceptionsCount = qualityTestsList.filter(
    (q) => q.status === 'FAIL' || q.status === 'WARNING'
  ).length;

  // Inventory numbers
  const lowStockPackagingCount = packagingList.filter(
    (p) => p.currentStockUnits <= p.reorderLevelUnits
  ).length;

  const totalSoldLitres = batchesList.reduce((acc, b) => acc + b.inputMilkLitres * 0.92, 0);

  // Production efficiency
  const avgBatchYieldPct =
    batchesList.length > 0
      ? (
          batchesList.reduce((acc, b) => acc + (b.yieldEfficiencyPct || 98.2), 0) /
          batchesList.length
        ).toFixed(1)
      : '98.4';

  // Trend data: Inward pool vs Processed
  const trendData = [
    { label: '30 Sep', value: 4050, secondaryValue: 3780 },
    { label: '01 Oct', value: 4120, secondaryValue: 3820 },
    { label: '02 Oct', value: 4200, secondaryValue: 3890 },
    { label: '03 Oct', value: 4180, secondaryValue: 3860 },
    { label: '04 Oct', value: 4250, secondaryValue: 3910 },
    { label: '05 Oct', value: 4350, secondaryValue: 3900 },
    {
      label: 'Today',
      value: reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres,
      secondaryValue: reconciliation.processingConsumptionLitres,
    },
  ];

  // Own Cattle Milk vs Farmer Milk daily comparison
  const streamComparison = [
    { label: 'Wed', valueA: 1190, valueB: 2930 },
    { label: 'Thu', valueA: 1210, valueB: 2990 },
    { label: 'Fri', valueA: 1205, valueB: 2975 },
    { label: 'Sat', valueA: 1220, valueB: 3030 },
    { label: 'Sun', valueA: 1215, valueB: 3135 },
    { label: 'Mon', valueA: 1210, valueB: 3140 },
    {
      label: 'Today',
      valueA: reconciliation.ownProductionLitres,
      valueB: reconciliation.farmerProcurementLitres,
    },
  ];

  const reconciliationStatusIcon =
    reconciliation.reconciliationStatus === 'RECONCILED' ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
    ) : reconciliation.reconciliationStatus === 'VARIANCE DETECTED' ? (
      <AlertTriangle className="w-4 h-4 text-amber-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-rose-600" />
    );

  const reconciliationBadgeStyle =
    reconciliation.reconciliationStatus === 'RECONCILED'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : reconciliation.reconciliationStatus === 'VARIANCE DETECTED'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-800 border-rose-200';

  return (
    <PageContainer>
      {/* 1. Header with Actions */}
      <PageHeader
        title="Dairy Operations Control Tower"
        subtitle="Continuous mass-balance volume reconciliation and real-time margin tracking across cattle herd, procurement, processing, and outbound distribution."
        facility={currentFacility}
        dateFilter={currentDateFilter}
        statusBadge="Continuous Mass Balance Active"
        actions={
          <>
            {onOpenTracer && (
              <button
                onClick={onOpenTracer}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <GitFork className="w-3.5 h-3.5 text-emerald-700" />
                <span>Trace Milk & Money</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('control-tower')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Control Tower</span>
            </button>
            <button
              onClick={() => onNavigate('milk-ops')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Milk Operations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        }
      />

      {/* 2. Interactive Operational Milk Flow Pipeline */}
      <MilkFlowDiagram
        onSelectStage={(stage) => onNavigate(stage)}
        ownLitres={reconciliation.ownProductionLitres}
        farmerLitres={reconciliation.farmerProcurementLitres}
        poolLitres={reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres}
        processedLitres={reconciliation.processingConsumptionLitres}
        productUnits={totalFinishedGoodsUnits}
        salesRevenue={profitability.todayRevenue}
        profitAmount={profitability.grossProfit}
      />

      {/* 3. Centralized Mass Balance Milk Reconciliation Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 text-slate-700">
              <Scale className="w-4 h-4 text-emerald-700" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Daily Mass Balance Milk Reconciliation (Silo Verification)
              </h3>
              <p className="text-[11px] text-slate-500">
                Opening + Own Herd + Farmer Supply - Rejections - Processing - Line Wastage = Closing Silo Stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${reconciliationBadgeStyle}`}
            >
              {reconciliationStatusIcon}
              <span>{reconciliation.reconciliationStatus}</span>
            </span>
            <button
              onClick={() => onNavigate('milk-ops')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              Full Ledger &rarr;
            </button>
          </div>
        </div>

        {/* The Equation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Opening</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-[10px] uppercase font-mono text-emerald-800 block">+ Own Herd</span>
            <span className="font-bold font-mono text-emerald-800 text-sm">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-200">
            <span className="text-[10px] uppercase font-mono text-blue-800 block">+ Farmer Milk</span>
            <span className="font-bold font-mono text-blue-800 text-sm">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200">
            <span className="text-[10px] uppercase font-mono text-amber-800 block">- Rejections</span>
            <span className="font-bold font-mono text-amber-800 text-sm">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">- Processing</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-200">
            <span className="text-[10px] uppercase font-mono text-rose-800 block">- Loss / Wastage</span>
            <span className="font-bold font-mono text-rose-800 text-sm">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2 bg-emerald-100/60 rounded-lg border border-emerald-300">
            <span className="text-[10px] uppercase font-mono text-emerald-900 block font-semibold">
              = Closing Stock
            </span>
            <span className="font-bold font-mono text-emerald-900 text-sm">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </span>
          </div>
        </div>
      </div>

      {/* 4. Complete Connected KPI Grid: Milk, Quality, Production, Inventory, Finance, Procurement */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <SectionHeader
            title="Operational Performance & Financial Unit Economics"
            subtitle="Live numbers computed dynamically from the centralized ERP data model"
          />
          {/* Quick tab switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveKpiTab('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeKpiTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All KPIs
            </button>
            <button
              onClick={() => setActiveKpiTab('milk')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeKpiTab === 'milk'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Milk Flow
            </button>
            <button
              onClick={() => setActiveKpiTab('finance')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeKpiTab === 'finance'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Economics
            </button>
          </div>
        </div>

        {/* Grid of Key Connected Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Milk Metrics */}
          <MetricCard
            label="Own Herd Milk"
            value={reconciliation.ownProductionLitres.toLocaleString()}
            unit="L"
            trend="up"
            changePct={2.4}
            changeText={`${herdEconomics.totalMilkingCows} milking cows`}
            onClick={() => onNavigate('cattle')}
          />

          <MetricCard
            label="Farmer Supply"
            value={reconciliation.farmerProcurementLitres.toLocaleString()}
            unit="L"
            trend="up"
            changePct={1.2}
            changeText={`${procurementSummary.totalSuppliersToday} active farmers`}
            onClick={() => onNavigate('farmers')}
          />

          <MetricCard
            label="Total Available"
            value={totalMilkAvailable.toLocaleString()}
            unit="L"
            trend="up"
            changePct={1.8}
            changeText="In Silos + Inward"
            onClick={() => onNavigate('chilling')}
          />

          <MetricCard
            label="Milk Processed"
            value={reconciliation.processingConsumptionLitres.toLocaleString()}
            unit="L"
            trend="neutral"
            changePct={0.0}
            changeText={`${batchesList.length} batches executed`}
            onClick={() => onNavigate('processing')}
          />

          <MetricCard
            label="Finished Goods"
            value={totalFinishedGoodsUnits.toLocaleString()}
            unit="units"
            trend="up"
            changePct={3.1}
            changeText="Packaged inventory"
            onClick={() => onNavigate('inventory')}
          />

          <MetricCard
            label="Milk Wastage"
            value={reconciliation.spillageWastageLitres.toLocaleString()}
            unit="L"
            trend="down"
            isGoodWhenUp={false}
            changePct={-4.5}
            changeText="1.5% allowable loss"
            onClick={() => onNavigate('milk-ops')}
          />

          <MetricCard
            label="Closing Silo Stock"
            value={reconciliation.closingStockLitres.toLocaleString()}
            unit="L"
            trend="neutral"
            changePct={0.0}
            changeText="Cold buffer ready"
            onClick={() => onNavigate('chilling')}
          />

          <MetricCard
            label="Net Operating Profit"
            value={`₹${(profitability.grossProfit / 1000).toFixed(1)}k`}
            unit=""
            trend="up"
            changePct={profitability.grossMarginPct}
            changeText={`${profitability.grossMarginPct}% gross margin`}
            onClick={() => onNavigate('finance')}
          />
        </div>

        {/* Secondary Unit Economics & Quality Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Avg Fat / SNF</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              {avgFat}% / {avgSnf}%
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Within FSSAI specs</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Quality Rejections</span>
            <span className="text-base font-bold font-mono text-amber-700 mt-1 block">
              {rejectedMilkLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-slate-500">{qualityExceptionsCount} non-conformances</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Production Yield</span>
            <span className="text-base font-bold font-mono text-emerald-800 mt-1 block">
              {avgBatchYieldPct}%
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Optimal pasteurization</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Farmer Payables</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              ₹{(procurementSummary.totalPayablePending / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-slate-500">Avg ₹{procurementSummary.averageRatePerLitre.toFixed(2)}/L</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Cost per Litre</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
              ₹{profitability.costPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500">All-in processing cost</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Profit per Litre</span>
            <span className="text-base font-bold font-mono text-emerald-800 mt-1 block">
              +₹{profitability.profitPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Revenue ₹{profitability.revenuePerLitre.toFixed(2)}/L</span>
          </div>
        </div>
      </div>

      {/* 5. Management Level Profitability Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <span>Management Profitability Cascade & Cost Structure</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating contribution calculated by deducting procurement, feed, energy, packaging, cold chain, and logistics from realized revenue.
            </p>
          </div>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Financial Ledger & Analysis &rarr;
          </button>
        </div>

        {/* Financial Flow Line */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Gross Sales Revenue</span>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              ₹{profitability.todayRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-700">₹{profitability.revenuePerLitre.toFixed(2)}/L</span>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200">
            <span className="text-[11px] font-medium text-rose-800">- Farmer Procurement</span>
            <div className="text-base font-bold font-mono text-rose-900 mt-1">
              -₹{profitability.farmerProcurementCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">32 pourers @ ₹45/L</span>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200">
            <span className="text-[11px] font-medium text-rose-800">- Cattle Feed & Herd</span>
            <div className="text-base font-bold font-mono text-rose-900 mt-1">
              -₹{profitability.cattleFeedCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">TMR, silage & mineral</span>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200">
            <span className="text-[11px] font-medium text-rose-800">- Processing & Packaging</span>
            <div className="text-base font-bold font-mono text-rose-900 mt-1">
              -₹{(profitability.processingUtilityCost + profitability.packagingCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Steam, power, pouch film</span>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200">
            <span className="text-[11px] font-medium text-rose-800">- Logistics & Cold Chain</span>
            <div className="text-base font-bold font-mono text-rose-900 mt-1">
              -₹{(profitability.logisticsCost + profitability.coldChainCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Diesel, reefers & chilling</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300">
            <span className="text-[11px] font-bold text-emerald-900">= Operating Profit</span>
            <div className="text-base font-bold font-mono text-emerald-900 mt-1">
              ₹{profitability.grossProfit.toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-emerald-800">
              {profitability.grossMarginPct}% Margin (+₹{profitability.profitPerLitre.toFixed(2)}/L)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Operations Attention & AI Operations Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Attention Alerts */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                What Needs Attention Today?
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {alerts.length} Active Alerts
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                All operations running within optimal tolerance.
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  title={alert.title}
                  description={alert.description}
                  priority={alert.priority}
                  timestamp={alert.timestamp}
                  targetModule={alert.targetModule}
                  onNavigate={onNavigate}
                  onDismiss={dismissAlert}
                />
              ))
            )}
          </div>
        </div>

        {/* AI Operations Intelligence */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                AI Operations Intelligence
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
              Predictive Insights
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{insight.title}</span>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {insight.metricImpact}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{insight.insight}</p>
                <div className="text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">Root Cause: </span>
                  {insight.whyItMatters}
                </div>
                <div className="text-[11px] text-emerald-900 bg-emerald-50/70 border border-emerald-200 rounded p-2 mt-1">
                  <span className="font-semibold">Recommended SOP Action: </span>
                  {insight.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Dual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream 1 vs Stream 2 Daily Comparison */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Own Cattle Milk vs Farmer Procurement
              </h3>
              <p className="text-xs text-slate-500">
                Dual stream analytics tracked independently prior to cold pool blending
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {(
                reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres
              ).toLocaleString()}{' '}
              L Total Inward
            </span>
          </div>
          <BarComparisonChart
            data={streamComparison}
            labelA="Own Cattle Milk"
            labelB="Farmer Procurement"
            colorA="#047857"
            colorB="#2563eb"
            unit="L"
          />
        </div>

        {/* Total Inward Pool vs Processed Outflow Trend */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Inward Collection vs Processing Outflow (7 Days)
              </h3>
              <p className="text-xs text-slate-500">
                Capacity balancing between silo holding and processing plant consumption
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {reconciliation.processingConsumptionLitres.toLocaleString()} L Processed Today
            </span>
          </div>
          <AreaTrendChart
            data={trendData}
            primaryColor="#047857"
            secondaryColor="#2563eb"
            primaryLabel="Milk Inward Pool"
            secondaryLabel="Milk Processed"
            unit="L"
          />
        </div>
      </div>
    </PageContainer>
  );
};
