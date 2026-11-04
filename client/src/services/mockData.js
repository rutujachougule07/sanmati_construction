// SANMATI CONSTRUCTIONS ERP - Initial Enterprise Data Store
// Realistic enterprise data tailored for Kolhapur, Maharashtra, India

export const INITIAL_USERS = [
  {
    id: "usr_admin",
    name: "Sanmati Patil",
    email: "admin@sanmaticonstructions.com",
    role: "Super Admin / Owner",
    designation: "Managing Director",
    department: "Executive Management",
    phone: "+91 98220 11223",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002", "PRJ-KLP-003"]
  },
  {
    id: "usr_pm",
    name: "Er. Rajesh Kulkarni",
    email: "pm@sanmaticonstructions.com",
    role: "Project Manager",
    designation: "Chief Project Manager",
    department: "Operations & Civil",
    phone: "+91 94220 33445",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002"]
  },
  {
    id: "usr_se",
    name: "Er. Amit Deshmukh",
    email: "site@sanmaticonstructions.com",
    role: "Site Engineer",
    designation: "Senior Site Engineer",
    department: "Site Execution",
    phone: "+91 98901 55667",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001"]
  },
  {
    id: "usr_acc",
    name: "CA Sneha Shinde",
    email: "accounts@sanmaticonstructions.com",
    role: "Accountant",
    designation: "Chief Financial Officer & Accountant",
    department: "Accounts & Finance",
    phone: "+91 98231 77889",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002", "PRJ-KLP-003"]
  },
  {
    id: "usr_pur",
    name: "Mahesh Yadav",
    email: "purchase@sanmaticonstructions.com",
    role: "Purchase Manager",
    designation: "Procurement & Purchase Head",
    department: "Procurement & Vendor Relations",
    phone: "+91 97632 99001",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002", "PRJ-KLP-003"]
  },
  {
    id: "usr_store",
    name: "Ganesh Powar",
    email: "store@sanmaticonstructions.com",
    role: "Storekeeper",
    designation: "Central Storekeeper",
    department: "Inventory & Stores",
    phone: "+91 95451 22334",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002"]
  },
  {
    id: "usr_hr",
    name: "Pooja Jadhav",
    email: "hr@sanmaticonstructions.com",
    role: "HR Manager",
    designation: "Human Resources Lead",
    department: "HR & Administration",
    phone: "+91 99214 44556",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001", "PRJ-KLP-002", "PRJ-KLP-003"]
  },
  {
    id: "usr_emp",
    name: "Suresh Bhosale",
    email: "employee@sanmaticonstructions.com",
    role: "Employee",
    designation: "Junior Civil Surveyor",
    department: "Survey & Quality",
    phone: "+91 98223 88990",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80",
    assignedProjects: ["PRJ-KLP-001"]
  }
];

export const INITIAL_CLIENTS = [];

export const INITIAL_PROJECTS = [];

export const INITIAL_BOQ_ITEMS = [];

export const INITIAL_RA_BILLS = [];

export const INITIAL_VENDORS = [];

export const INITIAL_INVENTORY = [
  {
    id: "MAT-001",
    name: "Ultratech Super Cement (50kg)",
    category: "Cement & Concrete",
    unit: "Bags",
    currentStock: 480,
    minimumThreshold: 150,
    unitPrice: 385,
    location: "Central Warehouse, Kawala Naka",
    projectAllocation: {
      "PRJ-KLP-001": 250,
      "PRJ-KLP-002": 180,
      "PRJ-KLP-003": 50
    },
    status: "Adequate"
  },
  {
    id: "MAT-002",
    name: "TMT Rebar Fe500D (16mm)",
    category: "Reinforcement Steel",
    unit: "MT",
    currentStock: 18.5,
    minimumThreshold: 8.0,
    unitPrice: 62500,
    location: "Royal Palace Site Yard",
    projectAllocation: {
      "PRJ-KLP-001": 14.5,
      "PRJ-KLP-002": 4.0
    },
    status: "Adequate"
  },
  {
    id: "MAT-003",
    name: "Panchganga Natural River Sand",
    category: "Aggregates",
    unit: "Brass",
    currentStock: 14,
    minimumThreshold: 20,
    unitPrice: 7800,
    location: "Kawala Naka Site Yard",
    projectAllocation: {
      "PRJ-KLP-001": 10,
      "PRJ-KLP-002": 4
    },
    status: "Low Stock Alert"
  },
  {
    id: "MAT-004",
    name: "Crushed Stone Metal 20mm",
    category: "Aggregates",
    unit: "Brass",
    currentStock: 35,
    minimumThreshold: 15,
    unitPrice: 3200,
    location: "Kawala Naka Site Yard",
    projectAllocation: {
      "PRJ-KLP-001": 25,
      "PRJ-KLP-002": 10
    },
    status: "Adequate"
  },
  {
    id: "MAT-005",
    name: "Siporex AAC Lightweight Blocks (600x200x150mm)",
    category: "Masonry",
    unit: "Pieces",
    currentStock: 2400,
    minimumThreshold: 800,
    unitPrice: 65,
    location: "Central Warehouse",
    projectAllocation: {
      "PRJ-KLP-001": 2400
    },
    status: "Adequate"
  }
];

