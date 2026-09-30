import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Droplets, RotateCcw } from 'lucide-react';

interface DripMetronomeProps {
  secondsPerDrop: number;
  tpm: number;
}

export const DripMetronome: React.FC<DripMetronomeProps> = ({ secondsPerDrop, tpm }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [measuredTpm, setMeasuredTpm] = useState<number | null>(null);
  const [measuredInterval, setMeasuredInterval] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inisialisasi Web Audio Context untuk click lembut
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio fallback silent
    }
  };

  // Loop metronom
  useEffect(() => {
    if (!isPlaying || secondsPerDrop <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsDropping(false);
      return;
    }

    const intervalMs = Math.max(100, secondsPerDrop * 1000);

    const triggerDrop = () => {
      setIsDropping(true);
      playClickSound();
      setTimeout(() => setIsDropping(false), 200);
    };

    // Trigger pertama
    triggerDrop();

    timerRef.current = setInterval(() => {
      triggerDrop();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, secondsPerDrop, soundEnabled]);

  // Tap-to-calculate tempo
  const handleTap = () => {
    const now = Date.now();
    const recent = [...tapTimes.filter((t) => now - t < 8000), now];
    setTapTimes(recent);

    if (recent.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < recent.length; i++) {
        diffs.push(recent[i] - recent[i - 1]);
      }
      const avgDiffMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const calculatedTpm = Math.round(60000 / avgDiffMs);
      const calculatedInterval = Number((avgDiffMs / 1000).toFixed(2));
      setMeasuredTpm(calculatedTpm);
      setMeasuredInterval(calculatedInterval);
    }
  };

  const resetTap = () => {
    setTapTimes([]);
    setMeasuredTpm(null);
    setMeasuredInterval(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Visual Metronom Tetesan</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
              soundEnabled
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Bunyi detak metronom"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{soundEnabled ? 'Suara ON' : 'Suara Mute'}</span>
          </button>
        </div>
      </div>

      {/* Chamber visualizer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
        {/* Drip Chamber Graphic */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-20 bg-slate-900 border-2 border-slate-700 rounded-b-xl flex flex-col items-center justify-between p-1 overflow-hidden">
            {/* Top drip nozzle */}
            <div className="w-2.5 h-3 bg-slate-500 rounded-b-sm"></div>

            {/* Falling Drop */}
            <div
              className={`w-3.5 h-4 transition-all duration-150 transform ${
                isDropping
                  ? 'translate-y-6 opacity-100 scale-110 text-blue-400'
                  : 'translate-y-0 opacity-20 scale-75 text-slate-500'
              }`}
            >
              <Droplets className="w-full h-full fill-current" />
            </div>

            {/* Chamber Fluid Level */}
            <div className="w-full h-4 bg-blue-500/30 rounded-b-lg border-t border-blue-400/50"></div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Target Interval:</div>
            <div className="text-xl font-bold text-blue-400 tracking-tight">
              {secondsPerDrop > 0 ? `${secondsPerDrop} detik` : '-'}
              <span className="text-xs text-slate-400 font-normal ml-1">/ tetes</span>
            </div>
            <div className="text-xs text-slate-400">
              Laju Target:{' '}
              <span className="text-white font-medium">{tpm > 0 ? `${tpm} TPM` : '-'}</span>
            </div>
          </div>
        </div>

        {/* Play/Stop Button */}
        <div className="flex items-center gap-2">
          <button
            id="metronome-toggle-play-btn"
            disabled={secondsPerDrop <= 0}
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-sm ${
              secondsPerDrop <= 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan Metronom</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Simulasi Tetes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tap-Tempo Counter */}
      <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Penghitung Ketukan Tetes Riil (Tap-Tempo):
          </span>
          {tapTimes.length > 0 && (
            <button
              onClick={resetTap}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="tap-drip-button"
            onClick={handleTap}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Ketuk Tiap Tetesan Jatuh {tapTimes.length > 0 ? `(${tapTimes.length}x)` : ''}
          </button>

          <div className="text-xs text-slate-400 flex-1">
            {measuredTpm !== null ? (
              <span className="text-slate-200">
                Terukur:{' '}
                <strong className="text-emerald-400 font-bold text-sm">{measuredTpm} TPM</strong>{' '}
                (setiap <strong className="text-emerald-400">{measuredInterval} detik/tetes</strong>)
              </span>
            ) : (
              <span>Ketuk tombol di samping 3-4 kali saat melihat tetesan infus pasien untuk mengukur TPM aktual.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
