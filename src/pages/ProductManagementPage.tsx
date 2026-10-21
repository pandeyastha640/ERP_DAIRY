import React, { useState } from 'react';
import { ProductMaster } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { PackageSearch, Plus, Search, DollarSign, Layers, TrendingUp, Sparkles } from 'lucide-react';

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
  const avgMargin = products.length > 0
    ? (products.reduce((acc, p) => acc + p.grossMarginPct, 0) / products.length).toFixed(1)
    : '0';

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
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <PackageSearch className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Product Master & SKU Catalog
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                FSSAI Pack Standards
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Finished good specifications, pack configurations, MRP versus dealer transfer prices, and unit margins.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <MetricCard label="Active SKUs" value={products.length} unit="Products" trend="neutral" changeText="Catalogue items active" />
        <MetricCard label="Finished Goods Stock" value={`${totalStockUnits.toLocaleString()} units`} unit="" trend="up" changeText="Cold store inventory" />
        <MetricCard label="Monthly Run Rate" value={`${(totalMonthlySales / 1000).toFixed(1)}k units`} unit="" trend="up" changeText="Consumer offtake" />
        <MetricCard label="Mean Gross Margin" value={`${avgMargin}%`} unit="" trend="up" changeText="Portfolio profitability" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU code or Product name..."
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium font-sans">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
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
      <div className="bg-white border border-[#ede8df] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-forest-950 font-sans">Commercial SKU Master Catalog</h3>
            <p className="text-[11px] text-stone-500">Finished consumer goods, pricing tiers and cold room balances</p>
          </div>
          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
            Showing {filtered.length} of {products.length} products
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">SKU</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Product Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Pack Size</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">MRP</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Selling Price</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Prod Cost</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Gross Margin %</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Stock</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filtered.map((prod) => (
                <tr
                  key={prod.id}
                  onClick={() => setActiveProduct(prod)}
                  className="hover:bg-cream-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 font-bold text-forest-900">{prod.sku}</td>
                  <td className="px-4 py-3.5 font-sans font-bold text-forest-950">{prod.name}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                      {prod.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{prod.packSize}</td>
                  <td className="px-4 py-3.5">₹{prod.mrp.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950">₹{prod.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-stone-500">₹{prod.productionCost.toFixed(2)}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">{prod.grossMarginPct}%</td>
                  <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">{prod.currentStockUnits.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-sans">
                    <StatusBadge status={prod.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProduct(prod);
                      }}
                      className="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
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
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-[11px] text-stone-500 font-sans">Selling Price</div>
                <div className="text-xl font-bold text-forest-950 mt-0.5">₹{activeProduct.sellingPrice}</div>
                <div className="text-[10px] text-stone-500 font-sans">MRP: ₹{activeProduct.mrp}</div>
              </div>
              <div className="p-3 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-[11px] text-stone-500 font-sans">Production Cost</div>
                <div className="text-xl font-bold text-amber-700 mt-0.5">₹{activeProduct.productionCost}</div>
                <div className="text-[10px] text-stone-500 font-sans">Milk + Pack + Energy</div>
              </div>
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <div className="text-[11px] text-emerald-900 font-sans font-bold">Unit Contribution</div>
                <div className="text-xl font-bold text-emerald-800 mt-0.5">
                  ₹{(activeProduct.sellingPrice - activeProduct.productionCost).toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-800 font-sans">{activeProduct.grossMarginPct}% gross margin</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#ede8df] space-y-2.5 shadow-2xs font-sans">
              <div className="text-xs font-bold text-forest-950">Inventory & Shelf Life Status</div>
              <div className="flex justify-between text-stone-700 text-xs">
                <span>Warehouse Balance:</span>
                <span className="font-bold font-mono text-forest-950">{activeProduct.currentStockUnits.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between text-stone-700 text-xs">
                <span>Shelf Life Duration:</span>
                <span className="font-medium">{activeProduct.expiryDays} Days from Packaging</span>
              </div>
              <div className="flex justify-between text-stone-700 text-xs">
                <span>Monthly Run-Rate:</span>
                <span className="font-mono font-medium">{activeProduct.monthlySalesUnits.toLocaleString()} units / month</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#ede8df]">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">SKU Identifier</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              >
                <option value="Fresh Milk">Fresh Milk</option>
                <option value="Curd & Yogurt">Curd & Yogurt</option>
                <option value="Paneer">Paneer</option>
                <option value="Ghee">Ghee</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. A2 Cow Full Cream Milk 1L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">MRP (₹)</label>
              <input
                type="number"
                step="0.5"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Selling Price (₹)</label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Production Cost (₹)</label>
              <input
                type="number"
                step="0.5"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Initial Stock (Units)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Save Product Master
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;
