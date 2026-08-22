/**
 * Dayflow HRMS — Client API Client
 */
const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('dayflow_token');
    const headers = {
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (response.status === 401) {
        // Session expired
        if (window.Auth && !endpoint.includes('/auth/login')) {
          Auth.logout('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  auth: {
    login: (login_id, password) => API.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login_id, password })
    }),
    changePassword: (current_password, new_password) => API.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    }),
    me: () => API.request('/auth/me')
  },

  // Employees Endpoints
  employees: {
    getAll: () => API.request('/employees'),
    getById: (id) => API.request(`/employees/${id}`),
    create: (empData) => API.request('/employees', {
      method: 'POST',
      body: JSON.stringify(empData)
    }),
    update: (id, empData) => API.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(empData)
    })
  },

  // Attendance Endpoints
  attendance: {
    checkIn: () => API.request('/attendance/check-in', { method: 'POST' }),
    checkOut: (break_hours = 0) => API.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ break_hours })
    }),
    getTodayStatus: () => API.request('/attendance/today-status'),
    getMyLogs: (month) => API.request(`/attendance/my-logs${month ? `?month=${month}` : ''}`),
    getAll: (date, department) => API.request(`/attendance/all?date=${date || ''}&department=${department || ''}`)
  },

  // Time-Off Endpoints
  timeoff: {
    getMyRequests: () => API.request('/timeoff/my-requests'),
    submitRequest: (formData) => API.request('/timeoff/request', {
      method: 'POST',
      body: formData
    }),
    getAllRequests: (status) => API.request(`/timeoff/all-requests${status ? `?status=${status}` : ''}`),
    actionRequest: (request_id, action, admin_remarks) => API.request('/timeoff/action', {
      method: 'POST',
      body: JSON.stringify({ request_id, action, admin_remarks })
    })
  },

  // Salary Configuration Endpoints (Admin Only)
  salary: {
    getByEmployee: (empId) => API.request(`/salary/${empId}`),
    update: (empId, structureData) => API.request(`/salary/${empId}`, {
      method: 'PUT',
      body: JSON.stringify(structureData)
    })
  },

  // Payroll Integration Endpoints
  payroll: {
    calculate: (empId, month) => API.request(`/payroll/calculate?employee_id=${empId || ''}&month=${month || ''}`),
    getSummary: (month) => API.request(`/payroll/summary?month=${month || ''}`),
    processRun: (month) => API.request('/payroll/process', {
      method: 'POST',
      body: JSON.stringify({ month })
    })
  },

  // Analytics & Anomaly Detection Endpoints
  analytics: {
    getOverview: () => API.request('/analytics/overview'),
    getAuditLogs: (limit = 50) => API.request(`/analytics/audit-logs?limit=${limit}`),
    getNotifications: () => API.request('/analytics/notifications')
  }
};
