import React, { useState } from 'react';
import { Farmer, MilkCollectionRecord } from '../../types/dairy';
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Plus, Check } from 'lucide-react';
import { assessMilkCollection } from '../../services/dairyEngine';

interface MobileFieldViewProps {
  farmers: Farmer[];
  onSaveCollection: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => string | undefined;
  onClose?: () => void;
}

export const MobileFieldView: React.FC<MobileFieldViewProps> = ({
  farmers,
  onSaveCollection,
  onClose,
}) => {
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [litres, setLitres] = useState<string>('45.0');
  const [fat, setFat] = useState<string>('4.5');
  const [snf, setSnf] = useState<string>('8.6');
  const [temperature, setTemperature] = useState<string>('18.2');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];

  const numLitres = parseFloat(litres) || 0;
  const numFat = parseFloat(fat) || 0;
  const numSnf = parseFloat(snf) || 0;
  const numTemp = parseFloat(temperature) || 0;

  const assessment = assessMilkCollection(numLitres, numFat, numSnf, numTemp);
  const qualityStatus = assessment.valid ? assessment.quality : 'FAIL';
  const calculatedRate = assessment.valid ? assessment.ratePerLitre : 0;
  const calculatedPayable = assessment.valid ? assessment.payableAmount : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) {
      setSubmitError('Select a registered farmer before recording milk.');
      return;
    }
    if (!assessment.valid) {
      setSubmitError(assessment.error);
      return;
    }

    const error = onSaveCollection({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      shift,
      farmerId: selectedFarmer.id,
      farmerName: selectedFarmer.name,
      centre: 'Anand Collection Centre (Field Van)',
      quantityLitres: numLitres,
      fat: numFat,
      snf: numSnf,
      temperatureC: numTemp,
      quality: assessment.quality,
      ratePerLitre: assessment.ratePerLitre,
      payableAmount: assessment.payableAmount,
      testedBy: 'Field Agent Mobile Device',
    });
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitError('');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setLitres('');
    }, 1800);
  };

  return (
    <div className="bg-white min-h-[580px] max-w-md mx-auto p-5 rounded-2xl border border-slate-200 shadow-2xl text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900">Field Milk Collection</h2>
            <p className="text-[11px] text-slate-500">Touch Entry · Shift {shift}</p>
          </div>
        </div>
        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setShift('Morning')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              shift === 'Morning'
                ? 'bg-emerald-700 text-white font-medium shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Morning
          </button>
          <button
            type="button"
            onClick={() => setShift('Evening')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              shift === 'Evening'
                ? 'bg-emerald-700 text-white font-medium shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evening
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Collection Saved! Receipt TXN generated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {submitError && <p role="alert" className="text-sm text-rose-700">{submitError}</p>}
        {/* Step 1: Select Farmer */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            1. Farmer Supplier
          </label>
          <select
            value={selectedFarmerId}
            onChange={(e) => setSelectedFarmerId(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 outline-none shadow-2xs cursor-pointer"
          >
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.id} — {farmer.name} ({farmer.village})
              </option>
            ))}
          </select>
          {selectedFarmer && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Cattle: {selectedFarmer.cattleCount} animals</span>
              <span>Avg Quality: {selectedFarmer.avgFat}% Fat</span>
            </div>
          )}
        </div>

        {/* Step 2: Litres (Large Touch Input) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
            2. Quantity (Litres)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={litres}
              onChange={(e) => setLitres(e.target.value)}
              placeholder="e.g. 45.0"
              className="w-full bg-white border-2 border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-4 py-3 text-2xl font-bold font-mono text-slate-900 outline-none tabular-nums shadow-2xs"
            />
            <span className="absolute right-4 top-4 text-sm font-semibold text-slate-400">
              LITRES
            </span>
          </div>
        </div>

        {/* Step 3: Fat, SNF, Temperature Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fat %</label>
            <input
              type="number"
              step="0.1"
              min="2"
              max="12"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-lg p-2.5 text-base font-bold font-mono text-center text-slate-900 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">SNF %</label>
            <input
              type="number"
              step="0.1"
              min="6"
              max="12"
              value={snf}
              onChange={(e) => setSnf(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-lg p-2.5 text-base font-bold font-mono text-center text-slate-900 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-lg p-2.5 text-base font-bold font-mono text-center text-slate-900 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Live Status & Economics Calculation Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">QC Decision:</span>
            <div className="flex items-center gap-1 font-bold">
              {qualityStatus === 'PASS' && (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                </span>
              )}
              {qualityStatus === 'WARNING' && (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                </span>
              )}
              {qualityStatus === 'FAIL' && (
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> REJECT
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
            <span className="text-slate-600">Computed Rate:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              ₹{calculatedRate.toFixed(2)} / L
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
            <span className="text-slate-700 font-semibold">Total Payable Amount:</span>
            <span className="text-lg font-mono tabular-nums font-bold text-emerald-800">
              ₹{calculatedPayable.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Big Action Button */}
        <button
          type="submit"
          disabled={numLitres <= 0}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-lg text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Confirm & Record Collection</span>
        </button>
      </form>
    </div>
  );
};
