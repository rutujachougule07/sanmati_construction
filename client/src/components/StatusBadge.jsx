// StatusBadge Component
import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStyle = (st) => {
    const s = String(st).toLowerCase();
    if (s.includes('active') || s.includes('approved') || s.includes('paid') || s.includes('verified') || s.includes('adequate') || s.includes('success') || s.includes('completed')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('progress') || s.includes('submitted') || s.includes('partially') || s.includes('evaluation') || s.includes('preparation')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('rejected') || s.includes('low stock') || s.includes('outside') || s.includes('inactive') || s.includes('unpaid') || s.includes('error')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
};
