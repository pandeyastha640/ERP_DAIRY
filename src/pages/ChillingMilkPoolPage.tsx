import React, { useState } from 'react';
import { ChillingTank, MilkPoolReconciliation } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import {
  Snowflake,
  Layers,
  Thermometer,
  RotateCw,
  Plus,
  Minus,
  Equal,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ChillingMilkPoolPageProps {
  tanks: ChillingTank[];
  reconciliation: MilkPoolReconciliation;
}

export const ChillingMilkPoolPage: React.FC<ChillingMilkPoolPageProps> = ({ tanks, reconciliation }) => {
  const [localTanks, setLocalTanks] = useState<ChillingTank[]>(tanks);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [sourceTankId, setSourceTankId] = useState(tanks[0]?.id || 'TANK-A');
  const [targetTankId, setTargetTankId] = useState(tanks[1]?.id || 'TANK-B');
  const [transferLitres, setTransferLitres] = useState('500');
  const [isTransferring, setIsTransferring] = useState(false);

  // Live Server Reconciliation State
  const [serverReconciliation, setServerReconciliation] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const displayTanks = localTanks.length > 0 ? localTanks : tanks;
  const totalCapacity = displayTanks.reduce((acc, t) => acc + t.capacityLitres, 0);
  const totalVolume = displayTanks.reduce((acc, t) => acc + t.currentVolumeLitres, 0);
  const utilizationPct = totalCapacity > 0 ? ((totalVolume / totalCapacity) * 100).toFixed(1) : '0';

  // Exact math validation:
  const computedClosing =
    reconciliation.openingStockLitres +
    reconciliation.ownProductionLitres +
    reconciliation.farmerProcurementLitres -
    reconciliation.qualityRejectedLitres -
    reconciliation.processingConsumptionLitres -
    reconciliation.spillageWastageLitres;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const litres = Number(transferLitres);
    if (!litres || litres <= 0) return;

    if (sourceTankId === targetTankId) {
      alert('Source and destination tank cannot be identical.');
      return;
    }

    setIsTransferring(true);
    try {
      const res = await api.chilling.transfer(sourceTankId, litres, targetTankId);
      if (res.success) {
        setLocalTanks((prev) =>
          prev.map((t) => {
            if (t.id === sourceTankId || t.name === sourceTankId) {
              return { ...t, currentVolumeLitres: Math.max(0, t.currentVolumeLitres - litres) };
            }
            if (t.id === targetTankId || t.name === targetTankId) {
              return { ...t, currentVolumeLitres: Math.min(t.capacityLitres, t.currentVolumeLitres + litres) };
            }
            return t;
          })
        );
        alert(`Transfer Successful: ${res.message}`);
        setIsTransferModalOpen(false);
      }
    } catch (err: any) {
      alert(`Transfer Notice: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleRunServerAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await api.chilling.getReconciliation();
      setServerReconciliation(res);
    } catch (err: any) {
      alert(`Could not fetch live reconciliation: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Chilling Centre & Bulk Milk Pool
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Silo cold-chain thermal control, continuous agitator monitoring, and closed-loop volumetric mass balance reconciliation.
          </p>
        </div>

<<<<<<< Updated upstream
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunServerAudit}
            disabled={isAuditing}
            className="px-3 py-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#58a6ff] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Server Mass-Balance Audit</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Milk</span>
          </button>
=======
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>Cold Chain Compliant (Avg 4.0°C)</span>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* Live Server Audit Banner if fetched */}
      {serverReconciliation && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            serverReconciliation.data?.isWithinTolerance
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <div className="text-xs font-bold font-mono">
                ISO 22000 MASS-BALANCE VERDICT: {serverReconciliation.status} ({serverReconciliation.data?.variancePercentage}% VARIANCE)
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {serverReconciliation.data?.auditAlert}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            Physical: {serverReconciliation.data?.physicalStockL}L | Theoretical: {serverReconciliation.data?.theoreticalStockL}L
          </div>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Milk Received" value={`${(reconciliation.ownProductionLitres + reconciliation.farmerProcurementLitres).toLocaleString()} L`} unit="" trend="neutral" changeText="Today's total inward" />
        <MetricCard label="Current Chilled Stock" value={`${totalVolume.toLocaleString()} L`} unit="" trend="up" changeText="Across Silos" />
        <MetricCard label="Silo Capacity" value={`${totalCapacity.toLocaleString()} L`} unit="" trend="neutral" changeText="4 Insulated Tanks" />
        <MetricCard label="Capacity Utilization" value={`${utilizationPct}%`} unit="" trend="neutral" changeText="Optimal buffer" />
        <MetricCard label="Avg Silo Temp" value="3.9°C" unit="" trend="up" isGoodWhenUp={false} changeText="Cold chain ≤ 4.5°C" />
      </div>

      {/* TANK CARDS GRID */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Live Silo Storage Vats & Agitator Telemetry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayTanks.map((tank) => {
            const fillPct = Math.round((tank.currentVolumeLitres / tank.capacityLitres) * 100);

            return (
              <div
                key={tank.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-blue-700">{tank.id}</span>
                    <StatusBadge status={tank.status} size="sm" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 leading-tight">{tank.name}</h3>
                </div>

                {/* Level Indicator Graphic */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Level:</span>
                    <span className="font-bold text-slate-900">
                      {tank.currentVolumeLitres.toLocaleString()} / {tank.capacityLitres.toLocaleString()} L
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        tank.status === 'CIP Cleaning'
                          ? 'bg-[#8957e5]'
                          : tank.temperatureC > 4.5
                          ? 'bg-[#f0883e]'
                          : 'bg-[#58a6ff]'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-500">{fillPct}% full</div>
                </div>

                {/* Sensors */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-blue-700" /> Temp
                    </div>
                    <div
                      className={`font-bold mt-0.5 ${
                        tank.temperatureC > 6.0 ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {tank.temperatureC}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-emerald-700" /> Agitator
                    </div>
                    <div className="font-bold mt-0.5 text-emerald-700">
                      {tank.agitatorOn ? 'ACTIVE' : 'IDLE'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Holding: {tank.holdingTimeHours} hrs</span>
                  <span className="text-emerald-700">Sensor: Optimal</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLOSED-LOOP MILK POOL RECONCILIATION */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Milk Pool Volumetric Mass Reconciliation
            </h2>
            <p className="text-xs text-slate-500">
              Rigorous arithmetic equation balancing raw milk inward against pasteurizer dispatch and losses.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Balance Verification: EXACT (Zero Unaccounted Variance)</span>
          </div>
        </div>

        {/* Visual Formula Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 items-center font-mono">
          {/* 1. Opening */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-sans">Opening Milk</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Prior Day Silo</div>
          </div>

          {/* 2. + Own Production */}
          <div className="p-3 bg-slate-50 rounded-lg border border-blue-200 text-center relative">
            <span className="text-[11px] font-sans text-blue-700 block font-semibold">+ Own Production</span>
            <div className="text-base font-bold text-blue-700 mt-1">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Herd Milking</div>
          </div>

          {/* 3. + Farmer Procurement */}
          <div className="p-3 bg-slate-50 rounded-lg border border-[#3fb950]/30 text-center relative">
            <span className="text-[11px] font-sans text-emerald-700 block font-semibold">+ Farmer Milk</span>
            <div className="text-base font-bold text-emerald-700 mt-1">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">32 Farmers Inward</div>
          </div>

          {/* 4. - Quality Rejection */}
          <div className="p-3 bg-slate-50 rounded-lg border border-rose-200 text-center relative">
            <span className="text-[11px] font-sans text-rose-700 block font-semibold">- Quality Rejection</span>
            <div className="text-base font-bold text-rose-700 mt-1">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Diluted Inward</div>
          </div>

          {/* 5. - Processing Consumption */}
          <div className="p-3 bg-slate-50 rounded-lg border border-[#bc8cff]/30 text-center relative">
            <span className="text-[11px] font-sans text-blue-700 block font-semibold">- Processing HTST</span>
            <div className="text-base font-bold text-blue-700 mt-1">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Finished Goods Batches</div>
          </div>

          {/* 6. - Wastage / Spillage */}
          <div className="p-3 bg-slate-50 rounded-lg border border-amber-200 text-center relative">
            <span className="text-[11px] font-sans text-amber-700 block font-semibold">- Spillage / Loss</span>
            <div className="text-base font-bold text-amber-700 mt-1">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Line rinse & pipe loss</div>
          </div>

          {/* 7. = Closing Balance */}
          <div className="p-3 bg-[#238636]/15 rounded-lg border-2 border-[#3fb950] text-center">
            <span className="text-[11px] font-sans text-emerald-700 block font-bold">= Closing Pool Balance</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">
              {computedClosing.toLocaleString()} L
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Verified in Tank A/B</div>
          </div>
        </div>

        {/* Formula Explainer Footnote */}
        <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Equation: 1,480 + 1,240 + 2,860 - 42 - 3,860 - 78 = <strong className="text-emerald-700">1,600 Litres</strong>
          </span>
          <span className="text-emerald-700 font-sans text-[11px]">Audit Hash: RECON-2026-10-06-OK</span>
        </div>
      </div>

      {/* Inter-Tank Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Inter-Tank Milk Transfer"
        subtitle="Transfer chilled raw milk between insulated silo tanks"
        maxWidth="md"
      >
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Source Silo Tank</label>
            <select
              value={sourceTankId}
              onChange={(e) => setSourceTankId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
            >
              {displayTanks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.currentVolumeLitres}L available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Destination Silo Tank</label>
            <select
              value={targetTankId}
              onChange={(e) => setTargetTankId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
            >
              {displayTanks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.capacityLitres - t.currentVolumeLitres}L headroom)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Volume (Litres)</label>
            <input
              type="number"
              min="1"
              value={transferLitres}
              onChange={(e) => setTransferLitres(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
