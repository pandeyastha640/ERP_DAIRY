import React, { useState } from 'react';
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
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Org' | 'Facilities' | 'Pricing' | 'Quality' | 'Integrations'>('Org');
  const [savedNotice, setSavedNotice] = useState(false);

  // Settings states
  const [orgName, setOrgName] = useState('DairyOS Operational Cooperative Ltd.');
  const [fssaiLicense, setFssaiLicense] = useState('10018021003456');
  const [baseMilkRate, setBaseMilkRate] = useState('34.50');
  const [fatMultiplier, setFatMultiplier] = useState('4.50');
  const [snfMultiplier, setSnfMultiplier] = useState('2.50');
  const [maxArrivalTemp, setMaxArrivalTemp] = useState('6.0');

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            System & Enterprise Settings
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Organizational identity, quality control thresholds, procurement pricing formulas, and hardware integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration saved successfully! (Demo environment state)</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('Org')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Org' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Organization & Licenses
        </button>
        <button
          onClick={() => setActiveTab('Facilities')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Facilities' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Operating Facilities
        </button>
        <button
          onClick={() => setActiveTab('Pricing')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Pricing' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Procurement Pricing Rules
        </button>
        <button
          onClick={() => setActiveTab('Quality')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Quality' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Quality Rules & Specs
        </button>
        <button
          onClick={() => setActiveTab('Integrations')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Integrations' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Hardware & IoT Integrations
        </button>
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'Org' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#f0f6fc]">Enterprise Legal Entity</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Dairy Enterprise Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">FSSAI Central Dairy License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">GST Identification Number (GSTIN)</label>
              <input
                type="text"
                defaultValue="24AAACC1209B1ZK"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Registered Dairy Head Office</label>
              <input
                type="text"
                defaultValue="Plant Yard 4, GIDC Industrial Estate, Anand, Gujarat - 388001"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facilities */}
      {activeTab === 'Facilities' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#f0f6fc]">Registered Operating Facilities & Plants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
              <div className="text-sm font-bold text-[#58a6ff] font-sans">Main Dairy Processing Plant</div>
              <div className="text-[#8b949e]">GIDC Anand · HTST Line 1 & 2 · 15,000 LPH Capacity</div>
              <div className="text-[#3fb950] font-sans mt-1">Status: Active Commercial Operations</div>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
              <div className="text-sm font-bold text-[#58a6ff] font-sans">Anand Collection Centre 01</div>
              <div className="text-[#8b949e]">Station Road Hub · 12 Village Pourers Enrolled</div>
              <div className="text-[#3fb950] font-sans mt-1">Status: Online Weighbridge & Milk Analyzer</div>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
              <div className="text-sm font-bold text-[#58a6ff] font-sans">Baroda Bulk Chilling Unit</div>
              <div className="text-[#8b949e]">Alkapuri Depot · 5,000 L Silo · Chilling to 3.8°C</div>
              <div className="text-[#3fb950] font-sans mt-1">Status: Direct Farm Inward Active</div>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-1">
              <div className="text-sm font-bold text-[#58a6ff] font-sans">Mehsana Procurement Hub</div>
              <div className="text-[#8b949e]">Northern Cattle Cluster · Fodder Silage Bank</div>
              <div className="text-[#3fb950] font-sans mt-1">Status: Operational Network</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Rules */}
      {activeTab === 'Pricing' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#f0f6fc]">Two-Axis Procurement Pricing Formula</h2>
          <p className="text-[#8b949e]">
            Formula: Rate = Base Rate + (Fat - 4.0) × Fat Factor + (SNF - 8.5) × SNF Factor
          </p>

          <div className="grid grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-[#8b949e] mb-1 font-sans">Base Rate (₹ / Litre)</label>
              <input
                type="number"
                step="0.1"
                value={baseMilkRate}
                onChange={(e) => setBaseMilkRate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] font-bold"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-sans">Fat Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={fatMultiplier}
                onChange={(e) => setFatMultiplier(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] font-bold"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-sans">SNF Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={snfMultiplier}
                onChange={(e) => setSnfMultiplier(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-[#f0f6fc] font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-[#0d1117] rounded border border-[#30363d] font-mono text-[#c9d1d9]">
            Example Sample: Fat 4.5%, SNF 8.7% &rarr; Rate = ₹34.50 + (0.5 &times; 4.50) + (0.2 &times; 2.50) = <strong className="text-[#3fb950]">₹37.25 / Litre</strong>
          </div>
        </div>
      )}

      {/* Tab 4: Quality Rules */}
      {activeTab === 'Quality' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-3xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#f0f6fc]">Quality Tolerance & Rejection Thresholds</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Max Arrival Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={maxArrivalTemp}
                onChange={(e) => setMaxArrivalTemp(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Minimum Acceptable Fat %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="3.2"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Minimum Acceptable SNF %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="7.8"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-[#8b949e] mb-1 font-medium">Adulteration Action Protocol</label>
              <input
                type="text"
                disabled
                defaultValue="Immediate Weighbridge Rejection (Zero Tolerance)"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f85149]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hardware Integrations */}
      {activeTab === 'Integrations' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#f0f6fc]">Connected Hardware, IoT & Financial Gateways</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f0f6fc]">LactoScan Milk Analyzers</span>
                <span className="text-[#3fb950] font-mono text-[10px]">CONNECTED</span>
              </div>
              <p className="text-[#8b949e]">Auto RS-232 serial telemetry pulling Fat, SNF, Water & Density directly into collection desk.</p>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f0f6fc]">Digital Weighbridge Scales</span>
                <span className="text-[#3fb950] font-mono text-[10px]">CONNECTED</span>
              </div>
              <p className="text-[#8b949e]">Zero-manual-entry tare and gross weight capture on dairy inward unloading docks.</p>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-lg border border-[#30363d] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f0f6fc]">Direct Bank IMPS API</span>
                <span className="text-[#3fb950] font-mono text-[10px]">ACTIVE</span>
              </div>
              <p className="text-[#8b949e]">Real-time instantaneous payment dispatch to enrolled producer accounts upon QC clearance.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
