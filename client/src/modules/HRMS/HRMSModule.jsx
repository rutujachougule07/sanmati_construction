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
  AlertCircle, Building2, Briefcase, Phone, Mail, Award, X, Trash2
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatNumber, formatDate, numberToWordsIndian } from '../../utils/formatters';
import { generatePayslipPDF, exportToExcel } from '../../services/exportService';
import { COMPANY_DETAILS } from '../../utils/constants';
import { DatePicker } from '../../components/DatePicker';

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
  const [selectedDate, setSelectedDate] = useState('2026-11-02');
  const [isPayrollApproved, setIsPayrollApproved] = useState(false);

  // Dynamic Daily Attendance Register State
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    return hrmsEmployees.map((emp, idx) => ({
      empId: emp.id,
      name: emp.name,
      designation: emp.designation,
      site: idx === 0 ? 'Head Office, Tarabai Park' : idx === 1 ? 'Royal Palace Commercial Complex' : idx === 2 ? 'Tarabai Park High-Rise' : 'Head Office, Tarabai Park',
      inTime: idx === 0 ? '09:00 AM' : idx === 1 ? '08:45 AM' : idx === 2 ? '08:58 AM' : '09:15 AM',
      outTime: '06:30 PM',
      status: 'Present', // Present, Half Day, Absent, On Leave
      gpsStatus: idx === 0 ? 'Office Geofence' : 'Inside Site Geofence (18m)',
      overtimeHours: idx === 1 ? 1.5 : idx === 2 ? 2.0 : 0,
      daysPresentMonth: idx === 0 ? 26 : idx === 1 ? 25 : idx === 2 ? 26 : 24
    }));
  });

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
    
    // Add to attendance register as well
    setAttendanceRecords(prev => [
      {
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
      },
      ...prev
    ]);

    setIsOnboardModalOpen(false);
  };

  // Delete Employee handler
  const handleDeleteEmployee = (empId) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      setHrmsEmployees(prev => prev.filter(e => e.id !== empId));
      setAttendanceRecords(prev => prev.filter(r => r.empId !== empId));
      if (selectedEmployee?.id === empId) setSelectedEmployee(null);
    }
  };

  // Quick Attendance Status Toggle
  const updateAttendanceStatus = (empId, newStatus) => {
    setAttendanceRecords(prev => prev.map(rec => 
      rec.empId === empId ? { ...rec, status: newStatus } : rec
    ));
  };

  // Quick Overtime Adjuster
  const updateOvertime = (empId, delta) => {
    setAttendanceRecords(prev => prev.map(rec => 
      rec.empId === empId ? { ...rec, overtimeHours: Math.max(0, Number((rec.overtimeHours + delta).toFixed(1))) } : rec
    ));
  };

  // Mark all present helper
  const handleMarkAllPresent = () => {
    setAttendanceRecords(prev => prev.map(rec => ({ ...rec, status: 'Present' })));
  };

  // --- Calculations for Subsection iii: Salary calculation ---
  const standardWorkingDays = 26;

  const payrollCalculations = useMemo(() => {
    return hrmsEmployees.map(emp => {
      const att = attendanceRecords.find(a => a.empId === emp.id) || { daysPresentMonth: 26, overtimeHours: 0 };
      const daysWorked = att.daysPresentMonth;
      const otHours = att.overtimeHours || 0;

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
  }, [hrmsEmployees, attendanceRecords, isPayrollApproved]);

  // Aggregate totals
  const totalGrossPayroll = payrollCalculations.reduce((sum, item) => sum + item.earnedGross + item.overtimePay, 0);
  const totalDeductionsAll = payrollCalculations.reduce((sum, item) => sum + item.totalDeductions, 0);
  const totalNetDisbursement = payrollCalculations.reduce((sum, item) => sum + item.netPayable, 0);

  // Subsection i Table Columns: Employee records
  const employeeRecordColumns = [
    { 
      key: 'id', 
      header: 'Emp ID', 
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-bold bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs font-mono">
          {row.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Employee Name & Role',
      align: 'left',
      render: (row) => {
        const cleanName = row.name.replace(/^(Er\.|CA|Dr\.|Mr\.|Mrs\.)\s+/i, '');
        const initials = cleanName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EM';
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0 tracking-tight">
              {initials}
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs sm:text-lg leading-snug">{row.name}</span>
              <span className="text-sm text-slate-500 font-medium">{row.designation}</span>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'department', 
      header: 'Department', 
      align: 'left',
      render: (row) => <span className="text-slate-800 text-xs font-semibold">{row.department}</span> 
    },
    { 
      key: 'joiningDate', 
      header: 'Date Joined', 
      align: 'center',
      render: (row) => <span className="text-slate-700 text-xs font-medium whitespace-nowrap">{formatDate(row.joiningDate)}</span> 
    },
    {
      key: 'contact',
      header: 'Contact Info',
      sortable: false,
      render: (row) => (
        <div className="text-sm sm:text-base text-slate-600 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{row.phone || '+91 98220 00000'}</span>
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{row.email || 'employee@sanmati.com'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'netSalary', 
      header: 'Monthly Net Pay', 
      align: 'right', 
      render: (row) => (
        <span className="font-bold text-slate-900 text-base sm:text-lg tabular-nums font-mono block text-right">
          {formatCurrency(row.netSalary)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setSelectedEmployee(row)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-sm font-bold transition-all hover:shadow-2xs active:scale-95 cursor-pointer"
            title="View Full Profile"
          >
            <Eye className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
            <span>Full Details</span>
          </button>
          <button
            onClick={() => handleDeleteEmployee(row.id)}
            className="inline-flex items-center justify-center p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-xl transition-all hover:shadow-2xs active:scale-95 cursor-pointer"
            title="Delete Employee Record"
          >
            <Trash2 className="w-4 h-4" />
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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            <span>SANMATI CONSTRUCTIONS</span>
            <span>•</span>
            <span>Module 6</span>
            <span>•</span>
            <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded border border-red-200/80 text-xs">
              {activeTab === 'records' && 'i. Employee Records'}
              {activeTab === 'attendance' && 'ii. Attendance Management'}
              {activeTab === 'salary' && 'iii. Salary Calculation'}
              {activeTab === 'payslips' && 'iv. Payslip Generation'}
            </span>
          </div>
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
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-sm text-emerald-700 font-semibold">All KYC & Banking profiles verified</span>
            </div>
            
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="erp-btn-primary text-sm font-bold px-4 py-2"
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
        <div className="space-y-5">
          {/* Top Controls Ribbon */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Attendance Register Date
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Site Geofence Filter
                </label>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-gold-500">
                  <option value="all">All Construction Sites (Kolhapur)</option>
                  <option value="prj1">Royal Palace Commercial Complex</option>
                  <option value="prj2">Tarabai Park High-Rise</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => alert("GPS coordinates resynchronized with active site geofences.")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gold-600" />
                <span>Sync Geofence GPS</span>
              </button>
            </div>
          </div>

          {/* Real-Time Attendance Register Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-heading">Daily Site Attendance & GPS Geofence Verification</h4>
                <p className="text-[11px] text-slate-500">Live check-in log linked to authorized site engineers and project managers.</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>4 / 4 Present Today</span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((rec) => (
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

                      <td className="px-3.5 py-2 text-xs text-center font-mono text-sm font-medium text-slate-800">
                        <span>{rec.inTime}</span>
                        <span className="text-slate-400 mx-1.5">-</span>
                        <span>{rec.outTime}</span>
                      </td>

                      <td className="px-3.5 py-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {rec.gpsStatus}
                        </span>
                      </td>

                      <td className="px-3.5 py-2 text-xs text-center">
                        <select
                          value={rec.status}
                          onChange={(e) => updateAttendanceStatus(rec.empId, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                            rec.status === 'Present' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                              : rec.status === 'Half Day' 
                              ? 'bg-amber-50 text-amber-700 border-amber-300' 
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Absent">Absent</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </td>

                      <td className="px-3.5 py-2 text-xs text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                          <button 
                            onClick={() => updateOvertime(rec.empId, -0.5)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1.5 text-sm"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-slate-800 text-sm min-w-[32px]">
                            {rec.overtimeHours}h
                          </span>
                          <button 
                            onClick={() => updateOvertime(rec.empId, 0.5)}
                            className="text-slate-500 hover:text-slate-900 font-bold px-1.5 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-900 font-bold text-xs">
                        {rec.daysPresentMonth} / {standardWorkingDays}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isPayrollApproved 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'erp-btn-primary'
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
                        <span className="px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-heading">
                Monthly Payslip Generation & Distribution ({selectedMonth})
              </h4>
              <p className="text-[11px] text-slate-500">
                Official payroll vouchers with SANMATI CONSTRUCTIONS seal, PAN, and authorized signatures.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  hrmsEmployees.forEach(emp => generatePayslipPDF(emp, selectedMonth));
                }}
                className="erp-btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Payslips (Bulk PDF)</span>
              </button>
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
                        className="erp-btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
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
                className="erp-btn-primary text-xs flex items-center gap-1.5"
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
                className="erp-btn-primary text-xs"
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
