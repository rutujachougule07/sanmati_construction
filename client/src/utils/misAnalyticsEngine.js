// SANMATI CONSTRUCTIONS ERP - MIS Analytics, Validation & Financial Accounting Engine
// Enforces non-duplication, excludes Cancelled/Rejected transactions, separates Customer Advances from Earned Revenue,
// and keeps Project Physical Completion decoupled from financial expenditure.

export const MIS_STORAGE_KEYS = {
  DPR_LOGS: 'sanmati_project_dpr_logs',
  ATTENDANCE_LEDGER: 'sanmati_attendance_clean_ledger',
  PAYROLL_MANUAL_DAYS: 'sanmati_payroll_manual_days',
  SUBCONTRACTORS: 'sanmati_subcontractors',
  TALLY_COMPANY: 'tally_comp_v2',
  TALLY_LEDGERS: 'tally_ledgers_v2',
  TALLY_VOUCHERS: 'tally_vouchers_v2',
  TALLY_VERIFY: 'tally_verify_v2',
  TALLY_VERIFY_DONE: 'tally_verify_done'
};

export const ERP_DEPARTMENTS = [
  'Civil Engineering & Site Ops',
  'Accounts & Finance',
  'Procurement & Stores',
  'HR & Administration',
  'CRM & Business Dev',
  'Management & QA'
];

export const PERIOD_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'financial_year', label: 'Financial Year' },
  { value: 'custom', label: 'Custom Date Range' },
  { value: 'all_time', label: 'All Time' }
];

export const FINANCIAL_REPORT_SUBTYPES = [
  { id: 'income', label: '1. Income Report' },
  { id: 'expense', label: '2. Expense Report' },
  { id: 'pnl', label: '3. Profit & Loss Report' },
  { id: 'cashflow', label: '4. Cash Flow Summary' },
  { id: 'outstanding', label: '5. Outstanding Payment Report' },
  { id: 'project_financial', label: '6. Project-wise Financial Report' }
];

export const DAILY_MONTHLY_TYPES = [
  { id: 'daily', label: 'Daily Report' },
  { id: 'weekly', label: 'Weekly Report' },
  { id: 'monthly', label: 'Monthly Report' },
  { id: 'custom', label: 'Custom Date Range Report' },
  { id: 'project_wise', label: 'Project-wise Report' },
  { id: 'department_wise', label: 'Department-wise Report' }
];

export const toNum = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[₹,\s]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export const toLocalIsoDate = (dateInput = new Date()) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const extractIsoDate = (rawDate) => {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? '' : toLocalIsoDate(parsed);
};

export const getCurrentFinancialYearCode = (now = new Date()) => {
  const month = now.getMonth() + 1; // 1..12
  const startYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, '0');
  return `FY${startYear}-${endShort}`;
};

export const getAvailableFinancialYears = (now = new Date()) => {
  const month = now.getMonth() + 1;
  const currentStartYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  const list = [];
  for (let offset = 0; offset <= 3; offset += 1) {
    const sy = currentStartYear - offset;
    const ey = String((sy + 1) % 100).padStart(2, '0');
    list.push({
      code: `FY${sy}-${ey}`,
      label: `FY ${sy}-${ey} (Apr ${sy} – Mar ${sy + 1})`,
      start: `${sy}-04-01`,
      end: `${sy + 1}-03-31`
    });
  }
  return list;
};

/**
 * Resolves a MIS filter object into concrete inclusive YYYY-MM-DD start and end boundaries.
 */
export const resolveFilterDateRange = (filters = {}, now = new Date()) => {
  const preset = filters.periodPreset || 'financial_year';
  const todayIso = toLocalIsoDate(now);
  const year = now.getFullYear();
  const month = now.getMonth();

  if (preset === 'today') {
    return { start: todayIso, end: todayIso, label: `Today (${todayIso})` };
  }

  if (preset === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const yIso = toLocalIsoDate(yest);
    return { start: yIso, end: yIso, label: `Yesterday (${yIso})` };
  }

  if (preset === 'this_week') {
    const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startDt = new Date(now);
    startDt.setDate(now.getDate() + mondayOffset);
    const endDt = new Date(startDt);
    endDt.setDate(startDt.getDate() + 6);
    const start = toLocalIsoDate(startDt);
    const end = toLocalIsoDate(endDt);
    return { start, end, label: `This Week (${start} to ${end})` };
  }

  if (preset === 'this_month') {
    const startDt = new Date(year, month, 1);
    const endDt = new Date(year, month + 1, 0);
    const start = toLocalIsoDate(startDt);
    const end = toLocalIsoDate(endDt);
    const monthName = now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return { start, end, label: `This Month (${monthName})` };
  }

  if (preset === 'last_month') {
    const startDt = new Date(year, month - 1, 1);
    const endDt = new Date(year, month, 0);
    const start = toLocalIsoDate(startDt);
    const end = toLocalIsoDate(endDt);
    const monthName = startDt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return { start, end, label: `Last Month (${monthName})` };
  }

  if (preset === 'this_year') {
    return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Calendar Year ${year}` };
  }

  if (preset === 'financial_year') {
    const fyCode = filters.financialYear || getCurrentFinancialYearCode(now);
    const match = /^FY(\d{4})-(\d{2})$/.exec(fyCode);
    const sy = match ? Number(match[1]) : (month + 1 >= 4 ? year : year - 1);
    const ey = String((sy + 1) % 100).padStart(2, '0');
    return {
      start: `${sy}-04-01`,
      end: `${sy + 1}-03-31`,
      label: `FY ${sy}-${ey} (${sy}-04-01 to ${sy + 1}-03-31)`
    };
  }

  if (preset === 'custom') {
    const start = extractIsoDate(filters.startDate);
    const end = extractIsoDate(filters.endDate);
    if (start && end) {
      return { start, end, label: `Custom (${start} to ${end})` };
    }
    if (start) return { start, end: todayIso, label: `From ${start}` };
    if (end) return { start: '', end, label: `Up to ${end}` };
    return { start: '', end: '', label: 'Custom Range (Unbounded)' };
  }

  return { start: '', end: '', label: 'All Time Records' };
};

export const isDateWithinRange = (rawDate, range) => {
  if (!range || (!range.start && !range.end)) return true;
  const iso = extractIsoDate(rawDate);
  if (!iso) return false;
  if (range.start && iso < range.start) return false;
  if (range.end && iso > range.end) return false;
  return true;
};

/**
 * Safely reads secondary localStorage stores managed by sibling ERP modules (Projects DPR, HRMS Attendance, Tally v2).
 */
export const readExternalERPStates = () => {
  const safeParse = (key, fallback) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  let tallyVerifyDone = false;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      tallyVerifyDone = window.localStorage.getItem(MIS_STORAGE_KEYS.TALLY_VERIFY_DONE) === 'true';
    }
  } catch {
    tallyVerifyDone = false;
  }

  return {
    dprLogs: safeParse(MIS_STORAGE_KEYS.DPR_LOGS, []),
    attendanceLedger: safeParse(MIS_STORAGE_KEYS.ATTENDANCE_LEDGER, {}),
    manualPayrollDays: safeParse(MIS_STORAGE_KEYS.PAYROLL_MANUAL_DAYS, {}),
    subcontractors: safeParse(MIS_STORAGE_KEYS.SUBCONTRACTORS, []),
    tallyCompany: safeParse(MIS_STORAGE_KEYS.TALLY_COMPANY, null),
    tallyLedgers: safeParse(MIS_STORAGE_KEYS.TALLY_LEDGERS, []),
    tallyVouchers: safeParse(MIS_STORAGE_KEYS.TALLY_VOUCHERS, []),
    tallyVerify: safeParse(MIS_STORAGE_KEYS.TALLY_VERIFY, []),
    tallyVerifyDone
  };
};

/**
 * Calls the backend MIS validation, RBAC & optional Firestore audit endpoint gracefully.
 * Falls back transparently without throwing if backend is unreachable in static browser preview.
 */
export const fetchServerMISAudit = async ({ section, filters, userRole }) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`/api/mis/reports/${encodeURIComponent(section)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole || ''
      },
      body: JSON.stringify({ filters, userRole }),
      signal: controller.signal
    });
    clearTimeout(timer);

    const payload = await res.json().catch(() => null);
    return {
      reachable: true,
      status: res.status,
      ok: res.ok,
      ...(payload || {})
    };
  } catch (err) {
    return {
      reachable: false,
      ok: false,
      status: 0,
      source: 'local-browser-engine',
      error: err?.name === 'AbortError' ? 'Backend verification timed out' : 'Backend API offline; using verified local ERP store'
    };
  }
};

export const isAdvanceCategory = (record) => {
  const hay = `${record?.category || ''} ${record?.type || ''} ${record?.title || ''} ${record?.description || ''}`.toLowerCase();
  return hay.includes('advance') || hay.includes('mobilization');
};

export const inferRecordDepartment = (record, employees = []) => {
  if (record?.department) return record.department;
  const cat = String(record?.category || record?.title || record?.type || '').toLowerCase();
  if (cat.includes('labour') || cat.includes('salary') || cat.includes('payroll') || cat.includes('wage')) {
    return 'HR & Administration';
  }
  if (cat.includes('cement') || cat.includes('steel') || cat.includes('material') || cat.includes('vendor') || cat.includes('diesel') || cat.includes('equipment') || cat.includes('rental')) {
    return 'Procurement & Stores';
  }
  if (cat.includes('ra bill') || cat.includes('retention') || cat.includes('advance') || cat.includes('statutory') || cat.includes('tax') || cat.includes('gst') || cat.includes('audit') || cat.includes('finance')) {
    return 'Accounts & Finance';
  }
  if (cat.includes('lead') || cat.includes('client') || cat.includes('quotation') || cat.includes('consultation') || cat.includes('crm')) {
    return 'CRM & Business Dev';
  }
  if (record?.requester || record?.engineer || record?.employeeName) {
    const person = String(record.requester || record.engineer || record.employeeName).trim().toLowerCase();
    const matchedEmp = employees.find((e) => String(e.name || '').trim().toLowerCase() === person);
    if (matchedEmp?.department) return matchedEmp.department;
  }
  return 'Civil Engineering & Site Ops';
};

