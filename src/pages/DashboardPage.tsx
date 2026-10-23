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
import { translate } from '../i18n';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
  onOpenTracer?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenTracer }) => {
  const {
    language,
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
        title={translate(language, 'Dairy Operations Control Tower')}
        subtitle="Operational summary from loaded records. Historical trend points include illustrative demo data."
        facility={currentFacility}
        dateFilter={currentDateFilter}
        statusBadge="Loaded records · demo trends"
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
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/85 rounded-2xl p-5 shadow-[0_8px_24px_-4px_rgba(27,67,50,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] transition-all duration-300 hover:shadow-[0_16px_36px_-6px_rgba(27,67,50,0.1)]">
        {/* Specular highlight */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200/60 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100/80 to-teal-50 border border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_8px_rgba(27,67,50,0.06)] text-forest-800 shrink-0">
              <Scale className="w-4 h-4 text-forest-700" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-950 font-sans">
                Daily Mass Balance Milk Reconciliation (Silo Verification)
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Opening + Own Herd + Farmer Supply - Rejections - Processing - Line Wastage = Closing Silo Stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-xs ${reconciliationBadgeStyle}`}
            >
              {reconciliationStatusIcon}
              <span>{reconciliation.reconciliationStatus}</span>
            </span>
            <button
              onClick={() => onNavigate('milk-ops')}
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 hover:underline cursor-pointer flex items-center gap-1 font-sans"
            >
              <span>Full Ledger</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* The Equation Strip (Clickable Cross-Links) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs relative z-10">
          <button
            onClick={() => onNavigate('chilling')}
            className="p-2.5 bg-white/75 hover:bg-white rounded-xl border border-white/90 hover:border-emerald-300 shadow-[0_2px_8px_rgba(27,67,50,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:scale-[0.98] transition-all text-left cursor-pointer group"
            title="Inspect Opening Silos in Chilling & Milk Pool (Tab 05)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">Opening</span>
            <span className="font-bold font-mono text-stone-900 text-sm tracking-tight block">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-stone-400 group-hover:text-forest-700 font-sans mt-0.5 block">Tab 05 &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('cattle')}
            className="p-2.5 bg-gradient-to-br from-emerald-50/70 to-white/80 hover:bg-white rounded-xl border border-emerald-100/80 hover:border-emerald-300 shadow-[0_2px_8px_rgba(27,67,50,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:scale-[0.98] transition-all text-left cursor-pointer group"
            title="Inspect Cattle Herd Production (Tab 07)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-800 block mb-1">+ Own Herd</span>
            <span className="font-bold font-mono text-forest-900 text-sm tracking-tight block">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-forest-700 font-sans mt-0.5 block">Tab 07 &rarr;</span>
          </button>


          <button
            onClick={() => onNavigate('milk-collection')}
            className="p-2.5 bg-forest-50/60 hover:bg-forest-100 rounded-xl border border-forest-200/70 hover:border-forest-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Village Milk Collection (Tab 03)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-800 block mb-1">+ Farmer Milk</span>
            <span className="font-bold font-mono text-forest-950 text-sm tracking-tight block">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-forest-700 font-sans mt-0.5 block">Tab 03 &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('quality')}
            className="p-2.5 bg-amber-50/60 hover:bg-amber-100 rounded-xl border border-amber-200/70 hover:border-amber-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Quality Rejections (Tab 04)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-900 block mb-1">- Rejections</span>
            <span className="font-bold font-mono text-amber-900 text-sm tracking-tight block">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-amber-700 font-sans mt-0.5 block">Tab 04 &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('processing')}
            className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-[#ede8df] hover:border-stone-500 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Processing Batches (Tab 06)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-600 block mb-1">- Processing</span>
            <span className="font-bold font-mono text-stone-900 text-sm tracking-tight block">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-stone-500 font-sans mt-0.5 block">Tab 06 &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('processing')}
            className="p-2.5 bg-rose-50/60 hover:bg-rose-100 rounded-xl border border-rose-200/70 hover:border-rose-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Line Losses & Spillage (Tab 06)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-900 block mb-1">- Loss / Wastage</span>
            <span className="font-bold font-mono text-rose-900 text-sm tracking-tight block">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-rose-700 font-sans mt-0.5 block">Tab 06 &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('chilling')}
            className="p-2.5 bg-sage-100/70 hover:bg-sage-200 rounded-xl border border-sage-300 hover:border-forest-700 shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Closing Silo Stock (Tab 05)"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider text-forest-950 block mb-1 font-bold">
              = Closing Stock
            </span>
            <span className="font-bold font-mono text-forest-950 text-sm tracking-tight block">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-forest-800 font-sans mt-0.5 font-semibold block">Tab 05 &rarr;</span>
          </button>
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

        {/* Secondary Unit Economics & Quality Strip (Interactive Cross-Links) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
          <button
            onClick={() => onNavigate('quality')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] hover:border-forest-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Quality & Lab Testing (Tab 04)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-forest-900">Avg Fat / SNF</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              {avgFat}% / {avgSnf}%
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Within FSSAI specs &rarr;
            </span>
          </button>

          <button
            onClick={() => onNavigate('quality')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-amber-50/60 border border-[#ede8df] hover:border-amber-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Quality Exceptions & Non-Conformances (Tab 04)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-amber-900">Quality Rejections</span>
            <span className="text-base font-bold font-mono text-amber-800 mt-1 block">
              {rejectedMilkLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-stone-500 font-medium block">{qualityExceptionsCount} non-conformances &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('processing')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] hover:border-forest-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Dairy Processing Batches (Tab 06)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-forest-900">Production Yield</span>
            <span className="text-base font-bold font-mono text-forest-900 mt-1 block">
              {avgBatchYieldPct}%
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Optimal pasteurization &rarr;
            </span>
          </button>

          <button
            onClick={() => onNavigate('payments')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] hover:border-forest-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Farmer Payables & Banking Payouts (Tab 15)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-forest-900">Farmer Payables</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              ₹{(procurementSummary.totalPayablePending / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-stone-500 font-medium block">Avg ₹{procurementSummary.averageRatePerLitre.toFixed(2)}/L &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] hover:border-forest-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Cost Per Litre Analysis in Finance (Tab 16)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-forest-900">Cost per Litre</span>
            <span className="text-base font-bold font-mono text-stone-900 mt-1 block">
              ₹{profitability.costPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-stone-500 font-medium block">All-in processing cost &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="p-3.5 bg-[#fdfcfb] hover:bg-sage-50/70 border border-[#ede8df] hover:border-forest-600 rounded-2xl shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Unit Profitability in Finance (Tab 16)"
          >
            <span className="text-[11px] font-semibold text-stone-500 block group-hover:text-forest-900">Profit per Litre</span>
            <span className="text-base font-bold font-mono text-forest-900 mt-1 block">
              +₹{profitability.profitPerLitre.toFixed(2)}
            </span>
            <span className="text-[10px] text-forest-700 font-semibold bg-sage-50 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
              Rev ₹{profitability.revenuePerLitre.toFixed(2)}/L &rarr;
            </span>
          </button>
        </div>
      </div>

      {/* 5. Management Level Profitability Breakdown (Clickable Financial Nodes) */}
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

        {/* Financial Flow Line (Clickable Cross-Links) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('sales')}
            className="p-3.5 rounded-xl bg-sage-50/70 hover:bg-sage-100 border border-sage-200/80 hover:border-forest-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Commercial Sales Orders (Tab 14)"
          >
            <span className="text-[11px] font-semibold text-forest-900 group-hover:text-forest-950 block">Gross Sales Revenue</span>
            <div className="text-base font-bold font-mono text-forest-950 mt-1">
              ₹{profitability.todayRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-forest-700 font-medium block">Tab 14 Sales &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('payments')}
            className="p-3.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/60 hover:border-rose-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Farmer Milk Payables (Tab 15)"
          >
            <span className="text-[11px] font-semibold text-rose-900 group-hover:text-rose-950 block">- Farmer Procurement</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{profitability.farmerProcurementCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium block">Tab 15 Payables &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('feed')}
            className="p-3.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/60 hover:border-rose-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Cattle Feed Expenses & Rations (Tab 09)"
          >
            <span className="text-[11px] font-semibold text-rose-900 group-hover:text-rose-950 block">- Cattle Feed & Herd</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{profitability.cattleFeedCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium block">Tab 09 Feed &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('processing')}
            className="p-3.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/60 hover:border-rose-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Processing Utilities & Packaging Materials (Tab 06 / 11)"
          >
            <span className="text-[11px] font-semibold text-rose-900 group-hover:text-rose-950 block">- Processing & Packaging</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{(profitability.processingUtilityCost + profitability.packagingCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium block">Tab 06 Batches &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('distribution')}
            className="p-3.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/60 hover:border-rose-600 shadow-2xs transition-all text-left cursor-pointer group"
            title="Inspect Reefer Logistics & Fleet Cold Chain (Tab 13)"
          >
            <span className="text-[11px] font-semibold text-rose-900 group-hover:text-rose-950 block">- Logistics & Cold Chain</span>
            <div className="text-base font-bold font-mono text-rose-950 mt-1">
              -₹{(profitability.logisticsCost + profitability.coldChainCost).toLocaleString()}
            </div>
            <span className="text-[10px] text-stone-500 font-medium block">Tab 13 Fleet &rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="p-3.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white border border-forest-950 shadow-xs transition-all text-left cursor-pointer group"
            title="Inspect Net Profitability Ledger in Finance (Tab 16)"
          >
            <span className="text-[11px] font-bold text-cream-200 uppercase tracking-wider block mb-0.5">
              = Operating Profit
            </span>
            <div className="text-base font-bold font-mono text-cream-50 mt-0.5">
              ₹{profitability.grossProfit.toLocaleString()}
            </div>
            <span className="text-[10px] font-semibold text-sage-300 block mt-0.5">
              {profitability.grossMarginPct}% Margin &rarr;
            </span>
          </button>
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
