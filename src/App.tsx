import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useTheme } from './hooks/useTheme';
import { InfusionCalculatorCard } from './components/InfusionCalculatorCard';
import { SyringePumpMeqCard } from './components/SyringePumpMeqCard';
import { SyringePumpDrugCard } from './components/SyringePumpDrugCard';
import { FluidCompatibilityCard } from './components/FluidCompatibilityCard';
import { CalculationHistoryCard } from './components/CalculationHistoryCard';
import { PWADiagnosticsCard } from './components/PWADiagnosticsCard';
import { CacheManagerCard } from './components/CacheManagerCard';
import { DeviceCapabilitiesCard } from './components/DeviceCapabilitiesCard';
import { PWABuilderExplainerCard } from './components/PWABuilderExplainerCard';
import { PediatricInfusionCard } from './components/PediatricInfusionCard';
import { PediatricTransfusionCard } from './components/PediatricTransfusionCard';
import { FeedbackModal } from './components/FeedbackModal';
import { CalculationHistoryItem } from './types';
import {
  Droplets,
  Syringe,
  HeartPulse,
  FlaskConical,
  History,
  ShieldCheck,
  Smartphone,
  Database,
  Baby,
  Mail,
  Bug,
  MessageSquareHeart,
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'infus' | 'infus_anak' | 'transfusi_anak' | 'syringe_meq' | 'syringe_drug' | 'kompatibilitas' | 'riwayat' | 'pwa_tools'
  >('infus');

  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feedback'>('feedback');

  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pwa_med_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pwa_med_calc_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const handleSaveHistory = (item: CalculationHistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, 49)]); // max 50 items
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onSetTheme={setTheme}
        onOpenFeedback={(category) => {
          setFeedbackCategory(category || 'feedback');
          setIsFeedbackOpen(true);
        }}
      />
      <OfflineIndicator />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {/* Tab 1: Infus Dewasa TPM */}
            <button
              id="tab-infus-btn"
              onClick={() => setActiveTab('infus')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'infus'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Droplets className="w-4 h-4 text-blue-300" />
              <span>Infus Dewasa</span>
            </button>

            {/* Tab 2: Infus Anak (Pediatrik) */}
            <button
              id="tab-pediatric-infus-btn"
              onClick={() => setActiveTab('infus_anak')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'infus_anak'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Baby className="w-4 h-4 text-teal-300" />
              <span>Infus Anak (Pediatrik)</span>
            </button>

            {/* Tab 3: Transfusi Darah Anak */}
            <button
              id="tab-pediatric-transfusion-btn"
              onClick={() => setActiveTab('transfusi_anak')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'transfusi_anak'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Droplets className="w-4 h-4 text-red-400" />
              <span>Transfusi Anak</span>
            </button>

            {/* Tab 4: Syringe Pump mEq */}
            <button
              id="tab-syringe-meq-btn"
              onClick={() => setActiveTab('syringe_meq')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'syringe_meq'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Syringe className="w-4 h-4 text-indigo-300" />
              <span>Syringe Pump (mEq & Oplosan)</span>
            </button>

            {/* Tab 5: Syringe Pump Obat */}
            <button
              id="tab-syringe-drug-btn"
              onClick={() => setActiveTab('syringe_drug')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'syringe_drug'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-rose-300" />
              <span>Syringe Pump (Obat)</span>
            </button>

            {/* Tab 6: Kompatibilitas */}
            <button
              id="tab-compatibility-btn"
              onClick={() => setActiveTab('kompatibilitas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'kompatibilitas'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-cyan-300" />
              <span>Kompatibilitas</span>
            </button>

            {/* Tab 7: Riwayat */}
            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'riwayat'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>Riwayat</span>
              {history.length > 0 && (
                <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* Tab 8: PWA Diagnostics */}
            <button
              id="tab-pwa-tools-btn"
              onClick={() => setActiveTab('pwa_tools')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'pwa_tools'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>PWA Offline</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden xl:block">
            Presisi Medis • Siap Digunakan Tanpa Internet (Offline PWA)
          </span>
        </div>

        {/* Tab Content 1: Infusion Dewasa TPM */}
        {activeTab === 'infus' && (
          <InfusionCalculatorCard onSaveHistory={handleSaveHistory} />
        )}

        {/* Tab Content 2: Infus Anak (Pediatrik) */}
        {activeTab === 'infus_anak' && (
          <PediatricInfusionCard onSaveHistory={handleSaveHistory} />
        )}

        {/* Tab Content 3: Transfusi Darah Anak */}
        {activeTab === 'transfusi_anak' && (
          <PediatricTransfusionCard onSaveHistory={handleSaveHistory} />
        )}

        {/* Tab Content 4: Syringe Pump mEq */}
        {activeTab === 'syringe_meq' && (
          <SyringePumpMeqCard onSaveHistory={handleSaveHistory} />
        )}

        {/* Tab Content 5: Syringe Pump Obat & Inotropik */}
        {activeTab === 'syringe_drug' && (
          <SyringePumpDrugCard onSaveHistory={handleSaveHistory} />
        )}

        {/* Tab Content 4: Kompatibilitas Pelarut & Cairan */}
        {activeTab === 'kompatibilitas' && <FluidCompatibilityCard />}

        {/* Tab Content 5: Riwayat Perhitungan */}
        {activeTab === 'riwayat' && (
          <CalculationHistoryCard
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {/* Tab Content 6: PWA Diagnostics & Cache Manager */}
        {activeTab === 'pwa_tools' && (
          <div className="space-y-6">
            <PWABuilderExplainerCard />
            <PWADiagnosticsCard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CacheManagerCard />
              <DeviceCapabilitiesCard />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-400 font-medium">
              PWA Pro Suite • Kalkulator Medis Tetesan Infus & Syringe Pump
            </p>
            <p className="text-[11px] text-slate-600">
              Aplikasi PWA Medis Terverifikasi Offline Ready • Standar Klinis Akurat
            </p>
          </div>

          {/* Feedback & Bug Reporting Box */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              id="footer-feedback-btn"
              onClick={() => {
                setFeedbackCategory('feedback');
                setIsFeedbackOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium transition"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-blue-400" />
              <span>Kirim Feedback</span>
            </button>

            <button
              id="footer-bug-btn"
              onClick={() => {
                setFeedbackCategory('bug');
                setIsFeedbackOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 text-[11px] font-medium transition"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Lapor Bug</span>
            </button>

            <a
              id="footer-email-link"
              href="mailto:digikreva@gmail.com?subject=[PWA%20Pro%20Suite]%20Feedback%20/%20Laporan%20Bug"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border border-blue-500/20 text-[11px] font-medium transition"
              title="Kirim email ke digikreva@gmail.com"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>digikreva@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Dialog Feedback & Laporan Bug */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        defaultCategory={feedbackCategory}
      />
    </div>
  );
}
