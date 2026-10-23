import React from 'react';
import { useDairyERP } from '../../context/DairyERPContext';
import { translate } from '../../i18n';
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
  ShieldCheck,
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
      { id: 'ai-intelligence', number: '18', label: 'AI Intelligence', icon: BrainCircuit, badge: 'Neural', group: 'INTELLIGENCE' },
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
  currentModule: string;
  onSelectModule: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
}) => {
  const { language } = useDairyERP();
  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white/75 backdrop-blur-2xl border-r border-white/70 transition-all duration-300 select-none shadow-[4px_0_24px_rgba(27,67,50,0.04)] ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/80 shrink-0 bg-white/50 backdrop-blur-md">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d6a4f] via-[#1b4332] to-[#0d2818] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_14px_rgba(27,67,50,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] shrink-0 transition-transform duration-300 hover:rotate-3 hover:scale-105">
              <Milk className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="truncate">
              <div className="text-base font-bold text-[#0f2319] tracking-tight leading-none flex items-center gap-1.5 font-sans">
                <span>DairyOS</span>
                <span className="w-2 h-2 rounded-full bg-[#52b788] shadow-[0_0_8px_#52b788]" />
              </div>
              <div className="text-[10px] text-stone-500 font-mono mt-0.5 tracking-wider uppercase font-semibold">
                Enterprise Cloud 3D
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_12px_rgba(27,67,50,0.3)] transition-transform duration-300 hover:scale-105">
              <Milk className="w-5 h-5" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-stone-400 hover:text-[#1b4332] hover:bg-white/80 transition-all cursor-pointer shadow-2xs"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>


      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase font-mono">
                {translate(language, grp.group)}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={collapsed ? `${item.number} ${translate(language, item.label)}` : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-left relative group cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#eef6f0] to-white/95 text-[#1b4332] font-bold shadow-[0_4px_14px_-2px_rgba(27,67,50,0.08),inset_0_1px_1px_rgba(255,255,255,1)] border border-[#cde6d5] -translate-y-0.5'
                      : 'text-stone-600 hover:text-[#0f2319] hover:bg-white/80 hover:translate-x-0.5'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-[#1b4332] scale-110' : 'text-stone-400 group-hover:text-[#2d6a4f] group-hover:scale-110'
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-[#2d6a4f] font-semibold' : 'text-stone-400'}`}>
                          {item.number}
                        </span>
                        <span className="truncate">{translate(language, item.label)}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 bg-[#fbf7ec] text-[#855e16] border border-[#f0e2bd] shadow-2xs">
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
        <div className="p-3.5 border-t border-[#ede8df] bg-[#faf8f4] text-xs text-stone-500">
          <div className="flex items-center justify-between font-mono text-[10px] mb-1">
            <span className="font-bold text-[#0f2319] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2d6a4f]" />
              DairyOS Demo
            </span>
            <span className="text-[#1b4332] flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] animate-pulse" />
              LOCAL
            </span>
          </div>
          <div className="truncate text-stone-400 text-[10px]">Mass Balance Reconciliation Nominal</div>
        </div>
      ) : (
        <div className="p-2.5 border-t border-[#ede8df] flex justify-center bg-[#faf8f4]">
          <span className="w-2 h-2 rounded-full bg-[#2d6a4f]" title="Operational Online" />
        </div>
      )}
    </aside>
  );
};
