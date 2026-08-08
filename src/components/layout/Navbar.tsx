import { useState, useEffect } from 'react';
import { Menu, X, Trophy, MonitorPlay, User, Shield, LogOut, Bell } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Tournaments', path: '/tournaments' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Winners', path: '/winners' },
  { label: 'Media', path: '/media' },
  { label: 'YouTube', path: '/youtube' },
  { label: 'News', path: '/news' },
  { label: 'About', path: '/about' },
];

export function Navbar() {
  const { path, navigate } = useRouter();
  const { session, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (p: string) => (p === '/' ? path === '/' : path.startsWith(p));

  const go = (p: string) => {
    navigate(p);
    setOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-all duration-300',
        scrolled ? 'bg-bg-base/90 backdrop-blur-lg border-b border-border-subtle' : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => go('/')} className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-[0_0_18px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_26px_rgba(249,115,22,0.6)] transition-shadow">
              <Trophy size={20} className="text-white" />
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white">
            BGMI<span className="text-primary-500">ARENA</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => go(link.path)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(link.path)
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5',
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => go('/youtube')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <MonitorPlay size={18} />
          </button>

          {session ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => go('/notifications')}
                className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Bell size={18} />
              </button>
              <button
                onClick={() => go(isAdmin ? '/admin' : '/dashboard')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border-subtle hover:border-primary-500/50 transition-colors"
              >
                {isAdmin ? <Shield size={16} className="text-primary-400" /> : <User size={16} className="text-accent-400" />}
                <span className="text-sm font-medium text-neutral-200 max-w-24 truncate">
                  {profile?.username || 'Account'}
                </span>
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-500/10 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => go('/login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => go('/signup')}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-[0_0_18px_rgba(249,115,22,0.35)] transition-all"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-neutral-200 hover:bg-white/5"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-bg-surface/95 backdrop-blur-lg border-b border-border-subtle animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                className={cn(
                  'block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.path) ? 'text-primary-400 bg-primary-500/10' : 'text-neutral-300 hover:bg-white/5',
                )}
              >
                {link.label}
              </button>
            ))}
            {session ? (
              <>
                <button onClick={() => go(isAdmin ? '/admin' : '/dashboard')} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-accent-400 hover:bg-white/5">
                  {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                </button>
                <button onClick={() => { signOut(); setOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-error-500 hover:bg-error-500/10">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go('/login')} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-neutral-200 hover:bg-white/5">Login</button>
                <button onClick={() => go('/signup')} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-primary-400 hover:bg-primary-500/10">Register</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
