// Navbar Component
import React, { useState } from 'react';
import { Menu, Bell, Shield, MapPin, User, LogOut, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useERPData } from '../context/ERPDataContext';
import { USER_ROLES } from '../utils/constants';

export const Navbar = ({ onToggleSidebar }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { notifications, markNotificationRead, clearAllNotifications } = useERPData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs px-4 md:px-6 py-2 flex items-center justify-between">
      {/* Left Section: Mobile Toggle & Screenshot Brand Pill Card */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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

      {/* Right Section: English/Marathi Toggle, Role, Notifications & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Switcher matching screenshot */}
        <div className="hidden sm:flex items-center text-xs font-medium text-slate-600 gap-2 border-r border-slate-200 pr-3">
          <button className="text-slate-900 font-bold hover:text-[#1d68e4] transition-colors">
            English
          </button>
          <span className="text-slate-300">|</span>
          <button className="text-slate-500 hover:text-slate-900 transition-colors">
            मराठी
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifMenu(false); setShowUserMenu(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-[#1d68e4]" />
            <span className="hidden md:inline text-slate-500">Role:</span>
            <span className="font-semibold text-slate-800 max-w-[110px] truncate">
              {currentUser?.role || 'Guest'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Switch Operational Role
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {Object.values(USER_ROLES).map((role) => (
                  <button
                    key={role}
                    onClick={() => { switchRole(role); setShowRoleMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentUser?.role === role 
                        ? 'bg-gold-50 text-gold-700 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{role}</span>
                    {currentUser?.role === role && <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GPS Live Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GPS Active</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifMenu(!showNotifMenu); setShowRoleMenu(false); setShowUserMenu(false); }}
            className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-copper-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-heading">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] text-slate-500 hover:text-gold-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        notif.read ? 'opacity-60' : 'bg-gold-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                          notif.type === 'warning' ? 'text-amber-500' : notif.type === 'success' ? 'text-emerald-500' : 'text-sky-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No recent notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowRoleMenu(false); setShowNotifMenu(false); }}
            className="flex items-center gap-2 p-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-[#1d68e4] text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name ? currentUser.name[0] : 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs pr-1">
              <div className="font-semibold text-slate-800 truncate max-w-[100px]">{currentUser?.name}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded border border-blue-200 font-medium">
                  {currentUser?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Screenshot Sign Out Button Pill */}
        <button
          onClick={logout}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
