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
  INITIAL_NOTIFICATIONS
} from '../services/mockData';
import { calculateHaversineDistance, calculateBOQItem, calculateRABill } from '../utils/formatters';

const ERPDataContext = createContext(null);

export const ERPDataProvider = ({ children }) => {
  // Local storage assisted state persistence for interactive modifications
  const usePersistedState = (key, initial) => {
    const [state, setState] = useState(() => {
      const saved = localStorage.getItem(`sanmati_${key}`);
      if (saved) {
        try {
          let parsed = JSON.parse(saved);
          if (key === 'hrmsEmployees' && Array.isArray(parsed)) {
            const DUMMY_IDS = ['EMP-KLP-01', 'EMP-KLP-02', 'EMP-KLP-03', 'EMP-KLP-04'];
            parsed = parsed.filter(emp => !DUMMY_IDS.includes(emp.id) && emp.name !== 'Sanmati Patil' && emp.name !== 'Er. Rajesh Kulkarni' && emp.name !== 'Er. Amit Deshmukh' && emp.name !== 'CA Sneha Shinde');
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
  };

  const updateProjectActivity = (projectId, activityName, progress, status) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const activities = p.activities.map(act => 
          act.name === activityName ? { ...act, progress: Number(progress), status } : act
        );
        const avgProgress = Math.round(activities.reduce((acc, curr) => acc + (curr.progress || 0), 0) / activities.length);
        return {
          ...p,
          activities,
          completionPercentage: avgProgress
        };
      }
      return p;
    }));
    addNotification('Activity Updated', `${activityName} updated to ${progress}% on project.`, 'info');
  };

  // --- BOQ Operations ---
  const addBOQItem = (boqData) => {
    const amount = calculateBOQItem(boqData.quantity, boqData.rate);
    const newItem = {
      id: `BOQ-${Date.now()}`,
      amount,
      ...boqData
    };
    setBoqItems(prev => [newItem, ...prev]);
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
      id: `RA-${Date.now()}`,
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
    addNotification(
      isInside ? 'GPS Check-In Verified' : 'GPS Check-In Outside Geofence',
      `${userName} logged attendance for ${proj?.name || 'Project'}. Status: ${geofenceStatus}`,
      isInside ? 'success' : 'warning'
    );
    return newLog;
  };

  // --- Approvals Workflow (Draft -> Submitted -> Approved / Rejected) ---
  const updateApprovalStatus = (approvalId, newStatus, comments, approverName) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === approvalId) {
        const updated = {
          ...app,
          status: newStatus,
          history: [
            ...app.history,
            { step: `${newStatus} by ${approverName}`, date: new Date().toLocaleString(), user: approverName, comments }
          ]
        };

        // If it was an RA Bill approval
        if (app.type === "RA bill" && newStatus === 'Approved') {
          setRaBills(bills => bills.map(b => b.id === app.referenceId ? { ...b, status: 'Approved' } : b));
        }

        return updated;
      }
      return app;
    }));
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
    addNotification('System Reset', 'All enterprise mock databases have been restored to initial Kolhapur records.', 'info');
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
        addProject,
        updateProject,
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
