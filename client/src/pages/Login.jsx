// SANMATI CONSTRUCTIONS ERP - Exact Screenshot Match Premium Login Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, MapPin, ArrowRight, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-[#f8f4ee] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      
      {/* ── Background Luxury Champagne Silk Waves (SVG) ── */}
      <svg 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbf7f1" />
            <stop offset="50%" stopColor="#f6efe5" />
            <stop offset="100%" stopColor="#efe5d6" />
          </linearGradient>

          {/* Top-Left Silk Ribbons */}
          <linearGradient id="ribbonGold1" x1="0%" y1="0%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#edd2ad" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#faecd6" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#d8ab74" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f7e8ce" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="ribbonGold2" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#fcedd9" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#e2bc8a" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fdf7ed" stopOpacity="0.2" />
          </linearGradient>

          {/* Bottom-Right Silk Ribbons */}
          <linearGradient id="ribbonGold3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dfb784" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#faebd5" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#caa06b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f9f2e7" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="ribbonGold4" x1="0%" y1="80%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#edd8bc" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#d3a771" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#fbf6ee" stopOpacity="0.1" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#9c7a52" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Base Wash */}
        <rect width="1600" height="1000" fill="url(#bgGrad)" />

        {/* Top-Left Ribbon Wave 1 */}
        <path
          d="M -100 -50 C 150 80, 220 280, 80 420 C -20 520, -120 480, -150 350 Z"
          fill="url(#ribbonGold2)"
          filter="url(#softShadow)"
        />
        {/* Top-Left Ribbon Wave 2 (Broad swoosh) */}
        <path
          d="M -150 80 C 120 180, 260 120, 380 -50 C 240 -80, 50 -100, -150 -50 Z"
          fill="url(#ribbonGold1)"
          filter="url(#softShadow)"
        />

        {/* Bottom-Right Ribbon Wave 1 (Sweeping flowing curve) */}
        <path
          d="M 1750 650 C 1450 720, 1280 820, 1100 1050 C 1300 1080, 1600 1080, 1800 950 Z"
          fill="url(#ribbonGold4)"
          filter="url(#softShadow)"
        />
        {/* Bottom-Right Ribbon Wave 2 */}
        <path
          d="M 1800 780 C 1520 840, 1380 900, 1220 1080 C 1450 1100, 1750 1080, 1850 920 Z"
          fill="url(#ribbonGold3)"
          filter="url(#softShadow)"
        />
        {/* Subtle Bottom Swirl extending to left */}
        <path
          d="M 1350 870 C 1050 950, 750 1050, 400 1050 C 700 1080, 1100 1080, 1500 950 Z"
          fill="url(#ribbonGold2)"
          opacity="0.4"
        />
      </svg>

      {/* ── Outer Card (Matching Screenshot Container) ── */}
      <div className="w-full max-w-[480px] bg-[#fbf9f6]/90 backdrop-blur-xl border border-white/80 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(150,110,70,0.18)] relative z-10 flex flex-col items-center space-y-4 sm:space-y-5">
        
        {/* SC Monogram Logo Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[#dc2626] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-md shadow-red-600/30 shrink-0">
          SC
        </div>

        {/* Company Title & Location Pill */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#1e293b] tracking-tight leading-tight">
            SANMATI CONSTRUCTIONS
          </h1>
          
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#ffedd5] text-[11px] sm:text-xs font-bold text-[#c2410c] shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
            <span>Kolhapur, Maharashtra, India</span>
          </div>
        </div>

        {/* ── Inner White Login Card ── */}
        <div className="w-full bg-white rounded-2xl sm:rounded-[22px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          {/* Header with Red Accent Bar */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-6 bg-[#dc2626] rounded-full shrink-0" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Sign In to ERP Portal
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 pl-4">
              Enter your corporate credentials to access authorized modules.
            </p>
          </div>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-ping" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Company Email Field */}
            <div>
              <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                Company Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9]/70 focus:bg-white border border-slate-200/90 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-slate-900 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold transition-all placeholder:text-slate-400 outline-none shadow-2xs"
                  placeholder="name@sanmaticonstructions.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-800 font-bold text-xs">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact administrator at admin@sanmaticonstructions.com to reset credentials.')}
                  className="text-xs font-bold text-[#dc2626] hover:text-[#b91c1c] transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9]/70 focus:bg-white border border-slate-200/90 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono font-semibold transition-all placeholder:text-slate-400 outline-none shadow-2xs"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember this device (Red Checkbox matching Image 1) */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe ? 'bg-[#dc2626] text-white shadow-2xs' : 'border border-slate-300 bg-white'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-slate-700 text-xs font-semibold cursor-pointer select-none"
              >
                Remember this device
              </span>
            </div>

            {/* Sign In to Dashboard Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span className="text-xs sm:text-[13px]">{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ── Security & Footer Info inside Outer Card ── */}
        <div className="text-center text-[11px] text-slate-600 font-semibold flex items-center justify-center gap-1.5 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#d97706] shrink-0" />
          <span>SANMATI CONSTRUCTIONS ERP v2.6 • Secure End-to-End Encryption</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
