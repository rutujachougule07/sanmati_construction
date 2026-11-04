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
  // Clear any existing cached dummy records in localStorage so everything starts completely blank
  const DATA_VERSION = 'v3_blank_slate_clean';
  if (typeof window !== 'undefined' && localStorage.getItem('sanmati_data_version') !== DATA_VERSION) {
    const keys = [
      'projects', 'clients', 'vendors', 'boqItems', 'raBills', 'inventory',
      'gpsLogs', 'hrmsEmployees', 'tallyConfig', 'approvals', 'tenders', 'quotations', 'expenses', 'notifications'
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

  // CRM Dedicated States
  const [leads, setLeads] = usePersistedState('leads', []);
  const [followUps, setFollowUps] = usePersistedState('followUps', []);
  const [customerActivities, setCustomerActivities] = usePersistedState('customerActivities', []);

  // Account Management Dedicated States
  const [incomeRecords, setIncomeRecords] = usePersistedState('incomeRecords', []);
  const [expenseRecords, setExpenseRecords] = usePersistedState('expenseRecords', []);
  const [paymentTracking, setPaymentTracking] = usePersistedState('paymentTracking', []);
  const [ledgerEntries, setLedgerEntries] = usePersistedState('ledgerEntries', []);

  // Vendor Management Dedicated States
  const [vendorContacts, setVendorContacts] = usePersistedState('vendorContacts', []);
  const [vendorPurchases, setVendorPurchases] = usePersistedState('vendorPurchases', []);
  const [vendorPayments, setVendorPayments] = usePersistedState('vendorPayments', []);

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
      phone: customerData.phone || customerData.mobileNumber || '',
      email: customerData.email || '',
      address: customerData.address || '',
      city: customerData.city || 'Kolhapur',
      state: customerData.state || 'Maharashtra',
      gstin: customerData.gstin || '',
      customerType: customerData.customerType || 'Company',
      assignedProject: customerData.assignedProject || '',
      status: customerData.status || 'Active',
      totalBilled: Number(customerData.totalBilled) || 0,
      outstanding: Number(customerData.outstanding) || 0,
      createdDate: customerData.createdDate || new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newCustomer, ...prev]);
    addNotification('Customer Added', `${newCustomer.name} has been successfully registered.`, 'success');
    return newCustomer;
  };

  const updateCustomer = (id, updatedFields) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    addNotification('Customer Updated', `Customer ${id} profile has been updated.`, 'info');
  };

  const deleteCustomer = (id) => {
    const cust = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    addNotification('Customer Removed', `Customer ${cust?.name || id} deleted.`, 'warning');
  };

  const addLead = (leadData) => {
    const newLead = {
      id: `LEAD-${String(leads.length + 1).padStart(3, '0')}`,
      leadTitle: leadData.leadTitle || 'New Construction Inquiry',
      customerName: leadData.customerName || '',
      mobileNumber: leadData.mobileNumber || '',
      email: leadData.email || '',
      enquiryType: leadData.enquiryType || 'Residential',
      projectName: leadData.projectName || '',
      projectLocation: leadData.projectLocation || 'Kolhapur',
      estimatedBudget: Number(leadData.estimatedBudget) || 0,
      leadSource: leadData.leadSource || 'Direct Inquiry',
      assignedEmployee: leadData.assignedEmployee || 'Er. Rajesh Kulkarni',
      followUpDate: leadData.followUpDate || new Date().toISOString().split('T')[0],
      leadDescription: leadData.leadDescription || '',
      status: leadData.status || 'New',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    addNotification('Lead Created', `New lead "${newLead.leadTitle}" added for ${newLead.customerName}.`, 'success');

    // Auto-create initial follow-up if follow-up date specified
    if (newLead.followUpDate) {
      addFollowUp({
        entityType: 'Lead',
        entityId: newLead.id,
        customerName: newLead.customerName,
        contactNumber: newLead.mobileNumber,
        followUpDate: newLead.followUpDate,
        followUpTime: '11:00',
        followUpType: 'Call',
        assignedEmployee: newLead.assignedEmployee,
        reminderNotes: `Initial follow-up for lead: ${newLead.leadTitle}`,
        status: 'Pending'
      });
    }
    return newLead;
  };

  const updateLead = (id, updatedFields) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
    addNotification('Lead Updated', `Lead ${id} details updated.`, 'info');
  };

  const deleteLead = (id) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    addNotification('Lead Deleted', `Lead "${lead?.leadTitle || id}" removed.`, 'warning');
  };

  const convertLeadToCustomer = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;

    // Check if customer already exists (by mobile or email or name) to prevent duplicates
    let matchedCustomer = clients.find(c => 
      (lead.mobileNumber && c.phone === lead.mobileNumber) ||
      (lead.email && c.email && c.email.toLowerCase() === lead.email.toLowerCase()) ||
      (lead.customerName && c.name.toLowerCase() === lead.customerName.toLowerCase())
    );

    let customerId = matchedCustomer?.id;

    if (!matchedCustomer) {
      const newCust = {
        id: `CLI-${String(clients.length + 1).padStart(3, '0')}`,
        name: lead.customerName,
        companyName: lead.projectName || lead.customerName,
        phone: lead.mobileNumber,
        email: lead.email || '',
        address: lead.projectLocation || 'Kolhapur',
        city: 'Kolhapur',
        state: 'Maharashtra',
        gstin: '',
        customerType: 'Company',
        assignedProject: lead.projectName || '',
        status: 'Active',
        totalBilled: 0,
        outstanding: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [newCust, ...prev]);
      customerId = newCust.id;
      matchedCustomer = newCust;
    }

    // Mark lead as converted
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      status: 'Converted',
      convertedCustomerId: customerId
    } : l));

    // Log Activity into Customer History
    addCustomerActivity({
      customerId: customerId,
      customerName: lead.customerName,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityType: 'Meeting',
      discussionDetails: `Lead "${lead.leadTitle}" successfully converted to customer. Project: ${lead.projectName || 'Civil Project'}, Estimated Budget: ₹${(lead.estimatedBudget || 0).toLocaleString('en-IN')}`,
      employeeName: lead.assignedEmployee || 'Er. Rajesh Kulkarni',
      nextFollowUpDate: '',
      attachments: 'Lead_Conversion_Docket.pdf'
    });

    addNotification('Lead Converted! 🎉', `Lead "${lead.leadTitle}" converted to customer ${matchedCustomer.name}.`, 'success');
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
      assignedEmployee: followUpData.assignedEmployee || 'Er. Rajesh Kulkarni',
      reminderNotes: followUpData.reminderNotes || '',
      status: followUpData.status || 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setFollowUps(prev => [newFollowUp, ...prev]);
    addNotification('Follow-Up Scheduled', `Reminder set for ${newFollowUp.customerName} on ${newFollowUp.followUpDate} at ${newFollowUp.followUpTime}.`, 'info');
    return newFollowUp;
  };

  const updateFollowUp = (id, updatedFields) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
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
    addNotification('Follow-Up Rescheduled', `Rescheduled to ${newDate} ${newTime}.`, 'info');
  };

  const completeFollowUp = (id, notes = '') => {
    const item = followUps.find(f => f.id === id);
    if (!item) return;

    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'Completed' } : f));

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
    addNotification('Follow-Up Removed', `Reminder deleted.`, 'info');
  };

  const addCustomerActivity = (activityData) => {
    const newActivity = {
      id: `ACT-${Date.now()}`,
      customerId: activityData.customerId || '',
      customerName: activityData.customerName || '',
      dateTime: activityData.dateTime || new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityType: activityData.activityType || 'Meeting',
      discussionDetails: activityData.discussionDetails || '',
      employeeName: activityData.employeeName || 'Er. Rajesh Kulkarni',
      nextFollowUpDate: activityData.nextFollowUpDate || '',
      attachments: activityData.attachments || '',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setCustomerActivities(prev => [newActivity, ...prev]);

    // If next follow-up date specified, automatically schedule follow-up
    if (newActivity.nextFollowUpDate) {
      addFollowUp({
        entityType: 'Customer',
        entityId: newActivity.customerId,
        customerName: newActivity.customerName,
        contactNumber: '',
        followUpDate: newActivity.nextFollowUpDate,
        followUpTime: '11:00',
        followUpType: newActivity.activityType || 'Meeting',
        assignedEmployee: newActivity.employeeName,
        reminderNotes: `Next scheduled interaction from history log: ${newActivity.discussionDetails.substring(0, 60)}...`,
        status: 'Pending'
      });
    }

    addNotification('Activity Logged', `Customer history updated for ${newActivity.customerName}.`, 'success');
    return newActivity;
  };

  const deleteCustomerActivity = (id) => {
    setCustomerActivities(prev => prev.filter(a => a.id !== id));
    addNotification('Activity Removed', `History record deleted.`, 'info');
  };

  // --- MODULE 2: ACCOUNT MANAGEMENT HELPER ACTIONS ---
  const addIncomeRecord = (incomeData, postToLedger = true) => {
    const newIncome = {
      id: incomeData.id || `INC-${Date.now().toString().slice(-6)}`,
      date: incomeData.date || new Date().toISOString().split('T')[0],
      projectName: incomeData.projectName || 'General Civil Project',
      customerName: incomeData.customerName || '',
      category: incomeData.category || 'RA Bill Payment',
      description: incomeData.description || '',
      amount: Number(incomeData.amount) || 0,
      paymentMode: incomeData.paymentMode || 'Bank Transfer',
      referenceNumber: incomeData.referenceNumber || '',
      receiptAttachment: incomeData.receiptAttachment || '',
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setIncomeRecords(prev => [newIncome, ...prev]);

    // Automatically post credit to Customer Ledger ONLY IF not already posted by Payment Tracking
    if (postToLedger && newIncome.customerName) {
      addLedgerEntry({
        accountName: newIncome.customerName,
        accountType: 'Customer',
        date: newIncome.date,
        transactionType: 'Credit',
        referenceNumber: newIncome.referenceNumber || newIncome.id,
        description: `${newIncome.category} - ${newIncome.description || 'Customer Inflow'}`,
        debitAmount: 0,
        creditAmount: newIncome.amount,
        linkedId: newIncome.id
      }, false);
    }

    addNotification('Income Recorded', `Received ₹${newIncome.amount.toLocaleString('en-IN')} from ${newIncome.customerName || 'Client'}.`, 'success');
    return newIncome;
  };

  const updateIncomeRecord = (id, updatedFields) => {
    setIncomeRecords(prev => prev.map(inc => inc.id === id ? { ...inc, ...updatedFields } : inc));
    addNotification('Income Updated', `Transaction ${id} modified.`, 'info');
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
        debitAmount: record.amount,
        creditAmount: 0,
        linkedId: `REV-${record.id}`
      }, false);
    }

    addNotification('Income Reversed', `Transaction ${id} reversed with audit entry.`, 'warning');
  };

  const addExpenseRecord = (expenseData, postToLedger = true) => {
    const newExpense = {
      id: expenseData.id || `EXP-${Date.now().toString().slice(-6)}`,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      projectName: expenseData.projectName || 'General Civil Project',
      category: expenseData.category || 'Materials & Cement',
      vendorName: expenseData.vendorName || '',
      description: expenseData.description || '',
      amount: Number(expenseData.amount) || 0,
      paymentMode: expenseData.paymentMode || 'Bank Transfer',
      billAttachment: expenseData.billAttachment || '',
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setExpenseRecords(prev => [newExpense, ...prev]);

    // Automatically post debit to Vendor Ledger (settling payable) ONLY IF not already handled by Vendor Payment
    if (postToLedger && newExpense.vendorName) {
      addLedgerEntry({
        accountName: newExpense.vendorName,
        accountType: 'Vendor',
        date: newExpense.date,
        transactionType: 'Debit',
        referenceNumber: newExpense.id,
        description: `${newExpense.category} - ${newExpense.description || 'Payment to Vendor'}`,
        debitAmount: newExpense.amount,
        creditAmount: 0,
        linkedId: newExpense.id
      }, false);
    }

    addNotification('Expense Recorded', `Disbursed ₹${newExpense.amount.toLocaleString('en-IN')} to ${newExpense.vendorName || 'Vendor'}.`, 'info');
    return newExpense;
  };

  const updateExpenseRecord = (id, updatedFields) => {
    setExpenseRecords(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedFields } : exp));
    addNotification('Expense Updated', `Transaction ${id} modified.`, 'info');
  };

  const reverseExpenseRecord = (id, reason = 'Cancelled by Accountant') => {
    const record = expenseRecords.find(e => e.id === e.id);
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
        creditAmount: record.amount,
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
    addNotification('Ledger Reversal Posted', `Reversal entry posted for ${entry.accountName} (${reason}).`, 'warning');
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
    addNotification('Vendor Registered', `Vendor "${newVendor.name}" registered successfully.`, 'success');
    return newVendor;
  };

  const updateVendor = (id, updatedFields) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));
    addNotification('Vendor Updated', `Vendor details for ${id} modified.`, 'info');
  };

  const deleteVendor = (id) => {
    const v = vendors.find(x => x.id === id);
    setVendors(prev => prev.filter(x => x.id !== id));
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
    addNotification('Vendor Contact Added', `Contact "${newContact.contactPerson}" added for ${newContact.vendorName}.`, 'success');
    return newContact;
  };

  const updateVendorContact = (id, updatedFields) => {
    setVendorContacts(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    addNotification('Contact Updated', `Contact record updated.`, 'info');
  };

  const deleteVendorContact = (id) => {
    setVendorContacts(prev => prev.filter(c => c.id !== id));
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
    addNotification('Purchase Updated', `Purchase order ${id} updated.`, 'info');
  };

  const deleteVendorPurchase = (id) => {
    setVendorPurchases(prev => prev.filter(p => p.id !== id));
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
        deleteCustomerActivity,
        // Account Management
        incomeRecords,
        setIncomeRecords,
        addIncomeRecord,
        updateIncomeRecord,
        reverseIncomeRecord,
        expenseRecords,
        setExpenseRecords,
        addExpenseRecord,
        updateExpenseRecord,
        reverseExpenseRecord,
        paymentTracking,
        setPaymentTracking,
        addPaymentInvoice,
        recordPayment,
        ledgerEntries,
        setLedgerEntries,
        addLedgerEntry,
        reverseLedgerEntry,
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
