import React, { useState, useMemo } from 'react';
import { calculatePediatricTransfusion } from '../utils/calculatorEngine';
import { CalculationHistoryItem, BloodComponentType } from '../types';
import {
  ShieldAlert,
  Droplets,
  Clock,
  Copy,
  Check,
  BookmarkPlus,
  AlertTriangle,
  Info,
  HeartHandshake,
  FileCheck2,
} from 'lucide-react';

interface PediatricTransfusionCardProps {
  onSaveHistory?: (item: CalculationHistoryItem) => void;
}

const BLOOD_COMPONENTS: { id: BloodComponentType; name: string; tag: string; defaultDose: number; unit: string }[] = [
  { id: 'prc', name: 'Packed Red Cells (PRC)', tag: 'Anemia / Hb Rendah', defaultDose: 10, unit: 'mL/kg' },
  { id: 'tc', name: 'Trombosit (TC / Konsentrat)', tag: 'Trombositopenia / Perdarahan', defaultDose: 10, unit: 'mL/kg' },
  { id: 'ffp', name: 'Fresh Frozen Plasma (FFP)', tag: 'Defisiensi Faktor Koagulasi', defaultDose: 10, unit: 'mL/kg' },
  { id: 'cryo', name: 'Kriopresipitat (Cryo)', tag: 'Fibrinogen Rendah / Hemofilia A', defaultDose: 5, unit: 'mL/kg' },
  { id: 'wb', name: 'Whole Blood (Darah Lengkap)', tag: 'Perdarahan Masif Akut', defaultDose: 20, unit: 'mL/kg' },
];

