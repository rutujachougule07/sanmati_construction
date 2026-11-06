// MODULE 4: TALLY INTEGRATION — Complete Connected Workflow
// Implements exact user specification:
// 1. i. Tally Data Integration (Add Company, Upload File, View Company, Import Data)
// 2. ii. Account Data Synchronisation (Upload Ledger, View Ledger, Add Ledger, Edit Ledger, Mark as Matched)
// 3. iii. Voucher and Transaction Transfer (Upload Voucher File, View Transactions, Import Transactions, Edit Entry, Delete Entry)
// 4. iv. Data Verification (Compare Data, View Difference, Correct Entry, Verify, Complete)

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building, Calendar, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw,
  Upload, Download, FileText, IndianRupee, Clock, Search, Filter, Plus,
  Edit2, ShieldCheck, Check, ArrowRight, X, Eye, FileSpreadsheet, Layers,
  Database, Trash2, FileCode, CheckSquare, Sparkles, Server, HardDrive, ArrowRightLeft
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Default Data Matching User Specification ───────────────────────────────

const DEFAULT_COMPANIES = [
  {
    id: 'COMP-01',
    name: 'Sanmati Constructions',
    fy: '2026-27',
    tallyDetails: 'TallyPrime 4.1 | Port: 9000 | Host: localhost',
    gstin: '27AAYCS9281Q1ZU',
    address: 'Shop No. 4, Royal Plaza, Station Road, Kolhapur',
    status: 'Active',
    dataFile: 'Sanmati_Constructions_2026_27_Masters.xml',
    uploadedAt: '2026-11-05 10:30 AM',
    importedRecords: 48
  }
];

const DEFAULT_LEDGERS = [
  { id: 'LED-001', tallyLedger: 'ABC Supplier', erpLedger: 'ABC Supplier', group: 'Sundry Creditors', balance: 1220000, status: 'Matched' },
  { id: 'LED-002', tallyLedger: 'XYZ Supplier', erpLedger: '', group: 'Sundry Creditors', balance: 450000, status: 'Not Found' },
  { id: 'LED-003', tallyLedger: 'SBI Bank', erpLedger: 'SBI Bank', group: 'Bank Accounts', balance: 3500000, status: 'Matched' },
  { id: 'LED-004', tallyLedger: 'HDFC Bank Current A/c', erpLedger: 'HDFC Bank Current A/c', group: 'Bank Accounts', balance: 4820000, status: 'Matched' },
  { id: 'LED-005', tallyLedger: 'Cash In Hand', erpLedger: 'Cash In Hand', group: 'Cash-in-Hand', balance: 285000, status: 'Matched' },
  { id: 'LED-006', tallyLedger: 'UltraTech Cement Ltd', erpLedger: '', group: 'Sundry Creditors', balance: 875000, status: 'Not Found' },
  { id: 'LED-007', tallyLedger: 'Royal Palace Developers', erpLedger: 'Royal Palace Developers', group: 'Sundry Debtors', balance: 21500000, status: 'Matched' },
  { id: 'LED-008', tallyLedger: 'Site Fuel Expenses', erpLedger: 'Diesel Expenses', group: 'Direct Expenses', balance: 450000, status: 'Different Info' },
  { id: 'LED-009', tallyLedger: 'Construction Revenue A/c', erpLedger: 'Construction Revenue A/c', group: 'Sales Accounts', balance: 48500000, status: 'Matched' },
  { id: 'LED-010', tallyLedger: 'Material Purchase A/c', erpLedger: 'Material Purchase A/c', group: 'Purchase Accounts', balance: 32100000, status: 'Matched' }
];

const DEFAULT_VOUCHERS = [
  { id: 'VCH-001', date: '05/11/26', voucher: 'Receipt', party: 'ABC Customer', amount: 50000, narration: 'Payment received via UPI', status: 'Imported' },
  { id: 'VCH-002', date: '05/11/26', voucher: 'Payment', party: 'XYZ Supplier', amount: 20000, narration: 'Part payment against material invoice', status: 'Imported' },
  { id: 'VCH-003', date: '06/11/26', voucher: 'Purchase', party: 'Cement Supplier', amount: 30000, narration: '100 Bags OPC 53 Grade Cement', status: 'Imported' },
  { id: 'VCH-004', date: '06/11/26', voucher: 'Sales', party: 'Royal Palace Developers', amount: 10000000, narration: 'RA Bill No. 1 Project Milestone', status: 'Imported' },
  { id: 'VCH-005', date: '06/11/26', voucher: 'Contra', party: 'Cash to SBI Bank', amount: 75000, narration: 'Cash deposited in SBI Current A/c', status: 'Imported' },
  { id: 'VCH-006', date: '06/11/26', voucher: 'Payment', party: 'Site Labour Wages', amount: 45000, narration: 'Weekly labour disbursement', status: 'Imported' }
];

const DEFAULT_VERIFICATION = [
  { id: 'VER-001', details: 'Cash Balance', tally: 50000, erp: 50000, diff: 0, status: 'Matched' },
  { id: 'VER-002', details: 'Bank Balance', tally: 100000, erp: 100000, diff: 0, status: 'Matched' },
  { id: 'VER-003', details: 'Total Purchase', tally: 80000, erp: 80000, diff: 0, status: 'Matched' },
  { id: 'VER-004', details: 'Total Sales', tally: 150000, erp: 140000, diff: -10000, status: 'Mismatch', note: 'Sales मध्ये ₹10,000 चा फरक आहे. Entry पुन्हा Import किंवा Correct करा.' },
  { id: 'VER-005', details: 'Sundry Debtors Balance', tally: 21500000, erp: 21500000, diff: 0, status: 'Matched' },
  { id: 'VER-006', details: 'Sundry Creditors Balance', tally: 1220000, erp: 1220000, diff: 0, status: 'Matched' }
];

