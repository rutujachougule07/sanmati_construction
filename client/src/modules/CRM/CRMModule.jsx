// MODULE 1: CRM MANAGEMENT - Complete Working Implementation
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Users, Phone, Mail, MapPin, Building, Calendar, CheckCircle2, Clock, 
  Briefcase, History, AlertCircle, ArrowRight, UserCheck, Trash2, Edit3, 
  Eye, FileText, Check, X, AlertTriangle, ArrowUpRight, Search, Filter, 
  Download, Send, Paperclip, ChevronRight, RefreshCw, CalendarDays, User
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../services/exportService';

const CUSTOMER_TYPES = ['Company', 'Individual'];
const CUSTOMER_STATUSES = ['Active', 'Inactive'];
const LEAD_STATUSES = ['New', 'Contacted', 'Interested', 'Negotiation', 'Converted', 'Lost'];
const LEAD_SOURCES = ['Website', 'Phone', 'Reference', 'Other'];
const ENQUIRY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation', 'Turnkey Civil'];
const FOLLOWUP_TYPES = ['Call', 'Meeting', 'Email', 'Site Visit'];
const CRM_EMPLOYEES = [
  'Sanmati Patil',
  'Er. Rajesh Kulkarni',
  'Er. Amit Deshmukh',
  'CA Sneha Shinde',
  'Mahesh Yadav',
  'Ganesh Powar',
  'Pooja Jadhav',
  'Suresh Bhosale'
];

