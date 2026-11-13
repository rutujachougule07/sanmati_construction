// MODULE 13: INVENTORY MANAGEMENT
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { formatCurrency } from '../../utils/formatters';
import { MaterialStockTab } from './components/MaterialStockTab';
import { StockRecordsTab } from './components/StockRecordsTab';
import { MaterialIssueTab } from './components/MaterialIssueTab';
import { LowStockAlertsTab } from './components/LowStockAlertsTab';
import { MaterialIssueVoucherModal } from './components/MaterialIssueVoucherModal';

const MATERIAL_CATEGORIES = [
  'Cement & Concrete',
  'Reinforcement Steel',
  'Aggregates & Sand',
  'Bricks & Masonry',
  'Plumbing & Sanitary',
  'Electrical',
  'Finishing & Paint',
  'Hardware & Tools',
  'Fuel & Consumables',
  'Other'
];

const MATERIAL_UNITS = ['Bag', 'Kg', 'Ton', 'Brass', 'Piece', 'Liter'];

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

export const InventoryModule = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const {
    inventory,
    stockMovements,
    projects,
    vendors,
    approvals,
    addMaterialItem,
    updateMaterialItem,
    deleteMaterialItem,
    receiveStockInward,
    issueStockToSite,
    deleteStockMovement,
    createLowStockPurchaseRequest
  } = useERPData();

  const tabParam = searchParams.get('tab');
  const activeTab = ['stock', 'records', 'issue', 'alerts'].includes(tabParam) ? tabParam : 'stock';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Modal states
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [prTargetMaterial, setPrTargetMaterial] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [formError, setFormError] = useState('');

  // Form: Add / Edit Material
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'Cement & Concrete',
    unit: 'Bag',
    openingStock: '',
    currentStock: '',
    minimumThreshold: '',
    unitPrice: '',
    supplierId: '',
    supplierName: '',
    supplierPhone: '',
    location: 'Central Warehouse'
  });

  // Form: Stock-In (Material Received)
  const [stockInForm, setStockInForm] = useState({
    materialId: '',
    supplierId: '',
    supplierName: '',
    quantity: '',
    purchaseRate: '',
    invoiceNo: '',
    receivedDate: TODAY_ISO(),
    grnDetails: ''
  });

  // Form: Stock-Out / Issue to Project
  const [stockOutForm, setStockOutForm] = useState({
    materialId: '',
    quantity: '',
    projectId: '',
    customProjectName: '',
    issueDate: TODAY_ISO(),
    issuedBy: currentUser?.name || 'Storekeeper',
    issuedTo: '',
    reason: ''
  });

  // Form: Purchase Request from Low Stock Alert
  const [prForm, setPrForm] = useState({
    requestedQty: '',
    supplierName: '',
    expectedRate: '',
    notes: ''
  });

  useEffect(() => {
    setFormError('');
  }, [isMaterialModalOpen, isStockInModalOpen, isStockOutModalOpen, prTargetMaterial]);

  // Dashboard / Header KPIs
  const metrics = useMemo(() => {
    const totalMaterials = inventory.length;
    const totalValuation = inventory.reduce(
      (sum, item) => sum + ((Number(item.currentStock) || 0) * (Number(item.unitPrice) || 0)),
      0
    );
    const lowStockCount = inventory.filter(
      item => (Number(item.currentStock) || 0) <= (Number(item.minimumThreshold) || 0)
    ).length;
    const inCount = (stockMovements || []).filter(m => m.type === 'STOCK_IN').length;
    const outCount = (stockMovements || []).filter(m => m.type === 'STOCK_OUT').length;
    return { totalMaterials, totalValuation, lowStockCount, inCount, outCount };
  }, [inventory, stockMovements]);

  // Helpers to open modals cleanly
  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({
      name: '',
      category: 'Cement & Concrete',
      unit: 'Bag',
      openingStock: '',
      currentStock: '',
      minimumThreshold: '',
      unitPrice: '',
      supplierId: vendors[0]?.id || '',
      supplierName: vendors[0]?.name || '',
      supplierPhone: vendors[0]?.phone || '',
      location: 'Central Warehouse'
    });
    setIsMaterialModalOpen(true);
  };

  const openEditMaterial = (mat) => {
    setEditingMaterial(mat);
    setMaterialForm({
      name: mat.name || '',
      category: mat.category || 'Cement & Concrete',
      unit: mat.unit || 'Bag',
      openingStock: String(mat.openingStock ?? mat.currentStock ?? 0),
      currentStock: String(mat.currentStock ?? mat.openingStock ?? 0),
      minimumThreshold: String(mat.minimumThreshold ?? 0),
      unitPrice: String(mat.unitPrice ?? 0),
      supplierId: mat.supplierId || '',
      supplierName: mat.supplierName || '',
      supplierPhone: mat.supplierPhone || '',
      location: mat.location || 'Central Warehouse'
    });
    setIsMaterialModalOpen(true);
  };

  const openStockInModal = (preselectedMatId = '') => {
    const matId = preselectedMatId || inventory[0]?.id || '';
    const mat = inventory.find(m => m.id === matId);
    setStockInForm({
      materialId: matId,
      supplierId: mat?.supplierId || vendors[0]?.id || '',
      supplierName: mat?.supplierName || vendors[0]?.name || '',
      quantity: '',
      purchaseRate: mat ? String(mat.unitPrice || '') : '',
      invoiceNo: '',
      receivedDate: TODAY_ISO(),
      grnDetails: ''
    });
    setIsStockInModalOpen(true);
  };

  const openStockOutModal = (preselectedMatId = '') => {
    const availableFirst = inventory.find(m => (Number(m.currentStock) || 0) > 0)?.id || inventory[0]?.id || '';
    const matId = preselectedMatId || availableFirst;
    setStockOutForm({
      materialId: matId,
      quantity: '',
      projectId: projects[0]?.id || '__CUSTOM__',
      customProjectName: '',
      issueDate: TODAY_ISO(),
      issuedBy: currentUser?.name || 'Storekeeper',
      issuedTo: '',
      reason: ''
    });
    setIsStockOutModalOpen(true);
  };

  const openPurchaseRequestModal = (mat) => {
    const curr = Number(mat.currentStock) || 0;
    const min = Number(mat.minimumThreshold) || 0;
    const suggested = Math.max(1, Math.ceil((min * 2) - curr));
    setPrTargetMaterial(mat);
    setPrForm({
      requestedQty: String(suggested),
      supplierName: mat.supplierName || '',
      expectedRate: String(mat.unitPrice || ''),
      notes: `Low-stock replenishment for ${mat.name} (Available: ${curr} ${mat.unit}, Min Level: ${min} ${mat.unit}).`
    });
  };

  // Form Submits
  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    if (!materialForm.name.trim()) {
      setFormError('Material Name is required.');
      return;
    }

    if (editingMaterial) {
      updateMaterialItem(editingMaterial.id, {
        name: materialForm.name.trim(),
        category: materialForm.category,
        unit: materialForm.unit,
        currentStock: Number(materialForm.currentStock) >= 0 ? Number(materialForm.currentStock) : (editingMaterial.currentStock || 0),
        minimumThreshold: Number(materialForm.minimumThreshold) || 0,
        unitPrice: Number(materialForm.unitPrice) || 0,
        supplierId: materialForm.supplierId,
        supplierName: materialForm.supplierName.trim(),
        supplierPhone: materialForm.supplierPhone.trim(),
        location: materialForm.location.trim() || 'Central Warehouse'
      });
    } else {
      addMaterialItem({
        name: materialForm.name.trim(),
        category: materialForm.category,
        unit: materialForm.unit,
        openingStock: Number(materialForm.openingStock) || 0,
        minimumThreshold: Number(materialForm.minimumThreshold) || 0,
        unitPrice: Number(materialForm.unitPrice) || 0,
        supplierId: materialForm.supplierId,
        supplierName: materialForm.supplierName.trim(),
        supplierPhone: materialForm.supplierPhone.trim(),
        location: materialForm.location.trim() || 'Central Warehouse'
      });
    }
    setIsMaterialModalOpen(false);
  };

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    const res = receiveStockInward({
      materialId: stockInForm.materialId,
      supplierId: stockInForm.supplierId === '__CUSTOM__' ? '' : stockInForm.supplierId,
      supplierName: stockInForm.supplierName,
      quantity: Number(stockInForm.quantity),
      purchaseRate: Number(stockInForm.purchaseRate),
      invoiceNo: stockInForm.invoiceNo,
      receivedDate: stockInForm.receivedDate,
      grnDetails: stockInForm.grnDetails
    });
    if (res?.error) {
      setFormError(res.error);
      return;
    }
    setIsStockInModalOpen(false);
  };

  const handleStockOutSubmit = (e) => {
    e.preventDefault();
    const resolvedProjectId =
      stockOutForm.projectId === '__CUSTOM__'
        ? (stockOutForm.customProjectName.trim() || 'General Dispatch')
        : stockOutForm.projectId;

    const res = issueStockToSite({
      materialId: stockOutForm.materialId,
      projectId: resolvedProjectId,
      quantity: Number(stockOutForm.quantity),
      issueDate: stockOutForm.issueDate,
      issuedBy: stockOutForm.issuedBy,
      issuedTo: stockOutForm.issuedTo,
      reason: stockOutForm.reason
    });
    if (res?.error) {
      setFormError(res.error);
      return;
    }
    setIsStockOutModalOpen(false);
  };

  const handlePRSubmit = (e) => {
    e.preventDefault();
    if (!prTargetMaterial) return;
    createLowStockPurchaseRequest({
      materialId: prTargetMaterial.id,
      requestedQty: Number(prForm.requestedQty),
      supplierName: prForm.supplierName,
      expectedRate: Number(prForm.expectedRate),
      notes: prForm.notes,
      requestedBy: currentUser?.name || 'Central Storekeeper'
    });
    setPrTargetMaterial(null);
  };

  // Selected material live previews for Stock-In & Stock-Out
  const selectedInMat = inventory.find(m => m.id === stockInForm.materialId);
  const selectedOutMat = inventory.find(m => m.id === stockOutForm.materialId);
  const previewInBalance = selectedInMat
    ? Number(((Number(selectedInMat.currentStock) || 0) + (Number(stockInForm.quantity) || 0)).toFixed(3))
    : 0;
  const previewOutBalance = selectedOutMat
    ? Number(((Number(selectedOutMat.currentStock) || 0) - (Number(stockOutForm.quantity) || 0)).toFixed(3))
    : 0;

  const subsectionTitles = {
    stock: 'i. Material Stock Management',
    records: 'ii. Stock-In & Stock-Out Records',
    issue: 'iii. Material Issue Tracking',
    alerts: 'iv. Low-Stock Alerts'
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#002046] uppercase tracking-wider mb-1">
            <Boxes className="w-3.5 h-3.5" />
            <span>13. Inventory Management • {subsectionTitles[activeTab]}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Inventory & Material Store Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track warehouse material stock, Stock-In / Stock-Out registers, project issue vouchers, and minimum stock alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openAddMaterial}
            className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Materials</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalMaterials}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active SKUs in store</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#002046]/10 text-[#002046] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Valuation</p>
            <p className="text-2xl font-extrabold text-[#002046] font-mono mt-1">
              {formatCurrency(metrics.totalValuation)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Available inventory value</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Movements</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {metrics.inCount + metrics.outCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {metrics.inCount} Inward • {metrics.outCount} Outward
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`text-left rounded-2xl p-4 shadow-2xs border flex items-center justify-between cursor-pointer transition-colors ${
            metrics.lowStockCount > 0
              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/70'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${metrics.lowStockCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              Low-Stock Alerts
            </p>
            <p className={`text-2xl font-extrabold mt-1 ${metrics.lowStockCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {metrics.lowStockCount}
            </p>
            <p className={`text-[11px] mt-0.5 ${metrics.lowStockCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
              {metrics.lowStockCount > 0 ? 'Action needed • View alerts' : 'All items above min level'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            metrics.lowStockCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Active Subsection Content */}
      {activeTab === 'stock' && (
        <MaterialStockTab
          inventory={inventory}
          onOpenAddMaterial={openAddMaterial}
          onOpenEditMaterial={openEditMaterial}
          onDeleteMaterial={deleteMaterialItem}
        />
      )}

      {activeTab === 'records' && (
        <StockRecordsTab
          inventory={inventory}
          stockMovements={stockMovements}
          onOpenStockIn={openStockInModal}
          onOpenStockOut={openStockOutModal}
          onViewVoucher={setSelectedVoucher}
          onDeleteMovement={deleteStockMovement}
        />
      )}

      {activeTab === 'issue' && (
        <MaterialIssueTab
          inventory={inventory}
          projects={projects}
          stockMovements={stockMovements}
          onOpenStockOut={openStockOutModal}
          onViewVoucher={setSelectedVoucher}
        />
      )}

      {activeTab === 'alerts' && (
        <LowStockAlertsTab
          inventory={inventory}
          approvals={approvals}
          onOpenPurchaseRequest={openPurchaseRequestModal}
          onOpenStockIn={openStockInModal}
        />
      )}

      {/* Modal 1: Add / Edit Material */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title={editingMaterial ? `Edit Material • ${editingMaterial.id}` : 'Add New Material'}
        subtitle={editingMaterial ? 'Update material master parameters, minimum stock level & supplier' : 'Register material with opening stock, unit rate, safety level & supplier'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleMaterialSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Material Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ultratech OPC 53 Grade Cement"
                value={materialForm.name}
                onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                className="erp-input"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Category *</label>
              <select
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="erp-input"
              >
                {MATERIAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Unit *</label>
              <select
                value={materialForm.unit}
                onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                className="erp-input"
              >
                {MATERIAL_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {!editingMaterial ? (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Opening Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 500"
                  value={materialForm.openingStock}
                  onChange={(e) => setMaterialForm({ ...materialForm, openingStock: e.target.value })}
                  className="erp-input font-mono font-bold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Available / Current Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 150"
                  value={materialForm.currentStock}
                  onChange={(e) => setMaterialForm({ ...materialForm, currentStock: e.target.value })}
                  className="erp-input font-mono font-bold text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Minimum Stock Level *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="Alert threshold e.g. 100"
                value={materialForm.minimumThreshold}
                onChange={(e) => setMaterialForm({ ...materialForm, minimumThreshold: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Material Unit Rate (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="e.g. 380"
                value={materialForm.unitPrice}
                onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Storage Location / Yard</label>
              <input
                type="text"
                placeholder="e.g. Central Warehouse"
                value={materialForm.location}
                onChange={(e) => setMaterialForm({ ...materialForm, location: e.target.value })}
                className="erp-input"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Registered Vendor</label>
              <select
                value={materialForm.supplierId}
                onChange={(e) => {
                  const vid = e.target.value;
                  const v = vendors.find(item => item.id === vid);
                  setMaterialForm({
                    ...materialForm,
                    supplierId: vid,
                    supplierName: v ? v.name : materialForm.supplierName,
                    supplierPhone: v ? (v.phone || '') : materialForm.supplierPhone
                  });
                }}
                className="erp-input"
              >
                <option value="">-- Enter Supplier Manually --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Supplier Name</label>
              <input
                type="text"
                placeholder="Supplier / Dealer name"
                value={materialForm.supplierName}
                onChange={(e) => setMaterialForm({ ...materialForm, supplierName: e.target.value })}
                className="erp-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Supplier Contact / Details</label>
              <input
                type="text"
                placeholder="Phone number or supplier notes"
                value={materialForm.supplierPhone}
                onChange={(e) => setMaterialForm({ ...materialForm, supplierPhone: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsMaterialModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#001736] text-white font-bold cursor-pointer transition-colors shadow-xs"
            >
              {editingMaterial ? 'Save Material Changes' : 'Save Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Stock-In (Material Received) */}
      <Modal
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        title="Stock-In Entry (Material Received)"
        subtitle="Adds received material quantity directly to current stock balance and logs GRN"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleStockInSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Select Material *</label>
              <select
                required
                value={stockInForm.materialId}
                onChange={(e) => {
                  const id = e.target.value;
                  const mat = inventory.find(m => m.id === id);
                  setStockInForm({
                    ...stockInForm,
                    materialId: id,
                    supplierId: mat?.supplierId || stockInForm.supplierId,
                    supplierName: mat?.supplierName || stockInForm.supplierName,
                    purchaseRate: mat ? String(mat.unitPrice || '') : stockInForm.purchaseRate
                  });
                }}
                className="erp-input font-bold"
              >
                <option value="" disabled>-- Choose Material --</option>
                {inventory.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} (Available: {mat.currentStock} {mat.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Supplier (Vendor)</label>
              <select
                value={stockInForm.supplierId}
                onChange={(e) => {
                  const vid = e.target.value;
                  const v = vendors.find(item => item.id === vid);
                  setStockInForm({
                    ...stockInForm,
                    supplierId: vid,
                    supplierName: v ? v.name : ''
                  });
                }}
                className="erp-input"
              >
                <option value="">-- Enter Supplier Manually --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Supplier Name *</label>
              <input
                type="text"
                required
                placeholder="Supplier name"
                value={stockInForm.supplierName}
                onChange={(e) => setStockInForm({ ...stockInForm, supplierName: e.target.value })}
                className="erp-input"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Received Quantity {selectedInMat ? `(${selectedInMat.unit})` : ''} *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="e.g. 100"
                value={stockInForm.quantity}
                onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Purchase Rate (₹ / unit) *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="e.g. 385"
                value={stockInForm.purchaseRate}
                onChange={(e) => setStockInForm({ ...stockInForm, purchaseRate: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Invoice Number</label>
              <input
                type="text"
                placeholder="e.g. INV-2026-104"
                value={stockInForm.invoiceNo}
                onChange={(e) => setStockInForm({ ...stockInForm, invoiceNo: e.target.value })}
                className="erp-input font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Received Date *</label>
              <input
                type="date"
                required
                value={stockInForm.receivedDate}
                onChange={(e) => setStockInForm({ ...stockInForm, receivedDate: e.target.value })}
                className="erp-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Delivery / GRN Details</label>
              <textarea
                rows={2}
                placeholder="Vehicle number, challan reference, quality inspection remarks..."
                value={stockInForm.grnDetails}
                onChange={(e) => setStockInForm({ ...stockInForm, grnDetails: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          {selectedInMat && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <span className="text-emerald-800 font-semibold">
                Stock Balance Preview: {selectedInMat.currentStock} + {Number(stockInForm.quantity) || 0} =
              </span>
              <span className="font-mono font-extrabold text-sm text-emerald-900">
                {previewInBalance.toLocaleString('en-IN')} {selectedInMat.unit}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsStockInModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-colors shadow-xs"
            >
              Confirm Stock-In
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Stock-Out & Material Issue */}
      <Modal
        isOpen={isStockOutModalOpen}
        onClose={() => setIsStockOutModalOpen(false)}
        title="Stock-Out / Material Issue to Project"
        subtitle="Deducts stock balance, creates a Material Issue Voucher, and updates project usage"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleStockOutSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Select Material *</label>
              <select
                required
                value={stockOutForm.materialId}
                onChange={(e) => setStockOutForm({ ...stockOutForm, materialId: e.target.value })}
                className="erp-input font-bold"
              >
                <option value="" disabled>-- Choose Material --</option>
                {inventory.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} (Available: {mat.currentStock} {mat.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Issue Quantity {selectedOutMat ? `(${selectedOutMat.unit})` : ''} *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="e.g. 50"
                value={stockOutForm.quantity}
                onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={stockOutForm.issueDate}
                onChange={(e) => setStockOutForm({ ...stockOutForm, issueDate: e.target.value })}
                className="erp-input"
              />
            </div>

            <div className={stockOutForm.projectId === '__CUSTOM__' ? '' : 'sm:col-span-2'}>
              <label className="block text-slate-700 font-bold mb-1">Select Project *</label>
              <select
                value={stockOutForm.projectId}
                onChange={(e) => setStockOutForm({ ...stockOutForm, projectId: e.target.value })}
                className="erp-input font-bold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="__CUSTOM__">+ Specify Site / Department Manually</option>
              </select>
            </div>

            {stockOutForm.projectId === '__CUSTOM__' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Site / Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangli Site Block A"
                  value={stockOutForm.customProjectName}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, customProjectName: e.target.value })}
                  className="erp-input"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">Issued By *</label>
              <input
                type="text"
                required
                placeholder="Storekeeper name"
                value={stockOutForm.issuedBy}
                onChange={(e) => setStockOutForm({ ...stockOutForm, issuedBy: e.target.value })}
                className="erp-input"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Issued To / Receiver *</label>
              <input
                type="text"
                required
                placeholder="Site Engineer / Supervisor"
                value={stockOutForm.issuedTo}
                onChange={(e) => setStockOutForm({ ...stockOutForm, issuedTo: e.target.value })}
                className="erp-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Reason / Work Description *</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. 2nd floor RCC slab casting and beam pouring"
                value={stockOutForm.reason}
                onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          {selectedOutMat && (
            <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
              previewOutBalance < 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : previewOutBalance <= (Number(selectedOutMat.minimumThreshold) || 0)
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <span className="font-semibold">
                Remaining Stock Preview: {selectedOutMat.currentStock} - {Number(stockOutForm.quantity) || 0} =
              </span>
              <span className="font-mono font-extrabold text-sm">
                {previewOutBalance.toLocaleString('en-IN')} {selectedOutMat.unit}
                {previewOutBalance >= 0 && previewOutBalance <= (Number(selectedOutMat.minimumThreshold) || 0) && ' (Triggers Low-Stock Alert)'}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsStockOutModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#001736] text-white font-bold cursor-pointer transition-colors shadow-xs"
            >
              Issue Material & Generate Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Create Purchase Request from Low-Stock Alert */}
      <Modal
        isOpen={Boolean(prTargetMaterial)}
        onClose={() => setPrTargetMaterial(null)}
        title="Create Purchase Request"
        subtitle={prTargetMaterial ? `${prTargetMaterial.name} (${prTargetMaterial.id})` : ''}
        maxWidth="max-w-lg"
      >
        {prTargetMaterial && (
          <form onSubmit={handlePRSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-rose-700 uppercase">Current vs Min Stock</p>
                <p className="font-extrabold text-rose-900 text-sm mt-0.5">
                  {prTargetMaterial.currentStock} / {prTargetMaterial.minimumThreshold} {prTargetMaterial.unit}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                {prTargetMaterial.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Request Qty ({prTargetMaterial.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={prForm.requestedQty}
                  onChange={(e) => setPrForm({ ...prForm, requestedQty: e.target.value })}
                  className="erp-input font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Estimated Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={prForm.expectedRate}
                  onChange={(e) => setPrForm({ ...prForm, expectedRate: e.target.value })}
                  className="erp-input font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Preferred Supplier</label>
              <input
                type="text"
                placeholder="Supplier name"
                value={prForm.supplierName}
                onChange={(e) => setPrForm({ ...prForm, supplierName: e.target.value })}
                className="erp-input"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Justification / Notes</label>
              <textarea
                rows={2}
                value={prForm.notes}
                onChange={(e) => setPrForm({ ...prForm, notes: e.target.value })}
                className="erp-input"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Estimated Purchase Value</span>
              <span className="font-mono font-extrabold text-sm text-[#002046]">
                {formatCurrency((Number(prForm.requestedQty) || 0) * (Number(prForm.expectedRate) || 0))}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPrTargetMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#002046] hover:bg-[#001736] text-white font-bold cursor-pointer transition-colors shadow-xs"
              >
                Submit Purchase Request
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Printable Material Issue Voucher Modal */}
      <MaterialIssueVoucherModal
        voucher={selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
      />
    </div>
  );
};
