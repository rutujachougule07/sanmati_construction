// MODULE 9: TENDER MANAGEMENT
import React, { useState } from 'react';
import { Gavel, Plus, FileText, Calendar, DollarSign, Download, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TendersModule = () => {
  const { tenders, setTenders } = useERPData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);

  const [formData, setFormData] = useState({
    tenderId: '',
    title: '',
    authority: 'Public Works Department (PWD), Division Kolhapur',
    tenderValue: '',
    emdAmount: '',
    deadline: '',
    eligibility: '',
    bidQuotationAmount: '',
    status: 'Preparation'
  });

  const handleRegisterTender = (e) => {
    e.preventDefault();
    const val = Number(formData.tenderValue);
    const emd = formData.emdAmount ? Number(formData.emdAmount) : Math.round(val * 0.01);
    const bid = formData.bidQuotationAmount ? Number(formData.bidQuotationAmount) : Math.round(val * 0.98);

    const newTender = {
      id: `TND-${Date.now()}`,
      tenderId: formData.tenderId,
      title: formData.title,
      authority: formData.authority,
      tenderValue: val,
      emdAmount: emd,
      deadline: formData.deadline,
      submissionDate: null,
      eligibility: formData.eligibility || 'Class 1A Registered Civil Contractor',
      status: formData.status,
      documents: ['TenderNotice.pdf', 'TechnicalSpecifications.pdf'],
      bidQuotationAmount: bid
    };

    setTenders([newTender, ...tenders]);
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'tenderId', header: 'Tender Ref No', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.tenderId}</span> },
    {
      key: 'title',
      header: 'Tender Title & Authority',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.title}</span>
          <span className="text-[11px] text-slate-400">{row.authority}</span>
        </div>
      )
    },
    { key: 'tenderValue', header: 'Tender Est. Value', align: 'right', render: (row) => <span className="font-semibold text-white font-mono">{formatCurrency(row.tenderValue)}</span> },
    { key: 'emdAmount', header: 'EMD (1%)', align: 'right', render: (row) => <span className="font-mono text-slate-300">{formatCurrency(row.emdAmount)}</span> },
    { key: 'bidQuotationAmount', header: 'Our Bid Amount', align: 'right', render: (row) => <span className="font-bold text-emerald-400 font-mono">{formatCurrency(row.bidQuotationAmount)}</span> },
    { key: 'deadline', header: 'Closing Deadline', render: (row) => <span className="text-rose-400 font-mono text-[11px] font-semibold">{formatDate(row.deadline)}</span> },
    { key: 'status', header: 'Stage', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedTender(row)}
          className="px-2.5 py-1 bg-[#222a36] hover:bg-gold-400 hover:text-black rounded text-[11px] font-semibold transition-colors"
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Government & Institutional Tender Management</h2>
          <p className="text-xs text-slate-400">Track PWD, KMC, MSRDC, and corporate e-tenders, deadlines, EMDs, and bid submissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="erp-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Tender</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tenders}
        searchKey="tenderId"
        searchPlaceholder="Search tenders by ref ID, authority, title..."
        exportFileName="Sanmati_Tenders_List"
      />

      {/* Tender Details Modal */}
      {selectedTender && (
        <Modal
          isOpen={Boolean(selectedTender)}
          onClose={() => setSelectedTender(null)}
          title={`Tender Details: ${selectedTender.tenderId}`}
          subtitle={selectedTender.title}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-[#14181f] p-4 rounded-xl border border-[#27303e]">
              <div>
                <span className="text-slate-400 block text-[11px]">Issuing Authority:</span>
                <span className="text-white font-semibold">{selectedTender.authority}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Status:</span>
                <StatusBadge status={selectedTender.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Project Value:</span>
                <span className="text-white font-bold font-mono text-sm">{formatCurrency(selectedTender.tenderValue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Earnest Money Deposit (EMD):</span>
                <span className="text-gold-400 font-bold font-mono">{formatCurrency(selectedTender.emdAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Deadline:</span>
                <span className="text-rose-400 font-bold">{formatDate(selectedTender.deadline)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Our Bid Quotation:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">{formatCurrency(selectedTender.bidQuotationAmount)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Contractor Eligibility Criteria:</span>
                <span className="text-slate-300">{selectedTender.eligibility}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2">Attached Tender Documents</h5>
              <div className="space-y-1.5">
                {selectedTender.documents?.map((doc, idx) => (
                  <div key={idx} className="p-2 bg-[#1b222d] rounded-lg border border-[#283241] flex items-center justify-between">
                    <span className="text-slate-200">{doc}</span>
                    <button className="text-gold-400 hover:underline flex items-center gap-1 text-[11px]">
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Tender Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Tender Opportunity"
        subtitle="Record tender details, EMD requirement, and proposed bid amount"
      >
        <form onSubmit={handleRegisterTender} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tender Ref / Notice No *</label>
              <input
                type="text"
                required
                placeholder="e.g. PWD/KLP/2026/W-108"
                value={formData.tenderId}
                onChange={(e) => setFormData({ ...formData, tenderId: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Issuing Authority *</label>
              <select
                value={formData.authority}
                onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                className="erp-input"
              >
                <option value="Public Works Department (PWD), Division Kolhapur">PWD Kolhapur</option>
                <option value="Kolhapur Municipal Corporation (KMC)">Kolhapur Municipal Corporation</option>
                <option value="Maharashtra State Road Development Corp (MSRDC)">MSRDC</option>
                <option value="Maharashtra Industrial Development Corp (MIDC)">MIDC Kolhapur</option>
                <option value="Zilla Parishad Kolhapur">Zilla Parishad Kolhapur</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Tender Work Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Construction of Concrete Box Drain & Paver Roads"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tender Value (₹) *</label>
              <input
                type="number"
                required
                min="10000"
                placeholder="0.00"
                value={formData.tenderValue}
                onChange={(e) => setFormData({ ...formData, tenderValue: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">EMD Deposit (₹)</label>
              <input
                type="number"
                placeholder="Leave blank for 1%"
                value={formData.emdAmount}
                onChange={(e) => setFormData({ ...formData, emdAmount: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Our Proposed Bid (₹)</label>
              <input
                type="number"
                placeholder="Leave blank for -2%"
                value={formData.bidQuotationAmount}
                onChange={(e) => setFormData({ ...formData, bidQuotationAmount: e.target.value })}
                className="erp-input font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Submission Deadline *</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Stage Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="erp-input"
              >
                <option value="Preparation">Preparation / Document Compilation</option>
                <option value="Under Technical Evaluation">Under Technical Evaluation</option>
                <option value="Submitted">Submitted / Bid Opened</option>
                <option value="Awarded">Awarded to SANMATI CONSTRUCTIONS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Eligibility Criteria & Turnover Clauses</label>
            <input
              type="text"
              placeholder="e.g. Class 1A PWD Contractor license, minimum 25 Cr solvency"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              className="erp-input"
            />
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
              Save Tender Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
