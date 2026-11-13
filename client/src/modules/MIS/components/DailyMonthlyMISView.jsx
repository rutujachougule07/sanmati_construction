// SANMATI CONSTRUCTIONS ERP - Simplified Daily & Monthly Reports View
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import MISTable from './MISTable';

const DailyMonthlyMISView = ({ data, reportType, onReportTypeChange }) => {
  const { rows = [], totals = {} } = data || {};
  const netCash = (totals.paymentsReceived || 0) - (totals.paymentsMade || 0);

  const cards = [
    {
      label: 'Total Income (Earned)',
      value: formatCurrency(totals.totalIncome),
      sub: totals.customerAdvance > 0 ? `Excl. ${formatCurrency(totals.customerAdvance)} Advances` : 'Verified earned income',
      icon: TrendingUp,
      accent: 'text-emerald-700 bg-emerald-50'
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totals.totalExpenses),
      sub: `Payments made: ${formatCurrency(totals.paymentsMade)}`,
      icon: TrendingDown,
      accent: 'text-rose-700 bg-rose-50'
    },
    {
      label: 'Net Cash Position',
      value: formatCurrency(netCash),
      sub: `Pending dues: ${formatCurrency(totals.pendingPayments)}`,
      icon: Wallet,
      accent: 'text-[#0b449b] bg-blue-50'
    },
    {
      label: 'Attendance & DPRs',
      value: `${totals.presentCount || 0} Present`,
      sub: `${totals.dprCount || 0} DPRs • ${totals.gpsCheckIns || 0} GPS check-ins`,
      icon: Users,
      accent: 'text-[#002046] bg-slate-100'
    }
  ];

  const columns = [
    {
      key: 'reportDate',
      label: reportType === 'monthly' ? 'Month' : 'Date',
      render: (r) => <span className="font-semibold text-[#002046] whitespace-nowrap">{r.reportDate}</span>
    },
    {
      key: 'projectName',
      label: 'Project',
      render: (r) => <span className="font-medium text-slate-800">{r.projectName}</span>
    },
    {
      key: 'totalIncome',
      label: 'Income',
      align: 'right',
      render: (r) => <span className="font-semibold text-emerald-700">{formatCurrency(r.totalIncome)}</span>,
      totalRender: () => formatCurrency(totals.totalIncome)
    },
    {
      key: 'totalExpenses',
      label: 'Expenses',
      align: 'right',
      render: (r) => <span className="font-semibold text-rose-700">{formatCurrency(r.totalExpenses)}</span>,
      totalRender: () => formatCurrency(totals.totalExpenses)
    },
    {
      key: 'paymentsReceived',
      label: 'Received',
      align: 'right',
      render: (r) => formatCurrency(r.paymentsReceived),
      totalRender: () => formatCurrency(totals.paymentsReceived)
    },
    {
      key: 'paymentsMade',
      label: 'Paid',
      align: 'right',
      render: (r) => formatCurrency(r.paymentsMade),
      totalRender: () => formatCurrency(totals.paymentsMade)
    },
    {
      key: 'pendingPayments',
      label: 'Pending',
      align: 'right',
      render: (r) => (
        <span className={r.pendingPayments > 0 ? 'font-semibold text-amber-700' : 'text-slate-500'}>
          {formatCurrency(r.pendingPayments)}
        </span>
      ),
      totalRender: () => formatCurrency(totals.pendingPayments)
    },
    {
      key: 'workSummary',
      label: 'Work Summary',
      render: (r) => (
        <span className="text-xs text-slate-600 block max-w-[200px] truncate" title={r.workSummary}>
          {r.workSummary}
        </span>
      )
    },
    {
      key: 'attendanceSummary',
      label: 'Attendance',
      render: (r) => <span className="text-xs text-slate-700 whitespace-nowrap">{r.attendanceSummary}</span>
    },
    {
      key: 'materialSummary',
      label: 'Material Usage',
      render: (r) => (
        <span className="text-xs text-slate-600 block max-w-[180px] truncate" title={r.materialSummary}>
          {r.materialSummary}
        </span>
      )
    }
  ];

  const viewToggle = (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="tablist" aria-label="Grouping Mode">
      {[
        { id: 'daily', label: 'Daily' },
        { id: 'monthly', label: 'Monthly' }
      ].map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={reportType === opt.id}
          onClick={() => onReportTypeChange(opt.id)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            reportType === opt.id ? 'bg-[#002046] text-white' : 'text-slate-600 hover:text-[#002046]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

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

      {/* Clean Data Table */}
      <MISTable
        title={reportType === 'monthly' ? 'Monthly Activity & Cashflow Summary' : 'Daily Activity & Cashflow Summary'}
        columns={columns}
        rows={rows}
        headerRight={viewToggle}
        showTotals
        totalsLabel="Grand Total"
        defaultSortKey="reportDate"
        defaultSortDir="desc"
      />
    </div>
  );
};

export default DailyMonthlyMISView;
