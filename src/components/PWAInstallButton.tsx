import React, { useState } from 'react';
import { Download, CheckCircle2, Apple, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA
  if (isInstalled) {
    return (
      <div
        id="pwa-installed-badge"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Installed PWA</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        disabled={installing}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:bg-blue-700 transition disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>{installing ? 'Installing...' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs md:text-sm font-medium text-slate-200 hover:bg-slate-750 transition"
        >
          <Apple className="w-4 h-4" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div
            id="ios-install-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Apple className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Install on iPhone / iPad</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed space-y-2 mb-4">
                1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar at the bottom.<br />
                2. Scroll down and choose <strong className="text-white">Add to Home Screen</strong>.<br />
                3. Tap <strong className="text-white">Add</strong> in the top-right corner.
              </p>
              <button
                id="ios-modal-close-btn"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop browser where prompt isn't fired yet or browser menu install is available
  return (
    <div
      id="pwa-browser-ready-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 text-xs font-medium"
      title="Installable via browser address bar or menu"
    >
      <Monitor className="w-3.5 h-3.5 text-blue-400" />
      <span>Installable</span>
    </div>
  );
};
