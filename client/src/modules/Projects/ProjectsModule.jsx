// MODULE 10: CONSTRUCTION PROJECT MANAGEMENT
// 4 Exact Submodules:
// 1. i. Project Creation and Management (/projects?tab=creation)
// 2. ii. BOQ Management (Bill of Quantities) (/projects?tab=boq)
// 3. iii. Subcontractor Management (/projects?tab=subcontractors)
// 4. iv. RA Billing & Project Progress Tracking (/projects?tab=rabilling)

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HardHat, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileText, 
  Search, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  Eye, 
  FileSpreadsheet, 
  Receipt, 
  FolderPlus, 
  ChevronDown, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck, 
  Printer, 
  CreditCard,
  Building2,
  Briefcase,
  AlertCircle,
  Download,
  FileDown
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CONSTRUCTION_ACTIVITIES } from '../../utils/constants';
import { saveModuleRecord, removeModuleRecord } from '../../services/firebaseSync';
import { 
  generateRABillPDF, 
  generateDPRPDF, 
  generatePDFReport, 
  exportToExcel, 
  exportToCSV 
} from '../../services/exportService';

// Standard Units for BOQ
const BOQ_UNITS = [
  "Kg",
  "Bags",
  "Sq.ft",
  "Cu.m",
  "Brass",
  "Nos",
  "Ltr",
  "Rmt"
];

// Subcontractor Work Categories
const SUBCONTRACT_CATEGORIES = [
  "Electrical Wiring & HT Panel",
  "Plumbing, Drainage & Sanitary",
  "Painting & POP Finishing",
  "Vitrified Flooring & Tiling",
  "Waterproofing & Chemical Treatment",
  "Fabrication & MS Grills",
  "HVAC & Ventilation Ducting",
  "Carpentry & Woodwork",
  "Aluminium Sliding Windows & Glazing"
];

