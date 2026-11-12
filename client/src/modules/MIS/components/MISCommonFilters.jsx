// SANMATI CONSTRUCTIONS ERP - Minimal Essential MIS Filter Bar
import React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';

const MISCommonFilters = ({
  filters,
  onFilterChange,
  onGenerate,
  onReset,
  projects = [],
  showProjectFilter = true,
  isGenerating = false,
  validationError = ''
}) => {
  return (
    <section
      aria-label="Report Filters"
      className="no-print bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-5 space-y-3"
    >
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-w-0">
          <div>
            <label
              htmlFor="mis-from-date"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              From Date
            </label>
            <input
              id="mis-from-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b449b]/25 focus:border-[#0b449b]"
            />
          </div>

          <div>
            <label
              htmlFor="mis-to-date"
              className="block text-xs font-semibold text-slate-600 mb-1"
            >
              To Date
            </label>
            <input
              id="mis-to-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b449b]/25 focus:border-[#0b449b]"
            />
          </div>

          {showProjectFilter && (
            <div className="sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="mis-project-select"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Project
              </label>
              <select
                id="mis-project-select"
                value={filters.projectId}
                onChange={(e) => onFilterChange({ projectId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b449b]/25 focus:border-[#0b449b]"
              >
                <option value="ALL">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.projectName || p.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 lg:flex-initial whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#002046] hover:bg-[#0b449b] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            Generate Report
          </button>

          <button
            type="button"
            onClick={onReset}
            className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
        >
          {validationError}
        </div>
      )}
    </section>
  );
};

export default MISCommonFilters;
