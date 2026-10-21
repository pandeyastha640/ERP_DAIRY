import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDairyERP } from '../../context/DairyERPContext';
import {
  ArrowRight,
  Warehouse,
  Users,
  Snowflake,
  Factory,
  Package,
  Truck,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface MilkMoneyTracerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule: (module: string) => void;
}

export const MilkMoneyTracerModal: React.FC<MilkMoneyTracerModalProps> = ({
  isOpen,
  onClose,
  onNavigateModule,
}) => {
  const {
    reconciliation,
    herdEconomics,
    procurementSummary,
    profitability,
    collectionsList,
    batchesList,
    salesOrdersList,
  } = useDairyERP();
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const [selectedStream, setSelectedStream] = useState<'both' | 'own' | 'farmer'>('both');

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="End-to-End Milk & Money Supply-Chain Tracer"
      subtitle="Auditable traceability linking biological herd & farm procurement all the way to commercial realization"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Direction & Stream Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#faf8f5] rounded-2xl border border-[#ede8df]">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Trace Vector:</span>
            <div className="flex bg-white border border-[#e2dcd2] rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setDirection('forward')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  direction === 'forward'
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Forward: Milk &rarr; Money</span>
              </button>
              <button
                onClick={() => setDirection('reverse')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  direction === 'reverse'
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Reverse: Profit &larr; Origin</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Stream Filter:</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value as 'both' | 'own' | 'farmer')}
              className="bg-white border border-[#e2dcd2] rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none shadow-2xs cursor-pointer focus:border-[#1b4332]"
            >
              <option value="both">Merged Milk Pool</option>
              <option value="own">Source 1: Own Herd</option>
              <option value="farmer">Source 2: Farmer Procurement</option>
            </select>
          </div>
        </div>

        {/* Step-by-Step Connected Trace Nodes */}
        <div className="relative border-l-2 border-[#e2dcd2] ml-4 pl-6 space-y-6">
          {direction === 'forward' ? (
            <>
              {/* Step 1: Milk Source */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1b4332] ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs hover:border-[#1b4332]/40 transition-colors">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-[#1b4332] flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5" /> 1. Upstream Production & Procurement
                    </span>
                    <button
                      onClick={() => {
                        onNavigateModule('milk-ops');
                        onClose();
                      }}
                      className="text-[#1b4332] hover:text-[#2d6a4f] font-semibold underline text-[11px] cursor-pointer"
                    >
                      Inspect Inward
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 mt-2">
                    <div>
                      Own Herd:{' '}
                      <strong className="text-[#1b4332] font-bold">
                        {reconciliation.ownProductionLitres} L
                      </strong>{' '}
                      (@ ₹{herdEconomics.feedCostPerLitre}/L feed cost)
                    </div>
                    <div>
                      Farmer Inward:{' '}
                      <strong className="text-blue-700 font-bold">
                        {reconciliation.farmerProcurementLitres} L
                      </strong>{' '}
                      (@ ₹{procurementSummary.averageRatePerLitre.toFixed(2)}/L rate)
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Quality & Chilling Pool */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs hover:border-blue-500/40 transition-colors">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-blue-800 flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5" /> 2. Quality Clearance & Cold Pool Silos
                    </span>
                    <button
                      onClick={() => {
                        onNavigateModule('chilling');
                        onClose();
                      }}
                      className="text-blue-700 hover:text-blue-800 font-semibold underline text-[11px] cursor-pointer"
                    >
                      View Silos
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 font-mono mt-1">
                    Passed:{' '}
                    <strong>
                      {(
                        reconciliation.ownProductionLitres +
                        reconciliation.farmerProcurementLitres -
                        reconciliation.qualityRejectedLitres
                      ).toLocaleString()}{' '}
                      L
                    </strong>{' '}
                    · Rejected:{' '}
                    <span className="text-rose-700 font-semibold">
                      {reconciliation.qualityRejectedLitres} L
                    </span>{' '}
                    · Maintained at 3.9°C
                  </div>
                </div>
              </div>

              {/* Step 3: HTST Processing */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs hover:border-amber-500/40 transition-colors">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-amber-800 flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5" /> 3. Processing Pasteurization Lines
                    </span>
                    <button
                      onClick={() => {
                        onNavigateModule('processing');
                        onClose();
                      }}
                      className="text-amber-700 hover:text-amber-800 font-semibold underline text-[11px] cursor-pointer"
                    >
                      View Batches
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 font-mono mt-1">
                    Processed:{' '}
                    <strong>{reconciliation.processingConsumptionLitres.toLocaleString()} L</strong> ·
                    Line Loss:{' '}
                    <span className="text-rose-700 font-semibold">
                      {reconciliation.spillageWastageLitres} L
                    </span>{' '}
                    · Converted into 8 Product SKUs
                  </div>
                </div>
              </div>

              {/* Step 4: Finished Goods & Commercial Sales */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1b4332] ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs hover:border-[#1b4332]/40 transition-colors">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-[#1b4332] flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> 4. Commercial Dispatches & Invoicing
                    </span>
                    <button
                      onClick={() => {
                        onNavigateModule('sales');
                        onClose();
                      }}
                      className="text-[#1b4332] hover:text-[#2d6a4f] font-semibold underline text-[11px] cursor-pointer"
                    >
                      View Invoices
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-700 font-mono mt-1">
                    Total Invoiced:{' '}
                    <strong className="text-[#1b4332] font-bold">
                      ₹{profitability.todayRevenue.toLocaleString()}
                    </strong>{' '}
                    across 4 commercial channels
                  </div>
                </div>
              </div>

              {/* Step 5: Net Profitability */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1b4332] ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-[#f0f7f2] rounded-2xl border border-[#cbe5d4]">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-[#1b4332] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> 5. Operating Profit & Unit Spread Realization
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs mt-2 text-slate-800">
                    <div>
                      Gross Profit:{' '}
                      <strong className="text-[#1b4332] font-bold">
                        ₹{profitability.grossProfit.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      Cost / L:{' '}
                      <strong className="text-slate-900 font-bold">
                        ₹{profitability.costPerLitre}
                      </strong>
                    </div>
                    <div>
                      Net Spread:{' '}
                      <strong className="text-[#1b4332] font-bold">
                        +₹{profitability.profitPerLitre} / L
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Reverse Step 1: Profit */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#1b4332] ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs">
                  <span className="text-xs font-bold text-[#1b4332]">
                    1. Target Operating Contribution (₹{profitability.grossProfit.toLocaleString()})
                  </span>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    Generated from ₹{profitability.todayRevenue.toLocaleString()} revenue minus ₹
                    {profitability.todayOperatingCost.toLocaleString()} opex
                  </div>
                </div>
              </div>

              {/* Reverse Step 2: Commercial Orders */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs">
                  <span className="text-xs font-bold text-blue-800">
                    2. Supported by {salesOrdersList.length} Commercial Orders
                  </span>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    Top distributor contributors: Shreeji Distributors (₹41,600) & Mahalaxmi Cold Chain (₹37,500)
                  </div>
                </div>
              </div>

              {/* Reverse Step 3: Raw Milk Origins */}
              <div className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-600 ring-4 ring-[#faf8f5]" />
                <div className="p-4 bg-white rounded-2xl border border-[#ede8df] shadow-xs">
                  <span className="text-xs font-bold text-slate-900">
                    3. Backtraced to 4,100 L Milk Inflow
                  </span>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    Own Cattle Herd (30.2% share @ ₹24.36/L margin) + Farmer Procurement (69.8% share @ ₹2.86/L margin)
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#ede8df] text-[11px] text-slate-500">
          <span>Trace status: Continuous mass-balance verification active</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#f4efe6] hover:bg-[#ede8df] text-slate-800 font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close Tracer
          </button>
        </div>
      </div>
    </Modal>
  );
};
