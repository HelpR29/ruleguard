import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import PWAInstall from './components/PWAInstall';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PWAProvider } from './context/PWAContext';
import Toasts from './components/Toasts';

// Lazy load all pages for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Rules = React.lazy(() => import('./pages/Rules'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Premium = React.lazy(() => import('./pages/Premium'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Friends = React.lazy(() => import('./pages/Friends'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    setIsOnboarded(!!onboardingComplete);
  }, []);

  if (!isOnboarded) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <Onboarding onComplete={() => setIsOnboarded(true)} />
            </Suspense>
            <Toasts />
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PWAProvider>
        <ThemeProvider>
          <ToastProvider>
            <UserProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Header />

                  <main className="pb-20 lg:pb-6" id="main-content">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/rules" element={<Rules />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/invite/:code" element={<InviteAccept />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/premium" element={<Premium />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/achievements" element={<Achievements />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </main>

                  <MobileNav />
                  <Toasts />

                  {/* PWA Install Prompt */}
                  <div className="fixed bottom-4 left-4 z-40">
                    <PWAInstall variant="banner" />
                  </div>
                </div>
              </Router>
            </UserProvider>
          </ToastProvider>
        </ThemeProvider>
      </PWAProvider>
    </ErrorBoundary>
  );
}

export default App;

// Inline component to handle invite links
function InviteAccept() {
  // using window.location because simple handler; alternatively use useParams
  const codeFromPath = window.location.pathname.split('/').pop() || '';
  const code = decodeURIComponent(codeFromPath).toUpperCase();
  try {
    const raw = localStorage.getItem('friends');
    const friends = raw ? JSON.parse(raw) : [];
    const exists = friends.some((f: any) => f.code === code);
    if (!exists && /^RG-[A-Z0-9]{6}$/.test(code)) {
      const f = {
        id: `${Date.now()}`,
        code,
        name: `Trader ${code.slice(-3)}`,
        disciplineScore: Math.floor(60 + Math.random()*35),
        badges: Math.random() > 0.5 ? ['Streak', 'Mindset'] : ['Risk Aware'],
        premium: Math.random() > 0.7
      };
      friends.unshift(f);
      localStorage.setItem('friends', JSON.stringify(friends));
    }
  } catch {}
  // redirect to friends page with a small banner
  window.history.replaceState({}, '', '/friends');
  // Use a tiny delay so Friends can read state? We'll attach state through sessionStorage
  try { sessionStorage.setItem('invite_added_code', code); } catch {}
  return <Navigate to="/friends" replace state={{ addedCode: code }} />;
}