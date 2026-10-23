import React, { useState, useEffect } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { IS_STATIC_DEMO_MODE } from '../config/demo';
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
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Settings className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                System & Enterprise Settings
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Central ERP Config
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Organizational identity, quality control thresholds, procurement pricing formulas, and hardware integrations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-cream-50 hover:bg-cream-100 text-stone-700 border border-[#ede8df] rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset system to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Configuration saved successfully! (Demo environment state)</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-cream-50/80 border border-[#ede8df] rounded-xl max-w-fit overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('Org')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'Org' ? 'bg-forest-900 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Organization & Licenses
        </button>
        <button
          onClick={() => setActiveTab('Facilities')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'Facilities' ? 'bg-forest-900 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Operating Facilities
        </button>
        <button
          onClick={() => setActiveTab('Pricing')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'Pricing' ? 'bg-forest-900 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Procurement Pricing Rules
        </button>
        <button
          onClick={() => setActiveTab('Quality')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'Quality' ? 'bg-forest-900 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Quality Rules & Specs
        </button>
        <button
          onClick={() => setActiveTab('Integrations')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'Integrations' ? 'bg-forest-900 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Hardware & IoT Integrations
        </button>
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'Org' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-6 max-w-3xl space-y-4 text-xs shadow-xs font-sans">
          <div className="border-b border-[#ede8df] pb-3">
            <h2 className="text-sm font-bold text-forest-950">{IS_STATIC_DEMO_MODE ? 'Sample Cooperative Settings' : 'Enterprise Legal Entity'}</h2>
            <p className="text-[11px] text-stone-500">{IS_STATIC_DEMO_MODE ? 'Sample settings only. No real registrations are included.' : 'Master corporate registration and food safety licenses'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Dairy Enterprise Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">FSSAI Central Dairy License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">GST Identification Number (GSTIN)</label>
              <input
                type="text"
                defaultValue={settings.gstin}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Registered Dairy Head Office</label>
              <input
                type="text"
                defaultValue={settings.headOffice}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facilities */}
      {activeTab === 'Facilities' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-[#ede8df] pb-3">
            <h2 className="text-sm font-bold text-forest-950 font-sans">Registered Operating Facilities & Plants</h2>
            <p className="text-[11px] text-stone-500 font-sans">Plant locations, chilling centers and milk reception points</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-1.5 shadow-2xs">
              <div className="text-sm font-bold text-forest-950 font-sans">Main Dairy Processing Plant</div>
              <div className="text-stone-500">GIDC Anand &bull; HTST Line 1 & 2 &bull; 15,000 LPH Capacity</div>
              <div className="text-emerald-800 font-sans font-bold mt-1 text-[11px]">Status: Active Commercial Operations</div>
            </div>
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-1.5 shadow-2xs">
              <div className="text-sm font-bold text-forest-950 font-sans">Anand Collection Centre 01</div>
              <div className="text-stone-500">Station Road Hub &bull; 12 Village Pourers Enrolled</div>
              <div className="text-emerald-800 font-sans font-bold mt-1 text-[11px]">Status: Online Weighbridge & Milk Analyzer</div>
            </div>
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-1.5 shadow-2xs">
              <div className="text-sm font-bold text-forest-950 font-sans">Baroda Bulk Chilling Unit</div>
              <div className="text-stone-500">Alkapuri Depot &bull; 5,000 L Silo &bull; Chilling to 3.8°C</div>
              <div className="text-emerald-800 font-sans font-bold mt-1 text-[11px]">Status: Direct Farm Inward Active</div>
            </div>
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-1.5 shadow-2xs">
              <div className="text-sm font-bold text-forest-950 font-sans">Mehsana Procurement Hub</div>
              <div className="text-stone-500">Northern Cattle Cluster &bull; Fodder Silage Bank</div>
              <div className="text-emerald-800 font-sans font-bold mt-1 text-[11px]">Status: Operational Network</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Rules */}
      {activeTab === 'Pricing' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-6 max-w-3xl space-y-4 text-xs shadow-xs font-sans">
          <div className="border-b border-[#ede8df] pb-3">
            <h2 className="text-sm font-bold text-forest-950">Two-Axis Procurement Pricing Formula</h2>
            <p className="text-stone-500 mt-0.5">
              Formula: Rate = Base Rate + (Fat - 4.0) &times; Fat Factor + (SNF - 8.5) &times; SNF Factor
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-stone-700 mb-1 font-sans font-semibold">Base Rate (₹ / Litre)</label>
              <input
                type="number"
                step="0.1"
                value={baseMilkRate}
                onChange={(e) => setBaseMilkRate(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-sans font-semibold">Fat Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={fatMultiplier}
                onChange={(e) => setFatMultiplier(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-sans font-semibold">SNF Multiplier Factor</label>
              <input
                type="number"
                step="0.1"
                value={snfMultiplier}
                onChange={(e) => setSnfMultiplier(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df] font-mono text-stone-800">
            Example Sample: Fat 4.5%, SNF 8.7% &rarr; Rate = ₹34.50 + (0.5 &times; 4.50) + (0.2 &times; 2.50) = <strong className="text-emerald-800 font-extrabold text-sm">₹37.25 / Litre</strong>
          </div>
        </div>
      )}

      {/* Tab 4: Quality Rules */}
      {activeTab === 'Quality' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-6 max-w-3xl space-y-4 text-xs shadow-xs font-sans">
          <div className="border-b border-[#ede8df] pb-3">
            <h2 className="text-sm font-bold text-forest-950">Quality Tolerance & Rejection Thresholds</h2>
            <p className="text-[11px] text-stone-500">Automatic rejection protocols applied at collection weighbridge desks</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Max Arrival Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={maxArrivalTemp}
                onChange={(e) => setMaxArrivalTemp(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Minimum Acceptable Fat %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="3.2"
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Minimum Acceptable SNF %</label>
              <input
                type="number"
                step="0.1"
                defaultValue="7.8"
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950"
              />
            </div>
            <div>
              <label className="block text-stone-700 mb-1 font-semibold">Adulteration Action Protocol</label>
              <input
                type="text"
                disabled
                defaultValue="Immediate Weighbridge Rejection (Zero Tolerance)"
                className="w-full bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs font-mono text-rose-800 font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hardware Integrations */}
      {activeTab === 'Integrations' && (
        <div className="bg-white border border-[#ede8df] rounded-xl p-6 space-y-4 text-xs shadow-xs font-sans">
          <div className="border-b border-[#ede8df] pb-3">
            <h2 className="text-sm font-bold text-forest-950">{IS_STATIC_DEMO_MODE ? 'Hardware and Payment Demo Status' : 'Hardware, IoT & Payment Integrations'}</h2>
            <p className="text-[11px] text-stone-500">{IS_STATIC_DEMO_MODE ? 'No hardware or financial gateway is connected in the browser demo.' : 'Configured integrations for milk analyzers, scales, and payment services'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest-950">LactoScan Milk Analyzers</span>
                <span className="text-amber-800 font-mono text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">{IS_STATIC_DEMO_MODE ? 'SIMULATED' : 'CONNECTED'}</span>
              </div>
              <p className="text-stone-600 text-xs">{IS_STATIC_DEMO_MODE ? 'A sample analyzer interface is available; physical serial hardware is disabled.' : 'Configured serial telemetry for analyzer readings in the collection desk.'}</p>
            </div>
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest-950">Digital Weighbridge Scales</span>
                <span className="text-amber-800 font-mono text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">{IS_STATIC_DEMO_MODE ? 'NOT CONNECTED' : 'CONNECTED'}</span>
              </div>
              <p className="text-stone-600 text-xs">{IS_STATIC_DEMO_MODE ? 'Scale integration is unavailable in the browser-only demo.' : 'Configured tare and gross weight capture for dairy inward unloading.'}</p>
            </div>
            <div className="p-4 bg-cream-50/60 rounded-xl border border-[#ede8df] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest-950">Direct Bank IMPS API</span>
                <span className="text-amber-800 font-mono text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">{IS_STATIC_DEMO_MODE ? 'UNAVAILABLE' : 'ACTIVE'}</span>
              </div>
              <p className="text-stone-600 text-xs">{IS_STATIC_DEMO_MODE ? 'Banking is unavailable in this static demo. Payment previews do not move funds.' : 'Payment integration is unavailable until configured and authorized.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
