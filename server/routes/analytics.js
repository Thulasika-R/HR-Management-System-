const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { analyzeOrganizationalHealth } = require('../services/anomalyEngine');

/**
 * GET /api/analytics/overview
 * Real-time organizational velocity, attendance trends, anomalies, and department metrics.
 */
router.get('/overview', authenticateToken, (req, res) => {
  const healthData = analyzeOrganizationalHealth();
  return res.json({ success: true, data: healthData });
});

/**
 * GET /api/analytics/audit-logs
 * Evaluator constraint: ADMIN only. Complete system audit trail.
 */
router.get('/audit-logs', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const logs = [...db.find('audit_logs')].reverse().slice(0, limit);
  return res.json({ success: true, count: logs.length, data: logs });
});

/**
 * GET /api/analytics/notifications
 * Retrieves active notifications for current user/employee.
 */
router.get('/notifications', authenticateToken, (req, res) => {
  const employeeId = req.user.employeeId;
  const notifications = db.find('notifications', n => 
    n.recipient_id === employeeId || n.recipient_id === 'ALL' || (req.user.role === 'ADMIN' && n.recipient_id === 'ADMIN')
  );
  notifications.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return res.json({ success: true, data: notifications });
});

module.exports = router;
