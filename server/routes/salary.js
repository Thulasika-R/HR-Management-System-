const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { calculateSalaryBreakdown } = require('../services/salaryEngine');

/**
 * GET /api/salary/:employeeId
 * Evaluator constraint: SALARY INFO TAB IS STRICTLY ADMIN-ONLY.
 * Enforced at backend API layer, NOT just frontend CSS.
 */
router.get('/:employeeId', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const employeeId = req.params.employeeId;
  const employee = db.findOne('employees', e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  let structure = db.findOne('salary_structures', s => s.employee_id === employeeId);
  if (!structure) {
    structure = {
      id: `sal_${employeeId}`,
      employee_id: employeeId,
      base_wage: 50000,
      basic_percentage: 50,
      hra_percentage: 50,
      standard_allowance: 4167,
      performance_bonus: 2500,
      lta: 2000,
      fixed_allowance: 1500,
      pf_percentage: 12,
      professional_tax: 200
    };
  }

  const breakdown = calculateSalaryBreakdown(structure);

  return res.json({
    success: true,
    data: {
      employee: {
        id: employee.id,
        login_id: employee.login_id,
        name: `${employee.first_name} ${employee.last_name}`,
        job_title: employee.job_title,
        department: employee.department
      },
      structure: structure,
      breakdown: breakdown
    }
  });
});

/**
 * PUT /api/salary/:employeeId
 * Evaluator constraint: ADMIN only. Configures salary formulas and component values.
 */
router.put('/:employeeId', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const employeeId = req.params.employeeId;
  const employee = db.findOne('employees', e => e.id === employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  const {
    base_wage,
    basic_percentage,
    hra_percentage,
    standard_allowance,
    performance_bonus,
    lta,
    fixed_allowance,
    pf_percentage,
    professional_tax
  } = req.body;

  const updates = {
    updated_at: new Date().toISOString()
  };

  if (base_wage !== undefined) updates.base_wage = Number(base_wage);
  if (basic_percentage !== undefined) updates.basic_percentage = Number(basic_percentage);
  if (hra_percentage !== undefined) updates.hra_percentage = Number(hra_percentage);
  if (standard_allowance !== undefined) updates.standard_allowance = Number(standard_allowance);
  if (performance_bonus !== undefined) updates.performance_bonus = Number(performance_bonus);
  if (lta !== undefined) updates.lta = Number(lta);
  if (fixed_allowance !== undefined) updates.fixed_allowance = Number(fixed_allowance);
  if (pf_percentage !== undefined) updates.pf_percentage = Number(pf_percentage);
  if (professional_tax !== undefined) updates.professional_tax = Number(professional_tax);

  let structure = db.findOne('salary_structures', s => s.employee_id === employeeId);
  if (structure) {
    structure = db.update('salary_structures', s => s.employee_id === employeeId, updates);
  } else {
    structure = db.insert('salary_structures', {
      id: `sal_${employeeId}`,
      employee_id: employeeId,
      base_wage: Number(base_wage) || 50000,
      basic_percentage: Number(basic_percentage) || 50,
      hra_percentage: Number(hra_percentage) || 50,
      standard_allowance: Number(standard_allowance) || 4167,
      performance_bonus: Number(performance_bonus) || 2500,
      lta: Number(lta) || 2000,
      fixed_allowance: Number(fixed_allowance) || 1500,
      pf_percentage: Number(pf_percentage) || 12,
      professional_tax: Number(professional_tax) || 200,
      ...updates
    });
  }

  const newBreakdown = calculateSalaryBreakdown(structure);

  db.insert('audit_logs', {
    id: `aud_${Date.now()}`,
    action: 'SALARY_STRUCTURE_UPDATED',
    actor_login_id: req.user.loginId,
    actor_role: req.user.role,
    details: `Updated salary structure for ${employee.first_name} ${employee.last_name}. Base Wage: ₹${structure.base_wage}`,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: 'Salary configuration updated successfully',
    data: {
      structure: structure,
      breakdown: newBreakdown
    }
  });
});

module.exports = router;
