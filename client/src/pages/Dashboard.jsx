// SANMATI CONSTRUCTIONS ERP - Business Intelligence Dashboard
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  HardHat,
  CheckCircle2,
  Database,
  BarChart3,
  Calendar,
  ChevronDown,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  ArrowRight,
  Zap,
  ArrowLeftRight,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useERPData } from '../context/ERPDataContext';
import { useAuth } from '../context/AuthContext';
import {
  buildPeriodPresets,
  computeDashboardAnalytics,
  formatCompactINR,
  getCustomRangeLabel
} from '../utils/dashboardAnalytics';
import dashboardHeroBanner from '../assets/dashboard-hero-banner.jpg';

const KPI_CARD_STYLES = {
  blue: {
    iconWrap: 'bg-[#eef4ff] border-[#dce8ff] text-[#0b449b]',
    waveFill: '#dbeafe',
    withSkyline: true
  },
  amber: {
    iconWrap: 'bg-[#fef7e6] border-[#fae5b0] text-[#b47b14]',
    waveFill: '#fef0c7',
    withSkyline: false
  },
  indigo: {
    iconWrap: 'bg-[#f3efff] border-[#e4dcff] text-[#2b1b6d]',
    waveFill: '#ede9fe',
    withSkyline: false
  },
  sky: {
    iconWrap: 'bg-[#e9f5fe] border-[#cce6fc] text-[#0b449b]',
    waveFill: '#e0f2fe',
    withSkyline: false
  },
  emerald: {
    iconWrap: 'bg-[#e8f8f1] border-[#c8eedd] text-[#047857]',
    waveFill: '#d1fae5',
    withSkyline: false
  }
};

