import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertCircle, Droplet } from 'lucide-react';

export const FluidCompatibilityCard: React.FC = () => {
  const compatibilityRules = [
    {
      drug: 'Norepinefrin (Vascon)',
      diluent: 'Dextrose 5% atau NaCl 0.9%',
      status: 'safe',
      notes: 'Dextrose 5% lebih melindungi dari oksidasi, namun NaCl 0.9% lazim digunakan.',
      incompatible: 'Basa kuat (Bicnat / Meylon), larutan alkali.',
    },
    {
      drug: 'Dopamin & Dobutamin',
      diluent: 'NaCl 0.9% atau D5%',
      status: 'safe',
      notes: 'Dilarutkan dalam spuit 50cc NS/D5%. Lindungi dari cahaya jika terpapar lama.',
      incompatible: 'Natrium Bikarbonat 8.4% (menyebabkan inaktivasi cepat).',
    },
    {
      drug: 'Amiodaron (Cordarone)',
      diluent: 'Dextrose 5% (D5W) SAJA',
      status: 'warning',
      notes: 'Wajib hanya dilarutkan dalam D5W! Konsentrasi pemeliharaan 300 mg/50cc.',
      incompatible: 'NaCl 0.9% (menyebabkan presipitasi / tidak stabil pada konsentrasi tinggi).',
    },
    {
      drug: 'KCl 7.46% (Kalium Pekat)',
      diluent: 'NaCl 0.9%, Dextrose 5%',
      status: 'danger',
      notes: 'HIGH ALERT: JANGAN PERNAH BOLUS! Wajib diencerkan dengan baik dan diinfus perlahan.',
      incompatible: 'Pemberian murni langsung ke vena.',
    },
    {
      drug: 'Natrium Bikarbonat (Bicnat)',
      diluent: 'Aquabidest atau D5W (atau murni pelan)',
      status: 'warning',
      notes: 'Dapat diencerkan 1:1 jika hipertonik, atau via syringe pump perlahan.',
      incompatible: 'Kalsium Glukonat, Dobutamin, Dopamin, Epinefrin (terjadi presipitasi).',
    },
    {
      drug: 'Insulin Reguler (Actrapid/Novorapid)',
      diluent: 'NaCl 0.9%',
      status: 'safe',
      notes: '50 IU dlm 50 cc NaCl 0.9% (1 IU/cc). Flush selang 10-20 cc sebelum mulai.',
      incompatible: 'Larutan basa, cairan asam kuat.',
    },
    {
      drug: 'Nicardipine (Perdipine)',
      diluent: 'NaCl 0.9% atau D5%',
      status: 'safe',
      notes: '10 mg dlm 50 cc NS (200 mcg/cc). Kompatibel dengan akses vena sentral & perifer besar.',
      incompatible: 'Larutan Ringer Laktat (dapat keruh/incompatible).',
    },
    {
      drug: 'Furosemide (Lasix)',
      diluent: 'NaCl 0.9% (Pilihan Utama) atau Ringer Laktat',
      status: 'safe',
      notes: 'Larutan stabil pada pH basa/netral. Oplosan lazim 100 mg / 50 cc NS (2 mg/cc). Lindungi dari cahaya jika terpapar lama.',
      incompatible: 'Larutan asam (pH < 5.5), Amiodaron, Dobutamin, Milrinon, Midazolam, Morfina (terjadi presipitasi kristal).',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Droplet className="w-4 h-4" />
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Panduan Kompatibilitas Cairan Campuran & Pelarut
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Referensi kompatibilitas pengenceran syringe pump dan obat-obatan yang tidak boleh dicampur (inkompatibel).
        </p>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Nama Obat</th>
              <th className="py-2.5 px-3 font-semibold">Pelarut Yang Direkomendasikan</th>
              <th className="py-2.5 px-3 font-semibold text-rose-400">JANGAN Dicampur Dengan</th>
              <th className="py-2.5 px-3 font-semibold">Catatan Klinis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {compatibilityRules.map((rule, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                  {rule.drug}
                </td>
                <td className="py-3 px-3 text-cyan-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{rule.diluent}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-rose-300 font-medium">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{rule.incompatible}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed">
                  {rule.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5 Hak Keselamatan Pemberian Obat Intravena */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Prinsip Keselamatan Pasien (Patient Safety):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          {[
            '1. Tepat Pasien',
            '2. Tepat Obat',
            '3. Tepat Dosis',
            '4. Tepat Rute',
            '5. Tepat Waktu',
            '6. Tepat Dokumentasi',
          ].map((right, i) => (
            <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              {right}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
