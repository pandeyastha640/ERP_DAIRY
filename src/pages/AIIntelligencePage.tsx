import React from 'react';
import { useDairyERP } from '../context/DairyERPContext';
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
} from 'lucide-react';

export const AIIntelligencePage: React.FC = () => {
  const { insights, reconciliation, feedsList, herdEconomics, procurementSummary } = useDairyERP();

  const lowestFeed = feedsList.find((f) => f.daysRemaining <= 4.5) || feedsList[0];

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
            <span className="text-[#8b949e]">Decoupled Machine Learning Heuristics Layer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc] mt-1">
            AI Operations Intelligence & Predictive Forecasts
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Operational forecasting, pattern anomaly detection, ration balancing optimization, and supply-chain risk mitigation.
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#8b949e] bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d]">
          Model Horizon: Next 72 Hours · 4 Models Active
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

      {/* 4 Core Forecasting Panels */}
      <div className="pt-2">
        <h2 className="text-sm font-semibold text-[#f0f6fc] mb-3">Predictive Operational Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Procurement Forecast */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#58a6ff] font-bold">FORECAST 01</span>
                <span className="text-[10px] text-[#3fb950] font-mono">Confidence: 94%</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Farmer Procurement Forecast</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Projected milk inflow for tomorrow's morning and evening collection shifts.
              </p>
            </div>

            <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Today Actual Inflow:</span>
                <span className="font-bold text-[#f0f6fc]">{reconciliation.farmerProcurementLitres.toLocaleString()} Litres</span>
              </div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Expected Tomorrow:</span>
                <span className="font-bold text-[#f0f6fc]">3,150 Litres</span>
              </div>
              <div className="flex justify-between text-[#f0883e]">
                <span>Projected Shortfall Gap:</span>
                <span className="font-bold">-290 Litres vs Quota</span>
              </div>
            </div>

            <div className="p-3 bg-[#238636]/10 border border-[#238636]/20 rounded text-xs text-[#3fb950]">
              <span className="font-semibold block mb-0.5">Recommended Directive:</span>
              Review procurement from high-volume farmers in Anand cluster and offer evening shift transport incentive (+₹0.50/L).
            </div>
          </div>

          {/* 2. Feed Runway Forecast */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#f0883e] font-bold">FORECAST 02</span>
                <span className="text-[10px] text-[#3fb950] font-mono">Confidence: 98%</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Feed Silo Runway Projection</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Cattle herd dry matter intake vs current warehouse inventory.
              </p>
            </div>

            <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Current {lowestFeed.name} Stock:</span>
                <span className="font-bold text-[#f0f6fc]">{lowestFeed.closingStockKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Herd Consumption:</span>
                <span>{lowestFeed.consumedKg.toLocaleString()} kg / day</span>
              </div>
              <div className="flex justify-between text-[#f85149] font-bold border-t border-[#21262d] pt-1">
                <span>Estimated Runway:</span>
                <span>{lowestFeed.daysRemaining} Days Remaining</span>
              </div>
            </div>

            <div className="p-3 bg-[#238636]/10 border border-[#238636]/20 rounded text-xs text-[#3fb950]">
              <span className="font-semibold block mb-0.5">Recommended Directive:</span>
              Initiate immediate purchase order for 20 MT Concentrate Pellet before weekend supplier shutdown.
            </div>
          </div>

          {/* 3. Demand Forecast */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#bc8cff] font-bold">FORECAST 03</span>
                <span className="text-[10px] text-[#3fb950] font-mono">Confidence: 91%</span>
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Festival Demand Surge (Dahi & Paneer)</h3>
              <p className="text-xs text-[#8b949e] mt-1">
                Navratri festival retail order demand over next 72 hours.
              </p>
            </div>

            <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Curd (Dahi) Order Spike:</span>
                <span className="font-bold text-[#3fb950]">+38% Surge</span>
              </div>
              <div className="flex justify-between text-[#c9d1d9]">
                <span>Paneer Demand Surge:</span>
                <span className="font-bold text-[#3fb950]">+45% Surge</span>
              </div>
              <div className="flex justify-between text-[#58a6ff] border-t border-[#21262d] pt-1">
                <span>Raw Milk Allocation Required:</span>
                <span className="font-bold">+600 L / day</span>
              </div>
            </div>

            <div className="p-3 bg-[#238636]/10 border border-[#238636]/20 rounded text-xs text-[#3fb950]">
              <span className="font-semibold block mb-0.5">Recommended Directive:</span>
              Divert 600 L raw standardized milk from commodity pouch milk line to Dahi incubation tanks in tonight's shift.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