const KPICard = ({ label, value, trend, trendDirection = 'up', icon: Icon, tone }) => {
  const style = KPI_CARD_STYLES[tone] || KPI_CARD_STYLES.blue;
  const trendColorClass =
    trendDirection === 'down'
      ? 'text-rose-600'
      : trendDirection === 'flat'
        ? 'text-slate-500'
        : 'text-[#15803d]';
  const trendPrefix = trendDirection === 'up' ? '↑ ' : trendDirection === 'down' ? '↓ ' : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-slate-300/90 transition-all px-3.5 py-3.5 relative overflow-hidden flex items-center gap-3 min-w-0">
      {/* Subtle bottom-right decorative wave */}
      <svg
        aria-hidden="true"
        viewBox="0 0 180 70"
        className="absolute bottom-0 right-0 w-24 h-11 pointer-events-none opacity-65 block"
        preserveAspectRatio="none"
      >
        <path
          d="M15 70 C55 45, 95 62, 130 35 C150 20, 168 25, 180 12 L180 70 Z"
          fill={style.waveFill}
        />
        {style.withSkyline && (
          <g fill="#cbd5e1" opacity="0.45">
            <rect x="115" y="28" width="12" height="42" rx="1" />
            <rect x="131" y="18" width="14" height="52" rx="1" />
            <rect x="149" y="24" width="11" height="46" rx="1" />
            <rect x="163" y="34" width="10" height="36" rx="1" />
          </g>
        )}
      </svg>

      {/* Left Icon Badge */}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 relative z-10 ${style.iconWrap}`}>
        <Icon className="w-5 h-5 stroke-[1.8]" />
      </div>

      {/* Right Content */}
      <div className="min-w-0 relative z-10 flex-1">
        <p className="text-[11px] font-semibold text-slate-600 truncate">{label}</p>
        <div className="text-lg sm:text-[19px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5 whitespace-nowrap">
          {value}
        </div>
        <p className={`text-[10.5px] font-semibold mt-0.5 truncate ${trendColorClass}`}>
          {trendPrefix}{trend}
        </p>
      </div>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderProjectStatusLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
  if (payload?.isEmpty || !percent || percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.54;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const formatYAxisTick = (val, unit) => {
  if (val === 0) return '₹ 0';
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  const formatted = Number.isInteger(abs) ? String(abs) : Number(abs.toFixed(1));
  return unit ? `${sign}₹ ${formatted} ${unit}` : `${sign}₹ ${Math.round(abs).toLocaleString('en-IN')}`;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const erpData = useERPData();

  const periodPresets = useMemo(() => buildPeriodPresets(), []);
  const [selectedPeriodId, setSelectedPeriodId] = useState(periodPresets[0].id);
  const [customStart, setCustomStart] = useState(periodPresets[0].start);
  const [customEnd, setCustomEnd] = useState(periodPresets[4].end);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const periodWrapperRef = useRef(null);

  const activePreset = useMemo(() => {
    const found = periodPresets.find((p) => p.id === selectedPeriodId) || periodPresets[0];
    if (found.id === 'custom') {
      const normalizedStart = customStart && customEnd && customStart > customEnd ? customEnd : customStart;
      const normalizedEnd = customStart && customEnd && customStart > customEnd ? customStart : customEnd;
      return {
        ...found,
        start: normalizedStart || null,
        end: normalizedEnd || null,
        label: getCustomRangeLabel(normalizedStart, normalizedEnd)
      };
    }
    return found;
  }, [periodPresets, selectedPeriodId, customStart, customEnd]);

  const analytics = useMemo(
    () => computeDashboardAnalytics(erpData, activePreset),
    [
      erpData.projects,
      erpData.incomeRecords,
      erpData.expenseRecords,
      erpData.expenses,
      erpData.raBills,
      erpData.paymentTracking,
      erpData.vendorPayments,
      erpData.ledgerEntries,
      activePreset
    ]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (periodWrapperRef.current && !periodWrapperRef.current.contains(event.target)) {
        setIsPeriodMenuOpen(false);
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsPeriodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const { kpis, monthlySeries, revenueBreakdown, projectRows, projectStatus } = analytics;
  const visibleProjectRows = projectRows.slice(0, 6);
  const welcomeName = (currentUser?.name || 'Admin').trim();

  const kpiCards = [
    {
      label: 'Total Projects',
      value: kpis.totalProjects,
      trend: kpis.deltas.totalProjects.text,
      trendDirection: kpis.deltas.totalProjects.direction,
      icon: Building2,
      tone: 'blue'
    },
    {
      label: 'Ongoing Projects',
      value: kpis.ongoingProjects,
      trend: kpis.deltas.ongoingProjects.text,
      trendDirection: kpis.deltas.ongoingProjects.direction,
      icon: HardHat,
      tone: 'amber'
    },
    {
      label: 'Completed Projects',
      value: kpis.completedProjects,
      trend: kpis.deltas.completedProjects.text,
      trendDirection: kpis.deltas.completedProjects.direction,
      icon: CheckCircle2,
      tone: 'indigo'
    },
    {
      label: 'Total Revenue',
      value: kpis.totalRevenue,
      trend: kpis.deltas.totalRevenue.text,
      trendDirection: kpis.deltas.totalRevenue.direction,
      icon: Database,
      tone: 'sky'
    },
    {
      label: 'Net Profit',
      value: kpis.netProfit,
      trend: kpis.deltas.netProfit.text,
      trendDirection: kpis.deltas.netProfit.direction,
      icon: BarChart3,
      tone: 'emerald'
    }
  ];

  const financialSummaryRows = [
    {
      label: 'Total Revenue',
      value: kpis.totalRevenue,
      icon: Database,
      highlighted: false
    },
    {
      label: 'Total Expenses',
      value: kpis.totalExpenses,
      icon: Wallet,
      highlighted: false
    },
    {
      label: 'Net Profit',
      value: kpis.netProfit,
      icon: kpis.netProfitRaw < 0 ? TrendingDown : TrendingUp,
      highlighted: true,
      isNegative: kpis.netProfitRaw < 0
    },
    {
      label: 'Profit Margin',
      value: kpis.profitMargin,
      icon: PieChartIcon,
      highlighted: false
    },
    {
      label: 'Outstanding Receivable',
      value: kpis.receivable,
      icon: ArrowDownToLine,
      highlighted: false
    },
    {
      label: 'Outstanding Payable',
      value: kpis.payable,
      icon: ArrowUpFromLine,
      highlighted: false
    }
  ];

  const quickActions = [
    {
      label: 'Add New Project',
      onClick: () => navigate('/projects?tab=creation'),
      renderIcon: () => (
        <div className="relative inline-flex items-center justify-center text-[#0b449b]">
          <Building2 className="w-7 h-7 stroke-[1.7]" />
          <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#0b449b] text-white flex items-center justify-center">
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        </div>
      )
    },
    {
      label: 'Create Report',
      onClick: () => navigate('/reports?tab=custom'),
      renderIcon: () => <FileText className="w-7 h-7 text-[#c85a17] stroke-[1.7]" />
    },
    {
      label: 'Sync with Tally',
      onClick: () => navigate('/tally?tab=integration'),
      renderIcon: () => <ArrowLeftRight className="w-7 h-7 text-[#0b449b] stroke-[1.8]" />
    },
    {
      label: 'View Analytics',
      onClick: () => navigate('/bi'),
      renderIcon: () => <BarChart3 className="w-7 h-7 text-[#c8941c] stroke-[1.8]" />
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {/* 1. Welcome & Business Intelligence Hero Banner */}
      <section className="relative rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {/* Background Artwork Layer (clipped cleanly to card radius) */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <img
            src={dashboardHeroBanner}
            alt=""
            aria-hidden="true"
            className="block absolute inset-y-0 right-0 w-full md:w-[68%] h-full object-cover object-center opacity-45 md:opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/45 md:via-white/95 md:via-40% md:to-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 px-5 sm:px-7 py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm sm:text-[15px] text-slate-700 font-medium">
              Welcome Back, <span className="font-bold text-slate-900">{welcomeName}!</span> 👋
            </p>
            <h1 className="text-2xl sm:text-[30px] font-extrabold tracking-tight leading-tight mt-0.5">
              <span className="text-[#0f172a]">Business Intelligence </span>
              <span className="text-[#c28e1e]">Dashboard</span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
              Real-time business performance, project insights and financial analysis
            </p>
          </div>

          {/* Date Range Filter Control */}
          <div className="relative self-start md:self-center shrink-0" ref={periodWrapperRef}>
            <button
              type="button"
              onClick={() => setIsPeriodMenuOpen((prev) => !prev)}
              aria-expanded={isPeriodMenuOpen}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white border border-slate-200/90 shadow-sm text-xs sm:text-[13px] font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#0b449b] shrink-0" />
              <span className="whitespace-nowrap">{activePreset.label}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPeriodMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 z-30">
                {periodPresets.map((option) => {
                  const isActive = option.id === selectedPeriodId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedPeriodId(option.id);
                        if (option.id !== 'custom') {
                          setIsPeriodMenuOpen(false);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#eef4ff] text-[#0b449b] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}

                {selectedPeriodId === 'custom' && (
                  <div className="mt-1.5 pt-2 px-2 pb-1.5 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">From</span>
                        <input
                          type="date"
                          value={customStart || ''}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="w-full px-2 py-1 text-[11px] font-medium text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:border-[#0b449b]"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">To</span>
                        <input
                          type="date"
                          value={customEnd || ''}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="w-full px-2 py-1 text-[11px] font-medium text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:border-[#0b449b]"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPeriodMenuOpen(false)}
                      className="w-full py-1.5 rounded-lg bg-[#0b449b] hover:bg-[#09367d] text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Apply Range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Top 5 KPI Summary Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <KPICard key={card.label} {...card} />
        ))}
      </section>

      {/* 3. Middle Analytics Row: Financial Performance | Revenue Breakdown | Key Financial Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[1.28fr_1.12fr_0.95fr] gap-4 sm:gap-5">
        {/* Card A: Financial Performance */}
        <div className="lg:col-span-12 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-[#0f294a] shrink-0">
                <BarChart3 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
                  Financial Performance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revenue, Expenses and Profit Trend
                </p>
              </div>
            </div>
            {!monthlySeries.hasTransactions && (
              <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                No entries yet
              </span>
            )}
          </div>

          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlySeries.chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={3}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                  dy={4}
                />
                <YAxis
                  domain={monthlySeries.yDomain}
                  ticks={monthlySeries.yTicks}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                  tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 500 }}
                  tickFormatter={(v) => formatYAxisTick(v, monthlySeries.unit)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(226, 232, 240, 0.35)' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
                  }}
                  formatter={(value, name, item) => {
                    const rawKey = `${item?.dataKey}Raw`;
                    const rawVal = item?.payload?.[rawKey];
                    return [
                      rawVal !== undefined ? formatCompactINR(rawVal) : formatCompactINR(value),
                      name
                    ];
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#0a4195"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#88baf5"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
                {monthlySeries.hasTransactions && (
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#d49b1a"
                    strokeWidth={2.2}
                    dot={{ r: 3.5, fill: '#d49b1a', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#d49b1a', stroke: '#ffffff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-2.5 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#0a4195]" />
              <span>Revenue</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#88baf5]" />
              <span>Expenses</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-flex items-center justify-center w-4 h-3">
                <span className="w-4 h-0.5 bg-[#d49b1a] rounded-full" />
                <span className="absolute w-2 h-2 rounded-full bg-[#d49b1a]" />
              </span>
              <span>Profit</span>
            </span>
          </div>
        </div>

        {/* Card B: Revenue Breakdown */}
        <div className="lg:col-span-6 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#0f294a] shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
              Revenue Breakdown
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-auto py-1">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-36 h-36 xl:w-40 xl:h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown.slices}
                    cx="50%"
                    cy="50%"
                    innerRadius={47}
                    outerRadius={69}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {revenueBreakdown.slices.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  {revenueBreakdown.hasData && (
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                      formatter={(val, _name, item) => [
                        `${formatCompactINR(item?.payload?.amount || 0)} (${val}%)`,
                        item?.payload?.name || 'Category'
                      ]}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[12px] font-extrabold text-slate-900 leading-tight whitespace-nowrap">
                  {kpis.totalRevenue}
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 mt-0.5">
                  Total Revenue
                </span>
              </div>
            </div>

            {/* Segment Legend */}
            <div className="w-full sm:flex-1 space-y-2.5 min-w-0">
              {revenueBreakdown.hasData ? (
                revenueBreakdown.legendItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700 font-medium truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">
                      {item.value}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center sm:text-left py-2">
                  <p className="text-xs font-semibold text-slate-500">No revenue categories yet</p>
                  <Link
                    to="/accounts"
                    className="inline-block text-[11px] font-bold text-[#1d5ec4] hover:underline mt-1"
                  >
                    Record Income →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card C: Key Financial Summary */}
        <div className="lg:col-span-6 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[#0f294a] shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
              Key Financial Summary
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {financialSummaryRows.map((row) => {
              const RowIcon = row.icon;
              if (row.highlighted) {
                return (
                  <div
                    key={row.label}
                    className={`my-1.5 px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 ${
                      row.isNegative
                        ? 'bg-gradient-to-r from-rose-50 to-rose-100/80'
                        : 'bg-gradient-to-r from-[#e5f9ed] to-[#d5f5e3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RowIcon className={`w-4 h-4 shrink-0 ${row.isNegative ? 'text-rose-600' : 'text-[#059669]'}`} />
                      <span className={`text-xs font-bold truncate ${row.isNegative ? 'text-rose-700' : 'text-[#047857]'}`}>
                        {row.label}
                      </span>
                    </div>
                    <span className={`text-xs sm:text-[13px] font-extrabold tabular-nums shrink-0 ${row.isNegative ? 'text-rose-700' : 'text-[#047857]'}`}>
                      {row.value}
                    </span>
                  </div>
                );
              }

              return (
                <div key={row.label} className="py-2.5 px-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RowIcon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {row.label}
                    </span>
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 tabular-nums shrink-0">
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Bottom Row: Project-Wise Analysis | Project Status | Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[2.4fr_1.05fr_0.95fr] gap-4 sm:gap-5">
        {/* Card A: Project-Wise Analysis Table */}
        <div className="lg:col-span-12 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-4 sm:p-5 min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <div className="flex items-start gap-2.5">
              <Layers className="w-5 h-5 text-[#0f294a] mt-0.5 shrink-0" />
              <div>
                <h2 id="project-analysis-heading" className="text-[15px] font-bold text-slate-900 leading-tight">
                  Project-Wise Analysis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Budget, expense and progress tracking
                  {projectRows.length > 0 && ` (${visibleProjectRows.length} of ${projectRows.length})`}
                </p>
              </div>
            </div>

            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1d5ec4] hover:text-[#0b449b] transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="project-analysis-heading"
            className="bi-table-wrapper rounded-xl border border-slate-200/70"
          >
            <table className="bi-analysis-table">
              <caption className="sr-only">
                Project-Wise Analysis: Budget, expense and progress tracking
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left w-10">#</th>
                  <th scope="col" className="text-left">Project Name</th>
                  <th scope="col" className="text-right">Total Budget</th>
                  <th scope="col" className="text-right">Expense</th>
                  <th scope="col" className="text-left">Progress</th>
                  <th scope="col" className="text-center">Status</th>
                </tr>
              </thead>
              {visibleProjectRows.length > 0 && (
                <tbody>
                  {visibleProjectRows.map((row) => {
                    const isCompleted = row.status === 'Completed';
                    const isOnHold = row.status === 'On Hold';
                    return (
                      <tr
                        key={row.id}
                        onClick={() => navigate('/projects')}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td data-label="#" className="font-medium text-slate-500 tabular-nums">
                          {row.rank}
                        </td>
                        <th scope="row" className="text-left font-semibold text-slate-800 whitespace-nowrap">
                          {row.name}
                        </th>
                        <td data-label="Total Budget" className="text-right font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                          {row.budget}
                        </td>
                        <td data-label="Expense" className="text-right font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                          {row.expense}
                        </td>
                        <td data-label="Progress" className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5 min-w-[76px]">
                            <div className="w-12 xl:w-14 h-2 rounded-full bg-slate-200/80 overflow-hidden shrink-0">
                              <div
                                className="h-full rounded-full bg-[#1a6ce3]"
                                style={{ width: `${row.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                              {row.progress}%
                            </span>
                          </div>
                        </td>
                        <td data-label="Status" className="text-center whitespace-nowrap">
                          <span
                            className={`bi-status-pill inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-semibold border ${
                              isCompleted
                                ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]'
                                : isOnHold
                                  ? 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]'
                                  : 'bg-[#e0edff] text-[#1d5ec4] border-[#c5dcff]'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>

            {visibleProjectRows.length === 0 && (
              <div className="py-8 px-4 text-center bg-white">
                <p className="text-xs sm:text-[13px] font-semibold text-slate-600">
                  No projects found for this period
                </p>
                <p className="text-[11.5px] text-slate-400 mt-1">
                  Create a construction project to track live budget, expenses, and progress here.
                </p>
                <Link
                  to="/projects?tab=creation"
                  className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-[#0b449b] hover:bg-[#09367d] text-white text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Card B: Project Status */}
        <div className="lg:col-span-6 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#0f294a] shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
              Project Status
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-auto py-2">
            {/* Donut with Inside Percentages */}
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatus.slices}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={66}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={renderProjectStatusLabel}
                    isAnimationActive={false}
                  >
                    {projectStatus.slices.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  {projectStatus.hasData && (
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}
                      formatter={(val, _name, item) => [`${val} Projects`, item?.payload?.name || 'Status']}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-lg font-extrabold text-slate-900 leading-none">
                  {kpis.totalProjects}
                </span>
                <span className="text-[10.5px] font-medium text-slate-500 mt-1">
                  Projects
                </span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="space-y-2.5 text-[11.5px] font-semibold text-slate-700 shrink-0">
              {projectStatus.legend.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card C: Quick Actions */}
        <div className="lg:col-span-6 xl:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-2 mb-3.5">
            <Zap className="w-5 h-5 text-[#c8941c] fill-[#eab308] shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="rounded-xl border border-slate-200/85 bg-gradient-to-b from-white to-slate-50/60 hover:from-white hover:to-[#eef4ff]/60 hover:border-[#93c5fd] hover:shadow-sm active:scale-[0.98] transition-all px-3 py-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
              >
                {action.renderIcon()}
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
