/**
 * Component: Employee Card (Evaluator Wireframe Specification)
 * Visual states:
 * 🟢 Green: Employee present
 * 🔵 Blue: Employee on leave (Overrides absent)
 * 🟡 Yellow: Employee absent
 * Clickable card opens view-only information drawer.
 */
const EmployeeCardComponent = {
  render(emp) {
    let statusClass = 'card-absent';
    let statusPillClass = 'status-absent';
    let dotClass = 'dot-absent';
    let statusText = 'Absent';
    let statusIcon = '<span class="status-dot-absent"></span>';

    if (emp.status === 'PRESENT') {
      statusClass = 'card-present';
      statusPillClass = 'status-present';
      dotClass = 'dot-present';
      statusText = 'Present';
      statusIcon = '<span class="status-dot-present"></span>';
    } else if (emp.status === 'LEAVE') {
      statusClass = 'card-leave';
      statusPillClass = 'status-leave';
      dotClass = 'dot-leave';
      statusText = 'On Leave';
      statusIcon = '<span class="status-dot-leave"></span>';
    }

    const checkInNote = emp.check_in_time 
      ? `In: ${new Date(emp.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : (emp.status === 'LEAVE' ? 'Approved Time-Off' : 'No Check-in');

    return `
      <div class="employee-card ${statusClass}" onclick="App.openEmployeeDrawer('${emp.id}')">
        <div class="card-top">
          <div class="card-avatar-wrapper">
            <img src="${emp.avatar_url}" alt="${emp.name}" class="card-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.login_id}'">
            <span class="card-status-dot ${dotClass}" title="${statusText}"></span>
          </div>
          <span class="status-pill ${statusPillClass}">
            ${statusIcon}
            ${statusText}
          </span>
        </div>

        <div class="card-body">
          <h3 class="card-emp-name">${emp.name}</h3>
          <span class="card-emp-role">${emp.job_title}</span>
          <span class="card-emp-dept"><i class="fa-regular fa-building" style="margin-right:4px;"></i>${emp.department}</span>
        </div>

        <div class="card-footer">
          <span class="card-login-id">${emp.login_id}</span>
          <span class="card-note"><i class="fa-regular fa-clock" style="margin-right:3px;"></i>${checkInNote}</span>
        </div>
      </div>
    `;
  }
};
