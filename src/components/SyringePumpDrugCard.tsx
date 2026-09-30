import React, { useState, useMemo } from 'react';
import { calculateSyringePumpDrug, calculateReverseDose } from '../utils/calculatorEngine';
import { POPULAR_DRUG_PRESETS } from '../data/drugPresets';
import { CalculationHistoryItem } from '../types';
import { HeartPulse, Check, Copy, BookmarkPlus, ArrowLeftRight, HelpCircle, AlertCircle } from 'lucide-react';

interface SyringePumpDrugCardProps {
  onSaveHistory?: (item: CalculationHistoryItem) => void;
}

export const SyringePumpDrugCard: React.FC<SyringePumpDrugCardProps> = ({ onSaveHistory }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('norepinephrine');
  const [patientWeightInput, setPatientWeightInput] = useState<string>('55');
  const [targetDoseInput, setTargetDoseInput] = useState<string>('0.05');
  const [doseUnit, setDoseUnit] = useState<
    'mcg/kg/min' | 'mcg/min' | 'mcg/kg/hr' | 'mcg/hr' | 'mg/kg/hr' | 'mg/hr' | 'IU/hr'
  >('mcg/kg/min');
  const [drugAmountInput, setDrugAmountInput] = useState<string>('4');
  const [drugAmountUnit, setDrugAmountUnit] = useState<'mg' | 'mcg' | 'IU'>('mg');
  const [syringeVolumeInput, setSyringeVolumeInput] = useState<string>('50');
  const [diluentType, setDiluentType] = useState<string>('NaCl 0.9%');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Reverse calculator state
  const [showReverseCalc, setShowReverseCalc] = useState<boolean>(false);
  const [reverseRateInput, setReverseRateInput] = useState<string>('2.0');

  // Parsed numerical values for safe calculations
  const patientWeightKg = Math.max(0.1, parseFloat(patientWeightInput) || 0);
  const targetDose = Math.max(0, parseFloat(targetDoseInput) || 0);
  const drugAmount = Math.max(0, parseFloat(drugAmountInput) || 0);
  const syringeVolumeMl = Math.max(0.1, parseFloat(syringeVolumeInput) || 50);
  const reverseRateCcPerHour = Math.max(0, parseFloat(reverseRateInput) || 0);

  const activePreset = useMemo(() => {
    return POPULAR_DRUG_PRESETS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = POPULAR_DRUG_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setDrugAmountInput(String(p.standardVialMg));
      setDrugAmountUnit(p.unit === 'IU' ? 'IU' : p.unit === 'mcg' ? 'mcg' : 'mg');
      setSyringeVolumeInput(String(p.standardSyringeMl));
      setDoseUnit(p.doseUnit as 'mcg/kg/min' | 'mcg/min' | 'mcg/kg/hr' | 'mcg/hr' | 'mg/kg/hr' | 'mg/hr' | 'IU/hr');
      setTargetDoseInput(String(p.defaultDose));
      if (p.compatibleDiluents.length > 0) {
        setDiluentType(p.compatibleDiluents[0]);
      }
    }
  };

  const result = useMemo(() => {
    return calculateSyringePumpDrug({
      drugName: activePreset?.name || 'Obat',
      dose: targetDose,
      doseUnit,
      patientWeightKg,
      drugAmount,
      drugAmountUnit,
      syringeVolumeMl,
      diluentType,
    });
  }, [activePreset, targetDose, doseUnit, patientWeightKg, drugAmount, drugAmountUnit, syringeVolumeMl, diluentType]);

  // Furosemide specific continuous delivery calculations & safe delivery rate
  const isFurosemide = selectedPresetId === 'furosemide';
  const effectiveMgPerHour = useMemo(() => {
    if (drugAmountUnit === 'mg' && syringeVolumeMl > 0) {
      const concMgPerMl = drugAmount / syringeVolumeMl;
      return Number((result.rateCcPerHour * concMgPerMl).toFixed(2));
    }
    return 0;
  }, [drugAmountUnit, syringeVolumeMl, drugAmount, result.rateCcPerHour]);

  const effectiveMgPerMin = useMemo(() => {
    return Number((effectiveMgPerHour / 60).toFixed(2));
  }, [effectiveMgPerHour]);

  // Ototoxicity safety threshold: continuous delivery should not exceed 4 mg/minute
  const isFurosemideOtotoxicRisk = isFurosemide && effectiveMgPerMin > 4.0;

  const reverseResult = useMemo(() => {
    return calculateReverseDose(
      reverseRateCcPerHour,
      patientWeightKg,
      result.finalConcentrationMcgPerMl,
      result.finalConcentrationMgPerMl || (drugAmountUnit === 'mg' && syringeVolumeMl > 0 ? drugAmount / syringeVolumeMl : 0)
    );
  }, [
    reverseRateCcPerHour,
    patientWeightKg,
    result.finalConcentrationMcgPerMl,
    result.finalConcentrationMgPerMl,
    drugAmountUnit,
    syringeVolumeMl,
    drugAmount,
  ]);

  // Quick dose options based on selected drug
  const quickDoseOptions = useMemo(() => {
    if (isFurosemide) {
      if (doseUnit === 'mg/hr') return [2.5, 5, 10, 15, 20];
      if (doseUnit === 'mg/kg/hr') return [0.1, 0.2, 0.5, 1.0];
      return [1, 2.5, 5, 10];
    }
    if (selectedPresetId === 'insulin_regular') return [1, 2, 4, 6, 8, 10];
    if (selectedPresetId === 'norepinephrine') return [0.02, 0.05, 0.1, 0.2, 0.5];
    if (selectedPresetId === 'dopamine' || selectedPresetId === 'dobutamine') return [2.5, 5, 7.5, 10, 15];
    if (selectedPresetId === 'nicardipine') return [0.5, 1.0, 2.0, 3.0, 5.0];
    if (selectedPresetId === 'nitroglycerin') return [5, 10, 20, 30, 50];
    if (selectedPresetId === 'fentanyl') return [0.5, 1.0, 1.5, 2.0, 3.0];
    if (selectedPresetId === 'midazolam') return [0.02, 0.05, 0.1, 0.15, 0.2];
    if (selectedPresetId === 'amiodarone') return [20, 30, 40, 50, 60];
    return [];
  }, [selectedPresetId, isFurosemide, doseUnit]);

  // Quick vial sediaan options
  const quickAmountOptions = useMemo(() => {
    if (isFurosemide) {
      return [
        { amount: 100, label: '100 mg (5 amp)' },
        { amount: 200, label: '200 mg (10 amp)' },
        { amount: 40, label: '40 mg (2 amp)' },
        { amount: 20, label: '20 mg (1 amp)' },
      ];
    }
    return [];
  }, [isFurosemide]);

  const handleCopy = () => {
    let extraFurosemideInfo = '';
    if (isFurosemide) {
      extraFurosemideInfo = `\n- Laju Obat Masuk: ${effectiveMgPerHour} mg/jam (${effectiveMgPerMin} mg/menit)\n- Status Keamanan Ototoksisitas (<4 mg/menit): ${
        isFurosemideOtotoxicRisk ? '⚠️ PERINGATAN RISIKO OTOTOKSISITAS' : '✅ Aman (<4 mg/menit)'
      }`;
    }

    const text = `Perhitungan Syringe Pump Obat:
- Obat: ${activePreset?.name || 'Obat'}
- Berat Badan Pasien: ${patientWeightKg} kg
- Dosis Target: ${targetDose} ${doseUnit}
- Sediaan: ${drugAmount} ${drugAmountUnit} dlm ${syringeVolumeMl} cc (${result.concentrationDisplay})
- Kecepatan Syringe Pump: ${result.rateCcPerHour} cc/jam (${result.rateCcPerMinute} cc/menit)
- Pengencer: ${diluentType}${extraFurosemideInfo}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onSaveHistory) return;
    const historyItem: CalculationHistoryItem = {
      id: 'syringe-drug-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'syringe_drug',
      title: `${activePreset?.name.split(' ')[0] || 'Obat'} (${targetDose} ${doseUnit})`,
      subtitle: `BB: ${patientWeightKg} kg • Oplos: ${drugAmount} ${drugAmountUnit}/${syringeVolumeMl}cc`,
      primaryResult: `${result.rateCcPerHour} cc/jam`,
      secondaryResult: `${result.rateCcPerMinute} cc/menit`,
      details: isFurosemide
        ? `Laju: ${effectiveMgPerHour} mg/jam (${effectiveMgPerMin} mg/menit) • ${result.concentrationDisplay}`
        : `Konsentrasi: ${result.concentrationDisplay}`,
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
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <HeartPulse className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Kalkulator Syringe Pump Obat & Inotropik
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Menghitung titrasi mcg/kg/menit, mg/jam, IU/jam ke kecepatan cc/jam dan cc/menit.
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-medium transition"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Drug Presets Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Pilih Protokol Obat Cepat (ICU / Emergency Presets):
            </label>
            <span className="text-[11px] text-slate-500">Otomatis mengisi sediaan & dosis lazim</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {POPULAR_DRUG_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedPresetId === preset.id
                    ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate">{preset.name.split(' ')[0]}</span>
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded font-semibold capitalize ${
                      preset.category === 'diuretik'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : preset.category === 'vasopresor'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : preset.category === 'inotropik'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : preset.category === 'antihipertensi'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : preset.category === 'insulin'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : preset.category === 'sedasi'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {preset.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {preset.standardVialMg} {preset.unit} / {preset.standardSyringeMl} cc
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">{preset.doseUnit}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Berat Badan Pasien */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Berat Badan Pasien (BB)
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-drug-patient-weight"
                type="text"
                inputMode="decimal"
                value={patientWeightInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setPatientWeightInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-rose-500 transition"
                placeholder="55"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[45, 50, 55, 60, 70].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPatientWeightInput(String(w))}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition ${
                    patientWeightInput === String(w)
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          {/* 2. Dosis Target & Satuan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Dosis Target yang Diminta
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-drug-target-dose"
                type="text"
                inputMode="decimal"
                value={targetDoseInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setTargetDoseInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-rose-500 transition"
                placeholder="0.05"
              />
              <span className="absolute right-3 top-2.5 text-xs text-rose-400 font-bold">
                {doseUnit}
              </span>
            </div>

            {/* Quick Dose Unit Change */}
            <div className="flex flex-wrap gap-1 pt-1">
              {(['mcg/kg/min', 'mcg/min', 'mcg/kg/hr', 'mg/kg/hr', 'mg/hr', 'IU/hr'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setDoseUnit(unit)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                    doseUnit === unit
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>

            {/* Quick Dose Shortcut Values */}
            {quickDoseOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <span className="text-[9px] text-slate-500">Pilihan:</span>
                {quickDoseOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTargetDoseInput(String(opt))}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                      targetDoseInput === String(opt)
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Jumlah Obat Asli (Sediaan) - EDIT MANUAL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-rose-400 block">
                Sediaan Obat Dimasukkan
              </label>
              <span className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-1.5 py-0.2 rounded font-medium">
                Edit Manual
              </span>
            </div>
            <div className="relative">
              <input
                id="input-drug-amount"
                type="text"
                inputMode="decimal"
                value={drugAmountInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setDrugAmountInput(val);
                }}
                className="w-full bg-slate-950 border border-rose-500/50 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 transition shadow-inner"
                placeholder="Ketik angka sediaan..."
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-300 font-bold">
                {drugAmountUnit}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 pt-1">
              <div className="flex gap-1">
                {(['mg', 'mcg', 'IU'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDrugAmountUnit(u)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition ${
                      drugAmountUnit === u
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-800/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500">
                Bebas ketik angka berapa saja
              </span>
            </div>

            {/* Quick Sediaan Presets (misal Furosemide ampul) */}
            {quickAmountOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-500">Preset ampul:</span>
                {quickAmountOptions.map((q) => (
                  <button
                    key={q.amount}
                    type="button"
                    onClick={() => {
                      setDrugAmountInput(String(q.amount));
                      setDrugAmountUnit('mg');
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                      drugAmountInput === String(q.amount)
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Spuit Campuran (Volume Pengenceran) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                Volume Spuit Campuran
              </label>
              <span className="text-[10px] text-slate-500">Manual</span>
            </div>
            <div className="relative">
              <input
                id="input-drug-syringe-volume"
                type="text"
                inputMode="decimal"
                value={syringeVolumeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setSyringeVolumeInput(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-rose-500 transition"
                placeholder="50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cc</span>
            </div>
            <div className="flex gap-1 pt-1">
              {[20, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSyringeVolumeInput(String(v))}
                  className={`text-[10px] px-2 py-0.5 rounded border transition ${
                    syringeVolumeInput === String(v)
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {v} cc
                </button>
              ))}
            </div>

            {/* Diluent selection buttons */}
            {activePreset?.compatibleDiluents && activePreset.compatibleDiluents.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-500">Pelarut:</span>
                {activePreset.compatibleDiluents.map((dil) => (
                  <button
                    key={dil}
                    type="button"
                    onClick={() => setDiluentType(dil)}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition ${
                      diluentType === dil
                        ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {dil}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Furosemide Special Clinical & Ototoxicity Safety Alert */}
        {isFurosemide && (
          <div
            className={`p-3.5 rounded-xl border transition ${
              isFurosemideOtotoxicRisk
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isFurosemideOtotoxicRisk ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                }`}
              />
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-white">
                    {isFurosemideOtotoxicRisk
                      ? 'PERINGATAN TINGGI: RISIKO OTOTOKSISITAS FUROSEMIDE'
                      : 'Monitoring Infus Kontinu Furosemide (Lasix)'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isFurosemideOtotoxicRisk
                        ? 'bg-red-500 text-white font-bold'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    Laju Masuk: {effectiveMgPerHour} mg/jam ({effectiveMgPerMin} mg/menit)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isFurosemideOtotoxicRisk ? (
                    <>
                      <strong className="text-red-300">BAHAYA:</strong> Kecepatan pemberian ({effectiveMgPerMin} mg/menit){' '}
                      <strong>melebihi batas aman 4 mg/menit</strong>. Pemberian di atas 4 mg/menit berisiko tinggi memicu{' '}
                      <strong>tinitus (telinga berdenging)</strong> dan{' '}
                      <strong>gangguan pendengaran sensorineural/tuli ototoksik</strong>. Segera evaluasi laju syringe pump atau konsultasikan dosis titrasi dengan DPJP.
                    </>
                  ) : (
                    <>
                      Laju obat masuk ({effectiveMgPerMin} mg/menit) berada dalam <strong>rentang aman (&lt; 4 mg/menit)</strong>. Terapi loop diuretic kontinu efektif mengurangi overload cairan pada gagal jantung dekompensasi (ADHF) atau oliguria.
                    </>
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] text-slate-300">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium">Target Urin Output:</span>
                    <strong className="text-emerald-400">0.5 - 1.5 mL/kg/jam</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium">Batas Maksimal Aman:</span>
                    <strong className="text-amber-400">&lt; 4 mg/menit (&lt; 240 mg/jam)</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block font-medium">Elektrolit Wajib Pantau:</span>
                    <strong className="text-sky-300">Kalium (K+), Natrium, Tekanan Darah</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Results Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Kecepatan cc/jam */}
          <div className="bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
              Laju Syringe Pump
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {result.rateCcPerHour}
              </span>
              <span className="text-sm font-semibold text-rose-400">cc/jam</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Set pada display: <strong>{result.rateCcPerHour} mL/jam</strong>
            </div>
          </div>

          {/* Kecepatan cc/menit */}
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
              Laju aliran per menit
            </div>
          </div>

          {/* Konsentrasi Larutan */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Konsentrasi Campuran
            </div>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {result.concentrationDisplay}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Dilarutkan dlm {syringeVolumeMl} cc {diluentType}
            </div>
          </div>

          {/* Faktor Pengali / Titrasi Cepat */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Faktor Pengali
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
                {result.multiplierFactor}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              cc/jam = Dosis × {result.multiplierFactor}
            </div>
          </div>
        </div>

        {/* Reverse Calculator (Hitung Mundur Dosis Masuk) */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">
                Kalkulator Terbalik (Cek Dosis Masuk dari Laju Alat)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReverseCalc(!showReverseCalc)}
              className="text-xs text-rose-400 hover:text-rose-300 underline"
            >
              {showReverseCalc ? 'Sembunyikan' : 'Buka Kalkulator Mundur'}
            </button>
          </div>

          {showReverseCalc && (
            <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
              <p className="text-slate-400">
                Gunakan ini saat operan shift untuk memverifikasi berapa dosis aktual yang diterima pasien dari display pompa saat ini:
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-64 relative">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Angka Laju Pompa Saat Ini:
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={reverseRateInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (/^[0-9]*\.?[0-9]*$/.test(val)) setReverseRateInput(val);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-semibold"
                    placeholder="2.0"
                  />
                  <span className="absolute right-3 top-7 text-xs text-slate-400">cc/jam</span>
                </div>

                <div className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-around gap-4 flex-wrap">
                  {doseUnit.startsWith('mg') || (drugAmountUnit === 'mg' && selectedPresetId === 'furosemide') ? (
                    <>
                      <div>
                        <div className="text-[10px] text-slate-400">Dosis per jam:</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {reverseResult.mgHour} <span className="text-xs text-slate-300">mg/jam</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                      <div>
                        <div className="text-[10px] text-slate-400">Dosis per BB:</div>
                        <div className="text-lg font-bold text-blue-400">
                          {reverseResult.mgKgHour} <span className="text-xs text-slate-300">mg/kg/jam</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                      <div>
                        <div className="text-[10px] text-slate-400">Laju per menit:</div>
                        <div className="text-sm font-semibold text-purple-400">
                          {Number(((reverseResult.mgHour || 0) / 60).toFixed(2))} <span className="text-[10px] text-slate-300">mg/menit</span>
                        </div>
                      </div>
                    </>
                  ) : drugAmountUnit === 'IU' ? (
                    <>
                      <div>
                        <div className="text-[10px] text-slate-400">Dosis Insulin masuk:</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {Number((reverseRateCcPerHour * (drugAmount / syringeVolumeMl)).toFixed(2))}{' '}
                          <span className="text-xs text-slate-300">IU/jam</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800"></div>
                      <div>
                        <div className="text-[10px] text-slate-400">Per menit:</div>
                        <div className="text-base font-bold text-blue-400">
                          {Number(((reverseRateCcPerHour * (drugAmount / syringeVolumeMl)) / 60).toFixed(3))}{' '}
                          <span className="text-xs text-slate-300">IU/menit</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-[10px] text-slate-400">Dosis per BB:</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {reverseResult.mcgKgMin} <span className="text-xs text-slate-300">mcg/kg/min</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-800"></div>
                      <div>
                        <div className="text-[10px] text-slate-400">Total mcg per menit:</div>
                        <div className="text-lg font-bold text-blue-400">
                          {reverseResult.mcgMin} <span className="text-xs text-slate-300">mcg/min</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Formula Breakdown */}
        <div className="border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Lihat Langkah Perhitungan & Rumus Klinis (Verifikasi)</span>
          </button>

          {showFormula && (
            <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-rose-400">Langkah Matematika:</div>
              {result.stepByStepFormula.map((step, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded font-mono text-slate-200 border border-slate-800">
                  {step}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Note for Selected Drug */}
        {activePreset && (
          <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Catatan Klinis {activePreset.name}:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{activePreset.clinicalNote}</p>
            {activePreset.incompatibleWith && (
              <div className="text-[11px] text-red-400 pt-1 border-t border-slate-800/80">
                <strong>Inkompatibel (JANGAN dicampur):</strong> {activePreset.incompatibleWith.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
