// MODULE 3: VENDOR MANAGEMENT - Active Subcategories Implementation
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Truck, Star, Phone, Mail, MapPin, CheckCircle, FileText, 
  DollarSign, ShoppingBag, UserPlus, ArrowRight 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export const VendorsModule = () => {
  const { vendors, setVendors } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'registration';

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
    { key: 'id', header: 'Vendor ID', render: (row) => <span className="font-bold text-[#1d68e4] font-mono">{row.id}</span> },
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
    { key: 'gstin', header: 'GSTIN', render: (row) => <span className="font-mono text-[11px] text-slate-600">{row.gstin}</span> },
    { key: 'totalPurchase', header: 'Total Orders', align: 'right', render: (row) => <span className="font-semibold text-slate-900 font-mono">{formatCurrency(row.totalPurchase)}</span> },
    { key: 'outstandingBalance', header: 'Outstanding', align: 'right', render: (row) => <span className="font-semibold text-rose-600 font-mono">{formatCurrency(row.outstandingBalance)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedVendor(row)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-[#1d68e4] hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* SUBSECTION 1: VENDOR REGISTRATION & DETAILS */}
      {activeTab === 'registration' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                3. Vendor Management • Subsection (i)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Vendor Registration & Details
              </h2>
              <p className="text-xs text-slate-500">Verified raw material suppliers, cement/steel vendors, and equipment contractors.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Vendor</span>
            </button>
          </div>

          <DataTable
            columns={columns}
            data={vendors}
            searchKey="name"
            searchPlaceholder="Search vendors by supplier name or GSTIN..."
          />
        </div>
      )}

      {/* SUBSECTION 2: VENDOR CONTACT MANAGEMENT */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              3. Vendor Management • Subsection (ii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vendor Contact Management
            </h2>
            <p className="text-xs text-slate-500">Authorized representatives, plant managers, phone numbers, and office addresses in Kolhapur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1d68e4] bg-blue-50 px-2 py-0.5 rounded">
                    {v.id}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                    {v.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-1">👤 {v.contactPerson}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.email}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-[#1d68e4] flex-shrink-0 mt-0.5" />
                    <span>{v.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSECTION 3: PURCHASE HISTORY */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              3. Vendor Management • Subsection (iii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Purchase History & Material Indents
            </h2>
            <p className="text-xs text-slate-500">Cumulative raw material purchase orders, TMT steel, ready-mix concrete indents.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Total Material Purchases by Supplier</h4>
            <div className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <div key={v.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-slate-900 text-sm block">{v.name}</strong>
                    <span className="text-[11px] text-slate-500">Supply Categories: {v.materialCategories?.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Purchases</span>
                      <strong className="text-slate-900">{formatCurrency(v.totalPurchase)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Settled</span>
                      <strong className="text-emerald-600">{formatCurrency(v.paidAmount)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 4: VENDOR PAYMENT TRACKING */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              3. Vendor Management • Subsection (iv)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vendor Payment Tracking & Dues
            </h2>
            <p className="text-xs text-slate-500">Track pending bills, payments released via RTGS/NEFT, and outstanding balances.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Vendor Balance Sheet & Outstanding Status</h4>
              <span className="text-xs font-bold text-rose-600 font-mono">Total Due: ₹24,50,000</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#103a6c] text-white">
                    <th className="p-3 text-white font-bold text-[11px] uppercase">Vendor ID</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase">Vendor / Supplier</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase">Category</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase text-right">Total Order (INR)</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase text-right">Paid Amount</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase text-right">Balance Due</th>
                    <th className="p-3 text-white font-bold text-[11px] uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#1d68e4]">{v.id}</td>
                      <td className="p-3 font-bold text-slate-900">{v.name}</td>
                      <td className="p-3 text-slate-600">{v.category}</td>
                      <td className="p-3 text-right font-mono text-slate-900">{formatCurrency(v.totalPurchase)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 font-bold">{formatCurrency(v.paidAmount)}</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{formatCurrency(v.outstandingBalance)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.outstandingBalance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {v.outstandingBalance > 0 ? 'Payment Due' : 'Fully Cleared'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Profile Modal */}
      {selectedVendor && (
        <Modal
          isOpen={Boolean(selectedVendor)}
          onClose={() => setSelectedVendor(null)}
          title={`Vendor Details: ${selectedVendor.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-500 block">Vendor ID</span>
                <strong className="text-slate-900 font-mono">{selectedVendor.id}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">GSTIN</span>
                <strong className="text-slate-900 font-mono">{selectedVendor.gstin}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Person</span>
                <strong className="text-slate-900">{selectedVendor.contactPerson}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <strong className="text-slate-900">{selectedVendor.phone}</strong>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Supply Yard / Office Address</span>
              <p className="text-slate-800 font-medium mt-0.5">{selectedVendor.address}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Vendor Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New Raw Material Vendor"
        >
          <form onSubmit={handleRegisterVendor} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Supplier Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="erp-input"
                placeholder="e.g. Kolhapur TMT Steel Traders"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="erp-input"
                  placeholder="e.g. Anand Kulkarni"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="erp-input"
                  placeholder="+91 94220 00000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="erp-input"
                >
                  <option value="Material Suppliers">Material Suppliers (Steel, Cement)</option>
                  <option value="Subcontractors">Civil Subcontractors</option>
                  <option value="Equipment Rental">Plant & Machinery Hire</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="erp-input"
                  placeholder="27XXXXX0000X1ZX"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="erp-btn-primary"
              >
                Save Vendor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
