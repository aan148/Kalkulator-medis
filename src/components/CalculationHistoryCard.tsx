import React from 'react';
import { CalculationHistoryItem } from '../types';
import { History, Trash2, Copy, Check, Clock } from 'lucide-react';

interface CalculationHistoryCardProps {
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const CalculationHistoryCard: React.FC<CalculationHistoryCardProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyItem = (item: CalculationHistoryItem) => {
    const text = `[Riwayat Kalkulasi ${item.timestamp}]
${item.title} (${item.subtitle})
Hasil Utama: ${item.primaryResult}
Hasil Tambahan: ${item.secondaryResult}
Rincian: ${item.details}`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">Belum Ada Riwayat Perhitungan</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Klik tombol &quot;Simpan&quot; pada kalkulator tetesan infus atau syringe pump untuk menyimpan catatan kalkulasi selama dinas jaga.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Riwayat Kalkulasi Dosis Dinas ({history.length})
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Semua</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.type === 'infus'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : item.type === 'syringe_meq'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : item.type === 'syringe_drug'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.type === 'infus_anak'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {item.type === 'infus'
                    ? 'INFUS TPM'
                    : item.type === 'syringe_meq'
                    ? 'SYRINGE mEq'
                    : item.type === 'syringe_drug'
                    ? 'SYRINGE OBAT'
                    : item.type === 'infus_anak'
                    ? 'INFUS ANAK'
                    : 'TRANSFUSI ANAK'}
                </span>
                <span className="text-xs font-bold text-white">{item.title}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{item.subtitle} • {item.details}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-400">{item.primaryResult}</div>
                <div className="text-[10px] text-slate-400">{item.secondaryResult}</div>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={() => handleCopyItem(item)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Salin"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
