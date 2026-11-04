// SANMATI CONSTRUCTIONS ERP - No-Scroll Premium Login Page
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
    <div className="h-screen max-h-screen w-full bg-[#08101d] flex flex-col justify-center items-center px-4 py-2 relative overflow-hidden text-slate-100">
      {/* Background Tech Grid & Ambient Glows */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1d68e4 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#1d68e4]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container - Compact to avoid any scrolling */}
      <div className="w-full max-w-[420px] relative z-10 space-y-3 sm:space-y-3.5 my-auto">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1">
          {/* SC Monogram Badge */}
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1d68e4] to-cyan-400 p-[1.5px] shadow-lg shadow-blue-900/40">
            <div className="w-full h-full bg-[#0a1626] rounded-[10px] flex items-center justify-center font-black text-cyan-400 text-lg tracking-wider">
              SC
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            SANMATI CONSTRUCTIONS
          </h1>
          
          <div className="text-[11px] text-cyan-400 font-medium flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-[#1d68e4]" />
            <span>Kolhapur, Maharashtra, India</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c1a2e]/95 border border-[#1b3457] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5">
          <div className="border-b border-[#182f4d] pb-2 text-center sm:text-left">
            <h2 className="text-sm sm:text-base font-bold text-white">Sign In to ERP Portal</h2>
            <p className="text-[11px] text-slate-400">Enter your corporate credentials to access authorized modules.</p>
          </div>

          {authError && (
            <div className="p-2 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-ping"></span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 text-[11px]">Company Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#081220] border border-[#1d375a] focus:border-[#1d68e4] focus:ring-1 focus:ring-[#1d68e4] text-white rounded-xl pl-8 pr-3 py-2 text-xs transition-all placeholder:text-slate-500 outline-none"
                  placeholder="name@sanmaticonstructions.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium text-[11px]">Password</label>
                <span className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#081220] border border-[#1d375a] focus:border-[#1d68e4] focus:ring-1 focus:ring-[#1d68e4] text-white rounded-xl pl-8 pr-9 py-2 text-xs transition-all placeholder:text-slate-500 outline-none font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember me option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-[#081220] text-[#1d68e4] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember" className="text-slate-400 text-[11px] cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d68e4] hover:bg-[#185ad1] active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="text-xs">{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Security & Footer info */}
        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>SANMATI CONSTRUCTIONS ERP v2.6 • Secure End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};