export const TallyModule = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'integration';

  // ─── Toast System ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── 1. State for Tally Data Integration ────────────────────────────────────
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_comp_v2');
      return saved ? JSON.parse(saved) : DEFAULT_COMPANIES;
    } catch { return DEFAULT_COMPANIES; }
  });

  const [activeCompanyId, setActiveCompanyId] = useState(companies[0]?.id || 'COMP-01');
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === activeCompanyId) || companies[0];
  }, [companies, activeCompanyId]);

  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isViewCompanyModalOpen, setIsViewCompanyModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: 'Sanmati Constructions',
    fy: '2026-27',
    tallyDetails: 'TallyPrime 4.1 | Port: 9000 | Host: localhost',
    gstin: '27AAYCS9281Q1ZU',
    address: 'Shop No. 4, Royal Plaza, Station Road, Kolhapur'
  });

  // ─── 2. State for Account Data Synchronisation ─────────────────────────────
  const [ledgers, setLedgers] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_ledgers_v2');
      return saved ? JSON.parse(saved) : DEFAULT_LEDGERS;
    } catch { return DEFAULT_LEDGERS; }
  });

  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('All'); // All, Matched, Not Found, Different Info
  const [viewLedgerModalItem, setViewLedgerModalItem] = useState(null);
  const [addLedgerModalItem, setAddLedgerModalItem] = useState(null);
  const [editLedgerModalItem, setEditLedgerModalItem] = useState(null);
  const [isUploadLedgerModalOpen, setIsUploadLedgerModalOpen] = useState(false);

  // ─── 3. State for Voucher and Transaction Transfer ─────────────────────────
  const [vouchers, setVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_vouchers_v2');
      return saved ? JSON.parse(saved) : DEFAULT_VOUCHERS;
    } catch { return DEFAULT_VOUCHERS; }
  });

  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState('All');
  const [isUploadVoucherModalOpen, setIsUploadVoucherModalOpen] = useState(false);
  const [isAddVoucherModalOpen, setIsAddVoucherModalOpen] = useState(false);
  const [editVoucherModalItem, setEditVoucherModalItem] = useState(null);

  const [voucherForm, setVoucherForm] = useState({
    date: '06/11/26',
    voucher: 'Receipt',
    party: '',
    amount: '',
    narration: ''
  });

  // ─── 4. State for Data Verification ────────────────────────────────────────
  const [verificationData, setVerificationData] = useState(() => {
    try {
      const saved = localStorage.getItem('tally_verify_v2');
      return saved ? JSON.parse(saved) : DEFAULT_VERIFICATION;
    } catch { return DEFAULT_VERIFICATION; }
  });

  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [correctModalItem, setCorrectModalItem] = useState(null);
  const [isVerificationComplete, setIsVerificationComplete] = useState(() => {
    try {
      return localStorage.getItem('tally_verify_done') === 'true';
    } catch { return false; }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tally_comp_v2', JSON.stringify(companies));
      localStorage.setItem('tally_ledgers_v2', JSON.stringify(ledgers));
      localStorage.setItem('tally_vouchers_v2', JSON.stringify(vouchers));
      localStorage.setItem('tally_verify_v2', JSON.stringify(verificationData));
      localStorage.setItem('tally_verify_done', String(isVerificationComplete));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [companies, ledgers, vouchers, verificationData, isVerificationComplete]);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. HANDLERS: i. Tally Data Integration
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddCompany = (e) => {
    e.preventDefault();
    const newComp = {
      id: `COMP-${Date.now().toString().slice(-4)}`,
      name: newCompanyForm.name,
      fy: newCompanyForm.fy,
      tallyDetails: newCompanyForm.tallyDetails || 'TallyPrime 4.1 | Port: 9000 | Host: localhost',
      gstin: newCompanyForm.gstin || '27AAYCS9281Q1ZU',
      address: newCompanyForm.address || 'Kolhapur, Maharashtra',
      status: 'Active',
      dataFile: 'Pending Upload',
      uploadedAt: 'Just now',
      importedRecords: 0
    };
    setCompanies(prev => [newComp, ...prev]);
    setActiveCompanyId(newComp.id);
    setIsAddCompanyModalOpen(false);
    showToast(`Company '${newComp.name} – ${newComp.fy}' यशस्वीरीत्या जोडली! ✓`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          dataFile: file.name,
          uploadedAt: new Date().toLocaleString(),
          importedRecords: 48
        };
      }
      return c;
    }));
    setIsUploadModalOpen(false);
    showToast(`Tally Data File '${file.name}' ERP मध्ये Upload झाली! ✓`);
  };

  const handleQuickDemoUpload = () => {
    setCompanies(prev => prev.map(c => {
      if (c.id === activeCompanyId) {
        return {
          ...c,
          dataFile: 'Sanmati_Constructions_2026_27_Masters.xml',
          uploadedAt: new Date().toLocaleString(),
          importedRecords: 48
        };
      }
      return c;
    }));
    setIsUploadModalOpen(false);
    showToast(`Sanmati_Constructions_2026_27_Masters.xml अपलोड झाली! ✓`);
  };

  const handleImportData = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      showToast(`Tally मधील Company Data (${activeCompany.name} – ${activeCompany.fy}) ERP मध्ये यशस्वीरीत्या Import झाला! ✓`);
    }, 1000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2. HANDLERS: ii. Account Data Synchronisation
  // ─────────────────────────────────────────────────────────────────────────

  const filteredLedgers = useMemo(() => {
    return ledgers.filter(item => {
      const q = ledgerSearch.toLowerCase();
      const matchesSearch = !q ||
        item.tallyLedger.toLowerCase().includes(q) ||
        item.erpLedger.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (ledgerFilter === 'All') return true;
      if (ledgerFilter === 'Matched') return item.status === 'Matched';
      if (ledgerFilter === 'Not Found') return item.status === 'Not Found';
      if (ledgerFilter === 'Different Info') return item.status === 'Different Info';
      return true;
    });
  }, [ledgers, ledgerSearch, ledgerFilter]);

  const handleAddLedgerToERP = (item) => {
    setLedgers(prev => prev.map(l => {
      if (l.id === item.id) {
        return {
          ...l,
          erpLedger: item.tallyLedger,
          status: 'Matched'
        };
      }
      return l;
    }));
    setAddLedgerModalItem(null);
    showToast(`Missing Ledger '${item.tallyLedger}' ERP मध्ये Add केले आणि Matched झाले! ✓`);
  };

  const handleAddLedgerSave = (item) => {
    const ledgerName = (item.erpLedger || item.tallyLedger || '').trim();
    if (!ledgerName) {
      showToast('कृपया Ledger चे नाव भरा!', 'error');
      return;
    }

    const exists = ledgers.some(l => l.id === item.id);
    if (exists) {
      setLedgers(prev => prev.map(l => {
        if (l.id === item.id) {
          return {
            ...l,
            erpLedger: ledgerName,
            tallyLedger: l.tallyLedger || ledgerName,
            group: item.group || l.group,
            balance: Number(item.balance) || l.balance,
            status: 'Matched'
          };
        }
        return l;
      }));
    } else {
      const newLedger = {
        id: item.id || `LED-${Date.now().toString().slice(-4)}`,
        tallyLedger: ledgerName,
        erpLedger: ledgerName,
        group: item.group || 'Sundry Debtors',
        balance: Number(item.balance) || 0,
        status: 'Matched'
      };
      setLedgers(prev => [newLedger, ...prev]);
    }
    setAddLedgerModalItem(null);
    showToast(`Ledger '${ledgerName}' यशस्वीरीत्या ERP मध्ये Add झाले! ✓`);
  };

  const handleEditLedgerSave = (item) => {
    setLedgers(prev => prev.map(l => {
      if (l.id === item.id) {
        const isNowMatched = item.erpLedger.trim().toLowerCase() === l.tallyLedger.trim().toLowerCase();
        return {
          ...l,
          erpLedger: item.erpLedger,
          group: item.group,
          balance: Number(item.balance) || l.balance,
          status: isNowMatched ? 'Matched' : 'Matched'
        };
      }
      return l;
    }));
    setEditLedgerModalItem(null);
    showToast(`Ledger '${item.erpLedger}' ची माहिती Update झाली! ✓`);
  };

  const handleMarkAsMatched = (id) => {
    setLedgers(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          erpLedger: l.erpLedger || l.tallyLedger,
          status: 'Matched'
        };
      }
      return l;
    }));
    showToast('Ledger ला "Matched ✓" म्हणून मार्क केले!');
  };

  const handleUploadLedgerFile = (fileName = 'Tally_Ledgers_Export.xlsx') => {
    setIsUploadLedgerModalOpen(false);
    showToast(`Tally Ledger File '${fileName}' Upload झाली व रेकॉर्ड्स लोड झाले! ✓`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HANDLERS: iii. Voucher and Transaction Transfer
  // ─────────────────────────────────────────────────────────────────────────

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const q = voucherSearch.toLowerCase();
      const matchesSearch = !q ||
        v.party.toLowerCase().includes(q) ||
        v.voucher.toLowerCase().includes(q) ||
        v.date.includes(q);

      if (!matchesSearch) return false;
      if (voucherTypeFilter === 'All') return true;
      return v.voucher.toLowerCase() === voucherTypeFilter.toLowerCase();
    });
  }, [vouchers, voucherSearch, voucherTypeFilter]);

  const handleSaveNewVoucher = (e) => {
    e.preventDefault();
    if (!voucherForm.party || !voucherForm.amount) {
      showToast('कृपया Party आणि Amount भरा!', 'error');
      return;
    }
    const newVch = {
      id: `VCH-${Date.now().toString().slice(-4)}`,
      date: voucherForm.date || '06/11/26',
      voucher: voucherForm.voucher,
      party: voucherForm.party,
      amount: Number(voucherForm.amount),
      narration: voucherForm.narration || '',
      status: 'Imported'
    };
    setVouchers(prev => [newVch, ...prev]);
    setIsAddVoucherModalOpen(false);
    setVoucherForm({ date: '06/11/26', voucher: 'Receipt', party: '', amount: '', narration: '' });
    showToast(`नवीन Transaction '${newVch.voucher} - ${newVch.party}' Save झाला! ✓`);
  };

  const handleEditVoucherSave = (edited) => {
    setVouchers(prev => prev.map(v => v.id === edited.id ? edited : v));
    setEditVoucherModalItem(null);
    showToast(`Transaction '${edited.voucher} - ${edited.party}' अपडेट झाला! ✓`);
  };

  const handleDeleteVoucher = (id) => {
    if (window.confirm('तुम्हाला ही एंट्री खरोखर Delete करायची आहे का?')) {
      setVouchers(prev => prev.filter(v => v.id !== id));
      showToast('Transaction Entry डिलीट केली!', 'error');
    }
  };

  const handleImportAllVouchers = () => {
    setVouchers(prev => prev.map(v => ({ ...v, status: 'Imported' })));
    showToast('Tally मधील सर्व Transactions ERP मध्ये Import झाले! ✓');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. HANDLERS: iv. Data Verification
  // ─────────────────────────────────────────────────────────────────────────

  const filteredVerification = useMemo(() => {
    if (!onlyDifferences) return verificationData;
    return verificationData.filter(v => v.diff !== 0 || v.status === 'Mismatch');
  }, [verificationData, onlyDifferences]);

  const handleCorrectVerification = (correction) => {
    setVerificationData(prev => prev.map(v => {
      if (v.id === correction.id) {
        return {
          ...v,
          erp: correction.newErp,
          tally: correction.newTally,
          diff: 0,
          status: 'Matched',
          note: `Corrected: ${correction.reason || 'Reconciled and matched with Tally'}`
        };
      }
      return v;
    }));
    setCorrectModalItem(null);
    showToast('Difference यशस्वीरीत्या Correct केला! Status: Matched ✓');
  };

  const handleVerifyAll = () => {
    showToast('सर्व Accounting Data ची पडताळणी (Audit Run) पूर्ण झाली! ✓');
  };

  const handleCompleteVerification = () => {
    const hasDiff = verificationData.some(v => v.diff !== 0);
    if (hasDiff) {
      if (!window.confirm('काही नोंदींमध्ये अजूनही फरक शिल्लक आहे. तरीही Verification Complete करायचे आहे का?')) {
        return;
      }
    }
    setIsVerificationComplete(true);
    showToast('Tally & ERP Accounting Data Verification यशस्वीरित्या COMPLETE झाली! ✓');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1. RENDER: i. Tally Data Integration
  // ─────────────────────────────────────────────────────────────────────────

  const renderIntegration = () => (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Objective & Buttons Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-[#002046] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-base font-extrabold text-[#002046]">i. Tally Data Integration</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              <strong className="text-slate-800">उद्देश:</strong> Tally मधील Company ची माहिती ERP मध्ये आणणे. (Company Registration + File Upload + Import)
            </p>
          </div>

          {/* 4 Required Buttons: Add Company, Upload File, View Company, Import Data */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddCompanyModalOpen(true)}
              className="px-3.5 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Company
            </button>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={14} /> Upload File
            </button>

            <button
              type="button"
              onClick={() => setIsViewCompanyModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Eye size={14} /> View Company
            </button>

            <button
              type="button"
              onClick={handleImportData}
              disabled={isImporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isImporting ? 'animate-spin' : ''} />
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Client Single-Time Info Display Card: Sanmati Constructions – 2026-27 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#002046] rounded-xl">
              <Building size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Registered Company Details (नोंदणीकृत कंपनी माहिती)
              </h3>
              <p className="text-xs text-slate-500">Client ने एकदाच भरलेली अधिकृत माहिती (उदा. Sanmati Constructions – 2026-27)</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Active &amp; Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</span>
            <span className="text-sm font-black text-slate-800 block mt-1">{activeCompany?.name}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">GSTIN: {activeCompany?.gstin}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Year</span>
            <span className="text-sm font-black text-blue-700 block mt-1">{activeCompany?.fy}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">01-Apr-2026 to 31-Mar-2027</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tally Company Details</span>
            <span className="text-xs font-bold text-slate-800 block mt-1">{activeCompany?.tallyDetails}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">Status: Connected ✓</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Uploaded Data File</span>
            <span className="text-xs font-mono font-bold text-[#002046] truncate block mt-1">{activeCompany?.dataFile}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{activeCompany?.importedRecords} Records Ready</span>
          </div>
        </div>
      </div>

      {/* Available Registered Companies List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Registered Companies (एकूण कंपन्या: {companies.length})
          </h4>
          <span className="text-xs text-slate-500">निवडण्यासाठी कंपनीवर क्लिक करा</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {companies.map(c => {
            const isSelected = c.id === activeCompanyId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveCompanyId(c.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#002046] bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{c.name}</span>
                  {isSelected && <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-xs font-semibold text-slate-600">FY: {c.fy}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">File: {c.dataFile}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Company */}
      {isAddCompanyModalOpen && (
        <Modal
          isOpen={isAddCompanyModalOpen}
          onClose={() => setIsAddCompanyModalOpen(false)}
          title="नवीन Tally Company जोडा (Add Company)"
        >
          <form onSubmit={handleAddCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name (कंपनीचे नाव)</label>
              <input
                type="text"
                value={newCompanyForm.name}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                placeholder="उदा. Sanmati Constructions"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Financial Year (आर्थिक वर्ष)</label>
              <input
                type="text"
                value={newCompanyForm.fy}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, fy: e.target.value })}
                placeholder="उदा. 2026-27"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tally Company Details / Version</label>
              <input
                type="text"
                value={newCompanyForm.tallyDetails}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, tallyDetails: e.target.value })}
                placeholder="उदा. TallyPrime 4.1 | Port: 9000 | Host: localhost"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={newCompanyForm.gstin}
                onChange={(e) => setNewCompanyForm({ ...newCompanyForm, gstin: e.target.value })}
                placeholder="27AAYCS9281Q1ZU"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCompanyModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Company
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Company Details */}
      {isViewCompanyModalOpen && (
        <Modal
          isOpen={isViewCompanyModalOpen}
          onClose={() => setIsViewCompanyModalOpen(false)}
          title={`Company Details: ${activeCompany?.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Company Name:</span>
                <strong className="text-slate-800">{activeCompany?.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Financial Year:</span>
                <strong className="text-blue-700">{activeCompany?.fy}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tally Details:</span>
                <strong className="text-slate-800">{activeCompany?.tallyDetails}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">GSTIN:</span>
                <strong className="text-slate-800 font-mono">{activeCompany?.gstin}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Uploaded Data File:</span>
                <strong className="text-[#002046] font-mono">{activeCompany?.dataFile}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Upload Time:</span>
                <strong className="text-slate-800">{activeCompany?.uploadedAt}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsViewCompanyModalOpen(false)}
                className="px-4 py-2 bg-[#002046] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Upload File */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Tally Data File Upload करा (Upload File)"
        >
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-[#002046] rounded-xl p-6 text-center bg-slate-50 transition-colors">
              <Upload size={24} className="mx-auto text-[#002046] mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">
                Tally मधील Export केलेली XML किंवा Excel फाईल निवडा
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                सपोर्टेड फॉरमॅट्स: .XML, .XLSX, .CSV (उदा. Sanmati_Constructions_2026_27_Masters.xml)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5">
                  <Upload size={14} /> संगणकावरून फाईल निवडा
                  <input
                    type="file"
                    accept=".xml,.xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoUpload}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ⚡ Sample Tally File लोड करा
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 2. RENDER: ii. Account Data Synchronisation
  // ─────────────────────────────────────────────────────────────────────────

  const renderSync = () => {
    const matchedCount = ledgers.filter(l => l.status === 'Matched').length;
    const notFoundCount = ledgers.filter(l => l.status === 'Not Found').length;
    const diffCount = ledgers.filter(l => l.status === 'Different Info').length;

    return (
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Objective & Buttons Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#002046] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-extrabold text-[#002046]">ii. Account Data Synchronisation</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-800">उद्देश:</strong> Tally आणि ERP मधील Accounts आणि Ledgers जुळवणे (Customer, Vendor, Bank, Cash, Sales, Purchase खाते).
              </p>
            </div>

            {/* 5 Required Buttons: Upload Ledger, View Ledger, Add Ledger, Edit Ledger, Mark as Matched */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUploadLedgerModalOpen(true)}
                className="px-3.5 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload size={14} /> Upload Ledger
              </button>

              <button
                type="button"
                onClick={() => {
                  if (filteredLedgers[0]) setViewLedgerModalItem(filteredLedgers[0]);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Eye size={14} /> View Ledger
              </button>

              <button
                type="button"
                onClick={() => setAddLedgerModalItem({
                  id: `LED-${Date.now().toString().slice(-3)}`,
                  tallyLedger: '',
                  erpLedger: '',
                  group: 'Sundry Debtors',
                  balance: 0,
                  status: 'Matched'
                })}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Client Action Flow Explanation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">एकूण Ledgers</span>
            <span className="text-lg font-black text-slate-800 block mt-0.5">{ledgers.length}</span>
            <span className="text-[11px] text-slate-500">Tally मधील सर्व खाती</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/30">
            <span className="text-[10px] font-bold text-emerald-800 block uppercase">Matched (जुळलेले)</span>
            <span className="text-lg font-black text-emerald-700 block mt-0.5">{matchedCount}</span>
            <span className="text-[11px] text-emerald-600">ERP सोबत तंतोतंत मॅच</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/30">
            <span className="text-[10px] font-bold text-amber-800 block uppercase">Not Found (नसलेले)</span>
            <span className="text-lg font-black text-amber-700 block mt-0.5">{notFoundCount}</span>
            <span className="text-[11px] text-amber-600">ERP मध्ये Add करा</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/30">
            <span className="text-[10px] font-bold text-blue-800 block uppercase">Different Info (फरक)</span>
            <span className="text-lg font-black text-blue-700 block mt-0.5">{diffCount}</span>
            <span className="text-[11px] text-blue-600">Update आवश्यक</span>
          </div>
        </div>

        {/* Ledger Comparison Table (Matching User's Example) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Matched', 'Not Found', 'Different Info'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLedgerFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ledgerFilter === f
                      ? 'bg-[#002046] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f} ({f === 'All' ? ledgers.length : ledgers.filter(l => l.status === f).length})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Ledger शोधा..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002046]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Tally Ledger</th>
                  <th className="px-4 py-3">ERP Ledger</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Balance (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions (Buttons)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedgers.map(item => {
                  const isNotFound = item.status === 'Not Found';
                  const isMatched = item.status === 'Matched';
                  const isDiff = item.status === 'Different Info';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{item.tallyLedger}</td>
                      <td className="px-4 py-3">
                        {item.erpLedger ? (
                          <span className="font-semibold text-slate-800">{item.erpLedger}</span>
                        ) : (
                          <span className="text-amber-600 font-bold italic">Not Found</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.group}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(item.balance)}</td>
                      <td className="px-4 py-3">
                        {isMatched && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Matched
                          </span>
                        )}
                        {isNotFound && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle size={12} /> Not Found
                          </span>
                        )}
                        {isDiff && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Edit2 size={12} /> Different Info
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isNotFound ? (
                            <button
                              type="button"
                              onClick={() => handleAddLedgerToERP(item)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Plus size={12} /> Add
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditLedgerModalItem(item)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          )}

                          {!isMatched && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsMatched(item.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Check size={12} /> Mark as Matched
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setViewLedgerModalItem(item)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="View Ledger"
                          >
                            <Eye size={13} />
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

        {/* Modal: Add Ledger */}
        {addLedgerModalItem && (
          <Modal
            isOpen={Boolean(addLedgerModalItem)}
            onClose={() => setAddLedgerModalItem(null)}
            title="नवीन Ledger जोडा (Add Ledger)"
          >
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddLedgerSave(addLedgerModalItem);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ledger Name (खात्याचे नाव)
                </label>
                <input
                  type="text"
                  value={addLedgerModalItem.erpLedger || addLedgerModalItem.tallyLedger || ''}
                  onChange={(e) => setAddLedgerModalItem({
                    ...addLedgerModalItem,
                    erpLedger: e.target.value,
                    tallyLedger: addLedgerModalItem.tallyLedger || e.target.value
                  })}
                  placeholder="उदा. ABC Supplier / SBI Current A/c"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accounting Group (गट)
                </label>
                <select
                  value={addLedgerModalItem.group || 'Sundry Debtors'}
                  onChange={(e) => setAddLedgerModalItem({ ...addLedgerModalItem, group: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                >
                  <option value="Sundry Debtors">Sundry Debtors (ग्राहक / देणी)</option>
                  <option value="Sundry Creditors">Sundry Creditors (पुरवठादार / येणी)</option>
                  <option value="Bank Accounts">Bank Accounts (बँक खाती)</option>
                  <option value="Cash-in-Hand">Cash-in-Hand (रोख रक्कम)</option>
                  <option value="Sales Accounts">Sales Accounts (विक्री महसूल)</option>
                  <option value="Purchase Accounts">Purchase Accounts (खरेदी खर्च)</option>
                  <option value="Direct Expenses">Direct Expenses (थेट साईट खर्च)</option>
                  <option value="Indirect Expenses">Indirect Expenses (इतर खर्च)</option>
                  <option value="Duties & Taxes">Duties & Taxes (जीएसटी / टॅक्स)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Balance (रक्कम ₹)
                </label>
                <input
                  type="number"
                  value={addLedgerModalItem.balance ?? ''}
                  onChange={(e) => setAddLedgerModalItem({ ...addLedgerModalItem, balance: e.target.value })}
                  placeholder="उदा. 50000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddLedgerModalItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Add Ledger Save करा
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: View Ledger */}
        {viewLedgerModalItem && (
          <Modal
            isOpen={Boolean(viewLedgerModalItem)}
            onClose={() => setViewLedgerModalItem(null)}
            title={`View Ledger: ${viewLedgerModalItem.tallyLedger}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Tally Ledger:</span>
                  <strong className="text-slate-800">{viewLedgerModalItem.tallyLedger}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">ERP Ledger:</span>
                  <strong className="text-slate-800">{viewLedgerModalItem.erpLedger || 'Not Found in ERP'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Accounting Group:</span>
                  <strong className="text-slate-800">{viewLedgerModalItem.group}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Closing Balance:</span>
                  <strong className="text-[#002046] font-mono text-sm">{formatCurrency(viewLedgerModalItem.balance)}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status:</span>
                  <strong className="text-emerald-700">{viewLedgerModalItem.status}</strong>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewLedgerModalItem(null)}
                  className="px-4 py-2 bg-[#002046] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Edit Ledger */}
        {editLedgerModalItem && (
          <Modal
            isOpen={Boolean(editLedgerModalItem)}
            onClose={() => setEditLedgerModalItem(null)}
            title="Edit Ledger (खात्याची माहिती दुरुस्त करा)"
          >
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditLedgerSave(editLedgerModalItem);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tally Ledger Name (मूळ नाव)</label>
                <input
                  type="text"
                  value={editLedgerModalItem.tallyLedger}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ERP Ledger Name (मॅच होणारे नाव)</label>
                <input
                  type="text"
                  value={editLedgerModalItem.erpLedger}
                  onChange={(e) => setEditLedgerModalItem({ ...editLedgerModalItem, erpLedger: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group (गट)</label>
                <input
                  type="text"
                  value={editLedgerModalItem.group}
                  onChange={(e) => setEditLedgerModalItem({ ...editLedgerModalItem, group: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Balance (₹)</label>
                <input
                  type="number"
                  value={editLedgerModalItem.balance}
                  onChange={(e) => setEditLedgerModalItem({ ...editLedgerModalItem, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditLedgerModalItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Update Ledger
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: Upload Ledger File */}
        {isUploadLedgerModalOpen && (
          <Modal
            isOpen={isUploadLedgerModalOpen}
            onClose={() => setIsUploadLedgerModalOpen(false)}
            title="Tally Ledger Export File Upload करा (Upload Ledger)"
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-[#002046] rounded-xl p-6 text-center bg-slate-50 transition-colors">
                <Upload size={24} className="mx-auto text-[#002046] mb-2" />
                <p className="text-xs font-bold text-slate-800 mb-1">Tally मधून Export केलेली Ledger List (.xlsx / .csv) निवडा</p>
                <div className="flex justify-center gap-2 mt-4">
                  <label className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5">
                    <Upload size={14} /> 📂 फाईल निवडा
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.xml"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadLedgerFile(e.target.files[0].name);
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUploadLedgerFile('Tally_Ledgers_Export_Sanmati.xlsx')}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    ⚡ Quick Demo Ledger Upload
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadLedgerModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RENDER: iii. Voucher and Transaction Transfer
  // ─────────────────────────────────────────────────────────────────────────

  const renderVouchers = () => (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Objective & Buttons Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-[#002046] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="text-base font-extrabold text-[#002046]">iii. Voucher and Transaction Transfer</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              <strong className="text-slate-800">उद्देश:</strong> Tally मधील आर्थिक व्यवहार ERP मध्ये आणणे (Receipt, Payment, Purchase, Sales, Bank, Cash).
            </p>
          </div>

          {/* 5 Required Buttons: Upload Voucher File, View Transactions, Import Transactions, Edit Entry, Delete Entry */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadVoucherModalOpen(true)}
              className="px-3.5 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={14} /> Upload Voucher File
            </button>

            <button
              type="button"
              onClick={handleImportAllVouchers}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={14} /> Import Transactions
            </button>

            <button
              type="button"
              onClick={() => setIsAddVoucherModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> + New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Filter and View Transactions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
              <Filter size={13} /> View:
            </span>
            {['All', 'Receipt', 'Payment', 'Purchase', 'Sales', 'Contra'].map(vt => (
              <button
                key={vt}
                type="button"
                onClick={() => setVoucherTypeFilter(vt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  voucherTypeFilter === vt
                    ? 'bg-[#002046] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {vt}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={voucherSearch}
              onChange={(e) => setVoucherSearch(e.target.value)}
              placeholder="Party, Voucher किंवा Date शोधा..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002046]"
            />
          </div>
        </div>

        {/* Voucher Transactions Table (Matching User's Example) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Voucher</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Amount (₹)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions (Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-semibold">
                    कोणतेही Transactions सापडले नाहीत.
                  </td>
                </tr>
              ) : filteredVouchers.map(vch => (
                <tr key={vch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{vch.date}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{vch.voucher}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">{vch.party}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(vch.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} /> {vch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditVoucherModalItem(vch)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit2 size={12} /> Edit Entry
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteVoucher(vch.id)}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Upload Voucher File */}
      {isUploadVoucherModalOpen && (
        <Modal
          isOpen={isUploadVoucherModalOpen}
          onClose={() => setIsUploadVoucherModalOpen(false)}
          title="Tally Voucher File Upload करा (Upload Voucher File)"
        >
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-[#002046] rounded-xl p-6 text-center bg-slate-50 transition-colors">
              <Upload size={24} className="mx-auto text-[#002046] mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">Tally Daybook / Voucher Export File निवडा</p>
              <div className="flex justify-center gap-2 mt-4">
                <label className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5">
                  <Upload size={14} /> 📂 फाईल निवडा
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.xml"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setIsUploadVoucherModalOpen(false);
                        showToast(`Voucher File '${e.target.files[0].name}' अपलोड झाली! ✓`);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadVoucherModalOpen(false);
                    showToast('Sample Tally Voucher Data यशस्वीरित्या लोड झाला! ✓');
                  }}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ⚡ Sample Voucher File लोड करा
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsUploadVoucherModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add New Transaction Entry */}
      {isAddVoucherModalOpen && (
        <Modal
          isOpen={isAddVoucherModalOpen}
          onClose={() => setIsAddVoucherModalOpen(false)}
          title="नवीन Transaction नोंदवा (New Entry)"
        >
          <form onSubmit={handleSaveNewVoucher} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={voucherForm.date}
                  onChange={(e) => setVoucherForm({ ...voucherForm, date: e.target.value })}
                  placeholder="DD/MM/YY"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Type</label>
                <select
                  value={voucherForm.voucher}
                  onChange={(e) => setVoucherForm({ ...voucherForm, voucher: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                >
                  <option value="Receipt">Receipt (जमा)</option>
                  <option value="Payment">Payment (पेमेंट)</option>
                  <option value="Purchase">Purchase (खरेदी)</option>
                  <option value="Sales">Sales (विक्री)</option>
                  <option value="Contra">Contra (कॉन्ट्रा)</option>
                  <option value="Journal">Journal (जर्नल)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Party Name</label>
              <input
                type="text"
                value={voucherForm.party}
                onChange={(e) => setVoucherForm({ ...voucherForm, party: e.target.value })}
                placeholder="उदा. ABC Customer / XYZ Supplier"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (रक्कम ₹)</label>
              <input
                type="number"
                value={voucherForm.amount}
                onChange={(e) => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                placeholder="उदा. 50000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Narration</label>
              <input
                type="text"
                value={voucherForm.narration}
                onChange={(e) => setVoucherForm({ ...voucherForm, narration: e.target.value })}
                placeholder="उदा. Payment received via RTGS"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddVoucherModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Transaction Save करा
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Entry */}
      {editVoucherModalItem && (
        <Modal
          isOpen={Boolean(editVoucherModalItem)}
          onClose={() => setEditVoucherModalItem(null)}
          title="Transaction Edit करा (Edit Entry)"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditVoucherSave(editVoucherModalItem);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={editVoucherModalItem.date}
                  onChange={(e) => setEditVoucherModalItem({ ...editVoucherModalItem, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Type</label>
                <select
                  value={editVoucherModalItem.voucher}
                  onChange={(e) => setEditVoucherModalItem({ ...editVoucherModalItem, voucher: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                >
                  <option value="Receipt">Receipt</option>
                  <option value="Payment">Payment</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Sales">Sales</option>
                  <option value="Contra">Contra</option>
                  <option value="Journal">Journal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Party</label>
              <input
                type="text"
                value={editVoucherModalItem.party}
                onChange={(e) => setEditVoucherModalItem({ ...editVoucherModalItem, party: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={editVoucherModalItem.amount}
                onChange={(e) => setEditVoucherModalItem({ ...editVoucherModalItem, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditVoucherModalItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Update Entry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RENDER: iv. Data Verification
  // ─────────────────────────────────────────────────────────────────────────

  const renderVerification = () => {
    const totalDiff = verificationData.reduce((sum, v) => sum + Math.abs(v.diff), 0);

    return (
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Objective & Buttons Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#002046] text-white text-xs font-bold flex items-center justify-center">4</span>
                <h2 className="text-base font-extrabold text-[#002046]">iv. Data Verification</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-800">उद्देश:</strong> Tally आणि ERP मधील Accounting Data योग्य आहे का ते तपासणे (Balance Comparison + Correction + Verification).
              </p>
            </div>

            {/* 5 Required Buttons: Compare Data, View Difference, Correct Entry, Verify, Complete */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyAll}
                className="px-3.5 py-2 bg-[#002046] hover:bg-[#001736] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Compare Data
              </button>

              <button
                type="button"
                onClick={() => setOnlyDifferences(prev => !prev)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  onlyDifferences
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <AlertTriangle size={14} className={onlyDifferences ? 'text-amber-700' : 'text-slate-500'} />
                View Difference
              </button>

              <button
                type="button"
                onClick={handleVerifyAll}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> Verify
              </button>

              <button
                type="button"
                onClick={handleCompleteVerification}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckSquare size={14} /> Complete
              </button>
            </div>
          </div>
        </div>

        {/* Verification Complete Certificate (If Certified) */}
        {isVerificationComplete && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                  Tally &amp; ERP Accounting Data Verification: COMPLETED ✓
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  सर्व Transactions, Cash/Bank Balances आणि Ledgers ची अंतिम पडताळणी पूर्ण झाली आहे.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsVerificationComplete(false)}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              Re-verify
            </button>
          </div>
        )}

        {/* Balance Comparison Table (Matching User's Example) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Accounting Data Balance Comparison (तुलना तक्ता)
              </h3>
              <p className="text-xs text-slate-500">
                Cash, Bank, Purchase, Sales आणि इतर लेजर्सच्या शिल्लक रकमांची Tally विरुद्ध ERP तुलना
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              totalDiff > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {totalDiff > 0 ? `Net Difference: ${formatCurrency(totalDiff)}` : 'All Balances Matched ✓'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Details (तपशील)</th>
                  <th className="px-4 py-3">Tally (₹)</th>
                  <th className="px-4 py-3">ERP (₹)</th>
                  <th className="px-4 py-3">Difference (फरक)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVerification.map(item => {
                  const hasDiff = item.diff !== 0;

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${hasDiff ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {item.details}
                        {item.note && <span className="block text-[11px] text-amber-700 font-normal mt-0.5">{item.note}</span>}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(item.tally)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{formatCurrency(item.erp)}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {hasDiff ? (
                          <span className="text-rose-600">{item.diff < 0 ? `−${formatCurrency(Math.abs(item.diff))}` : `+${formatCurrency(item.diff)}`}</span>
                        ) : (
                          <span className="text-emerald-600">₹0 (Matched)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasDiff ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle size={12} /> Mismatch
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Matched ✓
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasDiff ? (
                          <button
                            type="button"
                            onClick={() => setCorrectModalItem(item)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Edit2 size={11} /> Correct Entry
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                            <Check size={13} /> Verified
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

        {/* Modal: Correct Entry */}
        {correctModalItem && (
          <Modal
            isOpen={Boolean(correctModalItem)}
            onClose={() => setCorrectModalItem(null)}
            title={`Correct Entry: ${correctModalItem.details}`}
          >
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              handleCorrectVerification({
                id: correctModalItem.id,
                newTally: Number(form.tallyAmount.value),
                newErp: Number(form.erpAmount.value),
                reason: form.reason.value
              });
            }} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <p className="font-bold mb-1">{correctModalItem.details}</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>Tally Balance: <strong>{formatCurrency(correctModalItem.tally)}</strong></div>
                  <div>ERP Balance: <strong>{formatCurrency(correctModalItem.erp)}</strong></div>
                </div>
                <p className="text-rose-600 font-bold mt-1.5">
                  तफावत (Difference): {formatCurrency(Math.abs(correctModalItem.diff))}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adjusted ERP Balance (योग्य रक्कम ₹)
                </label>
                <input
                  type="number"
                  name="erpAmount"
                  defaultValue={correctModalItem.tally}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Tally प्रमाणे रक्कम भरून Difference ₹० करा.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tally Balance (₹)
                </label>
                <input
                  type="number"
                  name="tallyAmount"
                  defaultValue={correctModalItem.tally}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correction Remark / कारण</label>
                <input
                  type="text"
                  name="reason"
                  defaultValue="Sales ₹10,000 difference re-imported and reconciled with Tally"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-white focus:ring-2 focus:ring-[#002046] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectModalItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Correct Entry Save करा
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER WITH ACTIVE TABS
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 pt-3 min-h-screen bg-slate-50 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold animate-fade-in ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* Render selected submodule */}
      {activeTab === 'integration' && renderIntegration()}
      {activeTab === 'sync' && renderSync()}
      {activeTab === 'vouchers' && renderVouchers()}
      {activeTab === 'verification' && renderVerification()}
    </div>
  );
};

export default TallyModule;
