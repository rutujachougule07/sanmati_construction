// MODULE 2: ACCOUNT MANAGEMENT - Complete Working Implementation
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Landmark, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Calendar, 
  Plus, CheckCircle, FileText, Receipt, BookOpen, BarChart3, TrendingUp, 
  Trash2, Edit3, Eye, Search, Filter, AlertTriangle, Download, RefreshCw, 
  CheckCircle2, XCircle, Clock, ShieldCheck, Printer, ArrowRightLeft, Layers, 
  Building, ChevronRight, User, Truck
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../services/exportService';

const PAYMENT_MODES = ['Bank Transfer', 'NEFT / RTGS', 'Cheque', 'UPI', 'Cash'];
const INCOME_CATEGORIES = [
  'RA Bill Payment',
  'Mobilization Advance',
  'Client Retention Release',
  'Architectural Consultation',
  'Scrap / Salvage Sale',
  'Other Civil Inflow'
];
const EXPENSE_CATEGORIES = [
  'Cement & Aggregates',
  'Steel Reinforcement',
  'Subcontractor Billing',
  'Labour Wages & Overtime',
  'Plant & Diesel Fuel',
  'Equipment Rental & Shuttering',
  'Site Statutory & Municipal Fees',
  'Petty Cash & Amenities'
];

const NFD_PURPOSES = [
  'Bank Guarantee Margin',
  'Tender EMD Deposit',
  'Performance Security Deposit',
  'Fixed Deposit / Term Deposit',
  'Company Liquidity Reserve',
  'Other Statutory Deposit'
];

const NFD_BANKS = [
  'State Bank of India (SBI)',
  'Bank of Maharashtra',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Other Commercial Bank'
];

const NFD_STATUSES = ['Active', 'Matured', 'Pledged / Lien', 'Liquidated / Closed'];

