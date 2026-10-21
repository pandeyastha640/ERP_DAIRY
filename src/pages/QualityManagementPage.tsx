import React, { useState } from 'react';
import { QualityTestRecord } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { TankerClearanceModal } from '../components/quality/TankerClearanceModal';
import { useDairyERP } from '../context/DairyERPContext';
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Thermometer,
  ShieldCheck,
  Search,
  FileCheck2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface QualityManagementPageProps {
  tests: QualityTestRecord[];
  onAddTest: (record: QualityTestRecord) => void;
}

export const QualityManagementPage: React.FC<QualityManagementPageProps> = ({ tests, onAddTest }) => {
  const { setCurrentModule, setSelectedItemId } = useDairyERP();
  const [activeRecord, setActiveRecord] = useState<QualityTestRecord | null>(null);
  const [filterResult, setFilterResult] = useState<'All' | 'PASS' | 'WARNING' | 'FAIL'>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertRecord, setSelectedCertRecord] = useState<any>(null);

  // New Quality Record Form
  const [batchNo, setBatchNo] = useState('QC-MANUAL-01');
  const [sourceType, setSourceType] = useState<'Own Cattle' | 'Farmer Procurement' | 'Chilling Tank Pool'>('Farmer Procurement');
  const [sourceName, setSourceName] = useState('Anand CC Inward Tanker');
  const [litres, setLitres] = useState('800');
  const [fat, setFat] = useState('4.5');
  const [snf, setSnf] = useState('8.7');
  const [temp, setTemp] = useState('4.5');
  const [adulteration, setAdulteration] = useState<'Negative' | 'Trace' | 'Positive'>('Negative');
  const [acidity, setAcidity] = useState('0.14');
  const [mbrt, setMbrt] = useState('5.0');
  const [tester, setTester] = useState('Sanjay Solanki (QC Chemist)');

  const totalTests = tests.length;
  const accepted = tests.filter((t) => t.result === 'PASS').length;
  const warning = tests.filter((t) => t.result === 'WARNING').length;
  const rejected = tests.filter((t) => t.result === 'FAIL').length;
  const tempExceptions = tests.filter((t) => t.temperatureC > 6.0).length;

  const avgFat = (tests.reduce((acc, t) => acc + t.fat, 0) / totalTests).toFixed(2);
  const avgSNF = (tests.reduce((acc, t) => acc + t.snf, 0) / totalTests).toFixed(2);

  const filteredTests = tests.filter((t) => {
    const matchesResult = filterResult === 'All' || t.result === filterResult;
    const matchesSource = sourceFilter === 'All' || t.sourceType === sourceFilter;
    const matchesSearch =
      t.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.sourceName.toLowerCase().includes(search.toLowerCase()) ||
      t.tester.toLowerCase().includes(search.toLowerCase());
    return matchesResult && matchesSource && matchesSearch;
  });

  const handleSaveQuality = (e: React.FormEvent) => {
    e.preventDefault();
    const result: 'PASS' | 'WARNING' | 'FAIL' =
      adulteration === 'Positive' || parseFloat(temp) > 10.0 || parseFloat(fat) < 3.2
        ? 'FAIL'
        : parseFloat(temp) > 6.0 || adulteration === 'Trace'
        ? 'WARNING'
        : 'PASS';

    const newRecord: QualityTestRecord = {
      id: `QC-${Date.now()}`,
      batchNumber: batchNo,
      sourceType,
      sourceName,
      quantityLitres: parseFloat(litres) || 0,
      fat: parseFloat(fat) || 0,
      snf: parseFloat(snf) || 0,
      clr: 29.0,
      temperatureC: parseFloat(temp) || 0,
      adulterationTest: adulteration,
      acidityPct: parseFloat(acidity) || 0.14,
      mbrtHours: parseFloat(mbrt) || 5.0,
      result,
      tester,
      testTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddTest(newRecord);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#ede8df] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-forest-950 font-sans">
            Quality Assurance & Lab Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Adulteration screening, MBRT microbial count, temperature compliance and fat/SNF standardization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentModule('milk-ops')}
            className="px-3 py-2 bg-cream-50 hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-98 hidden sm:flex items-center gap-1.5"
            title="Jump to Central Mass Balance Reconciliation (Tab 02)"
          >
            <span>&larr; Tab 02 Milk Ops</span>
          </button>
          <button
            onClick={() => setCurrentModule('chilling')}
            className="px-3 py-2 bg-[#faf8f5] hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-98 hidden md:flex items-center gap-1.5"
            title="Jump to Cold Silos & Milk Pool (Tab 05)"
          >
            <span>Tab 05 Silos &rarr;</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-forest-950/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Quality Test</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon (Interactive Cross-Links) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard
          label="Tests Today"
          value={totalTests}
          unit="Batches"
          trend="up"
          changeText="Show All Tests"
          onClick={() => setFilterResult('All')}
        />
        <MetricCard
          label="Accepted"
          value={accepted}
          unit="Batches"
          trend="up"
          changeText="Filter PASS"
          onClick={() => setFilterResult('PASS')}
        />
        <MetricCard
          label="Warnings"
          value={warning}
          unit="Batch"
          trend="neutral"
          changeText="Filter WARNING"
          onClick={() => setFilterResult('WARNING')}
        />
        <MetricCard
          label="Rejected Milk"
          value={rejected}
          unit="Batch"
          trend="down"
          isGoodWhenUp={false}
          changeText="Filter FAIL"
          onClick={() => setFilterResult('FAIL')}
        />
        <MetricCard
          label="Avg Fat %"
          value={avgFat}
          unit="%"
          trend="neutral"
          changeText="View Tab 02 Mass Balance"
          onClick={() => setCurrentModule('milk-ops')}
        />
        <MetricCard
          label="Temp Exceptions"
          value={tempExceptions}
          unit="Vat"
          trend="down"
          isGoodWhenUp={false}
          changeText="View Tab 05 Cold Tanks"
          onClick={() => setCurrentModule('chilling')}
        />
      </div>

      {/* Comprehensive Quality Filter and Search Bar */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Batch#, Source, or Analyst..."
              className="w-full bg-[#faf8f5] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-500">QC Decision:</span>
            <div className="flex bg-[#f5f2eb] border border-[#ede8df] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setFilterResult('All')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  filterResult === 'All' ? 'bg-white text-forest-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({totalTests})
              </button>
              <button
                onClick={() => setFilterResult('PASS')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  filterResult === 'PASS' ? 'bg-white text-forest-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                PASS ({accepted})
              </button>
              <button
                onClick={() => setFilterResult('WARNING')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  filterResult === 'WARNING' ? 'bg-white text-amber-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                WARNING ({warning})
              </button>
              <button
                onClick={() => setFilterResult('FAIL')}
                className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                  filterResult === 'FAIL' ? 'bg-white text-rose-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                FAIL ({rejected})
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#ede8df]/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Sample Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-800 outline-none cursor-pointer focus:border-forest-600"
            >
              <option value="All">All Sample Sources</option>
              <option value="Own Cattle">Own Herd Parlour</option>
              <option value="Farmer Procurement">Farmer Procurement</option>
              <option value="Chilling Tank Pool">Chilling Tank Pool</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-stone-500 font-mono text-xs">
              Showing <strong className="text-forest-900 font-bold">{filteredTests.length}</strong> of {totalTests}
            </span>

            {(search !== '' || filterResult !== 'All' || sourceFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterResult('All');
                  setSourceFilter('All');
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quality Records Table */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] text-stone-600 font-mono border-b border-[#ede8df] uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Batch / Ref</th>
                <th className="px-4 py-3 font-sans">Source</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Fat %</th>
                <th className="px-4 py-3">SNF %</th>
                <th className="px-4 py-3">Temp (°C)</th>
                <th className="px-4 py-3 font-sans">Adulteration</th>
                <th className="px-4 py-3">Acidity</th>
                <th className="px-4 py-3 font-sans">Decision</th>
                <th className="px-4 py-3 font-sans">Analyst</th>
                <th className="px-4 py-3 text-right font-sans">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => setActiveRecord(test)}
                  className="hover:bg-cream-50/70 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-forest-900">{test.batchNumber}</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-bold text-forest-950">{test.sourceName}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (test.sourceType === 'Own Cattle') {
                          setCurrentModule('cattle');
                        } else if (test.sourceType === 'Farmer Procurement') {
                          setCurrentModule('milk-collection');
                        } else {
                          setCurrentModule('chilling');
                        }
                      }}
                      className="text-[11px] text-forest-800 hover:text-forest-950 hover:underline flex items-center gap-1 cursor-pointer font-medium mt-0.5"
                      title="Jump to Source Management Module"
                    >
                      <span>{test.sourceType}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-bold text-stone-900">{test.quantityLitres.toLocaleString()} L</td>
                  <td className="px-4 py-3 text-forest-800 font-semibold">{test.fat.toFixed(2)}%</td>
                  <td className="px-4 py-3">{test.snf.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={test.temperatureC > 6.0 ? 'text-amber-800 font-bold' : 'text-stone-700'}>
                      {test.temperatureC.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans font-medium">
                    <span
                      className={
                        test.adulterationTest === 'Negative'
                          ? 'text-forest-700'
                          : test.adulterationTest === 'Trace'
                          ? 'text-amber-700 font-bold'
                          : 'text-rose-700 font-bold'
                      }
                    >
                      {test.adulterationTest}
                    </span>
                  </td>
                  <td className="px-4 py-3">{test.acidityPct}%</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={test.result} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-stone-600 text-[11px]">{test.tester}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertRecord(test);
                          setIsCertModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-forest-900 rounded-lg text-[11px] font-mono inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs font-semibold"
                        title="View Official FSSAI Tanker Lab Clearance Certificate"
                      >
                        <FileCheck2 className="w-3 h-3 text-forest-700" />
                        <span>FSSAI Cert</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRecord(test);
                        }}
                        className="px-2.5 py-1 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] text-stone-700 rounded-lg text-[11px] font-sans transition-colors cursor-pointer shadow-2xs font-medium"
                      >
                        View Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED QUALITY RECORD MODAL */}
      {activeRecord && (
        <Modal
          isOpen={!!activeRecord}
          onClose={() => setActiveRecord(null)}
          title={`Lab Certificate: ${activeRecord.batchNumber}`}
          subtitle={`Source: ${activeRecord.sourceName} · Time: ${activeRecord.testTime}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-cream-50/70 rounded-2xl border border-[#ede8df] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-stone-500 font-sans font-medium">QC Laboratory Determination</div>
                <div className="text-lg font-bold mt-1">
                  {activeRecord.result === 'PASS' && <span className="text-forest-800">CLEARED FOR COLD POOL</span>}
                  {activeRecord.result === 'WARNING' && <span className="text-amber-800">FLASH CHILL & MONITOR</span>}
                  {activeRecord.result === 'FAIL' && <span className="text-rose-800">REJECTED AT WEIGHBRIDGE</span>}
                </div>
              </div>
              <StatusBadge status={activeRecord.result} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 font-sans font-medium">Fat Content</div>
                <div className="text-base font-bold text-forest-950 mt-1">{activeRecord.fat}%</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Standard: 3.5% Min</div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 font-sans font-medium">SNF Content</div>
                <div className="text-base font-bold text-forest-950 mt-1">{activeRecord.snf}%</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Standard: 8.5% Min</div>
              </div>
              <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                <div className="text-stone-500 font-sans font-medium">Arrival Temperature</div>
                <div className="text-base font-bold text-stone-900 mt-1">{activeRecord.temperatureC}°C</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Threshold: &le; 4.5°C</div>
              </div>
              <div className="p-3.5 bg-sage-50/80 rounded-xl border border-sage-200">
                <div className="text-forest-900 font-sans font-bold">MBRT Microbial Reduction</div>
                <div className="text-base font-bold text-forest-900 mt-1">{activeRecord.mbrtHours} Hours</div>
                <div className="text-[10px] text-forest-700 font-sans mt-0.5 font-medium">&ge; 4.0 Hours (Grade A)</div>
              </div>
            </div>

            {activeRecord.rejectionReason && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-sans text-xs">
                <span className="font-bold">Deviation Notice: </span>
                {activeRecord.rejectionReason}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#ede8df] text-[11px] text-stone-500 font-sans">
              <span>Tested by: {activeRecord.tester}</span>
              <button
                onClick={() => setActiveRecord(null)}
                className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD QUALITY TEST MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Laboratory Milk Quality Test"
        subtitle="Log analytical chemistry and microbiological test parameters"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveQuality} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Batch #</label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Own Cattle">Own Cattle Parlour</option>
                <option value="Farmer Procurement">Farmer Procurement</option>
                <option value="Chilling Tank Pool">Bulk Chilling Tank Pool</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Source Name / Location</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Litres</label>
              <input
                type="number"
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={snf}
                onChange={(e) => setSnf(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Adulteration Strip Test</label>
              <select
                value={adulteration}
                onChange={(e) => setAdulteration(e.target.value as any)}
                className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-900 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
              >
                <option value="Negative">Negative (Pure Milk)</option>
                <option value="Trace">Trace Suspected</option>
                <option value="Positive">Positive (Adulterated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Analyst</label>
              <input
                type="text"
                value={tester}
                onChange={(e) => setTester(e.target.value)}
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
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs shadow-forest-950/20 cursor-pointer active:scale-98"
            >
              Save QC Record
            </button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL FSSAI BULK TANKER CLEARANCE CERTIFICATE MODAL */}
      <TankerClearanceModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        testRecord={selectedCertRecord}
      />
    </div>
  );
};
