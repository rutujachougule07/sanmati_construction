// MODULE 3: VENDOR MANAGEMENT
import React, { useState } from 'react';
import { Plus, Truck, Star, Phone, Mail, MapPin, CheckCircle, FileText, DollarSign } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export const VendorsModule = () => {
  const { vendors, setVendors } = useERPData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Material Suppliers',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    materialCategories: ''
  });

  const handleRegisterVendor = (e) => {
    e.preventDefault();
    const newVendor = {
      id: `VND-00${vendors.length + 1}`,
      totalPurchase: 0,
      paidAmount: 0,
      outstandingBalance: 0,
      rating: 4.8,
      materialCategories: formData.materialCategories.split(',').map(s => s.trim()),
      ...formData
    };
    setVendors([newVendor, ...vendors]);
    setIsModalOpen(false);
    setFormData({ name: '', category: 'Material Suppliers', contactPerson: '', email: '', phone: '', address: '', gstin: '', materialCategories: '' });
  };

  const columns = [
    { key: 'id', header: 'Vendor ID', render: (row) => <span className="font-bold text-gold-600">{row.id}</span> },
    {
      key: 'name',
      header: 'Vendor Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      )
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.contactPerson}</p>
          <p className="text-[11px] text-slate-500">{row.phone}</p>
        </div>
      )
    },
    { key: 'gstin', header: 'GSTIN', render: (row) => <span className="font-mono text-[11px] text-slate-600 font-semibold">{row.gstin}</span> },
    { key: 'totalPurchase', header: 'Total Orders', align: 'right', render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(row.totalPurchase)}</span> },
    { key: 'outstandingBalance', header: 'Payable Due', align: 'right', render: (row) => <span className="font-semibold text-rose-600 font-mono">{formatCurrency(row.outstandingBalance)}</span> },
    {
      key: 'rating',
      header: 'Rating',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gold-600 font-bold text-xs">
          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
          {row.rating}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedVendor(row)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-gold-400 hover:text-black text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition-colors shadow-sm"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-heading">Vendor & Subcontractor Directory</h2>
          <p className="text-xs text-slate-500">Material suppliers, plant equipment rentals, and specialized subcontractors in Kolhapur.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="erp-btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vendor</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        searchKey="name"
        searchPlaceholder="Search vendors by name, GSTIN, material category..."
        exportFileName="Sanmati_Vendors_List"
      />

      {/* Vendor Profile Modal */}
      {selectedVendor && (
        <Modal
          isOpen={Boolean(selectedVendor)}
          onClose={() => setSelectedVendor(null)}
          title={`Vendor Details: ${selectedVendor.name}`}
          subtitle={`Vendor Code: ${selectedVendor.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Category:</span>
                <span className="text-gold-700 font-semibold">{selectedVendor.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">GSTIN Number:</span>
                <span className="text-slate-900 font-mono font-semibold">{selectedVendor.gstin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contact Person:</span>
                <span className="text-slate-900 font-semibold">{selectedVendor.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Phone:</span>
                <span className="text-slate-800 font-medium">{selectedVendor.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">Registered Address:</span>
                <span className="text-slate-800">{selectedVendor.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[11px] block">Total Invoiced:</span>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(selectedVendor.totalPurchase)}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[11px] block">Paid to Date:</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(selectedVendor.paidAmount)}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 text-[11px] block">Payable Balance:</span>
                <span className="text-sm font-bold text-rose-600">{formatCurrency(selectedVendor.outstandingBalance)}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-2">Supplied Materials & Services</h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedVendor.materialCategories?.map((item, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Vendor / Subcontractor"
        subtitle="Onboard a material vendor or specialized contractor"
      >
        <form onSubmit={handleRegisterVendor} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Company / Vendor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rajaram Steel & Tubes Kolhapur"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="erp-input"
              >
                <option value="Material Suppliers">Material Suppliers</option>
                <option value="Subcontractors">Subcontractors (Labour / Earthwork)</option>
                <option value="Equipment & Machinery Rental">Equipment & Machinery Rental</option>
                <option value="Consultants & Testing Labs">Consultants & Testing Labs</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 94220 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="27ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="erp-input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Supply Categories (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. TMT Steel, Binding Wire, Cement 53 Grade"
              value={formData.materialCategories}
              onChange={(e) => setFormData({ ...formData, materialCategories: e.target.value })}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Yard / Depot Address</label>
            <textarea
              rows={2}
              placeholder="Address in Kolhapur"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="erp-input"
            />
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
              Save Vendor Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
