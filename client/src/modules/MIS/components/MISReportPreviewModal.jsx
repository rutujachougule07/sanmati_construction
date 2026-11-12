// SANMATI CONSTRUCTIONS ERP - Formal A4 MIS Report Sheet & Interactive Preview Modal
import React, { useEffect } from 'react';
import { X, FileText, FileSpreadsheet, Printer, Building2 } from 'lucide-react';
import { COMPANY_DETAILS } from '../../../utils/constants';

/**
 * Pure Printable & Previewable Formal A4 MIS Sheet matching PDF & Excel structure.
 */
export const MISPrintableSheet = ({
  reportConfig,
  orientation = 'auto',
  generatedBy = 'Administrator'
}) => {
  if (!reportConfig) return null;

  const {
    title = 'MIS Report',
    subtitle = '',
    periodLabel = 'All Time',
    projectLabel = 'All Projects',
    departmentLabel = 'All Departments',
    summaryCards = [],
    headers = [],
    displayRows = [],
    totalsRow = null,
    numericColumnIndices = [],
    notes = []
  } = reportConfig;

  const numSet = new Set(numericColumnIndices);
  const generatedTimestamp = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isLandscape =
    orientation === 'landscape' || (orientation === 'auto' && headers.length >= 7);

  return (
    <div
      className={`mis-printable-sheet bg-white text-slate-900 mx-auto border border-slate-200 shadow-sm ${
        isLandscape ? 'max-w-[1160px]' : 'max-w-[794px]'
      } p-5 sm:p-6`}
      style={{ fontFamily: "'Inter', 'Nirmala UI', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Corporate Header */}
      <div className="bg-[#002046] text-white rounded-t-lg px-5 py-4 border-b-4 border-amber-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-white uppercase">
              {COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS'}
            </h1>
            <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
              {COMPANY_DETAILS.address}
            </p>
            <p className="text-[10.5px] text-slate-300 mt-0.5">
              {[
                COMPANY_DETAILS.gstin ? `GSTIN: ${COMPANY_DETAILS.gstin}` : '',
                COMPANY_DETAILS.pan ? `PAN: ${COMPANY_DETAILS.pan}` : '',
                COMPANY_DETAILS.phone,
                COMPANY_DETAILS.email
              ]
                .filter(Boolean)
                .join('  |  ')}
            </p>
          </div>
        </div>

        <div className="bg-[#0b449b] px-3.5 py-2 rounded-md text-right shrink-0">
          <p className="text-[10px] font-bold tracking-wider uppercase text-blue-100">
            MIS Official Report
          </p>
          <p className="text-[11px] font-semibold text-white mt-0.5">{generatedTimestamp}</p>
        </div>
      </div>

      {/* Report Title & Filter Context */}
      <div className="mt-4 pb-3 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#002046]">{title}</h2>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Reporting Period</span>
            <span className="font-semibold text-slate-800">{periodLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Project Filter</span>
            <span className="font-semibold text-slate-800">{projectLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Department</span>
            <span className="font-semibold text-slate-800">{departmentLabel}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Prepared By</span>
            <span className="font-semibold text-slate-800">{generatedBy}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {summaryCards.length > 0 && (
        <div
          className={`mt-4 grid gap-2.5 mis-print-avoid-break ${
            summaryCards.length >= 5
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
              : summaryCards.length === 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-3'
          }`}
        >
          {summaryCards.slice(0, 6).map((card, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 truncate">
                {card.label}
              </p>
              <p className="text-sm font-bold text-[#002046] mt-0.5 tabular-nums">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full Report Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="mis-printable-table">
          <thead>
            <tr>
              {headers.map((hdr, idx) => (
                <th key={idx} scope="col" className={numSet.has(idx) ? 'text-right' : 'text-left'}>
                  {hdr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 1} className="text-center py-6 text-slate-500">
                  No ERP records matched the selected reporting filters.
                </td>
              </tr>
            ) : (
              displayRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={numSet.has(cIdx) ? 'text-right tabular-nums font-medium' : 'text-left'}
                    >
                      {cell ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {totalsRow && (
            <tfoot>
              <tr>
                {totalsRow.map((cell, idx) => (
                  <td key={idx} className={numSet.has(idx) ? 'text-right tabular-nums' : 'text-left'}>
                    {cell ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Notes & Authorized Signatories */}
      {notes.length > 0 && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md mis-print-avoid-break">
          <p className="text-[11px] font-bold text-[#002046] uppercase mb-1">
            Audit &amp; Accounting Compliance Notes
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
            {notes.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 mis-print-avoid-break">
        <div className="w-56">
          <div className="border-b border-slate-400 h-8 mb-1.5" />
          <p className="text-xs font-bold text-slate-800">Prepared &amp; Verified By</p>
          <p className="text-[11px] text-slate-500">{generatedBy} (Sanmati ERP MIS)</p>
        </div>

        <div className="w-60 sm:text-right">
          <p className="text-[11px] font-bold text-[#002046] mb-1">
            For {COMPANY_DETAILS.name || 'SANMATI CONSTRUCTIONS'}
          </p>
          <div className="border-b border-slate-400 h-7 mb-1.5" />
          <p className="text-xs font-bold text-slate-800">Authorized Signatory</p>
          <p className="text-[11px] text-slate-500">Management / Accounts Approval</p>
        </div>
      </div>

      <div className="mt-5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>{COMPANY_DETAILS.name} | Confidential MIS Report</span>
        <span>Rows Exported: {displayRows.length}</span>
      </div>
    </div>
  );
};

const MISReportPreviewModal = ({
  isOpen,
  onClose,
  reportConfig,
  orientation = 'auto',
  onOrientationChange,
  onDownloadPDF,
  onExportExcel,
  onPrint,
  generatedBy = 'Administrator'
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !reportConfig) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mis-preview-modal-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-7xl max-h-[92vh] bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Action Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#002046] text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <h2 id="mis-preview-modal-title" className="text-sm sm:text-base font-bold">
              Report Preview: {reportConfig.title}
            </h2>
            <p className="text-[11px] text-blue-200">
              {reportConfig.periodLabel} &bull; Matches PDF &amp; Excel Export
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              aria-label="Preview Page Layout"
              value={orientation}
              onChange={(e) => onOrientationChange?.(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0b449b] text-white text-xs font-medium border border-blue-400/40 focus:outline-none cursor-pointer"
            >
              <option value="auto">Auto A4 Layout</option>
              <option value="portrait">A4 Portrait</option>
              <option value="landscape">A4 Landscape</option>
            </select>

            <button
              type="button"
              onClick={onDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              Download PDF
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
              Export Excel
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#002046] hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Print Report
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Preview Modal"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <MISPrintableSheet
            reportConfig={reportConfig}
            orientation={orientation}
            generatedBy={generatedBy}
          />
        </div>
      </div>
    </div>
  );
};

export default MISReportPreviewModal;
