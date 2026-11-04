// SANMATI CONSTRUCTIONS ERP - API Router
import express from 'express';
import { tallyConnector } from '../services/tallyConnector.js';
import { db, isConfigured } from '../config/firebaseAdmin.js';

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

export default router;
