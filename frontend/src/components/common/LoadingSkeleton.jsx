import React from 'react';

export const LoadingSkeleton = ({ lines = 4, height = 'h-32' }) => {
  return (
    <div className={`w-full bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse flex flex-col justify-between ${height}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
      <div className="h-4 bg-slate-100 rounded w-full"></div>
    </div>
  );
};
