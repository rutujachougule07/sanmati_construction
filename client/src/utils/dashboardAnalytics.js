// Dynamic analytics & formatting helpers for the Business Intelligence Dashboard

const CHART_PALETTE = ['#0b449b', '#cc9418', '#5ca4f2', '#c2deff'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an INR numeric amount into compact readable Indian units (Cr / L / exact ₹).
 */
export const formatCompactINR = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num === 0) return '₹ 0';

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 1e7) {
    return `${sign}₹ ${(abs / 1e7).toFixed(2)} Cr`;
  }
  if (abs >= 1e5) {
    return `${sign}₹ ${(abs / 1e5).toFixed(2)} L`;
  }
  return `${sign}₹ ${Math.round(abs).toLocaleString('en-IN')}`;
};

/**
 * Converts a Date object into local YYYY-MM-DD without UTC timezone shift.
 */
export const toLocalISODate = (dateObj = new Date()) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Normalizes various date strings (YYYY-MM-DD or ISO timestamps) to YYYY-MM-DD.
 */
export const normalizeDateString = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  return toLocalISODate(parsed);
};

const addDays = (dateObj, deltaDays) => {
  const copy = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
};

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${MONTH_SHORT[m - 1]} ${String(d).padStart(2, '0')}, ${y}`;
};

/**
 * Builds Indian Financial Year & rolling period filter presets anchored to today.
 */
export const buildPeriodPresets = (now = new Date()) => {
  const todayIso = toLocalISODate(now);
  const year = now.getFullYear();
  const monthIdx = now.getMonth(); // 0-based: 0=Jan, 3=Apr

  // Current Indian FY (Apr 1 .. Mar 31)
  const fyStartYear = monthIdx >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const fyStart = `${fyStartYear}-04-01`;
  const fyEnd = `${fyEndYear}-03-31`;
  const prevFyStart = `${fyStartYear - 1}-04-01`;
  const prevFyEnd = `${fyStartYear}-03-31`;
  const fyShortEnd = String(fyEndYear).slice(-2);

  // Current Indian FY Quarter
  let qNum = 1;
  let qStartMonth = 3; // Apr
  let qYear = year;
  if (monthIdx >= 3 && monthIdx <= 5) {
    qNum = 1;
    qStartMonth = 3;
    qYear = year;
  } else if (monthIdx >= 6 && monthIdx <= 8) {
    qNum = 2;
    qStartMonth = 6;
    qYear = year;
  } else if (monthIdx >= 9 && monthIdx <= 11) {
    qNum = 3;
    qStartMonth = 9;
    qYear = year;
  } else {
    qNum = 4;
    qStartMonth = 0;
    qYear = year;
  }
  const qStartDate = new Date(qYear, qStartMonth, 1);
  const qEndDate = new Date(qYear, qStartMonth + 3, 0);
  const prevQStartDate = new Date(qYear, qStartMonth - 3, 1);
  const prevQEndDate = new Date(qYear, qStartMonth, 0);

  // Rolling 30 days
  const last30Start = toLocalISODate(addDays(now, -29));
  const prev30Start = toLocalISODate(addDays(now, -59));
  const prev30End = toLocalISODate(addDays(now, -30));

  return [
    {
      id: 'fy_current',
      label: `FY ${fyStartYear}–${fyShortEnd} (Apr – Mar)`,
      start: fyStart,
      end: fyEnd,
      prevStart: prevFyStart,
      prevEnd: prevFyEnd,
      bucketMode: 'month'
    },
    {
      id: 'quarter_current',
      label: `Q${qNum} FY ${fyStartYear}–${fyShortEnd} (${MONTH_SHORT[qStartMonth]} – ${MONTH_SHORT[(qStartMonth + 2) % 12]})`,
      start: toLocalISODate(qStartDate),
      end: toLocalISODate(qEndDate),
      prevStart: toLocalISODate(prevQStartDate),
      prevEnd: toLocalISODate(prevQEndDate),
      bucketMode: 'month'
    },
    {
      id: 'last_30',
      label: 'Last 30 Days',
      start: last30Start,
      end: todayIso,
      prevStart: prev30Start,
      prevEnd: prev30End,
      bucketMode: 'week'
    },
    {
      id: 'all_time',
      label: 'All Time (Cumulative)',
      start: null,
      end: null,
      prevStart: null,
      prevEnd: null,
      bucketMode: 'month'
    },
    {
      id: 'custom',
      label: 'Custom Date Range',
      start: fyStart,
      end: todayIso,
      prevStart: null,
      prevEnd: null,
      bucketMode: 'month'
    }
  ];
};

export const getCustomRangeLabel = (start, end) => {
  if (start && end) return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
  if (start) return `From ${formatDisplayDate(start)}`;
  if (end) return `Up to ${formatDisplayDate(end)}`;
  return 'Custom Date Range';
};

const isDateInRange = (rawDate, start, end) => {
  if (!start && !end) return true;
  const iso = normalizeDateString(rawDate);
  if (!iso) return false;
  if (start && iso < start) return false;
  if (end && iso > end) return false;
  return true;
};

const doesProjectOverlapRange = (project, start, end) => {
  if (!start && !end) return true;
  const pStart = normalizeDateString(project.startDate || project.createdAt);
  const pEnd = normalizeDateString(project.endDate || project.completionDate);
  if (!pStart && !pEnd) return true;
  if (pStart && end && pStart > end) return false;
  if (pEnd && start && pEnd < start) return false;
  return true;
};

const normalizeName = (val) => String(val || '').trim().toLowerCase();

/**
 * Extracts normalized progress percentage (0-100) from project fields or activity breakdown.
 */
export const getProjectProgress = (project) => {
  const direct = project?.completionPercentage ?? project?.progress;
  if (direct !== undefined && direct !== null && direct !== '') {
    const num = Number(direct);
    if (Number.isFinite(num)) return Math.min(100, Math.max(0, Math.round(num)));
  }
  if (Array.isArray(project?.activities) && project.activities.length > 0) {
    const sum = project.activities.reduce((acc, a) => acc + (Number(a.progress) || 0), 0);
    return Math.min(100, Math.max(0, Math.round(sum / project.activities.length)));
  }
  const st = normalizeName(project?.status);
  return st === 'completed' ? 100 : 0;
};

/**
 * Maps heterogeneous project status strings into canonical Dashboard statuses.
 */
export const getProjectStatusCategory = (project, progress) => {
  const st = normalizeName(project?.status);
  if (st === 'completed' || st === 'finished' || progress >= 100) return 'Completed';
  if (st.includes('hold') || st === 'paused') return 'On Hold';
  return 'Ongoing';
};

const buildNormalizedFinancialItems = ({
  incomeRecords = [],
  expenseRecords = [],
  expenses = [],
  raBills = []
}) => {
  const activeIncomes = incomeRecords
    .filter((rec) => rec && rec.status !== 'Cancelled')
    .map((rec) => ({
      amount: Number(rec.amount) || Number(rec.receivedAmount) || 0,
      date: rec.date || rec.createdAt,
      category: String(rec.category || '').trim() || 'Other Services',
      projectName: rec.projectName || '',
      searchBlob: [rec.voucherNumber, rec.referenceNumber, rec.remarks, rec.description, rec.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    }));

  const incomeBlobs = activeIncomes.map((i) => i.searchBlob).join(' | ');

  // Include Paid RA bills that were logged directly in ProjectsModule without an Income voucher
  const unmatchedPaidRABills = raBills
    .filter((bill) => {
      if (!bill || bill.status !== 'Paid') return false;
      const billNo = String(bill.billNo || '').trim().toLowerCase();
      return !(billNo && incomeBlobs.includes(billNo));
    })
    .map((bill) => ({
      amount: Number(bill.netPayable) || Number(bill.currentBillAmount) || Number(bill.amount) || 0,
      date: bill.date || bill.createdAt,
      category: 'RA Bill Payment',
      projectName: bill.projectName || ''
    }));

  const revenueItems = [...activeIncomes, ...unmatchedPaidRABills];

  const voucherExpenses = expenseRecords
    .filter((rec) => rec && rec.status !== 'Cancelled')
    .map((rec) => ({
      amount: Number(rec.amount) || 0,
      date: rec.date || rec.createdAt,
      projectId: rec.projectId,
      projectName: rec.projectName || ''
    }));

  const siteExpenses = expenses
    .filter((rec) => rec && rec.status !== 'Rejected')
    .map((rec) => ({
      amount: Number(rec.amount) || 0,
      date: rec.date || rec.createdAt,
      projectId: rec.projectId,
      projectName: rec.projectName || ''
    }));

  return {
    revenueItems,
    expenseItems: [...voucherExpenses, ...siteExpenses]
  };
};

const chooseNiceChartScale = (values) => {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 0);
  if (maxAbs === 0) return { divisor: 1e5, unit: 'L' };
  if (maxAbs >= 1e7) return { divisor: 1e7, unit: 'Cr' };
  if (maxAbs >= 1e5) return { divisor: 1e5, unit: 'L' };
  if (maxAbs >= 1e3) return { divisor: 1e3, unit: 'K' };
  return { divisor: 1, unit: '' };
};

const computeAxisBounds = (scaledRows) => {
  const allVals = scaledRows.flatMap((r) => [r.revenue, r.expenses, r.profit]);
  const maxVal = Math.max(...allVals, 0);
  const minVal = Math.min(...allVals, 0);

  if (maxVal === 0 && minVal === 0) {
    return { domain: [0, 6], ticks: [0, 1, 2, 3, 4, 5, 6] };
  }

  const rawMax = Math.max(maxVal, Math.abs(minVal));
  const roughStep = rawMax / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep || 1)));
  const norm = roughStep / mag;
  let niceNorm = 1;
  if (norm > 5) niceNorm = 10;
  else if (norm > 2.5) niceNorm = 5;
  else if (norm > 2) niceNorm = 2.5;
  else if (norm > 1) niceNorm = 2;

  const step = niceNorm * mag;
  const upperTicksCount = Math.max(1, Math.ceil(maxVal / step));
  const lowerTicksCount = minVal < 0 ? Math.ceil(Math.abs(minVal) / step) : 0;

  const top = Number((upperTicksCount * step).toFixed(4));
  const bottom = minVal < 0 ? Number((-lowerTicksCount * step).toFixed(4)) : 0;

  const ticks = [];
  for (let i = -lowerTicksCount; i <= upperTicksCount; i += 1) {
    ticks.push(Number((i * step).toFixed(4)));
  }

  return { domain: [bottom, top], ticks };
};

const buildPerformanceSeries = ({
  revenueItems,
  expenseItems,
  start,
  end,
  bucketMode,
  now = new Date()
}) => {
  const buckets = [];

  if (bucketMode === 'week' && start && end) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    const totalDays = Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
    const weekCount = Math.min(6, Math.max(4, Math.ceil(totalDays / 7)));
    const sliceDays = totalDays / weekCount;

    for (let i = 0; i < weekCount; i += 1) {
      const bStart = toLocalISODate(addDays(startDate, Math.floor(i * sliceDays)));
      const bEnd =
        i === weekCount - 1
          ? end
          : toLocalISODate(addDays(startDate, Math.floor((i + 1) * sliceDays) - 1));
      buckets.push({
        label: `Wk ${i + 1}`,
        start: bStart,
        end: bEnd,
        revenueRaw: 0,
        expensesRaw: 0
      });
    }
  } else {
    let monthKeys = [];
    if (start && end) {
      const [sY, sM] = start.split('-').map(Number);
      const [eY, eM] = end.split('-').map(Number);
      let curY = sY;
      let curM = sM;
      // Show up to current month for active FY, or full range if transactions fall later
      const todayYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const maxTxYm = [...revenueItems, ...expenseItems]
        .map((item) => normalizeDateString(item.date).slice(0, 7))
        .filter((ym) => ym && ym >= start.slice(0, 7) && ym <= end.slice(0, 7))
        .sort()
        .pop();
      const targetEndYm =
        end.slice(0, 7) > todayYm
          ? [todayYm, maxTxYm || start.slice(0, 7)].sort().pop()
          : end.slice(0, 7);

      while (curY < eY || (curY === eY && curM <= eM)) {
        const ym = `${curY}-${String(curM).padStart(2, '0')}`;
        if (ym <= targetEndYm || monthKeys.length === 0) {
          monthKeys.push(ym);
        }
        curM += 1;
        if (curM > 12) {
          curM = 1;
          curY += 1;
        }
        if (monthKeys.length >= 12) break;
      }
    } else {
      const activeMonths = new Set();
      [...revenueItems, ...expenseItems].forEach((item) => {
        const ym = normalizeDateString(item.date).slice(0, 7);
        if (ym) activeMonths.add(ym);
      });
      if (activeMonths.size > 0) {
        const sorted = Array.from(activeMonths).sort().slice(-12);
        monthKeys = sorted;
      } else {
        // Default 8-month FY skeleton when completely empty
        const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        for (let m = 4; m <= 11; m += 1) {
          monthKeys.push(`${fyYear}-${String(m).padStart(2, '0')}`);
        }
      }
    }

    const spansMultipleYears =
      monthKeys.length > 1 && monthKeys[0].slice(0, 4) !== monthKeys[monthKeys.length - 1].slice(0, 4);

    monthKeys.forEach((ym) => {
      const [y, m] = ym.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const label = spansMultipleYears
        ? `${MONTH_SHORT[m - 1]} '${String(y).slice(-2)}`
        : MONTH_SHORT[m - 1];
      buckets.push({
        label,
        start: `${ym}-01`,
        end: `${ym}-${String(lastDay).padStart(2, '0')}`,
        revenueRaw: 0,
        expensesRaw: 0
      });
    });
  }

  revenueItems.forEach((item) => {
    const d = normalizeDateString(item.date);
    const match = buckets.find((b) => d >= b.start && d <= b.end);
    if (match) match.revenueRaw += item.amount;
  });

  expenseItems.forEach((item) => {
    const d = normalizeDateString(item.date);
    const match = buckets.find((b) => d >= b.start && d <= b.end);
    if (match) match.expensesRaw += item.amount;
  });

  const scale = chooseNiceChartScale(
    buckets.flatMap((b) => [b.revenueRaw, b.expensesRaw, b.revenueRaw - b.expensesRaw])
  );

  const chartData = buckets.map((b) => {
    const profitRaw = b.revenueRaw - b.expensesRaw;
    return {
      month: b.label,
      revenue: Number((b.revenueRaw / scale.divisor).toFixed(2)),
      expenses: Number((b.expensesRaw / scale.divisor).toFixed(2)),
      profit: Number((profitRaw / scale.divisor).toFixed(2)),
      revenueRaw: b.revenueRaw,
      expensesRaw: b.expensesRaw,
      profitRaw
    };
  });

  const { domain, ticks } = computeAxisBounds(chartData);
  const hasTransactions = buckets.some((b) => b.revenueRaw > 0 || b.expensesRaw > 0);

  return {
    chartData,
    unit: scale.unit,
    yDomain: domain,
    yTicks: ticks,
    hasTransactions
  };
};

