// MODULE 17: ROLE-BASED ACCESS MANAGEMENT
import React, { useState } from 'react';
import { ShieldCheck, Plus, UserPlus, Check, X, Lock, Unlock, Users, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES, MODULES_CONFIG } from '../../utils/constants';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';

export const RolesModule = () => {
  const { allUsers, createUser, toggleUserStatus, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, matrix
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: USER_ROLES.SITE_ENGINEER,
    designation: 'Site Engineer',
    department: 'Site Execution',
    phone: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      designation: formData.designation,
      department: formData.department,
      phone: formData.phone,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    });
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: USER_ROLES.SITE_ENGINEER, designation: 'Site Engineer', department: 'Site Execution', phone: '' });
  };

  // Standard RBAC Permissions Grid
  const permissionsMatrix = [
    { module: "Dashboard & KPIs", superAdmin: true, pm: true, se: true, acc: true, pur: true, store: true, hr: true, emp: true },
    { module: "Construction Projects (WBS & DPR)", superAdmin: true, pm: true, se: true, acc: false, pur: false, store: false, hr: false, emp: false },
    { module: "Bill of Quantities (BOQ)", superAdmin: true, pm: true, se: true, acc: true, pur: false, store: false, hr: false, emp: false },
    { module: "Running Account (RA) Billing", superAdmin: true, pm: true, se: false, acc: true, pur: false, store: false, hr: false, emp: false },
    { module: "Accounts, Cashbook & Tally Gateway", superAdmin: true, pm: false, se: false, acc: true, pur: false, store: false, hr: false, emp: false },
    { module: "GST & Taxation Invoices", superAdmin: true, pm: false, se: false, acc: true, pur: false, store: false, hr: false, emp: false },
    { module: "Inventory & Store Movements", superAdmin: true, pm: false, se: true, acc: false, pur: true, store: true, hr: false, emp: false },
    { module: "Vendor Procurement & POs", superAdmin: true, pm: true, se: false, acc: true, pur: true, store: false, hr: false, emp: false },
    { module: "GPS Tracking & Geofence Logs", superAdmin: true, pm: true, se: true, acc: false, pur: false, store: false, hr: true, emp: true },
    { module: "HRMS & Employee Payroll", superAdmin: true, pm: false, se: false, acc: false, pur: false, store: false, hr: true, emp: false },
    { module: "Approval Workflows Gateway", superAdmin: true, pm: true, se: false, acc: false, pur: true, store: false, hr: true, emp: false },
    { module: "User Roles & Permissions Admin", superAdmin: true, pm: false, se: false, acc: false, pur: false, store: false, hr: false, emp: false }
  ];

  const userColumns = [
    {
      key: 'name',
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full object-cover border border-gold-400/40" />
          <div>
            <span className="font-bold text-white block">{row.name}</span>
            <span className="text-[11px] text-slate-400">{row.email}</span>
          </div>
        </div>
      )
    },
    { key: 'role', header: 'Assigned Role', render: (row) => <span className="font-bold text-gold-400 text-xs">{row.role}</span> },
    { key: 'designation', header: 'Designation & Department', render: (row) => <span className="text-slate-300 text-xs">{row.designation}<br/><span className="text-[10px] text-slate-500">{row.department}</span></span> },
    { key: 'phone', header: 'Contact', render: (row) => <span className="text-slate-300 font-mono text-xs">{row.phone}</span> },
    { key: 'status', header: 'Account Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Activation',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => toggleUserStatus(row.id)}
          disabled={row.role === USER_ROLES.SUPER_ADMIN}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            row.status === 'Active' 
              ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800' 
              : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {row.status === 'Active' ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Role-Based Access Control (RBAC)</h2>
          <p className="text-xs text-slate-400">Manage 8 operational construction roles, permissions matrix, and authorized user accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'users' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Authorized Users ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'matrix' ? 'bg-gold-400 text-black' : 'bg-[#181d26] text-slate-300'}`}
          >
            Access Permissions Matrix
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="erp-btn-primary text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <DataTable
          columns={userColumns}
          data={allUsers}
          searchKey="name"
          searchPlaceholder="Search users by name, role, email..."
          exportFileName="Sanmati_Users_RBAC"
        />
      )}

      {activeTab === 'matrix' && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
          <div>
            <h3 className="text-base font-bold text-white font-heading">8-Role Construction Module Access Matrix</h3>
            <p className="text-xs text-slate-400">Strictly enforced across React client UI guards and Node.js / Firestore backend rules.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">ERP Functional Module</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Owner / Super Admin</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Project Manager</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Site Engineer</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Accountant</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Purchase</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Storekeeper</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">HR</th>
                  <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222935]">
                {permissionsMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1a202c]">
                    <td className="px-3 py-2 text-xs whitespace-nowrap font-bold text-white">{row.module}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.superAdmin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.pm ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.se ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.acc ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.pur ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.store ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.hr ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap text-center">{row.emp ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New User Account"
        subtitle="Provision ERP credentials and assign role permissions"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="erp-input font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Company Email *</label>
              <input
                type="email"
                required
                placeholder="name@sanmaticonstructions.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="erp-input"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned ERP Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, designation: e.target.value })}
                className="erp-input font-bold text-gold-400"
              >
                {Object.values(USER_ROLES).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="erp-input"
              >
                <option value="Executive Management">Executive Management</option>
                <option value="Operations & Civil">Operations & Civil</option>
                <option value="Site Execution">Site Execution</option>
                <option value="Accounts & Finance">Accounts & Finance</option>
                <option value="Procurement & Vendor Relations">Procurement & Vendor Relations</option>
                <option value="Inventory & Stores">Inventory & Stores</option>
                <option value="HR & Administration">HR & Administration</option>
              </select>
            </div>
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
              Provision Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
