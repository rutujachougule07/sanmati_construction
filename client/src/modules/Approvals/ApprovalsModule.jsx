// MODULE 16: APPROVAL MANAGEMENT
import React, { useState } from 'react';
import { CheckSquare, CheckCircle, XCircle, Clock, FileText, User, MessageSquare, AlertCircle } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ApprovalsModule = () => {
  const { approvals, updateApprovalStatus } = useERPData();
  const { currentUser } = useAuth();

  const [filterType, setFilterType] = useState('ALL');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [decisionComments, setDecisionComments] = useState('');

  const filteredApprovals = filterType === 'ALL' 
    ? approvals 
    : approvals.filter(a => a.type.toLowerCase().includes(filterType.toLowerCase()));

  const handleDecision = (status) => {
    if (!selectedApproval) return;
    updateApprovalStatus(
      selectedApproval.id, 
      status, 
      decisionComments || `${status} by authorized approver`, 
      currentUser?.name || 'Managing Director'
    );
    setSelectedApproval(null);
    setDecisionComments('');
  };

  const columns = [
    { key: 'date', header: 'Submitted Date', render: (row) => <span className="font-mono text-slate-300 text-[11px]">{formatDate(row.date)}</span> },
    { key: 'id', header: 'Request ID', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.id}</span> },
    {
      key: 'type',
      header: 'Workflow Type',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1f2633] text-gold-400 border border-[#2b3547] uppercase tracking-wider">
          {row.type}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Request Description & Title',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-[11px] text-slate-400">Initiator: {row.requester}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Claim / Bill Value',
      align: 'right',
      render: (row) => <span className="font-bold text-emerald-400 font-mono">{row.amount > 0 ? formatCurrency(row.amount) : 'N/A'}</span>
    },
    { key: 'status', header: 'Workflow Stage', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => { setSelectedApproval(row); setDecisionComments(''); }}
          className="px-3 py-1 bg-[#002046] hover:bg-[#001736] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
        >
          Review & Authorize
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Multi-Tier Approval Management</h2>
          <p className="text-xs text-slate-500">
            Authorization gateway for Quotations, Tenders, POs, Site Material Requests, RA Bills, and Leave.
          </p>
        </div>

        {/* Filter by Approval Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'RA bill', 'Purchase order', 'Material request', 'Expense', 'Leave request'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === cat ? 'bg-[#002046] text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Approvals' : cat}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredApprovals}
        searchKey="title"
        searchPlaceholder="Search approvals by title, requester, type..."
        exportFileName="Sanmati_Approvals_Workflow"
      />

      {/* Decision & History Modal */}
      {selectedApproval && (
        <Modal
          isOpen={Boolean(selectedApproval)}
          onClose={() => setSelectedApproval(null)}
          title={`Review Request: ${selectedApproval.title}`}
          subtitle={`Type: ${selectedApproval.type} | Current Stage: ${selectedApproval.status}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Submitted By:</span>
                <span className="text-slate-900 font-bold">{selectedApproval.requester}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Financial Value:</span>
                <span className="text-emerald-700 font-bold font-mono text-sm">
                  {selectedApproval.amount > 0 ? formatCurrency(selectedApproval.amount) : 'Non-financial'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Initial Comments:</span>
                <span className="text-slate-800 font-medium">{selectedApproval.comments || '—'}</span>
              </div>
            </div>

            {/* Complete Audit History Timeline */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#002046]" />
                <span>Workflow Audit Trail</span>
              </h5>
              <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                {selectedApproval.history?.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#002046] mt-1.5 flex-shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{h.step}</p>
                      <p className="text-[11px] text-slate-500">{h.user} • {h.date}</p>
                      {h.comments && <p className="text-[11px] text-slate-600 italic">"{h.comments}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Input */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Approver Remarks / Technical Verification Notes:
              </label>
              <textarea
                rows={2}
                placeholder="Enter remarks, measurement sheet verification, or reason for decision..."
                value={decisionComments}
                onChange={(e) => setDecisionComments(e.target.value)}
                className="erp-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleDecision('Rejected')}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
              <button
                type="button"
                onClick={() => handleDecision('Approved')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Authorize & Approve</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
