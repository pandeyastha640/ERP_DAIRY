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
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Box className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Packaging Material Inventory
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Pouch Film & Bottle Buffer
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Roll films, bottles, cups, cartons, and seal liners with real-time consumption and stockout warnings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRestockModalOpen(true)}
          className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Restock Purchase Order</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
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
        <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900 font-sans">CRITICAL PACKAGING BUFFER WARNING</div>
              <div className="text-xs text-rose-800/90 mt-0.5 font-sans">
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
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shrink-0 transition-all shadow-xs cursor-pointer"
          >
            Create Emergency PO
          </button>
        </div>
      )}

      {/* Packaging Table */}
      <div className="bg-white border border-[#ede8df] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Packaging Material Stock Ledger</h3>
            <p className="text-[11px] text-stone-500">Roll films, bottle caps, pouches and corrugated cartons</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            Units in Individual Pieces / Pouches
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Material Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Type</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opening</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Purchased</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Consumed</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Damaged</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Closing Stock</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Unit Cost</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Runway</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {packaging.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{item.name}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {item.materialType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{item.openingStock.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">
                    {item.purchased > 0 ? `+${item.purchased.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-stone-600">-{item.consumed.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-rose-700 font-medium">{item.damaged}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">{item.closingStock.toLocaleString()}</td>
                  <td className="px-4 py-3.5">₹{item.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                      item.daysRemaining <= 2.5
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.daysRemaining} days
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right font-sans">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        setRestockQty('20000');
                        setIsRestockModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 text-forest-900 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
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
        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Packaging Material</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              {packaging.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Closing Stock: {p.closingStock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Quantity Received (Units)</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Confirm Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PackagingManagementPage;
