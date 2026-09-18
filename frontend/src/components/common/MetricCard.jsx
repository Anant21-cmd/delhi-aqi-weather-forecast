import React from 'react';

export const MetricCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  subtitle,
  badge,
  badgeType = 'neutral',
  trend,
  className = ''
}) => {
  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200'
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        <span className="text-slate-500">{subtitle || 'Real-time observation'}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full border font-medium ${badgeStyles[badgeType] || badgeStyles.neutral}`}>
            {badge}
          </span>
        )}
        {trend && (
          <span className={`font-medium ${trend.type === 'up' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
