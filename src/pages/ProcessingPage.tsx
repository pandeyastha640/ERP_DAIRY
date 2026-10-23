import React, { useState } from 'react';
import { ProcessingBatch } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
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
  Search,
  Sparkles,
} from 'lucide-react';

interface ProcessingPageProps {
  batches?: ProcessingBatch[];
  onCreateBatch?: (batch: ProcessingBatch) => void;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ batches: propBatches, onCreateBatch: propOnCreateBatch }) => {
  const {
    batchesList: contextBatches,
    launchProcessingBatch,
    reconciliation,
    inventoryList,
    setCurrentModule,
  } = useDairyERP();

  const batches = propBatches || contextBatches;
  const onCreateBatch = propOnCreateBatch || launchProcessingBatch;

  const [activeBatch, setActiveBatch] = useState<ProcessingBatch | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [batchSearch, setBatchSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress'>('All');
  const [lineFilter, setLineFilter] = useState('All');

  // New Batch Form State
  const [line, setLine] = useState('Continuous HTST Line 1 (3000 LPH)');
  const [inputLitres, setInputLitres] = useState('1000');
  const [operator, setOperator] = useState('Sample Plant Operator');
  const [recipe, setRecipe] = useState<'standard' | 'fluid' | 'curd' | 'ghee'>('standard');

  const totalInput = batches.reduce((acc, b) => acc + b.inputMilkLitres, 0);
  const totalCost = batches.reduce((acc, b) => acc + b.processingCostTotal, 0);
  const avgYield = batches.length > 0 ? (batches.reduce((acc, b) => acc + b.yieldPercentage, 0) / batches.length).toFixed(1) : '98.2';
  const totalWastage = batches.reduce((acc, b) => acc + b.wastageLitres, 0);

  const availableMilkPool = reconciliation.closingStockLitres;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const batchNum = `BATCH-2026-${100 + batches.length + 1}`;
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

    onCreateBatch(newBatch);
    setIsCreateModalOpen(false);
  };

  const filteredBatches = batches.filter((b) => {
    const mSearch = b.batchId.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.pasteurizerLine.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.operator.toLowerCase().includes(batchSearch.toLowerCase());
    const mStatus = statusFilter === 'All' || b.status === statusFilter;
    const mLine = lineFilter === 'All' || b.pasteurizerLine.includes(lineFilter);
    return mSearch && mStatus && mLine;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Factory className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Dairy Processing & Pasteurization
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                HTST Continuous 72°C/15s
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              HTST continuous pasteurization, cream separation, homogenization, and multi-product batch yield conversions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Processing Batch</span>
        </button>
      </div>

      {/* Stage Flow Navigation Links */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <span className="text-stone-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">Processing Stream:</span>
        <button
          onClick={() => setCurrentModule('chilling')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Raw Milk Silo ({availableMilkPool.toLocaleString()} L)</span>
        </button>
        <button
          onClick={() => setCurrentModule('quality')}
          className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-[#ede8df] hover:border-amber-200 text-amber-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>QC Compliance Standards</span>
        </button>
        <button
          onClick={() => setCurrentModule('products')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>SKU Catalog & Recipes</span>
        </button>
        <button
          onClick={() => setCurrentModule('inventory')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Finished Goods Inventory</span>
        </button>
        <button
          onClick={() => setCurrentModule('finance')}
          className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Cost Allocation & Margins</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <div onClick={() => setCurrentModule('chilling')} className="cursor-pointer group" title="Click to view Silo inventory">
          <MetricCard label="Raw Milk Available" value={`${availableMilkPool.toLocaleString()} L`} unit="" trend="neutral" changeText="Available in Silos →" />
        </div>
        <div onClick={() => setCurrentModule('chilling')} className="cursor-pointer group" title="Click to view Bulk Milk Reconciliation">
          <MetricCard label="Milk Processed" value={`${reconciliation.processingConsumptionLitres.toLocaleString()} L`} unit="" trend="neutral" changeText="Completed batches →" />
        </div>
        <MetricCard label="Active Batches" value={batches.length} unit="Batches" trend="up" changeText="Line 1 & 2 operational" />
        <div onClick={() => setCurrentModule('reports')} className="cursor-pointer group" title="Click to view Yield analytics">
          <MetricCard label="Mean Yield Rate" value={`${avgYield}%`} unit="" trend="up" changeText="98.1% benchmark →" />
        </div>
        <div onClick={() => setCurrentModule('reports')} className="cursor-pointer group" title="Click to view Spillage & Line Rinse audit">
          <MetricCard label="Line Loss / Wastage" value={`${reconciliation.spillageWastageLitres.toLocaleString()} L`} unit="" trend="down" isGoodWhenUp={false} changeText="Line rinse loss →" />
        </div>
        <div onClick={() => setCurrentModule('finance')} className="cursor-pointer group" title="Click to view Energy & Cost ledger">
          <MetricCard label="Processing Cost" value={`₹${(totalCost / 1000).toFixed(1)}k`} unit="" trend="neutral" changeText="Energy & Steam →" />
        </div>
      </div>

      {/* CONNECTED CONVERSION FLOW BANNER */}
      <div className="p-4 bg-cream-50/70 border border-[#ede8df] rounded-xl text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentModule('chilling')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-forest-50 border border-[#ede8df] hover:border-forest-300 rounded-lg text-forest-950 font-bold shadow-2xs cursor-pointer transition-all active:scale-98"
            title="Inspect Chilling Silo Tank Level"
          >
            <Warehouse className="w-3.5 h-3.5 text-forest-700" />
            <span>Silo Milk Pool ({availableMilkPool.toLocaleString()} L Available) →</span>
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#ede8df] rounded-lg text-stone-700 font-medium shadow-2xs">
            <Factory className="w-3.5 h-3.5 text-amber-600" />
            <span>HTST Continuous Processing (Active)</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          <button
            onClick={() => setCurrentModule('inventory')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-900 hover:bg-forest-800 border border-forest-950 rounded-lg text-white font-bold shadow-xs cursor-pointer transition-all active:scale-98"
            title="Inspect Finished Goods Stock Warehouses"
          >
            <Boxes className="w-3.5 h-3.5 text-sage-300" />
            <span>Auto-Updates Finished Goods Inventory →</span>
          </button>
        </div>
        <div className="text-[11px] text-stone-500 font-sans">
          Launching a batch deducts milk from Silos and generates finished SKU stock automatically.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={batchSearch}
            onChange={(e) => setBatchSearch(e.target.value)}
            placeholder="Search Batch ID, Line, or Operator..."
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Status:</span>
            <div className="flex bg-cream-50 border border-[#ede8df] rounded-xl p-0.5 text-xs">
              {(['All', 'In Progress', 'Completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Line:</span>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Lines</option>
              <option value="HTST Line 1">Continuous HTST Line 1</option>
              <option value="Vat Pasteurizer 2">Batch Vat Pasteurizer 2</option>
            </select>
          </div>

          {(batchSearch !== '' || statusFilter !== 'All' || lineFilter !== 'All') && (
            <button
              onClick={() => {
                setBatchSearch('');
                setStatusFilter('All');
                setLineFilter('All');
              }}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-[#ede8df] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Production Batch Log</h3>
            <p className="text-[11px] text-stone-500">Live pasteurization runs, yield conversions and cost allocations</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            Showing {filteredBatches.length} of {batches.length} batches
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Batch ID</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Line / Pasteurizer</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Raw Input</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Standardized Products</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Yield %</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Wastage</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Batch Cost</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filteredBatches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => setActiveBatch(batch)}
                  className="hover:bg-cream-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-forest-900">{batch.batchId}</td>
                  <td className="px-4 py-3.5 font-sans font-medium text-stone-800">{batch.pasteurizerLine}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentModule('chilling');
                      }}
                      className="hover:underline text-forest-900 cursor-pointer font-bold inline-flex items-center gap-1 group"
                      title="Jump to Raw Silo Chilling Pool"
                    >
                      <span>{batch.inputMilkLitres.toLocaleString()} L</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-forest-700">→</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentModule('products');
                      }}
                      className="text-left cursor-pointer group hover:opacity-80"
                      title="Jump to Products & SKU Catalog"
                    >
                      <div className="text-stone-900 font-semibold group-hover:text-forest-800 group-hover:underline flex items-center gap-1">
                        <span>{batch.products[0]?.productName}</span>
                        <span className="text-[10px] text-stone-400">→</span>
                      </div>
                      <div className="text-[11px] text-stone-500">+{batch.products.length - 1} secondary co-products</div>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">{batch.yieldPercentage}%</td>
                  <td className="px-4 py-3.5 text-rose-700 font-medium">{batch.wastageLitres} L</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentModule('finance');
                      }}
                      className="hover:underline text-forest-950 cursor-pointer font-bold inline-flex items-center gap-1 group"
                      title="Jump to Financial Ledger & Cost Analysis"
                    >
                      <span>₹{batch.processingCostTotal.toLocaleString()}</span>
                      <span className="text-[10px] text-stone-400 group-hover:text-forest-700">→</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={batch.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBatch(batch);
                      }}
                      className="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
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
        <Modal
          isOpen={!!activeBatch}
          onClose={() => setActiveBatch(null)}
          title={`Batch Specification: ${activeBatch.batchId}`}
          subtitle={`${activeBatch.pasteurizerLine} · Started: ${activeBatch.startTime}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans">Raw Milk Inward</div>
                <div className="text-lg font-bold text-forest-950 mt-0.5">{activeBatch.inputMilkLitres} L</div>
                <div className="text-[10px] text-stone-500 font-sans">{activeBatch.inputFatPct}% Fat · {activeBatch.inputSnfPct}% SNF</div>
              </div>
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans">Batch Yield Rate</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">{activeBatch.yieldPercentage}%</div>
                <div className="text-[10px] text-stone-500 font-sans">{activeBatch.wastageLitres} L line loss</div>
              </div>
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans">Processing Cost</div>
                <div className="text-lg font-bold text-amber-700 mt-0.5">₹{activeBatch.processingCostTotal}</div>
                <div className="text-[10px] text-stone-500 font-sans">₹{(activeBatch.processingCostTotal / activeBatch.inputMilkLitres).toFixed(2)}/L line cost</div>
              </div>
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans">Batch Operator</div>
                <div className="text-sm font-bold text-forest-900 mt-0.5 truncate">{activeBatch.operator}</div>
                <div className="text-[10px] text-stone-500 font-sans">Shift Engineer</div>
              </div>
            </div>

            {/* Product Output Yield Breakdown */}
            <div className="p-4 bg-white rounded-xl border border-[#ede8df] shadow-2xs">
              <div className="text-xs font-bold text-forest-950 font-sans mb-3 flex items-center justify-between">
                <span>Standardized Finished Output Breakdown</span>
                <span className="text-[10px] text-forest-800 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-md font-mono">
                  {activeBatch.products.length} Products Formed
                </span>
              </div>
              <div className="space-y-2.5">
                {activeBatch.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-cream-50/60 rounded-xl border border-[#ede8df]"
                  >
                    <div>
                      <button
                        onClick={() => {
                          setActiveBatch(null);
                          setCurrentModule('products');
                        }}
                        className="font-sans font-bold text-forest-950 hover:underline hover:text-forest-700 text-left flex items-center gap-1 cursor-pointer"
                        title="View SKU in Products Catalog"
                      >
                        <span>{p.productName}</span>
                        <span className="text-[10px] text-stone-400">→</span>
                      </button>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {p.sku} · Spec: {p.standardFatPct}% Fat / {p.standardSnfPct}% SNF
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm font-bold text-emerald-800">
                          {p.outputQuantity} {p.unit}
                        </div>
                        <div className="text-[10px] text-stone-500 font-sans">Output packaged</div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveBatch(null);
                          setCurrentModule('inventory');
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-[#ede8df] text-forest-800 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors shadow-2xs"
                        title="Inspect finished inventory warehouse"
                      >
                        Stock →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#ede8df]">
              <span className="font-sans text-[11px] text-stone-500 font-medium">Status: {activeBatch.status}</span>
              <button
                onClick={() => setActiveBatch(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Batch View
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE BATCH MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch New Pasteurization & Processing Batch"
        subtitle="Deduct raw milk from cold silo pool and initialize HTST pasteurization sequence"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Production Recipe & Output BOM</label>
            <select
              value={recipe}
              onChange={(e) => setRecipe(e.target.value as any)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="standard">Standard Multi-Product Run (70% Toned Milk, 25% Curd, 3.5% Cream)</option>
              <option value="fluid">Fluid Market Milk Run (60% Full Cream 1L, 38% Toned Milk 500ml)</option>
              <option value="curd">Fermented Dahi / Curd Run (85% Classic Curd 400g, 12% Cream Balance)</option>
              <option value="ghee">Desi Cow Ghee & Butter Run (35% Ghee 1L, 60% Skimmed Milk)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Processing Line</label>
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="Continuous HTST Line 1 (3000 LPH)">Continuous HTST Line 1 (3000 LPH)</option>
              <option value="Batch Vat Pasteurizer 2 (1500 L)">Batch Vat Pasteurizer 2 (1500 L)</option>
              <option value="Paneer Coagulation Vat 3 (800 L)">Paneer Coagulation Vat 3 (800 L)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Input Raw Milk Volume (Litres)</label>
            <input
              type="number"
              value={inputLitres}
              onChange={(e) => setInputLitres(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Shift Engineer / Operator</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Start HTST Processing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProcessingPage;
