import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { AreaTrendChart, BarComparisonChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  DataTable,
} from '../components/common/DesignSystem';
import {
  Warehouse,
  Users,
  Snowflake,
  Factory,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Calendar,
  Filter,
  Milk,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const MilkOperationsPage: React.FC = () => {
  const {
    reconciliation,
    herdEconomics,
    procurementSummary,
    collectionsList,
    batchesList,
    salesOrdersList,
    currentFacility,
    currentDateFilter,
    cattleList,
    recordCattleMilking,
    setCurrentModule,
  } = useDairyERP();

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Own Milk' | 'Farmer Milk' | 'Milk Pool' | 'Processing'
  >('Overview');
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [centreFilter, setCentreFilter] = useState<
    'All' | 'Anand CC' | 'Borsad Chilling' | 'Nadiad Hub'
  >('All');

  // Daily Cow Milking Modal State (Farm Milking Shed)
  const [isParlourModalOpen, setIsParlourModalOpen] = useState(false);
  const [selectedCowId, setSelectedCowId] = useState(cattleList[0]?.id || 'COW-001');
  const [parlourShift, setParlourShift] = useState<'Morning' | 'Evening'>('Morning');
  const [parlourYield, setParlourYield] = useState('14.0');
  const [parlourFat, setParlourFat] = useState('4.4');
  const [parlourSnf, setParlourSnf] = useState('8.6');

  // Dynamic Shift Collections Breakdown
  const morningCollections = collectionsList.filter((c) => c.shift === 'Morning');
  const eveningCollections = collectionsList.filter((c) => c.shift === 'Evening');

  const morningFarmerL = Math.round(
    morningCollections.reduce((acc, c) => acc + c.quantityLitres, 0)
  );
  const eveningFarmerL = Math.round(
    eveningCollections.reduce((acc, c) => acc + c.quantityLitres, 0)
  );

  const morningOwnL = Math.round(reconciliation.ownProductionLitres * 0.52);
  const eveningOwnL = Math.round(reconciliation.ownProductionLitres - morningOwnL);

  const morningTotalL = morningFarmerL + morningOwnL;
  const eveningTotalL = eveningFarmerL + eveningOwnL;

  const totalInwardPool =
    reconciliation.openingStockLitres +
    reconciliation.ownProductionLitres +
    reconciliation.farmerProcurementLitres -
    reconciliation.qualityRejectedLitres;

  // Equivalent litres dispatched from sales
  const milkSoldEquivalentL = Math.round(
    salesOrdersList.reduce((acc, o) => {
      const multiplier = o.product.includes('500ml')
        ? 0.5
        : o.product.includes('Curd')
        ? 0.6
        : o.product.includes('Paneer')
        ? 4.5
        : 1.0;
      return acc + o.quantityUnits * multiplier;
    }, 0)
  );

  // Master Daily Reconciled Operational Dataset (30-day timeline with ISO Calendar Dates)
  const masterDailyTimeline = [
    { isoDate: '2026-09-08', label: '08 Sep', ownL: 1140, farmerL: 2710, processedL: 3600 },
    { isoDate: '2026-09-12', label: '12 Sep', ownL: 1160, farmerL: 2760, processedL: 3680 },
    { isoDate: '2026-09-16', label: '16 Sep', ownL: 1175, farmerL: 2815, processedL: 3720 },
    { isoDate: '2026-09-20', label: '20 Sep', ownL: 1190, farmerL: 2850, processedL: 3780 },
    { isoDate: '2026-09-24', label: '24 Sep', ownL: 1200, farmerL: 2910, processedL: 3830 },
    { isoDate: '2026-09-26', label: '26 Sep', ownL: 1195, farmerL: 2855, processedL: 3790 },
    { isoDate: '2026-09-28', label: '28 Sep', ownL: 1205, farmerL: 2895, processedL: 3820 },
    { isoDate: '2026-09-30', label: '30 Sep', ownL: 1215, farmerL: 2935, processedL: 3850 },
    { isoDate: '2026-10-01', label: '01 Oct', ownL: 1210, farmerL: 2910, processedL: 3820 },
    { isoDate: '2026-10-02', label: '02 Oct', ownL: 1220, farmerL: 2980, processedL: 3890 },
    { isoDate: '2026-10-03', label: '03 Oct', ownL: 1205, farmerL: 2975, processedL: 3860 },
    { isoDate: '2026-10-04', label: '04 Oct', ownL: 1230, farmerL: 3020, processedL: 3910 },
    { isoDate: '2026-10-05', label: '05 Oct', ownL: 1210, farmerL: 3140, processedL: 3900 },
    {
      isoDate: '2026-10-06',
      label: 'Today',
      ownL: reconciliation.ownProductionLitres,
      farmerL: reconciliation.farmerProcurementLitres,
      processedL: reconciliation.processingConsumptionLitres,
    },
  ];

  // Chart 1: Own vs Farmer Production Filter State (Supports Calendar Date Range)
  const [timeframeA, setTimeframeA] = useState<'7D' | '14D' | '30D' | 'Custom'>('7D');
  const [streamFilter, setStreamFilter] = useState<'All' | 'Own' | 'Farmer'>('All');
  const [calendarStartA, setCalendarStartA] = useState('2026-10-01');
  const [calendarEndA, setCalendarEndA] = useState('2026-10-06');

  // Chart 2: Inward vs Processing Filter State (Supports Calendar Date Range)
  const [timeframeB, setTimeframeB] = useState<'7D' | '14D' | '30D' | 'Custom'>('7D');
  const [trendMetricFilter, setTrendMetricFilter] = useState<'Both' | 'Inward' | 'Processing'>('Both');
  const [calendarStartB, setCalendarStartB] = useState('2026-10-01');
  const [calendarEndB, setCalendarEndB] = useState('2026-10-06');

  // Dynamic Dataset Computation for Chart 1
  let currentComparisonRaw = masterDailyTimeline;
  if (timeframeA === '7D') {
    currentComparisonRaw = masterDailyTimeline.slice(-7);
  } else if (timeframeA === '14D') {
    currentComparisonRaw = masterDailyTimeline.slice(-10);
  } else if (timeframeA === 'Custom') {
    const custom = masterDailyTimeline.filter(
      (d) => d.isoDate >= calendarStartA && d.isoDate <= calendarEndA
    );
    currentComparisonRaw = custom.length > 0 ? custom : masterDailyTimeline.slice(-7);
  }

  const filteredComparisonData = currentComparisonRaw.map((d) => ({
    label: d.label,
    valueA: streamFilter === 'Farmer' ? 0 : d.ownL,
    valueB: streamFilter === 'Own' ? 0 : d.farmerL,
  }));

  // Dynamic Dataset Computation for Chart 2
  let currentTrendRaw = masterDailyTimeline;
  if (timeframeB === '7D') {
    currentTrendRaw = masterDailyTimeline.slice(-7);
  } else if (timeframeB === '14D') {
    currentTrendRaw = masterDailyTimeline.slice(-10);
  } else if (timeframeB === 'Custom') {
    const custom = masterDailyTimeline.filter(
      (d) => d.isoDate >= calendarStartB && d.isoDate <= calendarEndB
    );
    currentTrendRaw = custom.length > 0 ? custom : masterDailyTimeline.slice(-7);
  }

  const filteredTrendData = currentTrendRaw.map((d) => {
    const inward = d.ownL + d.farmerL;
    if (trendMetricFilter === 'Inward') {
      return { label: d.label, value: inward };
    }
    if (trendMetricFilter === 'Processing') {
      return { label: d.label, value: d.processedL };
    }
    return { label: d.label, value: inward, secondaryValue: d.processedL };
  });

  return (
    <PageContainer>
      {/* 1. Page Header */}
      <PageHeader
        title="Milk Operations Command"
        subtitle="Central milk intake, pool balance, processing throughput and continuous volumetric reconciliation across all facilities."
        facility={currentFacility}
        dateFilter={currentDateFilter}
        statusBadge="Continuous Mass Balance Reconciled"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#fdfcfb] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-700 shadow-2xs">
              <span className="text-stone-500 font-medium">Shift:</span>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value as 'All' | 'Morning' | 'Evening')}
                className="bg-transparent font-bold outline-none text-forest-900 cursor-pointer"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#fdfcfb] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-700 shadow-2xs">
              <span className="text-stone-500 font-medium">Centre:</span>
              <select
                value={centreFilter}
                onChange={(e) =>
                  setCentreFilter(
                    e.target.value as 'All' | 'Anand CC' | 'Borsad Chilling' | 'Nadiad Hub'
                  )
                }
                className="bg-transparent font-bold outline-none text-forest-900 cursor-pointer"
              >
                <option value="All">All Centres</option>
                <option value="Anand CC">Anand CC</option>
                <option value="Borsad Chilling">Borsad Chilling</option>
                <option value="Nadiad Hub">Nadiad Hub</option>
              </select>
            </div>
          </div>
        }
      />

      {/* 2. Top 6 KPI Strip (Derived from Centralized Reconciliation - Clickable Deep-Links) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Own Herd Milk"
          value={reconciliation.ownProductionLitres.toLocaleString()}
          unit="L"
          trend="up"
          changePct={2.5}
          changeText={`${herdEconomics.totalMilkingCows} Milking Cows`}
          icon={<Warehouse className="w-4 h-4 text-forest-700" />}
          onClick={() => setCurrentModule('cattle')}
        />
        <MetricCard
          label="Farmer Procurement"
          value={reconciliation.farmerProcurementLitres.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.2}
          changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`}
          icon={<Users className="w-4 h-4 text-forest-800" />}
          onClick={() => setCurrentModule('milk-collection')}
        />
        <MetricCard
          label="Total Milk Pool"
          value={totalInwardPool.toLocaleString()}
          unit="L"
          trend="down"
          changePct={-1.5}
          changeText="Chilled in Silos"
          icon={<Snowflake className="w-4 h-4 text-stone-700" />}
          onClick={() => setCurrentModule('chilling')}
        />
        <MetricCard
          label="Milk Processed"
          value={reconciliation.processingConsumptionLitres.toLocaleString()}
          unit="L"
          trend="neutral"
          changePct={0.0}
          changeText={`${batchesList.length} Active Batches`}
          icon={<Factory className="w-4 h-4 text-amber-700" />}
          onClick={() => setCurrentModule('processing')}
        />
        <MetricCard
          label="Milk Equivalent Sold"
          value={milkSoldEquivalentL.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.7}
          changeText={`${salesOrdersList.length} Sales Orders`}
          icon={<ShoppingCart className="w-4 h-4 text-forest-700" />}
          onClick={() => setCurrentModule('sales')}
        />
        <MetricCard
          label="Wastage & Loss"
          value={reconciliation.spillageWastageLitres.toLocaleString()}
          unit="L"
          trend="down"
          isGoodWhenUp={false}
          changePct={-4.9}
          changeText={`${(
            (reconciliation.spillageWastageLitres / (totalInwardPool || 1)) *
            100
          ).toFixed(1)}% of Pool`}
          icon={<Trash2 className="w-4 h-4 text-rose-700" />}
          onClick={() => setCurrentModule('processing')}
        />
      </div>

      {/* 3. Central Milk Mass Balance Reconciliation Equation Strip (Interactive Navigation) */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-5 font-mono text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#ede8df]/70 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sage-50 border border-sage-200/80 text-forest-800">
              <Scale className="w-4 h-4 text-forest-700" />
            </span>
            <div>
              <span className="text-sm font-bold text-forest-950 font-sans block">
                Centralized Milk Mass Balance Reconciliation Ledger
              </span>
              <span className="text-[11px] text-stone-500 font-sans">
                Click any section below to immediately navigate to its source management module
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-forest-900 font-sans text-xs font-bold bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>Zero Unaccounted Variance (100% Reconciled)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <button
            onClick={() => setCurrentModule('chilling')}
            title="Inspect Opening Silos in Chilling & Milk Pool (Tab 05)"
            className="p-2.5 bg-cream-50/80 hover:bg-cream-100 rounded-xl border border-[#ede8df] hover:border-forest-600 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-stone-500 mb-1">
              <span>Opening Silos</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-forest-700 transition-opacity" />
            </div>
            <div className="font-bold text-stone-900 font-mono text-sm tracking-tight">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-stone-400 font-sans mt-0.5 group-hover:text-forest-700 flex items-center gap-0.5">
              <span>Tab 05 Silos</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('cattle')}
            title="Manage Herd in Cattle Herd (Tab 07)"
            className="p-2.5 bg-sage-50/70 hover:bg-sage-100 rounded-xl border border-sage-200/70 hover:border-forest-600 text-forest-900 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-forest-800 mb-1">
              <span>+ Own Herd</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-forest-700 transition-opacity" />
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-700/70 font-sans mt-0.5 group-hover:text-forest-900 flex items-center gap-0.5">
              <span>Tab 07 Herd</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('milk-collection')}
            title="View Inward Collection in Milk Collection (Tab 03)"
            className="p-2.5 bg-forest-50/60 hover:bg-forest-100/70 rounded-xl border border-forest-200/70 hover:border-forest-600 text-forest-950 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-forest-800 mb-1">
              <span>+ Farmer Inward</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-forest-700 transition-opacity" />
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-700/70 font-sans mt-0.5 group-hover:text-forest-900 flex items-center gap-0.5">
              <span>Tab 03 Inward</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('quality')}
            title="View QC Rejections in Quality Testing (Tab 04)"
            className="p-2.5 bg-amber-50/60 hover:bg-amber-100/70 rounded-xl border border-amber-200/70 hover:border-amber-600 text-amber-950 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-amber-900 mb-1">
              <span>- Rejections</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-amber-700 transition-opacity" />
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-amber-800/70 font-sans mt-0.5 group-hover:text-amber-950 flex items-center gap-0.5">
              <span>Tab 04 QC</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('processing')}
            title="View Processing Batches in Dairy Processing (Tab 06)"
            className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-[#ede8df] hover:border-stone-500 text-stone-800 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-stone-500 mb-1">
              <span>- Processing</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-stone-700 transition-opacity" />
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-stone-500 font-sans mt-0.5 group-hover:text-stone-800 flex items-center gap-0.5">
              <span>Tab 06 Batches</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('processing')}
            title="Inspect Line Losses in Dairy Processing (Tab 06)"
            className="p-2.5 bg-rose-50/60 hover:bg-rose-100/70 rounded-xl border border-rose-200/70 hover:border-rose-600 text-rose-950 shadow-2xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-rose-900 mb-1">
              <span>- Line Wastage</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-rose-700 transition-opacity" />
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-rose-700/70 font-sans mt-0.5 group-hover:text-rose-950 flex items-center gap-0.5">
              <span>Tab 06 Loss</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>

          <button
            onClick={() => setCurrentModule('chilling')}
            title="Inspect Closing Stock in Chilling & Milk Pool (Tab 05)"
            className="p-2.5 bg-sage-100/70 hover:bg-sage-200/80 rounded-xl border border-sage-300 hover:border-forest-700 text-forest-950 shadow-xs transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-forest-950 font-bold mb-1">
              <span>= Closing Silo</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-forest-800 transition-opacity" />
            </div>
            <div className="font-bold text-sm font-mono tracking-tight">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-800 font-sans mt-0.5 group-hover:text-forest-950 font-medium flex items-center gap-0.5">
              <span>Tab 05 Silos</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. Interactive Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f5f2eb] border border-[#ede8df] rounded-xl max-w-fit shadow-2xs">
        {(['Overview', 'Own Milk', 'Farmer Milk', 'Milk Pool', 'Processing'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-forest-950 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* 5. Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 1: Own Herd vs Farmer Procurement (3D Volumetric Bar Chart with Filters) */}
            <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-forest-950 flex items-center gap-2">
                      <span>Own Herd vs Farmer Procurement</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full">
                        3D Volumetric
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      Dual stream comparison demonstrating source ratio (
                      {(
                        (reconciliation.ownProductionLitres /
                          (reconciliation.ownProductionLitres +
                            reconciliation.farmerProcurementLitres || 1)) *
                        100
                      ).toFixed(1)}% Own vs {(
                        (reconciliation.farmerProcurementLitres /
                          (reconciliation.ownProductionLitres +
                            reconciliation.farmerProcurementLitres || 1)) *
                        100
                      ).toFixed(1)}% Farmer today)
                    </p>
                  </div>

                  {/* Filter Controls: Stream + Timeframe + Calendar Date Picker */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Stream Filter */}
                    <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs font-semibold">
                      <button
                        onClick={() => setStreamFilter('All')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          streamFilter === 'All'
                            ? 'bg-white text-forest-950 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setStreamFilter('Own')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          streamFilter === 'Own'
                            ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Own
                      </button>
                      <button
                        onClick={() => setStreamFilter('Farmer')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          streamFilter === 'Farmer'
                            ? 'bg-white text-amber-800 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Farmer
                      </button>
                    </div>

                    {/* Timeframe Presets */}
                    <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs font-semibold font-mono">
                      {(['7D', '14D', '30D'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            setTimeframeA(tf);
                            if (tf === '7D') {
                              setCalendarStartA('2026-10-01');
                              setCalendarEndA('2026-10-06');
                            } else if (tf === '14D') {
                              setCalendarStartA('2026-09-24');
                              setCalendarEndA('2026-10-06');
                            } else {
                              setCalendarStartA('2026-09-08');
                              setCalendarEndA('2026-10-06');
                            }
                          }}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            timeframeA === tf
                              ? 'bg-white text-forest-950 font-bold shadow-2xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Calendar Date Range Filter */}
                    <div className="flex items-center gap-1 bg-[#faf8f5] hover:bg-white border border-[#ede8df] focus-within:border-forest-600 rounded-xl px-2 py-1 text-xs shadow-2xs transition-all">
                      <Calendar className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <input
                        type="date"
                        value={calendarStartA}
                        onChange={(e) => {
                          setCalendarStartA(e.target.value);
                          setTimeframeA('Custom');
                        }}
                        className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer max-w-[105px]"
                        title="Calendar Start Date"
                      />
                      <span className="text-stone-400 font-mono text-[10px]">&rarr;</span>
                      <input
                        type="date"
                        value={calendarEndA}
                        onChange={(e) => {
                          setCalendarEndA(e.target.value);
                          setTimeframeA('Custom');
                        }}
                        className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer max-w-[105px]"
                        title="Calendar End Date"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Stream Badges */}
                <div className="flex items-center gap-2 mb-4 pt-1">
                  <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-semibold">
                    Own Herd: {reconciliation.ownProductionLitres.toLocaleString()} L
                  </span>
                  <span className="text-[11px] font-mono text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md font-semibold">
                    Farmer: {reconciliation.farmerProcurementLitres.toLocaleString()} L
                  </span>
                  <span className="text-[11px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                    Total: {(reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres).toLocaleString()} L
                  </span>
                </div>
              </div>

              <BarComparisonChart
                data={filteredComparisonData}
                labelA="Own Production (L)"
                labelB="Farmer Milk (L)"
                colorA="#10b981"
                colorB="#f59e0b"
                is3D={true}
              />
            </div>

            {/* CHART 2: Collection Inward vs Plant Processing (3D Glowing Ribbon with Filters) */}
            <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-forest-950 flex items-center gap-2">
                      <span>Inward Pool vs Plant Processing</span>
                      <span className="text-[10px] font-mono font-bold bg-sage-50 text-forest-900 border border-sage-200 px-2 py-0.5 rounded-full">
                        3D Glowing Ribbon
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      Validating that cold buffer silos prevent processing starvations
                    </p>
                  </div>

                  {/* Filter Controls: Metric + Timeframe + Calendar Date Picker */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Metric Filter */}
                    <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs font-semibold">
                      <button
                        onClick={() => setTrendMetricFilter('Both')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          trendMetricFilter === 'Both'
                            ? 'bg-white text-forest-950 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Combined
                      </button>
                      <button
                        onClick={() => setTrendMetricFilter('Inward')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          trendMetricFilter === 'Inward'
                            ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Inward
                      </button>
                      <button
                        onClick={() => setTrendMetricFilter('Processing')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          trendMetricFilter === 'Processing'
                            ? 'bg-white text-amber-800 font-bold shadow-2xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Processing
                      </button>
                    </div>

                    {/* Timeframe Presets */}
                    <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs font-semibold font-mono">
                      {(['7D', '14D', '30D'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            setTimeframeB(tf);
                            if (tf === '7D') {
                              setCalendarStartB('2026-10-01');
                              setCalendarEndB('2026-10-06');
                            } else if (tf === '14D') {
                              setCalendarStartB('2026-09-24');
                              setCalendarEndB('2026-10-06');
                            } else {
                              setCalendarStartB('2026-09-08');
                              setCalendarEndB('2026-10-06');
                            }
                          }}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            timeframeB === tf
                              ? 'bg-white text-forest-950 font-bold shadow-2xs'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Calendar Date Range Filter */}
                    <div className="flex items-center gap-1 bg-[#faf8f5] hover:bg-white border border-[#ede8df] focus-within:border-forest-600 rounded-xl px-2 py-1 text-xs shadow-2xs transition-all">
                      <Calendar className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <input
                        type="date"
                        value={calendarStartB}
                        onChange={(e) => {
                          setCalendarStartB(e.target.value);
                          setTimeframeB('Custom');
                        }}
                        className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer max-w-[105px]"
                        title="Calendar Start Date"
                      />
                      <span className="text-stone-400 font-mono text-[10px]">&rarr;</span>
                      <input
                        type="date"
                        value={calendarEndB}
                        onChange={(e) => {
                          setCalendarEndB(e.target.value);
                          setTimeframeB('Custom');
                        }}
                        className="bg-transparent text-[11px] font-mono text-stone-700 outline-none cursor-pointer max-w-[105px]"
                        title="Calendar End Date"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Metric Badges */}
                <div className="flex items-center gap-2 mb-4 pt-1">
                  <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-semibold">
                    Inward Pool: {(reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres).toLocaleString()} L
                  </span>
                  <span className="text-[11px] font-mono text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md font-semibold">
                    Processed: {reconciliation.processingConsumptionLitres.toLocaleString()} L
                  </span>
                  <span className="text-[11px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded-md hidden sm:inline-block">
                    Net: +{(
                      reconciliation.ownProductionLitres +
                      reconciliation.farmerProcurementLitres -
                      reconciliation.processingConsumptionLitres
                    ).toLocaleString()} L
                  </span>
                </div>
              </div>

              <AreaTrendChart
                data={filteredTrendData}
                primaryColor="#10b981"
                secondaryColor="#f59e0b"
                primaryLabel="Total Inward Pool"
                secondaryLabel={trendMetricFilter === 'Inward' ? undefined : 'Processed Outward'}
                is3D={true}
              />
            </div>
          </div>

          {/* Operational Shift Breakdown Table */}
          <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[#ede8df] flex items-center justify-between bg-cream-50/50">
              <h3 className="text-sm font-bold text-forest-950">
                Shift-wise Milk Flow Breakdown (Today)
              </h3>
              <span className="text-xs font-mono font-semibold text-stone-500 bg-white px-2.5 py-1 rounded-full border border-[#ede8df]">
                Morning Completed · Evening Scheduled
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f5] border-b border-[#ede8df] text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Own Production</th>
                    <th className="px-4 py-3">Farmer Inward</th>
                    <th className="px-4 py-3">Total Inflow</th>
                    <th className="px-4 py-3">Avg Fat %</th>
                    <th className="px-4 py-3">Avg SNF %</th>
                    <th className="px-4 py-3">Processed</th>
                    <th className="px-4 py-3">Wastage / Loss</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                  <tr className="hover:bg-cream-50/60 transition-colors">
                    <td className="px-4 py-3 font-sans font-bold text-stone-900">
                      Morning (05:00 - 08:30)
                    </td>
                    <td className="px-4 py-3 text-forest-900 font-bold">
                      {morningOwnL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 text-forest-800 font-bold">
                      {morningFarmerL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-bold text-forest-950">
                      {morningTotalL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">4.48%</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">8.72%</td>
                    <td className="px-4 py-3 text-stone-800">2,400 L</td>
                    <td className="px-4 py-3 text-rose-800 font-bold">42 L (1.9%)</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full bg-sage-50 text-forest-900 border border-sage-200 text-[11px] font-bold">
                        Reconciled
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => setCurrentModule('milk-collection')}
                        className="text-[11px] font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-2 cursor-pointer"
                      >
                        View Inward &rarr;
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-cream-50/60 transition-colors">
                    <td className="px-4 py-3 font-sans font-bold text-stone-900">
                      Evening (16:00 - 19:30)
                    </td>
                    <td className="px-4 py-3 text-forest-900 font-bold">
                      {eveningOwnL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 text-forest-800 font-bold">
                      {eveningFarmerL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-bold text-forest-950">
                      {eveningTotalL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">4.42%</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">8.68%</td>
                    <td className="px-4 py-3 text-stone-800">
                      {Math.max(
                        0,
                        reconciliation.processingConsumptionLitres - 2400
                      ).toLocaleString()}{' '}
                      L
                    </td>
                    <td className="px-4 py-3 text-rose-800 font-bold">
                      {Math.max(0, reconciliation.spillageWastageLitres - 42).toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                        Active Inward
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => setCurrentModule('milk-collection')}
                        className="text-[11px] font-semibold text-forest-800 hover:text-forest-950 underline underline-offset-2 cursor-pointer"
                      >
                        Log Collection &rarr;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Own Milk' && (
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950">Own Herd Milking Economics</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Own milk is produced in the automatic milking parlour at Shed A & B, with inline
                chillers bringing milk to 3.9°C within 12 minutes of extraction.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-forest-900 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200 font-bold shrink-0">
                {reconciliation.ownProductionLitres.toLocaleString()} L/day across{' '}
                {herdEconomics.totalMilkingCows} milking cows
              </span>
              <button
                onClick={() => setIsParlourModalOpen(true)}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors active:scale-98 shrink-0"
              >
                <Milk className="w-3.5 h-3.5" />
                <span>Record Cow Milking</span>
              </button>
              <button
                onClick={() => setCurrentModule('cattle')}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-forest-900 border border-[#ede8df] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Warehouse className="w-3.5 h-3.5 text-forest-700" />
                <span>Open Cattle Herd (Tab 07) &rarr;</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-cream-50/70 rounded-xl border border-[#ede8df] shadow-2xs">
              <div className="text-stone-500 font-sans text-xs font-semibold">Herd Avg Daily Yield</div>
              <div className="text-lg font-bold text-forest-950 mt-1">
                {herdEconomics.avgYieldPerCowL} L / cow
              </div>
              <div className="text-[11px] text-forest-800 font-sans mt-1 font-medium">
                Top Producer: COW-003 (23.8 L/day)
              </div>
            </div>
            <div className="p-4 bg-cream-50/70 rounded-xl border border-[#ede8df] shadow-2xs">
              <div className="text-stone-500 font-sans text-xs font-semibold">Feed Cost Per Litre</div>
              <div className="text-lg font-bold text-forest-950 mt-1">
                ₹{herdEconomics.feedCostPerLitre} / L
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-1 font-medium">
                Total daily herd feed: ₹{herdEconomics.totalDailyFeedCost.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-sage-50/80 rounded-xl border border-sage-200 shadow-2xs">
              <div className="text-forest-950 font-sans text-xs font-bold">
                Net Contribution / Litre
              </div>
              <div className="text-lg font-bold text-forest-900 mt-1">
                +₹{herdEconomics.contributionPerLitre} / L
              </div>
              <div className="text-[11px] text-forest-800 font-sans mt-1 font-semibold">
                Net Herd: +₹{herdEconomics.netHerdContribution.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Farmer Milk' && (
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950">Farmer Procurement Network</h3>
              <p className="text-xs text-stone-500 font-medium">
                Collected from {procurementSummary.totalSuppliersToday} active farmers across Anand,
                Borsad, Petlad and Nadiad clusters. Tested with automated lactoscan and fat/SNF sensors.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-forest-900 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200 font-bold shrink-0">
                {reconciliation.farmerProcurementLitres.toLocaleString()} L procured today
              </span>
              <button
                onClick={() => setCurrentModule('milk-collection')}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors active:scale-98 shrink-0"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Milk Collection (Tab 03) &rarr;</span>
              </button>
              <button
                onClick={() => setCurrentModule('payments')}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-forest-900 border border-[#ede8df] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Farmer Payables (Tab 15) &rarr;</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-cream-50/70 rounded-xl border border-[#ede8df] shadow-2xs">
              <div className="text-stone-500 font-sans text-xs font-semibold">Avg Procurement Rate</div>
              <div className="text-lg font-bold text-forest-950 mt-1">
                ₹{procurementSummary.averageRatePerLitre.toFixed(2)} / L
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-1 font-medium">
                Fat {procurementSummary.averageFatPct}% · SNF {procurementSummary.averageSnfPct}%
              </div>
            </div>
            <div className="p-4 bg-cream-50/70 rounded-xl border border-[#ede8df] shadow-2xs">
              <div className="text-stone-500 font-sans text-xs font-semibold">Today's Farmer Payables</div>
              <div className="text-lg font-bold text-forest-900 mt-1">
                ₹{procurementSummary.totalPayablePending.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-1 font-medium">
                Direct bank settlement enabled
              </div>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-2xs">
              <div className="text-rose-950 font-sans text-xs font-bold">
                Quality Rejections Today
              </div>
              <div className="text-lg font-bold text-rose-900 mt-1">
                {reconciliation.qualityRejectedLitres} L
              </div>
              <div className="text-[11px] text-rose-800 font-sans mt-1 font-medium">
                Flagged for water / adulteration
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'Milk Pool' || activeTab === 'Processing') && (
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-forest-950">
                Cold Pool & Processing Overview
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Detailed tanks, CIP sanitization cycles and product yield breakdowns can also be
                accessed in their dedicated Chilling and Processing modules.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentModule('chilling')}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors active:scale-98 shrink-0"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Chilling Tanks & Silos (Tab 05) &rarr;</span>
              </button>
              <button
                onClick={() => setCurrentModule('processing')}
                className="px-3 py-1.5 bg-white hover:bg-stone-50 text-forest-900 border border-[#ede8df] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Factory className="w-3.5 h-3.5 text-forest-700" />
                <span>Dairy Processing Batches (Tab 06) &rarr;</span>
              </button>
            </div>
          </div>
          <div className="p-4 bg-cream-50/80 rounded-xl border border-[#ede8df] font-mono text-xs text-stone-800 space-y-2.5">
            <div className="font-medium text-stone-800">Silo A (Raw Intake Buffer): 3,820 L @ 3.9°C (Capacity 5,000 L)</div>
            <div className="font-medium text-stone-800">Vat B (Direct Farmer Reception): 1,940 L @ 4.2°C (Capacity 3,000 L)</div>
            <div className="font-medium text-stone-800">Tank C (Standardized Pool): 2,860 L @ 4.0°C (Capacity 4,000 L)</div>
            <div className="text-forest-900 font-bold pt-2.5 border-t border-[#ede8df]">
              Available Raw Buffer for Next Processing Shift:{' '}
              {reconciliation.closingStockLitres.toLocaleString()} L
            </div>
          </div>
        </div>
      )}

      {/* Daily Cow Milking Modal */}
      <Modal
        isOpen={isParlourModalOpen}
        onClose={() => setIsParlourModalOpen(false)}
        title="Record Daily Cow Milking Yield"
        subtitle="Log daily milk extraction for individual farm cattle to immediately update herd yield and mass balance reconciliation"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordCattleMilking({
              cattleId: selectedCowId,
              yieldLitres: parseFloat(parlourYield) || 0,
              shift: parlourShift,
              fat: parseFloat(parlourFat) || 4.4,
              snf: parseFloat(parlourSnf) || 8.6,
            });
            setIsParlourModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Select Cow from Herd</label>
            <select
              value={selectedCowId}
              onChange={(e) => {
                setSelectedCowId(e.target.value);
                const found = cattleList.find((c) => c.id === e.target.value);
                if (found) {
                  setParlourYield(found.milkYieldLPerDay.toString());
                }
              }}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
            >
              {cattleList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.tagNumber} ({c.breed}, {c.status}) — Current: {c.milkYieldLPerDay} L/d
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Shift</label>
              <select
                value={parlourShift}
                onChange={(e) => setParlourShift(e.target.value as 'Morning' | 'Evening')}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Morning">Morning Shift (05:00 - 08:30)</option>
                <option value="Evening">Evening Shift (16:00 - 19:30)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Milk Yield (Litres)</label>
              <input
                type="number"
                step="0.1"
                required
                value={parlourYield}
                onChange={(e) => setParlourYield(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-forest-950 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={parlourFat}
                onChange={(e) => setParlourFat(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={parlourSnf}
                onChange={(e) => setParlourSnf(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsParlourModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              Save Milking Record
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
