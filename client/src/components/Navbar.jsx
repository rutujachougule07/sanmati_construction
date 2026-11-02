// Navbar Component - Clean Header: Only Language & Sign Out Button
import React from 'react';
import { Menu, MapPin, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs px-4 md:px-6 py-2 flex items-center justify-between">
      {/* Left Section: Mobile Toggle & Screenshot Brand Pill Card */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company Card Pill matching screenshot */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1d68e4] to-cyan-400 p-[1.5px] shadow-2xs flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#0a1626] rounded-[6px] flex items-center justify-center font-black text-cyan-400 text-xs">
              SC
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs tracking-tight text-slate-900">
                SANMATI CONSTRUCTIONS
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-[#1d68e4]" />
              <span>Kolhapur, Maharashtra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: ONLY Language & Sign Out Button as requested */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Switcher */}
        <div className="flex items-center text-xs font-medium text-slate-600 gap-2">
          <button className="text-slate-900 font-bold hover:text-[#1d68e4] transition-colors">
            English
          </button>
          <span className="text-slate-300">|</span>
          <button className="text-slate-500 hover:text-slate-900 transition-colors">
            मराठी
          </button>
        </div>

        {/* Sign Out Button Pill */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
          title="Sign Out Session"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
