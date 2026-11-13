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
    id: 'vendors', 
    name: '2. Vendor Management', 
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
    id: 'reports', 
    name: '3. Custom Reports', 
    path: '/reports', 
    icon: 'FileText', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'rep-custom', name: 'i. Custom report generation', path: '/reports?tab=custom', icon: 'FileSpreadsheet', tab: 'custom' },
      { id: 'rep-datewise', name: 'ii. Date-wise reports', path: '/reports?tab=datewise', icon: 'Calendar', tab: 'datewise' }
    ]
  },
  { 
    id: 'hrms', 
    name: '4. HRMS & Payroll', 
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
    id: 'quotations', 
    name: '5. Quotation Management', 
    path: '/quotations', 
    icon: 'FileText', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'quo-manage', name: 'i. Create and Manage Quotations', path: '/quotations?tab=manage', icon: 'FilePlus', tab: 'manage' },
      { id: 'quo-pricing', name: 'ii. Material and Service Pricing', path: '/quotations?tab=pricing', icon: 'Calculator', tab: 'pricing' },
      { id: 'quo-pdf', name: 'iii. Quotation PDF Generation', path: '/quotations?tab=pdf', icon: 'FileDown', tab: 'pdf' },
      { id: 'quo-status', name: 'iv. Quotation Status Tracking', path: '/quotations?tab=status', icon: 'Clock', tab: 'status' }
    ]
  },
  { 
    id: 'tenders', 
    name: '6. Tender Management', 
    path: '/tenders', 
    icon: 'Gavel', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'tnd-details', name: 'i. Tender details management', path: '/tenders?tab=details', icon: 'FileText', tab: 'details' },
      { id: 'tnd-documents', name: 'ii. Tender document uploads', path: '/tenders?tab=documents', icon: 'UploadCloud', tab: 'documents' },
      { id: 'tnd-reminders', name: 'iii. Submission date reminders', path: '/tenders?tab=reminders', icon: 'Bell', tab: 'reminders' },
      { id: 'tnd-status', name: 'iv. Tender status tracking', path: '/tenders?tab=tracking', icon: 'Clock', tab: 'tracking' }
    ]
  },
  { 
    id: 'projects', 
    name: '7. Construction Project Management', 
    path: '/projects', 
    icon: 'HardHat', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'prj-creation', name: 'i. Project Creation and Management', path: '/projects?tab=creation', icon: 'FolderPlus', tab: 'creation' },
      { id: 'prj-boq', name: 'ii. BOQ Management (Bill of Quantities)', path: '/projects?tab=boq', icon: 'FileSpreadsheet', tab: 'boq' },
      { id: 'prj-subcontractor', name: 'iii. Subcontractor Management', path: '/projects?tab=subcontractors', icon: 'Users', tab: 'subcontractors' },
      { id: 'prj-rabilling', name: 'iv. RA Billing & Project Progress Tracking', path: '/projects?tab=rabilling', icon: 'TrendingUp', tab: 'rabilling' }
    ]
  },
  {
    id: 'mis',
    name: '8. MIS Reports',
    path: '/mis',
    icon: 'PieChart',
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'mis-daily-monthly', name: '1. Daily & Monthly Reports', path: '/mis?tab=daily-monthly', icon: 'CalendarDays', tab: 'daily-monthly' },
      { id: 'mis-project-progress', name: '2. Project Progress Reports', path: '/mis?tab=project-progress', icon: 'TrendingUp', tab: 'project-progress' },
      { id: 'mis-financial-summary', name: '3. Financial Summary Reports', path: '/mis?tab=financial-summary', icon: 'Landmark', tab: 'financial-summary' },
      { id: 'mis-management', name: '4. Management Reports', path: '/mis?tab=management', icon: 'ShieldCheck', tab: 'management' }
    ]
  },
  {
    id: 'inventory',
    name: '9. Inventory Management',
    path: '/inventory',
    icon: 'Boxes',
    roles: [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.PROJECT_MANAGER,
      USER_ROLES.SITE_ENGINEER,
      USER_ROLES.PURCHASE_MANAGER,
      USER_ROLES.STOREKEEPER,
      USER_ROLES.ACCOUNTANT
    ],
    subcategories: [
      { id: 'inv-stock', name: 'i. Material stock management', path: '/inventory?tab=stock', icon: 'Package', tab: 'stock' },
      { id: 'inv-records', name: 'ii. Stock-in and stock-out records', path: '/inventory?tab=records', icon: 'ArrowLeftRight', tab: 'records' },
      { id: 'inv-issue', name: 'iii. Material issue tracking', path: '/inventory?tab=issue', icon: 'ClipboardList', tab: 'issue' },
      { id: 'inv-alerts', name: 'iv. Low-stock alerts', path: '/inventory?tab=alerts', icon: 'AlertTriangle', tab: 'alerts' }
    ]
  },
  { 
    id: 'accounts', 
    name: '10. Account Management', 
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
    id: 'tally', 
    name: '11. Tally Integration', 
    path: '/tally', 
    icon: 'ArrowLeftRight', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'tally-integ', name: 'i. Tally Data Integration', path: '/tally?tab=integration', icon: 'RefreshCw', tab: 'integration' },
      { id: 'tally-sync', name: 'ii. Account Data Synchronisation', path: '/tally?tab=sync', icon: 'Layers', tab: 'sync' },
      { id: 'tally-vouchers', name: 'iii. Voucher and Transaction Transfer', path: '/tally?tab=vouchers', icon: 'ArrowRightLeft', tab: 'vouchers' },
      { id: 'tally-verify', name: 'iv. Data Verification', path: '/tally?tab=verification', icon: 'CheckCircle', tab: 'verification' }
    ]
  },
  { 
    id: 'geotracking', 
    name: '12. Geotracking & Geofencing', 
    path: '/geotracking', 
    icon: 'MapPin', 
    roles: Object.values(USER_ROLES),
    subcategories: [
      { id: 'geo-tracking', name: 'i. Location tracking for every user', path: '/geotracking?tab=tracking', icon: 'Navigation', tab: 'tracking' },
      { id: 'geo-attendance', name: 'ii. GPS-based attendance', path: '/geotracking?tab=gps-attendance', icon: 'UserCheck', tab: 'gps-attendance' },
      { id: 'geo-geofence', name: 'iii. Geofence area configuration', path: '/geotracking?tab=geofence', icon: 'Shield', tab: 'geofence' },
      { id: 'geo-history', name: 'iv. Location history and reports', path: '/geotracking?tab=history', icon: 'History', tab: 'history' }
    ]
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
