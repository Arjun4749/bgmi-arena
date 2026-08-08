import { useEffect, useRef, useCallback } from 'react';

export type ThemeKey =
  | 'home'
  | 'tournaments'
  | 'leaderboard'
  | 'dashboard'
  | 'admin'
  | 'winners'
  | 'youtube'
  | 'contact'
  | 'rules'
  | 'faq'
  | 'default';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  alpha: number;
  rotation: number;
  vr: number;
}

interface Ray {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  width: number;
  hue: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface Spotlight {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  hue: number;
  intensity: number;
}

interface DataNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface RadarState {
  angle: number;
}

interface HexTile {
  x: number;
  y: number;
  size: number;
  phase: number;
}

interface Theme {
  particles: Particle[];
  rays: Ray[];
  sparks: Spark[];
  confetti: Confetti[];
  spotlights: Spotlight[];
  dataNodes: DataNode[];
  hexTiles: HexTile[];
  radar: RadarState;
  time: number;
  mouseX: number;
  mouseY: number;
  parallaxX: number;
  parallaxY: number;
}

function createTheme(): Theme {
  return {
    particles: [],
    rays: [],
    sparks: [],
    confetti: [],
    spotlights: [],
    dataNodes: [],
    hexTiles: [],
    radar: { angle: 0 },
    time: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    parallaxX: 0,
    parallaxY: 0,
  };
}

const COLORS = {
  orange: 25,
  blue: 190,
  cyan: 190,
  gold: 45,
  silver: 210,
  bronze: 28,
  green: 140,
  red: 0,
  purple: 270,
};

function spawnParticle(t: Theme, w: number, h: number, hue: number) {
  t.particles.push({
    x: Math.random() * w,
    y: h + Math.random() * 50,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.2 + Math.random() * 0.6),
    size: 1 + Math.random() * 2.5,
    life: 0,
    maxLife: 200 + Math.random() * 300,
    hue,
    alpha: 0.3 + Math.random() * 0.4,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.02,
  });
}

function spawnSpark(t: Theme, x: number, y: number, hue: number) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 3;
  t.sparks.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.5,
    life: 0,
    maxLife: 40 + Math.random() * 30,
    hue,
    size: 1 + Math.random() * 2,
  });
}

function spawnConfetti(t: Theme, w: number) {
  const colors = ['#f97316', '#22d3ee', '#fbbf24', '#ffffff', '#fde047', '#fb923c'];
  t.confetti.push({
    x: Math.random() * w,
    y: -20,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 6,
    life: 0,
    maxLife: 200 + Math.random() * 200,
  });
}

