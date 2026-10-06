import React, { useState } from 'react';
import { Role } from '../types/dairy';
import { Milk, ArrowRight, UserCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('operations.manager@dairyos.enterprise');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<Role>('Operations Manager');

  const demoRoles: { role: Role; label: string; desc: string }[] = [
    { role: 'CEO', label: 'Chief Executive Officer', desc: 'Full corporate performance & control tower' },
    { role: 'Operations Manager', label: 'Operations Manager', desc: 'Central milk pool, collection & processing' },
    { role: 'Procurement Manager', label: 'Procurement Manager', desc: 'Farmers, routes & quality thresholds' },
    { role: 'Finance Manager', label: 'Finance Manager', desc: 'Cost-per-litre decomposition & settlements' },
    { role: 'Field Staff', label: 'Field Staff Agent', desc: 'Ultra-fast mobile collection mode' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Main Login Container */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-900">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-700 text-white shadow-md mb-3">
            <Milk className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dairy Operations System
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            One unified operating system for herd, farmer procurement, chilling, processing and commercial distribution.
          </p>
        </div>

        {/* Demo Environment Badge */}
        <div className="mb-6 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>DEMO ENVIRONMENT</span>
          </span>
          <span className="text-slate-400">Sample Dataset</span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enterprise Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Security Credential
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none shadow-2xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Sign In to DairyOS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role One-Click Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5 font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Instant Demo Role Logins</span>
          </div>

          <div className="space-y-1.5">
            {demoRoles.map((dr) => (
              <button
                key={dr.role}
                onClick={() => onLogin(dr.role)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-600/40 transition-all flex items-center justify-between text-xs group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-800">
                    {dr.label}
                  </div>
                  <div className="text-[10px] text-slate-500">{dr.desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500 font-mono">
        DairyOS Enterprise v3.2 · Connected Enterprise Architecture
      </div>
    </div>
  );
};
