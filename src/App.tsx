// Layout component to conditionally show chrome (header/footer) based on route
function AppLayout() {
  const location = useLocation();
  const path = location.pathname;
  const isAuthRoute = path === '/login' || path === '/signup';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAuthRoute && <Header />}
      {!isAuthRoute && <DisplayNamePrompt />}

      <main className={!isAuthRoute ? 'pb-20 lg:pb-6' : ''} id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/invite/:code" element={<InviteAccept />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isAuthRoute && (
        <>
          <MobileNav />
          <Toasts />
          <div className="fixed bottom-4 left-4 z-40">
            <PWAInstall variant="banner" />
          </div>
        </>
      )}
      {isAuthRoute && <Toasts />}
    </div>
  );
}

import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { PWAProvider } from './context/PWAContext';
import Header from './components/Header';
import Toasts from './components/Toasts';
import ProtectedRoute from './components/ProtectedRoute';
import DisplayNamePrompt from './components/DisplayNamePrompt';

// Lazy load all pages for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Rules = React.lazy(() => import('./pages/Rules'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Premium = React.lazy(() => import('./pages/Premium'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Friends = React.lazy(() => import('./pages/Friends'));
const SignIn = React.lazy(() => import('./pages/SignIn'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Reports = React.lazy(() => import('./pages/Reports'));
const MobileNav = React.lazy(() => import('./components/MobileNav'));
const PWAInstall = React.lazy(() => import('./components/PWAInstall'));

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
            <AuthProvider>
              <Router>
                {/* Show display-name prompt before onboarding, but not on auth routes */}
                {(() => {
                  const AuthlessPrompt = () => {
                    const loc = useLocation();
                    const path = loc.pathname;
                    const isAuth = path === '/login' || path === '/signup';
                    return isAuth ? null : <DisplayNamePrompt />;
                  };
                  return <AuthlessPrompt />;
                })()}
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    {/* Any other path (including "/") goes to onboarding until completed */}
                    <Route path="*" element={<Onboarding onComplete={() => setIsOnboarded(true)} />} />
                  </Routes>
                </Suspense>
                <Toasts />
              </Router>
            </AuthProvider>
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
            <AuthProvider>
            <UserProvider>
              <Router>
                <AppLayout />
              </Router>
            </UserProvider>
            </AuthProvider>
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