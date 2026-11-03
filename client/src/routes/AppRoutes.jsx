// AppRoutes Component
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col lg:flex-row text-slate-900">
      {/* Mobile & Tablet Header Bar (Displays only on screens < 1024px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0a1626] border-b border-[#132238] px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-[#11233b] hover:bg-[#1a3356] border border-[#1d3557] text-white transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1d68e4] to-cyan-400 p-[1px] flex items-center justify-center font-extrabold text-cyan-400 text-[10px]">
              SC
            </div>
            <div>
              <span className="font-bold text-xs text-white block leading-tight">SANMATI CONSTRUCTIONS</span>
              <span className="text-[10px] text-slate-400 leading-tight">Kolhapur HQ</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11233b] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#1d3557] text-[11px] font-semibold transition-colors"
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

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full min-w-0 p-3.5 sm:p-5 lg:p-6 xl:p-8">
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

          {/* Screenshot Exact Bottom Status Bar */}
          <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 md:px-6 py-1.5 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Active Session:</span>
              <span className="font-semibold text-slate-800">{currentUser?.name || 'System Administrator'}</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                {currentUser?.role || 'Admin'}
              </span>
              <span className="text-slate-400 hidden sm:inline">[ADM-001]</span>
              <span className="text-slate-500 hidden md:inline">• Plant: Kolhapur HQ</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>SCADA & Database Connected</span>
              <span>•</span>
              <span className="font-medium text-slate-700">SANMATI CONSTRUCTIONS Enterprise v2.4</span>
            </div>
          </footer>
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
