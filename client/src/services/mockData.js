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

export const INITIAL_CLIENTS = [
  {
    id: "CLI-001",
    name: "Kolhapur Municipal Corporation (KMC)",
    contactPerson: "Dr. Mallinath Kalshetti",
    email: "commissioner@kolhapurcorporation.gov.in",
    phone: "0231-2540291",
    address: "Bhausinghji Road, Kolhapur, Maharashtra 416002",
    gstin: "27AAAGK1234F1ZA",
    category: "Government / Municipal",
    totalProjects: 2,
    activeProjects: 1,
    totalBilled: 45000000,
    outstanding: 3500000,
    createdDate: "2025-04-10"
  },
  {
    id: "CLI-002",
    name: "D. Y. Patil Education Society",
    contactPerson: "Sanjay D. Patil",
    email: "projects@dypatilkolhapur.edu",
    phone: "+91 98220 98765",
    address: "Kasaba Bawada, Kolhapur, Maharashtra 416006",
    gstin: "27AAATD4589H1Z3",
    category: "Institutional",
    totalProjects: 1,
    activeProjects: 1,
    totalBilled: 82000000,
    outstanding: 7200000,
    createdDate: "2025-06-15"
  },
  {
    id: "CLI-003",
    name: "Chhatrapati Shahu Sahakari Sakhar Karkhana",
    contactPerson: "Vijayrao Mane (MD)",
    email: "office@shahusugar.com",
    phone: "0231-2605555",
    address: "Kagal, Kolhapur District, Maharashtra 416216",
    gstin: "27AAACS1122K1Z9",
    category: "Industrial / Cooperative",
    totalProjects: 1,
    activeProjects: 1,
    totalBilled: 31000000,
    outstanding: 1800000,
    createdDate: "2025-09-01"
  },
  {
    id: "CLI-004",
    name: "Tarabai Heights Developers LLP",
    contactPerson: "Sunil Ghatage",
    email: "sunil@tarabaiheights.com",
    phone: "+91 98225 44332",
    address: "Opp. Circuit House, Tarabai Park, Kolhapur 416003",
    gstin: "27AABFT9988D1ZR",
    category: "Private Real Estate",
    totalProjects: 1,
    activeProjects: 0,
    totalBilled: 24000000,
    outstanding: 0,
    createdDate: "2025-02-18"
  }
];

