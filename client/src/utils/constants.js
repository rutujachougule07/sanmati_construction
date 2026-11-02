// SANMATI CONSTRUCTIONS ERP - System Constants

export const COMPANY_DETAILS = {
  name: "SANMATI CONSTRUCTIONS",
  tagline: "Quality Construction & Infrastructure Development",
  address: "Shop No. 4, Royal Plaza, Station Road, Kolhapur, Maharashtra 416001, India",
  city: "Kolhapur",
  state: "Maharashtra",
  pincode: "416001",
  country: "India",
  gstin: "27AAYCS9281Q1ZU",
  pan: "AAYCS9281Q",
  phone: "+91 98220 12345 / 0231-2654321",
  email: "contact@sanmaticonstructions.com",
  website: "www.sanmaticonstructions.com"
};

export const USER_ROLES = {
  SUPER_ADMIN: "Super Admin / Owner",
  PROJECT_MANAGER: "Project Manager",
  SITE_ENGINEER: "Site Engineer",
  ACCOUNTANT: "Accountant",
  PURCHASE_MANAGER: "Purchase Manager",
  STOREKEEPER: "Storekeeper",
  HR_MANAGER: "HR Manager",
  EMPLOYEE: "Employee"
};

export const MODULES_CONFIG = [
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: Object.values(USER_ROLES) },
  { id: 'projects', name: 'Projects & Execution', path: '/projects', icon: 'HardHat', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.SITE_ENGINEER] },
  { id: 'crm', name: 'CRM & Clients', path: '/crm', icon: 'Users', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER] },
  { id: 'quotations', name: 'Quotations', path: '/quotations', icon: 'FileSpreadsheet', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNTANT] },
  { id: 'tenders', name: 'Tender Management', path: '/tenders', icon: 'Gavel', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER] },
  { id: 'budgets', name: 'Budget Management', path: '/budgets', icon: 'PieChart', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNTANT] },
  { id: 'inventory', name: 'Inventory & Store', path: '/inventory', icon: 'Boxes', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PURCHASE_MANAGER, USER_ROLES.STOREKEEPER, USER_ROLES.SITE_ENGINEER] },
  { id: 'vendors', name: 'Vendor Management', path: '/vendors', icon: 'Truck', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PURCHASE_MANAGER, USER_ROLES.ACCOUNTANT] },
  { id: 'accounts', name: 'Accounts & Ledger', path: '/accounts', icon: 'Landmark', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNTANT] },
  { id: 'expenses', name: 'Expenses & Claims', path: '/expenses', icon: 'Receipt', roles: Object.values(USER_ROLES) },
  { id: 'gst', name: 'GST & Taxation', path: '/gst', icon: 'Percent', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNTANT] },
  { id: 'tally', name: 'Tally Integration', path: '/tally', icon: 'ArrowLeftRight', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ACCOUNTANT] },
  { id: 'geotracking', name: 'GPS Tracking & Geofence', path: '/geotracking', icon: 'MapPin', roles: Object.values(USER_ROLES) },
  { 
    id: 'hrms', 
    name: 'HRMS & Payroll', 
    path: '/hrms', 
    icon: 'UserCheck', 
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.HR_MANAGER, USER_ROLES.EMPLOYEE],
    subcategories: [
      { id: 'records', name: 'i. Employee records', path: '/hrms?tab=records', icon: 'Users', tab: 'records' },
      { id: 'attendance', name: 'ii. Attendance management', path: '/hrms?tab=attendance', icon: 'Calendar', tab: 'attendance' },
      { id: 'salary', name: 'iii. Salary calculation', path: '/hrms?tab=salary', icon: 'Calculator', tab: 'salary' },
      { id: 'payslips', name: 'iv. Payslip generation', path: '/hrms?tab=payslips', icon: 'FileText', tab: 'payslips' }
    ]
  },
  { id: 'approvals', name: 'Approval Workflows', path: '/approvals', icon: 'CheckSquare', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.PURCHASE_MANAGER, USER_ROLES.HR_MANAGER] },
  { id: 'bi', name: 'Business Intelligence', path: '/bi', icon: 'TrendingUp', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER] },
  { id: 'mis', name: 'MIS Reports', path: '/mis', icon: 'BarChart3', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNTANT] },
  { id: 'reports', name: 'Custom Reports Builder', path: '/reports', icon: 'FileText', roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.ACCOUNTANT, USER_ROLES.HR_MANAGER] },
  { id: 'roles', name: 'Role & User Access', path: '/roles', icon: 'ShieldCheck', roles: [USER_ROLES.SUPER_ADMIN] }
];

export const CONSTRUCTION_ACTIVITIES = [
  "Excavation",
  "Foundation",
  "RCC work",
  "Brickwork",
  "Plastering",
  "Flooring",
  "Electrical work",
  "Plumbing",
  "Painting",
  "Final handover"
];

export const APPROVAL_TYPES = {
  QUOTATION: "Quotation",
  TENDER: "Tender",
  PURCHASE_ORDER: "Purchase order",
  MATERIAL_REQUEST: "Material request",
  EXPENSE: "Expense",
  BUDGET: "Budget",
  RA_BILL: "RA bill",
  VENDOR_PAYMENT: "Vendor payment",
  LEAVE_REQUEST: "Leave request"
};

export const APPROVAL_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};
