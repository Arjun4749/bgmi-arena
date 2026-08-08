import { Trophy, MonitorPlay, Mail, MessageCircle, Camera, Bird } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

const YOUTUBE_CHANNEL = 'https://www.youtube.com/@bgmiarena';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-border-subtle bg-bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Trophy size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                BGMI<span className="text-primary-500">ARENA</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              The premier platform for BGMI esports tournaments. Compete, win, and rise through the ranks.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-200 mb-4">Compete</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Tournaments', path: '/tournaments' },
                { label: 'Leaderboard', path: '/leaderboard' },
                { label: 'Winners', path: '/winners' },
                { label: 'Rules', path: '/rules' },
              ].map((l) => (
                <li key={l.path}>
                  <button onClick={() => navigate(l.path)} className="text-neutral-400 hover:text-primary-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-200 mb-4">Info</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'News', path: '/news' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Contact', path: '/contact' },
              ].map((l) => (
                <li key={l.path}>
                  <button onClick={() => navigate(l.path)} className="text-neutral-400 hover:text-primary-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-200 mb-4">Connect</h3>
            <div className="flex items-center gap-3">
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-colors">
                <MonitorPlay size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent-400 hover:border-accent-500/50 hover:bg-accent-500/10 transition-colors">
                <Bird size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-green-400 hover:border-green-500/50 hover:bg-green-500/10 transition-colors">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-pink-400 hover:border-pink-500/50 hover:bg-pink-500/10 transition-colors">
                <Camera size={18} />
              </a>
            </div>
            <a href="mailto:contact@bgmiarena.gg" className="inline-flex items-center gap-2 mt-4 text-sm text-neutral-400 hover:text-primary-400 transition-colors">
              <Mail size={16} /> contact@bgmiarena.gg
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} BGMI Arena. All rights reserved.</p>
          <p className="text-xs text-neutral-500">Built for the BGMI community.</p>
        </div>
      </div>
    </footer>
  );
}
