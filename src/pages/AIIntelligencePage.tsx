import React, { useState } from 'react';
import { useDairyERP } from '../context/DairyERPContext';
import { api } from '../services/api';
import { Modal } from '../components/common/Modal';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Loader2,
  Cpu,
} from 'lucide-react';

export const AIIntelligencePage: React.FC = () => {
  const { insights, reconciliation, feedsList, herdEconomics, procurementSummary } = useDairyERP();

  const [activeModal, setActiveModal] = useState<'forecast' | 'feed' | 'anomaly' | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunForecast = async () => {
    setActiveModal('forecast');
    setLoading(true);
    setAiData(null);
    setErrorMsg(null);
    try {
      const res = await api.ai.forecastProcurement({ forecastHorizonHours: 72, expectedTempCelsius: 34 });
      setAiData(res.data);
    } catch (err: any) {
      setErrorMsg(`AI Forecast Notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeFeed = async () => {
    setActiveModal('feed');
    setLoading(true);
    setAiData(null);
    setErrorMsg(null);
    try {
      const res = await api.ai.optimizeFeed({ targetYieldL: 22, breed: 'Murrah Buffalo / HF Cross' });
      setAiData(res.data);
    } catch (err: any) {
      setErrorMsg(`AI Feed Notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnomalies = async () => {
    setActiveModal('anomaly');
    setLoading(true);
    setAiData(null);
    setErrorMsg(null);
    try {
      const res = await api.ai.analyzeAnomalies();
      setAiData(res.data);
    } catch (err: any) {
      setErrorMsg(`AI Anomaly Notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <BrainCircuit className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                AI Operations Intelligence & Predictive Forecasts
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Gemini 2.5 Flash + Heuristic ML
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Operational forecasting, pattern anomaly detection, ration balancing optimization, and supply-chain risk mitigation.
            </p>
          </div>
        </div>

        {/* Live AI Execution Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunForecast}
            className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sage-300" />
            <span>72h Forecast</span>
          </button>
          <button
            onClick={handleOptimizeFeed}
            className="px-3.5 py-2 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-forest-700" />
            <span>Feed Balancer</span>
          </button>
          <button
            onClick={handleAnalyzeAnomalies}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            <span>Anomaly Scan</span>
          </button>
        </div>
      </div>

      {/* Dynamic AI Insights from Context */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-forest-950 font-sans flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-700" />
            <span>Active Heuristic Anomaly Detections ({insights.length})</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">Continuous surveillance active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white border border-[#ede8df] rounded-xl p-5 space-y-3.5 flex flex-col justify-between shadow-xs hover:border-forest-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cream-100 border border-[#ede8df] text-forest-900">
                    {ins.category} &bull; {ins.id}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Confidence: {ins.confidence}%
                  </span>
                </div>
                <h3 className="text-sm font-bold text-forest-950 font-sans">{ins.title}</h3>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">{ins.insight}</p>
                <div className="mt-2.5 text-xs text-stone-500 font-sans leading-relaxed">
                  <strong className="text-stone-700 font-semibold">Impact Rationale: </strong>
                  {ins.whyItMatters}
                </div>
              </div>

              <div className="p-3 bg-sage-50/70 rounded-xl border border-sage-200 text-xs text-forest-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-forest-700" />
                <div>
                  <span className="font-bold block text-xs font-sans text-forest-900">Recommended Directive:</span>
                  <span className="text-stone-700 font-sans">{ins.recommendedAction}</span>
                  <div className="text-[11px] font-mono mt-1 font-bold text-forest-800">Expected Impact: {ins.metricImpact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Forecasting Panels */}
      <div className="pt-2 space-y-3.5">
        <h2 className="text-sm font-bold text-forest-950 font-sans">Predictive Operational Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Procurement Forecast */}
          <div className="bg-white border border-[#ede8df] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-forest-900 bg-cream-100/70 border border-[#ede8df] px-2 py-0.5 rounded font-bold text-[10px]">
                  MODEL 01
                </span>
                <span className="text-[11px] text-emerald-800 font-mono font-bold">Confidence: 94%</span>
              </div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Farmer Procurement Forecast</h3>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Projected milk inflow for tomorrow's morning and evening collection shifts based on seasonal and ambient weather models.
              </p>
            </div>
            <button
              onClick={handleRunForecast}
              className="w-full py-2.5 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <span>Run 72h Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Feed Ration Balancer */}
          <div className="bg-white border border-[#ede8df] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-forest-900 bg-cream-100/70 border border-[#ede8df] px-2 py-0.5 rounded font-bold text-[10px]">
                  MODEL 02
                </span>
                <span className="text-[11px] text-emerald-800 font-mono font-bold">Cost Optimized</span>
              </div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Least-Cost Ration Balancer</h3>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Nutritional balancing for dry matter, crude protein, and minerals to minimize feed cost per litre of milk yield.
              </p>
            </div>
            <button
              onClick={handleOptimizeFeed}
              className="w-full py-2.5 bg-white hover:bg-cream-50 border border-[#ede8df] hover:border-forest-200 text-forest-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <span>Optimize Ration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Anomaly Scan */}
          <div className="bg-white border border-[#ede8df] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px]">
                  MODEL 03
                </span>
                <span className="text-[11px] text-stone-500 font-mono font-medium">Mass & Temp Check</span>
              </div>
              <h3 className="text-sm font-bold text-forest-950 font-sans">Quality & Thermal Anomaly Scan</h3>
              <p className="text-xs text-stone-500 mt-1 font-sans">
                Automated detection of adulteration (water/fat skimming) and route tanker temperature rise above 4°C limit.
              </p>
            </div>
            <button
              onClick={handleAnalyzeAnomalies}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Scan Anomalies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI OUTPUT MODAL */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'forecast'
            ? '72-Hour Milk Procurement Forecast'
            : activeModal === 'feed'
            ? 'Least-Cost Cattle Feed Ration Optimization'
            : 'Operational Anomaly & Adulteration Scan'
        }
        subtitle="Live calculation generated from DairyOS backend AI engine"
        maxWidth="lg"
      >
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mb-3.5 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
            <p className="text-xs font-mono text-stone-500">Querying AI Intelligence Engine...</p>
          </div>
        ) : aiData ? (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-cream-50/70 border border-[#ede8df] rounded-xl flex items-center justify-between font-mono text-[11px] text-stone-700">
              <span className="font-bold text-forest-900">Model: {aiData.aiModel}</span>
              <span>Timestamp: Just now</span>
            </div>

            {/* Forecast View */}
            {activeModal === 'forecast' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-forest-950 font-mono">
                  <div className="p-3.5 bg-white border border-[#ede8df] rounded-xl shadow-2xs">
                    <span className="text-[10px] text-stone-500 font-sans">Total 72h Projected Inflow</span>
                    <div className="text-lg font-bold text-forest-950 mt-1">
                      {aiData.totalProjectedProcurementL?.toLocaleString()} Litres
                    </div>
                  </div>
                  <div className="p-3.5 bg-white border border-[#ede8df] rounded-xl shadow-2xs">
                    <span className="text-[10px] text-stone-500 font-sans">Ambient Heat Stress Factor</span>
                    <div className="text-lg font-bold text-amber-700 mt-1">
                      {aiData.heatStressFactor}
                    </div>
                  </div>
                </div>

                {aiData.forecastDailyBreakdown && (
                  <div className="border border-[#ede8df] rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#fcfbf9] text-stone-500 text-[11px] border-b border-[#ede8df]">
                        <tr>
                          <th className="p-2.5">Shift Day</th>
                          <th className="p-2.5">Morning Shift</th>
                          <th className="p-2.5">Evening Shift</th>
                          <th className="p-2.5">Fat / SNF</th>
                          <th className="p-2.5">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ede8df] text-stone-700">
                        {aiData.forecastDailyBreakdown.map((b: any, idx: number) => (
                          <tr key={idx} className="hover:bg-cream-50/60">
                            <td className="p-2.5 font-bold text-forest-950">{b.day}</td>
                            <td className="p-2.5 text-emerald-800 font-semibold">{b.morningShiftLitres} L</td>
                            <td className="p-2.5 text-forest-900 font-semibold">{b.eveningShiftLitres} L</td>
                            <td className="p-2.5">{b.avgFatPct}% / {b.avgSnfPct}%</td>
                            <td className="p-2.5 text-forest-900 font-bold">{b.confidencePct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Feed View */}
            {activeModal === 'feed' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3.5 bg-white border border-[#ede8df] rounded-xl shadow-2xs">
                    <span className="text-[10px] text-stone-500 font-sans">Optimized Daily Cost</span>
                    <div className="text-lg font-bold text-emerald-800 mt-1">
                      ₹{aiData.optimizedCostPerAnimalPerDay} / cow / day
                    </div>
                    <span className="text-[10px] text-stone-400">Baseline: ₹{aiData.currentCostPerAnimalPerDay}</span>
                  </div>
                  <div className="p-3.5 bg-white border border-[#ede8df] rounded-xl shadow-2xs">
                    <span className="text-[10px] text-stone-500 font-sans">Projected Annual Savings</span>
                    <div className="text-lg font-bold text-forest-900 mt-1">
                      {aiData.annualSavings50HeadHerd}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-sage-50 border border-sage-200 rounded-xl text-forest-950 text-xs leading-relaxed">
                  {aiData.aiSummary}
                </div>
              </div>
            )}

            {/* Anomaly View */}
            {activeModal === 'anomaly' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-cream-50/70 border border-[#ede8df] rounded-xl font-mono text-xs">
                  <span>Risk Score: <strong className="text-emerald-800 font-bold">{aiData.anomalyScore}</strong></span>
                  <span>Integrity Index: <strong className="text-forest-900 font-bold">{aiData.overallIntegrityIndex}</strong></span>
                </div>

                <div className="space-y-2">
                  {aiData.anomalies?.map((a: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-white border border-[#ede8df] rounded-xl space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-forest-950">
                        <span>{a.entity}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">{a.severity}</span>
                      </div>
                      <div className="text-stone-600 text-xs">{a.rootCauseProbability}</div>
                      <div className="text-emerald-800 text-[11px] font-semibold mt-1">Action: {a.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AIIntelligencePage;
