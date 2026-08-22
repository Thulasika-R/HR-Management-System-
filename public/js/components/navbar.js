/**
 * Component: Navbar & Header
 */
const NavbarComponent = {
  clockInterval: null,

  init() {
    this.startLiveClock();
    this.updateUserDisplay();
    this.loadNotifications();
  },

  startLiveClock() {
    const clockEl = document.getElementById('live-clock-text');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(update, 1000);
  },

  updateUserDisplay() {
    const user = Auth.user;
    const emp = Auth.employee;

    const nameEl = document.getElementById('user-nav-name');
    const roleEl = document.getElementById('user-nav-role');
    const avatarEl = document.getElementById('user-nav-avatar');
    const dropNameEl = document.getElementById('dropdown-name');
    const dropIdEl = document.getElementById('dropdown-id');

    if (!user) return;

    const displayName = emp ? `${emp.first_name} ${emp.last_name}` : (user.role === 'ADMIN' ? 'HR Administrator' : user.login_id);
    const avatarUrl = emp?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.login_id}`;

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) {
      roleEl.textContent = user.role;
      roleEl.className = user.role === 'ADMIN' ? 'user-role-badge' : 'user-role-badge text-info';
    }
    if (avatarEl) avatarEl.src = avatarUrl;
    if (dropNameEl) dropNameEl.textContent = displayName;
    if (dropIdEl) dropIdEl.textContent = `Login ID: ${user.login_id}`;
  },

  async loadNotifications() {
    if (!Auth.isAuthenticated()) return;
    try {
      const res = await API.analytics.getNotifications();
      const notifs = res.data || [];
      const badge = document.getElementById('notif-badge');
      const count = document.getElementById('notif-count');
      const list = document.getElementById('notif-items');

      if (badge && count && list) {
        if (notifs.length > 0) {
          badge.style.display = 'block';
          count.textContent = `${notifs.length} New`;
          list.innerHTML = notifs.map(n => `
            <div class="dropdown-item notif-item" style="flex-direction:column; align-items:flex-start; gap:2px;">
              <strong style="color:var(--text-primary); font-size:0.8rem;">${n.title}</strong>
              <span style="font-size:0.75rem; color:var(--text-secondary);">${n.message}</span>
              <span style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:2px;">${new Date(n.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
          `).join('');
        } else {
          badge.style.display = 'none';
          count.textContent = '0 New';
          list.innerHTML = '<div class="empty-state-sm" style="padding:1rem; text-align:center; color:var(--text-muted);">No new notifications</div>';
        }
      }
    } catch (e) {}
  }
};
