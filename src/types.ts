export interface PWAAuditItem {
  id: string;
  category: 'manifest' | 'service_worker' | 'security' | 'capabilities';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details?: string;
  scoreWeight: number;
}

export interface CacheEntry {
  cacheName: string;
  url: string;
  status: number;
  type: string;
  sizeBytes?: number;
}

export interface StorageEstimateInfo {
  usage: number;
  quota: number;
  percentage: number;
}

export interface DeviceInfo {
  userAgent: string;
  isStandalone: boolean;
  platform: string;
  screenResolution: string;
  colorDepth: number;
  online: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  hasBackgroundSync: boolean;
}

// Medical Infusion & Syringe Pump Types
export type DropFactorType = 20 | 15 | 60 | number;

export interface InfusionCalcInput {
  volumeMl: number;
  timeHours: number;
  timeMinutes: number;
  dropFactor: DropFactorType;
}

export interface InfusionCalcResult {
  tpm: number; // Drops Per Minute (tetes/menit)
  exactTpm: number;
  secondsPerDrop: number; // Detik per tetes
  mlPerHour: number;
  mlPerMinute: number;
  totalDurationMinutes: number;
  formulaDescription: string;
}

export interface SyringePumpMeqInput {
  targetMeq: number; // Target mEq yang diminta
  sourceConcentrationMeqPerMl: number; // Misal KCl 1 mEq/mL (7.46%), Bicnat 1 mEq/mL (8.4%)
  syringeVolumeMl: number; // Total volume spuit campuran (misal 50cc, 20cc, 100cc)
  durationHours: number; // Waktu infus dalam jam
  diluentType: string; // NaCl 0.9%, D5%, Aquabidest
  patientWeightKg?: number;
}

export interface SyringePumpMeqResult {
  sourceElectrolyteMl: number; // Volume obat mEq yang diambil
  diluentVolumeMl: number; // Volume cairan pengencer yang ditambahkan
  finalConcentrationMeqPerMl: number; // Konsentrasi akhir mEq/cc
  rateCcPerHour: number; // cc/jam (mL/jam)
  rateCcPerMinute: number; // cc/menit (mL/menit)
  deliveryRateMeqPerHour: number; // mEq/jam yang masuk ke pasien
  deliveryRateMeqPerMinute: number; // mEq/menit
  safetyNote?: string;
  isHighAlert: boolean;
}

export interface DrugPreset {
  id: string;
  name: string;
  genericName: string;
  category: 'inotropik' | 'vasopresor' | 'antihipertensi' | 'sedasi' | 'elektrolit' | 'insulin' | 'diuretik' | 'lainnya';
  standardVialMg: number;
  standardSyringeMl: number;
  unit: 'mcg' | 'mg' | 'IU' | 'mEq';
  doseUnit: 'mcg/kg/min' | 'mcg/min' | 'mcg/kg/hr' | 'mcg/hr' | 'mg/kg/hr' | 'mg/hr' | 'IU/hr' | 'mEq/hr';
  defaultDose: number;
  minDose: number;
  maxDose: number;
  compatibleDiluents: string[];
  incompatibleWith?: string[];
  clinicalNote: string;
}

export interface SyringePumpDrugInput {
  drugName: string;
  dose: number;
  doseUnit: 'mcg/kg/min' | 'mcg/min' | 'mcg/kg/hr' | 'mcg/hr' | 'mg/kg/hr' | 'mg/hr' | 'IU/hr';
  patientWeightKg: number;
  drugAmount: number; // mg or IU
  drugAmountUnit: 'mg' | 'mcg' | 'IU';
  syringeVolumeMl: number;
  diluentType: string;
}

export interface SyringePumpDrugResult {
  finalConcentrationMcgPerMl: number;
  finalConcentrationMgPerMl?: number;
  rateCcPerHour: number;
  rateCcPerMinute: number;
  concentrationDisplay: string;
  multiplierFactor: number;
  stepByStepFormula: string[];
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: string;
  type: 'infus' | 'syringe_meq' | 'syringe_drug' | 'infus_anak' | 'transfusi_anak';
  title: string;
  subtitle: string;
  primaryResult: string;
  secondaryResult: string;
  details: string;
}

export interface PediatricFluidInput {
  weightKg: number;
  temperatureC: number;
  customTotalVolumeMl?: number; // jika dokter meresepkan volume spesifik
  durationHours: number;
  fluidName: string;
  clinicalCondition: 'normal' | 'demam' | 'restriksi' | 'ringan_sedang' | 'kustom';
  restrictionPercent?: number; // e.g. 80%
}

export interface PediatricFluidResult {
  baseDailyVolumeMl: number; // Kebutuhan dasar 24 jam Holliday-Segar
  temperatureAdjustmentMl: number; // Penyesuaian demam
  totalDailyVolumeMl: number; // Total volume 24 jam
  prescribedVolumeForDurationMl: number; // Volume untuk durasi yang dipilih
  hourlyRateMl: number; // mL/jam (cc/jam)
  minuteRateMl: number; // mL/menit
  microDripTpm: number; // TPM mikro (60 gtt/mL)
  microSecondsPerDrop: number; // Detik per tetes mikro
  macro20Tpm: number; // TPM makro (20 gtt/mL)
  macro15Tpm: number; // TPM makro (15 gtt/mL)
  formulaDescription: string;
  hollidaySegarBreakdown: string;
  safetyAlerts: string[];
}

export type BloodComponentType = 'prc' | 'tc' | 'ffp' | 'cryo' | 'wb';

export interface PediatricTransfusionInput {
  componentType: BloodComponentType;
  weightKg: number;
  currentHb?: number; // g/dL untuk PRC / WB
  targetHb?: number; // g/dL untuk PRC / WB
  prcFactor?: 3 | 4; // Pengali 3 (neonatus/formula lama) atau 4 (standar IDAI)
  empiricalDoseMlPerKg?: number; // e.g. 10 - 15 mL/kg
  durationHours: number; // durasi transfusi (biasanya 2 - 4 jam)
  calculationMethod: 'formula_hb' | 'empirical';
}

export interface PediatricTransfusionResult {
  componentName: string;
  calculatedVolumeMl: number;
  safeMaxVolumePerSessionMl: number; // Batas aman 1x pemberian (10-15 mL/kg)
  isExceedingSafeLimit: boolean;
  expectedHbRise?: number; // estimasi kenaikan Hb (g/dL)
  expectedPlateletRise?: string; // estimasi kenaikan trombosit
  hourlyRateMl: number; // mL/jam
  minuteRateMl: number; // mL/menit
  bloodSetTpm: number; // TPM blood set (15 gtt/mL)
  bloodSetSecondsPerDrop: number; // Detik per tetes blood set
  initialObservationRateMlPerHour: number; // Kecepatan 15 menit awal (1-2 mL/kg/jam)
  initialObservationTpm: number; // TPM 15 menit awal
  durationHours: number;
  recommendations: string[];
  safetyChecklist: string[];
}