export const INITIAL_PROJECTS = [
  {
    id: "PRJ-KLP-001",
    name: "Royal Palace Commercial Complex",
    clientId: "CLI-004",
    clientName: "Tarabai Heights Developers LLP",
    projectManager: "Er. Rajesh Kulkarni",
    siteEngineer: "Er. Amit Deshmukh",
    location: "Kawala Naka, Near Central Bus Stand, Kolhapur",
    latitude: 16.7028,
    longitude: 74.2405,
    geofenceRadius: 250, // meters
    startDate: "2025-10-01",
    targetCompletionDate: "2027-03-31",
    contractValue: 48500000,
    projectBudget: 39500000,
    actualExpenditure: 16850000,
    billedAmount: 21500000,
    receivedAmount: 18500000,
    outstandingAmount: 3000000,
    estimatedProfit: 9000000,
    actualProfit: 4650000,
    status: "Active",
    completionPercentage: 42,
    description: "G+7 Commercial Shopping & Corporate Office Tower with 2 basement parking levels.",
    activities: [
      { name: "Excavation", progress: 100, status: "Completed", startDate: "2025-10-05", endDate: "2025-11-20" },
      { name: "Foundation", progress: 100, status: "Completed", startDate: "2025-11-22", endDate: "2026-01-15" },
      { name: "RCC work", progress: 75, status: "In Progress", startDate: "2026-01-18", endDate: "2026-08-30" },
      { name: "Brickwork", progress: 30, status: "In Progress", startDate: "2026-04-10", endDate: "2026-10-15" },
      { name: "Plastering", progress: 10, status: "Pending", startDate: "2026-07-01", endDate: "2026-12-15" },
      { name: "Flooring", progress: 0, status: "Pending", startDate: "2026-10-01", endDate: "2027-01-30" },
      { name: "Electrical work", progress: 15, status: "In Progress", startDate: "2026-05-01", endDate: "2027-02-15" },
      { name: "Plumbing", progress: 20, status: "In Progress", startDate: "2026-04-15", endDate: "2027-02-15" },
      { name: "Painting", progress: 0, status: "Pending", startDate: "2027-01-10", endDate: "2027-03-15" },
      { name: "Final handover", progress: 0, status: "Pending", startDate: "2027-03-20", endDate: "2027-03-31" }
    ]
  },
  {
    id: "PRJ-KLP-002",
    name: "D.Y. Patil Medical Research Wing Extension",
    clientId: "CLI-002",
    clientName: "D. Y. Patil Education Society",
    projectManager: "Er. Rajesh Kulkarni",
    siteEngineer: "Er. Amit Deshmukh",
    location: "Kasaba Bawada, Kolhapur",
    latitude: 16.7314,
    longitude: 74.2466,
    geofenceRadius: 300,
    startDate: "2026-01-15",
    targetCompletionDate: "2027-11-30",
    contractValue: 82000000,
    projectBudget: 67000000,
    actualExpenditure: 12400000,
    billedAmount: 15000000,
    receivedAmount: 13000000,
    outstandingAmount: 2000000,
    estimatedProfit: 15000000,
    actualProfit: 2600000,
    status: "Active",
    completionPercentage: 22,
    description: "Multi-speciality clinical research building with specialized radiology shielding & HVAC ducting.",
    activities: [
      { name: "Excavation", progress: 100, status: "Completed", startDate: "2026-01-20", endDate: "2026-03-10" },
      { name: "Foundation", progress: 85, status: "In Progress", startDate: "2026-03-12", endDate: "2026-05-30" },
      { name: "RCC work", progress: 20, status: "In Progress", startDate: "2026-05-15", endDate: "2027-01-30" },
      { name: "Brickwork", progress: 0, status: "Pending", startDate: "2026-08-01", endDate: "2027-04-15" },
      { name: "Plastering", progress: 0, status: "Pending", startDate: "2026-11-01", endDate: "2027-06-30" },
      { name: "Flooring", progress: 0, status: "Pending", startDate: "2027-03-01", endDate: "2027-08-30" },
      { name: "Electrical work", progress: 0, status: "Pending", startDate: "2027-02-01", endDate: "2027-09-30" },
      { name: "Plumbing", progress: 0, status: "Pending", startDate: "2027-02-15", endDate: "2027-09-30" },
      { name: "Painting", progress: 0, status: "Pending", startDate: "2027-08-01", endDate: "2027-10-31" },
      { name: "Final handover", progress: 0, status: "Pending", startDate: "2027-11-01", endDate: "2027-11-30" }
    ]
  },
  {
    id: "PRJ-KLP-003",
    name: "MIDC Shiroli Heavy Warehouse & Logistics Hub",
    clientId: "CLI-003",
    clientName: "Chhatrapati Shahu Sahakari Sakhar Karkhana",
    projectManager: "Er. Rajesh Kulkarni",
    siteEngineer: "Er. Amit Deshmukh",
    location: "MIDC Shiroli Industrial Area, Kolhapur",
    latitude: 16.7622,
    longitude: 74.2881,
    geofenceRadius: 400,
    startDate: "2025-08-10",
    targetCompletionDate: "2026-08-31",
    contractValue: 31000000,
    projectBudget: 24500000,
    actualExpenditure: 21800000,
    billedAmount: 26000000,
    receivedAmount: 24200000,
    outstandingAmount: 1800000,
    estimatedProfit: 6500000,
    actualProfit: 4200000,
    status: "Active",
    completionPercentage: 88,
    description: "Pre-Engineered Steel building structure warehouse with vacuum-dewatered heavy flooring.",
    activities: [
      { name: "Excavation", progress: 100, status: "Completed", startDate: "2025-08-15", endDate: "2025-09-15" },
      { name: "Foundation", progress: 100, status: "Completed", startDate: "2025-09-20", endDate: "2025-11-10" },
      { name: "RCC work", progress: 100, status: "Completed", startDate: "2025-11-15", endDate: "2026-01-25" },
      { name: "Brickwork", progress: 100, status: "Completed", startDate: "2026-01-28", endDate: "2026-03-31" },
      { name: "Plastering", progress: 95, status: "In Progress", startDate: "2026-04-01", endDate: "2026-05-15" },
      { name: "Flooring", progress: 80, status: "In Progress", startDate: "2026-05-01", endDate: "2026-06-30" },
      { name: "Electrical work", progress: 70, status: "In Progress", startDate: "2026-05-10", endDate: "2026-07-20" },
      { name: "Plumbing", progress: 90, status: "In Progress", startDate: "2026-04-15", endDate: "2026-06-15" },
      { name: "Painting", progress: 40, status: "In Progress", startDate: "2026-06-15", endDate: "2026-08-15" },
      { name: "Final handover", progress: 0, status: "Pending", startDate: "2026-08-20", endDate: "2026-08-31" }
    ]
  }
];

