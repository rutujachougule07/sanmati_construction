// Sidebar Component - Exact Screenshot Match: Deep Midnight Navy (#0a1626) & Solid Electric Blue (#1d68e4)
import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { MODULES_CONFIG, USER_ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const currentRole = currentUser?.role || USER_ROLES.EMPLOYEE;

  // Filter modules based on user's authorized role (Super Admin sees all modules)
  const accessibleModules = MODULES_CONFIG.filter(mod => {
    if (currentRole === USER_ROLES.SUPER_ADMIN) return true;
    return mod.roles.includes(currentRole);
  });

  // User initials for bottom avatar
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SA';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Deep Midnight Navy */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-64 h-screen bg-[#0a1626] border-r border-[#132238] flex flex-col transition-transform duration-200 ease-in-out shadow-2xl flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Card */}
        <div className="p-3.5 border-b border-[#132238] flex items-center justify-between bg-[#081220]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d68e4] to-cyan-400 p-[1.5px] shadow-sm flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-[#0a1626] rounded-[10px] flex items-center justify-center font-extrabold text-cyan-400 text-xs tracking-wider">
                SC
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white tracking-wide truncate">
                  SANMATI CONSTR
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span>Kolhapur, Sangli</span>
              </div>
              <div className="text-[9px] font-bold text-sky-400 tracking-wider uppercase">
                ADMIN
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-[#11233b] hover:bg-[#1a3356] border border-[#1d3557] flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Toggle Sidebar"
          >
            <Icons.ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section Header: NAVIGATION */}
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            NAVIGATION
          </span>
        </div>

        {/* Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1 custom-scrollbar">
          {accessibleModules.map((item) => {
            const IconComponent = Icons[item.icon] || Icons.CircleDot;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#1d68e4] text-white font-medium shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <Icons.ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                      isActive ? 'text-white opacity-90' : 'text-slate-500 opacity-60 group-hover:text-slate-300'
                    }`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section: ADMIN PORTALS & Session Card */}
        <div className="p-3 border-t border-[#132238] bg-[#081220]">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ADMIN PORTALS
            </span>
            <span className="text-[9px] font-bold text-sky-400 bg-sky-950/70 border border-sky-800/60 px-1.5 py-0.5 rounded tracking-wide">
              ALL ACCESS
            </span>
          </div>

          {/* User Profile Pill Card */}
          <div className="bg-[#0e2038] border border-blue-900/30 p-2 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#1d68e4] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate leading-tight">
                  {currentUser?.name || 'System Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  ADM-001 • Main HQ
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded flex-shrink-0">
              Admin
            </span>
          </div>

          {/* Sign Out Session Button */}
          <button
            onClick={logout}
            className="w-full mt-2 py-1.5 px-3 rounded-xl border border-[#182f4d] hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-all"
          >
            <Icons.LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

