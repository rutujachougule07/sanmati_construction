// SANMATI CONSTRUCTIONS ERP - Simplified Executive Management Reports View
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Building2, TrendingUp, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import MISTable from './MISTable';

const MGMT_VIEWS = [
  { id: 'projects', label: 'Projects' },
  { id: 'departments', label: 'Departments' },
  { id: 'employees', label: 'Employees' },
  { id: 'approvals', label: 'Pending Approvals' }
];

const ManagementMISView = ({ data }) => {
  const [tableView, setTableView] = useState('projects');

  const {
    executiveKPIs = {},
    projectPerformance = [],
    departmentPerformance = [],
    employeePerformance = [],
    pendingApprovals = [],
    growthTrends = [],
    risks = [],
    insights = []
  } = data || {};

  const cards = [
    {
      label: 'Projects Portfolio',
      value: `${executiveKPIs.totalProjects || 0} Total`,
      sub: `${executiveKPIs.activeProjects || 0} Active • ${executiveKPIs.completedProjects || 0} Done • ${executiveKPIs.delayedProjects || 0} Delayed`,
      icon: Building2,
      accent: 'text-[#002046] bg-blue-50'
    },
    {
      label: 'Earned Revenue',
      value: formatCurrency(executiveKPIs.totalRevenue),
      sub: `Expenses: ${formatCurrency(executiveKPIs.totalExpenses)}`,
      icon: TrendingUp,
      accent: 'text-[#0b449b] bg-indigo-50'
    },
    {
      label: 'Net Profit',
      value: formatCurrency(executiveKPIs.netProfit),
      sub: `Margin: ${executiveKPIs.profitMarginPct || 0}%`,
      icon: CheckCircle2,
      accent: (executiveKPIs.netProfit || 0) >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
    },
    {
      label: 'Pending Approvals & Dues',
      value: `${executiveKPIs.pendingApprovalsCount || 0} Pending`,
      sub: `Receivables: ${formatCurrency(executiveKPIs.outstandingReceivables)}`,
      icon: Clock,
      accent: 'text-amber-700 bg-amber-50'
    }
  ];

  const viewToggle = (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="tablist" aria-label="Management Breakdown">
      {MGMT_VIEWS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={tableView === opt.id}
          onClick={() => setTableView(opt.id)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            tableView === opt.id ? 'bg-[#002046] text-white' : 'text-slate-600 hover:text-[#002046]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const getTableProps = () => {
    if (tableView === 'departments') {
      return {
        title: 'Department-wise Performance',
        rows: departmentPerformance,
        rowKey: 'department',
        defaultSortKey: 'expenses',
        columns: [
          { key: 'department', label: 'Department', render: (r) => <span className="font-semibold text-[#002046]">{r.department}</span> },
          { key: 'headcount', label: 'Staff', align: 'right' },
          { key: 'revenue', label: 'Revenue', align: 'right', render: (r) => formatCurrency(r.revenue) },
          { key: 'expenses', label: 'Expenses', align: 'right', render: (r) => formatCurrency(r.expenses) },
          { key: 'pendingApprovals', label: 'Pending Approvals', align: 'right' },
          { key: 'attendanceRatePct', label: 'Attendance', align: 'right', render: (r) => (r.attendanceRatePct !== null ? `${r.attendanceRatePct}%` : 'Unavailable') }
        ]
      };
    }

    if (tableView === 'employees') {
      return {
        title: 'Employee Activity Summary',
        rows: employeePerformance,
        defaultSortKey: 'presentDays',
        columns: [
          { key: 'name', label: 'Employee', render: (r) => <span className="font-semibold text-[#002046]">{r.name}</span> },
          { key: 'designation', label: 'Designation' },
          { key: 'department', label: 'Department' },
          { key: 'presentDays', label: 'Present Days', align: 'right', render: (r) => (r.markedDays > 0 ? `${r.presentDays}/${r.markedDays}` : 'No log') },
          { key: 'gpsCheckIns', label: 'GPS Logs', align: 'right' },
          { key: 'dprSubmitted', label: 'DPRs', align: 'right' }
        ]
      };
    }

    if (tableView === 'approvals') {
      return {
        title: 'Pending Approvals Queue',
        rows: pendingApprovals,
        defaultSortKey: 'amount',
        columns: [
          { key: 'category', label: 'Category', render: (r) => <span className="font-semibold text-[#002046]">{r.category}</span> },
          { key: 'title', label: 'Request' },
          { key: 'requester', label: 'Requester' },
          { key: 'date', label: 'Date' },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'status', label: 'Status' }
        ]
      };
    }

    return {
      title: 'Project-wise Performance',
      rows: projectPerformance,
      rowKey: 'projectId',
      showTotals: true,
      totalsLabel: 'Total',
      defaultSortKey: 'earnedRevenue',
      columns: [
        { key: 'projectName', label: 'Project', render: (r) => <span className="font-semibold text-[#002046]">{r.projectName}</span> },
        { key: 'projectStatus', label: 'Status' },
        { key: 'completionPct', label: 'Progress %', align: 'right', render: (r) => `${r.completionPct}%` },
        { key: 'earnedRevenue', label: 'Revenue', align: 'right', render: (r) => <span className="text-emerald-700 font-semibold">{formatCurrency(r.earnedRevenue)}</span>, totalRender: () => formatCurrency(projectPerformance.reduce((s, r) => s + r.earnedRevenue, 0)) },
        { key: 'expenses', label: 'Expenses', align: 'right', render: (r) => <span className="text-rose-700 font-semibold">{formatCurrency(r.expenses)}</span>, totalRender: () => formatCurrency(projectPerformance.reduce((s, r) => s + r.expenses, 0)) },
        { key: 'netProfit', label: 'Net Profit', align: 'right', render: (r) => <span className={`font-bold ${r.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(r.netProfit)}</span>, totalRender: () => formatCurrency(projectPerformance.reduce((s, r) => s + r.netProfit, 0)) },
        { key: 'marginPct', label: 'Margin', align: 'right', render: (r) => `${r.marginPct}%` }
      ]
    };
  };

  const tableProps = getTableProps();

  return (
    <div className="space-y-5">
      {/* 4 Clean Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.accent}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <p className="text-lg font-bold text-[#002046] tabular-nums">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Business Growth Chart & Key Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#002046] mb-3">Business Performance Trend</h3>
          {growthTrends.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No monthly trend data for selected dates.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthTrends} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="earnedRevenue" name="Revenue" fill="#002046" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#002046] inline-flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" aria-hidden="true" />
            Key Risks &amp; Insights
          </h3>
          {risks.length === 0 && insights.length === 0 ? (
            <p className="text-xs text-slate-500">No active risks flagged for this period.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {risks.slice(0, 3).map((r) => (
                <li key={r.id} className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-900">
                  <strong className="block">{r.title}</strong>
                  <span className="text-[11px] opacity-85">{r.detail}</span>
                </li>
              ))}
              {insights.slice(0, 2).map((txt, idx) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                  {txt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Unified Executive Table */}
      <MISTable {...tableProps} headerRight={viewToggle} />
    </div>
  );
};

export default ManagementMISView;
