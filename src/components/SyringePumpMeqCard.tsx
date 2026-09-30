import React, { useState, useMemo } from 'react';
import { calculateSyringePumpMeq } from '../utils/calculatorEngine';
import { ELECTROLYTE_PRESETS } from '../data/drugPresets';
import { CalculationHistoryItem } from '../types';
import { Syringe, AlertTriangle, Check, Copy, BookmarkPlus, Info, FlaskConical } from 'lucide-react';

interface SyringePumpMeqCardProps {
  onSaveHistory?: (item: CalculationHistoryItem) => void;
}

export const SyringePumpMeqCard: React.FC<SyringePumpMeqCardProps> = ({ onSaveHistory }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('kcl_746');
  const [targetMeqInput, setTargetMeqInput] = useState<string>('25');
  const [sourceConcentrationInput, setSourceConcentrationInput] = useState<string>('1.0'); // 1 mEq/mL
  const [syringeVolumeInput, setSyringeVolumeInput] = useState<string>('50'); // 50 cc
  const [durationHoursInput, setDurationHoursInput] = useState<string>('4'); // 4 jam
  const [diluentType, setDiluentType] = useState<string>('NaCl 0.9%');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // Parsed numerical values for safe calculations
  const targetMeq = Math.max(0, parseFloat(targetMeqInput) || 0);
  const sourceConcentration = Math.max(0.001, parseFloat(sourceConcentrationInput) || 1.0);
  const syringeVolumeMl = Math.max(0.1, parseFloat(syringeVolumeInput) || 50);
  const durationHours = Math.max(0.01, parseFloat(durationHoursInput) || 1);

  const activePreset = useMemo(() => {
    return ELECTROLYTE_PRESETS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = ELECTROLYTE_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setSourceConcentrationInput(String(p.standardConcentrationMeqPerMl));
      if (presetId === 'kcl_746') {
        setTargetMeqInput('25');
        setDurationHoursInput('4'); // 25 mEq dalam 4 jam = 6.25 mEq/jam (aman < 10 mEq/jam)
      } else if (presetId === 'bicnat_84') {
        setTargetMeqInput('50');
        setDurationHoursInput('2');
      } else if (presetId === 'nacl_3') {
        setTargetMeqInput('100');
        setDurationHoursInput('6');
      }
    }
  };

  const result = useMemo(() => {
    return calculateSyringePumpMeq({
      targetMeq,
      sourceConcentrationMeqPerMl: sourceConcentration,
      syringeVolumeMl,
      durationHours,
      diluentType,
    });
  }, [targetMeq, sourceConcentration, syringeVolumeMl, durationHours, diluentType]);

  const handleCopy = () => {
    const text = `Perhitungan Syringe Pump Elektrolit (mEq):
- Elektrolit: ${activePreset?.name || 'Kustom'} (${targetMeq} mEq)
- Sediaan Obat Diambil: ${result.sourceElectrolyteMl} cc
- Pelarut (${diluentType}): ${result.diluentVolumeMl} cc
- Total Spuit: ${syringeVolumeMl} cc
- Durasi: ${durationHours} jam
- Kecepatan Syringe Pump: ${result.rateCcPerHour} cc/jam (${result.rateCcPerMinute} cc/menit)
- Laju Masuk: ${result.deliveryRateMeqPerHour} mEq/jam (${result.deliveryRateMeqPerMinute} mEq/menit)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onSaveHistory) return;
    const historyItem: CalculationHistoryItem = {
      id: 'syringe-meq-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'syringe_meq',
      title: `${activePreset?.name.split(' ')[0] || 'Elektrolit'} ${targetMeq} mEq dlm ${syringeVolumeMl} cc`,
      subtitle: `${durationHours} Jam via Syringe Pump`,
      primaryResult: `${result.rateCcPerHour} cc/jam`,
      secondaryResult: `${result.rateCcPerMinute} cc/menit (${result.deliveryRateMeqPerHour} mEq/jam)`,
      details: `Obat: ${result.sourceElectrolyteMl} cc + Pelarut: ${result.diluentVolumeMl} cc ${diluentType}`,
    };
    onSaveHistory(historyItem);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Syringe className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Syringe Pump Elektrolit Pekat (mEq)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Menghitung dosis mEq, volume obat & cairan campuran (oplosan), serta kecepatan cc/jam dan cc/menit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
            {onSaveHistory && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Pilih Jenis Elektrolit Pekat:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ELECTROLYTE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedPresetId === preset.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs font-bold leading-snug">{preset.name}</span>
                <span className="text-[10px] text-slate-500 mt-1">{preset.standardPackDescription}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Target Dosis mEq */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Dosis yang Diminta
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-target-meq"
                type="text"
                inputMode="decimal"
                value={targetMeqInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setTargetMeqInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition"
                placeholder="25"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mEq</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[10, 15, 20, 25, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTargetMeqInput(String(v))}
                  className={`text-[10px] px-2 py-0.5 rounded border transition ${
                    targetMeqInput === String(v)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Konsentrasi Sediaan mEq/mL - EDIT MANUAL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-indigo-400 block">
                Sediaan Elektrolit Asli
              </label>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.2 rounded font-medium">
                Edit Manual
              </span>
            </div>
            <div className="relative">
              <input
                id="input-source-concentration"
                type="text"
                inputMode="decimal"
                value={sourceConcentrationInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setSourceConcentrationInput(val);
                }}
                className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition shadow-inner"
                placeholder="1.0"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-300 font-bold">mEq/mL</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Contoh: KCl 7.46% = 1 mEq/mL (bebas ketik angka)
            </p>
          </div>

          {/* 3. Spuit Campuran (Volume Total) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Volume Total Spuit / Oplosan
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-syringe-volume"
                type="text"
                inputMode="decimal"
                value={syringeVolumeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setSyringeVolumeInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition"
                placeholder="50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cc (mL)</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[20, 50, 100, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSyringeVolumeInput(String(v))}
                  className={`text-[10px] px-2 py-0.5 rounded border transition ${
                    syringeVolumeInput === String(v)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {v} cc
                </button>
              ))}
            </div>
          </div>

          {/* 4. Durasi Pemberian (Jam) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Durasi Pemberian Target
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-duration-hours"
                type="text"
                inputMode="decimal"
                value={durationHoursInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setDurationHoursInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition"
                placeholder="4"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Jam</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[1, 2, 4, 6, 8, 12, 24].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDurationHoursInput(String(h))}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                    durationHoursInput === String(h)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {h}j
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pilihan Cairan Pelarut */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">Cairan Pelarut Campuran:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['NaCl 0.9%', 'Dextrose 5%', 'Aquabidest', 'Dextrose 10%'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiluentType(d)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  diluentType === d
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Hasil Utama - Syringe Pump Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Kecepatan Alat cc/jam */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Setting Syringe Pump
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {result.rateCcPerHour}
              </span>
              <span className="text-sm font-semibold text-indigo-400">cc/jam</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              (atau {result.rateCcPerHour} mL/jam di display alat)
            </div>
          </div>

          {/* Kecepatan per menit (cc/menit) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Laju cc Per Menit
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {result.rateCcPerMinute}
              </span>
              <span className="text-xs font-semibold text-slate-400">cc/menit</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Kecepatan aliran per menit
            </div>
          </div>

          {/* Volume Obat Diambil */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Volume Obat Elektrolit
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.sourceElectrolyteMl}
              </span>
              <span className="text-xs font-semibold text-amber-400">cc (mL)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sedot <strong>{result.sourceElectrolyteMl} cc</strong> dari ampul
            </div>
          </div>

          {/* Cairan Pelarut Campuran */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              Cairan Pengencer Ditambah
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.diluentVolumeMl}
              </span>
              <span className="text-xs font-semibold text-cyan-400">cc {diluentType}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Oplos hingga genap {syringeVolumeMl} cc
            </div>
          </div>
        </div>

        {/* Resep Oplosan Rinci */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <FlaskConical className="w-4 h-4 text-indigo-400" />
            <span>Instruksi Pengoplosan di Ruang Perawatan / ICU:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400">1. Ambil Obat Sediaan:</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {result.sourceElectrolyteMl} cc
              </div>
              <div className="text-[10px] text-slate-500">
                Setara dengan {targetMeq} mEq {activePreset?.name.split(' ')[0] || 'Elektrolit'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400">2. Tambahkan Pelarut:</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {result.diluentVolumeMl} cc {diluentType}
              </div>
              <div className="text-[10px] text-slate-500">
                Dioplos ke dalam spuit hingga total {syringeVolumeMl} cc
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400">3. Laju Penghantaran Elektrolit:</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {result.deliveryRateMeqPerHour} mEq/jam
              </div>
              <div className="text-[10px] text-slate-500">
                ({result.deliveryRateMeqPerMinute} mEq/menit ke pasien)
              </div>
            </div>
          </div>
        </div>

        {/* Peringatan Keselamatan Medis */}
        {result.safetyNote && (
          <div
            className={`rounded-xl p-4 border flex items-start gap-3 ${
              result.isHighAlert
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-1 text-xs">
              <div className="font-bold uppercase tracking-wider">Peringatan Keselamatan Dosis:</div>
              <p className="leading-relaxed">{result.safetyNote}</p>
            </div>
          </div>
        )}

        {/* Info Tambahan Klinis */}
        {activePreset && (
          <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Panduan Klinis {activePreset.name}:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{activePreset.clinicalSafetyNotes}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span>• {activePreset.safeMaxDeliveryRate}</span>
              <span>• {activePreset.peripherialLineMaxConcentration}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
