/**
 * Component: Time-Off Leave Request Modal & Admin Review Dialog
 * Supports all 10 Expanded Leave Types, Half-Day Morning/Afternoon sessions,
 * and Medical Certificate validation for Sick Leave exceeding 3 days.
 */
const LeaveModalComponent = {
  renderRequestModal(policies = []) {
    const todayStr = new Date().toISOString().split('T')[0];

    const defaultPolicies = [
      { type: 'SICK', name: 'Sick Leave', description: 'For recovery from medical illness or injury. Medical certificate required for > 3 days.' },
      { type: 'CASUAL', name: 'Casual Leave', description: 'For unforeseen personal matters or short breaks.' },
      { type: 'EARNED', name: 'Earned / Privilege Leave', description: 'Accrued annual vacation and rest.' },
      { type: 'MATERNITY', name: 'Maternity Leave', description: 'Statutory 26-week leave for biological mothers.' },
      { type: 'PATERNITY', name: 'Paternity Leave', description: 'Leave for fathers upon child birth or legal adoption.' },
      { type: 'BEREAVEMENT', name: 'Bereavement Leave', description: 'Compassionate leave granted upon loss of immediate family.' },
      { type: 'COMP_OFF', name: 'Compensatory Off', description: 'Credit earned for designated weekend / overtime shifts.' },
      { type: 'UNPAID', name: 'Unpaid Leave / LWP', description: 'Leave without pay after exhausting paid balances.' },
      { type: 'WFH', name: 'Work From Home / Remote', description: 'Permission to fulfill duties remotely.' },
      { type: 'HALF_DAY', name: 'Half-Day Leave', description: 'Morning (9am-1pm) or Afternoon (2pm-6pm) session.' }
    ];

    const pols = policies.length > 0 ? policies : defaultPolicies;

    return `
      <div class="modal-backdrop" id="leave-request-modal">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-regular fa-calendar-plus" style="color:var(--primary);"></i>
              <h3>Request Time Off (10 Supported Types)</h3>
            </div>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <form id="leave-request-form" onsubmit="App.handleLeaveSubmit(event)">
            <div class="modal-body" style="max-height:65vh;">
              <div class="form-group">
                <label class="form-label">Leave Type Selection *</label>
                <select class="form-select" name="leave_type" id="leave_type_select" required onchange="LeaveModalComponent.onTypeChange(this.value)">
                  ${pols.map(p => `<option value="${p.type}">${p.name} — ${p.is_paid !== false ? 'Paid' : 'Unpaid'}</option>`).join('')}
                </select>
              </div>

              <!-- Selected Policy Description Box -->
              <div id="policy-info-box" style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.25); padding:0.85rem; border-radius:var(--radius-md); margin-bottom:1rem; font-size:0.8rem; color:#c7d2fe;">
                <i class="fa-solid fa-circle-info" style="margin-right:6px;"></i>
                <span id="policy-desc-text">${pols[0]?.description || 'For medical illness or clinic visits.'}</span>
              </div>

              <!-- Half-Day Session Selector (Morning vs Afternoon) -->
              <div class="form-group" id="half-day-session-field" style="display:none; background:rgba(20,184,166,0.1); border:1px solid rgba(20,184,166,0.3); padding:0.85rem; border-radius:var(--radius-md);">
                <label class="form-label" style="color:#2dd4bf;"><i class="fa-regular fa-clock" style="margin-right:4px;"></i> Select Half-Day Session *</label>
                <div style="display:flex; gap:1.5rem; margin-top:4px;">
                  <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-size:0.85rem;">
                    <input type="radio" name="session" value="MORNING" checked> Morning Session (09:00 AM - 01:00 PM)
                  </label>
                  <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer; font-size:0.85rem;">
                    <input type="radio" name="session" value="AFTERNOON"> Afternoon Session (02:00 PM - 06:00 PM)
                  </label>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date *</label>
                  <input type="date" class="form-input" name="start_date" id="leave-start-date" min="${todayStr}" value="${todayStr}" required onchange="LeaveModalComponent.checkSickRequirement()">
                </div>
                <div class="form-group">
                  <label class="form-label">End Date *</label>
                  <input type="date" class="form-input" name="end_date" id="leave-end-date" min="${todayStr}" value="${todayStr}" required onchange="LeaveModalComponent.checkSickRequirement()">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Reason / Justification *</label>
                <textarea class="form-textarea" name="reason" rows="3" placeholder="Please provide specific reason for leave request..." required></textarea>
              </div>

              <!-- Medical Certificate Attachment -->
              <div class="form-group" id="attachment-field" style="display:none;">
                <label class="form-label" id="attachment-label">Medical Certificate / Supporting Document</label>
                <input type="file" class="form-input" name="attachment" id="leave-file-input" accept=".pdf,.png,.jpg,.jpeg">
                <span id="attachment-hint" style="font-size:0.75rem; color:var(--text-muted);">PDF, JPG, or PNG up to 10MB</span>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Discard</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Submit Leave Request</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  onTypeChange(val) {
    const attachField = document.getElementById('attachment-field');
    const halfDayField = document.getElementById('half-day-session-field');
    const descText = document.getElementById('policy-desc-text');

    if (halfDayField) {
      halfDayField.style.display = (val === 'HALF_DAY') ? 'block' : 'none';
    }

    if (attachField) {
      if (val === 'SICK' || val === 'MATERNITY') {
        attachField.style.display = 'block';
      } else {
        attachField.style.display = 'none';
      }
    }

    this.checkSickRequirement();
  },

  checkSickRequirement() {
    const val = document.getElementById('leave_type_select')?.value;
    const d1Str = document.getElementById('leave-start-date')?.value;
    const d2Str = document.getElementById('leave-end-date')?.value;
    const hint = document.getElementById('attachment-hint');
    const attachField = document.getElementById('attachment-field');

    if (val === 'SICK' && d1Str && d2Str) {
      const d1 = new Date(d1Str);
      const d2 = new Date(d2Str);
      const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;

      if (attachField) attachField.style.display = 'block';

      if (diff > 3) {
        if (hint) hint.innerHTML = `<strong style="color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Mandatory:</strong> Sick leave duration is ${diff} days (> 3 days). A doctor's medical certificate is required.`;
      } else {
        if (hint) hint.textContent = 'Optional for <= 3 days. PDF, JPG, or PNG up to 10MB';
      }
    }
  },

  renderAdminActionModal(reqData) {
    return `
      <div class="modal-backdrop" id="leave-action-modal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Review Time-Off Request</h3>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body">
            <div style="background:rgba(255,255,255,0.03); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
              <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${reqData.employee_name}</div>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
                <strong>${reqData.leave_type} Leave</strong> • ${reqData.days_count} Day(s) (${reqData.start_date} to ${reqData.end_date})
                ${reqData.session && reqData.session !== 'FULL_DAY' ? `• <span class="badge badge-info">${reqData.session}</span>` : ''}
              </div>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-top:8px; font-style:italic;">
                "${reqData.reason}"
              </div>
              ${reqData.attachment_url ? `
                <div style="margin-top:8px;">
                  <a href="${reqData.attachment_url}" target="_blank" class="btn btn-sm btn-secondary">
                    <i class="fa-solid fa-paperclip"></i> View Medical Attachment
                  </a>
                </div>
              ` : ''}
            </div>

            <div class="form-group">
              <label class="form-label">HR / Admin Remarks</label>
              <textarea class="form-textarea" id="admin-action-remarks" rows="2" placeholder="Optional comments for employee..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-danger" onclick="App.executeLeaveAction('${reqData.id}', 'REJECT')">
              <i class="fa-solid fa-xmark"></i> Reject
            </button>
            <button class="btn btn-success" onclick="App.executeLeaveAction('${reqData.id}', 'APPROVE')">
              <i class="fa-solid fa-check"></i> Approve & Sync Attendance
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