export const INITIAL_BOQ_ITEMS = [
  {
    id: "BOQ-001",
    projectId: "PRJ-KLP-001",
    itemCode: "CIV-01",
    description: "Earthwork excavation in all types of soil including disposal within 50m lead",
    unit: "Cu.M",
    quantity: 3200,
    rate: 280,
    materialCost: 20,
    labourCost: 260,
    amount: 896000
  },
  {
    id: "BOQ-002",
    projectId: "PRJ-KLP-001",
    itemCode: "RCC-01",
    description: "Providing and laying Ready Mix Concrete (RMC) M25 grade in raft foundation & columns",
    unit: "Cu.M",
    quantity: 1850,
    rate: 6800,
    materialCost: 5200,
    labourCost: 1600,
    amount: 12580000
  },
  {
    id: "BOQ-003",
    projectId: "PRJ-KLP-001",
    itemCode: "STL-01",
    description: "Supplying, cutting, bending and placing Fe-500D TMT reinforcement bars",
    unit: "MT",
    quantity: 210,
    rate: 68500,
    materialCost: 61000,
    labourCost: 7500,
    amount: 14385000
  },
  {
    id: "BOQ-004",
    projectId: "PRJ-KLP-001",
    itemCode: "MAS-01",
    description: "Autoclaved Aerated Concrete (AAC) block masonry with polymer thin bed mortar (200mm)",
    unit: "Cu.M",
    quantity: 1200,
    rate: 3450,
    materialCost: 2450,
    labourCost: 1000,
    amount: 4140000
  },
  {
    id: "BOQ-005",
    projectId: "PRJ-KLP-001",
    itemCode: "PLS-01",
    description: "Internal cement plastering 12mm thick in cement mortar 1:4 with smooth finish",
    unit: "Sq.M",
    quantity: 9500,
    rate: 220,
    materialCost: 90,
    labourCost: 130,
    amount: 2090000
  }
];

export const INITIAL_RA_BILLS = [
  {
    id: "RA-2026-001",
    billNumber: "RA/KLP/001/01",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    clientId: "CLI-004",
    clientName: "Tarabai Heights Developers LLP",
    date: "2026-02-15",
    periodFrom: "2025-10-01",
    periodTo: "2026-01-31",
    boqReference: "BOQ-001, BOQ-002",
    previousQty: 0,
    currentQty: 1850,
    cumulativeQty: 1850,
    contractRate: 6800,
    currentBillAmount: 11500000,
    retentionPercent: 5,
    retentionAmount: 575000,
    advanceRecovery: 500000,
    otherDeductions: 50000,
    taxableSubtotal: 10375000,
    gstPercent: 18,
    cgst: 1035000,
    sgst: 1035000,
    igst: 0,
    netPayable: 12445000,
    status: "Approved",
    paymentStatus: "Paid",
    tallySync: "Synced"
  },
  {
    id: "RA-2026-002",
    billNumber: "RA/KLP/001/02",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    clientId: "CLI-004",
    clientName: "Tarabai Heights Developers LLP",
    date: "2026-04-20",
    periodFrom: "2026-02-01",
    periodTo: "2026-04-15",
    boqReference: "BOQ-002, BOQ-003",
    previousQty: 1850,
    currentQty: 850,
    cumulativeQty: 2700,
    contractRate: 6800,
    currentBillAmount: 10000000,
    retentionPercent: 5,
    retentionAmount: 500000,
    advanceRecovery: 400000,
    otherDeductions: 0,
    taxableSubtotal: 9100000,
    gstPercent: 18,
    cgst: 900000,
    sgst: 900000,
    igst: 0,
    netPayable: 10900000,
    status: "Approved",
    paymentStatus: "Partially Paid",
    tallySync: "Synced"
  }
];

