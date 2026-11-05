// MODULE 4: TALLY INTEGRATION — Full Connected Flow (i → ii → iii → iv)
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight, CheckCircle2, RefreshCw, Download, AlertTriangle,
  ShieldCheck, Database, Layers, FileCode, Server, Link2, XCircle,
  AlertCircle, ArrowRightLeft, FileText, Building, Users, IndianRupee,
  Clock, BarChart3, Zap
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { buildTallySalesVoucherXML, buildTallyLedgerXML, downloadTallyXML } from '../../services/tallyService';
import { Modal } from '../../components/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Shared micro-components ────────────────────────────────────────────────

const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium
      ${isErr ? 'bg-rose-600' : 'bg-emerald-600'}`}>
      {isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      {toast.message}
    </div>
  );
};

const StepBadge = ({ n, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="w-7 h-7 rounded-full bg-[#002046] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">{n}</span>
    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{label}</span>
  </div>
);

const SummaryCard = ({ label, value, icon: Icon, color }) => (
  <div className={`rounded-xl p-4 border ${color} flex items-start gap-3`}>
    <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
      <Icon size={18} className="text-current" />
    </div>
    <div>
      <p className="text-xs font-semibold opacity-75">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const map = {
    Synced: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Verified: 'bg-blue-50 text-blue-700 border border-blue-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    Failed: 'bg-rose-50 text-rose-700 border border-rose-200',
    Mismatch: 'bg-red-50 text-red-600 border border-red-200',
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-semibold text-slate-800">{value}</span>
  </div>
);

// ─── Mock data ───────────────────────────────────────────────────────────────

const TALLY_COMPANY = {
  name: 'SANMATI CONSTRUCTIONS',
  fy: '01-Apr-2026 to 31-Mar-2027',
  port: '9000',
  host: 'localhost',
  version: 'TallyPrime 4.1',
  status: 'Connected',
};

const LEDGERS = [
  { id: 'L-001', name: 'Cash', group: 'Cash-in-Hand', balance: 285000, tallyId: 'TLY-LED-001', synced: true },
  { id: 'L-002', name: 'HDFC Bank Current A/c', group: 'Bank Accounts', balance: 4820000, tallyId: 'TLY-LED-002', synced: true },
  { id: 'L-003', name: 'Sundry Debtors', group: 'Sundry Debtors', balance: 21500000, tallyId: 'TLY-LED-003', synced: true },
  { id: 'L-004', name: 'Sundry Creditors', group: 'Sundry Creditors', balance: 8200000, tallyId: 'TLY-LED-004', synced: false },
  { id: 'L-005', name: 'Sales Account', group: 'Sales Accounts', balance: 48500000, tallyId: 'TLY-LED-005', synced: true },
  { id: 'L-006', name: 'Purchase Account', group: 'Purchase Accounts', balance: 32100000, tallyId: 'TLY-LED-006', synced: true },
];

const VOUCHERS = [
  { id: 'SV-001', type: 'Sales Voucher', no: 'SC/RA/2026/001', date: '2026-11-02', party: 'Royal Palace Developers', amount: 10000000, status: 'Synced', tallyId: 'TLY-VCH-901' },
  { id: 'PV-002', type: 'Payment Voucher', no: 'PV-2026-088', date: '2026-11-01', party: 'ABC Steel Suppliers', amount: 1220000, status: 'Synced', tallyId: 'TLY-VCH-902' },
  { id: 'RV-003', type: 'Receipt Voucher', no: 'RV-2026-041', date: '2026-10-30', party: 'DY Patil Medical Trust', amount: 2500000, status: 'Synced', tallyId: 'TLY-VCH-903' },
  { id: 'PU-004', type: 'Purchase Voucher', no: 'PUR-2026-055', date: '2026-10-28', party: 'XYZ Cement Ltd', amount: 875000, status: 'Pending', tallyId: null },
  { id: 'JV-005', type: 'Journal Voucher', no: 'JV-2026-012', date: '2026-10-25', party: 'TDS Payable', amount: 125000, status: 'Synced', tallyId: 'TLY-VCH-904' },
  { id: 'CV-006', type: 'Contra Voucher', no: 'CON-2026-003', date: '2026-10-22', party: 'Cash to Bank Transfer', amount: 500000, status: 'Pending', tallyId: null },
];

const VERIFICATION_DATA = [
  { id: 'VER-001', entity: 'Cash Ledger Balance', erp: 285000, tally: 285000, diff: 0, status: 'Verified' },
  { id: 'VER-002', entity: 'HDFC Bank Balance', erp: 4820000, tally: 4820000, diff: 0, status: 'Verified' },
  { id: 'VER-003', entity: 'Sundry Debtors Total', erp: 21500000, tally: 21500000, diff: 0, status: 'Verified' },
  { id: 'VER-004', entity: 'Sundry Creditors Total', erp: 8200000, tally: 7750000, diff: 450000, status: 'Mismatch' },
  { id: 'VER-005', entity: 'Sales Account Total', erp: 48500000, tally: 48500000, diff: 0, status: 'Verified' },
  { id: 'VER-006', entity: 'PV-2026-088 Payment', erp: 1220000, tally: 1220000, diff: 0, status: 'Verified' },
  { id: 'VER-007', entity: 'PUR-2026-055 Purchase', erp: 875000, tally: 0, diff: 875000, status: 'Mismatch' },
];

const VOUCHER_TYPES = [
  { key: 'Sales Voucher', icon: IndianRupee, color: 'border-emerald-200 bg-emerald-50 text-emerald-700', desc: 'RA Bills & Client Invoices' },
  { key: 'Purchase Voucher', icon: Building, color: 'border-amber-200 bg-amber-50 text-amber-700', desc: 'Material Purchase Bills' },
  { key: 'Payment Voucher', icon: ArrowRightLeft, color: 'border-blue-200 bg-blue-50/70 text-[#002046]', desc: 'Vendor & Supplier Payments' },
  { key: 'Receipt Voucher', icon: CheckCircle2, color: 'border-blue-200 bg-blue-50 text-blue-700', desc: 'Client Payment Receipts' },
  { key: 'Journal Voucher', icon: FileText, color: 'border-purple-200 bg-purple-50 text-purple-700', desc: 'Adjustments & Provisions' },
  { key: 'Contra Voucher', icon: RefreshCw, color: 'border-slate-200 bg-slate-50 text-slate-700', desc: 'Cash ↔ Bank Transfers' },
];

// ─── Main component ──────────────────────────────────────────────────────────

export const TallyModule = () => {
  const { tallyConfig, syncToTally, raBills = [] } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'integration';

  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncedLedgers, setSyncedLedgers] = useState([]);
  const [syncedVouchers, setSyncedVouchers] = useState([]);
  const [selectedVoucherType, setSelectedVoucherType] = useState(null);
  const [xmlPreview, setXmlPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Section (i) handlers ──────────────────────────────────────────────────

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast('Tally Connection Successful! Port 9000 — ONLINE ✓');
    }, 1500);
  };

  // ── Section (ii) handlers ─────────────────────────────────────────────────

  const handleSyncLedger = (ledgerId) => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedLedgers(prev => [...prev, ledgerId]);
      setIsSyncing(false);
      showToast('Ledger Sync Successful! ✓');
    }, 900);
  };

  const handleSyncAllLedgers = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedLedgers(LEDGERS.map(l => l.id));
      setIsSyncing(false);
      showToast('All Ledgers Synced Successfully! ✓');
    }, 1500);
  };

  // ── Section (iii) handlers ─────────────────────────────────────────────────

  const handleSyncVoucher = (vId) => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedVouchers(prev => [...prev, vId]);
      setIsSyncing(false);
      showToast('Voucher transferred to Tally! ✓');
    }, 900);
  };

  const handleInspectXML = (voucher) => {
    const xml = buildTallySalesVoucherXML({
      companyName: TALLY_COMPANY.name,
      voucherNo: voucher.no,
      date: voucher.date,
      partyLedger: voucher.party,
      amount: voucher.amount,
      cgst: 0, sgst: 0,
      narration: `Being ${voucher.type} No. ${voucher.no} transferred via ERP.`
    });
    setXmlPreview({ title: `XML Payload: ${voucher.no}`, content: xml, fileName: `${voucher.no.replace(/\//g, '_')}.xml` });
  };

  // ── Render: Section (i) — Tally Data Integration ─────────────────────────

  const renderIntegration = () => (
    <div className="space-y-4">

      {/* Step 1 — Connection Config */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="1" label="Tally Connection Setup" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tally Host</label>
            <input type="text" defaultValue={TALLY_COMPANY.host}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Port</label>
            <input type="text" defaultValue={TALLY_COMPANY.port}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tally Version</label>
            <input type="text" defaultValue={TALLY_COMPANY.version}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none" />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleTestConnection} disabled={isTesting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            {isTesting ? <RefreshCw size={16} className="animate-spin" /> : <Link2 size={16} />}
            {isTesting ? 'Testing Connection...' : 'Test Connection'}
          </button>
        </div>
      </div>

      {/* Step 2 — Company Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <StepBadge n="2" label="Tally Company Details" />
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE &amp; CONNECTED
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard label="Company Name" value={TALLY_COMPANY.name} icon={Building} color="border-blue-200 bg-blue-50/70 text-[#002046]" />
          <SummaryCard label="Financial Year" value={TALLY_COMPANY.fy} icon={Clock} color="border-amber-200 bg-amber-50 text-amber-700" />
          <SummaryCard label="Total Ledgers" value={`${LEDGERS.length} Ledgers`} icon={Database} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
        </div>
      </div>

      {/* Step 3 — Ledger Fetch */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="3" label="Fetched Ledger Details" />
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Ledger ID', 'Ledger Name', 'Group', 'Balance', 'Tally ID', 'Status'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LEDGERS.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">{l.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{l.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{l.group}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(l.balance)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.tallyId}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.synced ? 'Synced' : 'Pending'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Render: Section (ii) — Account Data Synchronization ───────────────────

  const renderSync = () => (
    <div className="space-y-4">

      {/* Step 1 — Sync Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <StepBadge n="1" label="Sync Overview" />
          <button onClick={handleSyncAllLedgers} disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white shadow-xs text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            {isSyncing ? <RefreshCw size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Sync All Accounts
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Total Ledgers" value={LEDGERS.length} icon={Database} color="border-blue-200 bg-blue-50/70 text-[#002046]" />
          <SummaryCard label="Synced" value={LEDGERS.filter(l => l.synced).length} icon={CheckCircle2} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
          <SummaryCard label="Pending" value={LEDGERS.filter(l => !l.synced).length} icon={Clock} color="border-amber-200 bg-amber-50 text-amber-700" />
          <SummaryCard label="Total Balance" value={formatCurrency(LEDGERS.reduce((s, l) => s + l.balance, 0))} icon={IndianRupee} color="border-blue-200 bg-blue-50 text-blue-700" />
        </div>
      </div>

      {/* Step 2 — Ledger Sync Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="2" label="Ledger / Customer / Vendor Sync" />
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Ledger ID', 'Name', 'Group', 'Balance', 'Tally ID', 'Sync Status', 'Action'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LEDGERS.map(l => {
                const isSynced = l.synced || syncedLedgers.includes(l.id);
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">{l.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{l.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{l.group}</td>
                    <td className="px-4 py-3 font-mono font-bold">{formatCurrency(l.balance)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.tallyId || '—'}</td>
                    <td className="px-4 py-3"><StatusPill status={isSynced ? 'Synced' : 'Pending'} /></td>
                    <td className="px-4 py-3">
                      {!isSynced ? (
                        <button onClick={() => handleSyncLedger(l.id)} disabled={isSyncing}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                          <RefreshCw size={12} /> Sync Now
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <CheckCircle2 size={13} /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 3 — Duplicate Check */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="3" label="Duplicate Entry Check" />
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-700">No Duplicate Entries Found</p>
            <p className="text-xs text-emerald-600">System verified — सर्व {LEDGERS.length} Ledgers unique आहेत. Last checked: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render: Section (iii) — Voucher and Transaction Transfer ──────────────

  const renderVouchers = () => (
    <div className="space-y-4">

      {/* Step 1 — Voucher Type Select */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <StepBadge n="1" label="Voucher Type निवडा" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VOUCHER_TYPES.map(vt => {
            const isSelected = selectedVoucherType === vt.key;
            return (
              <button
                key={vt.key}
                type="button"
                onClick={() => setSelectedVoucherType(isSelected ? null : vt.key)}
                className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#004bb5] bg-[#e8f1fc] shadow-md ring-2 ring-blue-300'
                    : 'border-[#cce0fc] bg-[#f8fafd] hover:bg-[#e8f1fc] hover:border-[#004bb5]'
                }`}
              >
                <div className="inline-flex p-2 rounded-xl mb-2 bg-[#dbeafe] text-[#004bb5] border border-[#bfdbfe]">
                  <vt.icon size={16} />
                </div>
                <p className="text-xs font-bold text-[#002046]">{vt.key}</p>
                <p className="text-[11px] text-[#475569] mt-0.5">{vt.desc}</p>
              </button>
            );
          })}
        </div>
        {!selectedVoucherType && (
          <p className="mt-3 text-xs text-[#004bb5] bg-[#e8f1fc] border border-[#cce0fc] rounded-xl p-3 font-semibold flex items-center gap-2">
            <span>👆</span> वरीलपैकी एक Voucher Type निवडा — त्यानुसार Transactions खाली दिसतील.
          </p>
        )}
      </div>

      {/* Step 2 — Transaction List */}
      {selectedVoucherType && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="2" label={`${selectedVoucherType} Transactions`} />
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Voucher No', 'Date', 'Party', 'Amount', 'Status', 'Tally ID', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {VOUCHERS.filter(v => v.type === selectedVoucherType).length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400">या Type साठी कोणतेही Transactions नाहीत.</td></tr>
                ) : VOUCHERS.filter(v => v.type === selectedVoucherType).map(v => {
                  const isTransferred = v.status === 'Synced' || syncedVouchers.includes(v.id);
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">{v.no}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatDate(v.date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{v.party}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(v.amount)}</td>
                      <td className="px-4 py-3"><StatusPill status={isTransferred ? 'Synced' : 'Pending'} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.tallyId || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!isTransferred && (
                            <button onClick={() => handleSyncVoucher(v.id)} disabled={isSyncing}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#002046] hover:bg-[#001736] text-white shadow-xs text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                              <Zap size={11} /> Transfer
                            </button>
                          )}
                          <button onClick={() => handleInspectXML(v)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg transition-colors">
                            <FileCode size={11} /> XML
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3 — All Vouchers Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <StepBadge n="3" label="All Vouchers Transfer Status" />
          <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
            {VOUCHERS.filter(v => v.status === 'Synced' || syncedVouchers.includes(v.id)).length} / {VOUCHERS.length} Transferred
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VOUCHER_TYPES.map(vt => {
            const count = VOUCHERS.filter(v => v.type === vt.key).length;
            const synced = VOUCHERS.filter(v => v.type === vt.key && (v.status === 'Synced' || syncedVouchers.includes(v.id))).length;
            return (
              <div key={vt.key} className={`rounded-xl border p-3 ${vt.color}`}>
                <p className="text-xs font-bold">{vt.key}</p>
                <p className="text-xs opacity-70 mt-0.5">{synced}/{count} Transferred</p>
                <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div className="h-full bg-current rounded-full opacity-70" style={{ width: count ? `${(synced / count) * 100}%` : '0%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Render: Section (iv) — Data Verification ──────────────────────────────

  const renderVerification = () => {
    const mismatches = VERIFICATION_DATA.filter(v => v.status === 'Mismatch');
    const verified = VERIFICATION_DATA.filter(v => v.status === 'Verified');

    return (
      <div className="space-y-4">

        {/* Step 1 — Verification Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="1" label="Data Verification Summary" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Total Checks" value={VERIFICATION_DATA.length} icon={BarChart3} color="border-blue-200 bg-blue-50/70 text-[#002046]" />
            <SummaryCard label="Verified" value={verified.length} icon={CheckCircle2} color="border-emerald-100 bg-emerald-50/60 text-emerald-700" />
            <SummaryCard label="Mismatches" value={mismatches.length} icon={AlertTriangle} color="border-amber-100 bg-amber-50/60 text-amber-700" />
            <SummaryCard label="Total Diff" value={formatCurrency(VERIFICATION_DATA.reduce((s, v) => s + v.diff, 0))} icon={IndianRupee} color="border-rose-100 bg-rose-50/60 text-rose-600" />
          </div>
        </div>

        {/* Step 2 — Mismatch Alerts */}
        {mismatches.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
            <StepBadge n="2" label="Mismatch Alerts" />
            <div className="space-y-3">
              {mismatches.map(m => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">{m.entity}</p>
                    <div className="flex flex-wrap gap-4 mt-1 text-xs">
                      <span className="text-slate-600">ERP: <span className="font-bold text-slate-800">{formatCurrency(m.erp)}</span></span>
                      <span className="text-slate-600">Tally: <span className="font-bold text-slate-800">{formatCurrency(m.tally)}</span></span>
                      <span className="text-rose-600 font-bold">Difference: {formatCurrency(m.diff)}</span>
                    </div>
                  </div>
                  <StatusPill status="Mismatch" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Full Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="3" label="ERP vs Tally — Full Comparison" />
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Check ID', 'Entity / Ledger', 'ERP Amount', 'Tally Amount', 'Difference', 'Status'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {VERIFICATION_DATA.map(v => (
                  <tr key={v.id} className={`hover:bg-slate-50 transition-colors ${v.diff > 0 ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">{v.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{v.entity}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{formatCurrency(v.erp)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{formatCurrency(v.tally)}</td>
                    <td className={`px-4 py-3 font-mono font-bold ${v.diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {v.diff > 0 ? `−${formatCurrency(v.diff)}` : '✓ Match'}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 4 — Missing / Duplicate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <StepBadge n="4" label="Missing Entries &amp; Duplicate Check" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <p className="text-sm font-bold text-amber-800">Missing in Tally</p>
              </div>
              <p className="text-xs text-amber-700">PUR-2026-055 — Purchase Voucher (₹8,75,000) — Not found in Tally</p>
              <p className="text-xs text-amber-700 mt-1">CON-2026-003 — Contra Voucher (₹5,00,000) — Pending Transfer</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <p className="text-sm font-bold text-emerald-700">Duplicate Check</p>
              </div>
              <p className="text-xs text-emerald-700">No Duplicate Transactions Found</p>
              <p className="text-xs text-emerald-600 mt-1">All {VOUCHERS.length} Vouchers are unique across both systems.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="p-5 pt-3 min-h-screen bg-slate-50 relative">
      <Toast toast={toast} />

      {activeTab === 'integration' && renderIntegration()}
      {activeTab === 'sync' && renderSync()}
      {activeTab === 'vouchers' && renderVouchers()}
      {activeTab === 'verification' && renderVerification()}

      {/* XML Preview Modal */}
      {xmlPreview && (
        <Modal isOpen={Boolean(xmlPreview)} onClose={() => setXmlPreview(null)} title={xmlPreview.title}>
          <div className="space-y-4">
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96">
              {xmlPreview.content}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => downloadTallyXML(xmlPreview.content, xmlPreview.fileName)}
                className="flex items-center gap-2 px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white shadow-xs text-sm font-semibold rounded-xl transition-colors">
                <Download size={14} /> Save XML File
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TallyModule;
