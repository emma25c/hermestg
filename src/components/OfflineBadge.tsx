import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
    <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
      isOnline 
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
        : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={13} /> En Ligne (Mode PWA Prêt)
        </>
      ) : (
        <>
          <WifiOff size={13} /> Mode Hors-Ligne (0 data)
        </>
      )}
    </div>
  );
};
