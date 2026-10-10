import React, { useState } from 'react';
import { InventoryItem } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import { Warehouse, Plus, Minus, Search, ArrowRightLeft, Sliders } from 'lucide-react';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onAdjustStock: (id: string, delta: number) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onAdjustStock }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
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
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Unified Enterprise Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-pane stock ledger unifying Raw Milk, Finished Goods, Packaging, Herd Feed and Plant Chemicals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAdjustType('In');
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
          <button
            onClick={() => {
              setAdjustType('Out');
              setIsAdjustModalOpen(true);
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-amber-700 rounded-lg transition-colors flex items-center gap-1.5"
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
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Inventory SKU, Item or Warehouse..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['All', 'Raw Milk', 'Finished Goods', 'Packaging', 'Feed', 'Consumables'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900 bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setActiveItem(item)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-700">{item.sku}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 font-sans text-slate-500">{item.category}</td>
                  <td className="px-4 py-3">{item.openingBalance.toLocaleString()} {item.unit}</td>
                  <td className="px-4 py-3 text-emerald-700">+{item.inward.toLocaleString()}</td>
                  <td className="px-4 py-3 text-amber-700">-{item.outward.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {item.closingBalance.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3">₹{item.unitValue.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">₹{item.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans text-slate-500 text-[11px]">{item.warehouseLocation}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeItem && (
        <EntityDetailDrawer
          isOpen={!!activeItem}
          onClose={() => setActiveItem(null)}
          title={activeItem.name}
          subtitle={`${activeItem.sku} · ${activeItem.category} · ${activeItem.warehouseLocation}`}
          actions={<button onClick={() => { setAdjustItemId(activeItem.id); setAdjustType('In'); setIsAdjustModalOpen(true); setActiveItem(null); }} className="rounded bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Adjust Stock</button>}
        >
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Status', activeItem.status],
              ['Opening', `${activeItem.openingBalance.toLocaleString()} ${activeItem.unit}`],
              ['Inward', `${activeItem.inward.toLocaleString()} ${activeItem.unit}`],
              ['Outward', `${activeItem.outward.toLocaleString()} ${activeItem.unit}`],
              ['Closing', `${activeItem.closingBalance.toLocaleString()} ${activeItem.unit}`],
              ['Unit Value', `₹${activeItem.unitValue.toFixed(2)}`],
              ['Total Value', `₹${activeItem.totalValue.toLocaleString()}`],
              ['Reorder At', `${activeItem.reorderLevel.toLocaleString()} ${activeItem.unit}`],
            ].map(([label, value]) => <div key={label} className="rounded border border-slate-200 bg-slate-50 p-3"><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
        </EntityDetailDrawer>
      )}

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
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Item</label>
            <select
              value={adjustItemId}
              onChange={(e) => setAdjustItemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900"
            >
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.sku} - {inv.name} (Current: {inv.closingBalance} {inv.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Quantity to {adjustType === 'In' ? 'Add' : 'Deduct'}
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
