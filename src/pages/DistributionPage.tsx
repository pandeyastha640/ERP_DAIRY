import React, { useState } from 'react';
import { DistributionRoute } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Truck, Plus, AlertTriangle, CheckCircle2, MapPin, Navigation, Clock } from 'lucide-react';

interface DistributionPageProps {
  routes: DistributionRoute[];
  onAddRoute: (route: DistributionRoute) => void;
}

export const DistributionPage: React.FC<DistributionPageProps> = ({ routes, onAddRoute }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [routeCode, setRouteCode] = useState('RT-NEW-SUBURB');
  const [routeName, setRouteName] = useState('Route 06 — South Anand Retail Outlets');
  const [driver, setDriver] = useState('Mohanbhai Barot');
  const [vehicle, setVehicle] = useState('GJ-23-CC-9901 (Insulated Tata Ace)');
  const [units, setUnits] = useState('650');

  const totalDispatch = routes.reduce((acc, r) => acc + r.totalDispatchUnits, 0);
  const totalDelivered = routes.reduce((acc, r) => acc + r.deliveredUnits, 0);
  const totalReturns = routes.reduce((acc, r) => acc + r.returnUnits, 0);
  const pendingUnits = totalDispatch - totalDelivered - totalReturns;
  const delayedRoutes = routes.filter((r) => r.status === 'Delayed').length;

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: DistributionRoute = {
      id: `ROUTE-${routes.length + 1}`,
      routeCode,
      routeName,
      shift: 'Morning',
      vehicleNumber: vehicle,
      driverName: driver,
      distributorName: 'Regional Retailers',
      totalDispatchUnits: parseInt(units) || 500,
      deliveredUnits: 0,
      returnUnits: 0,
      logisticsCost: 1500,
      revenueGenerated: 21000,
      departureTime: '06:00 AM',
      status: 'Preparing',
      stopsCount: 10,
    };

    onAddRoute(newRoute);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f6fc]">
            Fleet Logistics & Distribution
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Insulated vehicle routing, early-morning cold-chain drops, retail delivery confirmation, and crate reconciliation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#388bfd] hover:bg-[#4c97ff] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Route</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <MetricCard label="Today's Dispatch" value={`${totalDispatch.toLocaleString()} u`} unit="" trend="up" changeText="Finished goods crates" />
        <MetricCard label="Delivered" value={`${totalDelivered.toLocaleString()} u`} unit="" trend="up" changeText="Confirmed at retail" />
        <MetricCard label="Pending in Transit" value={`${pendingUnits.toLocaleString()} u`} unit="" trend="neutral" changeText="Route 03 & 05" />
        <MetricCard label="Returns / Leaks" value={`${totalReturns} u`} unit="" trend="down" isGoodWhenUp={false} changeText="0.6% reverse crate" />
        <MetricCard label="Active Fleet" value={routes.length} unit="Vehicles" trend="neutral" changeText="GPS tracked" />
        <MetricCard
          label="Route Delays"
          value={delayedRoutes}
          unit="Route"
          trend="down"
          isGoodWhenUp={false}
          changeText="Route 03 tyre check"
        />
      </div>

      {/* DELAY ALERT */}
      {delayedRoutes > 0 && (
        <div className="p-3.5 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#f0883e] shrink-0" />
            <span className="text-xs text-[#c9d1d9]">
              <strong className="text-[#f0883e]">Route 03 (Nadiad Highway):</strong> Dispatched 35 minutes behind schedule due to tyre inspection. Driver Kishor Rabari en route to Stop 4.
            </span>
          </div>
          <span className="text-xs font-mono text-[#f0883e] font-semibold">ETA +25 Min</span>
        </div>
      )}

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => {
          const completionPct = route.totalDispatchUnits > 0
            ? Math.round(((route.deliveredUnits + route.returnUnits) / route.totalDispatchUnits) * 100)
            : 0;

          return (
            <div
              key={route.id}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-[#58a6ff]">{route.routeCode}</span>
                  <StatusBadge status={route.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-[#f0f6fc]">{route.routeName}</h3>
                <div className="text-xs text-[#8b949e] mt-1 flex items-center gap-3">
                  <span>Shift: {route.shift}</span>
                  <span>·</span>
                  <span>Departure: {route.departureTime}</span>
                  <span>·</span>
                  <span>{route.stopsCount} Delivery Stops</span>
                </div>
              </div>

              {/* Vehicle & Driver Card */}
              <div className="p-3 bg-[#0d1117] rounded border border-[#30363d] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-[#8b949e]">Driver Assigned</div>
                  <div className="font-semibold text-[#f0f6fc] mt-0.5">{route.driverName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8b949e]">Refrigerated Vehicle</div>
                  <div className="font-mono text-[#8b949e] text-[11px] truncate mt-0.5">{route.vehicleNumber}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8b949e]">Delivery Fulfillment:</span>
                  <span className="font-bold text-[#3fb950]">
                    {route.deliveredUnits} / {route.totalDispatchUnits} Units ({completionPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
                  <div
                    className={`h-full ${route.status === 'Delayed' ? 'bg-[#f0883e]' : 'bg-[#3fb950]'}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Economic Footnote */}
              <div className="flex items-center justify-between pt-2 border-t border-[#21262d] text-xs font-mono">
                <span className="text-[#8b949e]">Returns: {route.returnUnits} u</span>
                <span className="text-[#8b949e]">Diesel/Driver: ₹{route.logisticsCost}</span>
                <span className="font-bold text-[#3fb950]">Revenue: ₹{route.revenueGenerated.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DISPATCH MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule & Dispatch Delivery Vehicle"
        subtitle="Allocate delivery route, driver, insulated vehicle, and finished product stock"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoute} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Route Identifier</label>
            <input
              type="text"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Route Destination Description</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Driver Name</label>
              <input
                type="text"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#f0f6fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Dispatch Units</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs font-mono text-[#f0f6fc]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#388bfd] text-white rounded text-xs font-semibold"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
