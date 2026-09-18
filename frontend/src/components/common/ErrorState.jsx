import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Data Feed Interrupted', message, onRetry }) => {
  const displayMessage = typeof message === 'string'
    ? message
    : (message?.message || (typeof message === 'object' ? JSON.stringify(message) : 'Unable to retrieve real-time atmospheric stream from backend service. Please check network connectivity or refresh.'));

  return (
    <div className="bg-white rounded-xl p-8 border border-rose-200 shadow-sm text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {displayMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
