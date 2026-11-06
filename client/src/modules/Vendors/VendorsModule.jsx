// MODULE 3: VENDOR MANAGEMENT - Complete Working Implementation
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, Phone, Mail, MapPin, Plus, Edit3, Trash2, Eye, Search, Filter, 
  Download, FileText, CheckCircle2, Clock, AlertTriangle, DollarSign, 
  ShoppingBag, UserPlus, CreditCard, Printer, Star, Building2, User, 
  ExternalLink, ArrowDownRight, ArrowUpRight, ShieldCheck, XCircle, ChevronRight
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToExcel, generatePDFReport } from '../../services/exportService';

const VENDOR_CATEGORIES = [
  'Cement & Aggregates',
  'Steel & Reinforcement',
  'Ready-Mix Concrete (RMC)',
  'Subcontractors & Civil Labour',
  'Plant & Machinery Hire',
  'Electrical & Plumbing Goods',
  'Bricks, Blocks & Masonry',
  'Tiles, Granite & Finishing',
  'Hardware, Paint & Chemicals',
  'Fuel, Diesel & Lubricants',
  'Transportation & Logistics'
];

const PAYMENT_MODES = ['Bank Transfer', 'NEFT / RTGS', 'Cheque', 'UPI', 'Cash'];
const DELIVERY_STATUSES = ['Ordered', 'In Transit', 'Partially Delivered', 'Delivered', 'Quality Inspected', 'Cancelled'];

