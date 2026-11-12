// SANMATI CONSTRUCTIONS ERP - Accessible Sortable & Paginated MIS Table Component
import React, { useMemo, useState, useId, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const collator = new Intl.Collator('en-IN', { numeric: true, sensitivity: 'base' });

const MISTable = ({
  title,
  subtitle = '',
  columns = [],
  rows = [],
  rowKey = 'id',
  emptyTitle = 'No matching ERP records found',
  emptyMessage = 'Try widening the date range, clearing filters, or logging entries in the linked ERP module.',
  showTotals = false,
  totalsLabel = 'Grand Total',
  defaultSortKey = '',
  defaultSortDir = 'desc',
  initialPageSize = 10,
  rowClassName = null,
  headerRight = null
}) => {
  const headingId = useId();
  const pageSizeSelectId = useId();

  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;

    return [...rows].sort((a, b) => {
      const va = col.sortValue ? col.sortValue(a) : a?.[col.key];
      const vb = col.sortValue ? col.sortValue(b) : b?.[col.key];

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = va === null || va === undefined ? '' : String(va);
      const sb = vb === null || vb === undefined ? '' : String(vb);
      const cmp = collator.compare(sa, sb);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return sortedRows.slice(startIdx, startIdx + pageSize);
  }, [sortedRows, page, pageSize]);

  const handleSortToggle = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const startRecord = sortedRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(sortedRows.length, page * pageSize);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table Top Header Bar */}
      {(title || sortedRows.length > 0) && (
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white">
          <div>
            {title && (
              <h3 id={headingId} className="text-sm font-bold text-[#002046]">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-500">
            {headerRight}
            <span className="font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              {sortedRows.length} {sortedRows.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
        </div>
      )}

      {/* Horizontally Scrollable Accessible Table Region */}
      {sortedRows.length === 0 ? (
        <div className="px-6 py-12 text-center bg-slate-50/50">
          <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Inbox className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{emptyMessage}</p>
        </div>
      ) : (
        <div
          role="region"
          aria-labelledby={title ? headingId : undefined}
          tabIndex={0}
          className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b449b]/40"
        >
          <table className="mis-table min-w-full text-left">
            {title && <caption className="sr-only">{title}</caption>}
            <thead>
              <tr>
                {columns.map((col) => {
                  const isSortable = col.sortable !== false;
                  const isActiveSort = sortKey === col.key;
                  const ariaSort = isSortable
                    ? isActiveSort
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined;

                  const alignClass =
                    col.align === 'right'
                      ? 'text-right justify-end'
                      : col.align === 'center'
                        ? 'text-center justify-center'
                        : 'text-left justify-start';

                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={ariaSort}
                      className={`${isSortable ? 'mis-sortable-th' : ''} ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.headerClassName || ''}`}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSortToggle(col.key)}
                          className={alignClass}
                        >
                          <span>{col.label}</span>
                          {isActiveSort ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#0b449b] shrink-0" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#0b449b] shrink-0" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pagedRows.map((row, idx) => {
                const key = typeof rowKey === 'function' ? rowKey(row, idx) : row?.[rowKey] || `${page}-${idx}`;
                const customCls = typeof rowClassName === 'function' ? rowClassName(row) : '';
                return (
                  <tr key={key} className={`hover:bg-slate-50/80 transition-colors ${customCls}`}>
                    {columns.map((col) => {
                      const align =
                        col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left';
                      const cellContent = col.render ? col.render(row, idx) : row?.[col.key] ?? '—';
                      return (
                        <td key={col.key} className={`${align} ${col.className || ''}`}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {showTotals && (
              <tfoot>
                <tr>
                  {columns.map((col, idx) => {
                    const align =
                      col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left';
                    let content = '';
                    if (col.totalRender) {
                      content = col.totalRender(sortedRows);
                    } else if (idx === 0) {
                      content = totalsLabel;
                    }
                    return (
                      <td key={col.key} className={align}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {sortedRows.length > 0 && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{startRecord}</strong>–<strong className="text-slate-900">{endRecord}</strong> of{' '}
              <strong className="text-slate-900">{sortedRows.length}</strong> entries
            </span>
            <div className="flex items-center gap-1.5">
              <label htmlFor={pageSizeSelectId} className="text-slate-500">
                Rows:
              </label>
              <select
                id={pageSizeSelectId}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-[#0b449b]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Prev
            </button>
            <span className="px-2.5 py-1 font-semibold text-[#002046]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MISTable;
