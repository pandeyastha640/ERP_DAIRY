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

  const handleRunForecast = async () => {
    setActiveModal('forecast');
    setLoading(true);
    setAiData(null);
    try {
      const res = await api.ai.forecastProcurement({ forecastHorizonHours: 72, expectedTempCelsius: 34 });
      setAiData(res.data);
    } catch (err: any) {
      alert(`AI Forecast error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeFeed = async () => {
    setActiveModal('feed');
    setLoading(true);
    setAiData(null);
    try {
      const res = await api.ai.optimizeFeed({ targetYieldL: 22, breed: 'Murrah Buffalo / HF Cross' });
      setAiData(res.data);
    } catch (err: any) {
      alert(`AI Feed error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnomalies = async () => {
    setActiveModal('anomaly');
    setLoading(true);
    setAiData(null);
    try {
      const res = await api.ai.analyzeAnomalies();
      setAiData(res.data);
    } catch (err: any) {
      alert(`AI Anomaly error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8b949e]">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8957e5]/20 text-[#bc8cff] border border-[#8957e5]/30">
              PREDICTIVE INTELLIGENCE ARCHITECTURE
            </span>
            <span>·</span>
            <span className="text-[#8b949e]">Google Gemini 2.5 Flash & Heuristic ML</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] mt-1">
            AI Operations Intelligence & Predictive Forecasts
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Operational forecasting, pattern anomaly detection, ration balancing optimization, and supply-chain risk mitigation.
          </p>
        </div>

        {/* Live AI Execution Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunForecast}
            className="px-3 py-1.5 bg-[#8957e5] hover:bg-[#9a6ce8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>72h Forecast</span>
          </button>
          <button
            onClick={handleOptimizeFeed}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Feed Balancer</span>
          </button>
          <button
            onClick={handleAnalyzeAnomalies}
            className="px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[#f85149] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Anomaly Scan</span>
          </button>
        </div>
      </div>

      {/* Dynamic AI Insights from Context */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#bc8cff]" />
          <span>Active Heuristic Anomaly Detections ({insights.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8957e5]/15 text-[#bc8cff]">
                    {ins.category} · {ins.id}
                  </span>
                  <span className="text-[10px] font-mono text-[#3fb950]">Confidence: {ins.confidence}%</span>
                </div>
                <h3 className="text-xs font-bold text-[#f0f6fc]">{ins.title}</h3>
                <p className="text-xs text-[#c9d1d9] mt-1">{ins.insight}</p>
                <div className="mt-2 text-[11px] text-[#8b949e]">
                  <span className="font-semibold text-[#8b949e]">Impact Rationale: </span>
                  {ins.whyItMatters}
                </div>
              </div>

              <div className="p-2.5 bg-[#0d1117] rounded border border-[#238636]/30 text-xs text-[#3fb950] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[11px]">Recommended Directive:</span>
                  <span>{ins.recommendedAction}</span>
                  <div className="text-[10px] font-mono mt-1 text-[#58a6ff]">Expected Impact: {ins.metricImpact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Forecasting Panels */}
      <div className="pt-2">
        <h2 className="text-sm font-semibold text-[#f0f6fc] mb-3">Predictive Operational Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Procurement Forecast */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#58a6ff] font-bold">MODEL 01</span>
                <span className="text-[10px] text-[#3fb950] font-mono">Confidence: 94%</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Farmer Procurement Forecast</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Projected milk inflow for tomorrow's morning and evening collection shifts.
              </p>
            </div>
            <button
              onClick={handleRunForecast}
              className="w-full py-2 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs text-[#58a6ff] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Run 72h Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Feed Ration Balancer */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#3fb950] font-bold">MODEL 02</span>
                <span className="text-[10px] text-[#3fb950] font-mono">Cost Optimized</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Least-Cost Ration Balancer</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Nutritional balancing for dry matter, crude protein, and minerals to minimize feed cost/litre.
              </p>
            </div>
            <button
              onClick={handleOptimizeFeed}
              className="w-full py-2 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs text-emerald-400 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Optimize Ration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Anomaly Scan */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#f85149] font-bold">MODEL 03</span>
                <span className="text-[10px] text-[#8b949e] font-mono">Mass & Temp Check</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Quality & Thermal Anomaly Scan</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Automated detection of adulteration (water/fat skimming) and route tanker temperature rise.
              </p>
            </div>
            <button
              onClick={handleAnalyzeAnomalies}
              className="w-full py-2 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs text-[#f85149] font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
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
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#8957e5] animate-spin" />
            <p className="text-xs font-mono text-slate-500">Querying AI Intelligence Engine...</p>
          </div>
        ) : aiData ? (
          <div className="space-y-4 text-xs">
            <div className="p-2.5 bg-slate-100 rounded-lg flex items-center justify-between font-mono text-[11px] text-slate-700">
              <span className="font-bold text-purple-700">Model: {aiData.aiModel}</span>
              <span>Timestamp: Just now</span>
            </div>

            {/* Forecast View */}
            {activeModal === 'forecast' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-slate-800 font-mono">
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-500 font-sans">Total 72h Projected Inflow</span>
                    <div className="text-base font-bold text-emerald-700 mt-1">
                      {aiData.totalProjectedProcurementL?.toLocaleString()} Litres
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-500 font-sans">Ambient Heat Stress Factor</span>
                    <div className="text-base font-bold text-amber-600 mt-1">
                      {aiData.heatStressFactor}
                    </div>
                  </div>
                </div>

                {aiData.forecastDailyBreakdown && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-slate-100 text-slate-700 text-[11px]">
                        <tr>
                          <th className="p-2">Shift Day</th>
                          <th className="p-2">Morning Shift</th>
                          <th className="p-2">Evening Shift</th>
                          <th className="p-2">Fat / SNF</th>
                          <th className="p-2">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {aiData.forecastDailyBreakdown.map((b: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold">{b.day}</td>
                            <td className="p-2 text-emerald-700 font-semibold">{b.morningShiftLitres} L</td>
                            <td className="p-2 text-blue-700 font-semibold">{b.eveningShiftLitres} L</td>
                            <td className="p-2">{b.avgFatPct}% / {b.avgSnfPct}%</td>
                            <td className="p-2 text-purple-700 font-bold">{b.confidencePct}%</td>
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
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-500 font-sans">Optimized Daily Cost</span>
                    <div className="text-base font-bold text-emerald-700 mt-1">
                      ₹{aiData.optimizedCostPerAnimalPerDay} / cow / day
                    </div>
                    <span className="text-[10px] text-slate-400">Baseline: ₹{aiData.currentCostPerAnimalPerDay}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] text-slate-500 font-sans">Projected Annual Savings</span>
                    <div className="text-base font-bold text-purple-700 mt-1">
                      {aiData.annualSavings50HeadHerd}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                  {aiData.aiSummary}
                </div>
              </div>
            )}

            {/* Anomaly View */}
            {activeModal === 'anomaly' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg font-mono">
                  <span>Risk Score: <strong className="text-emerald-700">{aiData.anomalyScore}</strong></span>
                  <span>Integrity Index: <strong className="text-purple-700">{aiData.overallIntegrityIndex}</strong></span>
                </div>

                <div className="space-y-2">
                  {aiData.anomalies?.map((a: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{a.entity}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">{a.severity}</span>
                      </div>
                      <div className="text-slate-600 text-xs">{a.rootCauseProbability}</div>
                      <div className="text-emerald-700 text-[11px] font-medium mt-1">Action: {a.recommendedAction}</div>
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
