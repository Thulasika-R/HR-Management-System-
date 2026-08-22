const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models/db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication session.' });
    }

    const user = db.findOne('users', u => u.id === decoded.userId);
    if (!user || !user.is_active) {
      return res.status(403).json({ success: false, message: 'User account is inactive or not found.' });
    }

    req.user = {
      userId: user.id,
      loginId: user.login_id,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
      forcePasswordChange: user.force_password_change
    };

    next();
  });
}

module.exports = {
  authenticateToken
};
