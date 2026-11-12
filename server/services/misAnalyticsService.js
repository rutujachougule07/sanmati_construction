// SANMATI CONSTRUCTIONS ERP - MIS Backend Validation, Security & Aggregation Service

const VALID_SECTIONS = new Set([
  'daily-monthly',
  'project-progress',
  'financial-summary',
  'management'
]);

const VALID_PERIODS = new Set([
  'today',
  'yesterday',
  'this_week',
  'this_month',
  'last_month',
  'this_year',
  'financial_year',
  'custom',
  'all_time'
]);

export const SECTION_ALLOWED_ROLES = {
  'daily-monthly': null, // All authenticated ERP roles
  'project-progress': null, // All authenticated ERP roles
  'financial-summary': ['Super Admin / Owner', 'Accountant', 'Project Manager'],
  management: ['Super Admin / Owner', 'Project Manager', 'Accountant', 'HR Manager']
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isValidIsoDate = (val) => {
  if (!val || typeof val !== 'string' || !ISO_DATE_RE.test(val)) return false;
  const parsed = new Date(`${val}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === val;
};

/**
 * Checks whether the supplied role is authorized for a given MIS section.
 */
export const isRoleAuthorizedForSection = (section, userRole) => {
  const allowed = SECTION_ALLOWED_ROLES[section];
  if (!allowed) return true;
  if (!userRole) return false;
  return allowed.includes(String(userRole).trim());
};

/**
 * Validates and sanitizes incoming MIS report filters on the backend.
 */
export const validateMISFilters = (input = {}, section = 'daily-monthly') => {
  const errors = [];

  if (!VALID_SECTIONS.has(section)) {
    errors.push(`Unsupported MIS report section "${section}".`);
  }

  const periodPreset = String(input.periodPreset || 'financial_year').trim();
  if (!VALID_PERIODS.has(periodPreset)) {
    errors.push(`Invalid period preset "${periodPreset}".`);
  }

  const startDate = input.startDate ? String(input.startDate).trim().slice(0, 10) : '';
  const endDate = input.endDate ? String(input.endDate).trim().slice(0, 10) : '';

  if (startDate && !isValidIsoDate(startDate)) {
    errors.push('startDate must be a valid YYYY-MM-DD calendar date.');
  }
  if (endDate && !isValidIsoDate(endDate)) {
    errors.push('endDate must be a valid YYYY-MM-DD calendar date.');
  }
  if (startDate && endDate && isValidIsoDate(startDate) && isValidIsoDate(endDate) && startDate > endDate) {
    errors.push('startDate cannot be later than endDate.');
  }
  if (periodPreset === 'custom' && (!startDate || !endDate)) {
    errors.push('Custom date range requires both startDate and endDate.');
  }

  const page = Number.parseInt(input.page ?? '1', 10);
  const pageSize = Number.parseInt(input.pageSize ?? '25', 10);

  if (!Number.isFinite(page) || page < 1) {
    errors.push('page must be a positive integer >= 1.');
  }
  if (!Number.isFinite(pageSize) || pageSize < 5 || pageSize > 200) {
    errors.push('pageSize must be between 5 and 200.');
  }

  const financialYear = String(input.financialYear || 'FY2026-27').trim();
  if (!/^FY\d{4}-\d{2}$/.test(financialYear)) {
    errors.push('financialYear must follow FYyyyy-yy format (e.g. FY2026-27).');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      section,
      periodPreset,
      financialYear,
      startDate,
      endDate,
      projectId: String(input.projectId || 'ALL').trim().slice(0, 100),
      department: String(input.department || 'ALL').trim().slice(0, 100),
      status: String(input.status || 'ALL').trim().slice(0, 60),
      reportType: String(input.reportType || '').trim().slice(0, 60),
      search: String(input.search || '').trim().slice(0, 120),
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      pageSize: Number.isFinite(pageSize) ? Math.min(200, Math.max(5, pageSize)) : 25
    }
  };
};

const COLLECTION_NAMES = [
  'projects',
  'clients',
  'vendors',
  'raBills',
  'expenses',
  'incomeRecords',
  'expenseRecords',
  'paymentTracking',
  'vendorPurchases',
  'vendorPayments',
  'ledgerEntries',
  'hrmsEmployees',
  'gpsLogs',
  'inventory',
  'approvals'
];

/**
 * Queries relevant ERP collections from Firestore in parallel with safe fault isolation.
 */
export const fetchERPCollectionsFromFirestore = async (db) => {
  if (!db) return null;

  const entries = await Promise.all(
    COLLECTION_NAMES.map(async (name) => {
      try {
        const snap = await db.collection(name).get();
        const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return [name, docs];
      } catch (err) {
        console.warn(`[MIS Server] Failed querying Firestore collection "${name}":`, err.message);
        return [name, []];
      }
    })
  );

  return Object.fromEntries(entries);
};

const toAmount = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const inIsoRange = (rawDate, start, end) => {
  if (!start && !end) return true;
  if (!rawDate) return false;
  const iso = String(rawDate).slice(0, 10);
  if (!ISO_DATE_RE.test(iso)) return false;
  if (start && iso < start) return false;
  if (end && iso > end) return false;
  return true;
};

/**
 * Computes compact authoritative summary metrics from Firestore collections for server audit & verification.
 */
export const buildServerMISAuditSummary = ({ data = {}, filters, tallyStatus }) => {
  const projects = data.projects || [];
  const incomeRecords = (data.incomeRecords || []).filter((r) => r && r.status !== 'Cancelled');
  const expenseRecords = (data.expenseRecords || []).filter((r) => r && r.status !== 'Cancelled');
  const siteExpenses = (data.expenses || []).filter((r) => r && r.status !== 'Rejected');
  const paymentTracking = data.paymentTracking || [];
  const vendorPayments = data.vendorPayments || [];
  const approvals = data.approvals || [];

  const { startDate, endDate, projectId } = filters;

  const selectedProject =
    projectId && projectId !== 'ALL' ? projects.find((p) => p.id === projectId) : null;
  const projNameKey = selectedProject
    ? String(selectedProject.name || selectedProject.projectName || '').trim().toLowerCase()
    : '';

  const matchesProject = (rec) => {
    if (!projectId || projectId === 'ALL') return true;
    if (rec.projectId && rec.projectId === projectId) return true;
    return projNameKey && String(rec.projectName || '').trim().toLowerCase() === projNameKey;
  };

  const periodIncomes = incomeRecords.filter(
    (r) => matchesProject(r) && inIsoRange(r.date || r.createdAt, startDate, endDate)
  );
  const periodExpenses = expenseRecords.filter(
    (r) => matchesProject(r) && inIsoRange(r.date || r.createdAt, startDate, endDate)
  );
  const periodSiteExpenses = siteExpenses.filter(
    (r) => matchesProject(r) && inIsoRange(r.date || r.createdAt, startDate, endDate)
  );

  const isAdvanceCategory = (cat) => String(cat || '').toLowerCase().includes('advance');

  const earnedRevenue = periodIncomes
    .filter((r) => !isAdvanceCategory(r.category))
    .reduce((s, r) => s + toAmount(r.amount || r.receivedAmount), 0);

  const customerAdvances = periodIncomes
    .filter((r) => isAdvanceCategory(r.category))
    .reduce((s, r) => s + toAmount(r.amount || r.receivedAmount), 0);

  const totalExpenses =
    periodExpenses.reduce((s, r) => s + toAmount(r.amount), 0) +
    periodSiteExpenses.reduce((s, r) => s + toAmount(r.amount), 0);

  return {
    verifiedAt: new Date().toISOString(),
    projectCount: projectId && projectId !== 'ALL' ? (selectedProject ? 1 : 0) : projects.length,
    earnedRevenue,
    customerAdvances,
    totalExpenses,
    netProfit: earnedRevenue - totalExpenses,
    outstandingReceivables:
      paymentTracking.filter(matchesProject).reduce((s, p) => s + Math.max(0, toAmount(p.remainingAmount)), 0) +
      incomeRecords.reduce((s, i) => s + Math.max(0, toAmount(i.pendingAmount)), 0),
    outstandingPayables:
      vendorPayments.filter(matchesProject).reduce((s, v) => s + Math.max(0, toAmount(v.remainingAmount)), 0) +
      expenseRecords.reduce((s, e) => s + Math.max(0, toAmount(e.pendingAmount)), 0),
    pendingApprovals: approvals.filter((a) => ['Submitted', 'Draft', 'Pending'].includes(a.status)).length,
    tallyOnline: Boolean(tallyStatus?.online)
  };
};