export const INITIAL_VENDORS = [
  {
    id: "VND-001",
    name: "Rajaram Steel & Tubes Kolhapur",
    category: "Material Suppliers",
    contactPerson: "Prashant Patil",
    email: "rajaramsteel@gmail.com",
    phone: "+91 94220 88776",
    address: "Udyam Nagar, Kolhapur 416008",
    gstin: "27AABCR8765E1ZV",
    materialCategories: ["TMT Rebars", "Structural Steel", "Binding Wire"],
    totalPurchase: 14500000,
    paidAmount: 12200000,
    outstandingBalance: 2300000,
    rating: 4.8
  },
  {
    id: "VND-002",
    name: "Ultratech Cement Authorized C&F Kagal",
    category: "Material Suppliers",
    contactPerson: "Amol More",
    email: "kagal.cements@ultratech.com",
    phone: "+91 98902 11447",
    address: "Five Star MIDC Kagal, Kolhapur 416236",
    gstin: "27AAACU1289P1ZS",
    materialCategories: ["OPC 53 Cement", "PPC Cement", "Ready Mix Concrete"],
    totalPurchase: 8900000,
    paidAmount: 7800000,
    outstandingBalance: 1100000,
    rating: 4.9
  },
  {
    id: "VND-003",
    name: "Kolhapur Earthmovers & JCB Subcontractors",
    category: "Subcontractors",
    contactPerson: "Bandopant Bhosale",
    email: "earthmovers.klp@gmail.com",
    phone: "+91 98224 66554",
    address: "Nagala Park, Kolhapur 416003",
    gstin: "27AGHPB4433C1ZQ",
    materialCategories: ["Excavation", "Rock Breaking", "Debris Carting"],
    totalPurchase: 3200000,
    paidAmount: 2850000,
    outstandingBalance: 350000,
    rating: 4.7
  },
  {
    id: "VND-004",
    name: "Mahavir Hardware & Sanitary Traders",
    category: "Material Suppliers",
    contactPerson: "Nilesh Shah",
    email: "mahavir.hardware.klp@gmail.com",
    phone: "+91 98230 44112",
    address: "Station Road, Kolhapur 416001",
    gstin: "27AAPPS5544K1ZF",
    materialCategories: ["Plumbing PVC", "CPVC Pipes", "Sanitaryware"],
    totalPurchase: 1850000,
    paidAmount: 1500000,
    outstandingBalance: 350000,
    rating: 4.6
  }
];

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

