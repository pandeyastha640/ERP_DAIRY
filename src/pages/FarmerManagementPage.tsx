import React, { useState } from 'react';
import { Farmer } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AreaTrendChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import {
  PageContainer,
  PageHeader,
  FilterBar,
  SearchInput,
} from '../components/common/DesignSystem';
import {
  Plus,
  CreditCard,
  Phone,
} from 'lucide-react';

interface FarmerManagementPageProps {
  farmers: Farmer[];
  onAddFarmer: (farmer: Farmer) => void;
  selectedFarmerId?: string;
}

export const FarmerManagementPage: React.FC<FarmerManagementPageProps> = ({
  farmers,
  onAddFarmer,
  selectedFarmerId,
}) => {
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Under Review' | 'Inactive'>('All');
  const [activeProfile, setActiveProfile] = useState<Farmer | null>(() => {
    if (selectedFarmerId) {
      return farmers.find((f) => f.id === selectedFarmerId) || null;
    }
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Farmer Form
  const [newName, setNewName] = useState('');
  const [newVillage, setNewVillage] = useState('Anand Rural');
  const [newPhone, setNewPhone] = useState('+91 9825123456');
  const [newCattle, setNewCattle] = useState('5');
  const [newBank, setNewBank] = useState('SBI-XXXX9901');

  const totalFarmers = farmers.length;
  const activeCount = farmers.filter((f) => f.status === 'Active').length;
  const underReviewCount = farmers.filter((f) => f.status === 'Under Review').length;
  const inactiveCount = farmers.filter((f) => f.status === 'Inactive').length;
  const totalLitres = farmers.reduce((acc, f) => acc + f.todayMilkL, 0);
  const avgLitres = totalFarmers > 0 ? (totalLitres / totalFarmers).toFixed(1) : '0';
  const totalPayable = farmers.reduce((acc, f) => acc + f.todayPayable, 0);
  const avgFat = (farmers.reduce((acc, f) => acc + f.avgFat, 0) / Math.max(1, totalFarmers)).toFixed(
    2
  );
  const avgSNF = (farmers.reduce((acc, f) => acc + f.avgSNF, 0) / Math.max(1, totalFarmers)).toFixed(
    2
  );

  const villages = Array.from(new Set(farmers.map((f) => f.village)));

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase());
    const matchesVillage = villageFilter === 'All' || f.village === villageFilter;
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesVillage && matchesStatus;
  });

  const handleCreateFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `FARM-${String(totalFarmers + 1).padStart(3, '0')}`;
    const newFarmer: Farmer = {
      id: newId,
      name: newName || 'Sanjaybhai Patel',
      village: newVillage,
      contactNumber: newPhone,
      cattleCount: parseInt(newCattle) || 4,
      todayMilkL: 55.0,
      morningMilkL: 30.0,
      eveningMilkL: 25.0,
      avgFat: 4.4,
      avgSNF: 8.6,
      ratePerL: 36.8,
      todayPayable: Math.round(55.0 * 36.8),
      status: 'Active',
      bankAccount: newBank,
      joinedDate: new Date().toISOString().split('T')[0],
      demoPerformanceScore: 88,
      supplyHistory: [
        { date: '2026-10-01', litres: 52, fat: 4.3, snf: 8.5 },
        { date: '2026-10-02', litres: 54, fat: 4.4, snf: 8.6 },
        { date: '2026-10-03', litres: 55, fat: 4.4, snf: 8.6 },
      ],
      paymentHistory: [
        { date: '2026-09-30', amount: 30500, method: 'Direct Bank IMPS', status: 'Paid' },
      ],
    };

    onAddFarmer(newFarmer);
    setIsAddModalOpen(false);
  };

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title="Farmer & Procurement Directory"
        subtitle="Producer registry, village milk pourer logs, automated fat/SNF pricing rates, and direct bank settlement."
        statusBadge="Direct Bank Settlement Ready"
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Farmer</span>
          </button>
        }
      />

      {/* 2. KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="Total Farmers"
          value={totalFarmers}
          unit="Producers"
          trend="up"
          changeText="Enrolled"
        />
        <MetricCard
          label="Active Pourers"
          value={activeCount}
          unit="Farmers"
          trend="neutral"
          changeText="Pouring today"
        />
        <MetricCard
          label="Avg Supply"
          value={avgLitres}
          unit="L/farmer"
          trend="down"
          changePct={-4.2}
          changeText="Daily avg"
        />
        <MetricCard
          label="Avg Fat %"
          value={avgFat}
          unit="%"
          trend="up"
          changeText="Quality benchmark"
        />
        <MetricCard
          label="Avg SNF %"
          value={avgSNF}
          unit="%"
          trend="neutral"
          changeText="Solid-not-fat"
        />
        <MetricCard
          label="Today's Payable"
          value={`₹${(totalPayable / 1000).toFixed(1)}k`}
          unit=""
          trend="down"
          changeText="Procurement cost"
        />
        <MetricCard
          label="Avg Rate"
          value="₹38.2"
          unit="/Litre"
          trend="neutral"
          changeText="Two-axis pricing"
        />
      </div>

      {/* 3. Filter and Search Bar */}
      <FilterBar onReset={() => { setSearch(''); setVillageFilter('All'); setStatusFilter('All'); }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search Farmer ID, Name or Village..."
        />

        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalFarmers})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-white text-emerald-800 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('Under Review')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'Under Review'
                ? 'bg-white text-amber-800 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Under Review ({underReviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('Inactive')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'Inactive'
                ? 'bg-white text-rose-800 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Village:</span>
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            <option value="All">All Villages ({totalFarmers})</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-emerald-700">{filteredFarmers.length}</strong> of {totalFarmers}
        </span>
      </FilterBar>

      {/* 4. Farmers Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Farmer ID</th>
                <th className="px-4 py-3">Farmer Name</th>
                <th className="px-4 py-3">Village</th>
                <th className="px-4 py-3">Cattle Count</th>
                <th className="px-4 py-3">Today's Milk</th>
                <th className="px-4 py-3">Fat %</th>
                <th className="px-4 py-3">SNF %</th>
                <th className="px-4 py-3">Rate / L</th>
                <th className="px-4 py-3">Today's Payable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No farmers found matching query.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => setActiveProfile(farmer)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-blue-700">{farmer.id}</td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">
                      {farmer.name}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500">{farmer.village}</td>
                    <td className="px-4 py-3">{farmer.cattleCount} animals</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{farmer.todayMilkL} L</td>
                    <td className="px-4 py-3 text-emerald-800">{farmer.avgFat}%</td>
                    <td className="px-4 py-3">{farmer.avgSNF}%</td>
                    <td className="px-4 py-3">₹{farmer.ratePerL.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">
                      ₹{farmer.todayPayable.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <StatusBadge status={farmer.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProfile(farmer);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                      >
                        Ledger
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FARMER PROFILE MODAL */}
      {activeProfile && (
        <Modal
          isOpen={!!activeProfile}
          onClose={() => setActiveProfile(null)}
          title={`Farmer Profile: ${activeProfile.name} (${activeProfile.id})`}
          subtitle={`Village: ${activeProfile.village} · Contact: ${activeProfile.contactNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Top Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Today's Milk Supply</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {activeProfile.todayMilkL} L
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  M: {activeProfile.morningMilkL} L / E: {activeProfile.eveningMilkL} L
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Fat / SNF Quality</div>
                <div className="text-xl font-bold text-blue-700 mt-1">
                  {activeProfile.avgFat}% / {activeProfile.avgSNF}%
                </div>
                <div className="text-[10px] text-emerald-700 font-sans mt-0.5">Grade A Certified</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-emerald-900 text-[11px] font-sans font-semibold">
                  Today's Settlement
                </div>
                <div className="text-xl font-bold text-emerald-800 mt-1">
                  ₹{activeProfile.todayPayable.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-800 font-sans mt-0.5">
                  @ ₹{activeProfile.ratePerL}/L rate
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Quality Score</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {activeProfile.demoPerformanceScore}/100
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Consistency rating
                </div>
              </div>
            </div>

            {/* Milk Supply History Chart */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">
                  Milk Supply Trend (Last 6 Days)
                </span>
                <span className="font-mono text-emerald-800 font-bold">
                  {activeProfile.todayMilkL} L today
                </span>
              </div>
              <AreaTrendChart
                data={activeProfile.supplyHistory.map((s) => ({
                  label: s.date.slice(5),
                  value: s.litres,
                }))}
                primaryColor="#047857"
                primaryLabel="Supplied (L)"
                unit="L"
                height={120}
              />
            </div>

            {/* Bank & Settlement Records */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-900 mb-2">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                  <span>Settlement Bank Account: {activeProfile.bankAccount}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Direct Transfer Active
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {activeProfile.paymentHistory.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-slate-700 border-b border-slate-200/60 pb-1"
                  >
                    <span>
                      {p.date} · {p.method}
                    </span>
                    <span className="font-bold text-emerald-800">
                      ₹{p.amount.toLocaleString()}
                    </span>
                    <span className="font-sans text-emerald-800 font-semibold text-[10px]">
                      PAID
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveProfile(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. ADD FARMER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Milk Producer"
        subtitle="Enrol farmer into DairyOS procurement network and setup automated banking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFarmer} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Farmer Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sanjaybhai Patel"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Village Cluster
              </label>
              <select
                value={newVillage}
                onChange={(e) => setNewVillage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
              >
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cattle Count</label>
              <input
                type="number"
                value={newCattle}
                onChange={(e) => setNewCattle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone / Mobile
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bank Account</label>
              <input
                type="text"
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
            >
              Save Farmer
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