export const INITIAL_GPS_LOGS = [
  {
    id: "GPS-001",
    userId: "usr_se",
    userName: "Er. Amit Deshmukh",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    latitude: 16.7029,
    longitude: 74.2404,
    accuracy: 6.2, // meters
    timestamp: "2026-11-02T08:58:30+05:30",
    locationType: "Project Site",
    attendanceStatus: "Verified Check-In",
    geofenceStatus: "Inside (18m from center)",
    notes: "Morning RCC column reinforcement inspection"
  },
  {
    id: "GPS-002",
    userId: "usr_pm",
    userName: "Er. Rajesh Kulkarni",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    latitude: 16.7026,
    longitude: 74.2406,
    accuracy: 4.8,
    timestamp: "2026-11-02T09:45:15+05:30",
    locationType: "Site Visit",
    attendanceStatus: "Verified Check-In",
    geofenceStatus: "Inside (32m from center)",
    notes: "Client inspection walkthrough with Mr. Sunil Ghatage"
  },
  {
    id: "GPS-003",
    userId: "usr_emp",
    userName: "Suresh Bhosale",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    latitude: 16.7031,
    longitude: 74.2403,
    accuracy: 8.5,
    timestamp: "2026-11-02T09:12:00+05:30",
    locationType: "Project Site",
    attendanceStatus: "Verified Check-In",
    geofenceStatus: "Inside (45m from center)",
    notes: "Total Station leveling survey for floor 3"
  }
];

export const INITIAL_HRMS_EMPLOYEES = [];

export const INITIAL_TALLY_CONFIG = {
  connectionStatus: "Connected",
  tallyHost: "http://localhost:9000",
  companyName: "SANMATI CONSTRUCTIONS (FY 2026-2027)",
  lastSyncTime: "2026-11-02 10:15 AM",
  syncFrequency: "Auto on Approval",
  ledgerMapping: [
    { erpCategory: "Client Invoices (Sales)", tallyLedger: "Construction Revenue A/c", group: "Sales Accounts" },
    { erpCategory: "Vendor Materials (Purchases)", tallyLedger: "Material Purchase A/c", group: "Purchase Accounts" },
    { erpCategory: "Subcontractor Charges", tallyLedger: "Subcontracting Civil Expenses", group: "Direct Expenses" },
    { erpCategory: "Client Receipts", tallyLedger: "HDFC Bank Current A/c - 501002", group: "Bank Accounts" },
    { erpCategory: "GST Output CGST", tallyLedger: "Output CGST @ 9%", group: "Duties & Taxes" },
    { erpCategory: "GST Output SGST", tallyLedger: "Output SGST @ 9%", group: "Duties & Taxes" },
    { erpCategory: "GST Input CGST", tallyLedger: "Input CGST @ 9%", group: "Duties & Taxes" },
    { erpCategory: "GST Input SGST", tallyLedger: "Input SGST @ 9%", group: "Duties & Taxes" }
  ],
  recentSyncLogs: [
    { id: "SYNC-101", voucherType: "Sales Voucher", voucherNo: "RA/KLP/001/01", amount: 12445000, status: "Success", timestamp: "2026-02-16 11:24 AM", tallyMasterId: "10982" },
    { id: "SYNC-102", voucherType: "Purchase Voucher", voucherNo: "PO/2026/044", amount: 896000, status: "Success", timestamp: "2026-03-05 04:12 PM", tallyMasterId: "11045" },
    { id: "SYNC-103", voucherType: "Receipt Voucher", voucherNo: "RCPT/2026/012", amount: 10000000, status: "Success", timestamp: "2026-03-20 02:40 PM", tallyMasterId: "11119" },
    { id: "SYNC-104", voucherType: "Payment Voucher", voucherNo: "PMT/2026/089", amount: 1220000, status: "Success", timestamp: "2026-04-02 05:15 PM", tallyMasterId: "11204" }
  ]
};

