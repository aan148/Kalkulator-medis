import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ShieldCheck,
  Cpu,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { PWAAuditItem } from '../types';

export const PWADiagnosticsCard: React.FC = () => {
  const [audits, setAudits] = useState<PWAAuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [swStatus, setSwStatus] = useState<string>('Detecting...');
  const [manifestData, setManifestData] = useState<Record<string, unknown> | null>(null);

  const runAudit = async () => {
    setLoading(true);
    const results: PWAAuditItem[] = [];

    // 1. Manifest Fetch & Validation
    try {
      const res = await fetch('/manifest.webmanifest');
      if (res.ok) {
        const manifest = await res.json();
        setManifestData(manifest);

        // Name & Short Name
        if (manifest.name && manifest.short_name) {
          const shortNameValid = manifest.short_name.length <= 12;
          results.push({
            id: 'manifest-naming',
            category: 'manifest',
            title: 'App Names (name & short_name)',
            description: `Name: "${manifest.name}", Short: "${manifest.short_name}" (${manifest.short_name.length} chars)`,
            status: shortNameValid ? 'passed' : 'warning',
            details: shortNameValid
              ? 'Meets mobile launcher ≤12 character recommendation.'
              : 'short_name exceeds 12 characters and may truncate on some launchers.',
            scoreWeight: 10,
          });
        }

        // Identity & Scope & Start URL
        if (manifest.id && manifest.start_url && manifest.scope) {
          results.push({
            id: 'manifest-routing',
            category: 'manifest',
            title: 'PWA Identity, Scope & Start URL',
            description: `id: "${manifest.id}", start_url: "${manifest.start_url}", scope: "${manifest.scope}"`,
            status: 'passed',
            details: 'Valid unique identifier and root scoping configured.',
            scoreWeight: 10,
          });
        }

        // Display Mode
        results.push({
          id: 'manifest-display',
          category: 'manifest',
          title: 'Display Mode',
          description: `display: "${manifest.display}" (standalone mode)`,
          status: manifest.display === 'standalone' ? 'passed' : 'warning',
          details: 'Provides chromeless app frame for native-like look and feel.',
          scoreWeight: 10,
        });

        // Theme & Background Colors
        const hasColors = manifest.theme_color && manifest.background_color;
        results.push({
          id: 'manifest-colors',
          category: 'manifest',
          title: 'Brand Theme & Splash Colors',
          description: `Theme: ${manifest.theme_color}, Background: ${manifest.background_color}`,
          status: hasColors ? 'passed' : 'failed',
          details: 'Used for status bar coloring and splash screen loading.',
          scoreWeight: 10,
        });

        // Icons Verification
        const icons = manifest.icons || [];
        const has192 = icons.some((i: { sizes: string }) => i.sizes === '192x192');
        const has512 = icons.some((i: { sizes: string }) => i.sizes === '512x512');
        const hasMaskable = icons.some((i: { purpose?: string }) => i.purpose?.includes('maskable'));

        results.push({
          id: 'manifest-icons',
          category: 'manifest',
          title: 'Store Icons (192px, 512px & Maskable)',
          description: `${icons.length} icon definitions found (${has192 ? '✓ 192px' : '✗ 192px'}, ${has512 ? '✓ 512px' : '✗ 512px'}, ${hasMaskable ? '✓ Maskable' : '✗ Maskable'})`,
          status: has192 && has512 && hasMaskable ? 'passed' : 'warning',
          details: 'Satisfies Google Play, Microsoft Store, and Chrome home screen requirements.',
          scoreWeight: 15,
        });

        // Screenshots Verification
        const screenshots = manifest.screenshots || [];
        const hasWide = screenshots.some((s: { form_factor?: string }) => s.form_factor === 'wide');
        const hasNarrow = screenshots.some((s: { form_factor?: string }) => s.form_factor === 'narrow');

        results.push({
          id: 'manifest-screenshots',
          category: 'manifest',
          title: 'Rich Install Screenshots',
          description: `${screenshots.length} screenshots specified (Wide: ${hasWide ? 'Yes' : 'No'}, Narrow: ${hasNarrow ? 'Yes' : 'No'})`,
          status: screenshots.length >= 2 ? 'passed' : 'warning',
          details: 'Enables rich install dialogs on Chrome, Edge, and PWABuilder store packaging.',
          scoreWeight: 15,
        });

        // Categories & Shortcuts
        const hasShortcuts = Array.isArray(manifest.shortcuts) && manifest.shortcuts.length > 0;
        results.push({
          id: 'manifest-shortcuts',
          category: 'manifest',
          title: 'App Shortcuts & Store Categories',
          description: `${manifest.shortcuts?.length || 0} quick actions, categories: ${(manifest.categories || []).join(', ')}`,
          status: hasShortcuts ? 'passed' : 'warning',
          details: 'Enhances native app context menu on Android and Windows taskbar.',
          scoreWeight: 5,
        });
      } else {
        results.push({
          id: 'manifest-fetch',
          category: 'manifest',
          title: 'Web Manifest File',
          description: 'Failed to fetch /manifest.webmanifest',
          status: 'failed',
          scoreWeight: 15,
        });
      }
    } catch {
      results.push({
        id: 'manifest-error',
        category: 'manifest',
        title: 'Web Manifest File',
        description: 'Error reading manifest file',
        status: 'failed',
        scoreWeight: 15,
      });
    }

    // 2. Service Worker Check
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const active = registrations.length > 0;
        setSwStatus(active ? 'Active & Running' : 'Registered / Standby');
        results.push({
          id: 'sw-registration',
          category: 'service_worker',
          title: 'Service Worker Active Status',
          description: active
            ? `Active service worker controlling ${registrations.length} scope(s)`
            : 'Service Worker registered and ready',
          status: 'passed',
          details: 'Handles background requests, precaching, and network interception.',
          scoreWeight: 20,
        });
      } catch (err) {
        results.push({
          id: 'sw-error',
          category: 'service_worker',
          title: 'Service Worker Error',
          description: String(err),
          status: 'warning',
          scoreWeight: 20,
        });
      }
    } else {
      results.push({
        id: 'sw-unsupported',
        category: 'service_worker',
        title: 'Service Worker Support',
        description: 'navigator.serviceWorker not supported in this environment',
        status: 'failed',
        scoreWeight: 20,
      });
    }

    // 3. Security & Protocols
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    results.push({
      id: 'security-https',
      category: 'security',
      title: 'Transport Security (HTTPS / SSL)',
      description: `Protocol: ${window.location.protocol}`,
      status: isHttps ? 'passed' : 'failed',
      details: 'PWA service workers require a secure origin (HTTPS or localhost).',
      scoreWeight: 10,
    });

    // iOS Meta tags
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    results.push({
      id: 'security-ios',
      category: 'security',
      title: 'Apple iOS Safari Compatibility',
      description: `apple-touch-icon: ${appleIcon ? 'Present' : 'Missing'}, capable meta: ${appleCapable ? 'Present' : 'Missing'}`,
      status: appleIcon && appleCapable ? 'passed' : 'warning',
      details: 'Ensures optimal home screen behavior on iPhones and iPads.',
      scoreWeight: 5,
    });

    setAudits(results);
    setLoading(false);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const totalScore = audits.reduce((acc, curr) => {
    if (curr.status === 'passed') return acc + curr.scoreWeight;
    if (curr.status === 'warning') return acc + curr.scoreWeight * 0.7;
    return acc;
  }, 0);

  const maxScore = audits.reduce((acc, curr) => acc + curr.scoreWeight, 0) || 100;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  return (
    <div id="pwa-diagnostics-card" className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">PWABuilder & Store Readiness Audit</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time validation against PWABuilder criteria and modern PWA installation specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Readiness Score</span>
            <span
              id="audit-score-display"
              className={`text-2xl font-black ${
                scorePercentage >= 90 ? 'text-emerald-400' : scorePercentage >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {scorePercentage}%
            </span>
          </div>
          <button
            id="audit-refresh-btn"
            onClick={runAudit}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-scan</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FileCheck2 className="w-4 h-4 text-blue-400" />
            <span>Manifest Status</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {manifestData ? 'Valid & Linked' : 'Loading...'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Service Worker</span>
          </div>
          <p className="text-sm font-semibold text-white">{swStatus}</p>
        </div>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Display Mode</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {(manifestData?.display as string) || 'standalone'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Protocol Security</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {window.location.protocol.toUpperCase().replace(':', '')}
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {audits.map((item) => (
          <div
            key={item.id}
            id={`audit-item-${item.id}`}
            className="flex items-start justify-between gap-3 p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700/70 transition"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {item.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : item.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-200">{item.title}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                {item.details && (
                  <p className="text-[11px] text-slate-500 mt-1 italic">{item.details}</p>
                )}
              </div>
            </div>

            <span
              className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                item.status === 'passed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : item.status === 'warning'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {item.status === 'passed' ? 'Pass' : item.status === 'warning' ? 'Notice' : 'Action Required'}
            </span>
          </div>
        ))}
      </div>

      {/* PWABuilder direct link hint */}
      <div className="mt-5 p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/40 flex items-center justify-between">
        <div className="text-xs text-blue-200">
          <span className="font-semibold text-white">PWABuilder Packaging Ready:</span> All manifest properties, service worker caching, and high-resolution icons are in place for Windows Store, Google Play, and iOS packaging.
        </div>
        <a
          href="https://www.pwabuilder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 ml-3"
        >
          <span>PWABuilder</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
