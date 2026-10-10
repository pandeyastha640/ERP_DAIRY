import React, { useState, useEffect } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import {
  Settings,
  Building,
  MapPin,
  Users,
  Scale,
  DollarSign,
  ShieldAlert,
  Bell,
  Cpu,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useDairyERP();
  const [activeTab, setActiveTab] = useState<'Org' | 'Facilities' | 'Pricing' | 'Quality' | 'Integrations'>('Org');
  const [savedNotice, setSavedNotice] = useState(false);

  // Settings states initialized from context
  const [orgName, setOrgName] = useState(settings.orgName);
  const [fssaiLicense, setFssaiLicense] = useState(settings.fssaiLicense);
  const [baseMilkRate, setBaseMilkRate] = useState(String(settings.baseMilkRate));
  const [fatMultiplier, setFatMultiplier] = useState(String(settings.fatMultiplier));
  const [snfMultiplier, setSnfMultiplier] = useState(String(settings.snfMultiplier));
  const [maxArrivalTemp, setMaxArrivalTemp] = useState(String(settings.maxArrivalTemp));

  useEffect(() => {
    setOrgName(settings.orgName);
    setFssaiLicense(settings.fssaiLicense);
    setBaseMilkRate(String(settings.baseMilkRate));
    setFatMultiplier(String(settings.fatMultiplier));
    setSnfMultiplier(String(settings.snfMultiplier));
    setMaxArrivalTemp(String(settings.maxArrivalTemp));
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      orgName,
      fssaiLicense,
      baseMilkRate: parseFloat(baseMilkRate) || 34.5,
      fatMultiplier: parseFloat(fatMultiplier) || 4.5,
      snfMultiplier: parseFloat(snfMultiplier) || 2.5,
      maxArrivalTemp: parseFloat(maxArrivalTemp) || 6.0,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all ERP data to default demo datasets? All custom records will be restored to defaults.')) {
      resetAllData();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System & Enterprise Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organizational identity, quality control thresholds, procurement pricing formulas, and hardware integrations.
          </p>
        </div>

<<<<<<< Updated upstream
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset system to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
=======
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
>>>>>>> Stashed changes
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#238636]/20 border border-[#238636]/40 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration saved successfully! (Demo environment state)</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('Org')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Org' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Organization & Licenses
        </button>
        <button
          onClick={() => setActiveTab('Facilities')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Facilities' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Operating Facilities
        </button>
        <button
          onClick={() => setActiveTab('Pricing')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Pricing' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Procurement Pricing Rules
        </button>
        <button
          onClick={() => setActiveTab('Quality')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Quality' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Quality Rules & Specs
        </button>
        <button
          onClick={() => setActiveTab('Integrations')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Integrations' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Hardware & IoT Integrations
        </button>
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'Org' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Enterprise Legal Entity</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Dairy Enterprise Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">FSSAI Central Dairy License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">GST Identification Number (GSTIN)</label>
              <input
                type="text"
                defaultValue="24AAACC1209B1ZK"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Registered Dairy Head Office</label>
              <input
                type="text"
                defaultValue="Plant Yard 4, GIDC Industrial Estate, Anand, Gujarat - 388001"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facilities */}
      {activeTab === 'Facilities' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Registered Operating Facilities & Plants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-sm font-bold text-blue-700 font-sans">Main Dairy Processing Plant</div>
              <div className="text-slate-500">GIDC Anand · HTST Line 1 & 2 · 15,000 LPH Capacity</div>
              <div className="text-emerald-700 font-sans mt-1">Status: Active Commercial Operations</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-sm font-bold text-blue-700 font-sans">Anand Collection Centre 01</div>
              <div className="text-slate-500">Station Road Hub · 12 Village Pourers Enrolled</div>
              <div className="text-emerald-700 font-sans mt-1">Status: Online Weighbridge & Milk Analyzer</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-sm font-bold text-blue-700 font-sans">Baroda Bulk Chilling Unit</div>
              <div className="text-slate-500">Alkapuri Depot · 5,000 L Silo · Chilling to 3.8°C</div>
              <div className="text-emerald-700 font-sans mt-1">Status: Direct Farm Inward Active</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-sm font-bold text-blue-700 font-sans">Mehsana Procurement Hub</div>
              <div className="text-slate-500">Northern Cattle Cluster · Fodder Silage Bank</div>
              <div className="text-emerald-700 font-sans mt-1">Status: Operational Network</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Rules */}
      {activeTab === 'Pricing' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Two-Axis Procurement Pricing Formula</h2>
          <p className="text-slate-500">
            Formula: Rate = Base Rate + (Fat - 4.0) × Fat Factor + (SNF - 8.5) × SNF Factor
          </p>

          <div className="grid grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-slate-500 mb-1 font-sans">Base Rate (₹ / Litre)</label>
              <input
                type="number"
                step="0.1"
                value={baseMilkRate}
                onChange={(e) => setBaseMilkRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-sans">Fat Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={fatMultiplier}
                onChange={(e) => setFatMultiplier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-sans">SNF Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={snfMultiplier}
                onChange={(e) => setSnfMultiplier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-slate-700">
            Example Sample: Fat 4.5%, SNF 8.7% &rarr; Rate = ₹34.50 + (0.5 &times; 4.50) + (0.2 &times; 2.50) = <strong className="text-emerald-700">₹37.25 / Litre</strong>
          </div>
        </div>
      )}

      {/* Tab 4: Quality Rules */}
      {activeTab === 'Quality' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Quality Tolerance & Rejection Thresholds</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Max Arrival Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={maxArrivalTemp}
                onChange={(e) => setMaxArrivalTemp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Minimum Acceptable Fat %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="3.2"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Minimum Acceptable SNF %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="7.8"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Adulteration Action Protocol</label>
              <input
                type="text"
                disabled
                defaultValue="Immediate Weighbridge Rejection (Zero Tolerance)"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-mono text-rose-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hardware Integrations */}
      {activeTab === 'Integrations' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Connected Hardware, IoT & Financial Gateways</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">LactoScan Milk Analyzers</span>
                <span className="text-emerald-700 font-mono text-[10px]">CONNECTED</span>
              </div>
              <p className="text-slate-500">Auto RS-232 serial telemetry pulling Fat, SNF, Water & Density directly into collection desk.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Digital Weighbridge Scales</span>
                <span className="text-emerald-700 font-mono text-[10px]">CONNECTED</span>
              </div>
              <p className="text-slate-500">Zero-manual-entry tare and gross weight capture on dairy inward unloading docks.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Direct Bank IMPS API</span>
                <span className="text-emerald-700 font-mono text-[10px]">ACTIVE</span>
              </div>
              <p className="text-slate-500">Real-time instantaneous payment dispatch to enrolled producer accounts upon QC clearance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
