import React, { useState } from 'react';
import { Info, X, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner = () => {
  const { isDemoMode } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center justify-between transition-all">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-950 border border-amber-300 uppercase tracking-wider text-[10px]">
          <Info className="w-3 h-3" /> DEMO DATA MODE
        </span>
        <span className="hidden sm:inline text-amber-800">
          Showing calibrated synthetic atmospheric observations for Delhi NCR. Ready for direct CPCB, Copernicus ERA5, and NASA FIRMS API keys in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> CPCB NAQI Algorithm Active
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-100 transition-colors"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
