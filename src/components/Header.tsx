import React from 'react';
import { Layers, Wifi, WifiOff, MessageSquareHeart } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ThemeMode } from '../hooks/useTheme';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSetTheme: (theme: ThemeMode) => void;
  onOpenFeedback?: (category?: 'bug' | 'feedback') => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onSetTheme,
  onOpenFeedback,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md shadow-blue-900/30 border border-blue-500/30 flex items-center justify-center bg-slate-900 shrink-0">
            <img
              src="/icon.svg"
              alt="Logo Kalkulator Medis"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight">PWA Pro Suite</h1>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                Kalkulator Medis
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden md:block">
              Dosis Infus (TPM), Syringe Pump (mEq & cc/mnt), dan Cairan Campuran
            </p>
          </div>
        </div>

        {/* Right actions: Theme Choice (Light/Night), Feedback, Online indicator & Install */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
          {/* Pilihan Mode Light & Night */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} onSetTheme={onSetTheme} />

          {onOpenFeedback && (
            <button
              id="header-feedback-btn"
              onClick={() => onOpenFeedback('feedback')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition"
              title="Kirim saran atau laporkan bug ke digikreva@gmail.com"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Feedback</span>
            </button>
          )}

          <div
            id="network-status-badge"
            className={`hidden xs:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </>
            )}
          </div>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};


