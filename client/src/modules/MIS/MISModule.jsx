// SANMATI CONSTRUCTIONS ERP - Simplified Management Information System (MIS) Module
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  PieChart as PieChartIcon,
  CalendarDays,
  BarChart3,
  Landmark,
  Briefcase,
  Lock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileDown,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  DAILY_MONTHLY_TYPES,
  FINANCIAL_REPORT_SUBTYPES,
  getCurrentFinancialYearCode,
  resolveFilterDateRange,
  readExternalERPStates,
  fetchServerMISAudit,
  sanitizeMISERPData,
  computeDailyMonthlyMIS,
  computeProjectProgressMIS,
  computeFinancialSummaryMIS,
  computeManagementMIS
} from '../../utils/misAnalyticsEngine';
import {
  generateMISReportPDF,
  exportMISReportExcel,
  triggerMISPrintReport
} from '../../services/misExportService';

import MISCommonFilters from './components/MISCommonFilters';
import DailyMonthlyMISView from './components/DailyMonthlyMISView';
import ProjectProgressMISView from './components/ProjectProgressMISView';
import FinancialSummaryMISView from './components/FinancialSummaryMISView';
import ManagementMISView from './components/ManagementMISView';
import { MISPrintableSheet } from './components/MISReportPreviewModal';

const MIS_SECTIONS = [
  {
    id: 'daily-monthly',
    label: 'Daily & Monthly Reports',
    description: 'Daily and monthly summary of income, expenses, payments, attendance, and material usage.',
    icon: CalendarDays,
    allowedRoles: null
  },
  {
    id: 'project-progress',
    label: 'Project Progress Reports',
    description: 'Track project completion, milestones, budget vs actual expenses, and delayed tasks.',
    icon: BarChart3,
    allowedRoles: null
  },
  {
    id: 'financial-summary',
    label: 'Financial Summary Reports',
    description: 'Review revenue, expenses, profit & loss, cash flow, and outstanding receivables or payables.',
    icon: Landmark,
    allowedRoles: ['Super Admin / Owner', 'Accountant', 'Project Manager']
  },
  {
    id: 'management',
    label: 'Management Reports',
    description: 'Executive overview of company performance, departments, staff metrics, and critical risks.',
    icon: Briefcase,
    allowedRoles: ['Super Admin / Owner', 'Project Manager', 'Accountant', 'HR Manager']
  }
];

const createDefaultFilters = () => {
  const fyCode = getCurrentFinancialYearCode();
  const range = resolveFilterDateRange({ periodPreset: 'financial_year', financialYear: fyCode });
  return {
    startDate: range.start || '',
    endDate: range.end || '',
    projectId: 'ALL'
  };
};

const validateDraftFilters = (filters) => {
  const hasStart = Boolean(filters.startDate);
  const hasEnd = Boolean(filters.endDate);
  if (hasStart !== hasEnd) {
    return 'Please select both From Date and To Date, or click Reset.';
  }
  if (hasStart && hasEnd && filters.startDate > filters.endDate) {
    return 'Invalid Date Range: From Date cannot be later than To Date.';
  }
  return '';
};

const buildEngineFilters = (appliedFilters, reportType) => {
  const hasBothDates = Boolean(appliedFilters.startDate && appliedFilters.endDate);
  return {
    periodPreset: hasBothDates ? 'custom' : 'all_time',
    financialYear: getCurrentFinancialYearCode(),
    startDate: hasBothDates ? appliedFilters.startDate : '',
    endDate: hasBothDates ? appliedFilters.endDate : '',
    projectId: appliedFilters.projectId || 'ALL',
    department: 'ALL',
    status: 'ALL',
    reportType,
    search: ''
  };
};

