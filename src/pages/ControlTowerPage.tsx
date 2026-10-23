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
  Sparkles,
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
                className="px-3.5 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <GitFork className="w-3.5 h-3.5 text-forest-700" />
                <span>Trace Flow</span>
              </button>
            )}
            <span className="px-3 py-1.5 bg-cream-50 text-stone-700 rounded-xl border border-[#ede8df] text-xs font-semibold">
              Shift: Active
            </span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold font-mono">
              Margin: {profitability.grossMarginPct}%
            </span>
          </div>
        }
      />

      {/* 2. Four Core Executive Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#ede8df] rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 font-sans uppercase tracking-wider mb-1">
            WHAT IS HAPPENING?
          </div>
          <div className="text-base font-bold text-forest-950 font-sans mb-1">
            {reconciliation.processingConsumptionLitres.toLocaleString()} L Processed
          </div>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Throughput on track. Cold pool balance maintained at{' '}
            <strong className="text-forest-950">{reconciliation.closingStockLitres.toLocaleString()} L</strong> across Silos.
          </p>
        </div>

        <div className="p-5 bg-rose-50/70 border border-rose-200/80 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 font-sans uppercase tracking-wider mb-1">
            WHAT IS GOING WRONG?
          </div>
          <div className="text-base font-bold text-rose-950 font-sans mb-1">
            {alerts.length} Operational Alerts
          </div>
          <p className="text-xs text-rose-900/90 font-sans leading-relaxed">
            Packaging buffer critical (1.9 days); farmer morning collection is below target quota by 8.9%.
          </p>
        </div>

        <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 font-sans uppercase tracking-wider mb-1">
            WHAT REQUIRES ATTENTION?
          </div>
          <div className="text-base font-bold text-amber-950 font-sans mb-1">
            Route 03 Logistics Drag
          </div>
          <p className="text-xs text-amber-900/90 font-sans leading-relaxed">
            Nadiad Route 03 margin is down due to dead mileage and highway delay. Tanker 2 arrived with temperature exception.
          </p>
        </div>

        <div className="p-5 bg-sage-50/70 border border-sage-200/80 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-forest-800 font-sans uppercase tracking-wider mb-1">
            EXECUTIVE ACTION REQUIRED
          </div>
          <div className="text-base font-bold text-forest-950 font-sans mb-1">
            2 Sign-Offs Pending
          </div>
          <p className="text-xs text-forest-900/90 font-sans leading-relaxed">
            Approve emergency 500ml pouch roll purchase order & authorize Borsad cluster procurement incentive.
          </p>
        </div>
      </div>

      {/* 3. Priority-Ranked Risks & Recommendations Matrix */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ede8df]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h2 className="text-base font-bold text-forest-950 font-sans">
              Priority-Ranked Operational Risks & Action Protocols
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            Ranked by Financial & Operational Impact
          </span>
        </div>

        <div className="space-y-4">
          {/* Rank 1: Critical */}
          <div className="p-4 bg-white border-l-4 border-l-rose-600 border border-[#ede8df] rounded-r-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  RANK 1 &bull; CRITICAL
                </span>
                <span className="text-sm font-bold text-forest-950 font-sans">
                  Packaging Stockout Risk (500ml Polypouch Film)
                </span>
              </div>
              <span className="text-xs font-mono text-rose-700 font-bold">
                1.9 Days Stock Remaining
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3 font-sans leading-relaxed">
              Current inventory stands at 15,660 pouches against daily consumption of ~8,200
              pouches. Without replenishment by tomorrow evening, HTST Line 1 packaging will halt.
            </p>
            <div className="bg-cream-50/70 border border-[#ede8df] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-forest-900 font-sans">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-stone-700 font-sans">
                  Release emergency PO to Supreme Flexipack for 40,000 rolls with express dispatch
                  surcharge (₹1,200).
                </span>
              </div>
              <button
                onClick={() => onNavigate('packaging')}
                className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Open Packaging Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 2: High */}
          <div className="p-4 bg-white border-l-4 border-l-amber-500 border border-[#ede8df] rounded-r-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  RANK 2 &bull; HIGH
                </span>
                <span className="text-sm font-bold text-forest-950 font-sans">
                  Milk Procurement Shortfall (Morning Shift 8.9% Below Quota)
                </span>
              </div>
              <span className="text-xs font-mono text-amber-800 font-bold">
                -280 Litres Deficit
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3 font-sans leading-relaxed">
              Borsad and Petlad farmers diverted ~280 L to local sweet makers offering cash
              advances. Pasteurizer capacity utilization is impacted by ₹1.80/L fixed cost dilution.
            </p>
            <div className="bg-cream-50/70 border border-[#ede8df] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-forest-900 font-sans">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-stone-700 font-sans">
                  Activate temporary quality fat bonus (+₹0.80/L on Fat &gt; 4.5%) for Borsad cluster
                  evening shift.
                </span>
              </div>
              <button
                onClick={() => onNavigate('farmers')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>View Farmer Allocations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 3: Medium */}
          <div className="p-4 bg-white border-l-4 border-l-forest-600 border border-[#ede8df] rounded-r-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sage-50 text-forest-800 border border-sage-200">
                  RANK 3 &bull; MEDIUM
                </span>
                <span className="text-sm font-bold text-forest-950 font-sans">
                  Route 03 Logistics Profitability Drag
                </span>
              </div>
              <span className="text-xs font-mono text-forest-800 font-bold">
                18.2% vs 31.4% Target Margin
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3 font-sans leading-relaxed">
              High mileage between Nadiad town drops and higher return rates for buttermilk (8
              pouches) erode delivery net margins.
            </p>
            <div className="bg-cream-50/70 border border-[#ede8df] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-forest-900 font-sans">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-stone-700 font-sans">
                  Re-sequence Route 03 stops, drop two low-volume retail points, and bundle
                  high-margin Paneer packs.
                </span>
              </div>
              <button
                onClick={() => onNavigate('distribution')}
                className="px-3.5 py-2 bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold rounded-xl shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Optimize Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rank 4: Low */}
          <div className="p-4 bg-white border-l-4 border-l-stone-400 border border-[#ede8df] rounded-r-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cream-100 text-stone-700 border border-[#ede8df]">
                  RANK 4 &bull; LOW
                </span>
                <span className="text-sm font-bold text-forest-950 font-sans">
                  Feed Supplier Price Revision (Concentrate Pellet +₹1.20/kg)
                </span>
              </div>
              <span className="text-xs font-mono text-stone-500 font-semibold">
                Cost Impact +₹0.45/L
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3 font-sans leading-relaxed">
              Amul feed plant issued price revision effective next Monday due to raw de-oiled rice
              bran escalation.
            </p>
            <div className="bg-cream-50/70 border border-[#ede8df] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-forest-900 font-sans">
                  RECOMMENDED MANAGEMENT DIRECTIVE:{' '}
                </span>
                <span className="text-xs text-stone-700 font-sans">
                  Contract 15 MT advance booking at existing wholesale tariff before price increment
                  takes effect.
                </span>
              </div>
              <button
                onClick={() => onNavigate('feed')}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
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

export default ControlTowerPage;
