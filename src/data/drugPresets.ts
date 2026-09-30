import { DrugPreset } from '../types';

export const POPULAR_DRUG_PRESETS: DrugPreset[] = [
  {
    id: 'norepinephrine',
    name: 'Norepinefrin (Vascon / Levophed)',
    genericName: 'Norepinephrine bitartrate',
    category: 'vasopresor',
    standardVialMg: 4,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mcg/kg/min',
    defaultDose: 0.05,
    minDose: 0.01,
    maxDose: 1.0,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    incompatibleWith: ['Larutan basa (Bikarbonat)'],
    clinicalNote:
      'Vasopresor lini pertama syok septik & syok distributif. Dilarutkan 4 mg dlm 50 cc D5%/NS -> Konsentrasi 80 mcg/cc.',
  },
  {
    id: 'dopamine',
    name: 'Dopamin',
    genericName: 'Dopamine HCl',
    category: 'inotropik',
    standardVialMg: 200,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mcg/kg/min',
    defaultDose: 5,
    minDose: 2,
    maxDose: 20,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    incompatibleWith: ['Natrium Bikarbonat 8.4% (inaktivasi dopamin)'],
    clinicalNote:
      'Dosis renal: 2-5 mcg/kg/min; Inotropik: 5-10 mcg/kg/min; Vasokonstriktor: 10-20 mcg/kg/min. 200 mg dlm 50 cc -> 4000 mcg/cc.',
  },
  {
    id: 'dobutamine',
    name: 'Dobutamin (Dobutrex)',
    genericName: 'Dobutamine HCl',
    category: 'inotropik',
    standardVialMg: 250,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mcg/kg/min',
    defaultDose: 5,
    minDose: 2.5,
    maxDose: 20,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    incompatibleWith: ['Larutan alkali kuat / Bikarbonat'],
    clinicalNote:
      'Inotropik untuk gagal jantung dekompensasi & syok kardiogenik. 250 mg dlm 50 cc -> 5000 mcg/cc.',
  },
  {
    id: 'nicardipine',
    name: 'Nicardipine (Perdipine)',
    genericName: 'Nicardipine HCl',
    category: 'antihipertensi',
    standardVialMg: 10,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mcg/kg/min',
    defaultDose: 1.0,
    minDose: 0.5,
    maxDose: 5.0,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    clinicalNote:
      'Calcium channel blocker untuk krisis hipertensi & stroke hemoragik. 10 mg dlm 50 cc -> 200 mcg/cc (0.2 mg/cc). Bisa titrasi 2.5-15 mg/jam.',
  },
  {
    id: 'insulin_regular',
    name: 'Insulin Reguler (Actrapid / Novorapid)',
    genericName: 'Human Regular Insulin',
    category: 'insulin',
    standardVialMg: 50, // 50 IU
    standardSyringeMl: 50,
    unit: 'IU',
    doseUnit: 'IU/hr',
    defaultDose: 2.0,
    minDose: 0.5,
    maxDose: 20.0,
    compatibleDiluents: ['NaCl 0.9%'],
    clinicalNote:
      'Protokol KAD / Hiperglikemia kritis. Standar oplosan 50 IU dlm 50 cc NaCl 0.9% -> Rasio 1 IU / 1 cc (kecepatan cc/jam = IU/jam).',
  },
  {
    id: 'nitroglycerin',
    name: 'Nitrogliserin (NTG)',
    genericName: 'Nitroglycerin / Glyceryl trinitrate',
    category: 'antihipertensi',
    standardVialMg: 10,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mcg/min',
    defaultDose: 10,
    minDose: 5,
    maxDose: 200,
    compatibleDiluents: ['Dextrose 5%', 'NaCl 0.9%'],
    clinicalNote:
      'Venodilator untuk sindrom koroner akut (UAP/NSTEMI) & edema paru akut kardiogenik. 10 mg dlm 50 cc -> 200 mcg/cc.',
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    genericName: 'Fentanyl citrate',
    category: 'sedasi',
    standardVialMg: 0.5, // 500 mcg = 0.5 mg
    standardSyringeMl: 50,
    unit: 'mcg',
    doseUnit: 'mcg/kg/hr',
    defaultDose: 1.0,
    minDose: 0.5,
    maxDose: 3.0,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    clinicalNote:
      'Analgetik opioid kuat untuk pasien ventilator / sedasi ICU. 500 mcg dlm 50 cc -> 10 mcg/cc.',
  },
  {
    id: 'midazolam',
    name: 'Midazolam (Miloz / Sedacum)',
    genericName: 'Midazolam HCl',
    category: 'sedasi',
    standardVialMg: 50,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mg/kg/hr',
    defaultDose: 0.05,
    minDose: 0.02,
    maxDose: 0.2,
    compatibleDiluents: ['NaCl 0.9%', 'Dextrose 5%'],
    clinicalNote:
      'Sedasi kontinu pada pasien ICU intubasi atau status epileptikus refrakter. 50 mg dlm 50 cc -> 1 mg/cc.',
  },
  {
    id: 'amiodarone',
    name: 'Amiodaron (Cordarone)',
    genericName: 'Amiodarone HCl',
    category: 'lainnya',
    standardVialMg: 300,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mg/hr',
    defaultDose: 40,
    minDose: 20,
    maxDose: 60,
    compatibleDiluents: ['Dextrose 5% (WAJIB D5W)'],
    incompatibleWith: ['NaCl 0.9% (dapat mengendap/tidak stabil)'],
    clinicalNote:
      'Anti-aritmia VT/VF refrakter. Drip pemeliharaan 300 mg dlm 50 cc D5W -> 6 mg/cc. Berikan 1 mg/menit (60 mg/jam) selama 6 jam pertama, lalu 0.5 mg/menit (30 mg/jam).',
  },
  {
    id: 'furosemide',
    name: 'Furosemide (Lasix)',
    genericName: 'Furosemide',
    category: 'diuretik',
    standardVialMg: 100,
    standardSyringeMl: 50,
    unit: 'mg',
    doseUnit: 'mg/hr',
    defaultDose: 5,
    minDose: 1,
    maxDose: 40,
    compatibleDiluents: ['NaCl 0.9%', 'Ringer Laktat (RL)'],
    incompatibleWith: [
      'Larutan Asam (pH < 5.5)',
      'Amiodaron',
      'Dobutamin',
      'Milrinon',
      'Midazolam',
      'Ciprofloxacin',
      'Morfina (presipitasi kristal)',
    ],
    clinicalNote:
      'Diuretik loop kontinu untuk Gagal Jantung Kongestif / ADHF, Edema Paru, dan Overload Cairan/Oliguria. Oplosan lazim: 100 mg (5 ampul) atau 200 mg (10 ampul) dlm 50 cc NaCl 0.9% -> Konsentrasi 2 - 4 mg/cc. Dosis titrasi dewasa: 2.5 - 20 mg/jam (pediatrik 0.1 - 0.5 mg/kg/jam). PERINGATAN: Laju maksimal infus jangan melebihi 4 mg/menit untuk mencegah ototoksisitas (tuli transien/permanen). Pantau ketat produksi urin, Kalium (risiko hipokalemia), dan TD.',
  },
];

