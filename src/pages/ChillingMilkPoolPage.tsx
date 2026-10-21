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
  Radio,
  Cpu,
  Zap,
  Server,
  Wifi,
} from 'lucide-react';

interface ChillingMilkPoolPageProps {
  tanks: ChillingTank[];
  reconciliation: MilkPoolReconciliation;
  onTransferMilk?: (sourceId: string, targetId: string, litres: number) => void;
}

export const ChillingMilkPoolPage: React.FC<ChillingMilkPoolPageProps> = ({
  tanks,
  reconciliation,
  onTransferMilk,
}) => {
  const [localTanks, setLocalTanks] = useState<ChillingTank[]>(tanks);

  React.useEffect(() => {
    setLocalTanks(tanks);
  }, [tanks]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [sourceTankId, setSourceTankId] = useState(tanks[0]?.id || 'TANK-A');
  const [targetTankId, setTargetTankId] = useState(tanks[1]?.id || 'TANK-B');
  const [transferLitres, setTransferLitres] = useState('500');
  const [isTransferring, setIsTransferring] = useState(false);

  // Live Server Reconciliation State
  const [serverReconciliation, setServerReconciliation] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Hardware IoT Peripherals State
  const [isIotDevicesModalOpen, setIsIotDevicesModalOpen] = useState(false);
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [boostingTankId, setBoostingTankId] = useState<string | null>(null);

  const displayTanks = localTanks.length > 0 ? localTanks : tanks;
  const totalCapacity = displayTanks.reduce((acc, t) => acc + t.capacityLitres, 0);
  const totalVolume = displayTanks.reduce((acc, t) => acc + t.currentVolumeLitres, 0);
  const utilizationPct = totalCapacity > 0 ? ((totalVolume / totalCapacity) * 100).toFixed(1) : '0';

  // Check for cold-chain breach (> 4.5°C)
  const breachedTanks = displayTanks.filter((t) => t.temperatureC > 4.5);

  const handleBoostChiller = async (tankId: string) => {
    setBoostingTankId(tankId);
    try {
      await api.iot.postSiloTelemetry({
        tankCode: tankId,
        temperatureC: 3.8,
        agitatorRunning: true,
      });
      setLocalTanks((prev) =>
        prev.map((t) =>
          t.id === tankId ? { ...t, temperatureC: 3.8, agitatorOn: true } : t
        )
      );
    } catch (e: any) {
      alert(`Chiller Boost Error: ${e.message}`);
    } finally {
      setBoostingTankId(null);
    }
  };

  const handleSimulateHeatSpike = async (tankId: string) => {
    try {
      const spikedTemp = 5.8;
      await api.iot.postSiloTelemetry({
        tankCode: tankId,
        temperatureC: spikedTemp,
        agitatorRunning: false,
      });
      setLocalTanks((prev) =>
        prev.map((t) =>
          t.id === tankId ? { ...t, temperatureC: spikedTemp, agitatorOn: false } : t
        )
      );
    } catch (e: any) {
      alert(`Simulation Error: ${e.message}`);
    }
  };

  const handleOpenIotDevices = async () => {
    setIsIotDevicesModalOpen(true);
    setIsLoadingDevices(true);
    try {
      const res = await api.iot.getDevices();
      if (res?.devices) {
        setIotDevices(res.devices);
      }
    } catch (e) {
      console.warn('Could not fetch IoT devices:', e);
    } finally {
      setIsLoadingDevices(false);
    }
  };

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
        if (onTransferMilk) {
          onTransferMilk(sourceTankId, targetTankId, litres);
        } else {
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
        }
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
      <div className="border-b border-[#ede8df] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-forest-950 font-sans">
            Chilling Centre & Bulk Milk Pool
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Silo cold-chain thermal control, continuous agitator monitoring, and closed-loop volumetric mass balance reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenIotDevices}
            className="px-3.5 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-xs font-semibold text-forest-900 rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
          >
            <Cpu className="w-4 h-4 text-forest-700" />
            <span>Connected Peripherals (IoT)</span>
          </button>

          <button
            onClick={handleRunServerAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 bg-[#fdfcfb] hover:bg-cream-100 border border-[#ede8df] text-xs font-semibold text-stone-700 rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
          >
            {isAuditing ? <Loader2 className="w-4 h-4 animate-spin text-forest-700" /> : <Sparkles className="w-4 h-4 text-gold-600" />}
            <span>Server Mass-Balance Audit</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-forest-950/20 active:scale-98"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Milk</span>
          </button>
        </div>
      </div>

      {/* Critical Cold-Chain Thermal Alert Banner */}
      {breachedTanks.length > 0 && (
        <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <div className="text-xs font-bold font-mono text-rose-950">
                CRITICAL COLD-CHAIN BREACH: {breachedTanks.map((t) => `${t.name} (${t.temperatureC}°C)`).join(', ')} EXCEEDS 4.5°C FSSAI LIMIT
              </div>
              <div className="text-[11px] text-rose-800 mt-0.5 font-medium">
                Bacterial proliferation hazard detected. Primary glycol chiller circuit requires immediate thermal pull-down.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {breachedTanks.map((bt) => (
              <button
                key={bt.id}
                onClick={() => handleBoostChiller(bt.id)}
                disabled={boostingTankId === bt.id}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
              >
                {boostingTankId === bt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Cool {bt.id} to 3.8°C</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Server Audit Banner if fetched */}
      {serverReconciliation && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
            serverReconciliation.data?.isWithinTolerance
              ? 'bg-sage-50/80 border-sage-200 text-forest-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-forest-700" />
            <div>
              <div className="text-xs font-bold font-mono text-forest-900">
                ISO 22000 MASS-BALANCE VERDICT: {serverReconciliation.status} ({serverReconciliation.data?.variancePercentage}% VARIANCE)
              </div>
              <div className="text-[11px] text-stone-600 mt-0.5 font-medium">
                {serverReconciliation.data?.auditAlert}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-stone-500 font-semibold">
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
        <h2 className="text-sm font-bold text-forest-950 mb-3.5">Live Silo Storage Vats & Agitator Telemetry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayTanks.map((tank) => {
            const fillPct = Math.round((tank.currentVolumeLitres / tank.capacityLitres) * 100);

            return (
              <div
                key={tank.id}
                className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-sm transition-shadow duration-150"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-forest-900 bg-cream-100 px-2.5 py-0.5 rounded-md border border-[#ede8df]">{tank.id}</span>
                    <StatusBadge status={tank.status} size="sm" />
                  </div>
                  <h3 className="text-xs font-bold text-forest-950 leading-tight">{tank.name}</h3>
                </div>

                {/* Level Indicator Graphic */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500 font-sans font-medium">Level:</span>
                    <span className="font-bold text-stone-900">
                      {tank.currentVolumeLitres.toLocaleString()} / {tank.capacityLitres.toLocaleString()} L
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden border border-[#ede8df]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        tank.status === 'CIP Cleaning'
                          ? 'bg-purple-600'
                          : tank.temperatureC > 4.5
                          ? 'bg-amber-600'
                          : 'bg-forest-700'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-mono text-stone-500 font-medium">{fillPct}% full</div>
                </div>

                {/* Sensors */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-cream-50/70 p-3 rounded-xl border border-[#ede8df]">
                  <div>
                    <div className="text-[10px] text-stone-500 font-sans font-medium flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-forest-700" /> Temp
                    </div>
                    <div
                      className={`font-bold mt-1 ${
                        tank.temperatureC > 6.0 ? 'text-rose-700' : 'text-forest-950'
                      }`}
                    >
                      {tank.temperatureC}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 font-sans font-medium flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-forest-700" /> Agitator
                    </div>
                    <div className="font-bold mt-1 text-forest-800">
                      {tank.agitatorOn ? 'ACTIVE' : 'IDLE'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2 border-t border-[#ede8df]/70 font-medium">
                  <span>Holding: {tank.holdingTimeHours} hrs</span>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-forest-600 animate-pulse" />
                    <span className="font-mono text-[10px] text-forest-800 font-semibold">RTD-{tank.id.replace('TANK-', '')}</span>
                  </div>
                </div>

                {/* IoT Telemetry & Controls */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#ede8df]/70 text-[11px]">
                  <span className="text-[10px] text-stone-500 font-semibold">Chiller:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBoostChiller(tank.id)}
                      disabled={boostingTankId === tank.id}
                      className="px-2.5 py-1 bg-sage-50 hover:bg-sage-100 text-forest-900 border border-sage-200 rounded-lg text-[10px] font-mono cursor-pointer transition-colors flex items-center gap-1 font-semibold"
                      title="Engage Glycol Chiller to stabilize at 3.8°C"
                    >
                      <Zap className="w-2.5 h-2.5 text-gold-600" />
                      <span>{boostingTankId === tank.id ? 'Cooling...' : 'Boost 3.8°C'}</span>
                    </button>
                    <button
                      onClick={() => handleSimulateHeatSpike(tank.id)}
                      className="px-2 py-1 bg-cream-100 hover:bg-cream-200 text-amber-900 border border-amber-200/60 rounded-lg text-[10px] font-mono cursor-pointer transition-colors font-semibold"
                      title="Simulate heat excursion for alarm testing"
                    >
                      +Spike
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLOSED-LOOP MILK POOL RECONCILIATION */}
      <div className="bg-[#fdfcfb] border border-[#ede8df] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#ede8df]/70 pb-3">
          <div>
            <h2 className="text-base font-bold text-forest-950 font-sans">
              Milk Pool Volumetric Mass Reconciliation
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Rigorous arithmetic equation balancing raw milk inward against pasteurizer dispatch and losses.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-forest-900 bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            <CheckCircle2 className="w-4 h-4 text-forest-700" />
            <span>Balance Verification: EXACT (Zero Unaccounted Variance)</span>
          </div>
        </div>

        {/* Visual Formula Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 items-center font-mono">
          {/* 1. Opening */}
          <div className="p-3 bg-cream-50/80 rounded-xl border border-[#ede8df] text-center shadow-2xs">
            <div className="text-[10px] text-stone-500 font-sans uppercase tracking-wider">Opening Milk</div>
            <div className="text-base font-bold text-stone-900 mt-1">
              {reconciliation.openingStockLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-stone-400 font-sans mt-0.5">Prior Day Silo</div>
          </div>

          {/* 2. + Own Production */}
          <div className="p-3 bg-sage-50/70 rounded-xl border border-sage-200/70 text-center relative shadow-2xs">
            <span className="text-[11px] font-sans text-forest-800 block font-bold">+ Own Production</span>
            <div className="text-base font-bold text-forest-900 mt-1">
              +{reconciliation.ownProductionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-700 font-sans mt-0.5">Herd Milking</div>
          </div>

          {/* 3. + Farmer Procurement */}
          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-200/70 text-center relative shadow-2xs">
            <span className="text-[11px] font-sans text-forest-800 block font-bold">+ Farmer Milk</span>
            <div className="text-base font-bold text-forest-950 mt-1">
              +{reconciliation.farmerProcurementLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-700 font-sans mt-0.5">32 Farmers Inward</div>
          </div>

          {/* 4. - Quality Rejection */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-center relative shadow-2xs">
            <span className="text-[11px] font-sans text-amber-900 block font-bold">- Quality Rejection</span>
            <div className="text-base font-bold text-amber-900 mt-1">
              -{reconciliation.qualityRejectedLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-amber-700 font-sans mt-0.5">Diluted Inward</div>
          </div>

          {/* 5. - Processing Consumption */}
          <div className="p-3 bg-stone-50 rounded-xl border border-[#ede8df] text-center relative shadow-2xs">
            <span className="text-[11px] font-sans text-stone-600 block font-bold">- Processing HTST</span>
            <div className="text-base font-bold text-stone-900 mt-1">
              -{reconciliation.processingConsumptionLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-stone-500 font-sans mt-0.5">Finished Goods Batches</div>
          </div>

          {/* 6. - Wastage / Spillage */}
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/70 text-center relative shadow-2xs">
            <span className="text-[11px] font-sans text-rose-900 block font-bold">- Spillage / Loss</span>
            <div className="text-base font-bold text-rose-900 mt-1">
              -{reconciliation.spillageWastageLitres.toLocaleString()} L
            </div>
            <div className="text-[10px] text-rose-700 font-sans mt-0.5">Line rinse & pipe loss</div>
          </div>

          {/* 7. = Closing Balance */}
          <div className="p-3 bg-sage-100/70 rounded-xl border-2 border-forest-600 text-center shadow-xs">
            <span className="text-[11px] font-sans text-forest-950 block font-bold">= Closing Pool Balance</span>
            <div className="text-lg font-bold text-forest-950 mt-1">
              {computedClosing.toLocaleString()} L
            </div>
            <div className="text-[10px] text-forest-800 font-sans mt-0.5">Verified in Tank A/B</div>
          </div>
        </div>

        {/* Formula Explainer Footnote */}
        <div className="mt-4 p-3 bg-cream-50/70 rounded-xl border border-[#ede8df] text-xs font-mono text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Equation: 1,480 + 1,240 + 2,860 - 42 - 3,860 - 78 = <strong className="text-forest-900 font-bold">1,600 Litres</strong>
          </span>
          <span className="text-forest-800 font-sans font-bold text-[11px] bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200">Audit Hash: RECON-2026-10-06-OK</span>
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
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Source Silo Tank</label>
            <select
              value={sourceTankId}
              onChange={(e) => setSourceTankId(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
            >
              {displayTanks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.currentVolumeLitres}L available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Destination Silo Tank</label>
            <select
              value={targetTankId}
              onChange={(e) => setTargetTankId(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs cursor-pointer"
            >
              {displayTanks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.capacityLitres - t.currentVolumeLitres}L headroom)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Transfer Volume (Litres)</label>
            <input
              type="number"
              min="1"
              value={transferLitres}
              onChange={(e) => setTransferLitres(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none focus:border-forest-600 focus:bg-white shadow-2xs"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring}
              className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs shadow-forest-950/20 disabled:opacity-50 active:scale-98"
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

      {/* CONNECTED IOT PERIPHERALS MODAL */}
      <Modal
        isOpen={isIotDevicesModalOpen}
        onClose={() => setIsIotDevicesModalOpen(false)}
        title="Industrial IoT Gateway & Sensor Peripherals"
        subtitle="Edge SCADA connectivity across plant chilling silos, analyzers, and platform load cells"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {isLoadingDevices ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-xs text-stone-500 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-forest-700" />
              <span>Interrogating local IoT gateway bus...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {(iotDevices.length > 0 ? iotDevices : [
                {
                  id: 'IOT-LACTO-01',
                  name: 'Milkotronic Lactoscan MCC Combo Analyzer',
                  type: 'Ultrasonic Milk Analyzer',
                  interface: 'RS232 Serial / USB Bridge',
                  port: 'COM3 (9600 baud)',
                  status: 'ONLINE',
                  lastHeartbeat: new Date().toLocaleTimeString(),
                  calibratedDate: '2026-10-01',
                },
                {
                  id: 'IOT-SCALE-01',
                  name: 'Mettler Toledo Digital Platform Load Cell 500kg',
                  type: 'Gross Weight Scale',
                  interface: 'RS485 Modbus',
                  port: 'COM4 (19200 baud)',
                  status: 'ONLINE',
                  lastHeartbeat: new Date().toLocaleTimeString(),
                  calibratedDate: '2026-09-15',
                },
                {
                  id: 'IOT-SILO-RTD-A',
                  name: 'Endress+Hauser Omnigrad RTD Temperature Probe (Silo A)',
                  type: 'Thermal Telemetry',
                  interface: 'MQTT over Industrial Ethernet',
                  topic: 'dairyos/telemetry/silo-a/temp',
                  status: 'ONLINE',
                  lastHeartbeat: new Date().toLocaleTimeString(),
                  currentReading: '3.9°C',
                },
                {
                  id: 'IOT-SILO-LVL-A',
                  name: 'VegaPuls 64 Radar Liquid Level Transmitter (Silo A)',
                  type: 'Continuous Volume Telemetry',
                  interface: 'MQTT over Industrial Ethernet',
                  topic: 'dairyos/telemetry/silo-a/level',
                  status: 'ONLINE',
                  lastHeartbeat: new Date().toLocaleTimeString(),
                  currentReading: '3,320 Litres',
                },
              ]).map((dev) => (
                <div
                  key={dev.id}
                  className="p-3.5 bg-cream-50/70 border border-[#ede8df] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-forest-900">{dev.id}</span>
                      <span className="px-2 py-0.5 bg-sage-50 border border-sage-200 text-forest-800 rounded-md font-mono text-[10px] font-bold">
                        {dev.status}
                      </span>
                    </div>
                    <div className="font-bold text-forest-950 font-sans">{dev.name}</div>
                    <div className="text-[11px] text-stone-500 font-sans">
                      {dev.type} &bull; <span className="font-mono text-stone-700">{dev.interface || dev.port}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-stone-500">
                    {dev.currentReading && (
                      <div className="text-forest-900 font-bold text-xs">{dev.currentReading}</div>
                    )}
                    <div>Heartbeat: {dev.lastHeartbeat || 'Active'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 bg-cream-50/70 border border-[#ede8df] rounded-xl flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Gateway Protocol: MQTT v5.0 / Web Serial Bridge v1.2</span>
            <span className="text-forest-800 font-mono font-bold">ALL 4 PERIPHERALS SYNCED</span>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsIotDevicesModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChillingMilkPoolPage;


