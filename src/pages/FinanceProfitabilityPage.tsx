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
    { label: 'Farmer Milk Procurement', value: breakdown.milkProcurement, color: '#2563eb' },
    { label: 'Own Cattle Feed & Fodder', value: breakdown.cattleFeed, color: '#047857' },
    { label: 'Plant Processing & Steam', value: breakdown.dairyProcessing, color: '#d97706' },
    { label: 'Labour & Dairy Staff', value: breakdown.labourStaff, color: '#7c3aed' },
    { label: 'Packaging Materials', value: breakdown.packagingMaterial, color: '#0891b2' },
    { label: 'Fleet Transport & Diesel', value: breakdown.transportLogistics, color: '#ea580c' },
    {
      label: 'Electricity & Cold Chain',
      value: breakdown.electricityUtilities + breakdown.chillingColdChain,
      color: '#475569',
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
          <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Target Gross Margin Met: {profitability.grossMarginPct}%</span>
          </div>
        }
      />

      {/* 2. Top 7 KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
      <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg max-w-fit overflow-x-auto shadow-2xs">
        {(
          ['Overview', 'Cost Per Litre', 'By Product', 'By Route', 'Stream Economics'] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 font-mono shadow-2xs">
            <div>
              <div className="text-xs text-slate-500 font-sans font-semibold uppercase tracking-wider">
                TRANSPARENT UNIT COST FORMULA (RECONCILED)
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
                <span>Total Operating Cost (₹{profitability.todayOperatingCost.toLocaleString()})</span>
                <span className="text-slate-400">÷</span>
                <span>Litres Processed ({processedLitres.toLocaleString()} L)</span>
                <span className="text-slate-400">=</span>
                <span className="text-2xl text-emerald-800 font-bold">
                  ₹{profitability.costPerLitre.toFixed(2)} / Litre
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-sans">
              <span>Realization: ₹{profitability.revenuePerLitre.toFixed(2)}/L</span>
              <div className="text-sm font-bold text-emerald-800 font-mono mt-0.5">
                Unit Spread: +₹{profitability.profitPerLitre.toFixed(2)} / Litre
              </div>
            </div>
          </div>

          {/* Cost Allocation Donut & Stream Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Operating Cost Composition
              </h3>
              <p className="text-xs text-slate-500 mb-4">
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
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Own Herd vs Farmer Procurement Economics
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing margin structure before merging into the milk pool
                </p>
              </div>

              {/* Stream 1 Card */}
              <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 font-mono text-xs space-y-1.5">
                <div className="flex justify-between items-center font-sans font-bold text-emerald-900">
                  <span>
                    SOURCE 1: OWN CATTLE HERD ({reconciliation.ownProductionLitres.toLocaleString()}{' '}
                    L)
                  </span>
                  <span className="text-[11px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-semibold">
                    Highest Margin
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
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
                <div className="flex justify-between text-slate-700">
                  <span>Equivalent Market Revenue:</span>
                  <span>₹{herdEconomics.totalMilkRevenueAtMarket.toLocaleString()} (@ ₹37.00/L)</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 border-t border-emerald-200 pt-1">
                  <span>Net Contribution to Dairy:</span>
                  <span>
                    +₹{herdEconomics.netHerdContribution.toLocaleString()} (+₹
                    {herdEconomics.contributionPerLitre}/L margin)
                  </span>
                </div>
              </div>

              {/* Stream 2 Card */}
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 font-mono text-xs space-y-1.5">
                <div className="flex justify-between items-center font-sans font-bold text-blue-900">
                  <span>
                    SOURCE 2: FARMER PROCUREMENT (
                    {reconciliation.farmerProcurementLitres.toLocaleString()} L)
                  </span>
                  <span className="text-[11px] bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-semibold">
                    Commercial Scale
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Procurement Cost:</span>
                  <span>
                    ₹{procurementSummary.totalPayablePending.toLocaleString()} (@ ₹
                    {procurementSummary.averageRatePerLitre.toFixed(2)}/L)
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Processing + Packaging Allocation:</span>
                  <span>₹18,500</span>
                </div>
                <div className="flex justify-between font-bold text-blue-800 border-t border-blue-200 pt-1">
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
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Unit Cost Decomposition (₹ / Litre)
            </h3>
            <p className="text-xs text-slate-500">
              Deconstructing ₹{profitability.costPerLitre.toFixed(2)}/L total operational cost
              across all discrete processing steps
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Cost Component</th>
                  <th className="px-4 py-3">Total Daily Spend</th>
                  <th className="px-4 py-3">Per Litre Impact</th>
                  <th className="px-4 py-3">% of Total Cost</th>
                  <th className="px-4 py-3">Operational Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Raw Milk Procurement
                  </td>
                  <td className="px-4 py-3">₹{breakdown.milkProcurement.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.milkProcurement / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.milkProcurement / profitability.todayOperatingCost) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Weighted average fat & SNF rate
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Cattle Herd Feed & Fodder
                  </td>
                  <td className="px-4 py-3">₹{breakdown.cattleFeed.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.cattleFeed / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.cattleFeed / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Green fodder silage & 22% concentrate
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Dairy Processing & Steam
                  </td>
                  <td className="px-4 py-3">₹{breakdown.dairyProcessing.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.dairyProcessing / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.dairyProcessing / profitability.todayOperatingCost) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Boiler fuel & HTST pasteurizer electricity
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Packaging Materials
                  </td>
                  <td className="px-4 py-3">₹{breakdown.packagingMaterial.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.packagingMaterial / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {(
                      (breakdown.packagingMaterial / profitability.todayOperatingCost) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    LDPE multilayer pouches, bottles & cups
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Labour & Plant Crew
                  </td>
                  <td className="px-4 py-3">₹{breakdown.labourStaff.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.labourStaff / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.labourStaff / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Quality technicians, milker team & machine operators
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Fleet Transport & Logistics
                  </td>
                  <td className="px-4 py-3">₹{breakdown.transportLogistics.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.transportLogistics / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {(
                      (breakdown.transportLogistics / profitability.todayOperatingCost) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Insulated reefers & delivery routes
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Electricity & Cold Silos
                  </td>
                  <td className="px-4 py-3">
                    ₹
                    {(
                      breakdown.electricityUtilities + breakdown.chillingColdChain
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹
                    {(
                      (breakdown.electricityUtilities + breakdown.chillingColdChain) /
                      processedLitres
                    ).toFixed(2)}{' '}
                    / L
                  </td>
                  <td className="px-4 py-3">
                    {(
                      ((breakdown.electricityUtilities + breakdown.chillingColdChain) /
                        profitability.todayOperatingCost) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    Continuous 4°C chilling compressor load
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                    Wastage & Spillage Loss
                  </td>
                  <td className="px-4 py-3">₹{breakdown.wastageLoss.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    ₹{(breakdown.wastageLoss / processedLitres).toFixed(2)} / L
                  </td>
                  <td className="px-4 py-3">
                    {((breakdown.wastageLoss / profitability.todayOperatingCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500">
                    {reconciliation.spillageWastageLitres} L rinse drain loss
                  </td>
                </tr>
                <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-600 text-slate-900">
                  <td className="px-4 py-3.5 font-sans text-emerald-900 font-bold">
                    Total Operational Cost
                  </td>
                  <td className="px-4 py-3.5">
                    ₹{profitability.todayOperatingCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-emerald-800 text-sm font-bold">
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
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-semibold text-slate-900">
              Product Unit Contribution & Gross Margins
            </h3>
            <span className="text-xs font-mono text-slate-500">SKU level economics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
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
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
                {productsList.map((p) => {
                  const marginAmt = p.sellingPrice - p.productionCost;
                  const marginPct = +((marginAmt / p.sellingPrice) * 100).toFixed(1);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-sans font-semibold text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 font-sans text-slate-500">{p.packSize}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-amber-700">₹{p.productionCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">
                        ₹{marginAmt.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            marginPct < 20
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                          }`}
                        >
                          {marginPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
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
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-semibold text-slate-900">
              Fleet Distribution Route Contribution
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Logistics cost vs Revenue Generated
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Units Delivered</th>
                  <th className="px-4 py-3">Route Revenue</th>
                  <th className="px-4 py-3">Diesel & Driver Cost</th>
                  <th className="px-4 py-3">Net Route Contribution</th>
                  <th className="px-4 py-3 text-right">Route Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
                {routeEconomics.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">{r.route}</td>
                    <td className="px-4 py-3">{r.units.toLocaleString()} u</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{r.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-amber-700">₹{r.logisticsCost.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">
                      ₹{r.contribution.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
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
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-emerald-800">Own Herd Production Economics</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Milk Produced:</span>
                <span className="font-bold text-slate-900">
                  {reconciliation.ownProductionLitres.toLocaleString()} Litres / day
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Total Daily Feed Cost:</span>
                <span className="text-amber-700">
                  ₹{herdEconomics.totalDailyFeedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Veterinary & Herd Healthcare:</span>
                <span className="text-amber-700">
                  ₹{herdEconomics.totalDailyHealthcareCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Direct Milker Labour:</span>
                <span className="text-amber-700">
                  ₹{herdEconomics.totalDailyLabourCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-emerald-50 text-emerald-900 font-bold rounded-lg border border-emerald-200">
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
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] font-sans text-slate-500 leading-relaxed border border-slate-200">
                Because feed formulation and veterinary healthcare are managed directly on-site, own
                herd milk provides an extraordinary ₹{herdEconomics.contributionPerLitre}/L margin
                buffer over retail realization.
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-blue-800">Farmer Procurement Economics</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Milk Procured:</span>
                <span className="font-bold text-slate-900">
                  {reconciliation.farmerProcurementLitres.toLocaleString()} Litres / day
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Farmer Milk Payout:</span>
                <span className="text-amber-700">
                  ₹{procurementSummary.totalPayablePending.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Collection Centre Running Cost:</span>
                <span className="text-amber-700">₹2,800</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-sans text-slate-600">Bulk Milk Chilling:</span>
                <span className="text-amber-700">₹1,600</span>
              </div>
              <div className="flex justify-between p-2.5 bg-blue-50 text-blue-900 font-bold rounded-lg border border-blue-200">
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
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] font-sans text-slate-500 leading-relaxed border border-slate-200">
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
