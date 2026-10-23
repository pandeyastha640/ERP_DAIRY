import React, { useState } from 'react';
import { Role } from '../types/dairy';
import { Milk, ArrowRight, UserCheck, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useDairyERP } from '../context/DairyERPContext';
import { translate } from '../i18n';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { language, setLanguage } = useDairyERP();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const session = await api.auth.getMe();
        if (!session.success || !session.user || session.user.id !== res.user.id) {
          throw new Error('The server could not validate the new session. Please try again.');
        }
        onLogin(session.user.role as Role);
      } else {
        setErrorMsg('The server did not establish a valid session. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSwitch = async (dr: { role: Role; email: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.auth.demoSwitch(dr.role);
      if (!result.success || !result.user) throw new Error('Demo session was not created by the server.');
      onLogin(result.user.role as Role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign-in is unavailable.');
    } finally {
      setLoading(false);
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
            {language === 'hi'
              ? 'पशुधन, किसान खरीद, शीतलन, प्रसंस्करण और वितरण के लिए एक संचालन प्रणाली।'
              : 'One unified operating system for herd, farmer procurement, chilling, processing and commercial distribution.'}
          </p>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="rounded-lg border border-[#ede8df] bg-cream-50 px-3 py-2 text-xs font-semibold text-forest-900 hover:bg-sage-50"
            aria-label="Switch language / भाषा बदलें"
          >
            English | हिन्दी
          </button>
        </div>

        {/* Session Status */}
        <div className="mb-5 p-3 bg-cream-50/80 rounded-xl border border-[#ede8df] flex items-center justify-between text-xs font-mono text-stone-600">
          <span className="flex items-center gap-1.5 text-forest-900 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SERVER-VERIFIED SIGN-IN</span>
          </span>
          <span className="text-stone-400">SESSION REQUIRED</span>
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
              {translate(language, 'Enterprise Email')}
            </label>
            <input
              required
              autoComplete="username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fdfcfb] border border-[#ede8df] focus:border-forest-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-forest-950 outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-sans">
              {translate(language, 'Security Credential')}
            </label>
            <input
              required
              autoComplete="current-password"
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
                <span>{translate(language, 'Authenticating JWT Session...')}</span>
              </>
            ) : (
              <>
                <span>{translate(language, 'Sign In to DairyOS')}</span>
                <ArrowRight className="w-4 h-4 text-cream-200" />
              </>
            )}
          </button>
        </form>

        {/* Explicitly opted-in development demo sign-in. */}
        {import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' && (
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
        )}
      </div>

      <div className="mt-5 text-center text-xs text-stone-500 font-mono">
        DairyOS Enterprise v3.2 &bull; FSSAI Grade A Dairy Infrastructure
      </div>
    </div>
  );
};

export default LoginScreen;
