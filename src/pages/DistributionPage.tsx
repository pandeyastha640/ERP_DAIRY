import React, { useState } from 'react';
import { DistributionRoute } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Truck, Plus, AlertTriangle, CheckCircle2, MapPin, Navigation, Clock, Search } from 'lucide-react';

interface DistributionPageProps {
  routes: DistributionRoute[];
  onAddRoute: (route: DistributionRoute) => void;
}

export const DistributionPage: React.FC<DistributionPageProps> = ({ routes, onAddRoute }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening'>('All');
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

  const filteredRoutes = routes.filter((r) => {
    const mSearch = r.routeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.routeName.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === 'All' || r.status === statusFilter;
    const mShift = shiftFilter === 'All' || r.shift === shiftFilter;
    return mSearch && mStatus && mShift;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shadow-xs">
            <Truck className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-forest-950 font-sans">
                Fleet Logistics & Distribution
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-forest-800 border border-sage-200">
                Cold-Chain Monitored
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-sans">
              Insulated vehicle routing, early-morning cold-chain drops, retail delivery confirmation, and crate reconciliation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Route</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <MetricCard label="Today's Dispatch" value={`${totalDispatch.toLocaleString()} u`} unit="" trend="up" changeText="Finished goods crates" />
        <MetricCard label="Delivered" value={`${totalDelivered.toLocaleString()} u`} unit="" trend="up" changeText="Confirmed at retail" />
        <MetricCard label="Pending in Transit" value={`${pendingUnits.toLocaleString()} u`} unit="" trend="neutral" changeText="Route 03 & 05 active" />
        <MetricCard label="Returns / Leaks" value={`${totalReturns} u`} unit="" trend="down" isGoodWhenUp={false} changeText="0.6% reverse crate" />
        <MetricCard label="Active Fleet" value={routes.length} unit="Vehicles" trend="neutral" changeText="Reefer IoT tracked" />
        <MetricCard
          label="Route Delays"
          value={delayedRoutes}
          unit="Route"
          trend="down"
          isGoodWhenUp={false}
          changeText="Route 03 tyre inspection"
        />
      </div>

      {/* DELAY ALERT */}
      {delayedRoutes > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-800" />
            </div>
            <span className="text-xs text-amber-900 font-sans">
              <strong className="font-bold text-amber-950">Route 03 (Nadiad Highway):</strong> Dispatched 35 minutes behind schedule due to tyre inspection. Driver Kishor Rabari en route to Stop 4.
            </span>
          </div>
          <span className="text-xs font-mono text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            ETA +25 Min
          </span>
        </div>
      )}

      {/* Comprehensive Logistics Filter and Search Bar */}
      <div className="bg-white border border-[#ede8df] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Route Code, Name, or Driver..."
            className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl pl-9 pr-3 py-2 text-xs text-forest-950 placeholder-stone-400 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-1.5 text-xs text-forest-950 outline-none font-sans"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Transit">In Transit</option>
              <option value="Preparing">Preparing</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 font-medium font-sans">Shift:</span>
            <div className="flex bg-cream-50 border border-[#ede8df] rounded-xl p-0.5 text-xs">
              {(['All', 'Morning', 'Evening'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShiftFilter(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    shiftFilter === s
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono font-medium text-forest-800 bg-sage-50 border border-sage-200 px-2.5 py-1 rounded-full">
            Showing {filteredRoutes.length} of {routes.length}
          </span>

          {(search !== '' || statusFilter !== 'All' || shiftFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setShiftFilter('All');
              }}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((route) => {
          const completionPct = route.totalDispatchUnits > 0
            ? Math.round(((route.deliveredUnits + route.returnUnits) / route.totalDispatchUnits) * 100)
            : 0;

          return (
            <div
              key={route.id}
              className="bg-white border border-[#ede8df] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-forest-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-forest-900 bg-cream-100/70 border border-[#ede8df] px-2.5 py-0.5 rounded-md">
                    {route.routeCode}
                  </span>
                  <StatusBadge status={route.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-forest-950 font-sans">{route.routeName}</h3>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-2.5 font-sans">
                  <span>Shift: {route.shift}</span>
                  <span>&bull;</span>
                  <span>Departure: {route.departureTime}</span>
                  <span>&bull;</span>
                  <span>{route.stopsCount} Delivery Stops</span>
                </div>
              </div>

              {/* Vehicle & Driver Card */}
              <div className="p-3.5 bg-cream-50/60 rounded-xl border border-[#ede8df] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-stone-500 font-sans font-medium">Driver Assigned</div>
                  <div className="font-bold text-forest-950 mt-0.5 font-sans">{route.driverName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 font-sans font-medium">Refrigerated Vehicle</div>
                  <div className="font-mono text-stone-700 text-[11px] font-semibold truncate mt-0.5">{route.vehicleNumber}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-stone-500 font-sans">Delivery Fulfillment:</span>
                  <span className="font-bold text-forest-950">
                    {route.deliveredUnits} / {route.totalDispatchUnits} Units ({completionPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden border border-[#ede8df]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      route.status === 'Delayed' ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Economic Footnote */}
              <div className="flex items-center justify-between pt-3 border-t border-[#ede8df] text-xs font-mono">
                <span className="text-stone-500">Returns: {route.returnUnits} u</span>
                <span className="text-stone-600">Diesel/Driver: ₹{route.logisticsCost}</span>
                <span className="font-bold text-emerald-800 text-sm">₹{route.revenueGenerated.toLocaleString()}</span>
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
        <form onSubmit={handleCreateRoute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Route Identifier</label>
            <input
              type="text"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Route Destination Description</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Driver Name</label>
              <input
                type="text"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs text-forest-950 outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">Dispatch Units</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 rounded-xl px-3 py-2 text-xs font-mono text-forest-950 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DistributionPage;
