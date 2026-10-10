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
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
              <span className="text-slate-500 font-medium">Shift:</span>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value as 'All' | 'Morning' | 'Evening')}
                className="bg-transparent font-semibold outline-none text-emerald-800 cursor-pointer"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
              <span className="text-slate-500 font-medium">Centre:</span>
              <select
                value={centreFilter}
                onChange={(e) =>
                  setCentreFilter(
                    e.target.value as 'All' | 'Anand CC' | 'Borsad Chilling' | 'Nadiad Hub'
                  )
                }
                className="bg-transparent font-semibold outline-none text-emerald-800 cursor-pointer"
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
          icon={<Warehouse className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          label="Farmer Procurement"
          value={reconciliation.farmerProcurementLitres.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.2}
          changeText={`${procurementSummary.totalSuppliersToday} Active Suppliers`}
          icon={<Users className="w-4 h-4 text-blue-700" />}
        />
        <MetricCard
          label="Total Milk Pool"
          value={totalInwardPool.toLocaleString()}
          unit="L"
          trend="down"
          changePct={-1.5}
          changeText="Chilled in Silos"
          icon={<Snowflake className="w-4 h-4 text-slate-700" />}
        />
        <MetricCard
          label="Milk Processed"
          value={reconciliation.processingConsumptionLitres.toLocaleString()}
          unit="L"
          trend="neutral"
          changePct={0.0}
          changeText={`${batchesList.length} Active Batches`}
          icon={<Factory className="w-4 h-4 text-amber-600" />}
        />
        <MetricCard
          label="Milk Equivalent Sold"
          value={milkSoldEquivalentL.toLocaleString()}
          unit="L"
          trend="up"
          changePct={1.7}
          changeText={`${salesOrdersList.length} Sales Orders`}
          icon={<ShoppingCart className="w-4 h-4 text-emerald-700" />}
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
          icon={<Trash2 className="w-4 h-4 text-rose-600" />}
        />
      </div>

      {/* 3. Central Milk Mass Balance Reconciliation Equation Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 text-slate-700">
              <Scale className="w-4 h-4 text-emerald-700" />
            </span>
            <span className="text-sm font-bold text-slate-900 font-sans">
              Centralized Milk Mass Balance Reconciliation Ledger
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 font-sans text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Zero Unaccounted Variance (100% Reconciled)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Opening Silos</div>
            <div className="font-bold text-slate-900 mt-1 font-mono text-sm">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200 text-emerald-900">
            <div className="text-[10px] uppercase font-mono text-emerald-800">+ Own Herd</div>
            <div className="font-bold mt-1 font-mono text-sm">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900">
            <div className="text-[10px] uppercase font-mono text-blue-800">+ Farmer Inward</div>
            <div className="font-bold mt-1 font-mono text-sm">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-amber-900">
            <div className="text-[10px] uppercase font-mono text-amber-800">
              - Quality Rejections
            </div>
            <div className="font-bold mt-1 font-mono text-sm">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">- Processing Input</div>
            <div className="font-bold mt-1 font-mono text-sm">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-200 text-rose-900">
            <div className="text-[10px] uppercase font-mono text-rose-800">- Line Wastage</div>
            <div className="font-bold mt-1 font-mono text-sm">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </div>
          </div>
          <div className="p-2.5 bg-emerald-100/70 rounded-lg border border-emerald-300 text-emerald-900">
            <div className="text-[10px] uppercase font-mono text-emerald-900 font-bold">
              = Closing Silo Stock
            </div>
            <div className="font-bold text-sm mt-1 font-mono">
              {reconciliation.closingStockLitres.toLocaleString()} L
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg max-w-fit shadow-2xs">
        {(['Overview', 'Own Milk', 'Farmer Milk', 'Milk Pool', 'Processing'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
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
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Own Cattle Milk vs Farmer Procurement (7-Day Daily)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
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
                colorA="#047857"
                colorB="#2563eb"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Collection Inward vs Plant Processing Throughput
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Validating that cold buffer silos prevent processing starvations
              </p>
              <AreaTrendChart
                data={trendData}
                primaryColor="#047857"
                secondaryColor="#2563eb"
                primaryLabel="Total Inward Pool"
                secondaryLabel="Processed Outward"
              />
            </div>
          </div>

          {/* Operational Shift Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-sm font-semibold text-slate-900">
                Shift-wise Milk Flow Breakdown (Today)
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Morning Completed · Evening Scheduled
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
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
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                      Morning (05:00 - 08:30)
                    </td>
                    <td className="px-4 py-3 text-emerald-800 font-semibold">
                      {morningOwnL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">
                      {morningFarmerL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {morningTotalL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3">4.48%</td>
                    <td className="px-4 py-3">8.72%</td>
                    <td className="px-4 py-3 text-slate-800">2,400 L</td>
                    <td className="px-4 py-3 text-rose-700 font-semibold">42 L (1.9%)</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        Reconciled
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                      Evening (16:00 - 19:30)
                    </td>
                    <td className="px-4 py-3 text-emerald-800 font-semibold">
                      {eveningOwnL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">
                      {eveningFarmerL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {eveningTotalL.toLocaleString()} L
                    </td>
                    <td className="px-4 py-3">4.42%</td>
                    <td className="px-4 py-3">8.68%</td>
                    <td className="px-4 py-3 text-slate-800">
                      {Math.max(
                        0,
                        reconciliation.processingConsumptionLitres - 2400
                      ).toLocaleString()}{' '}
                      L
                    </td>
                    <td className="px-4 py-3 text-rose-700 font-semibold">
                      {Math.max(0, reconciliation.spillageWastageLitres - 42).toLocaleString()} L
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
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
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Own Herd Milking Economics</h3>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              {reconciliation.ownProductionLitres.toLocaleString()} L/day across{' '}
              {herdEconomics.totalMilkingCows} milking cows
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Own milk is produced in the automatic milking parlour at Shed A & B, with inline
            chillers bringing milk to 3.9°C within 12 minutes of extraction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-sans text-xs">Herd Avg Daily Yield</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {herdEconomics.avgYieldPerCowL} L / cow
              </div>
              <div className="text-[11px] text-emerald-700 font-sans mt-0.5">
                Top Producer: COW-003 (23.8 L/day)
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-sans text-xs">Feed Cost Per Litre</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                ₹{herdEconomics.feedCostPerLitre} / L
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Total daily herd feed: ₹{herdEconomics.totalDailyFeedCost.toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-emerald-900 font-sans text-xs font-semibold">
                Net Contribution / Litre
              </div>
              <div className="text-lg font-bold text-emerald-800 mt-1">
                +₹{herdEconomics.contributionPerLitre} / L
              </div>
              <div className="text-[11px] text-emerald-800 font-sans mt-0.5 font-medium">
                Net Herd: +₹{herdEconomics.netHerdContribution.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Farmer Milk' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Farmer Procurement Network</h3>
            <span className="text-xs font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              {reconciliation.farmerProcurementLitres.toLocaleString()} L procured today
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Collected from {procurementSummary.totalSuppliersToday} active farmers across Anand,
            Borsad, Petlad and Nadiad clusters. Tested with automated lactoscan and fat/SNF sensors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-sans text-xs">Avg Procurement Rate</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                ₹{procurementSummary.weightedAvgRatePerL.toFixed(2)} / L
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Fat {procurementSummary.weightedAvgFat}% · SNF {procurementSummary.weightedAvgSNF}%
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 font-sans text-xs">Today's Farmer Payables</div>
              <div className="text-lg font-bold text-emerald-800 mt-1">
                ₹{procurementSummary.totalPayablesToday.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                Direct bank settlement enabled
              </div>
            </div>
            <div className="p-3.5 bg-rose-50/60 rounded-lg border border-rose-200">
              <div className="text-rose-900 font-sans text-xs font-semibold">
                Quality Rejections Today
              </div>
              <div className="text-lg font-bold text-rose-800 mt-1">
                {reconciliation.qualityRejectedLitres} L
              </div>
              <div className="text-[11px] text-rose-700 font-sans mt-0.5">
                Flagged for water / adulteration
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'Milk Pool' || activeTab === 'Processing') && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900">
            Cold Pool & Processing Overview
          </h3>
          <p className="text-xs text-slate-500">
            Detailed tanks, CIP sanitization cycles and product yield breakdowns can also be
            accessed in their dedicated Chilling and Processing modules.
          </p>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
            <div>Silo A (Raw Intake Buffer): 3,820 L @ 3.9°C (Capacity 5,000 L)</div>
            <div>Vat B (Direct Farmer Reception): 1,940 L @ 4.2°C (Capacity 3,000 L)</div>
            <div>Tank C (Standardized Pool): 2,860 L @ 4.0°C (Capacity 4,000 L)</div>
            <div className="text-emerald-800 font-bold pt-2 border-t border-slate-200">
              Available Raw Buffer for Next Processing Shift:{' '}
              {reconciliation.closingStockLitres.toLocaleString()} L
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
