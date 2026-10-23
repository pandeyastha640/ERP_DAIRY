import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { IS_STATIC_DEMO_MODE } from '../../config/demo';
import {
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Loader2,
  ShieldCheck,
  Download,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Receipt,
  FileText,
} from 'lucide-react';

interface BankPayoutBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAmount: number;
  farmerCount: number;
}

export const BankPayoutBatchModal: React.FC<BankPayoutBatchModalProps> = ({
  isOpen,
  onClose,
  pendingAmount,
  farmerCount,
}) => {
  const [gatewayMode, setGatewayMode] = useState<'instant_imps' | 'bank_upload_file'>('instant_imps');
  const [bankPartner, setBankPartner] = useState<'sbi' | 'bob' | 'hdfc'>('bob');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutResult, setPayoutResult] = useState<any>(null);
  const [liveStreamLogs, setLiveStreamLogs] = useState<string[]>([]);

  // Generate Bank NEFT/RTGS Excel CSV
  const handleDownloadBankFile = () => {
    const headers = ['DEMO_ONLY', 'Beneficiary_Name', 'Masked_Account', 'Amount_INR', 'Status'];
    const sampleRows = [['DEMO ONLY - NOT FOR BANK PROCESSING', 'Synthetic Demo Farmer', 'XXXX-TEST-0001', '0.00', 'NOT A PAYMENT']];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DairyOS_DEMO_ONLY_NOT_FOR_BANK_PROCESSING_${bankPartner.toUpperCase()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Write synthetic preview entries only. No external payment provider is called.
  const handleExecuteDisbursement = async () => {
    setIsProcessing(true);
    if (IS_STATIC_DEMO_MODE) {
      setPayoutResult({ simulatedCount: farmerCount, totalAmountSimulated: pendingAmount, previewOnly: true });
      setLiveStreamLogs([
        '[DEMO PREVIEW] Amount and count calculated in this browser only.',
        '[DEMO PREVIEW] No payment ledger entry was saved.',
        '[DEMO PREVIEW] No bank was contacted; no funds moved and no settlement was confirmed.',
      ]);
      setIsProcessing(false);
      return;
    }
    setLiveStreamLogs([
      '[SIMULATION] No bank connection is configured or contacted.',
      '[SIMULATION] Creating synthetic payout preview records in the ledger.',
    ]);

    try {
      const res = await api.payments.disburseAllPending();
      if (!res.simulationOnly) throw new Error('The server did not confirm simulation-only mode.');
      setPayoutResult(res);
      setLiveStreamLogs((prev) => [
        ...prev,
        `[SIMULATION ONLY] ${res.simulatedCount} preview record(s) saved.`,
        `[LEDGER] ₹${res.totalAmountSimulated.toLocaleString('en-IN')} preview; no funds moved.`,
      ]);
    } catch (err: any) {
      setLiveStreamLogs((prev) => [...prev, `[ERROR] Simulation was not saved: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Farmer Payment Simulation"
      subtitle="Demo ledger preview only. This action sends no money and generates no bank confirmation."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Simulation Banner */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-[#f0f6fc]">
                Demo payment preview
              </div>
              <div className="text-[11px] font-mono text-[#8b949e]">
                Synthetic amounts for demonstration only. Do not submit to a bank.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200 font-mono text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SIMULATION ONLY</span>
            </span>
          </div>
        </div>

        {/* Payout Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[11px] text-[#8b949e]">Eligible Beneficiaries</div>
            <div className="text-xl font-bold font-mono text-[#f0f6fc] mt-1">
              {farmerCount} Pending entries
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">No bank verification is performed</div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[11px] text-[#8b949e]">Pending amount preview</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">Calculated two-axis payable</div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[11px] text-[#8b949e]">Bank transfer status</div>
            <div className="text-xl font-bold font-mono text-[#58a6ff] mt-1">
              Not sent
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5">No payment provider call</div>
          </div>
        </div>

        {/* Simulation Display Options */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-3">
          <div className="text-xs font-semibold text-[#f0f6fc]">Simulation display options</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setGatewayMode('instant_imps')}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                gatewayMode === 'instant_imps'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-[#f0f6fc]'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#f0f6fc]">Simulated payout preview</div>
                <div className="text-[11px] text-[#8b949e] mt-0.5">
                  Synthetic preview entries only; no UTR, bank dispatch, or SMS is generated.
                </div>
              </div>
            </label>

            <label
              onClick={() => setGatewayMode('bank_upload_file')}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                gatewayMode === 'bank_upload_file'
                  ? 'bg-sky-950/30 border-sky-500/50 text-[#f0f6fc]'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#f0f6fc]">Synthetic CSV sample (not bank-ready)</div>
                <div className="text-[11px] text-[#8b949e] mt-0.5">
                  Placeholder data for interface review only.
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#30363d] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#8b949e]">Display label:</span>
              <select
                value={bankPartner}
                onChange={(e) => setBankPartner(e.target.value as any)}
                className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-1 text-xs text-[#f0f6fc] outline-none"
              >
                <option value="bob">Bank of Baroda (Host-to-Host)</option>
                <option value="sbi">State Bank of India (Corporate CMP)</option>
                <option value="hdfc">HDFC Bank SmartHub</option>
              </select>
            </div>

            {gatewayMode === 'bank_upload_file' && (
              <button
                type="button"
                onClick={handleDownloadBankFile}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download demo-only sample CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Simulation Log */}
        {liveStreamLogs.length > 0 && (
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-mono text-[#8b949e] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulation log</span>
              </span>
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>
            <div className="font-mono text-[11px] text-[#58a6ff] space-y-0.5 bg-black/40 p-2 rounded border border-[#21262d] max-h-28 overflow-y-auto">
              {liveStreamLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Simulation Result Banner */}
        {payoutResult && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold">
                  {payoutResult.previewOnly ? 'Local preview calculated' : `Simulation complete: ${payoutResult.simulatedCount} preview record(s) saved.`}
                </div>
                <div className="text-[11px] text-emerald-300/80">
                  Preview total ₹{payoutResult.totalAmountSimulated.toLocaleString('en-IN')}. {payoutResult.previewOnly ? 'Not saved to the ledger. ' : ''}No money moved and no UTR was issued.
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-900 border border-emerald-600 rounded font-mono font-bold text-xs text-emerald-200">
              SIMULATED
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleExecuteDisbursement}
            disabled={isProcessing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving simulation...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run payout simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
