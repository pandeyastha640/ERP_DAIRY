import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { DonutChart } from '../components/charts/Charts';
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  DataTable,
} from '../components/common/DesignSystem';
import {
  TrendingUp,
  Calculator,
  PieChart,
  Layers,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const FinanceProfitabilityPage: React.FC = () => {
  const {
    profitability,
    herdEconomics,
    procurementSummary,
    reconciliation,
    routesList,
    productsList,
    salesOrdersList,
    currentFacility,
    currentDateFilter,
  } = useDairyERP();

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Cost Per Litre' | 'By Product' | 'By Route' | 'Stream Economics'
  >('Overview');

  const breakdown = profitability.operatingCostBreakdown;

  const costSlices = [
    { label: 'Farmer Milk Procurement', value: breakdown.milkProcurement, color: '#1b4332' },
    { label: 'Own Cattle Feed & Fodder', value: breakdown.cattleFeed, color: '#2d6a4f' },
    { label: 'Plant Processing & Steam', value: breakdown.dairyProcessing, color: '#40916c' },
    { label: 'Labour & Dairy Staff', value: breakdown.labourStaff, color: '#52b788' },
    { label: 'Packaging Materials', value: breakdown.packagingMaterial, color: '#c59b27' },
    { label: 'Fleet Transport & Diesel', value: breakdown.transportLogistics, color: '#d97706' },
    {
      label: 'Electricity & Cold Chain',
      value: breakdown.electricityUtilities + breakdown.chillingColdChain,
      color: '#748cab',
    },
    { label: 'Wastage Spillage Loss', value: breakdown.wastageLoss, color: '#e11d48' },
  ];

  // Dynamic Route Economics data
  const routeEconomics = routesList.map((r) => {
    const margin =
      r.revenueGenerated > 0
        ? +(
            ((r.revenueGenerated - r.logisticsCost - r.totalDispatchUnits * 24) /
              r.revenueGenerated) *
            100
          ).toFixed(1)
        : 0;
    const contribution = r.revenueGenerated - r.logisticsCost - r.totalDispatchUnits * 24;
    return {
      route: r.routeName,
      code: r.routeCode,
      units: r.deliveredUnits,
      revenue: r.revenueGenerated,
      logisticsCost: r.logisticsCost,
      contribution,
      marginPct: margin,
    };
  });

  const processedLitres = Math.max(reconciliation.processingConsumptionLitres, 1);

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title="Finance & Unit Profitability Control"
        subtitle="Transparent cost-per-litre decomposition, product unit margins, route logistics drag, and herd vs farmer stream economics."
        facility={currentFacility}
        dateFilter={currentDateFilter}
        statusBadge="Margin Healthy: 24.8%"
        actions={
          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl shadow-2xs font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Target Gross Margin Met: {profitability.grossMarginPct}%</span>
          </div>
        }
      />

      {/* 2. Top 7 KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <MetricCard
          label="Gross Revenue"
          value={`₹${(profitability.todayRevenue / 1000).toFixed(1)}k`}
          unit=""
          trend="up"
          changePct={2.4}
          changeText={`${salesOrdersList.length} Invoices`}
        />
        <MetricCard
          label="Operating Costs"
          value={`₹${(profitability.todayOperatingCost / 1000).toFixed(1)}k`}
          unit=""
          trend="down"
          isGoodWhenUp={false}
          changeText="All 11 cost lines"
        />
        <MetricCard
          label="Gross Profit"
          value={`₹${(profitability.grossProfit / 1000).toFixed(1)}k`}
          unit=""
          trend="up"
          changePct={6.1}
          changeText="Operating contribution"
        />
        <MetricCard
          label="Gross Margin"
          value={`${profitability.grossMarginPct}%`}
          unit=""
          trend="up"
          changeText="Target: > 20%"
        />
        <MetricCard
          label="Cost / Litre"
          value={`₹${profitability.costPerLitre.toFixed(2)}`}
          unit="/L"
          trend="neutral"
          changeText={`÷ ${processedLitres.toLocaleString()} L`}
        />
        <MetricCard
          label="Revenue / Litre"
          value={`₹${profitability.revenuePerLitre.toFixed(2)}`}
          unit="/L"
          trend="up"
          changeText="Blended realization"
        />
        <MetricCard
          label="Profit / Litre"
          value={`₹${profitability.profitPerLitre.toFixed(2)}`}
          unit="/L"
          trend="up"
          changeText="Net unit yield"
        />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-cream-50/80 border border-[#ede8df] rounded-xl max-w-fit overflow-x-auto shadow-2xs">
        {(
          ['Overview', 'Cost Per Litre', 'By Product', 'By Route', 'Stream Economics'] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-forest-900 text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-forest-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Unit Cost Formula Callout */}
          <div className="p-5 bg-white border border-[#ede8df] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono shadow-xs">
            <div>
              <div className="text-xs text-stone-500 font-sans font-semibold uppercase tracking-wider">
                TRANSPARENT UNIT COST FORMULA (RECONCILED)
              </div>
              <div className="text-lg font-bold text-forest-950 mt-1 flex flex-wrap items-center gap-2">
                <span>Total Operating Cost (₹{profitability.todayOperatingCost.toLocaleString()})</span>
                <span className="text-stone-400">÷</span>
                <span>Litres Processed ({processedLitres.toLocaleString()} L)</span>
                <span className="text-stone-400">=</span>
                <span className="text-2xl text-emerald-800 font-extrabold">
                  ₹{profitability.costPerLitre.toFixed(2)} / Litre
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-stone-500 font-sans">
              <span>Realization: ₹{profitability.revenuePerLitre.toFixed(2)}/L</span>
              <div className="text-sm font-bold text-emerald-800 font-mono mt-0.5">
                Unit Spread: +₹{profitability.profitPerLitre.toFixed(2)} / Litre
              </div>
            </div>
          </div>

          {/* Cost Allocation Donut & Stream Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-forest-950 font-sans mb-1">
                Operating Cost Composition
              </h3>
              <p className="text-xs text-stone-500 font-sans mb-4">
                Breakdown across direct procurement, operations, packaging and cold chain
              </p>
              <DonutChart
                slices={costSlices}
                size={160}
                centerLabel="Total Daily OPEX"
                centerValue={`₹${(profitability.todayOperatingCost / 100000).toFixed(2)}L`}
              />
            </div>

            {/* Stream 1 vs Stream 2 Economics Summary */}
            <div className="bg-white border border-[#ede8df] rounded-xl p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-forest-950 font-sans">
                  Own Herd vs Farmer Procurement Economics
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Comparing margin structure before merging into the milk pool
                </p>
              </div>

              {/* Stream 1 Card */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 font-mono text-xs space-y-2">
                <div className="flex justify-between items-center font-sans font-bold text-emerald-950">
                  <span>
                    SOURCE 1: OWN CATTLE HERD ({reconciliation.ownProductionLitres.toLocaleString()} L)
                  </span>
                  <span className="text-[11px] bg-emerald-100 px-2.5 py-0.5 rounded-full text-emerald-900 font-semibold border border-emerald-200">
                    Highest Margin
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Total Feed + Healthcare + Labour:</span>
                  <span>
                    ₹{herdEconomics.totalHerdOperatingCost.toLocaleString()} (₹
                    {(
                      herdEconomics.totalHerdOperatingCost /
                      (reconciliation.ownProductionLitres || 1)
                    ).toFixed(2)}
                    /L cost)
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Equivalent Market Revenue:</span>
                  <span>₹{herdEconomics.totalMilkRevenueAtMarket.toLocaleString()} (@ ₹37.00/L)</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-900 border-t border-emerald-200/80 pt-1.5">
                  <span>Net Contribution to Dairy:</span>
                  <span>
                    +₹{herdEconomics.netHerdContribution.toLocaleString()} (+₹
                    {herdEconomics.contributionPerLitre}/L margin)
                  </span>
                </div>
              </div>

              {/* Stream 2 Card */}
              <div className="p-4 bg-cream-50/70 rounded-xl border border-[#ede8df] font-mono text-xs space-y-2">
                <div className="flex justify-between items-center font-sans font-bold text-forest-950">
                  <span>
                    SOURCE 2: FARMER PROCUREMENT ({reconciliation.farmerProcurementLitres.toLocaleString()} L)
                  </span>
                  <span className="text-[11px] bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full text-forest-800 font-semibold">
                    Commercial Scale
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Procurement Cost:</span>
                  <span>
                    ₹{procurementSummary.totalPayablePending.toLocaleString()} (@ ₹
                    {procurementSummary.averageRatePerLitre.toFixed(2)}/L)
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Processing + Packaging Allocation:</span>
                  <span>₹18,500</span>
                </div>
                <div className="flex justify-between font-bold text-forest-900 border-t border-[#ede8df] pt-1.5">
                  <span>Net Contribution to Dairy:</span>
                  <span>
                    +₹
                    {Math.round(
                      reconciliation.farmerProcurementLitres * 37 -
                        procurementSummary.totalPayablePending -
                        18500
                    ).toLocaleString()}{' '}
                    (+₹
                    {(
                      (reconciliation.farmerProcurementLitres * 37 -
                        procurementSummary.totalPayablePending -
                        18500) /
                      (reconciliation.farmerProcurementLitres || 1)
                    ).toFixed(2)}
                    /L margin)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. COST PER LITRE DECOMPOSITION */}
      {activeTab === 'Cost Per Litre' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-[#ede8df] pb-3">
            <h3 className="text-base font-bold text-forest-950 font-sans">
              Unit Cost Decomposition (₹ / Litre)
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Deconstructing ₹{profitability.costPerLitre.toFixed(2)}/L total operational cost across all discrete processing steps
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfbf9] border-b border-[#ede8df] text-stone-500 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="px-4 py-3">Cost Component</th>
                  <th className="px-4 py-3">Total Daily Spend</th>
                  <th className="px-4 py-3">Per Litre Impact</th>
                  <th className="px-4 py-3">% of Total Cost</th>
                  <th className="px-4 py-3">Operational Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Raw Milk Procurement
                  </td>
                  <td className="px-4 py-3">₹{breakdown.milkProcurement.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.milkProcurement / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.milkProcurement / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Weighted average fat & SNF rate
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Cattle Herd Feed & Fodder
                  </td>
                  <td className="px-4 py-3">₹{breakdown.cattleFeed.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.cattleFeed / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.cattleFeed / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Green fodder silage & 22% concentrate
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Dairy Processing & Steam
                  </td>
                  <td className="px-4 py-3">₹{breakdown.dairyProcessing.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.dairyProcessing / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.dairyProcessing / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Boiler fuel & HTST pasteurizer electricity
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Packaging Materials
                  </td>
                  <td className="px-4 py-3">₹{breakdown.packagingMaterial.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.packagingMaterial / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.packagingMaterial / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    LDPE multilayer pouches, bottles & cups
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Labour & Plant Crew
                  </td>
                  <td className="px-4 py-3">₹{breakdown.labourStaff.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.labourStaff / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.labourStaff / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Quality technicians, milker team & machine operators
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Fleet Transport & Logistics
                  </td>
                  <td className="px-4 py-3">₹{breakdown.transportLogistics.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.transportLogistics / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.transportLogistics / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Insulated reefers & delivery routes
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Electricity & Cold Silos
                  </td>
                  <td className="px-4 py-3">
                    ₹{(breakdown.electricityUtilities + breakdown.chillingColdChain).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{((breakdown.electricityUtilities + breakdown.chillingColdChain) / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {(
                      ((breakdown.electricityUtilities + breakdown.chillingColdChain) /
                        profitability.todayOperatingCost) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    Continuous 4°C chilling compressor load
                  </td>
                </tr>
                <tr className="hover:bg-cream-50/60">
                  <td className="px-4 py-3 font-sans font-bold text-forest-950">
                    Wastage & Spillage Loss
                  </td>
                  <td className="px-4 py-3">₹{breakdown.wastageLoss.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-forest-950">
                    ₹{(breakdown.wastageLoss / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.wastageLoss / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-500">
                    {reconciliation.spillageWastageLitres} L rinse drain loss
                  </td>
                </tr>
                <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-600 text-emerald-950">
                  <td className="px-4 py-3.5 font-sans text-emerald-900 font-bold">
                    Total Operational Cost
                  </td>
                  <td className="px-4 py-3.5">
                    ₹{profitability.todayOperatingCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-emerald-900 text-sm font-extrabold">
                    ₹{profitability.costPerLitre.toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3.5">100.0%</td>
                  <td className="px-4 py-3.5 font-sans text-emerald-900">Reconciled Unit Cost</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PROFITABILITY BY PRODUCT */}
      {activeTab === 'By Product' && (
        <div className="bg-white border border-[#ede8df] rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[#ede8df] flex items-center justify-between bg-cream-50/50">
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">
                Product Unit Contribution & Gross Margins
              </h3>
              <p className="text-[11px] text-stone-500">SKU level profit spread and realization</p>
            </div>
            <span className="text-xs font-mono text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
              {productsList.length} SKUs Monitored
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfbf9] border-b border-[#ede8df] text-stone-500 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-4 py-3">Pack Size</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Production Cost</th>
                  <th className="px-4 py-3">Gross Margin</th>
                  <th className="px-4 py-3">Margin %</th>
                  <th className="px-4 py-3 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                {productsList.map((p) => {
                  const marginAmt = p.sellingPrice - p.productionCost;
                  const marginPct = +((marginAmt / p.sellingPrice) * 100).toFixed(1);
                  return (
                    <tr key={p.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{p.name}</td>
                      <td className="px-4 py-3.5 font-sans text-stone-500">{p.packSize}</td>
                      <td className="px-4 py-3.5 font-bold text-forest-950">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-amber-700 font-medium">₹{p.productionCost.toFixed(2)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-800">
                        ₹{marginAmt.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] ${
                            marginPct < 20
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                          }`}
                        >
                          {marginPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-stone-800">
                        {p.currentStockUnits.toLocaleString()} units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PROFITABILITY BY ROUTE */}
      {activeTab === 'By Route' && (
        <div className="bg-white border border-[#ede8df] rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[#ede8df] flex items-center justify-between bg-cream-50/50">
            <div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">
                Fleet Distribution Route Contribution
              </h3>
              <p className="text-[11px] text-stone-500">Logistics cost vs Revenue Generated</p>
            </div>
            <span className="text-xs font-mono text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
              {routeEconomics.length} Routes
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfbf9] border-b border-[#ede8df] text-stone-500 font-semibold uppercase tracking-wider text-[11px] font-mono">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Units Delivered</th>
                  <th className="px-4 py-3">Route Revenue</th>
                  <th className="px-4 py-3">Diesel & Driver Cost</th>
                  <th className="px-4 py-3">Net Route Contribution</th>
                  <th className="px-4 py-3 text-right">Route Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                {routeEconomics.map((r, i) => (
                  <tr key={i} className="hover:bg-cream-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{r.route}</td>
                    <td className="px-4 py-3.5">{r.units.toLocaleString()} u</td>
                    <td className="px-4 py-3.5 font-bold text-forest-950">
                      ₹{r.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-amber-700 font-medium">₹{r.logisticsCost.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-800">
                      ₹{r.contribution.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold">
                      <span
                        className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] ${
                          r.marginPct < 20
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {r.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. STREAM ECONOMICS */}
      {activeTab === 'Stream Economics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#ede8df] rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-forest-950 font-sans">Own Herd Production Economics</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Milk Produced:</span>
                <span className="font-bold text-forest-950">
                  {reconciliation.ownProductionLitres.toLocaleString()} Litres / day
                </span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Total Daily Feed Cost:</span>
                <span className="text-amber-700 font-medium">
                  ₹{herdEconomics.totalDailyFeedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Veterinary & Herd Healthcare:</span>
                <span className="text-amber-700 font-medium">
                  ₹{herdEconomics.totalDailyHealthcareCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Direct Milker Labour:</span>
                <span className="text-amber-700 font-medium">
                  ₹{herdEconomics.totalDailyLabourCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-emerald-50/70 text-emerald-950 font-bold rounded-xl border border-emerald-200/80">
                <span className="font-sans">Own Herd Cost Per Litre:</span>
                <span>
                  ₹
                  {(
                    herdEconomics.totalHerdOperatingCost /
                    (reconciliation.ownProductionLitres || 1)
                  ).toFixed(2)}{' '}
                  / L
                </span>
              </div>
              <div className="p-3.5 bg-cream-50/50 rounded-xl text-[11px] font-sans text-stone-600 leading-relaxed border border-[#ede8df]">
                Because feed formulation and veterinary healthcare are managed directly on-site, own
                herd milk provides an extraordinary ₹{herdEconomics.contributionPerLitre}/L margin
                buffer over retail realization.
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#ede8df] rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-forest-950 font-sans">Farmer Procurement Economics</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Milk Procured:</span>
                <span className="font-bold text-forest-950">
                  {reconciliation.farmerProcurementLitres.toLocaleString()} Litres / day
                </span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Farmer Milk Payout:</span>
                <span className="text-amber-700 font-medium">
                  ₹{procurementSummary.totalPayablePending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Collection Centre Running Cost:</span>
                <span className="text-amber-700 font-medium">₹2,800</span>
              </div>
              <div className="flex justify-between p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <span className="font-sans text-stone-600">Bulk Milk Chilling:</span>
                <span className="text-amber-700 font-medium">₹1,600</span>
              </div>
              <div className="flex justify-between p-3 bg-sage-50 text-forest-900 font-bold rounded-xl border border-sage-200">
                <span className="font-sans">Farmer Landed Cost Per Litre:</span>
                <span>
                  ₹
                  {(
                    (procurementSummary.totalPayablePending + 2800 + 1600) /
                    (reconciliation.farmerProcurementLitres || 1)
                  ).toFixed(2)}{' '}
                  / L
                </span>
              </div>
              <div className="p-3.5 bg-cream-50/50 rounded-xl text-[11px] font-sans text-stone-600 leading-relaxed border border-[#ede8df]">
                Farmer procurement provides essential commercial scale to keep HTST Line 1 running
                above 85% continuous capacity, amortizing capital plant overheads.
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default FinanceProfitabilityPage;
