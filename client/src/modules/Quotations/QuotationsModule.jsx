// MODULE 8: QUOTATION MANAGEMENT - 4-Submodule System
// i. Create and Manage Quotations | ii. Material and Service Pricing | iii. Quotation PDF Generation | iv. Quotation Status Tracking
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FilePlus, 
  Calculator, 
  FileDown, 
  Clock, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Send, 
  FileText, 
  Building2, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  Check, 
  RefreshCw,
  Package,
  Wrench,
  Percent,
  DollarSign,
  ChevronDown,
  X,
  ArrowRight
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { COMPANY_DETAILS } from '../../utils/constants';
import { formatCurrency, formatDate, formatNumber, numberToWordsIndian } from '../../utils/formatters';
import { generatePDFReport } from '../../services/exportService';

// Default initial items matching user's exact specification
const DEFAULT_PRICING_ITEMS = [
  { id: 'item-1', name: 'Cement', type: 'Material', qty: 100, unit: 'Bags', rate: 400, amount: 40000 },
  { id: 'item-2', name: 'Steel', type: 'Material', qty: 500, unit: 'Kg', rate: 65, amount: 32500 },
  { id: 'item-3', name: 'Sand', type: 'Material', qty: 20, unit: 'Brass', rate: 1500, amount: 30000 },
  { id: 'item-4', name: 'Labour', type: 'Service', qty: 10, unit: 'Days', rate: 2000, amount: 20000 },
  { id: 'item-5', name: 'Transportation', type: 'Service', qty: 1, unit: 'Nos', rate: 5000, amount: 5000 }
];