export const INITIAL_HRMS_EMPLOYEES = [
  {
    id: "EMP-KLP-01",
    userId: "usr_admin",
    name: "Sanmati Patil",
    designation: "Managing Director",
    department: "Executive Management",
    joiningDate: "2018-01-10",
    basicSalary: 120000,
    hra: 48000,
    conveyance: 15000,
    specialAllowance: 25000,
    pfDeduction: 14400,
    professionalTax: 200,
    netSalary: 193400,
    leaveBalance: { sick: 7, casual: 12, earned: 18 },
    bankAccount: "HDFC0000123 / 50100234567890",
    pan: "AAYCS9281Q"
  },
  {
    id: "EMP-KLP-02",
    userId: "usr_pm",
    name: "Er. Rajesh Kulkarni",
    designation: "Chief Project Manager",
    department: "Operations & Civil",
    joiningDate: "2020-03-15",
    basicSalary: 65000,
    hra: 26000,
    conveyance: 8000,
    specialAllowance: 12000,
    pfDeduction: 7800,
    professionalTax: 200,
    netSalary: 103000,
    leaveBalance: { sick: 5, casual: 8, earned: 14 },
    bankAccount: "SBIN0000412 / 30291827364",
    pan: "ABCDE1234F"
  },
  {
    id: "EMP-KLP-03",
    userId: "usr_se",
    name: "Er. Amit Deshmukh",
    designation: "Senior Site Engineer",
    department: "Site Execution",
    joiningDate: "2022-06-01",
    basicSalary: 42000,
    hra: 16800,
    conveyance: 6000,
    specialAllowance: 8000,
    pfDeduction: 5040,
    professionalTax: 200,
    netSalary: 67560,
    leaveBalance: { sick: 6, casual: 10, earned: 15 },
    bankAccount: "ICIC0000678 / 067801543210",
    pan: "PQRS5678G"
  },
  {
    id: "EMP-KLP-04",
    userId: "usr_acc",
    name: "CA Sneha Shinde",
    designation: "Chief Financial Officer & Accountant",
    department: "Accounts & Finance",
    joiningDate: "2021-11-15",
    basicSalary: 55000,
    hra: 22000,
    conveyance: 7000,
    specialAllowance: 10000,
    pfDeduction: 6600,
    professionalTax: 200,
    netSalary: 87200,
    leaveBalance: { sick: 8, casual: 9, earned: 12 },
    bankAccount: "HDFC0000123 / 50100987654321",
    pan: "ZXCVB9876H"
  }
];

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
  },
  {
    id: "APP-003",
    type: "Material request",
    referenceId: "MR-2026-142",
    title: "Request for 400 Bags Ultratech Cement for D.Y. Patil Site",
    requester: "Er. Amit Deshmukh",
    date: "2026-10-31",
    amount: 154000,
    status: "Submitted",
    currentApprover: "Ganesh Powar (Storekeeper)",
    comments: "Required for foundation footing casting on Monday.",
    history: [
      { step: "Indented from Site", date: "2026-10-31 04:30 PM", user: "Er. Amit Deshmukh" }
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

export const INITIAL_EXPENSES = [
  {
    id: "EXP-2026-001",
    category: "Site Fuel & Diesel",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    amount: 45000,
    date: "2026-10-25",
    paidTo: "BPCL Petrol Pump Kawala Naka",
    paymentMode: "Bank Transfer",
    claimedBy: "Er. Amit Deshmukh",
    status: "Approved",
    receiptUrl: "fuel_bill_25oct.pdf"
  },
  {
    id: "EXP-2026-002",
    category: "Site Refreshment & Labour Amenities",
    projectId: "PRJ-KLP-001",
    projectName: "Royal Palace Commercial Complex",
    amount: 12500,
    date: "2026-10-27",
    paidTo: "Local Vendors",
    paymentMode: "Petty Cash",
    claimedBy: "Er. Amit Deshmukh",
    status: "Approved",
    receiptUrl: "amenities_voucher.pdf"
  },
  {
    id: "EXP-2026-003",
    category: "Municipal Statutory Inspection Fee",
    projectId: "PRJ-KLP-002",
    projectName: "D.Y. Patil Medical Research Wing",
    amount: 85000,
    date: "2026-10-29",
    paidTo: "Kolhapur Municipal Corporation",
    paymentMode: "Cheque (No. 401928)",
    claimedBy: "CA Sneha Shinde",
    status: "Approved",
    receiptUrl: "kmc_receipt.pdf"
  }
];

export const INITIAL_NOTIFICATIONS = [
  { id: "NOT-1", title: "Low Stock Alert", message: "River Sand at Kawala Naka site has dropped below minimum safety threshold (14/20 Brass).", time: "10 mins ago", type: "warning", read: false },
  { id: "NOT-2", title: "RA Bill Approved", message: "RA Bill 02 for Royal Palace Complex has been authorized by MD.", time: "1 hour ago", type: "success", read: false },
  { id: "NOT-3", title: "New Material Request", message: "400 Bags Cement requested by Amit Deshmukh for D.Y. Patil Wing.", time: "3 hours ago", type: "info", read: true },
  { id: "NOT-4", title: "GPS Check-In Verified", message: "Site Engineer Amit Deshmukh checked in within geofence radius.", time: "Today 08:58 AM", type: "info", read: true }
];
