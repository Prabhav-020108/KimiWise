import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, X, Volume2 } from 'lucide-react';
import { useStore } from '../../store';

export const FloatingTimer: React.FC = () => {
  const { ui, setTimerOpen } = useStore();
  const [mode, setMode] = useState<'TIMER' | 'STOPWATCH'>('TIMER');
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 min default
  const [timeLeft, setTimeLeft] = useState(300);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.25);
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.2);

      setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch {}
  };

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (mode === 'TIMER') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      const start = Date.now() - stopwatchMs;
      timerRef.current = setInterval(() => {
        setStopwatchMs(Date.now() - start);
      }, 50);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  if (!ui.isTimerOpen) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const dec = Math.floor((ms % 1000) / 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${dec}`;
  };

  const setPreset = (s: number) => {
    setIsActive(false);
    setTotalSeconds(s);
    setTimeLeft(s);
  };

  const reset = () => {
    setIsActive(false);
    if (mode === 'TIMER') setTimeLeft(totalSeconds);
    else setStopwatchMs(0);
  };

  return (
    <div className="fixed right-6 top-20 z-50 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 rounded-3xl p-4 select-none animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={16} />
          </div>
          <span className="text-xs font-bold text-slate-800">Classroom Timer</span>
        </div>
        <button
          onClick={() => setTimerOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl my-3">
        <button
          onClick={() => { setMode('TIMER'); setIsActive(false); }}
          className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
            mode === 'TIMER' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Timer
        </button>
        <button
          onClick={() => { setMode('STOPWATCH'); setIsActive(false); }}
          className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
            mode === 'STOPWATCH' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Stopwatch
        </button>
      </div>

      {/* Main Display */}
      <div className="py-4 text-center">
        <div className="text-4xl font-extrabold tracking-tight font-mono text-slate-800">
          {mode === 'TIMER' ? formatTimer(timeLeft) : formatStopwatch(stopwatchMs)}
        </div>
        {mode === 'TIMER' && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (timeLeft / (totalSeconds || 1)) * 100))}%` }}
            />
          </div>
        )}
      </div>

      {/* Presets (Timer mode only) */}
      {mode === 'TIMER' && (
        <div className="flex gap-1 justify-center mb-3">
          {[60, 180, 300, 600].map((sec) => (
            <button
              key={sec}
              onClick={() => setPreset(sec)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                totalSeconds === sec ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sec / 60}m
            </button>
          ))}
          <button
            onClick={() => setTimeLeft((t) => t + 30)}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100"
          >
            +30s
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
          }`}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={reset}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={playChime}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Test Chime Sound"
        >
          <Volume2 size={16} />
        </button>
      </div>
    </div>
  );
};