export const QuotationsModule = () => {
  const { quotations, setQuotations, clients } = useERPData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active submodule tab from query string: 'manage' | 'pricing' | 'pdf' | 'status'
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam && ['manage', 'pricing', 'pdf', 'status'].includes(tabParam)) 
    ? tabParam 
    : 'manage';

  // Selected Quotation ID for pricing & PDF generation
  const [selectedQuoId, setSelectedQuoId] = useState(() => {
    return quotations?.[0]?.id || quotations?.[0]?.quotationNo || 'QT-001';
  });

  // Success toast when a quotation is created with quick jump to Pricing
  const [createdToastMessage, setCreatedToastMessage] = useState(null);

  // Keep selectedQuoId in sync with latest quotations
  useEffect(() => {
    if (quotations && quotations.length > 0) {
      const exists = quotations.some(q => q.id === selectedQuoId || q.quotationNo === selectedQuoId);
      if (!exists) {
        setSelectedQuoId(quotations[0].id || quotations[0].quotationNo);
      }
    }
  }, [quotations, selectedQuoId]);

  // Currently selected quotation for Pricing and PDF view
  const activeQuotation = useMemo(() => {
    if (!quotations || quotations.length === 0) return null;
    return quotations.find(q => q.id === selectedQuoId || q.quotationNo === selectedQuoId) || quotations[0];
  }, [quotations, selectedQuoId]);

  // Modal States for Create & Edit
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuo, setEditingQuo] = useState(null);
  const [viewingQuo, setViewingQuo] = useState(null);
  const [shareToast, setShareToast] = useState('');

  // Search and Filter in Manage & Status
  const [manageSearch, setManageSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State for Create / Edit Quotation
  const [formData, setFormData] = useState({
    quotationNo: '',
    quotationDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    mobileNumber: '',
    email: '',
    projectName: '',
    projectLocation: 'Kolhapur, Maharashtra',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    description: '',
    totalAmount: 147500
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const nextNum = (quotations?.length || 0) + 1;
    const padNum = String(nextNum).padStart(3, '0');
    setFormData({
      quotationNo: `QT-${padNum}`,
      quotationDate: new Date().toISOString().split('T')[0],
      customerName: clients?.[0]?.name || '',
      customerAddress: clients?.[0]?.address || 'Kolhapur',
      mobileNumber: clients?.[0]?.mobileNumber || '+91 98220 12345',
      email: clients?.[0]?.email || 'customer@gmail.com',
      projectName: 'Building Construction Work',
      projectLocation: 'Kawala Naka, Kolhapur',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      description: 'Building Construction work complete including foundation, RCC, brickwork, and plaster.',
      totalAmount: 147500
    });
    setEditingQuo(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (quo) => {
    setFormData({
      quotationNo: quo.quotationNo || quo.id,
      quotationDate: quo.quotationDate || quo.createdDate || new Date().toISOString().split('T')[0],
      customerName: quo.customerName || quo.clientName || '',
      customerAddress: quo.customerAddress || '',
      mobileNumber: quo.mobileNumber || quo.clientPhone || '',
      email: quo.email || '',
      projectName: quo.projectName || quo.projectTitle || '',
      projectLocation: quo.projectLocation || quo.siteLocation || '',
      validUntil: quo.validUntil || quo.validTill || '',
      description: quo.description || '',
      totalAmount: quo.totalAmount !== undefined ? quo.totalAmount : (quo.totalQuotationValue || 0)
    });
    setEditingQuo(quo);
    setIsCreateModalOpen(true);
  };

  // Save Quotation (Create or Update)
  const handleSaveQuotationForm = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.projectName.trim()) {
      alert('कृपया ग्राहकाचे नाव आणि कामाचे नाव भरा.');
      return;
    }

    if (editingQuo) {
      // Update existing
      setQuotations(prev => (prev || []).map(q => {
        if (q.id === editingQuo.id || q.quotationNo === editingQuo.quotationNo) {
          return {
            ...q,
            quotationNo: formData.quotationNo,
            quotationDate: formData.quotationDate,
            createdDate: formData.quotationDate,
            customerName: formData.customerName,
            clientName: formData.customerName,
            customerAddress: formData.customerAddress,
            mobileNumber: formData.mobileNumber,
            clientPhone: formData.mobileNumber,
            email: formData.email,
            projectName: formData.projectName,
            projectTitle: formData.projectName,
            projectLocation: formData.projectLocation,
            siteLocation: formData.projectLocation,
            validUntil: formData.validUntil,
            validTill: formData.validUntil,
            description: formData.description,
            totalAmount: Number(formData.totalAmount) || q.totalAmount,
            totalQuotationValue: Number(formData.totalAmount) || q.totalQuotationValue
          };
        }
        return q;
      }));
    } else {
      // Create new quotation
      const newQuo = {
        id: formData.quotationNo || `QT-${Date.now()}`,
        quotationNo: formData.quotationNo,
        quotationDate: formData.quotationDate,
        createdDate: formData.quotationDate,
        customerName: formData.customerName,
        clientName: formData.customerName,
        customerAddress: formData.customerAddress,
        mobileNumber: formData.mobileNumber,
        clientPhone: formData.mobileNumber,
        email: formData.email,
        projectName: formData.projectName,
        projectTitle: formData.projectName,
        projectLocation: formData.projectLocation,
        siteLocation: formData.projectLocation,
        validUntil: formData.validUntil,
        validTill: formData.validUntil,
        description: formData.description,
        items: [...DEFAULT_PRICING_ITEMS],
        subtotal: 127500,
        discount: 2500,
        taxableAmount: 125000,
        gstRate: 18,
        gstAmount: 22500,
        totalAmount: Number(formData.totalAmount) || 147500,
        totalQuotationValue: Number(formData.totalAmount) || 147500,
        status: 'Draft',
        paymentTerms: '15% Advance, 75% against work progress measurements, 10% on handover.',
        workCompletionTerms: 'Work completion within 4 months from site clearance.',
        termsAndConditions: '1. Quotation valid for 30 days. 2. Water & electricity provided by client.'
      };

      setQuotations(prev => [newQuo, ...(prev || [])]);
      setSelectedQuoId(newQuo.id);
      setCreatedToastMessage({
        quotationNo: newQuo.quotationNo,
        id: newQuo.id,
        customer: newQuo.customerName
      });
    }

    setIsCreateModalOpen(false);
  };

  // Duplicate Quotation
  const handleDuplicateQuotation = (quo) => {
    const nextCount = (quotations?.length || 0) + 1;
    const padNum = String(nextCount).padStart(3, '0');
    const newId = `QT-${padNum}`;
    const duplicate = {
      ...quo,
      id: newId,
      quotationNo: newId,
      quotationDate: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      projectName: `${quo.projectName || quo.projectTitle} (Copy)`,
      projectTitle: `${quo.projectName || quo.projectTitle} (Copy)`
    };
    setQuotations(prev => [duplicate, ...(prev || [])]);
    setSelectedQuoId(duplicate.id);
    setCreatedToastMessage({
      quotationNo: duplicate.quotationNo,
      id: duplicate.id,
      customer: duplicate.customerName || duplicate.clientName
    });
  };

  // Delete Quotation
  const handleDeleteQuotation = (id) => {
    if (window.confirm('तुम्हाला हे Quotation काढून टाकायचे आहे का?')) {
      setQuotations(prev => (prev || []).filter(q => q.id !== id && q.quotationNo !== id));
      if (selectedQuoId === id) {
        const remaining = (quotations || []).filter(q => q.id !== id && q.quotationNo !== id);
        if (remaining.length > 0) setSelectedQuoId(remaining[0].id || remaining[0].quotationNo);
      }
    }
  };

  // Change Status
  const handleUpdateStatus = (id, newStatus) => {
    setQuotations(prev => (prev || []).map(q => (q.id === id || q.quotationNo === id) ? { ...q, status: newStatus } : q));
  };

  /* -------------------------------------------------------------
   * PRICING BUILDER STATE & CALCULATIONS
   * ------------------------------------------------------------- */
  const [pricingItems, setPricingItems] = useState(DEFAULT_PRICING_ITEMS);
  const [discountAmt, setDiscountAmt] = useState(2500);
  const [gstPercent, setGstPercent] = useState(18);

  // Sync pricing items whenever activeQuotation changes
  useEffect(() => {
    if (activeQuotation) {
      if (activeQuotation.items && activeQuotation.items.length > 0) {
        setPricingItems(activeQuotation.items);
      } else {
        setPricingItems(DEFAULT_PRICING_ITEMS);
      }
      setDiscountAmt(activeQuotation.discount !== undefined ? activeQuotation.discount : 2500);
      setGstPercent(activeQuotation.gstRate || 18);
    }
  }, [activeQuotation?.id, activeQuotation?.quotationNo]);

  // Live Auto-Calculations
  const subtotal = useMemo(() => {
    return pricingItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [pricingItems]);

  const taxableAmount = Math.max(0, subtotal - Number(discountAmt || 0));
  const gstAmount = (taxableAmount * Number(gstPercent || 0)) / 100;
  const grandTotal = taxableAmount + gstAmount;

  // Add Item to Pricing (Material or Service)
  const handleAddPricingItem = (type = 'Material') => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: type === 'Material' ? 'New Material' : 'New Service',
      type: type,
      qty: 1,
      unit: type === 'Material' ? 'Bags' : 'Days',
      rate: 1000,
      amount: 1000
    };
    setPricingItems(prev => [...prev, newItem]);
  };

  // Update Item (Auto recalculates amount: qty * rate)
  const handleUpdatePricingItem = (id, field, value) => {
    setPricingItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const q = field === 'qty' ? Number(value) || 0 : Number(item.qty) || 0;
          const r = field === 'rate' ? Number(value) || 0 : Number(item.rate) || 0;
          updated.amount = q * r;
        }
        return updated;
      }
      return item;
    }));
  };

  // Remove Item
  const handleRemovePricingItem = (id) => {
    setPricingItems(prev => prev.filter(item => item.id !== id));
  };

  // Save Pricing Changes to Active Quotation
  const handleSavePricingToQuotation = () => {
    if (!activeQuotation) return;
    const targetId = activeQuotation.id || activeQuotation.quotationNo;
    setQuotations(prev => (prev || []).map(q => {
      if (q.id === targetId || q.quotationNo === targetId) {
        return {
          ...q,
          items: pricingItems,
          subtotal: subtotal,
          discount: Number(discountAmt) || 0,
          taxableAmount: taxableAmount,
          gstRate: Number(gstPercent),
          gstAmount: gstAmount,
          totalAmount: grandTotal,
          totalQuotationValue: grandTotal
        };
      }
      return q;
    }));
    alert(`Quotation ${activeQuotation.quotationNo || targetId} चे Material आणि Service Pricing सेव्ह झाले! एकूण: ${formatCurrency(grandTotal)}`);
  };

  /* -------------------------------------------------------------
   * PDF GENERATION
   * ------------------------------------------------------------- */
  const handleDownloadPDF = () => {
    if (!activeQuotation) return;
    const currentItems = activeQuotation.items || pricingItems;
    const rows = currentItems.map(item => [
      item.name,
      item.type || 'Material',
      `${item.qty} ${item.unit || ''}`,
      formatCurrency(item.rate),
      formatCurrency(item.amount)
    ]);

    rows.push(["-----------------------", "------------", "--------", "------------", "------------"]);
    rows.push(["Subtotal", "", "", "", formatCurrency(activeQuotation.subtotal !== undefined ? activeQuotation.subtotal : subtotal)]);
    rows.push(["Less: Discount", "", "", "", `-${formatCurrency(activeQuotation.discount !== undefined ? activeQuotation.discount : discountAmt)}`]);
    rows.push(["Taxable Amount", "", "", "", formatCurrency(activeQuotation.taxableAmount !== undefined ? activeQuotation.taxableAmount : taxableAmount)]);
    rows.push([`GST @ ${activeQuotation.gstRate || 18}%`, "", "", "", formatCurrency(activeQuotation.gstAmount !== undefined ? activeQuotation.gstAmount : gstAmount)]);
    rows.push(["GRAND TOTAL", "", "", "", formatCurrency(activeQuotation.totalAmount !== undefined ? activeQuotation.totalAmount : grandTotal)]);

    generatePDFReport({
      title: "SANMATI CONSTRUCTIONS - ESTIMATED QUOTATION",
      subtitle: `Quotation No: ${activeQuotation.quotationNo} | Date: ${formatDate(activeQuotation.quotationDate || activeQuotation.createdDate)} | Client: ${activeQuotation.customerName || activeQuotation.clientName}`,
      headers: ["Item / Material / Service", "Category", "Quantity", "Rate (INR)", "Amount (INR)"],
      rows: rows,
      fileName: `Quotation_${activeQuotation.quotationNo}`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Sanmati Constructions Quotation: ${activeQuotation?.quotationNo}\nProject: ${activeQuotation?.projectName || activeQuotation?.projectTitle}\nTotal: ${formatCurrency(activeQuotation?.totalAmount || grandTotal)}\nValid Till: ${formatDate(activeQuotation?.validUntil || activeQuotation?.validTill)}`;
    navigator.clipboard?.writeText(text);
    setShareToast('कोटेशनची माहिती क्लिपबोर्डवर कॉपी झाली! ग्राहकाला शेअर करा.');
    setTimeout(() => setShareToast(''), 3000);
  };

  /* =============================================================
   * RENDER SUBMODULE 1: i. Create and Manage Quotations
   * ============================================================= */
  const renderManageQuotations = () => {
    const filtered = (quotations || []).filter(q => {
      if (!manageSearch.trim()) return true;
      const s = manageSearch.toLowerCase();
      const qNo = (q.quotationNo || q.id || '').toLowerCase();
      const cName = (q.customerName || q.clientName || '').toLowerCase();
      const pName = (q.projectName || q.projectTitle || '').toLowerCase();
      const pLoc = (q.projectLocation || q.siteLocation || '').toLowerCase();
      return qNo.includes(s) || cName.includes(s) || pName.includes(s) || pLoc.includes(s);
    });

    return (
      <div className="space-y-6">
        {/* Banner with Create Quotation button */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule i</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Create and Manage Quotations (कोटेशन व्यवस्थापन)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              नवीन Quotation तयार करणे, पाहणे, एडिट करणे, किंमत ठरवणे आणि डुप्लिकेट करणे.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Quotation</span>
          </button>
        </div>

        {/* Creation Success Banner with Direct Link to Pricing */}
        {createdToastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block text-sm">
                  कोटेशन {createdToastMessage.quotationNo} ({createdToastMessage.customer}) यशस्वीरीत्या तयार झाले!
                </span>
                <span className="text-emerald-700">
                  हे कोटेशन आता खालील टेबलमध्ये आणि 'Material and Service Pricing' मधील ड्रॉपडाऊनमध्ये उपलब्ध आहे.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedQuoId(createdToastMessage.id);
                  setSearchParams({ tab: 'pricing' });
                }}
                className="px-3.5 py-1.5 bg-[#002046] hover:bg-[#002e66] text-white font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
              >
                किंमत ठरवा (Go to Pricing) →
              </button>
              <button
                onClick={() => setCreatedToastMessage(null)}
                className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Quotation Number (QT-001), Customer, Project Name..."
            value={manageSearch}
            onChange={(e) => setManageSearch(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 font-medium"
          />
        </div>

        {/* Quotations Master Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Quotation No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer Details</th>
                  <th className="px-4 py-3">Project & Location</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      कोणतेही Quotation सापडले नाही. नवीन तयार करण्यासाठी वर "+ Create Quotation" वर क्लिक करा.
                    </td>
                  </tr>
                ) : (
                  filtered.map((quo) => {
                    const qId = quo.id || quo.quotationNo;
                    const qNo = quo.quotationNo || quo.id;
                    const qDate = quo.quotationDate || quo.createdDate;
                    const cName = quo.customerName || quo.clientName || 'Customer';
                    const cPhone = quo.mobileNumber || quo.clientPhone || '—';
                    const pName = quo.projectName || quo.projectTitle || 'Construction Work';
                    const pLoc = quo.projectLocation || quo.siteLocation || 'Kolhapur';
                    const vDate = quo.validUntil || quo.validTill;
                    const tAmt = quo.totalAmount !== undefined ? quo.totalAmount : (quo.totalQuotationValue || 0);

                    return (
                      <tr key={qId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-[#002046] block text-sm">
                            {qNo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {formatDate(qDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-900 block">{cName}</span>
                          <span className="text-[11px] text-slate-400 block">{cPhone}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-900 block max-w-xs truncate">{pName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {pLoc}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {formatDate(vDate)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(tAmt)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={quo.status} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Direct button to Pricing */}
                            <button
                              onClick={() => {
                                setSelectedQuoId(qId);
                                setSearchParams({ tab: 'pricing' });
                              }}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer"
                              title="Material & Service Pricing उघडा"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Pricing</span>
                            </button>

                            {/* Direct button to PDF */}
                            <button
                              onClick={() => {
                                setSelectedQuoId(qId);
                                setSearchParams({ tab: 'pdf' });
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#002046] rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer"
                              title="PDF प्रिव्ह्यू व डाउनलोड"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>

                            {/* View Modal */}
                            <button
                              onClick={() => setViewingQuo(quo)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="View Quotation"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Modal */}
                            <button
                              onClick={() => handleOpenEditModal(quo)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-[#002046] hover:text-[#002e66] transition-colors cursor-pointer"
                              title="Edit Quotation"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicateQuotation(quo)}
                              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                              title="Duplicate Quotation"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQuotation(quo.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * RENDER SUBMODULE 2: ii. Material and Service Pricing
   * ============================================================= */
  const renderPricing = () => (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500">Submodule ii</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            Material and Service Pricing (किंमत व्यवस्थापन)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Material आणि Services ची किंमत ठरवणे. Quantity किंवा Rate बदलल्यास Amount आपोआप Calculate होतो.
          </p>
        </div>

        {/* Quotation Selector Dropdown - Dynamically includes all created quotations */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Quotation:</span>
          <select
            value={selectedQuoId || activeQuotation?.id}
            onChange={(e) => setSelectedQuoId(e.target.value)}
            className="px-3.5 py-2 bg-white border-2 border-[#002046] rounded-xl text-xs font-bold text-[#002046] focus:outline-none shadow-xs"
          >
            {(quotations || []).map(q => {
              const qId = q.id || q.quotationNo;
              const qNum = q.quotationNo || q.id;
              const qName = q.customerName || q.clientName || 'Customer';
              const qAmt = q.totalAmount !== undefined ? q.totalAmount : (q.totalQuotationValue || 0);
              return (
                <option key={qId} value={qId}>
                  {qNum} – {qName} ({formatCurrency(qAmt)})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Selected Quotation Brief Header */}
      {activeQuotation && (
        <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[#002046] text-sm">
              {activeQuotation.quotationNo} – {activeQuotation.projectName || activeQuotation.projectTitle}
            </span>
            <div className="text-slate-600 mt-0.5">
              Customer: <strong>{activeQuotation.customerName || activeQuotation.clientName}</strong> ({activeQuotation.mobileNumber || activeQuotation.clientPhone}) | Location: {activeQuotation.projectLocation || activeQuotation.siteLocation}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block uppercase">Current Grand Total</span>
            <span className="text-lg font-extrabold text-[#002046] font-mono">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Material & Service Items Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#002046]" />
            <span>Material & Service Pricing Table</span>
          </h4>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddPricingItem('Material')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Add Material</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddPricingItem('Service')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Add Service</span>
            </button>
          </div>
        </div>

        {/* Pricing Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center">#</th>
                <th className="px-3 py-2.5 w-24">Type</th>
                <th className="px-3 py-2.5">Material / Service Name</th>
                <th className="px-3 py-2.5 w-24 text-right">Qty</th>
                <th className="px-3 py-2.5 w-28">Unit</th>
                <th className="px-3 py-2.5 w-28 text-right">Rate (₹)</th>
                <th className="px-3 py-2.5 w-32 text-right">Amount (₹)</th>
                <th className="px-3 py-2.5 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pricingItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 text-center font-mono text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.type === 'Service' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdatePricingItem(item.id, 'name', e.target.value)}
                      placeholder="e.g. Cement / Steel / Labour"
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handleUpdatePricingItem(item.id, 'qty', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.unit}
                      onChange={(e) => handleUpdatePricingItem(item.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
                    >
                      <option value="Bags">Bags</option>
                      <option value="Kg">Kg</option>
                      <option value="Brass">Brass</option>
                      <option value="Days">Days</option>
                      <option value="Sq.ft">Sq.ft</option>
                      <option value="Cu.M">Cu.M</option>
                      <option value="MT">MT</option>
                      <option value="Nos">Nos</option>
                      <option value="Lump Sum">Lump Sum</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate}
                      onChange={(e) => handleUpdatePricingItem(item.id, 'rate', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#002046]"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemovePricingItem(item.id)}
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Calculation Breakdown (Matches User Example: Subtotal, Discount, Taxable, GST 18%, Grand Total) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#002046]" />
              <span>Discount & GST Settings</span>
            </h5>
            <div>
              <label className="block text-slate-500 mb-1">Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discountAmt}
                onChange={(e) => setDiscountAmt(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">GST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Computed Summary Card */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#002046]/20 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount:</span>
              <span className="font-mono font-bold text-rose-600">-{formatCurrency(discountAmt)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
              <span>Taxable Amount:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST ({gstPercent}%):</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Grand Total:</span>
              <span className="font-mono font-extrabold text-[#002046] text-xl">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSavePricingToQuotation}
            className="px-5 py-2.5 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Pricing to Quotation</span>
          </button>
        </div>
      </div>
    </div>
  );

  /* =============================================================
   * RENDER SUBMODULE 3: iii. Quotation PDF Generation
   * ============================================================= */
  const renderPDFGeneration = () => {
    if (!activeQuotation) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          कोणतेही कोटेशन निवडलेले नाही.
        </div>
      );
    }

    const currentItems = activeQuotation.items || pricingItems;
    const currentSubtotal = activeQuotation.subtotal !== undefined ? activeQuotation.subtotal : subtotal;
    const currentDiscount = activeQuotation.discount !== undefined ? activeQuotation.discount : discountAmt;
    const currentTaxable = activeQuotation.taxableAmount !== undefined ? activeQuotation.taxableAmount : taxableAmount;
    const currentGst = activeQuotation.gstAmount !== undefined ? activeQuotation.gstAmount : gstAmount;
    const currentTotal = activeQuotation.totalAmount !== undefined ? activeQuotation.totalAmount : grandTotal;

    return (
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500">Submodule iii</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Quotation PDF Generation (PDF निर्मिती व डाउनलोड)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              तयार केलेले Quotation PDF मध्ये Preview व Download करा आणि ग्राहकाला Share करा.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dropdown in PDF - Dynamically includes all created quotations */}
            <select
              value={selectedQuoId || activeQuotation?.id}
              onChange={(e) => setSelectedQuoId(e.target.value)}
              className="px-3.5 py-2 bg-white border-2 border-[#002046] rounded-xl text-xs font-bold text-[#002046] focus:outline-none shadow-xs"
            >
              {(quotations || []).map(q => {
                const qId = q.id || q.quotationNo;
                const qNum = q.quotationNo || q.id;
                const qName = q.customerName || q.clientName || 'Customer';
                return (
                  <option key={qId} value={qId}>
                    {qNum} – {qName}
                  </option>
                );
              })}
            </select>

            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {shareToast && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* Printable Professional PDF Document Preview */}
        <div id="printable-quotation" className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-slate-200 shadow-md max-w-4xl mx-auto text-slate-800 space-y-6">
          
          {/* 1. Company Details Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b-2 border-[#002046]">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#002046] text-white font-bold flex items-center justify-center text-lg">
                  SC
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#002046] tracking-wide font-heading">
                    {COMPANY_DETAILS.name}
                  </h1>
                  <p className="text-[11px] text-slate-500 font-semibold">{COMPANY_DETAILS.tagline}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p>{COMPANY_DETAILS.address}</p>
                <p><strong>GST Number:</strong> {COMPANY_DETAILS.gstin}</p>
                <p><strong>Mobile:</strong> {COMPANY_DETAILS.phone} | <strong>Email:</strong> {COMPANY_DETAILS.email}</p>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <span className="px-3 py-1 bg-[#002046] text-white text-xs font-bold uppercase rounded-lg tracking-wider">
                COMMERCIAL ESTIMATED QUOTATION
              </span>
            </div>
          </div>

          {/* 2 & 3. Customer & Quotation Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-xl border border-slate-200 text-xs">
            {/* Customer Details */}
            <div className="space-y-1">
              <span className="font-bold text-[#002046] uppercase text-[10px] tracking-wider block">Customer Details (ग्राहक माहिती)</span>
              <p className="text-sm font-bold text-slate-900">{activeQuotation.customerName || activeQuotation.clientName}</p>
              <p className="text-slate-600">{activeQuotation.customerAddress || 'Kolhapur, Maharashtra'}</p>
              <p className="text-slate-600"><strong>Mobile:</strong> {activeQuotation.mobileNumber || activeQuotation.clientPhone || '+91 98220 12345'}</p>
              <p className="text-slate-600"><strong>Email:</strong> {activeQuotation.email || 'customer@gmail.com'}</p>
            </div>

            {/* Quotation Details */}
            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-[#002046] uppercase text-[10px] tracking-wider block">Quotation Details</span>
              <p className="text-sm font-mono font-extrabold text-[#002046]">{activeQuotation.quotationNo}</p>
              <p className="text-slate-600"><strong>Date:</strong> {formatDate(activeQuotation.quotationDate || activeQuotation.createdDate)}</p>
              <p className="text-slate-600"><strong>Valid Until:</strong> {formatDate(activeQuotation.validUntil || activeQuotation.validTill)}</p>
              <p className="text-slate-600"><strong>Project:</strong> {activeQuotation.projectName || activeQuotation.projectTitle}</p>
              <p className="text-slate-600"><strong>Location:</strong> {activeQuotation.projectLocation || activeQuotation.siteLocation}</p>
            </div>
          </div>

          {/* 4. Material & Service Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Material & Service Scope of Work (कामाचा तपशील)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#002046] text-white font-semibold text-[11px]">
                  <tr>
                    <th className="px-3 py-2 w-8 text-center">#</th>
                    <th className="px-3 py-2">Material / Service Item</th>
                    <th className="px-3 py-2 w-20 text-center">Type</th>
                    <th className="px-3 py-2 w-24 text-right">Qty & Unit</th>
                    <th className="px-3 py-2 w-28 text-right">Rate (₹)</th>
                    <th className="px-3 py-2 w-32 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase">{item.type}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{item.qty} {item.unit}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{formatCurrency(item.rate)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Final Calculation Summary & Amount in Words */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-3">
            <div className="space-y-2 text-xs text-slate-600 max-w-sm">
              <span className="font-bold text-[#002046] uppercase text-[10px] tracking-wider block">Amount in Words:</span>
              <p className="font-semibold text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{numberToWordsIndian(currentTotal)}"
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(currentSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Less Discount:</span>
                <span className="font-mono font-bold text-rose-600">-{formatCurrency(currentDiscount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Taxable Amount:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(currentTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({activeQuotation.gstRate || 18}%):</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(currentGst)}</span>
              </div>
              <div className="pt-2 border-t-2 border-[#002046] flex justify-between items-baseline">
                <span className="font-bold text-[#002046] text-sm">Grand Total:</span>
                <span className="font-mono font-black text-[#002046] text-lg">
                  {formatCurrency(currentTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Other Details, Signatures & Stamp */}
          <div className="pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Payment Terms:</span>
                <p>{activeQuotation.paymentTerms || '15% Advance, 75% RA Bills, 10% on completion.'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Work Completion Terms:</span>
                <p>{activeQuotation.workCompletionTerms || 'Work completion within agreed project timeline.'}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Terms & Conditions:</span>
              <p>{activeQuotation.termsAndConditions || '1. Quotation valid till valid date. 2. Site water and electric power provided by client.'}</p>
            </div>

            {/* Signature & Stamp Boxes */}
            <div className="pt-8 flex justify-between items-end">
              <div className="w-40 border-t border-slate-400 text-center pt-1 text-[11px] font-bold text-slate-600">
                Customer Signature
              </div>

              <div className="w-48 text-center space-y-1">
                <div className="w-24 h-24 mx-auto border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                  Company Stamp
                </div>
                <div className="border-t border-slate-400 text-center pt-1 text-[11px] font-bold text-[#002046]">
                  Authorized Signatory<br />Sanmati Constructions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * RENDER SUBMODULE 4: iv. Quotation Status Tracking
   * ============================================================= */
  const renderStatusTracking = () => {
    const list = quotations || [];
    
    // Status counts and lists
    const draftList = list.filter(q => q.status === 'Draft');
    const sentList = list.filter(q => q.status === 'Sent');
    const pendingList = list.filter(q => q.status === 'Pending' || q.status === 'Submitted');
    const approvedList = list.filter(q => q.status === 'Approved');
    const rejectedList = list.filter(q => q.status === 'Rejected');
    const expiredList = list.filter(q => q.status === 'Expired');

    const filtered = statusFilter === 'ALL' 
      ? list 
      : list.filter(q => q.status === statusFilter);

    return (
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500">Submodule iv</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">
            Quotation Status Tracking (स्थिती ट्रॅकिंग)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ग्राहकाला दिलेल्या Quotation ची स्थिती Track करणे - Draft, Sent, Pending, Approved, Rejected, Expired.
          </p>
        </div>

        {/* 6 Status Cards with Marathi Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Draft */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Draft' ? 'ALL' : 'Draft')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Draft' ? 'border-slate-800 ring-2 ring-slate-800' : 'border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">Draft</span>
              <span className="font-mono font-bold text-slate-900 text-lg">{draftList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Quotation तयार झाले आहे, पण अजून ग्राहकाला पाठवलेले नाही.
            </p>
          </div>

          {/* 2. Sent */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Sent' ? 'ALL' : 'Sent')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Sent' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">Sent</span>
              <span className="font-mono font-bold text-blue-700 text-lg">{sentList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Quotation ग्राहकाला पाठवले आहे.
            </p>
          </div>

          {/* 3. Pending */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'ALL' : 'Pending')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Pending' ? 'border-amber-600 ring-2 ring-amber-600' : 'border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">Pending</span>
              <span className="font-mono font-bold text-amber-700 text-lg">{pendingList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              ग्राहकाच्या उत्तराची किंवा निर्णयाची प्रतीक्षा आहे.
            </p>
          </div>

          {/* 4. Approved */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'ALL' : 'Approved')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Approved' ? 'border-emerald-600 ring-2 ring-emerald-600' : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">Approved</span>
              <span className="font-mono font-bold text-emerald-700 text-lg">{approvedList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              ग्राहकाने Quotation स्वीकारले आहे.
            </p>
          </div>

          {/* 5. Rejected */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Rejected' ? 'ALL' : 'Rejected')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Rejected' ? 'border-rose-600 ring-2 ring-rose-600' : 'border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">Rejected</span>
              <span className="font-mono font-bold text-rose-700 text-lg">{rejectedList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              ग्राहकाने Quotation नाकारले आहे.
            </p>
          </div>

          {/* 6. Expired */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'Expired' ? 'ALL' : 'Expired')}
            className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'Expired' ? 'border-purple-600 ring-2 ring-purple-600' : 'border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700">Expired</span>
              <span className="font-mono font-bold text-purple-700 text-lg">{expiredList.length}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Quotation ची Validity Date संपली आहे.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Draft', 'Sent', 'Pending', 'Approved', 'Rejected', 'Expired'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-[#002046] text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Showing {filtered.length} Quotations
          </span>
        </div>

        {/* Status Tracking Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Quotation No</th>
                  <th className="px-4 py-3">Customer & Project</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="px-4 py-3 text-center">Current Status</th>
                  <th className="px-4 py-3 text-center">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(quo => {
                  const qId = quo.id || quo.quotationNo;
                  const qNo = quo.quotationNo || quo.id;
                  const qDate = quo.quotationDate || quo.createdDate;
                  const cName = quo.customerName || quo.clientName || 'Customer';
                  const pName = quo.projectName || quo.projectTitle || 'Construction';
                  const vDate = quo.validUntil || quo.validTill;
                  const tAmt = quo.totalAmount !== undefined ? quo.totalAmount : (quo.totalQuotationValue || 0);

                  return (
                    <tr key={qId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#002046]">
                        {qNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">{cName}</span>
                        <span className="text-[11px] text-slate-500">{pName}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {formatDate(qDate)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {formatDate(vDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(tAmt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={quo.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <select
                          value={quo.status}
                          onChange={(e) => handleUpdateStatus(qId, e.target.value)}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#002046] focus:outline-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =============================================================
   * ROOT RETURN
   * ============================================================= */
  return (
    <div className="space-y-6">
      {/* Render Current Active Submodule */}
      {activeTab === 'manage' && renderManageQuotations()}
      {activeTab === 'pricing' && renderPricing()}
      {activeTab === 'pdf' && renderPDFGeneration()}
      {activeTab === 'status' && renderStatusTracking()}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingQuo ? `Edit Quotation: ${editingQuo.quotationNo || editingQuo.id}` : 'Create New Quotation (नवीन कोटेशन तयार करा)'}
        subtitle="ग्राहकाला द्यावयाचे Quotation तयार करा."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveQuotationForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Quotation Number *</label>
              <input
                type="text"
                required
                value={formData.quotationNo}
                onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Quotation Date *</label>
              <input
                type="date"
                required
                value={formData.quotationDate}
                onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Customer Name (ग्राहकाचे नाव) *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="उदा. Shri. Rameshwar Patil"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Mobile Number (ग्राहकाचा Mobile) *</label>
              <input
                type="text"
                required
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="+91 98220 12345"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Email (ग्राहकाचा Email)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@gmail.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Valid Until (शेवटची वैध तारीख) *</label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Name (कामाचे नाव) *</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="उदा. Building Construction Work"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Project Location (कामाचे ठिकाण) *</label>
              <input
                type="text"
                required
                value={formData.projectLocation}
                onChange={(e) => setFormData({ ...formData, projectLocation: e.target.value })}
                placeholder="उदा. Kawala Naka, Kolhapur"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Description (कामाची माहिती)</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="कोणते काम करायचे आहे ते येथे लिहा..."
              className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Initial / Estimated Total Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#002e66] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {editingQuo ? 'Update Quotation' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW MODAL */}
      {viewingQuo && (
        <Modal
          isOpen={Boolean(viewingQuo)}
          onClose={() => setViewingQuo(null)}
          title={`Quotation: ${viewingQuo.quotationNo || viewingQuo.id}`}
          subtitle={`Customer: ${viewingQuo.customerName || viewingQuo.clientName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Details</span>
                <p className="font-bold text-sm text-slate-900">{viewingQuo.customerName || viewingQuo.clientName}</p>
                <p className="text-slate-600">{viewingQuo.mobileNumber || viewingQuo.clientPhone} | {viewingQuo.email}</p>
                <p className="text-slate-600">{viewingQuo.customerAddress}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Quotation Details</span>
                <p className="font-mono font-bold text-sm text-[#002046]">{viewingQuo.quotationNo || viewingQuo.id}</p>
                <p className="text-slate-600">Date: {formatDate(viewingQuo.quotationDate || viewingQuo.createdDate)}</p>
                <p className="text-slate-600">Valid Till: {formatDate(viewingQuo.validUntil || viewingQuo.validTill)}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Project & Work Scope</span>
              <p className="font-bold text-slate-900">{viewingQuo.projectName || viewingQuo.projectTitle}</p>
              <p className="text-slate-600 mt-1">{viewingQuo.description}</p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                <div className="mt-1">
                  <StatusBadge status={viewingQuo.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Amount</span>
                <span className="text-xl font-black text-[#002046] font-mono">
                  {formatCurrency(viewingQuo.totalAmount !== undefined ? viewingQuo.totalAmount : (viewingQuo.totalQuotationValue || 0))}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingQuo(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
