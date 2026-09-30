import React, { useState } from 'react';
import {
  Bug,
  MessageSquare,
  Mail,
  Send,
  Copy,
  Check,
  X,
  ExternalLink,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'bug' | 'feedback';
}

const MODULE_OPTIONS = [
  'Infus Dewasa (TPM & Detik)',
  'Infus Anak / Pediatrik (Holliday-Segar)',
  'Transfusi Darah Anak (PRC, TC, FFP, Cryo)',
  'Syringe Pump mEq & Oplosan',
  'Syringe Pump Obat & Inotropik',
  'Kompatibilitas Pelarut Cairan',
  'Metronom Tetesan Infus (Audio/Visual)',
  'Fitur Offline / PWA / Cache',
  'Tampilan / Desain / Layar Ponsel',
  'Lainnya',
];

const TARGET_EMAIL = 'digikreva@gmail.com';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'bug',
}) => {
  const [reportType, setReportType] = useState<'bug' | 'feedback'>(defaultCategory);
  const [senderName, setSenderName] = useState<string>('');
  const [senderRole, setSenderRole] = useState<string>('Perawat');
  const [selectedModule, setSelectedModule] = useState<string>(MODULE_OPTIONS[0]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  if (!isOpen) return null;

  const getSystemDiagnostics = () => {
    if (typeof window === 'undefined') return '';
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    return [
      `User Agent: ${navigator.userAgent}`,
      `Screen Resolution: ${window.screen.width}x${window.screen.height} (DPR: ${window.devicePixelRatio})`,
      `PWA Installed / Standalone: ${isStandalone ? 'Ya (PWA Standalone)' : 'Tidak (Browser Tab)'}`,
      `Status Jaringan: ${navigator.onLine ? 'Online' : 'Offline'}`,
      `Waktu Laporan: ${new Date().toISOString()}`,
    ].join('\n');
  };

  const generateReportBody = () => {
    const header = reportType === 'bug' ? 'LAPORAN BUG / KENDALA APLIKASI' : 'SARAN & UMPAN BALIK PENGEMBANGAN';
    const lines = [
      `[${header} - PWA Pro Suite]`,
      `Tujuan: ${TARGET_EMAIL}`,
      ``,
      `Kategori: ${reportType === 'bug' ? 'Laporan Bug / Masalah' : 'Saran / Fitur Baru'}`,
      `Modul Terkait: ${selectedModule}`,
      `Nama / Pengirim: ${senderName.trim() || 'Anonim'} (${senderRole})`,
      `Judul: ${title.trim() || '(Tanpa Judul)'}`,
      ``,
      `--- DESKRIPSI DETAIL ---`,
      description.trim() || '(Belum ada keterangan detail)',
      ``,
    ];

    if (includeDiagnostics) {
      lines.push(
        `--- INFORMASI TEKNIS PERANGKAT ---`,
        getSystemDiagnostics(),
        ``
      );
    }

    lines.push(
      `---`,
      `Dikirim dari PWA Pro Suite - Kalkulator Medis Klinis`
    );

    return lines.join('\n');
  };

  const handleCopyReport = () => {
    const reportText = generateReportBody();
    navigator.clipboard.writeText(reportText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyEmailAddress = () => {
    navigator.clipboard.writeText(TARGET_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(
      `[${reportType === 'bug' ? 'BUG REPORT' : 'FEEDBACK'}] ${title.trim() || selectedModule}`
    );
    const body = encodeURIComponent(generateReportBody());
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleOpenGmailWeb = () => {
    const subject = encodeURIComponent(
      `[${reportType === 'bug' ? 'BUG REPORT' : 'FEEDBACK'}] ${title.trim() || selectedModule}`
    );
    const body = encodeURIComponent(generateReportBody());
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${TARGET_EMAIL}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        id="modal-feedback-card"
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {reportType === 'bug' ? <Bug className="w-5 h-5 text-rose-400" /> : <MessageSquare className="w-5 h-5 text-blue-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Umpan Balik & Laporan Bug
              </h3>
              <p className="text-xs text-slate-400">
                Kirim langsung ke pengembang di <span className="text-blue-300 font-medium">{TARGET_EMAIL}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          {/* Pilihan Tipe: Bug vs Feedback */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setReportType('bug')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition ${
                reportType === 'bug'
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Lapor Bug / Eror</span>
            </button>
            <button
              type="button"
              onClick={() => setReportType('feedback')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition ${
                reportType === 'feedback'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Saran & Masukan</span>
            </button>
          </div>

          {/* Pengirim & Peran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Nama / Inisial (Opsional)</label>
              <input
                id="input-feedback-name"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Contoh: Ns. Rian / dr. Sarah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Profesi / Unit</label>
              <select
                id="select-feedback-role"
                value={senderRole}
                onChange={(e) => setSenderRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Perawat (Ruang Rawat)">Perawat (Ruang Rawat / Bangsal)</option>
                <option value="Perawat ICU/ICCU/PICU/NICU">Perawat ICU / ICCU / PICU / NICU</option>
                <option value="Perawat IGD">Perawat IGD / Emergency</option>
                <option value="Dokter Umum">Dokter Umum</option>
                <option value="Dokter Spesialis">Dokter Spesialis (Anak/Penyakit Dalam/Lainnya)</option>
                <option value="Apoteker / Farmasis">Apoteker / Farmasi Klinis</option>
                <option value="Mahasiswa Kesehatan">Mahasiswa Kedokteran / Keperawatan</option>
                <option value="Lainnya">Lainnya / Umum</option>
              </select>
            </div>
          </div>

          {/* Modul Terkait */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Modul atau Fitur Terkait</label>
            <select
              id="select-feedback-module"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Judul Singkat */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              {reportType === 'bug' ? 'Judul Kendala' : 'Topik Saran'}
            </label>
            <input
              id="input-feedback-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                reportType === 'bug'
                  ? 'Contoh: Nilai TPM mikro tidak sesuai jika durasi 12 jam'
                  : 'Contoh: Usul penambahan kalkulator GCS atau koreksi Albumin'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Deskripsi Lengkap */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">
              {reportType === 'bug' ? 'Kronologi & Penjelasan Eror' : 'Uraian Masukan / Fitur yang Diharapkan'}
            </label>
            <textarea
              id="textarea-feedback-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                reportType === 'bug'
                  ? 'Sebutkan input angka yang Anda masukkan, apa hasil yang muncul, dan apa hasil yang seharusnya diharapkan...'
                  : 'Jelaskan fitur apa yang ingin Anda tambahkan atau perbaikan apa yang dapat mempermudah pekerjaan dinas jaga Anda...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
            />
          </div>

          {/* Sertakan Info Diagnostik Perangkat */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
            <input
              id="checkbox-diagnostics"
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(e) => setIncludeDiagnostics(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="checkbox-diagnostics" className="cursor-pointer text-[11px] text-slate-300 space-y-0.5">
              <span className="font-medium text-white block">
                Lampirkan Info Teknis Perangkat Secara Otomatis
              </span>
              <span className="text-slate-400 block text-[10px]">
                Menyertakan tipe browser/OS, resolusi layar, dan mode PWA agar tim pengembang dapat mereproduksi bug lebih cepat.
              </span>
            </label>
          </div>

          {/* Target Email Info & Quick Copy */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Email Pengembang:</span>
              <strong className="text-white font-mono">{TARGET_EMAIL}</strong>
            </div>
            <button
              type="button"
              onClick={handleCopyEmailAddress}
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
            >
              {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEmail ? 'Email Tersalin' : 'Salin Email'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Draf Laporan Tersalin!' : 'Salin Draf Laporan'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGmailWeb}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 text-xs font-medium transition"
              title="Buka Gmail Web di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Gmail Web</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
