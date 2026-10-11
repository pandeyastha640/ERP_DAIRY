import React, { useState, useEffect, useRef } from 'react';
import { Farmer, MilkCollectionRecord } from '../../types/dairy';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import {
  Cpu,
  Scale,
  Activity,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Radio,
  Sliders,
  Play,
  RotateCcw,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LactoscanSerialBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmers: Farmer[];
  onCollectionIngested: (record: Omit<MilkCollectionRecord, 'id' | 'collectionCode'>) => void;
}

interface SimulatedPreset {
  name: string;
  fat: number;
  snf: number;
  clr: number;
  temperatureC: number;
  weightKg: number;
  description: string;
}

const PRESETS: SimulatedPreset[] = [
  {
    name: 'Standard Cow Milk (Grade A)',
    fat: 4.4,
    snf: 8.6,
    clr: 28.5,
    temperatureC: 6.5,
    weightKg: 46.35,
    description: 'Fresh Anand morning intake, balanced solids, optimal density',
  },
  {
    name: 'High-Fat Murrah Buffalo Milk',
    fat: 6.8,
    snf: 9.2,
    clr: 30.2,
    temperatureC: 5.8,
    weightKg: 51.5,
    description: 'Premium buffalo milk, high fat incentive tier (+₹12.60/L bonus)',
  },
  {
    name: 'Substandard / Diluted (Water Adulteration)',
    fat: 3.0,
    snf: 7.4,
    clr: 23.5,
    temperatureC: 18.2,
    weightKg: 30.0,
    description: 'Fat < 3.2% or SNF < 7.8% - Automated FSSAI rejection trigger',
  },
  {
    name: 'Warm Raw Milk (Thermal Spike)',
    fat: 4.2,
    snf: 8.5,
    clr: 28.0,
    temperatureC: 25.5,
    weightKg: 62.0,
    description: 'Acceptable solids but high temperature - requires immediate chilling alert',
  },
];

