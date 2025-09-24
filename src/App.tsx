import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Journal from './pages/Journal';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import Premium from './pages/Premium';
import Achievements from './pages/Achievements';
import Onboarding from './pages/Onboarding';
import Friends from './pages/Friends';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Toasts from './components/Toasts';

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    setIsOnboarded(!!onboardingComplete);
  }, []);

  if (!isOnboarded) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <Onboarding onComplete={() => setIsOnboarded(true)} />
          <Toasts />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
            
              <main className="pb-20 lg:pb-6">
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
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            
              <MobileNav />
              <Toasts />
            </div>
          </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

// Inline component to handle invite links
function InviteAccept() {
  const params = new URLSearchParams(window.location.search);
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