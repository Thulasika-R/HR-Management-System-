const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'dayflow-secret-token-key-2026-odoo-hackathon',
  JWT_EXPIRY: '24h',
  COMPANY_CODE: 'OI', // Company Code for Login ID Generation (e.g., OITODO20220001)
  REQUIRED_DAILY_HOURS: 8,
  DATA_DIR: path.join(__dirname, '../data'),
  UPLOADS_DIR: path.join(__dirname, '../public/uploads')
};
