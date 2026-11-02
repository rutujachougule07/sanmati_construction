// MODULE 5: CUSTOM REPORTS
import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, Building, Users, Printer, Eye } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { generatePDFReport, exportToExcel, exportToCSV } from '../../services/exportService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ReportsModule = () => {
  const { projects, clients, vendors, raBills, expenses, hrmsEmployees } = useERPData();

  const [reportType, setReportType] = useState('projectBilling');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2027-12-31' });

  // Generate Report Dataset dynamically
  const getReportData = () => {
    switch (reportType) {
      case 'projectBilling': {
        const filtered = raBills.filter(b => selectedProjectId === 'ALL' || b.projectId === selectedProjectId);
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
        const filtered = projects.filter(p => selectedProjectId === 'ALL' || p.id === selectedProjectId);
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

  const reportData = getReportData();

  const handleExportPDF = () => {
    generatePDFReport({
      title: reportData.title,
      subtitle: `Sanmati Constructions ERP | Project Filter: ${selectedProjectId} | Period: ${dateRange.from} to ${dateRange.to}`,
      headers: reportData.headers,
      rows: reportData.rows,
      fileName: `Sanmati_${reportType}_Report`,
      orientation: reportType === 'projectProfitability' ? 'landscape' : 'portrait'
    });
  };

  const handleExportExcel = () => {
    exportToExcel(reportData.raw, `Sanmati_${reportType}_Report`);
  };

  const handleExportCSV = () => {
    exportToCSV(reportData.raw, `Sanmati_${reportType}_Report`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Custom Report Builder</h2>
          <p className="text-xs text-slate-400">Generate executive MIS, billing, profitability, vendor, and payroll statements.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="erp-btn-primary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="p-2 bg-[#202734] hover:bg-[#2a3443] text-emerald-400 border border-[#2e3746] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 bg-[#202734] hover:bg-[#2a3443] text-sky-400 border border-[#2e3746] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Criteria Builder Bar */}
      <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Select Report Template</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="erp-input font-bold"
          >
            <option value="projectBilling">RA Billing & Revenue Report</option>
            <option value="projectProfitability">Project Costing & Profitability</option>
            <option value="vendorExpenses">Vendor Dues & Supplier Statement</option>
            <option value="employeeSalaries">HRMS Employee Payroll Report</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Project Site Filter</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="erp-input"
          >
            <option value="ALL">All Projects (Kolhapur)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="erp-input"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="erp-input"
          />
        </div>
      </div>

      {/* Live Report Preview Container */}
      <div className="bg-[#181d25] border border-[#27303e] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#27303e] bg-[#14181f] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white font-heading">{reportData.title}</h4>
            <span className="text-[11px] text-slate-400">Total Records: {reportData.rows.length}</span>
          </div>
          <span className="text-[10px] text-gold-400 font-mono">Live Preview Mode</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#12151b] text-gold-400 border-b border-[#252c38]">
                {reportData.headers.map((h, i) => (
                  <th key={i} className="p-3 font-semibold uppercase tracking-wider text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222935]">
              {reportData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#1a202c]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-200">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
