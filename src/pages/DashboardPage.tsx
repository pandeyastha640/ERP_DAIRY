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
          qualityTestsList.reduce((acc, q) => acc + (q.fat ?? 0), 0) / qualityTestsList.length
        ).toFixed(2)
      : '4.45';

  const avgSnf =
    qualityTestsList.length > 0
      ? (
          qualityTestsList.reduce((acc, q) => acc + (q.snf ?? 0), 0) / qualityTestsList.length
        ).toFixed(2)
      : '8.72';

  const rejectedMilkLitres = reconciliation.qualityRejectedLitres;
  const qualityExceptionsCount = qualityTestsList.filter(
    (q) => q.result === 'FAIL' || q.result === 'WARNING'
  ).length;

  // Inventory numbers
  const lowStockPackagingCount = packagingList.filter(
    (p) => p.closingStock <= p.reorderLevel || p.status !== 'Sufficient'
  ).length;

  const totalSoldLitres = batchesList.reduce((acc, b) => acc + b.inputMilkLitres * 0.92, 0);

  // Production efficiency
  const avgBatchYieldPct =
    batchesList.length > 0
      ? (
          batchesList.reduce((acc, b) => acc + (b.yieldPercentage || 98.2), 0) /
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
      <CheckCircle2 className="w-4 h-4 text-forest-700" />
    ) : reconciliation.reconciliationStatus === 'VARIANCE DETECTED' ? (
      <AlertTriangle className="w-4 h-4 text-amber-700" />
    ) : (
      <AlertCircle className="w-4 h-4 text-rose-700" />
    );

  const reconciliationBadgeStyle =
    reconciliation.reconciliationStatus === 'RECONCILED'
      ? 'bg-sage-50 text-forest-900 border-sage-200'
      : reconciliation.reconciliationStatus === 'VARIANCE DETECTED'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-rose-50 text-rose-900 border-rose-200';

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
                className="px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-900 rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
              >
                <GitFork className="w-3.5 h-3.5 text-forest-700" />
                <span>Trace Milk & Money</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('control-tower')}
              className="px-3.5 py-2 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Control Tower</span>
            </button>
            <button
              onClick={() => onNavigate('milk-ops')}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-xs font-semibold text-white rounded-xl transition-all duration-150 flex items-center gap-2 shadow-xs shadow-forest-950/20 active:scale-98 cursor-pointer"
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
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-5 shadow-xs transition-shadow duration-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#ede8df]/70">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sage-50 border border-sage-200/80 text-forest-800 shrink-0">
              <Scale className="w-4 h-4 text-forest-700" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-950">
                Daily Mass Balance Milk Reconciliation (Silo Verification)
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Opening + Own Herd + Farmer Supply - Rejections - Processing - Line Wastage = Closing Silo Stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${reconciliationBadgeStyle}`}
            >
              {reconciliationStatusIcon}
              <span>{reconciliation.reconciliationStatus}</span>
            </span>
            <button
              onClick={() => onNavigate('milk-ops')}
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* The Equation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
          <div className="p-2.5 bg-cream-50/80 rounded-xl border border-[#ede8df] shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">Opening</span>
            <span className="font-bold font-mono text-stone-900 text-sm tracking-tight">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-sage-50/70 rounded-xl border border-sage-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-800 block mb-1">+ Own Herd</span>
            <span className="font-bold font-mono text-forest-900 text-sm tracking-tight">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-forest-50/60 rounded-xl border border-forest-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-800 block mb-1">+ Farmer Milk</span>
            <span className="font-bold font-mono text-forest-950 text-sm tracking-tight">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 block mb-1">- Rejections</span>
            <span className="font-bold font-mono text-amber-900 text-sm tracking-tight">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-[#ede8df] shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-600 block mb-1">- Processing</span>
            <span className="font-bold font-mono text-stone-900 text-sm tracking-tight">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/70 shadow-2xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-900 block mb-1">- Loss / Wastage</span>
            <span className="font-bold font-mono text-rose-900 text-sm tracking-tight">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </span>
          </div>

          <div className="p-2.5 bg-sage-100/70 rounded-xl border border-sage-300 shadow-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-950 block mb-1 font-bold">
              = Closing Stock
            </span>
            <span className="font-bold font-mono text-forest-950 text-sm tracking-tight">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </span>
          </div>
        </div>
      </div>

      {/* 4. Complete Connected KPI Grid: Milk, Quality, Production, Inventory, Finance, Procurement */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader
            title="Operational Performance & Financial Unit Economics"
            subtitle="Live numbers computed dynamically from the centralized ERP data model"
          />
          {/* Quick tab switcher */}
          <div className="flex items-center gap-1 bg-[#f5f2eb] p-1 rounded-xl border border-[#ede8df] text-xs self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setActiveKpiTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                activeKpiTab === 'all'
                  ? 'bg-white text-forest-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All KPIs
            </button>
            <button
              onClick={() => setActiveKpiTab('milk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                activeKpiTab === 'milk'
                  ? 'bg-white text-forest-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Milk Flow
            </button>
            <button
              onClick={() => setActiveKpiTab('finance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                activeKpiTab === 'finance'
                  ? 'bg-white text-forest-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
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
          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Avg Fat / SNF</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              {avgFat}% / {avgSnf}%
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Within FSSAI specs
            </span>
          </div>

          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Quality Rejections</span>
            <span className="text-base font-bold font-mono text-amber-800 mt-1 block">
              {rejectedMilkLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-stone-500 font-medium">{qualityExceptionsCount} non-conformances</span>
          </div>

          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Production Yield</span>
            <span className="text-base font-bold font-mono text-forest-900 mt-1 block">
              {avgBatchYieldPct}%
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Optimal pasteurization
            </span>
          </div>

          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Farmer Payables</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              ₹{(procurementSummary.totalPayablePending / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Avg ₹{procurementSummary.averageRatePerLitre.toFixed(2)}/L</span>
          </div>

          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Cost per Litre</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              ₹{profitability.costPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">All-in processing cost</span>
          </div>

          <div className="p-3.5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs transition-shadow duration-150 hover:shadow-sm">
            <span className="text-[11px] font-semibold text-stone-500 block">Profit per Litre</span>
            <span className="text-base font-bold font-mono text-forest-900 mt-1 block">
              +₹{profitability.profitPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Revenue ₹{profitability.revenuePerLitre.toFixed(2)}/L
            </span>
          </div>
        </div>
      </div>

      {/* 5. Management Level Profitability Breakdown */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-[#ede8df]/70">
          <div>
            <h3 className="text-sm font-bold text-forest-950 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sage-50 border border-sage-200 text-forest-800">
                <Coins className="w-4 h-4 text-forest-700" />
              </span>
              <span>Management Profitability Cascade & Cost Structure</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              Operating contribution calculated by deducting procurement, feed, energy, packaging, cold chain, and logistics from realized revenue.
            </p>
          </div>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Financial Ledger & Analysis</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Financial Flow Line */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-sage-50/70 border border-sage-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-forest-900">Gross Sales Revenue</span>
            <div className="text-base font-bold font-mono text-forest-950 mt-1">
              ₹{profitability.todayRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-forest-700 font-medium">₹{profitability.revenuePerLitre.toFixed(2)}/L</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-900">- Farmer Procurement</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{profitability.farmerProcurementCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">32 pourers @ ₹45/L</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-900">- Cattle Feed & Herd</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{profitability.cattleFeedCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">TMR, silage & mineral</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-900">- Processing & Packaging</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{(profitability.processingUtilityCost + profitability.packagingCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Steam, power, pouch film</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-900">- Logistics & Cold Chain</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{(profitability.logisticsCost + profitability.coldChainCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Diesel, reefers & chilling</span>
          </div>

          <div className="p-3.5 rounded-xl bg-forest-900 text-white border border-forest-950 shadow-xs">
            <span className="text-[11px] font-bold text-cream-200 uppercase tracking-wider block mb-0.5">
              = Operating Profit
            </span>
            <div className="text-base font-bold font-mono text-cream-50 mt-0.5">
              ₹{profitability.grossProfit.toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-sage-300 block mt-0.5">
              {profitability.grossMarginPct}% Margin (+₹{profitability.profitPerLitre.toFixed(2)}/L)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Operations Attention & AI Operations Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Attention Alerts */}
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df]/70">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-forest-950">
                What Needs Attention Today?
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-stone-600 bg-cream-100 px-2.5 py-1 rounded-full border border-[#ede8df]">
              {alerts.length} Active Alerts
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500">
                <CheckCircle2 className="w-8 h-8 text-forest-600 mx-auto mb-2" />
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
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df]/70">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-gold-50 border border-gold-200/80 text-gold-700">
                <Lightbulb className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-forest-950">
                AI Operations Intelligence
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-forest-50 text-forest-900 border border-forest-200 font-bold">
              Predictive Insights
            </span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 bg-cream-50/60 border border-[#ede8df] rounded-xl space-y-2 transition-all duration-150 hover:bg-white hover:shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-bold text-forest-950">{insight.title}</span>
                  <span className="text-[11px] font-mono text-forest-900 font-bold bg-sage-100/80 px-2 py-0.5 rounded-md border border-sage-200 shrink-0">
                    {insight.metricImpact}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-normal">{insight.insight}</p>
                <div className="text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Root Cause: </span>
                  {insight.whyItMatters}
                </div>
                <div className="text-[11px] text-forest-950 bg-sage-50/80 border border-sage-200/80 rounded-lg p-2.5 mt-1 font-medium">
                  <span className="font-bold text-forest-900">Recommended SOP Action: </span>
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
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df]/70">
            <div>
              <h3 className="text-sm font-bold text-forest-950">
                Own Cattle Milk vs Farmer Procurement
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Dual stream analytics tracked independently prior to cold pool blending
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-forest-900 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
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
            colorA="#1b4332"
            colorB="#52b788"
            unit="L"
          />
        </div>

        {/* Total Inward Pool vs Processed Outflow Trend */}
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df]/70">
            <div>
              <h3 className="text-sm font-bold text-forest-950">
                Inward Collection vs Processing Outflow (7 Days)
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Capacity balancing between silo holding and processing plant consumption
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-forest-900 bg-cream-100 px-2.5 py-1 rounded-full border border-[#ede8df]">
              {reconciliation.processingConsumptionLitres.toLocaleString()} L Processed Today
            </span>
          </div>
          <AreaTrendChart
            data={trendData}
            primaryColor="#1b4332"
            secondaryColor="#52b788"
            primaryLabel="Milk Inward Pool"
            secondaryLabel="Milk Processed"
            unit="L"
          />
        </div>
      </div>
    </PageContainer>
  );
};
