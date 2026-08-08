import type { ThemeKey } from './AnimatedBackground';

// A translucent gradient overlay that shifts hue per page for ambient lighting.
const overlays: Record<ThemeKey, string> = {
  home: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.06), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(34,211,238,0.04), transparent 50%)',
  tournaments: 'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.05), transparent 60%), radial-gradient(ellipse at 20% 0%, rgba(249,115,22,0.03), transparent 50%)',
  leaderboard: 'radial-gradient(ellipse at 30% 40%, rgba(251,191,24,0.04), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(203,213,225,0.03), transparent 50%)',
  dashboard: 'radial-gradient(ellipse at 20% 30%, rgba(34,197,94,0.04), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(34,211,238,0.03), transparent 50%)',
  admin: 'radial-gradient(ellipse at 85% 25%, rgba(34,197,94,0.04), transparent 40%), radial-gradient(ellipse at 15% 80%, rgba(249,115,22,0.03), transparent 40%)',
  winners: 'radial-gradient(ellipse at 50% 30%, rgba(251,191,24,0.06), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.04), transparent 50%)',
  youtube: 'radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.04), transparent 60%), radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.02), transparent 50%)',
  contact: 'radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.04), transparent 60%)',
  rules: 'radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.03), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(249,115,22,0.02), transparent 50%)',
  faq: 'radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.03), transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(249,115,22,0.02), transparent 50%)',
  default: 'radial-gradient(ellipse at 50% 30%, rgba(34,211,238,0.03), transparent 60%)',
};

export function AmbientOverlay({ theme }: { theme: ThemeKey }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none transition-all duration-700"
      style={{ zIndex: 1, background: overlays[theme] || overlays.default }}
    />
  );
}
