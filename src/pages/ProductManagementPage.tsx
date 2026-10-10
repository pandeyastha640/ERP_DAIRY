import React, { useState } from 'react';
import { ProductMaster } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import { PackageSearch, Plus, Search, DollarSign, Layers, TrendingUp } from 'lucide-react';

interface ProductManagementPageProps {
  products: ProductMaster[];
  onAddProduct: (prod: ProductMaster, existingId?: string) => string | undefined;
  onArchiveProduct: (id: string) => void;
  selectedProductId?: string;
}

export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  products,
  onAddProduct,
  onArchiveProduct,
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
  const [editingProduct, setEditingProduct] = useState<ProductMaster | null>(null);
  const [formError, setFormError] = useState('');

  // New Product State
  const [sku, setSku] = useState('SKU-NEW-01');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductMaster['category']>('Fresh Milk');
  const [packSize, setPackSize] = useState('500 ml');
  const [mrp, setMrp] = useState('30.0');
  const [price, setPrice] = useState('28.0');
  const [cost, setCost] = useState('20.0');
  const [stock, setStock] = useState('1000');

  const activeProducts = products.filter((product) => !product.archivedAt);
  const categories = Array.from(new Set(activeProducts.map((p) => p.category)));
  const totalStockUnits = activeProducts.reduce((acc, p) => acc + p.currentStockUnits, 0);
  const totalMonthlySales = activeProducts.reduce((acc, p) => acc + p.monthlySalesUnits, 0);
  const avgMargin = (activeProducts.reduce((acc, p) => acc + p.grossMarginPct, 0) / Math.max(1, activeProducts.length)).toFixed(1);

  const filtered = activeProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selling = Number(price);
    const prodCost = Number(cost);
    const mrpValue = Number(mrp);
    const stockValue = Number(stock);
    if (!sku.trim() || !name.trim() || !packSize.trim()) {
      setFormError('SKU, product name, and pack size are required.');
      return;
    }
    if (!Number.isFinite(selling) || selling <= 0 || !Number.isFinite(prodCost) || prodCost < 0 ||
        !Number.isFinite(mrpValue) || mrpValue < selling || !Number.isInteger(stockValue) || stockValue < 0) {
      setFormError('Enter valid prices and a non-negative whole-number opening stock. MRP must cover the selling price.');
      return;
    }
    const margin = +(((selling - prodCost) / selling) * 100).toFixed(1);

    const newProd: ProductMaster = {
      ...(editingProduct ?? {} as ProductMaster),
      id: editingProduct?.id ?? `PRD-${Date.now()}`,
      sku: sku.trim(),
      name: name.trim(),
      category,
      packSize: packSize.trim(),
      mrp: mrpValue,
      sellingPrice: selling,
      productionCost: prodCost,
      currentStockUnits: editingProduct?.currentStockUnits ?? stockValue,
      expiryDays: editingProduct?.expiryDays ?? 5,
      reorderLevelUnits: editingProduct?.reorderLevelUnits ?? 200,
      status: 'Active',
      monthlySalesUnits: editingProduct?.monthlySalesUnits ?? 0,
      grossMarginPct: margin,
    };

    const error = onAddProduct(newProd, editingProduct?.id);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setActiveProduct(newProd);
  };

  const openProductForm = (product?: ProductMaster) => {
    setEditingProduct(product ?? null);
    setFormError('');
    setSku(product?.sku ?? '');
    setName(product?.name ?? '');
    setCategory(product?.category ?? 'Fresh Milk');
    setPackSize(product?.packSize ?? '500 ml');
    setMrp(String(product?.mrp ?? 30));
    setPrice(String(product?.sellingPrice ?? 28));
    setCost(String(product?.productionCost ?? 20));
    setStock(String(product?.currentStockUnits ?? 0));
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Product Master & SKU Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Finished good specifications, pack configurations, MRP versus dealer transfer prices, and unit margins.
          </p>
        </div>

        <button
          onClick={() => openProductForm()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
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
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU code or Product name..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none"
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
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {filtered.map((prod) => (
                <tr
                  key={prod.id}
                  onClick={() => setActiveProduct(prod)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-blue-700">{prod.sku}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-900">{prod.name}</td>
                  <td className="px-4 py-3 font-sans text-slate-500">{prod.category}</td>
                  <td className="px-4 py-3">{prod.packSize}</td>
                  <td className="px-4 py-3">₹{prod.mrp.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">₹{prod.sellingPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">₹{prod.productionCost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{prod.grossMarginPct}%</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{prod.currentStockUnits.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={prod.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProduct(prod);
                      }}
                      className="px-2 py-1 bg-slate-50 hover:bg-[#30363d] text-slate-700 rounded text-[11px] font-sans transition-colors"
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
        <EntityDetailDrawer
          isOpen={!!activeProduct}
          onClose={() => setActiveProduct(null)}
          title={`SKU Profile: ${activeProduct.name}`}
          subtitle={`${activeProduct.sku} · ${activeProduct.category} · Pack: ${activeProduct.packSize}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Selling Price</div>
                <div className="text-xl font-bold text-slate-900 mt-1">₹{activeProduct.sellingPrice}</div>
                <div className="text-[10px] text-slate-500 font-sans">MRP: ₹{activeProduct.mrp}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Production Cost</div>
                <div className="text-xl font-bold text-amber-700 mt-1">₹{activeProduct.productionCost}</div>
                <div className="text-[10px] text-slate-500 font-sans">Milk + Pack + Energy</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Unit Contribution</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  ₹{(activeProduct.sellingPrice - activeProduct.productionCost).toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-700 font-sans">{activeProduct.grossMarginPct}% gross margin</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-900 font-sans">Inventory & Shelf Life</div>
              <div className="flex justify-between text-slate-700">
                <span>Warehouse Balance:</span>
                <span className="font-bold">{activeProduct.currentStockUnits.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shelf Life Duration:</span>
                <span>{activeProduct.expiryDays} Days from Packaging</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Monthly Run-Rate:</span>
                <span>{activeProduct.monthlySalesUnits.toLocaleString()} units / month</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-200">
              <div className="flex gap-2 mr-auto">
                <button
                  onClick={() => openProductForm(activeProduct)}
                  className="px-3 py-2 bg-emerald-700 text-white rounded text-xs"
                >Edit Product</button>
                <button
                  onClick={() => {
                    if (window.confirm(`Archive ${activeProduct.sku}? Historical sales and production records will remain.`)) {
                      onArchiveProduct(activeProduct.id);
                      setActiveProduct(null);
                    }
                  }}
                  className="px-3 py-2 border border-rose-200 text-rose-700 rounded text-xs"
                >Archive</button>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 bg-slate-50 text-slate-900 rounded hover:bg-[#30363d]"
              >
                Close SKU Profile
              </button>
            </div>
          </div>
        </EntityDetailDrawer>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProduct ? `Edit Product ${editingProduct.sku}` : 'Register New Dairy SKU to Master'}
        subtitle="Configure packaging sizing, transfer pricing, and direct unit costs"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3.5">
          {formError && <p role="alert" className="text-xs text-rose-700">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">SKU Identifier</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductMaster['category'])}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Fresh Milk">Fresh Milk</option>
                <option value="Curd & Yogurt">Curd & Yogurt</option>
                <option value="Paneer">Paneer</option>
                <option value="Ghee">Ghee</option>
                <option value="Butter & Cream">Butter & Cream</option>
                <option value="Flavoured Milk">Flavoured Milk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Product Name</label>
            <input
              type="text"
              required
              placeholder="e.g. A2 Cow Full Cream Milk 1L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Pack Size</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">MRP (₹)</label>
              <input
                type="number"
                step="0.5"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Production Cost (₹)</label>
              <input
                type="number"
                step="0.5"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Initial Stock (Units)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              {editingProduct ? 'Save Changes' : 'Save Product Master'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
