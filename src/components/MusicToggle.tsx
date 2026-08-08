import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Ambient background music using Web Audio API — a soft procedural loop.
// No audio files needed; generates a gentle ambient pad with oscillators.
export function MusicToggle() {
  const [enabled, setEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);

  const startAudio = async () => {
    if (audioCtxRef.current) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    // Soft ambient pad — two detuned oscillators + a low drone
    const freqs = [110, 165, 220];
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 5;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.15 / (i + 1);

      // Slow LFO for breathing effect
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    nodesRef.current = { gain, oscs };

    // Fade in
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5);
  };

  const stopAudio = () => {
    const ctx = audioCtxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes) return;
    nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    setTimeout(() => {
      nodes.oscs.forEach((o) => { try { o.stop() } catch {} });
      ctx.close();
      audioCtxRef.current = null;
      nodesRef.current = null;
    }, 600);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const toggle = () => {
    if (enabled) {
      stopAudio();
      setEnabled(false);
    } else {
      startAudio();
      setEnabled(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 left-6 z-[100] w-11 h-11 rounded-full bg-bg-elevated/80 backdrop-blur-md border border-border-subtle flex items-center justify-center text-neutral-300 hover:text-primary-400 hover:border-primary-500/40 transition-colors shadow-lg"
      title={enabled ? 'Mute ambient music' : 'Play ambient music'}
    >
      {enabled ? (
        <Volume2 size={18} className="text-primary-400 animate-pulse" />
      ) : (
        <VolumeX size={18} />
      )}
    </button>
  );
}