export const resolveProjectRef = (record, projects = []) => {
  if (record?.projectId) {
    const byId = projects.find((p) => p.id === record.projectId || p.code === record.projectId);
    if (byId) return { id: byId.id, name: byId.name || byId.projectName || record.projectName || 'Unnamed Project' };
  }
  if (record?.projectName) {
    const key = String(record.projectName).trim().toLowerCase();
    const byName = projects.find((p) => String(p.name || p.projectName || '').trim().toLowerCase() === key);
    if (byName) return { id: byName.id, name: byName.name || byName.projectName };
    return { id: '', name: record.projectName };
  }
  if (record?.site) {
    const siteKey = String(record.site).trim().toLowerCase();
    const bySite = projects.find(
      (p) =>
        String(p.name || p.projectName || '').trim().toLowerCase() === siteKey ||
        String(p.location || '').trim().toLowerCase().includes(siteKey)
    );
    if (bySite) return { id: bySite.id, name: bySite.name || bySite.projectName };
    return { id: '', name: record.site };
  }
  return { id: '', name: 'Head Office / General' };
};

export const matchesGlobalFilters = ({ recordProjectId, recordProjectName, recordDepartment, recordStatus, searchableText }, filters, projects = []) => {
  if (filters.projectId && filters.projectId !== 'ALL') {
    const targetProject = projects.find((p) => p.id === filters.projectId);
    const targetName = targetProject ? String(targetProject.name || targetProject.projectName || '').trim().toLowerCase() : '';
    const recName = String(recordProjectName || '').trim().toLowerCase();
    const idMatch = recordProjectId && recordProjectId === filters.projectId;
    const nameMatch = targetName && recName === targetName;
    if (!idMatch && !nameMatch) return false;
  }

  if (filters.department && filters.department !== 'ALL') {
    const recDept = String(recordDepartment || '').trim().toLowerCase();
    if (recDept !== String(filters.department).trim().toLowerCase()) return false;
  }

  if (filters.status && filters.status !== 'ALL') {
    const recStatus = String(recordStatus || '').trim().toLowerCase();
    const want = String(filters.status).trim().toLowerCase();
    if (recStatus !== want) return false;
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    if (!String(searchableText || '').toLowerCase().includes(q)) return false;
  }

  return true;
};

const DUMMY_MIS_SEED_IDS = new Set([
  'GPS-001',
  'GPS-002',
  'GPS-003',
  'APP-001',
  'APP-002',
  'MAT-001',
  'MAT-002',
  'MAT-003',
  'MAT-004',
  'MAT-005',
  'QUO-2026-01',
  'inc1',
  'inc2',
  'inc3',
  'inc4',
  'inc5',
  'inc6',
  'INC-101',
  'INC-102',
  'INC-103',
  'INC-104',
  'EXP-201',
  'EXP-202',
  'EXP-203',
  'SE-301',
  'SE-302',
  'PRJ-MIS-1',
  'PRJ-MIS-2',
  'EMP-1',
  'EMP-2',
  'APR-1',
  'INV-10'
]);

const isDummySeedRecord = (rec) => {
  if (!rec || typeof rec !== 'object') return false;
  if (rec.id && DUMMY_MIS_SEED_IDS.has(String(rec.id))) return true;
  const label = `${rec.projectName || ''} ${rec.name || ''} ${rec.title || ''} ${rec.site || ''} ${rec.location || ''}`.toLowerCase();
  return label.includes('royal palace') || label.includes('d.y. patil') || label.includes('midc shiroli');
};

const stripDummyList = (arr) => (Array.isArray(arr) ? arr.filter((r) => !isDummySeedRecord(r)) : []);

export const sanitizeMISERPData = (erpData = {}) => ({
  ...erpData,
  projects: stripDummyList(erpData.projects),
  incomeRecords: stripDummyList(erpData.incomeRecords),
  expenseRecords: stripDummyList(erpData.expenseRecords),
  expenses: stripDummyList(erpData.expenses),
  raBills: stripDummyList(erpData.raBills),
  boqItems: stripDummyList(erpData.boqItems),
  paymentTracking: stripDummyList(erpData.paymentTracking),
  vendorPayments: stripDummyList(erpData.vendorPayments),
  inventory: stripDummyList(erpData.inventory),
  gpsLogs: stripDummyList(erpData.gpsLogs),
  approvals: stripDummyList(erpData.approvals),
  hrmsEmployees: stripDummyList(erpData.hrmsEmployees),
  leads: stripDummyList(erpData.leads)
});

/**
 * Builds canonical non-duplicated ERP financial and operational slices respecting status and dates.
 */
const getCanonicalFilteredSlices = (rawErpData = {}, externalData = {}, filters = {}, range) => {
  const erpData = sanitizeMISERPData(rawErpData);
  const projects = erpData.projects;
  const employees = erpData.hrmsEmployees;

  // 1. Valid Income Records (exclude Cancelled)
  const allValidIncomes = (erpData.incomeRecords || []).filter((r) => r && r.status !== 'Cancelled');
  const incomeBillRefs = new Set(
    allValidIncomes
      .map((i) => String(i.invoiceRef || i.billNo || i.reference || '').trim().toLowerCase())
      .filter(Boolean)
  );

  // Unmatched Paid/Approved RA Bills that do not already have a synced incomeRecord
  const unmatchedPaidRABills = (erpData.raBills || [])
    .filter((b) => {
      if (!b || b.status === 'Cancelled' || b.status === 'Rejected') return false;
      const st = String(b.status || '').toLowerCase();
      const isRecognized = st === 'paid' || st === 'approved';
      const billKey = String(b.billNo || b.id || '').trim().toLowerCase();
      return isRecognized && (!billKey || !incomeBillRefs.has(billKey));
    })
    .map((b) => {
      const st = String(b.status || '').toLowerCase();
      const isPaid = st === 'paid';
      const amt = toNum(b.netPayable ?? b.payableAmount ?? b.grossAmount ?? b.amount);
      return {
        id: `RA-SYNC-${b.id}`,
        date: b.paidDate || b.date || b.billDate || b.createdAt,
        projectId: b.projectId || '',
        projectName: b.projectName || '',
        category: 'RA Bill Payment',
        party: b.clientName || b.contractorName || '',
        title: `RA Bill ${b.billNo || b.id}`,
        completedWork: b.completedWork || '',
        amount: amt,
        receivedAmount: isPaid ? amt : 0,
        pendingAmount: isPaid ? 0 : amt,
        status: isPaid ? 'Received' : 'Pending',
        paymentMode: b.paymentMode || 'Bank Transfer',
        isSyntheticFromRABill: true
      };
    });

  const combinedIncomes = [...allValidIncomes, ...unmatchedPaidRABills];

  // 2. Valid Expense Records & Site Expenses (exclude Cancelled & Rejected)
  const explicitExpenseRecords = (erpData.expenseRecords || []).filter((r) => r && r.status !== 'Cancelled');
  const validSiteExpenses = (erpData.expenses || []).filter((r) => r && r.status !== 'Rejected');

  const projectsWithVouchers = new Set();
  [...explicitExpenseRecords, ...validSiteExpenses].forEach((r) => {
    const ref = resolveProjectRef(r, projects);
    if (ref.id) projectsWithVouchers.add(ref.id);
    if (ref.name) projectsWithVouchers.add(String(ref.name).toLowerCase());
  });

  // Fallback to project-level recorded actualCosts only when a project has no double-counted expense vouchers
  const projectCostFallbacks = projects
    .filter((p) => {
      if (!p || !p.actualCosts) return false;
      const pid = p.id;
      const pname = String(p.name || p.projectName || '').toLowerCase();
      if (projectsWithVouchers.has(pid) || (pname && projectsWithVouchers.has(pname))) return false;
      const total =
        toNum(p.actualCosts.material) +
        toNum(p.actualCosts.labour) +
        toNum(p.actualCosts.equipment) +
        toNum(p.actualCosts.subcontractor);
      return total > 0;
    })
    .map((p) => {
      const mat = toNum(p.actualCosts.material);
      const lab = toNum(p.actualCosts.labour);
      const eqp = toNum(p.actualCosts.equipment);
      const sub = toNum(p.actualCosts.subcontractor);
      const total = mat + lab + eqp + sub;
      return {
        id: `PROJ-COST-${p.id}`,
        date: p.startDate || p.createdAt || p.updatedAt,
        projectId: p.id,
        projectName: p.name || p.projectName || '',
        category: 'Project Execution Costs',
        vendorName: p.projectManager || 'Project Cost Breakdown',
        title: `Project Execution Spend (Mat/Lab/Eqp/Sub)`,
        amount: total,
        paidAmount: total,
        pendingAmount: 0,
        status: 'Paid',
        isSyntheticFromProjectCosts: true,
        materialSummaryNote: mat > 0 ? `Material Cost: ₹${mat.toLocaleString('en-IN')}` : ''
      };
    });

  const validExpenseRecords = [...explicitExpenseRecords, ...projectCostFallbacks];

  // Filter by date range and common project/department/status/search filters
  const filteredIncomes = combinedIncomes.filter((rec) => {
    const dt = rec.date || rec.createdAt;
    if (!isDateWithinRange(dt, range)) return false;
    const pRef = resolveProjectRef(rec, projects);
    const dept = inferRecordDepartment(rec, employees);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: dept,
        recordStatus: rec.status || 'Received',
        searchableText: `${rec.title || ''} ${rec.category || ''} ${rec.party || ''} ${pRef.name} ${dept} ${rec.paymentMode || ''}`
      },
      filters,
      projects
    );
  });

  const filteredExpenseRecords = validExpenseRecords.filter((rec) => {
    const dt = rec.date || rec.createdAt;
    if (!isDateWithinRange(dt, range)) return false;
    const pRef = resolveProjectRef(rec, projects);
    const dept = inferRecordDepartment(rec, employees);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: dept,
        recordStatus: rec.status || 'Paid',
        searchableText: `${rec.title || ''} ${rec.category || ''} ${rec.vendorName || rec.payee || ''} ${pRef.name} ${dept}`
      },
      filters,
      projects
    );
  });

  const filteredSiteExpenses = validSiteExpenses.filter((rec) => {
    const dt = rec.date || rec.createdAt;
    if (!isDateWithinRange(dt, range)) return false;
    const pRef = resolveProjectRef(rec, projects);
    const dept = inferRecordDepartment(rec, employees);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: dept,
        recordStatus: rec.status || 'Submitted',
        searchableText: `${rec.title || rec.description || ''} ${rec.category || ''} ${rec.requester || ''} ${pRef.name} ${dept}`
      },
      filters,
      projects
    );
  });

  const filteredDprLogs = (externalData.dprLogs || []).filter((log) => {
    if (!isDateWithinRange(log.date, range)) return false;
    const pRef = resolveProjectRef(log, projects);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: 'Civil Engineering & Site Ops',
        recordStatus: log.isDelayed ? 'Delayed' : 'Ongoing',
        searchableText: `${pRef.name} ${log.engineer || ''} ${log.activitiesExecuted || ''} ${log.materialsConsumed || ''} ${log.delayRemarks || ''}`
      },
      filters,
      projects
    );
  });

  const filteredGpsLogs = (erpData.gpsLogs || []).filter((g) => {
    if (!isDateWithinRange(g.date || g.timestamp || g.checkInTime, range)) return false;
    const pRef = resolveProjectRef(g, projects);
    const dept = inferRecordDepartment({ employeeName: g.empName }, employees);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: dept,
        recordStatus: g.status || 'Checked In',
        searchableText: `${g.empName || ''} ${g.site || ''} ${pRef.name} ${dept}`
      },
      filters,
      projects
    );
  });

  // Flatten attendance ledger entries within date range
  const attendanceEntries = [];
  const ledger = externalData.attendanceLedger || {};
  Object.entries(ledger).forEach(([dateKey, dayRows]) => {
    if (!isDateWithinRange(dateKey, range)) return;
    if (!Array.isArray(dayRows)) return;
    dayRows.forEach((entry) => {
      const pRef = resolveProjectRef({ site: entry.site, projectName: entry.site }, projects);
      const matchedEmp = employees.find((e) => e.id === entry.empId || e.name === entry.name);
      const dept = matchedEmp?.department || inferRecordDepartment(entry, employees);
      const ok = matchesGlobalFilters(
        {
          recordProjectId: pRef.id,
          recordProjectName: pRef.name,
          recordDepartment: dept,
          recordStatus: entry.status,
          searchableText: `${entry.name || ''} ${entry.designation || ''} ${entry.site || ''} ${pRef.name} ${dept}`
        },
        filters,
        projects
      );
      if (ok) {
        attendanceEntries.push({
          ...entry,
          date: dateKey,
          projectId: pRef.id,
          projectName: pRef.name,
          department: dept
        });
      }
    });
  });

  const filteredBoqItems = (erpData.boqItems || []).filter((boq) => {
    if (!boq || boq.status === 'Cancelled' || boq.status === 'Rejected') return false;
    const dt = boq.dateAdded || boq.date || boq.createdAt;
    if (!isDateWithinRange(dt, range)) return false;
    const pRef = resolveProjectRef(boq, projects);
    return matchesGlobalFilters(
      {
        recordProjectId: pRef.id,
        recordProjectName: pRef.name,
        recordDepartment: 'Civil Engineering & Site Ops',
        recordStatus: boq.status || 'Approved',
        searchableText: `${boq.materialName || ''} ${boq.workDescription || boq.description || ''} ${pRef.name}`
      },
      filters,
      projects
    );
  });

  return {
    projects,
    employees,
    allValidIncomes: combinedIncomes,
    validExpenseRecords,
    validSiteExpenses,
    filteredIncomes,
    filteredExpenseRecords,
    filteredSiteExpenses,
    filteredDprLogs,
    filteredGpsLogs,
    filteredBoqItems,
    attendanceEntries
  };
};

