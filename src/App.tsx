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
import { UserProvider } from './context/UserContext';

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    setIsOnboarded(!!onboardingComplete);
  }, []);

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="pb-20 lg:pb-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <MobileNav />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;