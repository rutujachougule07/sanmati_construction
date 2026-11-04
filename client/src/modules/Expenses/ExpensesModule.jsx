// MODULE 14: EXPENSE MANAGEMENT
import React, { useState } from 'react';
import { Receipt, Plus, DollarSign, Calendar, FileText, CheckCircle, Upload, ShieldCheck, Download } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ExpensesModule = () => {
  const { expenses, setExpenses, projects } = useERPData();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Site Fuel & Diesel',
    projectId: projects[0]?.id || 'PRJ-KLP-001',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    paymentMode: 'Bank Transfer'
  });

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formData.projectId);
    const newExp = {
      id: `EXP-${Date.now()}`,
      category: formData.category,
      projectId: formData.projectId,
      projectName: proj ? proj.name : 'Civil Site',
      amount: Number(formData.amount),
      date: formData.date,
      paidTo: formData.paidTo,
      paymentMode: formData.paymentMode,
      claimedBy: currentUser?.name || 'Staff Member',
      status: 'Submitted',
      receiptUrl: 'voucher_receipt.pdf'
    };
    setExpenses([newExp, ...expenses]);
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'date', header: 'Expense Date', render: (row) => <span className="font-mono text-slate-300 text-[11px]">{formatDate(row.date)}</span> },
    { key: 'id', header: 'Claim ID', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.id}</span> },
    {
      key: 'category',
      header: 'Category & Project',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.category}</span>
          <span className="text-[11px] text-slate-400">{row.projectName}</span>
        </div>
      )
    },
    { key: 'paidTo', header: 'Paid To Vendor / Beneficiary', render: (row) => <span className="text-slate-300">{row.paidTo}</span> },
    { key: 'amount', header: 'Amount Claimed', align: 'right', render: (row) => <span className="font-bold text-rose-400 font-mono">{formatCurrency(row.amount)}</span> },
    { key: 'claimedBy', header: 'Claimed By', render: (row) => <span className="text-slate-300 text-xs">{row.claimedBy}</span> },
    { key: 'status', header: 'Approval', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Expense & Site Reimbursement Management</h2>
          <p className="text-xs text-slate-400">Track petty cash, diesel, equipment repairs, permits, and staff claims.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="erp-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Claim Expense</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        searchKey="category"
        searchPlaceholder="Search expenses by category, vendor, project..."
        exportFileName="Sanmati_Expenses_List"
      />

      {/* Claim Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Project Site Expense Claim"
        subtitle="Record petty cash, site fuel or municipal fee vouchers for approval"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Expense Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="erp-input font-bold"
              >
                <option value="Site Fuel & Diesel">Site Fuel & Diesel (Generators/JCB)</option>
                <option value="Site Refreshment & Labour Amenities">Site Refreshment & Labour Tea</option>
                <option value="Machinery Maintenance & Repair">Machinery Maintenance & Repair</option>
                <option value="Municipal Statutory Inspection Fee">Municipal Statutory Fees & Testing</option>
                <option value="Safety Gear & Personal Protective Equipment">Safety Helmets & Harnesses</option>
                <option value="Travel & Conveyance">Staff Site Conveyance</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Charge to Project *</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="erp-input font-bold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount Incurred (INR ₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date of Expense *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Paid To (Vendor / Station) *</label>
              <input
                type="text"
                required
                placeholder="e.g. BPCL Petrol Pump Kawala Naka"
                value={formData.paidTo}
                onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="erp-input"
              >
                <option value="Petty Cash">Petty Cash Imprest</option>
                <option value="Bank Transfer">Bank Transfer / UPI</option>
                <option value="Cheque">Company Cheque</option>
                <option value="Personal Paid (Reimburse Me)">Personal Paid (Reimburse Me)</option>
              </select>
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
              Submit Expense Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