/**
 * 1. DAILY & MONTHLY REPORTS COMPUTATION
 */
export const computeDailyMonthlyMIS = (rawErpData = {}, externalData = {}, filters = {}) => {
  const erpData = sanitizeMISERPData(rawErpData);
  const reportType = filters.reportType || 'daily';
  const range = resolveFilterDateRange(filters);
  const slices = getCanonicalFilteredSlices(erpData, externalData, filters, range);
  const {
    projects,
    filteredIncomes,
    filteredExpenseRecords,
    filteredSiteExpenses,
    filteredDprLogs,
    filteredGpsLogs,
    attendanceEntries
  } = slices;

  const paymentTracking = erpData.paymentTracking || [];
  const vendorPayments = erpData.vendorPayments || [];
  const inventory = erpData.inventory || [];

  const getGroupMeta = (dateStr, pRef, dept) => {
    const iso = extractIsoDate(dateStr) || 'Undated';
    if (reportType === 'project_wise') {
      const pid = pRef.id || pRef.name || 'GENERAL';
      return {
        key: `PROJ::${pid}`,
        periodLabel: iso === 'Undated' ? range.label : iso,
        projectName: pRef.name || 'Head Office / General',
        department: dept || 'All Departments'
      };
    }
    if (reportType === 'department_wise') {
      return {
        key: `DEPT::${dept}`,
        periodLabel: range.label,
        projectName: filters.projectId && filters.projectId !== 'ALL' ? (pRef.name || 'Selected Project') : 'All Projects',
        department: dept
      };
    }
    if (reportType === 'monthly') {
      const monthKey = iso !== 'Undated' ? iso.slice(0, 7) : 'Undated';
      let displayMonth = monthKey;
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        const dt = new Date(`${monthKey}-01T00:00:00`);
        displayMonth = dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }
      return {
        key: `MONTH::${monthKey}::${pRef.id || pRef.name}`,
        periodLabel: displayMonth,
        sortKey: `${monthKey}-${pRef.name}`,
        projectName: pRef.name || 'Head Office / General',
        department: dept
      };
    }
    if (reportType === 'weekly') {
      let weekLabel = iso;
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const dt = new Date(`${iso}T00:00:00`);
        const dow = dt.getDay();
        const mondayDiff = dow === 0 ? -6 : 1 - dow;
        const wkStart = new Date(dt);
        wkStart.setDate(dt.getDate() + mondayDiff);
        weekLabel = `Wk of ${toLocalIsoDate(wkStart)}`;
      }
      return {
        key: `WEEK::${weekLabel}::${pRef.id || pRef.name}`,
        periodLabel: weekLabel,
        sortKey: `${weekLabel}-${pRef.name}`,
        projectName: pRef.name || 'Head Office / General',
        department: dept
      };
    }
    // daily or custom
    return {
      key: `DAY::${iso}::${pRef.id || pRef.name}`,
      periodLabel: iso,
      sortKey: `${iso}-${pRef.name}`,
      projectName: pRef.name || 'Head Office / General',
      department: dept
    };
  };

  const buckets = new Map();
  const ensureBucket = (meta) => {
    if (!buckets.has(meta.key)) {
      buckets.set(meta.key, {
        id: meta.key,
        reportDate: meta.periodLabel,
        sortKey: meta.sortKey || meta.periodLabel,
        projectName: meta.projectName,
        department: meta.department,
        totalIncome: 0,
        customerAdvance: 0,
        totalExpenses: 0,
        paymentsReceived: 0,
        paymentsMade: 0,
        pendingPayments: 0,
        workSummaries: [],
        presentCount: 0,
        absentCount: 0,
        halfDayCount: 0,
        gpsCheckIns: 0,
        overtimeHours: 0,
        materialEntries: [],
        dprCount: 0
      });
    }
    return buckets.get(meta.key);
  };

  filteredIncomes.forEach((inc) => {
    const pRef = resolveProjectRef(inc, projects);
    const dept = inferRecordDepartment(inc, slices.employees);
    const bucket = ensureBucket(getGroupMeta(inc.date || inc.createdAt, pRef, dept));
    const amt = toNum(inc.amount ?? inc.receivedAmount);
    const recd = toNum(inc.receivedAmount ?? (inc.status === 'Pending' ? 0 : amt));
    const pend = toNum(inc.pendingAmount);

    if (isAdvanceCategory(inc)) {
      bucket.customerAdvance += amt;
    } else {
      bucket.totalIncome += amt;
    }
    bucket.paymentsReceived += recd;
    bucket.pendingPayments += pend;
    if (inc.completedWork) {
      bucket.workSummaries.push(`${inc.title ? `${inc.title}: ` : ''}${inc.completedWork}`);
    }
  });

  filteredExpenseRecords.forEach((exp) => {
    const pRef = resolveProjectRef(exp, projects);
    const dept = inferRecordDepartment(exp, slices.employees);
    const bucket = ensureBucket(getGroupMeta(exp.date || exp.createdAt, pRef, dept));
    const amt = toNum(exp.amount);
    const paid = exp.status === 'Pending' ? toNum(exp.paidAmount) : toNum(exp.paidAmount ?? amt);
    const pend = toNum(exp.pendingAmount ?? Math.max(0, amt - paid));

    bucket.totalExpenses += amt;
    bucket.paymentsMade += paid;
    bucket.pendingPayments += pend;
    if (exp.materialSummaryNote) {
      bucket.materialEntries.push(exp.materialSummaryNote);
    }
  });

  filteredSiteExpenses.forEach((exp) => {
    const pRef = resolveProjectRef(exp, projects);
    const dept = inferRecordDepartment(exp, slices.employees);
    const bucket = ensureBucket(getGroupMeta(exp.date || exp.createdAt, pRef, dept));
    const amt = toNum(exp.amount);
    const isPaid = exp.status === 'Approved' || exp.status === 'Paid';

    bucket.totalExpenses += amt;
    if (isPaid) {
      bucket.paymentsMade += amt;
    } else {
      bucket.pendingPayments += amt;
    }
  });

  filteredDprLogs.forEach((dpr) => {
    const pRef = resolveProjectRef(dpr, projects);
    const bucket = ensureBucket(getGroupMeta(dpr.date, pRef, 'Civil Engineering & Site Ops'));
    bucket.dprCount += 1;
    if (dpr.activitiesExecuted) bucket.workSummaries.push(dpr.activitiesExecuted);
    if (dpr.materialsConsumed) bucket.materialEntries.push(dpr.materialsConsumed);
  });

  attendanceEntries.forEach((att) => {
    const pRef = { id: att.projectId, name: att.projectName };
    const bucket = ensureBucket(getGroupMeta(att.date, pRef, att.department));
    const st = String(att.status || '').toLowerCase();
    if (st === 'present') bucket.presentCount += 1;
    else if (st === 'half-day' || st === 'half day') bucket.halfDayCount += 1;
    else if (st === 'absent' || st === 'leave') bucket.absentCount += 1;
    bucket.overtimeHours += toNum(att.overtimeHours);
  });

  filteredGpsLogs.forEach((gps) => {
    const pRef = resolveProjectRef(gps, projects);
    const dept = inferRecordDepartment({ employeeName: gps.empName }, slices.employees);
    const bucket = ensureBucket(getGroupMeta(gps.date || gps.timestamp || gps.checkInTime, pRef, dept));
    bucket.gpsCheckIns += 1;
  });

  (slices.filteredBoqItems || []).forEach((boq) => {
    const pRef = resolveProjectRef(boq, projects);
    const bucket = ensureBucket(getGroupMeta(boq.dateAdded || boq.date || boq.createdAt, pRef, 'Civil Engineering & Site Ops'));
    const work = boq.workDescription || boq.description;
    if (work) bucket.workSummaries.push(`BOQ: ${work}`);
    if (boq.materialName) {
      const qtyPart = toNum(boq.quantity) > 0 ? ` (${toNum(boq.quantity)} ${boq.unit || ''})`.trimEnd() : '';
      bucket.materialEntries.push(`${boq.materialName}${qtyPart}`);
    }
  });

  // For Project-wise or Department-wise reports, also add paymentTracking & vendorPayments pending balances
  const allUnmatchedPendingReceivables = paymentTracking
    .filter((pt) => {
      const pRef = resolveProjectRef(pt, projects);
      return matchesGlobalFilters(
        {
          recordProjectId: pRef.id,
          recordProjectName: pRef.name,
          recordDepartment: 'Accounts & Finance',
          recordStatus: pt.status,
          searchableText: `${pRef.name} ${pt.clientName || ''}`
        },
        filters,
        projects
      );
    })
    .reduce((sum, pt) => sum + Math.max(0, toNum(pt.remainingAmount)), 0);

  const allUnmatchedPendingPayables = vendorPayments
    .filter((vp) => {
      const pRef = resolveProjectRef(vp, projects);
      return matchesGlobalFilters(
        {
          recordProjectId: pRef.id,
          recordProjectName: pRef.name,
          recordDepartment: 'Procurement & Stores',
          recordStatus: vp.status,
          searchableText: `${pRef.name} ${vp.vendorName || ''}`
        },
        filters,
        projects
      );
    })
    .reduce((sum, vp) => sum + Math.max(0, toNum(vp.remainingAmount)), 0);

  // Enrich rows with project-level material stock allocation info when DPR materials aren't logged
  const rows = Array.from(buckets.values())
    .map((row) => {
      const matchedProject = projects.find(
        (p) => String(p.name || p.projectName || '').trim().toLowerCase() === row.projectName.toLowerCase()
      );
      const allocatedMaterials = matchedProject
        ? inventory
            .filter((item) => toNum(item.projectAllocation?.[matchedProject.id]) > 0)
            .map((item) => `${item.itemName || item.name} (${toNum(item.projectAllocation[matchedProject.id])} ${item.unit || 'units'})`)
        : [];

      const totalAttendanceMarked = row.presentCount + row.halfDayCount + row.absentCount;
      const attendanceSummary =
        totalAttendanceMarked > 0
          ? `${row.presentCount}P / ${row.halfDayCount}HD / ${row.absentCount}A${row.overtimeHours > 0 ? ` (${row.overtimeHours}h OT)` : ''}`
          : row.gpsCheckIns > 0
            ? `${row.gpsCheckIns} GPS Check-ins`
            : 'Not Marked';

      const workSummary =
        row.workSummaries.length > 0
          ? row.workSummaries.slice(0, 2).join('; ') + (row.workSummaries.length > 2 ? ` (+${row.workSummaries.length - 2} more)` : '')
          : row.dprCount > 0
            ? `${row.dprCount} DPR logged`
            : 'No DPR work log';

      const materialSummary =
        row.materialEntries.length > 0
          ? row.materialEntries.slice(0, 2).join('; ')
          : allocatedMaterials.length > 0
            ? `Site Stock: ${allocatedMaterials.slice(0, 2).join(', ')}`
            : 'No material log';

      return {
        ...row,
        workSummary,
        attendanceSummary,
        materialSummary
      };
    })
    .sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)));

  const totals = rows.reduce(
    (acc, r) => ({
      totalIncome: acc.totalIncome + r.totalIncome,
      customerAdvance: acc.customerAdvance + r.customerAdvance,
      totalExpenses: acc.totalExpenses + r.totalExpenses,
      paymentsReceived: acc.paymentsReceived + r.paymentsReceived,
      paymentsMade: acc.paymentsMade + r.paymentsMade,
      pendingPayments: acc.pendingPayments + r.pendingPayments,
      presentCount: acc.presentCount + r.presentCount,
      gpsCheckIns: acc.gpsCheckIns + r.gpsCheckIns,
      dprCount: acc.dprCount + r.dprCount
    }),
    {
      totalIncome: 0,
      customerAdvance: 0,
      totalExpenses: 0,
      paymentsReceived: 0,
      paymentsMade: 0,
      pendingPayments: 0,
      presentCount: 0,
      gpsCheckIns: 0,
      dprCount: 0
    }
  );

  // Add project-level pending receivables & payables if buckets had 0 pending ledger lines
  const totalOutstandingLedger = allUnmatchedPendingReceivables + allUnmatchedPendingPayables;

  // Build Chart Series grouped by periodLabel
  const chartMap = new Map();
  rows.slice().reverse().forEach((r) => {
    const label = reportType === 'department_wise' ? r.department : reportType === 'project_wise' ? r.projectName : r.reportDate;
    if (!chartMap.has(label)) {
      chartMap.set(label, { label, income: 0, expenses: 0, received: 0, paid: 0 });
    }
    const c = chartMap.get(label);
    c.income += r.totalIncome;
    c.expenses += r.totalExpenses;
    c.received += r.paymentsReceived;
    c.paid += r.paymentsMade;
  });

  return {
    periodLabel: range.label,
    reportType,
    rows,
    totals: {
      ...totals,
      totalOutstandingLedger
    },
    chartData: Array.from(chartMap.values()).slice(-12),
    attendanceTotals: {
      present: totals.presentCount,
      halfDay: rows.reduce((s, r) => s + r.halfDayCount, 0),
      absent: rows.reduce((s, r) => s + r.absentCount, 0),
      gpsCheckIns: totals.gpsCheckIns
    }
  };
};

