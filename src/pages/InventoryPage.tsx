import React, { useState } from 'react';
import { InventoryItem } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Warehouse, Plus, Minus, Search, ArrowRightLeft, Sliders } from 'lucide-react';

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
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Unified Enterprise Inventory
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Single-pane stock ledger unifying Raw Milk, Finished Goods, Packaging, Herd Feed and Plant Chemicals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAdjustType('In');
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#3fb950] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
          <button
            onClick={() => {
              setAdjustType('Out');
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#f0883e] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Stock Out</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Stock Valuation" value={`₹${(totalValue / 1000).toFixed(1)}k`} unit="" trend="up" changeText="Book inventory value" />
        <MetricCard label="Low Stock Items" value={lowStockCount} unit="SKUs" trend="down" isGoodWhenUp={false} changeText="Feed & Packaging" />
        <MetricCard label="Near Expiry Goods" value="0" unit="Lots" trend="neutral" changeText="Zero spoilage risk" />
        <MetricCard label="Out of Stock" value="0" unit="SKUs" trend="neutral" changeText="Sufficient buffers" />
      </div>

      {/* Search and Category Filter */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Inventory SKU, Item or Warehouse..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['All', 'Raw Milk', 'Finished Goods', 'Packaging', 'Feed', 'Consumables'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc] bg-[#0d1117]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Item Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Opening</th>
                <th className="px-4 py-2.5 font-medium">Inward</th>
                <th className="px-4 py-2.5 font-medium">Outward</th>
                <th className="px-4 py-2.5 font-medium">Closing Stock</th>
                <th className="px-4 py-2.5 font-medium">Unit Rate</th>
                <th className="px-4 py-2.5 font-medium">Total Value</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#58a6ff]">{item.sku}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">{item.name}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{item.category}</td>
                  <td className="px-4 py-3">{item.openingBalance.toLocaleString()} {item.unit}</td>
                  <td className="px-4 py-3 text-[#3fb950]">+{item.inward.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#f0883e]">-{item.outward.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">
                    {item.closingBalance.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3">₹{item.unitValue.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-[#3fb950]">₹{item.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e] text-[11px]">{item.warehouseLocation}</td>
                  <td className="px-4 py-3 font-sans">
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
        <form onSubmit={handleAdjust} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Select Item</label>
            <select
              value={adjustItemId}
              onChange={(e) => setAdjustItemId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]"
            >
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.sku} - {inv.name} (Current: {inv.closingBalance} {inv.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">
              Quantity to {adjustType === 'In' ? 'Add' : 'Deduct'}
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
