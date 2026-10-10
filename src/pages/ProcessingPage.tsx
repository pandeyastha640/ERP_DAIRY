import React, { useState } from 'react';
import { ProcessingBatch } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import {
  Factory,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
  Warehouse,
  Boxes,
} from 'lucide-react';

interface ProcessingPageProps {
  batches?: ProcessingBatch[];
  onCreateBatch?: (batch: ProcessingBatch) => string | undefined;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ batches: propBatches, onCreateBatch: propOnCreateBatch }) => {
  const {
    batchesList: contextBatches,
    launchProcessingBatch,
    reconciliation,
    inventoryList,
  } = useDairyERP();

  const batches = propBatches || contextBatches;
  const onCreateBatch = propOnCreateBatch || launchProcessingBatch;

  const [activeBatch, setActiveBatch] = useState<ProcessingBatch | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Batch Form State
  const [line, setLine] = useState('Continuous HTST Line 1 (3000 LPH)');
  const [inputLitres, setInputLitres] = useState('1000');
  const [operator, setOperator] = useState('Rakesh Parmar (Plant Engineer)');
<<<<<<< Updated upstream
  const [recipe, setRecipe] = useState<'standard' | 'fluid' | 'curd' | 'ghee'>('standard');
=======
  const [submitError, setSubmitError] = useState('');
>>>>>>> Stashed changes

  const totalInput = batches.reduce((acc, b) => acc + b.inputMilkLitres, 0);
  const totalCost = batches.reduce((acc, b) => acc + b.processingCostTotal, 0);
  const avgYield = batches.length > 0 ? (batches.reduce((acc, b) => acc + b.yieldPercentage, 0) / batches.length).toFixed(1) : '98.2';
  const totalWastage = batches.reduce((acc, b) => acc + b.wastageLitres, 0);

  const availableMilkPool = reconciliation.closingStockLitres;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const batchNum = `BATCH-2026-${100 + batches.length + 1}`;
<<<<<<< Updated upstream
    const qtyInput = parseFloat(inputLitres) || 1000;

    let products = [
      { productName: 'Fresh Toned Milk 500ml', sku: 'SKU-MILK-TONED-500', outputQuantity: Math.round(qtyInput * 0.7), unit: 'Litres', standardFatPct: 3.0, standardSnfPct: 8.5 },
      { productName: 'Classic Creamy Curd 400g', sku: 'SKU-DAHI-400', outputQuantity: Math.round(qtyInput * 0.25), unit: 'Litres', standardFatPct: 4.0, standardSnfPct: 9.0 },
      { productName: 'Sweet Cream Balance for Ghee', sku: 'SKU-CREAM-BULK', outputQuantity: Math.round(qtyInput * 0.035), unit: 'Litres', standardFatPct: 40.0, standardSnfPct: 5.5 },
    ];

    if (recipe === 'fluid') {
      products = [
        { productName: 'Full Cream Gold Milk 1L', sku: 'SKU-MILK-GOLD-1L', outputQuantity: Math.round(qtyInput * 0.6), unit: 'Litres', standardFatPct: 6.0, standardSnfPct: 9.0 },
        { productName: 'Fresh Toned Milk 500ml', sku: 'SKU-MILK-TONED-500', outputQuantity: Math.round(qtyInput * 0.38), unit: 'Litres', standardFatPct: 3.0, standardSnfPct: 8.5 },
      ];
    } else if (recipe === 'curd') {
      products = [
        { productName: 'Classic Creamy Curd 400g', sku: 'SKU-DAHI-400', outputQuantity: Math.round(qtyInput * 0.85), unit: 'Litres', standardFatPct: 4.0, standardSnfPct: 9.0 },
        { productName: 'Sweet Cream Balance for Ghee', sku: 'SKU-CREAM-BULK', outputQuantity: Math.round(qtyInput * 0.12), unit: 'Litres', standardFatPct: 40.0, standardSnfPct: 5.5 },
      ];
    } else if (recipe === 'ghee') {
      products = [
        { productName: 'Pure Cow Desi Ghee 1L', sku: 'SKU-GHEE-1L', outputQuantity: Math.round(qtyInput * 0.35), unit: 'Litres', standardFatPct: 99.7, standardSnfPct: 0.1 },
        { productName: 'Fresh Toned Milk 500ml', sku: 'SKU-MILK-TONED-500', outputQuantity: Math.round(qtyInput * 0.60), unit: 'Litres', standardFatPct: 2.0, standardSnfPct: 8.8 },
      ];
    }

=======
    const qtyInput = Number(inputLitres);
    if (!Number.isFinite(qtyInput) || qtyInput <= 0) {
      setSubmitError('Enter a processing quantity greater than zero litres.');
      return;
    }
>>>>>>> Stashed changes
    const newBatch: ProcessingBatch = {
      id: `BATCH-${100 + batches.length + 1}`,
      batchId: batchNum,
      date: new Date().toISOString().split('T')[0],
      pasteurizerLine: line,
      inputMilkLitres: qtyInput,
      inputFatPct: 4.5,
      inputSnfPct: 8.7,
      products,
      yieldPercentage: 98.2,
      wastageLitres: Math.round(qtyInput * 0.015),
      processingCostTotal: Math.round(qtyInput * 5.85),
      status: 'In Progress',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completionTime: 'In Process',
      operator,
    };

    const error = onCreateBatch(newBatch);
    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitError('');
    setIsCreateModalOpen(false);
    setActiveBatch(newBatch);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dairy Processing & Pasteurization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            HTST continuous pasteurization, cream separation, homogenization, and multi-product batch yield conversions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Processing Batch</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard label="Raw Milk Available" value={`${availableMilkPool.toLocaleString()} L`} unit="" trend="neutral" changeText="Available in Silos" />
        <MetricCard label="Milk Processed" value={`${reconciliation.processingConsumptionLitres.toLocaleString()} L`} unit="" trend="neutral" changeText="Completed batches" />
        <MetricCard label="Active Batches" value={batches.length} unit="Batches" trend="up" changeText="Line 1 & 2" />
        <MetricCard label="Mean Yield Rate" value={`${avgYield}%`} unit="" trend="up" changeText="98.1% benchmark" />
        <MetricCard label="Line Loss / Wastage" value={`${reconciliation.spillageWastageLitres.toLocaleString()} L`} unit="" trend="down" isGoodWhenUp={false} changeText="Line rinse loss" />
        <MetricCard label="Processing Cost" value={`₹${(totalCost / 1000).toFixed(1)}k`} unit="" trend="neutral" changeText="Energy & Steam" />
      </div>

      {/* CONNECTED CONVERSION FLOW BANNER */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-blue-700" />
          <span className="font-semibold text-slate-900 font-sans">Silo Milk Pool ({availableMilkPool.toLocaleString()} L Available)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <Factory className="w-4 h-4 text-amber-700" />
          <span className="text-slate-700">HTST Processing</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <Boxes className="w-4 h-4 text-emerald-700" />
          <span className="text-emerald-700">Auto-Updates Finished Goods Inventory</span>
        </div>
        <div className="text-[11px] text-slate-500 font-sans">
          Launching a batch deducts milk from Silos and generates finished SKU stock automatically.
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Production Batch Log</h3>
          <span className="text-xs font-mono text-slate-500">Click row to inspect output yield ledger</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Batch ID</th>
                <th className="px-4 py-2.5 font-medium">Line / Pasteurizer</th>
                <th className="px-4 py-2.5 font-medium">Raw Input</th>
                <th className="px-4 py-2.5 font-medium">Standardized Products</th>
                <th className="px-4 py-2.5 font-medium">Yield %</th>
                <th className="px-4 py-2.5 font-medium">Wastage</th>
                <th className="px-4 py-2.5 font-medium">Batch Cost</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => setActiveBatch(batch)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-blue-700">{batch.batchId}</td>
                  <td className="px-4 py-3 font-sans text-slate-900">{batch.pasteurizerLine}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{batch.inputMilkLitres.toLocaleString()} L</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="text-slate-700 font-medium">{batch.products[0]?.productName}</div>
                    <div className="text-[11px] text-slate-500">+{batch.products.length - 1} secondary co-products</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{batch.yieldPercentage}%</td>
                  <td className="px-4 py-3 text-rose-700">{batch.wastageLitres} L</td>
                  <td className="px-4 py-3 text-slate-900">₹{batch.processingCostTotal.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={batch.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBatch(batch);
                      }}
                      className="px-2 py-1 bg-slate-50 hover:bg-[#30363d] text-slate-700 rounded text-[11px] font-sans transition-colors"
                    >
                      Inspect Yield
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED BATCH MODAL */}
      {activeBatch && (
        <EntityDetailDrawer
          isOpen={!!activeBatch}
          onClose={() => setActiveBatch(null)}
          title={`Batch Specification: ${activeBatch.batchId}`}
          subtitle={`${activeBatch.pasteurizerLine} · Started: ${activeBatch.startTime}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Raw Milk Inward</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{activeBatch.inputMilkLitres} L</div>
                <div className="text-[10px] text-slate-500 font-sans">{activeBatch.inputFatPct}% Fat · {activeBatch.inputSnfPct}% SNF</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Batch Yield Rate</div>
                <div className="text-lg font-bold text-emerald-700 mt-1">{activeBatch.yieldPercentage}%</div>
                <div className="text-[10px] text-slate-500 font-sans">{activeBatch.wastageLitres} L total loss</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Processing Cost</div>
                <div className="text-lg font-bold text-amber-700 mt-1">₹{activeBatch.processingCostTotal}</div>
                <div className="text-[10px] text-slate-500 font-sans">₹{(activeBatch.processingCostTotal / activeBatch.inputMilkLitres).toFixed(2)}/L line cost</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Batch Operator</div>
                <div className="text-sm font-bold text-blue-700 mt-1 truncate">{activeBatch.operator}</div>
                <div className="text-[10px] text-slate-500 font-sans">Shift Engineer</div>
              </div>
            </div>

            {/* Product Output Yield Breakdown */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-900 font-sans mb-3">
                Standardized Finished Output Breakdown
              </div>
              <div className="space-y-2">
                {activeBatch.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded border border-slate-100"
                  >
                    <div>
                      <div className="font-sans font-semibold text-slate-900">{p.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.sku} · Spec: {p.standardFatPct}% Fat / {p.standardSnfPct}% SNF
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700">
                        {p.outputQuantity} {p.unit}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">Output packaged</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="font-sans text-[11px] text-slate-500">Status: {activeBatch.status}</span>
              <button
                onClick={() => setActiveBatch(null)}
                className="px-4 py-2 bg-slate-50 text-slate-900 rounded text-xs hover:bg-[#30363d]"
              >
                Close Batch View
              </button>
            </div>
          </div>
        </EntityDetailDrawer>
      )}

      {/* CREATE BATCH MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch New Pasteurization & Processing Batch"
        subtitle="Deduct raw milk from cold silo pool and initialize HTST pasteurization sequence"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          {submitError && <p role="alert" className="text-xs text-rose-700">{submitError}</p>}
          <div>
<<<<<<< Updated upstream
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Production Recipe &amp; Output BOM</label>
            <select
              value={recipe}
              onChange={(e) => setRecipe(e.target.value as any)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]"
            >
              <option value="standard">Standard Multi-Product Run (70% Toned Milk, 25% Curd, 3.5% Cream)</option>
              <option value="fluid">Fluid Market Milk Run (60% Full Cream 1L, 38% Toned Milk 500ml)</option>
              <option value="curd">Fermented Dahi / Curd Run (85% Classic Curd 400g, 12% Cream Balance)</option>
              <option value="ghee">Desi Cow Ghee &amp; Butter Run (35% Ghee 1L, 60% Skimmed Milk)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Processing Line</label>
=======
            <label className="block text-xs font-medium text-slate-500 mb-1">Processing Line</label>
>>>>>>> Stashed changes
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900"
            >
              <option value="Continuous HTST Line 1 (3000 LPH)">Continuous HTST Line 1 (3000 LPH)</option>
              <option value="Batch Vat Pasteurizer 2 (1500 L)">Batch Vat Pasteurizer 2 (1500 L)</option>
              <option value="Paneer Coagulation Vat 3 (800 L)">Paneer Coagulation Vat 3 (800 L)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Input Raw Milk Volume (Litres)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={inputLitres}
              onChange={(e) => setInputLitres(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Shift Engineer / Operator</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              Start HTST Processing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
