import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg bg-amber-500/90 text-slate-950 font-semibold px-3.5 py-2 text-xs md:text-sm shadow-xl backdrop-blur-xs border border-amber-400 animate-bounce"
    >
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Cached data and app shell active.</span>
    </div>
  );
};
