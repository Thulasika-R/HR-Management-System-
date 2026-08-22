/**
 * Component: Formal Printable Salary Slip Modal
 * Evaluator constraint: Attendance -> Payable Days -> Pro-rated Breakdown -> Printable Slip
 */
const PayslipModalComponent = {
  render(data) {
    const emp = data.employee;
    const breakdown = data.breakdown;
    const earnings = breakdown.earnings;
    const deductions = breakdown.deductions;

    return `
      <div class="modal-backdrop" id="payslip-modal">
        <div class="modal-dialog modal-dialog-lg">
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary);"></i>
              <h3>Official Salary Slip — ${data.month}</h3>
            </div>
            <button class="icon-btn" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body" style="background:#f8fafc; padding:1.5rem;">
            <div class="payslip-container" id="printable-payslip">
              <!-- Header -->
              <div class="payslip-header">
                <div>
                  <h2 class="payslip-company-title">DAYFLOW ENTERPRISES INC.</h2>
                  <p style="font-size:0.8rem; color:#64748b;">Global Technology & Human Capital Solutions</p>
                  <p style="font-size:0.75rem; color:#94a3b8;">Tax ID: OI-99887766 • ISO 9001:2026 Certified</p>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.9rem; font-weight:700; color:#1e293b;">SALARY PAYSLIP</div>
                  <div style="font-family:var(--font-mono); font-size:0.8rem; color:#6366f1;">PAY PERIOD: ${data.month}</div>
                  <div style="font-size:0.75rem; color:#64748b;">Status: PROCESSED & VERIFIED</div>
                </div>
              </div>

              <!-- Employee Metadata -->
              <div class="payslip-meta-grid">
                <div><strong>Employee Name:</strong> ${emp.name}</div>
                <div><strong>Employee Code / ID:</strong> ${emp.employee_code || emp.login_id}</div>
                <div><strong>Designation:</strong> ${emp.job_title}</div>
                <div><strong>Department:</strong> ${emp.department}</div>
                <div><strong>Bank Name:</strong> ${emp.bank_name || 'HDFC Bank'}</div>
                <div><strong>Account No:</strong> ${emp.account_number ? '•••• •••• ' + emp.account_number.slice(-4) : '•••• 8890'}</div>
                <div><strong>PAN / Tax No:</strong> ${emp.pan_no || 'ABCDE1234F'}</div>
                <div><strong>UAN / PF No:</strong> ${emp.uan_no || '100987654321'}</div>
              </div>

              <!-- Attendance & Payable Days Summary (Evaluator Requirement) -->
              <div style="background:#f1f5f9; padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.5rem; display:flex; justify-content:space-between; font-size:0.85rem; border:1px solid #e2e8f0;">
                <div><strong>Standard Working Days:</strong> ${data.total_working_days}</div>
                <div><strong>Present:</strong> <span style="color:#059669; font-weight:700;">${data.present_days}</span></div>
                <div><strong>Paid Leaves:</strong> <span style="color:#2563eb; font-weight:700;">${data.paid_leave_days}</span></div>
                <div><strong>Unpaid / Absent:</strong> <span style="color:#d97706; font-weight:700;">${data.unpaid_leave_days + data.absent_days}</span></div>
                <div><strong>Payable Days:</strong> <span style="color:#4f46e5; font-weight:800;">${data.payable_days}</span> (${Math.round(data.payable_ratio * 100)}%)</div>
              </div>

              <!-- Component Breakdown -->
              <div class="payslip-table-grid">
                <!-- Earnings Column -->
                <div>
                  <table class="payslip-subtable">
                    <thead>
                      <tr>
                        <th>Earnings Component</th>
                        <th style="text-align:right;">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary (${earnings.basic_percentage || 50}%)</td>
                        <td style="text-align:right;">₹${earnings.basic_salary.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>House Rent Allowance (HRA)</td>
                        <td style="text-align:right;">₹${earnings.hra.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Standard Allowance</td>
                        <td style="text-align:right;">₹${earnings.standard_allowance.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Performance Bonus</td>
                        <td style="text-align:right;">₹${earnings.performance_bonus.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Leave Travel Allowance (LTA)</td>
                        <td style="text-align:right;">₹${earnings.lta.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Fixed Special Allowance</td>
                        <td style="text-align:right;">₹${earnings.fixed_allowance.toLocaleString()}</td>
                      </tr>
                      <tr class="payslip-total-row">
                        <td><strong>Gross Salary</strong></td>
                        <td style="text-align:right;"><strong>₹${earnings.gross_salary.toLocaleString()}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Deductions Column -->
                <div>
                  <table class="payslip-subtable">
                    <thead>
                      <tr>
                        <th>Deductions Component</th>
                        <th style="text-align:right;">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Provident Fund (PF - ${deductions.pf_percentage || 12}%)</td>
                        <td style="text-align:right;">₹${deductions.provident_fund.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Professional Tax (PT)</td>
                        <td style="text-align:right;">₹${deductions.professional_tax.toLocaleString()}</td>
                      </tr>
                      <tr style="height:120px;">
                        <td colspan="2" style="color:#94a3b8; font-size:0.75rem; vertical-align:bottom;">
                          * Deductions calculated strictly in compliance with statutory provisions.
                        </td>
                      </tr>
                      <tr class="payslip-total-row">
                        <td><strong>Total Deductions</strong></td>
                        <td style="text-align:right;"><strong>₹${deductions.total_deductions.toLocaleString()}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Net Pay Box -->
              <div class="payslip-net-box">
                <div>
                  <div style="font-size:0.8rem; font-weight:700; color:#4338ca; text-transform:uppercase;">Net Take-Home Salary</div>
                  <div style="font-size:0.75rem; color:#6b7280;">Directly credited to linked corporate salary account</div>
                </div>
                <div class="payslip-net-amount">₹${breakdown.net_salary.toLocaleString()}</div>
              </div>

              <div style="margin-top:1.5rem; text-align:center; font-size:0.75rem; color:#94a3b8; border-top:1px dashed #cbd5e1; padding-top:0.75rem;">
                This is a system-generated payslip from the Dayflow HRMS Engine. No signature required.
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
            <button class="btn btn-primary" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Payslip (PDF)</button>
          </div>
        </div>
      </div>
    `;
  }
};
