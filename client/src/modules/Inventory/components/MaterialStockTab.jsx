import React, { useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Phone,
  Boxes
} from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export const MaterialStockTab = ({
  inventory,
  onOpenAddMaterial,
  onOpenEditMaterial,
  onDeleteMaterial
}) => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(inventory.map(i => i.category).filter(Boolean)));
    return ['ALL', ...unique];
  }, [inventory]);

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      const isLow = (Number(item.currentStock) || 0) <= (Number(item.minimumThreshold) || 0);
      if (statusFilter === 'LOW' && !isLow) return false;
      if (statusFilter === 'AVAILABLE' && isLow) return false;
      return true;
    });
  }, [inventory, categoryFilter, statusFilter]);

  const columns = [
    {
      key: 'id',
      header: 'Code',
      render: (row) => (
        <span className="font-mono font-bold text-[#002046] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {row.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Material & Category',
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="font-bold text-slate-900">{row.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
            <span>{row.category}</span>
            {row.location && (
              <span className="inline-flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-3 h-3" />
                {row.location}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'unit',
      header: 'Unit',
      align: 'center',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          {row.unit}
        </span>
      )
    },
    {
      key: 'openingStock',
      header: 'Opening Stock',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-600 font-medium">
          {Number(row.openingStock ?? row.currentStock ?? 0).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'currentStock',
      header: 'Available Stock',
      align: 'right',
      render: (row) => {
        const curr = Number(row.currentStock) || 0;
        const min = Number(row.minimumThreshold) || 0;
        const isLow = curr <= min;
        return (
          <span className={`font-mono font-extrabold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
            {curr.toLocaleString('en-IN')} {row.unit}
          </span>
        );
      }
    },
    {
      key: 'minimumThreshold',
      header: 'Min Level',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-600">
          {Number(row.minimumThreshold || 0).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'unitPrice',
      header: 'Rate / Unit',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-800">
          {formatCurrency(Number(row.unitPrice) || 0)}
        </span>
      )
    },
    {
      key: 'valuation',
      header: 'Stock Value',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#002046]">
          {formatCurrency((Number(row.currentStock) || 0) * (Number(row.unitPrice) || 0))}
        </span>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (row) => (
        <div className="min-w-[120px]">
          <p className="font-semibold text-slate-800 truncate">{row.supplierName || '—'}</p>
          {row.supplierPhone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-2.5 h-2.5" />
              {row.supplierPhone}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onOpenEditMaterial(row)}
            title="Edit Material"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {deleteConfirmId === row.id ? (
            <button
              type="button"
              onClick={() => {
                onDeleteMaterial(row.id);
                setDeleteConfirmId(null);
              }}
              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              Confirm
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmId(row.id)}
              title="Delete Material"
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (inventory.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-2xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#002046]/5 text-[#002046] flex items-center justify-center mb-4 border border-[#002046]/10">
          <Boxes className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">No Materials Added Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
          Start building your construction material catalog with opening stock, unit rates, minimum stock thresholds, and supplier details.
        </p>
        <button
          type="button"
          onClick={onOpenAddMaterial}
          className="mt-5 px-5 py-2.5 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Material</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#002046]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: `All (${inventory.length})` },
              {
                id: 'AVAILABLE',
                label: `Available Stock (${inventory.filter(i => (Number(i.currentStock) || 0) > (Number(i.minimumThreshold) || 0)).length})`
              },
              {
                id: 'LOW',
                label: `Low Stock (${inventory.filter(i => (Number(i.currentStock) || 0) <= (Number(i.minimumThreshold) || 0)).length})`
              }
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === pill.id
                    ? 'bg-[#002046] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddMaterial}
          className="px-4 py-2 bg-[#002046] hover:bg-[#001736] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Search by material name, code, category, supplier..."
        title="Material Stock Master"
        exportFileName="Sanmati_Material_Stock"
        emptyMessage="No materials match your active filters."
      />
    </div>
  );
};
