import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, HelpCircle } from 'lucide-react';

export const PWABuilderExplainerCard: React.FC = () => {
  return (
    <div
      id="pwabuilder-explainer-card"
      className="rounded-xl border border-blue-800/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Status Perbaikan & Hasil Audit PWABuilder</h3>
            <p className="text-xs text-slate-400">
              Penjelasan lengkap perbaikan error "stuck di working" dan pemenuhan standar PWABuilder.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Cause of earlier delay */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-amber-300">Penyebab Project Sempat "Stuck di Working" Ratusan Detik:</span>
              <p className="text-slate-300 leading-relaxed">
                Log sistem mendeteksi limitasi kuota server (<code>generic::resource_exhausted</code>) pada sesi sebelumnya saat memproses permintaan, sehingga request antre atau tertahan hingga ratusan detik. Masalah ini telah diatasi dan sistem sekarang berjalan normal dan cepat.
              </p>
            </div>
          </div>
        </div>

        {/* What was fixed for PWABuilder */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Komponen PWA yang Telah Diperbaiki & Dilengkapi:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Web App Manifest Lengkap</span>
                <p className="text-slate-400 mt-0.5">
                  Menyertakan <code>id</code>, <code>name</code>, <code>short_name (≤12 char)</code>, <code>start_url</code>, <code>scope</code>, <code>display: standalone</code>, <code>theme_color</code>, dan <code>background_color</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Ikon Standar & Maskable (Safe-Zone)</span>
                <p className="text-slate-400 mt-0.5">
                  Tersedia <code>pwa-192x192.png</code>, <code>pwa-512x512.png</code>, <code>pwa-maskable-512x512.png</code> (margin safe-zone 15%), serta <code>apple-touch-icon.png</code> (180px).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Tangkapan Layar (Screenshots)</span>
                <p className="text-slate-400 mt-0.5">
                  Disediakan screenshot <code>wide</code> (1280x720) untuk desktop dan <code>narrow</code> (720x1280) untuk mobile yang diwajibkan oleh PWABuilder untuk kemasan app store.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Service Worker & Caching Offline</span>
                <p className="text-slate-400 mt-0.5">
                  Service Worker aktif dengan Workbox precaching, penanganan <code>fetch</code> event, <code>skipWaiting</code>, <code>clientsClaim</code>, dan halaman fallback <code>offline.html</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Setelah build/deploy selesai, tes kembali link Reportcard Anda di PWABuilder.</span>
          </div>

          <a
            id="pwabuilder-retest-link"
            href="https://www.pwabuilder.com/reportcard?site=https://ais-pre-ntrd3mdvg26ya3rflww6ah-734293047314.asia-southeast1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Buka PWABuilder Reportcard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
