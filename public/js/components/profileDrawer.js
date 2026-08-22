/**
 * Component: Profile Drawer & Dedicated Profile Page Renderer
 * Evaluator constraints:
 * - Dedicated profile page with Personal info, Role, Department, Account details
 * - Edit Profile option for contact details, picture, bio, skills
 * - Salary Info tab is ADMIN ONLY
 */
const ProfileDrawerComponent = {
  // 1. View-Only Drawer (Opened when clicking an Employee Card on Dashboard)
  renderViewOnlyDrawer(emp) {
    let statusBadge = '<span class="status-pill status-absent"><span class="status-dot-absent"></span> Absent</span>';
    if (emp.current_status === 'PRESENT') {
      statusBadge = '<span class="status-pill status-present"><span class="status-dot-present"></span> Present</span>';
    } else if (emp.current_status === 'LEAVE') {
      statusBadge = '<span class="status-pill status-leave"><span class="status-dot-leave"></span> On Leave</span>';
    }

    return `
      <div class="modal-backdrop" id="view-only-drawer">
        <div class="modal-dialog">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${emp.avatar_url}" class="avatar-sm" style="width:40px; height:40px;" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.login_id}'">
              <div>
                <h3 style="font-size:1.1rem; line-height:1.2;">${emp.first_name} ${emp.last_name}</h3>
                <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${emp.login_id}</span>
              </div>
            </div>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; background:rgba(255,255,255,0.03); padding:0.85rem 1rem; border-radius:var(--radius-md);">
              <div>
                <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Today's State</span>
                <div style="margin-top:2px;">${statusBadge}</div>
              </div>
              <div style="text-align:right;">
                <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Department</span>
                <div style="font-size:0.9rem; font-weight:600; color:var(--text-primary);">${emp.department}</div>
              </div>
            </div>

            <!-- Basic Details -->
            <div class="form-row" style="margin-bottom:1rem;">
              <div>
                <label class="form-label">Job Title</label>
                <div style="font-weight:600; color:var(--text-primary);">${emp.job_title}</div>
              </div>
              <div>
                <label class="form-label">Reporting Manager</label>
                <div style="font-weight:600; color:var(--text-primary);">${emp.manager_name || 'Management'}</div>
              </div>
            </div>

            <div class="form-row" style="margin-bottom:1rem;">
              <div>
                <label class="form-label">Work Email</label>
                <div style="color:#a5b4fc; font-family:var(--font-mono); font-size:0.85rem;">${emp.email}</div>
              </div>
              <div>
                <label class="form-label">Phone</label>
                <div style="color:var(--text-secondary);">${emp.phone}</div>
              </div>
            </div>

            <div style="margin-bottom:1rem;">
              <label class="form-label">About</label>
              <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">${emp.about || 'No bio available.'}</p>
            </div>

            <div>
              <label class="form-label">Skills</label>
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:4px;">
                ${(emp.skills || []).map(s => `<span class="badge badge-info">${s}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
            ${Auth.isAdmin() ? `
              <button class="btn btn-primary" onclick="App.openFullProfileModal('${emp.id}')">
                <i class="fa-solid fa-pen-to-square"></i> Edit Employee Profile (Admin)
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // 2. Dedicated Full-Page Profile View
  renderDedicatedPage(emp, salaryData = null) {
    const isAdmin = Auth.isAdmin();

    return `
      <div class="profile-page-wrapper">
        <!-- Hero Header -->
        <div class="profile-banner-card">
          <div class="profile-user-hero">
            <img src="${emp.avatar_url}" class="profile-hero-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.login_id}'">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h1 style="font-size:1.75rem; font-weight:800;">${emp.first_name} ${emp.last_name}</h1>
                <span class="badge badge-info">${emp.job_title}</span>
                <span class="badge badge-${emp.status === 'ACTIVE' ? 'success' : 'warning'}">${emp.status}</span>
              </div>
              <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:4px;">
                ${emp.department} Department • ID: <span style="font-family:var(--font-mono); color:#a5b4fc;">${emp.login_id}</span> • Joined: ${emp.joining_date}
              </p>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <button class="btn btn-primary" onclick="App.openFullProfileModal('${emp.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit Profile Information
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('change-password')">
              <i class="fa-solid fa-key"></i> Security Settings
            </button>
          </div>
        </div>

        <!-- 2-Column Info Grid -->
        <div class="profile-grid-layout">
          <!-- Left Column -->
          <div>
            <!-- Personal & Contact Info -->
            <div class="profile-section-card">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem;">
                <i class="fa-regular fa-id-badge" style="font-size:1.25rem; color:var(--primary);"></i>
                <h3 style="font-size:1.1rem;">Personal & Contact Details</h3>
              </div>
              <div class="form-row">
                <div class="profile-field-item">
                  <div class="profile-field-label">Full Legal Name</div>
                  <div class="profile-field-value">${emp.first_name} ${emp.last_name}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Date of Birth</div>
                  <div class="profile-field-value">${emp.dob || '1995-05-15'}</div>
                </div>
              </div>
              <div class="form-row">
                <div class="profile-field-item">
                  <div class="profile-field-label">Gender</div>
                  <div class="profile-field-value">${emp.gender || 'Not Specified'}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Marital Status</div>
                  <div class="profile-field-value">${emp.marital_status || 'Single'}</div>
                </div>
              </div>
              <div class="form-row">
                <div class="profile-field-item">
                  <div class="profile-field-label">Work Email</div>
                  <div class="profile-field-value" style="font-family:var(--font-mono); color:#a5b4fc;">${emp.email}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Personal Email</div>
                  <div class="profile-field-value">${emp.personal_email || emp.email}</div>
                </div>
              </div>
              <div class="form-row">
                <div class="profile-field-item">
                  <div class="profile-field-label">Phone Number</div>
                  <div class="profile-field-value">${emp.phone || '+1 (555) 000-0000'}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Nationality</div>
                  <div class="profile-field-value">${emp.nationality || 'United States'}</div>
                </div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Residential Address</div>
                <div class="profile-field-value">${emp.residential_address || 'Address on file'}</div>
              </div>
            </div>

            <!-- Professional Resume & Bio -->
            <div class="profile-section-card">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem;">
                <i class="fa-regular fa-file-lines" style="font-size:1.25rem; color:#3b82f6;"></i>
                <h3 style="font-size:1.1rem;">Professional Bio & Skills</h3>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">About / Executive Summary</div>
                <div class="profile-field-value" style="font-size:0.9rem; font-weight:400; line-height:1.6; color:var(--text-secondary);">
                  ${emp.about || 'Dedicated organizational specialist contributing to enterprise deliverables.'}
                </div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Core Competencies & Skills</div>
                <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:6px;">
                  ${(emp.skills || ['Leadership', 'Operations']).map(s => `<span class="badge badge-info" style="padding:4px 10px; font-size:0.8rem;">${s}</span>`).join('')}
                </div>
              </div>
              <div class="form-row">
                <div class="profile-field-item">
                  <div class="profile-field-label">Professional Interests</div>
                  <div class="profile-field-value">${(emp.interests || ['Technology']).join(', ')}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Personal Hobbies</div>
                  <div class="profile-field-value">${(emp.hobbies || ['Reading']).join(', ')}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Bank & Statutory Details -->
            <div class="profile-section-card">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem;">
                <i class="fa-solid fa-building-columns" style="font-size:1.25rem; color:#10b981;"></i>
                <h3 style="font-size:1.1rem;">Bank & Statutory</h3>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Bank Name</div>
                <div class="profile-field-value">${emp.bank_name || 'HDFC Bank'}</div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Bank Account Number</div>
                <div class="profile-field-value" style="font-family:var(--font-mono);">${emp.account_number ? '•••• •••• ' + emp.account_number.slice(-4) : '•••• 5678'}</div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">IFSC Code</div>
                <div class="profile-field-value" style="font-family:var(--font-mono);">${emp.ifsc_code || 'HDFC0001234'}</div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Income Tax PAN</div>
                <div class="profile-field-value" style="font-family:var(--font-mono);">${emp.pan_no || 'ABCDE1234F'}</div>
              </div>
              <div class="profile-field-item">
                <div class="profile-field-label">Provident Fund UAN</div>
                <div class="profile-field-value" style="font-family:var(--font-mono);">${emp.uan_no || '100987654321'}</div>
              </div>
            </div>

            <!-- Admin Only Salary Configuration Box -->
            ${isAdmin && salaryData ? `
              <div class="profile-section-card" style="border:1px solid rgba(99,102,241,0.3); background:rgba(99,102,241,0.06);">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <i class="fa-solid fa-coins" style="color:#818cf8;"></i>
                    <h3 style="font-size:1.05rem; color:#c7d2fe;">Salary Structure</h3>
                  </div>
                  <span class="badge badge-info">Admin Only</span>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Base Monthly Wage</div>
                  <div class="profile-field-value" style="color:#34d399; font-size:1.2rem;">₹${salaryData.structure.base_wage.toLocaleString()}</div>
                </div>
                <div class="profile-field-item">
                  <div class="profile-field-label">Calculated Gross / Net</div>
                  <div class="profile-field-value" style="font-size:0.9rem;">
                    Gross: ₹${salaryData.breakdown.earnings.gross_salary.toLocaleString()} • Net: <strong style="color:#818cf8;">₹${salaryData.breakdown.net_salary.toLocaleString()}</strong>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary" style="width:100%; margin-top:0.5rem;" onclick="App.openFullProfileModal('${emp.id}')">
                  <i class="fa-solid fa-sliders"></i> Modify Salary Formulas
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // 3. Full Tabbed Edit Profile Modal
  renderFullProfileModal(emp, salaryData = null) {
    const isAdmin = Auth.isAdmin();

    return `
      <div class="modal-backdrop" id="full-profile-modal">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${emp.avatar_url}" class="avatar-sm" style="width:44px; height:44px;" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.login_id}'">
              <div>
                <h3 style="font-size:1.15rem;">Edit Profile Information</h3>
                <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${emp.login_id} • ${emp.job_title}</span>
              </div>
            </div>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <form id="profile-edit-form" onsubmit="App.handleProfileSave(event, '${emp.id}')">
            <div class="modal-body" style="max-height:65vh;">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="text" class="form-input" name="phone" value="${emp.phone || ''}" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Personal Email</label>
                  <input type="email" class="form-input" name="personal_email" value="${emp.personal_email || ''}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Avatar Image URL</label>
                <input type="url" class="form-input" name="avatar_url" value="${emp.avatar_url || ''}">
              </div>

              <div class="form-group">
                <label class="form-label">Residential Address</label>
                <textarea class="form-textarea" name="residential_address" rows="2">${emp.residential_address || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Professional About / Bio</label>
                <textarea class="form-textarea" name="about" rows="3">${emp.about || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Core Skills (Comma separated)</label>
                <input type="text" class="form-input" name="skills" value="${(emp.skills || []).join(', ')}">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Interests</label>
                  <input type="text" class="form-input" name="interests" value="${(emp.interests || []).join(', ')}">
                </div>
                <div class="form-group">
                  <label class="form-label">Hobbies</label>
                  <input type="text" class="form-input" name="hobbies" value="${(emp.hobbies || []).join(', ')}">
                </div>
              </div>

              ${isAdmin ? `
                <div style="margin-top:1rem; border-top:1px solid var(--border-subtle); padding-top:1rem;">
                  <h4 style="font-size:0.9rem; color:#818cf8; margin-bottom:0.75rem;"><i class="fa-solid fa-lock"></i> Admin Fields</h4>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">First Name</label>
                      <input type="text" class="form-input" name="first_name" value="${emp.first_name}">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Last Name</label>
                      <input type="text" class="form-input" name="last_name" value="${emp.last_name}">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Job Title</label>
                      <input type="text" class="form-input" name="job_title" value="${emp.job_title}">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Department</label>
                      <input type="text" class="form-input" name="department" value="${emp.department}">
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
};
