import { useEffect, useRef } from 'react';

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const render = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `translate3d(${cx - 150}px, ${cy - 150}px, 0)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[150]"
      style={{
        background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, rgba(34,211,238,0.03) 40%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
