import { AnimatedBackground, type ThemeKey } from '@/components/AnimatedBackground';
import { AmbientOverlay } from '@/components/AmbientOverlay';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MusicToggle } from '@/components/MusicToggle';
import { PageTransition } from '@/components/PageTransition';
import { AuthProvider } from '@/context/AuthContext';
import { RouterProvider, useRouter, matchRoute, useScrollTopOnNavigate } from '@/context/RouterContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimatePresence } from 'framer-motion';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { TournamentsPage } from '@/pages/TournamentsPage';
import { TournamentDetailPage } from '@/pages/TournamentDetailPage';
import { RulesPage } from '@/pages/RulesPage';
import { FaqPage } from '@/pages/FaqPage';
import { ContactPage } from '@/pages/ContactPage';
import { AboutPage } from '@/pages/AboutPage';
import { NewsPage } from '@/pages/NewsPage';
import { MediaPage } from '@/pages/MediaPage';
import { YoutubePage } from '@/pages/YoutubePage';
import { WinnersPage } from '@/pages/WinnersPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';

function pathToTheme(path: string): ThemeKey {
  if (path === '/') return 'home';
  if (path.startsWith('/tournaments')) return 'tournaments';
  if (path.startsWith('/leaderboard')) return 'leaderboard';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/winners')) return 'winners';
  if (path.startsWith('/youtube')) return 'youtube';
  if (path.startsWith('/contact')) return 'contact';
  if (path.startsWith('/rules')) return 'rules';
  if (path.startsWith('/faq')) return 'faq';
  return 'default';
}

function Routes() {
  const { path } = useRouter();
  useScrollTopOnNavigate();
  const theme = pathToTheme(path);

  // Auth pages render without navbar/footer
  if (path === '/login') return <LoginPage />;
  if (path === '/signup') return <SignupPage />;
  if (path === '/forgot-password') return <ForgotPasswordPage />;

  // Detail route with param
  const detail = matchRoute('/tournaments/:id', path);
  if (detail) return <TournamentDetailPage id={detail.id} />;

  let page: React.ReactNode;
  switch (path) {
    case '/': page = <LandingPage />; break;
    case '/tournaments': page = <TournamentsPage />; break;
    case '/rules': page = <RulesPage />; break;
    case '/faq': page = <FaqPage />; break;
    case '/contact': page = <ContactPage />; break;
    case '/about': page = <AboutPage />; break;
    case '/news': page = <NewsPage />; break;
    case '/media': page = <MediaPage />; break;
    case '/youtube': page = <YoutubePage />; break;
    case '/winners': page = <WinnersPage />; break;
    case '/leaderboard': page = <LeaderboardPage />; break;
    case '/dashboard': page = <DashboardPage />; break;
    case '/admin': page = <AdminPage />; break;
    default: page = <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ zIndex: 2 }}>
      <Navbar />
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <PageTransition key={path} pageKey={path}>
            {page}
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { path } = useRouter();
  const theme = pathToTheme(path);

  return (
    <>
      <LoadingScreen />
      <AnimatedBackground theme={theme} />
      <AmbientOverlay theme={theme} />
      <CursorGlow />
      <MusicToggle />
      <AuthProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

export default function AppWithProviders() {
  return (
    <RouterProvider>
      <App />
    </RouterProvider>
  );
}
