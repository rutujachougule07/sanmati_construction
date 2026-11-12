// SANMATI CONSTRUCTIONS ERP - API Router
import express from 'express';
import { tallyConnector } from '../services/tallyConnector.js';
import { db, isConfigured } from '../config/firebaseAdmin.js';
import {
  validateMISFilters,
  isRoleAuthorizedForSection,
  fetchERPCollectionsFromFirestore,
  buildServerMISAuditSummary
} from '../services/misAnalyticsService.js';

const router = express.Router();

// System Health & Cloud Database Status
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'SANMATI CONSTRUCTIONS ERP Backend',
    location: 'Kolhapur, Maharashtra, India',
    firebaseCloudConnected: isConfigured,
    timestamp: new Date().toISOString()
  });
});

// Tally Connectivity Status & Ping
router.get('/tally/status', async (req, res) => {
  const status = await tallyConnector.pingTally();
  res.json(status);
});

// Tally Voucher Sync Endpoint
router.post('/tally/sync-voucher', async (req, res) => {
  const { xmlData, voucherNo } = req.body;
  if (!xmlData) {
    return res.status(400).json({ success: false, error: 'Missing xmlData payload' });
  }

  const result = await tallyConnector.postXML(xmlData);
  res.json({
    voucherNo,
    timestamp: new Date().toISOString(),
    ...result
  });
});

// Projects Summary API
router.get('/projects', async (req, res) => {
  if (isConfigured && db) {
    try {
      const snap = await db.collection('projects').get();
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, data: list });
    } catch (e) {
      console.warn("Firestore fetch error:", e.message);
    }
  }
  // Return operational projects
  res.json({
    success: true,
    data: []
  });
});

// GPS Logs Endpoint
router.post('/gps/log', async (req, res) => {
  const logData = req.body;
  console.info(`[GPS Logger] Check-In recorded for ${logData.userName} at project ${logData.projectId}`);

  if (isConfigured && db) {
    try {
      const ref = await db.collection('gpsLogs').add({
        ...logData,
        receivedAt: new Date().toISOString()
      });
      return res.json({ success: true, logId: ref.id });
    } catch (e) {
      console.warn("Firestore GPS log error:", e.message);
    }
  }

  res.json({
    success: true,
    logId: `GPS-${Date.now()}`,
    status: 'Logged'
  });
});

// Helper: Probe Tally gateway safely without assuming fixed method names
const probeTallyStatus = async () => {
  try {
    if (typeof tallyConnector?.checkStatus === 'function') {
      return await tallyConnector.checkStatus();
    }
    if (typeof tallyConnector?.testConnection === 'function') {
      return await tallyConnector.testConnection();
    }
    if (typeof tallyConnector?.ping === 'function') {
      return await tallyConnector.ping();
    }
  } catch (err) {
    return { online: false, message: err.message };
  }
  return { online: false, message: 'Tally gateway probe unavailable' };
};

// MIS Reports: Filter Validation Endpoint
router.post('/mis/validate', (req, res) => {
  const { section = 'daily-monthly', filters = {} } = req.body || {};
  const validation = validateMISFilters(filters, section);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_MIS_FILTERS',
      errors: validation.errors
    });
  }
  return res.json({
    success: true,
    validatedFilters: validation.sanitized
  });
});

// MIS Reports: Section Audit, RBAC Enforcement & Aggregation
const handleMISReportRequest = async (req, res) => {
  const { section } = req.params;
  const rawFilters = req.method === 'GET' ? req.query : (req.body?.filters || req.body || {});
  const userRole = String(
    req.headers['x-user-role'] || req.body?.userRole || req.query?.userRole || ''
  ).trim();

  const validation = validateMISFilters(rawFilters, section);
  if (validation.errors.some((msg) => msg.startsWith('Unsupported MIS report section'))) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_MIS_SECTION',
      errors: validation.errors
    });
  }

  if (!isRoleAuthorizedForSection(section, userRole)) {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_MIS_SECTION',
      error: `Access denied for role "${userRole || 'Unauthenticated'}" on MIS section "${section}".`
    });
  }

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_MIS_FILTERS',
      errors: validation.errors
    });
  }

  const tallyStatus = await probeTallyStatus();

  if (isConfigured && db) {
    try {
      const firestoreData = await fetchERPCollectionsFromFirestore(db);
      const serverAudit = buildServerMISAuditSummary({
        data: firestoreData || {},
        filters: validation.sanitized,
        tallyStatus
      });
      return res.json({
        success: true,
        source: 'firestore',
        firestoreConfigured: true,
        authorized: true,
        role: userRole || 'Authorized',
        validatedFilters: validation.sanitized,
        serverAudit,
        tallyStatus
      });
    } catch (err) {
      console.error('[MIS API] Firestore audit error:', err);
      return res.status(500).json({
        success: false,
        code: 'MIS_FIRESTORE_ERROR',
        error: 'Failed to aggregate server MIS audit data.'
      });
    }
  }

  return res.json({
    success: true,
    source: 'client-erp-sync',
    firestoreConfigured: false,
    authorized: true,
    role: userRole || 'Authorized',
    validatedFilters: validation.sanitized,
    serverAudit: null,
    tallyStatus
  });
};

router.get('/mis/reports/:section', handleMISReportRequest);
router.post('/mis/reports/:section', handleMISReportRequest);

export default router;
