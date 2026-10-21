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
  Sparkles,
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
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);

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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#ede8df] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 select-none shadow-[0_1px_4px_rgba(27,67,50,0.02)]">
      {/* Left: Global Search & Facility Breadcrumb */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2 bg-[#faf8f5] hover:bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs text-stone-500 transition-all text-left cursor-pointer shadow-xs group"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#1b4332] shrink-0 transition-colors" />
          <span className="truncate">Search cattle, farmers, batches, SKU, routes...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-stone-400 rounded-md border border-[#ede8df] ml-auto shadow-2xs font-semibold">
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
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs text-stone-700 transition-all cursor-pointer shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
            <span className="truncate max-w-[140px] font-medium">{currentFacility}</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showFacilityMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-[#ede8df] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 text-[10px] uppercase font-mono tracking-wider text-stone-400 border-b border-[#f2eee6] font-bold">
                Operating Facility
              </div>
              {facilities.map((fac) => (
                <button
                  key={fac}
                  onClick={() => {
                    onChangeFacility(fac);
                    setShowFacilityMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#faf8f4] transition-colors cursor-pointer ${
                    currentFacility === fac
                      ? 'text-[#1b4332] font-bold bg-[#f0f7f2]'
                      : 'text-stone-700'
                  }`}
                >
                  <span className="truncate">{fac}</span>
                  {currentFacility === fac && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]" />
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
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs text-stone-700 transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono text-xs font-medium">{currentDateFilter}</span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showDateMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#ede8df] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div>
                <div className="px-1 text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-1.5 font-bold">
                  Preset Time Window
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {dateFilters
                    .filter((df) => df !== 'Custom')
                    .map((df) => (
                      <button
                        key={df}
                        type="button"
                        onClick={() => {
                          onChangeDateFilter(df);
                          setShowDateMenu(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          currentDateFilter === df
                            ? 'bg-[#1b4332] text-white font-bold shadow-xs'
                            : 'bg-[#faf8f5] hover:bg-[#f0f7f2] text-stone-700 border border-[#ede8df]'
                        }`}
                      >
                        {df}
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#ede8df]">
                <div className="px-1 text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-1.5 font-bold flex items-center justify-between">
                  <span>Pick Exact Date</span>
                  <Calendar className="w-3 h-3 text-stone-400" />
                </div>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-[#ede8df] rounded-xl px-3 py-1.5 text-xs text-stone-800 font-mono outline-none focus:border-[#1b4332]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onChangeDateFilter('Custom');
                      setShowDateMenu(false);
                    }}
                    className="w-full py-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors text-center shadow-xs"
                  >
                    Apply Date ({customDate})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Field Entry Trigger */}
        <button
          onClick={onOpenMobileField}
          title="Open Field Staff Touch Mode"
          className="p-2 bg-[#f0f7f2] hover:bg-[#e4f1e8] border border-[#c8e4d2] text-[#1b4332] rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <Smartphone className="w-4 h-4 text-[#2d6a4f]" />
          <span className="hidden xl:inline text-xs">Field Mode</span>
        </button>

        {/* Trace Flow Action */}
        {onOpenTracer && (
          <button
            onClick={onOpenTracer}
            title="Inspect Milk & Money Flow across all stages"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-[#faf8f4] hover:bg-[#f0f7f2] border border-[#ede8df] hover:border-[#c8e4d2] text-[#1b4332] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <GitFork className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>Trace Flow</span>
          </button>
        )}

        {/* Audit Trail Action */}
        {onOpenAudit && (
          <button
            onClick={onOpenAudit}
            title="Open Operational Audit Trail"
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#faf8f4] border border-[#ede8df] text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <FileClock className="w-3.5 h-3.5 text-stone-400" />
            <span>Audit</span>
          </button>
        )}

        {/* Quick Collection Action */}
        <button
          onClick={onOpenQuickCollection}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-semibold shadow-[0_2px_8px_rgba(27,67,50,0.2)] transition-all cursor-pointer"
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
            className="p-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] hover:bg-[#faf8f4] rounded-xl text-stone-600 relative transition-all cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4 text-stone-600" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center shadow-xs">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#ede8df] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4.5 py-3 border-b border-[#ede8df] flex items-center justify-between bg-[#faf8f4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0f2319]">Operational Alerts</span>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-mono font-bold">
                    {unreadAlerts.length} Active
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f2eee6]">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 hover:bg-[#faf8f4] transition-colors cursor-pointer"
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
                            ? 'text-[#c59b27]'
                            : 'text-[#2d6a4f]'
                        }`}
                      >
                        [{alert.priority.toUpperCase()}] {alert.category}
                      </span>
                      <span className="text-stone-400 font-mono text-[10px]">
                        {alert.timestamp}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#0f2319]">{alert.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
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
            className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl transition-all text-left cursor-pointer shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#eef6f0] border border-[#cde6d5] text-[#1b4332] flex items-center justify-center text-xs font-bold shrink-0">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-bold text-[#0f2319] truncate max-w-[130px]">
                {currentRole}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">Session Role</div>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#ede8df] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 text-[10px] uppercase font-mono tracking-wider text-stone-400 border-b border-[#f2eee6] font-bold">
                Switch Operational Role
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onChangeRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#faf8f4] transition-colors cursor-pointer ${
                    currentRole === r
                      ? 'text-[#1b4332] font-bold bg-[#f0f7f2]'
                      : 'text-stone-700'
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
