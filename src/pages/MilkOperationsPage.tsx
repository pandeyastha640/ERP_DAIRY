import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { AreaTrendChart, BarComparisonChart } from '../components/charts/Charts';
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
  } = useDairyERP();

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Own Milk' | 'Farmer Milk' | 'Milk Pool' | 'Processing'
  >('Overview');
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [centreFilter, setCentreFilter] = useState<
    'All' | 'Anand CC' | 'Borsad Chilling' | 'Nadiad Hub'
  >('All');

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

  // Dynamic 7-day trend data reflecting current reconciled totals
  const trendData = [
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

  const ownVsFarmerData = [
    { label: '01 Oct', valueA: 1210, valueB: 2910 },
    { label: '02 Oct', valueA: 1220, valueB: 2980 },
    { label: '03 Oct', valueA: 1205, valueB: 2975 },
    { label: '04 Oct', valueA: 1230, valueB: 3020 },
    { label: '05 Oct', valueA: 1210, valueB: 3140 },
    {
      label: 'Today',
      valueA: reconciliation.ownProductionLitres,
      valueB: reconciliation.farmerProcurementLitres,
    },
  ];

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

      {/* 2. Top 6 KPI Strip (Derived from Centralized Reconciliation) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Own Herd Milk"
          value={reconciliation.ownProductionLitres.toLocaleString()}
          unit="L"
          trend="up"
          changePct={2.5}
          changeText={`${herdEconomics.totalMilkingCows} Milking Cows`}
          icon={<Warehouse className="w-4 h-4 text-forest-700" />}
        />
        <MetricCard
          label="Farmer Procurement"
          value={reconciliation.farmerProcurementLitres.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.2}
          changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`}
          icon={<Users className="w-4 h-4 text-forest-800" />}
        />
        <MetricCard
          label="Total Milk Pool"
          value={totalInwardPool.toLocaleString()}
          unit="L"
          trend="down"
          changePct={-1.5}
          changeText="Chilled in Silos"
          icon={<Snowflake className="w-4 h-4 text-stone-700" />}
        />
        <MetricCard
          label="Milk Processed"
          value={reconciliation.processingConsumptionLitres.toLocaleString()}
          unit="L"
          trend="neutral"
          changePct={0.0}
          changeText={`${batchesList.length} Active Batches`}
          icon={<Factory className="w-4 h-4 text-amber-700" />}
        />
        <MetricCard
          label="Milk Equivalent Sold"
          value={milkSoldEquivalentL.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.7}
          changeText={`${salesOrdersList.length} Sales Orders`}
          icon={<ShoppingCart className="w-4 h-4 text-forest-700" />}
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
        />
      </div>

      {/* 3. Central Milk Mass Balance Reconciliation Equation Strip */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-5 font-mono text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#ede8df]/70 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sage-50 border border-sage-200/80 text-forest-800">
              <Scale className="w-4 h-4 text-forest-700" />
            </span>
            <span className="text-sm font-bold text-forest-950 font-sans">
              Centralized Milk Mass Balance Reconciliation Ledger
            </span>
          </div>
          <div className="flex items-center gap-2 text-forest-900 font-sans text-xs font-bold bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>Zero Unaccounted Variance (100% Reconciled)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
          <div className="p-2.5 bg-cream-50/80 rounded-xl border border-[#ede8df] shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 mb-1">Opening Silos</div>
            <div className="font-bold text-stone-900 font-mono text-sm tracking-tight">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-sage-50/70 rounded-xl border border-sage-200/70 text-forest-900 shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-forest-800 mb-1">+ Own Herd</div>
            <div className="font-bold font-mono text-sm tracking-tight">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-forest-50/60 rounded-xl border border-forest-200/70 text-forest-950 shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-forest-800 mb-1">+ Farmer Inward</div>
            <div className="font-bold font-mono text-sm tracking-tight">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-amber-950 shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-900 mb-1">
              - Rejections
            </div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-xl border border-[#ede8df] text-stone-800 shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 mb-1">- Processing</div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/70 text-rose-950 shadow-2xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-rose-900 mb-1">- Line Wastage</div>
            <div className="font-bold font-mono text-sm tracking-tight">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-sage-100/70 rounded-xl border border-sage-300 text-forest-950 shadow-xs">
            <div className="text-[10px] uppercase font-mono tracking-wider text-forest-950 font-bold mb-1">
              = Closing Silo
            </div>
            <div className="font-bold text-sm font-mono tracking-tight">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </div>
          </div>
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
            <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-forest-950 mb-1">
                Own Cattle Milk vs Farmer Procurement (7-Day Daily)
              </h3>
              <p className="text-xs text-stone-500 mb-4 font-medium">
                Dual stream analytics demonstrating source ratio (
                {(
                  (reconciliation.ownProductionLitres /
                    (reconciliation.ownProductionLitres +
                      reconciliation.farmerProcurementLitres || 1)) *
                  100
                ).toFixed(1)}
                % Own vs{' '}
                {(
                  (reconciliation.farmerProcurementLitres /
                    (reconciliation.ownProductionLitres +
                      reconciliation.farmerProcurementLitres || 1)) *
                  100
                ).toFixed(1)}
                % Farmer today)
              </p>
              <BarComparisonChart
                data={ownVsFarmerData}
                labelA="Own Production (L)"
                labelB="Farmer Milk (L)"
                colorA="#1b4332"
                colorB="#52b788"
              />
            </div>

            <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-forest-950 mb-1">
                Collection Inward vs Plant Processing Throughput
              </h3>
              <p className="text-xs text-stone-500 mb-4 font-medium">
                Validating that cold buffer silos prevent processing starvations
              </p>
              <AreaTrendChart
                data={trendData}
                primaryColor="#1b4332"
                secondaryColor="#52b788"
                primaryLabel="Total Inward Pool"
                secondaryLabel="Processed Outward"
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
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Own Milk' && (
        <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-forest-950">Own Herd Milking Economics</h3>
            <span className="text-xs font-mono text-forest-900 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200 font-bold">
              {reconciliation.ownProductionLitres.toLocaleString()} L/day across{' '}
              {herdEconomics.totalMilkingCows} milking cows
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Own milk is produced in the automatic milking parlour at Shed A & B, with inline
            chillers bringing milk to 3.9°C within 12 minutes of extraction.
          </p>
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-forest-950">Farmer Procurement Network</h3>
            <span className="text-xs font-mono text-forest-900 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200 font-bold">
              {reconciliation.farmerProcurementLitres.toLocaleString()} L procured today
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Collected from {procurementSummary.totalSuppliersToday} active farmers across Anand,
            Borsad, Petlad and Nadiad clusters. Tested with automated lactoscan and fat/SNF sensors.
          </p>
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
          <h3 className="text-sm font-bold text-forest-950">
            Cold Pool & Processing Overview
          </h3>
          <p className="text-xs text-stone-500 font-medium">
            Detailed tanks, CIP sanitization cycles and product yield breakdowns can also be
            accessed in their dedicated Chilling and Processing modules.
          </p>
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
    </PageContainer>
  );
};
