// StatCard Component - Exact Screenshot Match: Top Colored Stripe, Circular Icon Badge, and Bottom Status Pill
import React from 'react';
import * as Icons from 'lucide-react';

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  isPositive = true, 
  subtitle, 
  accent = 'blue',
  badgeText
}) => {
  const IconComponent = Icons[icon] || Icons.CircleDot;

  const accentStyles = {
    indigo: {
      stripe: 'border-t-4 border-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badge: 'text-indigo-700 bg-indigo-50/80 border-indigo-200/60'
    },
    emerald: {
      stripe: 'border-t-4 border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60'
    },
    amber: {
      stripe: 'border-t-4 border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badge: 'text-amber-700 bg-amber-50/80 border-amber-200/60'
    },
    purple: {
      stripe: 'border-t-4 border-purple-500',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badge: 'text-purple-700 bg-purple-50/80 border-purple-200/60'
    },
    blue: {
      stripe: 'border-t-4 border-[#1d68e4]',
      iconBg: 'bg-blue-50 text-[#1d68e4] border border-blue-100',
      badge: 'text-[#1d68e4] bg-blue-50/80 border-blue-200/60'
    },
    gold: {
      stripe: 'border-t-4 border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      badge: 'text-amber-700 bg-amber-50/80 border-amber-200/60'
    },
    copper: {
      stripe: 'border-t-4 border-orange-500',
      iconBg: 'bg-orange-50 text-orange-600 border border-orange-100',
      badge: 'text-orange-700 bg-orange-50/80 border-orange-200/60'
    }
  };

  const style = accentStyles[accent] || accentStyles.blue;
  const pillText = badgeText || (change ? `${isPositive ? '↑' : '↓'} ${change}` : null);

  return (
    <div className={`group bg-white rounded-2xl p-5 border border-slate-200/80 ${style.stripe} transition-all duration-200 shadow-2xs hover:shadow-md hover:border-slate-300 flex flex-col justify-between`}>
      {/* Top Row: Title + Circular Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      {/* Middle: Big Value */}
      <div className="my-2.5 sm:my-3 min-w-0">
        <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight truncate" title={String(value)}>
          {value}
        </h3>
      </div>

      {/* Bottom Row: Subtitle + Action/Pill Badge */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100/80 gap-2">
        <span className="text-slate-500 truncate text-[11px] font-normal">
          {subtitle || 'Updated live'}
        </span>
        {pillText && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${style.badge} flex-shrink-0`}>
            <span>→</span> {pillText}
          </span>
        )}
      </div>
    </div>
  );
};

