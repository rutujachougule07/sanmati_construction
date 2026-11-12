// MODULE 9: TENDER MANAGEMENT - 4-Submodule System
// i. Tender details management | ii. Tender document uploads | iii. Submission date reminders | iv. Tender status tracking
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Gavel, 
  FileText, 
  UploadCloud, 
  Bell, 
  Clock, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Building2, 
  MapPin, 
  Briefcase, 
  Layers, 
  ExternalLink, 
  FileCheck, 
  Check, 
  X, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  AlertTriangle,
  History,
  FolderPlus,
  ChevronDown
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Tender Status categories matching 7 pipeline stages
export const TENDER_STATUSES = [
  "Open",
  "In Preparation",
  "Submitted",
  "Under Review",
  "Won",
  "Lost",
  "Cancelled"
];

export const getTenderStatusStyle = (status) => {
  switch (status) {
    case 'Won':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
    case 'Lost':
      return 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
    case 'Submitted':
      return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
    case 'Under Review':
      return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200';
    case 'In Preparation':
      return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
    case 'Open':
    default:
      return 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200';
  }
};

// Interactive Status Dropdown Component
export const StatusDropdown = ({ value, onChange, disabled = false }) => {
  return (
    <div className="inline-block relative">
      <select
        value={value || 'Open'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none font-bold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002046]/30 transition-all shadow-2xs px-3 py-1 pr-6 text-xs text-center ${getTenderStatusStyle(value)}`}
        title="निविदेचे स्टेटस बदला"
      >
        {TENDER_STATUSES.map((st) => (
          <option key={st} value={st} className="bg-white text-slate-800 font-semibold py-1">
            {st}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
};

// Standard 9 Tender Document Categories defined in user requirement
const TENDER_DOC_CATEGORIES = [
  "Tender PDF",
  "Company Registration",
  "GST Certificate",
  "PAN Card",
  "Financial Documents",
  "Technical Documents",
  "Work Experience",
  "EMD Receipt",
  "Submitted Tender Copy"
];

export const TendersModule = () => {
  const { tenders, setTenders, projects, setProjects } = useERPData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active submodule tab from query string: 'details' | 'documents' | 'reminders' | 'tracking'
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam && ['details', 'documents', 'reminders', 'tracking'].includes(tabParam)) 
    ? tabParam 
    : 'details';

  // Selected Tender ID for Documents, Reminders & Status tracking
  const [selectedTenderId, setSelectedTenderId] = useState(() => {
    return tenders?.[0]?.id || '';
  });

  // Keep selectedTenderId synced when tenders change
  useEffect(() => {
    if (tenders && tenders.length > 0) {
      if (!selectedTenderId || !tenders.some(t => t.id === selectedTenderId)) {
        setSelectedTenderId(tenders[0].id);
      }
    } else {
      setSelectedTenderId('');
    }
  }, [tenders, selectedTenderId]);

  // Active selected tender object
  const activeTender = useMemo(() => {
    if (!tenders || tenders.length === 0) return null;
    return tenders.find(t => t.id === selectedTenderId || t.tenderNumber === selectedTenderId) || tenders[0];
  }, [tenders, selectedTenderId]);

  // Modals state
  const [isAddTenderModalOpen, setIsAddTenderModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [viewingTender, setViewingTender] = useState(null);

  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isSetReminderModalOpen, setIsSetReminderModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [convertModalTender, setConvertModalTender] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State for Add / Edit Tender
  const [tenderFormData, setTenderFormData] = useState({
    id: '',
    tenderNumber: '',
    tenderName: '',
    department: 'Government (PWD Kolhapur)',
    projectLocation: 'Kolhapur, Maharashtra',
    tenderAmount: 5000000,
    publishDate: new Date().toISOString().split('T')[0],
    submissionDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    description: '',
    status: 'Open'
  });

  // Form State for Document Upload
  const [docFormData, setDocFormData] = useState({
    title: '',
    type: 'Tender PDF',
    fileName: ''
  });

  // Form State for Reminder
  const [reminderFormData, setReminderFormData] = useState({
    reminderDate: new Date().toISOString().split('T')[0],
    message: ''
  });

  // Form State for Status Update
  const [statusUpdateFormData, setStatusUpdateFormData] = useState({
    newStatus: 'Submitted',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Open Add Tender Modal
  const handleOpenAddModal = () => {
    const nextNum = (tenders?.length || 0) + 1;
    const padNum = String(nextNum).padStart(3, '0');
    setTenderFormData({
      id: `TND-${padNum}`,
      tenderNumber: '',
      tenderName: '',
      department: 'Government (PWD Kolhapur)',
      projectLocation: 'Kolhapur, Maharashtra',
      tenderAmount: '',
      publishDate: new Date().toISOString().split('T')[0],
      submissionDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      description: '',
      status: 'Open'
    });
    setEditingTender(null);
    setIsAddTenderModalOpen(true);
  };

  // Open Edit Tender Modal
  const handleOpenEditModal = (t) => {
    setTenderFormData({
      id: t.id,
      tenderNumber: t.tenderNumber || t.tenderId || '',
      tenderName: t.tenderName || t.title || '',
      department: t.department || t.authority || 'Government (PWD Kolhapur)',
      projectLocation: t.projectLocation || 'Kolhapur',
      tenderAmount: t.tenderAmount || t.tenderValue || '',
      publishDate: t.publishDate || new Date().toISOString().split('T')[0],
      submissionDate: t.submissionDate || t.deadline || '',
      description: t.description || '',
      status: t.status || 'Open'
    });
    setEditingTender(t);
    setIsAddTenderModalOpen(true);
  };

  // Save Tender Details (Add or Update)
  const handleSaveTenderDetails = (e) => {
    e.preventDefault();
    if (!tenderFormData.tenderName.trim() || !tenderFormData.tenderNumber.trim()) {
      alert('कृपया Tender Number आणि कामाचे नाव भरा.');
      return;
    }

    const numericAmount = Number(tenderFormData.tenderAmount) || 0;

    if (editingTender) {
      setTenders(prev => (prev || []).map(t => {
        if (t.id === editingTender.id) {
          return {
            ...t,
            tenderNumber: tenderFormData.tenderNumber,
            tenderId: tenderFormData.tenderNumber,
            tenderName: tenderFormData.tenderName,
            title: tenderFormData.tenderName,
            department: tenderFormData.department,
            authority: tenderFormData.department,
            projectLocation: tenderFormData.projectLocation,
            tenderAmount: numericAmount,
            tenderValue: numericAmount,
            publishDate: tenderFormData.publishDate,
            submissionDate: tenderFormData.submissionDate,
            deadline: tenderFormData.submissionDate,
            description: tenderFormData.description,
            status: tenderFormData.status
          };
        }
        return t;
      }));
    } else {
      const generatedId = tenderFormData.id || `TND-${Date.now().toString().slice(-4)}`;
      const newTender = {
        id: generatedId,
        tenderNumber: tenderFormData.tenderNumber,
        tenderId: tenderFormData.tenderNumber,
        tenderName: tenderFormData.tenderName,
        title: tenderFormData.tenderName,
        department: tenderFormData.department,
        authority: tenderFormData.department,
        projectLocation: tenderFormData.projectLocation,
        tenderAmount: numericAmount,
        tenderValue: numericAmount,
        publishDate: tenderFormData.publishDate,
        submissionDate: tenderFormData.submissionDate,
        deadline: tenderFormData.submissionDate,
        description: tenderFormData.description,
        status: tenderFormData.status || 'Open',
        statusHistory: [
          {
            id: `sh-${Date.now()}`,
            status: tenderFormData.status || 'Open',
            date: tenderFormData.publishDate,
            remarks: 'Tender Registered in Sanmati ERP System.'
          }
        ],
        documents: [],
        reminders: [],
        isConvertedToProject: false,
        convertedProjectId: null
      };

      setTenders(prev => [newTender, ...(prev || [])]);
      setSelectedTenderId(newTender.id);
    }

    setIsAddTenderModalOpen(false);
  };

  // Delete Tender
  const handleDeleteTender = (id) => {
    if (window.confirm('तुम्हाला हे Tender काढून टाकायचे आहे का? संबंधित सर्व Documents व Reminders देखील हटवले जातील.')) {
      setTenders(prev => prev.filter(t => t.id !== id));
      if (selectedTenderId === id) {
        const remaining = (tenders || []).filter(t => t.id !== id);
        if (remaining.length > 0) setSelectedTenderId(remaining[0].id);
      }
    }
  };

  // Save Document Upload to Active Tender
  const handleSaveDocument = (e) => {
    e.preventDefault();
    if (!activeTender) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docFormData.title || docFormData.fileName || `${docFormData.type.replace(/\s+/g, '_')}.pdf`,
      type: docFormData.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };

    setTenders(prev => prev.map(t => {
      if (t.id === activeTender.id) {
        return {
          ...t,
          documents: [newDoc, ...(t.documents || [])]
        };
      }
      return t;
    }));

    setIsUploadDocModalOpen(false);
    setDocFormData({ title: '', type: 'Tender PDF', fileName: '' });
    alert(`Document "${newDoc.name}" यशस्वीरीत्या अपलोड केले!`);
  };

  // Delete Document from Active Tender
  const handleDeleteDocument = (docId) => {
    if (!activeTender) return;
    if (window.confirm('हे Document काढून टाकायचे आहे का?')) {
      setTenders(prev => prev.map(t => {
        if (t.id === activeTender.id) {
          return {
            ...t,
            documents: (t.documents || []).filter(d => d.id !== docId)
          };
        }
        return t;
      }));
    }
  };

  // Save Reminder to Active Tender
  const handleSaveReminder = (e) => {
    e.preventDefault();
    if (!activeTender) return;
    const newRem = {
      id: `rem-${Date.now()}`,
      reminderDate: reminderFormData.reminderDate,
      message: reminderFormData.message || `Reminder for ${activeTender.tenderName}`,
      status: 'Pending'
    };

    setTenders(prev => prev.map(t => {
      if (t.id === activeTender.id) {
        return {
          ...t,
          reminders: [newRem, ...(t.reminders || [])]
        };
      }
      return t;
    }));

    setIsSetReminderModalOpen(false);
    setReminderFormData({ reminderDate: new Date().toISOString().split('T')[0], message: '' });
    alert(`Reminder यशस्वीरीत्या सेव्ह केले!`);
  };

  // Delete Reminder
  const handleDeleteReminder = (remId) => {
    if (!activeTender) return;
    setTenders(prev => prev.map(t => {
      if (t.id === activeTender.id) {
        return {
          ...t,
          reminders: (t.reminders || []).filter(r => r.id !== remId)
        };
      }
      return t;
    }));
  };

  // Mark Reminder Completed
  const handleToggleReminderStatus = (remId) => {
    if (!activeTender) return;
    setTenders(prev => prev.map(t => {
      if (t.id === activeTender.id) {
        return {
          ...t,
          reminders: (t.reminders || []).map(r => {
            if (r.id === remId) {
              return { ...r, status: r.status === 'Completed' ? 'Pending' : 'Completed' };
            }
            return r;
          })
        };
      }
      return t;
    }));
  };

  // Save Status Update with History Remarks
  const handleSaveStatusUpdate = (e) => {
    e.preventDefault();
    if (!activeTender) return;

    const newHistoryEntry = {
      id: `sh-${Date.now()}`,
      status: statusUpdateFormData.newStatus,
      date: statusUpdateFormData.date,
      remarks: statusUpdateFormData.remarks || `Status updated to ${statusUpdateFormData.newStatus}`
    };

    setTenders(prev => prev.map(t => {
      if (t.id === activeTender.id) {
        return {
          ...t,
          status: statusUpdateFormData.newStatus,
          statusHistory: [newHistoryEntry, ...(t.statusHistory || [])]
        };
      }
      return t;
    }));

    setIsUpdateStatusModalOpen(false);
    alert(`Tender Status अपडेट केले: ${statusUpdateFormData.newStatus}!`);
  };

  // Direct Status Change from Table Dropdown
  const handleDirectStatusChange = (tenderId, newStatus) => {
    setTenders(prev => (prev || []).map(t => {
      if (t.id === tenderId || t.tenderNumber === tenderId) {
        const historyEntry = {
          id: `sh-${Date.now()}`,
          status: newStatus,
          date: new Date().toISOString().split('T')[0],
          remarks: `Status updated to ${newStatus}`
        };
        return {
          ...t,
          status: newStatus,
          statusHistory: [historyEntry, ...(t.statusHistory || [])]
        };
      }
      return t;
    }));
  };

  // Convert Won Tender to Live Construction Project
  const handleConfirmConvertToProject = () => {
    if (!convertModalTender) return;
    const newProjectId = `PRJ-${Date.now()}`;
    const newProject = {
      id: newProjectId,
      name: convertModalTender.tenderName,
      code: `SC/PRJ/2026/0${(projects?.length || 0) + 12}`,
      clientName: convertModalTender.department,
      type: "Government Infrastructure / Tender",
      location: convertModalTender.projectLocation,
      contractValue: convertModalTender.tenderAmount,
      totalBudget: convertModalTender.tenderAmount,
      status: "In Progress",
      startDate: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      siteEngineer: "Er. Amit Deshmukh",
      sourceTenderId: convertModalTender.tenderNumber || convertModalTender.id
    };

    if (setProjects) {
      setProjects(prev => [newProject, ...(prev || [])]);
    }

    setTenders(prev => prev.map(t => {
      if (t.id === convertModalTender.id) {
        return {
          ...t,
          isConvertedToProject: true,
          convertedProjectId: newProjectId,
          statusHistory: [
            {
              id: `sh-${Date.now()}`,
              status: "Won",
              date: new Date().toISOString().split('T')[0],
              remarks: `Converted to Live Construction Project: ${newProject.name} (${newProject.code})`
            },
            ...(t.statusHistory || [])
          ]
        };
      }
      return t;
    }));

    setConvertModalTender(null);
    alert(`अभिनंदन! "${newProject.name}" हा Tender यशस्वीरीत्या Live Construction Project मध्ये रूपांतरित झाला!`);
  };

  /* =============================================================
   * SUBMODULE 1: i. Tender Details Management
   * ============================================================= */
  const renderDetailsManagement = () => {
    const list = tenders || [];
    const filtered = list.filter(t => {
      if (deptFilter !== 'ALL') {
        const isGovt = t.department?.toLowerCase().includes('government') || t.department?.toLowerCase().includes('pwd') || t.department?.toLowerCase().includes('kmc') || t.department?.toLowerCase().includes('midc');
        if (deptFilter === 'GOVERNMENT' && !isGovt) return false;
        if (deptFilter === 'PRIVATE' && isGovt) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const num = (t.tenderNumber || t.tenderId || '').toLowerCase();
      const name = (t.tenderName || t.title || '').toLowerCase();
      const dept = (t.department || t.authority || '').toLowerCase();
      const loc = (t.projectLocation || '').toLowerCase();
      return num.includes(q) || name.includes(q) || dept.includes(q) || loc.includes(q);
    });

    const totalValue = list.reduce((acc, t) => acc + (Number(t.tenderAmount || t.tenderValue) || 0), 0);
    const wonList = list.filter(t => t.status === 'Won');
    const wonValue = wonList.reduce((acc, t) => acc + (Number(t.tenderAmount || t.tenderValue) || 0), 0);
    const openCount = list.filter(t => t.status === 'Open' || t.status === 'In Preparation').length;
    const submittedCount = list.filter(t => t.status === 'Submitted' || t.status === 'Under Review').length;

    return (
      <div className="space-y-6">
        {/* Banner with Add Tender Button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule i</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Tender Details Management (निविदा तपशील व्यवस्थापन)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              नवीन Tender ची माहिती Register करणे, पाहणे, एडिट करणे आणि Manage करणे.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Tender</span>
          </button>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Tenders Tracked</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{list.length} Tenders registered in ERP</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Open / In Preparation</span>
            <div className="text-2xl font-extrabold text-blue-700 font-mono mt-2">
              {openCount} Tenders
            </div>
            <p className="text-xs text-slate-500 mt-1">Documentation & bidding in progress</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Submitted / Under Review</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
              {submittedCount} Tenders
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting department evaluation result</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Tenders Won</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {wonList.length} Won ({formatCurrency(wonValue)})
            </div>
            <p className="text-xs text-slate-500 mt-1">Awarded to Sanmati Constructions</p>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tender Number, Name, Department, Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'GOVERNMENT', 'PRIVATE'].map(d => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  deptFilter === d 
                    ? 'bg-[#002046] text-white shadow-2xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {d === 'ALL' ? 'All Departments' : d === 'GOVERNMENT' ? 'Government' : 'Private'}
              </button>
            ))}
          </div>
        </div>

        {/* Master Tenders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Tender Ref No</th>
                  <th className="px-4 py-3">Tender Name & Location</th>
                  <th className="px-4 py-3">Department / Org</th>
                  <th className="px-4 py-3 text-right">Tender Amount (₹)</th>
                  <th className="px-4 py-3">Publish Date</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      कोणतेही Tender सापडले नाही. नवीन Tender जोडण्यासाठी "+ Add Tender" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isWon = t.status === 'Won';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[#002046] block">
                            {t.tenderNumber || t.tenderId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.id}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-900 block max-w-xs">{t.tenderName || t.title}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {t.projectLocation}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-800 block">{t.department || t.authority}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(t.tenderAmount || t.tenderValue || 0)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {formatDate(t.publishDate)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          <span className="font-bold text-slate-900">{formatDate(t.submissionDate || t.deadline)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Convert to Project Button if Won */}
                            {isWon && !t.isConvertedToProject && (
                              <button
                                onClick={() => setConvertModalTender(t)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer animate-pulse"
                                title="Won Tender ला Live Project मध्ये Convert करा"
                              >
                                <FolderPlus className="w-3.5 h-3.5" />
                                <span>Convert to Project</span>
                              </button>
                            )}

                            {t.isConvertedToProject && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                                Converted
                              </span>
                            )}

                            {/* View Modal */}
                            <button
                              onClick={() => setViewingTender(t)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="View Tender"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Modal */}
                            <button
                              onClick={() => handleOpenEditModal(t)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-[#002046] hover:text-[#002e66] transition-colors cursor-pointer"
                              title="Edit Tender"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteTender(t.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Tender"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * SUBMODULE 2: ii. Tender Document Uploads
   * ============================================================= */
  const renderDocumentUploads = () => {
    if (!activeTender) {
      return (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">कोणतेही Tender उपलब्ध नाही</h3>
          <p className="text-xs text-slate-500 mb-4">कागदपत्रे अपलोड करण्यासाठी आधी "Tender details management" मध्ये जाऊन Tender तयार करा.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Tender</span>
          </button>
        </div>
      );
    }

    const docs = activeTender.documents || [];

    return (
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule ii</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Tender Document Uploads (कागदपत्रे व्यवस्थापन)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tender संबंधित सर्व कायदेशीर, तांत्रिक आणि आर्थिक Documents सुरक्षित ठेवणे.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tender Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Tender:</span>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="px-3.5 py-2 bg-white border-2 border-[#002046] rounded-xl text-xs font-bold text-[#002046] focus:outline-none shadow-xs"
              >
                {(tenders || []).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tenderNumber || t.tenderId} – {t.tenderName || t.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setDocFormData({ title: '', type: 'Tender PDF', fileName: '' });
                setIsUploadDocModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Upload Document</span>
            </button>
          </div>
        </div>

        {/* Selected Tender Overview Card */}
        <div className="p-5 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-mono font-bold text-[#002046] text-sm block">
              {activeTender.tenderNumber || activeTender.tenderId}
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{activeTender.tenderName || activeTender.title}</h4>
            <div className="text-slate-600 mt-1 flex flex-wrap gap-4">
              <span><strong>Department:</strong> {activeTender.department || activeTender.authority}</span>
              <span><strong>Location:</strong> {activeTender.projectLocation}</span>
              <span><strong>Submission Deadline:</strong> <span className="font-bold text-rose-700 font-mono">{formatDate(activeTender.submissionDate || activeTender.deadline)}</span></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block uppercase font-bold">Tender Valuation</span>
            <span className="text-xl font-extrabold text-[#002046] font-mono">
              {formatCurrency(activeTender.tenderAmount || activeTender.tenderValue || 0)}
            </span>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Uploaded Documents ({docs.length} Files Attached)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Supported: Tender PDF, GST, PAN, Financials, Technical, EMD Receipt, Work Experience
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Document Title & File</th>
                  <th className="px-4 py-3">Category / Document Type</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      या Tender साठी अजून कोणतेही Documents अपलोड केलेले नाहीत. वर "+ Upload Document" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  docs.map((doc, idx) => (
                    <tr key={doc.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Attachment ID: {doc.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#002046]/10 text-[#002046]">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {formatDate(doc.uploadDate || new Date().toISOString().split('T')[0])}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {doc.size || '1.2 MB'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => alert(`Document Preview: ${doc.name} (${doc.type})`)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert(`Downloading ${doc.name}...`)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-[#002046] hover:text-[#002e66] transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * SUBMODULE 3: iii. Submission Date Reminders
   * ============================================================= */
  const renderReminders = () => {
    const list = tenders || [];

    // Aggregate all reminders across all tenders for unified tracking
    const allReminders = [];
    list.forEach(t => {
      (t.reminders || []).forEach(r => {
        allReminders.push({
          ...r,
          tenderId: t.id,
          tenderNumber: t.tenderNumber || t.tenderId,
          tenderName: t.tenderName || t.title,
          tenderStatus: t.status,
          submissionDate: t.submissionDate || t.deadline
        });
      });
    });

    return (
      <div className="space-y-6">
        {/* Banner with Set Reminder button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule iii</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Submission Date Reminders (अंतिम तारीख स्मरणपत्रे)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tender ची अंतिम तारीख लक्षात ठेवणे, टप्पे ठरवणे आणि वेळेत Submission करणे.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!activeTender) {
                  alert('कृपया आधी "Tender details management" मध्ये जाऊन निविदा (Tender) तयार करा.');
                  return;
                }
                setReminderFormData({
                  reminderDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
                  message: `Verify final bid documents and EMD for ${activeTender?.tenderName || 'Tender'}`
                });
                setIsSetReminderModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>+ Set Reminder</span>
            </button>
          </div>
        </div>

        {/* Selected Tender Timeline & Submission Schedule */}
        {activeTender ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Selected Tender</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeTender.tenderNumber || activeTender.tenderId} – {activeTender.tenderName || activeTender.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Switch Tender:</span>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#002046]"
                >
                  {list.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.tenderNumber || t.tenderId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-amber-900 block text-sm">
                    Submission Deadline: {formatDate(activeTender.submissionDate || activeTender.deadline)}
                  </span>
                  <span className="text-amber-800">
                    Department: {activeTender.department || activeTender.authority} | Location: {activeTender.projectLocation}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold text-xs">
                  Active Bidding
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs text-center text-xs text-slate-400">
            कोणतेही Tender उपलब्ध नाही. रिमाइंडर सेट करण्यासाठी प्रथम "Tender details management" मध्ये "+ Add Tender" वर क्लिक करून निविदा तयार करा.
          </div>
        )}

        {/* Reminders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Upcoming Tender Reminders Schedule</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold">
              Total {allReminders.length} Reminders Configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Tender Ref & Name</th>
                  <th className="px-4 py-3">Submission Deadline</th>
                  <th className="px-4 py-3">Reminder Date</th>
                  <th className="px-4 py-3">Reminder Message</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allReminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      कोणताही Reminder सेट केलेला नाही. नवीन रिमाइंडर सेट करण्यासाठी वर "+ Set Reminder" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  allReminders.map((rem) => {
                    const isDone = rem.status === 'Completed';
                    return (
                      <tr key={rem.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[#002046] block">{rem.tenderNumber}</span>
                          <span className="text-[11px] text-slate-500 block max-w-xs truncate">{rem.tenderName}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-rose-700">
                          {formatDate(rem.submissionDate)}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                          {formatDate(rem.reminderDate)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 max-w-sm">
                          {rem.message}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusDropdown 
                            value={rem.tenderStatus || rem.status} 
                            onChange={(newStatus) => handleDirectStatusChange(rem.tenderId, newStatus)} 
                          />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Reminder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * SUBMODULE 4: iv. Tender Status Tracking
   * ============================================================= */
  const renderStatusTracking = () => {
    const list = tenders || [];
    const stages = [
      { key: "Open", label: "Open", desc: "Tender उपलब्ध आहे आणि अजून Submit केलेले नाही." },
      { key: "In Preparation", label: "In Preparation", desc: "Tender साठी Documents आणि माहिती तयार केली जात आहे." },
      { key: "Submitted", label: "Submitted", desc: "Tender संबंधित Department कडे Submit केले आहे." },
      { key: "Under Review", label: "Under Review", desc: "Department कडून Tender तपासले जात आहे." },
      { key: "Won", label: "Won", desc: "कंपनीला Tender मिळाले आहे." },
      { key: "Lost", label: "Lost", desc: "कंपनीला Tender मिळाले नाही." },
      { key: "Cancelled", label: "Cancelled", desc: "Tender रद्द झाले आहे." }
    ];

    const filtered = statusFilter === 'ALL'
      ? list
      : list.filter(t => t.status === statusFilter);

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule iv</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Tender Status Tracking (निविदा स्थिती ट्रॅकिंग)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tender कोणत्या Stage मध्ये आहे हे Track करणे, निकाल नोंदवणे आणि Won Tender ला Project मध्ये Convert करणे.
            </p>
          </div>
        </div>

        {/* 7 Stage Pipeline Cards with exact Marathi Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {stages.map(st => {
            const count = list.filter(t => t.status === st.key).length;
            const isSelected = statusFilter === st.key;
            return (
              <div
                key={st.key}
                onClick={() => setStatusFilter(isSelected ? 'ALL' : st.key)}
                className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
                  isSelected ? 'border-[#002046] ring-2 ring-[#002046]' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    st.key === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                    st.key === 'Lost' ? 'bg-rose-100 text-rose-800' :
                    st.key === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {st.label}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">{count}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Open', 'In Preparation', 'Submitted', 'Under Review', 'Won', 'Lost', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-[#002046] text-white shadow-2xs' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} Tenders
          </span>
        </div>

        {/* Status Tracking Master Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Tender Ref No</th>
                  <th className="px-4 py-3">Tender Name & Department</th>
                  <th className="px-4 py-3 text-right">Tender Amount (₹)</th>
                  <th className="px-4 py-3">Submission Deadline</th>
                  <th className="px-4 py-3 text-center">Current Status</th>
                  <th className="px-4 py-3">Latest History Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      कोणतेही Tender सापडले नाही. नवीन Tender जोडण्यासाठी "Tender details management" मध्ये जाऊन "+ Add Tender" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => {
                  const isWon = t.status === 'Won';
                  const latestRemarks = t.statusHistory?.[0]?.remarks || 'No remarks recorded yet.';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#002046]">
                        {t.tenderNumber || t.tenderId}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block max-w-xs">{t.tenderName || t.title}</span>
                        <span className="text-[11px] text-slate-500">{t.department || t.authority}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(t.tenderAmount || t.tenderValue || 0)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {formatDate(t.submissionDate || t.deadline)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                          <StatusDropdown 
                            value={t.status} 
                            onChange={(newStatus) => handleDirectStatusChange(t.id, newStatus)} 
                          />
                          {isWon && !t.isConvertedToProject && (
                            <button
                              onClick={() => setConvertModalTender(t)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer animate-pulse"
                              title="Convert Won Tender to Live Construction Project"
                            >
                              <FolderPlus className="w-3 h-3" />
                              <span>Convert</span>
                            </button>
                          )}
                          {t.isConvertedToProject && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              Project Created ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate text-[11px]">
                        {latestRemarks}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * ROOT RETURN
   * ============================================================= */
  return (
    <div className="space-y-6">
      {/* Render Current Active Submodule without redundant page tabs */}
      {activeTab === 'details' && renderDetailsManagement()}
      {activeTab === 'documents' && renderDocumentUploads()}
      {activeTab === 'reminders' && renderReminders()}
      {activeTab === 'tracking' && renderStatusTracking()}

      {/* 1. ADD / EDIT TENDER MODAL */}
      <Modal
        isOpen={isAddTenderModalOpen}
        onClose={() => setIsAddTenderModalOpen(false)}
        title={editingTender ? `Edit Tender: ${editingTender.tenderNumber || editingTender.id}` : 'Add New Tender (नवीन निविदा नोंदवा)'}
        subtitle="Government किंवा Private Tender ची सर्व माहिती नोंदवा."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveTenderDetails} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tender ID *</label>
              <input
                type="text"
                required
                value={tenderFormData.id}
                onChange={(e) => setTenderFormData({ ...tenderFormData, id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tender Reference Number *</label>
              <input
                type="text"
                required
                placeholder="उदा. PWD/KLP/2026/W-104"
                value={tenderFormData.tenderNumber}
                onChange={(e) => setTenderFormData({ ...tenderFormData, tenderNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Tender Name (कामाचे नाव) *</label>
            <input
              type="text"
              required
              placeholder="उदा. Construction of Multi-Level Flyover Road"
              value={tenderFormData.tenderName}
              onChange={(e) => setTenderFormData({ ...tenderFormData, tenderName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Department / Organization *</label>
              <select
                value={tenderFormData.department}
                onChange={(e) => setTenderFormData({ ...tenderFormData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
              >
                <option value="Government (PWD Kolhapur)">Government (PWD Kolhapur)</option>
                <option value="Government (Kolhapur Municipal Corporation)">Government (Kolhapur Municipal Corporation)</option>
                <option value="Government (MIDC Shiroli)">Government (MIDC)</option>
                <option value="Government (MSRDC)">Government (MSRDC)</option>
                <option value="Private (Corporate / Society)">Private (Corporate / Society)</option>
                <option value="Other Department">Other Department</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Location (कामाचे ठिकाण) *</label>
              <input
                type="text"
                required
                placeholder="उदा. Kawala Naka, Kolhapur"
                value={tenderFormData.projectLocation}
                onChange={(e) => setTenderFormData({ ...tenderFormData, projectLocation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tender Amount (₹) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="उदा. 5000000"
                value={tenderFormData.tenderAmount}
                onChange={(e) => setTenderFormData({ ...tenderFormData, tenderAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Publish Date *</label>
              <input
                type="date"
                required
                value={tenderFormData.publishDate}
                onChange={(e) => setTenderFormData({ ...tenderFormData, publishDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Submission Date *</label>
              <input
                type="date"
                required
                value={tenderFormData.submissionDate}
                onChange={(e) => setTenderFormData({ ...tenderFormData, submissionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Initial Status</label>
              <select
                value={tenderFormData.status}
                onChange={(e) => setTenderFormData({ ...tenderFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
              >
                <option value="Open">Open</option>
                <option value="In Preparation">In Preparation</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Description (कामाची माहिती)</label>
              <input
                type="text"
                placeholder="कामाचा थोडक्यात तपशील"
                value={tenderFormData.description}
                onChange={(e) => setTenderFormData({ ...tenderFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddTenderModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {editingTender ? 'Update Tender' : 'Save Tender Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. UPLOAD DOCUMENT MODAL */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        title="Upload Tender Document (दस्तऐवज अपलोड करा)"
        subtitle={`Tender: ${activeTender?.tenderNumber || activeTender?.tenderName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDocument} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Document Category / Type *</label>
            <select
              value={docFormData.type}
              onChange={(e) => setDocFormData({ ...docFormData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
            >
              {TENDER_DOC_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Document Title / File Name *</label>
            <input
              type="text"
              required
              placeholder="उदा. PWD_Technical_Specifications.pdf"
              value={docFormData.title}
              onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Select File (PDF, DOC, ZIP) *</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setDocFormData(prev => ({
                    ...prev,
                    fileName: e.target.files[0].name,
                    title: prev.title || e.target.files[0].name
                  }));
                }
              }}
              className="w-full p-2 border border-dashed border-slate-300 rounded-xl text-xs bg-slate-50 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadDocModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Upload & Save
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. SET REMINDER MODAL */}
      <Modal
        isOpen={isSetReminderModalOpen}
        onClose={() => setIsSetReminderModalOpen(false)}
        title="Set Submission Date Reminder (स्मरणपत्र सेट करा)"
        subtitle={`Tender: ${activeTender?.tenderNumber} | Deadline: ${formatDate(activeTender?.submissionDate || activeTender?.deadline)}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveReminder} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Reminder Date (कधी आठवण करायची?) *</label>
            <input
              type="date"
              required
              value={reminderFormData.reminderDate}
              onChange={(e) => setReminderFormData({ ...reminderFormData, reminderDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Reminder Message / Action *</label>
            <textarea
              rows={3}
              required
              placeholder="उदा. Final Commercial Bid encryption तपासणे आणि EMD पावती जोडणे..."
              value={reminderFormData.message}
              onChange={(e) => setReminderFormData({ ...reminderFormData, message: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSetReminderModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. UPDATE STATUS MODAL */}
      <Modal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        title="Update Tender Status (निविदा स्थिती बदला)"
        subtitle={`Tender: ${activeTender?.tenderNumber || activeTender?.tenderName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">New Stage Status *</label>
            <select
              value={statusUpdateFormData.newStatus}
              onChange={(e) => setStatusUpdateFormData({ ...statusUpdateFormData, newStatus: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 bg-white"
            >
              <option value="Open">Open (उपलब्ध आहे)</option>
              <option value="In Preparation">In Preparation (कागदपत्रे तयार केली जात आहेत)</option>
              <option value="Submitted">Submitted (विभाग कडे जमा केले आहे)</option>
              <option value="Under Review">Under Review (तपासणी सुरू आहे)</option>
              <option value="Won">Won (कंपनीला Tender मिळाले आहे 🎉)</option>
              <option value="Lost">Lost (Tender मिळाले नाही)</option>
              <option value="Cancelled">Cancelled (Tender रद्द झाले)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Update Date *</label>
            <input
              type="date"
              required
              value={statusUpdateFormData.date}
              onChange={(e) => setStatusUpdateFormData({ ...statusUpdateFormData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Department Remarks / Reason *</label>
            <textarea
              rows={3}
              required
              placeholder="उदा. Technical evaluation cleared. Commercial bid opened as L1 lowest bidder..."
              value={statusUpdateFormData.remarks}
              onChange={(e) => setStatusUpdateFormData({ ...statusUpdateFormData, remarks: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUpdateStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. CONVERT TO PROJECT CONFIRMATION MODAL */}
      {convertModalTender && (
        <Modal
          isOpen={Boolean(convertModalTender)}
          onClose={() => setConvertModalTender(null)}
          title="Convert Tender to Live Project (प्रकल्प सुरू करा)"
          subtitle="अभिनंदन! Won झालेल्या Tender मधून अधिकृत Construction Project सुरू करा."
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-bold text-emerald-900 block text-sm">
                {convertModalTender.tenderName}
              </span>
              <div className="text-slate-600 space-y-1">
                <p><strong>Tender Ref:</strong> {convertModalTender.tenderNumber}</p>
                <p><strong>Department / Client:</strong> {convertModalTender.department}</p>
                <p><strong>Project Location:</strong> {convertModalTender.projectLocation}</p>
                <p><strong>Contract Value:</strong> <span className="font-bold text-emerald-700 font-mono text-sm">{formatCurrency(convertModalTender.tenderAmount)}</span></p>
              </div>
            </div>

            <p className="text-slate-600 font-medium">
              हा पर्याय निवडल्यानंतर ERP मध्ये नवीन Construction Project सुरू होईल, ज्यामध्ये BOQ, RA Bills, Site Engineer व GPS Tracking जोडता येईल. आपण खात्री करता का?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConvertModalTender(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleConfirmConvertToProject}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Yes, Convert to Project</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. VIEW TENDER DETAILS & FULL HISTORY MODAL */}
      {viewingTender && (
        <Modal
          isOpen={Boolean(viewingTender)}
          onClose={() => setViewingTender(null)}
          title={`Tender: ${viewingTender.tenderNumber || viewingTender.tenderId}`}
          subtitle={viewingTender.tenderName}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs text-slate-800">
            {/* Header Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Tender Information</span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{viewingTender.tenderName}</p>
                <p className="text-slate-600 mt-1"><strong>Department:</strong> {viewingTender.department}</p>
                <p className="text-slate-600"><strong>Location:</strong> {viewingTender.projectLocation}</p>
                <p className="text-slate-600 mt-1">{viewingTender.description}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Financials & Timeline</span>
                <div className="mt-1">
                  <StatusBadge status={viewingTender.status} />
                </div>
                <div className="text-lg font-mono font-black text-[#002046]">
                  {formatCurrency(viewingTender.tenderAmount || viewingTender.tenderValue || 0)}
                </div>
                <p className="text-slate-600">Publish: {formatDate(viewingTender.publishDate)}</p>
                <p className="text-rose-700 font-bold">Deadline: {formatDate(viewingTender.submissionDate || viewingTender.deadline)}</p>
              </div>
            </div>

            {/* Status History Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#002046]" />
                <span>Status Progression & Remarks History</span>
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {(viewingTender.statusHistory || []).map((sh, idx) => (
                  <div key={sh.id || idx} className="p-3 bg-white flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sh.status} />
                        <span className="font-mono text-slate-400 text-[10px]">{formatDate(sh.date)}</span>
                      </div>
                      <p className="text-slate-700 font-medium text-xs mt-1">{sh.remarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Documents Quick Summary */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#002046]" />
                <span>Attached Documents ({viewingTender.documents?.length || 0})</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {(viewingTender.documents || []).map((doc, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                    <span>{doc.name}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingTender(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
