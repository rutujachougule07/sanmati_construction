// MODULE 2: ACCOUNT MANAGEMENT
import React, { useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Calendar, Plus, CheckCircle, FileText } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AccountsModule = () => {
  const { clients, vendors, raBills } = useERPData();
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, clientLedger, vendorLedger
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Financial transactions ledger
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-2026-101",
      date: "2026-10-20",
      account: "HDFC Current A/c - 501002",
      type: "Receipt",
      party: "Tarabai Heights Developers LLP",
      category: "RA Bill 01 Settlement",
      debit: 10000000,
      credit: 0,
      balance: 24500000,
      reference: "NEFT/HDFC/99210",
      status: "Reconciled"
    },
    {
      id: "TXN-2026-102",
      date: "2026-10-22",
      account: "HDFC Current A/c - 501002",
      type: "Payment",
      party: "Rajaram Steel & Tubes Kolhapur",
      category: "Material Purchase Payment",
      debit: 0,
      credit: 1220000,
      balance: 23280000,
      reference: "RTGS/HDFC/88123",
      status: "Reconciled"
    },
    {
      id: "TXN-2026-103",
      date: "2026-10-25",
      account: "SBI Project A/c - 302918",
      type: "Payment",
      party: "Kolhapur Earthmovers & JCB",
      category: "Excavation Subcontractor Bill",
      debit: 0,
      credit: 450000,
      balance: 14200000,
      reference: "IMPS/SBI/77192",
      status: "Reconciled"
    },
    {
      id: "TXN-2026-104",
      date: "2026-10-28",
      account: "HDFC Current A/c - 501002",
      type: "Receipt",
      party: "D. Y. Patil Education Society",
      category: "Mobilization Advance",
      debit: 5000000,
      credit: 0,
      balance: 28280000,
      reference: "NEFT/ICIC/55410",
      status: "Reconciled"
    }
  ]);

  const [formData, setFormData] = useState({
    account: 'HDFC Current A/c - 501002',
    type: 'Receipt',
    party: '',
    category: 'Client Billing',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleRecordTransaction = (e) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    const newTxn = {
      id: `TXN-${Date.now()}`,
      date: formData.date,
      account: formData.account,
      type: formData.type,
      party: formData.party,
      category: formData.category,
      debit: formData.type === 'Receipt' ? amt : 0,
      credit: formData.type === 'Payment' ? amt : 0,
      balance: 25000000 + (formData.type === 'Receipt' ? amt : -amt),
      reference: formData.reference || `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Pending Reconciliation'
    };
    setTransactions([newTxn, ...transactions]);
    setIsModalOpen(false);
  };

  const txnColumns = [
    { key: 'date', header: 'Date', render: (row) => <span className="text-slate-300 font-mono text-[11px]">{formatDate(row.date)}</span> },
    { key: 'id', header: 'Voucher No', render: (row) => <span className="font-bold text-gold-400">{row.id}</span> },
    {
      key: 'party',
      header: 'Particulars / Account',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.party}</span>
          <span className="text-[11px] text-slate-400">{row.category} • {row.account}</span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          row.type === 'Receipt' ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/40' : 'bg-rose-950/70 text-rose-400 border border-rose-700/40'
        }`}>
          {row.type}
        </span>
      )
    },
    {
      key: 'debit',
      header: 'Debit (Receipt)',
      align: 'right',
      render: (row) => <span className="font-mono text-emerald-400 font-semibold">{row.debit > 0 ? formatCurrency(row.debit) : '—'}</span>
    },
    {
      key: 'credit',
      header: 'Credit (Payment)',
      align: 'right',
      render: (row) => <span className="font-mono text-rose-400 font-semibold">{row.credit > 0 ? formatCurrency(row.credit) : '—'}</span>
    },
    {
      key: 'reference',
      header: 'Bank Ref',
      render: (row) => <span className="font-mono text-[11px] text-slate-400">{row.reference}</span>
    },
    {
      key: 'status',
      header: 'Reconciliation',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Accounts & Financial Ledger</h2>
          <p className="text-xs text-slate-400">Cashbook, bank accounts, vouchers, client receivables, and vendor payables.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'transactions' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            General Ledger ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('clientLedger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'clientLedger' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Client Debtors ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('vendorLedger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'vendorLedger' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Vendor Creditors ({vendors.length})
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Voucher</span>
          </button>
        </div>
      </div>

      {/* Account Balances Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>HDFC Bank (Current A/c - 501002)</span>
            <Landmark className="w-4 h-4 text-gold-400" />
          </div>
          <h3 className="text-2xl font-bold text-white font-heading font-mono">₹2,82,80,000.00</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">Active • Primary Operational A/c</span>
        </div>

        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Receivables (Debtors)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 font-heading font-mono">
            {formatCurrency(clients.reduce((acc, c) => acc + (c.outstanding || 0), 0))}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Pending across {clients.length} clients</span>
        </div>

        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Payables (Creditors)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-rose-400 font-heading font-mono">
            {formatCurrency(vendors.reduce((acc, v) => acc + (v.outstandingBalance || 0), 0))}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Due to suppliers & subcontractors</span>
        </div>
      </div>

      {/* Main Ledger Table */}
      {activeTab === 'transactions' && (
        <DataTable
          columns={txnColumns}
          data={transactions}
          searchKey="party"
          searchPlaceholder="Search vouchers by party, category, bank reference..."
          exportFileName="Sanmati_Financial_Transactions"
        />
      )}

      {activeTab === 'clientLedger' && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-white font-heading mb-4">Sundry Debtors (Client Accounts)</h3>
          <div className="space-y-3">
            {clients.map(cli => (
              <div key={cli.id} className="p-3.5 bg-[#14181f] rounded-xl border border-[#242b37] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{cli.name}</h4>
                  <p className="text-xs text-slate-400">Total Billed to Date: {formatCurrency(cli.totalBilled)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Outstanding Balance</p>
                  <p className={`text-base font-bold font-mono ${cli.outstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(cli.outstanding)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'vendorLedger' && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg">
          <h3 className="text-base font-bold text-white font-heading mb-4">Sundry Creditors (Vendor & Subcontractor Accounts)</h3>
          <div className="space-y-3">
            {vendors.map(vnd => (
              <div key={vnd.id} className="p-3.5 bg-[#14181f] rounded-xl border border-[#242b37] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{vnd.name}</h4>
                  <p className="text-xs text-slate-400">Category: {vnd.category} • Total Purchases: {formatCurrency(vnd.totalPurchase)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Amount Payable</p>
                  <p className="text-base font-bold text-rose-400 font-mono">
                    {formatCurrency(vnd.outstandingBalance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Financial Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Financial Voucher"
        subtitle="Create a new payment or receipt entry for the accounting ledger"
      >
        <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Voucher Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="erp-input font-bold"
              >
                <option value="Receipt">Receipt (Incoming Funds / Client Payment)</option>
                <option value="Payment">Payment (Outgoing / Vendor / Expense)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Transaction Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Party / Ledger Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tarabai Heights Developers LLP / Rajaram Steels"
              value={formData.party}
              onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bank Account</label>
              <select
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="erp-input"
              >
                <option value="HDFC Current A/c - 501002">HDFC Current A/c - 501002</option>
                <option value="SBI Project A/c - 302918">SBI Project A/c - 302918</option>
                <option value="ICICI Escrow A/c - 067801">ICICI Escrow A/c - 067801</option>
                <option value="Petty Cash Kawala Naka">Petty Cash Kawala Naka</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount (INR ₹) *</label>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category / Head</label>
              <input
                type="text"
                placeholder="e.g. RA Bill Settlement / Cement Bill"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bank Ref / UTR / Cheque No</label>
              <input
                type="text"
                placeholder="UTR / Cheque No"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="erp-input font-mono"
              />
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
              Post Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
