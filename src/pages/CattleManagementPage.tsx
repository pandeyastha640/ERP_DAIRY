import React, { useState } from 'react';
import { Cattle } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { MiniSparkline, AreaTrendChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import {
  PageContainer,
  PageHeader,
  SectionHeader,
  FilterBar,
  SearchInput,
} from '../components/common/DesignSystem';
import {
  Plus,
  Syringe,
  HeartPulse,
  Boxes,
} from 'lucide-react';

interface CattleManagementPageProps {
  cattleList: Cattle[];
  onAddCattle: (cattle: Cattle, existingId?: string) => string | undefined;
  onArchiveCattle: (id: string) => void;
  selectedCattleId?: string;
}

export const CattleManagementPage: React.FC<CattleManagementPageProps> = ({
  cattleList,
  onAddCattle,
  onArchiveCattle,
  selectedCattleId,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Milking' | 'Dry' | 'Pregnant' | 'Sick'>(
    'All'
  );
  const [breedFilter, setBreedFilter] = useState<string>('All');
  const [activeProfile, setActiveProfile] = useState<Cattle | null>(() => {
    if (selectedCattleId) {
      return cattleList.find((c) => c.id === selectedCattleId) || null;
    }
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [formError, setFormError] = useState('');

  // New Cattle Form State
  const [newBreed, setNewBreed] = useState<Cattle['breed']>('Gir');
  const [newTag, setNewTag] = useState('');
  const [newAge, setNewAge] = useState('4');
  const [newLactation, setNewLactation] = useState('2');
  const [newStatus, setNewStatus] = useState<'Milking' | 'Dry' | 'Pregnant' | 'Sick'>('Milking');
  const [newYield, setNewYield] = useState('14.0');
  const [newFeedCost, setNewFeedCost] = useState('190');
  const [newShed, setNewShed] = useState('Shed A-Row 2');

  const activeCattle = cattleList.filter((c) => !c.archivedAt);
  const totalCattle = activeCattle.length;
  const milkingCount = activeCattle.filter((c) => c.status === 'Milking').length;
  const dryCount = activeCattle.filter((c) => c.status === 'Dry').length;
  const pregnantCount = activeCattle.filter((c) => c.status === 'Pregnant').length;
  const sickCount = activeCattle.filter((c) => c.status === 'Sick').length;

  const totalYield = activeCattle.reduce((acc, c) => acc + c.milkYieldLPerDay, 0);
  const avgYield = milkingCount > 0 ? (totalYield / milkingCount).toFixed(1) : '0';
  const totalFeed = activeCattle.reduce((acc, c) => acc + c.feedCostPerDay, 0);
  const avgFeedCost = (totalFeed / Math.max(1, totalCattle)).toFixed(0);

  const filteredCattle = activeCattle.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.tagNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.breed.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesBreed = breedFilter === 'All' || c.breed === breedFilter;
    return matchesSearch && matchesStatus && matchesBreed;
  });

  const handleCreateCattle = (e: React.FormEvent) => {
    e.preventDefault();
    const age = Number(newAge);
    const lactation = Number(newLactation);
    const milkYield = newStatus === 'Milking' ? Number(newYield) : 0;
    const feedCost = Number(newFeedCost);
    if (!newTag.trim() || !newShed.trim()) {
      setFormError('Ear tag and shed location are required.');
      return;
    }
    if (!Number.isFinite(age) || age <= 0 || !Number.isInteger(lactation) || lactation < 0 ||
        !Number.isFinite(milkYield) || milkYield < 0 || !Number.isFinite(feedCost) || feedCost < 0) {
      setFormError('Enter valid age, lactation, milk yield, and feed cost values.');
      return;
    }
    const newId = editingCattle?.id ?? `COW-${String(cattleList.length + 1).padStart(3, '0')}`;
    const newCattle: Cattle = {
      ...(editingCattle ?? {} as Cattle),
      id: newId,
      tagNumber: newTag.trim(),
      breed: newBreed,
      ageYears: age,
      lactation,
      lactationStage: newStatus === 'Dry' ? 'Dry' : 'Early',
      lastCalvingDate: editingCattle?.lastCalvingDate ?? new Date().toISOString().split('T')[0],
      milkYieldLPerDay: milkYield,
      feedCostPerDay: feedCost,
      health: newStatus === 'Sick' ? 'Under Treatment' : editingCattle?.health ?? 'Healthy',
      status: newStatus,
      shedLocation: newShed.trim(),
      dailyFeedKg: editingCattle?.dailyFeedKg ?? (newStatus === 'Milking' ? 24.5 : 18.0),
      vaccinations: editingCattle?.vaccinations ?? [
        { name: 'FMD (Foot & Mouth Disease)', date: '2026-04-12', status: 'Completed' },
        { name: 'Brucellosis Strain 19', date: '2026-06-20', status: 'Completed' },
      ],
      veterinaryNotes: editingCattle?.veterinaryNotes ?? 'Newly inducted cattle. General inspection normal.',
      historicalYields: editingCattle?.historicalYields ?? [milkYield],
    };

    const error = onAddCattle(newCattle, editingCattle?.id);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setIsAddModalOpen(false);
    setEditingCattle(null);
    setActiveProfile(newCattle);
  };

  const openCattleForm = (cattle?: Cattle) => {
    setEditingCattle(cattle ?? null);
    setFormError('');
    setNewBreed(cattle?.breed ?? 'Gir');
    setNewTag(cattle?.tagNumber ?? '');
    setNewAge(String(cattle?.ageYears ?? 4));
    setNewLactation(String(cattle?.lactation ?? 2));
    setNewStatus(cattle?.status ?? 'Milking');
    setNewYield(String(cattle?.milkYieldLPerDay ?? 14));
    setNewFeedCost(String(cattle?.feedCostPerDay ?? 190));
    setNewShed(cattle?.shedLocation ?? 'Shed A-Row 2');
    setIsAddModalOpen(true);
  };

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title="Cattle Herd Management"
        subtitle="Individual animal pedigree, lactation curve, nutritional feed intake and veterinary health records."
        statusBadge="Automated Parlour Connected"
        actions={
          <button
            onClick={() => openCattleForm()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cattle</span>
          </button>
        }
      />

      {/* 2. KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="Total Herd"
          value={totalCattle}
          unit="Cattle"
          trend="neutral"
          changeText="Registered"
        />
        <MetricCard
          label="Milking Cattle"
          value={milkingCount}
          unit="Animals"
          trend="up"
          changeText="80.8% of herd"
        />
        <MetricCard
          label="Dry Cattle"
          value={dryCount}
          unit="Animals"
          trend="neutral"
          changeText="Gestation"
        />
        <MetricCard
          label="Pregnant"
          value={pregnantCount}
          unit="Heifers"
          trend="up"
          changeText="Calving Q4"
        />
        <MetricCard
          label="Sick / Treatment"
          value={sickCount}
          unit="Cows"
          trend="down"
          isGoodWhenUp={false}
          changeText="Isolated in Bay C"
        />
        <MetricCard
          label="Avg Milk / Cow"
          value={avgYield}
          unit="L/day"
          trend="up"
          changeText="Peak: 23.8 L"
        />
        <MetricCard
          label="Avg Feed Cost"
          value={`₹${avgFeedCost}`}
          unit="/day"
          trend="neutral"
          changeText="Per animal"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <FilterBar onReset={() => { setSearch(''); setStatusFilter('All'); setBreedFilter('All'); }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search Cattle ID, Tag or Breed..."
        />

        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
          {(['All', 'Milking', 'Dry', 'Pregnant', 'Sick'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={breedFilter}
          onChange={(e) => setBreedFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none shadow-2xs cursor-pointer"
        >
          <option value="All">All Breeds</option>
          <option value="Gir">Gir</option>
          <option value="Sahiwal">Sahiwal</option>
          <option value="Murrah Buffalo">Murrah Buffalo</option>
          <option value="Red Sindhi">Red Sindhi</option>
          <option value="Jersey">Jersey</option>
        </select>
      </FilterBar>

      {/* 4. Cattle Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Cattle ID</th>
                <th className="px-4 py-3">Tag #</th>
                <th className="px-4 py-3">Breed</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Lactation</th>
                <th className="px-4 py-3">Last Calving</th>
                <th className="px-4 py-3">Milk Yield</th>
                <th className="px-4 py-3">7-Day Trend</th>
                <th className="px-4 py-3">Feed Cost</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono tabular-nums">
              {filteredCattle.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-xs text-slate-400 font-sans">
                    No cattle found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredCattle.map((cow) => (
                  <tr
                    key={cow.id}
                    onClick={() => setActiveProfile(cow)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-emerald-800">{cow.id}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{cow.tagNumber}</td>
                    <td className="px-4 py-3 font-sans font-medium text-slate-900">{cow.breed}</td>
                    <td className="px-4 py-3">{cow.ageYears} yrs</td>
                    <td className="px-4 py-3">
                      {cow.lactation} ({cow.lactationStage})
                    </td>
                    <td className="px-4 py-3 text-slate-400">{cow.lastCalvingDate}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">
                      {cow.milkYieldLPerDay > 0 ? `${cow.milkYieldLPerDay} L/d` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <MiniSparkline points={cow.historicalYields} color="#047857" />
                    </td>
                    <td className="px-4 py-3 text-slate-800">₹{cow.feedCostPerDay}/d</td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={
                          cow.health === 'Healthy'
                            ? 'text-emerald-700 font-medium'
                            : 'text-amber-700 font-medium'
                        }
                      >
                        {cow.health}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <StatusBadge status={cow.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProfile(cow);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CATTLE PROFILE DETAIL MODAL */}
      {activeProfile && (
        <EntityDetailDrawer
          isOpen={!!activeProfile}
          onClose={() => setActiveProfile(null)}
          title={`Cattle Record: ${activeProfile.id} (${activeProfile.breed})`}
          subtitle={`Tag: ${activeProfile.tagNumber} · Location: ${activeProfile.shedLocation}`}
        >
          <div className="space-y-5 text-xs">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Daily Milk Yield</div>
                <div className="text-xl font-bold text-emerald-800 mt-1">
                  {activeProfile.milkYieldLPerDay} L
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  ₹{(activeProfile.milkYieldLPerDay * 38).toFixed(0)} daily realization
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Daily Feed Cost</div>
                <div className="text-xl font-bold text-amber-700 mt-1">
                  ₹{activeProfile.feedCostPerDay}
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  {activeProfile.dailyFeedKg} kg dry matter
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-emerald-900 text-[11px] font-sans font-semibold">
                  Net Daily Margin
                </div>
                <div className="text-xl font-bold text-emerald-800 mt-1">
                  ₹
                  {Math.max(
                    0,
                    Math.round(activeProfile.milkYieldLPerDay * 38 - activeProfile.feedCostPerDay)
                  )}
                </div>
                <div className="text-[10px] text-emerald-800 font-sans mt-0.5">
                  Contribution to dairy
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px] font-sans">Lactation Stage</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {activeProfile.lactationStage}
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Calving: {activeProfile.lastCalvingDate}
                </div>
              </div>
            </div>

            {/* 7-Day Yield Trend Chart */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">7-Day Milk Production History</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {activeProfile.milkYieldLPerDay} L today
                </span>
              </div>
              <AreaTrendChart
                data={activeProfile.historicalYields.map((val, idx) => ({
                  label: `Day -${6 - idx}`,
                  value: val,
                }))}
                primaryColor="#047857"
                primaryLabel="Daily Yield (L)"
                unit="L"
                height={130}
              />
            </div>

            {/* Health & Vaccination Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-2">
                  <Syringe className="w-3.5 h-3.5 text-blue-700" />
                  <span>Vaccination Protocol</span>
                </div>
                <div className="space-y-2">
                  {activeProfile.vaccinations.map((vac, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] text-slate-700 border-b border-slate-200/60 pb-1"
                    >
                      <span>{vac.name}</span>
                      <span className="font-mono text-slate-500">
                        {vac.date} ({vac.status})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-2">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  <span>Veterinary & Clinical Notes</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeProfile.veterinaryNotes}
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-800 font-semibold">
                  Next scheduled checkup: 18 Oct 2026 (Dr. Anita Rao)
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-mono">
                Status: {activeProfile.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openCattleForm(activeProfile)}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >Edit Record</button>
                <button
                  onClick={() => {
                    if (window.confirm(`Archive cattle ${activeProfile.id}? Historical records will remain.`)) {
                      onArchiveCattle(activeProfile.id);
                      setActiveProfile(null);
                    }
                  }}
                  className="px-3 py-1.5 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium cursor-pointer"
                >Archive</button>
                <button
                  onClick={() => setActiveProfile(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
                >Close Profile</button>
              </div>
            </div>
          </div>
        </EntityDetailDrawer>
      )}

      {/* 6. ADD CATTLE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCattle ? `Edit Cattle ${editingCattle.id}` : 'Register New Cattle to Herd'}
        subtitle="Record ear tag number, breed genetics, age, and initial lactation status"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCattle} className="space-y-4">
          {formError && <p role="alert" className="text-xs text-rose-700">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Breed</label>
              <select
                value={newBreed}
                onChange={(e) => setNewBreed(e.target.value as Cattle['breed'])}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              >
                <option value="Gir">Gir (Indigenous Cow)</option>
                <option value="Sahiwal">Sahiwal</option>
                <option value="Murrah Buffalo">Murrah Buffalo</option>
                <option value="Red Sindhi">Red Sindhi</option>
                <option value="HF Cross">HF Cross</option>
                <option value="Jersey">Jersey</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ear Tag #</label>
              <input
                type="text"
                required
                placeholder="TAG-IN-88053"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min="1"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lactation</label>
              <input
                type="number"
                min="0"
                value={newLactation}
                onChange={(e) => setNewLactation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as 'Milking' | 'Dry' | 'Pregnant' | 'Sick')
                }
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              >
                <option value="Milking">Milking</option>
                <option value="Dry">Dry</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Sick">Sick</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Initial Yield (L/day)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={newYield}
                onChange={(e) => setNewYield(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Feed Cost (₹/day)
              </label>
              <input
                type="number"
                min="0"
                value={newFeedCost}
                onChange={(e) => setNewFeedCost(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Shed Location</label>
              <input
                type="text"
                value={newShed}
                onChange={(e) => setNewShed(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
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
              {editingCattle ? 'Save Changes' : 'Save Cattle Record'}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