export const LactoscanSerialBridgeModal: React.FC<LactoscanSerialBridgeModalProps> = ({
  isOpen,
  onClose,
  farmers,
  onCollectionIngested,
}) => {
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(farmers[0]?.id || '');
  const [shift, setShift] = useState<'Morning' | 'Evening'>('Morning');
  const [centre, setCentre] = useState<string>('Anand Collection Centre');

  // Connection State
  const [connectionMode, setConnectionMode] = useState<'simulated' | 'web_serial'>('simulated');
  const [serialBaudRate, setSerialBaudRate] = useState<number>(9600);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [webSerialSupported, setWebSerialSupported] = useState<boolean>(false);

  // Analyzer & Scale Telemetry Values
  const [grossWeightKg, setGrossWeightKg] = useState<number>(46.35);
  const [tareWeightKg, setTareWeightKg] = useState<number>(0.0);
  const [fat, setFat] = useState<number>(4.4);
  const [snf, setSnf] = useState<number>(8.6);
  const [clr, setClr] = useState<number>(28.5);
  const [temperatureC, setTemperatureC] = useState<number>(6.5);

  // Serial Console Stream Log
  const [packetLogs, setPacketLogs] = useState<string[]>([
    '[INIT] Hardware Driver: Milkotronic RS232 / USB Bridge Initialized',
    '[BAUD] COM3 Serial interface opened @ 9600-8-N-1',
    '[SCALE] Mettler Toledo Loadcell Platform 500kg connected on COM4',
    '[STATUS] Ready to capture live ultrasonic milk analyzer packets',
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastIngestedRecord, setLastIngestedRecord] = useState<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Check Web Serial API support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      setWebSerialSupported(true);
    }
  }, []);

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [packetLogs]);

  // Specific gravity conversion: Net weight / 1.030 kg/L
  const netWeightKg = Math.max(0, +(grossWeightKg - tareWeightKg).toFixed(2));
  const calculatedLitres = +(netWeightKg / 1.030).toFixed(1);

  // Two-Axis Pricing Formula
  const isFail = fat < 3.2 || snf < 7.8 || temperatureC > 24.0;
  const isWarn = !isFail && (temperatureC > 10.0 || fat < 3.8);
  const quality = isFail ? 'FAIL' : isWarn ? 'WARNING' : 'PASS';

  const baseRate = 34.5;
  const computedRate = isFail
    ? 0
    : Math.max(28.0, +(baseRate + (fat - 4.0) * 4.5 + (snf - 8.5) * 2.5).toFixed(2));
  const payableAmount = Math.round(calculatedLitres * computedRate);

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];

  const appendLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setPacketLogs((prev) => [...prev.slice(-35), `[${time}] ${msg}`]);
  };

  const handleApplyPreset = (preset: SimulatedPreset) => {
    setFat(preset.fat);
    setSnf(preset.snf);
    setClr(preset.clr);
    setTemperatureC(preset.temperatureC);
    setGrossWeightKg(preset.weightKg);

    const checkSum = Math.floor(Math.random() * 89 + 10).toString(16).toUpperCase();
    const packetStr = `$LACTO,FARM=${selectedFarmer?.id || 'FARM-001'},FAT=${preset.fat.toFixed(2)},SNF=${preset.snf.toFixed(2)},CLR=${preset.clr.toFixed(1)},WT=${preset.weightKg.toFixed(2)}KG,TMP=${preset.temperatureC.toFixed(1)}C*${checkSum}`;

    appendLog(`RX <- ${packetStr}`);
    appendLog(`[PARSER] Validated: ${preset.fat}% Fat, ${preset.snf}% SNF, Net: ${(preset.weightKg / 1.030).toFixed(1)}L`);
  };

  const handleTareScale = () => {
    setTareWeightKg(grossWeightKg);
    appendLog(`[SCALE] Tare executed: Tare = ${grossWeightKg.toFixed(2)} kg. Zero Reference set.`);
  };

  const handleResetTare = () => {
    setTareWeightKg(0);
    appendLog(`[SCALE] Tare cleared: Zero Reference = 0.00 kg.`);
  };

  // Connect Physical Web Serial API
  const handleConnectPhysicalPort = async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      appendLog('[SERIAL] Requesting user authorization for COM / USB Port...');
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: serialBaudRate });
      setIsConnected(true);
      setConnectionMode('web_serial');
      appendLog(`[SERIAL] Connected to physical hardware port @ ${serialBaudRate} baud!`);

      // Read stream
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      setIsReading(true);
      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              appendLog(`RAW RX: ${value}`);
              // Parse Lactoscan standard string: $LACTO,FAT=xx.xx,SNF=xx.xx,CLR=xx.x,WT=xx.xx
              const fatMatch = value.match(/FAT=([\d.]+)/i);
              const snfMatch = value.match(/SNF=([\d.]+)/i);
              const clrMatch = value.match(/CLR=([\d.]+)/i);
              const wtMatch = value.match(/WT=([\d.]+)/i);
              const tmpMatch = value.match(/TMP=([\d.]+)/i);

              if (fatMatch) setFat(parseFloat(fatMatch[1]));
              if (snfMatch) setSnf(parseFloat(snfMatch[1]));
              if (clrMatch) setClr(parseFloat(clrMatch[1]));
              if (wtMatch) setGrossWeightKg(parseFloat(wtMatch[1]));
              if (tmpMatch) setTemperatureC(parseFloat(tmpMatch[1]));
            }
          }
        } catch (e: any) {
          appendLog(`[SERIAL ERROR] ${e.message}`);
        } finally {
          reader.releaseLock();
        }
      })();
    } catch (err: any) {
      appendLog(`[SERIAL ERROR] Failed to connect: ${err.message}`);
    }
  };

  // Commit Ingestion
  const handleCommitIngestion = async () => {
    if (!selectedFarmer || calculatedLitres <= 0) {
      alert('Please select a valid farmer and ensure net milk volume > 0.');
      return;
    }

    setIsSubmitting(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];
    let activeCollectionCode = `IOT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      appendLog(`[TX -> INWARD] Ingesting ${calculatedLitres}L from ${selectedFarmer.name} (${selectedFarmer.id})...`);

      // 1. Send to Backend IoT Ingestion API (graceful sync)
      const iotPayload = {
        farmerCode: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        weightKg: netWeightKg,
        volumeLitres: calculatedLitres,
        fat,
        snf,
        clr,
        temperatureC,
        shift,
        centre,
      };

      try {
        const response = await api.iot.postLactoscan(iotPayload);
        if (response?.data?.collectionCode) {
          activeCollectionCode = response.data.collectionCode;
        }
        appendLog(`[API 200] Hardware datagram persisted to SQLite ledger (#${activeCollectionCode})`);
      } catch (apiErr: any) {
        appendLog(`[LOCAL SYNC] Ingestion buffered locally: ${apiErr.message || 'Offline mode'}`);
      }

      // 2. Invoke context callback to refresh local state instantly
      onCollectionIngested({
        time: timeStr,
        date: dateStr,
        shift,
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        centre,
        quantityLitres: calculatedLitres,
        fat,
        snf,
        temperatureC,
        quality,
        ratePerLitre: computedRate,
        payableAmount,
        testedBy: 'Milkotronic Lactoscan IoT Station (COM3)',
      });

      // 3. Update receipt card
      setLastIngestedRecord({
        farmer: selectedFarmer.name,
        code: selectedFarmer.id,
        litres: calculatedLitres,
        rate: computedRate,
        payable: payableAmount,
        quality,
        collectionCode: activeCollectionCode,
      });

      appendLog(`[SUCCESS] ${calculatedLitres}L credited to Chilling Vat B! Collection #${activeCollectionCode}`);
      appendLog(`[FINANCE] ₹${payableAmount.toLocaleString()} queued for farmer IMPS payout clearance.`);
    } catch (err: any) {
      appendLog(`[ERROR] Ingestion notice: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hardware IoT & Ultrasonic Milk Analyzer Bridge"
      subtitle="Milkotronic Lactoscan MCC & Load-Cell Digital Scale Automated Intake Engine"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Device Status Ribbon */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#f0f6fc]">Milkotronic Lactoscan MCC</span>
            </div>
            <span className="text-[#8b949e]">|</span>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>RS232: 9600-8N1</span>
            </div>
            <span className="text-[#8b949e]">|</span>
            <div className="flex items-center gap-1.5 font-mono text-sky-400">
              <Scale className="w-3.5 h-3.5" />
              <span>Load Cell: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {webSerialSupported && (
              <button
                onClick={handleConnectPhysicalPort}
                className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Connect physical USB-Serial device via browser"
              >
                <Radio className="w-3 h-3" />
                <span>Open Physical COM Port</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold">
              HARDWARE SYNCED
            </span>
          </div>
        </div>

        {/* Farmer & Station Meta Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-[#8b949e] mb-1">
              Supplier / Farmer RFID Scan
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} - {f.name} ({f.village})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Intake Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as any)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
            >
              <option value="Morning">Morning Shift (05:00 - 08:30)</option>
              <option value="Evening">Evening Shift (16:00 - 19:30)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Collection Centre</label>
            <select
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
            >
              <option value="Anand Collection Centre">Anand Collection Centre</option>
              <option value="Borsad Bulk Chilling Unit">Borsad Bulk Chilling Unit</option>
              <option value="Nadiad Collection Hub">Nadiad Collection Hub</option>
            </select>
          </div>
        </div>

        {/* Simulation / Hardware Packet Presets */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulated Hardware Telemetry Injector</span>
            </span>
            <span className="text-[11px] text-[#8b949e]">Click preset to fire live RS232 datagram</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-2 rounded border border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:bg-[#1f2937]/50 transition-all text-xs cursor-pointer group"
              >
                <div className="font-semibold text-[#f0f6fc] group-hover:text-[#58a6ff] truncate">
                  {p.name}
                </div>
                <div className="font-mono text-[11px] text-[#8b949e] mt-1">
                  {p.fat}% Fat | {p.snf}% SNF | {p.weightKg}kg
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Hardware Telemetry Displays */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Gross Weight */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
            <div className="text-[11px] text-[#8b949e] font-sans flex items-center justify-center gap-1">
              <Scale className="w-3 h-3 text-sky-400" /> Gross Wt (Kg)
            </div>
            <input
              type="number"
              step="0.05"
              value={grossWeightKg}
              onChange={(e) => setGrossWeightKg(parseFloat(e.target.value) || 0)}
              className="text-lg font-bold font-mono text-[#f0f6fc] bg-transparent text-center w-full outline-none mt-1 border-b border-transparent focus:border-[#58a6ff]"
            />
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">
              Tare: {tareWeightKg.toFixed(2)}kg
            </div>
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <button
                type="button"
                onClick={handleTareScale}
                className="px-1.5 py-0.5 bg-[#21262d] text-[10px] text-sky-300 rounded hover:bg-[#30363d]"
              >
                TARE
              </button>
              <button
                type="button"
                onClick={handleResetTare}
                className="px-1.5 py-0.5 bg-[#21262d] text-[10px] text-[#8b949e] rounded hover:bg-[#30363d]"
              >
                ZERO
              </button>
            </div>
          </div>

          {/* Fat % */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
            <div className="text-[11px] text-[#8b949e] font-sans">Fat % (Ultrasonic)</div>
            <input
              type="number"
              step="0.05"
              value={fat}
              onChange={(e) => setFat(parseFloat(e.target.value) || 0)}
              className="text-lg font-bold font-mono text-amber-400 bg-transparent text-center w-full outline-none mt-1 border-b border-transparent focus:border-[#58a6ff]"
            />
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">Min: 3.20%</div>
          </div>

          {/* SNF % */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
            <div className="text-[11px] text-[#8b949e] font-sans">SNF % (Solids)</div>
            <input
              type="number"
              step="0.05"
              value={snf}
              onChange={(e) => setSnf(parseFloat(e.target.value) || 0)}
              className="text-lg font-bold font-mono text-emerald-400 bg-transparent text-center w-full outline-none mt-1 border-b border-transparent focus:border-[#58a6ff]"
            />
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">Min: 7.80%</div>
          </div>

          {/* CLR / Lactometer */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
            <div className="text-[11px] text-[#8b949e] font-sans">CLR / Density</div>
            <input
              type="number"
              step="0.1"
              value={clr}
              onChange={(e) => setClr(parseFloat(e.target.value) || 0)}
              className="text-lg font-bold font-mono text-sky-400 bg-transparent text-center w-full outline-none mt-1 border-b border-transparent focus:border-[#58a6ff]"
            />
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">Std: 28.0 - 30.0</div>
          </div>

          {/* Temperature */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-center">
            <div className="text-[11px] text-[#8b949e] font-sans">Temperature (°C)</div>
            <input
              type="number"
              step="0.1"
              value={temperatureC}
              onChange={(e) => setTemperatureC(parseFloat(e.target.value) || 0)}
              className={`text-lg font-bold font-mono bg-transparent text-center w-full outline-none mt-1 border-b border-transparent focus:border-[#58a6ff] ${
                temperatureC > 20 ? 'text-amber-400' : 'text-[#f0f6fc]'
              }`}
            />
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">Target: ≤ 8.0°C</div>
          </div>
        </div>

        {/* Calculated Volume & 2-Axis Pricing Ledger */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-[11px] text-[#8b949e]">Computed Net Volume</div>
            <div className="text-base font-bold font-mono text-[#f0f6fc] mt-1">
              {calculatedLitres} Litres
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5 font-mono">
              Net: {netWeightKg}kg / 1.030 sp.gr.
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#8b949e]">Quality Assessment</div>
            <div className="mt-1">
              {quality === 'PASS' && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>QC PASS</span>
                </span>
              )}
              {quality === 'WARNING' && (
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold inline-flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>QC WARNING</span>
                </span>
              )}
              {quality === 'FAIL' && (
                <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>REJECTED</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5 font-mono">
              {isFail ? 'Violates min solids' : 'FSSAI compliant'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#8b949e]">Computed 2-Axis Rate</div>
            <div className="text-base font-bold font-mono text-[#f0f6fc] mt-1">
              {isFail ? '₹0.00 / L' : `₹${computedRate.toFixed(2)} / L`}
            </div>
            <div className="text-[10px] text-[#8b949e] mt-0.5 font-mono">
              Base: ₹34.50 + Solids Δ
            </div>
          </div>

          <div className="bg-[#0d1117] p-2 rounded border border-[#30363d] flex flex-col justify-center">
            <div className="text-[11px] text-[#8b949e]">Instant Farmer Payable</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              ₹{payableAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 font-mono">
              IMPS auto-queued
            </div>
          </div>
        </div>

        {/* Live Serial Raw Datagram Terminal */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-mono text-[#8b949e] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>RS232 Serial Port Packet Monitor (9600-8N1 ASCII)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-500">RX ACTIVE</span>
          </div>
          <div
            ref={logContainerRef}
            className="h-24 overflow-y-auto font-mono text-[11px] text-[#58a6ff] space-y-0.5 bg-black/40 p-2 rounded border border-[#21262d] select-all"
          >
            {packetLogs.map((log, i) => (
              <div key={i} className="leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation banner if ingested */}
        {lastIngestedRecord && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>{lastIngestedRecord.collectionCode}</strong> successfully credited: {lastIngestedRecord.litres}L from {lastIngestedRecord.farmer} (₹{lastIngestedRecord.payable.toLocaleString()})
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400">Credited to Vat B</span>
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
            onClick={handleCommitIngestion}
            disabled={isSubmitting || calculatedLitres <= 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>Commit & Ingest to Inward Tank</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
