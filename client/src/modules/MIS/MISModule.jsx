// MODULE 12: MIS REPORTS
import React, { useState } from 'react';
import { BarChart3, Download, Printer, Filter, Calendar, Building, Layers } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { generatePDFReport, exportToExcel } from '../../services/exportService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MISModule = () => {
  const { projects, clients, vendors, raBills, inventory, expenses, gpsLogs, hrmsEmployees } = useERPData();
  const [misCategory, setMisCategory] = useState('projectMIS');

  const misOptions = [
    { id: 'projectMIS', label: 'Project-wise MIS' },
    { id: 'clientMIS', label: 'Client-wise MIS' },
    { id: 'vendorMIS', label: 'Vendor-wise MIS' },
    { id: 'attendanceMIS', label: 'Attendance & GPS MIS' },
    { id: 'materialMIS', label: 'Material & Stock MIS' },
    { id: 'budgetMIS', label: 'Budget & Expenditure MIS' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Management Information System (MIS) Reports</h2>
          <p className="text-xs text-slate-400">Standardized operational dossiers for executive reviews and board meetings.</p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="erp-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => exportToExcel(projects, 'Sanmati_MIS_Export')}
            className="erp-btn-primary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for MIS categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-print">
        {misOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setMisCategory(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              misCategory === opt.id ? 'bg-gold-400 text-black shadow-md' : 'bg-[#181d25] text-slate-300 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Dynamic MIS Grid Content */}
      <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-6 shadow-xl space-y-4">
        {misCategory === 'projectMIS' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-heading">Project Execution & Financial MIS Statement</h3>
              <span className="text-xs text-gold-400 font-mono">FY 2026-2027</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Project Code</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Site Name & Location</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Client</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Contract Value</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Budget</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Actual Cost</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Billed Amount</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222935]">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-[#1a202c]">
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-mono font-bold text-gold-400">{p.id}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-bold text-white">{p.name}<br/><span className="text-[11px] text-slate-400">{p.location}</span></td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-slate-300">{p.clientName}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-white">{formatCurrency(p.contractValue)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-slate-300">{formatCurrency(p.projectBudget)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-rose-400">{formatCurrency(p.actualExpenditure)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-emerald-400">{formatCurrency(p.billedAmount)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-center font-bold text-gold-400 font-mono">{p.completionPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {misCategory === 'attendanceMIS' && (
          <div>
            <h3 className="text-base font-bold text-white font-heading mb-4">Attendance & GPS Verification MIS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Timestamp</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Staff Name</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Project</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">GPS Coordinates</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Geofence Distance & Status</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222935]">
                  {gpsLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#1a202c]">
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-mono text-slate-400">{formatDate(log.timestamp, true)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-bold text-white">{log.userName}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-slate-300">{log.projectName}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-mono text-slate-400">{log.latitude}, {log.longitude}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-slate-200">{log.geofenceStatus}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {log.attendanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {misCategory === 'materialMIS' && (
          <div>
            <h3 className="text-base font-bold text-white font-heading mb-4">Central Store & Site Materials MIS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Material Code</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Item Description</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap">Category</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Current Stock</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Min Threshold</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Unit Rate</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-right">Inventory Valuation</th>
                    <th className="px-3 py-2 text-[10px] uppercase font-bold whitespace-nowrap text-center">Stock Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222935]">
                  {inventory.map(mat => (
                    <tr key={mat.id} className="hover:bg-[#1a202c]">
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-mono text-gold-400 font-bold">{mat.id}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap font-bold text-white">{mat.name}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-slate-400">{mat.category}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-white font-bold">{mat.currentStock} {mat.unit}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-slate-400">{mat.minimumThreshold} {mat.unit}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-slate-300">{formatCurrency(mat.unitPrice)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-right font-mono text-emerald-400 font-bold">{formatCurrency(mat.currentStock * mat.unitPrice)}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mat.currentStock <= mat.minimumThreshold ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {mat.currentStock <= mat.minimumThreshold ? 'Low Stock' : 'Adequate'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
