import React, { useState } from 'react';
import { MilkCollectionRecord, Farmer } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { QuickCollectionModal } from '../components/operations/QuickCollectionModal';
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
} from 'lucide-react';

interface MilkCollectionPageProps {
  collections: MilkCollectionRecord[];
  farmers: Farmer[];
  onAddCollection: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => void;
  onOpenMobileView: () => void;
}

export const MilkCollectionPage: React.FC<MilkCollectionPageProps> = ({
  collections,
  farmers,
  onAddCollection,
  onOpenMobileView,
}) => {
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalLitres = collections.reduce((acc, c) => acc + c.quantityLitres, 0);
  const morningLitres = collections.filter((c) => c.shift === 'Morning').reduce((acc, c) => acc + c.quantityLitres, 0);
  const eveningLitres = collections.filter((c) => c.shift === 'Evening').reduce((acc, c) => acc + c.quantityLitres, 0);
  const totalPayable = collections.reduce((acc, c) => acc + c.payableAmount, 0);
  const rejectedLitres = collections.filter((c) => c.quality === 'FAIL').reduce((acc, c) => acc + c.quantityLitres, 0);
  const avgFat = collections.length > 0 ? (collections.reduce((acc, c) => acc + c.fat, 0) / collections.length).toFixed(2) : '0';
  const avgSNF = collections.length > 0 ? (collections.reduce((acc, c) => acc + c.snf, 0) / collections.length).toFixed(2) : '0';

  const filtered = collections.filter((c) => {
    const matchesShift = shiftFilter === 'All' || c.shift === shiftFilter;
    const matchesSearch =
      c.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      c.farmerId.toLowerCase().includes(search.toLowerCase()) ||
      c.centre.toLowerCase().includes(search.toLowerCase());
    return matchesShift && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Milk Collection Desk
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Real-time farmer inward intake, milk analyzer integration, lactometer testing and instantaneous payable calculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileView}
            className="px-3 py-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#58a6ff] rounded-lg transition-colors"
          >
            Touch Field Mode
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Morning Shift" value={`${morningLitres.toFixed(1)} L`} unit="" trend="neutral" changeText="Completed" />
        <MetricCard label="Evening Shift" value={`${eveningLitres.toFixed(1)} L`} unit="" trend="neutral" changeText="Active inward" />
        <MetricCard label="Total Inward" value={`${totalLitres.toFixed(1)} L`} unit="" trend="up" changeText="Today's milk" />
        <MetricCard label="Suppliers Today" value={collections.length} unit="Entries" trend="up" changeText="30 Distinct" />
        <MetricCard label="Avg Fat %" value={avgFat} unit="%" trend="neutral" changeText="Analyzer avg" />
        <MetricCard label="Avg SNF %" value={avgSNF} unit="%" trend="neutral" changeText="Solid-not-fat" />
        <MetricCard
          label="Rejected Milk"
          value={`${rejectedLitres.toFixed(1)} L`}
          unit=""
          trend="down"
          isGoodWhenUp={false}
          changeText="Quality threshold"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Farmer name, ID or Centre..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Shift Filter:</span>
          <div className="flex bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 text-xs">
            {(['All', 'Morning', 'Evening'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShiftFilter(s)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  shiftFilter === s ? 'bg-[#388bfd] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Records Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">Today's Milk Inward Log</h3>
          <span className="text-xs font-mono text-[#3fb950] font-semibold">
            Total Payable: ₹{totalPayable.toLocaleString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Time / Shift</th>
                <th className="px-4 py-2.5 font-medium">Farmer</th>
                <th className="px-4 py-2.5 font-medium">Collection Centre</th>
                <th className="px-4 py-2.5 font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Fat %</th>
                <th className="px-4 py-2.5 font-medium">SNF %</th>
                <th className="px-4 py-2.5 font-medium">Temp (°C)</th>
                <th className="px-4 py-2.5 font-medium">QC Status</th>
                <th className="px-4 py-2.5 font-medium">Rate / L</th>
                <th className="px-4 py-2.5 font-medium text-right">Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-[#f0f6fc]">{item.time}</span>
                    <span className="text-[#8b949e] ml-2 text-[11px] font-sans">({item.shift})</span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-[#f0f6fc]">{item.farmerName}</div>
                    <div className="text-[11px] text-[#8b949e] font-mono">{item.farmerId}</div>
                  </td>
                  <td className="px-4 py-3 font-sans text-[#8b949e]">{item.centre}</td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">{item.quantityLitres.toFixed(1)} L</td>
                  <td className="px-4 py-3 text-[#58a6ff]">{item.fat.toFixed(2)}%</td>
                  <td className="px-4 py-3">{item.snf.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={item.temperatureC > 20 ? 'text-[#f0883e] font-bold' : 'text-[#c9d1d9]'}>
                      {item.temperatureC.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={item.quality} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {item.ratePerLitre > 0 ? `₹${item.ratePerLitre.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#3fb950]">
                    {item.payableAmount > 0 ? `₹${item.payableAmount.toLocaleString()}` : 'REJECTED'}
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
    </div>
  );
};
