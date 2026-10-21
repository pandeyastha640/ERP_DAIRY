import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDairyERP } from '../../context/DairyERPContext';
import { Search, User, Clock, FileText } from 'lucide-react';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useDairyERP();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('All');

  if (!isOpen) return null;

  const modules = Array.from(new Set(auditLogs.map((l) => l.module)));

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.recordId.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase());
    const matchesMod = filterModule === 'All' || log.module === filterModule;
    return matchesSearch && matchesMod;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ERP Operational Audit & Activity Trail"
      subtitle="Immutable event log recording every state mutation across milk, money, and inventory"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[#faf8f5] rounded-2xl border border-[#ede8df]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by description, record ID or user..."
              className="w-full bg-white border border-[#e2dcd2] focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Module:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-white border border-[#e2dcd2] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none shadow-2xs cursor-pointer focus:border-[#1b4332]"
            >
              <option value="All">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Rows */}
        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-[#faf8f5] rounded-2xl border border-[#ede8df]">
              No audit events found matching query.
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-white border border-[#ede8df] rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-2 shadow-2xs hover:border-[#1b4332]/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-[#1b4332] bg-[#f0f7f2] px-2 py-0.5 rounded-lg border border-[#cbe5d4] font-mono">
                      {log.module}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-800 font-semibold">{log.action}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono">ID: {log.recordId}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-sans font-medium">{log.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> {log.userName} ({log.userRole})
                    </span>
                    {log.financialImpact && (
                      <span className="text-[#1b4332] font-mono font-bold">
                        {log.financialImpact}
                      </span>
                    )}
                    {log.milkImpactLitres !== undefined && (
                      <span className="text-blue-700 font-mono font-bold">
                        {log.milkImpactLitres > 0
                          ? `+${log.milkImpactLitres} L`
                          : `${log.milkImpactLitres} L`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 shrink-0 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
