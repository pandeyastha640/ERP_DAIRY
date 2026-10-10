import React, { useState } from 'react';
import { PackagingItem } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Box, Plus, AlertTriangle, CheckCircle2, ShoppingCart } from 'lucide-react';

interface PackagingManagementPageProps {
  packaging: PackagingItem[];
  onAddStock: (id: string, qty: number) => void;
  onSavePackaging: (item: PackagingItem, existingId?: string) => string | undefined;
  onArchivePackaging: (id: string) => void;
}

export const PackagingManagementPage: React.FC<PackagingManagementPageProps> = ({ packaging, onAddStock, onSavePackaging, onArchivePackaging }) => {
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackagingItem | null>(null);
  const [formError, setFormError] = useState('');
  const [masterName, setMasterName] = useState('');
  const [masterType, setMasterType] = useState<PackagingItem['materialType']>('Polypouch');
  const [masterSize, setMasterSize] = useState('500 ml');
  const [masterStock, setMasterStock] = useState('0');
  const [masterThreshold, setMasterThreshold] = useState('1000');
  const [masterCost, setMasterCost] = useState('0');
  const [selectedId, setSelectedId] = useState(packaging[0]?.id || '');
  const [restockQty, setRestockQty] = useState('25000');

  const activePackaging = packaging.filter((item) => !item.archivedAt);
  const totalOpening = activePackaging.reduce((acc, p) => acc + p.openingStock, 0);
  const totalPurchased = activePackaging.reduce((acc, p) => acc + p.purchased, 0);
  const totalConsumed = activePackaging.reduce((acc, p) => acc + p.consumed, 0);
  const totalDamaged = activePackaging.reduce((acc, p) => acc + p.damaged, 0);
  const totalClosing = activePackaging.reduce((acc, p) => acc + p.closingStock, 0);
  const lowStockCount = activePackaging.filter((p) => p.status === 'Low Stock').length;

  const openMasterForm = (item?: PackagingItem) => {
    setEditingItem(item ?? null);
    setFormError('');
    setMasterName(item?.name ?? '');
    setMasterType(item?.materialType ?? 'Polypouch');
    setMasterSize(item?.size ?? '500 ml');
    setMasterStock(String(item?.closingStock ?? 0));
    setMasterThreshold(String(item?.reorderLevel ?? 1000));
    setMasterCost(String(item?.unitCost ?? 0));
    setIsMasterModalOpen(true);
  };

  const handleSaveMaster = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = Number(masterStock);
    const threshold = Number(masterThreshold);
    const cost = Number(masterCost);
    if (!masterName.trim() || !masterSize.trim()) {
      setFormError('Material name and package size are required.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(threshold) || threshold < 0 ||
        !Number.isFinite(cost) || cost < 0) {
      setFormError('Stock and reorder threshold must be non-negative whole numbers; cost must be non-negative.');
      return;
    }
    const closingStock = editingItem?.closingStock ?? stock;
    const item: PackagingItem = {
      ...(editingItem ?? {} as PackagingItem),
      id: editingItem?.id ?? `PKG-${Date.now()}`,
      name: masterName.trim(),
      materialType: masterType,
      size: masterSize.trim(),
      openingStock: editingItem?.openingStock ?? stock,
      purchased: editingItem?.purchased ?? 0,
      consumed: editingItem?.consumed ?? 0,
      damaged: editingItem?.damaged ?? 0,
      closingStock,
      unitCost: cost,
      reorderLevel: threshold,
      daysRemaining: editingItem?.daysRemaining ?? 0,
      status: closingStock <= threshold ? 'Low Stock' : 'Sufficient',
    };
    const error = onSavePackaging(item, editingItem?.id);
    if (error) {
      setFormError(error);
      return;
    }
    setIsMasterModalOpen(false);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStock(selectedId, parseInt(restockQty) || 0);
    setIsRestockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Packaging Material Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Roll films, bottles, cups, cartons, and seal liners with real-time consumption and stockout warnings.
          </p>
        </div>

        <button
          onClick={() => setIsRestockModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Restock Purchase Order</span>
        </button>
        <button
          onClick={() => openMasterForm()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
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
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-700">CRITICAL PACKAGING BUFFER WARNING</div>
              <div className="text-xs text-slate-700 mt-0.5">
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
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Packaging Material Stock Ledger</h3>
          <span className="text-xs font-mono text-slate-500">Units in Individual Pieces / Pouches</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {activePackaging.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 font-sans text-slate-500">{item.materialType}</td>
                  <td className="px-4 py-3">{item.openingStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-700">
                    {item.purchased > 0 ? `+${item.purchased.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-amber-700">-{item.consumed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-rose-700">{item.damaged}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.closingStock.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{item.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold">
                    <span className={item.daysRemaining <= 2.5 ? 'text-rose-700' : 'text-emerald-700'}>
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
                      className="px-2 py-1 bg-slate-50 hover:bg-[#30363d] text-blue-700 rounded text-[11px] font-sans"
                    >
                      Inward PO
                    </button>
                    <button
                      onClick={() => openMasterForm(item)}
                      className="ml-1 px-2 py-1 border border-slate-300 text-slate-700 rounded text-[11px] font-sans"
                    >Edit</button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Archive ${item.name}? Existing stock history will be retained.`)) {
                          onArchivePackaging(item.id);
                        }
                      }}
                      className="ml-1 px-2 py-1 border border-rose-200 text-rose-700 rounded text-[11px] font-sans"
                    >Archive</button>
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
            <label className="block text-xs font-medium text-slate-500 mb-1">Packaging Material</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900"
            >
              {packaging.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Closing: {p.closingStock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Quantity Received (Units)</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRestockModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              Confirm Delivery
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        title={editingItem ? `Edit ${editingItem.name}` : 'Add Packaging Material'}
        subtitle="Maintain the packaging master without altering existing stock history"
        maxWidth="md"
      >
        <form onSubmit={handleSaveMaster} className="space-y-3.5">
          {formError && <p role="alert" className="text-xs text-rose-700">{formError}</p>}
          <label className="block text-xs font-medium text-slate-700">Material Name
            <input required value={masterName} onChange={(e) => setMasterName(e.target.value)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-slate-700">Material Type
              <select value={masterType} onChange={(e) => setMasterType(e.target.value as PackagingItem['materialType'])} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900">
                {(['Polypouch', 'PET Bottle', 'Tub & Foil', 'Corrugated Box', 'Cap & Seal', 'Glass Bottle'] as const).map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Pack Size
              <input required value={masterSize} onChange={(e) => setMasterSize(e.target.value)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900" />
            </label>
            <label className="block text-xs font-medium text-slate-700">{editingItem ? 'Current Stock' : 'Opening Stock'}
              <input type="number" min="0" step="1" required value={masterStock} onChange={(e) => setMasterStock(e.target.value)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900" />
            </label>
            <label className="block text-xs font-medium text-slate-700">Reorder Threshold
              <input type="number" min="0" step="1" required value={masterThreshold} onChange={(e) => setMasterThreshold(e.target.value)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900" />
            </label>
            <label className="block text-xs font-medium text-slate-700">Unit Cost
              <input type="number" min="0" step="0.01" required value={masterCost} onChange={(e) => setMasterCost(e.target.value)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900" />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setIsMasterModalOpen(false)} className="px-3 py-2 text-xs text-slate-600">Cancel</button>
            <button type="submit" className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold">{editingItem ? 'Save Changes' : 'Add Material'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
