// MODULE 1: CRM MANAGEMENT - Active Subcategories Implementation
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Users, Phone, Mail, MapPin, Building, Calendar, CheckCircle2, Clock, 
  Briefcase, History, AlertCircle, ArrowRight, UserCheck 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CRMModule = () => {
  const { clients, setClients, projects } = useERPData();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'customers';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

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
    },
    {
      id: "ENQ-2026-083",
      clientName: "Panchaganga Agro Tech Hub",
      contactPerson: "Vikram Mane",
      phone: "+91 98901 22334",
      email: "vikram@panchagangaagro.com",
      projectType: "Commercial Processing Facility",
      estimatedValue: 38000000,
      location: "Gandhinagar, Kolhapur",
      assignedTo: "Er. Rajesh Kulkarni",
      status: "Site Inspection Completed",
      nextFollowUp: "2026-11-04",
      notes: "Soil testing report submitted, preparing structural quotation."
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
    { key: 'id', header: 'Client ID', render: (row) => <span className="font-bold text-[#1d68e4]">{row.id}</span> },
    {
      key: 'name',
      header: 'Client / Company',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Person',
      render: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.contactPerson}</p>
          <p className="text-slate-500 text-[11px]">{row.phone}</p>
        </div>
      )
    },
    { key: 'gstin', header: 'GSTIN', render: (row) => <span className="font-mono text-[11px] text-slate-600">{row.gstin || '—'}</span> },
    { key: 'totalBilled', header: 'Total Billed', align: 'right', render: (row) => <span className="font-semibold text-slate-900">{formatCurrency(row.totalBilled)}</span> },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: (row) => <span className={`font-semibold ${row.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(row.outstanding)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedClient(row)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-[#1d68e4] hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
        >
          View Profile
        </button>
      )
    }
  ];

  const leadColumns = [
    { key: 'id', header: 'Enquiry ID', render: (row) => <span className="font-bold text-sky-600">{row.id}</span> },
    { key: 'clientName', header: 'Prospect Client', render: (row) => <span className="font-bold text-slate-900">{row.clientName}</span> },
    { key: 'projectType', header: 'Scope / Type', render: (row) => <span className="text-slate-700">{row.projectType}</span> },
    { key: 'estimatedValue', header: 'Est. Value', align: 'right', render: (row) => <span className="font-bold font-mono text-emerald-600">{formatCurrency(row.estimatedValue)}</span> },
    { key: 'assignedTo', header: 'Assigned Lead', render: (row) => <span className="text-slate-700 text-xs">{row.assignedTo}</span> },
    {
      key: 'status',
      header: 'Pipeline Stage',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* SUBSECTION 1: CUSTOMER DETAILS MANAGEMENT */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                1. CRM Management • Subsection (i)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Customer Details Management
              </h2>
              <p className="text-xs text-slate-500">Corporate client directories, GSTIN registration, and verified contact profiles.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="erp-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Client</span>
            </button>
          </div>

          <DataTable
            columns={clientColumns}
            data={clients}
            searchKey="name"
            searchPlaceholder="Search clients by company name or GSTIN..."
          />
        </div>
      )}

      {/* SUBSECTION 2: LEAD MANAGEMENT */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                1. CRM Management • Subsection (ii)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lead & Prospect Management
              </h2>
              <p className="text-xs text-slate-500">Track incoming civil tenders, construction inquiries, and deal pipelines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Active Inquiries</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{enquiries.length} Prospects</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Total Pipeline Value</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">₹14,50,00,000</div>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs">Conversion Rate</span>
              <div className="text-2xl font-black text-[#1d68e4] mt-1">68.4%</div>
            </div>
          </div>

          <DataTable
            columns={leadColumns}
            data={enquiries}
            searchKey="clientName"
            searchPlaceholder="Search leads by client name or project type..."
          />
        </div>
      )}

      {/* SUBSECTION 3: FOLLOW-UP REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              1. CRM Management • Subsection (iii)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Follow-Up Reminders & Schedules
            </h2>
            <p className="text-xs text-slate-500">Upcoming site meetings, commercial negotiations, and client calls.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Due: {formatDate(enq.nextFollowUp)}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{enq.id}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{enq.clientName}</h4>
                  <p className="text-xs text-slate-500">{enq.contactPerson} • {enq.phone}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold block text-[11px] text-slate-500 mb-0.5">Action Item:</span>
                  {enq.notes}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Assignee: <strong className="text-slate-800">{enq.assignedTo}</strong></span>
                  <button className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 transition-colors">
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSECTION 4: CUSTOMER HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              1. CRM Management • Subsection (iv)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer History & Completed Projects
            </h2>
            <p className="text-xs text-slate-500">Past interaction records, commercial contracts, and historical civil executions.</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Historical Client Ledger & Completion Logs</h4>
            <div className="divide-y divide-slate-100">
              {clients.map((c) => (
                <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{c.name}</h5>
                      <span className="text-[11px] text-slate-500">Member since {formatDate(c.createdDate || '2025-06-01')} • {c.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Billed</span>
                      <strong className="text-slate-900">{formatCurrency(c.totalBilled)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Outstanding</span>
                      <strong className={c.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}>{formatCurrency(c.outstanding)}</strong>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(c)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {selectedClient && (
        <Modal
          isOpen={Boolean(selectedClient)}
          onClose={() => setSelectedClient(null)}
          title={`Client Profile: ${selectedClient.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-500 block">Client ID</span>
                <strong className="text-slate-900 font-mono">{selectedClient.id}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">GSTIN</span>
                <strong className="text-slate-900 font-mono">{selectedClient.gstin || '27AAYCS9281Q1ZU'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Person</span>
                <strong className="text-slate-900">{selectedClient.contactPerson}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone</span>
                <strong className="text-slate-900">{selectedClient.phone}</strong>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Registered Office Address</span>
              <p className="text-slate-800 font-medium mt-0.5">{selectedClient.address || 'Station Road, Kolhapur, Maharashtra'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Client Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New Client / Corporate Developer"
        >
          <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Developer Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="erp-input"
                placeholder="e.g. Kolhapur Infrastructure Developers LLP"
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
                  placeholder="e.g. Ramesh Patil"
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
                  placeholder="+91 98220 00000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="erp-input"
                  placeholder="contact@company.com"
                />
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
                Save Client
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
