// MODULE 1: CRM MANAGEMENT - Complete Working Implementation
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Users, Phone, Mail, MapPin, Building, Calendar, CheckCircle2, Clock, 
  Briefcase, History, AlertCircle, ArrowRight, UserCheck, Trash2, Edit3, 
  Eye, FileText, Check, X, AlertTriangle, ArrowUpRight, Search, Filter, 
  Download, Send, Paperclip, ChevronRight, RefreshCw, CalendarDays, User,
  HardHat, Hammer, DollarSign, Layers, Wrench
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../services/exportService';
import { EditableSelect } from '../../components/EditableSelect';

export const CONSTRUCTION_WORK_TYPES = [
  'Residential Bungalow Construction',
  'Commercial Building Construction',
  'Villa / Row House Development',
  'Industrial Shed & Warehouse',
  'Apartment / Flat Renovation',
  'Interior Design & Execution',
  'RCC Structural Work',
  'Road & Infrastructure Work',
  'Plastering & Painting Work',
  'Fabrication & Structural Steel',
  'Plumbing & Electrical Works',
  'Other / Custom Work'
];

const CUSTOMER_CATEGORIES = [
  'Individual',
  'Company',
  'Builder / Developer',
  'Government',
  'Other'
];
const CUSTOMER_TYPES = [
  'Company',
  'Individual',
  'Commercial',
  'Residential',
  'Government Entity',
  'Other'
];
const CUSTOMER_STATUSES = ['Active', 'Inactive'];
const CRM_LEAD_SOURCES = [
  'Website',
  'Phone Call',
  'Reference',
  'Tender'
];
const LEAD_STATUSES = ['New', 'Contacted', 'Interested', 'Negotiation', 'Converted', 'Lost'];
const LEAD_SOURCES = [
  'Website',
  'Phone Call',
  'WhatsApp',
  'Customer Reference',
  'Tender',
  'Advertisement',
  'Social Media',
  'Walk-in',
  'Other'
];
const PROJECT_TYPES = [
  'Residential Building',
  'Commercial Building',
  'Industrial Construction',
  'Road Construction',
  'Government Project',
  'Renovation',
  'Interior Work',
  'Other'
];
const LEAD_PRIORITIES = ['Low', 'Medium', 'High'];
const LEAD_DEPARTMENTS = [
  'Civil Engineering',
  'Estimation & Billing',
  'Project Management',
  'Sales & Business Development',
  'Tendering & Contracts',
  'Architecture & Design',
  'General Administration'
];
const FOLLOWUP_TYPES = ['Call', 'Meeting', 'Email', 'Site Visit'];
const INTERACTION_ACTIVITY_TYPES = [
  'Call',
  'Meeting',
  'Site Visit',
  'Email',
  'WhatsApp',
  'Quotation Discussion',
  'Technical Discussion',
  'Payment Discussion',
  'Tender Discussion',
  'Other'
];
const ACTIVITY_STATUSES = ['Completed', 'Pending', 'Cancelled'];

