// MODULE 8: QUOTATION MANAGEMENT
import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Download, CheckCircle, Percent, DollarSign, Calculator } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generatePDFReport } from '../../services/exportService';

export const QuotationsModule = () => {
  const { quotations, setQuotations, clients } = useERPData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuo, setSelectedQuo] = useState(null);

  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || 'CLI-004',
    projectTitle: '',
    materialCost: 0,
    labourCost: 0,
    equipmentCost: 0,
    subcontractorCost: 0,
    otherCost: 0,
    profitMarginPercent: 15,
    discountAmount: 0,
    validDays: 30
  });

  const baseCost = Number(formData.materialCost) + Number(formData.labourCost) + 
                   Number(formData.equipmentCost) + Number(formData.subcontractorCost) + 
                   Number(formData.otherCost);
  const marginAmt = (baseCost * Number(formData.profitMarginPercent)) / 100;
  const subtotal = Math.max(0, baseCost + marginAmt - Number(formData.discountAmount));
  const gst = subtotal * 0.18;
  const totalValue = subtotal + gst;

  const handleCreateQuotation = (e) => {
    e.preventDefault();
    const clientObj = clients.find(c => c.id === formData.clientId) || clients[0];
    const newQuo = {
      id: `QUO-${Date.now()}`,
      quotationNo: `SC/QUO/2026/0${quotations.length + 46}`,
      clientId: formData.clientId,
      clientName: clientObj.name,
      projectTitle: formData.projectTitle,
      createdDate: new Date().toISOString().split('T')[0],
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      materialCost: Number(formData.materialCost),
      labourCost: Number(formData.labourCost),
      equipmentCost: Number(formData.equipmentCost),
      subcontractorCost: Number(formData.subcontractorCost),
      otherCost: Number(formData.otherCost),
      profitMarginPercent: Number(formData.profitMarginPercent),
      profitMarginAmount: marginAmt,
      discountAmount: Number(formData.discountAmount),
      subtotal,
      gstRate: 18,
      gstAmount: gst,
      totalQuotationValue: totalValue,
      status: 'Submitted'
    };
    setQuotations([newQuo, ...quotations]);
    setIsModalOpen(false);
  };

  const handleDownloadQuoPDF = (quo) => {
    generatePDFReport({
      title: `ESTIMATED CIVIL WORK QUOTATION`,
      subtitle: `Quotation No: ${quo.quotationNo} | Client: ${quo.clientName} | Valid Till: ${formatDate(quo.validTill)}`,
      headers: ["Cost Component", "Particulars & Scope", "Amount (INR)"],
      rows: [
        ["Material Cost", "Cement, TMT Steel, Aggregates, AAC Blocks, Plumbing/Electrical Pipes", formatCurrency(quo.materialCost)],
        ["Labour Cost", "Bar benders, masons, carpenters, scaffolding crew & helper wages", formatCurrency(quo.labourCost)],
        ["Plant & Equipment", "Tower crane, concrete pump, batching plant, vibrator diesel charges", formatCurrency(quo.equipmentCost)],
        ["Subcontractor Civil", "Earthwork excavation, specialized waterproofing & pre-cast works", formatCurrency(quo.subcontractorCost)],
        ["Site Overheads", "Municipal testing permits, site office electric, security & insurances", formatCurrency(quo.otherCost)],
        ["Profit Margin", `Contractor margin assessed at ${quo.profitMarginPercent}%`, formatCurrency(quo.profitMarginAmount)],
        ["Less: Discount", "Commercial volume discount", `-${formatCurrency(quo.discountAmount)}`],
        ["Taxable Subtotal", "Net contractor fee base", formatCurrency(quo.subtotal)],
        ["GST @ 18%", "CGST 9% + SGST 9% (Intra-state Maharashtra)", formatCurrency(quo.gstAmount)],
        ["TOTAL QUOTATION VALUE", "All-inclusive contract estimated amount", formatCurrency(quo.totalQuotationValue)]
      ],
      fileName: `Quotation_${quo.quotationNo.replace(/\//g, '_')}`
    });
  };

  const columns = [
    { key: 'quotationNo', header: 'Quotation No', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.quotationNo}</span> },
    {
      key: 'projectTitle',
      header: 'Project Title & Client',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.projectTitle}</span>
          <span className="text-[11px] text-slate-400">{row.clientName}</span>
        </div>
      )
    },
    { key: 'createdDate', header: 'Created', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{formatDate(row.createdDate)}</span> },
    { key: 'validTill', header: 'Valid Till', render: (row) => <span className="text-slate-300 font-mono text-[11px]">{formatDate(row.validTill)}</span> },
    { key: 'totalQuotationValue', header: 'Total Value', align: 'right', render: (row) => <span className="font-bold text-emerald-400 font-mono">{formatCurrency(row.totalQuotationValue)}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Export',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => handleDownloadQuoPDF(row)}
          className="px-2.5 py-1 bg-[#222a36] hover:bg-gold-400 hover:text-black rounded text-[11px] font-semibold transition-colors flex items-center gap-1 mx-auto"
        >
          <Download className="w-3 h-3" />
          <span>PDF</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Quotation & BOQ Estimations</h2>
          <p className="text-xs text-slate-400">Generate commercial civil quotations with itemized material, labour, margins & GST.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="erp-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Prepare Quotation</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        searchKey="quotationNo"
        searchPlaceholder="Search quotations by number, client, project..."
        exportFileName="Sanmati_Quotations_List"
      />

      {/* Prepare Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Prepare Client Quotation"
        subtitle="Automatic calculation of materials, labour, equipment, profit margin, and GST"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="erp-input font-bold"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Project Proposal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Commercial Finishing & RCC Construction Phase 2"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="p-4 bg-[#14181f] rounded-xl border border-[#252c38] space-y-3">
            <h5 className="font-bold text-gold-400 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" />
              <span>BOQ Cost Breakdown (INR ₹)</span>
            </h5>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Material Cost</label>
                <input
                  type="number"
                  min="0"
                  value={formData.materialCost}
                  onChange={(e) => setFormData({ ...formData, materialCost: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Labour Cost</label>
                <input
                  type="number"
                  min="0"
                  value={formData.labourCost}
                  onChange={(e) => setFormData({ ...formData, labourCost: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Plant & Machinery</label>
                <input
                  type="number"
                  min="0"
                  value={formData.equipmentCost}
                  onChange={(e) => setFormData({ ...formData, equipmentCost: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subcontractor Charges</label>
                <input
                  type="number"
                  min="0"
                  value={formData.subcontractorCost}
                  onChange={(e) => setFormData({ ...formData, subcontractorCost: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Other Site Overheads</label>
                <input
                  type="number"
                  min="0"
                  value={formData.otherCost}
                  onChange={(e) => setFormData({ ...formData, otherCost: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Commercial Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                  className="erp-input font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-medium">Profit Margin Percentage:</span>
                <span className="font-bold text-gold-400 font-mono">{formData.profitMarginPercent}% ({formatCurrency(marginAmt)})</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={formData.profitMarginPercent}
                onChange={(e) => setFormData({ ...formData, profitMarginPercent: Number(e.target.value) })}
                className="w-full accent-gold-400"
              />
            </div>
          </div>

          {/* Computed Summary Preview */}
          <div className="bg-[#101318] p-4 rounded-xl border border-gold-400/30 flex items-center justify-between">
            <div className="space-y-0.5 text-slate-400">
              <p>Base Cost: <span className="font-mono text-white">{formatCurrency(baseCost)}</span></p>
              <p>Subtotal (Excl. Tax): <span className="font-mono text-white">{formatCurrency(subtotal)}</span></p>
              <p>GST @ 18%: <span className="font-mono text-white">{formatCurrency(gst)}</span></p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Quotation Value</span>
              <span className="text-2xl font-bold text-gold-400 font-mono">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Generate Quotation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
