import React, { useState } from 'react';
import { DistributionRoute, Vehicle } from '../types/dairy';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EntityDetailDrawer } from '../components/common/EntityDetailDrawer';
import { Truck, Plus, AlertTriangle, CheckCircle2, MapPin, Navigation, Clock } from 'lucide-react';

interface DistributionPageProps {
  routes: DistributionRoute[];
  onAddRoute: (route: DistributionRoute, existingId?: string) => string | undefined;
  onArchiveRoute: (id: string) => void;
  vehicles: Vehicle[];
  onSaveVehicle: (vehicle: Vehicle, existingId?: string) => string | undefined;
  onArchiveVehicle: (id: string) => void;
}

export const DistributionPage: React.FC<DistributionPageProps> = ({ routes, onAddRoute, onArchiveRoute, vehicles, onSaveVehicle, onArchiveVehicle }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DistributionRoute | null>(null);
  const [activeRoute, setActiveRoute] = useState<DistributionRoute | null>(null);
  const [formError, setFormError] = useState('');
  const [routeCode, setRouteCode] = useState('RT-NEW-SUBURB');
  const [routeName, setRouteName] = useState('Route 06 — South Anand Retail Outlets');
  const [driver, setDriver] = useState('Mohanbhai Barot');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [vehicleType, setVehicleType] = useState('Insulated delivery vehicle');
  const [vehicleCapacity, setVehicleCapacity] = useState('0');
  const [vehicle, setVehicle] = useState('GJ-23-CC-9901 (Insulated Tata Ace)');
  const activeVehicles = vehicles.filter((item) => !item.archivedAt);
  const [units, setUnits] = useState('650');

  const activeRoutes = routes.filter((route) => !route.archivedAt);
  const totalDispatch = activeRoutes.reduce((acc, r) => acc + r.totalDispatchUnits, 0);
  const totalDelivered = activeRoutes.reduce((acc, r) => acc + r.deliveredUnits, 0);
  const totalReturns = activeRoutes.reduce((acc, r) => acc + r.returnUnits, 0);
  const pendingUnits = totalDispatch - totalDelivered - totalReturns;
  const delayedRoutes = activeRoutes.filter((r) => r.status === 'Delayed').length;

  const openVehicleForm = (record?: Vehicle) => {
    setEditingVehicle(record ?? null);
    setVehicleError('');
    setVehicleRegistration(record?.registration ?? '');
    setVehicleType(record?.vehicleType ?? 'Insulated delivery vehicle');
    setVehicleCapacity(String(record?.capacityUnits ?? 0));
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const capacity = Number(vehicleCapacity);
    if (!vehicleRegistration.trim() || !vehicleType.trim()) {
      setVehicleError('Vehicle registration and type are required.');
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 0) {
      setVehicleError('Capacity must be a non-negative whole number.');
      return;
    }
    const record: Vehicle = {
      ...(editingVehicle ?? {} as Vehicle),
      id: editingVehicle?.id ?? `VEH-${Date.now()}`,
      registration: vehicleRegistration.trim(),
      vehicleType: vehicleType.trim(),
      capacityUnits: capacity,
    };
    const error = onSaveVehicle(record, editingVehicle?.id);
    if (error) {
      setVehicleError(error);
      return;
    }
    setIsVehicleModalOpen(false);
  };

  const openRouteForm = (route?: DistributionRoute) => {
    setEditingRoute(route ?? null);
    setFormError('');
    setRouteCode(route?.routeCode ?? '');
    setRouteName(route?.routeName ?? '');
    setDriver(route?.driverName ?? '');
    setVehicle(route?.vehicleNumber.split(' (')[0] ?? activeVehicles[0]?.registration ?? '');
    setUnits(String(route?.totalDispatchUnits ?? 0));
    setIsAddModalOpen(true);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const dispatchUnits = Number(units);
    if (!routeCode.trim() || !routeName.trim() || !driver.trim() || !vehicle.trim()) {
      setFormError('Route code, route name, driver, and vehicle are required.');
      return;
    }
    if (!Number.isInteger(dispatchUnits) || dispatchUnits < 0) {
      setFormError('Dispatch units must be a non-negative whole number.');
      return;
    }
    const newRoute: DistributionRoute = {
      ...(editingRoute ?? {} as DistributionRoute),
      id: editingRoute?.id ?? `ROUTE-${Date.now()}`,
      routeCode: routeCode.trim(),
      routeName: routeName.trim(),
      shift: editingRoute?.shift ?? 'Morning',
      vehicleNumber: vehicle.trim(),
      driverName: driver.trim(),
      distributorName: editingRoute?.distributorName ?? 'Regional Retailers',
      totalDispatchUnits: editingRoute?.totalDispatchUnits ?? dispatchUnits,
      deliveredUnits: editingRoute?.deliveredUnits ?? 0,
      returnUnits: editingRoute?.returnUnits ?? 0,
      logisticsCost: editingRoute?.logisticsCost ?? 0,
      revenueGenerated: editingRoute?.revenueGenerated ?? 0,
      departureTime: editingRoute?.departureTime ?? '06:00 AM',
      status: editingRoute?.status ?? 'Preparing',
      stopsCount: editingRoute?.stopsCount ?? 0,
    };

    const error = onAddRoute(newRoute, editingRoute?.id);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setIsAddModalOpen(false);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Fleet Logistics & Distribution
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Insulated vehicle routing, early-morning cold-chain drops, retail delivery confirmation, and crate reconciliation.
          </p>
        </div>

        <button
          onClick={() => openRouteForm()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Route</span>
        </button>
        <button onClick={() => openVehicleForm()} className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold">Add Vehicle</button>
      </div>

      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Vehicle Master</h2>
          <span className="text-xs text-slate-500">{activeVehicles.length} active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-2">Registration</th><th className="px-4 py-2">Vehicle Type</th><th className="px-4 py-2">Capacity</th><th className="px-4 py-2 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {activeVehicles.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-2 font-mono text-slate-800">{record.registration}</td>
                  <td className="px-4 py-2 text-slate-700">{record.vehicleType}</td>
                  <td className="px-4 py-2 text-slate-700">{record.capacityUnits.toLocaleString()} units</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => openVehicleForm(record)} className="px-2 py-1 text-emerald-800">Edit</button>
                    <button onClick={() => { if (window.confirm(`Archive vehicle ${record.registration}? Route history will remain.`)) onArchiveVehicle(record.id); }} className="px-2 py-1 text-rose-700">Archive</button>
                  </td>
                </tr>
              ))}
              {activeVehicles.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No active vehicles. Add a vehicle before scheduling a route.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

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
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-xs text-slate-700">
              <strong className="text-amber-700">Route 03 (Nadiad Highway):</strong> Dispatched 35 minutes behind schedule due to tyre inspection. Driver Kishor Rabari en route to Stop 4.
            </span>
          </div>
          <span className="text-xs font-mono text-amber-700 font-semibold">ETA +25 Min</span>
        </div>
      )}

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRoutes.map((route) => {
          const completionPct = route.totalDispatchUnits > 0
            ? Math.round(((route.deliveredUnits + route.returnUnits) / route.totalDispatchUnits) * 100)
            : 0;

          return (
            <div
              key={route.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-blue-700">{route.routeCode}</span>
                  <StatusBadge status={route.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{route.routeName}</h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Shift: {route.shift}</span>
                  <span>·</span>
                  <span>Departure: {route.departureTime}</span>
                  <span>·</span>
                  <span>{route.stopsCount} Delivery Stops</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setActiveRoute(route)} className="px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs">Details</button>
                  <button onClick={() => openRouteForm(route)} className="px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs">Edit</button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Archive ${route.routeCode}? Delivery history will be retained.`)) {
                        onArchiveRoute(route.id);
                      }
                    }}
                    className="px-2.5 py-1.5 border border-rose-200 text-rose-700 rounded text-xs"
                  >Archive</button>
                </div>
              </div>

              {/* Vehicle & Driver Card */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Driver Assigned</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{route.driverName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Refrigerated Vehicle</div>
                  <div className="font-mono text-slate-500 text-[11px] truncate mt-0.5">{route.vehicleNumber}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Delivery Fulfillment:</span>
                  <span className="font-bold text-emerald-700">
                    {route.deliveredUnits} / {route.totalDispatchUnits} Units ({completionPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${route.status === 'Delayed' ? 'bg-[#f0883e]' : 'bg-[#3fb950]'}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title={editingVehicle ? `Edit Vehicle ${editingVehicle.registration}` : 'Add Vehicle'} subtitle="Maintain active fleet records used by routes" maxWidth="md">
        <form onSubmit={handleSaveVehicle} className="space-y-3.5">
          {vehicleError && <p role="alert" className="text-xs text-rose-700">{vehicleError}</p>}
          <label className="block text-xs font-medium text-slate-700">Registration<input required value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-xs font-medium text-slate-700">Vehicle Type<input required value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-xs font-medium text-slate-700">Capacity (units)<input type="number" min="0" step="1" required value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3"><button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-3 py-2 text-xs text-slate-600">Cancel</button><button type="submit" className="px-3 py-2 rounded bg-emerald-700 text-xs font-semibold text-white">{editingVehicle ? 'Save Changes' : 'Save Vehicle'}</button></div>
        </form>
      </Modal>
              </div>

              {/* Economic Footnote */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono">
                <span className="text-slate-500">Returns: {route.returnUnits} u</span>
                <span className="text-slate-500">Diesel/Driver: ₹{route.logisticsCost}</span>
                <span className="font-bold text-emerald-700">Revenue: ₹{route.revenueGenerated.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DISPATCH MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingRoute ? `Edit Route ${editingRoute.routeCode}` : 'Schedule & Dispatch Delivery Vehicle'}
        subtitle="Allocate delivery route, driver, insulated vehicle, and finished product stock"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoute} className="space-y-3.5">
          {formError && <p role="alert" className="text-xs text-rose-700">{formError}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Route Identifier</label>
            <input
              type="text"
              required
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Route Destination Description</label>
            <input
              type="text"
              required
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Driver Name</label>
              <input
                type="text"
                required
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dispatch Units</label>
              <input
                type="number"
                min="0"
                step="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-mono text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Registered Vehicle</label>
            <select required value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900">
              <option value="">Select vehicle</option>
              {activeVehicles.map((item) => <option key={item.id} value={item.registration}>{item.registration} · {item.vehicleType}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold"
            >
              {editingRoute ? 'Save Changes' : 'Save Route'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title={editingVehicle ? `Edit Vehicle ${editingVehicle.registration}` : 'Add Vehicle'} subtitle="Maintain fleet records used by routes" maxWidth="md">
        <form onSubmit={handleSaveVehicle} className="space-y-3.5">
          {vehicleError && <p role="alert" className="text-xs text-rose-700">{vehicleError}</p>}
          <label className="block text-xs font-medium text-slate-700">Registration<input required value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-xs font-medium text-slate-700">Vehicle Type<input required value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <label className="block text-xs font-medium text-slate-700">Capacity (units)<input type="number" min="0" step="1" required value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3"><button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-3 py-2 text-xs text-slate-600">Cancel</button><button type="submit" className="px-3 py-2 rounded bg-emerald-700 text-xs font-semibold text-white">{editingVehicle ? 'Save Changes' : 'Save Vehicle'}</button></div>
        </form>
      </Modal>

      {activeRoute && (
        <EntityDetailDrawer
          isOpen={!!activeRoute}
          onClose={() => setActiveRoute(null)}
          title={`Route ${activeRoute.routeCode}`}
          subtitle={activeRoute.routeName}
        >
          <dl className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Status', activeRoute.status],
              ['Shift', activeRoute.shift],
              ['Vehicle', activeRoute.vehicleNumber],
              ['Driver', activeRoute.driverName],
              ['Dispatch', `${activeRoute.totalDispatchUnits} units`],
              ['Delivered', `${activeRoute.deliveredUnits} units`],
              ['Returns', `${activeRoute.returnUnits} units`],
              ['Logistics Cost', `₹${activeRoute.logisticsCost.toLocaleString()}`],
              ['Revenue', `₹${activeRoute.revenueGenerated.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-slate-200 bg-slate-50 p-3">
                <dt className="text-slate-500">{label}</dt>
                <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex justify-end">
            <button onClick={() => { openRouteForm(activeRoute); setActiveRoute(null); }} className="rounded bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Edit Route</button>
          </div>
        </EntityDetailDrawer>
      )}
    </div>
  );
};
