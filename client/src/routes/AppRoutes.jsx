// AppRoutes Component
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useERPData } from '../context/ERPDataContext';
import { Sidebar } from '../components/Sidebar';

// Pages & Modules
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { CRMModule } from '../modules/CRM/CRMModule';
import { AccountsModule } from '../modules/Accounts/AccountsModule';
import { VendorsModule } from '../modules/Vendors/VendorsModule';
import { TallyModule } from '../modules/Tally/TallyModule';
import { ReportsModule } from '../modules/Reports/ReportsModule';
import { HRMSModule } from '../modules/HRMS/HRMSModule';
import { GeotrackingModule } from '../modules/Geotracking/GeotrackingModule';
import { QuotationsModule } from '../modules/Quotations/QuotationsModule';
import { TendersModule } from '../modules/Tenders/TendersModule';
import { ProjectsModule } from '../modules/Projects/ProjectsModule';
import { BIModule } from '../modules/BI/BIModule';
import { MISModule } from '../modules/MIS/MISModule';
import { InventoryModule } from '../modules/Inventory/InventoryModule';
import { ExpensesModule } from '../modules/Expenses/ExpensesModule';
import { BudgetsModule } from '../modules/Budgets/BudgetsModule';
import { ApprovalsModule } from '../modules/Approvals/ApprovalsModule';
import { RolesModule } from '../modules/Roles/RolesModule';
import { GSTModule } from '../modules/GST/GSTModule';

const QUICK_SEARCH_MODULES = [
  { label: 'Dashboard', subtitle: 'Business Intelligence Overview', path: '/dashboard' },
  { label: 'Construction Projects', subtitle: 'Sites, BOQ & RA Bills', path: '/projects' },
  { label: 'Account Management', subtitle: 'Income, Expenses & Receivables', path: '/accounts' },
  { label: 'Vendor Management', subtitle: 'Purchases, POs & Payables', path: '/vendors' },
  { label: 'CRM Management', subtitle: 'Leads, Customers & Inquiries', path: '/crm' },
  { label: 'Expense Management', subtitle: 'Site Petty Cash & Imprest', path: '/expenses' },
  { label: 'Tally Integration', subtitle: 'Vouchers & Ledger Sync', path: '/tally' },
  { label: 'Custom Reports', subtitle: 'Financial & Site Exports', path: '/reports' },
  { label: 'BI Analytics', subtitle: 'Deep Profitability Metrics', path: '/bi' },
  { label: 'Quotation Management', subtitle: 'Estimates & Client Quotes', path: '/quotations' },
  { label: 'Tender Management', subtitle: 'Bids & Submissions', path: '/tenders' },
  { label: 'Inventory Management', subtitle: 'Material Stock & Site Issues', path: '/inventory' },
  { label: 'GST & Taxation', subtitle: 'Input Credit & Returns', path: '/gst' },
  { label: 'HRMS & Payroll', subtitle: 'Staff & Attendance', path: '/hrms' }
];

