import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 400 : 1400;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), 300);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-base transition-opacity duration-300"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
    >
      <div className="relative">
        {/* Pulsing glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary-500/20 blur-2xl animate-glow-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-accent-500/15 blur-xl animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Logo */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.5)] animate-float">
            <Trophy size={40} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl tracking-wider text-white">
              BGMI<span className="text-primary-500">ARENA</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1 tracking-widest uppercase">Loading Arena</p>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-600 font-mono">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
