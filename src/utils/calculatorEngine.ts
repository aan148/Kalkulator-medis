import {
  InfusionCalcInput,
  InfusionCalcResult,
  SyringePumpMeqInput,
  SyringePumpMeqResult,
  SyringePumpDrugInput,
  SyringePumpDrugResult,
  PediatricFluidInput,
  PediatricFluidResult,
  PediatricTransfusionInput,
  PediatricTransfusionResult,
} from '../types';

/**
 * Kalkulasi Tetesan Infus (TPM & Detik Per Tetes)
 * Rumus: TPM = (Volume x Faktor Tetes) / (Waktu dlm menit)
 * Interval = 60 / TPM detik
 */
export function calculateInfusion(input: InfusionCalcInput): InfusionCalcResult {
  const totalMinutes = input.timeHours * 60 + input.timeMinutes;

  if (totalMinutes <= 0 || input.volumeMl <= 0 || input.dropFactor <= 0) {
    return {
      tpm: 0,
      exactTpm: 0,
      secondsPerDrop: 0,
      mlPerHour: 0,
      mlPerMinute: 0,
      totalDurationMinutes: totalMinutes,
      formulaDescription: 'Input tidak valid',
    };
  }

  const exactTpm = (input.volumeMl * input.dropFactor) / totalMinutes;
  const roundedTpm = Math.round(exactTpm);
  const secondsPerDrop = exactTpm > 0 ? 60 / exactTpm : 0;
  const mlPerHour = (input.volumeMl / totalMinutes) * 60;
  const mlPerMinute = input.volumeMl / totalMinutes;

  const formulaDescription = `TPM = (${input.volumeMl} mL × ${input.dropFactor} gtt/mL) ÷ ${totalMinutes} menit = ${exactTpm.toFixed(2)} TPM (dibulatkan: ${roundedTpm} tetes/menit). Interval: 60 detik ÷ ${roundedTpm} = ${secondsPerDrop.toFixed(1)} detik per tetes.`;

  return {
    tpm: roundedTpm,
    exactTpm: Number(exactTpm.toFixed(2)),
    secondsPerDrop: Number(secondsPerDrop.toFixed(2)),
    mlPerHour: Number(mlPerHour.toFixed(1)),
    mlPerMinute: Number(mlPerMinute.toFixed(2)),
    totalDurationMinutes: totalMinutes,
    formulaDescription,
  };
}

/**
 * Kalkulasi Syringe Pump Elektrolit Pekat (mEq, cc/jam, cc/menit)
 * Contoh: KCl 25 mEq dilarutkan dlm 50cc Spuit
 */
export function calculateSyringePumpMeq(input: SyringePumpMeqInput): SyringePumpMeqResult {
  const sourceElectrolyteMl =
    input.sourceConcentrationMeqPerMl > 0
      ? input.targetMeq / input.sourceConcentrationMeqPerMl
      : 0;

  const diluentVolumeMl = Math.max(0, input.syringeVolumeMl - sourceElectrolyteMl);
  const finalConcentrationMeqPerMl =
    input.syringeVolumeMl > 0 ? input.targetMeq / input.syringeVolumeMl : 0;

  const rateCcPerHour =
    input.durationHours > 0 ? input.syringeVolumeMl / input.durationHours : 0;
  const rateCcPerMinute = rateCcPerHour / 60;

  const deliveryRateMeqPerHour =
    input.durationHours > 0 ? input.targetMeq / input.durationHours : 0;
  const deliveryRateMeqPerMinute = deliveryRateMeqPerHour / 60;

  let safetyNote = '';
  let isHighAlert = false;

  // Cek batas keselamatan Kalium (KCl)
  if (deliveryRateMeqPerHour > 20) {
    safetyNote =
      'PERINGATAN BAHAYA: Laju pemberian kalium >20 mEq/jam berisiko tinggi aritmia mematikan! Maksimal laju perifer adalah 10 mEq/jam dan vena sentral 20 mEq/jam dengan continuous ECG.';
    isHighAlert = true;
  } else if (deliveryRateMeqPerHour > 10) {
    safetyNote =
      'PERHATIAN: Laju kalium >10 mEq/jam memerlukan pengawasan ketat, disarankan menggunakan akses Vena Sentral (CVC) dan monitor EKG bedside.';
    isHighAlert = true;
  } else if (finalConcentrationMeqPerMl > 0.08 && input.syringeVolumeMl >= 500) {
    safetyNote =
      'Konsentrasi kalium >40-60 mEq/L pada infus perifer dapat menyebabkan nyeri dan flebitis.';
    isHighAlert = false;
  }

  return {
    sourceElectrolyteMl: Number(sourceElectrolyteMl.toFixed(2)),
    diluentVolumeMl: Number(diluentVolumeMl.toFixed(2)),
    finalConcentrationMeqPerMl: Number(finalConcentrationMeqPerMl.toFixed(3)),
    rateCcPerHour: Number(rateCcPerHour.toFixed(2)),
    rateCcPerMinute: Number(rateCcPerMinute.toFixed(3)),
    deliveryRateMeqPerHour: Number(deliveryRateMeqPerHour.toFixed(2)),
    deliveryRateMeqPerMinute: Number(deliveryRateMeqPerMinute.toFixed(3)),
    safetyNote,
    isHighAlert,
  };
}

