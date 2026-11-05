// SANMATI CONSTRUCTIONS ERP - Master Operational Data Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PROJECTS,
  INITIAL_CLIENTS,
  INITIAL_VENDORS,
  INITIAL_BOQ_ITEMS,
  INITIAL_RA_BILLS,
  INITIAL_INVENTORY,
  INITIAL_GPS_LOGS,
  INITIAL_HRMS_EMPLOYEES,
  INITIAL_TALLY_CONFIG,
  INITIAL_APPROVALS,
  INITIAL_TENDERS,
  INITIAL_QUOTATIONS,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_LEADS,
  INITIAL_HERO_BANNERS
} from '../services/mockData';
import { calculateHaversineDistance, calculateBOQItem, calculateRABill } from '../utils/formatters';
import { isFirebaseConfigured } from '../services/firebase';
import { 
  subscribeToModuleCollection, 
  saveModuleRecord, 
  removeModuleRecord 
} from '../services/firebaseSync';

const ERPDataContext = createContext(null);

export const ERPDataProvider = ({ children }) => {
  // Clear any existing cached dummy records in localStorage so modules 1, 2, and 3 start completely blank
  const DATA_VERSION = 'v9_zero_dummy_projects_strictly_empty';
  if (typeof window !== 'undefined' && localStorage.getItem('sanmati_data_version') !== DATA_VERSION) {
    const keys = [
      'clients', 'leads', 'followUps', 'customerActivities',
      'incomeRecords', 'expenseRecords', 'paymentTracking', 'ledgerEntries',
      'vendors', 'vendorContacts', 'vendorPurchases', 'vendorPayments',
      'projects', 'boqItems', 'raBills', 'expenses'
    ];
    keys.forEach(k => localStorage.removeItem(`sanmati_${k}`));
    localStorage.setItem('sanmati_data_version', DATA_VERSION);
  }

  // Local storage assisted state persistence for interactive modifications
  const usePersistedState = (key, initial) => {
    const [state, setState] = useState(() => {
      const saved = localStorage.getItem(`sanmati_${key}`);
      if (saved) {
        try {
          let parsed = JSON.parse(saved);
          if (key === 'projects' && Array.isArray(parsed)) {
            parsed = parsed.filter(p => !p.name?.includes('Royal Palace') && !p.name?.includes('D.Y. Patil') && !p.name?.includes('MIDC Shiroli'));
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'clients' && Array.isArray(parsed)) {
            parsed = parsed.filter(c => !c.name?.includes('Kolhapur Municipal Corporation') && !c.name?.includes('D. Y. Patil') && !c.name?.includes('Chhatrapati Shahu') && !c.name?.includes('Tarabai Heights'));
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'vendors' && Array.isArray(parsed)) {
            parsed = parsed.filter(v => !v.name?.includes('Rajaram Steel') && !v.name?.includes('Ultratech Cement') && !v.name?.includes('Kolhapur Earthmovers') && !v.name?.includes('Mahavir Hardware'));
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'hrmsEmployees' && Array.isArray(parsed)) {
            const DUMMY_NAMES = ['Sanmati Patil', 'Er. Rajesh Kulkarni', 'Er. Amit Deshmukh', 'CA Sneha Shinde'];
            parsed = parsed.filter(emp => !DUMMY_NAMES.includes(emp.name));
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'leads' && Array.isArray(parsed)) {
            parsed = parsed.map(l => l.assignedEmployee === 'Er. Rajesh Kulkarni' ? { ...l, assignedEmployee: '' } : l);
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'followUps' && Array.isArray(parsed)) {
            parsed = parsed.map(f => f.assignedEmployee === 'Er. Rajesh Kulkarni' ? { ...f, assignedEmployee: '' } : f);
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'customerActivities' && Array.isArray(parsed)) {
            parsed = parsed.map(a => a.employeeName === 'Er. Rajesh Kulkarni' ? { ...a, employeeName: '' } : a);
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'leads' && Array.isArray(parsed) && parsed.length === 0) {
            parsed = INITIAL_LEADS;
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          if (key === 'heroBanners' && (!parsed || (Array.isArray(parsed) && parsed.length === 0))) {
            parsed = INITIAL_HERO_BANNERS;
            localStorage.setItem(`sanmati_${key}`, JSON.stringify(parsed));
          }
          return parsed;
        } catch (e) { /* ignore */ }
      }
      return initial;
    });
    useEffect(() => {
      localStorage.setItem(`sanmati_${key}`, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  };

  const [projects, setProjects] = usePersistedState('projects', INITIAL_PROJECTS);
  const [clients, setClients] = usePersistedState('clients', INITIAL_CLIENTS);
  const [vendors, setVendors] = usePersistedState('vendors', INITIAL_VENDORS);
  const [boqItems, setBoqItems] = usePersistedState('boqItems', INITIAL_BOQ_ITEMS);
  const [raBills, setRaBills] = usePersistedState('raBills', INITIAL_RA_BILLS);
  const [inventory, setInventory] = usePersistedState('inventory', INITIAL_INVENTORY);
  const [gpsLogs, setGpsLogs] = usePersistedState('gpsLogs', INITIAL_GPS_LOGS);
  const [hrmsEmployees, setHrmsEmployees] = usePersistedState('hrmsEmployees', INITIAL_HRMS_EMPLOYEES);
  const [tallyConfig, setTallyConfig] = usePersistedState('tallyConfig', INITIAL_TALLY_CONFIG);
  const [approvals, setApprovals] = usePersistedState('approvals', INITIAL_APPROVALS);
  const [tenders, setTenders] = usePersistedState('tenders', INITIAL_TENDERS);
  const [quotations, setQuotations] = usePersistedState('quotations', INITIAL_QUOTATIONS);
  const [expenses, setExpenses] = usePersistedState('expenses', INITIAL_EXPENSES);
  const [notifications, setNotifications] = usePersistedState('notifications', INITIAL_NOTIFICATIONS);

  // Live project guarantee: ensure dummy projects are never shown
  useEffect(() => {
    setProjects(prev => {
      const filtered = (prev || []).filter(p => !p.name?.includes('Royal Palace') && !p.name?.includes('D.Y. Patil') && !p.name?.includes('MIDC Shiroli'));
      if (filtered.length !== prev.length) {
        localStorage.setItem('sanmati_projects', JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  }, [setProjects]);

  // CRM Dedicated States
  const [leads, setLeads] = usePersistedState('leads', INITIAL_LEADS);
  const [heroBanners, setHeroBanners] = usePersistedState('heroBanners', INITIAL_HERO_BANNERS);
  const [followUps, setFollowUps] = usePersistedState('followUps', []);
  const [customerActivities, setCustomerActivities] = usePersistedState('customerActivities', []);

  // Account Management Dedicated States
  const [incomeRecords, setIncomeRecords] = usePersistedState('incomeRecords', []);
  const [expenseRecords, setExpenseRecords] = usePersistedState('expenseRecords', []);
  const [paymentTracking, setPaymentTracking] = usePersistedState('paymentTracking', []);
  const [ledgerEntries, setLedgerEntries] = usePersistedState('ledgerEntries', []);
  const [nfdRecords, setNfdRecords] = usePersistedState('nfdRecords', []);

  // Vendor Management Dedicated States
  const [vendorContacts, setVendorContacts] = usePersistedState('vendorContacts', []);
  const [vendorPurchases, setVendorPurchases] = usePersistedState('vendorPurchases', []);
  const [vendorPayments, setVendorPayments] = usePersistedState('vendorPayments', []);

  // Live Firebase Cloud Firestore Realtime Synchronizer
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubs = [
      subscribeToModuleCollection('clients', (data) => {
        if (data && data.length > 0) setClients(data);
      }),
      subscribeToModuleCollection('leads', (data) => {
        if (data && data.length > 0) setLeads(data);
      }),
      subscribeToModuleCollection('followUps', (data) => {
        if (data && data.length > 0) setFollowUps(data);
      }),
      subscribeToModuleCollection('customerActivities', (data) => {
        if (data && data.length > 0) setCustomerActivities(data);
      }),
      subscribeToModuleCollection('incomeRecords', (data) => {
        if (data && data.length > 0) setIncomeRecords(data);
      }),
      subscribeToModuleCollection('expenseRecords', (data) => {
        if (data && data.length > 0) setExpenseRecords(data);
      }),
      subscribeToModuleCollection('paymentTracking', (data) => {
        if (data && data.length > 0) setPaymentTracking(data);
      }),
      subscribeToModuleCollection('ledgerEntries', (data) => {
        if (data && data.length > 0) setLedgerEntries(data);
      }),
      subscribeToModuleCollection('nfdRecords', (data) => {
        if (data && data.length > 0) setNfdRecords(data);
      }),
      subscribeToModuleCollection('vendors', (data) => {
        if (data && data.length > 0) setVendors(data);
      }),
      subscribeToModuleCollection('vendorContacts', (data) => {
        if (data && data.length > 0) setVendorContacts(data);
      }),
      subscribeToModuleCollection('vendorPurchases', (data) => {
        if (data && data.length > 0) setVendorPurchases(data);
      }),
      subscribeToModuleCollection('vendorPayments', (data) => {
        if (data && data.length > 0) setVendorPayments(data);
      }),
      subscribeToModuleCollection('projects', (data) => {
        if (data && data.length > 0) setProjects(data);
      }),
      subscribeToModuleCollection('hrmsEmployees', (data) => {
        if (data && data.length > 0) setHrmsEmployees(data);
      }),
      subscribeToModuleCollection('boqItems', (data) => {
        if (data && data.length > 0) setBoqItems(data);
      }),
      subscribeToModuleCollection('raBills', (data) => {
        if (data && data.length > 0) setRaBills(data);
      }),
      subscribeToModuleCollection('gpsLogs', (data) => {
        if (data && data.length > 0) setGpsLogs(data);
      }),
      subscribeToModuleCollection('approvals', (data) => {
        if (data && data.length > 0) setApprovals(data);
      })
    ];

    // Auto-sync any existing local records across collections directly to live Firebase
    try {
      const collectionsToSync = [
        { key: 'sanmati_hrmsEmployees', col: 'hrmsEmployees' },
        { key: 'sanmati_clients', col: 'clients' },
        { key: 'sanmati_leads', col: 'leads' },
        { key: 'sanmati_followUps', col: 'followUps' },
        { key: 'sanmati_customerActivities', col: 'customerActivities' },
        { key: 'sanmati_incomeRecords', col: 'incomeRecords' },
        { key: 'sanmati_expenseRecords', col: 'expenseRecords' },
        { key: 'sanmati_paymentTracking', col: 'paymentTracking' },
        { key: 'sanmati_ledgerEntries', col: 'ledgerEntries' },
        { key: 'sanmati_nfdRecords', col: 'nfdRecords' },
        { key: 'sanmati_vendors', col: 'vendors' },
        { key: 'sanmati_vendorContacts', col: 'vendorContacts' },
        { key: 'sanmati_vendorPurchases', col: 'vendorPurchases' },
        { key: 'sanmati_vendorPayments', col: 'vendorPayments' },
        { key: 'sanmati_projects', col: 'projects' },
      ];

      collectionsToSync.forEach(({ key, col }) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach(item => {
              if (item && item.id) {
                saveModuleRecord(col, item.id, item);
              }
            });
          }
        }
      });
    } catch (e) { /* ignore */ }

    return () => {
      unsubs.forEach(unsub => typeof unsub === 'function' && unsub());
    };
  }, []);

  // --- Notification Dispatcher ---
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: `NOT-${Date.now()}`,
      title,
      message,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // --- Project Operations ---
  const addProject = (projectData) => {
    const newProject = {
      id: `PRJ-KLP-00${projects.length + 1}`,
      actualExpenditure: 0,
      billedAmount: 0,
      receivedAmount: 0,
      outstandingAmount: 0,
      actualProfit: 0,
      completionPercentage: 0,
      status: 'Active',
      activities: [
        { name: "Excavation", progress: 0, status: "Pending" },
        { name: "Foundation", progress: 0, status: "Pending" },
        { name: "RCC work", progress: 0, status: "Pending" },
        { name: "Brickwork", progress: 0, status: "Pending" },
        { name: "Plastering", progress: 0, status: "Pending" },
        { name: "Flooring", progress: 0, status: "Pending" },
        { name: "Electrical work", progress: 0, status: "Pending" },
        { name: "Plumbing", progress: 0, status: "Pending" },
        { name: "Painting", progress: 0, status: "Pending" },
        { name: "Final handover", progress: 0, status: "Pending" }
      ],
      ...projectData
    };
    newProject.estimatedProfit = Math.max(0, (newProject.contractValue || 0) - (newProject.projectBudget || 0));
    setProjects(prev => [newProject, ...prev]);
    saveModuleRecord('projects', newProject.id, newProject);
    addNotification('Project Created', `Project ${newProject.name} created successfully.`, 'success');
    return newProject;
  };

  const updateProject = (projectId, updatedData) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const merged = { ...p, ...updatedData };
        merged.estimatedProfit = Math.max(0, (merged.contractValue || 0) - (merged.projectBudget || 0));
        merged.actualProfit = Math.max(0, (merged.billedAmount || 0) - (merged.actualExpenditure || 0));
        return merged;
      }
      return p;
    }));
    saveModuleRecord('projects', projectId, updatedData);
  };

  const updateProjectActivity = (projectId, activityName, progress, status) => {
    let updatedProj = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const activities = p.activities.map(act => 
          act.name === activityName ? { ...act, progress: Number(progress), status } : act
        );
        const avgProgress = Math.round(activities.reduce((acc, curr) => acc + (curr.progress || 0), 0) / activities.length);
        updatedProj = {
          ...p,
          activities,
          completionPercentage: avgProgress
        };
        return updatedProj;
      }
      return p;
    }));
    if (updatedProj) {
      saveModuleRecord('projects', projectId, updatedProj);
    }
    addNotification('Activity Updated', `${activityName} updated to ${progress}% on project.`, 'info');
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    removeModuleRecord('projects', projectId);
    addNotification('Project Deleted', `Project has been deleted.`, 'info');
  };

  // --- BOQ Operations ---
  const addBOQItem = (boqData) => {
    const amount = calculateBOQItem(boqData.quantity, boqData.rate);
    const newItem = {
      id: boqData.id || `BOQ-${Date.now()}`,
      amount,
      ...boqData
    };
    setBoqItems(prev => [newItem, ...prev]);
    saveModuleRecord('boqItems', newItem.id, newItem);
    addNotification('BOQ Item Added', `${newItem.description.substring(0, 30)}... added to BOQ.`, 'success');
    return newItem;
  };

  // --- RA Billing Operations ---
  const createRABill = (billData) => {
    const calc = calculateRABill({
      currentAmount: billData.currentBillAmount,
      retentionPercent: billData.retentionPercent || 5,
      advanceRecovery: billData.advanceRecovery || 0,
      otherDeductions: billData.otherDeductions || 0,
      gstPercent: billData.gstPercent || 18,
      isInterState: billData.isInterState || false
    });

    const newBill = {
      id: billData.id || `RA-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      retentionAmount: calc.retentionAmount,
      taxableSubtotal: calc.taxableSubtotal,
      cgst: calc.gst.cgst,
      sgst: calc.gst.sgst,
      igst: calc.gst.igst,
      netPayable: calc.netPayable,
      status: 'Submitted',
      paymentStatus: 'Unpaid',
      tallySync: 'Pending',
      ...billData
    };

    setRaBills(prev => [newBill, ...prev]);
    saveModuleRecord('raBills', newBill.id, newBill);

    // Also automatically create an Approval request for the bill
    const appRequest = {
      id: `APP-${Date.now()}`,
      type: "RA bill",
      referenceId: newBill.id,
      title: `${newBill.billNumber} for ${newBill.projectName || 'Project'}`,
      requester: billData.submittedBy || 'Project Manager',
      date: newBill.date,
      amount: newBill.netPayable,
      status: 'Submitted',
      currentApprover: 'Super Admin / Owner',
      comments: `New RA Bill submitted for amount ${newBill.netPayable}`,
      history: [
        { step: 'RA Bill generated and submitted', date: new Date().toLocaleString(), user: billData.submittedBy || 'Project Manager' }
      ]
    };
    setApprovals(prev => [appRequest, ...prev]);

    // Update project billed amount
    if (newBill.projectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === newBill.projectId) {
          const newBilled = (p.billedAmount || 0) + newBill.currentBillAmount;
          const newOutstanding = (p.outstandingAmount || 0) + newBill.netPayable;
          return {
            ...p,
            billedAmount: newBilled,
            outstandingAmount: newOutstanding
          };
        }
        return p;
      }));
    }

    addNotification('RA Bill Submitted', `Bill ${newBill.billNumber} generated for ${newBill.netPayable}. Sent for approval.`, 'success');
    return newBill;
  };

  // --- Inventory & Stock Movement ---
  const issueStockToSite = ({ materialId, projectId, quantity, issuedTo, remarks }) => {
    const qty = Number(quantity);
    let materialName = '';
    let unitCost = 0;

    setInventory(prev => prev.map(mat => {
      if (mat.id === materialId) {
        materialName = mat.name;
        unitCost = mat.unitPrice || 0;
        const newStock = Math.max(0, mat.currentStock - qty);
        const prevAlloc = mat.projectAllocation?.[projectId] || 0;
        return {
          ...mat,
          currentStock: newStock,
          status: newStock <= mat.minimumThreshold ? 'Low Stock Alert' : 'Adequate',
          projectAllocation: {
            ...mat.projectAllocation,
            [projectId]: prevAlloc + qty
          }
        };
      }
      return mat;
    }));

    // Update project actual expenditure
    const totalCost = qty * unitCost;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          actualExpenditure: (p.actualExpenditure || 0) + totalCost
        };
      }
      return p;
    }));

    addNotification('Material Issued to Site', `${qty} units of ${materialName} issued to project ${projectId}. Total: ₹${totalCost}.`, 'info');
  };

  const receiveStockInward = ({ materialId, quantity, vendorId, unitPrice }) => {
    const qty = Number(quantity);
    setInventory(prev => prev.map(mat => {
      if (mat.id === materialId) {
        const updatedStock = mat.currentStock + qty;
        return {
          ...mat,
          currentStock: updatedStock,
          unitPrice: unitPrice ? Number(unitPrice) : mat.unitPrice,
          status: updatedStock > mat.minimumThreshold ? 'Adequate' : mat.status
        };
      }
      return mat;
    }));
    addNotification('Stock Received Inward', `${qty} units added to central inventory.`, 'success');
  };

  // --- GPS Check-In / Check-Out with Geofencing Verification ---
  const recordGPSCheckIn = ({ userId, userName, projectId, latitude, longitude, accuracy, notes, type = 'Project Site' }) => {
    const proj = projects.find(p => p.id === projectId);
    let geofenceStatus = "Site Unknown";
    let isInside = false;

    if (proj && proj.latitude && proj.longitude) {
      const distance = calculateHaversineDistance(latitude, longitude, proj.latitude, proj.longitude);
      const radius = proj.geofenceRadius || 250;
      isInside = distance <= radius;
      geofenceStatus = isInside 
        ? `Inside Geofence (${Math.round(distance)}m from site center)`
        : `Outside Geofence (${Math.round(distance)}m away, max allowed ${radius}m)`;
    }

    const newLog = {
      id: `GPS-${Date.now()}`,
      userId,
      userName,
      projectId,
      projectName: proj ? proj.name : 'Unassigned Site',
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      accuracy: Number(accuracy ? accuracy.toFixed(1) : 5),
      timestamp: new Date().toISOString(),
      locationType: type,
      attendanceStatus: isInside ? 'Verified Check-In' : 'Unverified Check-In (Outside Geofence)',
      geofenceStatus,
      notes: notes || 'GPS site verification check-in'
    };

    setGpsLogs(prev => [newLog, ...prev]);
    saveModuleRecord('gpsLogs', newLog.id, newLog);
    addNotification(
      isInside ? 'GPS Check-In Verified' : 'GPS Check-In Outside Geofence',
      `${userName} logged attendance for ${proj?.name || 'Project'}. Status: ${geofenceStatus}`,
      isInside ? 'success' : 'warning'
    );
    return newLog;
  };

  // --- Approvals Workflow (Draft -> Submitted -> Approved / Rejected) ---
  const updateApprovalStatus = (approvalId, newStatus, comments, approverName) => {
    let updatedApproval = null;
    setApprovals(prev => prev.map(app => {
      if (app.id === approvalId) {
        updatedApproval = {
          ...app,
          status: newStatus,
          history: [
            ...app.history,
            { step: `${newStatus} by ${approverName}`, date: new Date().toLocaleString(), user: approverName, comments }
          ]
        };

        // If it was an RA Bill approval
        if (app.type === "RA bill" && newStatus === 'Approved') {
          setRaBills(bills => bills.map(b => {
            if (b.id === app.referenceId) {
              const updatedB = { ...b, status: 'Approved' };
              saveModuleRecord('raBills', b.id, updatedB);
              return updatedB;
            }
            return b;
          }));
        }

        return updatedApproval;
      }
      return app;
    }));
    if (updatedApproval) {
      saveModuleRecord('approvals', approvalId, updatedApproval);
    }
    addNotification('Approval Updated', `Request marked as ${newStatus} by ${approverName}.`, newStatus === 'Approved' ? 'success' : 'warning');
  };

  // --- Tally Integration Sync Trigger ---
  const syncToTally = (voucherType, voucherNo, amount) => {
    const newLog = {
      id: `SYNC-${Date.now()}`,
      voucherType,
      voucherNo,
      amount,
      status: "Success",
      timestamp: new Date().toLocaleString(),
      tallyMasterId: `${Math.floor(10000 + Math.random() * 90000)}`
    };

    setTallyConfig(prev => ({
      ...prev,
      lastSyncTime: new Date().toLocaleString(),
      recentSyncLogs: [newLog, ...prev.recentSyncLogs]
    }));

    addNotification('Tally Sync Complete', `${voucherType} (${voucherNo}) exported to Tally XML Gateway successfully.`, 'success');
    return newLog;
  };

  // --- Reset to Factory Initial Data ---
  const resetAllData = () => {
    setProjects(INITIAL_PROJECTS);
    setClients(INITIAL_CLIENTS);
    setVendors(INITIAL_VENDORS);
    setBoqItems(INITIAL_BOQ_ITEMS);
    setRaBills(INITIAL_RA_BILLS);
    setInventory(INITIAL_INVENTORY);
    setGpsLogs(INITIAL_GPS_LOGS);
    setHrmsEmployees(INITIAL_HRMS_EMPLOYEES);
    setTallyConfig(INITIAL_TALLY_CONFIG);
    setApprovals(INITIAL_APPROVALS);
    setTenders(INITIAL_TENDERS);
    setQuotations(INITIAL_QUOTATIONS);
    setExpenses(INITIAL_EXPENSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setLeads([]);
    setFollowUps([]);
    setCustomerActivities([]);
    addNotification('System Reset', 'All enterprise mock databases have been restored to initial Kolhapur records.', 'info');
  };

  // --- CRM Helper Actions ---
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: customerData.id || `CLI-${String(clients.length + 1).padStart(3, '0')}`,
      name: customerData.name || '',
      companyName: customerData.companyName || customerData.name || '',
      category: customerData.category || 'Company',
      designation: customerData.designation || '',
      phone: customerData.phone || customerData.mobileNumber || '',
      alternatePhone: customerData.alternatePhone || '',
      email: customerData.email || '',
      address: customerData.address || '',
      city: customerData.city || 'Kolhapur',
      state: customerData.state || 'Maharashtra',
      pincode: customerData.pincode || '',
      gstin: customerData.gstin || '',
      pan: customerData.pan || '',
      customerType: customerData.customerType || 'Company',
      leadSource: customerData.leadSource || '',
      assignedProject: customerData.assignedProject || '',
      workType: customerData.workType || 'Residential Bungalow Construction',
      customWorkType: customerData.customWorkType || '',
      workDescription: customerData.workDescription || '',
      contractValue: Number(customerData.contractValue) || 0,
      assignedEngineer: customerData.assignedEngineer || '',
      status: customerData.status || 'Active',
      totalBilled: Number(customerData.totalBilled) || 0,
      outstanding: Number(customerData.outstanding) || 0,
      createdDate: customerData.createdDate || new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newCustomer, ...prev]);
    saveModuleRecord('clients', newCustomer.phone || newCustomer.id, newCustomer);
    addNotification('Customer Added', `${newCustomer.name} has been successfully registered.`, 'success');
    return newCustomer;
  };

  const updateCustomer = (id, updatedFields) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    saveModuleRecord('clients', id, updatedFields);
    addNotification('Customer Updated', `Customer ${id} profile has been updated.`, 'info');
  };

  const deleteCustomer = (id) => {
    const cust = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    removeModuleRecord('clients', id);
    addNotification('Customer Removed', `Customer ${cust?.name || id} deleted.`, 'warning');
  };

  const addLead = (leadData) => {
    let maxNum = 0;
    leads.forEach(l => {
      const m = l.id?.match(/LED-(\d+)/) || l.id?.match(/LEAD-(\d+)/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const nextId = leadData.id || `LED-${String(maxNum + 1).padStart(3, '0')}`;

    const newLead = {
      id: nextId,
      leadTitle: leadData.leadTitle || 'Construction Inquiry',
      leadDate: leadData.leadDate || new Date().toISOString().split('T')[0],
      customerName: leadData.customerName || '',
      companyName: leadData.companyName || '',
      mobileNumber: leadData.mobileNumber || '',
      alternateMobileNumber: leadData.alternateMobileNumber || '',
      email: leadData.email || '',
      projectType: leadData.projectType || leadData.enquiryType || 'Residential Building',
      projectName: leadData.projectName || '',
      projectLocation: leadData.projectLocation || 'Kolhapur',
      city: leadData.city || 'Kolhapur',
      state: leadData.state || 'Maharashtra',
      pincode: leadData.pincode || '',
      estimatedBudget: Number(leadData.estimatedBudget) || 0,
      leadDescription: leadData.leadDescription || '',
      leadSource: leadData.leadSource || 'Website',
      assignedEmployee: leadData.assignedEmployee || '',
      department: leadData.department || 'Civil Engineering',
      nextFollowUpDate: leadData.nextFollowUpDate || leadData.followUpDate || '',
      priority: leadData.priority || 'Medium',
      status: leadData.status || 'New',
      createdDate: leadData.createdDate || new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' ' + new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setLeads(prev => [newLead, ...prev]);
    addNotification('Inquiry Received', `New customer inquiry recorded for "${newLead.customerName}".`, 'success');

    // Auto-create initial follow-up if follow-up date specified
    if (newLead.nextFollowUpDate) {
      addFollowUp({
        entityType: 'Lead',
        entityId: newLead.id,
        customerName: newLead.customerName,
        contactNumber: newLead.mobileNumber,
        followUpDate: newLead.nextFollowUpDate,
        followUpTime: '11:00',
        followUpType: 'Call',
        assignedEmployee: newLead.assignedEmployee,
        reminderNotes: `Initial follow-up for construction lead: ${newLead.leadTitle}`,
        status: 'Pending'
      });
    }
    return newLead;
  };

  const updateLead = (id, updatedFields) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const history = [...(l.statusHistory || [])];
        if (updatedFields.status && updatedFields.status !== l.status) {
          history.push({
            status: updatedFields.status,
            date: new Date().toISOString(),
            updatedBy: updatedFields.assignedEmployee || l.assignedEmployee || 'Super Admin'
          });
        }
        return {
          ...l,
          ...updatedFields,
          statusHistory: history,
          updatedDate: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    }));
    saveModuleRecord('leads', id, updatedFields);
    addNotification('Lead Updated', `Lead ${id} details updated.`, 'info');
  };

  const deleteLead = (id) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    removeModuleRecord('leads', id);
    addNotification('Lead Deleted', `Lead "${lead?.leadTitle || id}" removed.`, 'warning');
  };

  const addHeroBanner = (bannerData) => {
    const newBanner = {
      id: `BAN-${Date.now()}`,
      title: bannerData.title || 'New Project Showcase',
      category: bannerData.category || 'Commercial',
      location: bannerData.location || 'Kolhapur',
      status: bannerData.status || 'Active',
      order: heroBanners.length + 1
    };
    setHeroBanners(prev => [...prev, newBanner]);
    addNotification('Banner Added', `Hero banner "${newBanner.title}" created.`, 'success');
    return newBanner;
  };

  const updateHeroBanner = (id, updatedFields) => {
    setHeroBanners(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    addNotification('Banner Updated', 'Hero banner settings updated.', 'info');
  };

  const deleteHeroBanner = (id) => {
    setHeroBanners(prev => prev.filter(b => b.id !== id));
    addNotification('Banner Removed', 'Hero banner removed from slider.', 'warning');
  };

  const convertLeadToCustomer = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;

    const cleanLeadPhone = lead.mobileNumber ? lead.mobileNumber.replace(/\D/g, '') : '';

    // Check if customer already exists (by 10-digit mobile or email) to prevent duplicates
    let matchedCustomer = clients.find(c => {
      const cleanCustPhone = c.phone ? c.phone.replace(/\D/g, '') : '';
      const phoneMatch = cleanLeadPhone && cleanCustPhone && cleanLeadPhone.slice(-10) === cleanCustPhone.slice(-10);
      const emailMatch = lead.email && c.email && c.email.toLowerCase().trim() === lead.email.toLowerCase().trim();
      return phoneMatch || emailMatch;
    });

    let customerId = matchedCustomer?.id;

    if (!matchedCustomer) {
      let maxNum = 0;
      clients.forEach(c => {
        const m = c.id?.match(/CLI-(\d+)/);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      });
      const nextCustId = `CLI-${String(maxNum + 1).padStart(3, '0')}`;

      const newCust = {
        id: nextCustId,
        name: lead.customerName,
        companyName: lead.companyName || lead.projectName || lead.customerName,
        category: lead.projectType?.toLowerCase().includes('commercial') ? 'Company' : 'Individual',
        designation: 'Client / Developer',
        phone: lead.mobileNumber,
        alternatePhone: lead.alternateMobileNumber || '',
        email: lead.email || '',
        address: lead.projectLocation || 'Kolhapur',
        city: lead.city || 'Kolhapur',
        state: lead.state || 'Maharashtra',
        pincode: lead.pincode || '',
        gstin: '',
        pan: '',
        customerType: lead.projectType?.toLowerCase().includes('commercial') ? 'Commercial' : 'Residential',
        leadSource: lead.leadSource || 'Website',
        assignedProject: additionalData.assignedProject || lead.projectName || '',
        status: 'Active',
        totalBilled: 0,
        outstanding: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [newCust, ...prev]);
      customerId = newCust.id;
      matchedCustomer = newCust;
    }

    // Mark lead as converted with history
    const history = [...(lead.statusHistory || [])];
    history.push({
      status: 'Converted',
      date: new Date().toISOString(),
      updatedBy: 'Lead Conversion'
    });

    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      status: 'Converted',
      convertedCustomerId: customerId,
      statusHistory: history,
      updatedDate: new Date().toISOString().split('T')[0]
    } : l));

    // Log Activity into Customer History
    addCustomerActivity({
      customerId: customerId,
      customerName: lead.customerName,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityType: 'Meeting',
      discussionDetails: `Lead "${lead.leadTitle}" (${lead.id}) converted to customer. Project: ${lead.projectName || lead.projectType || 'Civil Work'}, Est. Budget: ₹${(Number(lead.estimatedBudget) || 0).toLocaleString('en-IN')}`,
      employeeName: lead.assignedEmployee || 'Super Admin',
      nextFollowUpDate: '',
      attachments: 'Lead_Conversion_Docket.pdf'
    });

    addNotification('Lead Converted! 🎉', `Lead "${lead.leadTitle}" linked to customer ${matchedCustomer.name} (${customerId}).`, 'success');
    return matchedCustomer;
  };

  const addFollowUp = (followUpData) => {
    const newFollowUp = {
      id: `REM-${Date.now()}`,
      entityType: followUpData.entityType || 'Customer',
      entityId: followUpData.entityId || '',
      customerName: followUpData.customerName || '',
      contactNumber: followUpData.contactNumber || '',
      followUpDate: followUpData.followUpDate || new Date().toISOString().split('T')[0],
      followUpTime: followUpData.followUpTime || '10:00',
      followUpType: followUpData.followUpType || 'Call',
      assignedEmployee: followUpData.assignedEmployee || '',
      reminderNotes: followUpData.reminderNotes || '',
      status: followUpData.status || 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setFollowUps(prev => [newFollowUp, ...prev]);
    saveModuleRecord('followUps', newFollowUp.id, newFollowUp);
    addNotification('Follow-Up Scheduled', `Reminder set for ${newFollowUp.customerName} on ${newFollowUp.followUpDate} at ${newFollowUp.followUpTime}.`, 'info');
    return newFollowUp;
  };

  const updateFollowUp = (id, updatedFields) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
    saveModuleRecord('followUps', id, updatedFields);
    addNotification('Follow-Up Updated', `Follow-up ${id} modified.`, 'info');
  };

  const rescheduleFollowUp = (id, newDate, newTime, reason = '') => {
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          followUpDate: newDate,
          followUpTime: newTime || f.followUpTime,
          status: 'Pending',
          reminderNotes: reason ? `${f.reminderNotes} [Rescheduled: ${reason}]` : f.reminderNotes
        };
      }
      return f;
    }));
    saveModuleRecord('followUps', id, { followUpDate: newDate, followUpTime: newTime, status: 'Pending' });
    addNotification('Follow-Up Rescheduled', `Rescheduled to ${newDate} ${newTime}.`, 'info');
  };

  const completeFollowUp = (id, notes = '') => {
    const item = followUps.find(f => f.id === id);
    if (!item) return;

    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'Completed' } : f));
    saveModuleRecord('followUps', id, { status: 'Completed' });

    // Automatically record activity in customer history
    addCustomerActivity({
      customerId: item.entityId || '',
      customerName: item.customerName,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityType: item.followUpType || 'Call',
      discussionDetails: notes || item.reminderNotes || 'Follow-up interaction completed.',
      employeeName: item.assignedEmployee || 'Sanmati Patil',
      nextFollowUpDate: '',
      attachments: ''
    });

    addNotification('Follow-Up Completed', `Interaction with ${item.customerName} marked complete and logged in history.`, 'success');
  };

  const deleteFollowUp = (id) => {
    setFollowUps(prev => prev.filter(f => f.id !== id));
    removeModuleRecord('followUps', id);
    addNotification('Follow-Up Removed', `Reminder deleted.`, 'info');
  };

  const addCustomerActivity = (activityData) => {
    const actDate = activityData.activityDate || activityData.dateTime?.split('T')[0] || activityData.dateTime?.split(' ')[0] || new Date().toISOString().split('T')[0];
    const actTime = activityData.activityTime || (activityData.dateTime?.includes('T') ? activityData.dateTime.split('T')[1].slice(0, 5) : (activityData.dateTime?.split(' ')[1]?.slice(0, 5) || '10:30'));
    const combinedDateTime = `${actDate} ${actTime}`;
    const nowIso = new Date().toISOString();

    const newActivity = {
      id: activityData.id || `ACT-${Date.now()}`,
      customerId: activityData.customerId || '',
      customerName: activityData.customerName || '',
      projectId: activityData.projectId || '',
      projectName: activityData.projectName || '',
      activityDate: actDate,
      activityTime: actTime,
      dateTime: combinedDateTime,
      activityType: activityData.activityType || 'Meeting',
      conductedBy: activityData.conductedBy || activityData.employeeName || '',
      employeeName: activityData.conductedBy || activityData.employeeName || '',
      contactPerson: activityData.contactPerson || '',
      contactNumber: activityData.contactNumber || '',
      subject: activityData.subject || '',
      discussionDetails: activityData.discussionDetails || '',
      customerResponse: activityData.customerResponse || '',
      nextAction: activityData.nextAction || '',
      nextFollowUpDate: activityData.nextFollowUpDate || '',
      attachments: activityData.attachments || activityData.attachment || '',
      attachment: activityData.attachments || activityData.attachment || '',
      status: activityData.status || 'Completed',
      remarks: activityData.remarks || '',
      createdBy: activityData.createdBy || 'Admin',
      createdDate: activityData.createdDate || nowIso,
      updatedBy: activityData.updatedBy || 'Admin',
      updatedDate: nowIso
    };
    setCustomerActivities(prev => [newActivity, ...prev]);
    saveModuleRecord('customerActivities', newActivity.id, newActivity);

    // If next follow-up date specified, automatically schedule follow-up
    if (newActivity.nextFollowUpDate) {
      addFollowUp({
        entityType: 'Customer',
        entityId: newActivity.customerId,
        customerName: newActivity.customerName,
        contactNumber: newActivity.contactNumber || '',
        followUpDate: newActivity.nextFollowUpDate,
        followUpTime: '11:00',
        followUpType: newActivity.activityType || 'Meeting',
        assignedEmployee: newActivity.conductedBy || newActivity.employeeName || '',
        reminderNotes: `Next action from interaction log: ${newActivity.subject ? newActivity.subject + ' - ' : ''}${newActivity.nextAction || newActivity.discussionDetails.substring(0, 60)}...`,
        status: 'Pending'
      });
    }

    addNotification('Activity Logged', `Customer interaction recorded for ${newActivity.customerName}.`, 'success');
    return newActivity;
  };

  const updateCustomerActivity = (id, updatedFields) => {
    const nowIso = new Date().toISOString();
    let updatedItem = null;
    setCustomerActivities(prev => prev.map(a => {
      if (a.id === id) {
        const actDate = updatedFields.activityDate || a.activityDate || updatedFields.dateTime?.split('T')[0] || a.dateTime?.split(' ')[0] || new Date().toISOString().split('T')[0];
        const actTime = updatedFields.activityTime || a.activityTime || (updatedFields.dateTime?.includes('T') ? updatedFields.dateTime.split('T')[1].slice(0, 5) : (updatedFields.dateTime?.split(' ')[1]?.slice(0, 5) || '10:30'));
        const combinedDateTime = `${actDate} ${actTime}`;
        updatedItem = {
          ...a,
          ...updatedFields,
          activityDate: actDate,
          activityTime: actTime,
          dateTime: combinedDateTime,
          conductedBy: updatedFields.conductedBy || updatedFields.employeeName || a.conductedBy || a.employeeName || '',
          employeeName: updatedFields.conductedBy || updatedFields.employeeName || a.conductedBy || a.employeeName || '',
          attachments: updatedFields.attachments || updatedFields.attachment || a.attachments || a.attachment || '',
          attachment: updatedFields.attachments || updatedFields.attachment || a.attachments || a.attachment || '',
          updatedBy: updatedFields.updatedBy || 'Admin',
          updatedDate: nowIso
        };
        return updatedItem;
      }
      return a;
    }));

    if (updatedFields.nextFollowUpDate && updatedFields.nextFollowUpDate !== '') {
      addFollowUp({
        entityType: 'Customer',
        entityId: updatedItem?.customerId || '',
        customerName: updatedItem?.customerName || '',
        contactNumber: updatedItem?.contactNumber || '',
        followUpDate: updatedFields.nextFollowUpDate,
        followUpTime: '11:00',
        followUpType: updatedItem?.activityType || 'Meeting',
        assignedEmployee: updatedItem?.conductedBy || updatedItem?.employeeName || '',
        reminderNotes: `Next action from updated interaction: ${updatedItem?.subject ? updatedItem.subject + ' - ' : ''}${updatedItem?.nextAction || ''}`,
        status: 'Pending'
      });
    }

    if (updatedItem) {
      saveModuleRecord('customerActivities', id, updatedItem);
    }
    addNotification('Activity Updated', `Customer interaction log updated.`, 'info');
    return updatedItem;
  };

  const deleteCustomerActivity = (id) => {
    setCustomerActivities(prev => prev.filter(a => a.id !== id));
    removeModuleRecord('customerActivities', id);
    addNotification('Activity Removed', `History record deleted.`, 'info');
  };

  // --- MODULE 2: ACCOUNT MANAGEMENT HELPER ACTIONS ---
  const addIncomeRecord = (incomeData, postToLedger = true) => {
    const totalAmount = Number(incomeData.amount) || 0;
    const receivedAmount = incomeData.receivedAmount !== undefined 
      ? Number(incomeData.receivedAmount) || 0 
      : totalAmount;
    const pendingAmount = Math.max(0, totalAmount - receivedAmount);
    
    let computedStatus = incomeData.status || 'Paid';
    if (incomeData.status !== 'Cancelled') {
      if (pendingAmount === 0 && totalAmount > 0) computedStatus = 'Paid';
      else if (receivedAmount > 0) computedStatus = 'Partial';
      else computedStatus = 'Pending';
    }

    const newIncome = {
      id: incomeData.id || `VCH-INC-${Date.now().toString().slice(-6)}`,
      voucherNumber: incomeData.voucherNumber || incomeData.id || `VCH-INC-${Date.now().toString().slice(-6)}`,
      date: incomeData.date || new Date().toISOString().split('T')[0],
      projectName: incomeData.projectName || 'General Civil Project',
      customerName: incomeData.customerName || '',
      category: incomeData.category || 'RA Bill Payment',
      description: incomeData.description || '',
      amount: totalAmount,
      receivedAmount,
      paidAmount: receivedAmount,
      pendingAmount,
      paymentMode: incomeData.paymentMode || 'Bank Transfer',
      referenceNumber: incomeData.referenceNumber || '',
      receiptAttachment: incomeData.receiptAttachment || '',
      status: computedStatus,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setIncomeRecords(prev => [newIncome, ...prev]);
    saveModuleRecord('incomeRecords', newIncome.voucherNumber || newIncome.id, newIncome);

    // Automatically post credit to Customer Ledger without duplicate
    if (postToLedger && newIncome.customerName && newIncome.status !== 'Cancelled') {
      setLedgerEntries(prev => {
        const withoutOld = prev.filter(l => l.linkedId !== newIncome.id);
        const ledgerCredit = {
          id: `LDG-${Date.now().toString().slice(-6)}`,
          accountName: newIncome.customerName,
          accountType: 'Customer',
          date: newIncome.date,
          transactionType: 'Credit',
          referenceNumber: newIncome.referenceNumber || newIncome.voucherNumber || newIncome.id,
          description: `${newIncome.category} - ${newIncome.description || 'Customer Inflow'}`,
          debitAmount: 0,
          creditAmount: newIncome.receivedAmount || newIncome.amount,
          linkedId: newIncome.id,
          createdDate: new Date().toISOString().split('T')[0]
        };
        return [ledgerCredit, ...withoutOld];
      });
    }

    addNotification('Income Recorded', `Received ₹${(newIncome.receivedAmount || newIncome.amount).toLocaleString('en-IN')} from ${newIncome.customerName || 'Client'}.`, 'success');
    return newIncome;
  };

  const updateIncomeRecord = (id, updatedFields) => {
    setIncomeRecords(prev => prev.map(inc => {
      if (inc.id === id) {
        const totalAmount = updatedFields.amount !== undefined ? (Number(updatedFields.amount) || 0) : inc.amount;
        const receivedAmount = updatedFields.receivedAmount !== undefined 
          ? (Number(updatedFields.receivedAmount) || 0) 
          : (updatedFields.paidAmount !== undefined ? (Number(updatedFields.paidAmount) || 0) : (inc.receivedAmount ?? totalAmount));
        const pendingAmount = Math.max(0, totalAmount - receivedAmount);
        
        let computedStatus = updatedFields.status || inc.status || 'Paid';
        if (computedStatus !== 'Cancelled') {
          if (pendingAmount === 0 && totalAmount > 0) computedStatus = 'Paid';
          else if (receivedAmount > 0) computedStatus = 'Partial';
          else computedStatus = 'Pending';
        }

        const merged = {
          ...inc,
          ...updatedFields,
          amount: totalAmount,
          receivedAmount,
          paidAmount: receivedAmount,
          pendingAmount,
          status: computedStatus,
          updatedDate: new Date().toISOString().split('T')[0]
        };

        // Synchronize linked ledger entry
        if (merged.customerName && merged.status !== 'Cancelled') {
          setLedgerEntries(entries => entries.map(l => {
            if (l.linkedId === id) {
              return {
                ...l,
                accountName: merged.customerName,
                date: merged.date,
                creditAmount: merged.receivedAmount || merged.amount,
                referenceNumber: merged.referenceNumber || merged.voucherNumber || merged.id,
                description: `${merged.category} - ${merged.description || 'Customer Inflow'}`
              };
            }
            return l;
          }));
        }

        return merged;
      }
      return inc;
    }));

    addNotification('Income Updated', `Transaction ${id} modified.`, 'info');
    saveModuleRecord('incomeRecords', id, updatedFields);
  };

  const deleteIncomeRecord = (id) => {
    setIncomeRecords(prev => prev.filter(inc => inc.id !== id));
    // Remove linked ledger entries to prevent orphan duplicates
    setLedgerEntries(prev => prev.filter(l => l.linkedId !== id && l.linkedId !== `REV-${id}`));
    removeModuleRecord('incomeRecords', id);
    addNotification('Transaction Removed', `Income voucher ${id} deleted.`, 'warning');
  };

  const reverseIncomeRecord = (id, reason = 'Cancelled by Accountant') => {
    const record = incomeRecords.find(i => i.id === id);
    if (!record) return;

    setIncomeRecords(prev => prev.map(inc => inc.id === id ? {
      ...inc,
      status: 'Cancelled',
      reversalReason: reason,
      cancelledAt: new Date().toISOString()
    } : inc));

    // Post reversal entry to Customer Ledger
    if (record.customerName) {
      addLedgerEntry({
        accountName: record.customerName,
        accountType: 'Customer',
        date: new Date().toISOString().split('T')[0],
        transactionType: 'Debit',
        referenceNumber: `REV-${record.id}`,
        description: `REVERSAL: Cancelled income receipt ${record.id} [${reason}]`,
        debitAmount: record.receivedAmount || record.amount,
        creditAmount: 0,
        linkedId: `REV-${record.id}`
      }, false);
    }

    addNotification('Income Reversed', `Transaction ${id} reversed with audit entry.`, 'warning');
  };

  const addExpenseRecord = (expenseData, postToLedger = true) => {
    const totalAmount = Number(expenseData.amount) || 0;
    const paidAmount = expenseData.paidAmount !== undefined 
      ? Number(expenseData.paidAmount) || 0 
      : totalAmount;
    const pendingAmount = Math.max(0, totalAmount - paidAmount);
    
    let computedStatus = expenseData.status || 'Paid';
    if (expenseData.status !== 'Cancelled') {
      if (pendingAmount === 0 && totalAmount > 0) computedStatus = 'Paid';
      else if (paidAmount > 0) computedStatus = 'Partial';
      else computedStatus = 'Pending';
    }

    const newExpense = {
      id: expenseData.id || `VCH-EXP-${Date.now().toString().slice(-6)}`,
      voucherNumber: expenseData.voucherNumber || expenseData.id || `VCH-EXP-${Date.now().toString().slice(-6)}`,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      projectName: expenseData.projectName || 'General Civil Project',
      category: expenseData.category || 'Materials & Cement',
      vendorName: expenseData.vendorName || '',
      description: expenseData.description || '',
      amount: totalAmount,
      paidAmount,
      pendingAmount,
      paymentMode: expenseData.paymentMode || 'Bank Transfer',
      referenceNumber: expenseData.referenceNumber || '',
      billAttachment: expenseData.billAttachment || '',
      status: computedStatus,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setExpenseRecords(prev => [newExpense, ...prev]);
    saveModuleRecord('expenseRecords', newExpense.voucherNumber || newExpense.id, newExpense);

    // Automatically post debit to Vendor Ledger (settling payable) without duplicate
    if (postToLedger && newExpense.vendorName && newExpense.status !== 'Cancelled') {
      setLedgerEntries(prev => {
        const withoutOld = prev.filter(l => l.linkedId !== newExpense.id);
        const ledgerDebit = {
          id: `LDG-${Date.now().toString().slice(-6)}`,
          accountName: newExpense.vendorName,
          accountType: 'Vendor',
          date: newExpense.date,
          transactionType: 'Debit',
          referenceNumber: newExpense.referenceNumber || newExpense.voucherNumber || newExpense.id,
          description: `${newExpense.category} - ${newExpense.description || 'Payment to Vendor'}`,
          debitAmount: newExpense.paidAmount || newExpense.amount,
          creditAmount: 0,
          linkedId: newExpense.id,
          createdDate: new Date().toISOString().split('T')[0]
        };
        return [ledgerDebit, ...withoutOld];
      });
    }

    addNotification('Expense Recorded', `Disbursed ₹${(newExpense.paidAmount || newExpense.amount).toLocaleString('en-IN')} to ${newExpense.vendorName || 'Vendor'}.`, 'info');
    return newExpense;
  };

  const updateExpenseRecord = (id, updatedFields) => {
    setExpenseRecords(prev => prev.map(exp => {
      if (exp.id === id) {
        const totalAmount = updatedFields.amount !== undefined ? (Number(updatedFields.amount) || 0) : exp.amount;
        const paidAmount = updatedFields.paidAmount !== undefined 
          ? (Number(updatedFields.paidAmount) || 0) 
          : (exp.paidAmount ?? totalAmount);
        const pendingAmount = Math.max(0, totalAmount - paidAmount);
        
        let computedStatus = updatedFields.status || exp.status || 'Paid';
        if (computedStatus !== 'Cancelled') {
          if (pendingAmount === 0 && totalAmount > 0) computedStatus = 'Paid';
          else if (paidAmount > 0) computedStatus = 'Partial';
          else computedStatus = 'Pending';
        }

        const merged = {
          ...exp,
          ...updatedFields,
          amount: totalAmount,
          paidAmount,
          pendingAmount,
          status: computedStatus,
          updatedDate: new Date().toISOString().split('T')[0]
        };

        // Synchronize linked ledger entry
        if (merged.vendorName && merged.status !== 'Cancelled') {
          setLedgerEntries(entries => entries.map(l => {
            if (l.linkedId === id) {
              return {
                ...l,
                accountName: merged.vendorName,
                date: merged.date,
                debitAmount: merged.paidAmount || merged.amount,
                referenceNumber: merged.referenceNumber || merged.voucherNumber || merged.id,
                description: `${merged.category} - ${merged.description || 'Payment to Vendor'}`
              };
            }
            return l;
          }));
        }

        return merged;
      }
      return exp;
    }));

    addNotification('Expense Updated', `Transaction ${id} modified.`, 'info');
    saveModuleRecord('expenseRecords', id, updatedFields);
  };

  const deleteExpenseRecord = (id) => {
    setExpenseRecords(prev => prev.filter(exp => exp.id !== id));
    // Remove linked ledger entries to prevent orphan duplicates
    setLedgerEntries(prev => prev.filter(l => l.linkedId !== id && l.linkedId !== `REV-${id}`));
    removeModuleRecord('expenseRecords', id);
    addNotification('Transaction Removed', `Expense voucher ${id} deleted.`, 'warning');
  };

  const reverseExpenseRecord = (id, reason = 'Cancelled by Accountant') => {
    const record = expenseRecords.find(e => e.id === id);
    if (!record) return;

    setExpenseRecords(prev => prev.map(exp => exp.id === id ? {
      ...exp,
      status: 'Cancelled',
      reversalReason: reason,
      cancelledAt: new Date().toISOString()
    } : exp));

    // Post reversal entry to Vendor Ledger
    if (record.vendorName) {
      addLedgerEntry({
        accountName: record.vendorName,
        accountType: 'Vendor',
        date: new Date().toISOString().split('T')[0],
        transactionType: 'Credit',
        referenceNumber: `REV-${record.id}`,
        description: `REVERSAL: Cancelled expense voucher ${record.id} [${reason}]`,
        debitAmount: 0,
        creditAmount: record.paidAmount || record.amount,
        linkedId: `REV-${record.id}`
      }, false);
    }

    addNotification('Expense Reversed', `Expense ${id} reversed with audit entry.`, 'warning');
  };

  // Payment Tracking Actions
  const addPaymentInvoice = (invoiceData) => {
    const invoiceAmount = Number(invoiceData.invoiceAmount) || 0;
    const paidAmount = Number(invoiceData.paidAmount) || 0;
    const remainingAmount = Math.max(0, invoiceAmount - paidAmount);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = invoiceData.dueDate || today;

    let status = 'Pending';
    if (remainingAmount <= 0) {
      status = 'Paid';
    } else if (paidAmount > 0) {
      status = dueDate < today ? 'Overdue' : 'Partial';
    } else if (dueDate < today) {
      status = 'Overdue';
    }

    const newPayment = {
      id: invoiceData.id || `PAY-${Date.now().toString().slice(-6)}`,
      customerName: invoiceData.customerName || '',
      projectName: invoiceData.projectName || '',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      invoiceAmount,
      paidAmount,
      remainingAmount,
      paymentDate: invoiceData.paymentDate || today,
      paymentMode: invoiceData.paymentMode || 'Bank Transfer',
      dueDate,
      paymentStatus: status,
      paymentHistory: paidAmount > 0 ? [{
        date: invoiceData.paymentDate || today,
        amount: paidAmount,
        mode: invoiceData.paymentMode || 'Bank Transfer',
        referenceNo: invoiceData.referenceNo || 'Initial Settlement',
        receiptUrl: invoiceData.receiptUrl || ''
      }] : [],
      createdDate: today
    };

    setPaymentTracking(prev => [newPayment, ...prev]);
    saveModuleRecord('paymentTracking', newPayment.id, newPayment);

    // Post Debit to Customer Ledger for the Invoice Amount (Billed)
    if (newPayment.customerName && newPayment.invoiceAmount > 0) {
      addLedgerEntry({
        accountName: newPayment.customerName,
        accountType: 'Customer',
        date: newPayment.paymentDate,
        transactionType: 'Debit',
        referenceNumber: newPayment.invoiceNumber,
        description: `Tax Invoice Billed - ${newPayment.projectName || 'Project Work'}`,
        debitAmount: newPayment.invoiceAmount,
        creditAmount: 0,
        linkedId: newPayment.id
      }, false);

      // If initial payment was made, post Credit as well
      if (paidAmount > 0) {
        addLedgerEntry({
          accountName: newPayment.customerName,
          accountType: 'Customer',
          date: newPayment.paymentDate,
          transactionType: 'Credit',
          referenceNumber: `REC-${newPayment.invoiceNumber}`,
          description: `Initial Payment Receipt - ${newPayment.invoiceNumber}`,
          debitAmount: 0,
          creditAmount: paidAmount,
          linkedId: newPayment.id
        }, false);
      }
    }

    addNotification('Invoice Created', `Invoice ${newPayment.invoiceNumber} (₹${invoiceAmount.toLocaleString('en-IN')}) issued to ${newPayment.customerName}.`, 'success');
    return newPayment;
  };

  const recordPayment = (paymentId, amountPaid, paymentMode = 'Bank Transfer', paymentDate, referenceNo = '', notes = '') => {
    const payment = paymentTracking.find(p => p.id === paymentId);
    if (!payment) return null;

    const addedAmount = Number(amountPaid) || 0;
    const newTotalPaid = payment.paidAmount + addedAmount;
    const newRemaining = Math.max(0, payment.invoiceAmount - newTotalPaid);
    const today = new Date().toISOString().split('T')[0];
    const pDate = paymentDate || today;

    let newStatus = 'Pending';
    if (newRemaining <= 0) {
      newStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newStatus = payment.dueDate < today ? 'Overdue' : 'Partial';
    } else if (payment.dueDate < today) {
      newStatus = 'Overdue';
    }

    const paymentEntry = {
      date: pDate,
      amount: addedAmount,
      mode: paymentMode,
      referenceNo: referenceNo || `UTR-${Date.now().toString().slice(-6)}`,
      notes
    };

    setPaymentTracking(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          paidAmount: newTotalPaid,
          remainingAmount: newRemaining,
          paymentDate: pDate,
          paymentMode,
          paymentStatus: newStatus,
          paymentHistory: [paymentEntry, ...(p.paymentHistory || [])]
        };
      }
      return p;
    }));

    saveModuleRecord('paymentTracking', paymentId, {
      paidAmount: newTotalPaid,
      remainingAmount: newRemaining,
      paymentDate: pDate,
      paymentMode,
      paymentStatus: newStatus
    });

    // Post to Customer Ledger
    addLedgerEntry({
      accountName: payment.customerName,
      accountType: 'Customer',
      date: pDate,
      transactionType: 'Credit',
      referenceNumber: paymentEntry.referenceNo,
      description: `Payment Receipt: ${payment.invoiceNumber} [${notes || paymentMode}]`,
      debitAmount: 0,
      creditAmount: addedAmount,
      linkedId: payment.id
    }, false);

    // Also automatically log as Income Record (postToLedger=false because ledger entry already posted above)
    addIncomeRecord({
      date: pDate,
      projectName: payment.projectName,
      customerName: payment.customerName,
      category: 'Client Invoice Payment',
      description: `Payment against ${payment.invoiceNumber}: ${notes || 'Bank Inflow'}`,
      amount: addedAmount,
      paymentMode,
      referenceNumber: paymentEntry.referenceNo
    }, false);

    addNotification('Payment Recorded! 💰', `Received ₹${addedAmount.toLocaleString('en-IN')} from ${payment.customerName} for ${payment.invoiceNumber}.`, 'success');
  };

  // Account Ledger Actions
  const addLedgerEntry = (entryData, notify = true) => {
    const newEntry = {
      id: entryData.id || `LDG-${Date.now().toString().slice(-6)}`,
      accountName: entryData.accountName || '',
      accountType: entryData.accountType || 'Customer',
      date: entryData.date || new Date().toISOString().split('T')[0],
      transactionType: entryData.transactionType || 'Debit',
      referenceNumber: entryData.referenceNumber || `REF-${Date.now().toString().slice(-4)}`,
      description: entryData.description || '',
      debitAmount: Number(entryData.debitAmount) || 0,
      creditAmount: Number(entryData.creditAmount) || 0,
      linkedId: entryData.linkedId || '',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setLedgerEntries(prev => [newEntry, ...prev]);
    saveModuleRecord('ledgerEntries', newEntry.id, newEntry);
    if (notify) {
      addNotification('Ledger Posted', `Ledger entry recorded for ${newEntry.accountName}.`, 'info');
    }
    return newEntry;
  };

  const reverseLedgerEntry = (id, reason = 'Reversal requested') => {
    const entry = ledgerEntries.find(l => l.id === id);
    if (!entry) return;

    // Create opposite offsetting entry to preserve complete accounting audit trail
    const reversalType = entry.transactionType === 'Debit' ? 'Credit' : 'Debit';
    const revDebit = reversalType === 'Debit' ? (entry.creditAmount || entry.debitAmount) : 0;
    const revCredit = reversalType === 'Credit' ? (entry.debitAmount || entry.creditAmount) : 0;

    const offsettingEntry = {
      id: `REV-${entry.id}`,
      accountName: entry.accountName,
      accountType: entry.accountType,
      date: new Date().toISOString().split('T')[0],
      transactionType: reversalType,
      referenceNumber: `REV-${entry.referenceNumber}`,
      description: `AUDIT REVERSAL: Offset of ${entry.id} [${reason}]`,
      debitAmount: revDebit,
      creditAmount: revCredit,
      linkedId: entry.id,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setLedgerEntries(prev => [offsettingEntry, ...prev]);
    saveModuleRecord('ledgerEntries', offsettingEntry.id, offsettingEntry);
    addNotification('Ledger Reversal Posted', `Reversal entry posted for ${entry.accountName} (${reason}).`, 'warning');
  };

  // --- NFD Operations (Module 2 Subsection v) ---
  const addNfdRecord = (nfdData) => {
    const newNfd = {
      id: nfdData.id || `NFD-${Date.now().toString().slice(-6)}`,
      nfdNumber: nfdData.nfdNumber || `NFD/KLP/${Date.now().toString().slice(-4)}`,
      bankName: nfdData.bankName || '',
      branchName: nfdData.branchName || '',
      accountHolder: nfdData.accountHolder || 'SANMATI CONSTRUCTIONS',
      projectName: nfdData.projectName || '',
      depositAmount: Number(nfdData.depositAmount) || 0,
      interestRate: Number(nfdData.interestRate) || 0,
      depositDate: nfdData.depositDate || new Date().toISOString().split('T')[0],
      maturityDate: nfdData.maturityDate || '',
      maturityAmount: Number(nfdData.maturityAmount) || Number(nfdData.depositAmount) || 0,
      purpose: nfdData.purpose || 'Bank Guarantee Margin',
      lienTo: nfdData.lienTo || '',
      status: nfdData.status || 'Active', // Active, Matured, Liquidated, Pledged
      attachment: nfdData.attachment || '',
      remarks: nfdData.remarks || '',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setNfdRecords(prev => [newNfd, ...prev]);
    saveModuleRecord('nfdRecords', newNfd.nfdNumber || newNfd.id, newNfd);
    addNotification('NDT Record Added', `NDT ${newNfd.nfdNumber} for ₹${Number(newNfd.depositAmount).toLocaleString('en-IN')} added successfully.`, 'success');
    return newNfd;
  };

  const updateNfdRecord = (id, updatedFields) => {
    setNfdRecords(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields, updatedDate: new Date().toISOString().split('T')[0] } : item));
    saveModuleRecord('nfdRecords', id, updatedFields);
    addNotification('NDT Record Updated', `NDT record updated successfully.`, 'info');
  };

  const deleteNfdRecord = (id) => {
    setNfdRecords(prev => prev.filter(item => item.id !== id));
    removeModuleRecord('nfdRecords', id);
    addNotification('NDT Record Removed', `NDT record has been deleted.`, 'warning');
  };

  // --- MODULE 3: VENDOR MANAGEMENT OPERATIONS ---
  const addVendor = (vendorData) => {
    const newVendor = {
      id: vendorData.id || `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      name: vendorData.name || '',
      companyName: vendorData.companyName || vendorData.name || '',
      category: vendorData.category || 'Material Suppliers',
      contactPerson: vendorData.contactPerson || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || '',
      city: vendorData.city || 'Kolhapur',
      state: vendorData.state || 'Maharashtra',
      gstin: vendorData.gstin || '',
      pan: vendorData.pan || '',
      bankName: vendorData.bankName || '',
      accountNo: vendorData.accountNo || '',
      ifscCode: vendorData.ifscCode || '',
      paymentTermsDays: Number(vendorData.paymentTermsDays) || 30,
      status: vendorData.status || 'Active',
      rating: Number(vendorData.rating) || 4.5,
      totalPurchase: 0,
      paidAmount: 0,
      outstandingBalance: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setVendors(prev => [newVendor, ...prev]);
    saveModuleRecord('vendors', newVendor.gstin || newVendor.id, newVendor);
    addNotification('Vendor Registered', `Vendor "${newVendor.name}" registered successfully.`, 'success');
    return newVendor;
  };

  const updateVendor = (id, updatedFields) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
    saveModuleRecord('vendors', id, updatedFields);
    addNotification('Vendor Updated', `Vendor details for ${id} modified.`, 'info');
  };

  const deleteVendor = (id) => {
    const v = vendors.find(x => x.id === id);
    setVendors(prev => prev.filter(x => x.id !== id));
    removeModuleRecord('vendors', id);
    addNotification('Vendor Removed', `Vendor ${v?.name || id} deleted.`, 'warning');
  };

  // Vendor Contacts
  const addVendorContact = (contactData) => {
    const newContact = {
      id: `VNC-${Date.now().toString().slice(-6)}`,
      vendorId: contactData.vendorId || '',
      vendorName: contactData.vendorName || '',
      contactPerson: contactData.contactPerson || '',
      designation: contactData.designation || 'Sales Manager',
      phone: contactData.phone || '',
      alternatePhone: contactData.alternatePhone || '',
      email: contactData.email || '',
      plantAddress: contactData.plantAddress || '',
      notes: contactData.notes || '',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setVendorContacts(prev => [newContact, ...prev]);
    saveModuleRecord('vendorContacts', newContact.id, newContact);
    addNotification('Vendor Contact Added', `Contact "${newContact.contactPerson}" added for ${newContact.vendorName}.`, 'success');
    return newContact;
  };

  const updateVendorContact = (id, updatedFields) => {
    setVendorContacts(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    saveModuleRecord('vendorContacts', id, updatedFields);
    addNotification('Contact Updated', `Contact record updated.`, 'info');
  };

  const deleteVendorContact = (id) => {
    setVendorContacts(prev => prev.filter(c => c.id !== id));
    removeModuleRecord('vendorContacts', id);
    addNotification('Contact Removed', `Contact person deleted.`, 'info');
  };

  // Vendor Purchases & Bills (Procurement)
  const addVendorPurchase = (purchaseData) => {
    const totalAmount = Number(purchaseData.totalAmount) || 0;
    const paidInitial = Number(purchaseData.paidInitial) || 0;
    const remaining = Math.max(0, totalAmount - paidInitial);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = purchaseData.dueDate || today;

    let pStatus = 'Pending';
    if (remaining <= 0) pStatus = 'Paid';
    else if (paidInitial > 0) pStatus = dueDate < today ? 'Overdue' : 'Partial';
    else if (dueDate < today) pStatus = 'Overdue';

    const newPurchase = {
      id: purchaseData.id || `PO-${Date.now().toString().slice(-6)}`,
      poNumber: purchaseData.poNumber || `PO-KLP-${Date.now().toString().slice(-4)}`,
      billNumber: purchaseData.billNumber || '',
      date: purchaseData.date || today,
      dueDate,
      vendorId: purchaseData.vendorId || '',
      vendorName: purchaseData.vendorName || '',
      projectId: purchaseData.projectId || '',
      projectName: purchaseData.projectName || 'General Project',
      materialCategory: purchaseData.materialCategory || 'Cement & Aggregates',
      itemDescription: purchaseData.itemDescription || '',
      quantity: Number(purchaseData.quantity) || 1,
      unit: purchaseData.unit || 'Bags',
      rate: Number(purchaseData.rate) || totalAmount,
      totalAmount,
      deliveryStatus: purchaseData.deliveryStatus || 'Delivered',
      paymentStatus: pStatus,
      paidAmount: paidInitial,
      remainingAmount: remaining,
      attachment: purchaseData.attachment || '',
      notes: purchaseData.notes || '',
      createdDate: today
    };

    setVendorPurchases(prev => [newPurchase, ...prev]);

    // Update Vendor's cumulative purchase & balance
    setVendors(prev => prev.map(v => {
      if (v.name === newPurchase.vendorName || v.id === newPurchase.vendorId) {
        const newTotal = (v.totalPurchase || 0) + totalAmount;
        const newPaid = (v.paidAmount || 0) + paidInitial;
        return {
          ...v,
          totalPurchase: newTotal,
          paidAmount: newPaid,
          outstandingBalance: Math.max(0, newTotal - newPaid)
        };
      }
      return v;
    }));

    // Post CREDIT to Vendor Ledger (Commercial standard: Purchase bill increases credit balance/payable)
    if (newPurchase.vendorName && totalAmount > 0) {
      addLedgerEntry({
        accountName: newPurchase.vendorName,
        accountType: 'Vendor',
        date: newPurchase.date,
        transactionType: 'Credit',
        referenceNumber: newPurchase.billNumber || newPurchase.poNumber,
        description: `Purchase Bill: ${newPurchase.materialCategory} - ${newPurchase.itemDescription || newPurchase.projectName}`,
        debitAmount: 0,
        creditAmount: totalAmount,
        linkedId: newPurchase.id
      }, false);
    }

    // Also register in Vendor Payments Tracking
    const newVndPayment = {
      id: `VPAY-${Date.now().toString().slice(-6)}`,
      purchaseId: newPurchase.id,
      poNumber: newPurchase.poNumber,
      billNumber: newPurchase.billNumber || newPurchase.poNumber,
      vendorName: newPurchase.vendorName,
      projectName: newPurchase.projectName,
      billAmount: totalAmount,
      paidAmount: paidInitial,
      remainingAmount: remaining,
      dueDate,
      paymentStatus: pStatus,
      paymentHistory: paidInitial > 0 ? [{
        date: today,
        amount: paidInitial,
        mode: purchaseData.paymentMode || 'Bank Transfer',
        referenceNo: purchaseData.referenceNo || 'Initial Advance',
        notes: 'Initial payment at bill generation'
      }] : [],
      createdDate: today
    };

    setVendorPayments(prev => [newVndPayment, ...prev]);
    saveModuleRecord('vendorPurchases', newPurchase.id, newPurchase);
    saveModuleRecord('vendorPayments', newVndPayment.id, newVndPayment);

    // If initial payment made, post Debit to Vendor Ledger and Expense Record
    if (paidInitial > 0) {
      addLedgerEntry({
        accountName: newPurchase.vendorName,
        accountType: 'Vendor',
        date: today,
        transactionType: 'Debit',
        referenceNumber: purchaseData.referenceNo || `ADV-${newPurchase.poNumber}`,
        description: `Advance Payment against ${newPurchase.poNumber}`,
        debitAmount: paidInitial,
        creditAmount: 0,
        linkedId: newPurchase.id
      }, false);

      addExpenseRecord({
        date: today,
        projectName: newPurchase.projectName,
        category: newPurchase.materialCategory,
        vendorName: newPurchase.vendorName,
        description: `Advance Payment against ${newPurchase.poNumber}`,
        amount: paidInitial,
        paymentMode: purchaseData.paymentMode || 'Bank Transfer'
      }, false);
    }

    addNotification('Purchase Bill Logged', `Bill ${newPurchase.poNumber} (₹${totalAmount.toLocaleString('en-IN')}) for ${newPurchase.vendorName} recorded and posted to Vendor Ledger.`, 'success');
    return newPurchase;
  };

  const updateVendorPurchase = (id, updatedFields) => {
    setVendorPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    saveModuleRecord('vendorPurchases', id, updatedFields);
    addNotification('Purchase Updated', `Purchase order ${id} updated.`, 'info');
  };

  const deleteVendorPurchase = (id) => {
    setVendorPurchases(prev => prev.filter(p => p.id !== id));
    removeModuleRecord('vendorPurchases', id);
    addNotification('Purchase Removed', `Purchase record deleted.`, 'info');
  };

  // Record Payment to Vendor
  const recordVendorPayment = (paymentId, amountPaid, paymentMode = 'Bank Transfer', paymentDate, referenceNo = '', notes = '') => {
    const payment = vendorPayments.find(p => p.id === paymentId);
    if (!payment) return null;

    const addedAmount = Number(amountPaid) || 0;
    const newTotalPaid = payment.paidAmount + addedAmount;
    const newRemaining = Math.max(0, payment.billAmount - newTotalPaid);
    const today = new Date().toISOString().split('T')[0];
    const pDate = paymentDate || today;

    let newStatus = 'Pending';
    if (newRemaining <= 0) newStatus = 'Paid';
    else if (newTotalPaid > 0) newStatus = payment.dueDate < today ? 'Overdue' : 'Partial';
    else if (payment.dueDate < today) newStatus = 'Overdue';

    const installmentEntry = {
      date: pDate,
      amount: addedAmount,
      mode: paymentMode,
      referenceNo: referenceNo || `RTGS-${Date.now().toString().slice(-6)}`,
      notes
    };

    setVendorPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          paidAmount: newTotalPaid,
          remainingAmount: newRemaining,
          paymentStatus: newStatus,
          paymentHistory: [installmentEntry, ...(p.paymentHistory || [])]
        };
      }
      return p;
    }));

    saveModuleRecord('vendorPayments', paymentId, {
      paidAmount: newTotalPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus
    });

    // Update Purchase bill payment status
    if (payment.purchaseId) {
      setVendorPurchases(prev => prev.map(po => {
        if (po.id === payment.purchaseId) {
          return {
            ...po,
            paidAmount: newTotalPaid,
            remainingAmount: newRemaining,
            paymentStatus: newStatus
          };
        }
        return po;
      }));
    }

    // Update Vendor's cumulative paid amount & balance
    setVendors(prev => prev.map(v => {
      if (v.name === payment.vendorName) {
        const newPaid = (v.paidAmount || 0) + addedAmount;
        return {
          ...v,
          paidAmount: newPaid,
          outstandingBalance: Math.max(0, (v.totalPurchase || 0) - newPaid)
        };
      }
      return v;
    }));

    // Post DEBIT to Vendor Ledger (Settling payable)
    addLedgerEntry({
      accountName: payment.vendorName,
      accountType: 'Vendor',
      date: pDate,
      transactionType: 'Debit',
      referenceNumber: installmentEntry.referenceNo,
      description: `Disbursement: ${payment.billNumber || payment.poNumber} [${notes || paymentMode}]`,
      debitAmount: addedAmount,
      creditAmount: 0,
      linkedId: payment.id
    }, false);

    // Auto-record in Expense Records with postToLedger=false (Zero double-posting!)
    addExpenseRecord({
      date: pDate,
      projectName: payment.projectName,
      category: 'Vendor Disbursement',
      vendorName: payment.vendorName,
      description: `Settlement for ${payment.billNumber || payment.poNumber} via ${paymentMode}`,
      amount: addedAmount,
      paymentMode,
      billAttachment: ''
    }, false);

    addNotification('Vendor Payment Disbursed! 💸', `Paid ₹${addedAmount.toLocaleString('en-IN')} to ${payment.vendorName} for ${payment.billNumber || payment.poNumber}.`, 'success');
  };

  return (
    <ERPDataContext.Provider
      value={{
        projects,
        clients,
        vendors,
        boqItems,
        raBills,
        inventory,
        gpsLogs,
        hrmsEmployees,
        tallyConfig,
        approvals,
        tenders,
        quotations,
        expenses,
        notifications,
        // CRM
        leads,
        setLeads,
        heroBanners,
        setHeroBanners,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        followUps,
        setFollowUps,
        customerActivities,
        setCustomerActivities,
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
        deleteCustomerActivity,
        // Account Management
        incomeRecords,
        setIncomeRecords,
        addIncomeRecord,
        updateIncomeRecord,
        deleteIncomeRecord,
        reverseIncomeRecord,
        expenseRecords,
        setExpenseRecords,
        addExpenseRecord,
        updateExpenseRecord,
        deleteExpenseRecord,
        reverseExpenseRecord,
        paymentTracking,
        setPaymentTracking,
        addPaymentInvoice,
        recordPayment,
        ledgerEntries,
        setLedgerEntries,
        addLedgerEntry,
        reverseLedgerEntry,
        // NFD (Module 2 Subsection v)
        nfdRecords,
        setNfdRecords,
        addNfdRecord,
        updateNfdRecord,
        deleteNfdRecord,
        // Vendor Management
        vendorContacts,
        setVendorContacts,
        vendorPurchases,
        setVendorPurchases,
        vendorPayments,
        setVendorPayments,
        addVendor,
        updateVendor,
        deleteVendor,
        addVendorContact,
        updateVendorContact,
        deleteVendorContact,
        addVendorPurchase,
        updateVendorPurchase,
        deleteVendorPurchase,
        recordVendorPayment,
        // Projects & Operations
        addProject,
        updateProject,
        deleteProject,
        updateProjectActivity,
        addBOQItem,
        createRABill,
        issueStockToSite,
        receiveStockInward,
        recordGPSCheckIn,
        updateApprovalStatus,
        syncToTally,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
        setClients,
        setVendors,
        setQuotations,
        setTenders,
        setExpenses,
        setHrmsEmployees,
        resetAllData
      }}
    >
      {children}
    </ERPDataContext.Provider>
  );
};

export const useERPData = () => useContext(ERPDataContext);
