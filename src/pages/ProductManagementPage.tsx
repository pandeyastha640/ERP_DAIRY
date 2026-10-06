import React, { useState } from 'react';
import { ProductMaster } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { PackageSearch, Plus, Search, DollarSign, Layers, TrendingUp } from 'lucide-react';

interface ProductManagementPageProps {
  products: ProductMaster[];
  onAddProduct: (prod: ProductMaster) => void;
  selectedProductId?: string;
}

export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  products,
  onAddProduct,
  selectedProductId,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeProduct, setActiveProduct] = useState<ProductMaster | null>(() => {
    if (selectedProductId) {
      return products.find((p) => p.id === selectedProductId) || null;
    }
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product State
  const [sku, setSku] = useState('SKU-NEW-01');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Fresh Milk' | 'Curd & Yogurt' | 'Paneer' | 'Ghee'>('Fresh Milk');
  const [packSize, setPackSize] = useState('500 ml');
  const [mrp, setMrp] = useState('30.0');
  const [price, setPrice] = useState('28.0');
  const [cost, setCost] = useState('20.0');
  const [stock, setStock] = useState('1000');

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStockUnits, 0);
  const totalMonthlySales = products.reduce((acc, p) => acc + p.monthlySalesUnits, 0);
  const avgMargin = (products.reduce((acc, p) => acc + p.grossMarginPct, 0) / products.length).toFixed(1);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selling = parseFloat(price) || 28;
    const prodCost = parseFloat(cost) || 20;
    const margin = +(((selling - prodCost) / selling) * 100).toFixed(1);

    const newProd: ProductMaster = {
      id: `PRD-${Date.now()}`,
      sku,
      name: name || 'Demo Dairy Product',
      category,
      packSize,
      mrp: parseFloat(mrp) || 30,
      sellingPrice: selling,
      productionCost: prodCost,
      currentStockUnits: parseInt(stock) || 500,
      expiryDays: 5,
      reorderLevelUnits: 200,
      status: 'Active',
      monthlySalesUnits: 12000,
      grossMarginPct: margin,
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);
    setActiveProduct(newProd);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Product Master & SKU Catalog
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Finished good specifications, pack configurations, MRP versus dealer transfer prices, and unit margins.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active SKUs" value={products.length} unit="Products" trend="neutral" changeText="Catalogue items" />
        <MetricCard label="Finished Goods Stock" value={`${totalStockUnits.toLocaleString()} units`} unit="" trend="up" changeText="Cold store inventory" />
        <MetricCard label="Monthly Run Rate" value={`${(totalMonthlySales / 1000).toFixed(1)}k units`} unit="" trend="up" changeText="Offtake" />
        <MetricCard label="Mean Gross Margin" value={`${avgMargin}%`} unit="" trend="up" changeText="Portfolio profitability" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU code or Product name..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Master Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Product Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Pack Size</th>
                <th className="px-4 py-2.5 font-medium">MRP</th>
                <th className="px-4 py-2.5 font-medium">Selling Price</th>
                <th className="px-4 py-2.5 font-medium">Prod Cost</th>
                <th className="px-4 py-2.5 font-medium">Gross Margin %</th>
                <th className="px-4 py-2.5 font-medium">Stock</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filtered.map((prod) => (
                <tr
                  key={prod.id}
                  onClick={() => setActiveProduct(prod)}
                  className="hover:bg-[#1f2937]/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-[#58a6ff]">{prod.sku}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">{prod.name}</td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{prod.category}</td>
                  <td className="px-4 py-3">{prod.packSize}</td>
                  <td className="px-4 py-3">₹{prod.mrp.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">₹{prod.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#8b949e]">₹{prod.productionCost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-[#3fb950]">{prod.grossMarginPct}%</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">{prod.currentStockUnits.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={prod.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProduct(prod);
                      }}
                      className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded text-[11px] font-sans transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT PROFILE MODAL */}
      {activeProduct && (
        <Modal
          isOpen={!!activeProduct}
          onClose={() => setActiveProduct(null)}
          title={`SKU Profile: ${activeProduct.name}`}
          subtitle={`${activeProduct.sku} · ${activeProduct.category} · Pack: ${activeProduct.packSize}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[11px] text-[#8b949e] font-sans">Selling Price</div>
                <div className="text-xl font-bold text-[#f0f6fc] mt-1">₹{activeProduct.sellingPrice}</div>
                <div className="text-[10px] text-[#8b949e] font-sans">MRP: ₹{activeProduct.mrp}</div>
              </div>
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[11px] text-[#8b949e] font-sans">Production Cost</div>
                <div className="text-xl font-bold text-[#f0883e] mt-1">₹{activeProduct.productionCost}</div>
                <div className="text-[10px] text-[#8b949e] font-sans">Milk + Pack + Energy</div>
              </div>
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[11px] text-[#8b949e] font-sans">Unit Contribution</div>
                <div className="text-xl font-bold text-[#3fb950] mt-1">
                  ₹{(activeProduct.sellingPrice - activeProduct.productionCost).toFixed(2)}
                </div>
                <div className="text-[10px] text-[#3fb950] font-sans">{activeProduct.grossMarginPct}% gross margin</div>
              </div>
            </div>

            <div className="p-3 bg-[#0d1117] rounded border border-[#30363d] space-y-2">
              <div className="text-xs font-semibold text-[#f0f6fc] font-sans">Inventory & Shelf Life</div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Warehouse Balance:</span>
                <span className="font-bold">{activeProduct.currentStockUnits.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Shelf Life Duration:</span>
                <span>{activeProduct.expiryDays} Days from Packaging</span>
              </div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Monthly Run-Rate:</span>
                <span>{activeProduct.monthlySalesUnits.toLocaleString()} units / month</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#30363d]">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 bg-[#21262d] text-[#f0f6fc] rounded hover:bg-[#30363d]"
              >
                Close SKU Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Dairy SKU to Master"
        subtitle="Configure packaging sizing, transfer pricing, and direct unit costs"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">SKU Identifier</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Fresh Milk">Fresh Milk</option>
                <option value="Curd & Yogurt">Curd & Yogurt</option>
                <option value="Paneer">Paneer</option>
                <option value="Ghee">Ghee</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. A2 Cow Full Cream Milk 1L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">MRP (₹)</label>
              <input
                type="number"
                step="0.5"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Production Cost (₹)</label>
              <input
                type="number"
                step="0.5"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Initial Stock (Units)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Save Product Master
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