export const CRMModule = () => {
  const { 
    clients, 
    projects = [],
    leads = [],
    followUps = [],
    customerActivities = [],
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
    deleteCustomerActivity
  } = useERPData();

  const [searchParams, setSearchParams] = useSearchParams();
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
  const [followUpFilterTab, setFollowUpFilterTab] = useState('All'); // All, Today, Upcoming, Missed, Completed
  const [historyEmployeeFilter, setHistoryEmployeeFilter] = useState('All');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historyCustomerFilter, setHistoryCustomerFilter] = useState('All');

  // -------------------------------------------------------------
  // FORM STATES
  // -------------------------------------------------------------
  const [customerForm, setCustomerForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    gstin: '',
    customerType: 'Company',
    assignedProject: '',
    status: 'Active'
  });

  const [leadForm, setLeadForm] = useState({
    leadTitle: '',
    customerName: '',
    mobileNumber: '',
    email: '',
    enquiryType: 'Residential',
    projectName: '',
    projectLocation: 'Kolhapur',
    estimatedBudget: '',
    leadSource: 'Website',
    assignedEmployee: 'Er. Rajesh Kulkarni',
    followUpDate: new Date().toISOString().split('T')[0],
    leadDescription: '',
    status: 'New'
  });

  const [followUpForm, setFollowUpForm] = useState({
    customerName: '',
    contactNumber: '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '10:30',
    followUpType: 'Call',
    assignedEmployee: 'Er. Rajesh Kulkarni',
    reminderNotes: '',
    status: 'Pending'
  });

  const [rescheduleData, setRescheduleData] = useState({
    newDate: new Date().toISOString().split('T')[0],
    newTime: '11:00',
    reason: ''
  });

  const [completeFollowUpNotes, setCompleteFollowUpNotes] = useState('');

  const [activityForm, setActivityForm] = useState({
    customerId: '',
    customerName: '',
    dateTime: new Date().toISOString().slice(0, 16),
    activityType: 'Meeting',
    discussionDetails: '',
    employeeName: 'Er. Rajesh Kulkarni',
    nextFollowUpDate: '',
    attachments: ''
  });

  // -------------------------------------------------------------
  // 1. CUSTOMER DETAILS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      gstin: '',
      customerType: 'Company',
      assignedProject: '',
      status: 'Active'
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name || '',
      companyName: customer.companyName || customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Kolhapur',
      state: customer.state || 'Maharashtra',
      gstin: customer.gstin || '',
      customerType: customer.customerType || 'Company',
      assignedProject: customer.assignedProject || '',
      status: customer.status || 'Active'
    });
    setIsCustomerModalOpen(true);
  };

  const handleSubmitCustomer = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerForm);
    } else {
      addCustomer(customerForm);
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
      headers: ["Customer ID", "Customer / Company", "Type", "Mobile", "GSTIN", "Assigned Project", "Status"],
      rows: filteredCustomers.map(c => [
        c.id,
        c.name,
        c.customerType || 'Company',
        c.phone || '—',
        c.gstin || '—',
        c.assignedProject || '—',
        c.status || 'Active'
      ]),
      fileName: "Sanmati_Customer_Directory",
      orientation: "landscape"
    });
  };

  const customerColumns = [
    { 
      key: 'id', 
      header: 'Customer ID', 
      minWidth: '120px', 
      nowrap: true, 
      render: (row) => <span className="font-bold text-red-600 font-mono whitespace-nowrap">{row.id}</span> 
    },
    {
      key: 'name',
      header: 'Customer & Company',
      minWidth: '220px',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block leading-snug">{row.name}</span>
          <span className="text-[11px] text-slate-500 font-medium">{row.companyName || row.name}</span>
        </div>
      )
    },
    {
      key: 'customerType',
      header: 'Type',
      minWidth: '120px',
      nowrap: true,
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
          row.customerType === 'Individual' 
            ? 'bg-purple-50 text-purple-700 border-purple-200' 
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          {row.customerType || 'Company'}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Mobile / Email',
      minWidth: '180px',
      nowrap: true,
      render: (row) => (
        <div className="text-xs whitespace-nowrap">
          <p className="text-slate-800 font-medium flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{row.phone || '—'}</span>
          </p>
          <p className="text-slate-500 text-[11px] flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.email || '—'}</span>
          </p>
        </div>
      )
    },
    {
      key: 'location',
      header: 'City & State',
      minWidth: '140px',
      nowrap: true,
      render: (row) => (
        <span className="text-slate-700 text-xs whitespace-nowrap">
          {row.city || 'Kolhapur'}, {row.state || 'MH'}
        </span>
      )
    },
    { 
      key: 'gstin', 
      header: 'GSTIN', 
      minWidth: '150px', 
      nowrap: true, 
      render: (row) => <span className="font-mono text-[11px] text-slate-600 whitespace-nowrap">{row.gstin || '—'}</span> 
    },
    {
      key: 'assignedProject',
      header: 'Assigned Project',
      minWidth: '180px',
      render: (row) => (
        <div className="truncate max-w-[170px]" title={row.assignedProject || 'Not Assigned'}>
          {row.assignedProject ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 text-[11px] font-semibold border border-red-200/80">
              <Building className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{row.assignedProject}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs italic">Unassigned</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      minWidth: '110px',
      nowrap: true,
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
          row.status === 'Active' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.status || 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '170px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => setSelectedCustomerDossier(row)}
            title="View Complete Customer Dossier"
            className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEditCustomer(row)}
            title="Edit Customer"
            className="p-1.5 bg-slate-100 hover:bg-amber-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCustomerToDelete(row)}
            title="Delete Customer"
            className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
    setLeadForm({
      leadTitle: '',
      customerName: '',
      mobileNumber: '',
      email: '',
      enquiryType: 'Residential',
      projectName: '',
      projectLocation: 'Kolhapur',
      estimatedBudget: '',
      leadSource: 'Website',
      assignedEmployee: 'Er. Rajesh Kulkarni',
      followUpDate: new Date().toISOString().split('T')[0],
      leadDescription: '',
      status: 'New'
    });
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead) => {
    setEditingLead(lead);
    setLeadForm({
      leadTitle: lead.leadTitle || '',
      customerName: lead.customerName || '',
      mobileNumber: lead.mobileNumber || '',
      email: lead.email || '',
      enquiryType: lead.enquiryType || 'Residential',
      projectName: lead.projectName || '',
      projectLocation: lead.projectLocation || 'Kolhapur',
      estimatedBudget: lead.estimatedBudget || '',
      leadSource: lead.leadSource || 'Website',
      assignedEmployee: lead.assignedEmployee || 'Er. Rajesh Kulkarni',
      followUpDate: lead.followUpDate || '',
      leadDescription: lead.leadDescription || '',
      status: lead.status || 'New'
    });
    setIsLeadModalOpen(true);
  };

  const handleSubmitLead = (e) => {
    e.preventDefault();
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
      convertLeadToCustomer(leadToConvert.id);
      setLeadToConvert(null);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (leadStatusFilter !== 'All' && l.status !== leadStatusFilter) return false;
      if (leadSourceFilter !== 'All' && l.leadSource !== leadSourceFilter) return false;
      return true;
    });
  }, [leads, leadStatusFilter, leadSourceFilter]);

  const totalPipelineValue = useMemo(() => {
    return leads.reduce((acc, l) => acc + (Number(l.estimatedBudget) || 0), 0);
  }, [leads]);

  const convertedLeadsCount = useMemo(() => {
    return leads.filter(l => l.status === 'Converted').length;
  }, [leads]);

  const leadConversionRate = useMemo(() => {
    if (leads.length === 0) return '0.0%';
    return `${((convertedLeadsCount / leads.length) * 100).toFixed(1)}%`;
  }, [leads, convertedLeadsCount]);

  const leadColumns = [
    { 
      key: 'id', 
      header: 'Lead ID', 
      minWidth: '130px', 
      nowrap: true, 
      render: (row) => <span className="font-bold text-sky-600 font-mono whitespace-nowrap">{row.id}</span> 
    },
    {
      key: 'leadTitle',
      header: 'Lead Title & Project',
      minWidth: '220px',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block leading-snug">{row.leadTitle}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {row.projectName || row.enquiryType} • {row.projectLocation}
          </span>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Prospect Contact',
      minWidth: '180px',
      nowrap: true,
      render: (row) => (
        <div className="text-xs whitespace-nowrap">
          <p className="text-slate-800 font-bold">{row.customerName}</p>
          <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
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
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {row.leadSource || 'Website'}
        </span>
      )
    },
    {
      key: 'assignedEmployee',
      header: 'Assigned Lead',
      minWidth: '160px',
      nowrap: true,
      render: (row) => (
        <span className="text-slate-700 text-xs font-medium whitespace-nowrap">
          {row.assignedEmployee || 'Unassigned'}
        </span>
      )
    },
    {
      key: 'followUpDate',
      header: 'Next Follow-up',
      minWidth: '130px',
      nowrap: true,
      render: (row) => (
        <span className="text-xs font-mono text-slate-700 whitespace-nowrap">
          {row.followUpDate ? formatDate(row.followUpDate) : '—'}
        </span>
      )
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
              onClick={() => setLeadToConvert(row)}
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
            className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEditLead(row)}
            title="Edit Lead"
            className="p-1.5 bg-slate-100 hover:bg-amber-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLeadToDelete(row)}
            title="Delete Lead"
            className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
      assignedEmployee: 'Er. Rajesh Kulkarni',
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
    setActivityForm({
      customerId: prefillCustomer?.id || '',
      customerName: prefillCustomer?.name || '',
      dateTime: new Date().toISOString().slice(0, 16),
      activityType: 'Meeting',
      discussionDetails: '',
      employeeName: 'Er. Rajesh Kulkarni',
      nextFollowUpDate: '',
      attachments: ''
    });
    setIsActivityModalOpen(true);
  };

  const handleSubmitActivity = (e) => {
    e.preventDefault();
    addCustomerActivity(activityForm);
    setIsActivityModalOpen(false);
  };

  const filteredActivities = useMemo(() => {
    return customerActivities.filter(a => {
      if (historyEmployeeFilter !== 'All' && a.employeeName !== historyEmployeeFilter) return false;
      if (historyCustomerFilter !== 'All' && a.customerName !== historyCustomerFilter) return false;
      if (historyDateFilter && !a.dateTime.startsWith(historyDateFilter)) return false;
      return true;
    });
  }, [customerActivities, historyEmployeeFilter, historyCustomerFilter, historyDateFilter]);

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
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
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
            searchKey="name"
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
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
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
              <span className="text-[11px] text-slate-400 font-medium">Across all sources</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Pipeline Value</span>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                {formatCurrency(totalPipelineValue)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Estimated project budget</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Conversion Rate</span>
              <div className="text-lg font-bold text-red-600 mt-1">{leadConversionRate}</div>
              <span className="text-[11px] text-red-500 font-medium">{convertedLeadsCount} converted to clients</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Active Negotiations</span>
              <div className="text-lg font-bold text-purple-600 mt-1">
                {leads.filter(l => l.status === 'Negotiation' || l.status === 'Interested').length}
              </div>
              <span className="text-[11px] text-purple-500 font-medium">Hot prospects</span>
            </div>
          </div>

          {/* Lead Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-bold mr-1 uppercase">Status:</span>
              {['All', ...LEAD_STATUSES].map(status => (
                <button
                  key={status}
                  onClick={() => setLeadStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    leadStatusFilter === status 
                      ? 'bg-red-600 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase">Source:</span>
              <select
                value={leadSourceFilter}
                onChange={(e) => setLeadSourceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-red-500"
              >
                <option value="All">All Sources</option>
                {LEAD_SOURCES.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <DataTable
            columns={leadColumns}
            data={filteredLeads}
            searchKey="leadTitle"
            searchPlaceholder="Search leads by title, customer name, project or employee..."
            title="Lead Pipeline"
            exportFileName="Sanmati_Leads"
            emptyMessage="No leads match your filter. Click 'Add New Lead' to register a new inquiry."
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
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
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
                  ? 'bg-red-50/80 border-red-300 ring-2 ring-red-200' 
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Upcoming</span>
              </span>
              <div className="text-lg font-bold text-red-800 mt-1">{upcomingFollowUpsCount}</div>
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
                className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1"
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
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Customer Interaction History & Activity Logs
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Comprehensive chronological log of calls, technical meetings, site visits, and commercial negotiations.</p>
            </div>

            <button
              onClick={() => handleOpenAddActivity()}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Activity</span>
            </button>
          </div>

          {/* Activity Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Customer Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Customer:</span>
                <select
                  value={historyCustomerFilter}
                  onChange={(e) => setHistoryCustomerFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Customers ({clients.length})</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Employee Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Conducted By:</span>
                <select
                  value={historyEmployeeFilter}
                  onChange={(e) => setHistoryEmployeeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Team Members</option>
                  {CRM_EMPLOYEES.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Date:</span>
                <input
                  type="date"
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
                {historyDateFilter && (
                  <button 
                    onClick={() => setHistoryDateFilter('')}
                    className="text-slate-400 hover:text-slate-700 text-xs underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredActivities.length}</strong> logged interactions
            </div>
          </div>

          {/* Activity Timeline List */}
          {filteredActivities.length > 0 ? (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                let badgeColor = 'bg-red-100 text-red-700';
                if (act.activityType === 'Site Visit') badgeColor = 'bg-emerald-100 text-emerald-800';
                if (act.activityType === 'Meeting') badgeColor = 'bg-purple-100 text-purple-800';
                if (act.activityType === 'Email') badgeColor = 'bg-amber-100 text-amber-800';

                return (
                  <div 
                    key={act.id} 
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-red-500/60 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center flex-shrink-0 text-xs ${badgeColor}`}>
                        {act.activityType.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                            {act.activityType}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {act.dateTime}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                          {act.discussionDetails}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span>Conducted By: <strong className="text-slate-800">{act.employeeName}</strong></span>
                          {act.nextFollowUpDate && (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Next Follow-up: {formatDate(act.nextFollowUpDate)}
                            </span>
                          )}
                          {act.attachments && (
                            <span className="text-red-600 font-medium flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              Attachment: {act.attachments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => setSelectedDiscussion(act)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        View Full Notes
                      </button>
                      <button
                        onClick={() => deleteCustomerActivity(act.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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
                className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1"
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
        title={editingCustomer ? `Edit Customer: ${editingCustomer.id}` : "Register New Customer"}
        subtitle="Manage client credentials, contact directory, and project allocations."
      >
        <form onSubmit={handleSubmitCustomer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Contact Name *</label>
              <input
                type="text"
                required
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="erp-input"
                placeholder="e.g. Adv. Rahul Shinde"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Developer Name</label>
              <input
                type="text"
                value={customerForm.companyName}
                onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Mahalaxmi Housing Society"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="erp-input"
                placeholder="e.g. +91 98220 11223"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="erp-input"
                placeholder="e.g. rahul.shinde@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Registered Address</label>
            <textarea
              rows={2}
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              className="erp-input"
              placeholder="e.g. Rajarampuri 5th Lane, Kolhapur"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City</label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                className="erp-input"
                placeholder="Kolhapur"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">State</label>
              <input
                type="text"
                value={customerForm.state}
                onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                className="erp-input"
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GSTIN</label>
              <input
                type="text"
                value={customerForm.gstin}
                onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
                className="erp-input font-mono"
                placeholder="27AAYCS9281Q1ZU"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer Type</label>
              <select
                value={customerForm.customerType}
                onChange={(e) => setCustomerForm({ ...customerForm, customerType: e.target.value })}
                className="erp-input"
              >
                {CUSTOMER_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Project</label>
              <select
                value={customerForm.assignedProject}
                onChange={(e) => setCustomerForm({ ...customerForm, assignedProject: e.target.value })}
                className="erp-input"
              >
                <option value="">Select Construction Project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.id})</option>
                ))}
                <option value="Independent Civil Work">Independent Civil Work</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status</label>
              <select
                value={customerForm.status}
                onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                className="erp-input"
              >
                {CUSTOMER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
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
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Company / Developer</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCustomerDossier.companyName || selectedCustomerDossier.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedCustomerDossier.address}, {selectedCustomerDossier.city}, {selectedCustomerDossier.state}</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Contact Person</span>
                <strong className="text-slate-900 font-semibold">{selectedCustomerDossier.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Mobile Number</span>
                <strong className="text-slate-900 font-mono">{selectedCustomerDossier.phone || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Email</span>
                <strong className="text-slate-900 truncate block">{selectedCustomerDossier.email || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">GSTIN</span>
                <strong className="text-slate-900 font-mono">{selectedCustomerDossier.gstin || '—'}</strong>
              </div>
            </div>

            {/* Linked Construction Project Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Linked Construction Project
              </span>
              {selectedCustomerDossier.assignedProject ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/60 border border-red-200">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{selectedCustomerDossier.assignedProject}</h4>
                      <p className="text-[11px] text-slate-500">Site location registered in Kolhapur cluster</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-white px-2.5 py-1 rounded-md border border-red-200">
                    Active Site
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No construction project currently linked to this client.</p>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenAddFollowUp(selectedCustomerDossier.name, selectedCustomerDossier.phone);
                    setSelectedCustomerDossier(null);
                    setActiveTab('reminders');
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
                >
                  + Schedule Follow-up
                </button>
                <button
                  onClick={() => {
                    handleOpenAddActivity(selectedCustomerDossier);
                    setSelectedCustomerDossier(null);
                    setActiveTab('history');
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  + Log Interaction
                </button>
              </div>

              <button
                onClick={() => setSelectedCustomerDossier(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
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
        title={editingLead ? `Edit Lead: ${editingLead.id}` : "Add New Construction Lead"}
        subtitle="Record prospective inquiries, tender opportunities, and budget expectations."
      >
        <form onSubmit={handleSubmitLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead / Inquiry Title *</label>
              <input
                type="text"
                required
                value={leadForm.leadTitle}
                onChange={(e) => setLeadForm({ ...leadForm, leadTitle: e.target.value })}
                className="erp-input"
                placeholder="e.g. Residential Villa Turnkey Project"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prospect / Customer Name *</label>
              <input
                type="text"
                required
                value={leadForm.customerName}
                onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Prashant Patil"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={leadForm.mobileNumber}
                onChange={(e) => setLeadForm({ ...leadForm, mobileNumber: e.target.value })}
                className="erp-input"
                placeholder="e.g. +91 94220 99887"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="erp-input"
                placeholder="e.g. prashant@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Enquiry Type</label>
              <select
                value={leadForm.enquiryType}
                onChange={(e) => setLeadForm({ ...leadForm, enquiryType: e.target.value })}
                className="erp-input"
              >
                {ENQUIRY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={leadForm.projectName}
                onChange={(e) => setLeadForm({ ...leadForm, projectName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Shahu Industrial Cold Storage"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Location</label>
              <input
                type="text"
                value={leadForm.projectLocation}
                onChange={(e) => setLeadForm({ ...leadForm, projectLocation: e.target.value })}
                className="erp-input"
                placeholder="e.g. Shiroli MIDC, Kolhapur"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Estimated Budget (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                value={leadForm.estimatedBudget}
                onChange={(e) => setLeadForm({ ...leadForm, estimatedBudget: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. 45000000"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Source</label>
              <select
                value={leadForm.leadSource}
                onChange={(e) => setLeadForm({ ...leadForm, leadSource: e.target.value })}
                className="erp-input"
              >
                {LEAD_SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Employee</label>
              <select
                value={leadForm.assignedEmployee}
                onChange={(e) => setLeadForm({ ...leadForm, assignedEmployee: e.target.value })}
                className="erp-input"
              >
                {CRM_EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Follow-up Date</label>
              <input
                type="date"
                value={leadForm.followUpDate}
                onChange={(e) => setLeadForm({ ...leadForm, followUpDate: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Status</label>
              <select
                value={leadForm.status}
                onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                className="erp-input"
              >
                {LEAD_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Lead Description / Scope Details</label>
            <textarea
              rows={2}
              value={leadForm.leadDescription}
              onChange={(e) => setLeadForm({ ...leadForm, leadDescription: e.target.value })}
              className="erp-input"
              placeholder="e.g. Commercial PEB shed with civil foundation, awaiting architectural BOQ drawings."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsLeadModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
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
          onClose={() => setLeadToConvert(null)}
          title="Convert Lead into Registered Customer"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Lead Conversion Docket</span>
              <h4 className="text-sm font-bold text-slate-900">{leadToConvert.leadTitle}</h4>
              <div className="text-slate-600 space-y-1 pt-1 border-t border-red-200/60">
                <p>Prospect: <strong>{leadToConvert.customerName}</strong></p>
                <p>Mobile: <strong>{leadToConvert.mobileNumber}</strong></p>
                <p>Estimated Budget: <strong className="text-emerald-700 font-mono">{formatCurrency(leadToConvert.estimatedBudget)}</strong></p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Converting this lead will automatically link or create a new active Customer profile, log a conversion event in the Customer History timeline, and transition the lead status to <strong>Converted</strong>. No duplicate records will be created.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLeadToConvert(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConvertLead}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1"
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
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Customer Name</span>
                <strong className="text-slate-900 font-bold">{selectedLeadDetails.customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Mobile & Email</span>
                <span className="text-slate-900 block font-mono">{selectedLeadDetails.mobileNumber}</span>
                <span className="text-slate-500 text-[11px] block">{selectedLeadDetails.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Enquiry Type & Project</span>
                <strong className="text-slate-900 block">{selectedLeadDetails.enquiryType}</strong>
                <span className="text-slate-500 text-[11px] block">{selectedLeadDetails.projectName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Budget</span>
                <strong className="text-emerald-700 font-mono text-sm block">
                  {formatCurrency(Number(selectedLeadDetails.estimatedBudget) || 0)}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Source</span>
                <strong className="text-slate-800">{selectedLeadDetails.leadSource}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Lead</span>
                <strong className="text-slate-800">{selectedLeadDetails.assignedEmployee}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Next Follow-up</span>
                <strong className="text-slate-800">{formatDate(selectedLeadDetails.followUpDate)}</strong>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Lead Scope Description</span>
              <p className="text-slate-700 leading-relaxed">{selectedLeadDetails.leadDescription || 'No description provided.'}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  handleOpenAddFollowUp(selectedLeadDetails.customerName, selectedLeadDetails.mobileNumber);
                  setSelectedLeadDetails(null);
                  setActiveTab('reminders');
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200"
              >
                + Schedule Follow-up Call
              </button>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
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
              <select
                value={followUpForm.followUpType}
                onChange={(e) => setFollowUpForm({ ...followUpForm, followUpType: e.target.value })}
                className="erp-input"
              >
                {FOLLOWUP_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assigned Employee</label>
            <select
              value={followUpForm.assignedEmployee}
              onChange={(e) => setFollowUpForm({ ...followUpForm, assignedEmployee: e.target.value })}
              className="erp-input"
            >
              {CRM_EMPLOYEES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
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
      {/* MODAL 12: LOG CUSTOMER ACTIVITY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Log Customer Activity & Interaction"
        subtitle="Record meeting discussions, site visits, or phone interactions in the permanent audit dossier."
      >
        <form onSubmit={handleSubmitActivity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Client *</label>
              <input
                type="text"
                required
                value={activityForm.customerName}
                onChange={(e) => setActivityForm({ ...activityForm, customerName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Kolhapur Municipal Corporation"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Activity Type</label>
              <select
                value={activityForm.activityType}
                onChange={(e) => setActivityForm({ ...activityForm, activityType: e.target.value })}
                className="erp-input"
              >
                {FOLLOWUP_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={activityForm.dateTime}
                onChange={(e) => setActivityForm({ ...activityForm, dateTime: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employee Conducting Meeting *</label>
              <select
                value={activityForm.employeeName}
                onChange={(e) => setActivityForm({ ...activityForm, employeeName: e.target.value })}
                className="erp-input"
              >
                {CRM_EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Discussion Details / Key Minutes *</label>
            <textarea
              rows={4}
              required
              value={activityForm.discussionDetails}
              onChange={(e) => setActivityForm({ ...activityForm, discussionDetails: e.target.value })}
              className="erp-input"
              placeholder="Record points discussed, technical clarifications, bill approvals, or site progress agreements."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Next Follow-up Date (Optional)</label>
              <input
                type="date"
                value={activityForm.nextFollowUpDate}
                onChange={(e) => setActivityForm({ ...activityForm, nextFollowUpDate: e.target.value })}
                className="erp-input"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Setting a date will automatically schedule a reminder.</span>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Attachment File Name</label>
              <input
                type="text"
                value={activityForm.attachments}
                onChange={(e) => setActivityForm({ ...activityForm, attachments: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. Site_Inspection_Report.pdf"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
            >
              Save Activity Log
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
          subtitle={`${selectedDiscussion.activityType} on ${selectedDiscussion.dateTime} by ${selectedDiscussion.employeeName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedDiscussion.discussionDetails}
            </div>

            {selectedDiscussion.attachments && (
              <div className="flex items-center gap-2 p-3 bg-red-50/60 rounded-xl border border-red-200 text-red-900">
                <Paperclip className="w-4 h-4 text-red-600" />
                <span>Attachment: <strong>{selectedDiscussion.attachments}</strong></span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDiscussion(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