export const PediatricTransfusionCard: React.FC<PediatricTransfusionCardProps> = ({ onSaveHistory }) => {
  const [componentType, setComponentType] = useState<BloodComponentType>('prc');
  const [weightInput, setWeightInput] = useState<string>('12');
  const [calculationMethod, setCalculationMethod] = useState<'formula_hb' | 'empirical'>('formula_hb');
  const [currentHbInput, setCurrentHbInput] = useState<string>('6.5');
  const [targetHbInput, setTargetHbInput] = useState<string>('10.0');
  const [prcFactor, setPrcFactor] = useState<3 | 4>(4);
  const [empiricalDoseInput, setEmpiricalDoseInput] = useState<string>('10');
  const [durationHoursInput, setDurationHoursInput] = useState<string>('3');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showChecklist, setShowChecklist] = useState<boolean>(true);

  // Parsed numerical values
  const weightKg = Math.max(0.1, parseFloat(weightInput) || 0);
  const currentHb = parseFloat(currentHbInput) || 6.5;
  const targetHb = parseFloat(targetHbInput) || 10.0;
  const empiricalDoseMlPerKg = parseFloat(empiricalDoseInput) || 10;
  const durationHours = Math.max(1, Math.min(4, parseFloat(durationHoursInput) || 3));

  const result = useMemo(() => {
    return calculatePediatricTransfusion({
      componentType,
      weightKg,
      calculationMethod,
      currentHb,
      targetHb,
      prcFactor,
      empiricalDoseMlPerKg,
      durationHours,
    });
  }, [componentType, weightKg, calculationMethod, currentHb, targetHb, prcFactor, empiricalDoseMlPerKg, durationHours]);

  const handleCopy = () => {
    const text = `Perhitungan Transfusi Darah Anak (Pediatrik):
- Komponen: ${result.componentName}
- Berat Badan Anak: ${weightKg} kg
- Total Volume Transfusi: ${result.calculatedVolumeMl} mL
- Durasi Transfusi: ${durationHours} jam (Maksimal 4 jam)
- Laju Pompa / Syringe Pump: ${result.hourlyRateMl} mL/jam (${result.minuteRateMl} mL/menit)
- Tetesan Blood Set (15 gtt/mL): ${result.bloodSetTpm} TPM (1 tetes tiap ${result.bloodSetSecondsPerDrop} detik)
- Observasi 15 Menit Pertama: Laju ${result.initialObservationRateMlPerHour} mL/jam (~${result.initialObservationTpm} TPM)
${result.expectedHbRise ? `- Estimasi Kenaikan Hb: ~${result.expectedHbRise} g/dL` : ''}
${result.expectedPlateletRise ? `- Estimasi Kenaikan Trombosit: ${result.expectedPlateletRise}` : ''}
${result.isExceedingSafeLimit ? `[PERINGATAN]: Melebihi batas aman 1 sesi (${result.safeMaxVolumePerSessionMl} mL). Pertimbangkan membagi 2 sesi.` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onSaveHistory) return;
    const item: CalculationHistoryItem = {
      id: 'ped_trans_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'transfusi_anak',
      title: `Transfusi Anak: ${result.componentName} (${weightKg} kg)`,
      subtitle: `Volume ${result.calculatedVolumeMl} mL dalam ${durationHours} jam`,
      primaryResult: `${result.calculatedVolumeMl} mL (${result.bloodSetTpm} TPM Blood Set)`,
      secondaryResult: `${result.hourlyRateMl} mL/jam | Awal: ${result.initialObservationRateMlPerHour} mL/jam`,
      details: `${result.recommendations.join(' | ')}`,
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
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Transfusi Darah Anak
              </h2>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                Pediatrik
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Perhitungan dosis PRC (Rumus IDAI ΔHb), Trombosit (TC), FFP, Cryo, Blood Set 15 gtt/mL & laju observasi 15 menit awal.
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-medium transition"
              title="Simpan ke riwayat"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Pemilihan Komponen Darah */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          Pilih Komponen Darah yang Akan Ditransfusikan:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BLOOD_COMPONENTS.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => {
                setComponentType(comp.id);
                setEmpiricalDoseInput(String(comp.defaultDose));
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                componentType === comp.id
                  ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="text-xs font-bold truncate">{comp.name.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{comp.tag}</div>
              <div className="text-[9px] text-red-400 mt-0.5">Dosis: ~{comp.defaultDose} {comp.unit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Parameter Input Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Berat Badan */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Berat Badan Anak (BB)
            </label>
            <span className="text-[10px] text-red-400 font-medium">Edit Manual</span>
          </div>
          <div className="relative">
            <input
              id="input-transfusion-weight"
              type="text"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                if (/^[0-9]*\.?[0-9]*$/.test(val)) setWeightInput(val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500 transition"
              placeholder="12"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">kg</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[4, 8, 12, 16, 20].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeightInput(String(w))}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                  weightInput === String(w)
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800'
                }`}
              >
                {w}kg
              </button>
            ))}
          </div>
        </div>

        {/* Durasi Transfusi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 block">
              Durasi Transfusi Target
            </label>
            <span className="text-[10px] text-amber-400 font-medium">Maksimal 4 Jam</span>
          </div>
          <div className="relative">
            <input
              id="input-transfusion-duration"
              type="text"
              inputMode="decimal"
              value={durationHoursInput}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                if (/^[0-9]*\.?[0-9]*$/.test(val)) setDurationHoursInput(val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500 transition"
              placeholder="3"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Jam</span>
          </div>
          <div className="flex gap-1 pt-1">
            {[2, 3, 4].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDurationHoursInput(String(h))}
                className={`text-[10px] px-2.5 py-0.5 rounded border transition ${
                  durationHoursInput === String(h)
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-800'
                }`}
              >
                {h} jam
              </button>
            ))}
          </div>
        </div>

        {/* Mode Perhitungan Khusus PRC & WB */}
        {(componentType === 'prc' || componentType === 'wb') ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Metode Hitung Dosis
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCalculationMethod('formula_hb')}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition font-medium ${
                    calculationMethod === 'formula_hb'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Rumus Target Hb
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMethod('empirical')}
                  className={`py-2 px-2 text-xs rounded-xl border text-center transition font-medium ${
                    calculationMethod === 'empirical'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dosis mL/kg
                </button>
              </div>

              {calculationMethod === 'formula_hb' && componentType === 'prc' && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span>Faktor Pengali:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPrcFactor(4)}
                      className={`px-2 py-0.5 rounded border ${
                        prcFactor === 4 ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      × 4 (IDAI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrcFactor(3)}
                      className={`px-2 py-0.5 rounded border ${
                        prcFactor === 3 ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      × 3 (Bayi/Formula lama)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {calculationMethod === 'formula_hb' ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Hb Pasien & Hb Target
                  </label>
                  <span className="text-[10px] text-red-300 font-mono">
                    ΔHb: {(targetHb - currentHb > 0 ? targetHb - currentHb : 0).toFixed(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={currentHbInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (/^[0-9]*\.?[0-9]*$/.test(val)) setCurrentHbInput(val);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-semibold text-center"
                      placeholder="Hb awal"
                    />
                    <span className="block text-[9px] text-center text-slate-500 mt-0.5">Hb Saat Ini</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={targetHbInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(',', '.');
                        if (/^[0-9]*\.?[0-9]*$/.test(val)) setTargetHbInput(val);
                      }}
                      className="w-full bg-slate-950 border border-red-500/60 rounded-xl px-2.5 py-2 text-xs text-white font-semibold text-center"
                      placeholder="Hb target"
                    />
                    <span className="block text-[9px] text-center text-slate-400 mt-0.5">Target Hb</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Dosis Empiris (mL/kg)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={empiricalDoseInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (/^[0-9]*\.?[0-9]*$/.test(val)) setEmpiricalDoseInput(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500 transition"
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mL/kg</span>
                </div>
                <div className="flex gap-1 pt-1">
                  {[10, 12, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEmpiricalDoseInput(String(d))}
                      className={`text-[10px] px-2 py-0.5 rounded border transition ${
                        empiricalDoseInput === String(d)
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-800/60 text-slate-400 border-slate-800'
                      }`}
                    >
                      {d} mL/kg
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Parameter untuk TC, FFP, Cryo */
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Dosis Transfusi ({result.componentName})
              </label>
              <span className="text-[10px] text-slate-400">Dosis per kg BB</span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={empiricalDoseInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setEmpiricalDoseInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500 transition"
                placeholder="10"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mL/kg</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {componentType === 'tc'
                ? 'Standar: 1 unit per 10 kg BB (atau 10 mL/kg konsentrat trombosit)'
                : componentType === 'ffp'
                ? 'Standar: 10 - 15 mL/kg untuk defisiensi koagulasi'
                : 'Standar: 1 unit kantong per 5-10 kg BB (atau 5 mL/kg)'}
            </p>
          </div>
        )}
      </div>

      {/* Primary Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Card 1: Total Volume Transfusi */}
        <div className="bg-slate-950 border border-red-500/40 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-red-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-xs text-red-300 font-semibold uppercase tracking-wider">
              Total Volume Transfusi
            </div>
            <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
              Kebutuhan
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">
              {result.calculatedVolumeMl}
            </span>
            <span className="text-sm font-semibold text-red-400">mL</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Batas aman 1 sesi: <strong className="text-white">{result.safeMaxVolumePerSessionMl}</strong> mL
          </div>
        </div>

        {/* Card 2: Laju Pompa / Syringe Pump */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Laju Pompa (Rutin)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-red-400 tracking-tight">
              {result.hourlyRateMl}
            </span>
            <span className="text-sm font-semibold text-slate-300">mL/jam</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Setara: <strong className="text-white">{result.minuteRateMl}</strong> mL/menit
          </div>
        </div>

        {/* Card 3: Tetesan Blood Set (15 gtt/mL) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Tetesan Blood Set (15 gtt)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tracking-tight">
              {result.bloodSetTpm}
            </span>
            <span className="text-sm font-semibold text-slate-300">TPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            1 tetes tiap <span className="underline font-bold text-white">{result.bloodSetSecondsPerDrop}</span> detik
          </div>
        </div>

        {/* Card 4: Observasi 15 Menit Awal */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              15 Menit Pertama
            </div>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
              Observasi
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-tight">
              {result.initialObservationRateMlPerHour}
            </span>
            <span className="text-xs font-semibold text-slate-300">mL/jam</span>
          </div>
          <div className="text-[11px] text-amber-200/80 mt-1">
            Tetesan lambat: ~<strong className="text-white">{result.initialObservationTpm} TPM</strong>
          </div>
        </div>
      </div>

      {/* Peringatan Volume & Rekomendasi Klinis */}
      {result.isExceedingSafeLimit && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-600/50 text-red-200 text-xs shadow-inner">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block font-semibold">
              Perhatian: Volume Melebihi Batas Aman 1 Sesi Transfusi Anak!
            </strong>
            <p>
              Total volume ({result.calculatedVolumeMl} mL) melebihi batas rekomendasi tunggal ({result.safeMaxVolumePerSessionMl} mL / 15 mL/kg).
              Sangat disarankan untuk <strong>membagi transfusi menjadi 2 sesi</strong> (misal berselang 12-24 jam) atau berkonsultasi dengan Dokter Spesialis Anak / DPJP untuk pertimbangan pemberian diuretik (Furosemid) guna mencegah kelebihan beban cairan sirkulasi (TACO).
            </p>
          </div>
        </div>
      )}

      {/* Rincian Rumus & Estimasi Respons */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Rincian & Estimasi Kenaikan Hasil Laboratorium:
          </span>
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="text-[11px] text-red-400 hover:text-red-300 underline"
          >
            {showChecklist ? 'Sembunyikan Checklist' : 'Lihat Standar Keselamatan (SOP)'}
          </button>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 text-slate-300">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>{rec}</span>
            </div>
          ))}
          {result.expectedPlateletRise && (
            <div className="flex items-start gap-2 text-emerald-300">
              <span className="font-bold">•</span>
              <span>Estimasi Kenaikan Trombosit: <strong>{result.expectedPlateletRise}</strong></span>
            </div>
          )}
        </div>

        {/* SOP Checklist Keselamatan Transfusi */}
        {showChecklist && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Standar Prosedur Keselamatan Transfusi Darah Anak (Bedside Nursing SOP):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {result.safetyChecklist.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
