// Navbar Component - Clean Header: Only Language & Sign Out Button
import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs px-4 md:px-6 py-2 flex items-center justify-between">
      {/* Left Section: Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Section: Sign Out Button */}
      <div className="flex items-center gap-3">
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
