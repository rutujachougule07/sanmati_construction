// MODULE 1: CRM MANAGEMENT
import React, { useState } from 'react';
import { Plus, Users, Phone, Mail, MapPin, Building, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CRMModule = () => {
  const { clients, setClients, projects } = useERPData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('clients'); // clients or enquiries

  // Sample Leads / Enquiries
  const [enquiries, setEnquiries] = useState([
    {
      id: "ENQ-2026-081",
      clientName: "Mahalaxmi Cooperative Housing Society",
      contactPerson: "Adv. Rahul Shinde",
      phone: "+91 98224 55112",
      email: "mahalaxmi.society@gmail.com",
      projectType: "Residential Redevelopment",
      estimatedValue: 65000000,
      location: "Rajarampuri 5th Lane, Kolhapur",
      assignedTo: "Er. Rajesh Kulkarni",
      status: "Follow-up Scheduled",
      nextFollowUp: "2026-11-05",
      notes: "Architectural drawings review meeting at site."
    },
    {
      id: "ENQ-2026-082",
      clientName: "Shri Chhatrapati Shahu Cold Storage",
      contactPerson: "Prashant Patil",
      phone: "+91 94220 99887",
      email: "shahu.coldstorage@gmail.com",
      projectType: "Industrial Cold Storage & PEB Shed",
      estimatedValue: 42000000,
      location: "Shiroli MIDC, Kolhapur",
      assignedTo: "Er. Amit Deshmukh",
      status: "Quotation Sent",
      nextFollowUp: "2026-11-08",
      notes: "Commercial quotation submitted, awaiting board approval."
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    category: 'Private Real Estate'
  });

  const handleCreateClient = (e) => {
    e.preventDefault();
    const newClient = {
      id: `CLI-00${clients.length + 1}`,
      totalProjects: 0,
      activeProjects: 0,
      totalBilled: 0,
      outstanding: 0,
      createdDate: new Date().toISOString().split('T')[0],
      ...formData
    };
    setClients([newClient, ...clients]);
    setIsModalOpen(false);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', category: 'Private Real Estate' });
  };

  const clientColumns = [
    { key: 'id', header: 'Client ID', render: (row) => <span className="font-bold text-gold-400">{row.id}</span> },
    {
      key: 'name',
      header: 'Client / Company',
      render: (row) => (
        <div>
          <span className="font-bold text-white block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Person',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-200">{row.contactPerson}</p>
          <p className="text-slate-400 text-[11px]">{row.phone}</p>
        </div>
      )
    },
    { key: 'gstin', header: 'GSTIN', render: (row) => <span className="font-mono text-[11px] text-slate-300">{row.gstin || '—'}</span> },
    { key: 'totalBilled', header: 'Total Billed', align: 'right', render: (row) => <span className="font-semibold text-white">{formatCurrency(row.totalBilled)}</span> },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: (row) => <span className={`font-semibold ${row.outstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatCurrency(row.outstanding)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedClient(row)}
          className="px-2.5 py-1 bg-[#222a36] hover:bg-gold-400 hover:text-black rounded text-[11px] font-semibold transition-colors"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">CRM & Client Management</h2>
          <p className="text-xs text-slate-400">Manage client profiles, new project leads, enquiries, and follow-ups in Kolhapur.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'clients' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Clients Directory ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'enquiries' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Leads & Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register Client</span>
          </button>
        </div>
      </div>

      {activeTab === 'clients' ? (
        <DataTable
          columns={clientColumns}
          data={clients}
          searchKey="name"
          searchPlaceholder="Search clients by name, contact, GSTIN..."
          exportFileName="Sanmati_Clients_List"
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="p-5 bg-[#181d25] border border-[#27303e] rounded-xl shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold-400">{enq.id}</span>
                  <StatusBadge status={enq.status} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-heading">{enq.clientName}</h4>
                  <p className="text-xs text-slate-400">{enq.projectType}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-[#222935]">
                  <div>Est. Value: <span className="font-bold text-emerald-400">{formatCurrency(enq.estimatedValue)}</span></div>
                  <div>Assigned: <span className="font-bold text-white">{enq.assignedTo}</span></div>
                  <div>Location: <span className="text-slate-400">{enq.location}</span></div>
                  <div>Follow-up: <span className="text-gold-400 font-semibold">{enq.nextFollowUp}</span></div>
                </div>
                <p className="text-xs text-slate-400 bg-[#12151a] p-2 rounded border border-[#222935]">
                  <strong className="text-slate-300">Notes:</strong> {enq.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Profile Details Modal */}
      {selectedClient && (
        <Modal
          isOpen={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          title={`Client Profile: ${selectedClient.name}`}
          subtitle={`Client ID: ${selectedClient.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-[#14181f] p-4 rounded-xl border border-[#262e3c]">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Person:</span>
                <span className="text-white font-semibold text-sm">{selectedClient.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category:</span>
                <span className="text-gold-400 font-semibold">{selectedClient.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone:</span>
                <span className="text-white">{selectedClient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="text-white">{selectedClient.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Registered Address:</span>
                <span className="text-white">{selectedClient.address}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">GSTIN Number:</span>
                <span className="text-white font-mono">{selectedClient.gstin || 'Unregistered'}</span>
              </div>
            </div>

            {/* Financial Ledger Snapshot */}
            <div className="bg-[#14181f] p-4 rounded-xl border border-[#262e3c]">
              <h5 className="font-bold text-white mb-2">Financial Snapshot</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-[#1b222d] rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Total Billed:</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(selectedClient.totalBilled)}</span>
                </div>
                <div className="p-2.5 bg-[#1b222d] rounded-lg">
                  <span className="text-slate-400 text-[11px] block">Outstanding Dues:</span>
                  <span className={`text-lg font-bold ${selectedClient.outstanding > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(selectedClient.outstanding)}
                  </span>
                </div>
              </div>
            </div>

            {/* Associated Projects */}
            <div>
              <h5 className="font-bold text-white mb-2">Associated Projects ({projects.filter(p => p.clientId === selectedClient.id).length})</h5>
              <div className="space-y-2">
                {projects.filter(p => p.clientId === selectedClient.id).map(proj => (
                  <div key={proj.id} className="p-2.5 bg-[#14181f] rounded-lg border border-[#262e3c] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{proj.name}</p>
                      <p className="text-[11px] text-slate-400">{proj.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gold-400">{formatCurrency(proj.contractValue)}</p>
                      <StatusBadge status={proj.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Client"
        subtitle="Add a new client or institutional organization to SANMATI CONSTRUCTIONS"
      >
        <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Client / Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kolhapur Developers Pvt Ltd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="erp-input"
              >
                <option value="Private Real Estate">Private Real Estate</option>
                <option value="Government / Municipal">Government / Municipal</option>
                <option value="Institutional">Institutional</option>
                <option value="Industrial / Cooperative">Industrial / Cooperative</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98220 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Site / Office Address *</label>
            <textarea
              required
              rows={2}
              placeholder="Full address in Kolhapur / Maharashtra"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">GSTIN Number (15 Characters)</label>
            <input
              type="text"
              maxLength={15}
              placeholder="27AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="erp-input font-mono"
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
              Save Client Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
