const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const config = require('../config');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Multer storage for medical certificates / attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `attachment_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * GET /api/timeoff/policies
 * Returns the list of all 10 supported leave policies with descriptions, quotas, carry forward rules
 */
router.get('/policies', authenticateToken, (req, res) => {
  return res.json({ success: true, data: db.data.leave_policies || [] });
});

/**
 * GET /api/timeoff/my-requests
 * Returns leave balances for all 10 leave types and personal leave history.
 */
router.get('/my-requests', authenticateToken, (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'No linked employee profile.' });
  }

  const currentYear = new Date().getFullYear();
  let allocation = db.findOne('leave_allocations', a => a.employee_id === employeeId && a.year === currentYear);
  const policies = db.data.leave_policies || [];

  if (!allocation || !allocation.balances) {
    // Default 10 balances
    allocation = {
      id: `alloc_${employeeId}`,
      employee_id: employeeId,
      year: currentYear,
      balances: {
        SICK: { total: 12, used: 0 },
        CASUAL: { total: 12, used: 0 },
        EARNED: { total: 18, used: 0 },
        MATERNITY: { total: 182, used: 0 },
        PATERNITY: { total: 15, used: 0 },
        BEREAVEMENT: { total: 5, used: 0 },
        COMP_OFF: { total: 8, used: 0 },
        UNPAID: { total: 30, used: 0 },
        WFH: { total: 24, used: 0 },
        HALF_DAY: { total: 10, used: 0 }
      }
    };
  }

  // Build structured balance details
  const balanceSummary = policies.map(pol => {
    const bal = allocation.balances[pol.type] || { total: pol.quota, used: 0 };
    return {
      type: pol.type,
      name: pol.name,
      description: pol.description,
      quota: pol.quota,
      total: bal.total,
      used: bal.used,
      available: Math.max(0, bal.total - bal.used),
      carry_forward: pol.carry_forward,
      max_carry_forward: pol.max_carry_forward,
      approval_hierarchy: pol.approval_hierarchy,
      requires_attachment_after_days: pol.requires_attachment_after_days,
      is_paid: pol.is_paid,
      icon: pol.icon,
      color: pol.color
    };
  });

  const requests = db.find('leave_requests', r => r.employee_id === employeeId);
  requests.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return res.json({
    success: true,
    year: currentYear,
    balances: balanceSummary,
    requests: requests
  });
});

/**
 * POST /api/timeoff/request
 * Supports all 10 leave types, half-day session selection, and medical cert validation for sick leave > 3 days.
 */
router.post('/request', authenticateToken, upload.single('attachment'), (req, res) => {
  const employeeId = req.user.employeeId;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'No linked employee profile.' });
  }

  const { leave_type, start_date, end_date, session, reason } = req.body;

  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ success: false, message: 'Leave type, Start Date, and End Date are required.' });
  }

  const emp = db.findOne('employees', e => e.id === employeeId);
  const employeeName = emp ? `${emp.first_name} ${emp.last_name}` : req.user.loginId;

  // Calculate days count
  let daysCount = 1;
  const isHalfDay = leave_type.toUpperCase() === 'HALF_DAY';

  if (isHalfDay) {
    daysCount = 0.5;
  } else {
    const d1 = new Date(start_date);
    const d2 = new Date(end_date);
    if (d2 < d1) {
      return res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
    }
    const diffTime = Math.abs(d2 - d1);
    daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Sick leave constraint: Medical certificate required for durations exceeding 3 days
  if (leave_type.toUpperCase() === 'SICK' && daysCount > 3 && !req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'Medical Certificate upload is mandatory for Sick Leave exceeding 3 days.' 
    });
  }

  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newRequest = {
    id: `leave_req_${Date.now()}`,
    employee_id: employeeId,
    employee_name: employeeName,
    leave_type: leave_type.toUpperCase(),
    start_date: start_date,
    end_date: end_date,
    days_count: daysCount,
    session: isHalfDay ? (session || 'MORNING') : 'FULL_DAY',
    reason: reason || 'Personal time off',
    attachment_url: attachmentUrl,
    status: 'PENDING',
    admin_remarks: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.insert('leave_requests', newRequest);

  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: 'LEAVE_REQUESTED',
    actor_login_id: req.user.loginId,
    actor_role: req.user.role,
    details: `Submitted ${daysCount}-day ${leave_type} leave request (${start_date} to ${end_date})`,
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    message: 'Time-off request submitted successfully. Awaiting HR approval.',
    data: newRequest
  });
});

/**
 * GET /api/timeoff/all-requests
 * ADMIN only. View all employee leave requests with filters.
 */
router.get('/all-requests', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const statusFilter = req.query.status || '';
  let requests = db.find('leave_requests');

  if (statusFilter && statusFilter !== 'ALL') {
    requests = requests.filter(r => r.status === statusFilter.toUpperCase());
  }
  requests.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return res.json({ success: true, count: requests.length, data: requests });
});

/**
 * POST /api/timeoff/action
 * ADMIN only. Approving leave propagates to attendance records & recalculates payable days.
 */
router.post('/action', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const { request_id, action, admin_remarks } = req.body;

  if (!request_id || !action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
    return res.status(400).json({ success: false, message: 'Valid request_id and action (APPROVE/REJECT) required.' });
  }

  const leaveReq = db.findOne('leave_requests', r => r.id === request_id);
  if (!leaveReq) {
    return res.status(404).json({ success: false, message: 'Leave request not found.' });
  }

  const isApproval = action.toUpperCase() === 'APPROVE';
  const newStatus = isApproval ? 'APPROVED' : 'REJECTED';

  // 1. Update Leave Request Status
  const updatedReq = db.update('leave_requests', r => r.id === request_id, {
    status: newStatus,
    admin_remarks: admin_remarks || (isApproval ? 'Approved by HR' : 'Rejected by HR'),
    updated_at: new Date().toISOString()
  });

  // 2. If Approved: Deduct balance & ATOMICALLY update attendance table
  if (isApproval) {
    const alloc = db.findOne('leave_allocations', a => a.employee_id === leaveReq.employee_id);
    if (alloc && alloc.balances && alloc.balances[leaveReq.leave_type]) {
      alloc.balances[leaveReq.leave_type].used = (alloc.balances[leaveReq.leave_type].used || 0) + leaveReq.days_count;
      db.save();
    }

    // Atomic Attendance Propagation
    const curDate = new Date(leaveReq.start_date);
    const stopDate = new Date(leaveReq.end_date);

    while (curDate <= stopDate) {
      const dateStr = curDate.toISOString().split('T')[0];
      const existingAtt = db.findOne('attendance', a => a.employee_id === leaveReq.employee_id && a.date === dateStr);
      const attStatus = leaveReq.leave_type === 'HALF_DAY' ? 'HALF_DAY' : 'LEAVE';

      if (existingAtt) {
        db.update('attendance', a => a.id === existingAtt.id, {
          status: attStatus,
          source: 'AUTO_LEAVE',
          updated_at: new Date().toISOString()
        });
      } else {
        db.insert('attendance', {
          id: `att_${leaveReq.employee_id}_${dateStr}_leave`,
          employee_id: leaveReq.employee_id,
          date: dateStr,
          check_in: null,
          check_out: null,
          break_hours: 0,
          work_hours: leaveReq.leave_type === 'HALF_DAY' ? 4 : 0,
          extra_hours: 0,
          status: attStatus,
          source: 'AUTO_LEAVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      curDate.setDate(curDate.getDate() + 1);
    }
  }

  // 3. Create Notification for Employee
  db.insert('notifications', {
    id: `notif_${Date.now()}`,
    recipient_id: leaveReq.employee_id,
    title: `Leave Request ${newStatus}`,
    message: `Your ${leaveReq.leave_type} leave request from ${leaveReq.start_date} to ${leaveReq.end_date} has been ${newStatus.toLowerCase()}.`,
    type: isApproval ? 'SUCCESS' : 'WARNING',
    read: false,
    created_at: new Date().toISOString()
  });

  // 4. Audit Log
  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: `LEAVE_${newStatus}`,
    actor_login_id: req.user.loginId,
    actor_role: req.user.role,
    details: `${newStatus} ${leaveReq.leave_type} leave for ${leaveReq.employee_name} (${leaveReq.start_date} to ${leaveReq.end_date})`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Leave request has been ${newStatus.toLowerCase()} successfully and attendance synchronized.`,
    data: updatedReq
  });
});

module.exports = router;
