// Login Page Component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, MapPin, Building, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

export const Login = () => {
  const { login, loading, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@sanmaticonstructions.com');
  const [password, setPassword] = useState('Sanmati@2026');
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleRoleQuickSelect = async (roleName, roleEmail) => {
    setEmail(roleEmail);
    const res = await login(roleEmail, 'demo');
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1115] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Construction Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-copper-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-copper-400 p-[2px] shadow-2xl mb-1">
            <div className="w-full h-full bg-[#12151b] rounded-[14px] flex items-center justify-center font-extrabold text-gold-400 text-xl font-heading">
              SC
            </div>
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            SANMATI CONSTRUCTIONS
          </h1>
          <p className="text-xs text-gold-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-copper-400" />
            <span>Kolhapur, Maharashtra, India</span>
          </p>
          <p className="text-xs text-slate-400">Enterprise Cloud ERP System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161a22] border border-[#27303e] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          <div className="border-b border-[#242b37] pb-3">
            <h2 className="text-base font-bold text-white font-heading">Sign In to ERP Portal</h2>
            <p className="text-xs text-slate-400">Enter your corporate credentials to access authorized modules.</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="erp-input pl-9 text-xs"
                  placeholder="name@sanmaticonstructions.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[11px] text-gold-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="erp-input pl-9 text-xs font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full erp-btn-primary text-xs py-2.5 font-bold flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-[#242b37] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              One-Click Role Demonstration
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect(USER_ROLES.SUPER_ADMIN, 'admin@sanmaticonstructions.com')}
                className="p-1.5 rounded bg-[#1c232e] hover:bg-gold-400 hover:text-black text-slate-300 font-semibold border border-[#2b3544] transition-colors truncate"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickSelect(USER_ROLES.PROJECT_MANAGER, 'pm@sanmaticonstructions.com')}
                className="p-1.5 rounded bg-[#1c232e] hover:bg-gold-400 hover:text-black text-slate-300 font-semibold border border-[#2b3544] transition-colors truncate"
              >
                👷 Project Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickSelect(USER_ROLES.SITE_ENGINEER, 'site@sanmaticonstructions.com')}
                className="p-1.5 rounded bg-[#1c232e] hover:bg-gold-400 hover:text-black text-slate-300 font-semibold border border-[#2b3544] transition-colors truncate"
              >
                📍 Site Engineer
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickSelect(USER_ROLES.ACCOUNTANT, 'accounts@sanmaticonstructions.com')}
                className="p-1.5 rounded bg-[#1c232e] hover:bg-gold-400 hover:text-black text-slate-300 font-semibold border border-[#2b3544] transition-colors truncate"
              >
                💼 Accountant
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          SANMATI CONSTRUCTIONS ERP v2.6 • Protected by Firebase Auth & Firestore Rules
        </div>
      </div>
    </div>
  );
};
