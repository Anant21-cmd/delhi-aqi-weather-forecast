import React from 'react';

export const getAQIColorConfig = (aqiOrCategory) => {
  let cat = '';
  if (typeof aqiOrCategory === 'number') {
    if (aqiOrCategory <= 50) cat = 'Good';
    else if (aqiOrCategory <= 100) cat = 'Satisfactory';
    else if (aqiOrCategory <= 200) cat = 'Moderate';
    else if (aqiOrCategory <= 300) cat = 'Poor';
    else if (aqiOrCategory <= 400) cat = 'Very Poor';
    else cat = 'Severe';
  } else {
    cat = aqiOrCategory || 'Moderate';
  }

  const normalized = cat.toLowerCase().replace(/[^a-z]/g, '');

  switch (normalized) {
    case 'good':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        solid: 'bg-emerald-600',
        pill: 'bg-emerald-500',
        label: 'Good (0-50)'
      };
    case 'satisfactory':
      return {
        bg: 'bg-lime-50',
        text: 'text-lime-700',
        border: 'border-lime-200',
        solid: 'bg-lime-600',
        pill: 'bg-lime-500',
        label: 'Satisfactory (51-100)'
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        solid: 'bg-amber-500',
        pill: 'bg-amber-500',
        label: 'Moderate (101-200)'
      };
    case 'poor':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        solid: 'bg-orange-500',
        pill: 'bg-orange-500',
        label: 'Poor (201-300)'
      };
    case 'verypoor':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        solid: 'bg-rose-600',
        pill: 'bg-rose-600',
        label: 'Very Poor (301-400)'
      };
    case 'severe':
    default:
      return {
        bg: 'bg-red-950/10',
        text: 'text-red-900',
        border: 'border-red-300',
        solid: 'bg-red-800',
        pill: 'bg-red-800',
        label: 'Severe (401-500+)'
      };
  }
};

export const AQIBadge = ({ aqi, category, size = 'md', showPill = true }) => {
  const config = getAQIColorConfig(category || aqi);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-semibold',
    xl: 'text-lg px-4 py-2 font-bold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      {showPill && <span className={`w-2 h-2 rounded-full ${config.pill} animate-pulse`} />}
      <span>{category || (typeof aqi === 'number' ? `AQI ${aqi}` : aqi)}</span>
    </span>
  );
};