const MISModule = () => {
  const erpData = useERPData() || {};
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeSectionMeta = useMemo(
    () => MIS_SECTIONS.find((s) => s.id === tabParam) || null,
    [tabParam]
  );
  const activeTab = activeSectionMeta ? activeSectionMeta.id : null;

  const [draftFilters, setDraftFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(createDefaultFilters);
  const [dailyReportType, setDailyReportType] = useState('daily');
  const [financialSubType, setFinancialSubType] = useState('pnl');
  const [validationError, setValidationError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [serverError, setServerError] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  const userRole = currentUser?.role || '';
  const isSectionAuthorized = Boolean(
    activeSectionMeta &&
      (!activeSectionMeta.allowedRoles || activeSectionMeta.allowedRoles.includes(userRole))
  );

  const engineFilters = useMemo(
    () => buildEngineFilters(appliedFilters, dailyReportType),
    [appliedFilters, dailyReportType]
  );

  const externalData = useMemo(() => {
    void refreshTick;
    return readExternalERPStates();
  }, [refreshTick, activeTab, erpData.projects, erpData.hrmsEmployees, erpData.tallyConfig]);

  const runBackendVerification = useCallback(
    async (targetSection, targetEngineFilters) => {
      if (!targetSection) return;
      setIsGenerating(true);
      const result = await fetchServerMISAudit({
        section: targetSection,
        filters: targetEngineFilters,
        userRole
      });
      setIsGenerating(false);

      if (result.reachable && result.status === 403) {
        setServerError(result.error || 'Restricted by role-based access control.');
        return;
      }
      if (result.reachable && !result.ok) {
        setServerError(
          Array.isArray(result.errors) ? result.errors.join(' ') : result.error || 'Filter validation warning.'
        );
        return;
      }
      setServerError('');
    },
    [userRole]
  );

  useEffect(() => {
    if (!activeTab) {
      setServerError('');
      return;
    }
    runBackendVerification(activeTab, engineFilters);
  }, [activeTab, engineFilters, runBackendVerification]);

  const handleOpenReport = (sectionId) => {
    setActionFeedback(null);
    setValidationError('');
    setSearchParams({ tab: sectionId });
  };

  const handleBackToLanding = () => {
    setActionFeedback(null);
    setValidationError('');
    setServerError('');
    setSearchParams({});
  };

  const handleDraftFilterChange = (patch) => {
    const next = { ...draftFilters, ...patch };
    const err = validateDraftFilters(next);
    setDraftFilters(next);
    setValidationError(err);
    if (!err) {
      setAppliedFilters(next);
    }
  };

  const handleGenerateReport = async () => {
    const err = validateDraftFilters(draftFilters);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    const nextApplied = { ...draftFilters };
    setAppliedFilters(nextApplied);
    setRefreshTick((t) => t + 1);
    const nextEngineFilters = buildEngineFilters(nextApplied, dailyReportType);
    await runBackendVerification(activeTab, nextEngineFilters);
    setActionFeedback({ type: 'success', text: 'Report updated from latest ERP data.' });
  };

  const handleResetFilters = async () => {
    const defaults = createDefaultFilters();
    setDraftFilters(defaults);
    setAppliedFilters(defaults);
    setValidationError('');
    setRefreshTick((t) => t + 1);
    const nextEngineFilters = buildEngineFilters(defaults, dailyReportType);
    await runBackendVerification(activeTab, nextEngineFilters);
    setActionFeedback({ type: 'info', text: 'Filters reset to current Financial Year.' });
  };

  const handleDailyReportTypeChange = (nextType) => {
    setDailyReportType(nextType);
  };

  const dailyMonthlyData = useMemo(
    () => (activeTab === 'daily-monthly' ? computeDailyMonthlyMIS(erpData, externalData, engineFilters) : null),
    [activeTab, erpData, externalData, engineFilters]
  );

  const projectProgressData = useMemo(
    () => (activeTab === 'project-progress' ? computeProjectProgressMIS(erpData, externalData, engineFilters) : null),
    [activeTab, erpData, externalData, engineFilters]
  );

  const financialSummaryData = useMemo(
    () =>
      activeTab === 'financial-summary' && isSectionAuthorized
        ? computeFinancialSummaryMIS(erpData, externalData, engineFilters)
        : null,
    [activeTab, isSectionAuthorized, erpData, externalData, engineFilters]
  );

  const managementData = useMemo(
    () =>
      activeTab === 'management' && isSectionAuthorized
        ? computeManagementMIS(erpData, externalData, engineFilters)
        : null,
    [activeTab, isSectionAuthorized, erpData, externalData, engineFilters]
  );

  const sanitizedProjects = useMemo(
    () => sanitizeMISERPData({ projects: erpData.projects || [] }).projects,
    [erpData.projects]
  );

  const selectedProjectLabel = useMemo(() => {
    if (!appliedFilters.projectId || appliedFilters.projectId === 'ALL') return 'All Projects';
    const match = sanitizedProjects.find((p) => p.id === appliedFilters.projectId);
    return match ? match.name || match.projectName || match.id : appliedFilters.projectId;
  }, [appliedFilters.projectId, sanitizedProjects]);

  const activeReportExportConfig = useMemo(() => {
    const generatedBy = `${currentUser?.name || 'Administrator'} (${userRole || 'Staff'})`;

    if (activeTab === 'daily-monthly' && dailyMonthlyData) {
      const typeLabel =
        DAILY_MONTHLY_TYPES.find((t) => t.id === dailyMonthlyData.reportType)?.label || 'Daily Report';
      const headers = [
        'Report Date',
        'Project Name',
        'Total Income (INR)',
        'Total Expenses (INR)',
        'Payments Received (INR)',
        'Payments Made (INR)',
        'Pending Payments (INR)',
        'Daily Work Summary',
        'Attendance Summary',
        'Material Usage Summary'
      ];
      const numericColumnIndices = [2, 3, 4, 5, 6];

      const displayRows = dailyMonthlyData.rows.map((r) => [
        r.reportDate,
        r.projectName,
        formatCurrency(r.totalIncome),
        formatCurrency(r.totalExpenses),
        formatCurrency(r.paymentsReceived),
        formatCurrency(r.paymentsMade),
        formatCurrency(r.pendingPayments),
        r.workSummary,
        r.attendanceSummary,
        r.materialSummary
      ]);

      const excelRows = dailyMonthlyData.rows.map((r) => [
        r.reportDate,
        r.projectName,
        r.totalIncome,
        r.totalExpenses,
        r.paymentsReceived,
        r.paymentsMade,
        r.pendingPayments,
        r.workSummary,
        r.attendanceSummary,
        r.materialSummary
      ]);

      const totalsRow = [
        'Grand Total',
        `${dailyMonthlyData.rows.length} Entries`,
        formatCurrency(dailyMonthlyData.totals.totalIncome),
        formatCurrency(dailyMonthlyData.totals.totalExpenses),
        formatCurrency(dailyMonthlyData.totals.paymentsReceived),
        formatCurrency(dailyMonthlyData.totals.paymentsMade),
        formatCurrency(dailyMonthlyData.totals.pendingPayments),
        `${dailyMonthlyData.totals.dprCount} DPRs`,
        `${dailyMonthlyData.totals.presentCount} Present`,
        '-'
      ];

      const excelTotalsRow = [
        'Grand Total',
        `${dailyMonthlyData.rows.length} Entries`,
        dailyMonthlyData.totals.totalIncome,
        dailyMonthlyData.totals.totalExpenses,
        dailyMonthlyData.totals.paymentsReceived,
        dailyMonthlyData.totals.paymentsMade,
        dailyMonthlyData.totals.pendingPayments,
        `${dailyMonthlyData.totals.dprCount} DPRs`,
        `${dailyMonthlyData.totals.presentCount} Present`,
        '-'
      ];

      return {
        title: `Daily & Monthly Operations MIS - ${typeLabel}`,
        subtitle: 'Consolidated site operations, income, expenses, payments, attendance, and material usage',
        periodLabel: dailyMonthlyData.periodLabel,
        projectLabel: selectedProjectLabel,
        departmentLabel: 'All Departments',
        generatedBy,
        summaryCards: [
          { label: 'Total Income', value: formatCurrency(dailyMonthlyData.totals.totalIncome), rawValue: dailyMonthlyData.totals.totalIncome, isCurrency: true },
          { label: 'Total Expenses', value: formatCurrency(dailyMonthlyData.totals.totalExpenses), rawValue: dailyMonthlyData.totals.totalExpenses, isCurrency: true },
          { label: 'Payments Received', value: formatCurrency(dailyMonthlyData.totals.paymentsReceived), rawValue: dailyMonthlyData.totals.paymentsReceived, isCurrency: true },
          { label: 'Pending Payments', value: formatCurrency(dailyMonthlyData.totals.pendingPayments), rawValue: dailyMonthlyData.totals.pendingPayments, isCurrency: true }
        ],
        headers,
        displayRows,
        excelRows,
        totalsRow,
        excelTotalsRow,
        numericColumnIndices,
        notes: [
          'Cancelled income/expense entries and rejected claims are excluded.',
          dailyMonthlyData.totals.customerAdvance > 0
            ? `Customer advances (${formatCurrency(dailyMonthlyData.totals.customerAdvance)}) are excluded from Earned Income.`
            : 'Earned income excludes customer advances where present.'
        ],
        fileBase: `Sanmati_Daily_Monthly_MIS_${dailyMonthlyData.reportType}`
      };
    }

    if (activeTab === 'project-progress' && projectProgressData) {
      const headers = [
        'Project ID',
        'Project Name',
        'Client Name',
        'Start Date',
        'Expected Completion',
        'Status',
        'Completion %',
        'Total Budget (INR)',
        'Actual Expenses (INR)',
        'Remaining Budget (INR)',
        'Completed Tasks',
        'Pending Tasks',
        'Delayed Tasks',
        'Material Cost (INR)',
        'Labour Cost (INR)'
      ];
      const numericColumnIndices = [6, 7, 8, 9, 10, 11, 12, 13, 14];

      const displayRows = projectProgressData.rows.map((r) => [
        r.projectCode,
        r.projectName,
        r.clientName,
        r.startDate,
        r.expectedCompletionDate,
        r.projectStatus,
        `${r.completionPct}%`,
        formatCurrency(r.totalBudget),
        formatCurrency(r.actualExpenses),
        formatCurrency(r.remainingBudget),
        r.completedTasks,
        r.pendingTasks,
        r.delayedTasks,
        formatCurrency(r.materialCost),
        formatCurrency(r.labourCost)
      ]);

      const excelRows = projectProgressData.rows.map((r) => [
        r.projectCode,
        r.projectName,
        r.clientName,
        r.startDate,
        r.expectedCompletionDate,
        r.projectStatus,
        r.completionPct,
        r.totalBudget,
        r.actualExpenses,
        r.remainingBudget,
        r.completedTasks,
        r.pendingTasks,
        r.delayedTasks,
        r.materialCost,
        r.labourCost
      ]);

      const s = projectProgressData.summary;
      return {
        title: 'Project Progress & Execution MIS Report',
        subtitle: 'Schedule adherence, physical progress completion, budget vs actual expenses, and resource costs',
        periodLabel: projectProgressData.periodLabel,
        projectLabel: selectedProjectLabel,
        departmentLabel: 'All Departments',
        generatedBy,
        summaryCards: [
          { label: 'Total Projects', value: String(s.totalProjects), rawValue: s.totalProjects },
          { label: 'Avg Completion', value: `${s.avgCompletionPct}%`, rawValue: s.avgCompletionPct },
          { label: 'Delayed Projects', value: String(s.delayedProjects), rawValue: s.delayedProjects },
          { label: 'Total Budget', value: formatCurrency(s.totalBudget), rawValue: s.totalBudget, isCurrency: true },
          { label: 'Actual Expenses', value: formatCurrency(s.totalExpenses), rawValue: s.totalExpenses, isCurrency: true },
          { label: 'Remaining Budget', value: formatCurrency(s.remainingBudget), rawValue: s.remainingBudget, isCurrency: true }
        ],
        headers,
        displayRows,
        excelRows,
        totalsRow: [
          'Portfolio Total',
          `${s.totalProjects} Projects`,
          '-',
          '-',
          '-',
          `${s.delayedProjects} Delayed`,
          `${s.avgCompletionPct}% Avg`,
          formatCurrency(s.totalBudget),
          formatCurrency(s.totalExpenses),
          formatCurrency(s.remainingBudget),
          s.completedTasks,
          s.pendingTasks,
          s.delayedTasks,
          formatCurrency(s.totalMaterialCost),
          formatCurrency(s.totalLabourCost)
        ],
        excelTotalsRow: [
          'Portfolio Total',
          `${s.totalProjects} Projects`,
          '-',
          '-',
          '-',
          `${s.delayedProjects} Delayed`,
          s.avgCompletionPct,
          s.totalBudget,
          s.totalExpenses,
          s.remainingBudget,
          s.completedTasks,
          s.pendingTasks,
          s.delayedTasks,
          s.totalMaterialCost,
          s.totalLabourCost
        ],
        numericColumnIndices,
        notes: [
          'Project physical completion (%) is derived from project activity and milestone progress, independent of expenditure.',
          `Milestones Summary: ${s.completedTasks} Completed, ${s.pendingTasks} Pending, ${s.delayedTasks} Delayed.`
        ],
        extraSheets: [
          {
            name: 'Project Milestones',
            headers: ['Project Name', 'Milestone', 'Status', 'Physical Progress %', 'Target Date'],
            rows: projectProgressData.milestones.map((m) => [m.projectName, m.name, m.status, m.progress, m.targetDate])
          }
        ],
        fileBase: 'Sanmati_Project_Progress_MIS'
      };
    }

    if (activeTab === 'financial-summary' && financialSummaryData) {
      const subLabel =
        FINANCIAL_REPORT_SUBTYPES.find((t) => t.id === financialSubType)?.label || 'Financial Report';
      const s = financialSummaryData.summary;

      let headers = [];
      let displayRows = [];
      let excelRows = [];
      let totalsRow = null;
      let excelTotalsRow = null;
      let numericColumnIndices = [];

      if (financialSubType === 'income') {
        headers = ['Date', 'Project', 'Party', 'Category', 'Accounting Class', 'Amount', 'Cash Received', 'Pending', 'Status'];
        numericColumnIndices = [5, 6, 7];
        displayRows = financialSummaryData.incomeRows.map((r) => [
          r.date, r.projectName, r.party, r.category, r.classification,
          formatCurrency(r.amount), formatCurrency(r.receivedAmount), formatCurrency(r.pendingAmount), r.status
        ]);
        excelRows = financialSummaryData.incomeRows.map((r) => [
          r.date, r.projectName, r.party, r.category, r.classification,
          r.amount, r.receivedAmount, r.pendingAmount, r.status
        ]);
      } else if (financialSubType === 'expense') {
        headers = ['Date', 'Project', 'Payee/Vendor', 'Category', 'Source', 'Expense Amount', 'Paid', 'Payable', 'Status'];
        numericColumnIndices = [5, 6, 7];
        displayRows = financialSummaryData.expenseRows.map((r) => [
          r.date, r.projectName, r.party, r.category, r.source,
          formatCurrency(r.amount), formatCurrency(r.paidAmount), formatCurrency(r.pendingAmount), r.status
        ]);
        excelRows = financialSummaryData.expenseRows.map((r) => [
          r.date, r.projectName, r.party, r.category, r.source,
          r.amount, r.paidAmount, r.pendingAmount, r.status
        ]);
      } else if (financialSubType === 'cashflow') {
        headers = ['Month', 'Cash Inflow', 'Customer Advances', 'Cash Outflow', 'Net Cash Flow'];
        numericColumnIndices = [1, 2, 3, 4];
        displayRows = financialSummaryData.monthlySummary.map((r) => [
          r.month, formatCurrency(r.cashInflow), formatCurrency(r.customerAdvances), formatCurrency(r.cashOutflow), formatCurrency(r.netCashFlow)
        ]);
        excelRows = financialSummaryData.monthlySummary.map((r) => [
          r.month, r.cashInflow, r.customerAdvances, r.cashOutflow, r.netCashFlow
        ]);
        totalsRow = ['Net Period Cash Flow', formatCurrency(s.paymentsReceived), formatCurrency(s.customerAdvances), formatCurrency(s.paymentsMade), formatCurrency(s.netCashFlow)];
        excelTotalsRow = ['Net Period Cash Flow', s.paymentsReceived, s.customerAdvances, s.paymentsMade, s.netCashFlow];
      } else if (financialSubType === 'outstanding') {
        headers = ['Type', 'Party Name', 'Project', 'Due Date', 'Total Billed', 'Settled', 'Outstanding Balance', 'Status'];
        numericColumnIndices = [4, 5, 6];
        displayRows = financialSummaryData.outstandingRows.map((r) => [
          r.type, r.party, r.projectName, r.date,
          formatCurrency(r.totalAmount), formatCurrency(r.settledAmount), formatCurrency(r.pendingAmount), r.status
        ]);
        excelRows = financialSummaryData.outstandingRows.map((r) => [
          r.type, r.party, r.projectName, r.date, r.totalAmount, r.settledAmount, r.pendingAmount, r.status
        ]);
      } else if (financialSubType === 'project_financial') {
        headers = ['Project', 'Budget', 'Earned Revenue', 'Advances', 'Expenses', 'Net Profit', 'Margin %', 'Receivables', 'Payables'];
        numericColumnIndices = [1, 2, 3, 4, 5, 6, 7, 8];
        displayRows = financialSummaryData.projectFinancialRows.map((r) => [
          r.projectName, formatCurrency(r.budget), formatCurrency(r.earnedRevenue), formatCurrency(r.customerAdvances),
          formatCurrency(r.expenses), formatCurrency(r.netProfit), `${r.marginPct}%`, formatCurrency(r.receivablePending), formatCurrency(r.payablePending)
        ]);
        excelRows = financialSummaryData.projectFinancialRows.map((r) => [
          r.projectName, r.budget, r.earnedRevenue, r.customerAdvances, r.expenses, r.netProfit, r.marginPct, r.receivablePending, r.payablePending
        ]);
      } else {
        headers = ['Month', 'Earned Revenue', 'Customer Advances (Excl.)', 'Total Expenses', 'Net Profit / (Loss)'];
        numericColumnIndices = [1, 2, 3, 4];
        displayRows = financialSummaryData.monthlySummary.map((r) => [
          r.month, formatCurrency(r.earnedRevenue), formatCurrency(r.customerAdvances), formatCurrency(r.expenses), formatCurrency(r.netProfit)
        ]);
        excelRows = financialSummaryData.monthlySummary.map((r) => [
          r.month, r.earnedRevenue, r.customerAdvances, r.expenses, r.netProfit
        ]);
        totalsRow = ['Period Total', formatCurrency(s.totalRevenue), formatCurrency(s.customerAdvances), formatCurrency(s.totalExpenses), formatCurrency(s.netProfit)];
        excelTotalsRow = ['Period Total', s.totalRevenue, s.customerAdvances, s.totalExpenses, s.netProfit];
      }

      return {
        title: `Financial Summary MIS - ${subLabel}`,
        subtitle: `Tally Sync: ${financialSummaryData.tallyReconciliation.syncState}`,
        periodLabel: financialSummaryData.periodLabel,
        projectLabel: selectedProjectLabel,
        departmentLabel: 'All Departments',
        generatedBy,
        summaryCards: [
          { label: 'Total Revenue', value: formatCurrency(s.totalRevenue), rawValue: s.totalRevenue, isCurrency: true },
          { label: 'Total Expenses', value: formatCurrency(s.totalExpenses), rawValue: s.totalExpenses, isCurrency: true },
          { label: 'Net Profit', value: formatCurrency(s.netProfit), rawValue: s.netProfit, isCurrency: true },
          { label: 'Receivables / Payables', value: `${formatCurrency(s.outstandingReceivables)} / ${formatCurrency(s.outstandingPayables)}` }
        ],
        headers,
        displayRows,
        excelRows,
        totalsRow,
        excelTotalsRow,
        numericColumnIndices,
        notes: [
          'Cancelled & Rejected entries are excluded; Customer Advances are held separately from Earned Revenue & Net Profit.',
          `Profit Margin: ${s.profitMarginPct}% | Cash Flow Net: ${formatCurrency(s.netCashFlow)}.`,
          `Tally Reconciliation: ${financialSummaryData.tallyReconciliation.syncState} (${financialSummaryData.tallyReconciliation.companyName}).`
        ],
        extraSheets: [
          {
            name: 'Project Financials',
            headers: ['Project', 'Budget', 'Earned Revenue', 'Advances', 'Expenses', 'Net Profit', 'Margin %'],
            rows: financialSummaryData.projectFinancialRows.map((r) => [
              r.projectName, r.budget, r.earnedRevenue, r.customerAdvances, r.expenses, r.netProfit, r.marginPct
            ])
          },
          {
            name: 'Outstanding Dues',
            headers: ['Type', 'Party', 'Project', 'Due Date', 'Total', 'Settled', 'Pending', 'Status'],
            rows: financialSummaryData.outstandingRows.map((r) => [
              r.type, r.party, r.projectName, r.date, r.totalAmount, r.settledAmount, r.pendingAmount, r.status
            ])
          }
        ],
        fileBase: `Sanmati_Financial_MIS_${financialSubType}`
      };
    }

    if (activeTab === 'management' && managementData) {
      const k = managementData.executiveKPIs;
      const headers = ['Project Name', 'Status', 'Physical %', 'Budget', 'Earned Revenue', 'Expenses', 'Net Profit', 'Margin %'];
      const numericColumnIndices = [2, 3, 4, 5, 6, 7];

      const displayRows = managementData.projectPerformance.map((r) => [
        r.projectName,
        r.isOverBudget ? `${r.projectStatus} (Over Budget)` : r.projectStatus,
        `${r.completionPct}%`,
        formatCurrency(r.budget),
        formatCurrency(r.earnedRevenue),
        formatCurrency(r.expenses),
        formatCurrency(r.netProfit),
        `${r.marginPct}%`
      ]);
      const excelRows = managementData.projectPerformance.map((r) => [
        r.projectName, r.projectStatus, r.completionPct, r.budget, r.earnedRevenue, r.expenses, r.netProfit, r.marginPct
      ]);
      const totalBudget = managementData.projectPerformance.reduce((sum, r) => sum + r.budget, 0);

      return {
        title: 'Executive Management Performance & Risk MIS Report',
        subtitle: 'Company-wide financial health, project portfolio, departmental & staff metrics, and critical risks',
        periodLabel: managementData.periodLabel,
        projectLabel: 'All Projects',
        departmentLabel: 'All Departments',
        generatedBy,
        summaryCards: [
          { label: 'Projects (Active/Done)', value: `${k.totalProjects} (${k.activeProjects}/${k.completedProjects})` },
          { label: 'Delayed Projects', value: String(k.delayedProjects), rawValue: k.delayedProjects },
          { label: 'Total Revenue', value: formatCurrency(k.totalRevenue), rawValue: k.totalRevenue, isCurrency: true },
          { label: 'Net Profit', value: formatCurrency(k.netProfit), rawValue: k.netProfit, isCurrency: true }
        ],
        headers,
        displayRows,
        excelRows,
        totalsRow: [
          'Executive Total',
          `${k.totalProjects} Projects`,
          '-',
          formatCurrency(totalBudget),
          formatCurrency(k.totalRevenue),
          formatCurrency(k.totalExpenses),
          formatCurrency(k.netProfit),
          `${k.profitMarginPct}%`
        ],
        excelTotalsRow: [
          'Executive Total',
          `${k.totalProjects} Projects`,
          '-',
          totalBudget,
          k.totalRevenue,
          k.totalExpenses,
          k.netProfit,
          k.profitMarginPct
        ],
        numericColumnIndices,
        notes: [
          ...managementData.insights,
          managementData.risks.length > 0
            ? `Active Business Risks (${managementData.risks.length}): ${managementData.risks.map((r) => r.title).join('; ')}`
            : 'Zero critical business risks detected across schedule, budget, or inventory thresholds.'
        ],
        extraSheets: [
          {
            name: 'Department Performance',
            headers: ['Department', 'Headcount', 'Revenue', 'Expenses', 'Pending Approvals', 'Attendance Rate %'],
            rows: managementData.departmentPerformance.map((d) => [
              d.department, d.headcount, d.revenue, d.expenses, d.pendingApprovals, d.attendanceRatePct ?? 'Unavailable'
            ])
          },
          {
            name: 'Employee Performance',
            headers: ['Employee', 'Designation', 'Department', 'Present Days', 'OT Hours', 'GPS Logs', 'DPRs', 'CRM Leads'],
            rows: managementData.employeePerformance.map((e) => [
              e.name, e.designation, e.department, e.markedDays > 0 ? `${e.presentDays}/${e.markedDays}` : 'No log', e.overtimeHours, e.gpsCheckIns, e.dprSubmitted, e.leadsHandled
            ])
          },
          {
            name: 'Pending Approvals & Risks',
            headers: ['Category', 'Title / Detail', 'Severity / Status', 'Amount / Metric'],
            rows: [
              ...managementData.risks.map((r) => [r.category, `${r.title}: ${r.detail}`, r.severity, r.metric]),
              ...managementData.pendingApprovals.map((a) => [a.category, `${a.title} (${a.requester})`, a.status, a.amount])
            ]
          }
        ],
        fileBase: 'Sanmati_Executive_Management_MIS'
      };
    }

    return null;
  }, [
    activeTab,
    currentUser,
    userRole,
    dailyMonthlyData,
    projectProgressData,
    financialSummaryData,
    managementData,
    financialSubType,
    selectedProjectLabel
  ]);

  const handleDownloadPDF = () => {
    if (!activeReportExportConfig) return;
    const cfg = activeReportExportConfig;
    const res = generateMISReportPDF({
      title: cfg.title,
      subtitle: cfg.subtitle,
      periodLabel: cfg.periodLabel,
      projectLabel: cfg.projectLabel,
      departmentLabel: cfg.departmentLabel,
      generatedBy: cfg.generatedBy,
      orientation: 'auto',
      summaryCards: cfg.summaryCards,
      headers: cfg.headers,
      rows: cfg.displayRows,
      totalsRow: cfg.totalsRow,
      numericColumnIndices: cfg.numericColumnIndices,
      notes: cfg.notes,
      fileName: `${cfg.fileBase}_${new Date().toISOString().slice(0, 10)}.pdf`
    });
    if (res?.success) {
      setActionFeedback({
        type: 'success',
        text: `Downloaded PDF (${res.pages} page${res.pages > 1 ? 's' : ''}): ${res.fileName}`
      });
    }
  };

  const handleExportExcel = () => {
    if (!activeReportExportConfig) return;
    const cfg = activeReportExportConfig;
    const res = exportMISReportExcel({
      title: cfg.title,
      periodLabel: cfg.periodLabel,
      projectLabel: cfg.projectLabel,
      departmentLabel: cfg.departmentLabel,
      generatedBy: cfg.generatedBy,
      summaryCards: cfg.summaryCards,
      headers: cfg.headers,
      rows: cfg.excelRows,
      totalsRow: cfg.excelTotalsRow,
      numericColumnIndices: cfg.numericColumnIndices,
      notes: cfg.notes,
      extraSheets: cfg.extraSheets,
      fileName: `${cfg.fileBase}_${new Date().toISOString().slice(0, 10)}.xlsx`
    });
    if (res?.success) {
      setActionFeedback({ type: 'success', text: `Exported Excel workbook: ${res.fileName}` });
    }
  };

  const handlePrint = () => {
    triggerMISPrintReport();
  };

  // LANDING VIEW: Only 4 Clean Report Cards
  if (!activeTab) {
    return (
      <div className="space-y-6 pb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#002046] text-white flex items-center justify-center shrink-0">
            <PieChartIcon className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#002046] tracking-tight">
              MIS Reports
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select a report to filter data, view summaries, and export to PDF, Excel, or Print.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MIS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const allowed = !section.allowedRoles || section.allowedRoles.includes(userRole);
            return (
              <div
                key={section.id}
                data-mis-card={section.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#002046]/40 hover:shadow-md transition-all flex flex-col justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#002046] text-white flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-[#002046]">{section.label}</h2>
                      {!allowed && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                          Restricted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleOpenReport(section.id)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#0b449b] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const ActiveIcon = activeSectionMeta.icon;
  const activePeriodLabel =
    dailyMonthlyData?.periodLabel ||
    projectProgressData?.periodLabel ||
    financialSummaryData?.periodLabel ||
    managementData?.periodLabel ||
    '';

  return (
    <div className="space-y-5 pb-10">
      {/* Individual Report Header Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBackToLanding}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            All Reports
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#002046] text-white flex items-center justify-center shrink-0">
              <ActiveIcon className="w-5 h-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#002046] tracking-tight">
                {activeSectionMeta.label}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePeriodLabel ? `Period: ${activePeriodLabel}` : activeSectionMeta.description}
              </p>
            </div>
          </div>
        </div>

        {/* ONLY Three Export Options */}
        {isSectionAuthorized && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!activeReportExportConfig || Boolean(validationError)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#002046] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-rose-600" aria-hidden="true" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!activeReportExportConfig || Boolean(validationError)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#002046] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!activeReportExportConfig || Boolean(validationError)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#002046] hover:bg-[#0b449b] text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          role="status"
          className={`no-print rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-[#002046]'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Server Error Warning (only when backend rejects request) */}
      {serverError && isSectionAuthorized && (
        <div
          role="alert"
          className="no-print bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-amber-900 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* RBAC Guard OR Simplified Report Body */}
      {!isSectionAuthorized ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-xs max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-[#002046]">
            Access Restricted: {activeSectionMeta.label}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Your current role (<strong>{userRole || 'Unknown'}</strong>) does not have permission to view this report.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleBackToLanding}
              className="px-4 py-2 rounded-xl bg-[#002046] hover:bg-[#0b449b] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to MIS Reports
            </button>
            <button
              type="button"
              onClick={() => handleOpenReport('daily-monthly')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Open Daily &amp; Monthly Reports
            </button>
          </div>
        </div>
      ) : (
        <>
          <MISCommonFilters
            filters={draftFilters}
            onFilterChange={handleDraftFilterChange}
            onGenerate={handleGenerateReport}
            onReset={handleResetFilters}
            projects={sanitizedProjects}
            showProjectFilter={activeTab !== 'management'}
            isGenerating={isGenerating}
            validationError={validationError}
          />

          {!validationError && (
            <div className="no-print">
              {activeTab === 'daily-monthly' && (
                <DailyMonthlyMISView
                  data={dailyMonthlyData}
                  reportType={dailyReportType}
                  onReportTypeChange={handleDailyReportTypeChange}
                />
              )}

              {activeTab === 'project-progress' && (
                <ProjectProgressMISView data={projectProgressData} />
              )}

              {activeTab === 'financial-summary' && (
                <FinancialSummaryMISView
                  data={financialSummaryData}
                  financialSubType={financialSubType}
                  onFinancialSubTypeChange={setFinancialSubType}
                />
              )}

              {activeTab === 'management' && (
                <ManagementMISView data={managementData} />
              )}
            </div>
          )}
        </>
      )}

      {/* Isolated Printable Stage Mounted via Portal for A4 Printing */}
      {typeof document !== 'undefined' &&
        isSectionAuthorized &&
        activeReportExportConfig &&
        createPortal(
          <div id="mis-print-stage" aria-hidden="true">
            <MISPrintableSheet
              reportConfig={activeReportExportConfig}
              orientation="auto"
              generatedBy={activeReportExportConfig.generatedBy}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export { MISModule };
export default MISModule;
