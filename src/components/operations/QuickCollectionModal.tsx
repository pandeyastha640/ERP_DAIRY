import React, { useState } from 'react';
import { Farmer, MilkCollectionRecord } from '../../types/dairy';
import { Modal } from '../common/Modal';
import { Plus } from 'lucide-react';

interface QuickCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmers: Farmer[];
  onSave: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => void;
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

  const selectedFarmer = farmers.find((f) => f.id === farmerId) || farmers[0];

  const q = parseFloat(quantity) || 0;
  const f = parseFloat(fat) || 0;
  const s = parseFloat(snf) || 0;
  const t = parseFloat(temp) || 0;

  const isFail = f < 3.2 || s < 7.8 || t > 24;
  const isWarn = !isFail && (t > 20 || f < 3.8);
  const quality = isFail ? 'FAIL' : isWarn ? 'WARNING' : 'PASS';

  const rate = isFail ? 0 : Math.max(0, +(34.5 + (f - 4.0) * 4.5 + (s - 8.5) * 2.5).toFixed(2));
  const payable = Math.round(q * rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer || q <= 0) return;

    onSave({
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
      quality,
      ratePerLitre: rate,
      payableAmount: payable,
      testedBy: 'QC Lab Desk',
    });

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
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as 'Morning' | 'Evening')}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none shadow-2xs font-sans"
            >
              <option value="Morning">Morning Shift (05:00 - 08:30)</option>
              <option value="Evening">Evening Shift (16:00 - 19:30)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Collection Centre
            </label>
            <select
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none shadow-2xs font-sans"
            >
              <option value="Anand Collection Centre">Anand Collection Centre</option>
              <option value="Borsad Bulk Chilling Unit">Borsad Bulk Chilling Unit</option>
              <option value="Nadiad Collection Hub">Nadiad Collection Hub</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Select Farmer</label>
          <select
            value={farmerId}
            onChange={(e) => setFarmerId(e.target.value)}
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none shadow-2xs font-sans"
          >
            {farmers.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.id} - {farm.name} ({farm.village})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Litres</label>
            <input
              type="number"
              step="0.5"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-sm font-mono font-bold text-forest-950 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Fat %</label>
            <input
              type="number"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-sm font-mono font-bold text-forest-950 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">SNF %</label>
            <input
              type="number"
              step="0.1"
              value={snf}
              onChange={(e) => setSnf(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-sm font-mono font-bold text-forest-950 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-sm font-mono font-bold text-forest-950 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Calculated rate & status card */}
        <div className="bg-cream-50/70 border border-[#ede8df] rounded-2xl p-4 grid grid-cols-3 gap-2 text-center text-xs shadow-2xs">
          <div>
            <div className="text-[11px] text-stone-500 font-medium">Quality Assessment</div>
            <div className="font-bold mt-1 font-mono">
              {quality === 'PASS' && (
                <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  PASS
                </span>
              )}
              {quality === 'WARNING' && (
                <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  WARNING
                </span>
              )}
              {quality === 'FAIL' && (
                <span className="text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  REJECTED
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-medium">Computed Rate</div>
            <div className="font-mono font-bold text-forest-950 mt-1">₹{rate.toFixed(2)} / L</div>
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-medium">Total Payable</div>
            <div className="font-mono font-extrabold text-forest-950 text-sm mt-1">
              ₹{payable.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-cream-100 hover:bg-cream-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Save Collection</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickCollectionModal;
