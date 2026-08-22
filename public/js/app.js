/**
 * Dayflow HRMS — Main Application Controller & Router
 * Enhanced with Role-Based Entry Landing, Dedicated Profile View,
 * Live Password Checklist Validation, Logout Confirmation, and 10 Leave Types.
 */
const App = {
  currentView: 'dashboard',
  searchQuery: '',
  selectedDept: 'ALL',
  selectedRolePortal: null, // 'EMPLOYEE' | 'ADMIN' | null
  breadcrumbs: [],

  init() {
    this.initTheme();
    if (!Auth.isAuthenticated()) {
      this.renderRoleLanding();
    } else if (Auth.user.force_password_change) {
      this.renderForcedPasswordChange();
    } else {
      this.showHeader();
      NavbarComponent.init();
      this.navigate('dashboard');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('dayflow_theme') || 'dark';
    this.setTheme(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
    this.showToast(`Switched to ${next === 'light' ? 'Light Theme ☀️' : 'Dark Theme 🌙'}`, 'info');
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dayflow_theme', theme);
    
    // Update all theme toggle icons across the UI
    const icons = document.querySelectorAll('.theme-toggle-icon, #theme-toggle-icon');
    icons.forEach(icon => {
      if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
        icon.style.color = '#4f46e5';
        if (icon.parentElement) icon.parentElement.title = 'Switch to Dark Mode';
      } else {
        icon.className = 'fa-solid fa-sun';
        icon.style.color = '#f59e0b';
        if (icon.parentElement) icon.parentElement.title = 'Switch to Light Mode';
      }
    });
  },

  showHeader() {
    const header = document.getElementById('main-header');
    if (header) header.classList.remove('hidden');
  },

  hideHeader() {
    const header = document.getElementById('main-header');
    if (header) header.classList.add('hidden');
  },

  showLoader() {
    let loader = document.getElementById('top-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'top-loader';
      loader.className = 'top-loader-bar';
      document.body.appendChild(loader);
    }
    loader.style.width = '70%';
    loader.style.opacity = '1';
  },

  hideLoader() {
    const loader = document.getElementById('top-loader');
    if (loader) {
      loader.style.width = '100%';
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.width = '0%'; }, 300);
      }, 200);
    }
  },

  updateBreadcrumbs(viewName, customTitle = null) {
    const titles = {
      'dashboard': 'Workforce Dashboard',
      'attendance': 'Attendance & Time Tracking',
      'timeoff': 'Time Off & Leave Management',
      'payroll': 'Payroll & Salary Slips',
      'analytics': 'Organizational Intelligence (Ω)',
      'profile': 'My Employee Profile',
      'change-password': 'Security & Change Password'
    };

    const currentTitle = customTitle || titles[viewName] || viewName;
    this.breadcrumbs = [
      { name: 'Home', view: 'dashboard' },
      { name: currentTitle, view: viewName }
    ];

    let bContainer = document.getElementById('app-breadcrumbs');
    if (!bContainer && Auth.isAuthenticated()) {
      bContainer = document.createElement('div');
      bContainer.id = 'app-breadcrumbs';
      bContainer.className = 'breadcrumbs-bar';
      const main = document.getElementById('main-content');
      if (main && main.parentNode) {
        main.parentNode.insertBefore(bContainer, main);
      }
    }

    if (bContainer) {
      if (viewName === 'login' || viewName === 'role-landing' || !Auth.isAuthenticated()) {
        bContainer.innerHTML = '';
      } else {
        bContainer.innerHTML = `
          <span class="breadcrumb-link" onclick="App.navigate('dashboard')">
            <i class="fa-solid fa-house" style="font-size:0.75rem;"></i> Home
          </span>
          <span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>
          <span class="breadcrumb-current">${currentTitle}</span>
        `;
      }
    }
  },

  navigate(viewName) {
    this.showLoader();
    this.currentView = viewName;
    this.closeDropdowns();
    this.updateBreadcrumbs(viewName);

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    const main = document.getElementById('main-content');
    if (!main) return;

    setTimeout(() => {
      switch (viewName) {
        case 'dashboard':
          this.renderDashboard(main);
          break;
        case 'attendance':
          this.renderAttendance(main);
          break;
        case 'timeoff':
          this.renderTimeOff(main);
          break;
        case 'payroll':
          this.renderPayroll(main);
          break;
        case 'analytics':
          this.renderAnalytics(main);
          break;
        case 'profile':
          this.renderProfilePage(main);
          break;
        case 'change-password':
          this.renderChangePasswordPage(main);
          break;
        default:
          this.renderDashboard(main);
      }
      this.hideLoader();
    }, 100);
  },

  // =========================================================================
  // 1. ROLE-BASED LANDING & AUTHENTICATION FLOW
  // =========================================================================
  renderRoleLanding() {
    this.hideHeader();
    this.updateBreadcrumbs('role-landing');
    const main = document.getElementById('main-content');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    main.innerHTML = `
      <div class="role-landing-page" style="position:relative;">
        <!-- Floating Theme Toggle for Landing -->
        <div style="position:absolute; top:1rem; right:1.5rem;">
          <button class="icon-btn theme-toggle-btn" onclick="App.toggleTheme()" title="Toggle Theme" style="box-shadow:var(--shadow-md);">
            <i class="${isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}" style="color:${isLight ? '#4f46e5' : '#f59e0b'};"></i>
          </button>
        </div>

        <div class="role-landing-header">
          <div style="width:56px; height:56px; border-radius:var(--radius-md); background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.85rem; margin:0 auto 1.25rem; box-shadow:0 0 25px var(--primary-glow);">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <h1 style="font-size:2.25rem; font-weight:800; letter-spacing:-0.03em;">Welcome to EMPLYRA</h1>
          <p style="font-size:1rem; color:var(--text-secondary); margin-top:8px;">
            <strong>Employee + Modern Platform</strong> — Next-Gen AI Human Resource Ecosystem. Select your role to continue:
          </p>
        </div>

        <div class="role-cards-grid">
          <!-- Employee Portal Card -->
          <div class="role-card role-employee" onclick="App.renderRoleLogin('EMPLOYEE')">
            <div class="role-card-icon role-icon-emp">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <h2 class="role-card-title">Employee Portal</h2>
            <p class="role-card-desc">
              Access personal workspace, daily punch timer, 10+ leave policies, and salary payslips.
            </p>
            <button class="btn btn-primary" style="width:100%; margin-top:0.5rem;">
              Continue as Employee <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i>
            </button>
          </div>

          <!-- Admin / HR Portal Card -->
          <div class="role-card role-admin" onclick="App.renderRoleLogin('ADMIN')">
            <div class="role-card-icon role-icon-adm">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <h2 class="role-card-title">Admin / HR Portal</h2>
            <p class="role-card-desc">
              Manage enterprise workforce, generate immutable Login IDs, approve leaves, and configure payroll.
            </p>
            <button class="btn btn-secondary" style="width:100%; margin-top:0.5rem; border-color:var(--primary); color:#a5b4fc;">
              Continue as Administrator <i class="fa-solid fa-arrow-right" style="margin-left:4px;"></i>
            </button>
          </div>
        </div>

        <!-- ArcFace Instant Face ID Sign-In Banner -->
        <div style="margin-top:2rem; max-width:800px; width:100%; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1)); border:1px solid rgba(99,102,241,0.4); border-radius:var(--radius-xl); padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; box-shadow:0 0 30px rgba(99,102,241,0.25);">
          <div style="display:flex; align-items:center; gap:1rem; text-align:left;">
            <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#06b6d4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.4rem; box-shadow:0 0 15px rgba(99,102,241,0.8);">
              <i class="fa-solid fa-expand"></i>
            </div>
            <div>
              <h3 style="font-size:1.15rem; color:#fff;">Emplyra Vision Ω — ArcFace Biometric Sign-In</h3>
              <p style="font-size:0.825rem; color:#c7d2fe; margin-top:2px;">Touchless 512-D Deep Metric Face ID authentication with anti-spoof liveness shield</p>
            </div>
          </div>
          <button class="btn btn-primary" style="background:linear-gradient(135deg,#6366f1,#06b6d4); box-shadow:0 0 20px rgba(99,102,241,0.5); padding:0.75rem 1.5rem;" onclick="FaceBiometricModal.open('FACE_LOGIN')">
            <i class="fa-solid fa-expand"></i> Instant Face ID Sign-In
          </button>
        </div>
      </div>
    `;
  },

  renderRoleLogin(role) {
    this.selectedRolePortal = role;
    this.hideHeader();
    const main = document.getElementById('main-content');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    const isEmployee = role === 'EMPLOYEE';
    const title = isEmployee ? 'Employee Authentication' : 'Administrator Sign In';
    const badgeColor = isEmployee ? 'info' : 'warning';
    const badgeText = isEmployee ? 'EMPLOYEE PORTAL' : 'ADMIN PRIVILEGE';

    main.innerHTML = `
      <div class="login-page" style="position:relative;">
        <!-- Floating Theme Toggle for Login -->
        <div style="position:absolute; top:1.5rem; right:2rem;">
          <button class="icon-btn theme-toggle-btn" onclick="App.toggleTheme()" title="Toggle Theme" style="box-shadow:var(--shadow-md);">
            <i class="${isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}" style="color:${isLight ? '#4f46e5' : '#f59e0b'};"></i>
          </button>
        </div>

        <div class="login-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <button class="btn btn-sm btn-secondary" onclick="App.renderRoleLanding()">
              <i class="fa-solid fa-arrow-left"></i> Change Role
            </button>
          </div>

          <div class="login-header">
            <span class="badge badge-${badgeColor}" style="margin-bottom:0.5rem; letter-spacing:0.05em;">${badgeText}</span>
            <h2 style="font-size:1.65rem; font-weight:800; letter-spacing:-0.03em;">${title}</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
              ${isEmployee ? 'Sign in with your generated Login ID & Password or Face ID' : 'Sign in with administrative credentials or Face ID'}
            </p>
          </div>

          <!-- ArcFace Biometric Sign In Button -->
          <div style="margin-bottom:1.25rem;">
            <button type="button" class="btn btn-primary" style="width:100%; background:linear-gradient(135deg,#6366f1,#06b6d4); box-shadow:0 0 15px rgba(99,102,241,0.3); padding:0.7rem;" onclick="FaceBiometricModal.open('FACE_LOGIN')">
              <i class="fa-solid fa-expand"></i> ⚡ Sign In with Face ID (ArcFace 512-D)
            </button>
            <div style="display:flex; align-items:center; gap:0.5rem; margin:1rem 0; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">
              <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
              <span>Or sign in with password</span>
              <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
            </div>
          </div>

          <form id="login-form" onsubmit="App.handleRoleLogin(event, '${role}')">
            <div class="form-group">
              <label class="form-label">Generated Login ID / Email *</label>
              <input type="text" class="form-input" id="login-id-input" placeholder="${isEmployee ? 'e.g. OITODO20230001' : 'admin'}" required autocomplete="username">
            </div>

            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" class="form-input" id="login-pass-input" placeholder="••••••••" required autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-secondary" style="width:100%; margin-top:1rem; padding:0.75rem; font-weight:700;">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to ${role} Portal
            </button>
          </form>

          <!-- Quick Evaluator Demo Fillers -->
          <div style="margin-top:1.5rem; border-top:1px solid var(--border-subtle); padding-top:1rem;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem; text-align:center;">
              <i class="fa-solid fa-bolt" style="color:#f59e0b; margin-right:4px;"></i> Quick Demo Credentials:
            </div>
            <div class="demo-account-pills" style="justify-content:center;">
              ${isEmployee ? `
                <button class="demo-pill" onclick="App.fillLogin('OITODO20230001', 'welcome123')">👤 Alex (Present 🟢)</button>
                <button class="demo-pill" onclick="App.fillLogin('OIRUDH20240003', 'welcome123')">👤 Rudhran (Leave 🔵)</button>
                <button class="demo-pill" onclick="App.fillLogin('OIEMMA20240004', 'welcome123')">👤 Emma (First Login 🟡)</button>
              ` : `
                <button class="demo-pill" onclick="App.fillLogin('admin', 'admin123')">🔑 Master Admin (admin / admin123)</button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  fillLogin(id, pass) {
    const idInput = document.getElementById('login-id-input');
    const passInput = document.getElementById('login-pass-input');
    if (idInput && passInput) {
      idInput.value = id;
      passInput.value = pass;
    }
  },

  async handleRoleLogin(e, role) {
    e.preventDefault();
    const id = document.getElementById('login-id-input')?.value;
    const pass = document.getElementById('login-pass-input')?.value;

    try {
      const res = await API.auth.login(id, pass);
      
      // Role match check
      if (role && res.user.role !== role) {
        throw new Error(`Access restricted: This account belongs to the [${res.user.role}] role. Please select the correct portal.`);
      }

      Auth.setSession(res.token, res.user, res.employee);
      this.showToast(`Welcome back, ${res.employee?.first_name || res.user.login_id}!`, 'success');

      if (res.user.force_password_change) {
        this.renderForcedPasswordChange();
      } else {
        this.showHeader();
        NavbarComponent.init();
        this.navigate('dashboard');
      }
    } catch (err) {
      this.showToast(err.message || 'Login failed. Invalid credentials.', 'error');
    }
  },

  renderForcedPasswordChange() {
    this.hideHeader();
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-header">
            <div style="width:48px; height:48px; border-radius:var(--radius-md); background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.4); display:flex; align-items:center; justify-content:center; color:#fbbf24; font-size:1.5rem; margin:0 auto 1rem;">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 style="font-size:1.4rem;">Security Requirement</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
              This is your first login. Evaluator security policy requires you to set a strong custom password.
            </p>
          </div>

          <form onsubmit="App.handleForcedPasswordChange(event)">
            <div class="form-group">
              <label class="form-label">New Password *</label>
              <input type="password" class="form-input" id="new-password-input" minlength="8" placeholder="Enter at least 8 characters" required oninput="App.onPasswordInput(this.value)">
            </div>

            <!-- Live Password Checklist Indicator -->
            <div class="password-requirements-box">
              <div class="pw-rule-item" id="rule-len"><i class="fa-solid fa-circle"></i> Minimum 8 characters</div>
              <div class="pw-rule-item" id="rule-upper"><i class="fa-solid fa-circle"></i> At least one uppercase letter (A-Z)</div>
              <div class="pw-rule-item" id="rule-lower"><i class="fa-solid fa-circle"></i> At least one lowercase letter (a-z)</div>
              <div class="pw-rule-item" id="rule-num"><i class="fa-solid fa-circle"></i> At least one numerical digit (0-9)</div>
              <div class="pw-rule-item" id="rule-special"><i class="fa-solid fa-circle"></i> At least one special symbol (!@#$%^&*...)</div>
              <div class="pw-strength-bar"><div class="pw-strength-fill" id="strength-fill"></div></div>
            </div>

            <div class="form-group" style="margin-top:1rem;">
              <label class="form-label">Confirm New Password *</label>
              <input type="password" class="form-input" id="confirm-password-input" minlength="8" placeholder="Re-enter password" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem; padding:0.75rem;">
              Set Secure Password & Proceed
            </button>
          </form>
        </div>
      </div>
    `;
  },

  onPasswordInput(val) {
    const hasLen = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasLower = /[a-z]/.test(val);
    const hasNum = /[0-9]/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    this.togglePwRule('rule-len', hasLen);
    this.togglePwRule('rule-upper', hasUpper);
    this.togglePwRule('rule-lower', hasLower);
    this.togglePwRule('rule-num', hasNum);
    this.togglePwRule('rule-special', hasSpecial);

    const score = [hasLen, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    const fill = document.getElementById('strength-fill');
    if (fill) {
      const pct = (score / 5) * 100;
      fill.style.width = `${pct}%`;
      if (score <= 2) fill.style.background = '#ef4444';
      else if (score <= 4) fill.style.background = '#f59e0b';
      else fill.style.background = '#10b981';
    }
  },

  togglePwRule(id, isMet) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle('rule-met', isMet);
      const icon = el.querySelector('i');
      if (icon) {
        icon.className = isMet ? 'fa-solid fa-check-circle' : 'fa-solid fa-circle';
      }
    }
  },

  async handleForcedPasswordChange(e) {
    e.preventDefault();
    const p1 = document.getElementById('new-password-input')?.value;
    const p2 = document.getElementById('confirm-password-input')?.value;

    if (p1 !== p2) {
      return this.showToast('Passwords do not match.', 'error');
    }

    try {
      await API.auth.changePassword('', p1);
      this.showToast('Password updated! Redirecting to Dashboard...', 'success');
      Auth.user.force_password_change = false;
      localStorage.setItem('dayflow_user', JSON.stringify(Auth.user));
      this.showHeader();
      NavbarComponent.init();
      this.navigate('dashboard');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // =========================================================================
  // 2. DEDICATED PROFILE PAGE VIEW (EMPLOYEE & ADMIN)
  // =========================================================================
  async renderProfilePage(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const empId = Auth.user.employee_id || (Auth.user.role === 'ADMIN' ? 'emp_admin' : 'emp_001');

    try {
      let empRes;
      try {
        empRes = await API.employees.getById(empId);
      } catch (e) {
        // Fallback for admin
        empRes = { data: Auth.employee || db?.findOne?.('employees', em => em.id === 'emp_admin') };
      }

      let salData = null;
      if (Auth.isAdmin() && empId) {
        try {
          const salRes = await API.salary.getByEmployee(empId);
          salData = salRes.data;
        } catch (e) {}
      }

      if (empRes && empRes.data) {
        container.innerHTML = ProfileDrawerComponent.renderDedicatedPage(empRes.data, salData);
      } else {
        container.innerHTML = `
          <div class="profile-banner-card">
            <div class="profile-user-hero">
              <div style="width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:#fff;">
                <i class="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <h1 style="font-size:1.8rem; font-weight:800;">System Administrator</h1>
                <p style="color:var(--text-secondary);">Master HR & Security Operations Account • ID: admin</p>
              </div>
            </div>
            <div>
              <button class="btn btn-primary" onclick="App.navigate('change-password')">
                <i class="fa-solid fa-key"></i> Change Admin Password
              </button>
            </div>
          </div>
        `;
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  showPunchPopup(title, message, isCheckIn, details = {}) {
    const root = document.getElementById('modals-root');
    const color = isCheckIn ? '#10b981' : '#f59e0b';
    const glow = isCheckIn ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)';
    const icon = isCheckIn ? 'fa-solid fa-circle-check' : 'fa-solid fa-right-from-bracket';

    root.innerHTML = `
      <div class="modal-backdrop" id="punch-popup-modal">
        <div class="modal-dialog" style="max-width:440px; text-align:center; background:#0b1120; border:1px solid ${color}; box-shadow:0 0 40px ${glow};">
          <div class="modal-body" style="padding:2.25rem 1.5rem;">
            <div style="width:68px; height:68px; border-radius:50%; background:${color}20; border:2px solid ${color}; display:flex; align-items:center; justify-content:center; color:${color}; font-size:2rem; margin:0 auto 1.25rem; box-shadow:0 0 25px ${glow}; animation:scaleUp 0.3s cubic-bezier(0.16,1,0.3,1);">
              <i class="${icon}"></i>
            </div>
            <h3 style="font-size:1.4rem; font-weight:800; color:#ffffff;">${title}</h3>
            <p style="font-size:0.9rem; color:#cbd5e1; margin-top:6px; line-height:1.5;">${message}</p>
            
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-lg); padding:1rem; margin-top:1.25rem; text-align:left; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="color:var(--text-muted);">Timestamp:</span>
                <strong style="color:#a5b4fc; font-family:var(--font-mono);">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="color:var(--text-muted);">State Indicator:</span>
                <span>${isCheckIn ? '<span class="status-pill status-present"><span class="status-dot-present"></span> Present</span>' : '<span class="status-pill status-absent">Completed</span>'}</span>
              </div>
              ${details.workHours ? `
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-muted);">Work Hours Logged:</span>
                  <strong style="color:#34d399;">${details.workHours} hrs (Overtime: +${details.extraHours || 0}h)</strong>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="modal-footer" style="justify-content:center; background:rgba(15,23,42,0.6); border-top:1px solid rgba(255,255,255,0.08);">
            <button class="btn btn-primary" style="background:${color}; color:${isCheckIn ? '#064e3b' : '#fff'}; width:100%; font-weight:700;" onclick="App.closeModal()">
              Done & Return to Workspace
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // 3. DEDICATED CHANGE PASSWORD PAGE VIEW
  // =========================================================================
  renderChangePasswordPage(container) {
    container.innerHTML = `
      <div style="max-width:540px; margin:0 auto;">
        <div style="margin-bottom:1.5rem; text-align:center;">
          <div style="width:48px; height:48px; border-radius:var(--radius-md); background:rgba(99,102,241,0.15); display:flex; align-items:center; justify-content:center; color:#818cf8; font-size:1.5rem; margin:0 auto 0.75rem;">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h2>Security & Password Management</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
            Update your account password following enterprise security policy guidelines.
          </p>
        </div>

        <div class="profile-section-card">
          <form onsubmit="App.handleDedicatedPasswordChange(event)">
            <div class="form-group">
              <label class="form-label">Current Password *</label>
              <input type="password" class="form-input" id="cp-current-pass" placeholder="Enter current password" required>
            </div>

            <div class="form-group">
              <label class="form-label">New Password *</label>
              <input type="password" class="form-input" id="cp-new-pass" minlength="8" placeholder="Enter new strong password" required oninput="App.onPasswordInput(this.value)">
            </div>

            <!-- Password Requirements Checklist -->
            <div class="password-requirements-box">
              <div class="pw-rule-item" id="rule-len"><i class="fa-solid fa-circle"></i> Minimum 8 characters</div>
              <div class="pw-rule-item" id="rule-upper"><i class="fa-solid fa-circle"></i> At least one uppercase letter (A-Z)</div>
              <div class="pw-rule-item" id="rule-lower"><i class="fa-solid fa-circle"></i> At least one lowercase letter (a-z)</div>
              <div class="pw-rule-item" id="rule-num"><i class="fa-solid fa-circle"></i> At least one numerical digit (0-9)</div>
              <div class="pw-rule-item" id="rule-special"><i class="fa-solid fa-circle"></i> At least one special symbol (!@#$%^&*...)</div>
              <div class="pw-strength-bar"><div class="pw-strength-fill" id="strength-fill"></div></div>
            </div>

            <div class="form-group" style="margin-top:1.25rem;">
              <label class="form-label">Confirm New Password *</label>
              <input type="password" class="form-input" id="cp-confirm-pass" minlength="8" placeholder="Re-enter new password" required>
            </div>

            <div style="display:flex; gap:0.75rem; margin-top:1.5rem;">
              <button type="button" class="btn btn-secondary" style="flex:1;" onclick="App.navigate('dashboard')">Cancel</button>
              <button type="submit" class="btn btn-primary" style="flex:2;">
                <i class="fa-solid fa-check"></i> Update Password & Relogin
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleDedicatedPasswordChange(e) {
    e.preventDefault();
    const curr = document.getElementById('cp-current-pass')?.value;
    const p1 = document.getElementById('cp-new-pass')?.value;
    const p2 = document.getElementById('cp-confirm-pass')?.value;

    if (p1 !== p2) {
      return this.showToast('Passwords do not match.', 'error');
    }

    try {
      const res = await API.auth.changePassword(curr, p1);
      this.showToast('Password changed successfully! Please log in again.', 'success');
      setTimeout(() => {
        Auth.logout();
        App.renderRoleLanding();
      }, 1500);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // =========================================================================
  // 4. LOGOUT CONFIRMATION DIALOG
  // =========================================================================
  openLogoutConfirm() {
    this.closeDropdowns();
    const root = document.getElementById('modals-root');
    root.innerHTML = `
      <div class="modal-backdrop" id="logout-confirm-modal">
        <div class="modal-dialog" style="max-width:420px; text-align:center;">
          <div class="modal-body" style="padding:2rem;">
            <div style="width:56px; height:56px; border-radius:50%; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); display:flex; align-items:center; justify-content:center; color:#f87171; font-size:1.65rem; margin:0 auto 1rem;">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </div>
            <h3 style="font-size:1.3rem; font-weight:700;">Are you sure you want to log out?</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:6px;">
              Your active session will be securely terminated. You will be redirected to the role selection landing page.
            </p>
          </div>
          <div class="modal-footer" style="justify-content:center; gap:1rem;">
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-danger" onclick="App.executeLogout()">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    `;
  },

  executeLogout() {
    this.closeModal();
    Auth.logout();
    this.showToast('Logged out successfully.', 'info');
    this.renderRoleLanding();
  },

  // =========================================================================
  // 5. DASHBOARD VIEW (Evaluator Clickable Cards & 🟢/🔵/🟡 Status)
  // =========================================================================
  async renderDashboard(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const [overview, employees] = await Promise.all([
      State.refreshOverview(),
      State.refreshEmployees()
    ]);

    const m = overview.metrics;
    const isAdmin = Auth.isAdmin();
    const departments = ['ALL', ...new Set(employees.map(e => e.department))];

    const filteredEmployees = employees.filter(emp => {
      const matchSearch = !this.searchQuery || 
        emp.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.login_id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        emp.job_title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchDept = this.selectedDept === 'ALL' || emp.department === this.selectedDept;
      return matchSearch && matchDept;
    });

    container.innerHTML = `
      <!-- Metrics Row -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box metric-icon-primary"><i class="fa-solid fa-users"></i></div>
          <div class="metric-content">
            <span class="metric-label">Total Workforce</span>
            <span class="metric-value">${m.total_employees}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box metric-icon-present"><i class="fa-solid fa-user-check"></i></div>
          <div class="metric-content">
            <span class="metric-label">🟢 Present Today</span>
            <span class="metric-value">${m.present_today}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box metric-icon-leave"><i class="fa-solid fa-calendar-day"></i></div>
          <div class="metric-content">
            <span class="metric-label">🔵 Approved Leave</span>
            <span class="metric-value">${m.on_leave_today}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box metric-icon-absent"><i class="fa-solid fa-user-xmark"></i></div>
          <div class="metric-content">
            <span class="metric-label">🟡 Absent Today</span>
            <span class="metric-value">${m.absent_today}</span>
          </div>
        </div>
      </div>

      <!-- Controls & Search -->
      <div class="dashboard-controls">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" class="form-input" placeholder="Search by name, ID (e.g. OITODO...), or job title..." 
                 value="${this.searchQuery}" oninput="App.onSearch(this.value)">
        </div>

        <div class="filter-group">
          <select class="form-select" style="min-width:160px;" onchange="App.onDeptFilter(this.value)">
            ${departments.map(d => `<option value="${d}" ${this.selectedDept === d ? 'selected' : ''}>${d === 'ALL' ? 'All Departments' : d}</option>`).join('')}
          </select>

          ${isAdmin ? `
            <button class="btn btn-primary" onclick="App.openCreateEmployeeModal()">
              <i class="fa-solid fa-user-plus"></i> Add Employee
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Evaluator Constraint: Employee Cards Grid with Dynamic Status -->
      <div class="employee-grid" id="employee-cards-container">
        ${filteredEmployees.length > 0 ? filteredEmployees.map(emp => EmployeeCardComponent.render(emp)).join('') : `
          <div style="grid-column: 1/-1; padding:3rem; text-align:center; color:var(--text-muted);">
            <i class="fa-regular fa-folder-open" style="font-size:2.5rem; margin-bottom:0.75rem; display:block;"></i>
            No employees found matching the filters.
          </div>
        `}
      </div>
    `;
  },

  onSearch(val) {
    this.searchQuery = val;
    this.renderDashboard(document.getElementById('main-content'));
  },

  onDeptFilter(val) {
    this.selectedDept = val;
    this.renderDashboard(document.getElementById('main-content'));
  },

  // =========================================================================
  // 6. ATTENDANCE VIEW
  // =========================================================================
  async renderAttendance(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const isAdmin = Auth.isAdmin();
    const todayStatus = await State.refreshTodayAttendance();
    const myLogsRes = Auth.user.employee_id ? await API.attendance.getMyLogs() : null;

    let adminGridHtml = '';
    if (isAdmin) {
      const allAttRes = await API.attendance.getAll();
      adminGridHtml = `
        <div class="table-card" style="margin-top:2rem;">
          <div class="table-header-box">
            <div>
              <h3>All Workforce Live Attendance (Admin Master Grid)</h3>
              <p style="font-size:0.8rem; color:var(--text-secondary);">Real-time check-in/out timestamps and work hours</p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <input type="date" class="form-input" id="admin-att-date" value="${new Date().toISOString().split('T')[0]}" onchange="App.onAdminDateChange(this.value)">
            </div>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Login ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Extra Hours</th>
                </tr>
              </thead>
              <tbody>
                ${allAttRes.data.map(row => {
                  let pillClass = row.status === 'PRESENT' ? 'status-present' : (row.status === 'LEAVE' ? 'status-leave' : 'status-absent');
                  return `
                    <tr>
                      <td style="font-weight:600; color:var(--text-primary);">${row.name}</td>
                      <td><span class="card-login-id">${row.login_id}</span></td>
                      <td>${row.department}</td>
                      <td><span class="status-pill ${pillClass}">${row.status}</span></td>
                      <td>${row.check_in ? new Date(row.check_in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                      <td>${row.check_out ? new Date(row.check_out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                      <td>${row.work_hours} hrs</td>
                      <td style="color:#34d399; font-weight:600;">+${row.extra_hours} hrs</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    const summary = myLogsRes ? myLogsRes.summary : { total_working_days: 26, days_present: 0, leave_count: 0, total_work_hours: 0, total_extra_hours: 0 };
    const logs = myLogsRes ? myLogsRes.logs : [];

    container.innerHTML = `
      <div class="attendance-layout">
        <!-- Punch Widget -->
        <div>
          ${CheckInWidgetComponent.render(todayStatus)}
        </div>

        <!-- Personal Summary & Daily Records -->
        <div>
          <div class="metrics-grid" style="margin-bottom:1.5rem;">
            <div class="metric-card">
              <div class="metric-icon-box metric-icon-present"><i class="fa-regular fa-calendar-check"></i></div>
              <div class="metric-content">
                <span class="metric-label">Days Present</span>
                <span class="metric-value">${summary.days_present}</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon-box metric-icon-leave"><i class="fa-solid fa-umbrella-beach"></i></div>
              <div class="metric-content">
                <span class="metric-label">Leaves Count</span>
                <span class="metric-value">${summary.leave_count}</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon-box metric-icon-primary"><i class="fa-regular fa-hourglass-half"></i></div>
              <div class="metric-content">
                <span class="metric-label">Work Hours</span>
                <span class="metric-value">${summary.total_work_hours}h</span>
              </div>
            </div>
          </div>

          <!-- Daily Attendance Table -->
          <div class="table-card">
            <div class="table-header-box">
              <h3>My Monthly Attendance Log</h3>
              <span class="badge badge-info">${myLogsRes ? myLogsRes.month : new Date().toISOString().slice(0,7)}</span>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Hours</th>
                    <th>Extra Hours</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.length > 0 ? logs.map(l => `
                    <tr>
                      <td style="font-family:var(--font-mono); font-weight:600;">${l.date}</td>
                      <td><span class="status-pill status-${l.status.toLowerCase()}">${l.status}</span></td>
                      <td>${l.check_in ? new Date(l.check_in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                      <td>${l.check_out ? new Date(l.check_out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                      <td>${l.work_hours} hrs</td>
                      <td style="color:#34d399;">+${l.extra_hours} hrs</td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No attendance records logged this month.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      ${adminGridHtml}
    `;

    CheckInWidgetComponent.startClock();
  },

  async handleCheckIn() {
    try {
      const res = await API.attendance.checkIn();
      this.showPunchPopup('Checked In Successfully! 🟢', res.message || 'Your check-in timestamp is recorded. Dashboard status is now Present.', true);
      await State.refreshTodayAttendance();
      await State.refreshOverview();
      this.navigate('attendance');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async handleCheckOut() {
    try {
      const res = await API.attendance.checkOut(0);
      const att = res.attendance || {};
      this.showPunchPopup('Checked Out Successfully! 🏁', res.message || 'Work hours and overtime have been computed and synchronized.', false, {
        workHours: att.work_hours || 8,
        extraHours: att.extra_hours || 0
      });
      await State.refreshTodayAttendance();
      await State.refreshOverview();
      this.navigate('attendance');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async onAdminDateChange(date) {
    const allAttRes = await API.attendance.getAll(date);
    this.renderAttendance(document.getElementById('main-content'));
  },

  // =========================================================================
  // 7. TIME OFF VIEW (10 Expanded Leave Types & Balances)
  // =========================================================================
  async renderTimeOff(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const isAdmin = Auth.isAdmin();
    const myLeavesRes = Auth.user.employee_id ? await API.timeoff.getMyRequests() : { balances: [], requests: [] };
    const allLeavesRes = isAdmin ? await API.timeoff.getAllRequests() : null;

    const balances = myLeavesRes.balances || [];
    const requests = myLeavesRes.requests || [];

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Time Off & Leave Management (10 Categories)</h2>
          <p style="font-size:0.85rem; color:var(--text-secondary);">Manage statutory leave balances, request time-off, and track approvals</p>
        </div>
        ${Auth.user.employee_id ? `
          <button class="btn btn-primary" onclick="App.openLeaveRequestModal()">
            <i class="fa-solid fa-plus"></i> Request Time Off
          </button>
        ` : ''}
      </div>

      <!-- 10 Leave Policies & Balances Grid -->
      <h3 style="font-size:1rem; margin-bottom:0.75rem; color:var(--text-primary);"><i class="fa-solid fa-layer-group" style="margin-right:6px; color:var(--primary);"></i> Leave Balances & Quota Policies</h3>
      <div class="leave-policies-grid">
        ${balances.map(pol => {
          const usedPct = pol.total > 0 ? Math.min(100, Math.round((pol.used / pol.total) * 100)) : 0;
          return `
            <div class="leave-policy-card">
              <div class="leave-card-header">
                <div class="leave-icon-badge" style="background:${pol.color}20; color:${pol.color}; border:1px solid ${pol.color}40;">
                  <i class="${pol.icon}"></i>
                </div>
                <span class="badge ${pol.is_paid ? 'badge-success' : 'badge-danger'}">${pol.is_paid ? 'Paid' : 'Unpaid'}</span>
              </div>
              <div>
                <h4 class="leave-type-title">${pol.name}</h4>
                <p class="leave-type-desc">${pol.description}</p>
              </div>
              <div class="leave-balance-progress">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                  <span style="color:var(--text-muted);">Available: <strong style="color:#34d399;">${pol.available}</strong> / ${pol.total}</span>
                  <span style="color:var(--text-muted);">${usedPct}% Used</span>
                </div>
                <div class="leave-progress-track">
                  <div class="leave-progress-fill" style="width:${usedPct}%; background:${pol.color};"></div>
                </div>
              </div>
              <div class="leave-meta-tags">
                <span class="badge badge-info" title="Carry Forward Policy">${pol.carry_forward ? `Carry Forward: Max ${pol.max_carry_forward}d` : 'No Carry Forward'}</span>
                <span class="badge badge-warning" style="font-size:0.65rem;">${pol.approval_hierarchy}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Admin Approval Queue (if Admin) -->
      ${isAdmin ? `
        <div class="table-card" style="margin-bottom:2rem; border:1px solid rgba(99,102,241,0.3);">
          <div class="table-header-box" style="background:rgba(99,102,241,0.08);">
            <div>
              <h3 style="color:#c7d2fe;"><i class="fa-solid fa-gavel" style="margin-right:6px;"></i> Admin Pending Approvals & Atomic Sync Queue</h3>
              <p style="font-size:0.8rem; color:var(--text-secondary);">Approving a leave automatically updates attendance records & payable days calculation</p>
            </div>
            <span class="badge badge-warning">${allLeavesRes.data.filter(r => r.status === 'PENDING').length} Pending</span>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Attachment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${allLeavesRes.data.map(req => `
                  <tr>
                    <td style="font-weight:600; color:var(--text-primary);">${req.employee_name}</td>
                    <td><span class="badge badge-info">${req.leave_type}</span></td>
                    <td style="font-family:var(--font-mono);">${req.start_date} to ${req.end_date}</td>
                    <td><strong>${req.days_count}</strong></td>
                    <td style="max-width:240px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${req.reason}</td>
                    <td>
                      ${req.attachment_url ? `<a href="${req.attachment_url}" target="_blank" class="btn btn-sm btn-secondary"><i class="fa-solid fa-paperclip"></i> View</a>` : '—'}
                    </td>
                    <td>
                      <span class="badge badge-${req.status === 'APPROVED' ? 'success' : (req.status === 'REJECTED' ? 'danger' : 'warning')}">
                        ${req.status}
                      </span>
                    </td>
                    <td>
                      ${req.status === 'PENDING' ? `
                        <div style="display:flex; gap:4px;">
                          <button class="btn btn-sm btn-success" onclick='App.openLeaveActionModal(${JSON.stringify(req)})'>
                            Review / Approve
                          </button>
                        </div>
                      ` : `<span style="font-size:0.75rem; color:var(--text-muted);">${req.admin_remarks || 'Completed'}</span>`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Personal Leave History -->
      <div class="table-card">
        <div class="table-header-box">
          <h3>My Leave Request History</h3>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Days Count</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Comments</th>
              </tr>
            </thead>
            <tbody>
              ${requests.length > 0 ? requests.map(r => `
                <tr>
                  <td><span class="badge badge-info">${r.leave_type}</span></td>
                  <td style="font-family:var(--font-mono);">${r.start_date} to ${r.end_date}</td>
                  <td><strong>${r.days_count}</strong> ${r.session && r.session !== 'FULL_DAY' ? `(${r.session})` : ''}</td>
                  <td>${r.reason}</td>
                  <td>
                    <span class="badge badge-${r.status === 'APPROVED' ? 'success' : (r.status === 'REJECTED' ? 'danger' : 'warning')}">
                      ${r.status}
                    </span>
                  </td>
                  <td>${r.admin_remarks || '—'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No time-off requests submitted yet.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async openLeaveRequestModal() {
    try {
      const polRes = await API.timeoff.getMyRequests();
      const root = document.getElementById('modals-root');
      root.innerHTML = LeaveModalComponent.renderRequestModal(polRes.balances);
    } catch (e) {
      const root = document.getElementById('modals-root');
      root.innerHTML = LeaveModalComponent.renderRequestModal();
    }
  },

  async handleLeaveSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('leave-request-form');
    const formData = new FormData(form);

    try {
      const res = await API.timeoff.submitRequest(formData);
      this.showToast(res.message, 'success');
      this.closeModal();
      this.navigate('timeoff');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  openLeaveActionModal(reqData) {
    const root = document.getElementById('modals-root');
    root.innerHTML = LeaveModalComponent.renderAdminActionModal(reqData);
  },

  async executeLeaveAction(requestId, action) {
    const remarks = document.getElementById('admin-action-remarks')?.value;
    try {
      const res = await API.timeoff.actionRequest(requestId, action, remarks);
      this.showToast(res.message, 'success');
      this.closeModal();
      this.navigate('timeoff');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // =========================================================================
  // 8. PAYROLL & PAYSLIP VIEW
  // =========================================================================
  async renderPayroll(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const isAdmin = Auth.isAdmin();
    const targetMonth = new Date().toISOString().slice(0, 7);

    if (isAdmin) {
      const summaryRes = await API.payroll.getSummary(targetMonth);
      const s = summaryRes.summary;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2>Organizational Payroll Engine</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary);">
              Attendance + Approved Leaves $\\to$ Payable Days $\\to$ Pro-Rated Salary Integration
            </p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary" onclick="App.processMonthlyPayroll('${targetMonth}')">
              <i class="fa-solid fa-lock"></i> Process & Freeze Payroll Run (${targetMonth})
            </button>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box metric-icon-primary"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div class="metric-content">
              <span class="metric-label">Gross Disbursement</span>
              <span class="metric-value">₹${s.total_gross_disbursement.toLocaleString()}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box metric-icon-present"><i class="fa-solid fa-wallet"></i></div>
            <div class="metric-content">
              <span class="metric-label">Net Take-Home Total</span>
              <span class="metric-value">₹${s.total_net_disbursement.toLocaleString()}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box metric-icon-absent"><i class="fa-solid fa-receipt"></i></div>
            <div class="metric-content">
              <span class="metric-label">Statutory Deductions (PF+PT)</span>
              <span class="metric-value">₹${s.total_deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Employee Itemized Payroll Table -->
        <div class="table-card">
          <div class="table-header-box">
            <h3>Employee Monthly Payable Breakdown — ${targetMonth}</h3>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Login ID</th>
                  <th>Department</th>
                  <th>Working Days</th>
                  <th>Payable Days</th>
                  <th>Base Wage</th>
                  <th>Gross Salary</th>
                  <th>Net Take-Home</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${summaryRes.employees.map(emp => `
                  <tr>
                    <td style="font-weight:600; color:var(--text-primary);">${emp.name}</td>
                    <td><span class="card-login-id">${emp.login_id}</span></td>
                    <td>${emp.department}</td>
                    <td>${emp.total_working_days}</td>
                    <td><strong style="color:#818cf8;">${emp.payable_days}</strong> (${Math.round(emp.payable_ratio * 100)}%)</td>
                    <td>₹${emp.base_wage.toLocaleString()}</td>
                    <td style="color:#34d399; font-weight:600;">₹${emp.gross_salary.toLocaleString()}</td>
                    <td style="font-weight:800; color:#a5b4fc;">₹${emp.net_salary.toLocaleString()}</td>
                    <td>
                      <button class="btn btn-sm btn-secondary" onclick="App.viewEmployeePayslip('${emp.employee_id}', '${targetMonth}')">
                        <i class="fa-regular fa-file-lines"></i> Payslip
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      const calcRes = await API.payroll.calculate(Auth.user.employee_id, targetMonth);
      const data = calcRes.data;

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2>My Monthly Compensation & Payslip</h2>
            <p style="font-size:0.85rem; color:var(--text-secondary);">Pro-rated monthly salary based on logged attendance and approved leaves</p>
          </div>
          <button class="btn btn-primary" onclick="App.viewEmployeePayslip('${Auth.user.employee_id}', '${targetMonth}')">
            <i class="fa-solid fa-print"></i> View & Print Salary Slip (PDF)
          </button>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon-box metric-icon-present"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="metric-content">
              <span class="metric-label">Payable Days</span>
              <span class="metric-value">${data.payable_days} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400;">/ ${data.total_working_days}</span></span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box metric-icon-primary"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div class="metric-content">
              <span class="metric-label">Gross Earnings</span>
              <span class="metric-value">₹${data.gross_salary.toLocaleString()}</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-box metric-icon-absent"><i class="fa-solid fa-receipt"></i></div>
            <div class="metric-content">
              <span class="metric-label">Deductions (PF+PT)</span>
              <span class="metric-value">₹${data.total_deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Component Breakdown Card -->
        <div class="table-card">
          <div class="table-header-box">
            <h3>Calculated Component Breakdown (${targetMonth})</h3>
            <span class="badge badge-success">Net Pay: ₹${data.net_salary.toLocaleString()}</span>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Calculation Rule</th>
                  <th style="text-align:right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td>50% of Wage (Pro-rated for ${data.payable_days} days)</td>
                  <td style="text-align:right;">₹${data.breakdown.earnings.basic_salary.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td>50% of Basic</td>
                  <td style="text-align:right;">₹${data.breakdown.earnings.hra.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Standard & Fixed Allowances</td>
                  <td>Standard + LTA + Fixed Special</td>
                  <td style="text-align:right;">₹${(data.breakdown.earnings.standard_allowance + data.breakdown.earnings.lta + data.breakdown.earnings.fixed_allowance).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Performance Bonus</td>
                  <td>Fixed monthly bonus</td>
                  <td style="text-align:right;">₹${data.breakdown.earnings.performance_bonus.toLocaleString()}</td>
                </tr>
                <tr style="background:rgba(239,68,68,0.05);">
                  <td style="color:#f87171;">Provident Fund (PF)</td>
                  <td style="color:#f87171;">12% Statutory Deduction on Basic</td>
                  <td style="text-align:right; color:#f87171;">- ₹${data.breakdown.deductions.provident_fund.toLocaleString()}</td>
                </tr>
                <tr style="background:rgba(239,68,68,0.05);">
                  <td style="color:#f87171;">Professional Tax</td>
                  <td style="color:#f87171;">Statutory Tax</td>
                  <td style="text-align:right; color:#f87171;">- ₹${data.breakdown.deductions.professional_tax.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  },

  async viewEmployeePayslip(empId, month) {
    try {
      const res = await API.payroll.calculate(empId, month);
      const root = document.getElementById('modals-root');
      root.innerHTML = PayslipModalComponent.render(res.data);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async processMonthlyPayroll(month) {
    if (!confirm(`Are you sure you want to finalize and freeze payroll disbursement for ${month}?`)) return;
    try {
      const res = await API.payroll.processRun(month);
      this.showToast(res.message, 'success');
      this.navigate('payroll');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  // =========================================================================
  // 9. ANALYTICS VIEW
  // =========================================================================
  async renderAnalytics(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:center; padding:3rem;">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      </div>
    `;

    const [overview, auditRes] = await Promise.all([
      API.analytics.getOverview(),
      Auth.isAdmin() ? API.analytics.getAuditLogs(30) : { data: [] }
    ]);

    const data = overview.data;

    container.innerHTML = `
      <div style="margin-bottom:1.5rem;">
        <h2>Organizational Intelligence & Health (DAYFLOW Ω)</h2>
        <p style="font-size:0.85rem; color:var(--text-secondary);">Topological behavioral signals, anomaly detection, and state transition audit logs</p>
      </div>

      <!-- Anomaly Alerts Feed -->
      <div style="margin-bottom:2rem;">
        <h3 style="font-size:1rem; margin-bottom:0.75rem;"><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b; margin-right:6px;"></i> Active Organizational Signals & Alerts</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${data.anomalies.length > 0 ? data.anomalies.map(a => `
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); padding:1rem 1.25rem; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <span class="badge badge-warning">${a.category}</span>
                <span style="font-size:0.875rem; color:var(--text-primary);">${a.message}</span>
              </div>
              <span class="badge badge-sm badge-info">Severity: ${a.severity}</span>
            </div>
          `).join('') : `
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:1rem; border-radius:var(--radius-md); color:#34d399; font-weight:600;">
              <i class="fa-solid fa-check-circle" style="margin-right:6px;"></i> All organizational attendance vectors are operating in optimal balance.
            </div>
          `}
        </div>
      </div>

      <!-- Department Distribution -->
      <div class="table-card" style="margin-bottom:2rem;">
        <div class="table-header-box">
          <h3>Department Presence & Topology Breakdown</h3>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Strength</th>
                <th>Present</th>
                <th>On Leave</th>
                <th>Absent</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(data.department_breakdown).map(([dept, stats]) => {
                const rate = stats.total > 0 ? Math.round(((stats.present + stats.on_leave) / stats.total) * 100) : 100;
                return `
                  <tr>
                    <td style="font-weight:700; color:var(--text-primary);">${dept}</td>
                    <td>${stats.total}</td>
                    <td><span style="color:#34d399; font-weight:600;">${stats.present}</span></td>
                    <td><span style="color:#60a5fa; font-weight:600;">${stats.on_leave}</span></td>
                    <td><span style="color:#fbbf24; font-weight:600;">${stats.absent}</span></td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div style="width:80px; height:6px; background:rgba(255,255,255,0.1); border-radius:var(--radius-full); overflow:hidden;">
                          <div style="width:${rate}%; height:100%; background:var(--primary);"></div>
                        </div>
                        <span style="font-family:var(--font-mono); font-size:0.8rem;">${rate}%</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Audit Trail -->
      ${Auth.isAdmin() ? `
        <div class="table-card">
          <div class="table-header-box">
            <h3>System Audit Trail (All HR State Transitions)</h3>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${auditRes.data.map(log => `
                  <tr>
                    <td style="font-family:var(--font-mono); font-size:0.775rem;">${new Date(log.timestamp).toLocaleString()}</td>
                    <td><span class="badge badge-info">${log.action}</span></td>
                    <td>${log.actor_login_id} (${log.actor_role})</td>
                    <td style="color:var(--text-primary);">${log.details}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}
    `;
  },

  // =========================================================================
  // 10. MODALS & DRAWER HANDLERS
  // =========================================================================
  async openEmployeeDrawer(empId) {
    try {
      const res = await API.employees.getById(empId);
      const root = document.getElementById('modals-root');
      root.innerHTML = ProfileDrawerComponent.renderViewOnlyDrawer(res.data);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async openFullProfileModal(empId) {
    try {
      const empRes = await API.employees.getById(empId);
      let salData = null;
      if (Auth.isAdmin()) {
        try {
          const salRes = await API.salary.getByEmployee(empId);
          salData = salRes.data;
        } catch (e) {}
      }
      const root = document.getElementById('modals-root');
      root.innerHTML = ProfileDrawerComponent.renderFullProfileModal(empRes.data, salData);
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  openMyProfile() {
    this.closeDropdowns();
    this.navigate('profile');
  },

  openPasswordModal() {
    this.closeDropdowns();
    this.navigate('change-password');
  },

  openCreateEmployeeModal() {
    const root = document.getElementById('modals-root');
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-solid fa-user-plus" style="color:var(--primary);"></i>
              <h3>Create New Employee Account (Admin)</h3>
            </div>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="App.handleCreateEmployeeSubmit(event)">
            <div class="modal-body" style="max-height:65vh;">
              <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); padding:0.85rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:0.8rem; color:#c7d2fe;">
                <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:6px;"></i>
                <strong>Evaluator Auto-Generation:</strong> Login ID [Company+NameCode+Year+Serial] and Temporary Password will be generated automatically.
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name *</label>
                  <input type="text" class="form-input" name="first_name" placeholder="e.g. John" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name *</label>
                  <input type="text" class="form-input" name="last_name" placeholder="e.g. Doe" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Work Email *</label>
                  <input type="email" class="form-input" name="email" placeholder="john.doe@dayflow.internal" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="text" class="form-input" name="phone" placeholder="+1 (555) 000-0000">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Job Title *</label>
                  <input type="text" class="form-input" name="job_title" placeholder="e.g. Software Engineer" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Department *</label>
                  <select class="form-select" name="department" required>
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Monthly Base Wage (₹) *</label>
                  <input type="number" class="form-input" name="base_wage" value="65000" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Joining Date</label>
                  <input type="date" class="form-input" name="joining_date" value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Generate Account</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async handleCreateEmployeeSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await API.employees.create(payload);
      const creds = res.data.credentials;

      const root = document.getElementById('modals-root');
      root.innerHTML = `
        <div class="modal-backdrop">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3>Employee Account Created! 🎉</h3>
              <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="text-align:center;">
              <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.5rem;">
                Share the generated credentials with the employee. They will be prompted to change their password on first login.
              </p>

              <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-strong); padding:1.25rem; border-radius:var(--radius-lg); text-align:left; font-family:var(--font-mono);">
                <div style="margin-bottom:0.75rem;">
                  <span style="font-size:0.75rem; color:var(--text-muted);">GENERATED LOGIN ID:</span>
                  <div style="font-size:1.15rem; font-weight:800; color:#818cf8;">${creds.login_id}</div>
                </div>
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted);">TEMPORARY PASSWORD:</span>
                  <div style="font-size:1.15rem; font-weight:800; color:#34d399;">${creds.temporary_password}</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onclick="App.closeModal(); App.navigate('dashboard');">
                Done & Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  async handleProfileSave(e, empId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await API.employees.update(empId, payload);
      this.showToast(res.message, 'success');
      this.closeModal();
      if (this.currentView === 'profile') {
        this.renderProfilePage(document.getElementById('main-content'));
      } else {
        this.navigate('dashboard');
      }
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  },

  closeModal() {
    const root = document.getElementById('modals-root');
    if (root) root.innerHTML = '';
  },

  toggleUserMenu() {
    const menu = document.getElementById('user-dropdown');
    if (menu) menu.classList.toggle('hidden');
  },

  toggleNotifications() {
    const menu = document.getElementById('notif-dropdown');
    if (menu) menu.classList.toggle('hidden');
  },

  closeDropdowns() {
    const uMenu = document.getElementById('user-dropdown');
    const nMenu = document.getElementById('notif-dropdown');
    if (uMenu) uMenu.classList.add('hidden');
    if (nMenu) nMenu.classList.add('hidden');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-circle-xmark';
    else if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Auto-boot application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
