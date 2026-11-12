import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  FileText,
  Filter,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const StockRecordsTab = ({
  inventory,
  stockMovements,
  onOpenStockIn,
  onOpenStockOut,
  onViewVoucher,
  onDeleteMovement
}) => {
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, STOCK_IN, STOCK_OUT
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredMovements = useMemo(() => {
    return (stockMovements || []).filter(m => {
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      if (materialFilter !== 'ALL' && m.materialId !== materialFilter) return false;
      if (fromDate && m.date && m.date < fromDate) return false;
      if (toDate && m.date && m.date > toDate) return false;
      return true;
    });
  }, [stockMovements, typeFilter, materialFilter, fromDate, toDate]);

  const summary = useMemo(() => {
    return filteredMovements.reduce(
      (acc, m) => {
        if (m.type === 'STOCK_IN') {
          acc.inCount += 1;
          acc.inValue += Number(m.totalValue) || 0;
        } else {
          acc.outCount += 1;
          acc.outValue += Number(m.totalValue) || 0;
        }
        return acc;
      },
      { inCount: 0, inValue: 0, outCount: 0, outValue: 0 }
    );
  }, [filteredMovements]);

  const columns = [
    {
      key: 'date',
      header: 'Date & Ref No',
      minWidth: '115px',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 font-mono">{row.voucherNo || row.id}</p>
          <p className="text-[11px] text-slate-500">{formatDate(row.date)}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Entry Type',
      minWidth: '95px',
      render: (row) =>
        row.type === 'STOCK_IN' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <ArrowDownRight className="w-3 h-3" />
            Stock-In
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
            <ArrowUpRight className="w-3 h-3" />
            Stock-Out
          </span>
        )
    },
    {
      key: 'materialName',
      header: 'Material',
      minWidth: '135px',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.materialName}</p>
          <p className="text-[11px] text-slate-500">{row.materialId} • {row.category || 'Material'}</p>
        </div>
      )
    },
    {
      key: 'partyOrProject',
      header: 'Supplier / Project & Receiver',
      minWidth: '145px',
      render: (row) =>
        row.type === 'STOCK_IN' ? (
          <div>
            <p className="font-semibold text-slate-800">{row.supplierName || 'Direct Supplier'}</p>
            <p className="text-[11px] text-slate-500">Invoice: {row.invoiceNo || '—'}</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-slate-800">{row.projectName || 'General Dispatch'}</p>
            <p className="text-[11px] text-slate-500">Receiver: {row.issuedTo || '—'}</p>
          </div>
        )
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      minWidth: '80px',
      render: (row) => (
        <span className={`font-mono font-extrabold whitespace-nowrap ${row.type === 'STOCK_IN' ? 'text-emerald-700' : 'text-rose-600'}`}>
          {row.type === 'STOCK_IN' ? '+' : '-'}{Number(row.quantity).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'resultingStock',
      header: 'Balance',
      align: 'right',
      minWidth: '80px',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-700 whitespace-nowrap">
          {Number(row.resultingStock ?? 0).toLocaleString('en-IN')} {row.unit}
        </span>
      )
    },
    {
      key: 'totalValue',
      header: 'Rate & Amount',
      align: 'right',
      minWidth: '95px',
      render: (row) => (
        <div>
          <p className="font-mono font-bold text-[#002046]">{formatCurrency(Number(row.totalValue) || 0)}</p>
          <p className="text-[11px] text-slate-500 font-mono">@{formatCurrency(Number(row.rate) || 0)}/{row.unit}</p>
        </div>
      )
    },
    {
      key: 'details',
      header: 'GRN / Reason',
      minWidth: '125px',
      render: (row) => (
        <div className="max-w-[140px]">
          <p className="text-slate-600 truncate" title={row.type === 'STOCK_IN' ? row.grnDetails : row.reason}>
            {row.type === 'STOCK_IN' ? (row.grnDetails || '—') : (row.reason || '—')}
          </p>
          {row.type === 'STOCK_OUT' && (
            <button
              type="button"
              onClick={() => onViewVoucher(row)}
              className="mt-0.5 text-[11px] font-bold text-[#002046] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Voucher</span>
            </button>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      minWidth: '75px',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          {deleteConfirmId === row.id ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onDeleteMovement?.(row.id);
                  setDeleteConfirmId(null);
                }}
                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmId(row.id)}
              title="Delete Stock Record"
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  const resetFilters = () => {
    setTypeFilter('ALL');
    setMaterialFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `All Records (${(stockMovements || []).length})` },
              {
                id: 'STOCK_IN',
                label: `Stock-In / Received (${(stockMovements || []).filter(m => m.type === 'STOCK_IN').length})`
              },
              {
                id: 'STOCK_OUT',
                label: `Stock-Out / Dispatched (${(stockMovements || []).filter(m => m.type === 'STOCK_OUT').length})`
              }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  typeFilter === tab.id
                    ? 'bg-[#002046] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenStockIn('')}
              disabled={inventory.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Record Stock-In</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenStockOut('')}
              disabled={inventory.length === 0}
              className="px-3.5 py-2 rounded-xl bg-[#002046] hover:bg-[#001736] disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Record Stock-Out</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Material</label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#002046]"
            >
              <option value="ALL">All Materials</option>
              {inventory.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#002046]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#002046]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtered Stock-In Entries</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{summary.inCount} Entries</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Total Inward Value: {formatCurrency(summary.inValue)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtered Stock-Out Entries</p>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{summary.outCount} Entries</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Total Issued Value: {formatCurrency(summary.outValue)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Movement Volume</p>
          <p className="text-xl font-extrabold text-[#002046] mt-1">{filteredMovements.length} Records</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#002046]" />
            <span>Auto-synced to Material Balance</span>
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredMovements}
        searchKey="materialName"
        searchPlaceholder="Search movements by material, supplier, invoice, project..."
        title="Stock-In & Stock-Out Ledger"
        exportFileName="Sanmati_Stock_In_Out_Records"
        emptyMessage="No Stock-In or Stock-Out transactions recorded yet."
      />
    </div>
  );
};