export const CRMModule = () => {
  const { 
    clients, 
    projects = [],
    leads = [],
    followUps = [],
    customerActivities = [],
    hrmsEmployees = [],
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    addFollowUp,
    updateFollowUp,
    rescheduleFollowUp,
    completeFollowUp,
    deleteFollowUp,
    addCustomerActivity,
    updateCustomerActivity,
    deleteCustomerActivity
  } = useERPData();

  const employeeList = useMemo(() => {
    return (hrmsEmployees || []).map(e => e.name).filter(Boolean);
  }, [hrmsEmployees]);

  // Helper to load customized options from localStorage
  const loadCustomOptions = (key, defaultOptions) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Failed to parse custom options for ${key}:`, err);
    }
    return defaultOptions;
  };

  // Dynamic dropdown lists with persistent storage
  const [projectTypes, setProjectTypes] = useState(() => 
    loadCustomOptions('sanmati_crm_project_types', PROJECT_TYPES)
  );
  const [leadSourcesList, setLeadSourcesList] = useState(() => 
    loadCustomOptions('sanmati_crm_lead_sources', LEAD_SOURCES)
  );
  const [departmentsList, setDepartmentsList] = useState(() => 
    loadCustomOptions('sanmati_crm_departments', LEAD_DEPARTMENTS)
  );
  const [leadPrioritiesList, setLeadPrioritiesList] = useState(() => 
    loadCustomOptions('sanmati_crm_lead_priorities', LEAD_PRIORITIES)
  );
  const [customerCategoriesList, setCustomerCategoriesList] = useState(() => 
    loadCustomOptions('sanmati_crm_customer_categories', CUSTOMER_CATEGORIES)
  );
  const [workTypesList, setWorkTypesList] = useState(() => 
    loadCustomOptions('sanmati_crm_work_types', CONSTRUCTION_WORK_TYPES)
  );
  const [customerTypesList, setCustomerTypesList] = useState(() => 
    loadCustomOptions('sanmati_crm_customer_types', CUSTOMER_TYPES)
  );
  const [followUpTypesList, setFollowUpTypesList] = useState(() => 
    loadCustomOptions('sanmati_crm_followup_types', FOLLOWUP_TYPES)
  );
  const [activityTypesList, setActivityTypesList] = useState(() => 
    loadCustomOptions('sanmati_crm_activity_types', INTERACTION_ACTIVITY_TYPES)
  );

  const handleAddOption = (storageKey, setter, currentList, newOpt) => {
    const trimmed = newOpt?.trim();
    if (!trimmed) return;
    if (currentList.some(item => item.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...currentList, trimmed];
    setter(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error(`Error saving ${storageKey}:`, err);
    }
  };

  const handleRemoveOption = (storageKey, setter, currentList, optToRemove) => {
    const updated = currentList.filter(item => item !== optToRemove);
    setter(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error(`Error saving ${storageKey}:`, err);
    }
  };

  const [customEmployeesList, setCustomEmployeesList] = useState(() =>
    loadCustomOptions('sanmati_crm_custom_employees', [])
  );

  const combinedEmployeeList = useMemo(() => {
    const list = [...employeeList];
    customEmployeesList.forEach(name => {
      if (!list.includes(name)) list.push(name);
    });
    return list;
  }, [employeeList, customEmployeesList]);

  const handleAddEmployee = (newOpt) => {
    handleAddOption('sanmati_crm_custom_employees', setCustomEmployeesList, customEmployeesList, newOpt);
  };

  const handleRemoveEmployee = (opt) => {
    handleRemoveOption('sanmati_crm_custom_employees', setCustomEmployeesList, customEmployeesList, opt);
  };

  // Clean any dummy employee 'Er. Rajesh Kulkarni' from existing leads in state
  useEffect(() => {
    leads.forEach(l => {
      if (l.assignedEmployee === 'Er. Rajesh Kulkarni') {
        updateLead(l.id, { assignedEmployee: '' });
      }
    });
  }, [leads, updateLead]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'customers';

  // Navigation tab switcher helper
  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // -------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------
  // Customer Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerDossier, setSelectedCustomerDossier] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Lead Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [leadToConvert, setLeadToConvert] = useState(null);

  // Follow-Up Modals
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [reschedulingFollowUp, setReschedulingFollowUp] = useState(null);
  const [completingFollowUp, setCompletingFollowUp] = useState(null);
  const [followUpToDelete, setFollowUpToDelete] = useState(null);

  // Customer History Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  // -------------------------------------------------------------
  // FILTERS
  // -------------------------------------------------------------
  const [customerStatusFilter, setCustomerStatusFilter] = useState('All');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');
  const [leadSourceFilter, setLeadSourceFilter] = useState('All');
  const [leadProjectTypeFilter, setLeadProjectTypeFilter] = useState('All');
  const [leadEmployeeFilter, setLeadEmployeeFilter] = useState('All');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('All');
  const [leadDateFilter, setLeadDateFilter] = useState('');
  const [followUpFilterTab, setFollowUpFilterTab] = useState('All'); // All, Today, Upcoming, Missed, Completed

  // -------------------------------------------------------------
  // FORM STATES
  // -------------------------------------------------------------
  const [customerForm, setCustomerForm] = useState({
    id: '',
    name: '',
    companyName: '',
    category: 'Individual',
    designation: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '',
    gstin: '',
    pan: '',
    customerType: 'Individual',
    leadSource: '',
    assignedProject: '',
    workType: 'Residential Bungalow Construction',
    customWorkType: '',
    workDescription: '',
    contractValue: '',
    assignedEngineer: '',
    status: 'Active'
  });

  const [customerValidationErrors, setCustomerValidationErrors] = useState({});

  const validateCustomerForm = () => {
    const errors = {};

    // 1. Basic Details
    if (!customerForm.name?.trim()) {
      errors.name = 'Customer / Contact Name is required';
    }

    // 2. Contact Details
    const cleanPhone = customerForm.phone ? customerForm.phone.replace(/[\s-]/g, '') : '';
    if (!customerForm.phone?.trim()) {
      errors.phone = 'Mobile Number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (customerForm.alternatePhone?.trim()) {
      const cleanAlt = customerForm.alternatePhone.replace(/[\s-]/g, '');
      if (!/^\+?[0-9]{10,14}$/.test(cleanAlt)) {
        errors.alternatePhone = 'Please enter a valid alternate mobile number';
      }
    }

    // 3. Work Details Validation
    if (!customerForm.workType?.trim()) {
      errors.workType = 'Construction Work Type is required';
    }

    // 4. Optional Validations
    if (customerForm.pincode?.trim() && !/^[1-9][0-9]{5}$/.test(customerForm.pincode.trim())) {
      errors.pincode = 'PIN Code must be a valid 6-digit number (e.g. 416001)';
    }

    if (customerForm.gstin?.trim()) {
      const gstinClean = customerForm.gstin.trim().toUpperCase();
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstinClean)) {
        errors.gstin = 'Invalid GSTIN format (e.g. 27AAYCS9281Q1ZU)';
      }
    }

    if (customerForm.pan?.trim()) {
      const panClean = customerForm.pan.trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(panClean)) {
        errors.pan = 'Invalid PAN format (e.g. AAYCS9281Q)';
      }
    }

    return errors;
  };

  const [conversionProject, setConversionProject] = useState('');

  const [leadForm, setLeadForm] = useState({
    id: '',
    leadTitle: '',
    leadDate: new Date().toISOString().split('T')[0],
    customerName: '',
    companyName: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    email: '',
    projectType: 'Residential Building',
    projectName: '',
    projectLocation: 'Kolhapur',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '',
    estimatedBudget: '',
    leadDescription: '',
    leadSource: 'Website',
    assignedEmployee: '',
    department: 'Civil Engineering',
    nextFollowUpDate: '',
    priority: 'Medium',
    status: 'New',
    notes: '',
    attachments: []
  });

  const [leadValidationErrors, setLeadValidationErrors] = useState({});

  const validateLeadForm = () => {
    const errors = {};

    // A. Lead Basic Details
    if (!leadForm.leadTitle?.trim()) {
      errors.leadTitle = 'Lead / Inquiry Title is required';
    }
    if (!leadForm.customerName?.trim()) {
      errors.customerName = 'Customer / Prospect Name is required';
    }
    const cleanPhone = leadForm.mobileNumber ? leadForm.mobileNumber.replace(/\D/g, '') : '';
    if (!leadForm.mobileNumber?.trim()) {
      errors.mobileNumber = 'Mobile Number is required';
    } else if (cleanPhone.length < 10) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (leadForm.alternateMobileNumber?.trim()) {
      const cleanAlt = leadForm.alternateMobileNumber.replace(/\D/g, '');
      if (cleanAlt.length < 10) {
        errors.alternateMobileNumber = 'Alternate mobile number must be at least 10 digits';
      }
    }
    if (leadForm.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // B. Project Details
    if (!leadForm.projectType) {
      errors.projectType = 'Project Type is required';
    }
    if (!leadForm.projectLocation?.trim()) {
      errors.projectLocation = 'Project Location is required';
    }
    if (!leadForm.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!leadForm.state?.trim()) {
      errors.state = 'State is required';
    }
    if (leadForm.pincode?.trim() && !/^[1-9][0-9]{5}$/.test(leadForm.pincode.trim())) {
      errors.pincode = 'PIN Code must be a valid 6-digit number (e.g. 416001)';
    }
    if (!leadForm.estimatedBudget || Number(leadForm.estimatedBudget) <= 0) {
      errors.estimatedBudget = 'Estimated Project Budget is required and must be greater than 0';
    }
    if (!leadForm.leadDescription?.trim()) {
      errors.leadDescription = 'Project Description / Requirements is required';
    }

    // C. Lead Source Details
    if (!leadForm.leadSource) {
      errors.leadSource = 'Lead Source is required';
    }

    // D. Lead Priority
    if (!leadForm.priority) {
      errors.priority = 'Priority is required';
    }

    return errors;
  };

  const [followUpForm, setFollowUpForm] = useState({
    customerName: '',
    contactNumber: '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:30',
    followUpType: 'Call',
    assignedEmployee: '',
    reminderNotes: '',
    status: 'Pending'
  });

  const [rescheduleData, setRescheduleData] = useState({
    newDate: new Date().toISOString().split('T')[0],
    newTime: '11:00',
    reason: ''
  });

  const [completeFollowUpNotes, setCompleteFollowUpNotes] = useState('');

  const [editingActivity, setEditingActivity] = useState(null);
  const [activityValidationErrors, setActivityValidationErrors] = useState({});

  const [activityForm, setActivityForm] = useState({
    id: '',
    customerId: '',
    customerName: '',
    projectId: '',
    projectName: '',
    activityDate: new Date().toISOString().split('T')[0],
    activityTime: new Date().toTimeString().slice(0, 5),
    activityType: 'Meeting',
    conductedBy: '',
    employeeName: '',
    contactPerson: '',
    contactNumber: '',
    subject: '',
    discussionDetails: '',
    customerResponse: '',
    nextAction: '',
    nextFollowUpDate: '',
    attachments: '',
    status: 'Completed',
    remarks: ''
  });

  // -------------------------------------------------------------
  // 1. CUSTOMER DETAILS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerValidationErrors({});
    let maxNum = 0;
    clients.forEach(c => {
      const m = c.id?.match(/CLI-(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const nextId = `CLI-${String(maxNum + 1).padStart(3, '0')}`;

    setCustomerForm({
      id: nextId,
      name: '',
      companyName: '',
      category: 'Individual',
      designation: '',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '',
      gstin: '',
      pan: '',
      customerType: 'Individual',
      leadSource: '',
      assignedProject: '',
      workType: 'Residential Bungalow Construction',
      customWorkType: '',
      workDescription: '',
      contractValue: '',
      assignedEngineer: combinedEmployeeList[0] || '',
      status: 'Active'
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerValidationErrors({});
    setCustomerForm({
      id: customer.id || '',
      name: customer.name || '',
      companyName: customer.companyName || customer.name || '',
      category: customer.category || 'Individual',
      designation: customer.designation || '',
      phone: customer.phone || '',
      alternatePhone: customer.alternatePhone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Kolhapur',
      state: customer.state || 'Maharashtra',
      pincode: customer.pincode || '',
      gstin: customer.gstin || '',
      pan: customer.pan || '',
      customerType: customer.customerType || 'Individual',
      leadSource: customer.leadSource || '',
      assignedProject: customer.assignedProject || '',
      workType: customer.workType || 'Residential Bungalow Construction',
      customWorkType: customer.customWorkType || '',
      workDescription: customer.workDescription || '',
      contractValue: customer.contractValue || '',
      assignedEngineer: customer.assignedEngineer || '',
      status: customer.status || 'Active'
    });
    setIsCustomerModalOpen(true);
  };

  const handleSubmitCustomer = (e) => {
    e.preventDefault();
    const errors = validateCustomerForm();
    if (Object.keys(errors).length > 0) {
      setCustomerValidationErrors(errors);
      return;
    }
    setCustomerValidationErrors({});

    const sanitizedData = {
      ...customerForm,
      contractValue: Number(customerForm.contractValue) || 0,
      gstin: customerForm.gstin?.trim().toUpperCase() || '',
      pan: customerForm.pan?.trim().toUpperCase() || '',
      pincode: customerForm.pincode?.trim() || ''
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, sanitizedData);
    } else {
      addCustomer(sanitizedData);
    }
    setIsCustomerModalOpen(false);
  };

  const handleConfirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    return clients.filter(c => {
      if (customerStatusFilter !== 'All' && c.status !== customerStatusFilter) return false;
      return true;
    });
  }, [clients, customerStatusFilter]);

  const handleExportCustomersPDF = () => {
    generatePDFReport({
      title: "SANMATI CONSTRUCTIONS - REGISTERED CUSTOMERS DIRECTORY",
      subtitle: `Official Customer Directory | Kolhapur, Maharashtra | Total: ${filteredCustomers.length} Records`,
      headers: ["Customer ID", "Customer Name", "Mobile", "City", "Project Name", "Work Type", "Assigned Engineer", "Contract Value", "Status"],
      rows: filteredCustomers.map(c => [
        c.id,
        c.name,
        c.phone || '—',
        c.city || '—',
        c.assignedProject || '—',
        c.workType === 'Other / Custom Work' ? (c.customWorkType || 'Custom Work') : (c.workType || '—'),
        c.assignedEngineer || '—',
        c.contractValue ? formatCurrency(c.contractValue) : '—',
        c.status || 'Active'
      ]),
      fileName: "Sanmati_Customer_Directory",
      orientation: "landscape"
    });
  };

  const customerColumns = [
    { 
      key: 'name', 
      header: 'Customer Name', 
      minWidth: '200px', 
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 leading-snug">{row.name}</span>
            <span className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-bold">
              {row.id}
            </span>
          </div>
          {row.companyName && row.companyName !== row.name && (
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{row.companyName}</span>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact No',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Phone className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <span>{row.phone || '—'}</span>
        </div>
      )
    },
    {
      key: 'workType',
      header: 'Work / Project',
      minWidth: '220px',
      render: (row) => {
        const displayWork = row.workType === 'Other / Custom Work' 
          ? (row.customWorkType || 'Custom Work') 
          : (row.workType || 'Construction Work');
        return (
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Hammer className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate max-w-[190px]" title={displayWork}>{displayWork}</span>
            </div>
            {row.assignedProject && (
              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                <Building className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span className="font-medium text-slate-800 truncate max-w-[170px]" title={row.assignedProject}>
                  {row.assignedProject}
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '130px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => setSelectedCustomerDossier(row)}
            title="View Complete Customer Dossier"
            className="p-1.5 bg-slate-100 hover:bg-[#002046] text-blue-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover/btn:text-white" />
          </button>
          <button
            onClick={() => handleOpenEditCustomer(row)}
            title="Edit Customer"
            className="p-1.5 bg-slate-100 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white" />
          </button>
          <button
            onClick={() => setCustomerToDelete(row)}
            title="Delete Customer"
            className="p-1.5 bg-slate-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white" />
          </button>
        </div>
      )
    }
  ];

  // -------------------------------------------------------------
  // 2. LEAD MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddLead = () => {
    setEditingLead(null);
    setLeadValidationErrors({});
    let maxNum = 0;
    leads.forEach(l => {
      const m = l.id?.match(/LED-(\d+)/) || l.id?.match(/LEAD-(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const nextId = `LED-${String(maxNum + 1).padStart(3, '0')}`;

    setLeadForm({
      id: nextId,
      leadTitle: '',
      leadDate: new Date().toISOString().split('T')[0],
      customerName: '',
      companyName: '',
      mobileNumber: '',
      alternateMobileNumber: '',
      email: '',
      projectType: 'Residential Building',
      projectName: '',
      projectLocation: 'Kolhapur',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '',
      estimatedBudget: '',
      leadDescription: '',
      leadSource: 'Website',
      assignedEmployee: '',
      department: 'Civil Engineering',
      nextFollowUpDate: '',
      priority: 'Medium',
      status: 'New',
      notes: '',
      attachments: []
    });
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead) => {
    setEditingLead(lead);
    setLeadValidationErrors({});
    setLeadForm({
      id: lead.id,
      leadTitle: lead.leadTitle || '',
      leadDate: lead.leadDate || lead.createdDate || new Date().toISOString().split('T')[0],
      customerName: lead.customerName || '',
      companyName: lead.companyName || '',
      mobileNumber: lead.mobileNumber || '',
      alternateMobileNumber: lead.alternateMobileNumber || '',
      email: lead.email || '',
      projectType: lead.projectType || lead.enquiryType || 'Residential Building',
      projectName: lead.projectName || '',
      projectLocation: lead.projectLocation || 'Kolhapur',
      city: lead.city || 'Kolhapur',
      state: lead.state || 'Maharashtra',
      pincode: lead.pincode || '',
      estimatedBudget: lead.estimatedBudget || '',
      leadDescription: lead.leadDescription || '',
      leadSource: lead.leadSource || 'Website',
      assignedEmployee: (lead.assignedEmployee === 'Er. Rajesh Kulkarni' ? '' : lead.assignedEmployee) || '',
      department: lead.department || 'Civil Engineering',
      nextFollowUpDate: lead.nextFollowUpDate || lead.followUpDate || '',
      priority: lead.priority || 'Medium',
      status: lead.status || 'New',
      notes: lead.notes || '',
      attachments: Array.isArray(lead.attachments) ? lead.attachments : []
    });
    setIsLeadModalOpen(true);
  };

  const handleLeadFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newAttachments = files.map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      type: f.type || 'Document'
    }));
    setLeadForm(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const handleRemoveLeadAttachment = (index) => {
    setLeadForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmitLead = (e) => {
    e.preventDefault();
    const errors = validateLeadForm();
    if (Object.keys(errors).length > 0) {
      setLeadValidationErrors(errors);
      return;
    }

    if (editingLead) {
      updateLead(editingLead.id, leadForm);
    } else {
      addLead(leadForm);
    }
    setIsLeadModalOpen(false);
  };

  const handleConfirmDeleteLead = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  const handleConfirmConvertLead = () => {
    if (leadToConvert) {
      convertLeadToCustomer(leadToConvert.id, {
        assignedProject: conversionProject || leadToConvert.projectName
      });
      setLeadToConvert(null);
      setConversionProject('');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (leadStatusFilter !== 'All' && l.status !== leadStatusFilter) return false;
      if (leadSourceFilter !== 'All' && l.leadSource !== leadSourceFilter) return false;
      if (leadProjectTypeFilter !== 'All' && (l.projectType || l.enquiryType) !== leadProjectTypeFilter) return false;
      if (leadEmployeeFilter !== 'All' && l.assignedEmployee !== leadEmployeeFilter) return false;
      if (leadPriorityFilter !== 'All' && (l.priority || 'Medium') !== leadPriorityFilter) return false;
      if (leadDateFilter) {
        const itemDate = l.leadDate || l.createdDate;
        if (itemDate && itemDate !== leadDateFilter) return false;
      }
      return true;
    });
  }, [leads, leadStatusFilter, leadSourceFilter, leadProjectTypeFilter, leadEmployeeFilter, leadPriorityFilter, leadDateFilter]);

  // Dashboard KPI 2: Total Pipeline Value - Sum of estimated budgets of active leads (excluding Lost or Converted)
  const totalPipelineValue = useMemo(() => {
    return leads
      .filter(l => l.status !== 'Lost' && l.status !== 'Converted')
      .reduce((acc, l) => acc + (Number(l.estimatedBudget) || 0), 0);
  }, [leads]);

  // Dashboard KPI 3: Conversion Rate - (Converted Leads / Total Leads) * 100
  const convertedLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'Converted').length;
  }, [leads]);

  const leadConversionRate = useMemo(() => {
    if (leads.length === 0) return '0.0%';
    return `${((convertedLeadsCount / leads.length) * 100).toFixed(1)}%`;
  }, [leads, convertedLeadsCount]);

  // Dashboard KPI 4: Active Negotiations - Count of leads currently in Negotiation status
  const activeNegotiationsCount = useMemo(() => {
    return leads.filter(l => l.status === 'Negotiation').length;
  }, [leads]);

  const leadColumns = [
    { 
      key: 'id', 
      header: 'Lead ID', 
      minWidth: '120px', 
      nowrap: true, 
      render: (row) => <span className="font-bold text-sky-600 font-mono whitespace-nowrap">{row.id}</span> 
    },
    {
      key: 'leadTitle',
      header: 'Lead Title & Project',
      minWidth: '240px',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block leading-snug">{row.leadTitle}</span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {row.projectType || row.enquiryType || 'Civil Work'} {row.projectName ? `• ${row.projectName}` : ''}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            📍 {row.city || row.projectLocation || 'Kolhapur'}
          </span>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Prospect Contact',
      minWidth: '190px',
      nowrap: true,
      render: (row) => (
        <div className="text-xs whitespace-nowrap">
          <p className="text-slate-900 font-bold">{row.customerName}</p>
          {row.companyName && (
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[170px]">{row.companyName}</p>
          )}
          <p className="text-slate-600 text-[11px] font-mono flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.mobileNumber}</span>
          </p>
        </div>
      )
    },
    {
      key: 'estimatedBudget',
      header: 'Est. Budget',
      align: 'right',
      minWidth: '140px',
      nowrap: true,
      render: (row) => (
        <span className="font-bold font-mono text-emerald-600 whitespace-nowrap tabular-nums">
          {formatCurrency(Number(row.estimatedBudget) || 0)}
        </span>
      )
    },
    {
      key: 'leadSource',
      header: 'Source',
      minWidth: '120px',
      nowrap: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          {row.leadSource || 'Website'}
        </span>
      )
    },
    {
      key: 'assignedEmployee',
      header: 'Assigned Lead',
      minWidth: '170px',
      render: (row) => {
        let pColor = 'bg-slate-100 text-slate-600 border-slate-200';
        if (row.priority === 'High') pColor = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
        if (row.priority === 'Medium') pColor = 'bg-amber-50 text-amber-700 border-amber-200';

        const isAssigned = Boolean(row.assignedEmployee && row.assignedEmployee !== 'Er. Rajesh Kulkarni');

        return (
          <div className="text-xs">
            <span className={`block leading-tight ${isAssigned ? 'text-slate-800 font-semibold' : 'text-slate-400 italic'}`}>
              {isAssigned ? row.assignedEmployee : 'Unassigned'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`px-1.5 py-0.2 rounded text-[9px] border uppercase ${pColor}`}>
                {row.priority || 'Medium'}
              </span>
              {row.department && (
                <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{row.department}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'nextFollowUpDate',
      header: 'Next Follow-up',
      minWidth: '130px',
      nowrap: true,
      render: (row) => {
        const dateVal = row.nextFollowUpDate || row.followUpDate;
        return (
          <span className="text-xs font-mono text-slate-700 whitespace-nowrap">
            {dateVal ? formatDate(dateVal) : '—'}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Lead Status',
      align: 'center',
      minWidth: '160px',
      nowrap: true,
      render: (row) => {
        let badgeStyle = 'bg-red-50 text-red-700 border-red-200';
        if (row.status === 'Converted') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (row.status === 'Negotiation') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
        if (row.status === 'Interested') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
        if (row.status === 'Contacted') badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
        if (row.status === 'Lost') badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';

        return (
          <select
            value={row.status}
            onChange={(e) => updateLead(row.id, { status: e.target.value })}
            className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${badgeStyle}`}
          >
            {LEAD_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '180px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          {row.status !== 'Converted' ? (
            <button
              onClick={() => {
                setLeadToConvert(row);
                setConversionProject(row.projectName || '');
              }}
              title="Convert Lead to Customer"
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3 h-3" />
              <span>Convert</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Customer Linked
            </span>
          )}
          <button
            onClick={() => setSelectedLeadDetails(row)}
            title="View Lead Details"
            className="p-1.5 bg-slate-100 hover:bg-[#002046] text-blue-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover/btn:text-white" />
          </button>
          <button
            onClick={() => handleOpenEditLead(row)}
            title="Edit Lead"
            className="p-1.5 bg-slate-100 hover:bg-amber-600 text-amber-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white" />
          </button>
          <button
            onClick={() => setLeadToDelete(row)}
            title="Delete Lead"
            className="p-1.5 bg-slate-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors shadow-2xs cursor-pointer group/btn"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white" />
          </button>
        </div>
      )
    }
  ];

  // -------------------------------------------------------------
  // 3. FOLLOW-UP REMINDERS HANDLERS
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAddFollowUp = (defaultCustomerName = '', defaultContact = '') => {
    setFollowUpForm({
      customerName: defaultCustomerName || '',
      contactNumber: defaultContact || '',
      followUpDate: todayStr,
      followUpTime: '11:00',
      followUpType: 'Call',
      assignedEmployee: '',
      reminderNotes: '',
      status: 'Pending'
    });
    setIsFollowUpModalOpen(true);
  };

  const handleSubmitFollowUp = (e) => {
    e.preventDefault();
    addFollowUp(followUpForm);
    setIsFollowUpModalOpen(false);
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (reschedulingFollowUp) {
      rescheduleFollowUp(reschedulingFollowUp.id, rescheduleData.newDate, rescheduleData.newTime, rescheduleData.reason);
      setReschedulingFollowUp(null);
    }
  };

  const handleConfirmCompleteFollowUp = () => {
    if (completingFollowUp) {
      completeFollowUp(completingFollowUp.id, completeFollowUpNotes);
      setCompletingFollowUp(null);
      setCompleteFollowUpNotes('');
    }
  };

  const filteredFollowUps = useMemo(() => {
    return followUps.filter(f => {
      if (followUpFilterTab === 'Today') {
        return f.followUpDate === todayStr && f.status !== 'Completed';
      }
      if (followUpFilterTab === 'Upcoming') {
        return f.followUpDate > todayStr && f.status !== 'Completed';
      }
      if (followUpFilterTab === 'Missed') {
        return f.followUpDate < todayStr && f.status === 'Pending';
      }
      if (followUpFilterTab === 'Completed') {
        return f.status === 'Completed';
      }
      return true;
    });
  }, [followUps, followUpFilterTab, todayStr]);

  const todayFollowUpsCount = useMemo(() => {
    return followUps.filter(f => f.followUpDate === todayStr && f.status !== 'Completed').length;
  }, [followUps, todayStr]);

  const upcomingFollowUpsCount = useMemo(() => {
    return followUps.filter(f => f.followUpDate > todayStr && f.status !== 'Completed').length;
  }, [followUps, todayStr]);

  const missedFollowUpsCount = useMemo(() => {
    return followUps.filter(f => f.followUpDate < todayStr && f.status === 'Pending').length;
  }, [followUps, todayStr]);

  // -------------------------------------------------------------
  // 4. CUSTOMER HISTORY HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddActivity = (prefillCustomer = null) => {
    setEditingActivity(null);
    setActivityValidationErrors({});
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = now.toTimeString().slice(0, 5);

    setActivityForm({
      id: '',
      customerId: prefillCustomer?.id || '',
      customerName: prefillCustomer?.name || '',
      projectId: '',
      projectName: prefillCustomer?.assignedProject || '',
      activityDate: defaultDate,
      activityTime: defaultTime,
      activityType: 'Meeting',
      conductedBy: combinedEmployeeList[0] || '',
      employeeName: combinedEmployeeList[0] || '',
      contactPerson: prefillCustomer?.contactPerson || prefillCustomer?.name || '',
      contactNumber: prefillCustomer?.phone || '',
      subject: '',
      discussionDetails: '',
      customerResponse: '',
      nextAction: '',
      nextFollowUpDate: '',
      attachments: '',
      status: 'Completed',
      remarks: ''
    });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (act) => {
    setEditingActivity(act);
    setActivityValidationErrors({});
    const actDate = act.activityDate || act.dateTime?.split('T')[0] || act.dateTime?.split(' ')[0] || new Date().toISOString().split('T')[0];
    const actTime = act.activityTime || (act.dateTime?.includes('T') ? act.dateTime.split('T')[1].slice(0, 5) : (act.dateTime?.split(' ')[1]?.slice(0, 5) || '10:30'));

    setActivityForm({
      id: act.id,
      customerId: act.customerId || '',
      customerName: act.customerName || '',
      projectId: act.projectId || '',
      projectName: act.projectName || '',
      activityDate: actDate,
      activityTime: actTime,
      activityType: act.activityType || 'Meeting',
      conductedBy: act.conductedBy || act.employeeName || '',
      employeeName: act.conductedBy || act.employeeName || '',
      contactPerson: act.contactPerson || '',
      contactNumber: act.contactNumber || '',
      subject: act.subject || '',
      discussionDetails: act.discussionDetails || '',
      customerResponse: act.customerResponse || '',
      nextAction: act.nextAction || '',
      nextFollowUpDate: act.nextFollowUpDate || '',
      attachments: act.attachments || act.attachment || '',
      status: act.status || 'Completed',
      remarks: act.remarks || ''
    });
    setIsActivityModalOpen(true);
  };

  const handleActivityCustomerChange = (custName) => {
    const found = clients.find(c => c.name === custName);
    setActivityForm(prev => ({
      ...prev,
      customerName: custName,
      customerId: found?.id || prev.customerId,
      contactPerson: prev.contactPerson || (found?.designation ? `${found.name} (${found.designation})` : (found?.name || '')),
      contactNumber: prev.contactNumber || found?.phone || '',
      projectName: prev.projectName || found?.assignedProject || ''
    }));
    if (activityValidationErrors.customerName) {
      setActivityValidationErrors(prev => ({ ...prev, customerName: '' }));
    }
  };

  const validateActivityForm = () => {
    const errors = {};
    if (!activityForm.customerName?.trim()) {
      errors.customerName = 'Customer Name is required';
    }
    if (!activityForm.activityType?.trim()) {
      errors.activityType = 'Activity Type is required';
    }
    return errors;
  };

  const handleSubmitActivity = (e) => {
    e.preventDefault();
    const errors = validateActivityForm();
    if (Object.keys(errors).length > 0) {
      setActivityValidationErrors(errors);
      return;
    }
    setActivityValidationErrors({});

    const payload = {
      ...activityForm,
      conductedBy: activityForm.conductedBy || activityForm.employeeName || '',
      employeeName: activityForm.conductedBy || activityForm.employeeName || ''
    };

    if (editingActivity) {
      updateCustomerActivity(editingActivity.id, payload);
    } else {
      addCustomerActivity(payload);
    }
    setIsActivityModalOpen(false);
  };

  // Derived modal titles
  const customerModalTitle = editingCustomer
    ? ("Edit Customer: " + (editingCustomer.name || customerForm.name || editingCustomer.id))
    : "Register Customer & Work Scope";

  const customerModalSubtitle = editingCustomer
    ? ("Customer ID: " + editingCustomer.id + " • Manage client credentials, project allocation, and work scope.")
    : "Manage client credentials, construction project allocation, and work scope details.";

  const leadModalTitle = editingLead
    ? ("Edit Lead: " + (editingLead.customerName || editingLead.leadTitle || editingLead.id))
    : "Register New Construction Lead";

  // =============================================================
  // RENDER UI
  // =============================================================
  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SUB-MODULE 1: CUSTOMER DETAILS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                1. CRM Management • Subsection (i)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Customer Details Management
              </h2>
              <p className="text-xs text-slate-500">Corporate and individual client directory, GSTIN compliance, and construction project affiliations.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCustomersPDF}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={handleOpenAddCustomer}
                className="px-4 py-1.5 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Customer</span>
              </button>
            </div>
          </div>

          {/* Customer Summary Cards & Status Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              onClick={() => setCustomerStatusFilter('All')}
              className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer transition-all ${
                customerStatusFilter === 'All' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className="text-xs text-slate-500">Total Customers</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{clients.length}</div>
              <span className="text-[11px] text-slate-400 font-medium">All registered accounts</span>
            </div>
            <div 
              onClick={() => setCustomerStatusFilter('Active')}
              className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer transition-all ${
                customerStatusFilter === 'Active' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className="text-xs text-slate-500">Active Customers</span>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                {clients.filter(c => c.status === 'Active').length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Ongoing contracts</span>
            </div>
            <div 
              onClick={() => setCustomerStatusFilter('Inactive')}
              className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer transition-all ${
                customerStatusFilter === 'Inactive' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className="text-xs text-slate-500">Inactive Customers</span>
              <div className="text-lg font-bold text-rose-600 mt-1">
                {clients.filter(c => c.status === 'Inactive').length}
              </div>
              <span className="text-[11px] text-rose-500 font-medium">Dormant accounts</span>
            </div>
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500">Active Projects Linked</span>
              <div className="text-lg font-bold text-indigo-600 mt-1">
                {clients.filter(c => c.assignedProject).length}
              </div>
              <span className="text-[11px] text-indigo-500 font-medium">Linked site works</span>
            </div>
          </div>

          {/* Customer Table */}
          <DataTable
            columns={customerColumns}
            data={filteredCustomers}
            searchKey={['name', 'companyName', 'phone', 'assignedProject', 'workType', 'gstin']}
            searchPlaceholder="Search customers by name, company, email, phone or GSTIN..."
            title="Customer Directory"
            exportFileName="Sanmati_Customers"
            emptyMessage="No customer records match your filter criteria. Click 'Add New Customer' to register one."
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 2: LEAD MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                1. CRM Management • Subsection (ii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Lead & Prospect Management
              </h2>
              <p className="text-xs text-slate-500">Track civil tenders, construction inquiries, quotation negotiations, and conversion pipelines.</p>
            </div>

            <button
              onClick={handleOpenAddLead}
              className="px-4 py-1.5 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Lead</span>
            </button>
          </div>

          {/* Lead KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Inquiries</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{leads.length} Leads</div>
              <span className="text-[11px] text-slate-400 font-medium">All registered construction inquiries</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Pipeline Value</span>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                {formatCurrency(totalPipelineValue)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Active leads (excl. lost/converted)</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Conversion Rate</span>
              <div className="text-lg font-bold text-red-600 mt-1">{leadConversionRate}</div>
              <span className="text-[11px] text-red-500 font-medium">{convertedLeadsCount} converted to clients</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Active Negotiations</span>
              <div className="text-lg font-bold text-purple-600 mt-1">
                {activeNegotiationsCount} Leads
              </div>
              <span className="text-[11px] text-purple-500 font-medium">Active negotiation stage</span>
            </div>
          </div>

          {/* Lead Filters: Status, Source, Project Type, Employee, Priority & Date */}
          <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-bold mr-1 uppercase">Status:</span>
                {['All', ...LEAD_STATUSES].map(status => (
                  <button
                    key={status}
                    onClick={() => setLeadStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      leadStatusFilter === status 
                        ? 'bg-[#002046] text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {(leadStatusFilter !== 'All' || leadSourceFilter !== 'All' || leadProjectTypeFilter !== 'All' || leadEmployeeFilter !== 'All' || leadPriorityFilter !== 'All' || leadDateFilter) && (
                <button
                  onClick={() => {
                    setLeadStatusFilter('All');
                    setLeadSourceFilter('All');
                    setLeadProjectTypeFilter('All');
                    setLeadEmployeeFilter('All');
                    setLeadPriorityFilter('All');
                    setLeadDateFilter('');
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Source</label>
                <select
                  value={leadSourceFilter}
                  onChange={(e) => setLeadSourceFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Sources</option>
                  {leadSourcesList.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Project Type</label>
                <select
                  value={leadProjectTypeFilter}
                  onChange={(e) => setLeadProjectTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Project Types</option>
                  {projectTypes.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Assigned Employee</label>
                <select
                  value={leadEmployeeFilter}
                  onChange={(e) => setLeadEmployeeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Employees</option>
                  {combinedEmployeeList.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Priority</label>
                <select
                  value={leadPriorityFilter}
                  onChange={(e) => setLeadPriorityFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Priorities</option>
                  {leadPrioritiesList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Lead Date</label>
                <input
                  type="date"
                  value={leadDateFilter}
                  onChange={(e) => setLeadDateFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Leads Pipeline Table */}
          <DataTable
            columns={leadColumns}
            data={filteredLeads}
            searchPlaceholder="Search leads by Lead ID, customer, mobile, project name, or location..."
            title="Lead Pipeline"
            exportFileName="Sanmati_Construction_Leads"
            emptyMessage="No leads match your filter criteria. Click 'Add New Lead' to register a new construction inquiry."
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 3: FOLLOW-UP REMINDERS */}
      {/* ========================================================= */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                1. CRM Management • Subsection (iii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Follow-Up Reminders & Schedules
              </h2>
              <p className="text-xs text-slate-500">Never miss a critical client meeting, architectural review, or commercial rate negotiation.</p>
            </div>

            <button
              onClick={() => handleOpenAddFollowUp()}
              className="px-4 py-1.5 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Follow-up</span>
            </button>
          </div>

          {/* Filter Tabs for Follow-ups */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setFollowUpFilterTab('Today')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                followUpFilterTab === 'Today' 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200' 
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Today's Follow-ups</span>
              </span>
              <div className="text-lg font-bold text-amber-800 mt-1">{todayFollowUpsCount}</div>
            </button>

            <button
              onClick={() => setFollowUpFilterTab('Upcoming')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                followUpFilterTab === 'Upcoming' 
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-200' 
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </span>
              <div className="text-lg font-bold text-blue-900 mt-1">{upcomingFollowUpsCount}</div>
            </button>

            <button
              onClick={() => setFollowUpFilterTab('Missed')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                followUpFilterTab === 'Missed' 
                  ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200' 
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Missed / Overdue</span>
              </span>
              <div className="text-lg font-bold text-rose-800 mt-1">{missedFollowUpsCount}</div>
            </button>

            <button
              onClick={() => setFollowUpFilterTab('All')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                followUpFilterTab === 'All' 
                  ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-200' 
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                <span>All Reminders</span>
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">{followUps.length}</div>
            </button>
          </div>

          {/* Follow-up Cards Grid */}
          {filteredFollowUps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFollowUps.map((item) => {
                const isMissed = item.followUpDate < todayStr && item.status === 'Pending';
                const isToday = item.followUpDate === todayStr && item.status === 'Pending';

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
                      isMissed 
                        ? 'border-rose-300 bg-rose-50/20' 
                        : isToday 
                        ? 'border-amber-300 bg-amber-50/20' 
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                        item.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isMissed 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : isToday 
                          ? 'bg-amber-100 text-amber-800 border-amber-300' 
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>
                          {isMissed ? 'OVERDUE' : isToday ? 'TODAY' : item.status} • {formatDate(item.followUpDate)} at {item.followUpTime}
                        </span>
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {item.followUpType}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.customerName}</h4>
                      {item.contactNumber && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.contactNumber}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                      <span className="font-semibold block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                        Agenda / Notes:
                      </span>
                      <p className="line-clamp-3 leading-relaxed">{item.reminderNotes || 'No notes specified.'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Assigned: <strong className="text-slate-800">{item.assignedEmployee}</strong>
                      </span>

                      <div className="flex items-center gap-1">
                        {item.status !== 'Completed' && (
                          <>
                            <button
                              onClick={() => {
                                setReschedulingFollowUp(item);
                                setRescheduleData({ newDate: item.followUpDate, newTime: item.followUpTime, reason: '' });
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-200 transition-colors cursor-pointer"
                              title="Reschedule Reminder"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setCompletingFollowUp(item);
                                setCompleteFollowUpNotes('');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Mark as Completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setFollowUpToDelete(item)}
                          className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center mx-auto mb-2"><Clock className="w-5 h-5" /></div>
              <h4 className="text-xs font-bold text-slate-800">No Reminders Found</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {followUpFilterTab === 'Today' 
                  ? "No follow-up calls or meetings scheduled for today." 
                  : followUpFilterTab === 'Missed' 
                  ? "Great job! You have zero missed follow-ups." 
                  : "All follow-up schedules are blank."}
              </p>
              <button
                onClick={() => handleOpenAddFollowUp()}
                className="px-3.5 py-1.5 bg-[#002046] text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule a Follow-up</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 4: CUSTOMER HISTORY */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                1. CRM Management • Subsection (iv)
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Customer Interaction History & Activity Logs
                </h2>
                <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-200">
                  {customerActivities.length} {customerActivities.length === 1 ? 'interaction' : 'interactions'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Comprehensive chronological log of calls, technical meetings, site visits, and commercial negotiations.</p>
            </div>

            <button
              onClick={() => handleOpenAddActivity()}
              className="px-4 py-1.5 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Activity</span>
            </button>
          </div>

          {/* Activity Timeline List */}
          {customerActivities.length > 0 ? (
            <div className="space-y-3">
              {customerActivities.map((act) => {
                let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                if (act.activityType === 'Site Visit') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (act.activityType === 'Meeting') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                if (act.activityType === 'Call') badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
                if (act.activityType === 'WhatsApp') badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-300';
                if (act.activityType === 'Email') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                if (act.activityType === 'Quotation Discussion') badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                if (act.activityType === 'Technical Discussion') badgeColor = 'bg-cyan-100 text-cyan-800 border-cyan-200';
                if (act.activityType === 'Payment Discussion') badgeColor = 'bg-violet-100 text-violet-800 border-violet-200';
                if (act.activityType === 'Tender Discussion') badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';

                let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (act.status === 'Pending') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                if (act.status === 'Cancelled') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div 
                    key={act.id} 
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-red-500/60 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center flex-shrink-0 text-xs border ${badgeColor}`}>
                        {act.activityType ? act.activityType.substring(0, 2).toUpperCase() : 'AC'}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 
                            onClick={() => {
                              const found = clients.find(c => c.name === act.customerName);
                              if (found) setSelectedCustomerDossier(found);
                            }}
                            className="text-sm font-bold text-slate-900 hover:text-red-600 cursor-pointer transition-colors"
                          >
                            {act.customerName}
                          </h4>
                          {act.projectName && (
                            <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              {act.projectName}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                            {act.activityType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                            {act.status || 'Completed'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono ml-auto sm:ml-0">
                            {act.activityDate ? `${act.activityDate} ${act.activityTime || ''}` : act.dateTime}
                          </span>
                        </div>

                        {act.subject && (
                          <h5 className="text-xs font-bold text-slate-800 leading-tight">
                            {act.subject}
                          </h5>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed max-w-3xl whitespace-pre-wrap">
                          {act.discussionDetails}
                        </p>

                        {/* Customer Response & Next Action pills */}
                        {(act.customerResponse || act.nextAction) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {act.customerResponse && (
                              <div className="text-[11px] bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                                <span className="font-bold text-slate-700 block text-[10px] uppercase">Customer Response:</span>
                                <span className="text-slate-600">{act.customerResponse}</span>
                              </div>
                            )}
                            {act.nextAction && (
                              <div className="text-[11px] bg-amber-50/60 border border-amber-200/80 rounded-lg p-2">
                                <span className="font-bold text-amber-900 block text-[10px] uppercase">Next Action:</span>
                                <span className="text-amber-800">{act.nextAction}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>Conducted By: <strong className="text-slate-800">{act.conductedBy || act.employeeName || 'Admin'}</strong></span>
                          {act.contactPerson && (
                            <span>Contact: <strong className="text-slate-700">{act.contactPerson}{act.contactNumber ? ` (${act.contactNumber})` : ''}</strong></span>
                          )}
                          {act.nextFollowUpDate && (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Next Follow-up: {formatDate(act.nextFollowUpDate)}
                            </span>
                          )}
                          {(act.attachments || act.attachment) && (
                            <span className="text-red-600 font-medium flex items-center gap-1 font-mono">
                              <Paperclip className="w-3 h-3" />
                              {act.attachments || act.attachment}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Logged: {formatDate(act.createdDate || act.dateTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0 pt-1">
                      <button
                        onClick={() => setSelectedDiscussion(act)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        title="View Full Notes"
                      >
                        View Full Notes
                      </button>
                      <button
                        onClick={() => handleOpenEditActivity(act)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Activity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActivityToDelete(act)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center mx-auto mb-2"><History className="w-5 h-5" /></div>
              <h4 className="text-xs font-bold text-slate-800">No Interaction History Recorded</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Record client meetings, technical consultations, calls, or site visits to build the chronological customer dossier.
              </p>
              <button
                onClick={() => handleOpenAddActivity()}
                className="px-3.5 py-1.5 bg-[#002046] text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log First Activity</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT CUSTOMER */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={customerModalTitle}
        subtitle={customerModalSubtitle}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitCustomer} className="space-y-4 text-xs">
          {/* 1. CUSTOMER & CONTACT DETAILS */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                1. Customer & Contact Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer ID <span className="text-[10px] text-slate-400 font-normal">(Auto)</span>
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={customerForm.id}
                  className="erp-input bg-slate-100/90 text-red-600 font-mono font-bold cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer / Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, name: e.target.value });
                    if (customerValidationErrors.name) setCustomerValidationErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`erp-input ${customerValidationErrors.name ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. Rutu Patil"
                />
                {customerValidationErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{customerValidationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerForm.phone}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, phone: e.target.value });
                    if (customerValidationErrors.phone) setCustomerValidationErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className={`erp-input ${customerValidationErrors.phone ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. 9822011223"
                />
                {customerValidationErrors.phone && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{customerValidationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alternate Phone</label>
                <input
                  type="tel"
                  value={customerForm.alternatePhone}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, alternatePhone: e.target.value });
                    if (customerValidationErrors.alternatePhone) setCustomerValidationErrors(prev => ({ ...prev, alternatePhone: '' }));
                  }}
                  className={`erp-input ${customerValidationErrors.alternatePhone ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. 9422033445"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. rutu@gmail.com"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  City / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Kolhapur"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">
                  Site / Registered Address
                </label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Plot No. 12, Tarabai Park, Kolhapur"
                />
              </div>
            </div>
          </div>

          {/* 2. CONSTRUCTION WORK & PROJECT DETAILS */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  2. Construction Work & Project Details
                </h4>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Project Scope
              </span>
            </div>

            {/* Project / Site Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Project / Site Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="customer-projects-datalist"
                  value={customerForm.assignedProject}
                  onChange={(e) => setCustomerForm({ ...customerForm, assignedProject: e.target.value })}
                  className="erp-input font-medium bg-white"
                  placeholder="e.g. Home, Rutu Residency, Safa Bakery, or Site Name"
                />
                <datalist id="customer-projects-datalist">
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} {p.location ? `(${p.location})` : ''}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Construction Work Type - Dual Option (Dropdown + Direct Type) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="block text-slate-800 font-bold text-xs">
                  Construction Work Type <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  Select from list or type custom work directly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Dropdown Option */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Select from Dropdown:
                  </span>
                  <select
                    value={workTypesList.includes(customerForm.workType) ? customerForm.workType : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setCustomerForm({ ...customerForm, workType: val });
                        if (customerValidationErrors.workType) {
                          setCustomerValidationErrors(prev => ({ ...prev, workType: '' }));
                        }
                      }
                    }}
                    className="erp-input font-medium bg-slate-50 text-xs"
                  >
                    <option value="">-- Choose Standard Work Type --</option>
                    {workTypesList.map((wt, idx) => (
                      <option key={idx} value={wt}>{wt}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Direct Type Option */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Or Type Work Name Directly:
                  </span>
                  <input
                    type="text"
                    value={customerForm.workType}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, workType: e.target.value });
                      if (customerValidationErrors.workType) {
                        setCustomerValidationErrors(prev => ({ ...prev, workType: '' }));
                      }
                    }}
                    placeholder="e.g. Bakery Renovation, Swimming Pool, Warehouse Shed..."
                    className={`erp-input font-medium bg-white text-xs ${customerValidationErrors.workType ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
                  />
                </div>
              </div>

              {customerValidationErrors.workType && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{customerValidationErrors.workType}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Scope of Work / Requirements
              </label>
              <textarea
                rows={2}
                value={customerForm.workDescription}
                onChange={(e) => setCustomerForm({ ...customerForm, workDescription: e.target.value })}
                className="erp-input bg-white"
                placeholder="e.g. G+1 2400 sq.ft residential bungalow, RCC frame structure, brickwork, vitrified tiles, waterproofing, modular kitchen..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Estimated Contract Value / Budget
                </label>
                <div className="flex rounded-lg border border-slate-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 overflow-hidden bg-white shadow-2xs">
                  <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 font-bold text-xs border-r border-slate-300 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.contractValue}
                    onChange={(e) => setCustomerForm({ ...customerForm, contractValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none placeholder-slate-400 bg-white"
                    placeholder="e.g. 3500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Site Engineer / Supervisor
                </label>
                <select
                  value={customerForm.assignedEngineer}
                  onChange={(e) => setCustomerForm({ ...customerForm, assignedEngineer: e.target.value })}
                  className="erp-input font-medium bg-white"
                >
                  <option value="">-- Select Site Engineer / Supervisor --</option>
                  {employeeList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  {customerForm.assignedEngineer && !employeeList.includes(customerForm.assignedEngineer) && (
                    <option value={customerForm.assignedEngineer}>{customerForm.assignedEngineer}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 3. BUSINESS, TAX & ACCOUNT DETAILS */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                3. Business, Tax & Account Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Category</label>
                <EditableSelect
                  value={customerForm.category}
                  onChange={(val) => setCustomerForm({ ...customerForm, category: val })}
                  options={customerCategoriesList}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_customer_categories', setCustomerCategoriesList, customerCategoriesList, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_customer_categories', setCustomerCategoriesList, customerCategoriesList, opt)}
                  placeholder="Select category..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Developer</label>
                <input
                  type="text"
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                  className="erp-input bg-white"
                  placeholder="e.g. Mahalaxmi Housing"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  GSTIN <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={customerForm.gstin}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setCustomerForm({ ...customerForm, gstin: val });
                    if (customerValidationErrors.gstin) setCustomerValidationErrors(prev => ({ ...prev, gstin: '' }));
                  }}
                  className={`erp-input font-mono bg-white ${customerValidationErrors.gstin ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="27AAYCS9281Q1ZU"
                />
                {customerValidationErrors.gstin && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{customerValidationErrors.gstin}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Status</label>
                <select
                  value={customerForm.status || 'Active'}
                  onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                  className="erp-input font-medium bg-white"
                >
                  <option value="Active">Active (Ongoing Site)</option>
                  <option value="Inactive">Inactive (Dormant Account)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sticky -bottom-5 sm:-bottom-6 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 pt-3 pb-3 px-5 sm:px-6 -mx-5 sm:-mx-6 border-t border-slate-200 mt-4 z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingCustomer ? 'Update Customer' : 'Save Customer & Work Details'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: CUSTOMER COMPLETE DOSSIER */}
      {/* ========================================================= */}
      {selectedCustomerDossier && (
        <Modal
          isOpen={Boolean(selectedCustomerDossier)}
          onClose={() => setSelectedCustomerDossier(null)}
          title={`Customer Profile: ${selectedCustomerDossier.name}`}
          subtitle={`ID: ${selectedCustomerDossier.id} • ${selectedCustomerDossier.customerType || 'Company'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Info Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-50/60 via-rose-50/30 to-slate-50 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                  {selectedCustomerDossier.category || 'Company'} {selectedCustomerDossier.designation ? `• ${selectedCustomerDossier.designation}` : ''}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCustomerDossier.companyName || selectedCustomerDossier.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {[selectedCustomerDossier.address, selectedCustomerDossier.city, selectedCustomerDossier.state].filter(Boolean).join(', ')}{selectedCustomerDossier.pincode ? ` - ${selectedCustomerDossier.pincode}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedCustomerDossier.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedCustomerDossier.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Contact Person</span>
                <strong className="text-slate-900 font-semibold">{selectedCustomerDossier.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Mobile / Alt</span>
                <strong className="text-slate-900 font-mono block">
                  {selectedCustomerDossier.phone || '—'}
                  {selectedCustomerDossier.alternatePhone && (
                    <span className="text-slate-500 font-normal block text-[10px]">{selectedCustomerDossier.alternatePhone}</span>
                  )}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Email</span>
                <strong className="text-slate-900 truncate block">{selectedCustomerDossier.email || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">GSTIN</span>
                <strong className="text-slate-900 font-mono">{selectedCustomerDossier.gstin || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">PAN Number</span>
                <strong className="text-slate-900 font-mono">{selectedCustomerDossier.pan || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Lead Source</span>
                <strong className="text-slate-900">{selectedCustomerDossier.leadSource || '—'}</strong>
              </div>
            </div>

            {/* Linked Construction Project Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Construction Project & Scope of Work Details
              </span>
              <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {selectedCustomerDossier.assignedProject || 'Site / Project Unassigned'}
                      </h4>
                      <span className="text-[11px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded inline-block mt-0.5">
                        {selectedCustomerDossier.workType === 'Other / Custom Work' ? (selectedCustomerDossier.customWorkType || 'Custom Work') : (selectedCustomerDossier.workType || 'Construction Work')}
                      </span>
                    </div>
                  </div>
                  {selectedCustomerDossier.assignedProject ? (
                    <span className="text-xs font-bold text-red-600 bg-white px-2.5 py-1 rounded-md border border-red-200 self-start sm:self-auto">
                      Active Site
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                      Pending Site Affiliation
                    </span>
                  )}
                </div>

                {selectedCustomerDossier.workDescription && (
                  <div className="p-2.5 bg-white rounded-lg border border-red-100 text-slate-700 text-xs">
                    <strong className="text-slate-900 block font-semibold mb-0.5">Scope of Work:</strong>
                    {selectedCustomerDossier.workDescription}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-red-100/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Contract Value / Budget:</span>
                    <strong className="text-emerald-700 font-mono text-sm">
                      {selectedCustomerDossier.contractValue ? formatCurrency(selectedCustomerDossier.contractValue) : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Assigned Site Engineer:</span>
                    <strong className="text-slate-800">
                      {selectedCustomerDossier.assignedEngineer || 'Unassigned'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const c = selectedCustomerDossier;
                    setSelectedCustomerDossier(null);
                    handleOpenEditCustomer(c);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Customer</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomerDossier(null);
                    navigate('/quotations');
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create Quotation</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomerDossier(null);
                    navigate('/projects');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Go to Site Work</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenAddFollowUp(selectedCustomerDossier.name, selectedCustomerDossier.phone);
                    setSelectedCustomerDossier(null);
                    setActiveTab('reminders');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  + Schedule Follow-up
                </button>
              </div>

              <button
                onClick={() => setSelectedCustomerDossier(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DELETE CUSTOMER CONFIRMATION */}
      {/* ========================================================= */}
      {customerToDelete && (
        <Modal
          isOpen={Boolean(customerToDelete)}
          onClose={() => setCustomerToDelete(null)}
          title="Confirm Customer Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Are you sure you want to delete this customer?</strong>
                <p className="mt-1 text-slate-600">
                  Customer: <strong>{customerToDelete.name}</strong> ({customerToDelete.id})
                </p>
                <p className="mt-1 text-slate-500 text-[11px]">
                  All associated contact records and project assignments will be unlinked. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCustomer}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT LEAD */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        title={leadModalTitle}
        subtitle="Record prospective inquiries, tender opportunities, civil requirements, and assignment details."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitLead} className="space-y-4 text-xs">
          {/* A. LEAD BASIC DETAILS */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                A. Lead Basic Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lead ID <span className="text-[10px] text-slate-400 font-normal">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={leadForm.id}
                  className="erp-input bg-slate-100/90 text-sky-600 font-mono font-bold cursor-not-allowed select-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Lead / Inquiry Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.leadTitle}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, leadTitle: e.target.value });
                    if (leadValidationErrors.leadTitle) setLeadValidationErrors(prev => ({ ...prev, leadTitle: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.leadTitle ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. Turnkey RCC Construction for Commercial Complex"
                />
                {leadValidationErrors.leadTitle && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.leadTitle}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lead Date <span className="text-[10px] text-slate-400 font-normal">(Auto current date)</span>
                </label>
                <input
                  type="date"
                  value={leadForm.leadDate}
                  onChange={(e) => setLeadForm({ ...leadForm, leadDate: e.target.value })}
                  className="erp-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer / Prospect Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.customerName}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, customerName: e.target.value });
                    if (leadValidationErrors.customerName) setLeadValidationErrors(prev => ({ ...prev, customerName: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.customerName ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. Prashant Patil"
                />
                {leadValidationErrors.customerName && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Developer Name</label>
                <input
                  type="text"
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Patil Developers LLP"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={leadForm.mobileNumber}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, mobileNumber: e.target.value });
                    if (leadValidationErrors.mobileNumber) setLeadValidationErrors(prev => ({ ...prev, mobileNumber: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.mobileNumber ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. 9822011223"
                />
                {leadValidationErrors.mobileNumber && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.mobileNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alternate Mobile Number</label>
                <input
                  type="tel"
                  value={leadForm.alternateMobileNumber}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, alternateMobileNumber: e.target.value });
                    if (leadValidationErrors.alternateMobileNumber) setLeadValidationErrors(prev => ({ ...prev, alternateMobileNumber: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.alternateMobileNumber ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. 9422033445"
                />
                {leadValidationErrors.alternateMobileNumber && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.alternateMobileNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, email: e.target.value });
                    if (leadValidationErrors.email) setLeadValidationErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.email ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. prashant.patil@example.com"
                />
                {leadValidationErrors.email && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* B. PROJECT DETAILS */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                B. Project Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <EditableSelect
                  value={leadForm.projectType}
                  onChange={(val) => {
                    setLeadForm({ ...leadForm, projectType: val });
                    if (leadValidationErrors.projectType) setLeadValidationErrors(prev => ({ ...prev, projectType: '' }));
                  }}
                  options={projectTypes}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_project_types', setProjectTypes, projectTypes, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_project_types', setProjectTypes, projectTypes, opt)}
                  placeholder="Select Project Type..."
                  error={leadValidationErrors.projectType}
                />
                {leadValidationErrors.projectType && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.projectType}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Name (Optional)</label>
                <input
                  type="text"
                  value={leadForm.projectName}
                  onChange={(e) => setLeadForm({ ...leadForm, projectName: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Shahu Industrial Cold Storage"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Estimated Project Budget (₹ INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={leadForm.estimatedBudget}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, estimatedBudget: e.target.value });
                    if (leadValidationErrors.estimatedBudget) setLeadValidationErrors(prev => ({ ...prev, estimatedBudget: '' }));
                  }}
                  className={`erp-input font-mono ${leadValidationErrors.estimatedBudget ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. 45000000"
                />
                {leadValidationErrors.estimatedBudget && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.estimatedBudget}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Project Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.projectLocation}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, projectLocation: e.target.value });
                    if (leadValidationErrors.projectLocation) setLeadValidationErrors(prev => ({ ...prev, projectLocation: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.projectLocation ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="e.g. Plot 42, Shiroli MIDC"
                />
                {leadValidationErrors.projectLocation && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.projectLocation}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.city}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, city: e.target.value });
                    if (leadValidationErrors.city) setLeadValidationErrors(prev => ({ ...prev, city: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.city ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="Kolhapur"
                />
                {leadValidationErrors.city && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={leadForm.state}
                  onChange={(e) => {
                    setLeadForm({ ...leadForm, state: e.target.value });
                    if (leadValidationErrors.state) setLeadValidationErrors(prev => ({ ...prev, state: '' }));
                  }}
                  className={`erp-input ${leadValidationErrors.state ? 'border-red-400 focus:border-red-500' : ''}`}
                  placeholder="Maharashtra"
                />
                {leadValidationErrors.state && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                PIN Code <span className="text-[10px] text-slate-400 font-normal">(Optional, 6 Digits)</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={leadForm.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setLeadForm({ ...leadForm, pincode: val });
                  if (leadValidationErrors.pincode) setLeadValidationErrors(prev => ({ ...prev, pincode: '' }));
                }}
                className={`erp-input font-mono max-w-xs ${leadValidationErrors.pincode ? 'border-red-400 focus:border-red-500' : ''}`}
                placeholder="416001"
              />
              {leadValidationErrors.pincode && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.pincode}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Project Description / Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={leadForm.leadDescription}
                onChange={(e) => {
                  setLeadForm({ ...leadForm, leadDescription: e.target.value });
                  if (leadValidationErrors.leadDescription) setLeadValidationErrors(prev => ({ ...prev, leadDescription: '' }));
                }}
                className={`erp-input ${leadValidationErrors.leadDescription ? 'border-red-400 focus:border-red-500' : ''}`}
                placeholder="e.g. Turnkey civil execution including PEB structural fabrication, grade slab flooring, boundary wall, and storm drainage."
              />
              {leadValidationErrors.leadDescription && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.leadDescription}</p>
              )}
            </div>
          </div>

          {/* C & D. LEAD SOURCE & ASSIGNMENT */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                C & D. Source, Assignment & Priority
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lead Source <span className="text-red-500">*</span>
                </label>
                <EditableSelect
                  value={leadForm.leadSource}
                  onChange={(val) => {
                    setLeadForm({ ...leadForm, leadSource: val });
                    if (leadValidationErrors.leadSource) setLeadValidationErrors(prev => ({ ...prev, leadSource: '' }));
                  }}
                  options={leadSourcesList}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_lead_sources', setLeadSourcesList, leadSourcesList, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_lead_sources', setLeadSourcesList, leadSourcesList, opt)}
                  placeholder="Select Lead Source..."
                  error={leadValidationErrors.leadSource}
                />
                {leadValidationErrors.leadSource && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.leadSource}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Employee</label>
                <EditableSelect
                  value={leadForm.assignedEmployee}
                  onChange={(val) => setLeadForm({ ...leadForm, assignedEmployee: val })}
                  options={combinedEmployeeList}
                  onAddOption={handleAddEmployee}
                  onRemoveOption={handleRemoveEmployee}
                  placeholder="Select Employee..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <EditableSelect
                  value={leadForm.department}
                  onChange={(val) => setLeadForm({ ...leadForm, department: val })}
                  options={departmentsList}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_departments', setDepartmentsList, departmentsList, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_departments', setDepartmentsList, departmentsList, opt)}
                  placeholder="Select Department..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <EditableSelect
                  value={leadForm.priority}
                  onChange={(val) => {
                    setLeadForm({ ...leadForm, priority: val });
                    if (leadValidationErrors.priority) setLeadValidationErrors(prev => ({ ...prev, priority: '' }));
                  }}
                  options={leadPrioritiesList}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_lead_priorities', setLeadPrioritiesList, leadPrioritiesList, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_lead_priorities', setLeadPrioritiesList, leadPrioritiesList, opt)}
                  placeholder="Select Priority..."
                  error={leadValidationErrors.priority}
                />
                {leadValidationErrors.priority && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{leadValidationErrors.priority}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={leadForm.nextFollowUpDate}
                  onChange={(e) => setLeadForm({ ...leadForm, nextFollowUpDate: e.target.value })}
                  className="erp-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lead Status</label>
                <select
                  value={leadForm.status}
                  onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                  className="erp-input font-bold"
                >
                  {LEAD_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* E & F. ADDITIONAL DETAILS & ATTACHMENTS */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                E & F. Notes / Remarks & Attachments
              </h4>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Notes / Internal Remarks (Optional)</label>
              <textarea
                rows={2}
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="erp-input"
                placeholder="Enter client background, soil report availability, or rate negotiation remarks..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-semibold">
                  Attachments (Enquiry Documents, Drawings, BOQ Files)
                </label>
                <label
                  htmlFor="lead-file-upload"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold border border-red-200 cursor-pointer transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                </label>
                <input
                  id="lead-file-upload"
                  type="file"
                  multiple
                  onChange={handleLeadFileUpload}
                  className="hidden"
                />
              </div>

              {leadForm.attachments && leadForm.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-slate-200">
                  {leadForm.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLeadAttachment(idx)}
                        className="text-slate-400 hover:text-red-600 p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No files attached yet. You can attach drawings, site photos, or BOQ files.</p>
              )}
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky -bottom-5 sm:-bottom-6 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 pt-3 pb-3 px-5 sm:px-6 -mx-5 sm:-mx-6 border-t border-slate-200 mt-4 z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setIsLeadModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              {editingLead ? 'Update Lead' : 'Save Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: CONVERT LEAD TO CUSTOMER CONFIRMATION */}
      {/* ========================================================= */}
      {leadToConvert && (
        <Modal
          isOpen={Boolean(leadToConvert)}
          onClose={() => {
            setLeadToConvert(null);
            setConversionProject('');
          }}
          title="Convert Lead into Registered Customer"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Lead Conversion Docket</span>
              <h4 className="text-sm font-bold text-slate-900">{leadToConvert.leadTitle}</h4>
              <div className="text-slate-600 space-y-1 pt-1 border-t border-red-200/60">
                <p>Prospect: <strong>{leadToConvert.customerName}</strong></p>
                {leadToConvert.companyName && <p>Company: <strong>{leadToConvert.companyName}</strong></p>}
                <p>Mobile: <strong className="font-mono">{leadToConvert.mobileNumber}</strong></p>
                <p>Estimated Budget: <strong className="text-emerald-700 font-mono">{formatCurrency(leadToConvert.estimatedBudget)}</strong></p>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Link Confirmed Construction Project (Optional)</label>
              <select
                value={conversionProject}
                onChange={(e) => setConversionProject(e.target.value)}
                className="erp-input text-xs"
              >
                <option value="">{leadToConvert.projectName || 'Independent Civil Work'}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Converting this lead will automatically link or create a new active Customer profile, log a conversion event in the Customer History timeline, and transition the lead status to <strong>Converted</strong>. Existing customer records with the same mobile number will be linked to prevent duplicate entries.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setLeadToConvert(null);
                  setConversionProject('');
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConvertLead}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Confirm Conversion</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: DELETE LEAD CONFIRMATION */}
      {/* ========================================================= */}
      {leadToDelete && (
        <Modal
          isOpen={Boolean(leadToDelete)}
          onClose={() => setLeadToDelete(null)}
          title="Confirm Lead Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Delete this lead inquiry?</strong>
                <p className="mt-1 text-slate-600">
                  Lead: <strong>{leadToDelete.leadTitle}</strong> ({leadToDelete.id})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLeadToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteLead}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: VIEW LEAD DETAILS */}
      {/* ========================================================= */}
      {selectedLeadDetails && (
        <Modal
          isOpen={Boolean(selectedLeadDetails)}
          onClose={() => setSelectedLeadDetails(null)}
          title={`Lead Details: ${selectedLeadDetails.leadTitle}`}
          subtitle={`ID: ${selectedLeadDetails.id} • Status: ${selectedLeadDetails.status}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Info Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/70 via-slate-50 to-white border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  {selectedLeadDetails.projectType || 'Civil Project'} • {selectedLeadDetails.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{selectedLeadDetails.leadTitle}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Registered Date: {formatDate(selectedLeadDetails.leadDate || selectedLeadDetails.createdDate)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  selectedLeadDetails.priority === 'High' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : selectedLeadDetails.priority === 'Medium' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  Priority: {selectedLeadDetails.priority || 'Medium'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedLeadDetails.status === 'Converted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedLeadDetails.status === 'Negotiation'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : selectedLeadDetails.status === 'Interested'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  {selectedLeadDetails.status}
                </span>
              </div>
            </div>

            {/* A. Prospect Contact & Company Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Customer / Prospect</span>
                <strong className="text-slate-900 font-semibold">{selectedLeadDetails.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Company / Developer</span>
                <strong className="text-slate-900 font-semibold">{selectedLeadDetails.companyName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Mobile / Alternate</span>
                <strong className="text-slate-900 font-mono block">
                  {selectedLeadDetails.mobileNumber}
                  {selectedLeadDetails.alternateMobileNumber && (
                    <span className="text-slate-500 font-normal block text-[10px]">{selectedLeadDetails.alternateMobileNumber}</span>
                  )}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Email Address</span>
                <strong className="text-slate-900 truncate block">{selectedLeadDetails.email || '—'}</strong>
              </div>
            </div>

            {/* B. Construction Project Requirements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Project Type</span>
                <strong className="text-slate-900 font-semibold">{selectedLeadDetails.projectType || 'Residential Building'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Project Name</span>
                <strong className="text-slate-900 font-semibold">{selectedLeadDetails.projectName || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Location & City</span>
                <strong className="text-slate-900 font-semibold">
                  {selectedLeadDetails.projectLocation}, {selectedLeadDetails.city || 'Kolhapur'}{selectedLeadDetails.pincode ? ` - ${selectedLeadDetails.pincode}` : ''}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Estimated Budget</span>
                <strong className="text-emerald-700 font-mono text-sm block">
                  {formatCurrency(Number(selectedLeadDetails.estimatedBudget) || 0)}
                </strong>
              </div>
            </div>

            {/* C. Source & Assignment Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Lead Source</span>
                <strong className="text-slate-800">{selectedLeadDetails.leadSource || 'Website'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Assigned Employee</span>
                <strong className="text-slate-800">{selectedLeadDetails.assignedEmployee || 'Unassigned'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Department</span>
                <strong className="text-slate-800">{selectedLeadDetails.department || 'Civil Engineering'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Next Follow-up</span>
                <strong className="text-slate-800">
                  {selectedLeadDetails.nextFollowUpDate || selectedLeadDetails.followUpDate ? formatDate(selectedLeadDetails.nextFollowUpDate || selectedLeadDetails.followUpDate) : 'Not Scheduled'}
                </strong>
              </div>
            </div>

            {/* Project Scope Description */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Project Description / Requirements</span>
              <p className="text-slate-700 leading-relaxed">{selectedLeadDetails.leadDescription || 'No description provided.'}</p>
            </div>

            {/* Notes & Attachments */}
            {(selectedLeadDetails.notes || (selectedLeadDetails.attachments && selectedLeadDetails.attachments.length > 0)) && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                {selectedLeadDetails.notes && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Notes / Remarks</span>
                    <p className="text-slate-700">{selectedLeadDetails.notes}</p>
                  </div>
                )}
                {selectedLeadDetails.attachments && selectedLeadDetails.attachments.length > 0 && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Attached Files</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLeadDetails.attachments.map((file, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                          <span>{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Follow-up History Linked to this Lead */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Follow-up History & Schedules ({followUps.filter(f => f.entityId === selectedLeadDetails.id || (f.contactNumber && f.contactNumber === selectedLeadDetails.mobileNumber)).length})
                </span>
                <button
                  onClick={() => {
                    handleOpenAddFollowUp(selectedLeadDetails.customerName, selectedLeadDetails.mobileNumber);
                    setSelectedLeadDetails(null);
                    setActiveTab('reminders');
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
                >
                  + Schedule Follow-up
                </button>
              </div>

              {followUps.filter(f => f.entityId === selectedLeadDetails.id || (f.contactNumber && f.contactNumber === selectedLeadDetails.mobileNumber)).length > 0 ? (
                <div className="space-y-1.5">
                  {followUps
                    .filter(f => f.entityId === selectedLeadDetails.id || (f.contactNumber && f.contactNumber === selectedLeadDetails.mobileNumber))
                    .map((fu, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <div>
                            <span className="font-semibold text-slate-800">{fu.followUpType} on {formatDate(fu.followUpDate)} at {fu.followUpTime || '11:00'}</span>
                            {fu.reminderNotes && <p className="text-[11px] text-slate-500">{fu.reminderNotes}</p>}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          fu.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          fu.status === 'Missed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {fu.status}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No scheduled follow-up records found for this lead inquiry.</p>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {selectedLeadDetails.status !== 'Converted' && (
                  <button
                    onClick={() => {
                      setLeadToConvert(selectedLeadDetails);
                      setConversionProject(selectedLeadDetails.projectName || '');
                      setSelectedLeadDetails(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    Convert to Customer
                  </button>
                )}
                <button
                  onClick={() => {
                    handleOpenEditLead(selectedLeadDetails);
                    setSelectedLeadDetails(null);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
                >
                  Edit Lead Details
                </button>
              </div>

              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: SCHEDULE FOLLOW-UP */}
      {/* ========================================================= */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Schedule Follow-up Reminder"
        subtitle="Set meeting, call, or site visit reminders with automated dashboard notifications."
      >
        <form onSubmit={handleSubmitFollowUp} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Lead Name *</label>
              <input
                type="text"
                required
                value={followUpForm.customerName}
                onChange={(e) => setFollowUpForm({ ...followUpForm, customerName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Adv. Rahul Shinde"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
              <input
                type="tel"
                value={followUpForm.contactNumber}
                onChange={(e) => setFollowUpForm({ ...followUpForm, contactNumber: e.target.value })}
                className="erp-input"
                placeholder="e.g. +91 98224 55112"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Follow-up Date *</label>
              <input
                type="date"
                required
                value={followUpForm.followUpDate}
                onChange={(e) => setFollowUpForm({ ...followUpForm, followUpDate: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Follow-up Time *</label>
              <input
                type="time"
                required
                value={followUpForm.followUpTime}
                onChange={(e) => setFollowUpForm({ ...followUpForm, followUpTime: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Type</label>
              <EditableSelect
                value={followUpForm.followUpType}
                onChange={(val) => setFollowUpForm({ ...followUpForm, followUpType: val })}
                options={followUpTypesList}
                onAddOption={(newOpt) => handleAddOption('sanmati_crm_followup_types', setFollowUpTypesList, followUpTypesList, newOpt)}
                onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_followup_types', setFollowUpTypesList, followUpTypesList, opt)}
                placeholder="Select Type..."
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assigned Employee</label>
            <EditableSelect
              value={followUpForm.assignedEmployee}
              onChange={(val) => setFollowUpForm({ ...followUpForm, assignedEmployee: val })}
              options={combinedEmployeeList}
              onAddOption={handleAddEmployee}
              onRemoveOption={handleRemoveEmployee}
              placeholder="Select Employee..."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Reminder Notes / Agenda</label>
            <textarea
              rows={3}
              value={followUpForm.reminderNotes}
              onChange={(e) => setFollowUpForm({ ...followUpForm, reminderNotes: e.target.value })}
              className="erp-input"
              placeholder="e.g. Site inspection meeting to verify soil load-bearing capacity report."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 9: RESCHEDULE FOLLOW-UP */}
      {/* ========================================================= */}
      {reschedulingFollowUp && (
        <Modal
          isOpen={Boolean(reschedulingFollowUp)}
          onClose={() => setReschedulingFollowUp(null)}
          title={`Reschedule Follow-up: ${reschedulingFollowUp.customerName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <span>Current Schedule:</span>
              <strong className="block text-sm mt-0.5">
                {formatDate(reschedulingFollowUp.followUpDate)} at {reschedulingFollowUp.followUpTime}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="erp-input"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Time *</label>
                <input
                  type="time"
                  required
                  value={rescheduleData.newTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                  className="erp-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Rescheduling</label>
              <textarea
                rows={2}
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                className="erp-input"
                placeholder="e.g. Client requested postponement due to municipal committee meeting."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingFollowUp(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Save New Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: COMPLETE FOLLOW-UP DIALOG */}
      {/* ========================================================= */}
      {completingFollowUp && (
        <Modal
          isOpen={Boolean(completingFollowUp)}
          onClose={() => setCompletingFollowUp(null)}
          title={`Complete Follow-up: ${completingFollowUp.customerName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Mark this interaction with <strong>{completingFollowUp.customerName}</strong> as completed. The outcome notes will automatically be archived into the customer's chronological activity history.
            </p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Outcome / Meeting Minutes</label>
              <textarea
                rows={3}
                value={completeFollowUpNotes}
                onChange={(e) => setCompleteFollowUpNotes(e.target.value)}
                className="erp-input"
                placeholder="e.g. Reviewed BOQ item rates, client agreed in principle, preparing formal draft agreement."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCompletingFollowUp(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteFollowUp}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Completed & Log</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 11: DELETE FOLLOW-UP CONFIRMATION */}
      {/* ========================================================= */}
      {followUpToDelete && (
        <Modal
          isOpen={Boolean(followUpToDelete)}
          onClose={() => setFollowUpToDelete(null)}
          title="Delete Follow-up Reminder"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove reminder for <strong>{followUpToDelete.customerName}</strong> scheduled on {formatDate(followUpToDelete.followUpDate)}?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFollowUpToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteFollowUp(followUpToDelete.id);
                  setFollowUpToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 12: LOG / EDIT CUSTOMER ACTIVITY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title={editingActivity ? "Edit Customer Interaction Activity" : "Log Customer Interaction Activity"}
        subtitle={editingActivity 
          ? "Update discussion minutes, outcome status, or follow-up schedule." 
          : "Record client meetings, technical consultations, calls, or site visits in the permanent audit dossier."}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitActivity} className="space-y-4 text-xs">
          {/* Section 1: Customer & Project Details */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                1. Customer & Project Affiliation
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer / Client Name <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={activityForm.customerName}
                  onChange={(e) => handleActivityCustomerChange(e.target.value)}
                  className={`erp-input ${activityValidationErrors.customerName ? 'border-red-400 focus:border-red-500' : ''}`}
                >
                  <option value="">-- Select Customer from Records --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.companyName && c.companyName !== c.name ? `(${c.companyName})` : ''} - {c.id}
                    </option>
                  ))}
                </select>
                {activityValidationErrors.customerName && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{activityValidationErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Project Name
                </label>
                <select
                  value={activityForm.projectName}
                  onChange={(e) => setActivityForm({ ...activityForm, projectName: e.target.value })}
                  className="erp-input"
                >
                  <option value="">-- Select Project (Optional) --</option>
                  {projects.map(p => (
                    <option key={p.id || p.name} value={p.name}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                  <option value="General Construction Inquiry">General Construction Inquiry / Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={activityForm.contactPerson}
                  onChange={(e) => setActivityForm({ ...activityForm, contactPerson: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Er. Pravin Patil (Site Engineer)"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={activityForm.contactNumber}
                  onChange={(e) => setActivityForm({ ...activityForm, contactNumber: e.target.value })}
                  className="erp-input font-mono"
                  placeholder="e.g. +91 98224 55112"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Activity Schedule & Conducted By */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                2. Activity Schedule & Team
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Activity Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={activityForm.activityDate}
                  onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })}
                  className="erp-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Activity Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={activityForm.activityTime}
                  onChange={(e) => setActivityForm({ ...activityForm, activityTime: e.target.value })}
                  className="erp-input"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Activity Type <span className="text-red-500">*</span>
                </label>
                <EditableSelect
                  value={activityForm.activityType}
                  onChange={(val) => {
                    setActivityForm({ ...activityForm, activityType: val });
                    if (activityValidationErrors.activityType) {
                      setActivityValidationErrors(prev => ({ ...prev, activityType: '' }));
                    }
                  }}
                  options={activityTypesList}
                  onAddOption={(newOpt) => handleAddOption('sanmati_crm_activity_types', setActivityTypesList, activityTypesList, newOpt)}
                  onRemoveOption={(opt) => handleRemoveOption('sanmati_crm_activity_types', setActivityTypesList, activityTypesList, opt)}
                  placeholder="Select Activity Type..."
                  error={activityValidationErrors.activityType}
                />
                {activityValidationErrors.activityType && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{activityValidationErrors.activityType}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Conducted By <span className="text-[10px] text-slate-400 font-normal">(Staff / Engineer)</span>
                </label>
                <EditableSelect
                  value={activityForm.conductedBy || activityForm.employeeName}
                  onChange={(val) => setActivityForm({ ...activityForm, conductedBy: val, employeeName: val })}
                  options={combinedEmployeeList}
                  onAddOption={handleAddEmployee}
                  onRemoveOption={handleRemoveEmployee}
                  placeholder="Select Employee..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Activity Status</label>
                <select
                  value={activityForm.status}
                  onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                  className="erp-input"
                >
                  {ACTIVITY_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Subject & Discussion Details */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                3. Discussion Details & Minutes
              </h4>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject / Agenda</label>
              <input
                type="text"
                value={activityForm.subject}
                onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                className="erp-input"
                placeholder="e.g. RCC Slab casting inspection and revision of milestone payment"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Discussion Details / Key Minutes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={activityForm.discussionDetails}
                onChange={(e) => setActivityForm({ ...activityForm, discussionDetails: e.target.value })}
                className="erp-input"
                placeholder="Record detailed points discussed, technical clarifications, structural approvals, BOQ rate agreements..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer Response / Feedback</label>
                <textarea
                  rows={2}
                  value={activityForm.customerResponse}
                  onChange={(e) => setActivityForm({ ...activityForm, customerResponse: e.target.value })}
                  className="erp-input"
                  placeholder="Client's reaction, verbal consent, suggestions, or concerns raised..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Action Required</label>
                <textarea
                  rows={2}
                  value={activityForm.nextAction}
                  onChange={(e) => setActivityForm({ ...activityForm, nextAction: e.target.value })}
                  className="erp-input"
                  placeholder="Actionable next step (e.g. submit revised architectural drawing, site visit)..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Follow-up, Attachment & Remarks */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                4. Follow-up & Attachments
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Next Follow-up Date <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={activityForm.nextFollowUpDate}
                  onChange={(e) => setActivityForm({ ...activityForm, nextFollowUpDate: e.target.value })}
                  className="erp-input"
                />
                <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                  Setting a date will automatically schedule a reminder in the Follow-up Reminders module.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Attachment <span className="text-[10px] text-slate-400 font-normal">(Image, PDF, Document)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activityForm.attachments}
                    onChange={(e) => setActivityForm({ ...activityForm, attachments: e.target.value })}
                    className="erp-input font-mono flex-1"
                    placeholder="e.g. Site_Inspection_Photo.jpg"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1 flex-shrink-0">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Browse</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setActivityForm({ ...activityForm, attachments: e.target.files[0].name });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Remarks / Internal Notes</label>
              <textarea
                rows={2}
                value={activityForm.remarks}
                onChange={(e) => setActivityForm({ ...activityForm, remarks: e.target.value })}
                className="erp-input"
                placeholder="Internal confidential observations, pricing leeway, or risk factors..."
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="sticky -bottom-5 sm:-bottom-6 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 pt-3 pb-3 px-5 sm:px-6 -mx-5 sm:-mx-6 border-t border-slate-200 mt-4 z-10 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Activity</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 13: VIEW FULL DISCUSSION NOTES */}
      {/* ========================================================= */}
      {selectedDiscussion && (
        <Modal
          isOpen={Boolean(selectedDiscussion)}
          onClose={() => setSelectedDiscussion(null)}
          title={`Interaction Log: ${selectedDiscussion.customerName}`}
          subtitle={`${selectedDiscussion.activityType || 'Activity'} • ${selectedDiscussion.activityDate || selectedDiscussion.dateTime}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  {selectedDiscussion.activityType}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                  selectedDiscussion.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  selectedDiscussion.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-rose-100 text-rose-800 border-rose-200'
                }`}>
                  {selectedDiscussion.status || 'Completed'}
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                📅 {selectedDiscussion.activityDate ? `${selectedDiscussion.activityDate} ${selectedDiscussion.activityTime || ''}` : selectedDiscussion.dateTime}
              </span>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
                <strong className="text-slate-900 block truncate">{selectedDiscussion.customerName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Project</span>
                <span className="text-slate-800 font-semibold block truncate">{selectedDiscussion.projectName || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Conducted By</span>
                <span className="text-slate-800 font-semibold block truncate">{selectedDiscussion.conductedBy || selectedDiscussion.employeeName || 'Admin'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Person</span>
                <span className="text-slate-700 block truncate">{selectedDiscussion.contactPerson || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Number</span>
                <span className="text-slate-700 font-mono block">{selectedDiscussion.contactNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Follow-up</span>
                <span className="text-amber-700 font-bold block">{selectedDiscussion.nextFollowUpDate ? formatDate(selectedDiscussion.nextFollowUpDate) : 'None'}</span>
              </div>
            </div>

            {/* Subject */}
            {selectedDiscussion.subject && (
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-200/80">
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block mb-0.5">Subject / Agenda</span>
                <h4 className="text-sm font-bold text-slate-900">{selectedDiscussion.subject}</h4>
              </div>
            )}

            {/* Discussion Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                Discussion Details / Meeting Minutes
              </span>
              <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedDiscussion.discussionDetails}
              </div>
            </div>

            {/* Customer Response & Next Action */}
            {(selectedDiscussion.customerResponse || selectedDiscussion.nextAction) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDiscussion.customerResponse && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Customer Response
                    </span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedDiscussion.customerResponse}
                    </p>
                  </div>
                )}
                {selectedDiscussion.nextAction && (
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block mb-1">
                      Next Action Required
                    </span>
                    <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {selectedDiscussion.nextAction}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Attachment */}
            {(selectedDiscussion.attachments || selectedDiscussion.attachment) && (
              <div className="flex items-center gap-2 p-3 bg-red-50/60 rounded-xl border border-red-200 text-red-900">
                <Paperclip className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="font-mono text-xs">Attachment: <strong>{selectedDiscussion.attachments || selectedDiscussion.attachment}</strong></span>
              </div>
            )}

            {/* Remarks */}
            {selectedDiscussion.remarks && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Remarks / Internal Notes</span>
                <p className="whitespace-pre-wrap">{selectedDiscussion.remarks}</p>
              </div>
            )}

            {/* Audit Trail */}
            <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
              <span>Created: {selectedDiscussion.createdBy || 'Admin'} • {formatDate(selectedDiscussion.createdDate || selectedDiscussion.dateTime)}</span>
              {selectedDiscussion.updatedDate && (
                <span>Last Updated: {selectedDiscussion.updatedBy || 'Admin'} • {formatDate(selectedDiscussion.updatedDate)}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = selectedDiscussion;
                    setSelectedDiscussion(null);
                    handleOpenEditActivity(toEdit);
                  }}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Activity</span>
                </button>
                <button
                  onClick={() => {
                    const toDel = selectedDiscussion;
                    setSelectedDiscussion(null);
                    setActivityToDelete(toDel);
                  }}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDiscussion(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 14: DELETE ACTIVITY CONFIRMATION */}
      {/* ========================================================= */}
      {activityToDelete && (
        <Modal
          isOpen={Boolean(activityToDelete)}
          onClose={() => setActivityToDelete(null)}
          title="Confirm Delete Activity Log"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Are you sure you want to delete this interaction log?</strong>
                <p className="mt-1 text-slate-600">
                  Customer: <strong>{activityToDelete.customerName}</strong> ({activityToDelete.activityType}) on {activityToDelete.activityDate || activityToDelete.dateTime}
                </p>
                <p className="mt-1 text-slate-500 text-[11px]">
                  This activity log will be permanently removed from the customer's chronological dossier.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActivityToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCustomerActivity(activityToDelete.id);
                  setActivityToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
