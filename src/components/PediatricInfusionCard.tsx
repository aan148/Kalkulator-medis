import React, { useState, useMemo } from 'react';
import { calculatePediatricFluid } from '../utils/calculatorEngine';
import { CalculationHistoryItem } from '../types';
import {
  Baby,
  Thermometer,
  Clock,
  Droplet,
  Copy,
  Check,
  BookmarkPlus,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface PediatricInfusionCardProps {
  onSaveHistory?: (item: CalculationHistoryItem) => void;
}

const COMMON_PEDIATRIC_FLUIDS = [
  { name: 'KA-EN 3B', desc: 'Rumatan umum anak > 3 thn / balita (Na: 50, K: 20, Cl: 50, Glukosa 27 g/L)' },
  { name: 'D5 1/4 NS', desc: 'Rumatan umum bayi & anak kecil (Dextrose 5% + NaCl 0.225%)' },
  { name: 'KA-EN 1B', desc: 'Rumatan awal / neonatus (Na: 38.5, Cl: 38.5, Dextrose 37.5 g/L)' },
  { name: 'D5 1/2 NS', desc: 'Rumatan anak besar / pre-operatif (Dextrose 5% + NaCl 0.45%)' },
  { name: 'NaCl 0.9%', desc: 'Resusitasi cairan / koreksi hipovolemia' },
  { name: 'Ringer Laktat (RL)', desc: 'Resusitasi cairan isotonik' },
];

export const PediatricInfusionCard: React.FC<PediatricInfusionCardProps> = ({ onSaveHistory }) => {
  const [weightInput, setWeightInput] = useState<string>('12');
  const [temperatureInput, setTemperatureInput] = useState<string>('36.8');
  const [durationHoursInput, setDurationHoursInput] = useState<string>('24');
  const [fluidName, setFluidName] = useState<string>('KA-EN 3B');
  const [clinicalCondition, setClinicalCondition] = useState<
    'normal' | 'demam' | 'restriksi' | 'ringan_sedang' | 'kustom'
  >('normal');
  const [customVolumeInput, setCustomVolumeInput] = useState<string>('');
  const [restrictionPercentInput, setRestrictionPercentInput] = useState<string>('80');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Parsed numerical values
  const weightKg = Math.max(0.1, parseFloat(weightInput) || 0);
  const temperatureC = parseFloat(temperatureInput) || 36.8;
  const durationHours = Math.max(0.1, parseFloat(durationHoursInput) || 24);
  const customTotalVolumeMl = parseFloat(customVolumeInput) || 0;
  const restrictionPercent = parseFloat(restrictionPercentInput) || 80;

  const result = useMemo(() => {
    return calculatePediatricFluid({
      weightKg,
      temperatureC,
      durationHours,
      fluidName,
      clinicalCondition,
      customTotalVolumeMl: clinicalCondition === 'kustom' ? customTotalVolumeMl : undefined,
      restrictionPercent: clinicalCondition === 'restriksi' ? restrictionPercent : undefined,
    });
  }, [weightKg, temperatureC, durationHours, fluidName, clinicalCondition, customTotalVolumeMl, restrictionPercent]);

  const handleCopy = () => {
    const text = `Perhitungan Cairan Infus Anak (Pediatrik):
- Berat Badan: ${weightKg} kg | Suhu: ${temperatureC} °C
- Kondisi: ${clinicalCondition} | Jenis Cairan: ${fluidName}
- Kebutuhan Rumatan Holliday-Segar: ${result.baseDailyVolumeMl} mL/24 jam
- Total Volume (${durationHours} jam): ${result.prescribedVolumeForDurationMl} mL
- Laju Infusion/Syringe Pump: ${result.hourlyRateMl} mL/jam (${result.minuteRateMl} mL/menit)
- Tetesan Mikro (60 gtt/mL): ${result.microDripTpm} TPM (1 tetes tiap ${result.microSecondsPerDrop} detik)
- Tetesan Makro (20 gtt/mL): ${result.macro20Tpm} TPM`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onSaveHistory) return;
    const item: CalculationHistoryItem = {
      id: 'ped_inf_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'infus_anak',
      title: `Infus Anak: ${fluidName} (${weightKg} kg)`,
      subtitle: `Rumatan Holliday-Segar ${result.prescribedVolumeForDurationMl} mL dlm ${durationHours} jam`,
      primaryResult: `${result.microDripTpm} TPM Mikro`,
      secondaryResult: `${result.hourlyRateMl} mL/jam (${result.microSecondsPerDrop} dtk/tetes)`,
      details: `${result.formulaDescription} | Cairan: ${fluidName}`,
    };
    onSaveHistory(item);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Kebutuhan Cairan & Infus Anak
              </h2>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
                Pediatrik
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Standar baku Holliday-Segar (metode 100-50-20 & 4-2-1), koreksi suhu demam, dan tetesan mikro 60 gtt/mL.
            </p>
          </div>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-500/30 text-xs font-medium transition"
              title="Simpan ke riwayat"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Berat Badan Anak */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Berat Badan Anak (BB)
            </label>
            <span className="text-[10px] text-teal-400 font-medium">Edit Manual</span>
          </div>
          <div className="relative">
            <input
              id="input-pediatric-weight"
              type="text"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                if (/^[0-9]*\.?[0-9]*$/.test(val)) setWeightInput(val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-teal-500 transition"
              placeholder="12"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">kg</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[4, 8, 12, 16, 22].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeightInput(String(w))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                  weightInput === String(w)
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800'
                }`}
              >
                {w}kg
              </button>
            ))}
          </div>
        </div>

        {/* 2. Suhu Tubuh */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Suhu Tubuh Pasien
            </label>
            <span className="text-[10px] text-slate-500">Koreksi Suhu</span>
          </div>
          <div className="relative">
            <input
              id="input-pediatric-temperature"
              type="text"
              inputMode="decimal"
              value={temperatureInput}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                if (/^[0-9]*\.?[0-9]*$/.test(val)) setTemperatureInput(val);
              }}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none transition ${
                temperatureC > 37.5
                  ? 'border-amber-500/70 text-amber-300'
                  : 'border-slate-800 text-white focus:border-teal-500'
              }`}
              placeholder="36.8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">°C</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[36.8, 37.8, 38.5, 39.0].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemperatureInput(String(t))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                  temperatureInput === String(t)
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800'
                }`}
              >
                {t}°C
              </button>
            ))}
          </div>
        </div>

        {/* 3. Durasi Target Pemberian */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Durasi Dihabiskan
            </label>
            <span className="text-[10px] text-slate-500">Waktu</span>
          </div>
          <div className="relative">
            <input
              id="input-pediatric-duration"
              type="text"
              inputMode="decimal"
              value={durationHoursInput}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                if (/^[0-9]*\.?[0-9]*$/.test(val)) setDurationHoursInput(val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-teal-500 transition"
              placeholder="24"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Jam</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[8, 12, 24].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDurationHoursInput(String(h))}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${
                  durationHoursInput === String(h)
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800'
                }`}
              >
                {h} jam
              </button>
            ))}
          </div>
        </div>

        {/* 4. Kondisi Klinis / Mode Perhitungan */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Kondisi Klinis
          </label>
          <select
            id="select-pediatric-condition"
            value={clinicalCondition}
            onChange={(e) => setClinicalCondition(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-teal-500 transition"
          >
            <option value="normal">Rumatan Baku Normal</option>
            <option value="demam">Demam (Auto Koreksi Suhu)</option>
            <option value="restriksi">Restriksi Cairan (Jantung/Ginjal)</option>
            <option value="ringan_sedang">Dehidrasi Ringan-Sedang</option>
            <option value="kustom">Volume Kustom (Manual Dokter)</option>
          </select>

          {clinicalCondition === 'kustom' ? (
            <div className="pt-1">
              <input
                type="text"
                inputMode="decimal"
                value={customVolumeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setCustomVolumeInput(val);
                }}
                className="w-full bg-slate-950 border border-teal-500/60 rounded-lg px-2.5 py-1 text-xs text-white"
                placeholder="Total volume (mis: 800) mL"
              />
            </div>
          ) : clinicalCondition === 'restriksi' ? (
            <div className="pt-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Persentase:</span>
              <input
                type="text"
                inputMode="decimal"
                value={restrictionPercentInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setRestrictionPercentInput(val);
                }}
                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white text-center"
                placeholder="80"
              />
              <span className="text-[10px] text-slate-400">%</span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500">
              {temperatureC > 37.5
                ? `Demam +${result.temperatureAdjustmentMl} mL (+12%/°C di atas 37.5)`
                : '100% kebutuhan rumatan baku'}
            </p>
          )}
        </div>
      </div>

      {/* Pilihan Cairan Infus Pediatrik */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-teal-400" />
            Pilihan Cairan Infus Anak
          </span>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-teal-400 hover:text-teal-300 underline"
          >
            {showGuide ? 'Tutup Panduan' : 'Lihat Rekomendasi Cairan'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COMMON_PEDIATRIC_FLUIDS.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => setFluidName(f.name)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                fluidName === f.name
                  ? 'bg-teal-600 text-white border-teal-500 font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {showGuide && (
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
            {COMMON_PEDIATRIC_FLUIDS.map((f) => (
              <div key={f.name} className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="font-bold text-teal-300">{f.name}: </span>
                <span>{f.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Card 1: Laju Pompa / Syringe Pump */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Laju Pompa (Infus / Syringe)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-teal-400 tracking-tight">
              {result.hourlyRateMl}
            </span>
            <span className="text-sm font-semibold text-slate-300">mL/jam (cc/jam)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Setara: <strong className="text-white">{result.minuteRateMl}</strong> mL/menit
          </div>
        </div>

        {/* Card 2: Tetesan Mikro (60 gtt/mL) */}
        <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-teal-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
              Tetesan Mikro (60 gtt/mL)
            </div>
            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
              Pediatrik Set
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">
              {result.microDripTpm}
            </span>
            <span className="text-sm font-semibold text-teal-400">TPM Mikro</span>
          </div>
          <div className="text-[11px] text-teal-200/80 mt-1 font-medium">
            1 tetes tiap <span className="underline font-bold text-white">{result.microSecondsPerDrop}</span> detik
          </div>
        </div>

        {/* Card 3: Total Volume Sesuai Durasi */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Volume ({durationHours} Jam)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">
              {result.prescribedVolumeForDurationMl}
            </span>
            <span className="text-sm font-semibold text-slate-300">mL</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rumatan 24 jam: {result.totalDailyVolumeMl} mL
          </div>
        </div>

        {/* Card 4: Tetesan Makro (Bila Menggunakan Makroset) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Tetesan Makro (Anak Besar)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-200">
              {result.macro20Tpm}
            </span>
            <span className="text-xs font-semibold text-slate-400">TPM (20 gtt)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Atau {result.macro15Tpm} TPM jika set 15 gtt/mL
          </div>
        </div>
      </div>

      {/* Rincian Rumus Holliday-Segar & Panduan Klinis */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-teal-400 font-semibold">
          <Info className="w-4 h-4" />
          <span>Langkah Perhitungan Rumatan Holliday-Segar (Metode 100-50-20):</span>
        </div>
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 text-slate-300">
          <div>
            <strong className="text-white font-mono">{result.hollidaySegarBreakdown}</strong>
          </div>
          <p className="text-slate-400">{result.formulaDescription}</p>
        </div>

        {/* Safety Alerts */}
        {result.safetyAlerts.map((alert, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-800/30 p-2.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{alert}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
