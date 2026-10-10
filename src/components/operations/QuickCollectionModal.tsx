import React, { useState } from 'react';
import { Farmer, MilkCollectionRecord } from '../../types/dairy';
import { Modal } from '../common/Modal';
import { Plus } from 'lucide-react';
import { assessMilkCollection } from '../../services/dairyEngine';

interface QuickCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmers: Farmer[];
  onSave: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => string | undefined;
}

export const QuickCollectionModal: React.FC<QuickCollectionModalProps> = ({
  isOpen,
  onClose,
  farmers,
  onSave,
}) => {
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [centre, setCentre] = useState('Anand Collection Centre');
  const [quantity, setQuantity] = useState('50.0');
  const [fat, setFat] = useState('4.4');
  const [snf, setSnf] = useState('8.6');
  const [temp, setTemp] = useState('18.0');
  const [submitError, setSubmitError] = useState('');

  const selectedFarmer = farmers.find((f) => f.id === farmerId) || farmers[0];

  const q = parseFloat(quantity) || 0;
  const f = parseFloat(fat) || 0;
  const s = parseFloat(snf) || 0;
  const t = parseFloat(temp) || 0;

  const assessment = assessMilkCollection(q, f, s, t);
  const quality = assessment.valid ? assessment.quality : 'FAIL';
  const rate = assessment.valid ? assessment.ratePerLitre : 0;
  const payable = assessment.valid ? assessment.payableAmount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) {
      setSubmitError('Select a registered farmer before recording milk.');
      return;
    }
    if (!assessment.valid) {
      setSubmitError(assessment.error);
      return;
    }

    const error = onSave({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      shift,
      farmerId: selectedFarmer.id,
      farmerName: selectedFarmer.name,
      centre,
      quantityLitres: q,
      fat: f,
      snf: s,
      temperatureC: t,
      quality: assessment.quality,
      ratePerLitre: assessment.ratePerLitre,
      payableAmount: assessment.payableAmount,
      testedBy: 'QC Lab Desk',
    });
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Milk Collection"
      subtitle="Instantly register farmer inward milk with real-time quality & pricing calculation"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && <p role="alert" className="text-xs text-rose-700">{submitError}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as 'Morning' | 'Evening')}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            >
              <option value="Morning">Morning Shift (05:00 - 08:30)</option>
              <option value="Evening">Evening Shift (16:00 - 19:30)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Collection Centre
            </label>
            <select
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            >
              <option value="Anand Collection Centre">Anand Collection Centre</option>
              <option value="Borsad Bulk Chilling Unit">Borsad Bulk Chilling Unit</option>
              <option value="Nadiad Collection Hub">Nadiad Collection Hub</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Select Farmer</label>
          <select
            value={farmerId}
            onChange={(e) => setFarmerId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          >
            {farmers.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.id} - {farm.name} ({farm.village})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Litres</label>
            <input
              type="number"
              step="0.5"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Fat %</label>
            <input
              type="number"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">SNF %</label>
            <input
              type="number"
              step="0.1"
              value={snf}
              onChange={(e) => setSnf(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Calculated rate & status card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[11px] text-slate-500">Quality Assessment</div>
            <div className="font-bold mt-1">
              {quality === 'PASS' && (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  PASS
                </span>
              )}
              {quality === 'WARNING' && (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  WARNING
                </span>
              )}
              {quality === 'FAIL' && (
                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  REJECTED
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Computed Rate</div>
            <div className="font-mono font-bold text-slate-900 mt-1">₹{rate.toFixed(2)} / L</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Total Payable</div>
            <div className="font-mono font-bold text-emerald-800 mt-1">
              ₹{payable.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Collection</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