export const INITIAL_APPROVALS = [
  {
    id: "APP-001",
    type: "RA bill",
    referenceId: "RA-2026-002",
    title: "RA Bill No. 2 - Royal Palace Complex",
    requester: "Er. Rajesh Kulkarni",
    date: "2026-04-20",
    amount: 10900000,
    status: "Approved",
    currentApprover: "Sanmati Patil (Owner)",
    comments: "Verified against site measurements. RCC completed as per schedule.",
    history: [
      { step: "Submitted by Project Manager", date: "2026-04-20 10:00 AM", user: "Er. Rajesh Kulkarni" },
      { step: "Audited by Accountant", date: "2026-04-20 02:30 PM", user: "CA Sneha Shinde" },
      { step: "Final Approval by Owner", date: "2026-04-21 11:15 AM", user: "Sanmati Patil" }
    ]
  },
  {
    id: "APP-002",
    type: "Purchase order",
    referenceId: "PO-2026-088",
    title: "Procurement of 25 MT Fe-500D TMT Bars from Rajaram Steels",
    requester: "Mahesh Yadav (Purchase)",
    date: "2026-10-28",
    amount: 1562500,
    status: "Submitted",
    currentApprover: "Er. Rajesh Kulkarni (Project Manager)",
    comments: "Urgent delivery required for 4th floor slab casting.",
    history: [
      { step: "PO drafted and submitted for approval", date: "2026-10-28 03:00 PM", user: "Mahesh Yadav" }
    ]
  }
];

export const INITIAL_TENDERS = [
  {
    id: "TND-2026-01",
    tenderId: "PWD/KLP/2026/W-104",
    title: "Construction of Multi-Level Flyover Approach Road & Grade Separator",
    authority: "Public Works Department (PWD), Division Kolhapur",
    tenderValue: 142000000,
    emdAmount: 1420000,
    deadline: "2026-11-25",
    submissionDate: "2026-11-20",
    eligibility: "Class 1A Contractor with minimum 50 Cr turnover",
    status: "Under Technical Evaluation",
    documents: ["TenderNotice.pdf", "DetailedEstimate.pdf", "BG_Format.pdf"],
    bidQuotationAmount: 138500000
  },
  {
    id: "TND-2026-02",
    tenderId: "KMC/ENGG/2026/SP-44",
    title: "Construction of Indoor Badminton & Olympic Swimming Complex at Shahu Stadium",
    authority: "Kolhapur Municipal Corporation",
    tenderValue: 68000000,
    emdAmount: 680000,
    deadline: "2026-12-10",
    submissionDate: null,
    eligibility: "Specialized Sports Complex Contractor with PWD Registration",
    status: "Preparation",
    documents: ["KMC_RFP.pdf", "ArchitecturalLayout.dwg"],
    bidQuotationAmount: 65500000
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: "QUO-2026-01",
    quotationNo: "SC/QUO/2026/045",
    clientId: "CLI-004",
    clientName: "Tarabai Heights Developers LLP",
    projectTitle: "Phase 2 Interior Civil Finishing & Vitrified Flooring",
    createdDate: "2026-10-15",
    validTill: "2026-11-30",
    materialCost: 4200000,
    labourCost: 1800000,
    equipmentCost: 250000,
    subcontractorCost: 650000,
    otherCost: 150000,
    profitMarginPercent: 15,
    profitMarginAmount: 1057500,
    discountAmount: 100000,
    subtotal: 8007500,
    gstRate: 18,
    gstAmount: 1441350,
    totalQuotationValue: 9448850,
    status: "Approved"
  }
];

export const INITIAL_EXPENSES = [];

export const INITIAL_NOTIFICATIONS = [
  { id: "NOT-1", title: "Low Stock Alert", message: "River Sand at Kawala Naka site has dropped below minimum safety threshold (14/20 Brass).", time: "10 mins ago", type: "warning", read: false },
  { id: "NOT-2", title: "RA Bill Approved", message: "RA Bill 02 for Royal Palace Complex has been authorized by MD.", time: "1 hour ago", type: "success", read: false },
  { id: "NOT-4", title: "GPS Check-In Verified", message: "Site Engineer Amit Deshmukh checked in within geofence radius.", time: "Today 08:58 AM", type: "info", read: true }
];
