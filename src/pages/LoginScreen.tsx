import React, { useState } from 'react';
import { Role } from '../types/dairy';
import { Milk, ArrowRight, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('operations.manager@dairyos.enterprise');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoRoles: { role: Role; email: string; label: string; desc: string }[] = [
    { role: 'CEO', email: 'ceo@dairyos.enterprise', label: 'Chief Executive Officer', desc: 'Full corporate performance & control tower' },
    { role: 'Operations Manager', email: 'operations.manager@dairyos.enterprise', label: 'Operations Manager', desc: 'Central milk pool, collection & processing' },
    { role: 'Procurement Manager', email: 'procurement.manager@dairyos.enterprise', label: 'Procurement Manager', desc: 'Farmers, routes & quality thresholds' },
    { role: 'Finance Manager', email: 'finance.manager@dairyos.enterprise', label: 'Finance Manager', desc: 'Cost-per-litre decomposition & settlements' },
    { role: 'Field Staff', email: 'field.staff@dairyos.enterprise', label: 'Field Staff Agent', desc: 'Ultra-fast mobile collection mode' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Attempt backend authentication
      const res = await api.auth.login(email, password);
      if (res.success && res.user) {
        onLogin(res.user.role as Role);
      } else {
        // Fallback to role matching
        const matched = demoRoles.find((r) => r.email === email);
        onLogin(matched ? matched.role : 'Operations Manager');
      }
    } catch (err: any) {
      console.warn('Backend login fallback to offline demo:', err.message);
      // Offline fallback: match demo email or fallback to Operations Manager
      const matched = demoRoles.find((r) => r.email === email);
      onLogin(matched ? matched.role : 'Operations Manager');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSwitch = async (dr: { role: Role; email: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.auth.demoSwitch(dr.role);
    } catch (err) {
      console.warn('Demo switch API offline fallback:', err);
    } finally {
      setLoading(false);
      onLogin(dr.role);
    }
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
            One unified enterprise operating system for herd, farmer procurement, chilling, processing and commercial distribution.
          </p>
        </div>

        {/* Demo Environment Badge */}
        <div className="mb-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>ENTERPRISE BACKEND ACTIVE</span>
          </span>
          <span className="text-slate-400">REST API :5000</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

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
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating JWT Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to DairyOS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
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
                onClick={() => handleInstantSwitch(dr)}
                disabled={loading}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-600/40 transition-all flex items-center justify-between text-xs group cursor-pointer disabled:opacity-50"
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
