import React from 'react';
import { Role } from '../../types/dairy';
import { canAccessModule } from '../../services/permissions';
import {
  LayoutDashboard,
  Radio,
  Milk,
  Boxes,
  Users,
  Wheat,
  Scale,
  FlaskConical,
  Snowflake,
  Factory,
  PackageSearch,
  Box,
  Warehouse,
  Truck,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  BrainCircuit,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface NavItem {
  id: string;
  number: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group: 'OPERATIONS' | 'FARM & PROCUREMENT' | 'PRODUCT & SUPPLY CHAIN' | 'FINANCE' | 'INTELLIGENCE' | 'ADMIN';
}

export const NAV_GROUPS: Array<{
  group: NavItem['group'];
  items: NavItem[];
}> = [
  {
    group: 'OPERATIONS',
    items: [
      { id: 'dashboard', number: '01', label: 'Dashboard', icon: LayoutDashboard, group: 'OPERATIONS' },
      { id: 'milk-ops', number: '02', label: 'Milk Operations', icon: Milk, group: 'OPERATIONS' },
      { id: 'milk-collection', number: '03', label: 'Milk Collection', icon: Scale, group: 'OPERATIONS' },
      { id: 'quality', number: '04', label: 'Quality Testing', icon: FlaskConical, group: 'OPERATIONS' },
      { id: 'chilling', number: '05', label: 'Chilling & Milk Pool', icon: Snowflake, group: 'OPERATIONS' },
      { id: 'processing', number: '06', label: 'Dairy Processing', icon: Factory, group: 'OPERATIONS' },
    ],
  },
  {
    group: 'FARM & PROCUREMENT',
    items: [
      { id: 'cattle', number: '07', label: 'Cattle Herd', icon: Boxes, group: 'FARM & PROCUREMENT' },
      { id: 'farmers', number: '08', label: 'Farmers & Procurement', icon: Users, group: 'FARM & PROCUREMENT' },
      { id: 'feed', number: '09', label: 'Feed Management', icon: Wheat, group: 'FARM & PROCUREMENT' },
    ],
  },
  {
    group: 'PRODUCT & SUPPLY CHAIN',
    items: [
      { id: 'products', number: '10', label: 'Products', icon: PackageSearch, group: 'PRODUCT & SUPPLY CHAIN' },
      { id: 'packaging', number: '11', label: 'Packaging', icon: Box, group: 'PRODUCT & SUPPLY CHAIN' },
      { id: 'inventory', number: '12', label: 'Inventory', icon: Warehouse, group: 'PRODUCT & SUPPLY CHAIN' },
      { id: 'distribution', number: '13', label: 'Distribution & Fleet', icon: Truck, group: 'PRODUCT & SUPPLY CHAIN' },
      { id: 'sales', number: '14', label: 'Sales & Orders', icon: ShoppingCart, group: 'PRODUCT & SUPPLY CHAIN' },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { id: 'payments', number: '15', label: 'Payments', icon: CreditCard, group: 'FINANCE' },
      { id: 'finance', number: '16', label: 'Finance & Profitability', icon: TrendingUp, group: 'FINANCE' },
      { id: 'reports', number: '17', label: 'Reports', icon: FileSpreadsheet, group: 'FINANCE' },
    ],
  },
  {
    group: 'INTELLIGENCE',
    items: [
      { id: 'ai-intelligence', number: '18', label: 'AI Intelligence', icon: BrainCircuit, badge: 'Demo', group: 'INTELLIGENCE' },
      { id: 'control-tower', number: '19', label: 'Control Tower', icon: Radio, group: 'INTELLIGENCE' },
    ],
  },
  {
    group: 'ADMIN',
    items: [
      { id: 'settings', number: '20', label: 'Settings', icon: Settings, group: 'ADMIN' },
    ],
  },
];

interface SidebarProps {
  currentRole: Role;
  currentModule: string;
  onSelectModule: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none shadow-2xs ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0 bg-white">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
              <Milk className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                DairyOS
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 tracking-wider uppercase font-medium">
                Enterprise ERP
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              <Milk className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((grp) => ({
          ...grp,
          items: grp.items.filter((item) => canAccessModule(currentRole, item.id)),
        })).filter((grp) => grp.items.length > 0).map((grp) => (
          <div key={grp.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={collapsed ? `${item.number} ${item.label}` : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left relative group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border-r-2 border-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {item.number}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-0.5">
            <span className="font-semibold text-slate-700">DAIRYOS v3.2</span>
            <span className="text-emerald-700 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="truncate text-slate-400 text-[10px]">Continuous Mass Balance Engine</div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-200 flex justify-center bg-slate-50">
          <span className="w-2 h-2 rounded-full bg-emerald-600" title="Operational Online" />
        </div>
      )}
    </aside>
  );
};
