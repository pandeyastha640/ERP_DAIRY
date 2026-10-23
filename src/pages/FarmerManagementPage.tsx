import React, { useState } from 'react';
import { Farmer } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
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
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { translate } from '../i18n';

interface FarmerManagementPageProps {
  farmers: Farmer[];
  onAddFarmer: (farmer: Omit<Farmer, 'id'>) => Promise<Farmer>;
  selectedFarmerId?: string;
}

export const FarmerManagementPage: React.FC<FarmerManagementPageProps> = ({
  farmers,
  onAddFarmer,
  selectedFarmerId,
}) => {
  const { settings, collectionsList, language } = useDairyERP();
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
  const [isSavingFarmer, setIsSavingFarmer] = useState(false);
  const [farmerError, setFarmerError] = useState<string | null>(null);

  // New Farmer Form
  const [newName, setNewName] = useState('');
  const [newVillage, setNewVillage] = useState('Anand Rural');
  const [newPhone, setNewPhone] = useState('');
  const [newCattle, setNewCattle] = useState('0');
  const [newBank, setNewBank] = useState('');

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
      f.contactNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase());
    const matchesVillage = villageFilter === 'All' || f.village === villageFilter;
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesVillage && matchesStatus;
  });

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFarmer(true);
    setFarmerError(null);
    const newFarmer: Omit<Farmer, 'id'> = {
      name: newName.trim(),
      village: newVillage,
      contactNumber: newPhone.trim(),
      cattleCount: Number(newCattle),
      todayMilkL: 0,
      morningMilkL: 0,
      eveningMilkL: 0,
      avgFat: 0,
      avgSNF: 0,
      ratePerL: 0,
      todayPayable: 0,
      status: 'Active',
      bankAccount: newBank,
      joinedDate: new Date().toISOString().split('T')[0],
      demoPerformanceScore: 0,
      supplyHistory: [],
      paymentHistory: [],
    };

    try {
      const savedFarmer = await onAddFarmer(newFarmer);
      setActiveProfile(savedFarmer);
      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewCattle('0');
      setNewBank('');
    } catch (error) {
      setFarmerError(error instanceof Error ? error.message : 'Farmer registration failed. Please try again.');
    } finally {
      setIsSavingFarmer(false);
    }
  };

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title={translate(language, 'Farmer & Procurement Directory')}
        subtitle="Producer registry, village milk pourer logs, automated fat/SNF pricing rates, and direct bank settlement."
        statusBadge="Farmer records saved to server"
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-forest-950/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>{translate(language, 'Add Farmer')}</span>
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

        <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white text-forest-950 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({totalFarmers})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-white text-forest-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('Under Review')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === 'Under Review'
                ? 'bg-white text-amber-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Under Review ({underReviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === 'Inactive'
                ? 'bg-white text-rose-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Village:</span>
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-800 outline-none shadow-2xs cursor-pointer focus:border-forest-600"
          >
            <option value="All">All Villages ({totalFarmers})</option>
            {villages.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-stone-500 font-mono">
          Showing <strong className="text-forest-900 font-bold">{filteredFarmers.length}</strong> of {totalFarmers}
        </span>
      </FilterBar>

      {/* 4. Farmers Table */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#ede8df] text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
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
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-stone-400 font-sans">
                    No farmers found matching query.
                  </td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => setActiveProfile(farmer)}
                    className="hover:bg-cream-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-forest-900">{farmer.id}</td>
                    <td className="px-4 py-3 font-sans font-bold text-forest-950">
                      {farmer.name}
                    </td>
                    <td className="px-4 py-3 font-sans text-stone-600">{farmer.village}</td>
                    <td className="px-4 py-3">{farmer.cattleCount} animals</td>
                    <td className="px-4 py-3 font-bold text-stone-900">{farmer.todayMilkL} L</td>
                    <td className="px-4 py-3 text-forest-800 font-semibold">{farmer.avgFat}%</td>
                    <td className="px-4 py-3">{farmer.avgSNF}%</td>
                    <td className="px-4 py-3">₹{farmer.ratePerL.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-forest-900">
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
                        className="px-2.5 py-1 bg-[#fdfcfb] hover:bg-cream-100 text-forest-900 border border-[#ede8df] rounded-lg text-[11px] font-sans font-semibold transition-colors cursor-pointer shadow-2xs"
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
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Today's Milk Supply</div>
                <div className="text-xl font-bold text-forest-950 mt-1">
                  {activeProfile.todayMilkL} L
                </div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                  M: {activeProfile.morningMilkL} L / E: {activeProfile.eveningMilkL} L
                </div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Fat / SNF Quality</div>
                <div className="text-xl font-bold text-forest-900 mt-1">
                  {activeProfile.avgFat}% / {activeProfile.avgSNF}%
                </div>
                <div className="text-[10px] text-forest-700 font-sans mt-0.5 font-medium">Grade A Certified</div>
              </div>
              <div className="p-3.5 bg-sage-50/80 rounded-xl border border-sage-200">
                <div className="text-forest-950 text-[11px] font-sans font-bold">
                  Today's Settlement
                </div>
                <div className="text-xl font-bold text-forest-900 mt-1">
                  ₹{activeProfile.todayPayable.toLocaleString()}
                </div>
                <div className="text-[10px] text-forest-800 font-sans mt-0.5 font-semibold">
                  @ ₹{activeProfile.ratePerL}/L rate
                </div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Quality Score</div>
                <div className="text-xl font-bold text-stone-900 mt-1">
                  {activeProfile.demoPerformanceScore}/100
                </div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                  Consistency rating
                </div>
              </div>
            </div>

            {/* Milk Supply History Chart */}
            <div className="p-4 bg-[#fdfcfb] rounded-2xl border border-[#ede8df] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-forest-950">
                  Milk Supply Trend (Last 6 Days)
                </span>
                <span className="font-mono text-forest-900 font-bold bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">
                  {activeProfile.todayMilkL} L today
                </span>
              </div>
              <AreaTrendChart
                data={activeProfile.supplyHistory.map((s) => ({
                  label: s.date.slice(5),
                  value: s.litres,
                }))}
                primaryColor="#1b4332"
                primaryLabel="Supplied (L)"
                unit="L"
                height={120}
              />
            </div>

            {/* Bank & Settlement Records */}
            <div className="p-4 bg-cream-50/70 rounded-2xl border border-[#ede8df]">
              <div className="flex items-center justify-between font-bold text-forest-950 mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-forest-700" />
                  <span>Settlement Bank Account: {activeProfile.bankAccount}</span>
                </div>
                <span className="text-[10px] font-mono text-forest-900 bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200 font-bold">
                  {activeProfile.bankAccount ? 'Bank details on file' : 'Bank details not provided'}
                </span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                {activeProfile.paymentHistory.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-stone-700 border-b border-[#ede8df]/70 pb-1.5"
                  >
                    <span>
                      {p.date} · {p.method}
                    </span>
                    <span className="font-bold text-forest-900">
                      ₹{p.amount.toLocaleString()}
                    </span>
                    <span className="font-sans text-forest-800 font-bold text-[10px] bg-sage-100/70 px-2 py-0.5 rounded-md">
                      PAID
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#ede8df]">
              <button
                onClick={() => {
                  import('../services/pdfGenerator').then(({ pdfGenerator }) => {
                    pdfGenerator.generateFarmerPassbookPDF(activeProfile, collectionsList, settings);
                  });
                }}
                className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs shadow-forest-950/20 transition-all duration-150 active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Monthly Passbook PDF</span>
              </button>
              <button
                onClick={() => setActiveProfile(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
        title={translate(language, 'Register New Milk Producer')}
        subtitle="Create a farmer profile for the cooperative. Bank details are optional."
        maxWidth="md"
      >
        <form onSubmit={handleCreateFarmer} className="space-y-4">
          {farmerError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{farmerError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {translate(language, 'Farmer Full Name')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sanjaybhai Patel"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {translate(language, 'Village Cluster')}
              </label>
              <input
                type="text"
                required
                value={newVillage}
                onChange={(e) => setNewVillage(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
                placeholder="Village or collection centre"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">{translate(language, 'Cattle Count')}</label>
              <input
                type="number"
                min="0"
                max="500"
                step="1"
                required
                value={newCattle}
                onChange={(e) => setNewCattle(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {translate(language, 'Phone / Mobile')}
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">{translate(language, 'Bank Account')}</label>
              <input
                type="text"
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingFarmer}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              {isSavingFarmer ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{translate(language, 'Saving…')}</span> : translate(language, 'Save Farmer')}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
