import React, { useState } from 'react';
import { Cattle } from '../types/dairy';
import { useDairyERP } from '../context/DairyERPContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { MiniSparkline, AreaTrendChart } from '../components/charts/Charts';
import { Modal } from '../components/common/Modal';
import {
  PageContainer,
  PageHeader,
  FilterBar,
  SearchInput,
} from '../components/common/DesignSystem';
import {
  Plus,
  Syringe,
  HeartPulse,
  Boxes,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Milk,
  Scale,
} from 'lucide-react';

interface CattleManagementPageProps {
  cattleList: Cattle[];
  onAddCattle: (cattle: Cattle) => void;
  selectedCattleId?: string;
}

export const CattleManagementPage: React.FC<CattleManagementPageProps> = ({
  cattleList: propsCattleList,
  onAddCattle,
  selectedCattleId,
}) => {
  const { recordCattleMilking, cattleList: contextCattleList } = useDairyERP();
  const cattleList = contextCattleList && contextCattleList.length > 0 ? contextCattleList : propsCattleList;

  const [activeView, setActiveView] = useState<'Herd' | 'Breeding' | 'Vaccination'>('Herd');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Milking' | 'Dry' | 'Pregnant' | 'Sick'>('All');
  const [breedFilter, setBreedFilter] = useState<string>('All');
  const [activeProfile, setActiveProfile] = useState<Cattle | null>(() => {
    if (selectedCattleId) {
      return cattleList.find((c) => c.id === selectedCattleId) || null;
    }
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMilkingModalOpen, setIsMilkingModalOpen] = useState(false);

  // Daily Milking Form State
  const [milkingCattleId, setMilkingCattleId] = useState(cattleList[0]?.id || 'COW-001');
  const [milkingShift, setMilkingShift] = useState<'Morning' | 'Evening'>('Morning');
  const [milkingYield, setMilkingYield] = useState('14.5');
  const [milkingFat, setMilkingFat] = useState('4.4');
  const [milkingSnf, setMilkingSnf] = useState('8.6');
  const [milkingShed, setMilkingShed] = useState('Milking Parlour A');

  // New Cattle Form State
  const [newBreed, setNewBreed] = useState<'Gir' | 'Sahiwal' | 'Murrah Buffalo' | 'Red Sindhi'>('Gir');
  const [newTag, setNewTag] = useState('');
  const [newAge, setNewAge] = useState('4');
  const [newLactation, setNewLactation] = useState('2');
  const [newStatus, setNewStatus] = useState<'Milking' | 'Dry' | 'Pregnant' | 'Sick'>('Milking');
  const [newYield, setNewYield] = useState('14.0');
  const [newFeedCost, setNewFeedCost] = useState('190');
  const [newShed, setNewShed] = useState('Shed A-Row 2');

  // AI / Breeding Form State
  const [aiCattleTag, setAiCattleTag] = useState('COW-001');
  const [aiStrawCode, setAiStrawCode] = useState('GIR-PED-BULL-904');
  const [aiInseminator, setAiInseminator] = useState('Dr. R. K. Sharma (AI Officer)');

  // Breeding & Gestation Dataset
  const [breedingRecords, setBreedingRecords] = useState([
    {
      id: 'AI-2026-101',
      cattleTag: 'COW-001 (TAG-IN-88001)',
      breed: 'Gir',
      eventType: 'Insemination',
      eventDate: '2026-08-15',
      strawCode: 'GIR-BULL-904',
      pdStatus: 'Positive (Pregnant)',
      pdCheckDate: '2026-10-14',
      dryOffDate: '2027-03-23',
      expectedCalvingDate: '2027-05-22',
      daysInGestation: 61,
      inseminator: 'Dr. R. K. Sharma',
    },
    {
      id: 'AI-2026-102',
      cattleTag: 'COW-004 (TAG-IN-88004)',
      breed: 'Sahiwal',
      eventType: 'Heat Predicted',
      eventDate: '2026-10-12',
      strawCode: 'SAHI-PED-402',
      pdStatus: 'Pending Insemination',
      pdCheckDate: '2026-12-11',
      dryOffDate: '2027-05-20',
      expectedCalvingDate: '2027-07-19',
      daysInGestation: 3,
      inseminator: 'Dr. Anita Rao',
    },
    {
      id: 'AI-2026-103',
      cattleTag: 'COW-008 (TAG-IN-88008)',
      breed: 'Murrah Buffalo',
      eventType: 'Dry-Off Transition',
      eventDate: '2026-02-10',
      strawCode: 'MURRAH-ELITE-01',
      pdStatus: 'Confirmed Pregnant',
      pdCheckDate: '2026-04-11',
      dryOffDate: '2026-09-18',
      expectedCalvingDate: '2026-11-17',
      daysInGestation: 247,
      inseminator: 'Dr. R. K. Sharma',
    },
    {
      id: 'AI-2026-104',
      cattleTag: 'COW-015 (TAG-IN-88015)',
      breed: 'Gir',
      eventType: 'Insemination',
      eventDate: '2026-09-01',
      strawCode: 'GIR-PED-880',
      pdStatus: 'PD Check Scheduled',
      pdCheckDate: '2026-10-31',
      dryOffDate: '2027-04-09',
      expectedCalvingDate: '2027-06-08',
      daysInGestation: 44,
      inseminator: 'Dr. Anita Rao',
    },
  ]);

  // Mandatory National Dairy Vaccination Protocols
  const vaccinationProtocols = [
    {
      disease: 'FMD (Foot-and-Mouth Disease)',
      schedule: 'Bi-Annual (Every 6 Months)',
      lastAdministered: '12 Apr 2026',
      nextDue: '12 Oct 2026',
      status: 'Due for Booster',
      coveragePct: 96.2,
      vaccineBatch: 'VAC-FMD-GUJ-902',
    },
    {
      disease: 'Hemorrhagic Septicemia (HS)',
      schedule: 'Annual (Pre-Monsoon)',
      lastAdministered: '15 May 2026',
      nextDue: '15 May 2027',
      status: 'Protected',
      coveragePct: 100,
      vaccineBatch: 'VAC-HS-2026-11',
    },
    {
      disease: 'Black Quarter (BQ)',
      schedule: 'Annual (Pre-Monsoon)',
      lastAdministered: '18 May 2026',
      nextDue: '18 May 2027',
      status: 'Protected',
      coveragePct: 98.1,
      vaccineBatch: 'VAC-BQ-2026-44',
    },
    {
      disease: 'Brucellosis Strain 19',
      schedule: 'Once in Lifetime (Female Calves 4-8 mo)',
      lastAdministered: '20 Jun 2026',
      nextDue: 'Ongoing for New Calves',
      status: 'Protected',
      coveragePct: 94.5,
      vaccineBatch: 'VAC-BRUC-991',
    },
  ];

  const totalCattle = cattleList.length;
  const milkingCount = cattleList.filter((c) => c.status === 'Milking').length;
  const dryCount = cattleList.filter((c) => c.status === 'Dry').length;
  const pregnantCount = cattleList.filter((c) => c.status === 'Pregnant').length;
  const sickCount = cattleList.filter((c) => c.status === 'Sick').length;

  const totalYield = cattleList.reduce((acc, c) => acc + c.milkYieldLPerDay, 0);
  const avgYield = milkingCount > 0 ? (totalYield / milkingCount).toFixed(1) : '0';
  const totalFeed = cattleList.reduce((acc, c) => acc + c.feedCostPerDay, 0);
  const avgFeedCost = (totalFeed / Math.max(1, totalCattle)).toFixed(0);

  const filteredCattle = cattleList.filter((c) => {
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
    const newId = `COW-${String(totalCattle + 1).padStart(3, '0')}`;
    const newCattle: Cattle = {
      id: newId,
      tagNumber: newTag || `TAG-IN-${88000 + totalCattle + 1}`,
      breed: newBreed,
      ageYears: parseInt(newAge) || 4,
      lactation: parseInt(newLactation) || 2,
      lactationStage: newStatus === 'Dry' ? 'Dry' : 'Early',
      lastCalvingDate: new Date().toISOString().split('T')[0],
      milkYieldLPerDay: newStatus === 'Milking' ? parseFloat(newYield) || 0 : 0,
      feedCostPerDay: parseFloat(newFeedCost) || 180,
      health: newStatus === 'Sick' ? 'Under Treatment' : 'Healthy',
      status: newStatus,
      shedLocation: newShed,
      dailyFeedKg: newStatus === 'Milking' ? 24.5 : 18.0,
      vaccinations: [
        { name: 'FMD (Foot & Mouth Disease)', date: '2026-04-12', status: 'Completed' },
        { name: 'Brucellosis Strain 19', date: '2026-06-20', status: 'Completed' },
      ],
      veterinaryNotes: 'Newly inducted cattle. General inspection normal.',
      historicalYields: [12, 13, 13.5, 14, 13.8, 14.2, parseFloat(newYield) || 14],
    };

    onAddCattle(newCattle);
    setIsAddModalOpen(false);
  };

  const handleRecordInsemination = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const eventDate = now.toISOString().split('T')[0];
    const eventTime = now.getTime();

    const newRecord = {
      id: `AI-2026-${Math.floor(100 + Math.random() * 900)}`,
      cattleTag: aiCattleTag,
      breed: 'Gir',
      eventType: 'Insemination',
      eventDate,
      strawCode: aiStrawCode,
      pdStatus: 'PD Check Scheduled',
      pdCheckDate: new Date(eventTime + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dryOffDate: new Date(eventTime + 220 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedCalvingDate: new Date(eventTime + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysInGestation: 1,
      inseminator: aiInseminator,
    };

    setBreedingRecords([newRecord, ...breedingRecords]);
    setIsAiModalOpen(false);
  };

  const handleRecordMilking = (e: React.FormEvent) => {
    e.preventDefault();
    const yieldNum = parseFloat(milkingYield) || 0;
    recordCattleMilking({
      cattleId: milkingCattleId,
      yieldLitres: yieldNum,
      shift: milkingShift,
      fat: parseFloat(milkingFat) || 4.4,
      snf: parseFloat(milkingSnf) || 8.6,
    });

    if (activeProfile && (activeProfile.id === milkingCattleId || activeProfile.tagNumber === milkingCattleId)) {
      setActiveProfile({
        ...activeProfile,
        milkYieldLPerDay: yieldNum,
        status: 'Milking',
        historicalYields: [...(activeProfile.historicalYields || []).slice(-6), yieldNum],
      });
    }

    setIsMilkingModalOpen(false);
  };

  return (
    <PageContainer>
      {/* 1. Header */}
      <PageHeader
        title="Cattle Herd & Veterinary Reproduction"
        subtitle="Individual animal pedigree, estrus heat cycles, artificial insemination gestation milestones, and vaccination disease surveillance."
        statusBadge="Automated Parlour & RFID Connected"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMilkingCattleId(cattleList[0]?.id || 'COW-001');
                setIsMilkingModalOpen(true);
              }}
              className="px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-forest-900 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Milk className="w-4 h-4 text-forest-700" />
              <span>Log Daily Milking</span>
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-forest-900 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>Record AI Breeding</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-forest-950/20 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cattle</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Metric KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard label="Total Herd" value={totalCattle} unit="Head" trend="neutral" changeText="Registered" />
        <MetricCard label="Milking Cattle" value={milkingCount} unit="Animals" trend="up" changeText="80.8% of herd" />
        <MetricCard label="Dry Cattle" value={dryCount} unit="Animals" trend="neutral" changeText="Gestation" />
        <MetricCard label="Pregnant (AI)" value={pregnantCount} unit="Heifers" trend="up" changeText="Calving Q4" />
        <MetricCard label="Sick / Isolation" value={sickCount} unit="Cows" trend="down" isGoodWhenUp={false} changeText="Isolated in Bay C" />
        <MetricCard label="Avg Milk / Cow" value={avgYield} unit="L/day" trend="up" changeText="Peak: 23.8 L" />
        <MetricCard label="Avg Feed Cost" value={`₹${avgFeedCost}`} unit="/day" trend="neutral" changeText="Per animal" />
      </div>

      {/* View Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f5f2eb] border border-[#ede8df] rounded-xl max-w-fit shadow-2xs">
        <button
          onClick={() => setActiveView('Herd')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer ${
            activeView === 'Herd' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Herd Overview & Pedigree</span>
        </button>
        <button
          onClick={() => setActiveView('Breeding')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer ${
            activeView === 'Breeding' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Breeding & Gestation Calendar</span>
        </button>
        <button
          onClick={() => setActiveView('Vaccination')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer ${
            activeView === 'Vaccination' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Syringe className="w-3.5 h-3.5" />
          <span>Vaccination & Disease Surveillance</span>
        </button>
      </div>

      {/* VIEW 1: HERD OVERVIEW */}
      {activeView === 'Herd' && (
        <div className="space-y-4">
          <FilterBar onReset={() => { setSearch(''); setStatusFilter('All'); setBreedFilter('All'); }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search Cattle ID, Tag or Breed..."
            />

            <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  statusFilter === 'All' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({totalCattle})
              </button>
              <button
                onClick={() => setStatusFilter('Milking')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  statusFilter === 'Milking' ? 'bg-white text-forest-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Milking ({milkingCount})
              </button>
              <button
                onClick={() => setStatusFilter('Dry')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  statusFilter === 'Dry' ? 'bg-white text-amber-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Dry ({dryCount})
              </button>
              <button
                onClick={() => setStatusFilter('Pregnant')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  statusFilter === 'Pregnant' ? 'bg-white text-forest-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pregnant ({pregnantCount})
              </button>
              <button
                onClick={() => setStatusFilter('Sick')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  statusFilter === 'Sick' ? 'bg-white text-rose-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sick ({sickCount})
              </button>
            </div>

            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className="bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-800 outline-none shadow-2xs cursor-pointer focus:border-forest-600"
            >
              <option value="All">All Breeds</option>
              <option value="Gir">Gir</option>
              <option value="Sahiwal">Sahiwal</option>
              <option value="Murrah Buffalo">Murrah Buffalo</option>
              <option value="Red Sindhi">Red Sindhi</option>
              <option value="HF Cross">HF Cross</option>
              <option value="Jersey">Jersey</option>
            </select>

            <span className="text-xs text-stone-500 font-mono">
              Showing <strong className="text-forest-900 font-bold">{filteredCattle.length}</strong> of {totalCattle}
            </span>
          </FilterBar>

          <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8f5] border-b border-[#ede8df] text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
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
                <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                  {filteredCattle.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-xs text-stone-400 font-sans">
                        No cattle found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredCattle.map((cow) => (
                      <tr
                        key={cow.id}
                        onClick={() => setActiveProfile(cow)}
                        className="hover:bg-cream-50/70 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-forest-900">{cow.id}</td>
                        <td className="px-4 py-3 font-semibold text-stone-900">{cow.tagNumber}</td>
                        <td className="px-4 py-3 font-sans text-stone-700">{cow.breed}</td>
                        <td className="px-4 py-3">{cow.ageYears} yrs</td>
                        <td className="px-4 py-3">{cow.lactation} ({cow.lactationStage})</td>
                        <td className="px-4 py-3 text-stone-500 font-sans">{cow.lastCalvingDate}</td>
                        <td className="px-4 py-3 font-bold text-forest-900">{cow.milkYieldLPerDay} L/d</td>
                        <td className="px-4 py-3">
                          <MiniSparkline points={cow.historicalYields} color="#1b4332" width={60} height={18} />
                        </td>
                        <td className="px-4 py-3 font-sans">₹{cow.feedCostPerDay}/d</td>
                        <td className="px-4 py-3 font-sans">
                          <StatusBadge status={cow.health} size="sm" />
                        </td>
                        <td className="px-4 py-3 font-sans">
                          <StatusBadge status={cow.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMilkingCattleId(cow.id);
                                setMilkingYield(cow.milkYieldLPerDay.toString());
                                setIsMilkingModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-sage-50 hover:bg-sage-100 text-forest-900 border border-sage-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                              title="Log daily milking for this cow"
                            >
                              <Milk className="w-3 h-3 text-forest-700" />
                              <span>Log Milk</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveProfile(cow);
                              }}
                              className="px-2.5 py-1 bg-[#fdfcfb] hover:bg-cream-100 text-forest-900 border border-[#ede8df] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                              Card
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BREEDING & GESTATION CALENDAR */}
      {activeView === 'Breeding' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-forest-900 font-bold text-xs uppercase tracking-wide">
                <span className="p-1 rounded-md bg-sage-50 text-forest-700">
                  <Clock className="w-4 h-4" />
                </span>
                <span>Heat / Estrus Surveillance</span>
              </div>
              <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-normal">
                <strong className="text-forest-950">COW-004 (Sahiwal)</strong>: Cycle Day 19. Standing heat predicted in 48 hours. Prepared Pedigree Straw #SAHI-PED-402.
              </p>
            </div>

            <div className="p-4 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-forest-900 font-bold text-xs uppercase tracking-wide">
                <span className="p-1 rounded-md bg-sage-50 text-forest-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span>Pregnancy Diagnosis (PD) Due</span>
              </div>
              <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-normal">
                <strong className="text-forest-950">COW-015 (Gir)</strong>: 44 days post-AI. Ultrasonography check scheduled for 31 Oct 2026 by Dr. Anita Rao.
              </p>
            </div>

            <div className="p-4 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-forest-900 font-bold text-xs uppercase tracking-wide">
                <span className="p-1 rounded-md bg-gold-50 text-gold-700">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <span>Dry-Off & Calving Watch</span>
              </div>
              <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-normal">
                <strong className="text-forest-950">COW-008 (Murrah)</strong>: Gestation Day 247/280. Transition to dry cow mineral ration active. Calving due 17 Nov 2026.
              </p>
            </div>
          </div>

          <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-cream-50/50 border-b border-[#ede8df] flex items-center justify-between">
              <span className="font-bold text-xs text-forest-950">
                Active Bovine Gestation & Artificial Insemination Ledger
              </span>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs shadow-forest-950/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Insemination</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#faf8f5] border-b border-[#ede8df] text-stone-600 font-semibold uppercase tracking-wider text-[11px] font-sans">
                  <tr>
                    <th className="px-4 py-3">Record ID</th>
                    <th className="px-4 py-3">Cattle & Breed</th>
                    <th className="px-4 py-3">Insemination Date</th>
                    <th className="px-4 py-3">Bull Semen Straw</th>
                    <th className="px-4 py-3">PD Status</th>
                    <th className="px-4 py-3">Gestation Progress (280d)</th>
                    <th className="px-4 py-3">Dry-Off Date</th>
                    <th className="px-4 py-3">Expected Calving</th>
                    <th className="px-4 py-3 font-sans">Inseminator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede8df] text-stone-700">
                  {breedingRecords.map((r) => {
                    const progressPct = Math.min(100, Math.round((r.daysInGestation / 280) * 100));
                    return (
                      <tr key={r.id} className="hover:bg-cream-50/60 transition-colors">
                        <td className="px-4 py-3 font-bold text-forest-900">{r.id}</td>
                        <td className="px-4 py-3 font-sans">
                          <div className="font-bold text-forest-950">{r.cattleTag}</div>
                          <div className="text-[10px] text-stone-500">{r.breed}</div>
                        </td>
                        <td className="px-4 py-3">{r.eventDate}</td>
                        <td className="px-4 py-3 font-bold text-stone-800">{r.strawCode}</td>
                        <td className="px-4 py-3 font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.pdStatus.includes('Positive') || r.pdStatus.includes('Confirmed')
                              ? 'bg-sage-50 text-forest-900 border-sage-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}>
                            {r.pdStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32 bg-[#ede8df] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-forest-700 h-2 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-500 font-sans mt-0.5 block">
                            Day {r.daysInGestation}/280 ({progressPct}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{r.dryOffDate}</td>
                        <td className="px-4 py-3 font-bold text-forest-900">{r.expectedCalvingDate}</td>
                        <td className="px-4 py-3 font-sans text-stone-600">{r.inseminator}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: VACCINATION PROTOCOLS */}
      {activeView === 'Vaccination' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vaccinationProtocols.map((vac) => (
              <div key={vac.disease} className="p-5 bg-[#fdfcfb] border border-[#ede8df] rounded-2xl shadow-xs space-y-3.5 transition-shadow duration-150 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sage-50 border border-sage-200 text-forest-800 flex items-center justify-center">
                    <Syringe className="w-4 h-4 text-forest-700" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    vac.status === 'Protected' ? 'bg-sage-50 text-forest-900 border-sage-200' : 'bg-rose-50 text-rose-900 border-rose-200 animate-pulse'
                  }`}>
                    {vac.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-forest-950 leading-tight">{vac.disease}</h4>
                  <p className="text-[11px] text-stone-500 mt-1 font-medium">{vac.schedule}</p>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] text-stone-600 border-t border-[#ede8df]/70 pt-2.5">
                  <div className="flex justify-between">
                    <span>Coverage:</span>
                    <span className="font-bold text-forest-900">{vac.coveragePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Admin:</span>
                    <span>{vac.lastAdministered}</span>
                  </div>
                  <div className="flex justify-between font-bold text-forest-950">
                    <span>Next Due:</span>
                    <span>{vac.nextDue}</span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 font-mono">
                  Batch: {vac.vaccineBatch}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CATTLE PROFILE MODAL */}
      {activeProfile && (
        <Modal
          isOpen={!!activeProfile}
          onClose={() => setActiveProfile(null)}
          title={`Animal Profile: ${activeProfile.id} (${activeProfile.tagNumber})`}
          subtitle={`${activeProfile.breed} · ${activeProfile.ageYears} yrs · ${activeProfile.shedLocation}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Daily Milk Yield</div>
                <div className="text-xl font-bold text-forest-900 mt-1">{activeProfile.milkYieldLPerDay} L</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">₹{(activeProfile.milkYieldLPerDay * 38).toFixed(0)} daily realization</div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Daily Feed Cost</div>
                <div className="text-xl font-bold text-amber-900 mt-1">₹{activeProfile.feedCostPerDay}</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">{activeProfile.dailyFeedKg} kg dry matter</div>
              </div>
              <div className="p-3.5 bg-sage-50/80 rounded-xl border border-sage-200">
                <div className="text-forest-950 text-[11px] font-sans font-bold">Net Daily Margin</div>
                <div className="text-xl font-bold text-forest-900 mt-1">₹{Math.max(0, Math.round(activeProfile.milkYieldLPerDay * 38 - activeProfile.feedCostPerDay))}</div>
                <div className="text-[10px] text-forest-800 font-sans mt-0.5 font-semibold">Contribution to dairy</div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 text-[11px] font-sans font-medium">Lactation Stage</div>
                <div className="text-xl font-bold text-stone-900 mt-1">{activeProfile.lactationStage}</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Calving: {activeProfile.lastCalvingDate}</div>
              </div>
            </div>

            <div className="p-4 bg-[#fdfcfb] rounded-2xl border border-[#ede8df] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-forest-950">7-Day Milk Production History</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-forest-900 font-bold bg-sage-50 px-2.5 py-0.5 rounded-full border border-sage-200">{activeProfile.milkYieldLPerDay} L today</span>
                  <button
                    onClick={() => {
                      setMilkingCattleId(activeProfile.id);
                      setMilkingYield(activeProfile.milkYieldLPerDay.toString());
                      setIsMilkingModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-forest-800 hover:bg-forest-900 text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Milk className="w-3.5 h-3.5" />
                    <span>Log Today's Yield</span>
                  </button>
                </div>
              </div>
              <AreaTrendChart
                data={activeProfile.historicalYields.map((val, idx) => ({ label: `Day -${6 - idx}`, value: val }))}
                primaryColor="#1b4332"
                primaryLabel="Daily Yield (L)"
                unit="L"
                height={130}
              />
            </div>

            {/* Reproduction & Gestation Card */}
            <div className="p-4 bg-cream-50/80 rounded-2xl border border-[#ede8df]">
              <div className="flex items-center gap-2 font-bold text-forest-950 mb-2.5">
                <Calendar className="w-4 h-4 text-forest-700" />
                <span>Bovine Gestation & Calving Milestones</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-stone-700">
                <div className="p-2.5 bg-white rounded-xl border border-[#ede8df]">
                  <span className="text-[10px] text-stone-500 block mb-0.5">AI Insemination:</span>
                  <span className="font-bold text-stone-900">{activeProfile.lastCalvingDate}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#ede8df]">
                  <span className="text-[10px] text-stone-500 block mb-0.5">Dry-Off Due (+220d):</span>
                  <span className="font-bold text-amber-800">20 Dec 2026</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#ede8df]">
                  <span className="text-[10px] text-stone-500 block mb-0.5">Expected Calving (+280d):</span>
                  <span className="font-bold text-forest-900">18 Feb 2027</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#fdfcfb] rounded-2xl border border-[#ede8df]">
                <div className="flex items-center gap-2 font-bold text-forest-950 mb-2">
                  <Syringe className="w-4 h-4 text-forest-700" />
                  <span>Vaccination Protocol</span>
                </div>
                <div className="space-y-2">
                  {activeProfile.vaccinations.map((vac, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-stone-700 border-b border-[#ede8df]/70 pb-1.5">
                      <span>{vac.name}</span>
                      <span className="font-mono text-stone-500">{vac.date} ({vac.status})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#fdfcfb] rounded-2xl border border-[#ede8df]">
                <div className="flex items-center gap-2 font-bold text-forest-950 mb-2">
                  <HeartPulse className="w-4 h-4 text-rose-700" />
                  <span>Veterinary & Clinical Notes</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{activeProfile.veterinaryNotes}</p>
                <div className="mt-2.5 text-[10px] font-mono text-forest-900 font-bold bg-sage-50 px-2.5 py-1 rounded-lg border border-sage-200 inline-block">
                  Next scheduled checkup: 18 Oct 2026 (Dr. Anita Rao)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede8df]">
              <button
                onClick={() => setActiveProfile(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Animal Card
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. RECORD ARTIFICIAL INSEMINATION MODAL */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Record Artificial Insemination (AI)"
        subtitle="Log semen straw, insemination date, and calculate 280-day gestation schedule"
        maxWidth="md"
      >
        <form onSubmit={handleRecordInsemination} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Target Cattle</label>
            <select
              value={aiCattleTag}
              onChange={(e) => setAiCattleTag(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
            >
              {cattleList.map((c) => (
                <option key={c.id} value={`${c.id} (${c.tagNumber})`}>
                  {c.id} - {c.tagNumber} ({c.breed})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Bull Semen Straw Code</label>
              <input
                type="text"
                value={aiStrawCode}
                onChange={(e) => setAiStrawCode(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Inseminator Veterinarian</label>
              <input
                type="text"
                value={aiInseminator}
                onChange={(e) => setAiInseminator(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
                required
              />
            </div>
          </div>

          <div className="p-3.5 bg-sage-50/80 rounded-xl border border-sage-200 text-xs text-forest-950 space-y-1.5 font-medium">
            <div className="font-bold text-forest-900">Automated Gestation Milestones:</div>
            <div className="text-[11px] text-forest-800 leading-relaxed">
              • Pregnancy Diagnosis (PD) Due: <strong>+60 Days</strong><br />
              • Dry-Off Reminder: <strong>+220 Days</strong><br />
              • Expected Calving Date: <strong>+280 Days</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsAiModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              Commit AI Insemination Record
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. ADD CATTLE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enrol New Cattle to Herd"
        subtitle="Individual RFID tag registration, pedigree assignment, and initial lactation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCattle} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Breed</label>
              <select
                value={newBreed}
                onChange={(e) =>
                  setNewBreed(e.target.value as 'Gir' | 'Sahiwal' | 'Murrah Buffalo' | 'Red Sindhi')
                }
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Gir">Gir (Indigenous Cow)</option>
                <option value="Sahiwal">Sahiwal</option>
                <option value="Murrah Buffalo">Murrah Buffalo</option>
                <option value="Red Sindhi">Red Sindhi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Ear Tag Number</label>
              <input
                type="text"
                placeholder="TAG-IN-88053"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Age (Years)</label>
              <input
                type="number"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Lactation</label>
              <input
                type="number"
                value={newLactation}
                onChange={(e) => setNewLactation(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as 'Milking' | 'Dry' | 'Pregnant' | 'Sick')
                }
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
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
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Initial Yield (L/day)</label>
              <input
                type="number"
                step="0.1"
                value={newYield}
                onChange={(e) => setNewYield(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Feed Cost (₹/day)</label>
              <input
                type="number"
                value={newFeedCost}
                onChange={(e) => setNewFeedCost(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Shed Location</label>
              <input
                type="text"
                value={newShed}
                onChange={(e) => setNewShed(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
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
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              Save Cattle Record
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. RECORD DAILY MILKING MODAL */}
      <Modal
        isOpen={isMilkingModalOpen}
        onClose={() => setIsMilkingModalOpen(false)}
        title="Record Daily Cow Milking Yield"
        subtitle="Log parlour extraction for individual cattle to update live mass balance and 7-day lactation curves"
        maxWidth="md"
      >
        <form onSubmit={handleRecordMilking} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Select Milking Cattle</label>
            <select
              value={milkingCattleId}
              onChange={(e) => {
                setMilkingCattleId(e.target.value);
                const found = cattleList.find((c) => c.id === e.target.value);
                if (found) {
                  setMilkingYield(found.milkYieldLPerDay.toString());
                }
              }}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
            >
              {cattleList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.tagNumber} ({c.breed}, {c.status}) — Current: {c.milkYieldLPerDay} L/d
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Milking Shift</label>
              <select
                value={milkingShift}
                onChange={(e) => setMilkingShift(e.target.value as 'Morning' | 'Evening')}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Morning">Morning Shift (05:00 - 08:30)</option>
                <option value="Evening">Evening Shift (16:00 - 19:30)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Parlour / Shed</label>
              <select
                value={milkingShed}
                onChange={(e) => setMilkingShed(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Milking Parlour A">Milking Parlour A (Shed A)</option>
                <option value="Milking Parlour B">Milking Parlour B (Shed B)</option>
                <option value="Hospital Isolation Bay">Hospital Isolation Bay</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Today's Milk Yield (L)</label>
              <input
                type="number"
                step="0.1"
                required
                value={milkingYield}
                onChange={(e) => setMilkingYield(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-forest-950 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={milkingFat}
                onChange={(e) => setMilkingFat(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={milkingSnf}
                onChange={(e) => setMilkingSnf(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-stone-500 font-medium">Quick Presets:</span>
            {[12.0, 14.5, 18.0, 22.5].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setMilkingYield(preset.toString())}
                className="px-2 py-0.5 rounded-lg bg-cream-50 hover:bg-cream-100 border border-[#ede8df] text-[11px] font-mono text-forest-900 cursor-pointer"
              >
                {preset} L
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsMilkingModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              Save Milking Record
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
