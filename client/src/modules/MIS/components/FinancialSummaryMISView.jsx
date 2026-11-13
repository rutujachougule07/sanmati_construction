// SANMATI CONSTRUCTIONS ERP - Simplified Financial Summary Reports View
import React from 'react';
import { TrendingUp, TrendingDown, Percent, ArrowUpRight, Info } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import MISTable from './MISTable';

const SUB_VIEWS = [
  { id: 'pnl', label: 'Profit & Loss' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expenses' },
  { id: 'cashflow', label: 'Cash Flow' },
  { id: 'outstanding', label: 'Outstanding' },
  { id: 'project_financial', label: 'Project-wise' }
];

const FinancialSummaryMISView = ({ data, financialSubType, onFinancialSubTypeChange }) => {
  const {
    summary = {},
    monthlySummary = [],
    projectFinancialRows = [],
    outstandingRows = [],
    incomeRows = [],
    expenseRows = [],
    tallyReconciliation = {}
  } = data || {};

  const cards = [
    {
      label: 'Earned Revenue',
      value: formatCurrency(summary.totalRevenue),
      sub: summary.customerAdvances > 0 ? `Excl. ${formatCurrency(summary.customerAdvances)} Advances` : `Cash received: ${formatCurrency(summary.paymentsReceived)}`,
      icon: TrendingUp,
      accent: 'text-emerald-700 bg-emerald-50'
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      sub: `Payments made: ${formatCurrency(summary.paymentsMade)}`,
      icon: TrendingDown,
      accent: 'text-rose-700 bg-rose-50'
    },
    {
      label: 'Net Profit',
      value: formatCurrency(summary.netProfit),
      sub: `Margin: ${summary.profitMarginPct || 0}% • Gross: ${formatCurrency(summary.grossProfit)}`,
      icon: Percent,
      accent: (summary.netProfit || 0) >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
    },
    {
      label: 'Receivables / Payables',
      value: formatCurrency(summary.outstandingReceivables),
      sub: `Payables: ${formatCurrency(summary.outstandingPayables)}`,
      icon: ArrowUpRight,
      accent: 'text-amber-700 bg-amber-50'
    }
  ];

  const subViewSwitcher = (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="tablist" aria-label="Financial Report View">
      {SUB_VIEWS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={financialSubType === opt.id}
          onClick={() => onFinancialSubTypeChange(opt.id)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            financialSubType === opt.id ? 'bg-[#002046] text-white' : 'text-slate-600 hover:text-[#002046]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const getTableConfig = () => {
    if (financialSubType === 'income') {
      return {
        title: 'Income Transactions',
        rows: incomeRows,
        showTotals: true,
        totalsLabel: 'Total',
        defaultSortKey: 'date',
        columns: [
          { key: 'date', label: 'Date', render: (r) => <span className="font-medium text-[#002046] whitespace-nowrap">{r.date}</span> },
          { key: 'projectName', label: 'Project' },
          { key: 'party', label: 'Party' },
          { key: 'category', label: 'Category' },
          { key: 'classification', label: 'Treatment' },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount), totalRender: () => formatCurrency(incomeRows.reduce((s, r) => s + r.amount, 0)) },
          { key: 'receivedAmount', label: 'Received', align: 'right', render: (r) => formatCurrency(r.receivedAmount), totalRender: () => formatCurrency(incomeRows.reduce((s, r) => s + r.receivedAmount, 0)) },
          { key: 'status', label: 'Status' }
        ]
      };
    }

    if (financialSubType === 'expense') {
      return {
        title: 'Expense Transactions',
        rows: expenseRows,
        showTotals: true,
        totalsLabel: 'Total',
        defaultSortKey: 'date',
        columns: [
          { key: 'date', label: 'Date', render: (r) => <span className="font-medium text-[#002046] whitespace-nowrap">{r.date}</span> },
          { key: 'projectName', label: 'Project' },
          { key: 'party', label: 'Vendor / Requester' },
          { key: 'category', label: 'Category' },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => <span className="text-rose-700 font-semibold">{formatCurrency(r.amount)}</span>, totalRender: () => formatCurrency(expenseRows.reduce((s, r) => s + r.amount, 0)) },
          { key: 'paidAmount', label: 'Paid', align: 'right', render: (r) => formatCurrency(r.paidAmount), totalRender: () => formatCurrency(expenseRows.reduce((s, r) => s + r.paidAmount, 0)) },
          { key: 'status', label: 'Status' }
        ]
      };
    }

    if (financialSubType === 'cashflow') {
      return {
        title: 'Monthly Cash Flow Summary',
        rows: monthlySummary,
        rowKey: 'ym',
        showTotals: true,
        totalsLabel: 'Total',
        defaultSortKey: 'ym',
        defaultSortDir: 'asc',
        columns: [
          { key: 'month', label: 'Month', render: (r) => <span className="font-semibold text-[#002046]">{r.month}</span> },
          { key: 'cashInflow', label: 'Cash Inflow', align: 'right', render: (r) => <span className="text-emerald-700 font-semibold">{formatCurrency(r.cashInflow)}</span>, totalRender: () => formatCurrency(summary.paymentsReceived) },
          { key: 'customerAdvances', label: 'Advances Included', align: 'right', render: (r) => formatCurrency(r.customerAdvances), totalRender: () => formatCurrency(summary.customerAdvances) },
          { key: 'cashOutflow', label: 'Cash Outflow', align: 'right', render: (r) => <span className="text-rose-700 font-semibold">{formatCurrency(r.cashOutflow)}</span>, totalRender: () => formatCurrency(summary.paymentsMade) },
          { key: 'netCashFlow', label: 'Net Cash Flow', align: 'right', render: (r) => <span className={`font-bold ${r.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(r.netCashFlow)}</span>, totalRender: () => formatCurrency(summary.netCashFlow) }
        ]
      };
    }

    if (financialSubType === 'outstanding') {
      return {
        title: 'Outstanding Receivables & Payables',
        rows: outstandingRows,
        showTotals: true,
        totalsLabel: 'Total Pending',
        defaultSortKey: 'pendingAmount',
        columns: [
          { key: 'type', label: 'Type', render: (r) => <span className={`font-semibold ${r.type === 'Receivable' ? 'text-emerald-700' : 'text-rose-700'}`}>{r.type}</span> },
          { key: 'party', label: 'Party', render: (r) => <span className="font-medium text-[#002046]">{r.party}</span> },
          { key: 'projectName', label: 'Project' },
          { key: 'date', label: 'Due Date' },
          { key: 'totalAmount', label: 'Total', align: 'right', render: (r) => formatCurrency(r.totalAmount), totalRender: () => formatCurrency(outstandingRows.reduce((s, r) => s + r.totalAmount, 0)) },
          { key: 'pendingAmount', label: 'Outstanding', align: 'right', render: (r) => <span className="font-bold text-amber-700">{formatCurrency(r.pendingAmount)}</span>, totalRender: () => formatCurrency(outstandingRows.reduce((s, r) => s + r.pendingAmount, 0)) },
          { key: 'status', label: 'Status' }
        ]
      };
    }

    if (financialSubType === 'project_financial') {
      return {
        title: 'Project-wise Financial Report',
        rows: projectFinancialRows,
        rowKey: 'projectId',
        showTotals: true,
        totalsLabel: 'Total',
        defaultSortKey: 'earnedRevenue',
        columns: [
          { key: 'projectName', label: 'Project', render: (r) => <span className="font-semibold text-[#002046]">{r.projectName}</span> },
          { key: 'earnedRevenue', label: 'Earned Revenue', align: 'right', render: (r) => <span className="text-emerald-700 font-semibold">{formatCurrency(r.earnedRevenue)}</span>, totalRender: () => formatCurrency(projectFinancialRows.reduce((s, r) => s + r.earnedRevenue, 0)) },
          { key: 'expenses', label: 'Expenses', align: 'right', render: (r) => <span className="text-rose-700 font-semibold">{formatCurrency(r.expenses)}</span>, totalRender: () => formatCurrency(projectFinancialRows.reduce((s, r) => s + r.expenses, 0)) },
          { key: 'netProfit', label: 'Net Profit', align: 'right', render: (r) => <span className={`font-bold ${r.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(r.netProfit)}</span>, totalRender: () => formatCurrency(projectFinancialRows.reduce((s, r) => s + r.netProfit, 0)) },
          { key: 'marginPct', label: 'Margin', align: 'right', render: (r) => `${r.marginPct}%` },
          { key: 'receivablePending', label: 'Receivables', align: 'right', render: (r) => formatCurrency(r.receivablePending), totalRender: () => formatCurrency(projectFinancialRows.reduce((s, r) => s + r.receivablePending, 0)) },
          { key: 'payablePending', label: 'Payables', align: 'right', render: (r) => formatCurrency(r.payablePending), totalRender: () => formatCurrency(projectFinancialRows.reduce((s, r) => s + r.payablePending, 0)) }
        ]
      };
    }

    // Default: Profit & Loss monthly table
    return {
      title: 'Profit & Loss Statement (Monthly)',
      rows: monthlySummary,
      rowKey: 'ym',
      showTotals: true,
      totalsLabel: 'Period Total',
      defaultSortKey: 'ym',
      defaultSortDir: 'asc',
      columns: [
        { key: 'month', label: 'Month', render: (r) => <span className="font-semibold text-[#002046]">{r.month}</span> },
        { key: 'earnedRevenue', label: 'Earned Revenue', align: 'right', render: (r) => <span className="text-emerald-700 font-semibold">{formatCurrency(r.earnedRevenue)}</span>, totalRender: () => formatCurrency(summary.totalRevenue) },
        { key: 'customerAdvances', label: 'Advances (Liability)', align: 'right', render: (r) => <span className="text-amber-700">{formatCurrency(r.customerAdvances)}</span>, totalRender: () => formatCurrency(summary.customerAdvances) },
        { key: 'expenses', label: 'Total Expenses', align: 'right', render: (r) => <span className="text-rose-700 font-semibold">{formatCurrency(r.expenses)}</span>, totalRender: () => formatCurrency(monthlySummary.reduce((s, r) => s + r.expenses, 0)) },
        { key: 'netProfit', label: 'Net Profit', align: 'right', render: (r) => <span className={`font-bold ${r.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(r.netProfit)}</span>, totalRender: () => formatCurrency(monthlySummary.reduce((s, r) => s + r.netProfit, 0)) }
      ]
    };
  };

  const tableConfig = getTableConfig();

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

      {/* Concise Accounting & Tally Status Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#0b449b]" aria-hidden="true" />
          Cancelled &amp; rejected entries excluded. Customer advances are segregated from Earned Revenue.
        </span>
        <span className="font-semibold text-[#002046]">
          Tally Status: {tallyReconciliation.syncState || 'Unavailable'}
        </span>
      </div>

      {/* Clean Data Table */}
      <MISTable {...tableConfig} headerRight={subViewSwitcher} />
    </div>
  );
};

export default FinancialSummaryMISView;
