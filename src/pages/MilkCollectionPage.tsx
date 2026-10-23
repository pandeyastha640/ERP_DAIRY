import React, { useState } from 'react';
import { MilkCollectionRecord, Farmer, NewMilkCollection } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { QuickCollectionModal } from '../components/operations/QuickCollectionModal';
import { LactoscanSerialBridgeModal } from '../components/operations/LactoscanSerialBridgeModal';
import { ThermalReceiptModal } from '../components/operations/ThermalReceiptModal';
import { useDairyERP } from '../context/DairyERPContext';
import { IS_STATIC_DEMO_MODE } from '../config/demo';
import {
  Scale,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Cpu,
  Radio,
  Zap,
  Printer,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface MilkCollectionPageProps {
  collections: MilkCollectionRecord[];
  farmers: Farmer[];
  onAddCollection: (record: NewMilkCollection) => Promise<MilkCollectionRecord>;
  onOpenMobileView: () => void;
}

export const MilkCollectionPage: React.FC<MilkCollectionPageProps> = ({
  collections,
  farmers,
  onAddCollection,
  onOpenMobileView,
}) => {
  const { setCurrentModule, setSelectedItemId } = useDairyERP();
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [qcFilter, setQcFilter] = useState<'All' | 'PASS' | 'WARNING' | 'FAIL'>('All');
  const [centreFilter, setCentreFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIotBridgeOpen, setIsIotBridgeOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedSlipRecord, setSelectedSlipRecord] = useState<any>(null);

  const totalLitres = collections.reduce((acc, c) => acc + c.quantityLitres, 0);
  const morningLitres = collections.filter((c) => c.shift === 'Morning').reduce((acc, c) => acc + c.quantityLitres, 0);
  const eveningLitres = collections.filter((c) => c.shift === 'Evening').reduce((acc, c) => acc + c.quantityLitres, 0);
  const totalPayable = collections.reduce((acc, c) => acc + c.payableAmount, 0);
  const rejectedLitres = collections.filter((c) => c.quality === 'FAIL').reduce((acc, c) => acc + c.quantityLitres, 0);
  const avgFat = collections.length > 0 ? (collections.reduce((acc, c) => acc + c.fat, 0) / collections.length).toFixed(2) : '0';
  const avgSNF = collections.length > 0 ? (collections.reduce((acc, c) => acc + c.snf, 0) / collections.length).toFixed(2) : '0';

  const morningCount = collections.filter((c) => c.shift === 'Morning').length;
  const eveningCount = collections.filter((c) => c.shift === 'Evening').length;

  const centres = Array.from(new Set(collections.map((c) => c.centre)));

  const filtered = collections.filter((c) => {
    const matchesShift = shiftFilter === 'All' || c.shift === shiftFilter;
    const matchesQc = qcFilter === 'All' || c.quality === qcFilter;
    const matchesCentre = centreFilter === 'All' || c.centre === centreFilter;
    const matchesDate = dateFilter === 'All' || c.date === dateFilter;
    const matchesSearch =
      c.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      c.farmerId.toLowerCase().includes(search.toLowerCase()) ||
      c.centre.toLowerCase().includes(search.toLowerCase()) ||
      c.collectionCode.toLowerCase().includes(search.toLowerCase());
    return matchesShift && matchesQc && matchesCentre && matchesDate && matchesSearch;
  });

  const isFiltered = shiftFilter !== 'All' || qcFilter !== 'All' || centreFilter !== 'All' || dateFilter !== 'All' || search !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#d9e3dd] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-forest-950 font-sans">
            Milk Collection
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {IS_STATIC_DEMO_MODE ? 'Record sample milk intake. The browser demo applies the DairyOS pricing formula and keeps changes on this device.' : 'Record farmer milk intake. The server confirms quality, rate, and payable before saving.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentModule('milk-ops')}
            className="px-3 py-2 bg-cream-50 hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-98 hidden md:flex items-center gap-1.5"
            title="Jump to Central Mass Balance Reconciliation (Tab 02)"
          >
            <span>&larr; Milk Operations</span>
          </button>
          <button
            onClick={() => setIsIotBridgeOpen(true)}
            className="px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-900 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            <Cpu className="w-4 h-4 text-forest-700" />
            <span>Lactoscan IoT Bridge</span>
          </button>
          <button
            onClick={onOpenMobileView}
            className="px-3.5 py-2 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-98"
          >
            Touch Field Mode
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-forest-950/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
          <button
            onClick={() => setCurrentModule('payments')}
            className="px-3 py-2 bg-[#faf8f5] hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-forest-900 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-98 hidden sm:flex items-center gap-1.5"
            title="Jump to Farmer Payables (Tab 15)"
          >
            <span>Farmer Payables &rarr;</span>
          </button>
        </div>
      </div>

      {/* Hardware IoT Intake Station Banner */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-forest-600 animate-pulse" />
            <span className="font-bold text-forest-950">Collection station (sample):</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-stone-600 bg-cream-50 px-2.5 py-1 rounded-lg border border-[#ede8df]">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
            <span>Analyzer sample data (hardware not connected)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-stone-600 bg-cream-50 px-2.5 py-1 rounded-lg border border-[#ede8df]">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
            <span>Scale sample data (hardware not connected)</span>
          </div>
        </div>

        <button
          onClick={() => setIsIotBridgeOpen(true)}
          className="text-xs text-forest-800 hover:text-forest-950 font-semibold flex items-center gap-1.5 cursor-pointer bg-sage-50 px-3 py-1 rounded-lg border border-sage-200/80 hover:bg-sage-100 transition-colors"
        >
          <span>Open Serial Stream</span>
          <Zap className="w-3.5 h-3.5 text-gold-600" />
        </button>
      </div>

      {/* KPI Ribbon (Interactive Cross-Links) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="Morning Shift"
          value={`${morningLitres.toFixed(1)} L`}
          unit=""
          trend="neutral"
          changeText="Filter Morning"
          onClick={() => setShiftFilter('Morning')}
        />
        <MetricCard
          label="Evening Shift"
          value={`${eveningLitres.toFixed(1)} L`}
          unit=""
          trend="neutral"
          changeText="Filter Evening"
          onClick={() => setShiftFilter('Evening')}
        />
        <MetricCard
          label="Total Inward"
          value={`${totalLitres.toFixed(1)} L`}
          unit=""
          trend="up"
          changeText="Show All Shifts"
          onClick={() => setShiftFilter('All')}
        />
        <MetricCard
          label="Suppliers Today"
          value={collections.length}
          unit="Entries"
          trend="up"
          changeText="Open Tab 08 Farmers"
          onClick={() => setCurrentModule('farmers')}
        />
        <MetricCard
          label="Avg Fat %"
          value={avgFat}
          unit="%"
          trend="neutral"
          changeText="Open Tab 04 QC"
          onClick={() => setCurrentModule('quality')}
        />
        <MetricCard
          label="Avg SNF %"
          value={avgSNF}
          unit="%"
          trend="neutral"
          changeText="Open Tab 04 QC"
          onClick={() => setCurrentModule('quality')}
        />
        <MetricCard
          label="Rejected Milk"
          value={`${rejectedLitres.toFixed(1)} L`}
          unit=""
          trend="down"
          isGoodWhenUp={false}
          changeText={qcFilter === 'FAIL' ? 'Reset QC' : 'Filter Rejections'}
          onClick={() => setQcFilter(qcFilter === 'FAIL' ? 'All' : 'FAIL')}
        />
      </div>

      {/* Comprehensive Filter and Search Bar */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Farmer, ID, Centre, or CC#..."
              className="w-full bg-[#faf8f5] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">Shift:</span>
            <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setShiftFilter('All')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  shiftFilter === 'All' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({collections.length})
              </button>
              <button
                onClick={() => setShiftFilter('Morning')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  shiftFilter === 'Morning' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Morning ({morningCount})
              </button>
              <button
                onClick={() => setShiftFilter('Evening')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  shiftFilter === 'Evening' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Evening ({eveningCount})
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#ede8df]/70 text-xs">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">QC Status:</span>
              <select
                value={qcFilter}
                onChange={(e) => setQcFilter(e.target.value as any)}
                className="bg-[#faf8f5] border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-forest-600 cursor-pointer"
              >
                <option value="All">All QC Results</option>
                <option value="PASS">PASS Only</option>
                <option value="WARNING">WARNING Only</option>
                <option value="FAIL">FAIL (Rejected) Only</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Centre:</span>
              <select
                value={centreFilter}
                onChange={(e) => setCentreFilter(e.target.value)}
                className="bg-[#faf8f5] border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-forest-600 cursor-pointer"
              >
                <option value="All">All Centres</option>
                {centres.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Date:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#faf8f5] border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs text-stone-800 outline-none focus:border-forest-600 cursor-pointer"
              >
                <option value="All">All Dates</option>
                <option value="2026-10-06">2026-10-06 (Today)</option>
                <option value="2026-10-05">2026-10-05 (Yesterday)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-stone-500 font-mono text-xs">
              Showing <strong className="text-forest-900 font-bold">{filtered.length}</strong> of {collections.length}
            </span>
            {isFiltered && (
              <button
                onClick={() => {
                  setShiftFilter('All');
                  setQcFilter('All');
                  setCentreFilter('All');
                  setDateFilter('All');
                  setSearch('');
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collection Records Table */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#ede8df] flex items-center justify-between bg-cream-50/40">
          <h3 className="text-sm font-bold text-forest-950">Today's Milk Inward Log</h3>
          <span className="text-xs font-mono text-forest-800 font-bold bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
            Total Payable: ₹{totalPayable.toLocaleString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] text-stone-600 font-mono border-b border-[#ede8df] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Time / Shift</th>
                <th className="px-4 py-3 font-semibold">Farmer</th>
                <th className="px-4 py-3 font-semibold">Collection Centre</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Fat %</th>
                <th className="px-4 py-3 font-semibold">SNF %</th>
                <th className="px-4 py-3 font-semibold">Temp (°C)</th>
                <th className="px-4 py-3 font-semibold">QC Status</th>
                <th className="px-4 py-3 font-semibold">Rate / L</th>
                <th className="px-4 py-3 font-semibold text-right">Payable</th>
                <th className="px-4 py-3 font-semibold text-right">Receipt Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-stone-900">{item.time}</span>
                    <span className="text-stone-400 ml-2 text-[11px] font-sans">({item.shift})</span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <button
                      onClick={() => {
                        setSelectedItemId(item.farmerId);
                        setCurrentModule('farmers');
                      }}
                      className="text-left group cursor-pointer"
                      title="View Farmer Profile & Passbook in Tab 08"
                    >
                      <div className="font-bold text-forest-950 group-hover:text-forest-700 flex items-center gap-1">
                        <span>{item.farmerName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-forest-600 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{item.farmerId}</div>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-600">{item.centre}</td>
                  <td className="px-4 py-3 font-bold text-stone-900">{item.quantityLitres.toFixed(1)} L</td>
                  <td className="px-4 py-3 text-forest-800 font-semibold">{item.fat.toFixed(2)}%</td>
                  <td className="px-4 py-3 font-medium">{item.snf.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={item.temperatureC > 20 ? 'text-amber-800 font-bold' : 'text-stone-700'}>
                      {item.temperatureC.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <button
                      onClick={() => setCurrentModule('quality')}
                      className="cursor-pointer"
                      title="Jump to Quality Testing (Tab 04)"
                    >
                      <StatusBadge status={item.quality} size="sm" />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {item.ratePerLitre > 0 ? `₹${item.ratePerLitre.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-forest-900">
                    {item.payableAmount > 0 ? (
                      <button
                        onClick={() => setCurrentModule('payments')}
                        className="hover:underline cursor-pointer font-bold text-forest-900"
                        title="View in Payments Ledger (Tab 15)"
                      >
                        ₹{item.payableAmount.toLocaleString()}
                      </button>
                    ) : (
                      <span className="text-rose-700">REJECTED</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedSlipRecord(item);
                        setIsSlipOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#fdfcfb] hover:bg-cream-100 text-forest-800 hover:text-forest-950 rounded-lg text-[11px] font-mono border border-[#ede8df] inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      title="Print 58mm/80mm Slip or Send SMS"
                    >
                      <Printer className="w-3 h-3 text-stone-500" />
                      <span>POS Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ENTRY MODAL */}
      <QuickCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farmers={farmers}
        onSave={onAddCollection}
      />

      {/* HARDWARE IOT & LACTOSCAN BRIDGE MODAL */}
      <LactoscanSerialBridgeModal
        isOpen={isIotBridgeOpen}
        onClose={() => setIsIotBridgeOpen(false)}
        farmers={farmers}
        onCollectionIngested={onAddCollection}
      />

      {/* POS THERMAL RECEIPT & SMS DISPATCH MODAL */}
      <ThermalReceiptModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        collection={selectedSlipRecord}
      />
    </div>
  );
};