// Protected Route Guard
const ProtectedLayout = () => {
  const { currentUser, logout } = useAuth();
  const {
    projects = [],
    notifications = [],
    markNotificationRead,
    clearAllNotifications
  } = useERPData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const notifWrapperRef = useRef(null);
  const profileWrapperRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    const onOutsideClick = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifWrapperRef.current && !notifWrapperRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileWrapperRef.current && !profileWrapperRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onOutsideClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onOutsideClick);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return QUICK_SEARCH_MODULES.slice(0, 5);
    const projectMatches = projects
      .filter((p) => {
        const name = (p.name || p.projectName || '').toLowerCase();
        const client = (p.clientName || '').toLowerCase();
        return name.includes(q) || client.includes(q);
      })
      .slice(0, 4)
      .map((p) => ({
        label: p.name || p.projectName || 'Project',
        subtitle: `Project • ${p.status || 'Ongoing'}`,
        path: '/projects'
      }));
    const moduleMatches = QUICK_SEARCH_MODULES.filter(
      (m) => m.label.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)
    ).slice(0, 5);
    return [...projectMatches, ...moduleMatches].slice(0, 7);
  }, [searchQuery, projects]);

  const userName = currentUser?.name || 'Admin';
  const userRole = currentUser?.designation || currentUser?.role || 'Administrator';
  const userInitial = userName.charAt(0).toUpperCase();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile & Tablet Header Bar (Displays only on screens < 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#002046] text-white border-b border-[#001736] px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-white flex-shrink-0" viewBox="0 0 36 36" fill="currentColor">
              <path d="M3 17L8 12V34H3V17Z" opacity="0.95" />
              <path d="M10 8L16 2V34H10V8Z" />
              <path d="M18 12L24 6V34H18V12Z" />
              <path d="M26 16L31 12V34H26V16Z" opacity="0.95" />
              <rect x="2" y="33" width="31" height="2" rx="1" />
            </svg>
            <div>
              <span className="font-bold text-sm text-white block leading-tight">SANMATI CONSTRUCTIONS</span>
              <span className="text-[11px] text-blue-200/70 leading-tight">ADMIN CONTROL CENTER</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors"
          title="Sign Out"
        >
          <span>Sign Out</span>
        </button>
      </header>

      {/* Responsive Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafd]">
        {/* Desktop Top Header Bar - Exact Screenshot Match */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-3 items-center justify-between gap-5 shadow-2xs">
          {/* Left Sidebar Collapse Toggle */}
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Right Header Controls */}
          <div className="flex items-center gap-5">
            {/* Search Pill Input */}
            <div className="relative w-80" ref={searchWrapperRef}>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    navigate(searchResults[0].path);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                placeholder="Search anything..."
                className="w-full pl-10 pr-12 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#002855] rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002855] transition-all shadow-2xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5 pointer-events-none">
                <span>⌘</span><span>K</span>
              </div>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <button
                        key={`${item.path}-${item.label}-${idx}`}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex flex-col cursor-pointer"
                      >
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        <span className="text-[11px] text-slate-400">{item.subtitle}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2.5 text-xs text-slate-400">
                      No matching modules or projects
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifWrapperRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotifOpen((prev) => !prev);
                  setIsProfileOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative shadow-2xs cursor-pointer"
                title="Notifications"
                aria-expanded={isNotifOpen}
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 border-2 border-white" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-40">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">
                      Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                    </span>
                    {notifications.length > 0 && clearAllNotifications && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-[11px] font-semibold text-[#1d5ec4] hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 6).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            if (markNotificationRead) markNotificationRead(n.id);
                          }}
                          className={`w-full text-left px-2.5 py-2 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                            n.read ? 'text-slate-500' : 'text-slate-800 font-semibold'
                          }`}
                        >
                          <p className="leading-snug">{n.title || n.message || 'System update'}</p>
                          {n.time && <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>}
                        </button>
                      ))
                    ) : (
                      <div className="py-5 text-center text-xs text-slate-400">
                        No active notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={profileWrapperRef}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  setIsNotifOpen(false);
                }}
                aria-expanded={isProfileOpen}
                className="flex items-center gap-2.5 pl-2 cursor-pointer group text-left"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#002046] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {userInitial}
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 font-bold text-xs text-slate-900 group-hover:text-[#002855] transition-colors">
                    <span>{userName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#002855]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                    {userRole}
                  </span>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-40">
                  <div className="px-2.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userRole}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 p-4 sm:p-5 lg:p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectsModule />} />
              <Route path="/crm" element={<CRMModule />} />
              <Route path="/accounts" element={<AccountsModule />} />
              <Route path="/vendors" element={<VendorsModule />} />
              <Route path="/tally" element={<TallyModule />} />
              <Route path="/reports" element={<ReportsModule />} />
              <Route path="/hrms" element={<HRMSModule />} />
              <Route path="/geotracking" element={<GeotrackingModule />} />
              <Route path="/quotations" element={<QuotationsModule />} />
              <Route path="/tenders" element={<TendersModule />} />
              <Route path="/bi" element={<BIModule />} />
              <Route path="/mis" element={<MISModule />} />
              <Route path="/inventory" element={<InventoryModule />} />
              <Route path="/expenses" element={<ExpensesModule />} />
              <Route path="/budgets" element={<BudgetsModule />} />
              <Route path="/approvals" element={<ApprovalsModule />} />
              <Route path="/roles" element={<RolesModule />} />
              <Route path="/gst" element={<GSTModule />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  };

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
};
