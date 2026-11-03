// AppRoutes Component
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

// Protected Route Guard
const ProtectedLayout = () => {
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const location = useLocation();

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* Mobile & Tablet Header Bar (Displays only on screens < 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
              SC
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">SANMATI CONSTRUCTIONS</span>
              <span className="text-xs text-slate-500 leading-tight">Kolhapur HQ</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-bold transition-colors"
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

      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Desktop Top Header Bar - Exact Screenshot Match */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-slate-200/80 px-8 py-3.5 items-center justify-end gap-5 shadow-2xs">
          {/* Search Pill Input */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-12 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-400 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-400 transition-all shadow-2xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
              <span>⌘</span><span>K</span>
            </div>
          </div>

          {/* Notification Bell */}
          <button 
            className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative shadow-2xs cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#0080ff] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                A
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                <span>Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
              </div>
              <span className="text-xs text-slate-400 font-semibold leading-none mt-0.5">
                Administrator
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
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
