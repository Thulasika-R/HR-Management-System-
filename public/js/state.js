/**
 * Dayflow HRMS — Global Reactive State Bus
 */
const State = {
  currentView: 'dashboard',
  employees: [],
  todayAttendance: null,
  overviewMetrics: null,
  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  },

  async refreshEmployees() {
    try {
      const res = await API.employees.getAll();
      this.employees = res.data;
      this.emit('employees:updated', this.employees);
      return this.employees;
    } catch (err) {
      console.error('Error refreshing employees:', err);
    }
  },

  async refreshOverview() {
    try {
      const res = await API.analytics.getOverview();
      this.overviewMetrics = res.data;
      this.emit('overview:updated', this.overviewMetrics);
      return this.overviewMetrics;
    } catch (err) {
      console.error('Error refreshing overview:', err);
    }
  },

  async refreshTodayAttendance() {
    try {
      const res = await API.attendance.getTodayStatus();
      this.todayAttendance = res.data;
      this.emit('attendance:updated', this.todayAttendance);
      return this.todayAttendance;
    } catch (err) {
      console.error('Error refreshing attendance status:', err);
    }
  }
};
