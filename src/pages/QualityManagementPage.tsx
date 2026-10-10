import React, { useState } from 'react';
import { QualityTestRecord } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Thermometer,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface QualityManagementPageProps {
  tests: QualityTestRecord[];
  onAddTest: (record: QualityTestRecord) => void;
}

export const QualityManagementPage: React.FC<QualityManagementPageProps> = ({ tests, onAddTest }) => {
  const [activeRecord, setActiveRecord] = useState<QualityTestRecord | null>(null);
  const [filterResult, setFilterResult] = useState<'All' | 'PASS' | 'WARNING' | 'FAIL'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const filteredTests = tests.filter((t) => filterResult === 'All' || t.result === filterResult);

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
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quality Assurance & Lab Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Adulteration screening, MBRT microbial count, temperature compliance and fat/SNF standardization.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
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

      {/* Table Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">Quality Assessment Filter:</span>
        <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
          {(['All', 'PASS', 'WARNING', 'FAIL'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterResult(r)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterResult === r ? 'bg-emerald-700 text-white font-medium' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => setActiveRecord(test)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-blue-700">{test.batchNumber}</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-slate-900">{test.sourceName}</div>
                    <div className="text-[11px] text-slate-500">{test.sourceType}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{test.quantityLitres.toLocaleString()} L</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{test.fat.toFixed(2)}%</td>
                  <td className="px-4 py-3">{test.snf.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <span className={test.temperatureC > 6.0 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                      {test.temperatureC.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={
                        test.adulterationTest === 'Negative'
                          ? 'text-emerald-700'
                          : test.adulterationTest === 'Trace'
                          ? 'text-amber-700'
                          : 'text-rose-700 font-bold'
                      }
                    >
                      {test.adulterationTest || 'Not recorded'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{test.acidityPct === undefined ? 'Not recorded' : `${test.acidityPct}%`}</td>
                  <td className="px-4 py-3 font-sans">
                    <StatusBadge status={test.result} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500 text-[11px]">{test.tester}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRecord(test);
                      }}
                      className="px-2 py-1 bg-slate-50 hover:bg-[#30363d] text-slate-700 rounded text-[11px] font-sans transition-colors"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED QUALITY RECORD MODAL */}
      {activeRecord && (
        <EntityDetailDrawer
          isOpen={!!activeRecord}
          onClose={() => setActiveRecord(null)}
          title={`Lab Certificate: ${activeRecord.batchNumber}`}
          subtitle={`Source: ${activeRecord.sourceName} · Time: ${activeRecord.testTime}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-sans">QC Laboratory Determination</div>
                <div className="text-lg font-bold mt-1">
                  {activeRecord.result === 'PASS' && <span className="text-emerald-700">CLEARED FOR COLD POOL</span>}
                  {activeRecord.result === 'WARNING' && <span className="text-amber-700">FLASH CHILL & MONITOR</span>}
                  {activeRecord.result === 'FAIL' && <span className="text-rose-700">REJECTED AT WEIGHBRIDGE</span>}
                </div>
              </div>
              <StatusBadge status={activeRecord.result} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 font-sans">Fat Content</div>
                <div className="text-base font-bold text-slate-900 mt-1">{activeRecord.fat}%</div>
                <div className="text-[10px] text-slate-500 font-sans">Standard: 3.5% Min</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 font-sans">SNF Content</div>
                <div className="text-base font-bold text-slate-900 mt-1">{activeRecord.snf}%</div>
                <div className="text-[10px] text-slate-500 font-sans">Standard: 8.5% Min</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 font-sans">Arrival Temperature</div>
                <div className="text-base font-bold text-slate-900 mt-1">{activeRecord.temperatureC}°C</div>
                <div className="text-[10px] text-slate-500 font-sans">Threshold: &le; 4.5°C</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-slate-500 font-sans">MBRT Microbial Reduction</div>
                <div className="text-base font-bold text-emerald-700 mt-1">
                  {activeRecord.mbrtHours === undefined ? 'Not recorded' : `${activeRecord.mbrtHours} Hours`}
                </div>
                <div className="text-[10px] text-slate-500 font-sans">&ge; 4.0 Hours (Grade A)</div>
              </div>
            </div>

            {activeRecord.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 font-sans text-xs">
                <span className="font-bold">Deviation Notice: </span>
                {activeRecord.rejectionReason}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
              <span>Tested by: {activeRecord.tester}</span>
              <button
                onClick={() => setActiveRecord(null)}
                className="px-3 py-1.5 bg-slate-50 text-slate-900 rounded hover:bg-[#30363d]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </EntityDetailDrawer>
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Batch #</label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Own Cattle">Own Cattle Parlour</option>
                <option value="Farmer Procurement">Farmer Procurement</option>
                <option value="Chilling Tank Pool">Bulk Chilling Tank Pool</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Source Name / Location</label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Litres</label>
              <input
                type="number"
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fat %</label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={snf}
                onChange={(e) => setSnf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Adulteration Strip Test</label>
              <select
                value={adulteration}
                onChange={(e) => setAdulteration(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              >
                <option value="Negative">Negative (Pure Milk)</option>
                <option value="Trace">Trace Suspected</option>
                <option value="Positive">Positive (Adulterated)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Analyst</label>
              <input
                type="text"
                value={tester}
                onChange={(e) => setTester(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
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
              Save QC Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
