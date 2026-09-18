import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({ title = 'No Records Found', message = 'No observation records match the specified filters or station parameters.', action }) => {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
