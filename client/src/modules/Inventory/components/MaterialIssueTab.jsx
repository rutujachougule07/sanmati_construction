import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Plus,
  Printer,
  Building2,
  UserCheck,
  Layers
} from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const MaterialIssueTab = ({
  inventory,
  projects,
  stockMovements,
  onOpenStockOut,
  onViewVoucher
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [subView, setSubView] = useState('vouchers'); // vouchers | usage

  const issueMovements = useMemo(() => {
    return (stockMovements || [])
      .filter(m => m.type === 'STOCK_OUT')
      .filter(m => {
        if (selectedProjectId === 'ALL') return true;
        return m.projectId === selectedProjectId || m.projectName === selectedProjectId;
      });
  }, [stockMovements, selectedProjectId]);

  // Project-wise Material Usage Summary (grouped by Project + Material)
  const projectUsageSummary = useMemo(() => {
    const map = {};
    issueMovements.forEach(m => {
      const pKey = m.projectId || m.projectName || 'General';
      const key = `${pKey}__${m.materialId}`;
      if (!map[key]) {
        map[key] = {
          id: key,
          projectId: m.projectId || '-',
          projectName: m.projectName || 'General Dispatch',
          materialId: m.materialId,
          materialName: m.materialName,
          category: m.category || 'Material',
          unit: m.unit,
          totalQuantity: 0,
          totalCost: 0,
          issueCount: 0,
          lastIssueDate: m.date,
          receivers: new Set()
        };
      }
      map[key].totalQuantity = Number((map[key].totalQuantity + (Number(m.quantity) || 0)).toFixed(3));
      map[key].totalCost = Number((map[key].totalCost + (Number(m.totalValue) || 0)).toFixed(2));
      map[key].issueCount += 1;
      if (m.date && m.date > map[key].lastIssueDate) {
        map[key].lastIssueDate = m.date;
      }
      if (m.issuedTo) map[key].receivers.add(m.issuedTo);
    });

    return Object.values(map).map(row => ({
      ...row,
      receiversList: Array.from(row.receivers).join(', ')
    }));
  }, [issueMovements]);

  const projectOptions = useMemo(() => {
    const opts = projects.map(p => ({ id: p.id, name: p.name }));
    const seenIds = new Set(opts.map(o => o.id));
    (stockMovements || [])
      .filter(m => m.type === 'STOCK_OUT' && m.projectName)
      .forEach(m => {
        const key = m.projectId || m.projectName;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          opts.push({ id: key, name: m.projectName });
        }
      });
    return opts;
  }, [projects, stockMovements]);

  const voucherColumns = [
    {
      key: 'voucherNo',
      header: 'Voucher No',
      render: (row) => (
        <span className="font-mono font-bold text-[#002046] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.voucherNo || row.id}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Issue Date',
      render: (row) => <span className="font-medium text-slate-700">{formatDate(row.date)}</span>
    },
    {
      key: 'projectName',
      header: 'Project Site',
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="font-bold text-slate-900">{row.projectName}</p>
          {row.projectId && <p className="text-[11px] text-slate-500 font-mono">{row.projectId}</p>}
        </div>
      )
    },
    {
      key: 'materialName',
      header: 'Material Issued',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.materialName}</p>
          <p className="text-[11px] text-slate-500">{row.materialId}</p>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Issued Qty',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-extrabold text-amber-700">
          {Number(row.quantity).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'totalValue',
      header: 'Cost Value',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#002046]">
          {formatCurrency(Number(row.totalValue) || 0)}
        </span>
      )
    },
    {
      key: 'issuedBy',
      header: 'Issued By / Received By',
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="text-slate-700">
            <span className="text-slate-400">By:</span> <span className="font-semibold">{row.issuedBy || 'Storekeeper'}</span>
          </p>
          <p className="text-slate-700">
            <span className="text-slate-400">To:</span> <span className="font-semibold text-[#002046]">{row.issuedTo || 'Site Engineer'}</span>
          </p>
        </div>
      )
    },
    {
      key: 'voucherAction',
      header: 'Issue Voucher',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={() => onViewVoucher(row)}
          className="px-2.5 py-1 rounded-lg bg-[#002046] hover:bg-[#001736] text-white font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Printer className="w-3 h-3" />
          <span>View / Print</span>
        </button>
      )
    }
  ];

  const usageColumns = [
    {
      key: 'projectName',
      header: 'Project',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.projectName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.projectId}</p>
        </div>
      )
    },
    {
      key: 'materialName',
      header: 'Material',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.materialName}</p>
          <p className="text-[11px] text-slate-500">{row.category}</p>
        </div>
      )
    },
    {
      key: 'totalQuantity',
      header: 'Total Issued Qty',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-extrabold text-[#002046]">
          {row.totalQuantity.toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'issueCount',
      header: 'Vouchers',
      align: 'center',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
          {row.issueCount}
        </span>
      )
    },
    {
      key: 'totalCost',
      header: 'Total Material Cost',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrency(row.totalCost)}
        </span>
      )
    },
    {
      key: 'receiversList',
      header: 'Site Receivers',
      render: (row) => (
        <span className="text-slate-600">{row.receiversList || '—'}</span>
      )
    },
    {
      key: 'lastIssueDate',
      header: 'Last Issued',
      render: (row) => <span className="text-slate-600 font-mono">{formatDate(row.lastIssueDate)}</span>
    }
  ];

  const totalIssuedCost = issueMovements.reduce((s, m) => s + (Number(m.totalValue) || 0), 0);
  const distinctProjectsCount = new Set(issueMovements.map(m => m.projectId || m.projectName).filter(Boolean)).size;

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSubView('vouchers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                subView === 'vouchers' ? 'bg-[#002046] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Material Issue Vouchers ({issueMovements.length})
            </button>
            <button
              type="button"
              onClick={() => setSubView('usage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                subView === 'usage' ? 'bg-[#002046] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Project-wise Usage Report ({projectUsageSummary.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#002046]"
            >
              <option value="ALL">All Projects</option>
              {projectOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenStockOut('')}
          disabled={inventory.length === 0}
          className="px-4 py-2 bg-[#002046] hover:bg-[#001736] disabled:opacity-40 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Material & Create Voucher</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002046]/10 text-[#002046] flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Vouchers</p>
            <p className="text-xl font-extrabold text-slate-900">{issueMovements.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects Supplied</p>
            <p className="text-xl font-extrabold text-slate-900">{distinctProjectsCount}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issued Material Cost</p>
            <p className="text-xl font-extrabold text-[#002046] font-mono">{formatCurrency(totalIssuedCost)}</p>
          </div>
        </div>
      </div>

      {subView === 'vouchers' ? (
        <DataTable
          columns={voucherColumns}
          data={issueMovements}
          searchKey="materialName"
          searchPlaceholder="Search vouchers by material, voucher no, receiver, project..."
          title="Material Issue Vouchers Register"
          exportFileName="Sanmati_Material_Issue_Vouchers"
          emptyMessage="No materials have been issued to projects yet. Click 'Issue Material & Create Voucher' to log an issue."
        />
      ) : (
        <DataTable
          columns={usageColumns}
          data={projectUsageSummary}
          searchKey="projectName"
          searchPlaceholder="Search usage report by project or material..."
          title="Project-wise Material Usage Report"
          exportFileName="Sanmati_Project_Material_Usage_Report"
          emptyMessage="No project-wise material usage recorded yet."
        />
      )}
    </div>
  );
};
