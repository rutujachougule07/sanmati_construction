// Reusable DatePicker Component - Day-Month-Year (DD-MM-YYYY) Strict Display
import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

export const DatePicker = ({ value, onChange, className = '', min, max }) => {
  const hiddenInputRef = useRef(null);

  // Convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDisplay = (isoStr) => {
    if (!isoStr) return '';
    const parts = String(isoStr).split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    }
    return isoStr;
  };

  const handleOpenPicker = () => {
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === 'function') {
        hiddenInputRef.current.showPicker();
      } else {
        hiddenInputRef.current.focus();
      }
    }
  };

  return (
    <div 
      onClick={handleOpenPicker}
      className={`relative inline-flex items-center border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-slate-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all shadow-2xs ${className}`}
      title="Click to select date (Day-Month-Year)"
    >
      <input
        type="text"
        readOnly
        value={formatDisplay(value)}
        placeholder="DD-MM-YYYY"
        className="w-24 text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer tracking-wider select-none"
      />
      <Calendar className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors ml-1 flex-shrink-0" />
      
      {/* Hidden native date input for opening the calendar dialog */}
      <input
        ref={hiddenInputRef}
        type="date"
        lang="en-IN"
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full cursor-pointer"
        tabIndex={-1}
      />
    </div>
  );
};
