const db = require('../models/db');
const { calculateSalaryBreakdown } = require('./salaryEngine');

/**
 * Computes payable working days and executes monthly payroll integration for an employee.
 * Integrates: Attendance + Approved Leaves -> Payable Days -> Pro-rated Payroll
 */
function calculatePayableDaysAndPayroll(employeeId, monthStr) {
  // monthStr is format "YYYY-MM", default to current month
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const [year, month] = targetMonth.split('-').map(Number);
  
  // Total days in target month
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  
  // Calculate standard working days (assuming 26 working days standard, or weekdays)
  // Let's compute actual weekdays (Mon-Sat, excluding Sundays = approx 26 days)
  let workingDaysCount = 0;
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getDay() !== 0) { // Exclude Sundays
      workingDaysCount++;
    }
  }
  const standardWorkingDays = Math.max(workingDaysCount, 26);

  // Retrieve attendance records for this employee in the target month
  const attendanceRecords = db.find('attendance', rec => 
    rec.employee_id === employeeId && 
    rec.date.startsWith(targetMonth)
  );

  let presentDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let halfDays = 0;

  attendanceRecords.forEach(rec => {
    if (rec.status === 'PRESENT') {
      presentDays += 1;
    } else if (rec.status === 'HALF_DAY') {
      halfDays += 1;
      presentDays += 0.5;
    } else if (rec.status === 'LEAVE') {
      // Find if paid or unpaid from leave requests
      paidLeaveDays += 1; // Default approved leave is paid unless marked unpaid
    }
  });

  // Check approved unpaid leave requests for the month
  const unpaidLeaves = db.find('leave_requests', req => 
    req.employee_id === employeeId && 
    req.status === 'APPROVED' && 
    req.leave_type === 'UNPAID' &&
    (req.start_date.startsWith(targetMonth) || req.end_date.startsWith(targetMonth))
  );
  unpaidLeaves.forEach(req => {
    unpaidLeaveDays += req.days_count;
  });

  // Calculate absent days (unexcused missing punches)
  const totalAccountedDays = presentDays + paidLeaveDays + unpaidLeaveDays;
  const absentDays = Math.max(0, standardWorkingDays - totalAccountedDays);

  // Formula from evaluator:
  // PayableDays = PresentDays + PaidLeaveDays
  const payableDays = Math.min(standardWorkingDays, presentDays + paidLeaveDays);
  const payableRatio = standardWorkingDays > 0 ? (payableDays / standardWorkingDays) : 1;

  // Fetch salary structure
  const structure = db.findOne('salary_structures', s => s.employee_id === employeeId);
  const fullBreakdown = calculateSalaryBreakdown(structure);

  if (!fullBreakdown) {
    return {
      month: targetMonth,
      employee_id: employeeId,
      total_working_days: standardWorkingDays,
      present_days: presentDays,
      paid_leave_days: paidLeaveDays,
      unpaid_leave_days: unpaidLeaveDays,
      absent_days: absentDays,
      payable_days: payableDays,
      payable_ratio: Number(payableRatio.toFixed(4)),
      base_wage: 0,
      gross_salary: 0,
      total_deductions: 0,
      net_salary: 0,
      breakdown: null
    };
  }

  // Calculate pro-rated components
  const proratedBasic = Math.round(fullBreakdown.earnings.basic_salary * payableRatio);
  const proratedHra = Math.round(fullBreakdown.earnings.hra * payableRatio);
  const proratedStandard = Math.round(fullBreakdown.earnings.standard_allowance * payableRatio);
  const proratedBonus = fullBreakdown.earnings.performance_bonus; // Performance fixed
  const proratedLta = Math.round(fullBreakdown.earnings.lta * payableRatio);
  const proratedFixed = Math.round(fullBreakdown.earnings.fixed_allowance * payableRatio);

  const proratedGross = Math.round(proratedBasic + proratedHra + proratedStandard + proratedBonus + proratedLta + proratedFixed);
  const proratedPf = Math.round(proratedBasic * (fullBreakdown.deductions.pf_percentage / 100));
  const proratedPt = fullBreakdown.deductions.professional_tax;
  const proratedDeductions = Math.round(proratedPf + proratedPt);
  const proratedNet = Math.round(proratedGross - proratedDeductions);

  return {
    month: targetMonth,
    employee_id: employeeId,
    total_working_days: standardWorkingDays,
    present_days: presentDays,
    paid_leave_days: paidLeaveDays,
    unpaid_leave_days: unpaidLeaveDays,
    absent_days: absentDays,
    payable_days: payableDays,
    payable_ratio: Number(payableRatio.toFixed(4)),
    base_wage: fullBreakdown.base_wage,
    gross_salary: proratedGross,
    total_deductions: proratedDeductions,
    net_salary: proratedNet,
    breakdown: {
      standard_gross: fullBreakdown.earnings.gross_salary,
      standard_net: fullBreakdown.net_salary,
      earnings: {
        basic_salary: proratedBasic,
        hra: proratedHra,
        standard_allowance: proratedStandard,
        performance_bonus: proratedBonus,
        lta: proratedLta,
        fixed_allowance: proratedFixed,
        gross_salary: proratedGross
      },
      deductions: {
        provident_fund: proratedPf,
        professional_tax: proratedPt,
        total_deductions: proratedDeductions
      },
      net_salary: proratedNet
    }
  };
}

module.exports = {
  calculatePayableDaysAndPayroll
};
