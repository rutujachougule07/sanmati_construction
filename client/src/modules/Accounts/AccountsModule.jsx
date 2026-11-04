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

export const AccountsModule = () => {
  const { 
    clients = [], 
    vendors = [], 
    projects = [],
    incomeRecords = [],
    expenseRecords = [],
    paymentTracking = [],
    ledgerEntries = [],
    addIncomeRecord,
    updateIncomeRecord,
    reverseIncomeRecord,
    addExpenseRecord,
    updateExpenseRecord,
    reverseExpenseRecord,
    addPaymentInvoice,
    recordPayment,
    addLedgerEntry,
    reverseLedgerEntry
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
  const [txnToReverse, setTxnToReverse] = useState(null); // { id, type, reason: '' }

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

  // -------------------------------------------------------------
  // FILTERS
  // -------------------------------------------------------------
  const [recordsTypeFilter, setRecordsTypeFilter] = useState('All'); // All | Income | Expense
  const [recordsProjectFilter, setRecordsProjectFilter] = useState('All');
  const [recordsDateFrom, setRecordsDateFrom] = useState('');
  const [recordsDateTo, setRecordsDateTo] = useState('');

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All'); // All | Paid | Partial | Pending | Overdue
  const [paymentCustomerFilter, setPaymentCustomerFilter] = useState('All');

  // -------------------------------------------------------------
  // FORMS
  // -------------------------------------------------------------
  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    customerName: '',
    category: 'RA Bill Payment',
    description: '',
    amount: '',
    paymentMode: 'Bank Transfer',
    referenceNumber: '',
    receiptAttachment: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    projectName: '',
    vendorName: '',
    category: 'Cement & Aggregates',
    description: '',
    amount: '',
    paymentMode: 'Bank Transfer',
    referenceNumber: '',
    billAttachment: ''
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

  // -------------------------------------------------------------
  // 1. INCOME AND EXPENSE RECORDS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddIncome = () => {
    setIncomeForm({
      date: new Date().toISOString().split('T')[0],
      projectName: projects[0]?.name || 'Royal Palace Commercial Complex',
      customerName: clients[0]?.name || '',
      category: 'RA Bill Payment',
      description: '',
      amount: '',
      paymentMode: 'Bank Transfer',
      referenceNumber: `UTR-${Date.now().toString().slice(-6)}`,
      receiptAttachment: ''
    });
    setIsIncomeModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      projectName: projects[0]?.name || 'Royal Palace Commercial Complex',
      vendorName: vendors[0]?.name || '',
      category: 'Cement & Aggregates',
      description: '',
      amount: '',
      paymentMode: 'Bank Transfer',
      referenceNumber: `BILL-${Date.now().toString().slice(-4)}`,
      billAttachment: ''
    });
    setIsExpenseModalOpen(true);
  };

  const handleSubmitIncome = (e) => {
    e.preventDefault();
    if (editingTransaction?.type === 'income') {
      updateIncomeRecord(editingTransaction.txn.id, incomeForm);
      setEditingTransaction(null);
    } else {
      addIncomeRecord(incomeForm);
    }
    setIsIncomeModalOpen(false);
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (editingTransaction?.type === 'expense') {
      updateExpenseRecord(editingTransaction.txn.id, expenseForm);
      setEditingTransaction(null);
    } else {
      addExpenseRecord(expenseForm);
    }
    setIsExpenseModalOpen(false);
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

  // Combine Income & Expenses into unified transaction view
  const combinedTransactions = useMemo(() => {
    const incomes = incomeRecords.map(i => ({
      ...i,
      recordType: 'Income',
      party: i.customerName || 'Direct Client Inflow',
      inward: i.status === 'Cancelled' ? 0 : i.amount,
      outward: 0
    }));

    const expenses = expenseRecords.map(e => ({
      ...e,
      recordType: 'Expense',
      party: e.vendorName || 'General Supplier / Labour',
      inward: 0,
      outward: e.status === 'Cancelled' ? 0 : e.amount
    }));

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
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions.filter(t => t.recordType === 'Expense' && t.status !== 'Cancelled')
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const handleExportRecordsPDF = () => {
    generatePDFReport({
      title: "SANMATI CONSTRUCTIONS - INCOME & EXPENSE LEDGER VOUCHER",
      subtitle: `Official Transaction Register | Kolhapur HQ | Net Total: ${formatCurrency(totalFilteredIncome - totalFilteredExpense)}`,
      headers: ["Voucher ID", "Date", "Type", "Party", "Project", "Inward (₹)", "Outward (₹)", "Status"],
      rows: filteredTransactions.map(t => [
        t.id,
        t.date,
        t.recordType,
        t.party,
        t.projectName,
        t.inward > 0 ? formatCurrency(t.inward) : '—',
        t.outward > 0 ? formatCurrency(t.outward) : '—',
        t.status || 'Active'
      ]),
      fileName: "Sanmati_Income_Expense_Register",
      orientation: "landscape"
    });
  };

  const transactionColumns = [
    { 
      key: 'id', 
      header: 'Voucher No', 
      minWidth: '130px', 
      nowrap: true, 
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap ${
          row.recordType === 'Income' ? 'text-emerald-700' : 'text-red-700'
        }`}>
          {row.id}
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
        <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${
          row.inward > 0 ? 'text-emerald-600' : 'text-slate-300'
        }`}>
          {row.inward > 0 ? formatCurrency(row.inward) : '—'}
        </span>
      )
    },
    {
      key: 'outward',
      header: 'Outward (₹ Expense)',
      align: 'right',
      minWidth: '150px',
      nowrap: true,
      render: (row) => (
        <span className={`font-mono font-bold whitespace-nowrap tabular-nums ${
          row.outward > 0 ? 'text-rose-600' : 'text-slate-300'
        }`}>
          {row.outward > 0 ? formatCurrency(row.outward) : '—'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      minWidth: '120px',
      nowrap: true,
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
          row.status === 'Cancelled' 
            ? 'bg-slate-100 text-slate-600 border-slate-300 line-through' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {row.status || 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '140px',
      nowrap: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => setSelectedTxnDossier(row)}
            title="View Voucher Details"
            className="p-1.5 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status !== 'Cancelled' && (
            <button
              onClick={() => setTxnToReverse({ id: row.id, type: row.recordType.toLowerCase(), reason: '' })}
              title="Reverse / Cancel Voucher (Audit Preserved)"
              className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-lg text-slate-600 transition-colors shadow-2xs cursor-pointer"
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
                    className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      recordsTypeFilter === type 
                        ? 'bg-[#103a6c] text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            searchKey="party"
            searchPlaceholder="Search vouchers by party name, category, or project..."
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
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    paymentStatusFilter === status 
                      ? 'bg-red-600 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#103a6c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-cyan-300 text-[10px] font-bold uppercase tracking-wider block">
                {ledgerType === 'Customer' ? 'Sundry Debtors Balance' : 'Sundry Creditors Balance'}
              </span>
              <h3 className="text-lg font-black mt-0.5">
                {selectedPartyLedger === 'All' ? `Consolidated ${ledgerType} Ledger` : selectedPartyLedger}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-slate-300 text-xs block">Closing Net Balance</span>
              <span className="text-2xl font-black font-mono text-cyan-300">
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
      {/* MODAL 1: ADD / RECORD INCOME */}
      {/* ========================================================= */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title={editingTransaction ? "Edit Income Record" : "Record Inflow / Customer Income"}
        subtitle="Posts credit to customer ledger and updates running project balances."
      >
        <form onSubmit={handleSubmitIncome} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Receipt Date *</label>
              <input
                type="date"
                required
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Income Category *</label>
              <select
                value={incomeForm.category}
                onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                className="erp-input"
              >
                {INCOME_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Customer / Payer Name *</label>
              <input
                type="text"
                required
                value={incomeForm.customerName}
                onChange={(e) => setIncomeForm({ ...incomeForm, customerName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Tarabai Heights Developers LLP"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Associated Project</label>
              <input
                type="text"
                value={incomeForm.projectName}
                onChange={(e) => setIncomeForm({ ...incomeForm, projectName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Royal Palace Commercial Complex"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="erp-input font-mono font-bold text-emerald-600"
                placeholder="e.g. 2500000"
              />
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
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference / UTR No</label>
              <input
                type="text"
                value={incomeForm.referenceNumber}
                onChange={(e) => setIncomeForm({ ...incomeForm, referenceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. NEFT/HDFC/99210"
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
            >
              Save & Post Income
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="erp-input"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Payee Name *</label>
              <input
                type="text"
                required
                value={expenseForm.vendorName}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Rajaram Steel & Tubes"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={expenseForm.projectName}
                onChange={(e) => setExpenseForm({ ...expenseForm, projectName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Royal Palace Commercial Complex"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (₹ INR) *</label>
              <input
                type="number"
                required
                min="1"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="erp-input font-mono font-bold text-rose-600"
                placeholder="e.g. 1220000"
              />
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
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bill / Invoice No</label>
              <input
                type="text"
                value={expenseForm.referenceNumber}
                onChange={(e) => setExpenseForm({ ...expenseForm, referenceNumber: e.target.value })}
                className="erp-input font-mono"
                placeholder="e.g. RST/INV/2026/88"
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
            >
              Save & Disburse Expense
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
                placeholder="e.g. Tarabai Heights Developers LLP"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
              <input
                type="text"
                value={newInvoiceForm.projectName}
                onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, projectName: e.target.value })}
                className="erp-input"
                placeholder="e.g. Royal Palace Commercial Complex"
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
                  <h3 className="font-black text-sm text-[#103a6c]">SANMATI CONSTRUCTIONS</h3>
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
                placeholder="e.g. Tarabai Heights or Rajaram Steel"
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
          title={`Transaction Details: ${selectedTxnDossier.id}`}
          subtitle={`${selectedTxnDossier.recordType} on ${formatDate(selectedTxnDossier.date)}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Party:</span>
                <strong className="text-slate-900">{selectedTxnDossier.party}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project:</span>
                <strong className="text-slate-900">{selectedTxnDossier.projectName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-900">{selectedTxnDossier.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <strong className={`font-mono text-sm ${selectedTxnDossier.recordType === 'Income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(selectedTxnDossier.amount)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <strong className="text-slate-900">{selectedTxnDossier.paymentMode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <strong className="font-mono text-slate-900">{selectedTxnDossier.referenceNumber || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-800">{selectedTxnDossier.status || 'Active'}</span>
              </div>
            </div>

            {selectedTxnDossier.description && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Narration</span>
                <p className="text-slate-700">{selectedTxnDossier.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTxnDossier(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
