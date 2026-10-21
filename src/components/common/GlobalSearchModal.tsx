import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Boxes,
  Users,
  Factory,
  PackageSearch,
} from 'lucide-react';
import {
  Cattle,
  Farmer,
  ProductMaster,
  ProcessingBatch,
  DistributionRoute,
  SalesOrder,
} from '../../types/dairy';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cattle: Cattle[];
  farmers: Farmer[];
  products: ProductMaster[];
  batches: ProcessingBatch[];
  routes: DistributionRoute[];
  orders: SalesOrder[];
  onSelectResult: (module: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  cattle,
  farmers,
  products,
  batches,
  routes,
  orders,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredCattle = q
    ? cattle
        .filter((c) => c.id.toLowerCase().includes(q) || c.breed.toLowerCase().includes(q))
        .slice(0, 4)
    : [];
  const filteredFarmers = q
    ? farmers
        .filter(
          (f) =>
            f.id.toLowerCase().includes(q) ||
            f.name.toLowerCase().includes(q) ||
            f.village.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const filteredProducts = q
    ? products
        .filter((p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
        .slice(0, 4)
    : [];
  const filteredBatches = q
    ? batches
        .filter((b) => b.batchId.toLowerCase().includes(q) || b.id.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  const totalResults =
    filteredCattle.length +
    filteredFarmers.length +
    filteredProducts.length +
    filteredBatches.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div
        className="w-full max-w-2xl bg-white border border-[#ede8df] rounded-3xl shadow-2xl text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-5 border-b border-[#ede8df] bg-[#faf8f5]">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search Cattle ID, Farmer, Batch, Product SKU..."
            className="w-full py-4 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#ede8df] ml-2 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="p-6 text-center text-xs text-slate-500">
              Try searching for <span className="text-[#1b4332] font-mono font-bold">COW-001</span>,{' '}
              <span className="text-[#1b4332] font-mono font-bold">FARM-002</span>,{' '}
              <span className="text-[#1b4332] font-mono font-bold">BATCH-104</span>, or{' '}
              <span className="text-[#1b4332] font-mono font-bold">Gold Milk</span>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching enterprise records found for "{query}".
            </div>
          )}

          {filteredCattle.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#1b4332] px-2 mb-1.5 flex items-center gap-1.5 font-bold">
                <Boxes className="w-3.5 h-3.5 text-[#1b4332]" /> Cattle Herd
              </div>
              <div className="space-y-1">
                {filteredCattle.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectResult('cattle', c.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#faf8f5] flex items-center justify-between text-xs transition-colors cursor-pointer border border-transparent hover:border-[#ede8df]"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#1b4332]">{c.id}</span>
                      <span className="text-slate-800 ml-2 font-medium">
                        {c.breed} ({c.lactation} Lactation)
                      </span>
                      <span className="text-slate-500 text-[11px] ml-2 font-mono">{c.shedLocation}</span>
                    </div>
                    <span className="font-mono text-[#1b4332] font-bold">
                      {c.milkYieldLPerDay} L/day
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredFarmers.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-700 px-2 mb-1.5 flex items-center gap-1.5 font-bold">
                <Users className="w-3.5 h-3.5 text-blue-700" /> Farmers
              </div>
              <div className="space-y-1">
                {filteredFarmers.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectResult('farmers', f.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#faf8f5] flex items-center justify-between text-xs transition-colors cursor-pointer border border-transparent hover:border-[#ede8df]"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700">{f.id}</span>
                      <span className="text-slate-800 ml-2 font-medium">{f.name}</span>
                      <span className="text-slate-500 text-[11px] ml-2 font-mono">({f.village})</span>
                    </div>
                    <span className="font-mono text-slate-700 font-semibold">{f.todayMilkL} L today</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 px-2 mb-1.5 flex items-center gap-1.5 font-bold">
                <PackageSearch className="w-3.5 h-3.5 text-amber-700" /> Products Master
              </div>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectResult('products', p.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#faf8f5] flex items-center justify-between text-xs transition-colors cursor-pointer border border-transparent hover:border-[#ede8df]"
                  >
                    <div>
                      <span className="font-mono text-amber-700 font-bold">{p.sku}</span>
                      <span className="text-slate-800 ml-2 font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">₹{p.sellingPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredBatches.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-700 px-2 mb-1.5 flex items-center gap-1.5 font-bold">
                <Factory className="w-3.5 h-3.5 text-purple-700" /> Processing Batches
              </div>
              <div className="space-y-1">
                {filteredBatches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectResult('processing', b.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#faf8f5] flex items-center justify-between text-xs transition-colors cursor-pointer border border-transparent hover:border-[#ede8df]"
                  >
                    <div>
                      <span className="font-mono text-purple-700 font-bold">{b.batchId}</span>
                      <span className="text-slate-500 ml-2 font-mono">{b.inputMilkLitres} L input</span>
                    </div>
                    <span className="text-[#1b4332] font-mono font-bold">{b.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-[#faf8f5] border-t border-[#ede8df] flex items-center justify-between text-[11px] text-slate-500">
          <span>Click any item to navigate immediately</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
