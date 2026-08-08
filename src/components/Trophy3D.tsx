import { useEffect, useRef } from 'react';

// A lightweight 3D wireframe trophy rendered on Canvas with rotation + parallax.
// No external 3D library — uses projected 3D points and lines.
interface Point3D { x: number; y: number; z: number }
interface Edge { a: number; b: number }

const TROPHY_VERTS: Point3D[] = [
  // Cup rim (top ellipse) — 12 points
  ...Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: Math.cos(a) * 40, y: -60, z: Math.sin(a) * 40 };
  }),
  // Cup body mid — 8 points
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return { x: Math.cos(a) * 30, y: -20, z: Math.sin(a) * 30 };
  }),
  // Cup base — 8 points
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: Math.cos(a) * 20, y: 10, z: Math.sin(a) * 20 };
  }),
  // Stem
  { x: 0, y: 25, z: 0 },
  // Base plate — 8 points
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: Math.cos(a) * 35, y: 40, z: Math.sin(a) * 35 };
  }),
  // Handle left — 4 points
  { x: -42, y: -50, z: 0 },
  { x: -58, y: -40, z: 0 },
  { x: -58, y: -20, z: 0 },
  { x: -42, y: -10, z: 0 },
  // Handle right — 4 points
  { x: 42, y: -50, z: 0 },
  { x: 58, y: -40, z: 0 },
  { x: 58, y: -20, z: 0 },
  { x: 42, y: -10, z: 0 },
];

const TROPHY_EDGES: Edge[] = [
  // Cup rim
  ...Array.from({ length: 12 }, (_, i) => ({ a: i, b: (i + 1) % 12 })),
  // Cup body verticals
  ...Array.from({ length: 8 }, (_, i) => ({ a: i, b: 12 + i })),
  // Cup mid ring
  ...Array.from({ length: 8 }, (_, i) => ({ a: 12 + i, b: 12 + (i + 1) % 8 })),
  // Cup body to base
  ...Array.from({ length: 8 }, (_, i) => ({ a: 12 + i, b: 20 + i })),
  // Cup base ring
  ...Array.from({ length: 8 }, (_, i) => ({ a: 20 + i, b: 20 + (i + 1) % 8 })),
  // Stem
  { a: 24, b: 25 },
  // Base plate
  ...Array.from({ length: 8 }, (_, i) => ({ a: 25 + i, b: 25 + (i + 1) % 8 })),
  // Handles
  { a: 0, b: 33 }, { a: 33, b: 34 }, { a: 34, b: 35 }, { a: 35, b: 36 },
  { a: 36, b: 12 },
  { a: 6, b: 37 }, { a: 37, b: 38 }, { a: 38, b: 39 }, { a: 39, b: 40 },
  { a: 40, b: 18 },
];

function rotateY(p: Point3D, angle: number): Point3D {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotateX(p: Point3D, angle: number): Point3D {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function Trophy3D({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMove);

    const render = () => {
      time += reduced ? 0.001 : 0.006;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 200;

      const rotY = time + mouseRef.current.x;
      const rotX = 0.2 + mouseRef.current.y;

      // Project all vertices
      const projected = TROPHY_VERTS.map((v) => {
        let p = rotateY(v, rotY);
        p = rotateX(p, rotX);
      const fov = 300;
      const depth = fov / (fov + p.z);
      return {
        x: cx + p.x * scale * depth,
        y: cy + p.y * scale * depth,
        z: p.z,
        depth,
      };
      });

      // Sort edges by average z for painter's algorithm
      const sortedEdges = [...TROPHY_EDGES].sort((a, b) => {
        const za = (projected[a.a]?.z || 0) + (projected[a.b]?.z || 0);
        const zb = (projected[b.a]?.z || 0) + (projected[b.b]?.z || 0);
        return zb - za;
      });

      // Draw edges
      for (const edge of sortedEdges) {
        const a = projected[edge.a];
        const b = projected[edge.b];
        if (!a || !b) continue;

        const avgDepth = (a.depth + b.depth) / 2;
        const alpha = 0.3 + avgDepth * 0.5;

        ctx.strokeStyle = `hsla(25, 90%, ${50 + avgDepth * 20}%, ${alpha})`;
        ctx.lineWidth = 1.5 * avgDepth;
        ctx.shadowBlur = 8 * avgDepth;
        ctx.shadowColor = 'rgba(249, 115, 22, 0.4)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw vertices as glowing dots
      ctx.shadowBlur = 0;
      for (const p of projected) {
        ctx.fillStyle = `hsla(25, 90%, 65%, ${0.4 + p.depth * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 * p.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