/**
 * 2. PROJECT PROGRESS REPORTS COMPUTATION
 * Strictly separates Physical Completion % from Financial Expenditure.
 */
export const computeProjectProgressMIS = (rawErpData = {}, externalData = {}, filters = {}) => {
  const erpData = sanitizeMISERPData(rawErpData);
  const range = resolveFilterDateRange(filters);
  const todayIso = toLocalIsoDate(new Date());
  const projects = erpData.projects || [];
  const validExpenseRecords = (erpData.expenseRecords || []).filter((r) => r && r.status !== 'Cancelled');
  const validSiteExpenses = (erpData.expenses || []).filter((r) => r && r.status !== 'Rejected');
  const inventory = erpData.inventory || [];
  const dprLogs = externalData.dprLogs || [];

  const rows = projects
    .filter((proj) => {
      const pName = proj.name || proj.projectName || '';
      const searchStr = `${pName} ${proj.code || ''} ${proj.id || ''} ${proj.clientName || ''} ${proj.location || ''} ${proj.status || ''}`;
      return matchesGlobalFilters(
        {
          recordProjectId: proj.id,
          recordProjectName: pName,
          recordDepartment: proj.department || 'Civil Engineering & Site Ops',
          recordStatus: proj.status || 'Ongoing',
          searchableText: searchStr
        },
        { ...filters, department: 'ALL' }, // Projects span all departments unless filtered explicitly on expenses
        projects
      );
    })
    .map((proj) => {
      const pId = proj.id;
      const pCode = proj.code || proj.id;
      const pName = proj.name || proj.projectName || 'Unnamed Project';
      const totalBudget = toNum(proj.budget ?? proj.projectBudget ?? proj.contractValue ?? proj.totalBudget);
      const startDate = extractIsoDate(proj.startDate || proj.createdAt);
      const expectedEndDate = extractIsoDate(proj.estimatedCompletionDate || proj.targetCompletionDate || proj.endDate);

      // Period-scoped expenses for this project
      const projExpenseRecs = validExpenseRecords.filter((e) => {
        if (!isDateWithinRange(e.date || e.createdAt, range)) return false;
        const ref = resolveProjectRef(e, projects);
        return ref.id === pId || String(ref.name).toLowerCase() === pName.toLowerCase();
      });

      const projSiteExps = validSiteExpenses.filter((e) => {
        if (!isDateWithinRange(e.date || e.createdAt, range)) return false;
        const ref = resolveProjectRef(e, projects);
        return ref.id === pId || String(ref.name).toLowerCase() === pName.toLowerCase();
      });

      const directRecordedExpenses =
        projExpenseRecs.reduce((s, e) => s + toNum(e.amount), 0) +
        projSiteExps.reduce((s, e) => s + toNum(e.amount), 0);

      // Stock allocation costs recorded against project.actualExpenditure (only counted when all-time/FY includes project)
      const stockAllocationCost = inventory.reduce((s, item) => {
        const qty = toNum(item.projectAllocation?.[pId]);
        return s + qty * toNum(item.unitPrice ?? item.rate);
      }, 0);

      const projectActualField = toNum(proj.actualExpenditure);
      const projectCostSheetSum =
        toNum(proj.actualCosts?.material) +
        toNum(proj.actualCosts?.labour) +
        toNum(proj.actualCosts?.equipment) +
        toNum(proj.actualCosts?.subcontractor);
      const includeProjectStockExpenditure =
        !range.start ||
        filters.periodPreset === 'all_time' ||
        filters.periodPreset === 'financial_year' ||
        isDateWithinRange(proj.updatedAt || proj.startDate || proj.createdAt, range);

      const nonVoucherProjectSpend =
        directRecordedExpenses === 0
          ? Math.max(projectActualField, stockAllocationCost, projectCostSheetSum)
          : Math.max(projectActualField, stockAllocationCost);

      const actualExpenses =
        directRecordedExpenses + (includeProjectStockExpenditure ? nonVoucherProjectSpend : 0);

      const remainingBudget = totalBudget - actualExpenses;
      const budgetUtilizationPct = totalBudget > 0 ? Math.min(999, Math.round((actualExpenses / totalBudget) * 1000) / 10) : 0;
      const isOverBudget = totalBudget > 0 && actualExpenses > totalBudget;

      // Material Consumption & Labour Cost breakdown
      const materialFromExpenses = [...projExpenseRecs, ...projSiteExps]
        .filter((e) => {
          const c = String(e.category || '').toLowerCase();
          return c.includes('cement') || c.includes('steel') || c.includes('material') || c.includes('aggregate');
        })
        .reduce((s, e) => s + toNum(e.amount), 0);

      const materialCost = Math.max(toNum(proj.actualCosts?.material), stockAllocationCost) + materialFromExpenses;

      const labourFromExpenses = [...projExpenseRecs, ...projSiteExps]
        .filter((e) => {
          const c = String(e.category || '').toLowerCase();
          return c.includes('labour') || c.includes('wage') || c.includes('overtime') || c.includes('subcontractor');
        })
        .reduce((s, e) => s + toNum(e.amount), 0);

      const labourCost = toNum(proj.actualCosts?.labour) + labourFromExpenses;

      // Physical Completion Percentage (STRICTLY non-financial!)
      const activities = Array.isArray(proj.activities) ? proj.activities : [];
      const activityAvg =
        activities.length > 0
          ? Math.round(activities.reduce((s, a) => s + toNum(a.progress ?? a.completionPercentage), 0) / activities.length)
          : null;

      const rawCompletion = proj.completionPercentage ?? proj.progress ?? proj.physicalProgress ?? activityAvg ?? 0;
      const completionPct = Math.max(0, Math.min(100, Math.round(toNum(rawCompletion))));

      // Milestones / Tasks breakdown
      const completedTasks = activities.filter(
        (a) => String(a.status || '').toLowerCase() === 'completed' || toNum(a.progress) >= 100
      ).length;
      const projDprs = dprLogs.filter((d) => {
        if (!isDateWithinRange(d.date, range)) return false;
        const ref = resolveProjectRef(d, projects);
        return ref.id === pId || String(ref.name).toLowerCase() === pName.toLowerCase();
      });
      const delayedDprCount = projDprs.filter((d) => Boolean(d.isDelayed)).length;

      const isPastDeadline = Boolean(expectedEndDate && expectedEndDate < todayIso && completionPct < 100 && String(proj.status || '').toLowerCase() !== 'completed');
      const delayedTasksFromActivities = activities.filter(
        (a) => String(a.status || '').toLowerCase() === 'delayed' || (isPastDeadline && toNum(a.progress) < 100)
      ).length;
      const delayedTasks = Math.max(delayedTasksFromActivities, delayedDprCount);

      const pendingTasks = Math.max(0, activities.length - completedTasks);

      let derivedStatus = proj.status || 'Ongoing';
      if (completionPct >= 100 || String(proj.status || '').toLowerCase() === 'completed') {
        derivedStatus = 'Completed';
      } else if (isPastDeadline || String(proj.status || '').toLowerCase() === 'delayed' || delayedDprCount > 0) {
        derivedStatus = 'Delayed';
      }

      const scheduleGapDays =
        expectedEndDate && derivedStatus !== 'Completed'
          ? Math.ceil((new Date(`${todayIso}T00:00:00`) - new Date(`${expectedEndDate}T00:00:00`)) / (1000 * 60 * 60 * 24))
          : 0;

      return {
        id: pId,
        projectCode: pCode,
        projectName: pName,
        clientName: proj.clientName || 'Internal / Unassigned',
        location: proj.location || '—',
        startDate: startDate || '—',
        expectedCompletionDate: expectedEndDate || '—',
        projectStatus: derivedStatus,
        isDelayed: derivedStatus === 'Delayed',
        delayDays: scheduleGapDays > 0 ? scheduleGapDays : 0,
        totalBudget,
        actualExpenses,
        remainingBudget,
        budgetUtilizationPct,
        isOverBudget,
        completionPct,
        totalTasks: activities.length,
        completedTasks,
        pendingTasks,
        delayedTasks,
        materialCost,
        labourCost,
        milestones: activities.map((act, idx) => ({
          id: act.id || `${pId}-ACT-${idx + 1}`,
          projectId: pId,
          projectName: pName,
          name: act.name || act.title || `Milestone ${idx + 1}`,
          status:
            toNum(act.progress) >= 100 || String(act.status || '').toLowerCase() === 'completed'
              ? 'Completed'
              : isPastDeadline || String(act.status || '').toLowerCase() === 'delayed'
                ? 'Delayed'
                : toNum(act.progress) > 0
                  ? 'In Progress'
                  : act.status || 'Pending',
          progress: Math.max(0, Math.min(100, Math.round(toNum(act.progress)))),
          targetDate: extractIsoDate(act.targetDate || act.endDate) || expectedEndDate || '—'
        })),
        dprCount: projDprs.length
      };
    });

  const summary = {
    totalProjects: rows.length,
    completedProjects: rows.filter((r) => r.projectStatus === 'Completed').length,
    ongoingProjects: rows.filter((r) => r.projectStatus === 'Ongoing' || r.projectStatus === 'In Progress').length,
    delayedProjects: rows.filter((r) => r.isDelayed).length,
    overBudgetProjects: rows.filter((r) => r.isOverBudget).length,
    totalBudget: rows.reduce((s, r) => s + r.totalBudget, 0),
    totalExpenses: rows.reduce((s, r) => s + r.actualExpenses, 0),
    remainingBudget: rows.reduce((s, r) => s + r.remainingBudget, 0),
    avgCompletionPct:
      rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.completionPct, 0) / rows.length) * 10) / 10 : 0,
    completedTasks: rows.reduce((s, r) => s + r.completedTasks, 0),
    pendingTasks: rows.reduce((s, r) => s + r.pendingTasks, 0),
    delayedTasks: rows.reduce((s, r) => s + r.delayedTasks, 0),
    totalMaterialCost: rows.reduce((s, r) => s + r.materialCost, 0),
    totalLabourCost: rows.reduce((s, r) => s + r.labourCost, 0)
  };

  const chartData = rows.slice(0, 12).map((r) => ({
    name: r.projectName.length > 18 ? `${r.projectName.slice(0, 16)}..` : r.projectName,
    budget: r.totalBudget,
    expenses: r.actualExpenses,
    completionPct: r.completionPct
  }));

  const milestones = rows.flatMap((r) => r.milestones);

  return {
    periodLabel: range.label,
    rows,
    summary,
    chartData,
    milestones
  };
};