const buildRevenueBreakdown = (periodRevenues) => {
  const totalsByCategory = new Map();
  let grandTotal = 0;

  periodRevenues.forEach((item) => {
    if (item.amount <= 0) return;
    const cat = item.category || 'Other Services';
    totalsByCategory.set(cat, (totalsByCategory.get(cat) || 0) + item.amount);
    grandTotal += item.amount;
  });

  if (grandTotal <= 0) {
    return {
      hasData: false,
      slices: [{ name: 'No Revenue Recorded', value: 100, amount: 0, color: '#e2e8f0', isEmpty: true }],
      legendItems: []
    };
  }

  const sorted = Array.from(totalsByCategory.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const consolidated =
    sorted.length <= 4
      ? sorted
      : [
          ...sorted.slice(0, 3),
          {
            name: 'Other Services',
            amount: sorted.slice(3).reduce((acc, item) => acc + item.amount, 0)
          }
        ];

  let pctSum = 0;
  const items = consolidated.map((entry, idx) => {
    const pct = Math.max(1, Math.round((entry.amount / grandTotal) * 100));
    pctSum += pct;
    return {
      name: entry.name,
      value: pct,
      amount: entry.amount,
      color: CHART_PALETTE[idx % CHART_PALETTE.length]
    };
  });

  if (items.length > 0 && pctSum !== 100) {
    items[0].value = Math.max(1, items[0].value + (100 - pctSum));
  }

  return {
    hasData: true,
    slices: items,
    legendItems: items
  };
};

const computeDeltaMeta = (current, previous, emptyFallback, activeFallback) => {
  if (previous > 0) {
    const pct = ((current - previous) / previous) * 100;
    const rounded = Math.abs(pct) >= 100 ? Math.round(pct) : Number(pct.toFixed(1));
    const sign = rounded > 0 ? '+' : '';
    return {
      text: `${sign}${rounded}% vs last period`,
      direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat'
    };
  }
  if (current > 0) {
    return { text: activeFallback, direction: 'up' };
  }
  if (current < 0) {
    return { text: activeFallback, direction: 'down' };
  }
  return { text: emptyFallback, direction: 'flat' };
};

/**
 * Computes complete dynamic Business Intelligence Dashboard metrics from live ERP context data.
 */
export const computeDashboardAnalytics = (erpData, activeRange) => {
  const {
    projects = [],
    incomeRecords = [],
    expenseRecords = [],
    expenses = [],
    raBills = [],
    paymentTracking = [],
    vendorPayments = [],
    ledgerEntries = []
  } = erpData || {};

  const { start, end, prevStart, prevEnd, bucketMode = 'month' } = activeRange || {};
  const { revenueItems, expenseItems } = buildNormalizedFinancialItems({
    incomeRecords,
    expenseRecords,
    expenses,
    raBills
  });

  // 1. Period-filtered projects & financials
  const projectsInPeriod = projects.filter((p) => doesProjectOverlapRange(p, start, end));
  const projectRowsAll = projectsInPeriod.map((project, idx) => {
    const name = project.name || project.projectName || `Project ${idx + 1}`;
    const pNameKey = normalizeName(name);
    const budgetRaw =
      Number(project.budget ?? project.contractValue ?? project.projectBudget ?? project.totalBudget) || 0;
    const progress = getProjectProgress(project);
    const status = getProjectStatusCategory(project, progress);

    const matchedExpenses = expenseItems
      .filter((e) => {
        if (!isDateInRange(e.date, start, end)) return false;
        if (project.id && e.projectId && e.projectId === project.id) return true;
        return pNameKey && normalizeName(e.projectName) === pNameKey;
      })
      .reduce((acc, e) => acc + e.amount, 0);

    const stockExpenditure = Number(project.actualExpenditure) || 0;
    const expenseRaw = matchedExpenses + stockExpenditure;

    return {
      id: project.id || `${name}-${idx}`,
      name,
      clientName: project.clientName || '',
      location: project.location || '',
      budgetRaw,
      budget: formatCompactINR(budgetRaw),
      expenseRaw,
      expense: formatCompactINR(expenseRaw),
      progress,
      status
    };
  });

  // Sort: Ongoing first, then highest budget / progress, capped neatly for table overview
  const sortedProjectRows = [...projectRowsAll]
    .sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'Ongoing') return -1;
        if (b.status === 'Ongoing') return 1;
      }
      return b.budgetRaw - a.budgetRaw || b.progress - a.progress;
    })
    .map((row, idx) => ({
      ...row,
      rank: String(idx + 1).padStart(2, '0')
    }));

  const ongoingCount = projectRowsAll.filter((p) => p.status === 'Ongoing').length;
  const completedCount = projectRowsAll.filter((p) => p.status === 'Completed').length;
  const onHoldCount = projectRowsAll.filter((p) => p.status === 'On Hold').length;
  const totalProjects = projectRowsAll.length;

  // 2. Period Revenue, Expenses & Profit
  const periodRevenues = revenueItems.filter((item) => isDateInRange(item.date, start, end));
  const periodExpenses = expenseItems.filter((item) => isDateInRange(item.date, start, end));

  const totalRevenue = periodRevenues.reduce((acc, r) => acc + r.amount, 0);
  const totalVoucherAndSiteExpense = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalStockExpenditure = projectsInPeriod.reduce(
    (acc, p) => acc + (Number(p.actualExpenditure) || 0),
    0
  );
  const totalExpenses = totalVoucherAndSiteExpense + totalStockExpenditure;
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const profitMarginFormatted = `${profitMarginPct.toFixed(1)}%`;

  // 3. Previous period comparisons (only computed when prior dates exist)
  const prevProjects =
    prevStart && prevEnd ? projects.filter((p) => doesProjectOverlapRange(p, prevStart, prevEnd)) : [];
  const prevOngoing = prevProjects.filter(
    (p) => getProjectStatusCategory(p, getProjectProgress(p)) === 'Ongoing'
  ).length;
  const prevCompleted = prevProjects.filter(
    (p) => getProjectStatusCategory(p, getProjectProgress(p)) === 'Completed'
  ).length;
  const prevRevenue =
    prevStart && prevEnd
      ? revenueItems
          .filter((item) => isDateInRange(item.date, prevStart, prevEnd))
          .reduce((acc, r) => acc + r.amount, 0)
      : 0;
  const prevExpenses =
    prevStart && prevEnd
      ? expenseItems
          .filter((item) => isDateInRange(item.date, prevStart, prevEnd))
          .reduce((acc, e) => acc + e.amount, 0)
      : 0;
  const prevNetProfit = prevRevenue - prevExpenses;

  // 4. Outstanding Receivables & Payables
  // Point-in-time active balances (bounded by period end date when filtering historical windows)
  const balanceCutoff = end || null;
  const trackingReceivable = paymentTracking
    .filter((p) => !balanceCutoff || !normalizeDateString(p.paymentDate) || isDateInRange(p.paymentDate, null, balanceCutoff))
    .reduce((acc, p) => acc + Math.max(0, Number(p.remainingAmount) || 0), 0);
  const incomePendingReceivable = incomeRecords
    .filter((i) => i.status !== 'Cancelled' && (!balanceCutoff || !normalizeDateString(i.date) || isDateInRange(i.date, null, balanceCutoff)))
    .reduce((acc, i) => acc + Math.max(0, Number(i.pendingAmount) || 0), 0);
  const outstandingReceivable = trackingReceivable + incomePendingReceivable;

  const vendorEntries = ledgerEntries.filter(
    (l) =>
      l.accountType === 'Vendor' &&
      (!balanceCutoff || !normalizeDateString(l.date) || isDateInRange(l.date, null, balanceCutoff))
  );
  const vendorLedgerPayable = Math.max(
    0,
    vendorEntries.reduce((acc, l) => acc + (Number(l.creditAmount) || 0), 0) -
      vendorEntries.reduce((acc, l) => acc + (Number(l.debitAmount) || 0), 0)
  );
  const vendorSchedulePayable = vendorPayments
    .filter((vp) => !balanceCutoff || !normalizeDateString(vp.date || vp.createdAt) || isDateInRange(vp.date || vp.createdAt, null, balanceCutoff))
    .reduce((acc, vp) => acc + Math.max(0, Number(vp.remainingAmount) || 0), 0);
  const expensePendingPayable = expenseRecords
    .filter((e) => e.status !== 'Cancelled' && (!balanceCutoff || !normalizeDateString(e.date) || isDateInRange(e.date, null, balanceCutoff)))
    .reduce((acc, e) => acc + Math.max(0, Number(e.pendingAmount) || 0), 0);
  const outstandingPayable =
    Math.max(vendorLedgerPayable, vendorSchedulePayable) + expensePendingPayable;

  // 5. Charts
  const monthlySeries = buildPerformanceSeries({
    revenueItems: periodRevenues,
    expenseItems: periodExpenses,
    start,
    end,
    bucketMode
  });

  const revenueBreakdown = buildRevenueBreakdown(periodRevenues);

  const statusSlices = [];
  if (ongoingCount > 0) {
    statusSlices.push({ name: `Ongoing (${ongoingCount})`, value: ongoingCount, color: '#0a4195' });
  }
  if (completedCount > 0) {
    statusSlices.push({ name: `Completed (${completedCount})`, value: completedCount, color: '#53b63a' });
  }
  if (onHoldCount > 0) {
    statusSlices.push({ name: `On Hold (${onHoldCount})`, value: onHoldCount, color: '#d49b1a' });
  }

  const totalContractValue = projectsInPeriod.reduce(
    (acc, p) => acc + (Number(p.budget ?? p.contractValue ?? p.projectBudget ?? p.totalBudget) || 0),
    0
  );

  return {
    kpis: {
      totalProjects,
      ongoingProjects: ongoingCount,
      completedProjects: completedCount,
      onHoldProjects: onHoldCount,
      totalRevenueRaw: totalRevenue,
      totalRevenue: formatCompactINR(totalRevenue),
      totalExpensesRaw: totalExpenses,
      totalExpenses: formatCompactINR(totalExpenses),
      netProfitRaw: netProfit,
      netProfit: formatCompactINR(netProfit),
      profitMargin: profitMarginFormatted,
      receivable: formatCompactINR(outstandingReceivable),
      payable: formatCompactINR(outstandingPayable),
      deltas: {
        totalProjects: computeDeltaMeta(
          totalProjects,
          prevProjects.length,
          'No projects added',
          totalContractValue > 0 ? `${formatCompactINR(totalContractValue)} portfolio` : 'Active portfolio'
        ),
        ongoingProjects: computeDeltaMeta(
          ongoingCount,
          prevOngoing,
          '0 ongoing sites',
          totalProjects > 0 ? `${Math.round((ongoingCount / totalProjects) * 100)}% of total` : 'In execution'
        ),
        completedProjects: computeDeltaMeta(
          completedCount,
          prevCompleted,
          '0 completed yet',
          totalProjects > 0 ? `${Math.round((completedCount / totalProjects) * 100)}% completion` : 'Delivered'
        ),
        totalRevenue: computeDeltaMeta(
          totalRevenue,
          prevRevenue,
          'No income entries',
          `${periodRevenues.length} income ${periodRevenues.length === 1 ? 'entry' : 'entries'}`
        ),
        netProfit: computeDeltaMeta(
          netProfit,
          prevNetProfit,
          'Awaiting transactions',
          `${profitMarginFormatted} net margin`
        )
      }
    },
    monthlySeries,
    revenueBreakdown,
    projectRows: sortedProjectRows,
    projectStatus: {
      hasData: statusSlices.length > 0,
      slices:
        statusSlices.length > 0
          ? statusSlices
          : [{ name: 'No Projects', value: 1, color: '#e2e8f0', isEmpty: true }],
      legend: [
        { label: `Ongoing (${ongoingCount})`, color: '#0a4195' },
        { label: `Completed (${completedCount})`, color: '#53b63a' },
        ...(onHoldCount > 0 ? [{ label: `On Hold (${onHoldCount})`, color: '#d49b1a' }] : [])
      ]
    }
  };
};
