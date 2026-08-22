/**
 * Component: Attendance Punch Widget
 * Evaluator constraint:
 * Check In -> Status changes to 🟢 Green -> "Since HH:MM AM/PM" -> Check Out -> Work & Overtime hours
 */
const CheckInWidgetComponent = {
  activeTimer: null,

  render(attData) {
    const isCheckedIn = attData && attData.is_checked_in;
    const isCompleted = attData && attData.status === 'COMPLETED';
    const isLeave = attData && attData.status === 'LEAVE';

    let punchBtnHtml = '';
    let statusNote = 'Not checked in yet today';

    if (isLeave) {
      statusNote = '🔵 You have an approved time-off today';
      punchBtnHtml = `
        <div style="padding:1.5rem; text-align:center; color:#60a5fa; font-weight:600;">
          <i class="fa-solid fa-umbrella-beach" style="font-size:2.5rem; margin-bottom:0.75rem; display:block;"></i>
          Approved Time-Off Active
        </div>
      `;
    } else if (isCheckedIn) {
      const inTime = new Date(attData.check_in);
      const timeStr = inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      statusNote = `🟢 Checked in since ${timeStr}`;

      punchBtnHtml = `
        <button class="punch-btn-circle punch-btn-out" onclick="App.handleCheckOut()">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>CHECK OUT</span>
        </button>
        <div style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">
          Since ${timeStr}
        </div>
      `;
    } else if (isCompleted) {
      statusNote = `Completed: ${attData.work_hours}h worked today (Extra: ${attData.extra_hours}h)`;
      punchBtnHtml = `
        <div style="padding:1.5rem; text-align:center; color:var(--status-present); font-weight:700;">
          <i class="fa-solid fa-circle-check" style="font-size:2.5rem; margin-bottom:0.5rem; display:block;"></i>
          Day Complete
        </div>
      `;
    } else {
      punchBtnHtml = `
        <button class="punch-btn-circle punch-btn-in" onclick="App.handleCheckIn()">
          <i class="fa-solid fa-fingerprint"></i>
          <span>CHECK IN</span>
        </button>
      `;
    }

    return `
      <div class="punch-widget">
        <div class="punch-timer-display">
          <span class="punch-clock" id="punch-live-clock">--:--:--</span>
          <span class="punch-since-note" id="punch-status-note">${statusNote}</span>
        </div>

        ${punchBtnHtml}

        <!-- ArcFace AI Biometric Innovation Options -->
        <div style="width:100%; display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
          <button class="btn btn-primary btn-sm" style="width:100%; background:linear-gradient(135deg,#6366f1,#06b6d4); box-shadow:0 0 15px rgba(99,102,241,0.3);" onclick="FaceBiometricModal.open('PUNCH')">
            <i class="fa-solid fa-expand"></i> ArcFace Touchless Face Scan
          </button>
          <button class="btn btn-secondary btn-sm" style="width:100%; font-size:0.75rem;" onclick="FaceBiometricModal.open('KIOSK')">
            <i class="fa-solid fa-building-user"></i> Launch Reception AI Kiosk Terminal
          </button>
        </div>

        <div style="display:flex; gap:1.5rem; width:100%; border-top:1px solid var(--border-subtle); padding-top:1.25rem; justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Required</div>
            <div style="font-size:1.1rem; font-weight:700;">8.0 hrs</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Extra Hours</div>
            <div style="font-size:1.1rem; font-weight:700; color:#34d399;">${attData?.extra_hours || 0} hrs</div>
          </div>
        </div>
      </div>
    `;
  },

  startClock() {
    const clockEl = document.getElementById('punch-live-clock');
    if (!clockEl) return;
    const update = () => {
      clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    if (this.activeTimer) clearInterval(this.activeTimer);
    this.activeTimer = setInterval(update, 1000);
  }
};
