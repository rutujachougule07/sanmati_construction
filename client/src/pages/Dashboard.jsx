// Dashboard Page Component - Exact Screenshot Theme Match (Plus Jakarta Sans, Pure White Cards, Coral/Red Accents)
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { 
  Building2, TrendingUp, DollarSign, Clock, Users, AlertTriangle, 
  CheckCircle, ArrowUpRight, ArrowDownRight, MapPin, HardHat, FileSpreadsheet,
  Mail, Image as ImageIcon, CheckCircle2, ArrowRight, ShieldCheck, Activity
} from 'lucide-react';
import { useERPData } from '../context/ERPDataContext';
import { useAuth } from '../context/AuthContext';
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

  // Project Progress Breakdown
  const projectStatusData = [
    { name: 'Completed (>80%)', value: 1, color: '#10b981' },
    { name: 'In Progress (30-80%)', value: 1, color: '#dc2626' },
    { name: 'Early Stage (<30%)', value: 1, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Row - Exact Screenshot Match */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            {/* Red Trend Pill Badge: ↗ System Overview */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-500 border border-red-200/80 text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span>System Overview</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Overview of your website content
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/crm?tab=leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <span>+ Add Inquiry</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards - Exact Screenshot Match */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Hero Banners */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-100">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block leading-tight">
                Hero Banners
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                4 Slides
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Homepage Slider</span>
            <span className="px-3 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
              + 31%
            </span>
          </div>
        </div>

        {/* Card 2: Website Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block leading-tight">
                Website Status
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <span>Active</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">All systems working</span>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
              ↑ 100%
            </span>
          </div>
        </div>

        {/* Card 3: Team Members */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block leading-tight">
                Team Members
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {hrmsEmployees?.length || 8} Members
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">-2 this month</span>
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-xs font-bold">
              ↑ 38%
            </span>
          </div>
        </div>

        {/* Card 4: Inquiries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 border border-rose-100">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block leading-tight">
                Inquiries
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                2 Messages
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-rose-600">1 new unread</span>
            <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold">
              ↑ 23%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recent Customer Inquiries Card - Exact Screenshot Match */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Recent Customer Inquiries
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Latest project inquiries received via website contact form
            </p>
          </div>
          <Link
            to="/crm"
            className="text-xs font-bold text-[#b91c1c] hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All Inquiries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Inquiry Items List */}
        <div className="space-y-3">
          {/* Row 1: rishabh (In Progress) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-500 font-bold flex items-center justify-center text-base flex-shrink-0">
                R
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  rishabh
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 truncate">
                  Query regarding Sangli Office
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
              <span className="text-sm text-slate-400 font-medium hidden sm:block">
                Oct 3, 2026 04:28 PM
              </span>
              <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
                In Progress
              </span>
            </div>
          </div>

          {/* Row 2: Cherrylee Samson (Highlighted with dark red left border, NEW badge, and New status) */}
          <div className="border-l-4 border-[#881337] bg-red-50/25 p-4 rounded-r-xl flex items-center justify-between transition-colors shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#881337] text-white font-bold flex items-center justify-center text-base flex-shrink-0 shadow-xs">
                C
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    Cherrylee Samson
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#881337] text-white text-xs font-black uppercase tracking-wider leading-none">
                    NEW
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#881337] mt-0.5 truncate">
                  Technical Inquiry for Sangli Office
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
              <span className="text-sm text-slate-400 font-medium hidden sm:block">
                Oct 20, 2026 06:13 AM
              </span>
              <span className="px-4 py-1 rounded-full bg-white text-red-600 border border-red-200 text-xs font-bold shadow-2xs">
                New
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Construction ERP Telemetry Ribbon & Quick Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              <span>Kolhapur Headquarters</span>
              <span>•</span>
              <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md border border-red-200 font-bold">
                ERP OPERATIONS
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Civil Construction & Financial Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Managing civil projects, BOQ accounts, live GPS geotracking, and Tally operations for SANMATI CONSTRUCTIONS.
            </p>
          </div>

          {/* View Switcher Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
            <button
              onClick={() => setViewMode('executive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'executive' 
                  ? 'bg-white text-red-600 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setViewMode('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'projects' 
                  ? 'bg-white text-red-600 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Site Execution
            </button>
            <button
              onClick={() => setViewMode('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'attendance' 
                  ? 'bg-white text-red-600 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GPS Logs
            </button>
          </div>
        </div>

        {/* Live Fleet Radar Ribbon */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">Live Fleet Radar</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                1 ON DUTY
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Drivers:</span>
              <span className="font-bold text-slate-800">1 Transit</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Plant Staff:</span>
              <span className="font-bold text-slate-800">2 In-Plant</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Field Sites:</span>
              <span className="font-bold text-slate-800">1 Active</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50/70 px-3 py-0.5 rounded-full border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>GNSS Telemetry Live</span>
            </div>
          </div>

          <Link
            to="/geotracking"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Track Live Locations</span>
          </Link>
        </div>
      </div>

      {/* 5. Construction ERP KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">Total Contract</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-lg font-bold text-slate-900">{formatCurrency(totalContractValue)}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">All sanctioned works</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">Revenue (Billed)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-lg font-bold text-slate-900">{formatCurrency(totalRevenue)}</span>
          </div>
          <span className="text-xs text-emerald-600 font-bold">RA Verified</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">Expenditure</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-lg font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Material + Labour</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-lg font-bold text-emerald-700">{formatCurrency(totalProfit)}</span>
          </div>
          <span className="text-xs text-emerald-600 font-bold">21.6% margin</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-500">Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-lg font-bold text-slate-900">{formatCurrency(totalOutstanding)}</span>
          </div>
          <span className="text-xs text-amber-600 font-semibold">Receivable from clients</span>
        </div>
      </div>

      {/* 6. Main Financial Charts & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Profitability & Budget Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Project Financials: Contract vs Budget vs Actual Cost
              </h3>
              <p className="text-sm text-slate-500">Values in INR (₹ Lakhs) across Kolhapur projects</p>
            </div>
            <Link to="/bi" className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1">
              Full BI View <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar dataKey="contract" name="Contract Value" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Approved Budget" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualCost" name="Actual Cost Incurred" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-heading mb-1">
              Project Stage Distribution
            </h3>
            <p className="text-sm text-slate-500 mb-4">Overall project completion milestones</p>
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
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {projectStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{item.value} Projects</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Active Construction Sites & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Tracker */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900 font-heading">
              Active Construction Sites in Kolhapur
            </h3>
            <Link to="/projects" className="text-sm text-red-600 font-bold hover:underline">
              View All Projects →
            </Link>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 hover:border-red-400 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-red-600 font-bold">{proj.id}</span>
                    <h4 className="text-base font-bold text-slate-900">{proj.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      {proj.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={proj.status} />
                    <span className="text-xs font-bold text-red-600">{proj.completionPercentage}%</span>
                  </div>
                </div>

                {/* Progress Bar in Coral Red */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden my-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${proj.completionPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs sm:text-[13px] text-slate-600">
                  <div>Contract: <span className="text-slate-900 font-bold">{formatCurrency(proj.contractValue)}</span></div>
                  <div>Spent: <span className="text-slate-900 font-bold">{formatCurrency(proj.actualExpenditure)}</span></div>
                  <div>Billed: <span className="text-emerald-700 font-bold">{formatCurrency(proj.billedAmount)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center: Pending Approvals & Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                Pending Approvals ({pendingApprovalsCount})
              </h3>
              <Link to="/approvals" className="text-sm text-red-600 font-bold hover:underline">
                Manage →
              </Link>
            </div>

            <div className="space-y-3">
              {approvals.slice(0, 4).map((app) => (
                <div key={app.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-600 uppercase text-xs tracking-wider">{app.type}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="font-bold text-slate-900 truncate">{app.title}</p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/70 text-xs text-slate-500">
                    <span>By: {app.requester}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(app.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick GPS Geofence Check CTA */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-red-50/40 via-white to-rose-50/30 border border-red-200/70 text-sm shadow-2xs">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
              <MapPin className="w-4 h-4" />
              <span>Site Geofence Attendance</span>
            </div>
            <p className="text-slate-500 text-xs mb-3">
              Authorize GPS check-in/out for active project site engineers and contractors in Kolhapur & Sangli.
            </p>
            <Link
              to="/geotracking"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-2xs"
            >
              Open GPS Tracking Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