export const AccountsModule = () => {
  const { 
    clients = [], 
    vendors = [], 
    projects = [],
    hrmsEmployees = [],
    incomeRecords = [],
    expenseRecords = [],
    paymentTracking = [],
    ledgerEntries = [],
    nfdRecords = [],
    addIncomeRecord,
    updateIncomeRecord,
    deleteIncomeRecord,
    reverseIncomeRecord,
    addExpenseRecord,
    updateExpenseRecord,
    deleteExpenseRecord,
    reverseExpenseRecord,
    addPaymentInvoice,
    recordPayment,
    addLedgerEntry,
    reverseLedgerEntry,
    addNfdRecord,
    updateNfdRecord,
    deleteNfdRecord
  } = useERPData();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'records';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // -------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------
  // Subsection 1: Income & Expense
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // { txn, type: 'income' | 'expense' }
  const [selectedTxnDossier, setSelectedTxnDossier] = useState(null);
  const [txnToDelete, setTxnToDelete] = useState(null);
  const [txnToReverse, setTxnToReverse] = useState(null); // { id, type, reason: '' }
  const [incomeValidationErrors, setIncomeValidationErrors] = useState({});
  const [expenseValidationErrors, setExpenseValidationErrors] = useState({});

  // Subsection 2: Payment Tracking
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [paymentToRecord, setPaymentToRecord] = useState(null); // Invoice selected for payment
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);
  const [selectedReceiptPrint, setSelectedReceiptPrint] = useState(null);

  // Subsection 3: Account Ledger
  const [ledgerType, setLedgerType] = useState('Customer'); // Customer | Vendor
  const [selectedPartyLedger, setSelectedPartyLedger] = useState('All');
  const [isLedgerEntryModalOpen, setIsLedgerEntryModalOpen] = useState(false);
  const [ledgerEntryToReverse, setLedgerEntryToReverse] = useState(null);

  // Subsection 4: Summaries
  const [summaryPeriod, setSummaryPeriod] = useState('yearly'); // monthly | yearly | project
  const [summaryProjectFilter, setSummaryProjectFilter] = useState('All');

  // Subsection 5: NFD
  const [isNfdModalOpen, setIsNfdModalOpen] = useState(false);
  const [editingNfd, setEditingNfd] = useState(null);
  const [selectedNfdDossier, setSelectedNfdDossier] = useState(null);
  const [nfdToDelete, setNfdToDelete] = useState(null);

  // -------------------------------------------------------------
  // FILTERS
  // -------------------------------------------------------------
  const [recordsTypeFilter, setRecordsTypeFilter] = useState('All'); // All | Income | Expense
  const [recordsProjectFilter, setRecordsProjectFilter] = useState('All');
  const [recordsDateFrom, setRecordsDateFrom] = useState('');
  const [recordsDateTo, setRecordsDateTo] = useState('');

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All'); // All | Paid | Partial | Pending | Overdue
  const [paymentCustomerFilter, setPaymentCustomerFilter] = useState('All');

  const [nfdSearchTerm, setNfdSearchTerm] = useState('');
  const [nfdStatusFilter, setNfdStatusFilter] = useState('All');
  const [nfdBankFilter, setNfdBankFilter] = useState('All');

  // -------------------------------------------------------------
  // FORMS
  // -------------------------------------------------------------
  const [incomeForm, setIncomeForm] = useState({
    id: '',
    voucherNumber: '',
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    customerName: '',
    category: 'RA Bill Payment',
    description: '',
    amount: '',
    receivedAmount: '',
    paymentMode: 'Bank Transfer',
    referenceNumber: '',
    receiptAttachment: '',
    status: 'Paid'
  });

  const [expenseForm, setExpenseForm] = useState({
    id: '',
    voucherNumber: '',
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    vendorName: '',
    category: 'Cement & Aggregates',
    description: '',
    amount: '',
    paidAmount: '',
    paymentMode: 'Bank Transfer',
    referenceNumber: '',
    billAttachment: '',
    status: 'Paid'
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    customerName: '',
    projectName: '',
    invoiceNumber: '',
    invoiceAmount: '',
    paidAmount: '0',
    paymentDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    referenceNo: ''
  });

  const [paymentEntryForm, setPaymentEntryForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    referenceNo: '',
    notes: ''
  });

  const [manualLedgerForm, setManualLedgerForm] = useState({
    accountName: '',
    accountType: 'Customer',
    date: new Date().toISOString().split('T')[0],
    transactionType: 'Debit',
    referenceNumber: '',
    description: '',
    debitAmount: '0',
    creditAmount: '0'
  });

  const [reversalReason, setReversalReason] = useState('');

  const [nfdForm, setNfdForm] = useState({
    id: '',
    nfdNumber: '',
    bankName: 'State Bank of India (SBI)',
    branchName: '',
    accountHolder: 'SANMATI CONSTRUCTIONS',
    projectName: '',
    depositAmount: '',
    interestRate: '7.25',
    depositDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    maturityAmount: '',
    purpose: 'Bank Guarantee Margin',
    lienTo: 'Executive Engineer, PWD Kolhapur',
    status: 'Active',
    attachment: '',
    remarks: ''
  });

  // -------------------------------------------------------------
  // 1. INCOME AND EXPENSE RECORDS HANDLERS & HELPERS
  // -------------------------------------------------------------
  const generateIncomeVoucherNo = () => {
    const yearShort = new Date().getFullYear().toString().slice(-2);
    const existingNums = incomeRecords.map(r => {
      const val = r.voucherNumber || r.id || '';
      const match = val.match(/VCH-INC-\d+-(\d+)/i) || val.match(/INC-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(n => !isNaN(n) && n > 0);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : (incomeRecords.length + 1);
    return `VCH-INC-${yearShort}-${String(nextNum).padStart(4, '0')}`;
  };

  const generateExpenseVoucherNo = () => {
    const yearShort = new Date().getFullYear().toString().slice(-2);
    const existingNums = expenseRecords.map(r => {
      const val = r.voucherNumber || r.id || '';
      const match = val.match(/VCH-EXP-\d+-(\d+)/i) || val.match(/EXP-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(n => !isNaN(n) && n > 0);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : (expenseRecords.length + 1);
    return `VCH-EXP-${yearShort}-${String(nextNum).padStart(4, '0')}`;
  };

  const handleOpenAddIncome = () => {
    setEditingTransaction(null);
    setIncomeValidationErrors({});
    const newVoucher = generateIncomeVoucherNo();
    const defaultClient = clients[0];
    const initialCustomer = defaultClient?.name || '';
    const initialProject = defaultClient?.assignedProject || projects[0]?.name || '';
    setIncomeForm({
      id: '',
      voucherNumber: newVoucher,
      date: new Date().toISOString().split('T')[0],
      projectName: initialProject,
      customerName: initialCustomer,
      category: 'RA Bill Payment',
      description: '',
      amount: '',
      receivedAmount: '',
      paymentMode: 'Bank Transfer',
      referenceNumber: `UTR-${Date.now().toString().slice(-6)}`,
      receiptAttachment: '',
      status: 'Paid'
    });
    setIsIncomeModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setEditingTransaction(null);
    setExpenseValidationErrors({});
    const newVoucher = generateExpenseVoucherNo();
    const defaultPayee = vendors[0]?.name || (hrmsEmployees[0]?.name ? `${hrmsEmployees[0].name} (Employee)` : '');
    setExpenseForm({
      id: '',
      voucherNumber: newVoucher,
      date: new Date().toISOString().split('T')[0],
      projectName: projects[0]?.name || '',
      vendorName: defaultPayee,
      category: 'Cement & Aggregates',
      description: '',
      amount: '',
      paidAmount: '',
      paymentMode: 'Bank Transfer',
      referenceNumber: `BILL-${Date.now().toString().slice(-4)}`,
      billAttachment: '',
      status: 'Paid'
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditTransaction = (txn) => {
    if (txn.recordType === 'Income') {
      setEditingTransaction({ txn, type: 'income' });
      setIncomeValidationErrors({});
      setIncomeForm({
        id: txn.id,
        voucherNumber: txn.voucherNumber || txn.id,
        date: txn.date || new Date().toISOString().split('T')[0],
        projectName: txn.projectName || (projects[0]?.name || ''),
        customerName: txn.customerName || txn.party || '',
        category: txn.category || 'RA Bill Payment',
        description: txn.description || '',
        amount: String(txn.totalAmount || txn.amount || ''),
        receivedAmount: String(txn.receivedAmount !== undefined ? txn.receivedAmount : (txn.paidOrReceivedAmount || txn.amount || '')),
        paymentMode: txn.paymentMode || 'Bank Transfer',
        referenceNumber: txn.referenceNumber || '',
        receiptAttachment: txn.receiptAttachment || '',
        status: txn.status || 'Paid'
      });
      setIsIncomeModalOpen(true);
    } else {
      setEditingTransaction({ txn, type: 'expense' });
      setExpenseValidationErrors({});
      setExpenseForm({
        id: txn.id,
        voucherNumber: txn.voucherNumber || txn.id,
        date: txn.date || new Date().toISOString().split('T')[0],
        projectName: txn.projectName || (projects[0]?.name || ''),
        vendorName: txn.vendorName || txn.party || '',
        category: txn.category || 'Cement & Aggregates',
        description: txn.description || '',
        amount: String(txn.totalAmount || txn.amount || ''),
        paidAmount: String(txn.paidAmount !== undefined ? txn.paidAmount : (txn.paidOrReceivedAmount || txn.amount || '')),
        paymentMode: txn.paymentMode || 'Bank Transfer',
        referenceNumber: txn.referenceNumber || '',
        billAttachment: txn.billAttachment || '',
        status: txn.status || 'Paid'
      });
      setIsExpenseModalOpen(true);
    }
  };

  const validateIncomeForm = () => {
    const errors = {};
    if (!incomeForm.date) errors.date = 'Receipt date is required.';
    if (!incomeForm.customerName?.trim()) errors.customerName = 'Customer / Payer name is required.';
    if (!incomeForm.projectName?.trim()) errors.projectName = 'Associated project is required.';
    const amt = Number(incomeForm.amount);
    if (!incomeForm.amount || isNaN(amt) || amt <= 0) {
      errors.amount = 'Please enter a valid amount greater than ₹0.';
    }
    const recAmt = incomeForm.receivedAmount !== '' ? Number(incomeForm.receivedAmount) : amt;
    if (isNaN(recAmt) || recAmt < 0) {
      errors.receivedAmount = 'Received amount cannot be negative.';
    } else if (recAmt > amt) {
      errors.receivedAmount = 'Received amount cannot exceed total billed amount.';
    }
    setIncomeValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateExpenseForm = () => {
    const errors = {};
    if (!expenseForm.date) errors.date = 'Expense date is required.';
    if (!expenseForm.vendorName?.trim()) errors.vendorName = 'Vendor / Payee name is required.';
    if (!expenseForm.projectName?.trim()) errors.projectName = 'Associated project is required.';
    const amt = Number(expenseForm.amount);
    if (!expenseForm.amount || isNaN(amt) || amt <= 0) {
      errors.amount = 'Please enter a valid bill amount greater than ₹0.';
    }
    const pdAmt = expenseForm.paidAmount !== '' ? Number(expenseForm.paidAmount) : amt;
    if (isNaN(pdAmt) || pdAmt < 0) {
      errors.paidAmount = 'Paid amount cannot be negative.';
    } else if (pdAmt > amt) {
      errors.paidAmount = 'Paid amount cannot exceed total bill amount.';
    }
    setExpenseValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitIncome = (e) => {
    e.preventDefault();
    if (!validateIncomeForm()) return;

    const totalAmt = Number(incomeForm.amount) || 0;
    const recAmt = incomeForm.receivedAmount !== '' ? (Number(incomeForm.receivedAmount) || 0) : totalAmt;
    const pendingAmt = Math.max(0, totalAmt - recAmt);
    const calculatedStatus = pendingAmt === 0 ? 'Paid' : (recAmt > 0 ? 'Partial' : 'Pending');

    const payload = {
      ...incomeForm,
      amount: totalAmt,
      receivedAmount: recAmt,
      pendingAmount: pendingAmt,
      status: calculatedStatus,
      voucherNumber: incomeForm.voucherNumber || generateIncomeVoucherNo()
    };

    if (editingTransaction?.type === 'income') {
      updateIncomeRecord(editingTransaction.txn.id, payload);
      setEditingTransaction(null);
    } else {
      addIncomeRecord(payload);
    }
    setIsIncomeModalOpen(false);
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (!validateExpenseForm()) return;

    const totalAmt = Number(expenseForm.amount) || 0;
    const pdAmt = expenseForm.paidAmount !== '' ? (Number(expenseForm.paidAmount) || 0) : totalAmt;
    const pendingAmt = Math.max(0, totalAmt - pdAmt);
    const calculatedStatus = pendingAmt === 0 ? 'Paid' : (pdAmt > 0 ? 'Partial' : 'Pending');

    const payload = {
      ...expenseForm,
      amount: totalAmt,
      paidAmount: pdAmt,
      pendingAmount: pendingAmt,
      status: calculatedStatus,
      voucherNumber: expenseForm.voucherNumber || generateExpenseVoucherNo()
    };

    if (editingTransaction?.type === 'expense') {
      updateExpenseRecord(editingTransaction.txn.id, payload);
      setEditingTransaction(null);
    } else {
      addExpenseRecord(payload);
    }
    setIsExpenseModalOpen(false);
  };

  const handleConfirmDeleteTxn = () => {
    if (!txnToDelete) return;
    if (txnToDelete.recordType === 'Income') {
      deleteIncomeRecord(txnToDelete.id);
    } else {
      deleteExpenseRecord(txnToDelete.id);
    }
    setTxnToDelete(null);
  };

  const handleConfirmReversal = () => {
    if (!txnToReverse) return;
    if (txnToReverse.type === 'income') {
      reverseIncomeRecord(txnToReverse.id, reversalReason || 'Cancelled by Accountant');
    } else {
      reverseExpenseRecord(txnToReverse.id, reversalReason || 'Cancelled by Accountant');
    }
    setTxnToReverse(null);
    setReversalReason('');
  };

  // Deduplicated unique projects for Inflow / Income modal
  const uniqueIncomeProjects = useMemo(() => {
    const list = [];
    const seen = new Set();

    // If customer is selected in income form, prioritize their assigned project
    if (incomeForm.customerName) {
      const activeClient = clients.find(c => c.name === incomeForm.customerName || c.companyName === incomeForm.customerName);
      if (activeClient?.assignedProject) {
        const key = activeClient.assignedProject.toLowerCase().trim();
        seen.add(key);
        list.push({
          value: activeClient.assignedProject,
          label: `${activeClient.assignedProject} (${activeClient.name})`
        });
      }
    }

    // Projects from Projects Master
    projects.forEach(p => {
      if (p.name) {
        const key = p.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            value: p.name,
            label: p.location ? `${p.name} (${p.location})` : p.name
          });
        }
      }
    });

    // Projects from other clients
    clients.forEach(c => {
      if (c.assignedProject) {
        const key = c.assignedProject.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            value: c.assignedProject,
            label: `${c.assignedProject} (${c.name})`
          });
        }
      }
    });

    return list;
  }, [projects, clients, incomeForm.customerName]);

  // Combine Income & Expenses into unified transaction view
  const combinedTransactions = useMemo(() => {
    const incomes = incomeRecords.map(i => {
      const totalAmt = Number(i.amount) || 0;
      const recAmt = i.receivedAmount !== undefined ? (Number(i.receivedAmount) || 0) : totalAmt;
      const pendingAmt = i.pendingAmount !== undefined ? Number(i.pendingAmount) : Math.max(0, totalAmt - recAmt);
      return {
        ...i,
        recordType: 'Income',
        party: i.customerName || 'Direct Client Inflow',
        voucherNumber: i.voucherNumber || i.id,
        totalAmount: totalAmt,
        paidOrReceivedAmount: recAmt,
        pendingAmount: pendingAmt,
        inward: i.status === 'Cancelled' ? 0 : recAmt,
        outward: 0
      };
    });

    const expenses = expenseRecords.map(e => {
      const totalAmt = Number(e.amount) || 0;
      const pdAmt = e.paidAmount !== undefined ? (Number(e.paidAmount) || 0) : totalAmt;
      const pendingAmt = e.pendingAmount !== undefined ? Number(e.pendingAmount) : Math.max(0, totalAmt - pdAmt);
      return {
        ...e,
        recordType: 'Expense',
        party: e.vendorName || 'General Supplier / Labour',
        voucherNumber: e.voucherNumber || e.id,
        totalAmount: totalAmt,
        paidOrReceivedAmount: pdAmt,
        pendingAmount: pendingAmt,
        inward: 0,
        outward: e.status === 'Cancelled' ? 0 : pdAmt
      };
    });

    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomeRecords, expenseRecords]);

  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter(t => {
      if (recordsTypeFilter !== 'All' && t.recordType !== recordsTypeFilter) return false;
      if (recordsProjectFilter !== 'All' && t.projectName !== recordsProjectFilter) return false;
      if (recordsDateFrom && t.date < recordsDateFrom) return false;
      if (recordsDateTo && t.date > recordsDateTo) return false;
      return true;
    });
  }, [combinedTransactions, recordsTypeFilter, recordsProjectFilter, recordsDateFrom, recordsDateTo]);

  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions.filter(t => t.recordType === 'Income' && t.status !== 'Cancelled')
      .reduce((acc, t) => acc + (t.inward || 0), 0);
  }, [filteredTransactions]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions.filter(t => t.recordType === 'Expense' && t.status !== 'Cancelled')
      .reduce((acc, t) => acc + (t.outward || 0), 0);
  }, [filteredTransactions]);

  const handleExportRecordsPDF = () => {
    generatePDFReport({
      title: "SANMATI CONSTRUCTIONS - INCOME & EXPENSE LEDGER VOUCHER",
      subtitle: `Official Transaction Register | Kolhapur HQ | Net Cashflow: ${formatCurrency(totalFilteredIncome - totalFilteredExpense)}`,
      headers: ["Voucher No", "Date", "Type", "Party", "Project", "Received / Paid (₹)", "Pending (₹)", "Status"],
      rows: filteredTransactions.map(t => [
        t.voucherNumber || t.id,
        t.date,
        t.recordType,
        t.party,
        t.projectName,
        t.recordType === 'Income' ? (t.inward > 0 ? formatCurrency(t.inward) : '₹0') : (t.outward > 0 ? formatCurrency(t.outward) : '₹0'),
        t.pendingAmount > 0 ? formatCurrency(t.pendingAmount) : '—',
        t.status || 'Active'
      ]),
      fileName: "Sanmati_Income_Expense_Register",
      orientation: "landscape"
    });
  };

  const transactionColumns = [
    { 
      key: 'voucherNumber', 
      header: 'Voucher No', 
      minWidth: '140px', 
      nowrap: true, 
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap ${
          row.recordType === 'Income' ? 'text-emerald-700' : 'text-red-700'
        }`}>
          {row.voucherNumber || row.id}
        </span>
      )
    },
    { 
      key: 'date', 
      header: 'Date', 
      minWidth: '110px', 
      nowrap: true, 
      render: (row) => <span className="font-semibold text-slate-800 whitespace-nowrap">{formatDate(row.date)}</span> 
    },
    {
      key: 'recordType',
      header: 'Type',
      align: 'center',
      minWidth: '110px',
      nowrap: true,
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
          row.recordType === 'Income' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {row.recordType === 'Income' ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />}
          <span>{row.recordType}</span>
        </span>
      )
    },
    {
      key: 'party',
      header: 'Party & Category',
      minWidth: '220px',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block leading-snug">{row.party}</span>
          <span className="text-[11px] text-slate-500 font-medium">{row.category}</span>
        </div>
      )
    },
    {
      key: 'projectName',
      header: 'Project Name',
      minWidth: '190px',
      render: (row) => (
        <div className="truncate max-w-[180px]" title={row.projectName}>
          <span className="inline-flex items-center gap-1 text-xs text-slate-700">
            <Building className="w-3 h-3 text-red-600 flex-shrink-0" />
            <span className="truncate">{row.projectName}</span>
          </span>
        </div>
      )
    },
    {
      key: 'inward',
      header: 'Inward (₹ Income)',
      align: 'right',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <div>
          <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${
            row.inward > 0 ? 'text-emerald-600' : 'text-slate-300'
          }`}>
            {row.inward > 0 ? formatCurrency(row.inward) : '—'}
          </span>
          {row.recordType === 'Income' && row.pendingAmount > 0 && (
            <span className="block text-[10px] text-amber-600 font-medium whitespace-nowrap">
              Pending: {formatCurrency(row.pendingAmount)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'outward',
      header: 'Outward (₹ Expense)',
      align: 'right',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <div>
          <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${
            row.outward > 0 ? 'text-rose-600' : 'text-slate-300'
          }`}>
            {row.outward > 0 ? formatCurrency(row.outward) : '—'}
          </span>
          {row.recordType === 'Expense' && row.pendingAmount > 0 && (
            <span className="block text-[10px] text-amber-600 font-medium whitespace-nowrap">
              Pending: {formatCurrency(row.pendingAmount)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      minWidth: '120px',
      nowrap: true,
      render: (row) => {
        if (row.status === 'Cancelled') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-slate-100 text-slate-600 border-slate-300 line-through">
              Cancelled
            </span>
          );
        }
        if (row.status === 'Partial') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">
              Partial
            </span>
          );
        }
        if (row.status === 'Pending') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-rose-50 text-rose-700 border-rose-200">
              Pending
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
            {row.status || 'Paid'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => setSelectedTxnDossier(row)}
            title="View Voucher Dossier"
            className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEditTransaction(row)}
            title="Edit Transaction"
            className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTxnToDelete(row)}
            title="Delete Transaction"
            className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {row.status !== 'Cancelled' && (
            <button
              onClick={() => setTxnToReverse({ id: row.id, type: row.recordType.toLowerCase(), reason: '' })}
              title="Reverse / Cancel Voucher (Audit Preserved)"
              className="p-1.5 bg-slate-100 hover:bg-amber-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  // -------------------------------------------------------------
  // 2. PAYMENT TRACKING HANDLERS
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenNewInvoice = () => {
    setNewInvoiceForm({
      customerName: clients[0]?.name || '',
      projectName: projects[0]?.name || '',
      invoiceNumber: `RA-INV-${Date.now().toString().slice(-4)}`,
      invoiceAmount: '',
      paidAmount: '0',
      paymentDate: todayStr,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      paymentMode: 'Bank Transfer',
      referenceNo: `UTR-${Date.now().toString().slice(-6)}`
    });
    setIsNewInvoiceModalOpen(true);
  };

  const handleSubmitNewInvoice = (e) => {
    e.preventDefault();
    addPaymentInvoice(newInvoiceForm);
    setIsNewInvoiceModalOpen(false);
  };

  const handleOpenRecordPayment = (payment) => {
    setPaymentToRecord(payment);
    setPaymentEntryForm({
      amount: String(payment.remainingAmount || payment.invoiceAmount),
      paymentDate: todayStr,
      paymentMode: 'Bank Transfer',
      referenceNo: `UTR-${Date.now().toString().slice(-6)}`,
      notes: `Partial settlement for ${payment.invoiceNumber}`
    });
  };

  const handleSubmitRecordedPayment = (e) => {
    e.preventDefault();
    if (!paymentToRecord) return;
    recordPayment(
      paymentToRecord.id,
      Number(paymentEntryForm.amount) || 0,
      paymentEntryForm.paymentMode,
      paymentEntryForm.paymentDate,
      paymentEntryForm.referenceNo,
      paymentEntryForm.notes
    );
    setPaymentToRecord(null);
  };

  const filteredPayments = useMemo(() => {
    return paymentTracking.filter(p => {
      if (paymentStatusFilter !== 'All' && p.paymentStatus !== paymentStatusFilter) return false;
      if (paymentCustomerFilter !== 'All' && p.customerName !== paymentCustomerFilter) return false;
      return true;
    });
  }, [paymentTracking, paymentStatusFilter, paymentCustomerFilter]);

  const totalInvoicedAmount = useMemo(() => {
    return paymentTracking.reduce((acc, p) => acc + (p.invoiceAmount || 0), 0);
  }, [paymentTracking]);

  const totalCollectedAmount = useMemo(() => {
    return paymentTracking.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  }, [paymentTracking]);

  const totalPendingReceivable = useMemo(() => {
    return paymentTracking.reduce((acc, p) => acc + (p.remainingAmount || 0), 0);
  }, [paymentTracking]);

  const overdueInvoicesCount = useMemo(() => {
    return paymentTracking.filter(p => p.paymentStatus === 'Overdue' || (p.remainingAmount > 0 && p.dueDate < todayStr)).length;
  }, [paymentTracking, todayStr]);

  const paymentColumns = [
    { 
      key: 'invoiceNumber', 
      header: 'Invoice No', 
      minWidth: '130px', 
      nowrap: true, 
      render: (row) => <span className="font-mono font-bold text-red-600 whitespace-nowrap">{row.invoiceNumber}</span> 
    },
    {
      key: 'customerName',
      header: 'Customer / Project',
      minWidth: '220px',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block leading-snug">{row.customerName}</span>
          <span className="text-[11px] text-slate-500 font-medium">{row.projectName}</span>
        </div>
      )
    },
    {
      key: 'invoiceAmount',
      header: 'Invoice Amount',
      align: 'right',
      minWidth: '140px',
      nowrap: true,
      render: (row) => <span className="font-mono font-bold text-slate-900 whitespace-nowrap">{formatCurrency(row.invoiceAmount)}</span>
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      align: 'right',
      minWidth: '140px',
      nowrap: true,
      render: (row) => <span className="font-mono font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(row.paidAmount)}</span>
    },
    {
      key: 'remainingAmount',
      header: 'Remaining Due',
      align: 'right',
      minWidth: '140px',
      nowrap: true,
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap ${row.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {formatCurrency(row.remainingAmount)}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      minWidth: '120px',
      nowrap: true,
      render: (row) => (
        <span className={`text-xs font-mono whitespace-nowrap ${
          row.dueDate < todayStr && row.remainingAmount > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'
        }`}>
          {formatDate(row.dueDate)}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      align: 'center',
      minWidth: '130px',
      nowrap: true,
      render: (row) => {
        let badge = 'bg-red-50 text-red-800 border-red-200';
        if (row.paymentStatus === 'Paid') badge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (row.paymentStatus === 'Partial') badge = 'bg-amber-50 text-amber-800 border-amber-200';
        if (row.paymentStatus === 'Overdue') badge = 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${badge}`}>
            {row.paymentStatus}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '190px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          {row.remainingAmount > 0 ? (
            <button
              onClick={() => handleOpenRecordPayment(row)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3 h-3" />
              <span>Record Pay</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Settled
            </span>
          )}
          <button
            onClick={() => setSelectedPaymentHistory(row)}
            title="View Partial Payment History"
            className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSelectedReceiptPrint(row)}
            title="Generate Receipt Voucher"
            className="p-1.5 bg-slate-100 hover:bg-slate-700 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  // -------------------------------------------------------------
  // 3. ACCOUNT LEDGER HANDLERS
  // -------------------------------------------------------------
  const partiesList = useMemo(() => {
    if (ledgerType === 'Customer') {
      return Array.from(new Set([
        ...clients.map(c => c.name),
        ...ledgerEntries.filter(l => l.accountType === 'Customer').map(l => l.accountName)
      ])).filter(Boolean);
    } else {
      return Array.from(new Set([
        ...vendors.map(v => v.name),
        ...ledgerEntries.filter(l => l.accountType === 'Vendor').map(l => l.accountName)
      ])).filter(Boolean);
    }
  }, [ledgerType, clients, vendors, ledgerEntries]);

  // Compute chronologically accurate running balances for selected party
  const partyLedgerWithRunningBalance = useMemo(() => {
    let entries = ledgerEntries.filter(l => l.accountType === ledgerType);
    if (selectedPartyLedger !== 'All') {
      entries = entries.filter(l => l.accountName === selectedPartyLedger);
    }

    // Sort chronologically ascending for ledger balance computation
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;
    const computed = sorted.map(item => {
      if (ledgerType === 'Customer') {
        // Customer Ledger: Debit increases receivable (+), Credit decreases (-)
        balance = balance + (item.debitAmount || 0) - (item.creditAmount || 0);
      } else {
        // Vendor Ledger: Credit increases payable (+), Debit settles (-)
        balance = balance + (item.creditAmount || 0) - (item.debitAmount || 0);
      }
      return {
        ...item,
        runningBalance: balance
      };
    });

    // Return in reverse chronological order for table viewing
    return computed.reverse();
  }, [ledgerEntries, ledgerType, selectedPartyLedger]);

  const handleOpenAddManualLedger = () => {
    setManualLedgerForm({
      accountName: partiesList[0] || (ledgerType === 'Customer' ? 'Customer Account' : 'Vendor Account'),
      accountType: ledgerType,
      date: todayStr,
      transactionType: 'Debit',
      referenceNumber: `ADJ-${Date.now().toString().slice(-4)}`,
      description: 'Opening Balance / Manual Ledger Adjustment',
      debitAmount: '0',
      creditAmount: '0'
    });
    setIsLedgerEntryModalOpen(true);
  };

  const handleSubmitManualLedger = (e) => {
    e.preventDefault();
    addLedgerEntry({
      accountName: manualLedgerForm.accountName,
      accountType: manualLedgerForm.accountType,
      date: manualLedgerForm.date,
      transactionType: manualLedgerForm.transactionType,
      referenceNumber: manualLedgerForm.referenceNumber,
      description: manualLedgerForm.description,
      debitAmount: Number(manualLedgerForm.debitAmount) || 0,
      creditAmount: Number(manualLedgerForm.creditAmount) || 0
    });
    setIsLedgerEntryModalOpen(false);
  };

  const handleExportLedgerPDF = () => {
    generatePDFReport({
      title: `SANMATI CONSTRUCTIONS - ${ledgerType.toUpperCase()} ACCOUNT LEDGER STATEMENT`,
      subtitle: `Party: ${selectedPartyLedger} | Kolhapur HQ | Closing Balance: ${formatCurrency(partyLedgerWithRunningBalance[0]?.runningBalance || 0)}`,
      headers: ["Voucher ID", "Date", "Party / Account", "Reference", "Description", "Debit (₹)", "Credit (₹)", "Balance (₹)"],
      rows: partyLedgerWithRunningBalance.map(l => [
        l.id,
        l.date,
        l.accountName,
        l.referenceNumber,
        l.description,
        l.debitAmount > 0 ? formatCurrency(l.debitAmount) : '—',
        l.creditAmount > 0 ? formatCurrency(l.creditAmount) : '—',
        formatCurrency(l.runningBalance)
      ]),
      fileName: `Sanmati_${ledgerType}_Ledger_${selectedPartyLedger.replace(/\s+/g, '_')}`,
      orientation: "landscape"
    });
  };

  const ledgerColumns = [
    { 
      key: 'id', 
      header: 'Voucher ID', 
      minWidth: '120px', 
      nowrap: true, 
      render: (row) => <span className="font-mono font-bold text-red-600 whitespace-nowrap">{row.id}</span> 
    },
    { 
      key: 'date', 
      header: 'Date', 
      minWidth: '110px', 
      nowrap: true, 
      render: (row) => <span className="font-semibold text-slate-800 whitespace-nowrap">{formatDate(row.date)}</span> 
    },
    {
      key: 'accountName',
      header: 'Account Name',
      minWidth: '200px',
      render: (row) => <span className="font-bold text-slate-900 block leading-snug">{row.accountName}</span>
    },
    {
      key: 'description',
      header: 'Particulars & Reference',
      minWidth: '230px',
      render: (row) => (
        <div>
          <span className="text-slate-800 font-medium block leading-snug">{row.description}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.referenceNumber}</span>
        </div>
      )
    },
    {
      key: 'debitAmount',
      header: 'Debit (₹)',
      align: 'right',
      minWidth: '130px',
      nowrap: true,
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${row.debitAmount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          {row.debitAmount > 0 ? formatCurrency(row.debitAmount) : '—'}
        </span>
      )
    },
    {
      key: 'creditAmount',
      header: 'Credit (₹)',
      align: 'right',
      minWidth: '130px',
      nowrap: true,
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${row.creditAmount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
          {row.creditAmount > 0 ? formatCurrency(row.creditAmount) : '—'}
        </span>
      )
    },
    {
      key: 'runningBalance',
      header: 'Running Balance',
      align: 'right',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <span className={`font-mono font-black whitespace-nowrap tabular-nums ${
          row.runningBalance > 0 ? (ledgerType === 'Customer' ? 'text-rose-600' : 'text-rose-600') : 'text-emerald-600'
        }`}>
          {formatCurrency(row.runningBalance)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Audit Action',
      align: 'center',
      minWidth: '120px',
      nowrap: true,
      render: (row) => (
        <button
          onClick={() => setLedgerEntryToReverse(row)}
          title="Reverse Ledger Entry with Audit Trail"
          className="px-2 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          Offset / Reverse
        </button>
      )
    }
  ];

  // -------------------------------------------------------------
  // 4. FINANCIAL SUMMARIES COMPUTATIONS
  // -------------------------------------------------------------
  const totalActualIncome = useMemo(() => {
    return incomeRecords.filter(i => i.status !== 'Cancelled').reduce((acc, i) => acc + (i.amount || 0), 0);
  }, [incomeRecords]);

  const totalActualExpense = useMemo(() => {
    return expenseRecords.filter(e => e.status !== 'Cancelled').reduce((acc, e) => acc + (e.amount || 0), 0);
  }, [expenseRecords]);

  const netActualProfit = totalActualIncome - totalActualExpense;

  const totalReceivedCollections = useMemo(() => {
    return paymentTracking.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  }, [paymentTracking]);

  const totalPendingReceivables = useMemo(() => {
    return paymentTracking.reduce((acc, p) => acc + (p.remainingAmount || 0), 0);
  }, [paymentTracking]);

  const totalVendorPayables = useMemo(() => {
    // Computed from vendor ledger balances or active payables
    const vendorEntries = ledgerEntries.filter(l => l.accountType === 'Vendor');
    const credits = vendorEntries.reduce((acc, l) => acc + (l.creditAmount || 0), 0);
    const debits = vendorEntries.reduce((acc, l) => acc + (l.debitAmount || 0), 0);
    return Math.max(0, credits - debits);
  }, [ledgerEntries]);

  // Project-wise Profitability Table
  const projectFinancialBreakdown = useMemo(() => {
    return projects.map(proj => {
      const pIncome = incomeRecords.filter(i => i.projectName === proj.name && i.status !== 'Cancelled')
        .reduce((acc, i) => acc + (i.amount || 0), 0);
      const pExpense = expenseRecords.filter(e => e.projectName === proj.name && e.status !== 'Cancelled')
        .reduce((acc, e) => acc + (e.amount || 0), 0);
      const profit = pIncome - pExpense;
      const margin = pIncome > 0 ? ((profit / pIncome) * 100).toFixed(1) : '0.0';

      return {
        name: proj.name,
        location: proj.location,
        contractValue: proj.contractValue || 0,
        income: pIncome,
        expense: pExpense,
        profit,
        margin
      };
    });
  }, [projects, incomeRecords, expenseRecords]);

  // Monthly Breakdown (Group actual transactions by Month)
  const monthlySummaryData = useMemo(() => {
    const monthsMap = {};
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    months.forEach(m => {
      monthsMap[m] = { month: m, income: 0, expense: 0, profit: 0 };
    });

    incomeRecords.filter(i => i.status !== 'Cancelled').forEach(i => {
      const date = new Date(i.date);
      const m = date.toLocaleString('default', { month: 'short' });
      if (monthsMap[m]) {
        monthsMap[m].income += (i.amount || 0) / 100000; // in Lakhs
        monthsMap[m].profit += (i.amount || 0) / 100000;
      }
    });

    expenseRecords.filter(e => e.status !== 'Cancelled').forEach(e => {
      const date = new Date(e.date);
      const m = date.toLocaleString('default', { month: 'short' });
      if (monthsMap[m]) {
        monthsMap[m].expense += (e.amount || 0) / 100000;
        monthsMap[m].profit -= (e.amount || 0) / 100000;
      }
    });

    return Object.values(monthsMap);
  }, [incomeRecords, expenseRecords]);

  // -------------------------------------------------------------
  // 5. NFD (NATIONAL / FIXED DEPOSIT REGISTER) HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddNfd = () => {
    setEditingNfd(null);
    const today = new Date().toISOString().split('T')[0];
    setNfdForm({
      id: '',
      nfdNumber: `NFD/KLP/${Date.now().toString().slice(-4)}`,
      bankName: 'State Bank of India (SBI)',
      branchName: 'Shahupuri Branch, Kolhapur',
      accountHolder: 'SANMATI CONSTRUCTIONS',
      projectName: projects[0]?.name || '',
      depositAmount: '',
      interestRate: '7.25',
      depositDate: today,
      maturityDate: '',
      maturityAmount: '',
      purpose: 'Bank Guarantee Margin',
      lienTo: 'Executive Engineer, PWD Kolhapur',
      status: 'Active',
      attachment: '',
      remarks: ''
    });
    setIsNfdModalOpen(true);
  };

  const handleOpenEditNfd = (nfd) => {
    setEditingNfd(nfd);
    setNfdForm({
      id: nfd.id,
      nfdNumber: nfd.nfdNumber || '',
      bankName: nfd.bankName || 'State Bank of India (SBI)',
      branchName: nfd.branchName || '',
      accountHolder: nfd.accountHolder || 'SANMATI CONSTRUCTIONS',
      projectName: nfd.projectName || '',
      depositAmount: nfd.depositAmount || '',
      interestRate: nfd.interestRate || '',
      depositDate: nfd.depositDate || new Date().toISOString().split('T')[0],
      maturityDate: nfd.maturityDate || '',
      maturityAmount: nfd.maturityAmount || '',
      purpose: nfd.purpose || 'Bank Guarantee Margin',
      lienTo: nfd.lienTo || '',
      status: nfd.status || 'Active',
      attachment: nfd.attachment || '',
      remarks: nfd.remarks || ''
    });
    setIsNfdModalOpen(true);
  };

  const handleSubmitNfd = (e) => {
    e.preventDefault();
    if (!nfdForm.nfdNumber?.trim() || !nfdForm.bankName?.trim() || !nfdForm.depositAmount) {
      alert('Please fill all required fields: NFD Number, Bank Name, and Deposit Amount.');
      return;
    }
    const payload = {
      ...nfdForm,
      depositAmount: Number(nfdForm.depositAmount) || 0,
      interestRate: Number(nfdForm.interestRate) || 0,
      maturityAmount: Number(nfdForm.maturityAmount) || Number(nfdForm.depositAmount) || 0
    };
    if (editingNfd) {
      updateNfdRecord(editingNfd.id, payload);
    } else {
      addNfdRecord(payload);
    }
    setIsNfdModalOpen(false);
  };

  const handleConfirmDeleteNfd = () => {
    if (nfdToDelete) {
      deleteNfdRecord(nfdToDelete.id);
      setNfdToDelete(null);
    }
  };

  const filteredNfdRecords = useMemo(() => {
    return nfdRecords.filter(item => {
      if (nfdStatusFilter !== 'All') {
        if (nfdStatusFilter === 'Active' && item.status !== 'Active' && item.status) return false;
        if (nfdStatusFilter === 'Pledged' && !item.status?.includes('Pledged') && (!item.lienTo || item.lienTo === 'None')) return false;
        if (nfdStatusFilter === 'Matured' && item.status !== 'Matured') return false;
        if (nfdStatusFilter === 'Liquidated' && item.status !== 'Liquidated / Closed') return false;
      }
      if (nfdBankFilter !== 'All' && item.bankName !== nfdBankFilter) return false;
      if (nfdSearchTerm.trim()) {
        const query = nfdSearchTerm.toLowerCase();
        const matchesNo = item.nfdNumber?.toLowerCase().includes(query);
        const matchesBank = item.bankName?.toLowerCase().includes(query);
        const matchesBranch = item.branchName?.toLowerCase().includes(query);
        const matchesProject = item.projectName?.toLowerCase().includes(query);
        const matchesPurpose = item.purpose?.toLowerCase().includes(query);
        const matchesLien = item.lienTo?.toLowerCase().includes(query);
        if (!matchesNo && !matchesBank && !matchesBranch && !matchesProject && !matchesPurpose && !matchesLien) {
          return false;
        }
      }
      return true;
    });
  }, [nfdRecords, nfdStatusFilter, nfdBankFilter, nfdSearchTerm]);

  const totalNfdDeposit = useMemo(() => {
    return filteredNfdRecords.reduce((sum, item) => sum + (Number(item.depositAmount) || 0), 0);
  }, [filteredNfdRecords]);

  const totalNfdMaturity = useMemo(() => {
    return filteredNfdRecords.reduce((sum, item) => sum + (Number(item.maturityAmount) || Number(item.depositAmount) || 0), 0);
  }, [filteredNfdRecords]);

  const totalActiveNfdCount = useMemo(() => {
    return filteredNfdRecords.filter(item => item.status === 'Active' || !item.status).length;
  }, [filteredNfdRecords]);

  const totalPledgedNfdAmount = useMemo(() => {
    return filteredNfdRecords
      .filter(item => item.status?.includes('Pledged') || (item.lienTo && item.lienTo !== 'None'))
      .reduce((sum, item) => sum + (Number(item.depositAmount) || 0), 0);
  }, [filteredNfdRecords]);

  // Excel Export Handler (User requirement: tithun tiii exel la dowenload vhaylaaaa pahijeeeee)
  const handleExportNfdExcel = () => {
    if (filteredNfdRecords.length === 0) {
      alert('No NDT records to export. Please add an NDT record first.');
      return;
    }
    const dataToExport = filteredNfdRecords.map((item, idx) => ({
      'Sr. No': idx + 1,
      'NDT / FDR Number': item.nfdNumber,
      'Bank Name': item.bankName,
      'Branch': item.branchName || 'Main Branch',
      'Account / Holder Name': item.accountHolder || 'SANMATI CONSTRUCTIONS',
      'Associated Project': item.projectName || 'General / Corporate',
      'Purpose / Facility': item.purpose || 'Bank Guarantee Margin',
      'Deposit Date': item.depositDate || '-',
      'Maturity Date': item.maturityDate || '-',
      'Deposit Amount (₹)': Number(item.depositAmount) || 0,
      'Interest Rate (% p.a.)': item.interestRate ? `${item.interestRate}%` : '-',
      'Maturity Amount (₹)': Number(item.maturityAmount) || Number(item.depositAmount) || 0,
      'Lien / Pledged To': item.lienTo || 'None',
      'Status': item.status || 'Active',
      'Remarks': item.remarks || '-'
    }));
    exportToExcel(dataToExport, 'SANMATI_NDT_Records_Register', 'NDT_Register');
  };

  const handleExportNfdPDF = () => {
    if (filteredNfdRecords.length === 0) {
      alert('No NDT records to export. Please add an NDT record first.');
      return;
    }
    generatePDFReport({
      title: "SANMATI CONSTRUCTIONS - NDT REGISTER",
      subtitle: `Total Records: ${filteredNfdRecords.length} | Exported: ${formatDate(new Date(), true)}`,
      headers: ["NDT No.", "Bank & Branch", "Project / Purpose", "Deposit Date", "Maturity Date", "Deposit (₹)", "Status"],
      rows: filteredNfdRecords.map(item => [
        item.nfdNumber,
        `${item.bankName}\n${item.branchName || ''}`,
        `${item.projectName || 'General'}\n${item.purpose}`,
        item.depositDate || '-',
        item.maturityDate || '-',
        `₹${Number(item.depositAmount).toLocaleString('en-IN')}`,
        item.status || 'Active'
      ]),
      fileName: "SANMATI_NDT_Report",
      orientation: "landscape"
    });
  };

  // =============================================================
  // RENDER UI
  // =============================================================
  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SUB-MODULE 1: INCOME AND EXPENSE RECORDS */}
      {/* ========================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                2. Account Management • Subsection (i)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Income and Expense Records
              </h2>
              <p className="text-xs text-slate-500">Record all project inflows, client billings, supplier vouchers, and subcontractor payments.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportRecordsPDF}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={handleOpenAddExpense}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
              <button
                onClick={handleOpenAddIncome}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Add Income</span>
              </button>
            </div>
          </div>

          {/* KPI Balance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Actual Inflow (Income)</span>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                {formatCurrency(totalFilteredIncome)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Billed client receipts</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Actual Outflow (Expense)</span>
              <div className="text-lg font-bold text-rose-600 font-mono mt-1">
                {formatCurrency(totalFilteredExpense)}
              </div>
              <span className="text-[11px] text-rose-600 font-medium">Material & labour disbursements</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Net Operating Cashflow</span>
              <div className={`text-2xl font-black font-mono mt-1 ${
                totalFilteredIncome >= totalFilteredExpense ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatCurrency(totalFilteredIncome - totalFilteredExpense)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Filtered Period Net Balance</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Type:</span>
                {['All', 'Income', 'Expense'].map(type => (
                  <button
                    key={type}
                    onClick={() => setRecordsTypeFilter(type)}
                    className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer focus:outline-none ${
                      recordsTypeFilter === type 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Project:</span>
                <select
                  value={recordsProjectFilter}
                  onChange={(e) => setRecordsProjectFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="All">All Projects ({projects.length})</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Date:</span>
                <input
                  type="date"
                  value={recordsDateFrom}
                  onChange={(e) => setRecordsDateFrom(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={recordsDateTo}
                  onChange={(e) => setRecordsDateTo(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                />
                {(recordsDateFrom || recordsDateTo) && (
                  <button
                    onClick={() => { setRecordsDateFrom(''); setRecordsDateTo(''); }}
                    className="text-slate-400 hover:text-slate-700 text-xs underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredTransactions.length}</strong> transactions
            </div>
          </div>

          {/* Transactions Table */}
          <DataTable
            columns={transactionColumns}
            data={filteredTransactions}
            searchKey={['voucherNumber', 'id', 'party', 'category', 'projectName', 'referenceNumber']}
            searchPlaceholder="Search by Voucher No, Party Name, Category, or Project..."
            title="Income & Expense Voucher Journal"
            exportFileName="Sanmati_Vouchers"
            emptyMessage="No financial transactions match your filter criteria."
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 2: PAYMENT TRACKING */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                2. Account Management • Subsection (ii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Client Payment Tracking & Receivables
              </h2>
              <p className="text-xs text-slate-500">Track client invoices, partial milestone receipts, aging overdues, and receipt generation.</p>
            </div>

            <button
              onClick={handleOpenNewInvoice}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Tax Invoice</span>
            </button>
          </div>

          {/* Payment Status Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Billed Invoices</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {formatCurrency(totalInvoicedAmount)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{paymentTracking.length} Invoices Tracked</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Collected (Paid)</span>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                {formatCurrency(totalCollectedAmount)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Settled into bank</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Pending Receivables</span>
              <div className="text-lg font-bold text-amber-600 font-mono mt-1">
                {formatCurrency(totalPendingReceivables)}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">Outstanding client balance</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Overdue Invoices Alert</span>
              <div className="text-lg font-bold text-rose-600 font-mono mt-1">
                {overdueInvoicesCount} Invoices
              </div>
              <span className="text-[11px] text-rose-600 font-medium">Past due date</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-bold mr-1 uppercase">Payment Status:</span>
              {['All', 'Pending', 'Partial', 'Overdue', 'Paid'].map(status => (
                <button
                  key={status}
                  onClick={() => setPaymentStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer focus:outline-none ${
                    paymentStatusFilter === status 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-bold uppercase">Customer:</span>
              <select
                value={paymentCustomerFilter}
                onChange={(e) => setPaymentCustomerFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-red-500"
              >
                <option value="All">All Customers</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            searchKey="invoiceNumber"
            searchPlaceholder="Search by invoice number, customer name, or project..."
            title="Invoice & Payment Ledger"
            exportFileName="Sanmati_Payments"
            emptyMessage="No payment invoices match your filter criteria."
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 3: ACCOUNT LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                2. Account Management • Subsection (iii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                General Ledger & Chronological Statement
              </h2>
              <p className="text-xs text-slate-500">Dual customer and vendor ledger accounts with running debit/credit balances and irreversible audit integrity.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportLedgerPDF}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Ledger Statement</span>
              </button>
              <button
                onClick={handleOpenAddManualLedger}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ledger Entry</span>
              </button>
            </div>
          </div>

          {/* Ledger Type Switcher & Party Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Customer vs Vendor Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => { setLedgerType('Customer'); setSelectedPartyLedger('All'); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ledgerType === 'Customer' 
                    ? 'bg-white text-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Ledger (Debtors)</span>
              </button>
              <button
                onClick={() => { setLedgerType('Vendor'); setSelectedPartyLedger('All'); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ledgerType === 'Vendor' 
                    ? 'bg-white text-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Vendor Ledger (Creditors)</span>
              </button>
            </div>

            {/* Select Party */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Account / Party:</span>
              <select
                value={selectedPartyLedger}
                onChange={(e) => setSelectedPartyLedger(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-red-500 min-w-[200px]"
              >
                <option value="All">All {ledgerType} Accounts</option>
                {partiesList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Running Balance Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-red-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider block">
                {ledgerType === 'Customer' ? 'Sundry Debtors Balance' : 'Sundry Creditors Balance'}
              </span>
              <h3 className="text-lg font-black mt-0.5">
                {selectedPartyLedger === 'All' ? `Consolidated ${ledgerType} Ledger` : selectedPartyLedger}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-slate-300 text-xs block">Closing Net Balance</span>
              <span className="text-2xl font-black font-mono text-amber-300">
                {formatCurrency(partyLedgerWithRunningBalance[0]?.runningBalance || 0)}
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <DataTable
            columns={ledgerColumns}
            data={partyLedgerWithRunningBalance}
            searchKey="description"
            searchPlaceholder="Search by particulars, reference number, or party..."
            title={`${ledgerType} General Ledger`}
            exportFileName={`Sanmati_${ledgerType}_Ledger`}
            emptyMessage={`No ledger transactions recorded for this ${ledgerType.toLowerCase()}.`}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 4: FINANCIAL SUMMARIES */}
      {/* ========================================================= */}
      {activeTab === 'summaries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                2. Account Management • Subsection (iv)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Enterprise Financial Summaries & Profitability
              </h2>
              <p className="text-xs text-slate-500">Live reconciliation of total actual income, expenses, profit/loss, and project-wise margins.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  generatePDFReport({
                    title: "SANMATI CONSTRUCTIONS - EXECUTIVE FINANCIAL AUDIT SUMMARY",
                    subtitle: `FY 2026-27 | Net Profit: ${formatCurrency(netActualProfit)} | Billed: ${formatCurrency(totalActualIncome)}`,
                    headers: ["Financial Head", "Amount (₹)", "Status / Notes"],
                    rows: [
                      ["Total Billed Actual Income", formatCurrency(totalActualIncome), "Client Inflows"],
                      ["Total Incurred Actual Expenses", formatCurrency(totalActualExpense), "Disbursed Costs"],
                      ["Net Realized Profit / (Loss)", formatCurrency(netActualProfit), netActualProfit >= 0 ? "Profitable" : "Deficit"],
                      ["Total Received Payments", formatCurrency(totalReceivedCollections), "In Bank"],
                      ["Pending Client Receivables", formatCurrency(totalPendingReceivables), "Sundry Debtors"],
                      ["Vendor Payables", formatCurrency(totalVendorPayables), "Sundry Creditors"]
                    ],
                    fileName: "Sanmati_Financial_Audit_Summary",
                    orientation: "portrait"
                  });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Executive PDF</span>
              </button>
            </div>
          </div>

          {/* Primary 6 Metrics Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Total Income</span>
              <div className="text-xl font-black text-emerald-600 font-mono mt-1">
                {formatCurrency(totalActualIncome)}
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Realized</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Total Expenses</span>
              <div className="text-xl font-black text-rose-600 font-mono mt-1">
                {formatCurrency(totalActualExpense)}
              </div>
              <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Disbursed</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Total Profit / Loss</span>
              <div className={`text-xl font-black font-mono mt-1 ${netActualProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(netActualProfit)}
              </div>
              <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Net Realized</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Received Payments</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {formatCurrency(totalReceivedCollections)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">In Bank A/c</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Pending Payments</span>
              <div className="text-xl font-black text-amber-600 font-mono mt-1">
                {formatCurrency(totalPendingReceivables)}
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Receivables</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Vendor Payables</span>
              <div className="text-xl font-black text-purple-600 font-mono mt-1">
                {formatCurrency(totalVendorPayables)}
              </div>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">Creditors</span>
            </div>
          </div>

          {/* Monthly Inflow vs Outflow Cashflow Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Monthly Financial Summary (₹ Lakhs)
                </h3>
                <p className="text-xs text-slate-500">Calculated strictly from actual posted vouchers across FY 2026-27.</p>
              </div>
            </div>

            <div className="h-64 w-full">
              {totalActualIncome > 0 || totalActualExpense > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                      formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="income" name="Actual Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Actual Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No Monthly Summary Records</p>
                  <p className="text-xs text-slate-400 mt-0.5">Post an income or expense voucher to populate live financial charts.</p>
                </div>
              )}
            </div>
          </div>

          {/* Project-Wise Profitability Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Project-Wise Profitability & Margin Realization
              </h3>
              <p className="text-xs text-slate-500">Income received vs actual cost spent per civil construction project.</p>
            </div>

            <div className="overflow-x-auto w-full custom-table-scroll">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">Project Name</th>
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Contract Value</th>
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Actual Inflow (₹)</th>
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Actual Outflow (₹)</th>
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Net Margin (₹)</th>
                    <th className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {projectFinancialBreakdown.length > 0 ? (
                    projectFinancialBreakdown.map((p, idx) => (
                      <tr key={idx} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-3.5 py-2 font-bold text-slate-900">
                          {p.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{p.location}</span>
                        </td>
                        <td className="px-3.5 py-2 font-mono text-slate-700 text-right">{formatCurrency(p.contractValue)}</td>
                        <td className="px-3.5 py-2 font-mono font-bold text-emerald-600 text-right">{formatCurrency(p.income)}</td>
                        <td className="px-3.5 py-2 font-mono font-bold text-rose-600 text-right">{formatCurrency(p.expense)}</td>
                        <td className={`px-3.5 py-2 font-mono font-bold text-right ${p.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrency(p.profit)}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            Number(p.margin) >= 15 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.margin}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                        No projects available for financial analysis.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 5: NDT (v. NDT) */}
      {/* ========================================================= */}
      {(activeTab === 'nfd' || activeTab === 'ndt') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">
                2. Account Management • Subsection (v)
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  v. NDT Records & Register
                </h2>
                <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-200">
                  {nfdRecords.length} {nfdRecords.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                NDT deposits, Bank Guarantee security margins, EMD deposits, and maturity tracking with instant Excel download.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportNfdExcel}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Download NDT Register directly to Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
              <button
                onClick={handleExportNfdPDF}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Export PDF Report"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={handleOpenAddNfd}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add NDT Record</span>
              </button>
            </div>
          </div>

          {/* KPI Balance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total NDT Deposit</span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-1">
                {formatCurrency(totalNfdDeposit)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{filteredNfdRecords.length} registered deposits</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Maturity Value Realizable</span>
              <div className="text-lg font-bold text-emerald-600 font-mono mt-1">
                {formatCurrency(totalNfdMaturity)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Principal + interest accumulation</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Pledged / BG Lien Margin</span>
              <div className="text-lg font-bold text-amber-600 font-mono mt-1">
                {formatCurrency(totalPledgedNfdAmount)}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">Tender / Bank Guarantee security</span>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Active NDT Deposits</span>
              <div className="text-lg font-bold text-indigo-600 font-mono mt-1">
                {totalActiveNfdCount} Active
              </div>
              <span className="text-[11px] text-indigo-500 font-medium">Live non-liquidated deposits</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by NDT No, Bank, Project, Lien..."
                  value={nfdSearchTerm}
                  onChange={(e) => setNfdSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                {['All', 'Active', 'Pledged', 'Matured', 'Liquidated'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setNfdStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      nfdStatusFilter === st
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Bank Filter */}
              <select
                value={nfdBankFilter}
                onChange={(e) => setNfdBankFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              >
                <option value="All">All Banks</option>
                {NFD_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportNfdExcel}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export ({filteredNfdRecords.length}) to Excel</span>
            </button>
          </div>

          {/* Table or Clean Empty State */}
          {filteredNfdRecords.length > 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto w-full custom-table-scroll">
                <table className="w-full text-left border-collapse min-w-[920px]">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">NDT / FDR No.</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">Bank & Branch</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">Project / Purpose</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">Deposit Date</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap">Maturity Date</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Deposit Amount (₹)</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-right">Maturity Value (₹)</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-center">Status</th>
                      <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {filteredNfdRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold font-mono text-slate-900">
                          {item.nfdNumber}
                          <span className="block text-[10px] text-slate-400 font-normal font-sans">
                            {item.accountHolder || 'SANMATI CONSTRUCTIONS'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-semibold text-slate-800 block">{item.bankName}</span>
                          <span className="text-[10px] text-slate-400">{item.branchName || 'Main Branch'}</span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="font-medium text-slate-700 block">{item.projectName || 'General / Corporate'}</span>
                          <span className="text-[10px] text-red-600 font-semibold">{item.purpose}</span>
                          {item.lienTo && item.lienTo !== 'None' && (
                            <span className="block text-[10px] text-amber-700 font-medium">Lien: {item.lienTo}</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(item.depositDate)}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {item.maturityDate ? formatDate(item.maturityDate) : '—'}
                          {item.interestRate ? (
                            <span className="block text-[10px] text-emerald-600 font-semibold">@{item.interestRate}% p.a.</span>
                          ) : null}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 text-right whitespace-nowrap">
                          {formatCurrency(item.depositAmount)}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-600 text-right whitespace-nowrap">
                          {formatCurrency(item.maturityAmount || item.depositAmount)}
                        </td>
                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.status === 'Matured' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            item.status?.includes('Pledged') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedNfdDossier(item)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="View Full NDT Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditNfd(item)}
                              className="p-1.5 hover:bg-slate-100 text-amber-600 rounded-lg transition-colors cursor-pointer"
                              title="Edit NDT Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setNfdToDelete(item)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete NDT Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center mx-auto mb-2">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No NDT Records Registered</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4 max-w-md mx-auto">
                No active or historical NDT records found. Add your bank deposits, tender security margins, or BG pledges to track and export to Excel.
              </p>
              <button
                onClick={handleOpenAddNfd}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First NDT Record</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / RECORD INCOME */}
      {/* ========================================================= */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title={editingTransaction ? "Edit Income Record" : "Record Inflow / Customer Income"}
        subtitle="Posts credit to customer ledger and updates running project balances."
      >
        <form onSubmit={handleSubmitIncome} className="space-y-4 text-xs">
          {/* Voucher No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Voucher Number</label>
              <input
                type="text"
                readOnly
                value={incomeForm.voucherNumber || 'Auto-generated'}
                className="erp-input font-mono font-bold text-emerald-700 bg-slate-100 cursor-not-allowed"
                title="Voucher numbers are system-sequenced"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Receipt Date *</label>
              <input
                type="date"
                required
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className={`erp-input ${incomeValidationErrors.date ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              />
              {incomeValidationErrors.date && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{incomeValidationErrors.date}</span>
              )}
            </div>
          </div>

          {/* Customer & Project Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Payer Name *</label>
              <select
                required
                value={incomeForm.customerName}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = clients.find(c => c.name === val || c.companyName === val);
                  setIncomeForm(prev => ({
                    ...prev,
                    customerName: val,
                    projectName: matched?.assignedProject || prev.projectName
                  }));
                }}
                className={`erp-input font-medium ${incomeValidationErrors.customerName ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              >
                <option value="">-- Select Customer / Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.company ? `(${c.company})` : c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
                {incomeForm.customerName && !clients.some(c => c.name === incomeForm.customerName) && (
                  <option value={incomeForm.customerName}>{incomeForm.customerName}</option>
                )}
              </select>
              {incomeValidationErrors.customerName && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{incomeValidationErrors.customerName}</span>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Associated Construction Project *</label>
                <span className="text-[10px] text-slate-400">Select or type project</span>
              </div>
              <input
                type="text"
                required
                list="income-projects-datalist"
                value={incomeForm.projectName}
                onChange={(e) => setIncomeForm({ ...incomeForm, projectName: e.target.value })}
                placeholder="Type or select project name..."
                className={`erp-input font-medium ${incomeValidationErrors.projectName ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              />
              <datalist id="income-projects-datalist">
                {uniqueIncomeProjects.map((p, idx) => (
                  <option key={idx} value={p.value} />
                ))}
              </datalist>
              {incomeValidationErrors.projectName && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{incomeValidationErrors.projectName}</span>
              )}
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Income Category *</label>
              <select
                value={incomeForm.category}
                onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                className="erp-input font-medium"
              >
                {INCOME_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
              <select
                value={incomeForm.paymentMode}
                onChange={(e) => setIncomeForm({ ...incomeForm, paymentMode: e.target.value })}
                className="erp-input"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Math: Total Amount, Received Amount, Calculated Pending */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Billed / Invoice Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className={`erp-input font-mono font-bold text-slate-900 ${incomeValidationErrors.amount ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
                placeholder="e.g. 2500000"
              />
              {incomeValidationErrors.amount && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{incomeValidationErrors.amount}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Actual Received Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={incomeForm.receivedAmount}
                onChange={(e) => setIncomeForm({ ...incomeForm, receivedAmount: e.target.value })}
                className={`erp-input font-mono font-bold text-emerald-600 ${incomeValidationErrors.receivedAmount ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
                placeholder={incomeForm.amount ? `Defaults to ${incomeForm.amount}` : "e.g. 2000000"}
              />
              {incomeValidationErrors.receivedAmount && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{incomeValidationErrors.receivedAmount}</span>
              )}
              <span className="text-[10px] text-slate-400 mt-0.5 block">Leave blank for full settlement</span>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pending Balance (₹)</label>
              <div className="erp-input bg-white font-mono font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {formatCurrency(Math.max(0, (Number(incomeForm.amount) || 0) - (incomeForm.receivedAmount !== '' ? (Number(incomeForm.receivedAmount) || 0) : (Number(incomeForm.amount) || 0))))}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  (incomeForm.receivedAmount !== '' ? Number(incomeForm.receivedAmount) : Number(incomeForm.amount)) >= Number(incomeForm.amount)
                    ? 'bg-emerald-100 text-emerald-800'
                    : (incomeForm.receivedAmount && Number(incomeForm.receivedAmount) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                }`}>
                  {(incomeForm.receivedAmount !== '' ? Number(incomeForm.receivedAmount) : Number(incomeForm.amount)) >= Number(incomeForm.amount)
                    ? 'Fully Paid'
                    : (incomeForm.receivedAmount && Number(incomeForm.receivedAmount) > 0 ? 'Partial' : 'Pending')}
                </span>
              </div>
            </div>
          </div>

          {/* Reference & Narration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference / UTR / Cheque No</label>
              <input
                type="text"
                value={incomeForm.referenceNumber}
                onChange={(e) => setIncomeForm({ ...incomeForm, referenceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. NEFT/HDFC/99210"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Receipt Attachment File Name</label>
              <input
                type="text"
                value={incomeForm.receiptAttachment}
                onChange={(e) => setIncomeForm({ ...incomeForm, receiptAttachment: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. Bank_Advice_HDFC_99210.pdf"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Narration / Description</label>
            <textarea
              rows={2}
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              className="erp-input"
              placeholder="e.g. Received mobilization advance for foundation excavation works."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {editingTransaction ? "Update Income Record" : "Save & Post Income"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: ADD / RECORD EXPENSE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingTransaction ? "Edit Expense Record" : "Record Outflow / Project Expense"}
        subtitle="Posts debit to vendor ledger and tallies site cash balances."
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4 text-xs">
          {/* Voucher No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Voucher Number</label>
              <input
                type="text"
                readOnly
                value={expenseForm.voucherNumber || 'Auto-generated'}
                className="erp-input font-mono font-bold text-rose-700 bg-slate-100 cursor-not-allowed"
                title="Voucher numbers are system-sequenced"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className={`erp-input ${expenseValidationErrors.date ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              />
              {expenseValidationErrors.date && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{expenseValidationErrors.date}</span>
              )}
            </div>
          </div>

          {/* Payee Dropdown (Vendors + Employees) & Construction Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Payee / Employee *</label>
              <select
                required
                value={expenseForm.vendorName}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                className={`erp-input font-medium ${expenseValidationErrors.vendorName ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              >
                <option value="">-- Select Vendor / Payee / Employee --</option>
                {vendors.length > 0 && (
                  <optgroup label="Registered Vendors & Contractors">
                    {vendors.map(v => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.category || 'Vendor'})
                      </option>
                    ))}
                  </optgroup>
                )}
                {hrmsEmployees.length > 0 && (
                  <optgroup label="Employees & Labour Staff">
                    {hrmsEmployees.map(emp => (
                      <option key={emp.id} value={`${emp.name} (Employee)`}>
                        {emp.name} - {emp.designation || 'Staff'} ({emp.department || 'HRMS'})
                      </option>
                    ))}
                  </optgroup>
                )}
                {expenseForm.vendorName && !vendors.some(v => v.name === expenseForm.vendorName) && !hrmsEmployees.some(e => `${e.name} (Employee)` === expenseForm.vendorName) && (
                  <option value={expenseForm.vendorName}>{expenseForm.vendorName}</option>
                )}
              </select>
              {expenseValidationErrors.vendorName && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{expenseValidationErrors.vendorName}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Associated Construction Project *</label>
              <select
                required
                value={expenseForm.projectName}
                onChange={(e) => setExpenseForm({ ...expenseForm, projectName: e.target.value })}
                className={`erp-input font-medium ${expenseValidationErrors.projectName ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
              >
                <option value="">-- Select Construction Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name} {p.location ? `(${p.location})` : ''}
                  </option>
                ))}
                {expenseForm.projectName && !projects.some(p => p.name === expenseForm.projectName) && (
                  <option value={expenseForm.projectName}>{expenseForm.projectName}</option>
                )}
              </select>
              {expenseValidationErrors.projectName && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{expenseValidationErrors.projectName}</span>
              )}
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="erp-input font-medium"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
              <select
                value={expenseForm.paymentMode}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                className="erp-input"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Math: Bill Amount, Paid Amount, Calculated Pending */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Bill / Invoice Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className={`erp-input font-mono font-bold text-slate-900 ${expenseValidationErrors.amount ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
                placeholder="e.g. 1220000"
              />
              {expenseValidationErrors.amount && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{expenseValidationErrors.amount}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Actual Paid Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={expenseForm.paidAmount}
                onChange={(e) => setExpenseForm({ ...expenseForm, paidAmount: e.target.value })}
                className={`erp-input font-mono font-bold text-rose-600 ${expenseValidationErrors.paidAmount ? 'border-rose-500 ring-1 ring-rose-400' : ''}`}
                placeholder={expenseForm.amount ? `Defaults to ${expenseForm.amount}` : "e.g. 1000000"}
              />
              {expenseValidationErrors.paidAmount && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">{expenseValidationErrors.paidAmount}</span>
              )}
              <span className="text-[10px] text-slate-400 mt-0.5 block">Leave blank for full disbursement</span>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pending Payable Balance (₹)</label>
              <div className="erp-input bg-white font-mono font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {formatCurrency(Math.max(0, (Number(expenseForm.amount) || 0) - (expenseForm.paidAmount !== '' ? (Number(expenseForm.paidAmount) || 0) : (Number(expenseForm.amount) || 0))))}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  (expenseForm.paidAmount !== '' ? Number(expenseForm.paidAmount) : Number(expenseForm.amount)) >= Number(expenseForm.amount)
                    ? 'bg-emerald-100 text-emerald-800'
                    : (expenseForm.paidAmount && Number(expenseForm.paidAmount) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                }`}>
                  {(expenseForm.paidAmount !== '' ? Number(expenseForm.paidAmount) : Number(expenseForm.amount)) >= Number(expenseForm.amount)
                    ? 'Fully Paid'
                    : (expenseForm.paidAmount && Number(expenseForm.paidAmount) > 0 ? 'Partial' : 'Pending')}
                </span>
              </div>
            </div>
          </div>

          {/* Reference & Bill Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bill / Invoice / Challan No</label>
              <input
                type="text"
                value={expenseForm.referenceNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, referenceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. RST/INV/2026/88"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bill Attachment File Name</label>
              <input
                type="text"
                value={expenseForm.billAttachment}
                onChange={(e) => setExpenseForm({ ...expenseForm, billAttachment: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. Vendor_Invoice_RST88.pdf"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Narration / Description</label>
            <textarea
              rows={2}
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="erp-input"
              placeholder="e.g. 50 MT TMT 550D Steel delivery at Kawala Naka site."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {editingTransaction ? "Update Expense Record" : "Save & Disburse Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: REVERSE / CANCEL TRANSACTION AUDIT */}
      {/* ========================================================= */}
      {txnToReverse && (
        <Modal
          isOpen={Boolean(txnToReverse)}
          onClose={() => setTxnToReverse(null)}
          title={`Audit Reversal: Voucher ${txnToReverse.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <strong className="block font-bold">Never Silently Delete Financial Transactions</strong>
              <p className="mt-1 text-slate-600 leading-relaxed">
                In compliance with commercial civil accounting principles, cancelling this voucher creates an offsetting audit reversal entry in the general ledger. The historical record will be preserved.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Reversal / Cancellation *</label>
              <textarea
                rows={3}
                required
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="erp-input"
                placeholder="e.g. Duplicate bank entry or wrong invoice rate applied by site accountant."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTxnToReverse(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmReversal}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Confirm Audit Reversal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ISSUE NEW TAX INVOICE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        title="Issue New Client Tax Invoice"
        subtitle="Billed amounts automatically update Customer Ledger Debits and receivables."
      >
        <form onSubmit={handleSubmitNewInvoice} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Client Name *</label>
              <input
                type="text"
                required
                value={newInvoiceForm.customerName}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, customerName: e.target.value })}
                className="erp-input"
                placeholder="Enter customer / client name"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={newInvoiceForm.projectName}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, projectName: e.target.value })}
                className="erp-input"
                placeholder="Enter project name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={newInvoiceForm.invoiceNumber}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. RA-INV-2026-01"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice Amount (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                value={newInvoiceForm.invoiceAmount}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceAmount: e.target.value })}
                className="erp-input font-mono font-bold text-slate-900"
                placeholder="e.g. 5000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice / Billing Date</label>
              <input
                type="date"
                value={newInvoiceForm.paymentDate}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, paymentDate: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={newInvoiceForm.dueDate}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewInvoiceModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
            >
              Generate Invoice & Post
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: RECORD CUSTOMER PAYMENT (PARTIAL / FULL) */}
      {/* ========================================================= */}
      {paymentToRecord && (
        <Modal
          isOpen={Boolean(paymentToRecord)}
          onClose={() => setPaymentToRecord(null)}
          title={`Record Payment for Invoice: ${paymentToRecord.invoiceNumber}`}
          subtitle={`Customer: ${paymentToRecord.customerName} • Remaining Due: ${formatCurrency(paymentToRecord.remainingAmount)}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitRecordedPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Invoice Balance Overview</span>
              <div className="flex items-center justify-between text-xs">
                <span>Invoice Total: <strong>{formatCurrency(paymentToRecord.invoiceAmount)}</strong></span>
                <span>Previously Paid: <strong className="text-emerald-700">{formatCurrency(paymentToRecord.paidAmount)}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Amount to Settle (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                max={paymentToRecord.remainingAmount}
                value={paymentEntryForm.amount}
                onChange={(e) => setPaymentEntryForm({ ...paymentEntryForm, amount: e.target.value })}
                className="erp-input font-mono font-bold text-emerald-600 text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Supports partial payments. Maximum payable: {formatCurrency(paymentToRecord.remainingAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Receipt Date</label>
                <input
                  type="date"
                  required
                  value={paymentEntryForm.paymentDate}
                  onChange={(e) => setPaymentEntryForm({ ...paymentEntryForm, paymentDate: e.target.value })}
                  className="erp-input"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                <select
                  value={paymentEntryForm.paymentMode}
                  onChange={(e) => setPaymentEntryForm({ ...paymentEntryForm, paymentMode: e.target.value })}
                  className="erp-input"
                >
                  {PAYMENT_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank Reference / UTR / Cheque No *</label>
              <input
                type="text"
                required
                value={paymentEntryForm.referenceNo}
                onChange={(e) => setPaymentEntryForm({ ...paymentEntryForm, referenceNo: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. UTR-HDFC-99120"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Narration / Payment Notes</label>
              <textarea
                rows={2}
                value={paymentEntryForm.notes}
                onChange={(e) => setPaymentEntryForm({ ...paymentEntryForm, notes: e.target.value })}
                className="erp-input"
                placeholder="e.g. Second installment against RA Bill milestone completion."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToRecord(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: PAYMENT HISTORY (PARTIAL AUDIT TRAIL) */}
      {/* ========================================================= */}
      {selectedPaymentHistory && (
        <Modal
          isOpen={Boolean(selectedPaymentHistory)}
          onClose={() => setSelectedPaymentHistory(null)}
          title={`Payment History: ${selectedPaymentHistory.invoiceNumber}`}
          subtitle={`Customer: ${selectedPaymentHistory.customerName} • Billed: ${formatCurrency(selectedPaymentHistory.invoiceAmount)}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Paid to Date</span>
                <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(selectedPaymentHistory.paidAmount)}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Remaining Balance</span>
                <strong className="text-rose-600 font-mono text-sm">{formatCurrency(selectedPaymentHistory.remainingAmount)}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Installment Breakdown:</h4>
              {selectedPaymentHistory.paymentHistory && selectedPaymentHistory.paymentHistory.length > 0 ? (
                selectedPaymentHistory.paymentHistory.map((h, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{formatDate(h.date)} • {h.mode}</span>
                      <span className="text-[11px] font-mono text-slate-500">Ref: {h.referenceNo}</span>
                      {h.notes && <p className="text-[11px] text-slate-600 mt-0.5">{h.notes}</p>}
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      +{formatCurrency(h.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-center py-4">No payments recorded against this invoice yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPaymentHistory(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: PRINT PAYMENT RECEIPT VOUCHER */}
      {/* ========================================================= */}
      {selectedReceiptPrint && (
        <Modal
          isOpen={Boolean(selectedReceiptPrint)}
          onClose={() => setSelectedReceiptPrint(null)}
          title={`Official Payment Voucher: ${selectedReceiptPrint.invoiceNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 bg-slate-50 border border-slate-300 rounded-2xl space-y-4 text-slate-900 font-sans">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-red-700">SANMATI CONSTRUCTIONS</h3>
                  <p className="text-[10px] text-slate-500">Kolhapur, Maharashtra • GSTIN: 27AAYCS9281Q1ZU</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  OFFICIAL RECEIPT
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Invoice No:</span> <strong className="font-mono">{selectedReceiptPrint.invoiceNumber}</strong></div>
                <div><span className="text-slate-500">Receipt Date:</span> <strong>{formatDate(selectedReceiptPrint.paymentDate)}</strong></div>
                <div className="col-span-2"><span className="text-slate-500">Customer:</span> <strong>{selectedReceiptPrint.customerName}</strong></div>
                <div className="col-span-2"><span className="text-slate-500">Project Site:</span> <strong>{selectedReceiptPrint.projectName}</strong></div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Total Invoiced:</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedReceiptPrint.invoiceAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Amount Received:</span>
                  <span className="font-mono">{formatCurrency(selectedReceiptPrint.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-700 border-t border-slate-100 pt-1 font-semibold">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatCurrency(selectedReceiptPrint.remainingAmount)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>Computer-generated payment voucher.</span>
                <span className="font-bold text-slate-700">Authorised Signatory</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceiptPrint(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: ADD MANUAL LEDGER ENTRY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isLedgerEntryModalOpen}
        onClose={() => setIsLedgerEntryModalOpen(false)}
        title="Add Manual Ledger Entry / Adjustment"
        subtitle="Post debit/credit adjustments or opening balances directly to customer or vendor ledgers."
      >
        <form onSubmit={handleSubmitManualLedger} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Type</label>
              <select
                value={manualLedgerForm.accountType}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, accountType: e.target.value })}
                className="erp-input"
              >
                <option value="Customer">Customer Account (Debtor)</option>
                <option value="Vendor">Vendor Account (Creditor)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account / Party Name *</label>
              <input
                type="text"
                required
                value={manualLedgerForm.accountName}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, accountName: e.target.value })}
                className="erp-input"
                placeholder="Enter party / account name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date *</label>
              <input
                type="date"
                required
                value={manualLedgerForm.date}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, date: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Debit Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={manualLedgerForm.debitAmount}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, debitAmount: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Credit Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={manualLedgerForm.creditAmount}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, creditAmount: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference Number</label>
              <input
                type="text"
                value={manualLedgerForm.referenceNumber}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, referenceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. ADJ-2026-001"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description / Particulars *</label>
              <input
                type="text"
                required
                value={manualLedgerForm.description}
                onChange={(e) => setManualLedgerForm({ ...manualLedgerForm, description: e.target.value })}
                className="erp-input"
                placeholder="e.g. Credit note for material rebate on structural steel."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsLedgerEntryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
            >
              Post to Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 9: REVERSE LEDGER ENTRY AUDIT */}
      {/* ========================================================= */}
      {ledgerEntryToReverse && (
        <Modal
          isOpen={Boolean(ledgerEntryToReverse)}
          onClose={() => setLedgerEntryToReverse(null)}
          title={`Offset Ledger Entry: ${ledgerEntryToReverse.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Post an offsetting entry to cancel out <strong>{ledgerEntryToReverse.id}</strong> ({ledgerEntryToReverse.description}). The financial audit trail will remain intact.
            </p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reason for Reversal / Correction</label>
              <textarea
                rows={2}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="erp-input"
                placeholder="e.g. Erroneous rate calculation corrected by CA."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLedgerEntryToReverse(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  reverseLedgerEntry(ledgerEntryToReverse.id, reversalReason || 'Auditor reversal');
                  setLedgerEntryToReverse(null);
                  setReversalReason('');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                Confirm Offset
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: VIEW TRANSACTION DOSSIER */}
      {/* ========================================================= */}
      {selectedTxnDossier && (
        <Modal
          isOpen={Boolean(selectedTxnDossier)}
          onClose={() => setSelectedTxnDossier(null)}
          title={`Transaction Voucher: ${selectedTxnDossier.voucherNumber || selectedTxnDossier.id}`}
          subtitle={`${selectedTxnDossier.recordType} Record • ${formatDate(selectedTxnDossier.date)}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Voucher Number:</span>
                <span className={`font-mono font-bold text-sm ${selectedTxnDossier.recordType === 'Income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedTxnDossier.voucherNumber || selectedTxnDossier.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Type:</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedTxnDossier.recordType === 'Income'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {selectedTxnDossier.recordType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Party / Entity:</span>
                <strong className="text-slate-900">{selectedTxnDossier.party}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Associated Project:</span>
                <strong className="text-slate-900">{selectedTxnDossier.projectName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-900">{selectedTxnDossier.category}</strong>
              </div>

              {/* Amount Breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billed Amount:</span>
                  <strong className="font-mono text-slate-900">
                    {formatCurrency(selectedTxnDossier.totalAmount || selectedTxnDossier.amount)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {selectedTxnDossier.recordType === 'Income' ? 'Actual Received Amount:' : 'Actual Paid Amount:'}
                  </span>
                  <strong className={`font-mono text-sm ${selectedTxnDossier.recordType === 'Income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(selectedTxnDossier.paidOrReceivedAmount || selectedTxnDossier.amount)}
                  </strong>
                </div>
                {selectedTxnDossier.pendingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-700 font-semibold">Pending Balance Due:</span>
                    <strong className="font-mono text-amber-700">
                      {formatCurrency(selectedTxnDossier.pendingAmount)}
                    </strong>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <strong className="text-slate-900">{selectedTxnDossier.paymentMode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference / UTR No:</span>
                <strong className="font-mono text-slate-900">{selectedTxnDossier.referenceNumber || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  selectedTxnDossier.status === 'Cancelled'
                    ? 'bg-slate-100 text-slate-600 border-slate-300 line-through'
                    : selectedTxnDossier.status === 'Partial'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : selectedTxnDossier.status === 'Pending'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {selectedTxnDossier.status || 'Paid'}
                </span>
              </div>
            </div>

            {selectedTxnDossier.receiptAttachment && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-medium">Receipt File:</span>
                <span className="font-mono text-xs text-red-600 font-bold">{selectedTxnDossier.receiptAttachment}</span>
              </div>
            )}
            {selectedTxnDossier.billAttachment && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-medium">Bill File:</span>
                <span className="font-mono text-xs text-red-600 font-bold">{selectedTxnDossier.billAttachment}</span>
              </div>
            )}

            {selectedTxnDossier.description && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Narration / Particulars</span>
                <p className="text-slate-700 leading-relaxed">{selectedTxnDossier.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const row = selectedTxnDossier;
                    setSelectedTxnDossier(null);
                    handleOpenEditTransaction(row);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Transaction</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const row = selectedTxnDossier;
                    setSelectedTxnDossier(null);
                    setTxnToDelete(row);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Voucher</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxnDossier(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE TRANSACTION CONFIRMATION */}
      {/* ========================================================= */}
      {txnToDelete && (
        <Modal
          isOpen={Boolean(txnToDelete)}
          onClose={() => setTxnToDelete(null)}
          title={`Delete Transaction: ${txnToDelete.voucherNumber || txnToDelete.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Are you sure you want to permanently delete this transaction?</strong>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  This will remove voucher <strong>{txnToDelete.voucherNumber || txnToDelete.id}</strong> ({formatCurrency(txnToDelete.paidOrReceivedAmount || txnToDelete.amount)}) from the register and automatically clean up its associated account ledger entry.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxnToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTxn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: ADD / EDIT NDT RECORD */}
      {/* ========================================================= */}
      <Modal
        isOpen={isNfdModalOpen}
        onClose={() => setIsNfdModalOpen(false)}
        title={editingNfd ? "Edit NDT / Fixed Deposit Record" : "Add New NDT / Fixed Deposit Record"}
        subtitle="Manage National Fixed Deposits, Bank Guarantee margin deposits, and tender security receipts."
      >
        <form onSubmit={handleSubmitNfd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">NDT / FDR Certificate No. *</label>
              <input
                type="text"
                required
                value={nfdForm.nfdNumber}
                onChange={(e) => setNfdForm({ ...nfdForm, nfdNumber: e.target.value })}
                className="erp-input font-mono font-bold"
                placeholder="e.g. NDT/SBI/2026/0491"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank Name *</label>
              <select
                required
                value={nfdForm.bankName}
                onChange={(e) => setNfdForm({ ...nfdForm, bankName: e.target.value })}
                className="erp-input"
              >
                {NFD_BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Branch Name & City</label>
              <input
                type="text"
                value={nfdForm.branchName}
                onChange={(e) => setNfdForm({ ...nfdForm, branchName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Shahupuri Branch, Kolhapur"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Deposit Holder / Entity Name</label>
              <input
                type="text"
                value={nfdForm.accountHolder}
                onChange={(e) => setNfdForm({ ...nfdForm, accountHolder: e.target.value })}
                className="erp-input"
                placeholder="e.g. SANMATI CONSTRUCTIONS"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Associated Project / Tender</label>
              <select
                value={nfdForm.projectName}
                onChange={(e) => setNfdForm({ ...nfdForm, projectName: e.target.value })}
                className="erp-input"
              >
                <option value="">General Corporate / Non-Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Deposit Purpose / Facility *</label>
              <select
                value={nfdForm.purpose}
                onChange={(e) => setNfdForm({ ...nfdForm, purpose: e.target.value })}
                className="erp-input"
              >
                {NFD_PURPOSES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Deposit Amount (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                value={nfdForm.depositAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setNfdForm(prev => ({
                    ...prev,
                    depositAmount: val,
                    maturityAmount: prev.maturityAmount ? prev.maturityAmount : val
                  }));
                }}
                className="erp-input font-mono font-bold text-slate-900"
                placeholder="e.g. 1000000"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.01"
                value={nfdForm.interestRate}
                onChange={(e) => setNfdForm({ ...nfdForm, interestRate: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. 7.25"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maturity Value (₹)</label>
              <input
                type="number"
                min="0"
                value={nfdForm.maturityAmount}
                onChange={(e) => setNfdForm({ ...nfdForm, maturityAmount: e.target.value })}
                className="erp-input font-mono font-bold text-emerald-600"
                placeholder="e.g. 1072500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date of Deposit *</label>
              <input
                type="date"
                required
                value={nfdForm.depositDate}
                onChange={(e) => setNfdForm({ ...nfdForm, depositDate: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maturity / Due Date</label>
              <input
                type="date"
                value={nfdForm.maturityDate}
                onChange={(e) => setNfdForm({ ...nfdForm, maturityDate: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lien / Pledged To Authority</label>
              <input
                type="text"
                value={nfdForm.lienTo}
                onChange={(e) => setNfdForm({ ...nfdForm, lienTo: e.target.value })}
                className="erp-input"
                placeholder="e.g. Executive Engineer PWD / None"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status</label>
              <select
                value={nfdForm.status}
                onChange={(e) => setNfdForm({ ...nfdForm, status: e.target.value })}
                className="erp-input font-semibold"
              >
                {NFD_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Remarks & Bank Advice Notes</label>
            <textarea
              rows={2}
              value={nfdForm.remarks}
              onChange={(e) => setNfdForm({ ...nfdForm, remarks: e.target.value })}
              className="erp-input"
              placeholder="e.g. Auto-renewal instruction, physical certificate kept in Kolhapur head office locker..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNfdModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {editingNfd ? "Update NDT Record" : "Save NDT Record"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 11: VIEW FULL NDT DOSSIER */}
      {/* ========================================================= */}
      {selectedNfdDossier && (
        <Modal
          isOpen={Boolean(selectedNfdDossier)}
          onClose={() => setSelectedNfdDossier(null)}
          title={`NDT Certificate: ${selectedNfdDossier.nfdNumber}`}
          subtitle="Complete deposit register entry and lien details."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">NDT / FDR Number:</span>
                <strong className="font-mono text-sm text-slate-900">{selectedNfdDossier.nfdNumber}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Bank & Branch:</span>
                <strong className="text-slate-900">{selectedNfdDossier.bankName} ({selectedNfdDossier.branchName || 'Main Branch'})</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Account / Holder Name:</span>
                <strong className="text-slate-900">{selectedNfdDossier.accountHolder || 'SANMATI CONSTRUCTIONS'}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Associated Project:</span>
                <strong className="text-slate-900">{selectedNfdDossier.projectName || 'General Corporate'}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Purpose / Facility:</span>
                <strong className="text-red-600 font-bold">{selectedNfdDossier.purpose}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Deposit Amount:</span>
                <strong className="font-mono text-sm text-slate-900">{formatCurrency(selectedNfdDossier.depositAmount)}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Interest Rate (% p.a.):</span>
                <strong className="font-mono text-emerald-600">{selectedNfdDossier.interestRate ? `${selectedNfdDossier.interestRate}%` : '—'}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Maturity Realizable Value:</span>
                <strong className="font-mono text-sm text-emerald-600">{formatCurrency(selectedNfdDossier.maturityAmount || selectedNfdDossier.depositAmount)}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Deposit Date:</span>
                <strong className="text-slate-800">{formatDate(selectedNfdDossier.depositDate)}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Maturity Date:</span>
                <strong className="text-slate-800">{selectedNfdDossier.maturityDate ? formatDate(selectedNfdDossier.maturityDate) : '—'}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Lien / Pledged To:</span>
                <strong className="text-amber-700">{selectedNfdDossier.lienTo || 'None'}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Current Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedNfdDossier.status || 'Active'}
                </span>
              </div>
            </div>

            {selectedNfdDossier.remarks && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Remarks & Advice Notes</span>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedNfdDossier.remarks}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  exportToExcel([
                    {
                      'NDT / FDR Number': selectedNfdDossier.nfdNumber,
                      'Bank Name': selectedNfdDossier.bankName,
                      'Branch': selectedNfdDossier.branchName || 'Main Branch',
                      'Account Holder': selectedNfdDossier.accountHolder || 'SANMATI CONSTRUCTIONS',
                      'Project': selectedNfdDossier.projectName || 'General Corporate',
                      'Purpose': selectedNfdDossier.purpose,
                      'Deposit Amount (₹)': Number(selectedNfdDossier.depositAmount) || 0,
                      'Interest Rate': selectedNfdDossier.interestRate ? `${selectedNfdDossier.interestRate}%` : '-',
                      'Maturity Value (₹)': Number(selectedNfdDossier.maturityAmount) || Number(selectedNfdDossier.depositAmount) || 0,
                      'Deposit Date': selectedNfdDossier.depositDate || '-',
                      'Maturity Date': selectedNfdDossier.maturityDate || '-',
                      'Lien / Pledged To': selectedNfdDossier.lienTo || 'None',
                      'Status': selectedNfdDossier.status || 'Active',
                      'Remarks': selectedNfdDossier.remarks || '-'
                    }
                  ], `NDT_${selectedNfdDossier.nfdNumber.replace(/[^a-zA-Z0-9]/g, '_')}`, 'NDT_Detail');
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download This Record (Excel)</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = selectedNfdDossier;
                    setSelectedNfdDossier(null);
                    handleOpenEditNfd(toEdit);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedNfdDossier(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL 12: CONFIRM DELETE NDT */}
      {/* ========================================================= */}
      {nfdToDelete && (
        <Modal
          isOpen={Boolean(nfdToDelete)}
          onClose={() => setNfdToDelete(null)}
          title="Confirm Delete NDT Record"
          subtitle="Are you sure you want to remove this NDT record from the system?"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              You are about to permanently delete NDT record <strong className="text-slate-900 font-mono">{nfdToDelete.nfdNumber}</strong> ({nfdToDelete.bankName} - ₹{Number(nfdToDelete.depositAmount).toLocaleString('en-IN')}).
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNfdToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteNfd}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
