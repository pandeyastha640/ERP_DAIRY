import React, { useState } from 'react';
import { InventoryItem } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Warehouse, Plus, Minus, Search, ArrowRightLeft, Sliders, CheckCircle2 } from 'lucide-react';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onAdjustStock: (id: string, delta: number) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onAdjustStock }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState(inventory[0]?.id || '');
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustType, setAdjustType] = useState<'In' | 'Out'>('In');

  const totalValue = inventory.reduce((acc, i) => acc + i.totalValue, 0);
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(adjustAmount) || 0;
    const delta = adjustType === 'In' ? amount : -amount;
    onAdjustStock(adjustItemId, delta);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Warehouse className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Unified Enterprise Inventory
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Multi-Warehouse Real-Time
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Single-pane stock ledger unifying Raw Milk, Finished Goods, Packaging, Herd Feed and Plant Chemicals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAdjustType('In');
              setIsAdjustModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Stock In</span>
          </button>
          <button
            onClick={() => {
              setAdjustType('Out');
              setIsAdjustModalOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Minus className="w-4 h-4 text-amber-700" />
            <span>Stock Out</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <MetricCard label="Total Stock Valuation" value={`₹${(totalValue / 1000).toFixed(1)}k`} unit="" trend="up" changeText="Book inventory value" />
        <MetricCard label="Low Stock Items" value={lowStockCount} unit="SKUs" trend="down" isGoodWhenUp={false} changeText="Feed & Packaging alert" />
        <MetricCard label="Near Expiry Goods" value="0" unit="Lots" trend="neutral" changeText="Zero spoilage risk" />
        <MetricCard label="Out of Stock" value="0" unit="SKUs" trend="neutral" changeText="Sufficient safety buffers" />
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Inventory SKU, Item or Warehouse..."
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Raw Milk', 'Finished Goods', 'Packaging', 'Feed', 'Consumables'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-forest-900 bg-cream-50/70 border border-[#ede8df]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#ede8df] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Enterprise Stock Ledger</h3>
            <p className="text-[11px] text-stone-500">Real-time bin balances, inward receipts and unit valuations</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            Showing {filtered.length} of {inventory.length} items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">SKU</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Item Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opening</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Inward</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Outward</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Closing Stock</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Unit Rate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Total Value</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Location</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-forest-900">{item.sku}</td>
                  <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{item.name}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{item.openingBalance.toLocaleString()} {item.unit}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">+{item.inward.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-stone-600">-{item.outward.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">
                    {item.closingBalance.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3.5">₹{item.unitValue.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-900">₹{item.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-sans text-stone-600 text-[11px]">{item.warehouseLocation}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUSTMENT MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={adjustType === 'In' ? 'Record Stock Inward' : 'Record Stock Outward'}
        subtitle="Update inventory bin balance with physical cycle count"
        maxWidth="md"
      >
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Select Item</label>
            <select
              value={adjustItemId}
              onChange={(e) => setAdjustItemId(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.sku} - {inv.name} (Current: {inv.closingBalance} {inv.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
              Quantity to {adjustType === 'In' ? 'Add' : 'Deduct'}
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
