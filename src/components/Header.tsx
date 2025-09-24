import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, Crown, Moon, Sun } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';
import AvatarSelector from './AvatarSelector';
import Logo from './Logo';

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/rules': 'Rules & Discipline',
  '/journal': 'Trading Journal',
  '/reports': 'Reports & Insights',
  '/leaderboard': 'Leaderboard',
  '/premium': 'Premium Features',
  '/settings': 'Settings'
};

export default function Header() {
  const location = useLocation();
  const { progress } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState('👤');
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [displayName, setDisplayName] = useState('Trading Pro');
  const [premiumStatus, setPremiumStatus] = useState<'none' | 'premium' | 'discount_25' | 'discount_50' | 'free_monthly'>('none');
  const [achievements, setAchievements] = useState<string[]>([]);
  const pageName = pageNames[location.pathname] || 'RuleGuard';

  useEffect(() => {
    try {
      const locked = localStorage.getItem('profile_locked');
      setIsProfileLocked(locked === 'true');
      const dn = localStorage.getItem('display_name');
      if (dn) setDisplayName(dn);
      const ps = (localStorage.getItem('premium_status') as any) || 'none';
      setPremiumStatus(ps);
      const ach = JSON.parse(localStorage.getItem('user_achievements') || '[]');
      setAchievements(Array.isArray(ach) ? ach : []);
      const savedAvatar = localStorage.getItem('user_avatar');
      if (savedAvatar) setUserAvatar(savedAvatar);
    } catch {}
  }, []);

  const mappedPremiumStatus: 'none' | 'discount_25' | 'discount_50' | 'free_monthly' =
    premiumStatus === 'premium' ? 'free_monthly' : premiumStatus;

  const handleLogout = () => {
    try {
      const keys = [
        'user_settings','user_progress','user_rules','daily_stats','activity_log',
        'user_avatar','profile_locked','user_achievements','premium_status',
        'journal_trades','journal_notes','onboarding_complete'
      ];
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
    setShowProfileMenu(false);
    navigate('/');
    // force a refresh so App re-checks onboarding
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" aria-label="Go to Dashboard">
            <Logo size={40} showText subtitle={pageName} />
          </Link>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{pageName}</h1>
          </div>
          {/* Desktop Top Nav */}
          <nav className="hidden lg:flex items-center gap-4 text-sm ml-2">
            <Link to="/" className={`px-3 py-1 rounded-lg ${location.pathname==='/'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Home</Link>
            <Link to="/rules" className={`px-3 py-1 rounded-lg ${location.pathname==='/rules'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Rules</Link>
            <Link to="/journal" className={`px-3 py-1 rounded-lg ${location.pathname==='/journal'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Journal</Link>
            <Link to="/reports" className={`px-3 py-1 rounded-lg ${location.pathname==='/reports'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Reports</Link>
            <Link to="/friends" className={`px-3 py-1 rounded-lg ${location.pathname==='/friends'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Friends</Link>
            <Link to="/leaderboard" className={`px-3 py-1 rounded-lg ${location.pathname==='/leaderboard'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Leaderboard</Link>
            <Link to="/settings" className={`px-3 py-1 rounded-lg ${location.pathname==='/settings'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'}`}>Settings</Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Discipline Score */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Discipline Score</p>
              <p className="text-sm font-bold text-green-600">{progress.disciplineScore}%</p>
            </div>
            <div className="w-12 h-12 relative">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray={`${progress.disciplineScore}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">{progress.disciplineScore}</span>
              </div>
            </div>
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell 
              className="h-5 w-5 text-gray-600 dark:text-gray-300" 
              onClick={() => setShowNotifications(true)}
            />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Crown className="h-5 w-5 text-purple-600" />
          </button>
          
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={()=>navigate('/settings')}>
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mr-1">
            <span className="truncate max-w-[120px]" title={displayName}>{displayName}</span>
          </div>
          <button 
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            onClick={() => setShowProfileMenu(prev => !prev)}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {userAvatar.startsWith('data:') ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : userAvatar === '👤' ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <span className="text-sm">{userAvatar}</span>
              )}
            </div>
          </button>
          {showProfileMenu && (
            <div className="absolute right-4 top-14 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 w-56 z-40">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  const allowed = !isProfileLocked || premiumStatus === 'premium' || achievements.includes('champion');
                  if (allowed) {
                    setShowAvatarModal(true);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Settings
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/premium'); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Premium
              </button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400">✕</span>
              </button>
            </div>
            <AvatarSelector
              selectedAvatar={userAvatar}
              onAvatarChange={setUserAvatar}
              userAchievements={achievements}
              premiumStatus={mappedPremiumStatus}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('user_avatar', userAvatar);
                    // Lock profile after first save
                    localStorage.setItem('profile_locked', 'true');
                    setIsProfileLocked(true);
                  } catch {}
                  setShowAvatarModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upgrade required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Avatar editing is locked after initial setup. Unlock editing with Premium, or by earning the Champion badge.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/premium');
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Go to Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}