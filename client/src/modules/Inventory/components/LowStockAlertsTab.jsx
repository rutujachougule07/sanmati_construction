import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  ArrowDownRight,
  Phone,
  BellRing
} from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export const LowStockAlertsTab = ({
  inventory,
  approvals,
  onOpenPurchaseRequest,
  onOpenStockIn
}) => {
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => {
      const curr = Number(item.currentStock) || 0;
      const min = Number(item.minimumThreshold) || 0;
      return curr <= min;
    });
  }, [inventory]);

  const pendingPRByMaterialId = useMemo(() => {
    const map = {};
    (approvals || []).forEach(app => {
      if (
        (app.type === 'Material request' || app.type === 'Purchase order') &&
        app.materialId &&
        app.status !== 'Rejected'
      ) {
        if (!map[app.materialId]) map[app.materialId] = app;
      }
    });
    return map;
  }, [approvals]);

  const columns = [
    {
      key: 'id',
      header: 'Code',
      render: (row) => (
        <span className="font-mono font-bold text-[#002046] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Material Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500">{row.category} • {row.location || 'Central Warehouse'}</p>
        </div>
      )
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-extrabold text-rose-600">
          {Number(row.currentStock || 0).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'minimumThreshold',
      header: 'Min Required',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-700">
          {Number(row.minimumThreshold || 0).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'suggestedReorder',
      header: 'Suggested Reorder',
      align: 'right',
      render: (row) => {
        const curr = Number(row.currentStock) || 0;
        const min = Number(row.minimumThreshold) || 0;
        const reorder = Math.max(1, Math.ceil((min * 2) - curr));
        const estCost = reorder * (Number(row.unitPrice) || 0);
        return (
          <div>
            <p className="font-mono font-extrabold text-[#002046]">
              {reorder.toLocaleString('en-IN')} {row.unit}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">Est: {formatCurrency(estCost)}</p>
          </div>
        );
      }
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.supplierName || 'Not Assigned'}</p>
          {row.supplierPhone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" />
              {row.supplierPhone}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Alert Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (row) => {
        const existingPR = pendingPRByMaterialId[row.id];
        return (
          <div className="flex items-center justify-center gap-1.5">
            {existingPR ? (
              <span
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold"
                title={`Purchase Request ${existingPR.id} (${existingPR.status})`}
              >
                PR {existingPR.status} ({existingPR.id})
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onOpenPurchaseRequest(row)}
                className="px-2.5 py-1 rounded-lg bg-[#002046] hover:bg-[#001736] text-white font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Purchase Request</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenStockIn(row.id)}
              title="Restock Now (Stock-In)"
              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold inline-flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Restock</span>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 ? (
        <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-900">
                {lowStockItems.length} {lowStockItems.length === 1 ? 'Material' : 'Materials'} at or Below Minimum Stock Level
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Admin notifications are sent automatically whenever stock falls at or below Minimum Level. Raise a Purchase Request directly below to forward to Approvals & Purchase Management.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-900">
              {inventory.length === 0 ? 'No Materials Monitored Yet' : 'All Inventory Stock Levels Healthy'}
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              {inventory.length === 0
                ? 'Add materials in Material Stock Management with Minimum Stock Levels to enable automated low-stock alerts.'
                : 'Every material in your store is currently above its configured Minimum Stock Level.'}
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={lowStockItems}
        searchKey="name"
        searchPlaceholder="Search low-stock materials..."
        title="Low-Stock Alerts & Reorder Queue"
        exportFileName="Sanmati_Low_Stock_Alerts"
        emptyMessage="Zero low-stock items detected."
      />
    </div>
  );
};
