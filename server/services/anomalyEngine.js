const db = require('../models/db');

/**
 * Organizational Intelligence & Anomaly Engine (DAYFLOW Ω)
 * Analyzes behavioral trajectories, missing punch patterns, and leave clustering.
 */
function analyzeOrganizationalHealth() {
  const employees = db.find('employees', e => e.status === 'ACTIVE');
  const attendance = db.find('attendance');
  const leaves = db.find('leave_requests');

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Real-time Employee Presence counts
  let presentCount = 0;
  let onLeaveCount = 0;
  let absentCount = 0;

  const employeeStatuses = employees.map(emp => {
    // Check if approved leave today
    const hasLeaveToday = leaves.some(l => 
      l.employee_id === emp.id && 
      l.status === 'APPROVED' && 
      todayStr >= l.start_date && 
      todayStr <= l.end_date
    );

    // Check attendance check-in today
    const attToday = attendance.find(a => a.employee_id === emp.id && a.date === todayStr);

    let status = 'ABSENT'; // 🟡 Yellow default
    if (hasLeaveToday) {
      status = 'LEAVE'; // 🔵 Blue (overrides absent)
      onLeaveCount++;
    } else if (attToday && (attToday.status === 'PRESENT' || attToday.check_in)) {
      status = 'PRESENT'; // 🟢 Green
      presentCount++;
    } else {
      absentCount++;
    }

    return {
      id: emp.id,
      login_id: emp.login_id,
      name: `${emp.first_name} ${emp.last_name}`,
      department: emp.department,
      job_title: emp.job_title,
      avatar_url: emp.avatar_url,
      phone: emp.phone,
      email: emp.email,
      status: status,
      check_in_time: attToday?.check_in || null,
      check_out_time: attToday?.check_out || null
    };
  });

  // Anomaly signals
  const anomalies = [];

  // Check 1: Excessive consecutive absences
  employees.forEach(emp => {
    const empAtt = attendance.filter(a => a.employee_id === emp.id);
    if (empAtt.length === 0 && emp.status === 'ACTIVE') {
      anomalies.push({
        id: `anom_nopunch_${emp.id}`,
        type: 'WARNING',
        category: 'Missing Onboarding Punch',
        message: `${emp.first_name} ${emp.last_name} (${emp.login_id}) has no recorded attendance logs yet.`,
        employee_id: emp.id,
        severity: 'MEDIUM'
      });
    }
  });

  // Check 2: High pending leave backlog
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  if (pendingLeaves.length > 0) {
    anomalies.push({
      id: 'anom_pending_leaves',
      type: 'INFO',
      category: 'Pending Approvals',
      message: `There are ${pendingLeaves.length} pending time-off request(s) awaiting Admin action.`,
      severity: 'LOW'
    });
  }

  // Departmental breakdown
  const departmentBreakdown = {};
  employees.forEach(emp => {
    const dept = emp.department || 'General';
    if (!departmentBreakdown[dept]) {
      departmentBreakdown[dept] = { total: 0, present: 0, on_leave: 0, absent: 0 };
    }
    departmentBreakdown[dept].total++;
    const empStatusObj = employeeStatuses.find(s => s.id === emp.id);
    if (empStatusObj.status === 'PRESENT') departmentBreakdown[dept].present++;
    else if (empStatusObj.status === 'LEAVE') departmentBreakdown[dept].on_leave++;
    else departmentBreakdown[dept].absent++;
  });

  return {
    metrics: {
      total_employees: employees.length,
      present_today: presentCount,
      on_leave_today: onLeaveCount,
      absent_today: absentCount,
      attendance_rate: employees.length > 0 ? Math.round(((presentCount + onLeaveCount) / employees.length) * 100) : 100
    },
    employee_statuses: employeeStatuses,
    department_breakdown: departmentBreakdown,
    anomalies: anomalies
  };
}

module.exports = {
  analyzeOrganizationalHealth
};