export const ProjectsModule = () => {
  const { 
    projects, 
    setProjects, 
    boqItems, 
    setBoqItems, 
    raBills, 
    setRaBills, 
    clients, 
    hrmsEmployees,
    subcontractors: contextSubcontractors,
    setSubcontractors: setContextSubcontractors,
    addNotification
  } = useERPData();

  const [searchParams, setSearchParams] = useSearchParams();

  // Active Submodule Tab from URL: 'creation' | 'boq' | 'subcontractors' | 'rabilling'
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam && ['creation', 'boq', 'subcontractors', 'rabilling', 'progress'].includes(tabParam))
    ? (tabParam === 'progress' ? 'rabilling' : tabParam)
    : 'creation';

  // Fallback local storage for subcontractors if context hasn't populated yet
  const [localSubcontractors, setLocalSubcontractors] = useState(() => {
    try {
      const saved = localStorage.getItem('sanmati_subcontractors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allSubcontractors = contextSubcontractors || localSubcontractors;
  const setAllSubcontractors = (val) => {
    const updated = typeof val === 'function' ? val(allSubcontractors) : val;
    if (setContextSubcontractors) setContextSubcontractors(updated);
    setLocalSubcontractors(updated);
    try {
      localStorage.setItem('sanmati_subcontractors', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // DPR Logs State
  const [dprLogs, setDprLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('sanmati_project_dpr_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveDprLogs = (updater) => {
    setDprLogs(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('sanmati_project_dpr_logs', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Selected Project for submodules (BOQ, Subcontractor, RA Bill, Progress)
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return projects?.[0]?.id || '';
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      if (!selectedProjectId || !projects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId(projects[0].id);
      }
    } else {
      setSelectedProjectId('');
    }
  }, [projects, selectedProjectId]);

  const activeProject = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Modals state
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const [isAddBOQModalOpen, setIsAddBOQModalOpen] = useState(false);
  const [editingBOQItem, setEditingBOQItem] = useState(null);

  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [payingSub, setPayingSub] = useState(null);

  const [isCreateRABillModalOpen, setIsCreateRABillModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);
  const [viewingDPR, setViewingDPR] = useState(null);

  // Search & Filters state
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');

  // Form states
  const [projectForm, setProjectForm] = useState({
    id: '',
    name: '',
    code: '',
    location: '',
    clientName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    budget: '',
    projectManager: 'Er. Amit Deshmukh',
    status: 'Ongoing',
    description: ''
  });

  const [boqForm, setBOQForm] = useState({
    id: '',
    materialName: 'Ultratech Super Cement (50kg)',
    description: 'RCC 4th slab & beam casting',
    quantity: '100',
    unit: 'Bags',
    rate: '350',
    status: 'Approved'
  });

  const [subForm, setSubForm] = useState({
    id: '',
    name: '',
    contact: '',
    assignedWork: 'Electrical Wiring & HT Panel',
    contractAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    status: 'In Progress'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'Bank Transfer (NEFT/RTGS)',
    date: new Date().toISOString().split('T')[0],
    refNo: ''
  });

  const [raBillForm, setRABillForm] = useState({
    id: '',
    billNo: '',
    date: new Date().toISOString().split('T')[0],
    completedWork: '',
    completedWorkValue: '',
    previousBills: 0
  });

  const [dprForm, setDprForm] = useState({
    date: new Date().toISOString().split('T')[0],
    engineer: 'Er. Amit Deshmukh',
    activitiesExecuted: '',
    labourCount: 'Masons: 6, Helpers: 14, Bar Benders: 8',
    materialsConsumed: 'Cement: 150 bags, Sand: 2 brass, Steel: 1.5 MT',
    weather: 'Clear / Sunny (30°C)',
    isDelayed: false,
    delayRemarks: ''
  });

  // ==============================================================
  // 1. PROJECT CREATION AND MANAGEMENT HANDLERS
  // ==============================================================
  const handleOpenAddProjectModal = () => {
    const nextNum = (projects?.length || 0) + 1;
    const pad = String(nextNum).padStart(2, '0');
    setProjectForm({
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      name: '',
      code: `SC/PRJ/2026/${pad}`,
      location: 'Kolhapur, Maharashtra',
      clientName: clients?.[0]?.name || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      budget: '',
      projectManager: hrmsEmployees?.[0]?.name || 'Er. Amit Deshmukh',
      status: 'Ongoing',
      description: ''
    });
    setEditingProject(null);
    setIsAddProjectModalOpen(true);
  };

  const handleOpenEditProjectModal = (p) => {
    setProjectForm({
      id: p.id,
      name: p.name || '',
      code: p.code || '',
      location: p.location || '',
      clientName: p.clientName || '',
      startDate: p.startDate || '',
      endDate: p.endDate || p.estimatedCompletionDate || p.targetCompletionDate || '',
      budget: p.budget || p.contractValue || p.totalBudget || '',
      projectManager: p.projectManager || 'Er. Amit Deshmukh',
      status: p.status || 'Ongoing',
      description: p.description || ''
    });
    setEditingProject(p);
    setIsAddProjectModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.name.trim()) {
      alert('कृपया Project चे नाव भरा.');
      return;
    }

    const numericBudget = Number(projectForm.budget) || 0;

    if (editingProject) {
      const updatedProj = {
        ...editingProject,
        name: projectForm.name.trim(),
        projectName: projectForm.name.trim(),
        code: projectForm.code?.trim() || editingProject.code || `SC/PRJ/2026/01`,
        location: projectForm.location?.trim() || 'Kolhapur, Maharashtra',
        clientName: projectForm.clientName?.trim() || 'Direct Client',
        startDate: projectForm.startDate,
        endDate: projectForm.endDate,
        estimatedCompletionDate: projectForm.endDate,
        targetCompletionDate: projectForm.endDate,
        budget: numericBudget,
        projectBudget: numericBudget,
        contractValue: numericBudget,
        totalBudget: numericBudget,
        projectManager: projectForm.projectManager?.trim() || 'Er. Amit Deshmukh',
        status: projectForm.status || 'Ongoing',
        description: projectForm.description || ''
      };

      if (typeof setProjects === 'function') {
        setProjects(prev => (prev || []).map(p => (p.id === editingProject.id ? updatedProj : p)));
      }

      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_projects') || '[]');
        const updated = cur.map(p => (p.id === editingProject.id ? updatedProj : p));
        localStorage.setItem('sanmati_projects', JSON.stringify(updated));
      } catch (err) { /* ignore */ }

      try {
        saveModuleRecord('projects', updatedProj.id, updatedProj);
      } catch (err) {
        console.warn('Firebase save error:', err);
      }

      if (typeof addNotification === 'function') {
        addNotification('Project Updated', `Project "${updatedProj.name}" अपडेट झाला.`, 'success');
      }
    } else {
      const defaultActivities = CONSTRUCTION_ACTIVITIES.map((name, i) => ({
        name,
        progress: i === 0 ? 30 : 0,
        status: i === 0 ? 'In Progress' : 'Pending'
      }));

      const newId = projectForm.id || `PRJ-${Date.now().toString().slice(-4)}`;
      const newProj = {
        id: newId,
        name: projectForm.name.trim(),
        projectName: projectForm.name.trim(),
        code: projectForm.code?.trim() || `SC/PRJ/2026/01`,
        location: projectForm.location?.trim() || 'Kolhapur, Maharashtra',
        clientName: projectForm.clientName?.trim() || 'Direct Client',
        startDate: projectForm.startDate || new Date().toISOString().split('T')[0],
        endDate: projectForm.endDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        estimatedCompletionDate: projectForm.endDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        targetCompletionDate: projectForm.endDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        budget: numericBudget,
        projectBudget: numericBudget,
        contractValue: numericBudget,
        totalBudget: numericBudget,
        projectManager: projectForm.projectManager?.trim() || 'Er. Amit Deshmukh',
        status: projectForm.status || 'Ongoing',
        description: projectForm.description || '',
        activities: defaultActivities,
        actualExpenditure: 0,
        billedAmount: 0,
        receivedAmount: 0,
        outstandingAmount: 0,
        actualProfit: 0,
        completionPercentage: 0,
        actualCosts: {
          material: Math.round(numericBudget * 0.45) || 0,
          labour: Math.round(numericBudget * 0.25) || 0,
          equipment: Math.round(numericBudget * 0.08) || 0,
          subcontractor: Math.round(numericBudget * 0.12) || 0
        }
      };

      if (typeof setProjects === 'function') {
        setProjects(prev => [newProj, ...(prev || [])]);
      }
      setSelectedProjectId(newProj.id);

      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_projects') || '[]');
        const updated = [newProj, ...cur.filter(p => p.id !== newProj.id)];
        localStorage.setItem('sanmati_projects', JSON.stringify(updated));
      } catch (err) { /* ignore */ }

      try {
        saveModuleRecord('projects', newProj.id, newProj);
      } catch (err) {
        console.warn('Firebase save error:', err);
      }

      if (typeof addNotification === 'function') {
        addNotification('Project Created', `नवीन Project "${newProj.name}" (${newProj.code}) यशस्वीरीत्या तयार झाला.`, 'success');
      }
    }

    setIsAddProjectModalOpen(false);
  };

  const handleDeleteProject = (projId) => {
    if (window.confirm('तुम्हाला हा Project नक्की काढून टाकायचा आहे का?')) {
      if (typeof setProjects === 'function') {
        setProjects(prev => (prev || []).filter(p => p.id !== projId));
      }
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_projects') || '[]');
        const updated = cur.filter(p => p.id !== projId);
        localStorage.setItem('sanmati_projects', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        removeModuleRecord('projects', projId);
      } catch (e) { /* ignore */ }
      if (selectedProjectId === projId) {
        const remaining = (projects || []).filter(p => p.id !== projId);
        setSelectedProjectId(remaining[0]?.id || '');
      }
      if (typeof addNotification === 'function') {
        addNotification('Project Deleted', `Project काढून टाकला.`, 'info');
      }
    }
  };

  const handleUpdateProjectStatusDirect = (projId, newStatus) => {
    if (typeof setProjects === 'function') {
      setProjects(prev => (prev || []).map(p => {
        if (p.id === projId) {
          return { ...p, status: newStatus };
        }
        return p;
      }));
    }
    try {
      const cur = JSON.parse(localStorage.getItem('sanmati_projects') || '[]');
      const updated = cur.map(p => (p.id === projId ? { ...p, status: newStatus } : p));
      localStorage.setItem('sanmati_projects', JSON.stringify(updated));
    } catch (e) { /* ignore */ }
    try {
      saveModuleRecord('projects', projId, { status: newStatus });
    } catch (e) { /* ignore */ }
  };

  // ==============================================================
  // 2. BOQ MANAGEMENT HANDLERS
  // ==============================================================
  const handleOpenAddBOQModal = () => {
    if (!activeProject) {
      alert('कृपया आधी Project तयार करा किंवा निवडा.');
      return;
    }
    setBOQForm({
      id: `BOQ-${Date.now().toString().slice(-4)}`,
      materialName: 'Ultratech Super Cement (50kg)',
      description: 'RCC 4th slab & beam casting',
      quantity: '100',
      unit: 'Bags',
      rate: '350',
      status: 'Approved'
    });
    setEditingBOQItem(null);
    setIsAddBOQModalOpen(true);
  };

  const handleOpenEditBOQModal = (item) => {
    setBOQForm({
      id: item.id,
      materialName: item.materialName || item.description || '',
      description: item.workDescription || item.description || '',
      quantity: String(item.quantity || ''),
      unit: item.unit || 'Bags',
      rate: String(item.rate || ''),
      status: item.status || 'Approved'
    });
    setEditingBOQItem(item);
    setIsAddBOQModalOpen(true);
  };

  const handleSaveBOQItem = (e) => {
    e.preventDefault();
    if (!activeProject) return;

    const qty = Number(boqForm.quantity) || 0;
    const rate = Number(boqForm.rate) || 0;
    const total = qty * rate;

    if (editingBOQItem) {
      const updatedItem = {
        ...editingBOQItem,
        materialName: boqForm.materialName,
        workDescription: boqForm.description,
        description: boqForm.description,
        quantity: qty,
        unit: boqForm.unit,
        rate: rate,
        totalAmount: total,
        estimatedCost: total,
        status: boqForm.status
      };
      if (typeof setBoqItems === 'function') {
        setBoqItems(prev => (prev || []).map(item => item.id === editingBOQItem.id ? updatedItem : item));
      }
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_boqItems') || '[]');
        const updated = cur.map(i => i.id === editingBOQItem.id ? updatedItem : i);
        localStorage.setItem('sanmati_boqItems', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        saveModuleRecord('boqItems', updatedItem.id, updatedItem);
      } catch (e) { /* ignore */ }
    } else {
      const newItem = {
        id: boqForm.id || `BOQ-${Date.now().toString().slice(-4)}`,
        projectId: activeProject.id,
        materialName: boqForm.materialName,
        workDescription: boqForm.description,
        description: boqForm.description,
        quantity: qty,
        unit: boqForm.unit,
        rate: rate,
        totalAmount: total,
        estimatedCost: total,
        status: boqForm.status || 'Approved',
        dateAdded: new Date().toISOString().split('T')[0]
      };

      if (typeof setBoqItems === 'function') {
        setBoqItems(prev => [newItem, ...(prev || [])]);
      }
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_boqItems') || '[]');
        const updated = [newItem, ...cur.filter(i => i.id !== newItem.id)];
        localStorage.setItem('sanmati_boqItems', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        saveModuleRecord('boqItems', newItem.id, newItem);
      } catch (e) { /* ignore */ }
    }

    setIsAddBOQModalOpen(false);
  };

  const handleDeleteBOQItem = (itemId) => {
    if (window.confirm('हे BOQ Item हटवायचे आहे का?')) {
      if (typeof setBoqItems === 'function') {
        setBoqItems(prev => (prev || []).filter(i => i.id !== itemId));
      }
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_boqItems') || '[]');
        const updated = cur.filter(i => i.id !== itemId);
        localStorage.setItem('sanmati_boqItems', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        removeModuleRecord('boqItems', itemId);
      } catch (e) { /* ignore */ }
    }
  };

  const handleApproveAllBOQ = () => {
    if (!activeProject) return;
    if (typeof setBoqItems === 'function') {
      setBoqItems(prev => (prev || []).map(i => {
        if (i.projectId === activeProject.id) {
          return { ...i, status: 'Approved' };
        }
        return i;
      }));
    }
    try {
      const cur = JSON.parse(localStorage.getItem('sanmati_boqItems') || '[]');
      const updated = cur.map(i => i.projectId === activeProject.id ? { ...i, status: 'Approved' } : i);
      localStorage.setItem('sanmati_boqItems', JSON.stringify(updated));
    } catch (e) { /* ignore */ }
    alert(`${activeProject.name} साठी सर्व BOQ Items यशस्वीरीत्या Approve केले!`);
  };

  // ==============================================================
  // 3. SUBCONTRACTOR MANAGEMENT HANDLERS
  // ==============================================================
  const handleOpenAddSubModal = () => {
    if (!activeProject && (!projects || projects.length === 0)) {
      alert('कृपया आधी Project तयार करा.');
      return;
    }
    setSubForm({
      id: `SUB-${Date.now().toString().slice(-4)}`,
      name: '',
      contact: '+91 ',
      assignedWork: 'Electrical Wiring & HT Panel',
      contractAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: 'In Progress'
    });
    setEditingSub(null);
    setIsAddSubModalOpen(true);
  };

  const handleOpenEditSubModal = (sub) => {
    setSubForm({
      id: sub.id,
      name: sub.name,
      contact: sub.contact || '',
      assignedWork: sub.assignedWork || 'Electrical Work',
      contractAmount: String(sub.contractAmount || ''),
      startDate: sub.startDate || '',
      endDate: sub.endDate || '',
      status: sub.status || 'In Progress'
    });
    setEditingSub(sub);
    setIsAddSubModalOpen(true);
  };

  const handleSaveSubcontractor = (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) {
      alert('कृपया Subcontractor चे नाव भरा.');
      return;
    }

    const cAmount = Number(subForm.contractAmount) || 0;

    if (editingSub) {
      setAllSubcontractors(prev => (prev || []).map(s => {
        if (s.id === editingSub.id) {
          const paid = Number(s.paidAmount) || 0;
          return {
            ...s,
            name: subForm.name,
            contact: subForm.contact,
            assignedWork: subForm.assignedWork,
            contractAmount: cAmount,
            startDate: subForm.startDate,
            endDate: subForm.endDate,
            status: subForm.status,
            pendingAmount: Math.max(0, cAmount - paid),
            paymentStatus: paid >= cAmount ? 'Fully Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid'
          };
        }
        return s;
      }));
    } else {
      const newSub = {
        id: subForm.id || `SUB-${Date.now().toString().slice(-4)}`,
        projectId: activeProject ? activeProject.id : projects?.[0]?.id,
        projectName: activeProject ? activeProject.name : projects?.[0]?.name,
        name: subForm.name,
        contact: subForm.contact,
        assignedWork: subForm.assignedWork,
        contractAmount: cAmount,
        paidAmount: 0,
        pendingAmount: cAmount,
        startDate: subForm.startDate,
        endDate: subForm.endDate,
        status: subForm.status || 'In Progress',
        paymentStatus: 'Unpaid',
        payments: []
      };

      setAllSubcontractors(prev => [newSub, ...(prev || [])]);
    }

    setIsAddSubModalOpen(false);
  };

  const handleDeleteSubcontractor = (subId) => {
    if (window.confirm('हा Subcontractor नक्की काढून टाकायचा आहे का?')) {
      setAllSubcontractors(prev => (prev || []).filter(s => s.id !== subId));
    }
  };

  const handleOpenPaymentModal = (sub) => {
    setPayingSub(sub);
    setPaymentForm({
      amount: '',
      mode: 'Bank Transfer (NEFT/RTGS)',
      date: new Date().toISOString().split('T')[0],
      refNo: `TXN-${Date.now().toString().slice(-6)}`
    });
  };

  const handleSaveSubPayment = (e) => {
    e.preventDefault();
    if (!payingSub) return;

    const payVal = Number(paymentForm.amount) || 0;
    if (payVal <= 0) {
      alert('कृपया वैध रक्कम भरा.');
      return;
    }

    const currentPaid = Number(payingSub.paidAmount) || 0;
    const newPaid = currentPaid + payVal;
    const totalContract = Number(payingSub.contractAmount) || 0;
    const newPending = Math.max(0, totalContract - newPaid);
    const newPayStatus = newPaid >= totalContract ? 'Fully Paid' : 'Partially Paid';

    const payRecord = {
      id: `PAY-${Date.now()}`,
      amount: payVal,
      date: paymentForm.date,
      mode: paymentForm.mode,
      refNo: paymentForm.refNo
    };

    setAllSubcontractors(prev => (prev || []).map(s => {
      if (s.id === payingSub.id) {
        return {
          ...s,
          paidAmount: newPaid,
          pendingAmount: newPending,
          paymentStatus: newPayStatus,
          payments: [payRecord, ...(s.payments || [])]
        };
      }
      return s;
    }));

    setPayingSub(null);
    alert(`₹${payVal.toLocaleString('en-IN')} चे पेमेंट ${payingSub.name} ला यशस्वीरीत्या नोंदवले!`);
  };

  // ==============================================================
  // 4. RA BILLING AND COSTING HANDLERS
  // ==============================================================
  const projectRABills = useMemo(() => {
    if (!activeProject) return [];
    return (raBills || []).filter(b => b.projectId === activeProject.id);
  }, [raBills, activeProject]);

  const projectDPRs = useMemo(() => {
    if (!activeProject) return [];
    return (dprLogs || []).filter(l => l.projectId === activeProject.id);
  }, [dprLogs, activeProject]);

  const handleOpenCreateRABillModal = () => {
    if (!activeProject) {
      alert('कृपया आधी Project तयार करा.');
      return;
    }

    const billCount = projectRABills.length + 1;
    const pad = String(billCount).padStart(2, '0');
    const prevBilledSum = projectRABills
      .filter(b => b.status === 'Approved' || b.status === 'Paid')
      .reduce((acc, b) => acc + (Number(b.currentBillAmount || b.amount) || 0), 0);

    setRABillForm({
      id: `RAB-${Date.now().toString().slice(-4)}`,
      billNo: `SC/RAB/2026/${pad}`,
      date: new Date().toISOString().split('T')[0],
      completedWork: 'Basement excavation, foundation casting & ground floor RCC columns completion',
      completedWorkValue: '',
      previousBills: prevBilledSum
    });
    setIsCreateRABillModalOpen(true);
  };

  const handleSaveRABill = (e) => {
    e.preventDefault();
    if (!activeProject) return;

    const completedVal = Number(raBillForm.completedWorkValue) || 0;
    const prevBilled = Number(raBillForm.previousBills) || 0;
    const currentBill = Math.max(0, completedVal - prevBilled);

    if (currentBill <= 0) {
      alert('पूर्ण झालेल्या कामाची एकूण किंमत मागील बिलांपेक्षा जास्त असणे आवश्यक आहे.');
      return;
    }

    const retention = Math.round(currentBill * 0.05); // 5% retention
    const gst = Math.round(currentBill * 0.18); // 18% GST
    const netPayable = currentBill - retention + gst;

    const newBill = {
      id: raBillForm.id || `RAB-${Date.now()}`,
      billNo: raBillForm.billNo,
      projectId: activeProject.id,
      projectName: activeProject.name,
      date: raBillForm.date,
      completedWork: raBillForm.completedWork,
      totalProjectValue: Number(activeProject.budget || activeProject.contractValue) || 0,
      completedWorkValue: completedVal,
      previousBills: prevBilled,
      currentBillAmount: currentBill,
      amount: currentBill,
      retentionAmount: retention,
      gstAmount: gst,
      netPayable: netPayable,
      status: 'Approved' // auto approved for workflow ease
    };

    if (typeof setRaBills === 'function') {
      setRaBills(prev => [newBill, ...(prev || [])]);
    }
    try {
      const cur = JSON.parse(localStorage.getItem('sanmati_raBills') || '[]');
      const updated = [newBill, ...cur.filter(b => b.id !== newBill.id)];
      localStorage.setItem('sanmati_raBills', JSON.stringify(updated));
    } catch (e) { /* ignore */ }
    try {
      saveModuleRecord('raBills', newBill.id, newBill);
    } catch (e) { /* ignore */ }

    setIsCreateRABillModalOpen(false);
    alert(`RA Bill ${newBill.billNo} (रक्कम: ₹${currentBill.toLocaleString('en-IN')}) यशस्वीरीत्या तयार केले!`);
  };

  const handleUpdateRABillStatus = (billId, newStatus) => {
    let updatedBill = null;
    if (typeof setRaBills === 'function') {
      setRaBills(prev => (prev || []).map(b => {
        if (b.id === billId) {
          updatedBill = { ...b, status: newStatus };
          return updatedBill;
        }
        return b;
      }));
    }
    if (updatedBill) {
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_raBills') || '[]');
        const updated = cur.map(b => b.id === billId ? updatedBill : b);
        localStorage.setItem('sanmati_raBills', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        saveModuleRecord('raBills', billId, updatedBill);
      } catch (e) { /* ignore */ }
    }
  };

  const handleDeleteRABill = (billId) => {
    if (window.confirm('हे RA Bill नक्की हटवायचे आहे का?')) {
      if (typeof setRaBills === 'function') {
        setRaBills(prev => (prev || []).filter(b => b.id !== billId));
      }
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_raBills') || '[]');
        const updated = cur.filter(b => b.id !== billId);
        localStorage.setItem('sanmati_raBills', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        removeModuleRecord('raBills', billId);
      } catch (e) { /* ignore */ }
    }
  };

  // ==============================================================
  // 5. PROJECT PROGRESS TRACKING HANDLERS
  // ==============================================================
  const handleUpdateActivityProgress = (activityName, newProgress) => {
    if (!activeProject) return;
    const numericProg = Math.min(100, Math.max(0, Number(newProgress)));
    const newStatus = numericProg === 100 ? 'Completed' : numericProg > 0 ? 'In Progress' : 'Pending';

    let updatedProject = null;
    if (typeof setProjects === 'function') {
      setProjects(prev => (prev || []).map(p => {
        if (p.id === activeProject.id) {
          const acts = (p.activities || CONSTRUCTION_ACTIVITIES.map(name => ({ name, progress: 0, status: 'Pending' }))).map(act => {
            if (act.name === activityName) {
              return { ...act, progress: numericProg, status: newStatus };
            }
            return act;
          });

          // Compute overall progress average
          const avg = Math.round(acts.reduce((acc, a) => acc + (a.progress || 0), 0) / acts.length);

          updatedProject = {
            ...p,
            activities: acts,
            progress: avg,
            completionPercentage: avg,
            status: avg === 100 ? 'Completed' : 'Ongoing'
          };
          return updatedProject;
        }
        return p;
      }));
    }

    if (updatedProject) {
      try {
        const cur = JSON.parse(localStorage.getItem('sanmati_projects') || '[]');
        const updated = cur.map(p => p.id === updatedProject.id ? updatedProject : p);
        localStorage.setItem('sanmati_projects', JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      try {
        saveModuleRecord('projects', updatedProject.id, updatedProject);
      } catch (e) { /* ignore */ }
    }
  };

  const handleSaveDPRLog = (e) => {
    e.preventDefault();
    if (!activeProject) return;

    const newLog = {
      id: `DPR-${Date.now()}`,
      projectId: activeProject.id,
      projectName: activeProject.name,
      date: dprForm.date,
      engineer: dprForm.engineer,
      activitiesExecuted: dprForm.activitiesExecuted,
      labourCount: dprForm.labourCount,
      materialsConsumed: dprForm.materialsConsumed,
      weather: dprForm.weather,
      isDelayed: dprForm.isDelayed,
      delayRemarks: dprForm.delayRemarks
    };

    saveDprLogs(prev => [newLog, ...(prev || [])]);
    setIsDPRModalOpen(false);
    alert('Daily Progress Report (DPR) यशस्वीरीत्या नोंदवला!');
  };

  const handleDeleteDPRLog = (logId) => {
    if (window.confirm('हा DPR Log हटवायचा आहे का?')) {
      saveDprLogs(prev => (prev || []).filter(l => l.id !== logId));
    }
  };

  // ==============================================================
  // 6. EXPORT / DOWNLOAD HANDLERS (RA BILLS & DPR LOGS)
  // ==============================================================
  const handleDownloadRABillInvoice = (bill) => {
    if (!bill) return;
    const proj = activeProject || (projects || []).find(p => p.id === bill.projectId);
    const cli = (clients || []).find(c => c.id === proj?.clientId || c.name === proj?.clientName);
    generateRABillPDF(bill, proj, cli);
  };

  const handleDownloadRABillsReport = (format = 'pdf') => {
    if (!projectRABills || projectRABills.length === 0) {
      alert('या प्रोजेक्टसाठी कोणतेही RA Bills उपलब्ध नाहीत.');
      return;
    }
    const safeProjName = (activeProject?.name || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
    if (format === 'excel') {
      const data = projectRABills.map((b, idx) => ({
        'Sr No': idx + 1,
        'Bill Number': b.billNo || b.billNumber,
        'Bill Date': formatDate(b.date),
        'Project Name': activeProject?.name || b.projectName,
        'Work Scope / Description': b.completedWork || '-',
        'Cumulative Work (Rs)': Number(b.completedWorkValue || b.currentBillAmount || 0),
        'Previous Bills (Rs)': Number(b.previousBills || 0),
        'Current RA Bill Amount (Rs)': Number(b.currentBillAmount || b.amount || 0),
        'Retention 5% (Rs)': Number(b.retentionAmount || Math.round((b.currentBillAmount || 0) * 0.05)),
        'GST 18% (Rs)': Number(b.gstAmount || Math.round((b.currentBillAmount || 0) * 0.18)),
        'Net Payable (Rs)': Number(b.netPayable || b.currentBillAmount || 0),
        'Status': b.status || 'Approved'
      }));
      exportToExcel(data, `RABills_Report_${safeProjName}`, 'RA Bills');
    } else {
      const headers = ['Bill No', 'Date', 'Work Scope', 'Cumulative (Rs)', 'Prev Bills (Rs)', 'Current Bill (Rs)', 'Net Payable (Rs)', 'Status'];
      const rows = projectRABills.map(b => [
        b.billNo || b.billNumber,
        formatDate(b.date),
        (b.completedWork || '').slice(0, 35) + ((b.completedWork || '').length > 35 ? '...' : ''),
        formatCurrency(b.completedWorkValue || b.currentBillAmount || 0),
        formatCurrency(b.previousBills || 0),
        formatCurrency(b.currentBillAmount || b.amount || 0),
        formatCurrency(b.netPayable || b.currentBillAmount || 0),
        b.status || 'Approved'
      ]);
      generatePDFReport({
        title: `RA BILLING REGISTER & PAYMENT REPORT`,
        subtitle: `Project: ${activeProject?.name || 'Construction Project'} | Client: ${activeProject?.clientName || 'Private Client'} | Total Budget: ${formatCurrency(activeProject?.budget || 0)}`,
        headers,
        rows,
        fileName: `RABills_Report_${safeProjName}`,
        orientation: 'landscape'
      });
    }
  };

  const handleDownloadSingleDPR = (dpr) => {
    if (!dpr) return;
    const proj = activeProject || (projects || []).find(p => p.id === dpr.projectId);
    generateDPRPDF(dpr, proj);
  };

  const handleDownloadDPRReport = (format = 'pdf') => {
    if (!projectDPRs || projectDPRs.length === 0) {
      alert('या प्रोजेक्टसाठी कोणतेही Daily Progress Reports (DPR) उपलब्ध नाहीत.');
      return;
    }
    const safeProjName = (activeProject?.name || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
    if (format === 'excel') {
      const data = projectDPRs.map((d, idx) => ({
        'Sr No': idx + 1,
        'Log Date': formatDate(d.date),
        'Site Engineer': d.engineer,
        'Activities Executed': d.activitiesExecuted,
        'Labour Deployment': d.labourCount,
        'Materials Consumed': d.materialsConsumed,
        'Schedule Status': d.isDelayed ? `Delayed (${d.delayRemarks || ''})` : 'On Track',
        'Project': activeProject?.name || d.projectName
      }));
      exportToExcel(data, `DPR_Report_${safeProjName}`, 'DPR Logs');
    } else {
      const headers = ['Log Date', 'Site Engineer', 'Activities Executed Today', 'Labour Deployment', 'Materials Consumed', 'Schedule / Status'];
      const rows = projectDPRs.map(d => [
        formatDate(d.date),
        d.engineer,
        d.activitiesExecuted,
        d.labourCount || '-',
        d.materialsConsumed || '-',
        d.isDelayed ? `Delayed: ${d.delayRemarks || ''}` : 'On Track'
      ]);
      generatePDFReport({
        title: `DAILY SITE PROGRESS REPORT (DPR) REGISTER`,
        subtitle: `Project: ${activeProject?.name || 'Construction Project'} | Site Location: ${activeProject?.location || 'Kolhapur'}`,
        headers,
        rows,
        fileName: `DPR_Report_${safeProjName}`,
        orientation: 'landscape'
      });
    }
  };

  // ==============================================================
  // RENDER SUBMODULE 1: Project Creation and Management
  // ==============================================================
  const renderProjectCreation = () => {
    const list = projects || [];
    const filtered = list.filter(p => {
      if (projectStatusFilter !== 'ALL' && p.status !== projectStatusFilter) return false;
      if (!projectSearch.trim()) return true;
      const q = projectSearch.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q) ||
        (p.projectManager || '').toLowerCase().includes(q)
      );
    });

    const totalBudgetSum = list.reduce((acc, p) => acc + (Number(p.budget || p.contractValue || p.totalBudget) || 0), 0);
    const ongoingCount = list.filter(p => p.status === 'Ongoing' || p.status === 'Active' || p.status === 'In Progress').length;
    const completedCount = list.filter(p => p.status === 'Completed').length;
    const onHoldCount = list.filter(p => p.status === 'On Hold').length;

    return (
      <div className="space-y-6">
        {/* Banner with Add Project Button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule i • Step 1</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Project Creation and Management (प्रकल्प निर्मिती व व्यवस्थापन)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              नवीन Construction Project तयार करणे, Client, Manager, कालावधी आणि एकूण बजेट व्यवस्थापित करणे.
            </p>
          </div>
          <button
            onClick={handleOpenAddProjectModal}
            className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Projects Portfolio</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {formatCurrency(totalBudgetSum)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{list.length} Projects in ERP</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Ongoing Projects</span>
            <div className="text-2xl font-extrabold text-blue-700 font-mono mt-2">
              {ongoingCount} Projects
            </div>
            <p className="text-xs text-slate-500 mt-1">Active site execution in progress</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Completed Handover</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {completedCount} Projects
            </div>
            <p className="text-xs text-slate-500 mt-1">Successfully delivered to clients</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">On Hold Projects</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
              {onHoldCount} Projects
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approvals or paused</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Project Name, Location, Client, Manager..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'Ongoing', 'Completed', 'On Hold'].map(st => (
              <button
                key={st}
                onClick={() => setProjectStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  projectStatusFilter === st 
                    ? 'bg-[#002046] text-white shadow-2xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Master Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Project Code & Name</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Project Budget (₹)</th>
                  <th className="px-4 py-3">Timeline (Start – End)</th>
                  <th className="px-4 py-3">Project Manager</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      कोणताही Project उपलब्ध नाही. नवीन प्रकल्प तयार करण्यासाठी "+ Add Project" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const budgetVal = Number(p.budget || p.contractValue || p.totalBudget) || 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[#002046] block">{p.code || p.id}</span>
                          <span className="font-semibold text-slate-900 block max-w-xs">{p.name}</span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">
                          {p.clientName || 'Direct Client'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {p.location || 'Kolhapur'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(budgetVal)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                          <div>{formatDate(p.startDate)}</div>
                          <div className="text-[10px] text-slate-400">to {formatDate(p.endDate || p.estimatedCompletionDate)}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            {p.projectManager || 'Er. Amit Deshmukh'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <select
                            value={p.status || 'Ongoing'}
                            onChange={(e) => handleUpdateProjectStatusDirect(p.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none ${
                              p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              p.status === 'On Hold' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingProject(p)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="View Project Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditProjectModal(p)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-[#002046] hover:text-[#002e66] transition-colors cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Project"
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

  // ==============================================================
  // RENDER SUBMODULE 2: BOQ Management (Bill of Quantities)
  // ==============================================================
  const renderBOQManagement = () => {
    const list = boqItems || [];
    const projectBOQ = activeProject ? list.filter(b => b.projectId === activeProject.id) : [];

    const totalBOQCost = projectBOQ.reduce((acc, i) => acc + (Number(i.totalAmount || i.estimatedCost) || 0), 0);
    const approvedBOQCost = projectBOQ
      .filter(i => i.status === 'Approved')
      .reduce((acc, i) => acc + (Number(i.totalAmount || i.estimatedCost) || 0), 0);
    const projBudget = Number(activeProject?.budget || activeProject?.contractValue) || 0;
    const variance = projBudget - totalBOQCost;

    return (
      <div className="space-y-6">
        {/* Banner with Project Selector & Add BOQ Button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule ii • Step 2</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              BOQ Management - Bill of Quantities (अंदाजपत्रक व प्रमाण यादी)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रकल्प पूर्ण करण्यासाठी लागणारे Material, Labour आणि कामांचा अंदाजे खर्च (Rate & Quantity) निश्चित करणे.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3.5 py-2 bg-white border-2 border-[#002046] rounded-xl text-xs font-bold text-[#002046] focus:outline-none shadow-xs"
              >
                {(projects || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddBOQModal}
              className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add BOQ Item</span>
            </button>

            {projectBOQ.length > 0 && (
              <button
                onClick={handleApproveAllBOQ}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Approve All Draft Items"
              >
                <Check className="w-4 h-4" />
                <span>Approve BOQ</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards for Selected Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Estimated BOQ Cost</span>
            <div className="text-2xl font-extrabold text-[#002046] font-mono mt-2">
              {formatCurrency(totalBOQCost)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{projectBOQ.length} Items configured</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Approved BOQ Cost</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {formatCurrency(approvedBOQCost)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Ready for purchase & site requisition</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Project Total Budget</span>
            <div className="text-2xl font-extrabold text-blue-700 font-mono mt-2">
              {formatCurrency(projBudget)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{activeProject?.name || 'No Project'}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Budget vs BOQ Variance</span>
            <div className={`text-2xl font-extrabold font-mono mt-2 ${variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(variance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{variance >= 0 ? 'Within budget limit ✓' : 'Over budget warning ⚠️'}</p>
          </div>
        </div>

        {/* Example Helper Card matching user prompt */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-bold text-[10px]">Flow & Example</span>
            <span className="text-blue-950 font-medium">
              <strong>BOQ Calculation:</strong> Quantity × Rate = Total Amount (उदा. Cement 100 Bags @ ₹350 = ₹35,000 | Steel 500 Kg @ ₹60 = ₹30,000 | Sand 10 Brass @ ₹5,000 = ₹50,000)
            </span>
          </div>
          <span className="font-mono font-bold text-blue-950 whitespace-nowrap">Total = ₹1,15,000</span>
        </div>

        {/* Master BOQ Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Material Name</th>
                  <th className="px-4 py-3">Work Description</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3 text-right">Rate (₹)</th>
                  <th className="px-4 py-3 text-right">Total Amount (₹)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectBOQ.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      या Project साठी कोणतेही BOQ Item नाही. नवीन आयटम जोडण्यासाठी "+ Add BOQ Item" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  projectBOQ.map((item, idx) => {
                    const itemTotal = Number(item.totalAmount || item.estimatedCost) || 0;
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-900 block">{item.materialName || item.description}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 max-w-xs">
                          {item.workDescription || item.description}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {Number(item.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800">
                          ₹{Number(item.rate).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#002046] text-sm">
                          {formatCurrency(itemTotal)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status || 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditBOQModal(item)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-[#002046] transition-colors cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBOQItem(item.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Item"
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

  // ==============================================================
  // RENDER SUBMODULE 3: Subcontractor Management
  // ==============================================================
  const renderSubcontractorManagement = () => {
    const list = allSubcontractors || [];
    const totalContractSum = list.reduce((acc, s) => acc + (Number(s.contractAmount) || 0), 0);
    const totalPaidSum = list.reduce((acc, s) => acc + (Number(s.paidAmount) || 0), 0);
    const totalPendingSum = list.reduce((acc, s) => acc + (Number(s.pendingAmount) || 0), 0);

    return (
      <div className="space-y-6">
        {/* Banner with Add Subcontractor Button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule iii • Step 3</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Subcontractor Management (उप-कंत्राटदार व्यवस्थापन)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plumbing, Electrical, Painting, Tiles इत्यादी कामांचे Subcontractors, Contract Amount आणि Payment व्यवस्थापन.
            </p>
          </div>

          <button
            onClick={handleOpenAddSubModal}
            className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subcontractor</span>
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Subcontractors</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
              {list.length} Vendors
            </div>
            <p className="text-xs text-slate-500 mt-1">Specialized trade partners</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Total Contract Value</span>
            <div className="text-2xl font-extrabold text-blue-700 font-mono mt-2">
              {formatCurrency(totalContractSum)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sum of all outsourced contracts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Total Paid Amount</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {formatCurrency(totalPaidSum)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Cleared against completed work</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pending Due Balance</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
              {formatCurrency(totalPendingSum)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Outstanding subcontractor dues</p>
          </div>
        </div>

        {/* Master Subcontractors Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Subcontractor Name & Contact</th>
                  <th className="px-4 py-3">Assigned Project & Work</th>
                  <th className="px-4 py-3 text-right">Contract Amount (₹)</th>
                  <th className="px-4 py-3 text-right">Paid Amount (₹)</th>
                  <th className="px-4 py-3 text-right">Pending Due (₹)</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-4 py-3 text-center">Work Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      कोणताही Subcontractor नोंदवलेला नाही. नवीन कंत्राटदार जोडण्यासाठी "+ Add Subcontractor" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  list.map((sub) => {
                    const cAmt = Number(sub.contractAmount) || 0;
                    const pAmt = Number(sub.paidAmount) || 0;
                    const dueAmt = Math.max(0, cAmt - pAmt);
                    const proj = projects?.find(p => p.id === sub.projectId);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-900 block">{sub.name}</span>
                          <span className="text-[11px] text-slate-500">{sub.contact}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-[#002046] block">{proj?.name || sub.projectName || 'All Project'}</span>
                          <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {sub.assignedWork}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(cAmt)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(pAmt)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-700">
                          {formatCurrency(dueAmt)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                          <div>{formatDate(sub.startDate)}</div>
                          <div className="text-[10px] text-slate-400">to {formatDate(sub.endDate)}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            sub.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            sub.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            sub.status === 'On Hold' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {sub.status || 'In Progress'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenPaymentModal(sub)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Pay</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditSubModal(sub)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcontractor(sub.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete"
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

  // ==============================================================
  // RENDER SUBMODULE 4: RA Billing & Project Progress Tracking (Merged)
  // ==============================================================
  const renderRABillingAndProgressTracking = () => {
    const activities = activeProject?.activities || CONSTRUCTION_ACTIVITIES.map(name => ({
      name,
      progress: 0,
      status: 'Pending'
    }));

    const avgProgress = Math.round(activities.reduce((acc, a) => acc + (a.progress || 0), 0) / activities.length);
    const completedActsCount = activities.filter(a => (a.progress || 0) === 100).length;
    const pendingActsCount = activities.length - completedActsCount;

    const projectDPRs = (dprLogs || []).filter(l => l.projectId === activeProject?.id);

    return (
      <div className="space-y-6">
        {/* Banner with Project Selector & Action Buttons */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule iv • Step 4</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              RA Billing & Project Progress Tracking (रनिंग अकाउंट बिलिंग व प्रकल्प प्रगती ट्रॅकिंग)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रकल्पाची प्रत्यक्ष प्रगती (Progress), १० महत्त्वाचे टप्पे, DPR दैनंदिन अहवाल आणि Running Account (RA) बिलिंग व्यवस्थापन.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3.5 py-2 bg-white border-2 border-[#002046] rounded-xl text-xs font-bold text-[#002046] focus:outline-none shadow-xs"
              >
                {(projects || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreateRABillModal}
              className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create RA Bill</span>
            </button>

            <button
              onClick={() => setIsDPRModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer border border-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Daily Progress (DPR)</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Overall Progress</span>
            <div className="text-3xl font-extrabold text-[#002046] font-mono mt-2">
              {avgProgress}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-[#002046] h-full rounded-full transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Completed Work Phases</span>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
              {completedActsCount} of {activities.length} Phases
            </div>
            <p className="text-xs text-slate-500 mt-1">100% finished milestones</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pending Work In Progress</span>
            <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
              {pendingActsCount} Phases
            </div>
            <p className="text-xs text-slate-500 mt-1">Under ongoing execution</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Expected Completion</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-2">
              {formatDate(activeProject?.endDate || activeProject?.estimatedCompletionDate)}
            </div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Schedule: On Track ✓
            </span>
          </div>
        </div>

        {/* 10 Key Construction Activities Milestones */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                10 Work Milestones Breakdown ({activeProject?.name || 'Project'})
              </h3>
              <p className="text-xs text-slate-500">प्रत्येक टप्प्याची प्रगती टक्केवारी (% Progress) येथे थेट अपडेट करा.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700">
              Average Progress: {avgProgress}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act, idx) => {
              const prog = act.progress || 0;
              const isDone = prog === 100;
              return (
                <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {act.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-800' :
                      prog > 0 ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {prog}% • {act.status}
                    </span>
                  </div>

                  {/* Progress Range Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={prog}
                      onChange={(e) => handleUpdateActivityProgress(act.name, e.target.value)}
                      className="w-full accent-[#002046] cursor-pointer"
                    />
                    <button
                      onClick={() => handleUpdateActivityProgress(act.name, isDone ? 0 : 100)}
                      className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        isDone ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isDone ? 'Reset' : 'Complete ✓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RA Bills History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                RA Bills History ({activeProject?.name || 'Selected Project'})
              </h4>
              <p className="text-xs text-slate-500">क्लायंट रनिंग अकाउंट (RA) बिलांची यादी व इन्व्हॉइस</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadRABillsReport('pdf')}
                disabled={projectRABills.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                title="Download RA Bills Statement Report (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Report (PDF)</span>
              </button>
              <button
                onClick={() => handleDownloadRABillsReport('excel')}
                disabled={projectRABills.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                title="Download RA Bills Statement (Excel)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleOpenCreateRABillModal}
                className="px-3 py-1.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create RA Bill</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Bill Number & Date</th>
                  <th className="px-4 py-3">Work Executed Description</th>
                  <th className="px-4 py-3 text-right">Cumulative Work (₹)</th>
                  <th className="px-4 py-3 text-right">Previous Bills (₹)</th>
                  <th className="px-4 py-3 text-right">Current RA Bill (₹)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectRABills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      या Project साठी कोणतेही RA Bill तयार केलेले नाही. नवीन बिल तयार करण्यासाठी "+ Create RA Bill" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  projectRABills.map((bill) => {
                    const curAmt = Number(bill.currentBillAmount || bill.amount) || 0;
                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[#002046] block">{bill.billNo}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(bill.date)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 max-w-xs">
                          {bill.completedWork}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(bill.completedWorkValue || curAmt)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                          {formatCurrency(bill.previousBills || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-blue-700 text-sm">
                          {formatCurrency(curAmt)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <select
                            value={bill.status || 'Approved'}
                            onChange={(e) => handleUpdateRABillStatus(bill.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                              bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              bill.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Approved">Approved</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingInvoice(bill)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                              title="View Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>View Invoice</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRABill(bill.id)}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Bill"
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

        {/* Daily / Weekly Progress Logs (DPR) Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Daily Site Progress Reports (DPR Logs)
              </h4>
              <p className="text-xs text-slate-500">साइटवरील दैनंदिन काम, कामगार, साहित्य व प्रगती</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownloadDPRReport('pdf')}
                disabled={projectDPRs.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                title="Download All DPR Logs (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Report (PDF)</span>
              </button>
              <button
                onClick={() => handleDownloadDPRReport('excel')}
                disabled={projectDPRs.length === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
                title="Download All DPR Logs (Excel)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => setIsDPRModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Daily Progress (DPR)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Log Date</th>
                  <th className="px-4 py-3">Site Engineer</th>
                  <th className="px-4 py-3">Activities Executed Today</th>
                  <th className="px-4 py-3">Labour Deployment</th>
                  <th className="px-4 py-3">Materials Consumed</th>
                  <th className="px-4 py-3 text-center">Schedule / Delays</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectDPRs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      कोणताही Daily Progress Report (DPR) नोंदवलेला नाही. "+ Log Daily Progress (DPR)" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  projectDPRs.map((dpr) => (
                    <tr key={dpr.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#002046]">
                        {formatDate(dpr.date)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {dpr.engineer}
                      </td>
                      <td className="px-4 py-3.5 text-slate-900 font-medium max-w-xs">
                        {dpr.activitiesExecuted}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {dpr.labourCount}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {dpr.materialsConsumed}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {dpr.isDelayed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center justify-center gap-1 mx-auto w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Delayed ({dpr.delayRemarks || 'Weather'})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            On Track ✓
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingDPR(dpr)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                            title="View Daily Progress Report (DPR)"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View DPR</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDPRLog(dpr.id)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete DPR"
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

  // ==============================================================
  // MAIN RETURN & MODALS
  // ==============================================================
  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Submodule Rendering based on activeTab */}
      {activeTab === 'creation' && renderProjectCreation()}
      {activeTab === 'boq' && renderBOQManagement()}
      {activeTab === 'subcontractors' && renderSubcontractorManagement()}
      {activeTab === 'rabilling' && renderRABillingAndProgressTracking()}

      {/* 1. ADD / EDIT PROJECT MODAL */}
      <Modal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        title={editingProject ? `Edit Project: ${editingProject.code || editingProject.name}` : 'Add New Construction Project (नवीन प्रकल्प तयार करा)'}
        subtitle="Project ची संपूर्ण माहिती, क्लायंट, कालावधी आणि बजेट नोंदवा."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Code *</label>
              <input
                type="text"
                required
                value={projectForm.code}
                onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Status *</label>
              <select
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Project Name (कामाचे नाव) *</label>
            <input
              type="text"
              required
              placeholder="उदा. Building Construction Work - Residential Tower"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Client Name *</label>
              <input
                type="text"
                required
                placeholder="उदा. Tarabai Developers LLP"
                value={projectForm.clientName}
                onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Location (कामाचे ठिकाण) *</label>
              <input
                type="text"
                required
                placeholder="उदा. Kawala Naka, Kolhapur"
                value={projectForm.location}
                onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Total Project Budget (₹) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="उदा. 5000000"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">End Date *</label>
              <input
                type="date"
                required
                value={projectForm.endDate}
                onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Project Manager *</label>
            <input
              type="text"
              required
              placeholder="उदा. Er. Amit Deshmukh"
              value={projectForm.projectManager}
              onChange={(e) => setProjectForm({ ...projectForm, projectManager: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {editingProject ? 'Update Project' : 'Save Project Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. ADD / EDIT BOQ MODAL */}
      <Modal
        isOpen={isAddBOQModalOpen}
        onClose={() => setIsAddBOQModalOpen(false)}
        title={editingBOQItem ? 'Edit BOQ Item' : 'Add BOQ Item (नवीन प्रमाण आयटम जोडा)'}
        subtitle={`Project: ${activeProject?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveBOQItem} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Material Name *</label>
            <input
              type="text"
              required
              placeholder="उदा. Cement, Steel, Sand, Red Bricks, RMC"
              value={boqForm.materialName}
              onChange={(e) => setBOQForm({ ...boqForm, materialName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Work Description (कामाची माहिती) *</label>
            <input
              type="text"
              required
              placeholder="उदा. RCC slab shuttering & column casting"
              value={boqForm.description}
              onChange={(e) => setBOQForm({ ...boqForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                value={boqForm.quantity}
                onChange={(e) => setBOQForm({ ...boqForm, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Unit *</label>
              <select
                value={boqForm.unit}
                onChange={(e) => setBOQForm({ ...boqForm, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
              >
                {BOQ_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Rate (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="350"
                value={boqForm.rate}
                onChange={(e) => setBOQForm({ ...boqForm, rate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono">
            <span className="text-slate-600 text-xs">Total Amount (Qty × Rate):</span>
            <span className="text-sm font-black text-[#002046]">
              ₹{((Number(boqForm.quantity) || 0) * (Number(boqForm.rate) || 0)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddBOQModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {editingBOQItem ? 'Update BOQ' : 'Save BOQ Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. ADD / EDIT SUBCONTRACTOR MODAL */}
      <Modal
        isOpen={isAddSubModalOpen}
        onClose={() => setIsAddSubModalOpen(false)}
        title={editingSub ? 'Edit Subcontractor' : 'Add Subcontractor (नवीन उप-कंत्राटदार जोडा)'}
        subtitle="Plumbing, Electrical, Painting इत्यादी कामांसाठी Subcontractor नोंदवा."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSubcontractor} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Subcontractor Name *</label>
            <input
              type="text"
              required
              placeholder="उदा. Shri Swami Samarth Electricals"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Contact Phone / Mobile *</label>
              <input
                type="text"
                required
                placeholder="+91 98220 12345"
                value={subForm.contact}
                onChange={(e) => setSubForm({ ...subForm, contact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Contract Amount (₹) *</label>
              <input
                type="number"
                required
                min="1000"
                placeholder="200000"
                value={subForm.contractAmount}
                onChange={(e) => setSubForm({ ...subForm, contractAmount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Assigned Work (कामाचा प्रकार) *</label>
            <select
              value={subForm.assignedWork}
              onChange={(e) => setSubForm({ ...subForm, assignedWork: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
            >
              {SUBCONTRACT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Work Start Date *</label>
              <input
                type="date"
                required
                value={subForm.startDate}
                onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Work End Date *</label>
              <input
                type="date"
                required
                value={subForm.endDate}
                onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Work Status</label>
            <select
              value={subForm.status}
              onChange={(e) => setSubForm({ ...subForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSubModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {editingSub ? 'Update Subcontractor' : 'Save Subcontractor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. RECORD SUBCONTRACTOR PAYMENT MODAL */}
      {payingSub && (
        <Modal
          isOpen={Boolean(payingSub)}
          onClose={() => setPayingSub(null)}
          title={`Record Payment: ${payingSub.name}`}
          subtitle={`Contract Amount: ₹${Number(payingSub.contractAmount).toLocaleString('en-IN')} | Pending Due: ₹${Number(payingSub.pendingAmount).toLocaleString('en-IN')}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveSubPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min="100"
                max={payingSub.pendingAmount || payingSub.contractAmount}
                placeholder={`Max ₹${payingSub.pendingAmount || payingSub.contractAmount}`}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Mode *</label>
                <select
                  value={paymentForm.mode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900 bg-white"
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Transaction Ref No / Cheque No *</label>
              <input
                type="text"
                required
                value={paymentForm.refNo}
                onChange={(e) => setPaymentForm({ ...paymentForm, refNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayingSub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. CREATE RA BILL MODAL */}
      <Modal
        isOpen={isCreateRABillModalOpen}
        onClose={() => setIsCreateRABillModalOpen(false)}
        title="Create Running Account Bill (नवीन RA Bill तयार करा)"
        subtitle={`Project: ${activeProject?.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveRABill} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">RA Bill Number *</label>
              <input
                type="text"
                required
                value={raBillForm.billNo}
                onChange={(e) => setRABillForm({ ...raBillForm, billNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Bill Date *</label>
              <input
                type="date"
                required
                value={raBillForm.date}
                onChange={(e) => setRABillForm({ ...raBillForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Completed Work Scope & Description *</label>
            <textarea
              rows={2}
              required
              placeholder="उदा. Foundation casting, Plinth beam, and 1st to 3rd floor slab casting work complete"
              value={raBillForm.completedWork}
              onChange={(e) => setRABillForm({ ...raBillForm, completedWork: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Cumulative Completed Work Value (₹) *</label>
              <input
                type="number"
                required
                min={Number(raBillForm.previousBills) + 1000}
                placeholder="उदा. 1000000"
                value={raBillForm.completedWorkValue}
                onChange={(e) => setRABillForm({ ...raBillForm, completedWorkValue: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Previous Bills Amount (वजा)</label>
              <input
                type="text"
                disabled
                value={`₹${Number(raBillForm.previousBills).toLocaleString('en-IN')}`}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 bg-slate-100"
              />
            </div>
          </div>

          {/* Current RA Bill Calculation Preview */}
          {Number(raBillForm.completedWorkValue) > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-emerald-950">
                <span>Current RA Bill Amount (कामानुसार बिल):</span>
                <span className="font-mono text-sm">
                  ₹{Math.max(0, Number(raBillForm.completedWorkValue) - Number(raBillForm.previousBills)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>Less 5% Retention:</span>
                <span className="font-mono">- ₹{Math.round(Math.max(0, Number(raBillForm.completedWorkValue) - Number(raBillForm.previousBills)) * 0.05).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800">
                <span>Add 18% GST:</span>
                <span className="font-mono">+ ₹{Math.round(Math.max(0, Number(raBillForm.completedWorkValue) - Number(raBillForm.previousBills)) * 0.18).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateRABillModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Approve & Generate RA Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. LOG DAILY PROGRESS (DPR) MODAL */}
      <Modal
        isOpen={isDPRModalOpen}
        onClose={() => setIsDPRModalOpen(false)}
        title="Log Daily Site Progress - DPR (दैनिक प्रगती नोंद)"
        subtitle={`Project: ${activeProject?.name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveDPRLog} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Report Date *</label>
              <input
                type="date"
                required
                value={dprForm.date}
                onChange={(e) => setDprForm({ ...dprForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Site Engineer *</label>
              <input
                type="text"
                required
                value={dprForm.engineer}
                onChange={(e) => setDprForm({ ...dprForm, engineer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Activities Executed Today (आज पूर्ण झालेले काम) *</label>
            <textarea
              rows={2}
              required
              placeholder="उदा. RCC 4th slab beam shuttering and electrical conduit laying completed"
              value={dprForm.activitiesExecuted}
              onChange={(e) => setDprForm({ ...dprForm, activitiesExecuted: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Labour Deployment Count</label>
              <input
                type="text"
                value={dprForm.labourCount}
                onChange={(e) => setDprForm({ ...dprForm, labourCount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Materials Consumed Today</label>
              <input
                type="text"
                value={dprForm.materialsConsumed}
                onChange={(e) => setDprForm({ ...dprForm, materialsConsumed: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDelayedCheck"
              checked={dprForm.isDelayed}
              onChange={(e) => setDprForm({ ...dprForm, isDelayed: e.target.checked })}
              className="rounded accent-[#002046] cursor-pointer"
            />
            <label htmlFor="isDelayedCheck" className="text-slate-700 font-bold cursor-pointer">
              कामात काही अडचण / उशीर (Delayed Work) झाला आहे का?
            </label>
          </div>

          {dprForm.isDelayed && (
            <div>
              <label className="block text-slate-600 font-medium mb-1">Reason for Delay (उशिराचे कारण)</label>
              <input
                type="text"
                placeholder="उदा. Cement supply delay किंवा मुसळधार पाऊस"
                value={dprForm.delayRemarks}
                onChange={(e) => setDprForm({ ...dprForm, delayRemarks: e.target.value })}
                className="w-full px-3 py-2 border border-rose-300 rounded-xl text-rose-900 bg-rose-50"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDPRModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Save Daily Report (DPR)
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. VIEW PROJECT DETAILS MODAL */}
      {viewingProject && (
        <Modal
          isOpen={Boolean(viewingProject)}
          onClose={() => setViewingProject(null)}
          title={`Project Details: ${viewingProject.code || viewingProject.id}`}
          subtitle={viewingProject.name}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Project Information</span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{viewingProject.name}</p>
                <p className="text-slate-600 mt-1"><strong>Client:</strong> {viewingProject.clientName}</p>
                <p className="text-slate-600"><strong>Location:</strong> {viewingProject.location}</p>
                <p className="text-slate-600 mt-1"><strong>Manager:</strong> {viewingProject.projectManager}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Financials & Status</span>
                <div className="text-lg font-mono font-black text-[#002046]">
                  {formatCurrency(viewingProject.budget || viewingProject.contractValue || viewingProject.totalBudget || 0)}
                </div>
                <div className="mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    viewingProject.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    viewingProject.status === 'On Hold' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {viewingProject.status || 'Ongoing'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] pt-1">
                  Timeline: {formatDate(viewingProject.startDate)} to {formatDate(viewingProject.endDate || viewingProject.estimatedCompletionDate)}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. VIEW RA BILL INVOICE MODAL */}
      {viewingInvoice && (
        <Modal
          isOpen={Boolean(viewingInvoice)}
          onClose={() => setViewingInvoice(null)}
          title={`Running Account Bill: ${viewingInvoice.billNo}`}
          subtitle={`Project: ${viewingInvoice.projectName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-slate-800 bg-white p-2">
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-[#002046]">SANMATI CONSTRUCTIONS</h3>
              <p className="text-[11px] text-slate-500">Government & Private Civil Contractors • Kolhapur, Maharashtra</p>
              <span className="px-3 py-0.5 bg-blue-50 text-[#002046] border border-blue-200 rounded-full font-bold text-[10px] inline-block mt-1">
                RUNNING ACCOUNT (RA) BILL INVOICE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p><strong>RA Bill No:</strong> <span className="font-mono">{viewingInvoice.billNo}</span></p>
                <p><strong>Bill Date:</strong> {formatDate(viewingInvoice.date)}</p>
                <p><strong>Project:</strong> {viewingInvoice.projectName}</p>
              </div>
              <div className="text-right">
                <p><strong>Status:</strong> <span className="font-bold text-emerald-700">{viewingInvoice.status || 'Approved'}</span></p>
                <p><strong>Total Project Value:</strong> {formatCurrency(viewingInvoice.totalProjectValue || 0)}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-left">Bill Particulars</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5">
                      <span className="font-bold block text-slate-900">Cumulative Completed Work Value</span>
                      <span className="text-[11px] text-slate-500">{viewingInvoice.completedWork}</span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {formatCurrency(viewingInvoice.completedWorkValue || viewingInvoice.currentBillAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">Less: Previous Running Bills Cleared</td>
                    <td className="p-2.5 text-right font-mono text-slate-500">
                      - {formatCurrency(viewingInvoice.previousBills || 0)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 font-bold">
                    <td className="p-2.5 text-slate-900">Gross Current RA Bill Amount</td>
                    <td className="p-2.5 text-right font-mono text-[#002046] font-bold">
                      {formatCurrency(viewingInvoice.currentBillAmount || viewingInvoice.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">Less: 5% Retention Security Deposit</td>
                    <td className="p-2.5 text-right font-mono text-amber-700">
                      - {formatCurrency(viewingInvoice.retentionAmount || Math.round((viewingInvoice.currentBillAmount || 0) * 0.05))}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-600">Add: 18% GST Statutory Tax</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      + {formatCurrency(viewingInvoice.gstAmount || Math.round((viewingInvoice.currentBillAmount || 0) * 0.18))}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-black text-sm">
                    <td className="p-3">NET PAYABLE BILL AMOUNT</td>
                    <td className="p-3 text-right font-mono">
                      {formatCurrency(viewingInvoice.netPayable || viewingInvoice.currentBillAmount || viewingInvoice.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownloadRABillInvoice(viewingInvoice)}
                className="px-4 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. VIEW DAILY SITE PROGRESS REPORT (DPR) MODAL */}
      {viewingDPR && (
        <Modal
          isOpen={Boolean(viewingDPR)}
          onClose={() => setViewingDPR(null)}
          title={`Daily Progress Report (DPR): ${formatDate(viewingDPR.date)}`}
          subtitle={`Project: ${activeProject?.name || viewingDPR.projectName || 'Construction Site'}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-slate-800 bg-white p-2">
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-[#002046]">SANMATI CONSTRUCTIONS</h3>
              <p className="text-[11px] text-slate-500">Government & Private Civil Contractors • Kolhapur, Maharashtra</p>
              <span className="px-3 py-0.5 bg-blue-50 text-[#002046] border border-blue-200 rounded-full font-bold text-[10px] inline-block mt-1">
                DAILY SITE PROGRESS REPORT (DPR)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p><strong>Report Date:</strong> <span className="font-mono">{formatDate(viewingDPR.date)}</span></p>
                <p><strong>Site Engineer:</strong> {viewingDPR.engineer || 'Er. Amit Deshmukh'}</p>
                <p><strong>Project:</strong> {activeProject?.name || viewingDPR.projectName}</p>
              </div>
              <div className="text-right">
                <p>
                  <strong>Schedule:</strong>{' '}
                  <span className={`font-bold ${viewingDPR.isDelayed ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {viewingDPR.isDelayed ? `Delayed (${viewingDPR.delayRemarks || 'Weather/Delay'})` : 'On Track ✓'}
                  </span>
                </p>
                <p><strong>Location:</strong> {activeProject?.location || 'Kolhapur, Maharashtra'}</p>
                <p><strong>Weather:</strong> {viewingDPR.weather || 'Normal Work Day'}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-2.5 text-left w-1/3">Category / Head</th>
                    <th className="p-2.5 text-left">Site Progress Particulars & Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">Activities Executed Today</td>
                    <td className="p-2.5 text-slate-800 font-medium">{viewingDPR.activitiesExecuted}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">Labour Deployment</td>
                    <td className="p-2.5 text-slate-700">{viewingDPR.labourCount || 'Masons: 6, Helpers: 14, Bar Benders: 8'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">Materials Consumed</td>
                    <td className="p-2.5 text-slate-700">{viewingDPR.materialsConsumed || 'Cement: 150 bags, Sand: 2 brass, Steel: 1.5 MT'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">Schedule & Delays</td>
                    <td className="p-2.5">
                      {viewingDPR.isDelayed ? (
                        <span className="text-rose-700 font-bold">Delayed: {viewingDPR.delayRemarks || 'Site Obstruction'}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">Schedule On Track - Work proceeding as per plan</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/50">Safety & Quality Checks</td>
                    <td className="p-2.5 text-slate-600">PPE gear mandatory, slump and cube test verified compliant</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownloadSingleDPR(viewingDPR)}
                className="px-4 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download DPR (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingDPR(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
