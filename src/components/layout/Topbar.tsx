import React, { useState } from 'react';
import { Role, Facility, DateFilter, OperationalAlert } from '../../types/dairy';
import {
  Search,
  Bell,
  MapPin,
  Calendar,
  UserCheck,
  Plus,
  Smartphone,
  ChevronDown,
  X,
  GitFork,
  FileClock,
} from 'lucide-react';

interface TopbarProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  currentFacility: Facility;
  onChangeFacility: (facility: Facility) => void;
  currentDateFilter: DateFilter;
  onChangeDateFilter: (filter: DateFilter) => void;
  onOpenSearch: () => void;
  onOpenQuickCollection: () => void;
  onOpenMobileField: () => void;
  onOpenTracer?: () => void;
  onOpenAudit?: () => void;
  alerts: OperationalAlert[];
  onOpenAlertModule: (moduleId: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentRole,
  onChangeRole,
  currentFacility,
  onChangeFacility,
  currentDateFilter,
  onChangeDateFilter,
  onOpenSearch,
  onOpenQuickCollection,
  onOpenMobileField,
  onOpenTracer,
  onOpenAudit,
  alerts,
  onOpenAlertModule,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read);

  const roles: Role[] = [
    'CEO',
    'COO',
    'Operations Manager',
    'Plant Manager',
    'Procurement Manager',
    'Finance Manager',
    'Field Staff',
    'Admin',
  ];

  const facilities: Facility[] = [
    'Main Dairy Plant',
    'Anand Collection Centre',
    'Baroda Bulk Chilling Unit',
    'Mehsana Procurement Hub',
  ];

  const dateFilters: DateFilter[] = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 select-none shadow-2xs">
      {/* Left: Global Search & Facility Breadcrumb */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-500 transition-colors text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Search cattle, farmers, batches, SKU, routes...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-400 rounded border border-slate-200 ml-auto shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Facility Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowFacilityMenu(!showFacilityMenu);
              setShowRoleMenu(false);
              setShowNotifications(false);
              setShowDateMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate max-w-[140px] font-medium">{currentFacility}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFacilityMenu && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100">
                Operating Facility
              </div>
              {facilities.map((fac) => (
                <button
                  key={fac}
                  onClick={() => {
                    onChangeFacility(fac);
                    setShowFacilityMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    currentFacility === fac
                      ? 'text-emerald-800 font-semibold bg-emerald-50/70'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{fac}</span>
                  {currentFacility === fac && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Date Filter, Quick Actions, Notifications, Role Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDateMenu(!showDateMenu);
              setShowRoleMenu(false);
              setShowFacilityMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-xs">{currentDateFilter}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDateMenu && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
              {dateFilters.map((df) => (
                <button
                  key={df}
                  onClick={() => {
                    onChangeDateFilter(df);
                    setShowDateMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                    currentDateFilter === df
                      ? 'text-emerald-800 font-semibold bg-emerald-50/70'
                      : 'text-slate-700'
                  }`}
                >
                  {df}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Field Entry Trigger */}
        <button
          onClick={onOpenMobileField}
          title="Open Field Staff Touch Mode"
          className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs"
        >
          <Smartphone className="w-4 h-4 text-emerald-700" />
          <span className="hidden xl:inline text-xs font-medium text-slate-700">Field Mode</span>
        </button>

        {/* Trace Flow Action */}
        {onOpenTracer && (
          <button
            onClick={onOpenTracer}
            title="Inspect Milk & Money Flow across all 11 stages"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <GitFork className="w-3.5 h-3.5 text-emerald-700" />
            <span>Trace Flow</span>
          </button>
        )}

        {/* Audit Trail Action */}
        {onOpenAudit && (
          <button
            onClick={onOpenAudit}
            title="Open Operational Audit Trail"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <FileClock className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit</span>
          </button>
        )}

        {/* Quick Collection Action */}
        <button
          onClick={onOpenQuickCollection}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Milk</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
              setShowFacilityMenu(false);
              setShowDateMenu(false);
            }}
            aria-label="View notifications"
            className="p-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600 relative transition-colors cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Operational Alerts</span>
                  <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-mono font-semibold">
                    {unreadAlerts.length} Active
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      onOpenAlertModule(alert.targetModule);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span
                        className={`font-semibold ${
                          alert.priority === 'Critical'
                            ? 'text-rose-600'
                            : alert.priority === 'High'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      >
                        [{alert.priority.toUpperCase()}] {alert.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {alert.timestamp}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-900">{alert.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {alert.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowFacilityMenu(false);
              setShowNotifications(false);
              setShowDateMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors text-left cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {currentRole}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Demo Role</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Demo Role Switcher
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onChangeRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    currentRole === r
                      ? 'text-emerald-800 font-semibold bg-emerald-50/70'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
