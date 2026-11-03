// Dashboard Page Component
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { 
  Building2, TrendingUp, DollarSign, Clock, Users, AlertTriangle, 
  CheckCircle, ArrowUpRight, ArrowDownRight, MapPin, HardHat, FileSpreadsheet 
} from 'lucide-react';
import { useERPData } from '../context/ERPDataContext';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { projects, raBills, inventory, approvals, hrmsEmployees, gpsLogs } = useERPData();
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('executive'); // executive, projects, attendance

  // Aggregated Financials
  const totalContractValue = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
  const totalRevenue = projects.reduce((acc, p) => acc + (p.billedAmount || 0), 0);
  const totalExpenses = projects.reduce((acc, p) => acc + (p.actualExpenditure || 0), 0);
  const totalProfit = projects.reduce((acc, p) => acc + (p.actualProfit || 0), 0);
  const totalOutstanding = projects.reduce((acc, p) => acc + (p.outstandingAmount || 0), 0);

  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Submitted').length;
  const lowStockCount = inventory.filter(i => i.status.includes('Low')).length;

  // Chart Data: Profitability & Budget Variance
  const profitabilityData = projects.map(p => ({
    name: p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name,
    contract: (p.contractValue || 0) / 100000, // In Lakhs
    budget: (p.projectBudget || 0) / 100000,
    actualCost: (p.actualExpenditure || 0) / 100000,
    profit: (p.actualProfit || 0) / 100000
  }));

  // Chart Data: Monthly Revenue & Expense Cashflow
  const monthlyCashflow = [
    { month: 'Jun', billing: 38, expenses: 28 },
    { month: 'Jul', billing: 45, expenses: 35 },
    { month: 'Aug', billing: 52, expenses: 40 },
    { month: 'Sep', billing: 65, expenses: 49 },
    { month: 'Oct', billing: 78, expenses: 58 },
    { month: 'Nov', billing: 92, expenses: 68 }
  ];

  // Project Progress Breakdown - Exact Screenshot Palette
  const projectStatusData = [
    { name: 'Completed (>80%)', value: 1, color: '#10b981' },
    { name: 'In Progress (30-80%)', value: 1, color: '#1d68e4' },
    { name: 'Early Stage (<30%)', value: 1, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Screenshot Telemetry Ribbon & Welcome Header */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1d68e4] mb-1">
              <span>Kolhapur Headquarters</span>
              <span>•</span>
              <span className="bg-blue-50 text-[#1d68e4] px-1.5 py-0.5 rounded border border-blue-200/60 font-semibold">ROOT CONTROL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Managing civil projects, BOQ accounts, live GPS geotracking, and Tally operations for SANMATI CONSTRUCTIONS.
            </p>
          </div>

          {/* View Switcher Buttons matching screenshot pill buttons */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
            <button
              onClick={() => setViewMode('executive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'executive' 
                  ? 'bg-white text-[#1d68e4] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'projects' 
                  ? 'bg-white text-[#1d68e4] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Site Execution
            </button>
            <button
              onClick={() => setViewMode('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'attendance' 
                  ? 'bg-white text-[#1d68e4] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GPS Logs
            </button>
          </div>
        </div>

        {/* Live Fleet & Telemetry Ribbon - Exact Screenshot 2 Match */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">Live Fleet Radar</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                1 ON DUTY
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Drivers:</span>
              <span className="font-bold text-slate-800">1 Transit</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Plant Staff:</span>
              <span className="font-bold text-slate-800">2 In-Plant</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Field Sites:</span>
              <span className="font-bold text-slate-800">1 Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50/70 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>GNSS Telemetry Live</span>
            </div>
          </div>

          <Link
            to="/geotracking"
            className="px-3.5 py-1.5 bg-[#1d68e4] hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Track Live Locations</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (10 Key Metric Cards) - Responsive for all window screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 md:gap-4">
        <StatCard
          title="Active Projects"
          value={`${activeProjectsCount} / ${projects.length}`}
          icon="HardHat"
          subtitle="All sites operational"
          accent="indigo"
          badgeText="Active Duty"
        />
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(totalContractValue)}
          icon="Building2"
          change="12% YoY"
          isPositive={true}
          accent="blue"
        />
        <StatCard
          title="Revenue (Billed)"
          value={formatCurrency(totalRevenue)}
          icon="TrendingUp"
          subtitle="Cumulative RA Bills"
          accent="emerald"
          badgeText="RA Verified"
        />
        <StatCard
          title="Actual Expenditure"
          value={formatCurrency(totalExpenses)}
          icon="DollarSign"
          subtitle="Labour + Materials"
          accent="purple"
          badgeText="Cost Incurred"
        />
        <StatCard
          title="Net Booked Profit"
          value={formatCurrency(totalProfit)}
          icon="TrendingUp"
          change="21.6% margin"
          isPositive={true}
          accent="emerald"
        />
        <StatCard
          title="Outstanding Dues"
          value={formatCurrency(totalOutstanding)}
          icon="Clock"
          subtitle="Receivable from clients"
          accent="amber"
          badgeText="Action Needed"
        />
        <StatCard
          title="Pending Approvals"
          value={`${pendingApprovalsCount}`}
          icon="AlertTriangle"
          subtitle="Action required"
          accent="amber"
          badgeText="Pending Review"
        />
        <StatCard
          title="Stock Alerts"
          value={`${lowStockCount}`}
          icon="AlertTriangle"
          subtitle="Items below threshold"
          accent="purple"
          badgeText="Threshold"
        />
        <StatCard
          title="Staff Attendance"
          value={`${hrmsEmployees.length} on duty`}
          icon="Users"
          subtitle="GPS verified"
          accent="emerald"
          badgeText="Biometric Sync"
        />
        <StatCard
          title="Tally Status"
          value="Synchronized"
          icon="CheckCircle"
          subtitle="ODBC Gateway 9000"
          accent="blue"
          badgeText="ODBC Ready"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Profitability & Budget Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Project Financials: Contract vs Budget vs Actual Cost
              </h3>
              <p className="text-xs text-slate-500">Values in INR (₹ Lakhs) across Kolhapur projects</p>
            </div>
            <Link to="/bi" className="text-xs text-[#1d68e4] font-semibold hover:underline flex items-center gap-1">
              Full BI View <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="contract" name="Contract Value" fill="#103a6c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Approved Budget" fill="#1d68e4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualCost" name="Actual Cost Incurred" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution & Alerts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
              Project Stage Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Overall project completion milestones</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {projectStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800">{item.value} Projects</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Active Project Highlights & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Tracker */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Active Construction Sites in Kolhapur
            </h3>
            <Link to="/projects" className="text-xs text-[#1d68e4] font-semibold hover:underline">
              View All Projects →
            </Link>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/90 hover:border-[#1d68e4]/60 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-[#1d68e4] font-bold">{proj.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#1d68e4]" />
                      {proj.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={proj.status} />
                    <span className="text-xs font-bold text-[#1d68e4]">{proj.completionPercentage}%</span>
                  </div>
                </div>

                {/* Progress Bar in Electric Blue */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#1d68e4] to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${proj.completionPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <div>Contract: <span className="text-slate-900 font-semibold">{formatCurrency(proj.contractValue)}</span></div>
                  <div>Spent: <span className="text-slate-900 font-semibold">{formatCurrency(proj.actualExpenditure)}</span></div>
                  <div>Billed: <span className="text-emerald-700 font-semibold">{formatCurrency(proj.billedAmount)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center: Pending Approvals & Alerts */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Pending Approvals ({pendingApprovalsCount})
              </h3>
              <Link to="/approvals" className="text-xs text-[#1d68e4] font-semibold hover:underline">
                Manage →
              </Link>
            </div>

            <div className="space-y-3">
              {approvals.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/90 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#1d68e4] uppercase text-[10px] tracking-wider">{app.type}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="font-semibold text-slate-900 truncate">{app.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/70 text-[10px] text-slate-500">
                    <span>By: {app.requester}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(app.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick GPS Geofence Check CTA matching screenshot */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-white to-sky-50/70 border border-blue-200/80 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-[#1d68e4] font-bold mb-1">
              <MapPin className="w-4 h-4" />
              <span>Site Geofence Attendance</span>
            </div>
            <p className="text-slate-600 text-[11px] mb-3">
              Authorize GPS check-in/out for active project site engineers and contractors.
            </p>
            <Link
              to="/geotracking"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1d68e4] hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              Open GPS Tracking Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
