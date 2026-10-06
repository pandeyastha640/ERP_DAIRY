import React from 'react';
import {
  Warehouse,
  Users,
  Filter,
  Factory,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface MilkFlowDiagramProps {
  onSelectStage: (stageId: string) => void;
  activeStage?: string;
  ownLitres?: number;
  farmerLitres?: number;
  poolLitres?: number;
  processedLitres?: number;
  productUnits?: number;
  salesRevenue?: number;
  profitAmount?: number;
}

export const MilkFlowDiagram: React.FC<MilkFlowDiagramProps> = ({
  onSelectStage,
  activeStage,
  ownLitres = 1240,
  farmerLitres = 2860,
  poolLitres = 4100,
  processedLitres = 3860,
  productUnits = 3450,
  salesRevenue = 186400,
  profitAmount = 42200,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operational Milk & Money Flow Pipeline</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Closed Loop
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Volumetric conversion and real-time margin cascade from farm gate to consumer settlement.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Cold-Chain (3.8°C)
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            QC Verified
          </span>
        </div>
      </div>

      {/* Main Connected Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-stretch">
        {/* Step 1: Upstream Inward Streams */}
        <div className="flex flex-col gap-2">
          {/* Own Cattle Herd */}
          <button
            onClick={() => onSelectStage('cattle')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              activeStage === 'cattle'
                ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-emerald-700" />
                Own Herd
              </span>
              <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-1 rounded">
                Stream A
              </span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-800 tabular-nums">
              {ownLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">4.35% Fat · 8.78 SNF</div>
          </button>

          {/* Farmer Procurement */}
          <button
            onClick={() => onSelectStage('farmers')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              activeStage === 'farmers'
                ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-700" />
                Farmer Supply
              </span>
              <span className="text-[10px] font-mono text-blue-800 font-semibold bg-blue-50 px-1 rounded">
                Stream B
              </span>
            </div>
            <div className="text-base font-bold font-mono text-blue-700 tabular-nums">
              {farmerLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">32 Pourers · Rate ₹45/L</div>
          </button>
        </div>

        {/* Step 2: Milk Pool & Chilling */}
        <button
          onClick={() => onSelectStage('chilling')}
          className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'chilling'
              ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              Milk Pool (Silos)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Step 2</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {poolLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Silos A, B, C combined</div>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[11px] text-emerald-800 font-medium">
            Passes MBRT & Alcohol test
          </div>
        </button>

        {/* Step 3: Dairy Processing */}
        <button
          onClick={() => onSelectStage('processing')}
          className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'processing'
              ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-amber-600" />
              Processing
            </span>
            <span className="text-[10px] font-mono text-slate-500">Step 3</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-amber-700 tabular-nums">
              {processedLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Pasteurization & Curd/Ghee</div>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[11px] text-slate-600">
            Yield 98.4% · 62L line loss
          </div>
        </button>

        {/* Step 4: Finished Goods Products */}
        <button
          onClick={() => onSelectStage('inventory')}
          className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'inventory'
              ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              Products Packaged
            </span>
            <span className="text-[10px] font-mono text-slate-500">Step 4</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-emerald-800 tabular-nums">
              {productUnits.toLocaleString()} units
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Packaged across 8 SKUs</div>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[11px] text-slate-600">
            Pouches, tubs, glass jars
          </div>
        </button>

        {/* Step 5: Sales & Revenue */}
        <button
          onClick={() => onSelectStage('sales')}
          className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'sales'
              ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-700" />
              Dispatched Sales
            </span>
            <span className="text-[10px] font-mono text-slate-500">Step 5</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-blue-700 tabular-nums">
              ₹{(salesRevenue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-slate-500 mt-1">6 Routes · Dispatched</div>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[11px] text-emerald-800 font-medium">
            ₹{(salesRevenue / Math.max(1, poolLitres)).toFixed(1)}/L Realization
          </div>
        </button>

        {/* Step 6: Operating Profit Contribution */}
        <button
          onClick={() => onSelectStage('finance')}
          className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
            activeStage === 'finance'
              ? 'bg-emerald-50/80 border-emerald-600 text-slate-900 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              Operating Profit
            </span>
            <span className="text-[10px] font-mono text-slate-500">Step 6</span>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
              ₹{(profitAmount / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-slate-500 mt-1">All operating costs deducted</div>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2 text-[11px] text-emerald-800 font-bold">
            +₹{(profitAmount / Math.max(1, poolLitres)).toFixed(2)} / Litre Margin
          </div>
        </button>
      </div>
    </div>
  );
};
