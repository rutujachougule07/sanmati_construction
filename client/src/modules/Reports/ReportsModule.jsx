// MODULE 5: CUSTOM REPORTS — Full Connected Flow (i → ii → iii → iv)
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText, Download, Calendar, Building, Users, TrendingUp, DollarSign,
  CheckCircle2, AlertCircle, Eye, Filter, ArrowRight, RefreshCw, X,
  BarChart3, Package, FileSpreadsheet, Layers, ChevronRight, IndianRupee
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import {
  generatePDFReport,
  generateProjectDossierPDF,
  exportToExcel,
  exportToCSV
} from '../../services/exportService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DatePicker } from '../../components/DatePicker';

// ─── Shared micro-components ────────────────────────────────────────────────

const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-fade-in
      ${isErr ? 'bg-rose-600' : 'bg-emerald-600'}`}>
      {isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      {toast.message}
    </div>
  );
};

const StepBadge = ({ n, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-7 h-7 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">{n}</span>
    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
  </div>
);

const SummaryCard = ({ label, value, icon: Icon, color }) => (
  <div className={`rounded-xl p-4 border ${color} flex items-start gap-3`}>
    <div className="p-2 rounded-lg bg-white/60">
      <Icon size={18} className="text-current" />
    </div>
    <div>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

const ReportTable = ({ headers, rows, emptyMsg = 'कोणतेही Records नाहीत.' }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="text-center py-10 text-slate-400">{emptyMsg}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-slate-700 whitespace-nowrap">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ExportBar = ({ onPDF, onExcel, label = '' }) => (
  <div className="flex flex-wrap items-center gap-2 mt-3">
    {label && <span className="text-xs text-slate-500 mr-1">{label}</span>}
    <button onClick={onPDF}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium rounded-lg transition-colors">
      <FileText size={13} /> PDF
    </button>
    <button onClick={onExcel}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors">
      <FileSpreadsheet size={13} /> Excel
    </button>
  </div>
);

const SectionHeader = ({ badge, title, subtitle }) => (
  <div className="mb-4">
    <span className="inline-block text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1 mb-2">{badge}</span>
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

export const ReportsModule = () => {
  const { projects = [], clients = [], vendors = [], raBills = [], expenses = [], hrmsEmployees = [] } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'custom';

  // Section (i) state
  const [reportType, setReportType] = useState('projectBilling');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [selectedFY, setSelectedFY] = useState('FY2026-27');
  const [previewMode, setPreviewMode] = useState(false);

  // Section (ii) state
  const [dateFrom, setDateFrom] = useState('2026-11-01');
  const [dateTo, setDateTo] = useState('2026-11-30');
  const [dateReportType, setDateReportType] = useState('ALL');
  const [dateProjectId, setDateProjectId] = useState('ALL');

  // Section (iii) state
  const [selectedProjId, setSelectedProjId] = useState(null);

  // Global toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getClientName = (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return '—';
    const cl = clients.find(c => c.id === proj.clientId);
    return cl ? cl.companyName || cl.name : '—';
  };

  const statusBadge = (status) => {
    const map = { Paid: 'bg-emerald-100 text-emerald-700', Partial: 'bg-amber-100 text-amber-700', Pending: 'bg-rose-100 text-rose-700' };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  const setQuickRange = (preset) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (preset === 'today') { const t = fmt(now); setDateFrom(t); setDateTo(t); }
    else if (preset === 'week') {
      const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      setDateFrom(fmt(mon)); setDateTo(fmt(sun));
    } else if (preset === 'month') {
      setDateFrom(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`);
      setDateTo(fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    } else if (preset === 'fy') {
      const yr = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      setDateFrom(`${yr}-04-01`); setDateTo(`${yr + 1}-03-31`);
    }
  };

  // ── Section (i) data ───────────────────────────────────────────────────────

  const reportDefs = {
    projectBilling: {
      label: 'RA Billing & Revenue Report',
      headers: ['Bill No', 'Project', 'Date', 'Bill Amount', 'Net Payable', 'Status'],
      getData: () => {
        const filtered = selectedProjectId === 'ALL' ? raBills : raBills.filter(b => b.projectId === selectedProjectId);
        return filtered.map(b => [
          b.billNumber || b.id, b.projectId, formatDate(b.date),
          formatCurrency(b.currentBillAmount), formatCurrency(b.netPayable), b.paymentStatus || '—'
        ]);
      },
      summary: () => {
        const filtered = selectedProjectId === 'ALL' ? raBills : raBills.filter(b => b.projectId === selectedProjectId);
        return { count: filtered.length, total: filtered.reduce((s, b) => s + (b.netPayable || 0), 0) };
      }
    },
    projectProfitability: {
      label: 'Project Profitability Report',
      headers: ['Project ID', 'Project Name', 'Contract Value', 'Actual Cost', 'Billed', 'Net Profit'],
      getData: () => {
        const list = selectedProjectId === 'ALL' ? projects : projects.filter(p => p.id === selectedProjectId);
        return list.map(p => [p.id, p.projectName, formatCurrency(p.contractValue), formatCurrency(p.actualExpenditure), formatCurrency(p.billedAmount), formatCurrency(p.actualProfit)]);
      },
      summary: () => ({ count: (selectedProjectId === 'ALL' ? projects : projects.filter(p => p.id === selectedProjectId)).length, total: projects.reduce((s, p) => s + (p.actualProfit || 0), 0) })
    },
    vendorExpenses: {
      label: 'Vendor Dues & Supplier Statement',
      headers: ['Vendor ID', 'Company', 'Total Purchase', 'Paid', 'Outstanding'],
      getData: () => vendors.map(v => [v.id, v.companyName || v.name, formatCurrency(v.totalPurchase), formatCurrency(v.paidAmount), formatCurrency(v.outstandingBalance)]),
      summary: () => ({ count: vendors.length, total: vendors.reduce((s, v) => s + (v.outstandingBalance || 0), 0) })
    },
    employeeSalaries: {
      label: 'HRMS Payroll & Salary Register',
      headers: ['Emp ID', 'Name', 'Designation', 'Basic', 'HRA', 'PF Deduction', 'Net Salary'],
      getData: () => hrmsEmployees.map(e => [e.employeeId, e.name, e.designation, formatCurrency(e.basicSalary), formatCurrency(e.hra), formatCurrency(e.pfDeduction), formatCurrency(e.netSalary)]),
      summary: () => ({ count: hrmsEmployees.length, total: hrmsEmployees.reduce((s, e) => s + (e.netSalary || 0), 0) })
    },
    siteExpenses: {
      label: 'Site Expenses & Petty Cash Report',
      headers: ['Expense ID', 'Project', 'Date', 'Category', 'Amount', 'Paid To', 'Mode'],
      getData: () => {
        const list = selectedProjectId === 'ALL' ? expenses : expenses.filter(e => e.projectId === selectedProjectId);
        return list.map(e => [e.id, e.projectId, formatDate(e.date), e.category, formatCurrency(e.amount), e.paidTo || '—', e.paymentMode || '—']);
      },
      summary: () => {
        const list = selectedProjectId === 'ALL' ? expenses : expenses.filter(e => e.projectId === selectedProjectId);
        return { count: list.length, total: list.reduce((s, e) => s + (e.amount || 0), 0) };
      }
    }
  };

  const currentDef = reportDefs[reportType];
  const currentRows = useMemo(() => currentDef.getData(), [reportType, selectedProjectId, raBills, projects, vendors, hrmsEmployees, expenses]);
  const currentSummary = useMemo(() => currentDef.summary(), [reportType, selectedProjectId, raBills, projects, vendors, hrmsEmployees, expenses]);

  const handleCustomPDF = () => {
    try {
      generatePDFReport({ title: currentDef.label, subtitle: `Financial Year: ${selectedFY}`, headers: currentDef.headers, rows: currentRows, fileName: `${reportType}_${selectedFY}.pdf` });
      showToast('PDF यशस्वीरित्या डाऊनलोड झाला! ✓');
    } catch (e) { showToast('PDF export failed: ' + e.message, 'error'); }
  };
  const handleCustomExcel = () => {
    try {
      const raw = currentRows.map(r => Object.fromEntries(currentDef.headers.map((h, i) => [h, r[i]])));
      exportToExcel(raw, `${reportType}_${selectedFY}.xlsx`);
      showToast('Excel यशस्वीरित्या डाऊनलोड झाला! ✓');
    } catch (e) { showToast('Excel export failed: ' + e.message, 'error'); }
  };
  const handleCustomCSV = () => {
    try {
      const raw = currentRows.map(r => Object.fromEntries(currentDef.headers.map((h, i) => [h, r[i]])));
      exportToCSV(raw, `${reportType}_${selectedFY}.csv`);
      showToast('CSV यशस्वीरित्या डाऊनलोड झाला! ✓');
    } catch (e) { showToast('CSV export failed: ' + e.message, 'error'); }
  };

  // ── Section (ii) data ──────────────────────────────────────────────────────

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr); const f = new Date(dateFrom); const t = new Date(dateTo);
    return d >= f && d <= t;
  };

  const filteredBills = useMemo(() => raBills.filter(b => inRange(b.date) && (dateProjectId === 'ALL' || b.projectId === dateProjectId)), [raBills, dateFrom, dateTo, dateProjectId]);
  const filteredExpenses = useMemo(() => expenses.filter(e => inRange(e.date) && (dateProjectId === 'ALL' || e.projectId === dateProjectId)), [expenses, dateFrom, dateTo, dateProjectId]);

  const totalIncome = filteredBills.reduce((s, b) => s + (b.netPayable || 0), 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpense;

  const handleDatePDF = (data, headers, fileName, title) => {
    try { generatePDFReport({ title, headers, rows: data, fileName }); showToast('PDF डाऊनलोड झाला! ✓'); }
    catch (e) { showToast('Error: ' + e.message, 'error'); }
  };
  const handleDateExcel = (data, headers, fileName) => {
    try { exportToExcel(data.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]]))), fileName); showToast('Excel डाऊनलोड झाला! ✓'); }
    catch (e) { showToast('Error: ' + e.message, 'error'); }
  };
  const handleDateCSV = (data, headers, fileName) => {
    try { exportToCSV(data.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]]))), fileName); showToast('CSV डाऊनलोड झाला! ✓'); }
    catch (e) { showToast('Error: ' + e.message, 'error'); }
  };

  // ── Section (iii) data ─────────────────────────────────────────────────────

  const selProject = projects.find(p => p.id === selectedProjId);
  const selProjectBills = raBills.filter(b => b.projectId === selectedProjId);
  const selProjectExpenses = expenses.filter(e => e.projectId === selectedProjId);

  const handleDossierDownload = (proj) => {
    try {
      const cl = clients.find(c => c.id === proj.clientId);
      const bills = raBills.filter(b => b.projectId === proj.id);
      generateProjectDossierPDF(proj, cl, bills);
      showToast(`${proj.projectName} — Dossier PDF तयार झाला! ✓`);
    } catch (e) { showToast('Dossier error: ' + e.message, 'error'); }
  };

  const billingPct = (p) => {
    if (!p.contractValue || p.contractValue === 0) return 0;
    return Math.round(((p.billedAmount || 0) / p.contractValue) * 100);
  };

  // ── Section (iv) export cards ──────────────────────────────────────────────

  const exportCards = [
    {
      icon: IndianRupee, color: 'border-red-100 bg-red-50',
      title: 'RA Billing & Revenue Statement',
      desc: 'सर्व RA Bills, Net Payable, Payment Status सहित',
      onPDF: () => { try { generatePDFReport({ title: 'RA Billing & Revenue Statement', headers: ['Bill No', 'Project', 'Date', 'Amount', 'Status'], rows: raBills.map(b => [b.billNumber || b.id, b.projectId, formatDate(b.date), formatCurrency(b.netPayable), b.paymentStatus || '—']), fileName: 'RA_Billing_Statement.pdf' }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onExcel: () => { try { exportToExcel(raBills.map(b => ({ Bill: b.billNumber || b.id, Project: b.projectId, Date: b.date, Amount: b.netPayable, Status: b.paymentStatus })), 'RA_Billing.xlsx'); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onCSV: () => { try { exportToCSV(raBills.map(b => ({ Bill: b.billNumber || b.id, Project: b.projectId, Date: b.date, Amount: b.netPayable, Status: b.paymentStatus })), 'RA_Billing.csv'); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }
    },
    {
      icon: TrendingUp, color: 'border-emerald-200 bg-emerald-50',
      title: 'Project Costing & Profitability',
      desc: 'Contract Value, Actual Cost, Net Profit — Project-wise',
      onPDF: () => { try { generatePDFReport({ title: 'Project Costing & Profitability', headers: ['ID', 'Project', 'Contract', 'Cost', 'Profit'], rows: projects.map(p => [p.id, p.projectName, formatCurrency(p.contractValue), formatCurrency(p.actualExpenditure), formatCurrency(p.actualProfit)]), fileName: 'Project_Costing.pdf' }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onExcel: () => { try { exportToExcel(projects.map(p => ({ ID: p.id, Project: p.projectName, Contract: p.contractValue, Cost: p.actualExpenditure, Profit: p.actualProfit })), 'Project_Costing.xlsx'); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onCSV: () => { try { exportToCSV(projects.map(p => ({ ID: p.id, Project: p.projectName, Contract: p.contractValue, Cost: p.actualExpenditure, Profit: p.actualProfit })), 'Project_Costing.csv'); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }
    },
    {
      icon: Package, color: 'border-amber-200 bg-amber-50',
      title: 'Vendor Dues & Supplier Statement',
      desc: 'Total Purchase, Paid Amount, Outstanding Balance',
      onPDF: () => { try { generatePDFReport({ title: 'Vendor Dues Statement', headers: ['ID', 'Vendor', 'Total', 'Paid', 'Outstanding'], rows: vendors.map(v => [v.id, v.companyName || v.name, formatCurrency(v.totalPurchase), formatCurrency(v.paidAmount), formatCurrency(v.outstandingBalance)]), fileName: 'Vendor_Dues.pdf' }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onExcel: () => { try { exportToExcel(vendors.map(v => ({ ID: v.id, Vendor: v.companyName || v.name, Total: v.totalPurchase, Paid: v.paidAmount, Outstanding: v.outstandingBalance })), 'Vendor_Dues.xlsx'); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onCSV: () => { try { exportToCSV(vendors.map(v => ({ ID: v.id, Vendor: v.companyName || v.name, Total: v.totalPurchase, Paid: v.paidAmount, Outstanding: v.outstandingBalance })), 'Vendor_Dues.csv'); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }
    },
    {
      icon: Users, color: 'border-purple-200 bg-purple-50',
      title: 'HRMS Payroll & Salary Register',
      desc: 'Basic, HRA, PF Deduction, Net Salary — All Employees',
      onPDF: () => { try { generatePDFReport({ title: 'HRMS Payroll Register', headers: ['ID', 'Name', 'Designation', 'Basic', 'Net Salary'], rows: hrmsEmployees.map(e => [e.employeeId, e.name, e.designation, formatCurrency(e.basicSalary), formatCurrency(e.netSalary)]), fileName: 'Payroll_Register.pdf' }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onExcel: () => { try { exportToExcel(hrmsEmployees.map(e => ({ ID: e.employeeId, Name: e.name, Designation: e.designation, Basic: e.basicSalary, Net: e.netSalary })), 'Payroll_Register.xlsx'); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onCSV: () => { try { exportToCSV(hrmsEmployees.map(e => ({ ID: e.employeeId, Name: e.name, Designation: e.designation, Basic: e.basicSalary, Net: e.netSalary })), 'Payroll_Register.csv'); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }
    },
    {
      icon: Building, color: 'border-rose-200 bg-rose-50',
      title: 'Site Expenses & Petty Cash',
      desc: 'Category-wise Site Expenses, Payment Mode Analysis',
      onPDF: () => { try { generatePDFReport({ title: 'Site Expenses Report', headers: ['ID', 'Project', 'Date', 'Category', 'Amount', 'Mode'], rows: expenses.map(e => [e.id, e.projectId, formatDate(e.date), e.category, formatCurrency(e.amount), e.paymentMode || '—']), fileName: 'Site_Expenses.pdf' }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onExcel: () => { try { exportToExcel(expenses.map(e => ({ ID: e.id, Project: e.projectId, Date: e.date, Category: e.category, Amount: e.amount, Mode: e.paymentMode })), 'Site_Expenses.xlsx'); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } },
      onCSV: () => { try { exportToCSV(expenses.map(e => ({ ID: e.id, Project: e.projectId, Date: e.date, Category: e.category, Amount: e.amount, Mode: e.paymentMode })), 'Site_Expenses.csv'); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }
    }
  ];

  // ── Render: Section (i) ────────────────────────────────────────────────────

  const renderCustom = () => (
    <div className="space-y-4">
      {/* Step 1 — Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="1" label="Report Parameters निवडा" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Report Template</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none">
              {Object.entries(reportDefs).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project</label>
            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none">
              <option value="ALL">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.id} — {p.projectName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Financial Year</label>
            <select value={selectedFY} onChange={e => setSelectedFY(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none">
              {['FY2024-25', 'FY2025-26', 'FY2026-27', 'FY2027-28'].map(fy => <option key={fy}>{fy}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => setPreviewMode(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-colors">
            <Eye size={16} /> Report Preview करा
          </button>
          {previewMode && (
            <button onClick={() => setPreviewMode(false)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm rounded-xl transition-colors">
              <X size={15} /> Preview बंद करा
            </button>
          )}
        </div>
      </div>

      {/* Step 2 — Live Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <StepBadge n="2" label="Live Data Summary" />
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
            Live Data — {currentSummary.count} Records
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Total Records" value={currentSummary.count} icon={BarChart3} color="border-red-200 bg-red-50 text-red-700" />
          <SummaryCard label="Total Amount" value={formatCurrency(currentSummary.total)} icon={IndianRupee} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
          <SummaryCard label="Report Type" value={currentDef.label.split(' ').slice(0, 2).join(' ')} icon={FileText} color="border-amber-200 bg-amber-50 text-amber-700" />
          <SummaryCard label="Financial Year" value={selectedFY} icon={Calendar} color="border-purple-200 bg-purple-50 text-purple-700" />
        </div>
      </div>

      {/* Step 3 — Report Preview */}
      {previewMode && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <StepBadge n="3" label="Report Preview & Export" />
            <ExportBar onPDF={handleCustomPDF} onExcel={handleCustomExcel} onCSV={handleCustomCSV} />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-3">{currentDef.label} — {selectedFY}</p>
          <ReportTable headers={currentDef.headers} rows={currentRows} emptyMsg="या Filter साठी कोणताही Data नाही." />
        </div>
      )}
    </div>
  );

  // ── Render: Section (ii) ───────────────────────────────────────────────────

  const renderDatewise = () => {
    const billRows = filteredBills.map(b => [b.billNumber || b.id, b.projectId, formatDate(b.date), formatCurrency(b.currentBillAmount), formatCurrency(b.netPayable), b.paymentStatus || '—']);
    const expRows = filteredExpenses.map(e => [e.id, e.projectId, formatDate(e.date), e.category, formatCurrency(e.amount), e.paidTo || '—', e.paymentMode || '—']);
    const vendorRows = vendors.map(v => [v.id, v.companyName || v.name, formatCurrency(v.totalPurchase), formatCurrency(v.paidAmount), formatCurrency(v.outstandingBalance)]);

    return (
      <div className="space-y-4">

        {/* Step 1 — Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="1" label="Date Range & Filters" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">From Date</label>
              <DatePicker value={dateFrom} onChange={setDateFrom} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">To Date</label>
              <DatePicker value={dateTo} onChange={setDateTo} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Report Type</label>
              <select value={dateReportType} onChange={e => setDateReportType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none">
                <option value="ALL">All Types</option>
                <option value="billing">RA Billing</option>
                <option value="expenses">Site Expenses</option>
                <option value="vendors">Vendor Purchases</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project</label>
              <select value={dateProjectId} onChange={e => setDateProjectId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none">
                <option value="ALL">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
              </select>
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center">Quick:</span>
            {[['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['fy', 'Full FY']].map(([k, l]) => (
              <button key={k} onClick={() => setQuickRange(k)}
                className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="2" label="Income / Expense Summary" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Total Income (RA Bills)" value={formatCurrency(totalIncome)} icon={TrendingUp} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
            <SummaryCard label="Total Expense" value={formatCurrency(totalExpense)} icon={DollarSign} color="border-rose-200 bg-rose-50 text-rose-700" />
            <SummaryCard label={`Net Cash Flow ${netCashFlow >= 0 ? '▲' : '▼'}`} value={formatCurrency(Math.abs(netCashFlow))} icon={BarChart3} color={netCashFlow >= 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'} />
          </div>
        </div>

        {/* Step 3 — RA Bills Table */}
        {(dateReportType === 'ALL' || dateReportType === 'billing') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <StepBadge n="3a" label="RA Bills" />
                <p className="text-xs text-slate-500">{filteredBills.length} bills in selected range</p>
              </div>
              <ExportBar
                onPDF={() => handleDatePDF(billRows, ['Bill No', 'Project', 'Date', 'Amount', 'Net Payable', 'Status'], 'RA_Bills_Datewise.pdf', 'RA Bills — Date-wise')}
                onExcel={() => handleDateExcel(billRows, ['Bill No', 'Project', 'Date', 'Amount', 'Net Payable', 'Status'], 'RA_Bills_Datewise.xlsx')}
                onCSV={() => handleDateCSV(billRows, ['Bill No', 'Project', 'Date', 'Amount', 'Net Payable', 'Status'], 'RA_Bills_Datewise.csv')}
              />
            </div>
            <ReportTable headers={['Bill No', 'Project', 'Date', 'Amount', 'Net Payable', 'Status']} rows={billRows} emptyMsg="या Date Range मध्ये कोणतेही RA Bills नाहीत." />
          </div>
        )}

        {/* Step 3 — Expenses Table */}
        {(dateReportType === 'ALL' || dateReportType === 'expenses') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <StepBadge n="3b" label="Site Expenses" />
                <p className="text-xs text-slate-500">{filteredExpenses.length} records in selected range</p>
              </div>
              <ExportBar
                onPDF={() => handleDatePDF(expRows, ['ID', 'Project', 'Date', 'Category', 'Amount', 'Paid To', 'Mode'], 'Expenses_Datewise.pdf', 'Site Expenses — Date-wise')}
                onExcel={() => handleDateExcel(expRows, ['ID', 'Project', 'Date', 'Category', 'Amount', 'Paid To', 'Mode'], 'Expenses_Datewise.xlsx')}
                onCSV={() => handleDateCSV(expRows, ['ID', 'Project', 'Date', 'Category', 'Amount', 'Paid To', 'Mode'], 'Expenses_Datewise.csv')}
              />
            </div>
            <ReportTable headers={['ID', 'Project', 'Date', 'Category', 'Amount', 'Paid To', 'Mode']} rows={expRows} emptyMsg="या Date Range मध्ये कोणतेही Expenses नाहीत." />
          </div>
        )}

        {/* Step 3 — Vendors Table */}
        {(dateReportType === 'ALL' || dateReportType === 'vendors') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <StepBadge n="3c" label="Vendor Purchases" />
                <p className="text-xs text-slate-500">{vendors.length} vendors</p>
              </div>
              <ExportBar
                onPDF={() => handleDatePDF(vendorRows, ['ID', 'Vendor', 'Total', 'Paid', 'Outstanding'], 'Vendors_Datewise.pdf', 'Vendor Purchases')}
                onExcel={() => handleDateExcel(vendorRows, ['ID', 'Vendor', 'Total', 'Paid', 'Outstanding'], 'Vendors_Datewise.xlsx')}
                onCSV={() => handleDateCSV(vendorRows, ['ID', 'Vendor', 'Total', 'Paid', 'Outstanding'], 'Vendors_Datewise.csv')}
              />
            </div>
            <ReportTable headers={['ID', 'Vendor', 'Total Purchase', 'Paid', 'Outstanding']} rows={vendorRows} emptyMsg="कोणतेही Vendor नाहीत." />
          </div>
        )}
      </div>
    );
  };

  // ── Render: Section (iii) ──────────────────────────────────────────────────

  const renderProjectwise = () => (
    <div className="space-y-4">

      {/* Step 1 — Project Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="1" label="Project निवडा" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(p => {
            const isSelected = selectedProjId === p.id;
            const pct = billingPct(p);
            return (
              <button key={p.id} onClick={() => setSelectedProjId(isSelected ? null : p.id)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-red-500 bg-red-50 shadow-md ring-2 ring-red-300' : 'border-slate-200 hover:border-red-300 bg-white hover:shadow-sm'}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{p.id}</span>
                  {isSelected && <CheckCircle2 size={18} className="text-red-600" />}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{p.projectName}</h3>
                <p className="text-xs text-slate-500 mb-3">{p.location || p.siteAddress || '—'}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
                  <div><span className="text-slate-400">Contract:</span> <span className="font-semibold text-slate-700">{formatCurrency(p.contractValue)}</span></div>
                  <div><span className="text-slate-400">Billed:</span> <span className="font-semibold text-emerald-600">{formatCurrency(p.billedAmount)}</span></div>
                  <div><span className="text-slate-400">Actual Cost:</span> <span className="font-semibold text-rose-600">{formatCurrency(p.actualExpenditure)}</span></div>
                  <div><span className="text-slate-400">Net Profit:</span> <span className="font-semibold text-red-600">{formatCurrency(p.actualProfit)}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{pct}%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Billing Completion</p>
              </button>
            );
          })}
        </div>
        {!selectedProjId && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium text-center">
            👆 वरीलपैकी एक Project Card वर Click करा — पूर्ण Financial Details खाली दिसतील.
          </div>
        )}
      </div>

      {/* Step 2 — Project Details */}
      {selProject && (
        <>
          {/* Info bar */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <StepBadge n="2" label="Project Financial Overview" />
                <h3 className="text-lg font-bold text-slate-800">{selProject.projectName}</h3>
                <p className="text-sm text-slate-500">{selProject.location || selProject.siteAddress}</p>
                <p className="text-xs text-slate-400 mt-1">Client: {getClientName(selProject.id)}</p>
              </div>
              <button onClick={() => handleDossierDownload(selProject)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-colors">
                <Download size={16} /> Executive Dossier PDF डाऊनलोड
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <SummaryCard label="Project Budget" value={formatCurrency(selProject.projectBudget || selProject.contractValue)} icon={DollarSign} color="border-red-200 bg-red-50 text-red-700" />
              <SummaryCard label="Actual Expenditure" value={formatCurrency(selProject.actualExpenditure)} icon={TrendingUp} color="border-rose-200 bg-rose-50 text-rose-700" />
              <SummaryCard label="Remaining Budget" value={formatCurrency((selProject.projectBudget || selProject.contractValue || 0) - (selProject.actualExpenditure || 0))} icon={BarChart3} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
              <SummaryCard label="Total Billed (RA)" value={formatCurrency(selProject.billedAmount)} icon={FileText} color="border-amber-200 bg-amber-50 text-amber-700" />
            </div>
          </div>

          {/* RA Bills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <StepBadge n="3a" label={`RA Bills — ${selProject.id}`} />
              <ExportBar
                onPDF={() => { try { generatePDFReport({ title: `RA Bills — ${selProject.projectName}`, headers: ['Bill No', 'Date', 'Amount', 'Net Payable', 'Status'], rows: selProjectBills.map(b => [b.billNumber || b.id, formatDate(b.date), formatCurrency(b.currentBillAmount), formatCurrency(b.netPayable), b.paymentStatus || '—']), fileName: `RA_Bills_${selProject.id}.pdf` }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
                onExcel={() => { try { exportToExcel(selProjectBills.map(b => ({ Bill: b.billNumber || b.id, Date: b.date, Amount: b.currentBillAmount, Net: b.netPayable, Status: b.paymentStatus })), `RA_Bills_${selProject.id}.xlsx`); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
                onCSV={() => { try { exportToCSV(selProjectBills.map(b => ({ Bill: b.billNumber || b.id, Date: b.date, Amount: b.currentBillAmount, Net: b.netPayable, Status: b.paymentStatus })), `RA_Bills_${selProject.id}.csv`); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
              />
            </div>
            <ReportTable
              headers={['Bill No', 'Date', 'Bill Amount', 'Net Payable', 'Status']}
              rows={selProjectBills.map(b => [b.billNumber || b.id, formatDate(b.date), formatCurrency(b.currentBillAmount), formatCurrency(b.netPayable), b.paymentStatus || '—'])}
              emptyMsg="या Project साठी RA Bills नाहीत."
            />
          </div>

          {/* Site Expenses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <StepBadge n="3b" label={`Site Expenses — ${selProject.id}`} />
              <ExportBar
                onPDF={() => { try { generatePDFReport({ title: `Site Expenses — ${selProject.projectName}`, headers: ['ID', 'Date', 'Category', 'Amount', 'Paid To', 'Mode'], rows: selProjectExpenses.map(e => [e.id, formatDate(e.date), e.category, formatCurrency(e.amount), e.paidTo || '—', e.paymentMode || '—']), fileName: `Expenses_${selProject.id}.pdf` }); showToast('PDF डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
                onExcel={() => { try { exportToExcel(selProjectExpenses.map(e => ({ ID: e.id, Date: e.date, Category: e.category, Amount: e.amount, PaidTo: e.paidTo, Mode: e.paymentMode })), `Expenses_${selProject.id}.xlsx`); showToast('Excel डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
                onCSV={() => { try { exportToCSV(selProjectExpenses.map(e => ({ ID: e.id, Date: e.date, Category: e.category, Amount: e.amount, PaidTo: e.paidTo, Mode: e.paymentMode })), `Expenses_${selProject.id}.csv`); showToast('CSV डाऊनलोड झाला! ✓'); } catch (e) { showToast(e.message, 'error'); } }}
              />
            </div>
            <ReportTable
              headers={['ID', 'Date', 'Category', 'Amount', 'Paid To', 'Mode']}
              rows={selProjectExpenses.map(e => [e.id, formatDate(e.date), e.category, formatCurrency(e.amount), e.paidTo || '—', e.paymentMode || '—'])}
              emptyMsg="या Project साठी Site Expenses नाहीत."
            />
          </div>

          {/* Milestones */}
          {selProject.activities && selProject.activities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <StepBadge n="3c" label="Construction Milestones" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {selProject.activities.map((act, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${act.status === 'Completed' ? 'bg-emerald-500' : act.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <span className="text-xs font-bold text-slate-700">{act.name || act.activityName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{act.status || '—'} {act.completion ? `• ${act.completion}% Complete` : ''}</p>
                    {act.endDate && <p className="text-[11px] text-slate-400 mt-0.5">Due: {formatDate(act.endDate)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Render: Section (iv) ───────────────────────────────────────────────────

  const renderExport = () => (
    <div className="space-y-4">

      {/* 5 standard export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exportCards.map((card, i) => (
          <div key={i} className={`rounded-2xl border p-5 shadow-sm ${card.color}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <card.icon size={20} className="text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{card.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
              </div>
            </div>
            <ExportBar onPDF={card.onPDF} onExcel={card.onExcel} onCSV={card.onCSV} label="Export:" />
          </div>
        ))}
      </div>

      {/* Project Executive Dossiers */}
      <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <Layers size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Project Executive Dossiers</h3>
            <p className="text-xs text-slate-500 mt-0.5">प्रत्येक Project साठी Branded PDF Dossier — Contract, Financials, Milestones, RA Bills सहित</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{p.id}</span>
              <p className="font-semibold text-slate-800 text-sm mt-2 mb-1">{p.projectName}</p>
              <p className="text-xs text-slate-500 mb-3">{p.location || p.siteAddress || '—'}</p>
              <button onClick={() => handleDossierDownload(p)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-lg transition-colors">
                <Download size={13} /> Dossier PDF डाऊनलोड
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>📋 Note:</strong> PDF exports मध्ये Company Header, Date, Project Details, Table, आणि Total Amount automatically येतो.
        Excel exports मध्ये सर्व Columns editable असतात.
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="p-5 pt-3 min-h-screen bg-slate-50 relative">
      <Toast toast={toast} />

      {/* Content based on active tab */}
      {activeTab === 'custom' && renderCustom()}
      {activeTab === 'datewise' && renderDatewise()}
      {activeTab === 'projectwise' && renderProjectwise()}
      {activeTab === 'export' && renderExport()}
    </div>
  );
};

export default ReportsModule;
