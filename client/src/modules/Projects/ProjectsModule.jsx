// MODULE 10: CONSTRUCTION PROJECT MANAGEMENT (CORE MODULE)
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    } else if (selectedProject && !projects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(projects[0] || null);
    }
  }, [projects, selectedProject]);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            SANMATI CONSTRUCTIONS • EXECUTION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Construction Project Management</h2>
          <p className="text-sm text-slate-500 mt-1">Core execution suite: Work Breakdown Structure (WBS), 10 activities, BOQ items, DPRs, and profitability.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Project Selector */}
          <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-sm text-slate-500 font-semibold">Site:</span>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)}
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">No Projects Registered</option>
              ) : (
                projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900 font-semibold">
                    {p.id}: {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="erp-btn-primary text-sm font-bold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Selected Project Overview Banner */}
      {selectedProject && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#e8f1fc] text-[#004bb5] border border-[#cce0fc] font-mono">
                  {selectedProject.id}
                </span>
                <StatusBadge status={selectedProject.status} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-heading mt-1.5">{selectedProject.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-[#002046]" />
                <span>{selectedProject.location}</span>
                <span className="mx-1">•</span>
                <span>Client: <strong className="text-slate-800">{selectedProject.clientName}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">Overall Completion</span>
                <span className="text-3xl font-black text-[#002046] font-heading">
                  {selectedProject.completionPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar in Royal Navy Blue */}
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#002046] to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${selectedProject.completionPercentage}%` }}
            />
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Contract Value:</span>
              <span className="font-bold text-slate-900 text-base font-mono">{formatCurrency(selectedProject.contractValue)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Approved Budget:</span>
              <span className="font-bold text-slate-800 text-base font-mono">{formatCurrency(selectedProject.projectBudget)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Actual Spent:</span>
              <span className="font-bold text-rose-600 text-base font-mono">{formatCurrency(selectedProject.actualExpenditure)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Billed to Client:</span>
              <span className="font-bold text-emerald-700 text-xs font-bold font-mono">{formatCurrency(selectedProject.billedAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Booked Profit:</span>
              <span className="font-bold text-emerald-700 text-xs font-bold font-mono">{formatCurrency(selectedProject.actualProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Banner when no projects exist */}
      {!selectedProject && (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center mx-auto mb-3">
            <HardHat className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800 font-heading">No Projects Registered</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-md mx-auto">
            There are no construction projects registered in the system yet. Click "+ New Project" to add your live project.
          </p>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="erp-btn-primary text-xs font-bold px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Live Project</span>
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#002046] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          WBS & 10 Construction Activities
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'boq' ? 'bg-[#002046] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          Bill of Quantities (BOQ) ({currentProjectBOQs.length})
        </button>
        <button
          onClick={() => setActiveTab('dpr')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'dpr' ? 'bg-[#002046] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          Daily Site Reports (DPR)
        </button>
        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'profitability' ? 'bg-[#002046] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          Profitability & Cost Analysis
        </button>
      </div>

      {/* Tab 1: Construction Activities & WBS */}
      {activeTab === 'overview' && selectedProject && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900 font-heading">
                Sequential Construction Activities & Milestone Progress
              </h4>
              <p className="text-sm text-slate-500">10 Standard Construction phases from Excavation to Final Handover.</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedProject.activities?.map((act, idx) => (
              <div 
                key={act.name}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-300 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#002046] font-bold flex items-center justify-center text-sm shadow-2xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-base">{act.name}</h5>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      Timeline: {act.startDate ? `${formatDate(act.startDate)} to ${formatDate(act.endDate)}` : 'As per schedule'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-full md:w-48">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Progress:</span>
                      <span className="font-bold text-[#002046] font-mono text-sm">{act.progress}%</span>
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
                      className="w-full accent-[#002046] cursor-pointer"
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
              className="erp-btn-primary text-sm font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add BOQ Item</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 border-b-2 border-slate-200 text-xs font-bold">
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600">Item Code</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600">Description</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-center">Unit</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-right">Quantity</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-right">Contract Rate</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-right">Material Cost</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-right">Labour Cost</th>
                    <th className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-slate-600 text-right">Amount (Qty × Rate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentProjectBOQs.length > 0 ? (
                    currentProjectBOQs.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-2 text-xs font-mono font-bold text-[#002046] text-sm">{item.itemCode}</td>
                        <td className="px-3.5 py-2 text-xs text-slate-900 font-semibold max-w-xs">{item.description}</td>
                        <td className="px-3.5 py-2 text-xs text-center text-slate-800 font-semibold">{item.unit}</td>
                        <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-800 font-semibold">{item.quantity}</td>
                        <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-800 font-semibold">{formatCurrency(item.rate)}</td>
                        <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-600">{formatCurrency(item.materialCost)}</td>
                        <td className="px-3.5 py-2 text-xs text-right font-mono text-slate-600">{formatCurrency(item.labourCost)}</td>
                        <td className="px-3.5 py-2 text-xs text-right font-mono font-bold text-emerald-700 text-xs font-bold">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-sm font-medium">
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
              className="erp-btn-primary text-sm font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Submit Daily Progress Report (DPR)</span>
            </button>
          </div>

          <div className="space-y-4">
            {dprLogs.map((dpr) => (
              <div key={dpr.id} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[#002046] font-mono text-sm font-bold">{dpr.id}</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">Site Engineer: {dpr.engineer}</h4>
                  </div>
                  <span className="text-sm text-slate-500 font-mono font-medium">{formatDate(dpr.date)} • {dpr.weather}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="space-y-2.5">
                    <p><strong className="text-slate-900 font-semibold">Activities Executed:</strong> <span className="text-slate-700">{dpr.activitiesExecuted}</span></p>
                    <p><strong className="text-slate-900 font-semibold">Labour Deployment:</strong> <span className="text-slate-700">{typeof dpr.labourCount === 'object' ? JSON.stringify(dpr.labourCount) : dpr.labourCount}</span></p>
                    <p><strong className="text-slate-900 font-semibold">Materials Consumed:</strong> <span className="text-slate-700">{dpr.materialsConsumed}</span></p>
                    <p><strong className="text-slate-900 font-semibold">Machinery Deployed:</strong> <span className="text-slate-700">{dpr.equipmentDeployed}</span></p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Site Photographic Evidence:</span>
                    <div className="flex gap-3">
                      {dpr.photos?.map((ph, idx) => (
                        <img
                          key={idx}
                          src={ph}
                          alt="Site Progress"
                          className="w-36 h-28 object-cover rounded-xl border border-slate-200 shadow-2xs"
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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xl font-bold text-slate-900 font-heading">
              Comprehensive Project Profitability Statement
            </h4>
            <p className="text-sm text-slate-500 mt-1">Real-time calculations of contract revenues versus total expenditures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue / Inflow */}
            <div className="p-6 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-4">
              <h5 className="font-bold text-emerald-800 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Client Revenue & Inflows</span>
              </h5>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600 font-medium">Total Contract Value:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.contractValue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600 font-medium">Total Client Billing to Date:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.billedAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-emerald-100">
                  <span className="text-slate-600 font-medium">Total Payments Received:</span>
                  <span className="font-bold text-emerald-700 font-mono">{formatCurrency(selectedProject.receivedAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600 font-medium">Outstanding Receivable:</span>
                  <span className="font-bold text-rose-600 font-mono">{formatCurrency(selectedProject.outstandingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Expenditure / Outflows */}
            <div className="p-6 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-4">
              <h5 className="font-bold text-rose-800 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Expenditures & Outflows</span>
              </h5>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between py-1.5 border-b border-rose-100">
                  <span className="text-slate-600 font-medium">Original Approved Budget:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.projectBudget)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-rose-100">
                  <span className="text-slate-600 font-medium">Material Costs Incurred:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.55)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-rose-100">
                  <span className="text-slate-600 font-medium">Labour & Wages:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.28)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600 font-medium">Subcontractor & Equipment:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(selectedProject.actualExpenditure * 0.17)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Net Margin Bar */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Projected Estimated Profit</span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(selectedProject.estimatedProfit)}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Booked Actual Profit (To Date)</span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
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
