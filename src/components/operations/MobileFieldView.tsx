import React, { useState, useEffect } from 'react';
import { Farmer, MilkCollectionRecord } from '../../types/dairy';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Plus,
  Check,
  Wifi,
  WifiOff,
  CloudOff,
  UploadCloud,
  RotateCw,
} from 'lucide-react';

interface MobileFieldViewProps {
  farmers: Farmer[];
  onSaveCollection: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => void;
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
  const [toastMessage, setToastMessage] = useState('Collection Saved! Receipt TXN generated.');

  // Offline / Connectivity State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('dairy_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dairy_offline_queue', JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Could not persist offline queue:', e);
    }
  }, [offlineQueue]);

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];

  const numLitres = parseFloat(litres) || 0;
  const numFat = parseFloat(fat) || 0;
  const numSnf = parseFloat(snf) || 0;
  const numTemp = parseFloat(temperature) || 0;

  // Real-time quality verification
  const isFail = numFat < 3.2 || numSnf < 7.8 || numTemp > 24;
  const isWarning = !isFail && (numTemp > 20 || numFat < 3.8);
  const qualityStatus: 'PASS' | 'WARNING' | 'FAIL' = isFail
    ? 'FAIL'
    : isWarning
    ? 'WARNING'
    : 'PASS';

  // Standard dairy pricing formula: Base 34.5 + (fat - 4.0)*4.5 + (snf - 8.5)*2.5
  const calculatedRate = isFail
    ? 0
    : Math.max(0, +(34.5 + (numFat - 4.0) * 4.5 + (numSnf - 8.5) * 2.5).toFixed(2));
  const calculatedPayable = Math.round(numLitres * calculatedRate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer || numLitres <= 0) return;

    const recordPayload = {
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
      quality: qualityStatus,
      ratePerLitre: calculatedRate,
      payableAmount: calculatedPayable,
      testedBy: 'Field Agent Mobile Device',
    };

    if (isSimulatedOffline) {
      const queuedItem = { ...recordPayload, queuedAt: new Date().toISOString() };
      setOfflineQueue((prev) => [...prev, queuedItem]);
      setToastMessage(`Stored in Offline Cache! (${offlineQueue.length + 1} pending sync)`);
      setShowSuccessToast(true);
    } else {
      onSaveCollection(recordPayload);
      setToastMessage('Collection Synced Online! Receipt TXN generated.');
      setShowSuccessToast(true);
    }

    setTimeout(() => {
      setShowSuccessToast(false);
      setLitres('');
    }, 2000);
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);

    setTimeout(() => {
      offlineQueue.forEach((rec) => {
        onSaveCollection(rec);
      });
      const count = offlineQueue.length;
      setOfflineQueue([]);
      setIsSyncing(false);
      setToastMessage(`Synced ${count} offline records to central database!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    }, 800);
  };

  return (
    <div className="bg-white min-h-[580px] max-w-md mx-auto p-6 rounded-3xl border border-[#ede8df] shadow-lg text-stone-900 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#ede8df]">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close Field View"
              title="Close Field View"
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-cream-100 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold">Exit</span>
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-forest-950">Field Milk Collection</h2>
            <p className="text-[11px] text-stone-500 font-mono">Touch Entry &bull; Shift {shift}</p>
          </div>
        </div>
        <div className="flex bg-cream-50 border border-[#ede8df] rounded-xl p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setShift('Morning')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              shift === 'Morning'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900'
            }`}
          >
            Morning
          </button>
          <button
            type="button"
            onClick={() => setShift('Evening')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              shift === 'Evening'
                ? 'bg-forest-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900'
            }`}
          >
            Evening
          </button>
        </div>
      </div>

      {/* Connectivity & Offline Queue Bar */}
      <div className="mb-4 p-2.5 bg-cream-50/70 border border-[#ede8df] rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {isSimulatedOffline ? (
            <span className="flex items-center gap-1.5 text-amber-800 font-bold font-mono">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline Mode ({offlineQueue.length} queued)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online Direct Sync</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {offlineQueue.length > 0 && !isSimulatedOffline && (
            <button
              type="button"
              onClick={handleSyncOfflineQueue}
              disabled={isSyncing}
              className="px-2.5 py-1 bg-forest-900 hover:bg-forest-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <UploadCloud className="w-3 h-3" />
              <span>{isSyncing ? 'Syncing...' : `Sync (${offlineQueue.length})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              isSimulatedOffline
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-cream-100 text-stone-700 hover:bg-cream-200 border border-[#ede8df]'
            }`}
            title="Toggle offline mode to test IndexedDB / LocalStorage queueing"
          >
            {isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Step 1: Select Farmer */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-mono">
            1. Farmer Supplier
          </label>
          <select
            value={selectedFarmerId}
            onChange={(e) => setSelectedFarmerId(e.target.value)}
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-forest-950 outline-none shadow-2xs cursor-pointer font-sans"
          >
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.id} — {farmer.name} ({farmer.village})
              </option>
            ))}
          </select>
          {selectedFarmer && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500 px-1 font-mono">
              <span>Cattle: {selectedFarmer.cattleCount} animals</span>
              <span>Avg Quality: {selectedFarmer.avgFat}% Fat</span>
            </div>
          )}
        </div>

        {/* Step 2: Litres (Large Touch Input) */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider font-mono">
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
              className="w-full bg-[#fdfcfb] border-2 border-[#ede8df] focus:border-forest-600 rounded-2xl px-4 py-3 text-2xl font-bold font-mono text-forest-950 outline-none tabular-nums shadow-xs transition-all"
            />
            <span className="absolute right-4 top-4 text-xs font-bold font-mono text-stone-400">
              LITRES
            </span>
          </div>
        </div>

        {/* Step 3: Fat, SNF, Temperature Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1 font-mono">Fat %</label>
            <input
              type="number"
              step="0.1"
              min="2"
              max="12"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl p-2.5 text-base font-bold font-mono text-center text-forest-950 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1 font-mono">SNF %</label>
            <input
              type="number"
              step="0.1"
              min="6"
              max="12"
              value={snf}
              onChange={(e) => setSnf(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl p-2.5 text-base font-bold font-mono text-center text-forest-950 outline-none shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1 font-mono">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl p-2.5 text-base font-bold font-mono text-center text-forest-950 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Live Status & Economics Calculation Card */}
        <div className="bg-cream-50/70 border border-[#ede8df] rounded-2xl p-4 space-y-2.5 shadow-2xs font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-semibold">QC Decision:</span>
            <div className="flex items-center gap-1 font-bold">
              {qualityStatus === 'PASS' && (
                <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                </span>
              )}
              {qualityStatus === 'WARNING' && (
                <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 font-mono text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                </span>
              )}
              {qualityStatus === 'FAIL' && (
                <span className="text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 font-mono text-[11px]">
                  <XCircle className="w-3.5 h-3.5" /> REJECT
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-[#ede8df] pt-2">
            <span className="text-stone-600">Computed Rate:</span>
            <span className="font-mono tabular-nums font-bold text-forest-950">
              ₹{calculatedRate.toFixed(2)} / L
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-[#ede8df] pt-2">
            <span className="text-stone-800 font-bold">Total Payable Amount:</span>
            <span className="text-xl font-mono tabular-nums font-extrabold text-forest-950">
              ₹{calculatedPayable.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Big Action Button */}
        <button
          type="submit"
          disabled={numLitres <= 0}
          className="w-full py-3.5 bg-forest-900 hover:bg-forest-800 disabled:opacity-40 text-white font-bold rounded-xl text-sm shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Confirm & Record Collection</span>
        </button>
      </form>
    </div>
  );
};

export default MobileFieldView;