/**
 * 3. FINANCIAL SUMMARY REPORTS COMPUTATION
 * Strictly avoids duplicate counting, excludes Cancelled/Rejected entries, excludes Customer Advances from Earned Revenue,
 * and reconciles live ERP ledgers against Tally v2 gateway state.
 */
export const computeFinancialSummaryMIS = (rawErpData = {}, externalData = {}, filters = {}) => {
  const erpData = sanitizeMISERPData(rawErpData);
  const range = resolveFilterDateRange(filters);
  const slices = getCanonicalFilteredSlices(erpData, externalData, filters, range);
  const {
    projects,
    filteredIncomes,
    filteredExpenseRecords,
    filteredSiteExpenses
  } = slices;

  const paymentTracking = erpData.paymentTracking || [];
  const vendorPayments = erpData.vendorPayments || [];
  const ledgerEntries = erpData.ledgerEntries || [];
  const incomeRecords = slices.allValidIncomes || [];
  const expenseRecords = slices.validExpenseRecords || [];
  const inventory = erpData.inventory || [];

  // Earned Revenue vs Customer Advances (Liability)
  const earnedIncomeRows = filteredIncomes.filter((r) => !isAdvanceCategory(r));
  const advanceIncomeRows = filteredIncomes.filter((r) => isAdvanceCategory(r));

  const totalRevenue = earnedIncomeRows.reduce((s, r) => s + toNum(r.amount ?? r.receivedAmount), 0);
  const customerAdvances = advanceIncomeRows.reduce((s, r) => s + toNum(r.amount ?? r.receivedAmount), 0);

  // Cash Receipts include both earned collections and advance cash inflows
  const paymentsReceived = filteredIncomes.reduce(
    (s, r) => s + toNum(r.receivedAmount ?? (r.status === 'Pending' ? 0 : r.amount)),
    0
  );

  // Direct Expense Vouchers & Site Expenses
  const directExpenseVoucherTotal = filteredExpenseRecords.reduce((s, e) => s + toNum(e.amount), 0);
  const siteExpensesTotal = filteredSiteExpenses.reduce((s, e) => s + toNum(e.amount), 0);

  // Project stock issue expenditure (non-vouchered inventory allocation cost)
  const scopedProjects = projects.filter((p) => {
    if (!filters.projectId || filters.projectId === 'ALL') return true;
    return p.id === filters.projectId;
  });
  const includeStockIssues =
    !range.start || filters.periodPreset === 'all_time' || filters.periodPreset === 'financial_year';

  const stockAllocationExpenses = includeStockIssues
    ? scopedProjects.reduce((sum, p) => {
        const invCost = inventory.reduce(
          (s, item) => s + toNum(item.projectAllocation?.[p.id]) * toNum(item.unitPrice ?? item.rate),
          0
        );
        return sum + Math.max(toNum(p.actualExpenditure), invCost);
      }, 0)
    : 0;

  const totalExpenses = directExpenseVoucherTotal + siteExpensesTotal + stockAllocationExpenses;

  // Cash Payments Made
  const paymentsMade =
    filteredExpenseRecords.reduce(
      (s, e) => s + (e.status === 'Pending' ? toNum(e.paidAmount) : toNum(e.paidAmount ?? e.amount)),
      0
    ) +
    filteredSiteExpenses
      .filter((e) => e.status === 'Approved' || e.status === 'Paid')
      .reduce((s, e) => s + toNum(e.amount), 0);

  // Direct Construction Cost vs Indirect Overheads for Gross Profit vs Net Profit
  const isIndirectOverhead = (rec) => {
    const c = String(rec.category || '').toLowerCase();
    return c.includes('petty cash') || c.includes('statutory') || c.includes('municipal') || c.includes('office') || c.includes('admin');
  };

  const directConstructionCosts =
    filteredExpenseRecords.filter((e) => !isIndirectOverhead(e)).reduce((s, e) => s + toNum(e.amount), 0) +
    filteredSiteExpenses.filter((e) => !isIndirectOverhead(e)).reduce((s, e) => s + toNum(e.amount), 0) +
    stockAllocationExpenses;

  const indirectOverheads = Math.max(0, totalExpenses - directConstructionCosts);
  const grossProfit = totalRevenue - directConstructionCosts;
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  // Outstanding Receivables & Payables (filtered by selected Project if active)
  const filterByProjectOnly = (rec) => {
    if (!filters.projectId || filters.projectId === 'ALL') return true;
    const pRef = resolveProjectRef(rec, projects);
    return pRef.id === filters.projectId;
  };

  const outstandingReceivables =
    paymentTracking
      .filter(filterByProjectOnly)
      .reduce((s, p) => s + Math.max(0, toNum(p.remainingAmount ?? (toNum(p.totalAmount) - toNum(p.receivedAmount)))), 0) +
    incomeRecords
      .filter(filterByProjectOnly)
      .reduce((s, i) => s + Math.max(0, toNum(i.pendingAmount)), 0);

  const vendorPaymentsRemaining = vendorPayments
    .filter(filterByProjectOnly)
    .reduce((s, v) => s + Math.max(0, toNum(v.remainingAmount ?? (toNum(v.totalAmount) - toNum(v.paidAmount)))), 0);

  const vendorLedgerNetPayable = Math.max(
    0,
    ledgerEntries
      .filter((l) => (l.entityType === 'Vendor' || l.vendorId) && filterByProjectOnly(l))
      .reduce((s, l) => s + toNum(l.credit) - toNum(l.debit), 0)
  );

  const outstandingPayables =
    Math.max(vendorLedgerNetPayable, vendorPaymentsRemaining) +
    expenseRecords.filter(filterByProjectOnly).reduce((s, e) => s + Math.max(0, toNum(e.pendingAmount)), 0);

  // Monthly Financial Summary Chart & Table
  const monthBuckets = new Map();
  const touchMonth = (rawDate) => {
    const iso = extractIsoDate(rawDate);
    if (!iso || iso.length < 7) return null;
    const ym = iso.slice(0, 7);
    if (!monthBuckets.has(ym)) {
      const dt = new Date(`${ym}-01T00:00:00`);
      const label = Number.isNaN(dt.getTime()) ? ym : dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      monthBuckets.set(ym, {
        ym,
        month: label,
        earnedRevenue: 0,
        customerAdvances: 0,
        expenses: 0,
        cashInflow: 0,
        cashOutflow: 0,
        netProfit: 0
      });
    }
    return monthBuckets.get(ym);
  };

  filteredIncomes.forEach((inc) => {
    const b = touchMonth(inc.date || inc.createdAt);
    if (!b) return;
    const amt = toNum(inc.amount ?? inc.receivedAmount);
    const recd = toNum(inc.receivedAmount ?? (inc.status === 'Pending' ? 0 : amt));
    if (isAdvanceCategory(inc)) b.customerAdvances += amt;
    else b.earnedRevenue += amt;
    b.cashInflow += recd;
  });

  filteredExpenseRecords.forEach((exp) => {
    const b = touchMonth(exp.date || exp.createdAt);
    if (!b) return;
    const amt = toNum(exp.amount);
    const paid = exp.status === 'Pending' ? toNum(exp.paidAmount) : toNum(exp.paidAmount ?? amt);
    b.expenses += amt;
    b.cashOutflow += paid;
  });

  filteredSiteExpenses.forEach((exp) => {
    const b = touchMonth(exp.date || exp.createdAt);
    if (!b) return;
    const amt = toNum(exp.amount);
    b.expenses += amt;
    if (exp.status === 'Approved' || exp.status === 'Paid') b.cashOutflow += amt;
  });

  const monthlySummary = Array.from(monthBuckets.values())
    .sort((a, b) => a.ym.localeCompare(b.ym))
    .map((m) => ({
      ...m,
      netProfit: m.earnedRevenue - m.expenses,
      netCashFlow: m.cashInflow - m.cashOutflow
    }));

  // Project-wise Financial Summary
  const projectFinancialMap = new Map();
  const touchProjectFin = (projObj) => {
    const pid = projObj.id || projObj.name;
    if (!projectFinancialMap.has(pid)) {
      projectFinancialMap.set(pid, {
        projectId: pid,
        projectName: projObj.name,
        budget: toNum(projObj.budget),
        earnedRevenue: 0,
        customerAdvances: 0,
        expenses: 0,
        paymentsReceived: 0,
        paymentsMade: 0,
        receivablePending: 0,
        payablePending: 0
      });
    }
    return projectFinancialMap.get(pid);
  };

  scopedProjects.forEach((p) => {
    const entry = touchProjectFin({
      id: p.id,
      name: p.name || p.projectName || 'Unnamed Project',
      budget: p.budget ?? p.projectBudget ?? p.contractValue
    });
    if (includeStockIssues) {
      const invCost = inventory.reduce(
        (s, item) => s + toNum(item.projectAllocation?.[p.id]) * toNum(item.unitPrice ?? item.rate),
        0
      );
      entry.expenses += Math.max(toNum(p.actualExpenditure), invCost);
    }
  });

  filteredIncomes.forEach((inc) => {
    const ref = resolveProjectRef(inc, projects);
    const entry = touchProjectFin({ id: ref.id || ref.name, name: ref.name, budget: 0 });
    const amt = toNum(inc.amount ?? inc.receivedAmount);
    if (isAdvanceCategory(inc)) entry.customerAdvances += amt;
    else entry.earnedRevenue += amt;
    entry.paymentsReceived += toNum(inc.receivedAmount ?? (inc.status === 'Pending' ? 0 : amt));
    entry.receivablePending += toNum(inc.pendingAmount);
  });

  [...filteredExpenseRecords, ...filteredSiteExpenses].forEach((exp) => {
    const ref = resolveProjectRef(exp, projects);
    const entry = touchProjectFin({ id: ref.id || ref.name, name: ref.name, budget: 0 });
    const amt = toNum(exp.amount);
    entry.expenses += amt;
    entry.paymentsMade += exp.status === 'Pending' || exp.status === 'Submitted' ? toNum(exp.paidAmount) : toNum(exp.paidAmount ?? amt);
    entry.payablePending += toNum(exp.pendingAmount);
  });

  paymentTracking.filter(filterByProjectOnly).forEach((pt) => {
    const ref = resolveProjectRef(pt, projects);
    const entry = touchProjectFin({ id: ref.id || ref.name, name: ref.name, budget: 0 });
    entry.receivablePending += Math.max(0, toNum(pt.remainingAmount));
  });

  vendorPayments.filter(filterByProjectOnly).forEach((vp) => {
    const ref = resolveProjectRef(vp, projects);
    const entry = touchProjectFin({ id: ref.id || ref.name, name: ref.name, budget: 0 });
    entry.payablePending += Math.max(0, toNum(vp.remainingAmount));
  });

  const projectFinancialRows = Array.from(projectFinancialMap.values()).map((row) => ({
    ...row,
    netProfit: row.earnedRevenue - row.expenses,
    marginPct: row.earnedRevenue > 0 ? Math.round(((row.earnedRevenue - row.expenses) / row.earnedRevenue) * 1000) / 10 : 0
  }));

  // Outstanding Payment Rows (Both Receivables & Payables clearly labeled)
  const outstandingRows = [
    ...paymentTracking.filter(filterByProjectOnly).filter((pt) => toNum(pt.remainingAmount) > 0).map((pt) => ({
      id: pt.id || `PT-${pt.clientName}`,
      type: 'Receivable',
      party: pt.clientName || 'Client',
      projectName: resolveProjectRef(pt, projects).name,
      date: extractIsoDate(pt.dueDate || pt.date || pt.createdAt) || '—',
      totalAmount: toNum(pt.totalAmount),
      settledAmount: toNum(pt.receivedAmount),
      pendingAmount: Math.max(0, toNum(pt.remainingAmount)),
      status: pt.status || 'Pending'
    })),
    ...incomeRecords.filter(filterByProjectOnly).filter((i) => toNum(i.pendingAmount) > 0).map((i) => ({
      id: i.id,
      type: 'Receivable',
      party: i.party || 'Client',
      projectName: resolveProjectRef(i, projects).name,
      date: extractIsoDate(i.date || i.createdAt) || '—',
      totalAmount: toNum(i.amount),
      settledAmount: toNum(i.receivedAmount),
      pendingAmount: toNum(i.pendingAmount),
      status: i.status || 'Pending'
    })),
    ...vendorPayments.filter(filterByProjectOnly).filter((vp) => toNum(vp.remainingAmount) > 0).map((vp) => ({
      id: vp.id || `VP-${vp.vendorName}`,
      type: 'Payable',
      party: vp.vendorName || 'Vendor',
      projectName: resolveProjectRef(vp, projects).name,
      date: extractIsoDate(vp.dueDate || vp.date || vp.createdAt) || '—',
      totalAmount: toNum(vp.totalAmount),
      settledAmount: toNum(vp.paidAmount),
      pendingAmount: Math.max(0, toNum(vp.remainingAmount)),
      status: vp.status || 'Pending'
    })),
    ...expenseRecords.filter(filterByProjectOnly).filter((e) => toNum(e.pendingAmount) > 0).map((e) => ({
      id: e.id,
      type: 'Payable',
      party: e.vendorName || e.payee || 'Supplier',
      projectName: resolveProjectRef(e, projects).name,
      date: extractIsoDate(e.date || e.createdAt) || '—',
      totalAmount: toNum(e.amount),
      settledAmount: toNum(e.paidAmount),
      pendingAmount: toNum(e.pendingAmount),
      status: e.status || 'Pending'
    }))
  ];

  // Income rows & Expense rows formatted for Sub-Reports 1 & 2
  const incomeRows = filteredIncomes.map((inc) => ({
    id: inc.id,
    date: extractIsoDate(inc.date || inc.createdAt) || '—',
    projectName: resolveProjectRef(inc, projects).name,
    party: inc.party || '—',
    category: inc.category || 'General Revenue',
    classification: isAdvanceCategory(inc) ? 'Advance Liability' : 'Earned Revenue',
    amount: toNum(inc.amount ?? inc.receivedAmount),
    receivedAmount: toNum(inc.receivedAmount ?? (inc.status === 'Pending' ? 0 : inc.amount)),
    pendingAmount: toNum(inc.pendingAmount),
    status: inc.status || 'Received'
  }));

  const expenseRows = [
    ...filteredExpenseRecords.map((e) => ({
      id: e.id,
      date: extractIsoDate(e.date || e.createdAt) || '—',
      projectName: resolveProjectRef(e, projects).name,
      party: e.vendorName || e.payee || '—',
      category: e.category || 'Account Expense',
      source: 'Account Voucher',
      amount: toNum(e.amount),
      paidAmount: e.status === 'Pending' ? toNum(e.paidAmount) : toNum(e.paidAmount ?? e.amount),
      pendingAmount: toNum(e.pendingAmount),
      status: e.status || 'Paid'
    })),
    ...filteredSiteExpenses.map((e) => ({
      id: e.id,
      date: extractIsoDate(e.date || e.createdAt) || '—',
      projectName: resolveProjectRef(e, projects).name,
      party: e.requester || 'Site Engineer',
      category: e.category || e.title || 'Site Expense',
      source: 'Site Request',
      amount: toNum(e.amount),
      paidAmount: e.status === 'Approved' || e.status === 'Paid' ? toNum(e.amount) : 0,
      pendingAmount: e.status === 'Approved' || e.status === 'Paid' ? 0 : toNum(e.amount),
      status: e.status || 'Submitted'
    }))
  ];

  // Expense Breakdown by Category for Charts & P&L
  const expenseByCategoryMap = new Map();
  expenseRows.forEach((r) => {
    expenseByCategoryMap.set(r.category, (expenseByCategoryMap.get(r.category) || 0) + r.amount);
  });
  if (stockAllocationExpenses > 0) {
    expenseByCategoryMap.set(
      'Site Stock Issues (Allocated Material)',
      (expenseByCategoryMap.get('Site Stock Issues (Allocated Material)') || 0) + stockAllocationExpenses
    );
  }
  const expenseCategoryBreakdown = Array.from(expenseByCategoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Tally Reconciliation Check
  const tallyCfg = erpData.tallyConfig || {};
  const tallyVerifyItems = Array.isArray(externalData.tallyVerify) ? externalData.tallyVerify : [];
  const tallyLedgers = Array.isArray(externalData.tallyLedgers) ? externalData.tallyLedgers : [];
  const tallyMismatches = tallyVerifyItems.filter((item) => item.status === 'Mismatch');
  const tallyLedgerIssues = tallyLedgers.filter((l) => l.status !== 'Matched');

  const tallyReconciliation = {
    configured: Boolean(tallyCfg.companyName || externalData.tallyCompany?.companyName),
    companyName: externalData.tallyCompany?.companyName || tallyCfg.companyName || 'Not Configured',
    connected: Boolean(tallyCfg.isConnected || externalData.tallyCompany?.isConnected),
    lastSyncedAt: tallyCfg.lastSync || tallyCfg.lastSyncedAt || null,
    verifiedCompleted: Boolean(externalData.tallyVerifyDone || tallyVerifyItems.length > 0),
    verifyItems: tallyVerifyItems,
    mismatchCount: tallyMismatches.length,
    ledgerMismatchCount: tallyLedgerIssues.length,
    syncState:
      !tallyCfg.companyName && !externalData.tallyCompany?.companyName
        ? 'Unavailable (Tally Not Linked)'
        : tallyMismatches.length > 0 || tallyLedgerIssues.length > 0
          ? `Discrepancy Detected (${tallyMismatches.length + tallyLedgerIssues.length} items)`
          : externalData.tallyVerifyDone || tallyVerifyItems.length > 0
            ? 'Reconciled with Tally'
            : 'Pending Tally Verification'
  };

  return {
    periodLabel: range.label,
    summary: {
      totalRevenue,
      customerAdvances,
      totalExpenses,
      directConstructionCosts,
      indirectOverheads,
      grossProfit,
      netProfit,
      profitMarginPct,
      paymentsReceived,
      paymentsMade,
      netCashFlow: paymentsReceived - paymentsMade,
      outstandingReceivables,
      outstandingPayables,
      stockAllocationExpenses
    },
    monthlySummary,
    projectFinancialRows,
    outstandingRows,
    incomeRows,
    expenseRows,
    expenseCategoryBreakdown,
    tallyReconciliation
  };
};

/**
 * 4. EXECUTIVE MANAGEMENT REPORTS COMPUTATION
 */
export const computeManagementMIS = (rawErpData = {}, externalData = {}, filters = {}) => {
  const erpData = sanitizeMISERPData(rawErpData);
  const range = resolveFilterDateRange(filters);
  const progressMIS = computeProjectProgressMIS(erpData, externalData, filters);
  const financialMIS = computeFinancialSummaryMIS(erpData, externalData, filters);
  const slices = getCanonicalFilteredSlices(erpData, externalData, filters, range);

  const approvals = erpData.approvals || [];
  const inventory = erpData.inventory || [];
  const leads = erpData.leads || [];
  const employees = erpData.hrmsEmployees || [];
  const siteExpenses = (erpData.expenses || []).filter((r) => r && r.status !== 'Rejected');

  const pendingApprovalsList = approvals.filter((a) =>
    ['Submitted', 'Draft', 'Pending'].includes(String(a.status || ''))
  );
  const pendingSiteExpenseApprovals = siteExpenses.filter(
    (e) => String(e.status || '') === 'Submitted' || String(e.status || '') === 'Pending'
  );

  // Department-wise Performance
  const deptMap = new Map();
  const touchDept = (name) => {
    const key = name || 'General Operations';
    if (!deptMap.has(key)) {
      deptMap.set(key, {
        department: key,
        headcount: 0,
        revenue: 0,
        expenses: 0,
        pendingApprovals: 0,
        attendancePresent: 0,
        attendanceTotal: 0
      });
    }
    return deptMap.get(key);
  };

  employees.forEach((emp) => {
    const d = touchDept(emp.department || 'Civil Engineering & Site Ops');
    d.headcount += 1;
  });

  slices.filteredIncomes.filter((i) => !isAdvanceCategory(i)).forEach((inc) => {
    const d = touchDept(inferRecordDepartment(inc, employees));
    d.revenue += toNum(inc.amount ?? inc.receivedAmount);
  });

  [...slices.filteredExpenseRecords, ...slices.filteredSiteExpenses].forEach((exp) => {
    const d = touchDept(inferRecordDepartment(exp, employees));
    d.expenses += toNum(exp.amount);
  });

  pendingApprovalsList.forEach((app) => {
    const d = touchDept(inferRecordDepartment(app, employees));
    d.pendingApprovals += 1;
  });

  slices.attendanceEntries.forEach((att) => {
    const d = touchDept(att.department);
    d.attendanceTotal += 1;
    if (String(att.status || '').toLowerCase() === 'present') d.attendancePresent += 1;
  });

  const departmentPerformance = Array.from(deptMap.values()).map((d) => ({
    ...d,
    attendanceRatePct: d.attendanceTotal > 0 ? Math.round((d.attendancePresent / d.attendanceTotal) * 100) : null,
    netContribution: d.revenue - d.expenses
  }));

  // Employee Performance (Employees + Attendance + GPS + DPRs + Leads)
  const employeePerformance = employees
    .filter((emp) => {
      if (filters.department && filters.department !== 'ALL' && emp.department !== filters.department) return false;
      if (filters.search && !`${emp.name} ${emp.designation} ${emp.department}`.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    })
    .map((emp) => {
      const empAtt = slices.attendanceEntries.filter(
        (a) => a.empId === emp.id || String(a.name || '').trim().toLowerCase() === String(emp.name || '').trim().toLowerCase()
      );
      const presentDays = empAtt.filter((a) => String(a.status || '').toLowerCase() === 'present').length;
      const overtimeHours = empAtt.reduce((s, a) => s + toNum(a.overtimeHours), 0);
      const gpsCount = slices.filteredGpsLogs.filter(
        (g) => g.empId === emp.id || String(g.empName || '').trim().toLowerCase() === String(emp.name || '').trim().toLowerCase()
      ).length;
      const dprSubmitted = slices.filteredDprLogs.filter(
        (d) => String(d.engineer || '').trim().toLowerCase() === String(emp.name || '').trim().toLowerCase()
      ).length;
      const leadsHandled = leads.filter(
        (l) => String(l.assignedEmployee || '').trim().toLowerCase() === String(emp.name || '').trim().toLowerCase()
      ).length;

      return {
        id: emp.id,
        name: emp.name,
        designation: emp.designation || 'Staff',
        department: emp.department || 'Civil Engineering & Site Ops',
        presentDays,
        markedDays: empAtt.length,
        attendanceRatePct: empAtt.length > 0 ? Math.round((presentDays / empAtt.length) * 100) : null,
        overtimeHours,
        gpsCheckIns: gpsCount,
        dprSubmitted,
        leadsHandled,
        status: emp.status || 'Active'
      };
    });

  // Business Risk Indicators (Strictly derived from live data)
  const risks = [];
  const delayedProjects = progressMIS.rows.filter((p) => p.isDelayed);
  const overBudgetProjects = progressMIS.rows.filter((p) => p.isOverBudget);
  const lowStockItems = inventory.filter((item) => toNum(item.currentStock) <= toNum(item.minimumThreshold));

  if (delayedProjects.length > 0) {
    risks.push({
      id: 'RISK-DELAYED-PROJECTS',
      severity: 'High',
      category: 'Schedule Delay',
      title: `${delayedProjects.length} Project(s) Behind Schedule`,
      detail: delayedProjects.slice(0, 3).map((p) => `${p.projectName} (${p.delayDays > 0 ? `${p.delayDays}d overdue` : 'DPR delay'})`).join(', '),
      metric: `${delayedProjects.length} Delayed`
    });
  }

  if (overBudgetProjects.length > 0) {
    risks.push({
      id: 'RISK-BUDGET-OVERRUN',
      severity: 'Critical',
      category: 'Cost Overrun',
      title: `${overBudgetProjects.length} Project(s) Exceeded Approved Budget`,
      detail: overBudgetProjects.slice(0, 3).map((p) => `${p.projectName} (${p.budgetUtilizationPct}% used)`).join(', '),
      metric: `${overBudgetProjects.length} Over Budget`
    });
  }

  if (financialMIS.summary.outstandingReceivables > 0) {
    risks.push({
      id: 'RISK-RECEIVABLES',
      severity: financialMIS.summary.outstandingReceivables > 500000 ? 'High' : 'Medium',
      category: 'Receivables Exposure',
      title: 'Pending Client Recoveries Requiring Follow-up',
      detail: `${financialMIS.outstandingRows.filter((r) => r.type === 'Receivable').length} open receivable accounts/invoices.`,
      metric: financialMIS.summary.outstandingReceivables
    });
  }

  if (financialMIS.summary.outstandingPayables > 0) {
    risks.push({
      id: 'RISK-PAYABLES',
      severity: 'Medium',
      category: 'Vendor Payables',
      title: 'Pending Supplier & Subcontractor Dues',
      detail: `${financialMIS.outstandingRows.filter((r) => r.type === 'Payable').length} unpaid vendor bills / obligations.`,
      metric: financialMIS.summary.outstandingPayables
    });
  }

  if (lowStockItems.length > 0) {
    risks.push({
      id: 'RISK-LOW-STOCK',
      severity: 'Medium',
      category: 'Material Shortage',
      title: `${lowStockItems.length} Inventory Item(s) Below Reorder Level`,
      detail: lowStockItems.slice(0, 3).map((i) => i.itemName || i.name).join(', '),
      metric: `${lowStockItems.length} Low Stock`
    });
  }

  if (financialMIS.tallyReconciliation.mismatchCount > 0 || financialMIS.tallyReconciliation.ledgerMismatchCount > 0) {
    risks.push({
      id: 'RISK-TALLY-DIFF',
      severity: 'High',
      category: 'Accounting Reconciliation',
      title: 'Tally Reconciliation Mismatches Identified',
      detail: financialMIS.tallyReconciliation.syncState,
      metric: `${financialMIS.tallyReconciliation.mismatchCount + financialMIS.tallyReconciliation.ledgerMismatchCount} Mismatches`
    });
  }

  // Automated Data-Driven Management Insights
  const insights = [];
  if (financialMIS.summary.totalRevenue > 0) {
    insights.push(
      `Operating Net Profit Margin for ${range.label} stands at ${financialMIS.summary.profitMarginPct}% (excluding ₹${Math.round(financialMIS.summary.customerAdvances).toLocaleString('en-IN')} in customer advances held as liability).`
    );
  } else {
    insights.push(`No earned revenue transactions recorded in ${range.label}. Verify RA bill realization or expand reporting period.`);
  }

  if (progressMIS.summary.totalProjects > 0) {
    insights.push(
      `Portfolio physical completion averages ${progressMIS.summary.avgCompletionPct}% across ${progressMIS.summary.totalProjects} project(s), with ${progressMIS.summary.delayedProjects} delayed and ${progressMIS.summary.overBudgetProjects} over budget.`
    );
  }

  if (pendingApprovalsList.length + pendingSiteExpenseApprovals.length > 0) {
    insights.push(
      `${pendingApprovalsList.length} workflow approval(s) and ${pendingSiteExpenseApprovals.length} site expense voucher(s) await executive sign-off.`
    );
  }

  const perfScore =
    progressMIS.summary.totalProjects === 0 && financialMIS.summary.totalRevenue === 0
      ? null
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              70 +
                (financialMIS.summary.profitMarginPct > 10 ? 15 : financialMIS.summary.profitMarginPct > 0 ? 8 : -10) -
                delayedProjects.length * 8 -
                overBudgetProjects.length * 10
            )
          )
        );

  return {
    periodLabel: range.label,
    executiveKPIs: {
      overallPerformanceScore: perfScore,
      totalProjects: progressMIS.summary.totalProjects,
      activeProjects: progressMIS.summary.ongoingProjects + progressMIS.summary.delayedProjects,
      completedProjects: progressMIS.summary.completedProjects,
      delayedProjects: progressMIS.summary.delayedProjects,
      totalRevenue: financialMIS.summary.totalRevenue,
      customerAdvances: financialMIS.summary.customerAdvances,
      totalExpenses: financialMIS.summary.totalExpenses,
      netProfit: financialMIS.summary.netProfit,
      profitMarginPct: financialMIS.summary.profitMarginPct,
      pendingApprovalsCount: pendingApprovalsList.length + pendingSiteExpenseApprovals.length,
      outstandingReceivables: financialMIS.summary.outstandingReceivables,
      outstandingPayables: financialMIS.summary.outstandingPayables
    },
    projectPerformance: financialMIS.projectFinancialRows.map((fin) => {
      const prog = progressMIS.rows.find((p) => p.id === fin.projectId || p.projectName === fin.projectName);
      return {
        ...fin,
        completionPct: prog?.completionPct ?? 0,
        projectStatus: prog?.projectStatus ?? 'Active',
        isDelayed: prog?.isDelayed ?? false,
        isOverBudget: prog?.isOverBudget ?? false
      };
    }),
    departmentPerformance,
    employeePerformance,
    pendingApprovals: [
      ...pendingApprovalsList.map((a) => ({
        id: a.id,
        category: a.type || 'Workflow Approval',
        title: a.title || a.referenceId || 'Approval Request',
        requester: a.requester || '—',
        date: extractIsoDate(a.date) || '—',
        amount: toNum(a.amount),
        status: a.status
      })),
      ...pendingSiteExpenseApprovals.map((e) => ({
        id: e.id,
        category: e.category || 'Site Expense',
        title: e.title || e.description || 'Site Expense Voucher',
        requester: e.requester || 'Site Engineer',
        date: extractIsoDate(e.date || e.createdAt) || '—',
        amount: toNum(e.amount),
        status: e.status
      }))
    ],
    growthTrends: financialMIS.monthlySummary,
    risks,
    insights,
    tallyStatus: financialMIS.tallyReconciliation
  };
};
