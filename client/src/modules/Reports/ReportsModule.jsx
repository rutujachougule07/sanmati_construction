// MODULE 5: CUSTOM REPORTS - Active Subcategories Implementation
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Download, Calendar, Building, Users, Printer, Eye, 
  FileSpreadsheet, Filter, CheckCircle2, ArrowRight, TrendingUp, DollarSign 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { generatePDFReport, exportToExcel, exportToCSV } from '../../services/exportService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DatePicker } from '../../components/DatePicker';

export const ReportsModule = () => {
  const { projects, clients, vendors, raBills, expenses, hrmsEmployees } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'custom';

  const [reportType, setReportType] = useState('projectBilling');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-12-31' });

  // Generate Report Dataset dynamically
  const getReportData = (type = reportType, projId = selectedProjectId) => {
    switch (type) {
      case 'projectBilling': {
        const filtered = raBills.filter(b => projId === 'ALL' || b.projectId === projId);
        return {
          title: "PROJECT BILLING & RA BILLS REPORT",
          headers: ["Bill No", "Date", "Project Name", "Client", "Gross Amount", "Retention (5%)", "GST", "Net Claimed"],
          rows: filtered.map(b => [
            b.billNumber,
            formatDate(b.date),
            b.projectName || '—',
            b.clientName || '—',
            formatCurrency(b.currentBillAmount),
            formatCurrency(b.retentionAmount),
            formatCurrency((b.cgst || 0) + (b.sgst || 0)),
            formatCurrency(b.netPayable)
          ]),
          raw: filtered
        };
      }
      case 'projectProfitability': {
        const filtered = projects.filter(p => projId === 'ALL' || p.id === projId);
        return {
          title: "PROJECT COSTING & PROFITABILITY REPORT",
          headers: ["Project Code", "Project Name", "Contract Value", "Approved Budget", "Actual Cost", "Billed Amount", "Actual Profit", "% Margin"],
          rows: filtered.map(p => [
            p.id,
            p.name,
            formatCurrency(p.contractValue),
            formatCurrency(p.projectBudget),
            formatCurrency(p.actualExpenditure),
            formatCurrency(p.billedAmount),
            formatCurrency(p.actualProfit),
            p.billedAmount ? `${((p.actualProfit / p.billedAmount) * 100).toFixed(1)}%` : '0%'
          ]),
          raw: filtered
        };
      }
      case 'vendorExpenses': {
        return {
          title: "VENDOR OUTSTANDING & PAYMENTS REPORT",
          headers: ["Vendor ID", "Vendor Name", "Category", "GSTIN", "Total Orders", "Paid to Date", "Outstanding Due"],
          rows: vendors.map(v => [
            v.id,
            v.name,
            v.category,
            v.gstin,
            formatCurrency(v.totalPurchase),
            formatCurrency(v.paidAmount),
            formatCurrency(v.outstandingBalance)
          ]),
          raw: vendors
        };
      }
      case 'employeeSalaries': {
        return {
          title: "EMPLOYEE PAYROLL & SALARY SUMMARY",
          headers: ["Emp ID", "Employee Name", "Designation", "Department", "Basic Pay", "HRA", "PF Deduct", "Net Pay"],
          rows: hrmsEmployees.map(e => [
            e.id,
            e.name,
            e.designation,
            e.department,
            formatCurrency(e.basicSalary),
            formatCurrency(e.hra),
            formatCurrency(e.pfDeduction),
            formatCurrency(e.netSalary)
          ]),
          raw: hrmsEmployees
        };
      }
      default:
        return { title: 'Report', headers: [], rows: [], raw: [] };
    }
  };

  const reportData = getReportData(reportType, selectedProjectId);

  const handleExportPDF = (type = reportType, projId = selectedProjectId) => {
    const data = getReportData(type, projId);
    generatePDFReport({
      title: data.title,
      subtitle: `SANMATI CONSTRUCTIONS | Kolhapur, Maharashtra | Date: ${formatDate(new Date().toISOString())}`,
      headers: data.headers,
      rows: data.rows,
      fileName: `Sanmati_${type}_Report`,
      orientation: type === 'projectProfitability' ? 'landscape' : 'portrait'
    });
  };

  const handleExportExcel = (type = reportType, projId = selectedProjectId) => {
    const data = getReportData(type, projId);
    exportToExcel(data.raw, `Sanmati_${type}_Report`);
  };

  const handleExportCSV = (type = reportType, projId = selectedProjectId) => {
    const data = getReportData(type, projId);
    exportToCSV(data.raw, `Sanmati_${type}_Report`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: CUSTOM REPORT GENERATION */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                5. Custom Reports • Subsection (i)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Custom Report Generation
              </h2>
              <p className="text-xs text-slate-500">Configure parameters, select templates, and preview live reports.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportPDF()}
                className="erp-btn-primary text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => handleExportExcel()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Criteria Filter Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Select Report Template</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="erp-input font-medium"
              >
                <option value="projectBilling">RA Billing & Revenue Report</option>
                <option value="projectProfitability">Project Costing & Profitability</option>
                <option value="vendorExpenses">Vendor Dues & Supplier Statement</option>
                <option value="employeeSalaries">HRMS Employee Payroll Report</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Project Site Filter</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="erp-input"
              >
                <option value="ALL">All Projects (Kolhapur & Sangli)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Financial Year</label>
              <select className="erp-input">
                <option>FY 2026 - 2027 (Active)</option>
                <option>FY 2025 - 2026</option>
              </select>
            </div>
          </div>

          {/* Live Report Preview Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{reportData.title}</h4>
                <span className="text-[11px] text-slate-500">Total Entries: {reportData.rows.length}</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Live Data Synchronized
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    {reportData.headers.map((h, i) => (
                      <th key={i} className="p-3 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-slate-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DATE-WISE REPORTS */}
      {activeTab === 'datewise' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                5. Custom Reports • Subsection (ii)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Date-Wise Reports & Audits
              </h2>
              <p className="text-xs text-slate-500">View daily billing, material transactions, and labor activity logs.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportPDF('projectBilling')}
                className="erp-btn-primary text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Daily Log PDF</span>
              </button>
            </div>
          </div>

          {/* Date Picker Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold text-xs">From:</span>
                <DatePicker
                  value={dateRange.from}
                  onChange={(val) => setDateRange({ ...dateRange, from: val })}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold text-xs">To:</span>
                <DatePicker
                  value={dateRange.to}
                  onChange={(val) => setDateRange({ ...dateRange, to: val })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Quick Range:</span>
              {['Today', 'This Week', 'This Month', 'All Time'].map((tag) => (
                <button
                  key={tag}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 font-medium text-[11px] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Date-wise Transactions Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Chronological Transactions & Bills</h4>
              <span className="text-[11px] text-slate-500 font-medium">{raBills.length} Billing Events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700">Date</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700">Reference / Bill</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700">Project Site</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700">Client / Party</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700 text-right">Gross (INR)</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700 text-right">Net Payable</th>
                    <th className="p-3 uppercase text-[11px] font-bold text-slate-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {raBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{formatDate(b.date)}</td>
                      <td className="p-3 font-mono font-bold text-red-600">{b.billNumber}</td>
                      <td className="p-3 text-slate-700 font-medium">{b.projectName}</td>
                      <td className="p-3 text-slate-600">{b.clientName}</td>
                      <td className="p-3 text-right font-mono text-slate-900">{formatCurrency(b.currentBillAmount)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(b.netPayable)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {b.status || 'Certified'}
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

      {/* SECTION 3: PROJECT-WISE REPORTS */}
      {activeTab === 'projectwise' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              5. Custom Reports • Subsection (iii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Project-Wise Reports & Profitability
            </h2>
            <p className="text-xs text-slate-500">Site-level financial overview, contract values, and actual expenditure.</p>
          </div>

          {/* Project Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((p) => {
              const billedPct = p.contractValue ? Math.round((p.billedAmount / p.contractValue) * 100) : 0;
              return (
                <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {p.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">{p.name}</h3>
                      <p className="text-[11px] text-slate-500">{p.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[10px]">Contract Value</span>
                      <div className="font-bold text-slate-900 font-mono">{formatCurrency(p.contractValue)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Billed to Date</span>
                      <div className="font-bold text-emerald-600 font-mono">{formatCurrency(p.billedAmount)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Actual Cost</span>
                      <div className="font-bold text-rose-600 font-mono">{formatCurrency(p.actualExpenditure)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Net Profit</span>
                      <div className="font-bold text-emerald-700 font-mono">{formatCurrency(p.actualProfit)}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Billing Completion</span>
                      <span className="font-bold text-slate-800">{billedPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${Math.min(billedPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleExportPDF('projectProfitability', p.id)}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Project Dossier</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: EXCEL / PDF EXPORT OPTIONS */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
              5. Custom Reports • Subsection (iv)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Excel & PDF Export Options Center
            </h2>
            <p className="text-xs text-slate-500">Download certified statements, audit files, and balance sheets in one click.</p>
          </div>

          {/* Export Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Billing & Revenue Statement */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">RA Billing & Revenue Statement</h3>
                  <p className="text-[11px] text-slate-500">All certified client running account bills, retentions & GST</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('projectBilling')}
                  className="flex-1 erp-btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleExportExcel('projectBilling')}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCSV('projectBilling')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Card 2: Costing & Profitability Dossier */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Project Costing & Profitability Dossier</h3>
                  <p className="text-[11px] text-slate-500">Contract value vs approved budgets vs booked profit</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('projectProfitability')}
                  className="flex-1 erp-btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleExportExcel('projectProfitability')}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCSV('projectProfitability')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Card 3: Vendor Payments & Ledger */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Vendor Dues & Supplier Statement</h3>
                  <p className="text-[11px] text-slate-500">Total steel/cement purchases, paid amounts & aging dues</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('vendorExpenses')}
                  className="flex-1 erp-btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleExportExcel('vendorExpenses')}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCSV('vendorExpenses')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Card 4: HRMS Payroll & Staff Salaries */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">HRMS Payroll & Salary Register</h3>
                  <p className="text-[11px] text-slate-500">Employee monthly CTC, Basic, HRA, PF and Net Pay</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleExportPDF('employeeSalaries')}
                  className="flex-1 erp-btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => handleExportExcel('employeeSalaries')}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportCSV('employeeSalaries')}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
