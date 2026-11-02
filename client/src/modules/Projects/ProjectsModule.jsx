// MODULE 10: CONSTRUCTION PROJECT MANAGEMENT (CORE MODULE)
import React, { useState } from 'react';
import { 
  HardHat, Plus, MapPin, Calendar, Users, DollarSign, TrendingUp, 
  CheckCircle2, Clock, Layers, FileText, Camera, ArrowRight, ShieldCheck, 
  BarChart2, AlertCircle, Edit3 
} from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatDate, calculateBOQItem } from '../../utils/formatters';
import { CONSTRUCTION_ACTIVITIES } from '../../utils/constants';

export const ProjectsModule = () => {
  const { projects, addProject, updateProject, updateProjectActivity, boqItems, addBOQItem, clients } = useERPData();
  const { currentUser } = useAuth();

  const [selectedProject, setSelectedProject] = useState(projects[0] || null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, activities, boq, dpr, profitability
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isBOQModalOpen, setIsBOQModalOpen] = useState(false);
  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);

  // Daily Site Reports state
  const [dprLogs, setDprLogs] = useState([
    {
      id: "DPR-2026-1102",
      projectId: "PRJ-KLP-001",
      date: "2026-11-02",
      engineer: "Er. Amit Deshmukh",
      weather: "Sunny / Clear (31°C)",
      labourCount: { masons: 8, barBenders: 14, helpers: 22, operators: 3 },
      activitiesExecuted: "RCC 4th floor slab shuttering inspection and conduit pipe laying for electrical ducts.",
      materialsConsumed: "18 MT TMT Rebar Fe500, 300 Bags Cement, Binding Wire 250kg",
      equipmentDeployed: "1x Tower Crane, 1x Concrete Batching Mixer, 2x Needle Vibrators",
      photos: ["https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80"]
    }
  ]);

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    name: '',
    clientId: clients[0]?.id || 'CLI-001',
    projectManager: 'Er. Rajesh Kulkarni',
    siteEngineer: 'Er. Amit Deshmukh',
    location: '',
    latitude: 16.7050,
    longitude: 74.2433,
    geofenceRadius: 250,
    startDate: '',
    targetCompletionDate: '',
    contractValue: '',
    projectBudget: '',
    description: ''
  });

  // BOQ Form State
  const [boqForm, setBoqForm] = useState({
    itemCode: 'CIV-02',
    description: '',
    unit: 'Cu.M',
    quantity: '',
    rate: '',
    materialCost: '',
    labourCost: ''
  });

  // DPR Form State
  const [dprForm, setDprForm] = useState({
    activitiesExecuted: '',
    labourCount: 'Masons: 6, Helpers: 18, Carpenters: 8',
    materialsConsumed: 'Cement: 250 bags, Sand: 4 brass',
    equipmentDeployed: 'Concrete Mixer & Tower Crane'
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    const clientObj = clients.find(c => c.id === projectForm.clientId);
    const newProj = addProject({
      name: projectForm.name,
      clientId: projectForm.clientId,
      clientName: clientObj ? clientObj.name : 'Client',
      projectManager: projectForm.projectManager,
      siteEngineer: projectForm.siteEngineer,
      location: projectForm.location,
      latitude: Number(projectForm.latitude),
      longitude: Number(projectForm.longitude),
      geofenceRadius: Number(projectForm.geofenceRadius),
      startDate: projectForm.startDate,
      targetCompletionDate: projectForm.targetCompletionDate,
      contractValue: Number(projectForm.contractValue),
      projectBudget: Number(projectForm.projectBudget),
      description: projectForm.description
    });
    setSelectedProject(newProj);
    setIsNewProjectModalOpen(false);
  };

  const handleCreateBOQ = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    addBOQItem({
      projectId: selectedProject.id,
      itemCode: boqForm.itemCode,
      description: boqForm.description,
      unit: boqForm.unit,
      quantity: Number(boqForm.quantity),
      rate: Number(boqForm.rate),
      materialCost: Number(boqForm.materialCost || 0),
      labourCost: Number(boqForm.labourCost || 0)
    });
    setIsBOQModalOpen(false);
    setBoqForm({ itemCode: 'CIV-02', description: '', unit: 'Cu.M', quantity: '', rate: '', materialCost: '', labourCost: '' });
  };

  const handleCreateDPR = (e) => {
    e.preventDefault();
    const newDPR = {
      id: `DPR-${Date.now()}`,
      projectId: selectedProject.id,
      date: new Date().toISOString().split('T')[0],
      engineer: currentUser?.name || 'Er. Amit Deshmukh',
      weather: 'Clear (30°C)',
      labourCount: dprForm.labourCount,
      activitiesExecuted: dprForm.activitiesExecuted,
      materialsConsumed: dprForm.materialsConsumed,
      equipmentDeployed: dprForm.equipmentDeployed,
      photos: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"]
    };
    setDprLogs([newDPR, ...dprLogs]);
    setIsDPRModalOpen(false);
    setDprForm({ activitiesExecuted: '', labourCount: '', materialsConsumed: '', equipmentDeployed: '' });
  };

  const currentProjectBOQs = boqItems.filter(b => b.projectId === selectedProject?.id);

  return (
    <div className="space-y-6">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Construction Project Management</h2>
          <p className="text-xs text-slate-400">Core execution suite: Work Breakdown Structure (WBS), 10 activities, BOQ items, DPRs, and profitability.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Project Selector */}
          <div className="flex items-center gap-2 bg-[#181d25] px-3 py-1.5 rounded-xl border border-[#27303e]">
            <span className="text-xs text-slate-400 font-medium">Site:</span>
            <select
              value={selectedProject?.id}
              onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
              className="bg-transparent text-xs font-bold text-gold-400 focus:outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[#14181f] text-white">
                  {p.id}: {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="erp-btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Selected Project Overview Banner */}
      {selectedProject && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-400/20 text-gold-400 font-mono">
                  {selectedProject.id}
                </span>
                <StatusBadge status={selectedProject.status} />
              </div>
              <h3 className="text-xl font-bold text-white font-heading mt-1">{selectedProject.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-copper-400" />
                <span>{selectedProject.location}</span>
                <span className="mx-1">•</span>
                <span>Client: <strong className="text-slate-200">{selectedProject.clientName}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#14181f] p-3 rounded-xl border border-[#252c38]">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Completion</span>
                <span className="text-2xl font-bold text-gold-400 font-heading">
                  {selectedProject.completionPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#13161c] h-3 rounded-full overflow-hidden p-0.5 border border-[#222935]">
            <div
              className="h-full bg-gradient-to-r from-gold-400 via-copper-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${selectedProject.completionPercentage}%` }}
            />
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-[#232a35] text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Contract Value:</span>
              <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.contractValue)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Approved Budget:</span>
              <span className="font-bold text-sky-400 font-mono">{formatCurrency(selectedProject.projectBudget)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Actual Spent:</span>
              <span className="font-bold text-rose-400 font-mono">{formatCurrency(selectedProject.actualExpenditure)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Billed to Client:</span>
              <span className="font-bold text-emerald-400 font-mono">{formatCurrency(selectedProject.billedAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Booked Profit:</span>
              <span className="font-bold text-gold-400 font-mono">{formatCurrency(selectedProject.actualProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Module Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#252c38] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
            activeTab === 'overview' ? 'bg-[#181d25] text-gold-400 border-t-2 border-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          WBS & 10 Construction Activities
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
            activeTab === 'boq' ? 'bg-[#181d25] text-gold-400 border-t-2 border-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bill of Quantities (BOQ) ({currentProjectBOQs.length})
        </button>
        <button
          onClick={() => setActiveTab('dpr')}
          className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
            activeTab === 'dpr' ? 'bg-[#181d25] text-gold-400 border-t-2 border-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Daily Site Reports (DPR)
        </button>
        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition-colors ${
            activeTab === 'profitability' ? 'bg-[#181d25] text-gold-400 border-t-2 border-gold-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Profitability & Cost Analysis
        </button>
      </div>

      {/* Tab 1: Construction Activities & WBS */}
      {activeTab === 'overview' && selectedProject && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white font-heading">
                Sequential Construction Activities & Milestone Progress
              </h4>
              <p className="text-xs text-slate-400">10 Standard Construction phases from Excavation to Final Handover.</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedProject.activities?.map((act, idx) => (
              <div 
                key={act.name}
                className="p-4 bg-[#14181f] rounded-xl border border-[#252c38] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-gold-400/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1e2532] text-gold-400 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{act.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      Timeline: {act.startDate ? `${formatDate(act.startDate)} to ${formatDate(act.endDate)}` : 'As per schedule'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-full md:w-44">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Progress:</span>
                      <span className="font-bold text-gold-400 font-mono">{act.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={act.progress}
                      onChange={(e) => {
                        const newProg = Number(e.target.value);
                        const newStatus = newProg === 100 ? 'Completed' : newProg > 0 ? 'In Progress' : 'Pending';
                        updateProjectActivity(selectedProject.id, act.name, newProg, newStatus);
                      }}
                      className="w-full accent-gold-400 cursor-pointer"
                    />
                  </div>

                  <StatusBadge status={act.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: BOQ Management */}
      {activeTab === 'boq' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsBOQModalOpen(true)}
              className="erp-btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add BOQ Item</span>
            </button>
          </div>

          <div className="bg-[#181d25] border border-[#27303e] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                    <th className="p-3">Item Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Unit</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Contract Rate</th>
                    <th className="p-3 text-right">Material Cost</th>
                    <th className="p-3 text-right">Labour Cost</th>
                    <th className="p-3 text-right">Amount (Qty × Rate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222935]">
                  {currentProjectBOQs.length > 0 ? (
                    currentProjectBOQs.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1a202c]">
                        <td className="p-3 font-mono font-bold text-gold-400">{item.itemCode}</td>
                        <td className="p-3 text-white max-w-xs">{item.description}</td>
                        <td className="p-3 text-center text-slate-300 font-semibold">{item.unit}</td>
                        <td className="p-3 text-right font-mono text-slate-200">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-200">{formatCurrency(item.rate)}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(item.materialCost)}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(item.labourCost)}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 text-xs">
                        No BOQ items added for this project yet. Click "Add BOQ Item" to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Progress Reports (DPR) */}
      {activeTab === 'dpr' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsDPRModalOpen(true)}
              className="erp-btn-primary text-xs flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Submit Daily Progress Report (DPR)</span>
            </button>
          </div>

          <div className="space-y-4">
            {dprLogs.map((dpr) => (
              <div key={dpr.id} className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252c38] pb-3">
                  <div>
                    <span className="text-gold-400 font-mono text-xs font-bold">{dpr.id}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">Site Engineer: {dpr.engineer}</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{formatDate(dpr.date)} • {dpr.weather}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p><strong className="text-slate-300">Activities Executed:</strong> <span className="text-slate-200">{dpr.activitiesExecuted}</span></p>
                    <p><strong className="text-slate-300">Labour Deployment:</strong> <span className="text-slate-400">{typeof dpr.labourCount === 'object' ? JSON.stringify(dpr.labourCount) : dpr.labourCount}</span></p>
                    <p><strong className="text-slate-300">Materials Consumed:</strong> <span className="text-slate-400">{dpr.materialsConsumed}</span></p>
                    <p><strong className="text-slate-300">Machinery Deployed:</strong> <span className="text-slate-400">{dpr.equipmentDeployed}</span></p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Site Photographic Evidence:</span>
                    <div className="flex gap-2">
                      {dpr.photos?.map((ph, idx) => (
                        <img
                          key={idx}
                          src={ph}
                          alt="Site Progress"
                          className="w-32 h-24 object-cover rounded-lg border border-[#27303e]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Profitability Engine */}
      {activeTab === 'profitability' && selectedProject && (
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h4 className="text-base font-bold text-white font-heading">
              Comprehensive Project Profitability Statement
            </h4>
            <p className="text-xs text-slate-400">Real-time calculations of contract revenues versus total expenditures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue / Inflow */}
            <div className="p-5 bg-[#14181f] rounded-xl border border-emerald-900/40 space-y-3">
              <h5 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Client Revenue & Inflows</span>
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Total Contract Value:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.contractValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Total Client Billing to Date:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.billedAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Total Payments Received:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatCurrency(selectedProject.receivedAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Outstanding Receivable:</span>
                  <span className="font-bold text-rose-400 font-mono">{formatCurrency(selectedProject.outstandingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Expenditure / Outflows */}
            <div className="p-5 bg-[#14181f] rounded-xl border border-rose-900/40 space-y-3">
              <h5 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Expenditures & Outflows</span>
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Original Approved Budget:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.projectBudget)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Material Costs Incurred:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.55)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#222935]">
                  <span className="text-slate-400">Labour & Wages:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.28)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Subcontractor & Equipment:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.17)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Net Margin Bar */}
          <div className="p-4 bg-gradient-to-r from-gold-400/20 via-[#181d25] to-emerald-400/20 rounded-xl border border-gold-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Projected Estimated Profit</span>
              <h3 className="text-2xl font-bold font-mono text-white mt-0.5">
                {formatCurrency(selectedProject.estimatedProfit)}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Booked Actual Profit (To Date)</span>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {formatCurrency(selectedProject.actualProfit)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Project */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Initialize New Construction Project"
        subtitle="Create civil project, assign site engineer, set contract value & geofence"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Palace Commercial Complex"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              className="erp-input font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Client *</label>
              <select
                value={projectForm.clientId}
                onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                className="erp-input font-bold"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Project Manager *</label>
              <input
                type="text"
                required
                value={projectForm.projectManager}
                onChange={(e) => setProjectForm({ ...projectForm, projectManager: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Site Engineer *</label>
              <input
                type="text"
                required
                value={projectForm.siteEngineer}
                onChange={(e) => setProjectForm({ ...projectForm, siteEngineer: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Project Site Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kawala Naka, Kolhapur"
                value={projectForm.location}
                onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={projectForm.latitude}
                onChange={(e) => setProjectForm({ ...projectForm, latitude: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={projectForm.longitude}
                onChange={(e) => setProjectForm({ ...projectForm, longitude: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Geofence Radius (m)</label>
              <input
                type="number"
                value={projectForm.geofenceRadius}
                onChange={(e) => setProjectForm({ ...projectForm, geofenceRadius: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contract Value (INR ₹) *</label>
              <input
                type="number"
                required
                placeholder="48500000"
                value={projectForm.contractValue}
                onChange={(e) => setProjectForm({ ...projectForm, contractValue: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Approved Budget (INR ₹) *</label>
              <input
                type="number"
                required
                placeholder="39500000"
                value={projectForm.projectBudget}
                onChange={(e) => setProjectForm({ ...projectForm, projectBudget: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Completion Date *</label>
              <input
                type="date"
                required
                value={projectForm.targetCompletionDate}
                onChange={(e) => setProjectForm({ ...projectForm, targetCompletionDate: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add BOQ Item */}
      <Modal
        isOpen={isBOQModalOpen}
        onClose={() => setIsBOQModalOpen(false)}
        title={`Add BOQ Item: ${selectedProject?.name}`}
        subtitle="Formula: Amount = Quantity × Rate"
      >
        <form onSubmit={handleCreateBOQ} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Item Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. RCC-02"
                value={boqForm.itemCode}
                onChange={(e) => setBoqForm({ ...boqForm, itemCode: e.target.value })}
                className="erp-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit *</label>
              <select
                value={boqForm.unit}
                onChange={(e) => setBoqForm({ ...boqForm, unit: e.target.value })}
                className="erp-input font-bold"
              >
                <option value="Cu.M">Cu.M (Cubic Meter)</option>
                <option value="Sq.M">Sq.M (Square Meter)</option>
                <option value="MT">MT (Metric Ton)</option>
                <option value="Brass">Brass</option>
                <option value="Bags">Bags</option>
                <option value="Running Mtr">Running Mtr</option>
                <option value="Lump Sum">Lump Sum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Item Description *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Providing and laying M30 Grade concrete in floor slabs..."
              value={boqForm.description}
              onChange={(e) => setBoqForm({ ...boqForm, description: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity *</label>
              <input
                type="number"
                required
                step="any"
                min="0.1"
                placeholder="100"
                value={boqForm.quantity}
                onChange={(e) => setBoqForm({ ...boqForm, quantity: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Rate per Unit (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="6800"
                value={boqForm.rate}
                onChange={(e) => setBoqForm({ ...boqForm, rate: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Estimated Material Cost / Unit</label>
              <input
                type="number"
                value={boqForm.materialCost}
                onChange={(e) => setBoqForm({ ...boqForm, materialCost: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Estimated Labour Cost / Unit</label>
              <input
                type="number"
                value={boqForm.labourCost}
                onChange={(e) => setBoqForm({ ...boqForm, labourCost: e.target.value })}
                className="erp-input font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-[#13161c] rounded-xl border border-[#232a35] flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Computed Item Amount:</span>
            <span className="text-base font-bold text-gold-400 font-mono">
              {formatCurrency(calculateBOQItem(boqForm.quantity, boqForm.rate))}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsBOQModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Save BOQ Line Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Submit DPR */}
      <Modal
        isOpen={isDPRModalOpen}
        onClose={() => setIsDPRModalOpen(false)}
        title="Submit Daily Progress Report (DPR)"
        subtitle={`Site Log for ${selectedProject?.name}`}
      >
        <form onSubmit={handleCreateDPR} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Activities Executed Today *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Excavation work continued for tower basement, 400 Cu.M soil carted."
              value={dprForm.activitiesExecuted}
              onChange={(e) => setDprForm({ ...dprForm, activitiesExecuted: e.target.value })}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Labour Force Deployed</label>
            <input
              type="text"
              placeholder="e.g. Masons: 8, Bar Benders: 12, Helpers: 20"
              value={dprForm.labourCount}
              onChange={(e) => setDprForm({ ...dprForm, labourCount: e.target.value })}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Materials Consumed</label>
              <input
                type="text"
                placeholder="e.g. 150 Bags Cement, 8 MT Steel"
                value={dprForm.materialsConsumed}
                onChange={(e) => setDprForm({ ...dprForm, materialsConsumed: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Equipment Deployed</label>
              <input
                type="text"
                placeholder="e.g. 1x JCB, 1x Crane"
                value={dprForm.equipmentDeployed}
                onChange={(e) => setDprForm({ ...dprForm, equipmentDeployed: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#262e3c]">
            <button
              type="button"
              onClick={() => setIsDPRModalOpen(false)}
              className="erp-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="erp-btn-primary text-xs"
            >
              Submit DPR Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
