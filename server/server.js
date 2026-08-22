const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./models/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend and uploads
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(config.UPLOADS_DIR));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/timeoff', require('./routes/timeoff'));
app.use('/api/salary', require('./routes/salary'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    service: 'Dayflow HRMS Engine',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Dayflow HRMS Platform Running Live on Port: ${config.PORT}`);
  console.log(`🌐 Web UI: http://localhost:${config.PORT}`);
  console.log(`🔑 Admin Login: ID: admin | Password: admin123`);
  console.log(`🔑 Sample Employee: ID: OITODO20230001 | Password: welcome123`);
  console.log(`====================================================`);
});
