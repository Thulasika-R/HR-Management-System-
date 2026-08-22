const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('../config');
const arcfaceEngine = require('../services/arcfaceEngine');

// Ensure data and upload directories exist
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
}
if (!fs.existsSync(config.UPLOADS_DIR)) {
  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.join(config.DATA_DIR, 'dayflow_db.json');

// Master Leave Policies Definition (All 10 Expanded Types)
const LEAVE_TYPES_POLICY = [
  {
    type: 'SICK',
    name: 'Sick Leave',
    description: 'For recovery from medical illness, injury, or clinical consultation.',
    quota: 12,
    carry_forward: true,
    max_carry_forward: 6,
    approval_hierarchy: 'Reporting Manager -> HR Dept',
    requires_attachment_after_days: 3,
    is_paid: true,
    icon: 'fa-solid fa-stethoscope',
    color: '#3b82f6'
  },
  {
    type: 'CASUAL',
    name: 'Casual Leave',
    description: 'For unforeseen personal matters, urgent family requirements, or short breaks.',
    quota: 12,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Reporting Manager',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-coffee',
    color: '#10b981'
  },
  {
    type: 'EARNED',
    name: 'Earned / Privilege Leave',
    description: 'Accrued annual leave for planned vacation, rest, and personal rejuvenation.',
    quota: 18,
    carry_forward: true,
    max_carry_forward: 30,
    approval_hierarchy: 'Reporting Manager -> HR Dept',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-umbrella-beach',
    color: '#8b5cf6'
  },
  {
    type: 'MATERNITY',
    name: 'Maternity Leave',
    description: 'Statutory leave for biological mothers for prenatal, childbirth, and postnatal care.',
    quota: 182, // 26 weeks
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'HR Operations -> Medical Verification',
    requires_attachment_after_days: 1,
    is_paid: true,
    icon: 'fa-solid fa-baby',
    color: '#ec4899'
  },
  {
    type: 'PATERNITY',
    name: 'Paternity Leave',
    description: 'Leave for fathers upon the birth or legal adoption of a child.',
    quota: 15,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Reporting Manager -> HR Dept',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-person-breastfeeding',
    color: '#06b6d4'
  },
  {
    type: 'BEREAVEMENT',
    name: 'Bereavement Leave',
    description: 'Compassionate leave granted upon the loss of an immediate family member.',
    quota: 5,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Reporting Manager -> HR Notification',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-hands-holding-circle',
    color: '#64748b'
  },
  {
    type: 'COMP_OFF',
    name: 'Compensatory Off',
    description: 'Credit leave earned for working on designated weekends, holidays, or overtime shifts.',
    quota: 8,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Project Lead -> HR Dept',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-clock-rotate-left',
    color: '#f59e0b'
  },
  {
    type: 'UNPAID',
    name: 'Unpaid Leave / LWP',
    description: 'Leave without pay when all accrued paid leave balances have been exhausted.',
    quota: 30,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Department Head -> HR Operations',
    requires_attachment_after_days: null,
    is_paid: false,
    icon: 'fa-solid fa-ban',
    color: '#ef4444'
  },
  {
    type: 'WFH',
    name: 'Work From Home / Remote',
    description: 'Permission to fulfill duties remotely away from primary office premises.',
    quota: 24,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Reporting Manager',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-laptop-house',
    color: '#6366f1'
  },
  {
    type: 'HALF_DAY',
    name: 'Half-Day Leave',
    description: 'Half-day absence for Morning (9am-1pm) or Afternoon (2pm-6pm) sessions.',
    quota: 10,
    carry_forward: false,
    max_carry_forward: 0,
    approval_hierarchy: 'Reporting Manager',
    requires_attachment_after_days: null,
    is_paid: true,
    icon: 'fa-solid fa-hourglass-half',
    color: '#14b8a6'
  }
];

class Database {
  constructor() {
    this.data = {
      users: [],
      employees: [],
      attendance: [],
      leave_allocations: [],
      leave_requests: [],
      salary_structures: [],
      payroll_runs: [],
      audit_logs: [],
      notifications: [],
      leave_policies: LEAVE_TYPES_POLICY
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.data.leave_policies = LEAVE_TYPES_POLICY;
        console.log('[DB] Loaded existing database from disk');
      } else {
        console.log('[DB] Initializing and seeding fresh database...');
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error loading DB:', err);
      this.seedInitialData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving DB:', err);
    }
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const empPasswordHash = bcrypt.hashSync('welcome123', salt);

    // 1. Master Admin Employee Profile (Fully populated)
    const adminEmployee = {
      id: 'emp_admin',
      login_id: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      email: 'admin@dayflow.internal',
      phone: '+1 (555) 019-9000',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      job_title: 'Chief Human Resources & Security Officer',
      department: 'Executive Leadership',
      manager_name: 'Board of Directors',
      joining_date: '2020-01-01',
      status: 'ACTIVE',
      about: 'Executive Lead overseeing organizational talent topology, enterprise security policies, and AI workforce systems.',
      skills: ['Executive HR Leadership', 'ArcFace Biometric Security', 'Enterprise RBAC', 'Payroll Architecture', 'Statutory Compliance'],
      certifications: ['Chief HR Officer (CHRO) Certified', 'CISSP Security Professional'],
      interests: ['AI Biometrics', 'Organizational Scaling', 'Enterprise Architecture'],
      hobbies: ['Chess', 'Strategic Gaming', 'Aviation'],
      dob: '1985-04-10',
      residential_address: '100 Executive Plaza, Penthouse Suite, Tech District',
      nationality: 'United States',
      personal_email: 'admin.executive@dayflow.internal',
      gender: 'Other',
      marital_status: 'Married',
      bank_name: 'Federal Executive Reserve Bank',
      account_number: '990011223344',
      ifsc_code: 'FERB0001001',
      pan_no: 'ADMNX9900Z',
      uan_no: '100000000001',
      employee_code: 'OI-EXEC-000',
      face_enrolled: true,
      face_embedding: arcfaceEngine.generateSimulatedEmbedding('emp_admin')
    };

    // 2. Admin User Account linked to emp_admin
    const adminUser = {
      id: 'usr_admin_001',
      login_id: 'admin',
      email: 'admin@dayflow.internal',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
      force_password_change: false,
      employee_id: 'emp_admin',
      is_active: true,
      created_at: new Date().toISOString()
    };

    // 3. Initial Sample Employees
    const sampleEmployees = [
      adminEmployee,
      {
        id: 'emp_001',
        login_id: 'OITODO20230001',
        first_name: 'Alex',
        last_name: 'Morgan',
        email: 'alex.morgan@dayflow.internal',
        phone: '+1 (555) 234-5678',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        job_title: 'Senior Software Engineer',
        department: 'Engineering',
        manager_name: 'Sarah Connor',
        joining_date: '2023-01-15',
        status: 'ACTIVE',
        about: 'Passionate full-stack systems engineer focused on distributed architectures and real-time platforms.',
        skills: ['Node.js', 'React', 'PostgreSQL', 'TypeScript', 'Docker', 'System Architecture'],
        certifications: ['AWS Certified Solutions Architect', 'Odoo Certified Developer'],
        interests: ['Distributed Systems', 'Cloud Infrastructure', 'Open Source'],
        hobbies: ['Rock Climbing', 'Chess', 'Photography'],
        dob: '1992-05-14',
        residential_address: '742 Evergreen Terrace, Tech Park, Suite 400',
        nationality: 'United States',
        personal_email: 'alex.m.private@gmail.com',
        gender: 'Male',
        marital_status: 'Married',
        bank_name: 'Silicon Valley Commercial Bank',
        account_number: '987654321098',
        ifsc_code: 'SVCB0001234',
        pan_no: 'ABCDE1234F',
        uan_no: '100987654321',
        employee_code: 'OI-ENG-001'
      },
      {
        id: 'emp_002',
        login_id: 'OISARA20220002',
        first_name: 'Sarah',
        last_name: 'Connor',
        email: 'sarah.connor@dayflow.internal',
        phone: '+1 (555) 987-6543',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
        job_title: 'Engineering Director',
        department: 'Engineering',
        manager_name: 'Executive Leadership',
        joining_date: '2022-03-10',
        status: 'ACTIVE',
        about: 'Experienced engineering leader driving high-performance teams and scalable enterprise systems.',
        skills: ['Team Leadership', 'Cloud Architecture', 'Agile Operations', 'Budgeting'],
        certifications: ['PMP', 'Scrum Master Professional'],
        interests: ['Organizational Design', 'AI Workflow Automation'],
        hobbies: ['Trail Running', 'Violin', 'Reading'],
        dob: '1986-11-20',
        residential_address: '120 Sunset Boulevard, Suite 12',
        nationality: 'United States',
        personal_email: 'sarah.c.lead@gmail.com',
        gender: 'Female',
        marital_status: 'Married',
        bank_name: 'Metro National Bank',
        account_number: '112233445566',
        ifsc_code: 'MNBK0008899',
        pan_no: 'FGHIJ5678K',
        uan_no: '100445566778',
        employee_code: 'OI-MGT-002'
      },
      {
        id: 'emp_003',
        login_id: 'OIRUDH20240003',
        first_name: 'Rudhran',
        last_name: 'Thulasi',
        email: 'rudhran.t@dayflow.internal',
        phone: '+91 98401 23456',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        job_title: 'Lead Full-Stack Architect',
        department: 'Product & Engineering',
        manager_name: 'Sarah Connor',
        joining_date: '2024-02-01',
        status: 'ACTIVE',
        about: 'Specialist in real-time HR automation engines, distributed state machines, and UX systems.',
        skills: ['Full-Stack Dev', 'State Machines', 'Payroll Logic', 'Security RBAC', 'UI Design'],
        certifications: ['Odoo Hackathon Grand Winner', 'Full Stack Specialist'],
        interests: ['Topological Data Analysis', 'Automation Engines', 'Enterprise Software'],
        hobbies: ['Badminton', 'Speed Cubing', 'Music Production'],
        dob: '1998-08-15',
        residential_address: '45 IT Expressway, Cyber Heights, OMR',
        nationality: 'Indian',
        personal_email: 'rudhran.dev@outlook.com',
        gender: 'Male',
        marital_status: 'Single',
        bank_name: 'HDFC Bank',
        account_number: '50100234567890',
        ifsc_code: 'HDFC0001234',
        pan_no: 'BNZPR9876Q',
        uan_no: '101234567890',
        employee_code: 'OI-DEV-003'
      },
      {
        id: 'emp_004',
        login_id: 'OIEMMA20240004',
        first_name: 'Emma',
        last_name: 'Watson',
        email: 'emma.watson@dayflow.internal',
        phone: '+1 (555) 443-2211',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
        job_title: 'HR & Talent Operations Lead',
        department: 'Human Resources',
        manager_name: 'Alex Morgan',
        joining_date: '2024-04-12',
        status: 'ACTIVE',
        about: 'People operations specialist specializing in performance management, onboarding, and employee happiness.',
        skills: ['Talent Acquisition', 'HR Policies', 'Conflict Resolution', 'Payroll Compliance'],
        certifications: ['SHRM-CP Certified', 'HR Analytics Professional'],
        interests: ['Workplace Culture', 'Continuous Feedback Systems'],
        hobbies: ['Baking', 'Yoga', 'Podcasting'],
        dob: '1995-03-25',
        residential_address: '88 Meadow Lane, North District',
        nationality: 'United States',
        personal_email: 'emma.w.hr@gmail.com',
        gender: 'Female',
        marital_status: 'Single',
        bank_name: 'Chase Bank',
        account_number: '334455667788',
        ifsc_code: 'CHAS0009988',
        pan_no: 'LMNOP1234Z',
        uan_no: '100887766554',
        employee_code: 'OI-HR-004'
      }
    ];

    const users = [adminUser];
    const leaveAllocations = [];
    const salaryStructures = [];
    const attendanceRecords = [];

    const todayStr = new Date().toISOString().split('T')[0];

    sampleEmployees.forEach((emp, index) => {
      emp.face_embedding = arcfaceEngine.generateSimulatedEmbedding(emp.id);
      emp.face_enrolled = true;

      if (emp.id !== 'emp_admin') {
        users.push({
          id: `usr_${emp.id}`,
          login_id: emp.login_id,
          email: emp.email,
          password_hash: empPasswordHash,
          role: 'EMPLOYEE',
          force_password_change: index === 4,
          employee_id: emp.id,
          is_active: true,
          created_at: new Date().toISOString()
        });
      }

      // 10 Expanded Leave Allocations
      leaveAllocations.push({
        id: `alloc_${emp.id}`,
        employee_id: emp.id,
        year: 2026,
        balances: {
          SICK: { total: 12, used: index === 1 ? 1 : 0 },
          CASUAL: { total: 12, used: index === 2 ? 2 : 1 },
          EARNED: { total: 18, used: index === 1 ? 3 : index === 3 ? 1 : 0 },
          MATERNITY: { total: 182, used: 0 },
          PATERNITY: { total: 15, used: 0 },
          BEREAVEMENT: { total: 5, used: 0 },
          COMP_OFF: { total: 8, used: index === 3 ? 1 : 0 },
          UNPAID: { total: 30, used: 0 },
          WFH: { total: 24, used: index === 1 ? 4 : 2 },
          HALF_DAY: { total: 10, used: 0 }
        }
      });

      // Salary Structure
      const baseWage = emp.id === 'emp_admin' ? 160000 : (index === 2 ? 120000 : index === 1 ? 95000 : index === 3 ? 105000 : 70000);
      salaryStructures.push({
        id: `sal_${emp.id}`,
        employee_id: emp.id,
        base_wage: baseWage,
        basic_percentage: 50,
        hra_percentage: 50,
        standard_allowance: 4167,
        performance_bonus: 3000,
        lta: 2500,
        fixed_allowance: 1800,
        pf_percentage: 12,
        professional_tax: 200,
        updated_at: new Date().toISOString()
      });

      // Attendance records
      if (emp.id === 'emp_admin' || index === 1) {
        attendanceRecords.push({
          id: `att_${emp.id}_today`,
          employee_id: emp.id,
          date: todayStr,
          check_in: `${todayStr}T08:30:00.000Z`,
          check_out: null,
          break_hours: 0,
          work_hours: 0,
          extra_hours: 0,
          status: 'PRESENT',
          source: 'ARCFACE_BIOMETRIC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else if (index === 2) {
        attendanceRecords.push({
          id: `att_${emp.id}_today`,
          employee_id: emp.id,
          date: todayStr,
          check_in: `${todayStr}T08:45:00.000Z`,
          check_out: `${todayStr}T17:45:00.000Z`,
          break_hours: 1,
          work_hours: 8,
          extra_hours: 0,
          status: 'PRESENT',
          source: 'PORTAL',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else if (index === 3) {
        attendanceRecords.push({
          id: `att_${emp.id}_today`,
          employee_id: emp.id,
          date: todayStr,
          check_in: null,
          check_out: null,
          break_hours: 0,
          work_hours: 0,
          extra_hours: 0,
          status: 'LEAVE',
          source: 'AUTO_LEAVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    this.data = {
      users,
      employees: sampleEmployees,
      attendance: attendanceRecords,
      leave_allocations: leaveAllocations,
      leave_requests: [],
      salary_structures: salaryStructures,
      payroll_runs: [],
      audit_logs: [
        {
          id: 'aud_001',
          action: 'SYSTEM_BOOTSTRAP',
          actor_login_id: 'system',
          actor_role: 'SYSTEM',
          details: 'Dayflow HRMS Database initialized with ArcFace AI 512-D Vision Engine and Master Admin Profile.',
          timestamp: new Date().toISOString()
        }
      ],
      notifications: [],
      leave_policies: LEAVE_TYPES_POLICY
    };
  }

  find(collectionName, predicate = () => true) {
    return (this.data[collectionName] || []).filter(predicate);
  }

  findOne(collectionName, predicate) {
    return (this.data[collectionName] || []).find(predicate) || null;
  }

  insert(collectionName, item) {
    if (!this.data[collectionName]) this.data[collectionName] = [];
    this.data[collectionName].push(item);
    this.save();
    return item;
  }

  update(collectionName, predicate, updates) {
    const item = this.findOne(collectionName, predicate);
    if (!item) return null;
    Object.assign(item, updates);
    this.save();
    return item;
  }

  delete(collectionName, predicate) {
    const initialLen = (this.data[collectionName] || []).length;
    this.data[collectionName] = (this.data[collectionName] || []).filter(item => !predicate(item));
    const deleted = initialLen !== this.data[collectionName].length;
    if (deleted) this.save();
    return deleted;
  }
}

const db = new Database();
module.exports = db;
