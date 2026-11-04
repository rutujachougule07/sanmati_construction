// DataTable Component
import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../services/exportService';

export const DataTable = ({
  columns = [],
  data = [],
  searchKey = '',
  searchPlaceholder = 'Search records...',
  title = '',
  exportFileName = 'Export',
  actions = null,
  emptyMessage = 'No records found'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      if (Array.isArray(searchKey) && searchKey.length > 0) {
        return searchKey.some(key => item[key] && String(item[key]).toLowerCase().includes(term));
      }
      if (typeof searchKey === 'string' && searchKey && item[searchKey]) {
        return String(item[searchKey]).toLowerCase().includes(term);
      }
      return Object.values(item).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredData, sortConfig]);

  // Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatExportData = (rows) => {
    if (!rows || rows.length === 0) return [];
    return rows.map((row) => {
      const obj = {};
      columns.forEach(col => {
        if (col.key === 'actions') return;
        const header = col.header || col.key;
        if (col.key === 'inward') {
          obj[header] = row.inward > 0 ? Number(row.inward) : 0;
        } else if (col.key === 'outward') {
          obj[header] = row.outward > 0 ? Number(row.outward) : 0;
        } else if (col.key === 'date') {
          obj[header] = row.date || '';
        } else if (col.key === 'party') {
          obj['Party Name'] = row.party || row.customerName || row.vendorName || '';
          obj['Category'] = row.category || '';
        } else {
          obj[header] = row[col.key] !== undefined ? row[col.key] : '';
        }
      });
      return Object.keys(obj).length > 0 ? obj : row;
    });
  };

  const handleExportExcel = () => {
    const exportList = formatExportData(filteredData.length > 0 ? filteredData : data);
    exportToExcel(exportList, exportFileName);
  };

  const handleExportCSV = () => {
    const exportList = formatExportData(filteredData.length > 0 ? filteredData : data);
    exportToCSV(exportList, exportFileName);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
      {/* Table Header Bar */}
      <div className="p-3.5 border-b border-slate-200/90 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        {title ? (
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 font-heading">{title}</h4>
            <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200/80">
              {data.length} records
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <span>Total:</span>
            <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md border border-red-200/80 text-xs">
              {filteredData.length} records
            </span>
            {filteredData.length !== data.length && (
              <span className="text-[11px] text-slate-400">
                (filtered from {data.length})
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400 focus:bg-white transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportExcel}
              title="Export to Excel"
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs flex items-center gap-1 transition-colors font-semibold shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              title="Export to CSV"
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg text-xs flex items-center gap-1 transition-colors font-semibold shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>

          {/* Custom Action (e.g. Add Button) */}
          {actions}
        </div>
      </div>

      {/* Table Viewport with Clean Slate Header & Unified Styling */}
      <div 
        className="overflow-x-auto w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/90 text-slate-700">
              {columns.map((col) => {
                return (
                  <th
                    key={col.key || col.header}
                    className={`px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider select-none border-b border-slate-200/90 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.headerClassName || ''}`}
                    style={{
                      textAlign: col.align || 'left',
                      ...(col.width ? { width: col.width } : {})
                    }}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right'
                          ? 'ml-auto justify-end'
                          : col.align === 'center'
                          ? 'mx-auto justify-center'
                          : 'mr-auto justify-start'
                      }`}
                      style={{
                        display: 'inline-flex',
                        ...(col.align === 'right' ? { marginLeft: 'auto', textAlign: 'right' } : {}),
                        ...(col.align === 'center' ? { margin: '0 auto', textAlign: 'center' } : {}),
                        ...(col.align === 'left' || !col.align ? { marginRight: 'auto', textAlign: 'left' } : {})
                      }}
                    >
                      <span className="text-slate-600 font-bold tracking-wider uppercase whitespace-nowrap text-[10px]">
                        {col.header}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.header}
                      className={`px-3 py-2 text-xs text-slate-700 align-middle ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.cellClassName || ''}`}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-xs text-slate-400">
                  <p className="font-medium text-slate-500 mb-1">{emptyMessage}</p>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-red-600 hover:underline text-xs font-semibold"
                    >
                      Clear search filter
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Screenshot Exact Pagination Footer */}
      <div className="px-3.5 py-2.5 border-t border-slate-200/90 flex flex-wrap items-center justify-between text-xs text-slate-600 bg-white gap-3">
        <div className="flex items-center gap-2">
          <span>
            {sortedData.length === 0 ? (
              <span>Showing <span className="font-semibold text-slate-900">0 of 0 records</span></span>
            ) : (
              <span>
                Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
                <span className="font-semibold text-slate-900">{sortedData.length}</span> records
              </span>
            )}
          </span>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-500">Per page: {pageSize}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium mr-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
