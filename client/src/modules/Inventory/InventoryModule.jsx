// MODULE 13: INVENTORY MANAGEMENT
import React, { useState } from 'react';
import { Boxes, Plus, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Package, Truck, Layers, Download } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const InventoryModule = () => {
  const { inventory, projects, vendors, issueStockToSite, receiveStockInward } = useERPData();
  const [activeTab, setActiveTab] = useState('stock'); // stock, issue, inward
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);

  // Form States
  const [issueForm, setIssueForm] = useState({
    materialId: inventory[0]?.id || 'MAT-001',
    projectId: projects[0]?.id || 'PRJ-KLP-001',
    quantity: '',
    issuedTo: 'Er. Amit Deshmukh',
    remarks: 'Concrete slab casting requirement'
  });

  const [inwardForm, setInwardForm] = useState({
    materialId: inventory[0]?.id || 'MAT-001',
    quantity: '',
    vendorId: vendors[0]?.id || 'VND-001',
    unitPrice: ''
  });

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    issueStockToSite({
      materialId: issueForm.materialId,
      projectId: issueForm.projectId,
      quantity: Number(issueForm.quantity),
      issuedTo: issueForm.issuedTo,
      remarks: issueForm.remarks
    });
    setIsIssueModalOpen(false);
    setIssueForm({ ...issueForm, quantity: '' });
  };

  const handleInwardSubmit = (e) => {
    e.preventDefault();
    receiveStockInward({
      materialId: inwardForm.materialId,
      quantity: Number(inwardForm.quantity),
      vendorId: inwardForm.vendorId,
      unitPrice: Number(inwardForm.unitPrice)
    });
    setIsInwardModalOpen(false);
    setInwardForm({ ...inwardForm, quantity: '', unitPrice: '' });
  };

  const stockColumns = [
    { key: 'id', header: 'Material Code', render: (row) => <span className="font-bold text-gold-400 font-mono">{row.id}</span> },
    {
      key: 'name',
      header: 'Material Description',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      )
    },
    { key: 'unit', header: 'Unit', align: 'center', render: (row) => <span className="text-slate-300 font-bold">{row.unit}</span> },
    {
      key: 'currentStock',
      header: 'Available Stock',
      align: 'right',
      render: (row) => (
        <span className={`font-mono font-bold ${row.currentStock <= row.minimumThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
          {row.currentStock} {row.unit}
        </span>
      )
    },
    { key: 'minimumThreshold', header: 'Min Safety Level', align: 'right', render: (row) => <span className="font-mono text-slate-400">{row.minimumThreshold} {row.unit}</span> },
    { key: 'unitPrice', header: 'Unit Rate', align: 'right', render: (row) => <span className="font-mono text-slate-200">{formatCurrency(row.unitPrice)}</span> },
    {
      key: 'valuation',
      header: 'Valuation',
      align: 'right',
      render: (row) => <span className="font-mono font-bold text-gold-400">{formatCurrency(row.currentStock * row.unitPrice)}</span>
    },
    { key: 'status', header: 'Stock Health', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Inventory & Store Management</h2>
          <p className="text-xs text-slate-400">Manage cement, steel rebars, aggregates, stock inward/outward and site material issues.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="erp-btn-secondary text-xs flex items-center gap-1.5"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stock Inward (GRN)</span>
          </button>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="erp-btn-primary text-xs flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Issue to Site</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any items triggered */}
      {inventory.some(i => i.currentStock <= i.minimumThreshold) && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold">Low Stock Warning Triggered</p>
              <p className="text-amber-400/80 text-[11px]">One or more materials in Central Warehouse have breached minimum threshold levels.</p>
            </div>
          </div>
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
          >
            Order Inward Stock
          </button>
        </div>
      )}

      {/* Main Stock Table */}
      <DataTable
        columns={stockColumns}
        data={inventory}
        searchKey="name"
        searchPlaceholder="Search materials by name, category, code..."
        exportFileName="Sanmati_Inventory_Stock"
      />

      {/* Modal: Issue Material to Project Site */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Material to Construction Site"
        subtitle="Deducts central inventory balance and posts actual material expense to project"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Material *</label>
            <select
              value={issueForm.materialId}
              onChange={(e) => setIssueForm({ ...issueForm, materialId: e.target.value })}
              className="erp-input font-bold"
            >
              {inventory.map(mat => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} (Stock: {mat.currentStock} {mat.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Project Site *</label>
              <select
                value={issueForm.projectId}
                onChange={(e) => setIssueForm({ ...issueForm, projectId: e.target.value })}
                className="erp-input font-bold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity to Issue *</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                placeholder="Quantity"
                value={issueForm.quantity}
                onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Issued To (Site Engineer / Store Supervisor) *</label>
            <input
              type="text"
              required
              value={issueForm.issuedTo}
              onChange={(e) => setIssueForm({ ...issueForm, issuedTo: e.target.value })}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Purpose / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Columns reinforcement and foundation footing"
              value={issueForm.remarks}
              onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Confirm Site Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Receive Stock Inward */}
      <Modal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        title="Stock Inward Goods Receipt (GRN)"
        subtitle="Add incoming material shipment to warehouse"
      >
        <form onSubmit={handleInwardSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Material Item *</label>
            <select
              value={inwardForm.materialId}
              onChange={(e) => setInwardForm({ ...inwardForm, materialId: e.target.value })}
              className="erp-input font-bold"
            >
              {inventory.map(mat => (
                <option key={mat.id} value={mat.id}>{mat.name} ({mat.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Supplying Vendor *</label>
              <select
                value={inwardForm.vendorId}
                onChange={(e) => setInwardForm({ ...inwardForm, vendorId: e.target.value })}
                className="erp-input font-bold"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Received Quantity *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Quantity received"
                value={inwardForm.quantity}
                onChange={(e) => setInwardForm({ ...inwardForm, quantity: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsInwardModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Record Goods Inward
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
