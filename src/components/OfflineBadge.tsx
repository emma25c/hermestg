import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
      isOnline 
        ? 'bg-slate-50 text-slate-700 border-slate-200' 
        : 'bg-amber-50 text-amber-900 border-amber-300'
    }`}>
      {isOnline ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>PWA Prête</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-amber-700" />
          <span>Hors-Ligne (0 data)</span>
        </>
      )}
    </div>
  );
};
