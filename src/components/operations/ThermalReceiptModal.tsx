import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import {
  Printer,
  Smartphone,
  CheckCircle2,
  Share2,
  QrCode,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: any;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  collection,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [slipData, setSlipData] = useState<any>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [sendingSms, setSendingSms] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && collection) {
      loadSlipData();
    }
  }, [isOpen, collection]);

  const loadSlipData = async () => {
    setLoadingSlip(true);
    try {
      const colId = collection?.collectionCode || collection?.id;
      if (!colId) throw new Error('Saved collection reference is missing.');
      const res = await api.notifications.getThermalSlip(colId);
      if (res.success && res.data) {
        setSlipData(res.data);
        return;
      }
      throw new Error('Saved receipt details could not be loaded.');
    } catch {
      // This fallback uses only values from the saved collection row. It does
      // not invent weights, analyzer readings, compliance IDs, or settlement.
      setSlipData({
        slipNumber: `SLIP-${collection?.collectionCode || 'Not recorded'}`,
        society: {
          name: 'DairyOS Cooperative Demo',
          unitName: collection?.centre || 'Collection centre not recorded',
        },
        intake: {
          collectionCode: collection?.collectionCode || 'Not recorded',
          date: collection?.date || 'Not recorded',
          time: collection?.time || 'Not recorded',
          shift: collection?.shift || 'Not recorded',
          farmerCode: collection?.farmerId || 'Not recorded',
          farmerName: collection?.farmerName || 'Not recorded',
          volumeLitres: collection?.quantityLitres,
          fatPct: collection?.fat,
          snfPct: collection?.snf,
          tempCelsius: collection?.temperatureC,
          qualityGrade: collection?.quality,
        },
        pricing: {
          effectiveRatePerL: collection?.ratePerLitre,
          netPayableINR: collection?.payableAmount,
        },
        footer: {
          testedBy: collection?.testedBy || 'Not recorded',
          qrData: `DAIRYOS:${collection?.collectionCode}:${collection?.farmerId}:${collection?.quantityLitres}`,
          printedAt: new Date().toISOString(),
        },
      });
    } finally {
      setLoadingSlip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendNotification = async (channel: 'SMS' | 'WHATSAPP' | 'ALL') => {
    setSendingSms(true);
    setSmsStatus(null);
    try {
      if (!collection?.collectionCode) throw new Error('A saved collection is required to preview its receipt.');
      const payload = {
        collectionCode: collection.collectionCode,
        channel,
      };

      const res = await api.notifications.sendReceiptSms(payload);
      if (res.success) {
        setSmsStatus(res.simulationOnly
          ? `Simulation only: no SMS/WhatsApp was sent. Preview ref ${res.messageId}.`
          : `Provider accepted the request; delivery is not verified. Ref: ${res.messageId}`);
      }
    } catch (err: any) {
      setSmsStatus(`Notice: ${err.message || 'SMS service queued locally'}`);
    } finally {
      setSendingSms(false);
    }
  };

  const handleCopySms = () => {
    const text = `[DairyOS] Namaste ${slipData?.intake?.farmerName}, received ${slipData?.intake?.volumeLitres}L at ${slipData?.society?.unitName}. Fat: ${slipData?.intake?.fatPct}%, SNF: ${slipData?.intake?.snfPct}%, Rate: Rs ${slipData?.pricing?.effectiveRatePerL}/L. Payable: Rs ${slipData?.pricing?.netPayableINR}. No bank transfer is confirmed.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!collection && !slipData) return null;

  const intake = slipData?.intake || {};
  const society = slipData?.society || {};
  const pricing = slipData?.pricing || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Thermal Receipt & Farmer Mobile Dispatch"
      subtitle="Receipt from the saved collection record. No printer or messaging provider is connected in demo mode."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">Paper Format:</span>
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-2 py-1 rounded cursor-pointer ${
                paperWidth === '58mm' ? 'bg-emerald-700 text-white font-bold' : 'bg-white border text-slate-700'
              }`}
            >
              58mm Compact
            </button>
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-2 py-1 rounded cursor-pointer ${
                paperWidth === '80mm' ? 'bg-emerald-700 text-white font-bold' : 'bg-white border text-slate-700'
              }`}
            >
              80mm Standard
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSendNotification('ALL')}
              disabled={sendingSms}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              {sendingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>Preview SMS / WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* SMS Feedback Alert */}
        {smsStatus && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{smsStatus}</span>
            </div>
            <button
              onClick={handleCopySms}
              className="text-blue-700 hover:text-blue-900 text-[11px] underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        )}

        {/* Realistic Thermal Receipt Paper Container */}
        <div className="bg-slate-200 p-4 rounded-xl flex justify-center">
          <div
            className={`bg-[#fffef8] text-slate-900 p-4 border border-dashed border-slate-400 font-mono text-[11px] leading-tight shadow-md transition-all ${
              paperWidth === '58mm' ? 'w-[260px]' : 'w-[340px]'
            }`}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="font-bold text-xs uppercase tracking-tight">{society.name || 'DairyOS Cooperative Demo'}</div>
              <div className="text-[10px] text-slate-600">{society.unitName || 'Collection centre not recorded'}</div>
              <div className="text-[9px] text-slate-500">DEMO RECEIPT · NO PROVIDER SETTLEMENT</div>
              <div className="text-[10px] font-bold text-emerald-800 mt-1">MILK INWARD RECEIPT</div>
            </div>

            {/* Inward Details */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between">
                <span>SLIP NO:</span>
                <span className="font-bold">{slipData?.slipNumber || `SLIP-${intake.collectionCode}`}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{intake.date} {intake.time}</span>
              </div>
              <div className="flex justify-between">
                <span>SHIFT:</span>
                <span className="font-bold uppercase">{intake.shift}</span>
              </div>
              <div className="flex justify-between">
                <span>FARMER ID:</span>
                <span className="font-bold">{intake.farmerCode}</span>
              </div>
              <div className="flex justify-between">
                <span>PRODUCER:</span>
                <span className="font-bold truncate max-w-[180px]">{intake.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span>CATEGORY:</span>
                <span>{intake.milkType || 'Not classified'}</span>
              </div>
            </div>

            {/* Measurements & Two-Axis Solids */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2 bg-slate-50/50 p-1 rounded">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>NET VOLUME:</span>
                <span>{intake.volumeLitres} LITRES</span>
              </div>
              {intake.netWeightKg !== undefined && <div className="flex justify-between">
                <span>NET WEIGHT:</span>
                <span>{intake.netWeightKg} KG</span>
              </div>}
              <div className="flex justify-between">
                <span>FAT %:</span>
                <span className="font-bold">{intake.fatPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>SNF %:</span>
                <span className="font-bold">{intake.snfPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>TEMPERATURE:</span>
                <span>{intake.tempCelsius ?? 'Not recorded'}{intake.tempCelsius !== undefined ? '°C' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>QC GRADE:</span>
                <span className="font-bold text-emerald-700">{intake.qualityGrade || 'PASS'}</span>
              </div>
            </div>

            {/* Financial Ledger & Payable */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between">
                <span>RATE / LITRE:</span>
                <span className="font-bold">₹{Number(pricing.effectiveRatePerL ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-dotted border-slate-400 text-emerald-900">
                <span>NET PAYABLE:</span>
                <span>₹{Number(pricing.netPayableINR ?? 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right">{Number(pricing.netPayableINR ?? 0) > 0 ? 'Pending payable; no bank transfer confirmed' : 'No payable amount recorded'}</div>
            </div>

            {/* Footer QR & Verification */}
            <div className="text-center pt-1 space-y-1">
              <div className="inline-block p-1 bg-white border border-slate-300 rounded">
                <QrCode className="w-10 h-10 mx-auto text-slate-800" />
              </div>
              <div className="text-[9px] text-slate-600 font-bold tracking-widest">{intake.collectionCode}</div>
              <div className="text-[8px] text-slate-500 leading-none">
                Tested by: {slipData?.footer?.testedBy || 'Not recorded'}
              </div>
              <div className="text-[8px] text-slate-400 pt-1">
                Thank you for cooperative dairy excellence!
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