function initTheme(theme: Theme, key: ThemeKey, w: number, h: number) {
  theme.particles = [];
  theme.rays = [];
  theme.sparks = [];
  theme.confetti = [];
  theme.spotlights = [];
  theme.dataNodes = [];
  theme.hexTiles = [];

  switch (key) {
    case 'home': {
      for (let i = 0; i < 80; i++) spawnParticle(theme, w, h, Math.random() > 0.5 ? COLORS.orange : COLORS.blue);
      for (let i = 0; i < 4; i++) {
        theme.rays.push({
          x: w * (0.2 + i * 0.2),
          y: h * 0.5,
          angle: -Math.PI / 2 + (i - 2) * 0.15,
          speed: 0.0003 + i * 0.0001,
          length: h * 0.8,
          width: 80 + i * 20,
          hue: i % 2 === 0 ? COLORS.orange : COLORS.blue,
        });
      }
      break;
    }
    case 'tournaments': {
      for (let i = 0; i < 40; i++) spawnParticle(theme, w, h, COLORS.cyan);
      for (let i = 0; i < 3; i++) {
        theme.rays.push({
          x: w * 0.5,
          y: h,
          angle: -Math.PI / 2 + (i - 1) * 0.2,
          speed: 0.0005,
          length: h,
          width: 120,
          hue: COLORS.orange,
        });
      }
      break;
    }
    case 'leaderboard': {
      for (let i = 0; i < 3; i++) {
        theme.spotlights.push({
          x: w * (0.25 + i * 0.25),
          y: h * 0.3,
          targetX: w * (0.25 + i * 0.25),
          targetY: h * 0.3,
          radius: 200 + i * 30,
          hue: i === 0 ? COLORS.gold : i === 1 ? COLORS.silver : COLORS.bronze,
          intensity: 0.15,
        });
      }
      for (let i = 0; i < 30; i++) spawnParticle(theme, w, h, Math.random() > 0.5 ? COLORS.gold : COLORS.orange);
      break;
    }
    case 'dashboard': {
      for (let i = 0; i < 50; i++) {
        theme.dataNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
      for (let i = 0; i < 30; i++) spawnParticle(theme, w, h, Math.random() > 0.5 ? COLORS.green : COLORS.blue);
      break;
    }
    case 'admin': {
      for (let i = 0; i < 60; i++) {
        theme.dataNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
      for (let i = 0; i < 20; i++) spawnParticle(theme, w, h, COLORS.green);
      break;
    }
    case 'winners': {
      for (let i = 0; i < 60; i++) spawnParticle(theme, w, h, COLORS.gold);
      for (let i = 0; i < 50; i++) spawnConfetti(theme, w);
      break;
    }
    case 'youtube': {
      for (let i = 0; i < 40; i++) spawnParticle(theme, w, h, COLORS.red);
      break;
    }
    case 'contact': {
      for (let i = 0; i < 40; i++) {
        theme.dataNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
      for (let i = 0; i < 20; i++) spawnParticle(theme, w, h, COLORS.blue);
      break;
    }
    case 'rules':
    case 'faq': {
      const hexSize = 40;
      const cols = Math.ceil(w / (hexSize * 1.5)) + 2;
      const rows = Math.ceil(h / (hexSize * Math.sqrt(3))) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          theme.hexTiles.push({
            x: c * hexSize * 1.5,
            y: r * hexSize * Math.sqrt(3) + (c % 2) * hexSize * Math.sqrt(3) / 2,
            size: hexSize,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      break;
    }
    default: {
      for (let i = 0; i < 30; i++) spawnParticle(theme, w, h, COLORS.blue);
      break;
    }
  }
}

function drawHome(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Neon smoke layers
  for (let i = 0; i < 3; i++) {
    const offset = t.time * 0.00008 * (i + 1);
    const cx = w * (0.3 + Math.sin(offset + i) * 0.2 + t.parallaxX * 0.02);
    const cy = h * (0.4 + Math.cos(offset * 1.3 + i) * 0.15 + t.parallaxY * 0.02);
    const r = 200 + i * 100;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const hue = i % 2 === 0 ? COLORS.orange : COLORS.blue;
    grad.addColorStop(0, `hsla(${hue}, 90%, 50%, ${reduced ? 0.03 : 0.06})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Light rays
  if (!reduced) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const ray of t.rays) {
      ray.angle += Math.sin(t.time * ray.speed) * 0.002;
      const grad = ctx.createLinearGradient(ray.x, ray.y, ray.x + Math.cos(ray.angle) * ray.length, ray.y + Math.sin(ray.angle) * ray.length);
      grad.addColorStop(0, `hsla(${ray.hue}, 90%, 50%, 0.08)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ray.x, ray.y);
      const perpAngle = ray.angle + Math.PI / 2;
      ctx.lineTo(ray.x + Math.cos(perpAngle) * ray.width / 2, ray.y + Math.sin(perpAngle) * ray.width / 2);
      ctx.lineTo(ray.x + Math.cos(ray.angle) * ray.length + Math.cos(perpAngle) * ray.width / 4, ray.y + Math.sin(ray.angle) * ray.length + Math.sin(perpAngle) * ray.width / 4);
      ctx.lineTo(ray.x + Math.cos(ray.angle) * ray.length - Math.cos(perpAngle) * ray.width / 4, ray.y + Math.sin(ray.angle) * ray.length - Math.sin(perpAngle) * ray.width / 4);
      ctx.lineTo(ray.x - Math.cos(perpAngle) * ray.width / 2, ray.y - Math.sin(perpAngle) * ray.width / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Energy waves
  if (!reduced) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 2; i++) {
      const phase = t.time * 0.0005 + i * Math.PI;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.7 + Math.sin(x * 0.008 + phase) * 30 + Math.sin(x * 0.003 + phase * 2) * 50 + i * 40;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${i === 0 ? COLORS.orange : COLORS.blue}, 90%, 50%, 0.08)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Particles (embers)
  for (const p of t.particles) {
    p.life++;
    p.x += p.vx + t.parallaxX * 0.005;
    p.y += p.vy;
    p.rotation += p.vr;
    if (p.life > p.maxLife || p.y < -20) {
      p.x = Math.random() * w;
      p.y = h + 20;
      p.life = 0;
    }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawTournaments(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Holographic grid
  ctx.save();
  const gridOffset = (t.time * 0.02) % 50;
  ctx.strokeStyle = `hsla(${COLORS.cyan}, 80%, 50%, ${reduced ? 0.03 : 0.06})`;
  ctx.lineWidth = 1;
  for (let x = -gridOffset; x < w; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = -gridOffset; y < h; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Perspective floor lines
  ctx.strokeStyle = `hsla(${COLORS.orange}, 80%, 50%, ${reduced ? 0.02 : 0.05})`;
  const vanishX = w * 0.5;
  const vanishY = h * 0.4;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishX + i * 60, h);
    ctx.lineTo(vanishX + i * 8, vanishY);
    ctx.stroke();
  }
  ctx.restore();

  // Scanning line
  if (!reduced) {
    const scanY = (t.time * 0.05) % h;
    const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, `hsla(${COLORS.cyan}, 90%, 50%, 0.06)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 60, w, 120);
  }

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 50%, 0.4)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawLeaderboard(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Moving spotlights
  for (const s of t.spotlights) {
    s.targetX = w * (0.25 + Math.sin(t.time * 0.0003 + s.hue) * 0.15 + (s.hue === COLORS.gold ? 0 : s.hue === COLORS.silver ? 0.25 : 0.5));
    s.x += (s.targetX - s.x) * 0.02;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
    grad.addColorStop(0, `hsla(${s.hue}, 80%, 50%, ${reduced ? 0.04 : 0.08})`);
    grad.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Ranking podium glow
  if (!reduced) {
    const podiumY = h * 0.75;
    for (let i = 0; i < 3; i++) {
      const px = w * (0.3 + i * 0.2);
      const pw = 80;
      const ph = [60, 45, 30][i];
      const hue = [COLORS.gold, COLORS.silver, COLORS.bronze][i];
      const pulse = 0.05 + Math.sin(t.time * 0.002 + i) * 0.02;
      const grad = ctx.createLinearGradient(px, podiumY - ph, px, podiumY);
      grad.addColorStop(0, `hsla(${hue}, 80%, 50%, ${pulse})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(px - pw / 2, podiumY - ph, pw, ph);
    }
  }

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 50%, 0.4)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawDashboard(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Neon circuit lines between nodes
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < t.dataNodes.length; i++) {
    const a = t.dataNodes[i];
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > w) a.vx *= -1;
    if (a.y < 0 || a.y > h) a.vy *= -1;
    for (let j = i + 1; j < t.dataNodes.length; j++) {
      const b = t.dataNodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const alpha = (1 - dist / 150) * (reduced ? 0.04 : 0.08);
        ctx.strokeStyle = `hsla(${COLORS.green}, 80%, 50%, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  // Node dots
  for (const n of t.dataNodes) {
    ctx.fillStyle = `hsla(${COLORS.green}, 80%, 60%, ${reduced ? 0.2 : 0.4})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // RGB ambient glow
  if (!reduced) {
    const r = Math.sin(t.time * 0.0005) * 0.5 + 0.5;
    const g = Math.sin(t.time * 0.0005 + 2) * 0.5 + 0.5;
    const b = Math.sin(t.time * 0.0005 + 4) * 0.5 + 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, 0.015)`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawAdmin(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Data streams (vertical falling lines)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const n of t.dataNodes) {
    n.y += n.vy + 0.5;
    if (n.y > h) { n.y = -10; n.x = Math.random() * w; }
    ctx.fillStyle = `hsla(${COLORS.green}, 80%, 50%, ${reduced ? 0.05 : 0.1})`;
    ctx.fillRect(n.x, n.y, 1, 20);
  }
  ctx.restore();

  // Scanning radar
  if (!reduced) {
    const cx = w * 0.85;
    const cy = h * 0.25;
    const radius = Math.min(w, h) * 0.15;
    t.radar.angle += 0.015;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Radar rings
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = `hsla(${COLORS.green}, 80%, 50%, ${0.04 / i})`;
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 3) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Radar sweep
    const grad = ctx.createConicGradient(t.radar.angle, cx, cy);
    grad.addColorStop(0, `hsla(${COLORS.green}, 80%, 50%, 0.12)`);
    grad.addColorStop(0.1, 'transparent');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    // Center pulse
    const pulseR = 5 + Math.sin(t.time * 0.003) * 3;
    ctx.fillStyle = `hsla(${COLORS.green}, 80%, 60%, 0.3)`;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Server pulse
  if (!reduced) {
    const pulse = Math.sin(t.time * 0.002) * 0.5 + 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${COLORS.orange}, 80%, 50%, ${0.02 * pulse})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawWinners(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Trophy glow at center
  if (!reduced) {
    const cx = w * 0.5;
    const cy = h * 0.3;
    const pulse = 0.08 + Math.sin(t.time * 0.002) * 0.03;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
    grad.addColorStop(0, `hsla(${COLORS.gold}, 90%, 50%, ${pulse})`);
    grad.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Confetti
  for (const c of t.confetti) {
    c.life++;
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.02;
    c.rotation += c.vr;
    if (c.life > c.maxLife || c.y > h + 20) {
      c.x = Math.random() * w;
      c.y = -20;
      c.life = 0;
      c.vy = 2 + Math.random() * 3;
    }
    const fade = Math.min(1, (c.maxLife - c.life) / 60);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.globalAlpha = fade;
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
    ctx.restore();
  }

  // Golden particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Occasional sparks (fireworks)
  if (!reduced && Math.random() < 0.02) {
    const fx = Math.random() * w;
    const fy = h * (0.2 + Math.random() * 0.3);
    for (let i = 0; i < 15; i++) spawnSpark(t, fx, fy, COLORS.gold);
  }
  for (let i = t.sparks.length - 1; i >= 0; i--) {
    const s = t.sparks[i];
    s.life++;
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.03;
    if (s.life > s.maxLife) { t.sparks.splice(i, 1); continue; }
    const fade = 1 - s.life / s.maxLife;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${s.hue}, 90%, 60%, ${fade})`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `hsla(${s.hue}, 90%, 50%, 0.5)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size * fade, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawYoutube(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Neon RGB background pulse
  if (!reduced) {
    const hue = (t.time * 0.02) % 360;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6);
    grad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.04)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Equalizer bars at bottom
  if (!reduced) {
    const barCount = 40;
    const barWidth = w / barCount;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < barCount; i++) {
      const height = (Math.sin(t.time * 0.003 + i * 0.3) * 0.5 + 0.5) * 60 + 10;
      const hue = i % 2 === 0 ? COLORS.red : COLORS.blue;
      ctx.fillStyle = `hsla(${hue}, 90%, 50%, 0.12)`;
      ctx.fillRect(i * barWidth + 2, h - height, barWidth - 4, height);
    }
    ctx.restore();
  }

  // Floating play icons (triangles)
  if (!reduced) {
    for (let i = 0; i < 5; i++) {
      const px = w * (0.1 + i * 0.2) + Math.sin(t.time * 0.0005 + i) * 30 + t.parallaxX * 0.01;
      const py = h * (0.2 + (i % 3) * 0.2) + Math.cos(t.time * 0.0007 + i) * 20 + t.parallaxY * 0.01;
      const size = 15 + i * 3;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `hsla(${COLORS.red}, 80%, 50%, 0.06)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - size, py - size * 0.7);
      ctx.lineTo(px - size, py + size * 0.7);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawContact(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Connection lines between nodes
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < t.dataNodes.length; i++) {
    const a = t.dataNodes[i];
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > w) a.vx *= -1;
    if (a.y < 0 || a.y > h) a.vy *= -1;
    for (let j = i + 1; j < t.dataNodes.length; j++) {
      const b = t.dataNodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const alpha = (1 - dist / 180) * (reduced ? 0.05 : 0.1);
        ctx.strokeStyle = `hsla(${COLORS.blue}, 80%, 50%, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  // Glowing dots
  for (const n of t.dataNodes) {
    const pulse = 0.3 + Math.sin(t.time * 0.002 + n.x * 0.01) * 0.2;
    ctx.fillStyle = `hsla(${COLORS.blue}, 80%, 60%, ${reduced ? 0.2 : pulse})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `hsla(${COLORS.blue}, 80%, 50%, 0.4)`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Particles
  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawRules(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Hexagon grid
  ctx.save();
  for (const hex of t.hexTiles) {
    const pulse = reduced ? 0.02 : 0.03 + Math.sin(t.time * 0.001 + hex.phase) * 0.02;
    ctx.strokeStyle = `hsla(${COLORS.cyan}, 70%, 50%, ${pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = hex.x + Math.cos(angle) * hex.size;
      const y = hex.y + Math.sin(angle) * hex.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Circuit traces
  if (!reduced) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `hsla(${COLORS.orange}, 80%, 50%, 0.04)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = ((t.time * 0.03 + i * h / 5) % h);
      ctx.beginPath();
      ctx.moveTo(0, y);
      let cx = 0;
      while (cx < w) {
        const segLen = 30 + Math.random() * 50;
        ctx.lineTo(cx + segLen, y);
        if (Math.random() > 0.5) {
          ctx.lineTo(cx + segLen, y + 20);
        }
        cx += segLen + 20;
        ctx.lineTo(cx, y + (Math.random() > 0.5 ? 0 : 20));
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawDefault(ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) {
  // Subtle gradient
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.6);
  grad.addColorStop(0, `hsla(${COLORS.blue}, 80%, 50%, ${reduced ? 0.02 : 0.04})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (const p of t.particles) {
    p.life++;
    p.y += p.vy;
    if (p.life > p.maxLife || p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.life = 0; }
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 50);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.alpha * fade})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const drawFns: Record<ThemeKey, (ctx: CanvasRenderingContext2D, t: Theme, w: number, h: number, reduced: boolean) => void> = {
  home: drawHome,
  tournaments: drawTournaments,
  leaderboard: drawLeaderboard,
  dashboard: drawDashboard,
  admin: drawAdmin,
  winners: drawWinners,
  youtube: drawYoutube,
  contact: drawContact,
  rules: drawRules,
  faq: drawRules,
  default: drawDefault,
};

export function AnimatedBackground({ theme }: { theme: ThemeKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<Theme>(createTheme());
  const rafRef = useRef<number>(0);
  const currentThemeRef = useRef<ThemeKey>(theme);

  const handleMouse = useCallback((e: MouseEvent) => {
    const t = themeRef.current;
    t.mouseX = e.clientX / window.innerWidth;
    t.mouseY = e.clientY / window.innerHeight;
    t.parallaxX = (t.mouseX - 0.5) * 20;
    t.parallaxY = (t.mouseY - 0.5) * 20;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initTheme(themeRef.current, currentThemeRef.current, w, h);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);

    const render = () => {
      const t = themeRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      t.time += 16;

      ctx.clearRect(0, 0, w, h);
      const drawFn = drawFns[currentThemeRef.current];
      if (drawFn) drawFn(ctx, t, w, h, reduced);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Re-init when theme changes
  useEffect(() => {
    currentThemeRef.current = theme;
    const w = window.innerWidth;
    const h = window.innerHeight;
    initTheme(themeRef.current, theme, w, h);
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
