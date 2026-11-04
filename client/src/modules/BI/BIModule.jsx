// MODULE 11: BUSINESS INTELLIGENCE
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, ArrowUpRight, DollarSign, Users, Building, ShieldCheck } from 'lucide-react';
import { useERPData } from '../../context/ERPDataContext';
import { StatCard } from '../../components/StatCard';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const BIModule = () => {
  const { projects, clients, vendors, raBills, expenses } = useERPData();

  // Financial aggregates
  const totalContract = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
  const totalBilled = projects.reduce((acc, p) => acc + (p.billedAmount || 0), 0);
  const totalCost = projects.reduce((acc, p) => acc + (p.actualExpenditure || 0), 0);
  const netProfit = projects.reduce((acc, p) => acc + (p.actualProfit || 0), 0);
  const profitMargin = totalBilled > 0 ? ((netProfit / totalBilled) * 100).toFixed(1) : 0;

  // Monthly Revenue Trend Data (in ₹ Lakhs)
  const monthlyTrends = [
    { month: 'May 2026', revenue: 35, expense: 26, profit: 9 },
    { month: 'Jun 2026', revenue: 48, expense: 36, profit: 12 },
    { month: 'Jul 2026', revenue: 62, expense: 48, profit: 14 },
    { month: 'Aug 2026', revenue: 75, expense: 56, profit: 19 },
    { month: 'Sep 2026', revenue: 88, expense: 65, profit: 23 },
    { month: 'Oct 2026', revenue: 105, expense: 78, profit: 27 },
    { month: 'Nov 2026 (Est)', revenue: 120, expense: 89, profit: 31 }
  ];

  // Client Revenue Share
  const clientDistribution = clients.map((c, i) => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + '...' : c.name,
    value: c.totalBilled / 100000,
    color: ['#d4af37', '#b87333', '#3b82f6', '#10b981'][i % 4]
  }));

  // Budget Variance Comparison
  const budgetVariance = projects.map(p => ({
    name: p.id,
    fullName: p.name,
    budget: (p.projectBudget || 0) / 100000,
    actual: (p.actualExpenditure || 0) / 100000,
    variance: ((p.projectBudget - p.actualExpenditure) || 0) / 100000
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Business Intelligence & Executive Analytics</h2>
        <p className="text-xs text-slate-400">High-level financial insights, margins, budget variances, and multi-site performance trends.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Overall Portfolio Value"
          value={formatCurrency(totalContract)}
          icon="Building"
          subtitle="3 Active Kolhapur Sites"
          accent="gold"
        />
        <StatCard
          title="Cumulative Invoiced"
          value={formatCurrency(totalBilled)}
          icon="DollarSign"
          change="34% of contract"
          isPositive={true}
          accent="emerald"
        />
        <StatCard
          title="Operating Expenses"
          value={formatCurrency(totalCost)}
          icon="TrendingUp"
          subtitle="Materials + Subcontractors"
          accent="copper"
        />
        <StatCard
          title="Net Booked Margin"
          value={`${profitMargin}% (${formatCurrency(netProfit)})`}
          icon="TrendingUp"
          change="Target 20%"
          isPositive={true}
          accent="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expenses Area Chart */}
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Monthly Cashflow Trends (₹ Lakhs)
              </h3>
              <p className="text-xs text-slate-400">Monthly gross billing vs operational expenses</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="copperGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b87333" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#b87333" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252d3a" />
                <XAxis dataKey="month" stroke="#8492a6" fontSize={11} tickLine={false} />
                <YAxis stroke="#8492a6" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#13161c', borderColor: '#2d3644', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`₹${val} Lakhs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Client Billing" stroke="#d4af37" fillOpacity={1} fill="url(#goldGradient)" />
                <Area type="monotone" dataKey="expense" name="Actual Cost" stroke="#b87333" fillOpacity={1} fill="url(#copperGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual Variance Chart */}
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-xl space-y-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading">
              Budget vs Actual Spend Variance (₹ Lakhs)
            </h3>
            <p className="text-xs text-slate-400">Tracking cost overruns or savings per project site</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVariance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252d3a" />
                <XAxis dataKey="name" stroke="#8492a6" fontSize={11} tickLine={false} />
                <YAxis stroke="#8492a6" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#13161c', borderColor: '#2d3644', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="budget" name="Approved Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Expenditure" fill="#b87333" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Client Revenue Concentration & Profit Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-white font-heading mb-1">
            Client Revenue Concentration
          </h3>
          <p className="text-xs text-slate-400 mb-4">Share of total billing across clients</p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {clientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#13161c', borderColor: '#2d3644', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {clientDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 truncate max-w-[170px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono text-white font-bold">₹{item.value.toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Margin Ranking */}
        <div className="md:col-span-2 bg-[#181d25] border border-[#27303e] rounded-xl p-5 shadow-xl">
          <h3 className="text-base font-bold text-white font-heading mb-1">
            Project Profitability Ranking
          </h3>
          <p className="text-xs text-slate-400 mb-4">Ranked by gross realized margin percentage</p>

          <div className="space-y-3">
            {projects.map((proj) => {
              const margin = proj.billedAmount > 0 ? ((proj.actualProfit / proj.billedAmount) * 100).toFixed(1) : 0;
              return (
                <div key={proj.id} className="p-3 bg-[#14181f] rounded-xl border border-[#252c38] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Billed: {formatCurrency(proj.billedAmount)} • Spent: {formatCurrency(proj.actualExpenditure)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      +{formatCurrency(proj.actualProfit)}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">
                      {margin}% Margin
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
