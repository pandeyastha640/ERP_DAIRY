import React, { useState } from 'react';
import { QualityTestRecord } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { TankerClearanceModal } from '../components/quality/TankerClearanceModal';
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
} from 'lucide-react';

interface QualityManagementPageProps {
  tests: QualityTestRecord[];
  onAddTest: (record: QualityTestRecord) => void;
}

export const QualityManagementPage: React.FC<QualityManagementPageProps> = ({ tests, onAddTest }) => {
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
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Quality Assurance & Lab Analytics
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Adulteration screening, MBRT microbial count, temperature compliance and fat/SNF standardization.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quality Test</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard label="Tests Today" value={totalTests} unit="Batches" trend="up" changeText="Conducted" />
        <MetricCard label="Accepted" value={accepted} unit="Batches" trend="up" changeText="Cleared for pool" />
        <MetricCard label="Warnings" value={warning} unit="Batch" trend="neutral" changeText="Flash chilled" />
        <MetricCard label="Rejected Milk" value={rejected} unit="Batch" trend="down" isGoodWhenUp={false} changeText="42.5 L blocked" />
        <MetricCard label="Avg Fat %" value={avgFat} unit="%" trend="neutral" changeText="Standards Met" />
        <MetricCard
          label="Temp Exceptions"
          value={tempExceptions}
          unit="Vat"
          trend="down"
          isGoodWhenUp={false}
          changeText="> 6.0°C Arrival"
        />
      </div>

      {/* Comprehensive Quality Filter and Search Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Batch#, Source, or Analyst..."
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#8b949e]">QC Decision:</span>
            <div className="flex bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFilterResult('All')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterResult === 'All' ? 'bg-[#388bfd] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                All ({totalTests})
              </button>
              <button
                onClick={() => setFilterResult('PASS')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterResult === 'PASS' ? 'bg-[#3fb950] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                PASS ({accepted})
              </button>
              <button
                onClick={() => setFilterResult('WARNING')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterResult === 'WARNING' ? 'bg-[#f0883e] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                WARNING ({warning})
              </button>
              <button
                onClick={() => setFilterResult('FAIL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterResult === 'FAIL' ? 'bg-[#f85149] text-white font-medium' : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                FAIL ({rejected})
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#21262d] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8b949e]">Sample Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#c9d1d9] outline-none"
            >
              <option value="All">All Sample Sources</option>
              <option value="Own Cattle">Own Herd Parlour</option>
              <option value="Farmer Procurement">Farmer Procurement</option>
              <option value="Chilling Tank Pool">Chilling Tank Pool</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8b949e] font-mono">
              Showing <strong className="text-[#58a6ff]">{filteredTests.length}</strong> of {totalTests}
            </span>

            {(search !== '' || filterResult !== 'All' || sourceFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterResult('All');
                  setSourceFilter('All');
                }}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#f85149] rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quality Records Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Batch / Ref</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Volume</th>
                <th className="px-4 py-2.5 font-medium">Fat %</th>
                <th className="px-4 py-2.5 font-medium">SNF %</th>
                <th className="px-4 py-2.5 font-medium">Temp (°C)</th>
                <th className="px-4 py-2.5 font-medium">Adulteration</th>
                <th className="px-4 py-2.5 font-medium">Acidity</th>
                <th className="px-4 py-2.5 font-medium">Decision</th>
                <th className="px-4 py-2.5 font-medium">Analyst</th>
                <th className="px-4 py-2.5 font-medium text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => setActiveRecord(test)}
                  className="hover:bg-[#1f2937]/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-[#58a6ff]">{test.batchNumber}</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-[#f0f6fc]">{test.sourceName}</div>
                    <div className="text-[11px] text-[#8b949e]">{test.sourceType}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#f0f6fc]">{test.quantityLitres.toLocaleString()} L</td>
                  <td className="px-4 py-3 text-[#3fb950] font-semibold">{test.fat.toFixed(2)}%</td>
                  <td className="px-4 py-3">{test.snf.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={test.temperatureC > 6.0 ? 'text-[#f0883e] font-bold' : 'text-[#c9d1d9]'}>
                      {test.temperatureC.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={
                        test.adulterationTest === 'Negative'
                          ? 'text-[#3fb950]'
                          : test.adulterationTest === 'Trace'
                          ? 'text-[#d29922]'
                          : 'text-[#f85149] font-bold'
                      }
                    >
                      {test.adulterationTest}
                    </span>
                  </td>
                  <td className="px-4 py-3">{test.acidityPct}%</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={test.result} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-[#8b949e] text-[11px]">{test.tester}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertRecord(test);
                          setIsCertModalOpen(true);
                        }}
                        className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded text-[11px] font-mono inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="View Official FSSAI Tanker Lab Clearance Certificate"
                      >
                        <FileCheck2 className="w-3 h-3 text-emerald-400" />
                        <span>FSSAI Cert</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRecord(test);
                        }}
                        className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded text-[11px] font-sans transition-colors cursor-pointer"
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
            <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#8b949e] font-sans">QC Laboratory Determination</div>
                <div className="text-lg font-bold mt-1">
                  {activeRecord.result === 'PASS' && <span className="text-[#3fb950]">CLEARED FOR COLD POOL</span>}
                  {activeRecord.result === 'WARNING' && <span className="text-[#d29922]">FLASH CHILL & MONITOR</span>}
                  {activeRecord.result === 'FAIL' && <span className="text-[#f85149]">REJECTED AT WEIGHBRIDGE</span>}
                </div>
              </div>
              <StatusBadge status={activeRecord.result} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[#8b949e] font-sans">Fat Content</div>
                <div className="text-base font-bold text-[#f0f6fc] mt-1">{activeRecord.fat}%</div>
                <div className="text-[10px] text-[#8b949e] font-sans">Standard: 3.5% Min</div>
              </div>
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[#8b949e] font-sans">SNF Content</div>
                <div className="text-base font-bold text-[#f0f6fc] mt-1">{activeRecord.snf}%</div>
                <div className="text-[10px] text-[#8b949e] font-sans">Standard: 8.5% Min</div>
              </div>
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[#8b949e] font-sans">Arrival Temperature</div>
                <div className="text-base font-bold text-[#f0f6fc] mt-1">{activeRecord.temperatureC}°C</div>
                <div className="text-[10px] text-[#8b949e] font-sans">Threshold: &le; 4.5°C</div>
              </div>
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
                <div className="text-[#8b949e] font-sans">MBRT Microbial Reduction</div>
                <div className="text-base font-bold text-[#3fb950] mt-1">{activeRecord.mbrtHours} Hours</div>
                <div className="text-[10px] text-[#8b949e] font-sans">&ge; 4.0 Hours (Grade A)</div>
              </div>
            </div>

            {activeRecord.rejectionReason && (
              <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded text-[#f85149] font-sans text-xs">
                <span className="font-bold">Deviation Notice: </span>
                {activeRecord.rejectionReason}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-[11px] text-[#8b949e] font-sans">
              <span>Tested by: {activeRecord.tester}</span>
              <button
                onClick={() => setActiveRecord(null)}
                className="px-3 py-1.5 bg-[#21262d] text-[#f0f6fc] rounded hover:bg-[#30363d]"
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
        <form onSubmit={handleSaveQuality} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Batch #</label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Own Cattle">Own Cattle Parlour</option>
                <option value="Farmer Procurement">Farmer Procurement</option>
                <option value="Chilling Tank Pool">Bulk Chilling Tank Pool</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Source Name / Location</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Litres</label>
              <input
                type="number"
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={snf}
                onChange={(e) => setSnf(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Adulteration Strip Test</label>
              <select
                value={adulteration}
                onChange={(e) => setAdulteration(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              >
                <option value="Negative">Negative (Pure Milk)</option>
                <option value="Trace">Trace Suspected</option>
                <option value="Positive">Positive (Adulterated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Analyst</label>
              <input
                type="text"
                value={tester}
                onChange={(e) => setTester(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
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
