// SANMATI CONSTRUCTIONS ERP - Initial Enterprise Data Store
// Clean enterprise data store: all dummy data removed, essential system users retained

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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
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
    assignedProjects: []
  }
];

export const INITIAL_CLIENTS = [];

export const INITIAL_PROJECTS = [];

export const INITIAL_BOQ_ITEMS = [];

export const INITIAL_RA_BILLS = [];

export const INITIAL_VENDORS = [];

export const INITIAL_INVENTORY = [];

export const INITIAL_GPS_LOGS = [];

export const INITIAL_HRMS_EMPLOYEES = [];

export const INITIAL_TALLY_CONFIG = {
  connectionStatus: "Disconnected",
  tallyHost: "http://localhost:9000",
  companyName: "",
  lastSyncTime: "Never",
  syncFrequency: "Manual",
  ledgerMapping: [],
  recentSyncLogs: []
};

export const INITIAL_APPROVALS = [];

export const INITIAL_TENDERS = [];

export const INITIAL_QUOTATIONS = [];

export const INITIAL_EXPENSES = [];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_LEADS = [];

export const INITIAL_HERO_BANNERS = [];
