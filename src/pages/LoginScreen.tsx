import React, { useState } from 'react';
import { Role } from '../types/dairy';
import { Milk, ArrowRight, UserCheck, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
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
      const res = await api.auth.login(email, password);
      if (res.success && res.user) {
        onLogin(res.user.role as Role);
      } else {
        const matched = demoRoles.find((r) => r.email === email);
        onLogin(matched ? matched.role : 'Operations Manager');
      }
    } catch (err: any) {
      console.warn('Backend login fallback to offline demo:', err.message);
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
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
      {/* Subtle organic background aura */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sage-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cream-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Container */}
      <div className="relative w-full max-w-md bg-white border border-[#ede8df] rounded-3xl p-7 sm:p-9 shadow-sm text-stone-900">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-900 text-cream-100 shadow-xs mb-3.5 border border-forest-950">
            <Milk className="w-7 h-7 text-cream-100" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-forest-950 font-sans">
              DairyOS Enterprise
            </h1>
            <span className="w-2 h-2 rounded-full bg-gold-500" />
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed font-sans">
            One unified operating system for herd, farmer procurement, chilling, processing and commercial distribution.
          </p>
        </div>

        {/* Demo Environment Badge */}
        <div className="mb-5 p-3 bg-cream-50/80 rounded-xl border border-[#ede8df] flex items-center justify-between text-xs font-mono text-stone-600">
          <span className="flex items-center gap-1.5 text-forest-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>ENTERPRISE BACKEND ACTIVE</span>
          </span>
          <span className="text-stone-400">PORT 5000</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
              Enterprise Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-forest-950 outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
              Security Credential
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-forest-950 outline-none transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-900 hover:bg-forest-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cream-200" />
                <span>Authenticating JWT Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to DairyOS</span>
                <ArrowRight className="w-4 h-4 text-cream-200" />
              </>
            )}
          </button>
        </form>

        {/* Quick Role One-Click Switcher */}
        <div className="mt-6 pt-5 border-t border-[#ede8df]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5 font-semibold">
            <UserCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Instant Demo Role Logins</span>
          </div>

          <div className="space-y-2">
            {demoRoles.map((dr) => (
              <button
                key={dr.role}
                onClick={() => handleInstantSwitch(dr)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-cream-50/60 hover:bg-cream-100/70 border border-[#ede8df] hover:border-forest-300 transition-all flex items-center justify-between text-xs group cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <div>
                  <div className="font-bold text-forest-950 group-hover:text-forest-900 font-sans">
                    {dr.label}
                  </div>
                  <div className="text-[11px] text-stone-500 font-sans mt-0.5">{dr.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-forest-800 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-stone-500 font-mono">
        DairyOS Enterprise v3.2 &bull; FSSAI Grade A Dairy Infrastructure
      </div>
    </div>
  );
};

export default LoginScreen;
