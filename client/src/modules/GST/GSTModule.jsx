// MODULE 18: GST AND TAXATION
import React, { useState } from 'react';
import { Percent, Download, FileText, CheckCircle, Calculator, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, calculateGST } from '../../utils/formatters';
import { generateRABillPDF, generatePDFReport } from '../../services/exportService';
import { COMPANY_DETAILS } from '../../utils/constants';

export const GSTModule = () => {
  const { raBills, projects, clients } = useERPData();
  const [selectedBill, setSelectedBill] = useState(null);

  // Compute GST Totals
  const totalTaxable = raBills.reduce((acc, b) => acc + (b.taxableSubtotal || b.currentBillAmount || 0), 0);
  const totalCGST = raBills.reduce((acc, b) => acc + (b.cgst || 0), 0);
  const totalSGST = raBills.reduce((acc, b) => acc + (b.sgst || 0), 0);
  const totalTaxOutput = totalCGST + totalSGST;

  const handleDownloadInvoicePDF = (bill) => {
    const proj = projects.find(p => p.id === bill.projectId);
    const cli = clients.find(c => c.id === bill.clientId);
    generateRABillPDF(bill, proj, cli);
  };

  const invoiceColumns = [
    { key: 'billNumber', header: 'Tax Invoice / RA No', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.billNumber}</span> },
    { key: 'date', header: 'Invoice Date', render: (row) => <span className="font-mono text-slate-300 text-[11px]">{formatDate(row.date)}</span> },
    {
      key: 'client',
      header: 'Billed Party (Client)',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.clientName}</span>
          <span className="text-[11px] text-slate-400 font-mono">GSTIN: 27AABFT9988D1ZR</span>
        </div>
      )
    },
    { key: 'taxableSubtotal', header: 'Taxable Value', align: 'right', render: (row) => <span className="font-bold font-mono text-white">{formatCurrency(row.taxableSubtotal || row.currentBillAmount)}</span> },
    { key: 'cgst', header: 'CGST (9%)', align: 'right', render: (row) => <span className="font-mono text-slate-300">{formatCurrency(row.cgst)}</span> },
    { key: 'sgst', header: 'SGST (9%)', align: 'right', render: (row) => <span className="font-mono text-slate-300">{formatCurrency(row.sgst)}</span> },
    { key: 'netPayable', header: 'Total Invoice Value', align: 'right', render: (row) => <span className="font-bold text-emerald-400 font-mono">{formatCurrency(row.netPayable)}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'GST Invoice',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => handleDownloadInvoicePDF(row)}
          className="px-3 py-1 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto shadow-2xs cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>GST PDF</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">GST & Statutory Taxation Management</h2>
          <p className="text-xs text-slate-400">
            GSTIN compliance, CGST 9% + SGST 9% / IGST 18% civil works calculations, and GSTR-1 output registers.
          </p>
        </div>
      </div>

      {/* GSTIN Company Compliance Card */}
      <div className="bg-gradient-to-r from-[#17202b] via-[#141922] to-[#12151b] p-5 rounded-2xl border border-gold-400/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-gold-400 uppercase tracking-wider font-bold">Maharashtra GST Jurisdiction</span>
          <h3 className="text-lg font-bold text-white font-heading mt-0.5">{COMPANY_DETAILS.name}</h3>
          <p className="text-xs text-slate-300 font-mono mt-1">
            Company GSTIN: <strong className="text-gold-400 font-bold">{COMPANY_DETAILS.gstin}</strong> • PAN: {COMPANY_DETAILS.pan}
          </p>
          <p className="text-[11px] text-slate-400">Registered: Kolhapur Circle, Maharashtra, India</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-right">
          <div className="p-3 bg-[#13171f] rounded-xl border border-[#252c38]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Output GST (Collected)</span>
            <span className="text-base font-bold font-mono text-emerald-400">{formatCurrency(totalTaxOutput)}</span>
          </div>
          <div className="p-3 bg-[#13171f] rounded-xl border border-[#252c38]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Taxable Turnover</span>
            <span className="text-base font-bold font-mono text-white">{formatCurrency(totalTaxable)}</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={invoiceColumns}
        data={raBills}
        searchKey="billNumber"
        searchPlaceholder="Search invoices by RA number, client name..."
        exportFileName="Sanmati_GST_Invoices"
      />
    </div>
  );
};
