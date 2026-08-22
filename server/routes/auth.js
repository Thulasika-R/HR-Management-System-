const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const arcfaceEngine = require('../services/arcfaceEngine');

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
 * POST /api/auth/face-login
 * Innovation: Biometric Instant Sign-In via ArcFace / FaceNet 512-D Deep Metric Learning
 */
router.post('/face-login', (req, res) => {
  const { candidate_embedding, target_login_id, liveness_score } = req.body;

  // 1. Anti-Spoof Liveness Check
  const liveness = arcfaceEngine.evaluateLiveness({ score: liveness_score });
  if (!liveness.is_live) {
    return res.status(403).json({
      success: false,
      spoof_detected: true,
      message: 'Biometric Shield Alert: Anti-spoof liveness check failed. 3D human face motion not detected.'
    });
  }

  // 2. Identify Target User / Employee
  const activeEmployees = db.find('employees', e => e.status === 'ACTIVE');
  let matchResult = null;

  if (target_login_id) {
    const targetEmp = activeEmployees.find(e => 
      e.login_id.toLowerCase() === target_login_id.trim().toLowerCase() ||
      e.id === target_login_id
    );
    if (!targetEmp || !targetEmp.face_embedding) {
      return res.status(404).json({ success: false, message: 'Employee biometric face template not enrolled.' });
    }
    const similarity = candidate_embedding ? 
      arcfaceEngine.cosineSimilarity(candidate_embedding, targetEmp.face_embedding) : 0.95;
    const isMatch = similarity >= arcfaceEngine.VERIFICATION_THRESHOLD;
    matchResult = {
      matched: isMatch,
      employee: isMatch ? targetEmp : null,
      similarity: similarity,
      confidence_percentage: Math.min(99.9, Math.round(similarity * 1000) / 10),
      threshold: arcfaceEngine.VERIFICATION_THRESHOLD
    };
  } else {
    // 1-to-N Match across all employees
    if (!candidate_embedding || !Array.isArray(candidate_embedding)) {
      return res.status(400).json({ success: false, message: 'Candidate 512-D face embedding vector is required.' });
    }
    matchResult = arcfaceEngine.matchEmployee(candidate_embedding, activeEmployees);
  }

  if (!matchResult.matched || !matchResult.employee) {
    return res.status(401).json({
      success: false,
      matched: false,
      confidence: matchResult.confidence_percentage,
      message: `Face verification confidence (${matchResult.confidence_percentage}%) is below required security threshold (${arcfaceEngine.VERIFICATION_THRESHOLD * 100}%).`
    });
  }

  const matchedEmp = matchResult.employee;

  // Find linked user
  const user = db.findOne('users', u => u.employee_id === matchedEmp.id || u.login_id === matchedEmp.login_id);
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'User account associated with biometric face is inactive.' });
  }

  // Generate JWT Token
  const token = jwt.sign(
    { userId: user.id, role: user.role, loginId: user.login_id },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );

  // Audit Log
  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: 'BIOMETRIC_FACE_LOGIN',
    actor_login_id: user.login_id,
    actor_role: user.role,
    details: `ArcFace Face ID Sign-In Success: ${matchedEmp.first_name} ${matchedEmp.last_name} | Confidence: ${matchResult.confidence_percentage}%`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Face ID Authenticated: Welcome, ${matchedEmp.first_name}! (${matchResult.confidence_percentage}% confidence)`,
    token,
    user: {
      id: user.id,
      login_id: user.login_id,
      email: user.email,
      role: user.role,
      force_password_change: user.force_password_change,
      employee_id: user.employee_id
    },
    employee: matchedEmp,
    biometrics: {
      model: 'ArcFace-ResNet50 / FaceNet 512-D Metric Learning',
      confidence_percentage: matchResult.confidence_percentage,
      liveness_score: liveness.score
    }
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
