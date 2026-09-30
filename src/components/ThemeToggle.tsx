import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  onSetTheme: (theme: ThemeMode) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onSetTheme }) => {
  return (
    <div
      id="theme-mode-selector"
      className="flex items-center p-0.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-xs shadow-xs"
      role="group"
      aria-label="Pilihan mode tampilan (Light / Night)"
    >
      <button
        id="theme-light-btn"
        type="button"
        onClick={() => onSetTheme('light')}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg font-medium text-[11px] sm:text-xs transition-all ${
          theme === 'light'
            ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Beralih ke Mode Light (Terang)"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="inline">Light</span>
      </button>

      <button
        id="theme-night-btn"
        type="button"
        onClick={() => onSetTheme('dark')}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg font-medium text-[11px] sm:text-xs transition-all ${
          theme === 'dark'
            ? 'bg-indigo-600 text-white font-bold shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Beralih ke Mode Night (Malam / Gelap)"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="inline">Night</span>
      </button>
    </div>
  );
};
