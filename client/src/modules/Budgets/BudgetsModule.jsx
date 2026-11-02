// MODULE 15: BUDGET MANAGEMENT
import React, { useState } from 'react';
import { PieChart, DollarSign, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const BudgetsModule = () => {
  const { projects } = useERPData();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'PRJ-KLP-001');

  const project = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Head-wise Budget Breakdown Model (Typical Construction ERP standard weights)
  const budgetHeads = [
    { head: "Material Budget", share: 55, budgetAmount: (project?.projectBudget || 0) * 0.55, actualSpent: (project?.actualExpenditure || 0) * 0.55 },
    { head: "Labour & Wages", share: 25, budgetAmount: (project?.projectBudget || 0) * 0.25, actualSpent: (project?.actualExpenditure || 0) * 0.28 },
    { head: "Plant & Heavy Equipment", share: 10, budgetAmount: (project?.projectBudget || 0) * 0.10, actualSpent: (project?.actualExpenditure || 0) * 0.09 },
    { head: "Specialized Subcontractors", share: 6, budgetAmount: (project?.projectBudget || 0) * 0.06, actualSpent: (project?.actualExpenditure || 0) * 0.05 },
    { head: "Statutory & Contingency", share: 4, budgetAmount: (project?.projectBudget || 0) * 0.04, actualSpent: (project?.actualExpenditure || 0) * 0.03 }
  ];

  const totalBudget = project?.projectBudget || 0;
  const totalSpent = project?.actualExpenditure || 0;
  const overallVariance = totalBudget - totalSpent;
  const burnRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Project Budget & Cost Variance Control</h2>
          <p className="text-xs text-slate-400">Head-wise cost allocations, material/labour budgets, expenditure variance, and forecasted cost.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#181d25] px-3 py-1.5 rounded-xl border border-[#27303e]">
          <span className="text-xs text-slate-400 font-medium">Select Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent text-xs font-bold text-gold-400 focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#14181f] text-white">
                {p.id}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Level Budget Overview Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Approved Project Budget</span>
          <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(totalBudget)}</h3>
          <span className="text-xs text-gold-400 mt-1 inline-block">Contract Value: {formatCurrency(project?.contractValue)}</span>
        </div>

        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Actual Cumulative Spent</span>
          <h3 className="text-2xl font-bold text-rose-400 font-mono">{formatCurrency(totalSpent)}</h3>
          <span className="text-xs text-slate-400 mt-1 inline-block">{burnRate}% of sanctioned budget utilized</span>
        </div>

        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Budget Variance (Savings)</span>
          <h3 className={`text-2xl font-bold font-mono ${overallVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(overallVariance)}
          </h3>
          <span className="text-xs text-emerald-400 mt-1 inline-block">Under budget / Controlled</span>
        </div>

        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Projected Completion Cost</span>
          <h3 className="text-2xl font-bold text-sky-400 font-mono">
            {formatCurrency(totalBudget * 0.96)}
          </h3>
          <span className="text-xs text-slate-400 mt-1 inline-block">Forecasted 4% net cost savings</span>
        </div>
      </div>

      {/* Head-Wise Allocation Matrix */}
      <div className="bg-[#181d25] border border-[#27303e] rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
        <h3 className="text-base font-bold text-white font-heading">
          WBS Head-Wise Expenditure Breakdown & Threshold Limits
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#14181f] text-gold-400 border-b border-[#252c38]">
                <th className="p-3 font-semibold">Budget Category</th>
                <th className="p-3 text-center">Share (%)</th>
                <th className="p-3 text-right">Allocated Budget</th>
                <th className="p-3 text-right">Actual Incurred</th>
                <th className="p-3 text-right">Balance Available</th>
                <th className="p-3 text-center">Burn %</th>
                <th className="p-3 text-center">Variance Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222935]">
              {budgetHeads.map((item, idx) => {
                const balance = item.budgetAmount - item.actualSpent;
                const pct = ((item.actualSpent / item.budgetAmount) * 100).toFixed(1);
                const isOver = item.actualSpent > item.budgetAmount;

                return (
                  <tr key={idx} className="hover:bg-[#1a202c]">
                    <td className="p-3 font-bold text-white">{item.head}</td>
                    <td className="p-3 text-center text-gold-400 font-bold">{item.share}%</td>
                    <td className="p-3 text-right font-mono text-white">{formatCurrency(item.budgetAmount)}</td>
                    <td className="p-3 text-right font-mono text-rose-400 font-bold">{formatCurrency(item.actualSpent)}</td>
                    <td className={`p-3 text-right font-mono font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {formatCurrency(balance)}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-300">{pct}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOver ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isOver ? 'Exceeded Limit' : 'Within Budget'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
