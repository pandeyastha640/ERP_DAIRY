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
  Milk,
  Truck,
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
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_-4px_rgba(27,67,50,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)]">
      {/* Specular top highlight */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-200/60 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f] animate-pulse shadow-[0_0_8px_#2d6a4f]" />
            <h3 className="text-base font-bold text-[#0f2319] tracking-tight font-sans">
              Operational Milk & Money Flow Pipeline
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f0f7f2] text-[#1b4332] border border-[#cbe5d4] shadow-2xs">
              Closed Loop
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Real-time volumetric conversion & value cascade from farm-gate procurement to consumer delivery.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white/80 text-[#1b4332] font-semibold text-[11px] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]" />
            Cold-Chain (3.8°C)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white/80 text-stone-700 font-semibold text-[11px] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
            FSSAI Verified
          </span>
        </div>
      </div>

      {/* Main Connected Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-stretch relative z-10">
        {/* Step 1: Upstream Inward Streams */}
        <div className="flex flex-col gap-2.5">
          {/* Own Cattle Herd */}
          <button
            onClick={() => onSelectStage('cattle')}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 active:scale-[0.98] ${
              activeStage === 'cattle'
                ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_6px_16px_rgba(27,67,50,0.1)]'
                : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">

              <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-[#2d6a4f]" />
                Own Herd
              </span>
              <span className="text-[10px] font-mono text-[#1b4332] font-bold bg-[#f0f7f2] px-1.5 py-0.2 rounded border border-[#cbe5d4]">
                Stream A
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-[#1b4332] tabular-nums">
              {ownLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-medium">4.35% Fat · 8.78 SNF</div>
          </button>

          {/* Farmer Procurement */}
          <button
            onClick={() => onSelectStage('farmers')}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 active:scale-[0.98] ${
              activeStage === 'farmers'
                ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_6px_16px_rgba(27,67,50,0.1)]'
                : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
                <Users className="w-3.5 h-3.5 text-[#2d6a4f]" />
                Farmer Intake
              </span>
              <span className="text-[10px] font-mono text-[#1b4332] font-bold bg-[#f0f7f2] px-1.5 py-0.2 rounded border border-[#cbe5d4]">
                Stream B
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-[#1b4332] tabular-nums">
              {farmerLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-stone-500 mt-1 font-medium">32 Pourers · Avg ₹39.1/L</div>
          </button>
        </div>

        {/* Step 2: Milk Pool & Chilling */}
        <button
          onClick={() => onSelectStage('chilling')}
          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.98] ${
            activeStage === 'chilling'
              ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_8px_20px_rgba(27,67,50,0.12)]'
              : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
              <Filter className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Silos Pool
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-white">Step 2</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#0f2319] tabular-nums">
              {poolLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-stone-500 mt-1">Vats A, B, C & D Combined</div>
          </div>
          <div className="pt-2.5 border-t border-stone-200/60 mt-2.5 text-[11px] text-[#2d6a4f] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] shadow-[0_0_6px_#2d6a4f]" />
            Passes MBRT & Alcohol test
          </div>
        </button>

        {/* Step 3: Dairy Processing */}
        <button
          onClick={() => onSelectStage('processing')}
          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.98] ${
            activeStage === 'processing'
              ? 'bg-gradient-to-br from-[#fefbf3] to-white/95 border-[#c59b27] text-[#0f2319] ring-2 ring-[#c59b27]/20 shadow-[0_8px_20px_rgba(197,155,39,0.15)]'
              : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#f0e2bd] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
              <Factory className="w-3.5 h-3.5 text-[#c59b27]" />
              Processing
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-white">Step 3</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#855e16] tabular-nums">
              {processedLitres.toLocaleString()} L
            </div>
            <div className="text-[11px] text-stone-500 mt-1">HTST Continuous Line</div>
          </div>
          <div className="pt-2.5 border-t border-stone-200/60 mt-2.5 text-[11px] text-stone-600 font-medium">
            98.4% Yield · 62L line loss
          </div>
        </button>

        {/* Step 4: Finished Goods Products */}
        <button
          onClick={() => onSelectStage('inventory')}
          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.98] ${
            activeStage === 'inventory'
              ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_8px_20px_rgba(27,67,50,0.12)]'
              : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
              <Package className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Packaged SKUs
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-white">Step 4</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1b4332] tabular-nums">
              {productUnits.toLocaleString()} units
            </div>
            <div className="text-[11px] text-stone-500 mt-1">8 Finished Goods SKUs</div>
          </div>
          <div className="pt-2.5 border-t border-stone-200/60 mt-2.5 text-[11px] text-stone-600 font-medium">
            Pouches, tubs, glass bottles
          </div>
        </button>

        {/* Step 5: Sales & Revenue */}
        <button
          onClick={() => onSelectStage('sales')}
          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.98] ${
            activeStage === 'sales'
              ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_8px_20px_rgba(27,67,50,0.12)]'
              : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
              <ShoppingCart className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Dispatched Sales
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-white">Step 5</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1b4332] tabular-nums">
              ₹{(salesRevenue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-stone-500 mt-1">6 Active Reefer Routes</div>
          </div>
          <div className="pt-2.5 border-t border-stone-200/60 mt-2.5 text-[11px] text-[#2d6a4f] font-semibold">
            ₹{(salesRevenue / Math.max(1, poolLitres)).toFixed(1)}/L Realization
          </div>
        </button>

        {/* Step 6: Operating Profit Contribution */}
        <button
          onClick={() => onSelectStage('finance')}
          className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 active:scale-[0.98] ${
            activeStage === 'finance'
              ? 'bg-gradient-to-br from-[#eef6f0] to-white/95 border-[#1b4332] text-[#0f2319] ring-2 ring-[#1b4332]/20 shadow-[0_8px_20px_rgba(27,67,50,0.12)]'
              : 'bg-white/70 hover:bg-white border-white/80 hover:border-[#b7e4c7] text-stone-800 shadow-[0_2px_8px_rgba(27,67,50,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0f2319] flex items-center gap-1.5 font-sans">
              <TrendingUp className="w-3.5 h-3.5 text-[#2d6a4f]" />
              Operating Profit
            </span>
            <span className="text-[10px] font-mono text-stone-400 font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-white">Step 6</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-[#1b4332] tabular-nums">
              ₹{(profitAmount / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-stone-500 mt-1">All operating costs deducted</div>
          </div>
          <div className="pt-2.5 border-t border-stone-200/60 mt-2.5 text-[11px] text-[#1b4332] font-bold">
            +₹{(profitAmount / Math.max(1, poolLitres)).toFixed(2)} / L Margin
          </div>
        </button>
      </div>
    </div>
  );
};