export const VendorsModule = () => {
  const { 
    vendors = [], 
    vendorContacts = [],
    vendorPurchases = [],
    vendorPayments = [],
    projects = [],
    addVendor,
    updateVendor,
    deleteVendor,
    addVendorContact,
    updateVendorContact,
    deleteVendorContact,
    addVendorPurchase,
    updateVendorPurchase,
    deleteVendorPurchase,
    recordVendorPayment
  } = useERPData();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'registration';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // -------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------
  // Sub 1: Registration
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendorDossier, setSelectedVendorDossier] = useState(null);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Sub 2: Contacts
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContactDossier, setSelectedContactDossier] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Sub 3: Purchases
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchaseDossier, setSelectedPurchaseDossier] = useState(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  // Sub 4: Payments
  const [paymentToRecord, setPaymentToRecord] = useState(null); // Vendor payment selected for disbursement
  const [selectedPaymentHistory, setSelectedPaymentHistory] = useState(null);
  const [selectedVoucherPrint, setSelectedVoucherPrint] = useState(null);

  // -------------------------------------------------------------
  // FILTERS
  // -------------------------------------------------------------
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('All');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('All');
  const [contactVendorFilter, setContactVendorFilter] = useState('All');
  const [purchaseVendorFilter, setPurchaseVendorFilter] = useState('All');
  const [purchaseProjectFilter, setPurchaseProjectFilter] = useState('All');
  const [purchaseDeliveryFilter, setPurchaseDeliveryFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [paymentVendorFilter, setPaymentVendorFilter] = useState('All');

  // -------------------------------------------------------------
  // FORM STATES
  // -------------------------------------------------------------
  const [vendorForm, setVendorForm] = useState({
    name: '',
    companyName: '',
    category: 'Cement & Aggregates',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Kolhapur',
    state: 'Maharashtra',
    gstin: '',
    pan: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    paymentTermsDays: 30,
    status: 'Active',
    rating: 4.8
  });

  const [contactForm, setContactForm] = useState({
    vendorName: '',
    contactPerson: '',
    designation: 'Sales & Dispatch Lead',
    phone: '',
    alternatePhone: '',
    email: '',
    plantAddress: '',
    notes: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    poNumber: '',
    billNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    vendorName: '',
    projectName: '',
    materialCategory: 'Cement & Aggregates',
    itemDescription: '',
    quantity: 1,
    unit: 'Bags',
    rate: 0,
    totalAmount: 0,
    paidInitial: 0,
    paymentMode: 'Bank Transfer',
    deliveryStatus: 'Delivered',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMode: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    notes: ''
  });

  // -------------------------------------------------------------
  // HANDLERS: VENDOR REGISTRATION
  // -------------------------------------------------------------
  const handleOpenAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      name: '',
      companyName: '',
      category: 'Cement & Aggregates',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Kolhapur',
      state: 'Maharashtra',
      gstin: '',
      pan: '',
      bankName: '',
      accountNo: '',
      ifscCode: '',
      paymentTermsDays: 30,
      status: 'Active',
      rating: 4.8
    });
    setIsAddVendorOpen(true);
  };

  const handleOpenEditVendor = (v) => {
    setEditingVendor(v);
    setVendorForm({
      name: v.name || '',
      companyName: v.companyName || v.name || '',
      category: v.category || 'Cement & Aggregates',
      contactPerson: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      city: v.city || 'Kolhapur',
      state: v.state || 'Maharashtra',
      gstin: v.gstin || '',
      pan: v.pan || '',
      bankName: v.bankName || '',
      accountNo: v.accountNo || '',
      ifscCode: v.ifscCode || '',
      paymentTermsDays: v.paymentTermsDays || 30,
      status: v.status || 'Active',
      rating: v.rating || 4.8
    });
    setIsAddVendorOpen(true);
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      alert('Please enter Vendor / Supplier Name.');
      return;
    }
    if (editingVendor) {
      updateVendor(editingVendor.id, vendorForm);
    } else {
      addVendor(vendorForm);
    }
    setIsAddVendorOpen(false);
    setEditingVendor(null);
  };

  const confirmDeleteVendor = () => {
    if (vendorToDelete) {
      deleteVendor(vendorToDelete.id);
      setVendorToDelete(null);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: VENDOR CONTACTS
  // -------------------------------------------------------------
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({
      vendorName: vendors[0]?.name || '',
      contactPerson: '',
      designation: 'Sales & Dispatch Lead',
      phone: '',
      alternatePhone: '',
      email: '',
      plantAddress: '',
      notes: ''
    });
    setIsAddContactOpen(true);
  };

  const handleOpenEditContact = (c) => {
    setEditingContact(c);
    setContactForm({
      vendorName: c.vendorName || '',
      contactPerson: c.contactPerson || '',
      designation: c.designation || 'Sales & Dispatch Lead',
      phone: c.phone || '',
      alternatePhone: c.alternatePhone || '',
      email: c.email || '',
      plantAddress: c.plantAddress || '',
      notes: c.notes || ''
    });
    setIsAddContactOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactForm.contactPerson.trim() || !contactForm.vendorName) {
      alert('Please specify Contact Person and select a Vendor.');
      return;
    }
    if (editingContact) {
      updateVendorContact(editingContact.id, contactForm);
    } else {
      addVendorContact(contactForm);
    }
    setIsAddContactOpen(false);
    setEditingContact(null);
  };

  const confirmDeleteContact = () => {
    if (contactToDelete) {
      deleteVendorContact(contactToDelete.id);
      setContactToDelete(null);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: PURCHASES & ORDERS
  // -------------------------------------------------------------
  const handleOpenAddPurchase = () => {
    setEditingPurchase(null);
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setPurchaseForm({
      poNumber: `PO-KLP-${Date.now().toString().slice(-4)}`,
      billNumber: '',
      date: today,
      dueDate: due,
      vendorName: vendors[0]?.name || '',
      projectName: projects[0]?.name || '',
      materialCategory: 'Cement & Aggregates',
      itemDescription: '',
      quantity: 1,
      unit: 'Bags',
      rate: 0,
      totalAmount: 0,
      paidInitial: 0,
      paymentMode: 'Bank Transfer',
      deliveryStatus: 'Delivered',
      notes: ''
    });
    setIsAddPurchaseOpen(true);
  };

  const handleOpenEditPurchase = (po) => {
    setEditingPurchase(po);
    setPurchaseForm({
      poNumber: po.poNumber || '',
      billNumber: po.billNumber || '',
      date: po.date || '',
      dueDate: po.dueDate || '',
      vendorName: po.vendorName || '',
      projectName: po.projectName || '',
      materialCategory: po.materialCategory || 'Cement & Aggregates',
      itemDescription: po.itemDescription || '',
      quantity: po.quantity || 1,
      unit: po.unit || 'Bags',
      rate: po.rate || 0,
      totalAmount: po.totalAmount || 0,
      paidInitial: po.paidAmount || 0,
      paymentMode: po.paymentMode || 'Bank Transfer',
      deliveryStatus: po.deliveryStatus || 'Delivered',
      notes: po.notes || ''
    });
    setIsAddPurchaseOpen(true);
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    if (!purchaseForm.vendorName || !purchaseForm.totalAmount) {
      alert('Please select Vendor and specify valid bill amount.');
      return;
    }
    if (editingPurchase) {
      updateVendorPurchase(editingPurchase.id, purchaseForm);
    } else {
      addVendorPurchase(purchaseForm);
    }
    setIsAddPurchaseOpen(false);
    setEditingPurchase(null);
  };

  const confirmDeletePurchase = () => {
    if (purchaseToDelete) {
      deleteVendorPurchase(purchaseToDelete.id);
      setPurchaseToDelete(null);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: VENDOR PAYMENTS
  // -------------------------------------------------------------
  const handleOpenRecordPayment = (payment) => {
    setPaymentToRecord(payment);
    setPaymentForm({
      amountPaid: payment.remainingAmount || '',
      paymentMode: 'Bank Transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNo: `UTR-${Date.now().toString().slice(-6)}`,
      notes: ''
    });
  };

  const handleExecutePayment = (e) => {
    e.preventDefault();
    if (!paymentToRecord) return;
    const amt = Number(paymentForm.amountPaid);
    if (!amt || amt <= 0) {
      alert('Please enter a valid disbursement amount greater than 0.');
      return;
    }
    if (amt > paymentToRecord.remainingAmount) {
      alert(`Payment cannot exceed outstanding balance of ₹${paymentToRecord.remainingAmount.toLocaleString('en-IN')}.`);
      return;
    }

    recordVendorPayment(
      paymentToRecord.id,
      amt,
      paymentForm.paymentMode,
      paymentForm.paymentDate,
      paymentForm.referenceNo,
      paymentForm.notes
    );
    setPaymentToRecord(null);
  };

  // -------------------------------------------------------------
  // KPI CALCULATIONS
  // -------------------------------------------------------------
  const totalVendorsCount = vendors.length;
  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
  const totalProcurementVolume = vendors.reduce((acc, v) => acc + (v.totalPurchase || 0), 0);
  const totalVendorPayables = vendors.reduce((acc, v) => acc + (v.outstandingBalance || 0), 0);
  const totalVendorPaid = vendors.reduce((acc, v) => acc + (v.paidAmount || 0), 0);

  const overdueVendorPaymentsCount = vendorPayments.filter(p => p.paymentStatus === 'Overdue').length;
  const overdueVendorAmount = vendorPayments
    .filter(p => p.paymentStatus === 'Overdue')
    .reduce((acc, p) => acc + (p.remainingAmount || 0), 0);

  // -------------------------------------------------------------
  // FILTERED DATA
  // -------------------------------------------------------------
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchCat = vendorCategoryFilter === 'All' || v.category === vendorCategoryFilter;
      const matchStatus = vendorStatusFilter === 'All' || v.status === vendorStatusFilter;
      return matchCat && matchStatus;
    });
  }, [vendors, vendorCategoryFilter, vendorStatusFilter]);

  const filteredContacts = useMemo(() => {
    return vendorContacts.filter(c => {
      const matchVendor = contactVendorFilter === 'All' || c.vendorName === contactVendorFilter;
      return matchVendor;
    });
  }, [vendorContacts, contactVendorFilter]);

  const filteredPurchases = useMemo(() => {
    return vendorPurchases.filter(p => {
      const matchVendor = purchaseVendorFilter === 'All' || p.vendorName === purchaseVendorFilter;
      const matchProject = purchaseProjectFilter === 'All' || p.projectName === purchaseProjectFilter;
      const matchDelivery = purchaseDeliveryFilter === 'All' || p.deliveryStatus === purchaseDeliveryFilter;
      return matchVendor && matchProject && matchDelivery;
    });
  }, [vendorPurchases, purchaseVendorFilter, purchaseProjectFilter, purchaseDeliveryFilter]);

  const filteredPayments = useMemo(() => {
    return vendorPayments.filter(p => {
      const matchStatus = paymentStatusFilter === 'All' || p.paymentStatus === paymentStatusFilter;
      const matchVendor = paymentVendorFilter === 'All' || p.vendorName === paymentVendorFilter;
      return matchStatus && matchVendor;
    });
  }, [vendorPayments, paymentStatusFilter, paymentVendorFilter]);

  // -------------------------------------------------------------
  // EXPORT HELPERS
  // -------------------------------------------------------------
  const exportVendorsExcel = () => {
    exportToExcel(filteredVendors, 'Sanmati_Vendors_Master');
  };

  const exportVendorsPDF = () => {
    const cols = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Vendor Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Contact Person', dataKey: 'contactPerson' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'GSTIN', dataKey: 'gstin' },
      { header: 'Total Orders (INR)', dataKey: 'totalPurchase' },
      { header: 'Balance Due (INR)', dataKey: 'outstandingBalance' },
      { header: 'Status', dataKey: 'status' }
    ];
    generatePDFReport({
      title: 'VENDOR REGISTRATION DIRECTORY & BALANCES',
      subtitle: 'Sanmati Constructions Kolhapur - Approved Subcontractors & Material Suppliers',
      data: filteredVendors,
      columns: cols,
      filename: 'Sanmati_Vendors_Report.pdf'
    });
  };

  const exportPurchasesExcel = () => {
    exportToExcel(filteredPurchases, 'Sanmati_Material_Purchases');
  };

  const exportPurchasesPDF = () => {
    const cols = [
      { header: 'PO / Bill No', dataKey: 'poNumber' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Vendor', dataKey: 'vendorName' },
      { header: 'Project', dataKey: 'projectName' },
      { header: 'Material', dataKey: 'materialCategory' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Total (INR)', dataKey: 'totalAmount' },
      { header: 'Delivery', dataKey: 'deliveryStatus' },
      { header: 'Payment', dataKey: 'paymentStatus' }
    ];
    generatePDFReport({
      title: 'PURCHASE ORDERS & MATERIAL INDENTS REPORT',
      subtitle: 'Cumulative Procurement and Inward Material Consignments',
      data: filteredPurchases,
      columns: cols,
      filename: 'Sanmati_Purchases_Report.pdf'
    });
  };

  // -------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATION
  // -------------------------------------------------------------
  // Sub 1: Vendors Columns
  const vendorColumns = [
    { 
      key: 'id', 
      header: 'Vendor ID', 
      minWidth: '100px',
      render: (r) => <span className="font-bold text-red-600 font-mono">{r.id}</span> 
    },
    {
      key: 'name',
      header: 'Vendor & Company',
      minWidth: '220px',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.name}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            {r.companyName || r.name}
          </span>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      minWidth: '170px',
      render: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#002046] border border-blue-200">
          {r.category}
        </span>
      )
    },
    {
      key: 'contact',
      header: 'Primary Contact',
      minWidth: '180px',
      render: (r) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{r.contactPerson || 'Direct Office'}</p>
          <a href={`tel:${r.phone}`} className="text-[11px] text-red-600 hover:underline flex items-center gap-1">
            <Phone className="w-3 h-3" /> {r.phone || 'N/A'}
          </a>
        </div>
      )
    },
    {
      key: 'gstin',
      header: 'GSTIN / PAN',
      minWidth: '140px',
      render: (r) => (
        <div className="font-mono text-[11px]">
          <p className="text-slate-800">{r.gstin || 'Unregistered'}</p>
          <p className="text-slate-400">{r.pan || ''}</p>
        </div>
      )
    },
    {
      key: 'totalPurchase',
      header: 'Total Procured',
      align: 'right',
      minWidth: '130px',
      render: (r) => <span className="font-mono font-bold text-slate-900">{formatCurrency(r.totalPurchase || 0)}</span>
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Due',
      align: 'right',
      minWidth: '130px',
      render: (r) => (
        <span className={`font-mono font-bold ${(r.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {formatCurrency(r.outstandingBalance || 0)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      minWidth: '90px',
      render: (r) => <StatusBadge status={r.status || 'Active'} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '130px',
      render: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedVendorDossier(r)}
            className="p-1.5 text-[#002046] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Vendor Dossier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditVendor(r)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Vendor"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVendorToDelete(r)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Vendor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Sub 2: Contacts Columns
  const contactColumns = [
    {
      key: 'contactPerson',
      header: 'Contact Person',
      minWidth: '200px',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.contactPerson}</span>
          <span className="text-[11px] text-red-600 font-medium">{r.designation}</span>
        </div>
      )
    },
    {
      key: 'vendorName',
      header: 'Supplier / Vendor Company',
      minWidth: '220px',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          {r.vendorName}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Mobile / Phone',
      minWidth: '160px',
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <a href={`tel:${r.phone}`} className="text-emerald-700 font-semibold hover:underline flex items-center gap-1">
            <Phone className="w-3 h-3" /> {r.phone}
          </a>
          {r.alternatePhone && (
            <span className="text-[10px] text-slate-400 block">Alt: {r.alternatePhone}</span>
          )}
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email Address',
      minWidth: '180px',
      render: (r) => (
        <a href={`mailto:${r.email}`} className="text-xs text-red-600 hover:underline flex items-center gap-1">
          <Mail className="w-3 h-3 text-slate-400" /> {r.email || 'N/A'}
        </a>
      )
    },
    {
      key: 'plantAddress',
      header: 'Plant / Yard Location',
      minWidth: '200px',
      render: (r) => (
        <div className="text-xs text-slate-600 flex items-start gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{r.plantAddress || 'Kolhapur Head Office'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '120px',
      render: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedContactDossier(r)}
            className="p-1.5 text-[#002046] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Contact Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditContact(r)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Contact"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setContactToDelete(r)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Sub 3: Purchases Columns
  const purchaseColumns = [
    {
      key: 'poNumber',
      header: 'PO / Bill Number',
      minWidth: '140px',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-red-600 block">{r.poNumber}</span>
          {r.billNumber && <span className="text-[10px] text-slate-500 font-mono">Inv: {r.billNumber}</span>}
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date & Due',
      minWidth: '130px',
      render: (r) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{formatDate(r.date)}</p>
          <p className="text-[10px] text-slate-400">Due: {formatDate(r.dueDate)}</p>
        </div>
      )
    },
    {
      key: 'vendorName',
      header: 'Vendor / Supplier',
      minWidth: '180px',
      render: (r) => (
        <span className="font-bold text-slate-900 block text-xs">{r.vendorName}</span>
      )
    },
    {
      key: 'projectName',
      header: 'Project Work',
      minWidth: '190px',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs line-clamp-1">{r.projectName}</span>
          <span className="text-[11px] text-red-600 font-medium">{r.materialCategory}</span>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Qty & Unit',
      minWidth: '110px',
      render: (r) => (
        <span className="text-xs font-mono font-semibold text-slate-700">
          {r.quantity} {r.unit}
        </span>
      )
    },
    {
      key: 'totalAmount',
      header: 'Bill Amount',
      align: 'right',
      minWidth: '130px',
      render: (r) => <span className="font-mono font-bold text-slate-900">{formatCurrency(r.totalAmount || 0)}</span>
    },
    {
      key: 'deliveryStatus',
      header: 'Delivery Status',
      align: 'center',
      minWidth: '140px',
      render: (r) => <StatusBadge status={r.deliveryStatus || 'Delivered'} />
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      align: 'center',
      minWidth: '110px',
      render: (r) => <StatusBadge status={r.paymentStatus || 'Pending'} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      minWidth: '120px',
      render: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedPurchaseDossier(r)}
            className="p-1.5 text-[#002046] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Bill Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditPurchase(r)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Purchase Bill"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPurchaseToDelete(r)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Purchase Bill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Sub 4: Payments Columns
  const paymentColumns = [
    {
      key: 'voucher',
      header: 'PO / Bill Ref',
      minWidth: '140px',
      render: (r) => (
        <div>
          <span className="font-mono font-bold text-red-600 block">{r.billNumber || r.poNumber}</span>
          <span className="text-[10px] text-slate-400 font-mono">{r.id}</span>
        </div>
      )
    },
    {
      key: 'vendorName',
      header: 'Vendor Name',
      minWidth: '200px',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.vendorName}</span>
          <span className="text-[11px] text-slate-500">{r.projectName}</span>
        </div>
      )
    },
    {
      key: 'billAmount',
      header: 'Total Bill (INR)',
      align: 'right',
      minWidth: '130px',
      render: (r) => <span className="font-mono font-bold text-slate-900">{formatCurrency(r.billAmount || 0)}</span>
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      align: 'right',
      minWidth: '130px',
      render: (r) => <span className="font-mono font-bold text-emerald-600">{formatCurrency(r.paidAmount || 0)}</span>
    },
    {
      key: 'remainingAmount',
      header: 'Remaining Balance',
      align: 'right',
      minWidth: '140px',
      render: (r) => (
        <span className={`font-mono font-bold ${(r.remainingAmount || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {formatCurrency(r.remainingAmount || 0)}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      minWidth: '110px',
      render: (r) => (
        <span className={`text-xs font-semibold ${r.paymentStatus === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
          {formatDate(r.dueDate)}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      align: 'center',
      minWidth: '110px',
      render: (r) => <StatusBadge status={r.paymentStatus || 'Pending'} />
    },
    {
      key: 'actions',
      header: 'Payment Actions',
      align: 'center',
      minWidth: '170px',
      render: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          {r.remainingAmount > 0 ? (
            <button
              onClick={() => handleOpenRecordPayment(r)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              title="Disburse Payment"
            >
              <DollarSign className="w-3.5 h-3.5" /> Disburse
            </button>
          ) : (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Settled
            </span>
          )}

          <button
            onClick={() => setSelectedPaymentHistory(r)}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Installment History"
          >
            <Clock className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={() => setSelectedVoucherPrint(r)}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Print Payment Voucher"
          >
            <Printer className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* SUB-MODULE 1: VENDOR REGISTRATION & DETAILS */}
      {/* ========================================================= */}
      {activeTab === 'registration' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                3. Vendor Management • Sub-module (i)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Vendor Registration & Master Details
              </h2>
              <p className="text-xs text-slate-500">
                Register civil subcontractors, raw material suppliers (Cement, TMT Steel, RMC), and equipment leasing firms.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportVendorsExcel}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" /> Excel
              </button>
              <button
                onClick={exportVendorsPDF}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4 text-rose-600" /> PDF Report
              </button>
              <button
                onClick={handleOpenAddVendor}
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-red-500/15"
              >
                <Plus className="w-4 h-4" /> Add Vendor
              </button>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Registered</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">{totalVendorsCount}</span>
                <Truck className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[11px] text-red-600 font-medium">Approved civil vendors</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Suppliers</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-emerald-600">{activeVendorsCount}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Ready for procurement indents</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Procured</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(totalProcurementVolume)}</span>
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[11px] text-slate-400">Cumulative purchase volume</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Payables Due</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-rose-600 font-mono">{formatCurrency(totalVendorPayables)}</span>
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-[11px] text-rose-600 font-medium">Total supplier liabilities</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase">Category:</span>
              <select
                value={vendorCategoryFilter}
                onChange={(e) => setVendorCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Categories</option>
                {VENDOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Status:</span>
              <select
                value={vendorStatusFilter}
                onChange={(e) => setVendorStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={vendorColumns}
            data={filteredVendors}
            searchPlaceholder="Search by vendor name, contact person, GSTIN..."
            itemsPerPage={10}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 2: VENDOR CONTACT MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-[#004bb5] uppercase tracking-wider">
                3. Vendor Management • Sub-module (ii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Vendor Contact Directory & Key Personnel
              </h2>
              <p className="text-xs text-slate-500">
                Directory of sales managers, batching plant heads, and dispatch coordinators for rapid site material delivery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddContact}
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#002046]/25 active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" /> Add Vendor Contact
              </button>
            </div>
          </div>

          {/* Contact Filter */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase">Filter by Supplier:</span>
            <select
              value={contactVendorFilter}
              onChange={(e) => setContactVendorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
            >
              <option value="All">All Vendors</option>
              {vendors.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Contacts Data Table */}
          <DataTable
            columns={contactColumns}
            data={filteredContacts}
            searchPlaceholder="Search contact by name, role, phone..."
            itemsPerPage={10}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 3: PURCHASE HISTORY & MATERIAL INDENTS */}
      {/* ========================================================= */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-extrabold text-[#004bb5] uppercase tracking-wider">
                3. Vendor Management • Sub-module (iii)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Purchase History & Material Indents
              </h2>
              <p className="text-xs text-slate-500">
                Track procurement orders, concrete challans, TMT steel invoices, and delivery inspections.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportPurchasesExcel}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" /> Excel
              </button>
              <button
                onClick={exportPurchasesPDF}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4 text-rose-600" /> PDF Report
              </button>
              <button
                onClick={handleOpenAddPurchase}
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#002046]/25 active:scale-95"
              >
                <Plus className="w-4 h-4 text-white" /> Add Purchase Order
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase">Vendor:</span>
              <select
                value={purchaseVendorFilter}
                onChange={(e) => setPurchaseVendorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Project:</span>
              <select
                value={purchaseProjectFilter}
                onChange={(e) => setPurchaseProjectFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Delivery:</span>
              <select
                value={purchaseDeliveryFilter}
                onChange={(e) => setPurchaseDeliveryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Statuses</option>
                {DELIVERY_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchases Data Table */}
          <DataTable
            columns={purchaseColumns}
            data={filteredPurchases}
            searchPlaceholder="Search by PO number, item, vendor, project..."
            itemsPerPage={10}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODULE 4: VENDOR PAYMENT TRACKING */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                3. Vendor Management • Sub-module (iv)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Vendor Payment Tracking & Outstanding Dues
              </h2>
              <p className="text-xs text-slate-500">
                Manage commercial supplier payables, release partial RTGS installments, and generate payment vouchers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportToExcel(filteredPayments, 'Sanmati_Vendor_Payments');
                }}
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#002046]/25 active:scale-95"
              >
                <Download className="w-4 h-4 text-white" /> Export Payables
              </button>
            </div>
          </div>

          {/* Overdue Alert Banner */}
          {overdueVendorPaymentsCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">Urgent: Overdue Vendor Liabilities</h4>
                  <p className="text-sm font-semibold">
                    {overdueVendorPaymentsCount} bills past due date totaling{' '}
                    <span className="font-mono font-bold underline">{formatCurrency(overdueVendorAmount)}</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentStatusFilter('Overdue')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                View Overdue
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase">Payment Status:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Supplier:</span>
              <select
                value={paymentVendorFilter}
                onChange={(e) => setPaymentVendorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#004bb5]"
              >
                <option value="All">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payments Data Table */}
          <DataTable
            columns={paymentColumns}
            data={filteredPayments}
            searchPlaceholder="Search by PO/bill, vendor name, project..."
            itemsPerPage={10}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT VENDOR */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        title={editingVendor ? "Edit Vendor Profile" : "Register New Vendor / Subcontractor"}
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Vendor / Supplier Name *</label>
              <input
                type="text"
                required
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                placeholder="Enter vendor / supplier name"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Company / Firm Legal Name</label>
              <input
                type="text"
                value={vendorForm.companyName}
                onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                placeholder="Enter company / firm legal name"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Category *</label>
              <select
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              >
                {VENDOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Primary Contact Person</label>
              <input
                type="text"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                placeholder="Enter contact person name"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Mobile Number</label>
              <input
                type="tel"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                placeholder="vendor@email.com"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">GSTIN (15 Digits)</label>
              <input
                type="text"
                maxLength={15}
                value={vendorForm.gstin}
                onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                placeholder="27AABCU1234F1Z5"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">PAN Number</label>
              <input
                type="text"
                maxLength={10}
                value={vendorForm.pan}
                onChange={(e) => setVendorForm({ ...vendorForm, pan: e.target.value.toUpperCase() })}
                placeholder="AABCU1234F"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-red-600" /> Bank Settlement Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Bank Name</label>
                <input
                  type="text"
                  value={vendorForm.bankName}
                  onChange={(e) => setVendorForm({ ...vendorForm, bankName: e.target.value })}
                  placeholder="HDFC Bank"
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Account Number</label>
                <input
                  type="text"
                  value={vendorForm.accountNo}
                  onChange={(e) => setVendorForm({ ...vendorForm, accountNo: e.target.value })}
                  placeholder="50200012345678"
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">IFSC Code</label>
                <input
                  type="text"
                  value={vendorForm.ifscCode}
                  onChange={(e) => setVendorForm({ ...vendorForm, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="HDFC0000182"
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Payment Terms (Days)</label>
              <input
                type="number"
                value={vendorForm.paymentTermsDays}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTermsDays: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Operational Status</label>
              <select
                value={vendorForm.status}
                onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Office / Yard Address</label>
            <textarea
              rows={2}
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              placeholder="MIDC Shiroli / Gokul Shirgaon, Kolhapur"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddVendorOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {editingVendor ? "Update Vendor" : "Register Vendor"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: VIEW VENDOR COMPLETE DOSSIER */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!selectedVendorDossier}
        onClose={() => setSelectedVendorDossier(null)}
        title="Complete Vendor Profile Dossier"
      >
        {selectedVendorDossier && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-[#002046] to-[#002855] rounded-2xl text-white flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-mono text-blue-200 block">{selectedVendorDossier.id}</span>
                <h3 className="text-lg font-black text-white" style={{ color: '#ffffff' }}>{selectedVendorDossier.name}</h3>
                <span className="text-xs text-blue-100">{selectedVendorDossier.category}</span>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedVendorDossier.status || 'Active'} />
                <div className="flex items-center gap-1 mt-1 justify-end text-amber-300 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" /> {selectedVendorDossier.rating || 4.8} / 5.0
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Purchases</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {formatCurrency(selectedVendorDossier.totalPurchase || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding Payable</span>
                <span className="text-base font-black text-rose-600 font-mono">
                  {formatCurrency(selectedVendorDossier.outstandingBalance || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-semibold text-slate-800">{selectedVendorDossier.contactPerson || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedVendorDossier.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{selectedVendorDossier.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">GSTIN:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedVendorDossier.gstin || 'Unregistered'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Bank Name & A/c:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedVendorDossier.bankName ? `${selectedVendorDossier.bankName} (${selectedVendorDossier.accountNo})` : 'Not on file'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Office / Yard Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[240px]">{selectedVendorDossier.address || 'Kolhapur'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedVendorDossier(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT VENDOR CONTACT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        title={editingContact ? "Edit Contact Person" : "Add Vendor Key Contact"}
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Vendor / Supplier Company *</label>
            <select
              required
              value={contactForm.vendorName}
              onChange={(e) => setContactForm({ ...contactForm, vendorName: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
            >
              <option value="">Select Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.name}>{v.name} ({v.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Contact Person Name *</label>
              <input
                type="text"
                required
                value={contactForm.contactPerson}
                onChange={(e) => setContactForm({ ...contactForm, contactPerson: e.target.value })}
                placeholder="e.g. Rahul Shinde"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Designation / Role</label>
              <input
                type="text"
                value={contactForm.designation}
                onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                placeholder="e.g. Batching Plant Dispatch Head"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Primary Phone / Mobile *</label>
              <input
                type="tel"
                required
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="+91 98221 11223"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Alternate Phone</label>
              <input
                type="tel"
                value={contactForm.alternatePhone}
                onChange={(e) => setContactForm({ ...contactForm, alternatePhone: e.target.value })}
                placeholder="+91 94220 99887"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="r.shinde@kolhapurcement.com"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Plant / Yard Location</label>
            <input
              type="text"
              value={contactForm.plantAddress}
              onChange={(e) => setContactForm({ ...contactForm, plantAddress: e.target.value })}
              placeholder="Plot No. 44, MIDC Shiroli, Kolhapur"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddContactOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {editingContact ? "Update Contact" : "Add Contact"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PURCHASE ORDER & BILL */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddPurchaseOpen}
        onClose={() => setIsAddPurchaseOpen(false)}
        title={editingPurchase ? "Edit Purchase Bill / PO" : "Record New Raw Material Purchase / Subcontractor Bill"}
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Vendor / Supplier *</label>
              <select
                required
                value={purchaseForm.vendorName}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, vendorName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              >
                <option value="">Select Vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.name}>{v.name} ({v.category})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Civil Project Work *</label>
              <select
                required
                value={purchaseForm.projectName}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, projectName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">PO Number</label>
              <input
                type="text"
                value={purchaseForm.poNumber}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, poNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Supplier Invoice / Bill No</label>
              <input
                type="text"
                value={purchaseForm.billNumber}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, billNumber: e.target.value })}
                placeholder="e.g. UTC/KLP/2026/049"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Bill Date</label>
              <input
                type="date"
                required
                value={purchaseForm.date}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Payment Due Date</label>
              <input
                type="date"
                required
                value={purchaseForm.dueDate}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, dueDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Material Category</label>
              <select
                value={purchaseForm.materialCategory}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, materialCategory: e.target.value })}
                className="w-full mt-1 px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {VENDOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Quantity</label>
              <input
                type="number"
                min="1"
                value={purchaseForm.quantity}
                onChange={(e) => {
                  const qty = Number(e.target.value) || 1;
                  const rate = Number(purchaseForm.rate) || 0;
                  setPurchaseForm({ 
                    ...purchaseForm, 
                    quantity: qty,
                    totalAmount: rate > 0 ? qty * rate : purchaseForm.totalAmount 
                  });
                }}
                className="w-full mt-1 px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Unit</label>
              <select
                value={purchaseForm.unit}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                className="w-full mt-1 px-2.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Bags">Bags (50 kg)</option>
                <option value="Metric Tons">Metric Tons (MT)</option>
                <option value="Cu.M">Cu.M (Concrete / RMC)</option>
                <option value="Trips">Trips / Brass (Sand/Aggregate)</option>
                <option value="Sq.Ft">Sq.Ft (Tiles / Shuttering)</option>
                <option value="Hours">Hours (JCB / Crane)</option>
                <option value="Units">Units / Numbers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Total Bill Amount (INR) *</label>
              <input
                type="number"
                required
                min="1"
                value={purchaseForm.totalAmount}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, totalAmount: e.target.value })}
                placeholder="e.g. 150000"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#004bb5]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Initial Advance Paid</label>
              <input
                type="number"
                min="0"
                value={purchaseForm.paidInitial}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, paidInitial: e.target.value })}
                placeholder="0"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Delivery Status</label>
              <select
                value={purchaseForm.deliveryStatus}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, deliveryStatus: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {DELIVERY_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Item Description / Grade</label>
              <input
                type="text"
                value={purchaseForm.itemDescription}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, itemDescription: e.target.value })}
                placeholder="e.g. OPC 53 Grade Cement for Column Casting"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPurchaseOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {editingPurchase ? "Update Purchase Bill" : "Log Bill & Post to Ledger"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: DISBURSE VENDOR PAYMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!paymentToRecord}
        onClose={() => setPaymentToRecord(null)}
        title="Disburse Payment to Vendor"
      >
        {paymentToRecord && (
          <form onSubmit={handleExecutePayment} className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Vendor / Supplier:</span>
                <span className="font-bold text-slate-900">{paymentToRecord.vendorName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Bill / PO Reference:</span>
                <span className="font-mono font-semibold text-red-600">{paymentToRecord.billNumber || paymentToRecord.poNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Bill Amount:</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(paymentToRecord.billAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Already Settled:</span>
                <span className="font-mono font-semibold text-emerald-600">{formatCurrency(paymentToRecord.paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 font-bold">
                <span className="text-rose-600">Remaining Balance Due:</span>
                <span className="font-mono text-sm text-rose-600">{formatCurrency(paymentToRecord.remainingAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Payment Amount (INR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentToRecord.remainingAmount}
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-600 focus:outline-none focus:border-[#004bb5]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Payment Mode</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#004bb5]"
                >
                  {PAYMENT_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Disbursement Date</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Bank Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  value={paymentForm.referenceNo}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                  placeholder="e.g. UTR12345678"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Notes / Settlement Remarks</label>
              <textarea
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="RTGS payment released via Kolhapur Head Office Bank"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentToRecord(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Confirm Disbursement & Post Debit
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: VENDOR PAYMENT INSTALLMENT HISTORY */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!selectedPaymentHistory}
        onClose={() => setSelectedPaymentHistory(null)}
        title="Vendor Payment Disbursement History"
      >
        {selectedPaymentHistory && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{selectedPaymentHistory.vendorName}</span>
                <span className="text-[11px] text-slate-500 font-mono">Bill Ref: {selectedPaymentHistory.billNumber || selectedPaymentHistory.poNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Total Settled</span>
                <span className="font-mono font-bold text-emerald-600">{formatCurrency(selectedPaymentHistory.paidAmount)}</span>
              </div>
            </div>

            {selectedPaymentHistory.paymentHistory && selectedPaymentHistory.paymentHistory.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedPaymentHistory.paymentHistory.map((inst, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{formatCurrency(inst.amount)}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#002046] border border-blue-200">
                          {inst.mode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Ref: {inst.referenceNo || 'N/A'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-600 font-medium">{formatDate(inst.date)}</span>
                      {inst.notes && <p className="text-[10px] text-slate-400 italic">{inst.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No installment disbursements recorded yet for this bill.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPaymentHistory(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: PRINT OFFICIAL VENDOR PAYMENT VOUCHER */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!selectedVoucherPrint}
        onClose={() => setSelectedVoucherPrint(null)}
        title="Official Vendor Payment Voucher"
      >
        {selectedVoucherPrint && (
          <div className="space-y-4">
            <div id="vendor-printable-voucher" className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 space-y-4">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black tracking-tight uppercase text-red-700">SANMATI CONSTRUCTIONS</h2>
                <p className="text-[10px] text-slate-500">Kolhapur, Maharashtra, India • GSTIN: 27AAYCS9281Q1ZU</p>
                <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Vendor Disbursement Voucher
                </div>
              </div>

              {/* Voucher Meta */}
              <div className="grid grid-cols-2 text-xs gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Paid To Vendor</span>
                  <strong className="text-slate-900 text-sm">{selectedVoucherPrint.vendorName}</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedVoucherPrint.projectName}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-400 text-[10px] uppercase block">Voucher No</span>
                  <strong className="text-red-600">{selectedVoucherPrint.id}</strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">Date: {formatDate(new Date())}</p>
                </div>
              </div>

              {/* Financial Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Purchase Bill No:</span>
                  <span className="font-mono font-bold">{selectedVoucherPrint.billNumber || selectedVoucherPrint.poNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Total Bill Value:</span>
                  <span className="font-mono">{formatCurrency(selectedVoucherPrint.billAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Disbursed (Paid):</span>
                  <span className="font-mono font-bold text-emerald-600">{formatCurrency(selectedVoucherPrint.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200 font-bold">
                  <span className="text-rose-600">Outstanding Balance:</span>
                  <span className="font-mono text-rose-600">{formatCurrency(selectedVoucherPrint.remainingAmount)}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-500 border-t border-slate-200 mt-6">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <span>Accountant / Cashier</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <span>Authorized Signatory</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedVoucherPrint(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-white" /> Print Voucher
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* CONFIRMATION DIALOG: DELETE VENDOR */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        title="Confirm Vendor Deletion"
      >
        {vendorToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete vendor <strong className="text-slate-900">{vendorToDelete.name}</strong> ({vendorToDelete.id})?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              ⚠️ Warning: Deleting this vendor will remove their profile from the active directory.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setVendorToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVendor}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* CONFIRMATION DIALOG: DELETE CONTACT */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        title="Confirm Contact Deletion"
      >
        {contactToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to remove contact person <strong className="text-slate-900">{contactToDelete.contactPerson}</strong> for vendor {contactToDelete.vendorName}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteContact}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Delete Contact
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* CONFIRMATION DIALOG: DELETE PURCHASE BILL */}
      {/* ========================================================= */}
      <Modal
        isOpen={!!purchaseToDelete}
        onClose={() => setPurchaseToDelete(null)}
        title="Confirm Purchase Bill Deletion"
      >
        {purchaseToDelete && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to remove purchase order <strong className="text-slate-900">{purchaseToDelete.poNumber}</strong> for {purchaseToDelete.vendorName}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPurchaseToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePurchase}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Delete Purchase
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default VendorsModule;
