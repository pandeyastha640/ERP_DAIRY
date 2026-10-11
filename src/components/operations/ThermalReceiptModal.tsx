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
      const colId = collection?.collectionCode || collection?.id || 'sample';
      const res = await api.notifications.getThermalSlip(colId);
      if (res.data) {
        setSlipData(res.data);
      }
    } catch {
      // Offline fallback
      setSlipData({
        slipNumber: `SLIP-${collection?.collectionCode || 'COL-001'}`,
        society: {
          name: 'ANAND DISTRICT MILK COOPERATIVE UNION',
          unitName: collection?.centre || 'Anand Village Collection Centre #04',
          fssaiRegNo: '10018021003456',
          posTerminalId: 'POS-MCC-01',
        },
        intake: {
          collectionCode: collection?.collectionCode || 'COL-001',
          date: collection?.date || new Date().toISOString().split('T')[0],
          time: collection?.time || '07:15 AM',
          shift: collection?.shift || 'Morning',
          farmerCode: collection?.farmerId || 'FARM-001',
          farmerName: collection?.farmerName || 'Rameshwar Patel',
          milkType: Number(collection?.fat || 4.4) >= 5.5 ? 'Buffalo Milk' : 'Cow Milk (Grade A)',
          volumeLitres: collection?.quantityLitres || 45.0,
          fatPct: collection?.fat || 4.4,
          snfPct: collection?.snf || 8.6,
          clrReading: 28.5,
          tempCelsius: collection?.temperatureC || 6.5,
          qualityGrade: collection?.quality || 'PASS',
        },
        pricing: {
          baseRatePerL: 34.50,
          effectiveRatePerL: collection?.ratePerLitre || 39.10,
          netPayableINR: collection?.payableAmount || 1759.50,
        },
        footer: {
          testedBy: collection?.testedBy || 'Milkotronic Lactoscan MCC Station',
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
      const payload = {
        farmerCode: slipData?.intake?.farmerCode || collection?.farmerId || 'FARM-001',
        farmerName: slipData?.intake?.farmerName || collection?.farmerName || 'Rameshwar Patel',
        volumeLitres: slipData?.intake?.volumeLitres || collection?.quantityLitres || 45.0,
        fat: slipData?.intake?.fatPct || collection?.fat || 4.4,
        snf: slipData?.intake?.snfPct || collection?.snf || 8.6,
        ratePerLitre: slipData?.pricing?.effectiveRatePerL || collection?.ratePerLitre || 39.10,
        payableAmount: slipData?.pricing?.netPayableINR || collection?.payableAmount || 1759.50,
        shift: slipData?.intake?.shift || collection?.shift || 'Morning',
        centre: slipData?.society?.unitName || collection?.centre || 'Anand Collection Centre',
        channel,
      };

      const res = await api.notifications.sendReceiptSms(payload);
      if (res.success) {
        setSmsStatus(`Receipt dispatched via ${res.channels.join(' & ')}! (Ref: ${res.messageId})`);
      }
    } catch (err: any) {
      setSmsStatus(`Notice: ${err.message || 'SMS service queued locally'}`);
    } finally {
      setSendingSms(false);
    }
  };

  const handleCopySms = () => {
    const text = `[DairyOS] Namaste ${slipData?.intake?.farmerName}, received ${slipData?.intake?.volumeLitres}L at ${slipData?.society?.unitName}. Fat: ${slipData?.intake?.fatPct}%, SNF: ${slipData?.intake?.snfPct}%, Rate: Rs ${slipData?.pricing?.effectiveRatePerL}/L. Amount: Rs ${slipData?.pricing?.netPayableINR}. Direct Bank IMPS queued.`;
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
      subtitle="Milkotronic / Mettler Toledo 58mm & 80mm Field Slip Printer"
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
              <span>Send SMS / WhatsApp</span>
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
              <div className="font-bold text-xs uppercase tracking-tight">{society.name || 'ANAND MILK COOPERATIVE UNION'}</div>
              <div className="text-[10px] text-slate-600">{society.unitName || 'Anand Center #04'}</div>
              <div className="text-[9px] text-slate-500">FSSAI: {society.fssaiRegNo || '10018021003456'} · POS-01</div>
              <div className="text-[10px] font-bold text-emerald-800 mt-1">★ MILK INWARD RECEIPT ★</div>
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
                <span>{intake.milkType || 'Cow Milk'}</span>
              </div>
            </div>

            {/* Measurements & Two-Axis Solids */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2 bg-slate-50/50 p-1 rounded">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>NET VOLUME:</span>
                <span>{intake.volumeLitres} LITRES</span>
              </div>
              <div className="flex justify-between">
                <span>NET WEIGHT:</span>
                <span>{intake.netWeightKg || (intake.volumeLitres * 1.030).toFixed(1)} KG</span>
              </div>
              <div className="flex justify-between">
                <span>FAT %:</span>
                <span className="font-bold">{intake.fatPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>SNF %:</span>
                <span className="font-bold">{intake.snfPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>CLR / TEMP:</span>
                <span>{intake.clrReading || 28.5} / {intake.tempCelsius || 6.5}°C</span>
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
                <span className="font-bold">₹{Number(pricing.effectiveRatePerL || 39.10).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-dotted border-slate-400 text-emerald-900">
                <span>NET PAYABLE:</span>
                <span>₹{Number(pricing.netPayableINR || 1759.50).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right">Direct IMPS settlement queued</div>
            </div>

            {/* Footer QR & Verification */}
            <div className="text-center pt-1 space-y-1">
              <div className="inline-block p-1 bg-white border border-slate-300 rounded">
                <QrCode className="w-10 h-10 mx-auto text-slate-800" />
              </div>
              <div className="text-[9px] text-slate-600 font-bold tracking-widest">{intake.collectionCode}</div>
              <div className="text-[8px] text-slate-500 leading-none">
                Tested by: {slipData?.footer?.testedBy || 'Lactoscan IoT (COM3)'}
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
