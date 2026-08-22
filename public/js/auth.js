/**
 * Dayflow HRMS — Authentication & Session Manager
 */
const Auth = {
  user: null,
  employee: null,
  token: null,

  init() {
    this.token = localStorage.getItem('dayflow_token');
    const storedUser = localStorage.getItem('dayflow_user');
    const storedEmp = localStorage.getItem('dayflow_emp');

    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (storedEmp) {
      try {
        this.employee = JSON.parse(storedEmp);
      } catch (e) {}
    }
  },

  isAuthenticated() {
    return !!this.token && !!this.user;
  },

  isAdmin() {
    return this.user && this.user.role === 'ADMIN';
  },

  setSession(token, user, employee) {
    this.token = token;
    this.user = user;
    this.employee = employee;

    localStorage.setItem('dayflow_token', token);
    localStorage.setItem('dayflow_user', JSON.stringify(user));
    if (employee) {
      localStorage.setItem('dayflow_emp', JSON.stringify(employee));
    } else {
      localStorage.removeItem('dayflow_emp');
    }
  },

  logout(reason) {
    this.token = null;
    this.user = null;
    this.employee = null;

    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    localStorage.removeItem('dayflow_emp');

    if (reason && window.App) {
      App.showToast(reason, 'info');
    }

    if (window.App) {
      App.renderLogin();
    }
  }
};

Auth.init();
