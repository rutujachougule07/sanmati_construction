// MODULE 6: HRMS AND PAYROLL MANAGEMENT
// Subsections:
//  i.   Employee records
//  ii.  Attendance management
//  iii. Salary calculation
//  iv.  Payslip generation

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle2, DollarSign, Download, Plus, FileText, 
  MapPin, Clock, ShieldCheck, Printer, Eye, Calculator, RefreshCw, 
  AlertCircle, Building2, Briefcase, Phone, Mail, Award, X, Trash2,
  ChevronLeft, ChevronRight, CalendarDays, Save, UserX, Check, UserCheck
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatNumber, formatDate, numberToWordsIndian } from '../../utils/formatters';
import { generatePayslipPDF, exportToExcel } from '../../services/exportService';
import { COMPANY_DETAILS } from '../../utils/constants';
import { DatePicker } from '../../components/DatePicker';
import { saveModuleRecord, removeModuleRecord } from '../../services/firebaseSync';

export const HRMSModule = () => {
  const { hrmsEmployees, setHrmsEmployees, projects, gpsLogs } = useERPData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 4 Required Subsections matching sidebar subcategories:
  // 'records'    -> i. Employee records
  // 'attendance' -> ii. Attendance management
  // 'salary'     -> iii. Salary calculation
  // 'payslips'   -> iv. Payslip generation
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'records');

  // Keep active tab in sync with URL search params when clicked from sidebar
  useEffect(() => {
    if (tabFromUrl && ['records', 'attendance', 'salary', 'payslips'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Selected Employee & Modals
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [viewPayslipEmployee, setViewPayslipEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [isPayrollApproved, setIsPayrollApproved] = useState(false);
  const [siteFilter, setSiteFilter] = useState('all');
  const [attendanceToast, setAttendanceToast] = useState(null);

  // Date utilities
  const getTodayIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const shiftDate = (currentDateStr, deltaDays) => {
    const parts = (currentDateStr || getTodayIso()).split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return '';
    const parts = String(isoStr).split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoStr;
  };

  // Active date for Attendance Register (Defaults to 2026-10-28 as per user view or today)
  const todayIso = useMemo(() => getTodayIso(), []);
  const [selectedDate, setSelectedDate] = useState('2026-10-28');

  const showAttendanceToast = (msg) => {
    setAttendanceToast(msg);
    setTimeout(() => {
      setAttendanceToast(null);
    }, 3500);
  };

  // Date Category: past / today / future
  const dateCategory = useMemo(() => {
    if (selectedDate < todayIso) return 'past';
    if (selectedDate === todayIso) return 'today';
    return 'future';
  }, [selectedDate, todayIso]);

  // Attendance Records per Date: { [dateStr]: records[] }
  // Clean blank slate: All dummy present/absent/overtime records removed
  const [attendanceByDate, setAttendanceByDate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sanmati_attendance_clean_ledger');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanmati_attendance_clean_ledger', JSON.stringify(attendanceByDate));
    }
  }, [attendanceByDate]);

  // Helper to get active records for selected date
  const currentAttendanceRecords = useMemo(() => {
    if (attendanceByDate[selectedDate]) {
      return attendanceByDate[selectedDate];
    }
    // Dynamic generation if date not yet touched
    const isFuture = selectedDate > todayIso;
    const isPast = selectedDate < todayIso;
    return hrmsEmployees.map((emp, idx) => ({
      empId: emp.id,
      name: emp.name,
      designation: emp.designation,
      site: idx === 0 ? 'Head Office, Tarabai Park' : idx === 1 ? 'Royal Palace Commercial Complex' : idx === 2 ? 'Tarabai Park High-Rise' : 'Head Office, Tarabai Park',
      inTime: isFuture ? '09:00 AM (Scheduled)' : '09:00 AM',
      outTime: isFuture ? '06:00 PM (Scheduled)' : '06:00 PM',
      status: 'Present',
      gpsStatus: isFuture 
        ? 'Advance Scheduled' 
        : isPast 
        ? 'Historical Entry' 
        : (idx === 0 ? 'Office Geofence' : 'Inside Site Geofence (15m)'),
      overtimeHours: 0,
      daysPresentMonth: 26
    }));
  }, [attendanceByDate, selectedDate, hrmsEmployees, todayIso]);

  // Immutable date updater
  const updateRecordForDate = (dateStr, updateFn) => {
    setAttendanceByDate(prev => {
      const existing = prev[dateStr] || currentAttendanceRecords;
      return {
        ...prev,
        [dateStr]: updateFn(existing)
      };
    });
  };

  // Quick Attendance Status Toggle
  const updateAttendanceStatus = (empId, newStatus) => {
    updateRecordForDate(selectedDate, records => 
      records.map(rec => rec.empId === empId ? { ...rec, status: newStatus } : rec)
    );
  };

  // Overtime Adjuster (Buttons & Direct Input)
  const updateOvertime = (empId, delta) => {
    updateRecordForDate(selectedDate, records => 
      records.map(rec => {
        if (rec.empId !== empId) return rec;
        const current = Number(rec.overtimeHours) || 0;
        return { ...rec, overtimeHours: Math.max(0, Number((current + delta).toFixed(1))) };
      })
    );
  };

  const setOvertimeDirect = (empId, val) => {
    if (val === '') {
      updateRecordForDate(selectedDate, records => 
        records.map(rec => rec.empId === empId ? { ...rec, overtimeHours: '' } : rec)
      );
      return;
    }
    const num = parseFloat(val);
    updateRecordForDate(selectedDate, records => 
      records.map(rec => rec.empId === empId ? { ...rec, overtimeHours: isNaN(num) || num < 0 ? 0 : Number(num.toFixed(1)) } : rec)
    );
  };

  const handleOvertimeBlur = (empId, val) => {
    const num = parseFloat(val);
    updateRecordForDate(selectedDate, records => 
      records.map(rec => rec.empId === empId ? { ...rec, overtimeHours: isNaN(num) || num < 0 ? 0 : Number(num.toFixed(1)) } : rec)
    );
  };

  // Bulk actions for the selected date
  const handleMarkAllPresent = () => {
    updateRecordForDate(selectedDate, records => 
      records.map(rec => ({ ...rec, status: 'Present' }))
    );
    showAttendanceToast(`All employees marked Present for ${formatDisplayDate(selectedDate)}.`);
  };

  const handleMarkAllAbsent = () => {
    updateRecordForDate(selectedDate, records => 
      records.map(rec => ({ ...rec, status: 'Absent' }))
    );
    showAttendanceToast(`All employees marked Absent for ${formatDisplayDate(selectedDate)}.`);
  };

  const handleSaveAttendance = () => {
    updateRecordForDate(selectedDate, records => [...records]);
    showAttendanceToast(`Attendance register successfully saved & locked for ${formatDisplayDate(selectedDate)}!`);
  };

  // Filtered attendance by site
  const filteredAttendance = useMemo(() => {
    if (siteFilter === 'all') return currentAttendanceRecords;
    return currentAttendanceRecords.filter(r => r.site === siteFilter);
  }, [currentAttendanceRecords, siteFilter]);

  // --- Particular / Individual Employee Attendance Calendar Modal State (Matching Image 2) ---
  const [individualModalOpen, setIndividualModalOpen] = useState(false);
  const [individualEmployee, setIndividualEmployee] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(9); // 0-based: 9 = October
  const [calendarYear, setCalendarYear] = useState(2026);
  const [activeDayPopover, setActiveDayPopover] = useState(null); // Key of day with open status menu (e.g. '2026-10-06')

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Open individual attendance calendar modal for a specific employee
  const handleOpenIndividualAttendance = (emp) => {
    if (!emp) return;
    const targetEmp = hrmsEmployees.find(e => e.id === emp.empId || e.id === emp.id) || emp;
    setIndividualEmployee(targetEmp);
    setActiveDayPopover(null);

    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length === 3) {
        setCalendarYear(parts[0]);
        setCalendarMonth(parts[1] - 1);
      }
    }
    setIndividualModalOpen(true);
  };

  const handlePrevMonth = () => {
    setActiveDayPopover(null);
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setActiveDayPopover(null);
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Clear all marked attendance for the currently viewed month
  const handleClearMonthAttendance = () => {
    const monthStr = String(calendarMonth + 1).padStart(2, '0');
    const prefix = `${calendarYear}-${monthStr}-`;
    setAttendanceByDate(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (k.startsWith(prefix)) {
          delete updated[k];
        }
      });
      return updated;
    });
    setActiveDayPopover(null);
    showAttendanceToast(`${monthNames[calendarMonth]} ${calendarYear} ची सर्व हजेरी रिकामी केली (Cleared)`);
  };

  // Helper to set an employee's attendance status directly on a specific dateKey
  const setEmployeeStatusOnDate = (empId, dateKey, newStatus, ot = 0) => {
    setAttendanceByDate(prev => {
      const existing = prev[dateKey] || currentAttendanceRecords;
      const targetEmp = hrmsEmployees.find(e => e.id === empId) || individualEmployee;
      
      if (newStatus === null) {
        return {
          ...prev,
          [dateKey]: existing.filter(r => r.empId !== empId)
        };
      }

      const exists = existing.some(r => r.empId === empId);
      let updatedList;
      if (exists) {
        updatedList = existing.map(r => {
          if (r.empId !== empId) return r;
          return {
            ...r,
            status: newStatus,
            overtimeHours: ot
          };
        });
      } else {
        updatedList = [
          ...existing,
          {
            empId,
            name: targetEmp.name,
            designation: targetEmp.designation,
            site: targetEmp.site || 'Royal Palace Commercial Complex',
            inTime: '09:00 AM',
            outTime: '06:00 PM',
            status: newStatus,
            gpsStatus: dateKey > todayIso ? 'Advance Scheduled' : 'Verified',
            overtimeHours: ot,
            daysPresentMonth: 26
          }
        ];
      }
      return {
        ...prev,
        [dateKey]: updatedList
      };
    });
    setActiveDayPopover(null);
    showAttendanceToast(`${formatDisplayDate(dateKey)}: ${newStatus || 'Clear'}${ot > 0 ? ` (+${ot}h OT)` : ''} सेव्ह केले`);
  };

  // Helper to get an employee's attendance on a specific dateKey (YYYY-MM-DD)
  const getEmployeeAttendanceOnDate = (empId, dateKey) => {
    const list = attendanceByDate[dateKey];
    if (list) {
      const rec = list.find(r => r.empId === empId);
      if (rec) {
        return {
          status: rec.status,
          overtimeHours: Number(rec.overtimeHours) || 0
        };
      }
    }
    return null;
  };

  // Cycle/toggle status for employee on a specific day in the calendar
  const cycleEmployeeDayStatus = (empId, dateKey) => {
    const current = getEmployeeAttendanceOnDate(empId, dateKey);
    let nextStatus = 'Present';
    let nextOT = 0;

    if (!current || !current.status) {
      // Unmarked (+) -> Present (✓)
      nextStatus = 'Present';
      nextOT = 0;
    } else if (current.status === 'Present' && (!current.overtimeHours || current.overtimeHours === 0)) {
      // Present (✓) -> Absent (✕)
      nextStatus = 'Absent';
      nextOT = 0;
    } else if (current.status === 'Absent') {
      // Absent (✕) -> Half Day (½)
      nextStatus = 'Half Day';
      nextOT = 0;
    } else if (current.status === 'Half Day') {
      // Half Day (½) -> Overtime 1h (P +1h)
      nextStatus = 'Present';
      nextOT = 1.0;
    } else if (current.overtimeHours === 1.0) {
      // Overtime 1h -> Overtime 2h (P +2h)
      nextStatus = 'Present';
      nextOT = 2.0;
    } else if (current.overtimeHours > 0) {
      // Overtime -> Unmarked (+)
      nextStatus = null;
      nextOT = 0;
    } else {
      nextStatus = 'Present';
      nextOT = 0;
    }

    setAttendanceByDate(prev => {
      const existing = prev[dateKey] || currentAttendanceRecords;
      const targetEmp = hrmsEmployees.find(e => e.id === empId) || individualEmployee;
      
      if (nextStatus === null) {
        return {
          ...prev,
          [dateKey]: existing.filter(r => r.empId !== empId)
        };
      }

      const exists = existing.some(r => r.empId === empId);
      let updatedList;
      if (exists) {
        updatedList = existing.map(r => {
          if (r.empId !== empId) return r;
          return {
            ...r,
            status: nextStatus,
            overtimeHours: nextOT
          };
        });
      } else {
        updatedList = [
          ...existing,
          {
            empId,
            name: targetEmp.name,
            designation: targetEmp.designation,
            site: targetEmp.site || 'Royal Palace Commercial Complex',
            inTime: '09:00 AM',
            outTime: '06:00 PM',
            status: nextStatus,
            gpsStatus: dateKey > todayIso ? 'Advance Scheduled' : 'Verified',
            overtimeHours: nextOT,
            daysPresentMonth: 26
          }
        ];
      }
      return {
        ...prev,
        [dateKey]: updatedList
      };
    });
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 for Sun
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isEmpty: true, key: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(calendarMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${calendarYear}-${monthStr}-${dayStr}`;
      const dayOfWeek = (firstDayIndex + d - 1) % 7;
      cells.push({
        isEmpty: false,
        dayNum: d,
        dateKey,
        dayOfWeek,
        isSunday: dayOfWeek === 0
      });
    }
    return cells;
  }, [calendarYear, calendarMonth]);

  // Onboarding Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: 'Site Engineer',
    department: 'Site Execution',
    joiningDate: new Date().toISOString().split('T')[0],
    phone: '+91 98220 00000',
    email: 'engineer@sanmati.com',
    bloodGroup: 'B+',
    bankAccount: 'HDFC Bank / 50100987654321',
    ifsc: 'HDFC0000123',
    pan: 'AAYCS9281Q',
    uan: '100908765432',
    basicSalary: 42000,
    hra: 16800,
    conveyance: 6000,
    specialAllowance: 8000,
    pfDeduction: 5040
  });

  // Handle New Employee Onboarding
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    const basic = Number(formData.basicSalary);
    const hra = Number(formData.hra);
    const conv = Number(formData.conveyance);
    const sp = Number(formData.specialAllowance);
    const pf = Number(formData.pfDeduction);
    const pt = 200; // Standard Maharashtra Professional Tax
    const net = basic + hra + conv + sp - pf - pt;

    const nextNum = hrmsEmployees.reduce((max, e) => {
      const match = e.id?.match(/EMP-KLP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0) + 1;
    const newId = `EMP-KLP-${String(nextNum).padStart(2, '0')}`;

    const newEmp = {
      id: newId,
      name: formData.name,
      designation: formData.designation,
      department: formData.department,
      joiningDate: formData.joiningDate,
      phone: formData.phone,
      email: formData.email,
      basicSalary: basic,
      hra,
      conveyance: conv,
      specialAllowance: sp,
      pfDeduction: pf,
      professionalTax: pt,
      netSalary: net,
      leaveBalance: { sick: 7, casual: 12, earned: 18 },
      bankAccount: `${formData.bankAccount} (IFSC: ${formData.ifsc})`,
      pan: formData.pan.toUpperCase(),
      uan: formData.uan
    };

    setHrmsEmployees([newEmp, ...hrmsEmployees]);
    saveModuleRecord('hrmsEmployees', newEmp.id, newEmp);
    
    // Add to attendance register as well across dates
    setAttendanceByDate(prev => {
      const updated = { ...prev };
      const newRec = {
        empId: newEmp.id,
        name: newEmp.name,
        designation: newEmp.designation,
        site: 'Royal Palace Commercial Complex',
        inTime: '09:00 AM',
        outTime: '06:00 PM',
        status: 'Present',
        gpsStatus: 'Inside Site Geofence (15m)',
        overtimeHours: 0,
        daysPresentMonth: 26
      };
      Object.keys(updated).forEach(k => {
        updated[k] = [newRec, ...updated[k]];
      });
      return updated;
    });

    setIsOnboardModalOpen(false);
  };

  // Delete Employee handler
  const handleDeleteEmployee = (empId) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      setHrmsEmployees(prev => prev.filter(e => e.id !== empId));
      removeModuleRecord('hrmsEmployees', empId);
      setAttendanceByDate(prev => {
        const updated = {};
        Object.keys(prev).forEach(k => {
          updated[k] = prev[k].filter(r => r.empId !== empId);
        });
        return updated;
      });
      if (selectedEmployee?.id === empId) setSelectedEmployee(null);
    }
  };

  // --- Calculations for Subsection iii: Salary calculation ---
  const standardWorkingDays = 26;

  const payrollCalculations = useMemo(() => {
    return hrmsEmployees.map(emp => {
      const att = currentAttendanceRecords.find(a => a.empId === emp.id) || { daysPresentMonth: 26, overtimeHours: 0 };
      const daysWorked = att.daysPresentMonth;
      const otHours = Number(att.overtimeHours) || 0;

      const basic = emp.basicSalary || 0;
      const hra = emp.hra || 0;
      const conv = emp.conveyance || 0;
      const special = emp.specialAllowance || 0;

      const grossStandard = basic + hra + conv + special;
      
      // Pro-rata attendance earnings
      const attendanceRatio = Math.min(1, daysWorked / standardWorkingDays);
      const earnedBasic = Math.round(basic * attendanceRatio);
      const earnedHra = Math.round(hra * attendanceRatio);
      const earnedAllowances = Math.round((conv + special) * attendanceRatio);
      const earnedGross = earnedBasic + earnedHra + earnedAllowances;

      // Overtime Pay: (Basic / 26 days / 8 hrs * 1.5x)
      const hourlyRate = (basic / standardWorkingDays / 8);
      const overtimePay = Math.round(otHours * hourlyRate * 1.5);

      // Deductions
      const pf = emp.pfDeduction || Math.round(basic * 0.12);
      const pt = emp.professionalTax || 200; // Maharashtra PT
      const tds = 0; // TDS based on slabs
      const totalDeductions = pf + pt + tds;

      const netPayable = earnedGross + overtimePay - totalDeductions;

      return {
        ...emp,
        daysWorked,
        otHours,
        earnedBasic,
        earnedHra,
        earnedAllowances,
        earnedGross,
        overtimePay,
        pf,
        pt,
        tds,
        totalDeductions,
        netPayable,
        status: isPayrollApproved ? 'Approved & Locked' : 'Calculated & Verified'
      };
    });
  }, [hrmsEmployees, currentAttendanceRecords, isPayrollApproved]);

  // Aggregate totals
  const totalGrossPayroll = payrollCalculations.reduce((sum, item) => sum + item.earnedGross + item.overtimePay, 0);
  const totalDeductionsAll = payrollCalculations.reduce((sum, item) => sum + item.totalDeductions, 0);
  const totalNetDisbursement = payrollCalculations.reduce((sum, item) => sum + item.netPayable, 0);

  // Subsection i Table Columns: Employee records
  const employeeRecordColumns = [
    { 
      key: 'id', 
      header: 'Emp ID', 
      align: 'left',
      width: '10%',
      minWidth: '95px',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-900 border border-slate-200/90 font-mono">
          {row.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Employee Name & Role',
      align: 'left',
      width: '18.5%',
      minWidth: '180px',
      render: (row) => {
        const cleanName = row.name.replace(/^(Er\.|CA|Dr\.|Mr\.|Mrs\.)\s+/i, '');
        const initials = cleanName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EM';
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-[9px] shadow-2xs flex-shrink-0 tracking-tight">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block text-xs leading-tight truncate">{row.name}</span>
              <span className="text-[10px] text-slate-500 font-medium truncate block">{row.designation}</span>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'department', 
      header: 'Department', 
      align: 'left',
      width: '14%',
      minWidth: '130px',
      render: (row) => <span className="text-slate-800 text-[11px] font-semibold truncate block">{row.department}</span> 
    },
    { 
      key: 'joiningDate', 
      header: 'Date Joined', 
      align: 'left',
      width: '12%',
      minWidth: '110px',
      render: (row) => <span className="text-slate-700 text-[11px] font-medium whitespace-nowrap">{formatDate(row.joiningDate)}</span> 
    },
    {
      key: 'contact',
      header: 'Contact Info',
      sortable: false,
      align: 'left',
      width: '19.5%',
      minWidth: '175px',
      render: (row) => (
        <div className="text-[11px] text-slate-600 space-y-0.5">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px] truncate">
            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{row.phone || '+91 98220 00000'}</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{row.email || 'employee@sanmati.com'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'netSalary', 
      header: 'Monthly Net Pay', 
      align: 'left', 
      width: '13%',
      minWidth: '120px',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs tabular-nums font-mono block">
          {formatCurrency(row.netSalary)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'left',
      sortable: false,
      width: '13%',
      minWidth: '120px',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedEmployee(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
            title="View Full Profile"
          >
            <Eye className="w-3 h-3 text-slate-500 group-hover:text-red-500" />
            <span>Full Details</span>
          </button>
          <button
            onClick={() => handleDeleteEmployee(row.id)}
            className="inline-flex items-center justify-center p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-lg transition-all cursor-pointer"
            title="Delete Employee Record"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">HRMS & Payroll Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive human resource suite: Employee records, attendance, salary calculations, and official payslips.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION i: EMPLOYEE RECORDS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                Staff count: <strong className="text-slate-900 font-bold">{hrmsEmployees.length} registered employees</strong>
              </span>
            </div>
            
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white shadow-xs rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Employee</span>
            </button>
          </div>

          <DataTable
            columns={employeeRecordColumns}
            data={hrmsEmployees}
            searchKey="name"
            searchPlaceholder="Search by name, designation, department..."
            exportFileName="Sanmati_Employee_Records"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION ii: ATTENDANCE MANAGEMENT                                       */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Toast Notification */}
          {attendanceToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{attendanceToast}</span>
              </div>
              <button 
                type="button"
                onClick={() => setAttendanceToast(null)} 
                className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Controls Ribbon */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Date Selection & Stepper Area */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <div className="mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Attendance Register Date
                    </label>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Previous Day Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDate(prev => shiftDate(prev, -1))}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="मागील दिवस (Previous Day)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">मागील</span>
                    </button>

                    {/* DatePicker */}
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                    />

                    {/* Next Day Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDate(prev => shiftDate(prev, 1))}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="पुढील दिवस (Next Day)"
                    >
                      <span className="hidden sm:inline text-[11px]">पुढील</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Today Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayIso)}
                      className={`px-2.5 py-1.5 border rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        selectedDate === todayIso
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Jump to Today (आज)"
                    >
                      आज (Today)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Mark all staff Present for this date"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllAbsent}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Mark all staff Absent for this date"
                >
                  <UserX className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                  <span>Mark All Absent</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-3 py-1.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Save attendance for selected date"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Attendance</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Attendance Register Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-heading">Daily Site Attendance & GPS Geofence Verification</h4>
                <p className="text-[11px] text-slate-500">
                  Register for: <strong className="text-slate-800">{formatDisplayDate(selectedDate)}</strong> • {filteredAttendance.length} staff records
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 border ${
                dateCategory === 'today'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : dateCategory === 'past'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                {dateCategory === 'today' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>
                  {filteredAttendance.filter(r => r.status === 'Present').length} / {filteredAttendance.length} Present ({formatDisplayDate(selectedDate)})
                </span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-800 text-xs">
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap">Employee</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap">Assigned Construction Site</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">In / Out Time</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap">GPS Geofence Status</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">Attendance Status</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">Overtime (Hrs)</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">Month Days</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-slate-400 text-xs">
                        No employees found matching the selected site filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.empId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3.5 py-2 text-xs">
                          <span className="font-bold text-slate-900 block text-xs">{rec.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium font-mono">{rec.empId} • {rec.designation}</span>
                        </td>

                        <td className="px-3.5 py-2 text-xs">
                          <span className="text-slate-800 font-semibold flex items-center gap-1 text-xs">
                            <Building2 className="w-4 h-4 text-copper-500" />
                            {rec.site}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 text-xs text-center font-mono font-medium text-slate-800">
                          <span>{rec.inTime}</span>
                          <span className="text-slate-400 mx-1.5">-</span>
                          <span>{rec.outTime}</span>
                        </td>

                        <td className="px-3.5 py-2 text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            dateCategory === 'future'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : dateCategory === 'past'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <MapPin className="w-3 h-3" />
                            {rec.gpsStatus}
                          </span>
                        </td>

                        <td className="px-3.5 py-2 text-xs text-center">
                          <select
                            value={rec.status}
                            onChange={(e) => updateAttendanceStatus(rec.empId, e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                              rec.status === 'Present' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : rec.status === 'Half Day' 
                                ? 'bg-amber-50 text-amber-700 border-amber-300' 
                                : rec.status === 'Absent'
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-purple-50 text-purple-700 border-purple-300'
                            }`}
                          >
                            <option value="Present">Present</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Absent">Absent</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </td>

                        <td className="px-3.5 py-2 text-xs text-center">
                          <div className="inline-flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg px-1 py-0.5 shadow-2xs">
                            <button 
                              type="button"
                              onClick={() => updateOvertime(rec.empId, -0.5)}
                              className="text-slate-400 hover:text-slate-900 font-bold px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Decrease (-0.5h)"
                            >
                              -
                            </button>
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                value={rec.overtimeHours === '' ? '' : rec.overtimeHours}
                                onChange={(e) => setOvertimeDirect(rec.empId, e.target.value)}
                                onBlur={(e) => handleOvertimeBlur(rec.empId, e.target.value)}
                                onClick={(e) => e.target.select()}
                                className="w-7 text-center font-mono font-bold text-slate-800 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-[10px] text-slate-400 font-bold pr-0.5">h</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => updateOvertime(rec.empId, 0.5)}
                              className="text-slate-400 hover:text-slate-900 font-bold px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Increase (+0.5h)"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-900 font-bold text-xs">
                          {rec.daysPresentMonth} / {standardWorkingDays}
                        </td>

                        <td className="px-3.5 py-2 text-xs text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenIndividualAttendance(rec)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200 transition-all shadow-2xs cursor-pointer"
                            title={`हजेरी कॅलेंडर उघडा (${rec.name})`}
                          >
                            <Calendar className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION iii: SALARY CALCULATION                                        */}
      {/* ========================================================================= */}
      {activeTab === 'salary' && (
        <div className="space-y-5">
          {/* Salary Engine Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Gross Incurred</span>
              <h3 className="text-2xl font-bold font-heading text-slate-900 mt-1 font-mono">
                {formatCurrency(totalGrossPayroll)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Basic + HRA + Allowances + Overtime</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Total Statutory Deductions</span>
              <h3 className="text-2xl font-bold font-heading text-rose-600 mt-1 font-mono">
                {formatCurrency(totalDeductionsAll)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Provident Fund (12%) + PT (₹200/mo)</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">Net Payable Disbursement</span>
              <h3 className="text-2xl font-bold font-heading text-emerald-700 mt-1 font-mono">
                {formatCurrency(totalNetDisbursement)}
              </h3>
              <p className="text-xs text-emerald-600 mt-1">Ready for Bank NEFT / RTGS Transfer</p>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-heading">
                  Automated Salary Calculation Sheet: {selectedMonth}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Standard cycle based on 26 monthly working days with overtime multiplier.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPayrollApproved(!isPayrollApproved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                    isPayrollApproved 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-[#002046] hover:bg-[#001736] text-white shadow-xs'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isPayrollApproved ? '✓ Payroll Run Approved' : 'Approve & Lock Payroll'}</span>
                </button>

                <button
                  onClick={() => exportToExcel(payrollCalculations, `Sanmati_Payroll_Calculation_${selectedMonth}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-800 text-xs">
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap">Employee</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">Earned Basic</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">HRA & Allowances</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">Days Worked</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">Overtime Pay</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">PF Deduction</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">Prof. Tax (PT)</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">Net Take-Home</th>
                    <th className="px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-600 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollCalculations.map((calc) => (
                    <tr key={calc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2 text-xs">
                        <span className="font-bold text-slate-900 block text-xs">{calc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">{calc.id}</span>
                      </td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-800 font-semibold">{formatCurrency(calc.earnedBasic)}</td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-800 font-semibold">{formatCurrency(calc.earnedHra + calc.earnedAllowances)}</td>
                      <td className="px-3.5 py-2 text-xs text-center font-mono font-bold text-slate-900">{calc.daysWorked} / {standardWorkingDays}</td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono text-emerald-700 font-bold">+{formatCurrency(calc.overtimePay)}</td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono text-rose-600 font-semibold">-{formatCurrency(calc.pf)}</td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono text-rose-600 font-semibold">-{formatCurrency(calc.pt)}</td>
                      <td className="px-3.5 py-2 text-xs text-right font-mono font-bold text-emerald-700 text-xs font-bold">
                        {formatCurrency(calc.netPayable)}
                      </td>
                      <td className="px-3.5 py-2 text-xs text-center">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {calc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION iv: PAYSLIP GENERATION                                         */}
      {/* ========================================================================= */}
      {activeTab === 'payslips' && (
        <div className="space-y-5">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-heading">
                Monthly Payslip Generation & Distribution ({selectedMonth})
              </h4>
              <p className="text-[11px] text-slate-500">
                Official payroll vouchers with SANMATI CONSTRUCTIONS seal, PAN, and authorized signatures.
              </p>
            </div>
          </div>

          {/* Payslip Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrmsEmployees.map((emp) => {
              const calc = payrollCalculations.find(c => c.id === emp.id) || emp;
              return (
                <div key={emp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-gold-400/60 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                          {emp.id}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{emp.name}</h4>
                        <p className="text-xs text-slate-500">{emp.designation} • {emp.department}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Take-Home</span>
                        <span className="text-xl font-bold font-mono text-emerald-700">
                          {formatCurrency(calc.netPayable || emp.netSalary)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Earnings Breakdown:</span>
                        <p className="text-slate-800">Basic: <strong className="font-mono">{formatCurrency(emp.basicSalary)}</strong></p>
                        <p className="text-slate-800">HRA: <strong className="font-mono">{formatCurrency(emp.hra)}</strong></p>
                        <p className="text-slate-800">Allowances: <strong className="font-mono">{formatCurrency(emp.conveyance + emp.specialAllowance)}</strong></p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Deductions Breakdown:</span>
                        <p className="text-rose-600">Provident Fund (PF): <strong className="font-mono">-{formatCurrency(emp.pfDeduction)}</strong></p>
                        <p className="text-rose-600">Professional Tax (PT): <strong className="font-mono">-{formatCurrency(emp.professionalTax || 200)}</strong></p>
                        <p className="text-slate-500 text-[10px] mt-1 font-mono">Bank: {emp.bankAccount?.split('/')[0] || 'HDFC Bank'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 gap-2">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to Issue
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewPayslipEmployee(emp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => generatePayslipPDF(emp, selectedMonth)}
                        className="px-3 py-1.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MONTHLY ATTENDANCE CALENDAR (Matching Image 2)                     */}
      {/* ========================================================================= */}
      {individualModalOpen && individualEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIndividualModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
            <div 
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 transform transition-all text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dark Navy Header (Matching Sidebar & Navbar) */}
              <div className="bg-[#002046] px-6 py-4 flex items-center justify-between text-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full bg-[#001736] border border-blue-400/40 text-amber-300 font-black text-base flex items-center justify-center shadow-inner flex-shrink-0"
                    style={{ color: '#fde047' }}
                  >
                    {individualEmployee.name ? individualEmployee.name.trim()[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 
                      className="font-extrabold text-base leading-snug tracking-tight text-white"
                      style={{ color: '#ffffff' }}
                    >
                      {individualEmployee.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                      <span 
                        className="inline-flex items-center gap-1 font-semibold text-slate-100"
                        style={{ color: '#f1f5f9' }}
                      >
                        <span className="text-sm">✂️</span>
                        <span>{individualEmployee.department || 'Site Execution'}</span>
                      </span>
                      <span className="font-bold text-slate-300" style={{ color: '#cbd5e1' }}>•</span>
                      <span 
                        className="font-semibold text-slate-100"
                        style={{ color: '#f1f5f9' }}
                      >
                        {individualEmployee.designation || 'Site Engineer'}
                      </span>
                      <span className="font-bold text-slate-300" style={{ color: '#cbd5e1' }}>•</span>
                      <span 
                        className="inline-flex items-center gap-1 font-bold text-emerald-300"
                        style={{ color: '#6ee7b7' }}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-300" style={{ color: '#6ee7b7' }} />
                        <span>{individualEmployee.phone || '+91 98220 00000'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIndividualModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-xs"
                  style={{ color: '#ffffff' }}
                  title="Close (बंद करा)"
                >
                  <X className="w-4 h-4 text-white" style={{ color: '#ffffff' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Month & Year Navigation Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      title="मागील महिना (Previous Month)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                      <span className="text-sm">📅</span>
                      <select
                        value={calendarMonth}
                        onChange={(e) => setCalendarMonth(Number(e.target.value))}
                        className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer pr-1"
                      >
                        {monthNames.map((name, idx) => (
                          <option key={name} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                      <select
                        value={calendarYear}
                        onChange={(e) => setCalendarYear(Number(e.target.value))}
                        className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer pr-1"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                      title="पुढील महिना (Next Month)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearMonthAttendance}
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="या महिन्यातील सर्व हजेरी नोंदी रिकाम्या करा"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>महिना क्लिअर करा</span>
                    </button>

                    {hrmsEmployees.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">कर्मचारी बदला:</span>
                        <select
                          value={individualEmployee.id || individualEmployee.empId}
                          onChange={(e) => {
                            const emp = hrmsEmployees.find(item => item.id === e.target.value);
                            if (emp) handleOpenIndividualAttendance(emp);
                          }}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          {hrmsEmployees.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weekdays Header Row */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold">
                  <div className="text-rose-500 font-bold py-1">Sun</div>
                  <div className="text-slate-600 font-bold py-1">Mon</div>
                  <div className="text-slate-600 font-bold py-1">Tue</div>
                  <div className="text-slate-600 font-bold py-1">Wed</div>
                  <div className="text-slate-600 font-bold py-1">Thu</div>
                  <div className="text-slate-600 font-bold py-1">Fri</div>
                  <div className="text-slate-600 font-bold py-1">Sat</div>
                </div>

                {/* Backdrop for open popover */}
                {activeDayPopover && (
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setActiveDayPopover(null)} 
                  />
                )}

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((cell) => {
                    if (cell.isEmpty) {
                      return (
                        <div
                          key={cell.key}
                          className="rounded-2xl border border-slate-100 bg-slate-50/40 min-h-[64px]"
                        />
                      );
                    }

                    const empId = individualEmployee.id || individualEmployee.empId;
                    const att = getEmployeeAttendanceOnDate(empId, cell.dateKey);
                    const isPopoverOpen = activeDayPopover === cell.dateKey;

                    return (
                      <div
                        key={cell.dateKey}
                        onClick={() => setActiveDayPopover(prev => prev === cell.dateKey ? null : cell.dateKey)}
                        className={`relative rounded-2xl border bg-white p-2 min-h-[68px] flex flex-col justify-between transition-all select-none cursor-pointer group ${
                          isPopoverOpen
                            ? 'ring-2 ring-purple-600 border-purple-600 shadow-md z-30'
                            : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        }`}
                        title={`हजेरी पर्याय निवडा (${cell.dateKey})`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold leading-none ${
                            cell.isSunday ? 'text-rose-500' : 'text-slate-800'
                          }`}>
                            {cell.dayNum}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-center">
                          {!att || !att.status ? (
                            <div className="w-full py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                              <span className="w-5 h-5 rounded-full border border-blue-400 bg-blue-50/70 text-blue-600 flex items-center justify-center text-xs font-bold leading-none shadow-2xs">
                                +
                              </span>
                            </div>
                          ) : att.overtimeHours > 0 ? (
                            <div className="w-full py-0.5 px-1 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center gap-1 shadow-2xs">
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
                                P
                              </span>
                              <span className="text-[10px] text-purple-700 font-bold leading-none">
                                +{att.overtimeHours}h
                              </span>
                            </div>
                          ) : att.status === 'Present' ? (
                            <div className="w-full py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 text-xs font-extrabold flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : att.status === 'Absent' ? (
                            <div className="w-full py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-xs font-extrabold flex items-center justify-center shadow-2xs">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : att.status === 'Half Day' ? (
                            <div className="w-full py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-700 text-xs font-extrabold flex items-center justify-center shadow-2xs">
                              ½
                            </div>
                          ) : (
                            <div className="w-full py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                              {att.status}
                            </div>
                          )}
                        </div>

                        {/* Floating Status Options Popover (Matching user screenshot) */}
                        {isPopoverOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute ${cell.dayNum > 18 ? 'bottom-full mb-2' : 'top-full mt-2'} ${
                              cell.dayOfWeek >= 4 ? 'right-0' : 'left-0'
                            } z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 w-48 text-left space-y-1 animate-scale-in`}
                          >
                            {/* Option 1: Present */}
                            <button
                              type="button"
                              onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, 'Present', 0)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group/item"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#00ba88] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 group-hover/item:text-slate-900">Present</span>
                            </button>

                            {/* Option 2: Absent */}
                            <button
                              type="button"
                              onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, 'Absent', 0)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group/item"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#ff3b5c] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <X className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 group-hover/item:text-slate-900">Absent</span>
                            </button>

                            {/* Option 3: Half Day */}
                            <button
                              type="button"
                              onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, 'Half Day', 0)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group/item"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#ff9900] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <span className="text-[11px] font-extrabold leading-none">½</span>
                              </div>
                              <span className="text-xs font-bold text-slate-800 group-hover/item:text-slate-900">Half Day</span>
                            </button>

                            {/* Option 4: Overtime (हजर+OT) */}
                            <div className="bg-purple-50 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, 'Present', 1)}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-purple-100/70 transition-colors text-left cursor-pointer"
                                title="Mark Overtime (+1h)"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <Clock className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span className="text-xs font-bold text-purple-700 whitespace-nowrap">Overtime (हजर+OT)</span>
                                </div>
                              </button>

                              {/* Quick OT Hours Selector: 1h, 2h, 4h */}
                              <div className="flex items-center justify-end gap-1 px-1 pt-1 border-t border-purple-200/50">
                                <span className="text-[10px] font-bold text-purple-600 mr-auto">तास:</span>
                                {[1, 2, 3, 4].map(h => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, 'Present', h)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    +{h}h
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Option 5: Clear / Reset if status already set */}
                            {att && att.status && (
                              <button
                                type="button"
                                onClick={() => setEmployeeStatusOnDate(empId, cell.dateKey, null, 0)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-slate-100 mt-1"
                              >
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                  <X className="w-3 h-3 text-slate-500" />
                                </div>
                                <span className="text-[11px] font-bold">Clear / अनमार्क करा (+)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Legend Bar (Matching Image 2) */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl py-2.5 px-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 font-semibold mt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>Present</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>Absent</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                      ½
                    </span>
                    <span>Half Day</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-bold">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold flex items-center justify-center">
                        P
                      </span>
                      <span>+OT</span>
                    </span>
                    <span>Overtime (हजर + OT)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW PRINTABLE PAYSLIP PREVIEW                                     */}
      {/* ========================================================================= */}
      {viewPayslipEmployee && (
        <Modal
          isOpen={Boolean(viewPayslipEmployee)}
          onClose={() => setViewPayslipEmployee(null)}
          title={`Official Salary Payslip: ${viewPayslipEmployee.name}`}
          subtitle={`Pay Period: ${selectedMonth}`}
          maxWidth="max-w-3xl"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs font-sans">
            {/* Header / Company Banner */}
            <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 font-heading">
                  {COMPANY_DETAILS.name}
                </h3>
                <p className="text-slate-600 text-xs mt-0.5">{COMPANY_DETAILS.address}</p>
                <p className="text-slate-500 text-[11px]">
                  GSTIN: <span className="font-mono font-bold text-slate-800">{COMPANY_DETAILS.gstin}</span> • 
                  PAN: <span className="font-mono font-bold text-slate-800">{COMPANY_DETAILS.pan}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-gold-400 text-slate-950 text-xs font-black rounded uppercase tracking-wider">
                  Payslip
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1 font-mono">{selectedMonth}</p>
              </div>
            </div>

            {/* Employee Particulars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Employee ID</span>
                <span className="font-bold text-slate-900 font-mono">{viewPayslipEmployee.id}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Designation</span>
                <span className="font-bold text-slate-900">{viewPayslipEmployee.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Department</span>
                <span className="font-bold text-slate-900">{viewPayslipEmployee.department}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">PAN / Bank A/C</span>
                <span className="font-mono font-bold text-slate-900">{viewPayslipEmployee.pan}</span>
              </div>
            </div>

            {/* Earnings & Deductions Comparison Table */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings Column */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs flex justify-between">
                  <span>Earnings Component</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(viewPayslipEmployee.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(viewPayslipEmployee.hra)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Conveyance Allowance</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(viewPayslipEmployee.conveyance)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Site Special Allowance</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(viewPayslipEmployee.specialAllowance)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono">
                      {formatCurrency(viewPayslipEmployee.basicSalary + viewPayslipEmployee.hra + viewPayslipEmployee.conveyance + viewPayslipEmployee.specialAllowance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-800 text-xs flex justify-between">
                  <span>Deduction Component</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-mono font-bold text-rose-600">-{formatCurrency(viewPayslipEmployee.pfDeduction)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Professional Tax (PT - Maha)</span>
                    <span className="font-mono font-bold text-rose-600">-{formatCurrency(viewPayslipEmployee.professionalTax || 200)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Income Tax (TDS)</span>
                    <span className="font-mono font-bold text-slate-500">₹0.00</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Other Deductions</span>
                    <span className="font-mono font-bold text-slate-500">₹0.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-rose-700">
                    <span>Total Deductions</span>
                    <span className="font-mono">
                      -{formatCurrency((viewPayslipEmployee.pfDeduction || 0) + (viewPayslipEmployee.professionalTax || 200))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight Box */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Net Take-Home Salary</span>
                <p className="text-[11px] text-slate-700 mt-0.5">
                  Amount in words: <strong className="text-slate-900">{numberToWordsIndian(viewPayslipEmployee.netSalary)}</strong>
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Disbursement: Direct Bank Transfer (NEFT / RTGS) • 26 Paid Days</p>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-800">
                {formatCurrency(viewPayslipEmployee.netSalary)}
              </span>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-500 border-t border-slate-200">
              <div>
                <div className="w-36 border-b border-slate-400 mx-auto mb-1"></div>
                <span>Employee Signature</span>
              </div>
              <div>
                <div className="w-36 border-b border-slate-400 mx-auto mb-1"></div>
                <span className="font-bold text-slate-800">Authorized Signatory (SANMATI CONSTRUCTIONS)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>

              <button
                onClick={() => {
                  generatePayslipPDF(viewPayslipEmployee, selectedMonth);
                  setViewPayslipEmployee(null);
                }}
                className="px-3 py-1.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW EMPLOYEE PROFILE DETAILS                                      */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <Modal
          isOpen={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          title={`Staff Record: ${selectedEmployee.name}`}
          subtitle={`Employee Code: ${selectedEmployee.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Designation:</span>
                <span className="text-slate-900 font-bold">{selectedEmployee.designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Department:</span>
                <span className="text-slate-900 font-semibold">{selectedEmployee.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Date of Joining:</span>
                <span className="text-slate-900 font-mono">{formatDate(selectedEmployee.joiningDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">PAN Card Number:</span>
                <span className="text-slate-900 font-mono font-bold">{selectedEmployee.pan}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">Registered Bank Account:</span>
                <span className="text-slate-900 font-mono">{selectedEmployee.bankAccount}</span>
              </div>
            </div>

            {/* Leave Balance Overview */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 text-xs block">Annual Leave Balances</span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Sick Leave</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedEmployee.leaveBalance?.sick || 7} Days</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Casual Leave</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedEmployee.leaveBalance?.casual || 12} Days</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-[10px] block">Earned Leave</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedEmployee.leaveBalance?.earned || 18} Days</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD NEW EMPLOYEE                                               */}
      {/* ========================================================================= */}
      {isOnboardModalOpen && (
        <Modal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Onboard New Employee / Staff"
          subtitle="Add employee record and define salary breakdown"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh More"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="erp-input"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Designation *</label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="erp-input"
                >
                  <option value="Senior Site Engineer">Senior Site Engineer</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Junior Civil Surveyor">Junior Civil Surveyor</option>
                  <option value="Billing Engineer">Billing Engineer</option>
                  <option value="Storekeeper">Storekeeper</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Quality Control Engineer">Quality Control Engineer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="erp-input"
                >
                  <option value="Site Execution">Site Execution</option>
                  <option value="Operations & Civil">Operations & Civil</option>
                  <option value="Survey & Quality">Survey & Quality</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Inventory & Stores">Inventory & Stores</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">PAN Card Number</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="erp-input font-mono uppercase"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h5 className="font-bold text-slate-900 text-xs">Salary Structure (Monthly INR)</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Basic Salary *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="erp-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">House Rent Allowance (HRA)</label>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                    className="erp-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Conveyance Allowance</label>
                  <input
                    type="number"
                    value={formData.conveyance}
                    onChange={(e) => setFormData({ ...formData, conveyance: Number(e.target.value) })}
                    className="erp-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Special Allowance</label>
                  <input
                    type="number"
                    value={formData.specialAllowance}
                    onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                    className="erp-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Provident Fund (PF) Deduct</label>
                  <input
                    type="number"
                    value={formData.pfDeduction}
                    onChange={(e) => setFormData({ ...formData, pfDeduction: Number(e.target.value) })}
                    className="erp-input font-mono text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Professional Tax (PT)</label>
                  <input
                    type="number"
                    disabled
                    value={200}
                    className="erp-input font-mono text-slate-500 bg-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="erp-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white shadow-xs rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Save Employee Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
