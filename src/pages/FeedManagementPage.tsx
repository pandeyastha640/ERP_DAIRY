import React, { useState } from 'react';
import { FeedItem, FeedFormula } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  Wheat,
  Plus,
  ShoppingCart,
  Calculator,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface FeedManagementPageProps {
  feeds: FeedItem[];
  formulas: FeedFormula[];
  onAddPurchase: (item: { feedId: string; quantityKg: number; costPerKg: number }) => void;
  onRecordConsumption: (item: { feedId: string; quantityKg: number }) => void;
}

export const FeedManagementPage: React.FC<FeedManagementPageProps> = ({
  feeds,
  formulas,
  onAddPurchase,
  onRecordConsumption,
}) => {
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Formulation'>('Inventory');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Purchase Modal Form State
  const [selectedFeedId, setSelectedFeedId] = useState(feeds[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState('3000');
  const [purchaseRate, setPurchaseRate] = useState('28.5');

  // Consumption Modal Form State
  const [consumeFeedId, setConsumeFeedId] = useState(feeds[0]?.id || '');
  const [consumeQty, setConsumeQty] = useState('800');

  // Formulation Calculator State
  const [formGroup, setFormGroup] = useState<'High Yield Milking' | 'Mid Lactation' | 'Dry & Pregnant'>('High Yield Milking');
  const [calcAnimals, setCalcAnimals] = useState<number>(28);
  const [calcGreenFodder, setCalcGreenFodder] = useState<number>(22.0);
  const [calcDryFodder, setCalcDryFodder] = useState<number>(6.0);
  const [calcConcentrate, setCalcConcentrate] = useState<number>(6.5);
  const [calcMineral, setCalcMineral] = useState<number>(0.15);
  const [expectedYieldPerCow, setExpectedYieldPerCow] = useState<number>(16.0);

  // Formulated Costs
  const costGreen = calcGreenFodder * 3.2; // ₹3.2/kg
  const costDry = calcDryFodder * 6.8; // ₹6.8/kg
  const costConc = calcConcentrate * 28.5; // ₹28.5/kg
  const costMin = calcMineral * 115.0; // ₹115/kg

  const dailyCostPerAnimal = costGreen + costDry + costConc + costMin;
  const dailyFeedKgPerAnimal = calcGreenFodder + calcDryFodder + calcConcentrate + calcMineral;
  const totalDailyCost = dailyCostPerAnimal * calcAnimals;
  const totalDailyKg = dailyFeedKgPerAnimal * calcAnimals;
  const feedCostPerLitre = expectedYieldPerCow > 0 ? (dailyCostPerAnimal / expectedYieldPerCow).toFixed(2) : '0';

  // Metrics
  const totalStockKg = feeds.reduce((acc, f) => acc + f.closingStockKg, 0);
  const totalConsumedKg = feeds.reduce((acc, f) => acc + f.consumedKg, 0);
  const totalStockValue = feeds.reduce((acc, f) => acc + f.stockValue, 0);
  const minDaysRemaining = Math.min(...feeds.map((f) => f.daysRemaining));

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPurchase({
      feedId: selectedFeedId,
      quantityKg: parseFloat(purchaseQty) || 0,
      costPerKg: parseFloat(purchaseRate) || 0,
    });
    setIsPurchaseModalOpen(false);
  };

  const handleSaveConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordConsumption({
      feedId: consumeFeedId,
      quantityKg: parseFloat(consumeQty) || 0,
    });
    setIsConsumptionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Feed & Nutrition Management
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Ration balancing, dry matter intake, feed procurement and cost-per-litre optimization for cattle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#388bfd]" />
            <span>Add Purchase</span>
          </button>
          <button
            onClick={() => setIsConsumptionModalOpen(true)}
            className="px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Wheat className="w-3.5 h-3.5 text-[#e3b341]" />
            <span>Record Consumption</span>
          </button>
          <button
            onClick={() => setActiveTab('Formulation')}
            className="px-3 py-1.5 bg-[#388bfd] hover:bg-[#4c97ff] text-xs font-semibold text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Feed Formula</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          label="Total Feed Stock"
          value={`${(totalStockKg / 1000).toFixed(1)} MT`}
          unit=""
          trend="neutral"
          changeText={`${totalStockKg.toLocaleString()} kg`}
        />
        <MetricCard
          label="Consumed Today"
          value={`${totalConsumedKg.toLocaleString()} kg`}
          unit=""
          trend="neutral"
          changeText="52 Cattle intake"
        />
        <MetricCard
          label="Feed Cost Today"
          value="₹13,271"
          unit=""
          trend="up"
          changePct={1.8}
          changeText="₹255 / cow / day"
        />
        <MetricCard
          label="Stock Value"
          value={`₹${(totalStockValue / 1000).toFixed(1)}k`}
          unit=""
          trend="neutral"
          changeText="Warehouse assets"
        />
        <MetricCard
          label="Stock Runway"
          value={`${minDaysRemaining} Days`}
          unit=""
          trend="down"
          isGoodWhenUp={true}
          changeText="Alert: Pellets low"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('Inventory')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Inventory' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Feed Inventory & Stock
        </button>
        <button
          onClick={() => setActiveTab('Formulation')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'Formulation' ? 'bg-[#388bfd] text-white' : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          Formulation & Cost Calculator
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Feed Inventory Ledger</h3>
              <span className="text-xs font-mono text-[#8b949e]">Units in Kilograms (Kg)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0d1117] text-[#8b949e] font-mono border-b border-[#30363d]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Feed Item</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium">Opening Stock</th>
                    <th className="px-4 py-2.5 font-medium">Purchased</th>
                    <th className="px-4 py-2.5 font-medium">Consumed</th>
                    <th className="px-4 py-2.5 font-medium">Closing Stock</th>
                    <th className="px-4 py-2.5 font-medium">Unit Cost</th>
                    <th className="px-4 py-2.5 font-medium">Stock Value</th>
                    <th className="px-4 py-2.5 font-medium">Runway</th>
                    <th className="px-4 py-2.5 font-medium">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d] text-[#c9d1d9] font-mono tabular-nums">
                  {feeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-[#1f2937]/30 transition-colors">
                      <td className="px-4 py-3 font-sans font-semibold text-[#f0f6fc]">
                        {feed.name}
                        {feed.daysRemaining <= 4.0 && (
                          <span className="ml-2 text-[10px] text-[#f85149] font-mono bg-[#f85149]/15 px-1.5 py-0.2 rounded border border-[#f85149]/30">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sans text-[#8b949e]">{feed.type}</td>
                      <td className="px-4 py-3">{feed.openingStockKg.toLocaleString()} kg</td>
                      <td className="px-4 py-3 text-[#3fb950]">
                        {feed.purchasedKg > 0 ? `+${feed.purchasedKg.toLocaleString()} kg` : '-'}
                      </td>
                      <td className="px-4 py-3 text-[#f0883e]">-{feed.consumedKg.toLocaleString()} kg</td>
                      <td className="px-4 py-3 font-bold text-[#f0f6fc]">{feed.closingStockKg.toLocaleString()} kg</td>
                      <td className="px-4 py-3">₹{feed.unitCostPerKg.toFixed(2)}/kg</td>
                      <td className="px-4 py-3 text-[#58a6ff]">₹{feed.stockValue.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold">
                        <span className={feed.daysRemaining <= 4.0 ? 'text-[#f85149]' : 'text-[#3fb950]'}>
                          {feed.daysRemaining} days
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-[#8b949e] text-[11px]">{feed.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORMULATION CALCULATOR TAB */}
      {activeTab === 'Formulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Parameters */}
          <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">Ration Balancing Formulation</h3>
                <p className="text-xs text-[#8b949e]">Adjust dietary dry matter ratios per animal to observe cost impact</p>
              </div>
              <span className="text-xs font-mono text-[#388bfd] font-semibold">{formGroup}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">Cattle Production Group</label>
                <select
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value as any)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] outline-none"
                >
                  <option value="High Yield Milking">High Yield Milking Herd</option>
                  <option value="Mid Lactation">Mid Lactation / Maintenance</option>
                  <option value="Dry & Pregnant">Dry & Late Pregnant Cows</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1">Number of Animals in Group</label>
                <input
                  type="number"
                  value={calcAnimals}
                  onChange={(e) => setCalcAnimals(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
                />
              </div>
            </div>

            {/* Component Sliders/Inputs */}
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Green Maize Fodder (Hybrid Chari)</div>
                  <div className="text-[11px] text-[#8b949e]">Unit rate: ₹3.20/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcGreenFodder}
                    onChange={(e) => setCalcGreenFodder(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs font-mono text-center text-[#f0f6fc]"
                  />
                  <span className="text-xs text-[#8b949e]">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-[#58a6ff] w-16 text-right">₹{costGreen.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Wheat Straw (Dry Bhusa / Turi)</div>
                  <div className="text-[11px] text-[#8b949e]">Unit rate: ₹6.80/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcDryFodder}
                    onChange={(e) => setCalcDryFodder(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs font-mono text-center text-[#f0f6fc]"
                  />
                  <span className="text-xs text-[#8b949e]">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-[#58a6ff] w-16 text-right">₹{costDry.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Milking Concentrate Pellet 22% CP</div>
                  <div className="text-[11px] text-[#8b949e]">Unit rate: ₹28.50/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcConcentrate}
                    onChange={(e) => setCalcConcentrate(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs font-mono text-center text-[#f0f6fc]"
                  />
                  <span className="text-xs text-[#8b949e]">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-[#58a6ff] w-16 text-right">₹{costConc.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#f0f6fc]">Chelated Mineral Mixture & Vitamins</div>
                  <div className="text-[11px] text-[#8b949e]">Unit rate: ₹115.00/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    value={calcMineral}
                    onChange={(e) => setCalcMineral(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs font-mono text-center text-[#f0f6fc]"
                  />
                  <span className="text-xs text-[#8b949e]">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-[#58a6ff] w-16 text-right">₹{costMin.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Expected Avg Milk Yield per Cow (Litres/day)</label>
              <input
                type="number"
                step="0.5"
                value={expectedYieldPerCow}
                onChange={(e) => setExpectedYieldPerCow(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
              />
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">Ration Economic Summary</h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                  <div className="text-[11px] text-[#8b949e] font-sans">Daily Intake / Animal</div>
                  <div className="text-lg font-bold text-[#f0f6fc] mt-1">{dailyFeedKgPerAnimal.toFixed(2)} kg</div>
                  <div className="text-[10px] text-[#8b949e] font-sans">Dry matter verified</div>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d]">
                  <div className="text-[11px] text-[#8b949e] font-sans">Daily Cost / Animal</div>
                  <div className="text-lg font-bold text-[#f0883e] mt-1">₹{dailyCostPerAnimal.toFixed(2)}</div>
                  <div className="text-[10px] text-[#8b949e] font-sans">₹{totalDailyCost.toFixed(0)} for group</div>
                </div>

                <div className="p-4 bg-[#238636]/15 rounded-lg border border-[#238636]/40">
                  <div className="text-xs font-semibold text-[#3fb950] font-sans">Estimated Feed Cost / Litre</div>
                  <div className="text-2xl font-bold text-[#3fb950] mt-1 font-mono">
                    ₹{feedCostPerLitre} / L
                  </div>
                  <div className="text-[11px] text-[#c9d1d9] font-sans mt-1">
                    At ₹38/L milk procurement parity, provides ₹{(38 - parseFloat(feedCostPerLitre)).toFixed(2)} gross contribution margin per litre.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Feed Formula for ${formGroup} updated with Feed Cost: ₹${feedCostPerLitre}/L.`);
              }}
              className="w-full py-2.5 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-bold transition-colors"
            >
              Apply Ration to {formGroup}
            </button>
          </div>
        </div>
      )}

      {/* ADD PURCHASE MODAL */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Record Feed Purchase Inward"
        subtitle="Inward batch entry to replenish fodder or concentrate stock"
        maxWidth="md"
      >
        <form onSubmit={handleSavePurchase} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Select Feed Product</label>
            <select
              value={selectedFeedId}
              onChange={(e) => setSelectedFeedId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] outline-none"
            >
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Current: {f.closingStockKg} kg)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Quantity (Kg)</label>
              <input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Unit Rate (₹/kg)</label>
              <input
                type="number"
                step="0.1"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded-lg text-xs font-semibold"
            >
              Save Inward Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD CONSUMPTION MODAL */}
      <Modal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        title="Record Herd Feed Consumption"
        subtitle="Log quantity deducted from feed store to cow sheds"
        maxWidth="md"
      >
        <form onSubmit={handleSaveConsumption} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Feed Item</label>
            <select
              value={consumeFeedId}
              onChange={(e) => setConsumeFeedId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] outline-none"
            >
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Stock: {f.closingStockKg} kg)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Consumed Today (Kg)</label>
            <input
              type="number"
              value={consumeQty}
              onChange={(e) => setConsumeQty(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs font-mono text-[#f0f6fc] outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsConsumptionModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded-lg text-xs font-semibold"
            >
              Deduct Consumption
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
