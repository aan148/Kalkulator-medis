import React, { useState, useMemo } from 'react';
import { calculateInfusion } from '../utils/calculatorEngine';
import { DropFactorType, CalculationHistoryItem } from '../types';
import { DripMetronome } from './DripMetronome';
import { Clock, Activity, Calculator, Check, Copy, BookmarkPlus, HelpCircle } from 'lucide-react';

interface InfusionCalculatorCardProps {
  onSaveHistory?: (item: CalculationHistoryItem) => void;
}

export const InfusionCalculatorCard: React.FC<InfusionCalculatorCardProps> = ({ onSaveHistory }) => {
  const [volumeMlInput, setVolumeMlInput] = useState<string>('500');
  const [timeHoursInput, setTimeHoursInput] = useState<string>('8');
  const [timeMinutesInput, setTimeMinutesInput] = useState<string>('0');
  const [dropFactor, setDropFactor] = useState<DropFactorType>(20);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  const volumeMl = parseFloat(volumeMlInput) || 0;
  const timeHours = parseFloat(timeHoursInput) || 0;
  const timeMinutes = parseFloat(timeMinutesInput) || 0;

  const result = useMemo(() => {
    return calculateInfusion({
      volumeMl,
      timeHours,
      timeMinutes,
      dropFactor,
    });
  }, [volumeMl, timeHours, timeMinutes, dropFactor]);

  const handleCopy = () => {
    const text = `Kalkulasi Infus:
- Volume: ${volumeMl} mL
- Waktu: ${timeHours} jam ${timeMinutes > 0 ? `${timeMinutes} mnt` : ''}
- Faktor Tetes: ${dropFactor} gtt/mL
- Hasil: ${result.tpm} TPM (Tetes/Menit)
- Interval: 1 tetes setiap ${result.secondsPerDrop} detik
- Laju Alir: ${result.mlPerHour} cc/jam (${result.mlPerMinute} cc/menit)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onSaveHistory) return;
    const historyItem: CalculationHistoryItem = {
      id: 'infus-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'infus',
      title: `Infus ${volumeMl} mL / ${timeHours} Jam`,
      subtitle: `Faktor ${dropFactor} gtt/mL`,
      primaryResult: `${result.tpm} TPM`,
      secondaryResult: `Setiap ${result.secondsPerDrop} detik/tetes`,
      details: `${result.mlPerHour} cc/jam (${result.mlPerMinute} cc/menit)`,
    };
    onSaveHistory(historyItem);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Calculation Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Dosis & Tetesan Infus (TPM)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Menghitung Tetes Per Menit (TPM), interval detik per tetes, dan laju alir mL/jam.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
              title="Salin hasil"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            {onSaveHistory && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium transition"
                title="Simpan ke riwayat"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Volume Cairan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Volume Cairan Infus (mL / cc)
              </label>
              <span className="text-[10px] text-blue-400 font-medium">Edit Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-infusion-volume"
                type="text"
                inputMode="decimal"
                value={volumeMlInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setVolumeMlInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500 transition"
                placeholder="500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-500">mL</span>
            </div>

            {/* Quick volume buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '100 mL', val: '100' },
                { label: '250 mL', val: '250' },
                { label: '500 mL (1 Kolf)', val: '500' },
                { label: '1000 mL (2 Kolf)', val: '1000' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setVolumeMlInput(p.val)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition ${
                    volumeMlInput === p.val
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Waktu Pemberian */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu Pemberian Target</span>
              </label>
              <span className="text-[10px] text-blue-400 font-medium">Edit Manual</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  id="input-infusion-hours"
                  type="text"
                  inputMode="decimal"
                  value={timeHoursInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    if (/^[0-9]*\.?[0-9]*$/.test(val)) setTimeHoursInput(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500 transition"
                  placeholder="8"
                />
                <span className="absolute right-2.5 top-2.5 text-xs text-slate-500">Jam</span>
              </div>
              <div className="relative">
                <input
                  id="input-infusion-minutes"
                  type="text"
                  inputMode="decimal"
                  value={timeMinutesInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    if (/^[0-9]*\.?[0-9]*$/.test(val)) setTimeMinutesInput(val);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500 transition"
                  placeholder="0"
                />
                <span className="absolute right-2.5 top-2.5 text-xs text-slate-500">Mnt</span>
              </div>
            </div>

            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { h: '24', label: '24 Jam' },
                { h: '12', label: '12 Jam' },
                { h: '8', label: '8 Jam' },
                { h: '6', label: '6 Jam' },
                { h: '4', label: '4 Jam' },
                { h: '1', label: '1 Jam' },
              ].map((t) => (
                <button
                  key={t.h}
                  type="button"
                  onClick={() => {
                    setTimeHoursInput(t.h);
                    setTimeMinutesInput('0');
                  }}
                  className={`text-[11px] px-2 py-1 rounded-md border transition ${
                    timeHoursInput === t.h && timeMinutesInput === '0'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Faktor Tetes (Drop Factor) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Faktor Tetes Infus Set
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDropFactor(20)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  dropFactor === 20
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">20 gtt</span>
                <span className="text-[10px] text-slate-500">Makro Dewasa</span>
              </button>

              <button
                type="button"
                onClick={() => setDropFactor(15)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  dropFactor === 15
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">15 gtt</span>
                <span className="text-[10px] text-slate-500">Blood Set / Darah</span>
              </button>

              <button
                type="button"
                onClick={() => setDropFactor(60)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  dropFactor === 60
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">60 mgtt</span>
                <span className="text-[10px] text-slate-500">Mikro Anak</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              {dropFactor === 20 && 'Standar infus dewasa: 1 mL = 20 tetes.'}
              {dropFactor === 15 && 'Standar transfusi darah / blood administration: 1 mL = 15 tetes.'}
              {dropFactor === 60 && 'Pediatrik / Microdrip: 1 mL = 60 mikro-tetes (1 TPM = 1 mL/jam).'}
            </p>
          </div>
        </div>

        {/* Primary Results Display Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* TPM Card */}
          <div className="bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
              Kecepatan Tetesan
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {result.tpm}
              </span>
              <span className="text-sm font-semibold text-blue-400">TPM</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              (Tepatnya: {result.exactTpm} tetes/menit)
            </div>
          </div>

          {/* Detik Per Tetes Card */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Interval Per Tetes
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {result.secondsPerDrop}
              </span>
              <span className="text-sm font-semibold text-emerald-400">Detik</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              👉 1 tetes jatuh setiap <strong>{result.secondsPerDrop} detik</strong>
            </div>
          </div>

          {/* Laju cc/jam */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Laju Infus Pump
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.mlPerHour}
              </span>
              <span className="text-xs font-semibold text-slate-400">cc/jam (mL/jam)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Jika menggunakan Infusion Pump
            </div>
          </div>

          {/* Laju cc/menit */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Laju Per Menit
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.mlPerMinute}
              </span>
              <span className="text-xs font-semibold text-slate-400">cc/menit</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Total durasi: {result.totalDurationMinutes} menit
            </div>
          </div>
        </div>

        {/* Step-by-Step Formula Accordion */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Lihat Rumus & Cara Menghitung (Verifikasi Medis)</span>
          </button>

          {showFormulaDetails && (
            <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <div className="font-semibold text-blue-400">1. Rumus Tetes Per Menit (TPM):</div>
              <div className="p-2 bg-slate-900 rounded font-mono text-slate-200 border border-slate-800">
                TPM = (Volume Cairan [mL] × Faktor Tetes [gtt/mL]) ÷ Waktu [menit]
              </div>
              <div className="text-slate-400">
                Perhitungan: ({volumeMl} mL × {dropFactor} gtt) ÷ ({timeHours} × 60 + {timeMinutes} menit) ={' '}
                <strong className="text-white">{result.exactTpm}</strong> dibulatkan menjadi{' '}
                <strong className="text-blue-400">{result.tpm} TPM</strong>.
              </div>

              <div className="font-semibold text-emerald-400 pt-1">2. Rumus Interval Detik Per Tetes:</div>
              <div className="p-2 bg-slate-900 rounded font-mono text-slate-200 border border-slate-800">
                Interval (detik) = 60 detik ÷ TPM
              </div>
              <div className="text-slate-400">
                Perhitungan: 60 detik ÷ {result.exactTpm} ={' '}
                <strong className="text-emerald-400">{result.secondsPerDrop} detik per tetes</strong>.
                <br />
                <span className="text-[11px] text-slate-500 italic">
                  *Gunakan patokan ini saat melihat detik jam tangan: atur roller klem sampai tetesan jatuh tepat setiap {result.secondsPerDrop} detik.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Metronome & Tap-Tempo Card */}
      <DripMetronome secondsPerDrop={result.secondsPerDrop} tpm={result.tpm} />
    </div>
  );
};
