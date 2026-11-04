// SANMATI CONSTRUCTIONS ERP - Light Theme Login Page (Matches Dashboard Theme)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, MapPin, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { currentUser, login, loading, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@sanmaticonstructions.com');
  const [password, setPassword] = useState('Sanmati@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-2 relative overflow-hidden text-slate-900 font-sans">
      {/* Background Subtle Dot Pattern & Soft Ambient Glows */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container - Compact to avoid any scrolling */}
      <div className="w-full max-w-[420px] relative z-10 space-y-3.5 my-auto">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1.5">
          {/* SC Monogram Badge - Matching Sidebar */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-lg tracking-wider shadow-lg shadow-red-600/25">
            SC
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            SANMATI CONSTRUCTIONS
          </h1>
          
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600">
            <MapPin className="w-3 h-3 text-red-600" />
            <span>Kolhapur, Maharashtra, India</span>
          </div>
        </div>

        {/* Login Card - Clean White Dashboard Card Style */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl space-y-4">
          <div className="border-b border-slate-100 pb-3 text-center sm:text-left">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Sign In to ERP Portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your corporate credentials to access authorized modules.</p>
          </div>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping"></span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-xs transition-all placeholder:text-slate-400 outline-none font-medium shadow-2xs"
                  placeholder="name@sanmaticonstructions.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold text-xs">Password</label>
                <span className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-slate-900 rounded-xl pl-9 pr-10 py-2.5 text-xs transition-all placeholder:text-slate-400 outline-none font-mono font-medium shadow-2xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me option */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400 cursor-pointer accent-red-600"
              />
              <label htmlFor="remember" className="text-slate-600 text-xs font-medium cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="text-xs">{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Security & Footer info */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SANMATI CONSTRUCTIONS ERP v2.6 • Secure End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
