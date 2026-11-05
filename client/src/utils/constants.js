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
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: 'LayoutDashboard', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'crm', 
    name: '1. CRM Management', 
    path: '/crm', 
    icon: 'Users', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'crm-details', name: 'i. Customer details management', path: '/crm?tab=customers', icon: 'UserCheck', tab: 'customers' },
      { id: 'crm-leads', name: 'ii. Lead management', path: '/crm?tab=leads', icon: 'Briefcase', tab: 'leads' },
      { id: 'crm-reminders', name: 'iii. Follow-up reminders', path: '/crm?tab=reminders', icon: 'Clock', tab: 'reminders' },
      { id: 'crm-history', name: 'iv. Customer history', path: '/crm?tab=history', icon: 'History', tab: 'history' }
    ]
  },
  { 
    id: 'accounts', 
    name: '2. Account Management', 
    path: '/accounts', 
    icon: 'Landmark', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'acc-records', name: 'i. Income and expense records', path: '/accounts?tab=records', icon: 'Receipt', tab: 'records' },
      { id: 'acc-payments', name: 'ii. Payment tracking', path: '/accounts?tab=payments', icon: 'CreditCard', tab: 'payments' },
      { id: 'acc-ledger', name: 'iii. Account ledger', path: '/accounts?tab=ledger', icon: 'BookOpen', tab: 'ledger' },
      { id: 'acc-summaries', name: 'iv. Financial summaries', path: '/accounts?tab=summaries', icon: 'BarChart3', tab: 'summaries' },
      { id: 'acc-nfd', name: 'v. NDT', path: '/accounts?tab=nfd', icon: 'FileSpreadsheet', tab: 'nfd' }
    ]
  },
  { 
    id: 'vendors', 
    name: '3. Vendor Management', 
    path: '/vendors', 
    icon: 'Truck', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'vnd-reg', name: 'i. Vendor registration and details', path: '/vendors?tab=registration', icon: 'UserPlus', tab: 'registration' },
      { id: 'vnd-contacts', name: 'ii. Vendor contact management', path: '/vendors?tab=contacts', icon: 'Phone', tab: 'contacts' },
      { id: 'vnd-purchases', name: 'iii. Purchase history', path: '/vendors?tab=purchases', icon: 'ShoppingBag', tab: 'purchases' },
      { id: 'vnd-payments', name: 'iv. Vendor payment tracking', path: '/vendors?tab=payments', icon: 'DollarSign', tab: 'payments' }
    ]
  },
  { 
    id: 'tally', 
    name: '4. Tally Integration', 
    path: '/tally', 
    icon: 'ArrowLeftRight', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'tally-integ', name: 'i. Tally data integration', path: '/tally?tab=integration', icon: 'RefreshCw', tab: 'integration' },
      { id: 'tally-sync', name: 'ii. Account data synchronisation', path: '/tally?tab=sync', icon: 'Layers', tab: 'sync' },
      { id: 'tally-vouchers', name: 'iii. Voucher and transaction transfer', path: '/tally?tab=vouchers', icon: 'ArrowRightLeft', tab: 'vouchers' },
      { id: 'tally-verify', name: 'iv. Data verification', path: '/tally?tab=verification', icon: 'CheckCircle', tab: 'verification' }
    ]
  },
  { 
    id: 'reports', 
    name: '5. Custom Reports', 
    path: '/reports', 
    icon: 'FileText', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'rep-custom', name: 'i. Custom report generation', path: '/reports?tab=custom', icon: 'FileSpreadsheet', tab: 'custom' },
      { id: 'rep-datewise', name: 'ii. Date-wise reports', path: '/reports?tab=datewise', icon: 'Calendar', tab: 'datewise' },
      { id: 'rep-projectwise', name: 'iii. Project-wise reports', path: '/reports?tab=projectwise', icon: 'FolderKanban', tab: 'projectwise' },
      { id: 'rep-export', name: 'iv. Excel/PDF export options', path: '/reports?tab=export', icon: 'Download', tab: 'export' }
    ]
  },
  { 
    id: 'hrms', 
    name: '6. HRMS & Payroll', 
    path: '/hrms', 
    icon: 'UserCheck', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'hrms-records', name: 'i. Employee records', path: '/hrms?tab=records', icon: 'Users', tab: 'records' },
      { id: 'hrms-attendance', name: 'ii. Attendance management', path: '/hrms?tab=attendance', icon: 'Calendar', tab: 'attendance' },
      { id: 'hrms-salary', name: 'iii. Salary calculation', path: '/hrms?tab=salary', icon: 'Calculator', tab: 'salary' },
      { id: 'hrms-payslips', name: 'iv. Payslip generation', path: '/hrms?tab=payslips', icon: 'FileText', tab: 'payslips' }
    ]
  },
  { 
    id: 'geotracking', 
    name: '7. Geotracking & Geofencing', 
    path: '/geotracking', 
    icon: 'MapPin', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'geo-tracking', name: 'i. Location tracking for every user', path: '/geotracking?tab=tracking', icon: 'Navigation', tab: 'tracking' },
      { id: 'geo-attendance', name: 'ii. GPS-based attendance', path: '/geotracking?tab=gps-attendance', icon: 'UserCheck', tab: 'gps-attendance' },
      { id: 'geo-geofence', name: 'iii. Geofence area configuration', path: '/geotracking?tab=geofence', icon: 'Shield', tab: 'geofence' },
      { id: 'geo-history', name: 'iv. Location history and reports', path: '/geotracking?tab=history', icon: 'History', tab: 'history' }
    ]
  },
  { 
    id: 'projects', 
    name: '8. Projects Management', 
    path: '/projects', 
    icon: 'Building2', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'inventory', 
    name: '9. Inventory & Materials', 
    path: '/inventory', 
    icon: 'Package', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'tenders', 
    name: '10. Tenders & Bidding', 
    path: '/tenders', 
    icon: 'FileSpreadsheet', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'quotations', 
    name: '11. Quotations', 
    path: '/quotations', 
    icon: 'FileText', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'budgets', 
    name: '12. Budgets & Costing', 
    path: '/budgets', 
    icon: 'PieChart', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'expenses', 
    name: '13. Expenses Management', 
    path: '/expenses', 
    icon: 'Receipt', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'approvals', 
    name: '14. Approvals', 
    path: '/approvals', 
    icon: 'CheckSquare', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'gst', 
    name: '15. GST Compliance', 
    path: '/gst', 
    icon: 'FileCheck', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'mis', 
    name: '16. MIS Reports', 
    path: '/mis', 
    icon: 'BarChart2', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'bi', 
    name: '17. Business Intelligence', 
    path: '/bi', 
    icon: 'TrendingUp', 
    roles: Object.values(USER_ROLES) 
  },
  { 
    id: 'roles', 
    name: '18. Roles & Permissions', 
    path: '/roles', 
    icon: 'Shield', 
    roles: [USER_ROLES.SUPER_ADMIN] 
  }
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
