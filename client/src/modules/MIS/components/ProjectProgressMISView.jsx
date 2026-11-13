// SANMATI CONSTRUCTIONS ERP - Simplified Project Progress Reports View
import React from 'react';
import { Building2, CheckCircle2, Wallet, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import MISTable from './MISTable';

const STATUS_BADGE = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Ongoing: 'bg-blue-50 text-[#0b449b]',
  'In Progress': 'bg-blue-50 text-[#0b449b]',
  Delayed: 'bg-rose-50 text-rose-700',
  Planned: 'bg-slate-100 text-slate-700'
};

const ProjectProgressMISView = ({ data }) => {
  const { rows = [], summary = {} } = data || {};

  const cards = [
    {
      label: 'Projects Tracked',
      value: `${summary.totalProjects || 0}`,
      sub: `${summary.completedProjects || 0} Completed • ${summary.delayedProjects || 0} Delayed`,
      icon: Building2,
      accent: 'text-[#002046] bg-blue-50'
    },
    {
      label: 'Avg Physical Completion',
      value: `${summary.avgCompletionPct || 0}%`,
      sub: 'Based on physical work progress',
      icon: CheckCircle2,
      accent: 'text-emerald-700 bg-emerald-50'
    },
    {
      label: 'Total Approved Budget',
      value: formatCurrency(summary.totalBudget),
      sub: `Remaining: ${formatCurrency(summary.remainingBudget)}`,
      icon: Wallet,
      accent: 'text-[#0b449b] bg-indigo-50'
    },
    {
      label: 'Actual Expenses',
      value: formatCurrency(summary.totalExpenses),
      sub: `Material + Labour: ${formatCurrency((summary.totalMaterialCost || 0) + (summary.totalLabourCost || 0))}`,
      icon: TrendingDown,
      accent: 'text-rose-700 bg-rose-50'
    }
  ];

  const columns = [
    {
      key: 'projectName',
      label: 'Project & Client',
      render: (r) => (
        <div>
          <p className="font-semibold text-[#002046]">{r.projectName}</p>
          <p className="text-[11px] text-slate-500">
            {r.projectCode} &bull; {r.clientName}
          </p>
        </div>
      )
    },
    {
      key: 'expectedCompletionDate',
      label: 'Due Date',
      render: (r) => (
        <div className="text-xs whitespace-nowrap">
          <span className={r.isDelayed ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
            {r.expectedCompletionDate}
          </span>
          {r.delayDays > 0 && <span className="block text-[10px] text-rose-600">{r.delayDays}d overdue</span>}
        </div>
      )
    },
    {
      key: 'projectStatus',
      label: 'Status',
      render: (r) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            STATUS_BADGE[r.projectStatus] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {r.projectStatus}
        </span>
      )
    },
    {
      key: 'completionPct',
      label: 'Progress %',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${r.isDelayed ? 'bg-rose-600' : 'bg-[#0b449b]'}`}
              style={{ width: `${Math.min(100, Math.max(0, r.completionPct))}%` }}
            />
          </div>
          <span className="font-bold text-[#002046] tabular-nums w-9 text-right">{r.completionPct}%</span>
        </div>
      ),
      totalRender: () => `Avg ${summary.avgCompletionPct || 0}%`
    },
    {
      key: 'totalBudget',
      label: 'Budget',
      align: 'right',
      render: (r) => formatCurrency(r.totalBudget),
      totalRender: () => formatCurrency(summary.totalBudget)
    },
    {
      key: 'actualExpenses',
      label: 'Actual Expenses',
      align: 'right',
      render: (r) => (
        <span className={r.isOverBudget ? 'font-semibold text-rose-700' : 'text-slate-800'}>
          {formatCurrency(r.actualExpenses)}
        </span>
      ),
      totalRender: () => formatCurrency(summary.totalExpenses)
    },
    {
      key: 'remainingBudget',
      label: 'Remaining',
      align: 'right',
      render: (r) => (
        <span className={`font-semibold ${r.remainingBudget < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
          {formatCurrency(r.remainingBudget)}
        </span>
      ),
      totalRender: () => formatCurrency(summary.remainingBudget)
    },
    {
      key: 'completedTasks',
      label: 'Tasks (Done/Pend/Del)',
      align: 'center',
      render: (r) => (
        <span className="text-xs font-medium whitespace-nowrap">
          {r.completedTasks} / {r.pendingTasks} / <span className={r.delayedTasks > 0 ? 'text-rose-600 font-bold' : ''}>{r.delayedTasks}</span>
        </span>
      ),
      totalRender: () => `${summary.completedTasks || 0} / ${summary.pendingTasks || 0} / ${summary.delayedTasks || 0}`
    }
  ];

  return (
    <div className="space-y-5">
      {(summary.delayedProjects || 0) > 0 && (
        <div role="status" className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          <span>
            {summary.delayedProjects} project(s) are currently behind schedule or have reported delays.
          </span>
        </div>
      )}

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

      {/* Project Progress Table */}
      <MISTable
        title="Project Progress & Budget Status"
        columns={columns}
        rows={rows}
        showTotals
        totalsLabel="Portfolio Total"
        rowClassName={(r) => (r.isDelayed ? 'bg-rose-50/40' : '')}
        defaultSortKey="completionPct"
        defaultSortDir="desc"
      />
    </div>
  );
};

export default ProjectProgressMISView;
