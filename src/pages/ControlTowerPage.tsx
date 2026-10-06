import React from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  AlertCard,
} from '../components/common/DesignSystem';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  GitFork,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ControlTowerPageProps {
  onNavigate: (module: string) => void;
  onOpenTracer?: () => void;
}

export const ControlTowerPage: React.FC<ControlTowerPageProps> = ({
  onNavigate,
  onOpenTracer,
}) => {
  const { reconciliation, profitability, alerts, currentFacility, currentDateFilter } =
    useDairyERP();
  const criticalCount = alerts.filter((a) => a.priority === 'Critical').length;

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title="Management Control Tower"
        subtitle="Operational triage answering: 'What is happening?', 'What is going wrong?', and 'What should management do right now?'"
        facility={currentFacility}
        dateFilter={currentDateFilter}
        statusBadge={
          criticalCount > 0 ? `${criticalCount} Critical Risks Active` : 'All Streams Operational'
        }
        actions={
          <div className="flex items-center gap-2">
            {onOpenTracer && (
              <button
                onClick={onOpenTracer}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <GitFork className="w-3.5 h-3.5 text-emerald-700" />
                <span>Trace Flow</span>
              </button>
            )}
            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium">
              Shift: Active
            </span>
            <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold">
              Margin: {profitability.grossMarginPct}%
            </span>
          </div>
        }
      />

      {/* 2. Four Core Executive Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">WHAT IS HAPPENING?</div>
          <div className="text-base font-bold text-slate-900 mb-1">
            {reconciliation.processingConsumptionLitres.toLocaleString()} L Processed
          </div>
          <p className="text-xs text-slate-600">
            Throughput on track. Cold pool balance maintained at{' '}
            {reconciliation.closingStockLitres.toLocaleString()} L across Silos.
          </p>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-lg shadow-2xs">
          <div className="text-xs font-semibold text-rose-800 mb-1">WHAT IS GOING WRONG?</div>
          <div className="text-base font-bold text-rose-900 mb-1">
            {alerts.length} Operational Alerts
          </div>
          <p className="text-xs text-rose-800">
            Packaging buffer critical (1.9 days); farmer morning collection is below target quota by 8.9%.
          </p>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg shadow-2xs">
          <div className="text-xs font-semibold text-amber-800 mb-1">WHAT REQUIRES ATTENTION?</div>
          <div className="text-base font-bold text-amber-900 mb-1">Route 03 Logistics Drag</div>
          <p className="text-xs text-amber-800">
            Nadiad Route 03 margin is down due to dead mileage and highway delay. Tanker 2 arrived with temperature exception.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 mb-1">EXECUTIVE ACTION REQUIRED</div>
          <div className="text-base font-bold text-emerald-900 mb-1">2 Sign-Offs Pending</div>
          <p className="text-xs text-emerald-800">
            Approve emergency 500ml pouch roll purchase order & authorize Borsad cluster procurement incentive.
          </p>
        </div>
      </div>

      {/* 3. Priority-Ranked Risks & Recommendations Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Priority-Ranked Operational Risks & Action Protocols
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Ranked by Financial & Operational Impact
          </span>
        </div>

        <div className="space-y-4">
          {/* Rank 1: Critical */}
          <div className="p-4 bg-white border-l-4 border-l-rose-600 border border-slate-200 rounded-r-lg shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  RANK 1 · CRITICAL
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Packaging Stockout Risk (500ml Polypouch Film)
                </span>
              </div>
              <span className="text-xs font-mono text-rose-700 font-semibold">
                1.9 Days Stock Remaining
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Current inventory stands at 15,660 pouches against daily consumption of ~8,200
              pouches. Without replenishment by tomorrow evening, HTST Line 1 packaging will halt.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-slate-600">
                  Release emergency PO to Supreme Flexipack for 40,000 rolls with express dispatch
                  surcharge (₹1,200).
                </span>
              </div>
              <button
                onClick={() => onNavigate('packaging')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>Open Packaging Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 2: High */}
          <div className="p-4 bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-r-lg shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  RANK 2 · HIGH
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Milk Procurement Shortfall (Morning Shift 8.9% Below Quota)
                </span>
              </div>
              <span className="text-xs font-mono text-amber-700 font-semibold">
                -280 Litres Deficit
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Borsad and Petlad farmers diverted ~280 L to local sweet makers offering cash
              advances. Pasteurizer capacity utilization is impacted by ₹1.80/L fixed cost dilution.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-slate-600">
                  Activate temporary quality fat bonus (+₹0.80/L on Fat &gt; 4.5%) for Borsad cluster
                  evening shift.
                </span>
              </div>
              <button
                onClick={() => onNavigate('farmers')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>View Farmer Allocations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 3: Medium */}
          <div className="p-4 bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-r-lg shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  RANK 3 · MEDIUM
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Route 03 Logistics Profitability Drag
                </span>
              </div>
              <span className="text-xs font-mono text-blue-700 font-semibold">
                18.2% vs 31.4% Target Margin
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              High mileage between Nadiad town drops and higher return rates for buttermilk (8
              pouches) erode delivery net margins.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-slate-600">
                  Re-sequence Route 03 stops, drop two low-volume retail points, and bundle
                  high-margin Paneer packs.
                </span>
              </div>
              <button
                onClick={() => onNavigate('distribution')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>Optimize Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 4: Low */}
          <div className="p-4 bg-white border-l-4 border-l-slate-400 border border-slate-200 rounded-r-lg shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  RANK 4 · LOW
                </span>
                <span className="text-sm font-bold text-slate-900">
                  Feed Supplier Price Revision (Concentrate Pellet +₹1.20/kg)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                Cost Impact +₹0.45/L
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Amul feed plant issued price revision effective next Monday due to raw de-oiled rice
              bran escalation.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-slate-600">
                  Contract 15 MT advance booking at existing wholesale tariff before price increment
                  takes effect.
                </span>
              </div>
              <button
                onClick={() => onNavigate('feed')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>Review Feed Ration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
