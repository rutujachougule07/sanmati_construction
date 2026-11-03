// MODULE 2: ACCOUNT MANAGEMENT - Active Subcategories Implementation
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Landmark, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Calendar, 
  Plus, CheckCircle, FileText, Receipt, BookOpen, BarChart3, TrendingUp 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AccountsModule = () => {
  const { clients, vendors, raBills } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'records';

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
      party: "Shri Mahalaxmi Cooperative Housing",
      category: "Mobilization Advance",
      debit: 2500000,
      credit: 0,
      balance: 25780000,
      reference: "RTGS/SBIN/55120",
      status: "Reconciled"
    }
  ]);

  // Transaction columns
  const txnColumns = [
    { key: 'date', header: 'Date', render: (row) => <span className="text-slate-800 font-semibold">{formatDate(row.date)}</span> },
    { key: 'id', header: 'Voucher No', render: (row) => <span className="font-mono font-bold text-red-600">{row.id}</span> },
    { key: 'party', header: 'Party / Ledger Description', render: (row) => <div><span className="font-bold text-slate-900 block">{row.party}</span><span className="text-[11px] text-slate-500">{row.category}</span></div> },
    { key: 'account', header: 'Bank / Cash Account', render: (row) => <span className="text-xs text-slate-700">{row.account}</span> },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          row.type === 'Receipt' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {row.type === 'Receipt' ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
          <span>{row.type}</span>
        </span>
      )
    },
    { key: 'debit', header: 'Inward / Debit', align: 'right', render: (row) => <span className="font-mono font-bold text-emerald-600">{row.debit > 0 ? formatCurrency(row.debit) : '—'}</span> },
    { key: 'credit', header: 'Outward / Credit', align: 'right', render: (row) => <span className="font-mono font-bold text-rose-600">{row.credit > 0 ? formatCurrency(row.credit) : '—'}</span> },
    { key: 'balance', header: 'Running Balance', align: 'right', render: (row) => <span className="font-mono font-bold text-slate-900">{formatCurrency(row.balance)}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* SUBSECTION 1: INCOME & EXPENSE RECORDS */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                2. Account Management • Subsection (i)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Income & Expense Records
              </h2>
              <p className="text-xs text-slate-500">Real-time inflows, client receipts, subcontractor payments, and operational vouchers.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Inflow / Outflow</span>
            </button>
          </div>

          <DataTable
            columns={txnColumns}
            data={transactions}
            searchKey="party"
            searchPlaceholder="Search transactions by party, bill, or voucher..."
          />
        </div>
      )}

      {/* SUBSECTION 2: PAYMENT TRACKING */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              2. Account Management • Subsection (ii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Payment Tracking & Aging Dues
            </h2>
            <p className="text-xs text-slate-500">Monitor client receivable deadlines and vendor payables aging schedules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Receivables */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <span>Pending Client Receivables</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-600">₹68,00,000</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {clients.map(c => (
                  <div key={c.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">Total Billed: {formatCurrency(c.totalBilled)}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600">{formatCurrency(c.outstanding)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Payables */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Pending Vendor Payables</span>
                </h4>
                <span className="text-xs font-mono font-bold text-rose-600">₹24,50,000</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {vendors.map(v => (
                  <div key={v.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{v.name}</span>
                      <span className="text-[10px] text-slate-400">{v.category}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-600">{formatCurrency(v.outstandingBalance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 3: ACCOUNT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              2. Account Management • Subsection (iii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bank & Cash Account Ledgers
            </h2>
            <p className="text-xs text-slate-500">Corporate accounts at HDFC, SBI, and site petty cash reserves.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">HDFC Bank Current A/c</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">₹2,57,80,000</div>
              <div className="text-[11px] text-slate-400">A/c: 50100299881 • Branch: Station Road Kolhapur</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">SBI Project Escrow A/c</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">₹1,42,00,000</div>
              <div className="text-[11px] text-slate-400">A/c: 30291887210 • Branch: Rajarampuri Kolhapur</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Site Petty Cash Reserves</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">₹4,85,000</div>
              <div className="text-[11px] text-slate-400">Maintained by Project Engineers at Sites</div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 4: FINANCIAL SUMMARIES */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
              2. Account Management • Subsection (iv)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Executive Financial Summaries
            </h2>
            <p className="text-xs text-slate-500">Consolidated P&L, cumulative revenue, and booked operational profit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Contract Value</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">₹16,15,00,000</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Cumulative Billed</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">₹6,25,00,000</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Actual Expenditure</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">₹5,10,50,000</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Net Booked Margin</span>
              <div className="text-2xl font-black text-red-600 font-mono mt-1">₹1,14,50,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