/**
 * Kalkulasi Syringe Pump Obat / Inotropik
 * Mendukung satuan: mcg/kg/min, mcg/min, mg/kg/hr, mg/hr, IU/hr
 */
export function calculateSyringePumpDrug(input: SyringePumpDrugInput): SyringePumpDrugResult {
  const steps: string[] = [];

  // Hitung total jumlah obat dalam mcg
  let totalMcg = 0;
  let concentrationDisplay = '';
  let concentrationMcgPerMl = 0;
  let concentrationMgPerMl = 0;
  let concentrationIuPerMl = 0;

  if (input.drugAmountUnit === 'mg') {
    totalMcg = input.drugAmount * 1000;
    concentrationMcgPerMl = input.syringeVolumeMl > 0 ? totalMcg / input.syringeVolumeMl : 0;
    concentrationMgPerMl =
      input.syringeVolumeMl > 0 ? input.drugAmount / input.syringeVolumeMl : 0;
    concentrationDisplay = `${concentrationMcgPerMl.toFixed(1)} mcg/cc (${concentrationMgPerMl.toFixed(2)} mg/cc)`;
    steps.push(
      `1. Konsentrasi: ${input.drugAmount} mg = ${totalMcg} mcg dilarutkan dlm ${input.syringeVolumeMl} cc = ${concentrationMcgPerMl.toFixed(1)} mcg/cc.`
    );
  } else if (input.drugAmountUnit === 'mcg') {
    totalMcg = input.drugAmount;
    concentrationMcgPerMl = input.syringeVolumeMl > 0 ? totalMcg / input.syringeVolumeMl : 0;
    concentrationDisplay = `${concentrationMcgPerMl.toFixed(1)} mcg/cc`;
    steps.push(
      `1. Konsentrasi: ${input.drugAmount} mcg dilarutkan dlm ${input.syringeVolumeMl} cc = ${concentrationMcgPerMl.toFixed(1)} mcg/cc.`
    );
  } else {
    // IU
    concentrationIuPerMl = input.syringeVolumeMl > 0 ? input.drugAmount / input.syringeVolumeMl : 0;
    concentrationDisplay = `${concentrationIuPerMl.toFixed(2)} IU/cc`;
    steps.push(
      `1. Konsentrasi: ${input.drugAmount} IU dilarutkan dlm ${input.syringeVolumeMl} cc = ${concentrationIuPerMl.toFixed(2)} IU/cc.`
    );
  }

  let rateCcPerHour = 0;
  let multiplierFactor = 0;

  if (input.doseUnit === 'mcg/kg/min') {
    // Rumus: Kecepatan (cc/jam) = (Dosis x BB x 60) / Konsentrasi(mcg/cc)
    if (concentrationMcgPerMl > 0) {
      rateCcPerHour = (input.dose * input.patientWeightKg * 60) / concentrationMcgPerMl;
      multiplierFactor = (input.patientWeightKg * 60) / concentrationMcgPerMl;
      steps.push(
        `2. Rumus: (Dosis [${input.dose}] × BB [${input.patientWeightKg} kg] × 60 menit) ÷ Konsentrasi [${concentrationMcgPerMl.toFixed(1)} mcg/cc]`
      );
      steps.push(
        `3. Perhitungan: (${(input.dose * input.patientWeightKg * 60).toFixed(1)}) ÷ ${concentrationMcgPerMl.toFixed(1)} = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'mcg/min') {
    // Rumus: Kecepatan (cc/jam) = (Dosis x 60) / Konsentrasi(mcg/cc)
    if (concentrationMcgPerMl > 0) {
      rateCcPerHour = (input.dose * 60) / concentrationMcgPerMl;
      multiplierFactor = 60 / concentrationMcgPerMl;
      steps.push(
        `2. Rumus: (Dosis [${input.dose} mcg/min] × 60 menit) ÷ Konsentrasi [${concentrationMcgPerMl.toFixed(1)} mcg/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'mcg/kg/hr') {
    // Rumus: Kecepatan (cc/jam) = (Dosis x BB) / Konsentrasi(mcg/cc)
    if (concentrationMcgPerMl > 0) {
      rateCcPerHour = (input.dose * input.patientWeightKg) / concentrationMcgPerMl;
      multiplierFactor = input.patientWeightKg / concentrationMcgPerMl;
      steps.push(
        `2. Rumus: (Dosis [${input.dose} mcg/kg/jam] × BB [${input.patientWeightKg} kg]) ÷ Konsentrasi [${concentrationMcgPerMl.toFixed(1)} mcg/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'mcg/hr') {
    // Rumus: Kecepatan (cc/jam) = Dosis / Konsentrasi(mcg/cc)
    if (concentrationMcgPerMl > 0) {
      rateCcPerHour = input.dose / concentrationMcgPerMl;
      multiplierFactor = 1 / concentrationMcgPerMl;
      steps.push(
        `2. Rumus: Dosis [${input.dose} mcg/jam] ÷ Konsentrasi [${concentrationMcgPerMl.toFixed(1)} mcg/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'mg/kg/hr') {
    // Rumus: Kecepatan (cc/jam) = (Dosis x BB) / Konsentrasi(mg/cc)
    if (concentrationMgPerMl > 0) {
      rateCcPerHour = (input.dose * input.patientWeightKg) / concentrationMgPerMl;
      multiplierFactor = input.patientWeightKg / concentrationMgPerMl;
      steps.push(
        `2. Rumus: (Dosis [${input.dose} mg/kg/jam] × BB [${input.patientWeightKg} kg]) ÷ Konsentrasi [${concentrationMgPerMl.toFixed(2)} mg/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'mg/hr') {
    // Rumus: Kecepatan (cc/jam) = Dosis / Konsentrasi(mg/cc)
    if (concentrationMgPerMl > 0) {
      rateCcPerHour = input.dose / concentrationMgPerMl;
      multiplierFactor = 1 / concentrationMgPerMl;
      steps.push(
        `2. Rumus: Dosis [${input.dose} mg/jam] ÷ Konsentrasi [${concentrationMgPerMl.toFixed(2)} mg/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  } else if (input.doseUnit === 'IU/hr') {
    // Rumus: Kecepatan (cc/jam) = Dosis / Konsentrasi(IU/cc)
    if (concentrationIuPerMl > 0) {
      rateCcPerHour = input.dose / concentrationIuPerMl;
      multiplierFactor = 1 / concentrationIuPerMl;
      steps.push(
        `2. Rumus: Dosis [${input.dose} IU/jam] ÷ Konsentrasi [${concentrationIuPerMl.toFixed(2)} IU/cc] = ${rateCcPerHour.toFixed(2)} cc/jam`
      );
    }
  }

  const rateCcPerMinute = rateCcPerHour / 60;
  steps.push(
    `4. Laju per menit: ${rateCcPerHour.toFixed(2)} cc/jam ÷ 60 = ${rateCcPerMinute.toFixed(3)} cc/menit (mL/menit)`
  );

  return {
    finalConcentrationMcgPerMl: Number(concentrationMcgPerMl.toFixed(2)),
    finalConcentrationMgPerMl: Number(concentrationMgPerMl.toFixed(3)),
    rateCcPerHour: Number(rateCcPerHour.toFixed(2)),
    rateCcPerMinute: Number(rateCcPerMinute.toFixed(3)),
    concentrationDisplay,
    multiplierFactor: Number(multiplierFactor.toFixed(3)),
    stepByStepFormula: steps,
  };
}

/**
 * Reverse Calculation: Mengetahui dosis masuk dari kecepatan alat (cc/jam)
 * Mendukung mcg/kg/menit, mcg/menit, mg/jam, dan mg/kg/jam
 */
export function calculateReverseDose(
  rateCcPerHour: number,
  weightKg: number,
  concentrationMcgPerMl: number,
  concentrationMgPerMl: number = 0
): {
  mcgKgMin: number;
  mcgMin: number;
  mgHour: number;
  mgKgHour: number;
} {
  const effMgPerMl =
    concentrationMgPerMl > 0 ? concentrationMgPerMl : concentrationMcgPerMl > 0 ? concentrationMcgPerMl / 1000 : 0;
  const effMcgPerMl =
    concentrationMcgPerMl > 0 ? concentrationMcgPerMl : concentrationMgPerMl * 1000;

  if ((effMcgPerMl <= 0 && effMgPerMl <= 0) || rateCcPerHour <= 0) {
    return { mcgKgMin: 0, mcgMin: 0, mgHour: 0, mgKgHour: 0 };
  }

  const mcgMin = (rateCcPerHour * effMcgPerMl) / 60;
  const mcgKgMin = weightKg > 0 ? mcgMin / weightKg : 0;
  const mgHour = rateCcPerHour * effMgPerMl;
  const mgKgHour = weightKg > 0 ? mgHour / weightKg : 0;

  return {
    mcgKgMin: Number(mcgKgMin.toFixed(3)),
    mcgMin: Number(mcgMin.toFixed(2)),
    mgHour: Number(mgHour.toFixed(2)),
    mgKgHour: Number(mgKgHour.toFixed(3)),
  };
}

/**
 * Kalkulasi Kebutuhan Cairan Rumatan & Infus Anak (Pediatrik)
 * Menggunakan Rumus Holliday-Segar + Koreksi Klinis (Suhu/Demam/Restriksi)
 */
export function calculatePediatricFluid(input: PediatricFluidInput): PediatricFluidResult {
  const weight = Math.max(0.1, input.weightKg);
  let baseDailyVolumeMl = 0;
  let hollidaySegarBreakdown = '';

  if (weight <= 10) {
    baseDailyVolumeMl = weight * 100;
    hollidaySegarBreakdown = `${weight} kg × 100 mL/kg = ${baseDailyVolumeMl.toFixed(0)} mL/24 jam (${(baseDailyVolumeMl / 24).toFixed(1)} mL/jam)`;
  } else if (weight <= 20) {
    const additional = (weight - 10) * 50;
    baseDailyVolumeMl = 1000 + additional;
    hollidaySegarBreakdown = `1000 mL + (${(weight - 10).toFixed(1)} kg × 50 mL/kg) = ${baseDailyVolumeMl.toFixed(0)} mL/24 jam (${(baseDailyVolumeMl / 24).toFixed(1)} mL/jam)`;
  } else {
    const additional = (weight - 20) * 20;
    baseDailyVolumeMl = 1500 + additional;
    hollidaySegarBreakdown = `1500 mL + (${(weight - 20).toFixed(1)} kg × 20 mL/kg) = ${baseDailyVolumeMl.toFixed(0)} mL/24 jam (${(baseDailyVolumeMl / 24).toFixed(1)} mL/jam)`;
  }

  // Koreksi suhu tubuh (demam): penambahan 12% dari volume dasar per 1°C kenaikan di atas 37.5°C
  const tempDiff = Math.max(0, input.temperatureC - 37.5);
  const temperatureAdjustmentMl = Math.round(baseDailyVolumeMl * (tempDiff * 0.12));

  let totalDailyVolumeMl = baseDailyVolumeMl;
  let formulaDescription = '';

  if (input.clinicalCondition === 'kustom' && input.customTotalVolumeMl && input.customTotalVolumeMl > 0) {
    totalDailyVolumeMl = input.customTotalVolumeMl;
    formulaDescription = `Volume harian kustom sesuai instruksi dokter: ${totalDailyVolumeMl} mL/24 jam.`;
  } else if (input.clinicalCondition === 'demam' || tempDiff > 0) {
    totalDailyVolumeMl = baseDailyVolumeMl + temperatureAdjustmentMl;
    formulaDescription = `Rumatan dasar Holliday-Segar: ${baseDailyVolumeMl} mL + Koreksi demam (${tempDiff.toFixed(1)}°C di atas 37.5°C = +${temperatureAdjustmentMl} mL) = Total ${totalDailyVolumeMl} mL/24 jam.`;
  } else if (input.clinicalCondition === 'restriksi') {
    const percent = input.restrictionPercent || 80;
    totalDailyVolumeMl = Math.round(baseDailyVolumeMl * (percent / 100));
    formulaDescription = `Restriksi cairan ${percent}% dari rumatan dasar (${baseDailyVolumeMl} mL) = ${totalDailyVolumeMl} mL/24 jam.`;
  } else if (input.clinicalCondition === 'ringan_sedang') {
    const deficitEstimate = Math.round(weight * 30);
    totalDailyVolumeMl = Math.round(baseDailyVolumeMl + deficitEstimate);
    formulaDescription = `Rumatan dasar: ${baseDailyVolumeMl} mL + Estimasi penggantian defisit ringan-sedang (+${deficitEstimate} mL) = Total ${totalDailyVolumeMl} mL/24 jam.`;
  } else {
    totalDailyVolumeMl = baseDailyVolumeMl;
    formulaDescription = `Kebutuhan rumatan baku Holliday-Segar 24 jam untuk anak BB ${weight} kg adalah ${baseDailyVolumeMl} mL.`;
  }

  const durationHours = Math.max(0.1, input.durationHours || 24);
  const prescribedVolumeForDurationMl = Math.round((totalDailyVolumeMl / 24) * durationHours);
  const hourlyRateMl = Number((prescribedVolumeForDurationMl / durationHours).toFixed(1));
  const minuteRateMl = Number((hourlyRateMl / 60).toFixed(2));

  // Microdrip (60 gtt/mL) -> 1 mL/jam = 1 tetes mikro/menit
  const microDripTpm = Math.round((prescribedVolumeForDurationMl * 60) / (durationHours * 60));
  const microSecondsPerDrop = microDripTpm > 0 ? Number((60 / microDripTpm).toFixed(1)) : 0;

  // Macrodrip (20 gtt/mL dan 15 gtt/mL)
  const macro20Tpm = Math.round((prescribedVolumeForDurationMl * 20) / (durationHours * 60));
  const macro15Tpm = Math.round((prescribedVolumeForDurationMl * 15) / (durationHours * 60));

  const safetyAlerts: string[] = [];
  if (weight < 5) {
    safetyAlerts.push('Pasien neonatus/bayi kecil: Wajib menggunakan Syringe Pump atau Infusion Pump berpengaman mikro.');
  }
  if (microDripTpm > 150) {
    safetyAlerts.push('Kecepatan tetesan tinggi: Pastikan tidak terjadi kelebihan volume (fluid overload). Monitor tanda ronkhi, takipnea, dan edema.');
  }
  safetyAlerts.push('Pada set infus mikro (60 tetes/mL), angka mL/jam tepat sama dengan angka TPM mikro.');

  return {
    baseDailyVolumeMl,
    temperatureAdjustmentMl,
    totalDailyVolumeMl,
    prescribedVolumeForDurationMl,
    hourlyRateMl,
    minuteRateMl,
    microDripTpm,
    microSecondsPerDrop,
    macro20Tpm,
    macro15Tpm,
    formulaDescription,
    hollidaySegarBreakdown,
    safetyAlerts,
  };
}

/**
 * Kalkulasi Dosis & Laju Transfusi Darah Anak (Pediatrik)
 * Mendukung PRC (Packed Red Cells), Trombosit (TC), FFP, Kriopresipitat, dan WB
 */
export function calculatePediatricTransfusion(input: PediatricTransfusionInput): PediatricTransfusionResult {
  const weight = Math.max(0.1, input.weightKg);
  let calculatedVolumeMl = 0;
  let componentName = 'Packed Red Cells (PRC)';
  let expectedHbRise: number | undefined;
  let expectedPlateletRise: string | undefined;
  const recommendations: string[] = [];

  // Batas aman pemberian dalam satu sesi (biasanya 10-15 mL/kg, max ~300 mL per kantong)
  const safeMaxVolumePerSessionMl = Math.round(weight * 15);

  switch (input.componentType) {
    case 'prc': {
      componentName = 'Packed Red Cells (PRC)';
      if (input.calculationMethod === 'formula_hb') {
        const currentHb = input.currentHb ?? 7;
        const targetHb = input.targetHb ?? 10;
        const deltaHb = Math.max(0, targetHb - currentHb);
        const factor = input.prcFactor || 4;
        calculatedVolumeMl = Math.round(weight * deltaHb * factor);
        expectedHbRise = deltaHb;
        recommendations.push(
          `Rumus IDAI: BB (${weight} kg) × ΔHb (${deltaHb.toFixed(1)} g/dL) × Faktor ${factor} = ${calculatedVolumeMl} mL PRC.`
        );
      } else {
        const dose = input.empiricalDoseMlPerKg || 10;
        calculatedVolumeMl = Math.round(weight * dose);
        expectedHbRise = Number((calculatedVolumeMl / (weight * 4)).toFixed(1));
        recommendations.push(
          `Dosis empiris: ${weight} kg × ${dose} mL/kg = ${calculatedVolumeMl} mL PRC. Estimasi kenaikan Hb: ~${expectedHbRise} g/dL.`
        );
      }
      recommendations.push('Kenaikan Hb rata-rata: 10 mL/kg PRC menaikkan Hb sekitar 2-3 g/dL.');
      break;
    }
    case 'tc': {
      componentName = 'Thrombocyte Concentrate (TC / Trombosit)';
      const dose = input.empiricalDoseMlPerKg || 10;
      calculatedVolumeMl = Math.round(weight * dose);
      const unitsEquivalent = Math.max(1, Math.round(weight / 10));
      expectedPlateletRise = '+30.000 s/d 50.000 /µL';
      recommendations.push(
        `Dosis pediatrik: 1 unit TC per 10 kg BB (setara ~${unitsEquivalent} unit atau ${dose} mL/kg = ${calculatedVolumeMl} mL).`
      );
      recommendations.push('Diberikan segera setelah sampai dari bank darah (jangan disimpan dalam suhu kulkas biasa tanpa agitator).');
      break;
    }
    case 'ffp': {
      componentName = 'Fresh Frozen Plasma (FFP)';
      const dose = input.empiricalDoseMlPerKg || 10;
      calculatedVolumeMl = Math.round(weight * dose);
      recommendations.push(
        `Dosis pediatrik: ${dose} mL/kg (kisaran aman 10 - 15 mL/kg) = ${calculatedVolumeMl} mL FFP.`
      );
      recommendations.push('Gunakan dalam 2-4 jam setelah dicairkan (thawing). Indikasi: defisiensi faktor pembekuan multipel.');
      break;
    }
    case 'cryo': {
      componentName = 'Kriopresipitat (Cryoprecipitate)';
      const units = Math.max(1, Math.ceil(weight / 7));
      const dose = input.empiricalDoseMlPerKg || 5;
      calculatedVolumeMl = Math.round(weight * dose);
      recommendations.push(
        `Dosis pediatrik: 1 kantong per 5-10 kg BB (~${units} kantong) atau 5 mL/kg = ${calculatedVolumeMl} mL.`
      );
      recommendations.push('Kaya akan faktor VIII, fibrinogen, dan von Willebrand factor.');
      break;
    }
    case 'wb': {
      componentName = 'Whole Blood (WB / Darah Lengkap)';
      if (input.calculationMethod === 'formula_hb') {
        const deltaHb = Math.max(0, (input.targetHb ?? 10) - (input.currentHb ?? 7));
        calculatedVolumeMl = Math.round(weight * deltaHb * 6);
        expectedHbRise = deltaHb;
        recommendations.push(
          `Rumus WB: BB (${weight} kg) × ΔHb (${deltaHb.toFixed(1)} g/dL) × 6 = ${calculatedVolumeMl} mL.`
        );
      } else {
        const dose = input.empiricalDoseMlPerKg || 20;
        calculatedVolumeMl = Math.round(weight * dose);
        recommendations.push(`Dosis empiris WB: ${weight} kg × ${dose} mL/kg = ${calculatedVolumeMl} mL.`);
      }
      recommendations.push('Biasanya diindikasikan pada perdarahan masif akut yang membutuhkan ekspansi volume dan eritrosit.');
      break;
    }
  }

  const isExceedingSafeLimit = calculatedVolumeMl > safeMaxVolumePerSessionMl;
  if (isExceedingSafeLimit) {
    recommendations.push(
      `Peringatan Volume: Volume terhitung (${calculatedVolumeMl} mL) melebihi batas aman 1 sesi (${safeMaxVolumePerSessionMl} mL). Pertimbangkan membagi transfusi menjadi 2 sesi berselang 12-24 jam atau memberikan Furosemid (bila diinstruksikan DPJP) guna mencegah TACO.`
    );
  }

  // Durasi transfusi (maksimum 4 jam dari waktu darah dikeluarkan dari pendingin)
  const durationHours = Math.max(1, Math.min(4, input.durationHours || 3));
  const hourlyRateMl = Number((calculatedVolumeMl / durationHours).toFixed(1));
  const minuteRateMl = Number((hourlyRateMl / 60).toFixed(2));

  // Blood transfusion set standar: 15 gtt/mL
  const bloodSetTpm = Math.round((calculatedVolumeMl * 15) / (durationHours * 60));
  const bloodSetSecondsPerDrop = bloodSetTpm > 0 ? Number((60 / bloodSetTpm).toFixed(1)) : 0;

  // Fase observasi 15 menit pertama (1 - 2 mL/kg/jam)
  const initialObservationRateMlPerHour = Number((weight * 1.5).toFixed(1));
  const initialObservationTpm = Math.max(2, Math.round((initialObservationRateMlPerHour * 15) / 60));

  const safetyChecklist = [
    'Verifikasi Identitas & Label: Cek nama anak, No. Rekam Medis, golongan darah ABO/Rhesus, dan nomor kantong darah bersama perawat kedua.',
    'Pemberian Harus Tuntas < 4 Jam: Darah tidak boleh menggantung lebih dari 4 jam sejak keluar dari bank darah karena risiko pertumbuhan bakteri.',
    'Observasi 15 Menit Pertama: Awasi ketat tanda vital anak (suhu, nadi, laju napas, tensi) dengan tetesan lambat untuk deteksi dini reaksi transfusi.',
    'Hentikan Segera Jika Muncul: Demam mendadak (kenaikan >1°C), menggigil, sesak napas, ruam kemerahan/urtikaria, atau urin kemerahan.',
  ];

  return {
    componentName,
    calculatedVolumeMl,
    safeMaxVolumePerSessionMl,
    isExceedingSafeLimit,
    expectedHbRise,
    expectedPlateletRise,
    hourlyRateMl,
    minuteRateMl,
    bloodSetTpm,
    bloodSetSecondsPerDrop,
    initialObservationRateMlPerHour,
    initialObservationTpm,
    durationHours,
    recommendations,
    safetyChecklist,
  };
}

