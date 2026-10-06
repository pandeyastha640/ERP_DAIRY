import React, { useState } from 'react';
import { PackagingItem } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Box, Plus, AlertTriangle, CheckCircle2, ShoppingCart } from 'lucide-react';

interface PackagingManagementPageProps {
  packaging: PackagingItem[];
  onAddStock: (id: string, qty: number) => void;
}

export const PackagingManagementPage: React.FC<PackagingManagementPageProps> = ({ packaging, onAddStock }) => {
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(packaging[0]?.id || '');
  const [restockQty, setRestockQty] = useState('25000');

  const totalOpening = packaging.reduce((acc, p) => acc + p.openingStock, 0);
  const totalPurchased = packaging.reduce((acc, p) => acc + p.purchased, 0);
  const totalConsumed = packaging.reduce((acc, p) => acc + p.consumed, 0);
  const totalDamaged = packaging.reduce((acc, p) => acc + p.damaged, 0);
  const totalClosing = packaging.reduce((acc, p) => acc + p.closingStock, 0);
  const lowStockCount = packaging.filter((p) => p.status === 'Low Stock').length;

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStock(selectedId, parseInt(restockQty) || 0);
    setIsRestockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Packaging Material Inventory
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Roll films, bottles, cups, cartons, and seal liners with real-time consumption and stockout warnings.
          </p>
        </div>

        <button
          onClick={() => setIsRestockModalOpen(true)}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Restock Purchase Order</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard label="Opening Stock" value={`${(totalOpening / 1000).toFixed(1)}k`} unit="units" trend="neutral" changeText="Start of day" />
        <MetricCard label="Purchased Inward" value={`${(totalPurchased / 1000).toFixed(1)}k`} unit="units" trend="up" changeText="Delivered" />
        <MetricCard label="Consumed Today" value={`${(totalConsumed / 1000).toFixed(1)}k`} unit="units" trend="neutral" changeText="Pack line used" />
        <MetricCard label="Damaged / Scrap" value={`${totalDamaged} units`} unit="" trend="down" isGoodWhenUp={false} changeText="1.4% wastage" />
        <MetricCard label="Closing Balance" value={`${(totalClosing / 1000).toFixed(1)}k`} unit="units" trend="neutral" changeText="Available" />
        <MetricCard
          label="Low Stock Alerts"
          value={lowStockCount}
          unit="SKU"
          trend="down"
          isGoodWhenUp={false}
          changeText="500ml pouch film"
        />
      </div>

      {/* CRITICAL ALERT BANNER */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#f85149] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#f85149]">CRITICAL PACKAGING BUFFER WARNING</div>
              <div className="text-xs text-[#c9d1d9] mt-0.5">
                500ml LDPE Multilayer Milk Pouch Film has only 1.9 days remaining before line stoppage. Reorder level is 20,000 units.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedId('PKG-01');
              setRestockQty('40000');
              setIsRestockModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-[#f85149] hover:bg-[#ff6b64] text-white text-xs font-bold rounded shrink-0 transition-colors"
          >
            Create Emergency PO
          </button>
        </div>
      )}

      {/* Packaging Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">Packaging Material Stock Ledger</h3>
          <span className="text-xs font-mono text-[#8b949e]">Units in Individual Pieces / Pouches</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Material Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Opening</th>
                <th className="px-4 py-2.5 font-medium">Purchased</th>
                <th className="px-4 py-2.5 font-medium">Consumed</th>
                <th className="px-4 py-2.5 font-medium">Damaged</th>
                <th className="px-4 py-2.5 font-medium">Closing Stock</th>
                <th className="px-4 py-2.5 font-medium">Unit Cost</th>
                <th className="px-4 py-2.5 font-medium">Runway</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {packaging.map((item) => (
                <tr key={item.id} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">{item.name}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{item.materialType}</td>
                  <td className="px-4 py-3">{item.openingStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#3fb950]">
                    {item.purchased > 0 ? `+${item.purchased.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-[#f0883e]">-{item.consumed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#f85149]">{item.damaged}</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">{item.closingStock.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{item.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold">
                    <span className={item.daysRemaining <= 2.5 ? 'text-[#f85149]' : 'text-[#3fb950]'}>
                      {item.daysRemaining} days
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setRestockQty('20000');
                        setIsRestockModalOpen(true);
                      }}
                      className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded text-[11px] font-sans"
                    >
                      Inward PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Record Packaging Inward PO Delivery"
        subtitle="Credit received packaging goods to dry inventory balance"
        maxWidth="md"
      >
        <form onSubmit={handleRestock} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Packaging Material</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc]"
            >
              {packaging.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Closing: {p.closingStock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Quantity Received (Units)</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc]"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Confirm Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