export interface ElectrolytePreset {
  id: string;
  name: string;
  chemicalName: string;
  standardConcentrationMeqPerMl: number;
  standardPackDescription: string;
  safeMaxDeliveryRate: string;
  peripherialLineMaxConcentration: string;
  centralLineMaxConcentration: string;
  clinicalSafetyNotes: string;
}

export const ELECTROLYTE_PRESETS: ElectrolytePreset[] = [
  {
    id: 'kcl_746',
    name: 'KCl 7.46% (Kalium Klorida)',
    chemicalName: 'Potassium Chloride',
    standardConcentrationMeqPerMl: 1.0, // 1 mL = 1 mEq
    standardPackDescription: 'Ampul 25 mL = 25 mEq K+ (1 mEq/mL)',
    safeMaxDeliveryRate: 'Maksimal 10 - 20 mEq/jam (Wajib monitor EKG jika >10 mEq/jam)',
    peripherialLineMaxConcentration: 'Vena Perifer: Maksimal 40 - 60 mEq/Liter cairan pelarut',
    centralLineMaxConcentration: 'Vena Sentral (CVC): Bisa hingga 20 - 50 mEq dlm 50 cc syringe pump',
    clinicalSafetyNotes:
      'PERINGATAN HIGH ALERT: JANGAN PERNAH MENYUNTIKKAN KCL SECARA BOLUS IV LANGSUNG! Dapat menyebabkan henti jantung fatal. Wajib diencerkan dan diberikan perlahan via syringe pump atau infusion pump.',
  },
  {
    id: 'bicnat_84',
    name: 'Bicnat / Meylon 8.4% (Natrium Bikarbonat)',
    chemicalName: 'Sodium Bicarbonate',
    standardConcentrationMeqPerMl: 1.0, // 1 mL = 1 mEq
    standardPackDescription: 'Vial 25 mL (25 mEq) atau 100 mL (100 mEq)',
    safeMaxDeliveryRate: 'Sesuai derajat asidosis & panduan AGD/BGA (biasanya 1 - 2 jam)',
    peripherialLineMaxConcentration: 'Bisa diberikan murni atau diencerkan 1:1 dengan D5W/Aquabidest',
    centralLineMaxConcentration: 'Dapat diberikan via vena perifer besar atau CVC',
    clinicalSafetyNotes:
      'Inkompatibel dengan Kalsium Glukonas (akan membentuk endapan kapur/presipitat) dan Dobutamin/Dopamin. Bilas (flush) jalur infus dengan baik sebelum & sesudah pemberian.',
  },
  {
    id: 'nacl_3',
    name: 'NaCl 3% (Salin Hipertonik)',
    chemicalName: 'Hypertonic Saline 3%',
    standardConcentrationMeqPerMl: 0.513, // 513 mEq/L = ~0.513 mEq/mL
    standardPackDescription: 'Kolf / Botol 500 mL (= 256.5 mEq Na+)',
    safeMaxDeliveryRate: 'Kenaikan natrium serum maksimal 8 - 10 mEq/L per 24 jam',
    peripherialLineMaxConcentration: 'Larutan hipertonik (Osmolaritas 1026 mOsm/L)',
    centralLineMaxConcentration: 'Lebih disukai via CVC atau vena perifer besar untuk cegah flebitis',
    clinicalSafetyNotes:
      'Koreksi hiponatremia terlalu cepat berisiko sindrom demielinasi osmotik (CPM - Central Pontine Myelinolysis). Hitung tetesan cc/jam secara ketat dan evaluasi elektrolit serial.',
  },
  {
    id: 'mgso4_20',
    name: 'MgSO4 20% / 40% (Magnesium Sulfat)',
    chemicalName: 'Magnesium Sulfate',
    standardConcentrationMeqPerMl: 1.62, // MgSO4 20% = 1g/5ml = ~8.1 mEq/5ml = 1.62 mEq/ml
    standardPackDescription: 'MgSO4 20% (1g dlm 5 mL) / MgSO4 40% (1g dlm 2.5 mL)',
    safeMaxDeliveryRate: 'Dosis pemeliharaan: 1 - 2 gram/jam via syringe pump',
    peripherialLineMaxConcentration: 'Diencerkan dlm 50 cc atau drip pelan',
    centralLineMaxConcentration: 'Dapat diberikan perifer atau sentral',
    clinicalSafetyNotes:
      'Wajib pantau syarat pemberian MgSO4: Refleks patella (+), Frekuensi napas >16x/menit, Produksi urin >30 mL/jam. Siapkan Antidot: Kalsium Glukonas 10% 1 ampul IV.',
  },
];
