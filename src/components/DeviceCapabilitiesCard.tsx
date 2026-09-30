import React, { useEffect, useState } from 'react';
import { Smartphone, Bell, Share2, Compass, Radio, Check, X } from 'lucide-react';

export const DeviceCapabilitiesCard: React.FC = () => {
  const [canShare, setCanShare] = useState(false);
  const [notificationState, setNotificationState] = useState<string>('default');
  const [badgeSupported, setBadgeSupported] = useState(false);
  const [orientation, setOrientation] = useState<string>('Unknown');
  const [displayMode, setDisplayMode] = useState<string>('browser');

  useEffect(() => {
    // Share API
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);

    // Notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationState(Notification.permission);
    }

    // App Badging API
    setBadgeSupported(typeof navigator !== 'undefined' && 'setAppBadge' in navigator);

    // Orientation
    if (typeof window !== 'undefined' && window.screen?.orientation) {
      setOrientation(window.screen.orientation.type);
      const onOrientationChange = () => {
        setOrientation(window.screen.orientation.type);
      };
      window.screen.orientation.addEventListener('change', onOrientationChange);
      return () => {
        window.screen.orientation.removeEventListener('change', onOrientationChange);
      };
    }

    // Display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setDisplayMode(isStandalone ? 'standalone (Installed Window)' : 'browser (Tab / Preview)');
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setNotificationState(result);
      } catch {
        // Ignored
      }
    }
  };

  const testShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PWA Pro Suite',
          text: 'Checkout this installable PWA with 100% PWABuilder compliance!',
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    }
  };

  const testAppBadge = async () => {
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as unknown as { setAppBadge: (count: number) => Promise<void> }).setAppBadge(1);
        setTimeout(() => {
          (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge();
        }, 3000);
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div id="device-capabilities-card" className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-5 mb-6">
        <Smartphone className="w-5 h-5 text-indigo-400" />
        <div>
          <h2 className="text-lg font-bold text-white">Hardware & Native API Bridges</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PWA platform integration features, device context, and ambient APIs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Display Mode</span>
            <span className="font-semibold text-white">{displayMode}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Screen Orientation</span>
            <span className="font-semibold text-white">{orientation}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Resolution & Ratio</span>
            <span className="font-semibold text-white">
              {window.screen.width}x{window.screen.height} (@{window.devicePixelRatio}x)
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Touch Support</span>
            <span className="font-semibold text-white">
              {'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'Yes' : 'Mouse Only'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              Web Share Target
            </span>
            <span className="flex items-center gap-1 font-semibold text-xs">
              {canShare ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Supported
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> Unsupported
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              App Badging API
            </span>
            <span className="flex items-center gap-1 font-semibold text-xs">
              {badgeSupported ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Supported
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> Unsupported
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Bell className="w-3.5 h-3.5 text-purple-400" />
              Push Notifications
            </span>
            <span className="font-semibold text-xs uppercase text-slate-300">
              {notificationState}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Device Orientation / Motion
            </span>
            <span className="font-semibold text-xs text-emerald-400">Available</span>
          </div>
        </div>
      </div>

      {/* Interactive API buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {canShare && (
          <button
            onClick={testShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Native Share</span>
          </button>
        )}

        {notificationState !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span>Request Notification Permission</span>
          </button>
        )}

        {badgeSupported && (
          <button
            onClick={testAppBadge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Flash App Badge (3s)</span>
          </button>
        )}
      </div>
    </div>
  );
};
