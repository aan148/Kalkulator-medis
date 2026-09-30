import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Trash2, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { StorageEstimateInfo } from '../types';

export const CacheManagerCard: React.FC = () => {
  const [cacheNames, setCacheNames] = useState<string[]>([]);
  const [selectedCache, setSelectedCache] = useState<string>('');
  const [cachedUrls, setCachedUrls] = useState<string[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageEstimateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState<string>('/icon.svg');
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadCaches = async () => {
    setLoading(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        setCacheNames(keys);
        if (keys.length > 0 && (!selectedCache || !keys.includes(selectedCache))) {
          setSelectedCache(keys[0]);
          await loadCacheEntries(keys[0]);
        } else if (selectedCache) {
          await loadCacheEntries(selectedCache);
        }
      }

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 1;
        setStorageInfo({
          usage,
          quota,
          percentage: Math.min(100, (usage / quota) * 100),
        });
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const loadCacheEntries = async (name: string) => {
    try {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      setCachedUrls(requests.map((r) => r.url));
    } catch {
      setCachedUrls([]);
    }
  };

  const clearSelectedCache = async () => {
    if (!selectedCache) return;
    try {
      await caches.delete(selectedCache);
      await loadCaches();
    } catch {
      // Ignored
    }
  };

  const testOfflineFetch = async () => {
    setTestResult('Testing offline cache fetch...');
    try {
      const start = performance.now();
      const res = await fetch(testUrl, { cache: 'force-cache' });
      const duration = (performance.now() - start).toFixed(1);
      if (res.ok) {
        setTestResult(`✓ Successfully retrieved "${testUrl}" from cache in ${duration}ms (Status: ${res.status})`);
      } else {
        setTestResult(`⚠ Cache response received with HTTP status ${res.status}`);
      }
    } catch (err) {
      setTestResult(`✗ Cache fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    loadCaches();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="cache-manager-card" className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Cache Storage & Offline Data</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Workbox precache instances and persistent client-side storage inspection.
          </p>
        </div>

        <button
          id="cache-refresh-btn"
          onClick={loadCaches}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Storage</span>
        </button>
      </div>

      {/* Storage Quota Bar */}
      {storageInfo && (
        <div className="mb-6 rounded-lg bg-slate-800/40 border border-slate-800 p-4">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              Storage Quota Used
            </span>
            <span className="text-slate-400">
              {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)} ({storageInfo.percentage.toFixed(2)}%)
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, storageInfo.percentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Cache buckets selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Active Cache Stores</label>
          <div className="space-y-1.5">
            {cacheNames.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-800/30 rounded-lg">
                No caches created yet. As assets are requested, they will populate here.
              </p>
            ) : (
              cacheNames.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedCache(name);
                    loadCacheEntries(name);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition truncate ${
                    selectedCache === name
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {name}
                </button>
              ))
            )}
          </div>

          {selectedCache && (
            <button
              onClick={clearSelectedCache}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition mt-3"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Selected Cache</span>
            </button>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Cached Assets in <span className="text-blue-400">{selectedCache || 'None'}</span> ({cachedUrls.length})
          </label>
          <div className="h-44 overflow-y-auto rounded-lg bg-slate-950/70 border border-slate-800 p-2 space-y-1">
            {cachedUrls.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No items recorded in this cache.
              </div>
            ) : (
              cachedUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-1.5 rounded text-[11px] text-slate-300 hover:bg-slate-800/50 font-mono truncate"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{url}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Offline fetch test */}
      <div className="rounded-lg bg-slate-800/30 border border-slate-800 p-4">
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          Test Offline Cache Retrieval
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="/pwa-192x192.png or /"
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={testOfflineFetch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            <span>Query Cache</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {testResult && (
          <p className="mt-2 text-xs text-slate-300 font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
            {testResult}
          </p>
        )}
      </div>
    </div>
  );
};
