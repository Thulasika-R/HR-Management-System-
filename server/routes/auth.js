const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

// Password Complexity Validator (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
function validatePasswordComplexity(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one numerical digit (0-9).' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...).' };
  }
  return { valid: true };
}

/**
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  const { login_id, password, required_role } = req.body;

  if (!login_id || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both Login ID and Password.' });
  }

  // Find user by login_id (case-insensitive) or email
  const user = db.findOne('users', u => 
    u.login_id.toLowerCase() === login_id.trim().toLowerCase() ||
    (u.email && u.email.toLowerCase() === login_id.trim().toLowerCase())
  );

  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
  }

  // Optional role check if user logged in via specific role portal
  if (required_role && user.role !== required_role) {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied: This account is registered as [${user.role}]. Please use the ${user.role === 'ADMIN' ? 'Admin Portal' : 'Employee Portal'}.` 
    });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // Generate JWT Token
  const token = jwt.sign(
    { userId: user.id, role: user.role, loginId: user.login_id },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );

  // Fetch employee record if linked
  let employee = null;
  if (user.employee_id) {
    employee = db.findOne('employees', e => e.id === user.employee_id);
  }

  // Audit log
  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: 'USER_LOGIN',
    actor_login_id: user.login_id,
    actor_role: user.role,
    details: `Successful login to ${user.role} Portal`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      login_id: user.login_id,
      email: user.email,
      role: user.role,
      force_password_change: user.force_password_change,
      employee_id: user.employee_id
    },
    employee: employee
  });
});

/**
 * POST /api/auth/change-password
 * Strict Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special symbol
 */
router.post('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  // Validation rules
  const validation = validatePasswordComplexity(new_password);
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  const user = db.findOne('users', u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  // If not in forced change mode, verify current password
  if (!user.force_password_change && current_password) {
    const isValid = bcrypt.compareSync(current_password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(new_password, salt);

  db.update('users', u => u.id === user.id, {
    password_hash: newHash,
    force_password_change: false,
    updated_at: new Date().toISOString()
  });

  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: 'PASSWORD_CHANGE',
    actor_login_id: user.login_id,
    actor_role: user.role,
    details: 'User updated password with verified complexity policy.',
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: 'Password changed successfully! Please log in again with your new password.',
    require_reauth: true
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let employee = null;
  if (user.employee_id) {
    employee = db.findOne('employees', e => e.id === user.employee_id);
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      login_id: user.login_id,
      email: user.email,
      role: user.role,
      force_password_change: user.force_password_change,
      employee_id: user.employee_id
    },
    employee: employee
  });
});

module.exports = router;
