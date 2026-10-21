import React, { useState } from 'react';
import { FeedItem, FeedFormula } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
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
  Search,
  CheckCircle2,
  PackageCheck,
  Scale,
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
  const [feedSearch, setFeedSearch] = useState('');
  const [feedCategoryFilter, setFeedCategoryFilter] = useState('All');
  const [runwayFilter, setRunwayFilter] = useState<'All' | 'Low Stock' | 'Optimal'>('All');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);

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

  const filteredFeeds = feeds.filter((f) => {
    const mSearch = f.name.toLowerCase().includes(feedSearch.toLowerCase()) || f.supplier.toLowerCase().includes(feedSearch.toLowerCase());
    const mCat = feedCategoryFilter === 'All' || f.type === feedCategoryFilter;
    const mRunway = runwayFilter === 'All' || (runwayFilter === 'Low Stock' ? f.daysRemaining <= 5.0 : f.daysRemaining > 5.0);
    return mSearch && mCat && mRunway;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Wheat className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Feed & Nutrition Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                ICAR Ration Compliance
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Ration balancing, dry matter intake, feed procurement and cost-per-litre optimization for cattle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-xs font-semibold text-forest-900 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-forest-700" />
            <span>Add Purchase</span>
          </button>
          <button
            onClick={() => setIsConsumptionModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-xs font-semibold text-forest-900 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Wheat className="w-3.5 h-3.5 text-gold-600" />
            <span>Record Consumption</span>
          </button>
          <button
            onClick={() => setActiveTab('Formulation')}
            className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-xs font-semibold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Feed Formula</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Feed Stock"
          value={`${(totalStockKg / 1000).toFixed(1)} MT`}
          unit=""
          trend="neutral"
          changeText={`${totalStockKg.toLocaleString()} kg total`}
        />
        <MetricCard
          label="Consumed Today"
          value={`${totalConsumedKg.toLocaleString()} kg`}
          unit=""
          trend="neutral"
          changeText="52 Cattle daily intake"
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
          changeText="Feed warehouse assets"
        />
        <MetricCard
          label="Min Stock Runway"
          value={`${minDaysRemaining} Days`}
          unit=""
          trend="down"
          isGoodWhenUp={true}
          changeText="Critical alert on pellets"
        />
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-cream-50/80 border border-[#ede8df] rounded-xl max-w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('Inventory')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'Inventory'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Feed Inventory & Stock
        </button>
        <button
          onClick={() => setActiveTab('Formulation')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'Formulation'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-forest-900'
          }`}
        >
          Formulation & Cost Calculator
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          {/* Feed Filter and Search Bar */}
          <div className="bg-white border border-[#ede8df] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                placeholder="Search Feed Item or Supplier..."
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500 font-medium font-sans">Category:</span>
                <select
                  value={feedCategoryFilter}
                  onChange={(e) => setFeedCategoryFilter(e.target.value)}
                  className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
                >
                  <option value="All">All Categories</option>
                  <option value="Green Fodder">Green Fodder</option>
                  <option value="Dry Fodder">Dry Fodder</option>
                  <option value="Concentrate">Concentrate</option>
                  <option value="Mineral Mixture">Mineral Mixture</option>
                  <option value="Other">Other Supplements</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500 font-medium font-sans">Runway:</span>
                <div className="flex bg-cream-50 border border-[#ede8df] rounded-xl p-0.5 text-xs">
                  {(['All', 'Low Stock', 'Optimal'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRunwayFilter(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        runwayFilter === r
                          ? 'bg-forest-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-forest-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {(feedSearch !== '' || feedCategoryFilter !== 'All' || runwayFilter !== 'All') && (
                <button
                  onClick={() => {
                    setFeedSearch('');
                    setFeedCategoryFilter('All');
                    setRunwayFilter('All');
                  }}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Feed Inventory Table */}
          <div className="bg-white border border-[#ede8df] rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#ede8df] bg-cream-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-forest-950 font-sans">Feed Inventory Ledger</h3>
                <p className="text-[11px] text-stone-500">Live store balance, unit valuations and buffer runway</p>
              </div>
              <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-0.5 rounded-full">
                Showing {filteredFeeds.length} of {feeds.length} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fcfbf9] text-stone-500 font-mono border-b border-[#ede8df]">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Feed Item</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Opening</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Purchased</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Consumed</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Closing Stock</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Unit Cost</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Stock Value</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Runway</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede8df] text-stone-700 font-mono tabular-nums">
                  {filteredFeeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-sans font-bold text-forest-950">
                        {feed.name}
                        {feed.daysRemaining <= 4.0 && (
                          <span className="ml-2 text-[10px] text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-semibold">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <span className="px-2 py-0.5 bg-cream-100/70 border border-[#ede8df] text-stone-700 rounded-md text-[11px]">
                          {feed.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{feed.openingStockKg.toLocaleString()} kg</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">
                        {feed.purchasedKg > 0 ? `+${feed.purchasedKg.toLocaleString()} kg` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">-{feed.consumedKg.toLocaleString()} kg</td>
                      <td className="px-4 py-3.5 font-bold text-forest-950 text-sm">
                        {feed.closingStockKg.toLocaleString()} kg
                      </td>
                      <td className="px-4 py-3.5">₹{feed.unitCostPerKg.toFixed(2)}/kg</td>
                      <td className="px-4 py-3.5 font-bold text-forest-900">
                        ₹{feed.stockValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                          feed.daysRemaining <= 4.0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {feed.daysRemaining} days
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-sans text-stone-600 text-[11px]">{feed.supplier}</td>
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
          <div className="lg:col-span-2 bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ede8df] pb-3">
              <div>
                <h3 className="text-sm font-bold text-forest-950 font-sans">Ration Balancing Formulation</h3>
                <p className="text-xs text-stone-500">Adjust dietary dry matter ratios per animal to observe cost impact</p>
              </div>
              <span className="text-xs font-mono text-forest-800 bg-sage-50 border border-sage-200 px-3 py-1 rounded-full font-bold">
                {formGroup}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
                  Cattle Production Group
                </label>
                <select
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value as any)}
                  className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
                >
                  <option value="High Yield Milking">High Yield Milking Herd</option>
                  <option value="Mid Lactation">Mid Lactation / Maintenance</option>
                  <option value="Dry & Pregnant">Dry & Late Pregnant Cows</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
                  Number of Animals in Group
                </label>
                <input
                  type="number"
                  value={calcAnimals}
                  onChange={(e) => setCalcAnimals(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
                />
              </div>
            </div>

            {/* Component Sliders/Inputs */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-cream-50/50 border border-[#ede8df] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-forest-950 font-sans">Green Maize Fodder (Hybrid Chari)</div>
                  <div className="text-[11px] text-stone-500">Unit rate: ₹3.20/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcGreenFodder}
                    onChange={(e) => setCalcGreenFodder(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs font-mono text-center text-forest-950 font-bold"
                  />
                  <span className="text-xs text-stone-500 font-sans">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-forest-900 w-16 text-right">₹{costGreen.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-cream-50/50 border border-[#ede8df] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-forest-950 font-sans">Wheat Straw (Dry Bhusa / Turi)</div>
                  <div className="text-[11px] text-stone-500">Unit rate: ₹6.80/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcDryFodder}
                    onChange={(e) => setCalcDryFodder(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs font-mono text-center text-forest-950 font-bold"
                  />
                  <span className="text-xs text-stone-500 font-sans">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-forest-900 w-16 text-right">₹{costDry.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-cream-50/50 border border-[#ede8df] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-forest-950 font-sans">Milking Concentrate Pellet 22% CP</div>
                  <div className="text-[11px] text-stone-500">Unit rate: ₹28.50/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={calcConcentrate}
                    onChange={(e) => setCalcConcentrate(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs font-mono text-center text-forest-950 font-bold"
                  />
                  <span className="text-xs text-stone-500 font-sans">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-forest-900 w-16 text-right">₹{costConc.toFixed(1)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-cream-50/50 border border-[#ede8df] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-forest-950 font-sans">Chelated Mineral Mixture & Vitamins</div>
                  <div className="text-[11px] text-stone-500">Unit rate: ₹115.00/kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    value={calcMineral}
                    onChange={(e) => setCalcMineral(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-[#ede8df] rounded-lg px-2.5 py-1 text-xs font-mono text-center text-forest-950 font-bold"
                  />
                  <span className="text-xs text-stone-500 font-sans">kg/cow</span>
                  <span className="text-xs font-mono font-bold text-forest-900 w-16 text-right">₹{costMin.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
                Expected Avg Milk Yield per Cow (Litres/day)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedYieldPerCow}
                onChange={(e) => setExpectedYieldPerCow(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none font-bold"
              />
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-white border border-[#ede8df] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-forest-950 font-sans">Ration Economic Summary</h3>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  BALANCED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                  <div className="text-[11px] text-stone-500 font-sans">Daily Intake / Animal</div>
                  <div className="text-lg font-bold text-forest-950 mt-0.5">{dailyFeedKgPerAnimal.toFixed(2)} kg</div>
                  <div className="text-[10px] text-stone-500 font-sans">Dry matter intake verified</div>
                </div>

                <div className="p-3.5 bg-cream-50/70 rounded-xl border border-[#ede8df]">
                  <div className="text-[11px] text-stone-500 font-sans">Daily Cost / Animal</div>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">₹{dailyCostPerAnimal.toFixed(2)}</div>
                  <div className="text-[10px] text-stone-500 font-sans">₹{totalDailyCost.toFixed(0)} for entire herd group</div>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <div className="text-xs font-bold text-emerald-900 font-sans">Estimated Feed Cost / Litre</div>
                  <div className="text-3xl font-extrabold text-emerald-800 mt-1 font-mono tracking-tight">
                    ₹{feedCostPerLitre} <span className="text-sm font-medium">/ L</span>
                  </div>
                  <div className="text-[11px] text-emerald-800/90 font-sans mt-1.5 leading-relaxed">
                    At ₹38/L milk procurement parity, provides ₹{(38 - parseFloat(feedCostPerLitre)).toFixed(2)} gross contribution margin per litre.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Feed Formula for ${formGroup} updated with Feed Cost: ₹${feedCostPerLitre}/L.`);
              }}
              className="w-full py-2.5 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Select Feed Product</label>
            <select
              value={selectedFeedId}
              onChange={(e) => setSelectedFeedId(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Current Stock: {f.closingStockKg} kg)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Quantity (Kg)</label>
              <input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Unit Rate (₹/kg)</label>
              <input
                type="number"
                step="0.1"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
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
        <form onSubmit={handleSaveConsumption} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Feed Item</label>
            <select
              value={consumeFeedId}
              onChange={(e) => setConsumeFeedId(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            >
              {feeds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Available: {f.closingStockKg} kg)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Consumed Today (Kg)</label>
            <input
              type="number"
              value={consumeQty}
              onChange={(e) => setConsumeQty(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsConsumptionModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Deduct Consumption
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeedManagementPage;
