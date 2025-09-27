import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, Crown, Moon, Sun } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';
import AvatarSelector from './AvatarSelector';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/rules': 'Rules & Discipline',
  '/journal': 'Trading Journal',
  '/reports': 'Reports & Insights',
  '/leaderboard': 'Leaderboard',
  '/premium': 'Premium Features',
  '/settings': 'Settings',
  '/profile': 'Profile'
};

/**
 * Header component with comprehensive accessibility features
 *
 * Features:
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Focus management
 * - ARIA labels and roles
 * - Skip links for navigation
 */
export default function Header() {
  const location = useLocation();
  const { progress } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState('👤');
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<'none' | 'premium' | 'discount_25' | 'discount_50' | 'free_monthly'>('none');
  const [achievements, setAchievements] = useState<string[]>([]);
  const pageName = pageNames[location.pathname] || 'LockIn';
  // Premium trial countdown
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<Date | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  // Name modal removed (DisplayNamePrompt is the single source of truth)


  useEffect(() => {
    try {
      const locked = localStorage.getItem('profile_locked');
      setIsProfileLocked(locked === 'true');
      const ps = (localStorage.getItem('premium_status') as any) || 'none';
      setPremiumStatus(ps);
      const ach = JSON.parse(localStorage.getItem('user_achievements') || '[]');
      setAchievements(Array.isArray(ach) ? ach : []);
      const savedAvatar = localStorage.getItem('user_avatar');
      if (savedAvatar) setUserAvatar(savedAvatar);
      const exp = localStorage.getItem('premium_expires_at');
      if (exp) setPremiumExpiresAt(new Date(exp));
    } catch {}
    // compute initial unread notifications
    const computeUnread = () => {
      try {
        const arr = JSON.parse(localStorage.getItem('app_notifications') || '[]');
        const cnt = Array.isArray(arr) ? arr.filter((n: any) => !n.read).length : 0;
        setUnreadCount(cnt);
      } catch { setUnreadCount(0); }
    };
    computeUnread();

    const onNotifChange = () => computeUnread();
    window.addEventListener('rg:notifications-change', onNotifChange as EventListener);
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === 'app_notifications') computeUnread();
      if (e.key === 'premium_expires_at') {
        try { setPremiumExpiresAt(e.newValue ? new Date(e.newValue) : null); } catch {}
      }
    });
    // Listen for explicit premium change events from Friends.tsx
    const onPremiumChange = () => {
      try {
        const exp = localStorage.getItem('premium_expires_at');
        setPremiumExpiresAt(exp ? new Date(exp) : null);
      } catch {}
    };
    window.addEventListener('rg:premium-change', onPremiumChange as EventListener);
    return () => {
      window.removeEventListener('rg:notifications-change', onNotifChange as EventListener);
      window.removeEventListener('rg:premium-change', onPremiumChange as EventListener);
    };
  }, []);

  // Name modal effect removed

  // Recompute trial days left periodically (every hour) and on premiumExpiresAt change
  useEffect(() => {
    const computeDays = () => {
      if (!premiumExpiresAt) { setTrialDaysLeft(0); return; }
      const now = new Date();
      const ms = premiumExpiresAt.getTime() - now.getTime();
      const days = Math.ceil(ms / (24*60*60*1000));
      setTrialDaysLeft(days > 0 ? days : 0);
    };
    computeDays();
    const id = setInterval(computeDays, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [premiumExpiresAt]);

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowProfileMenu(false);
      setShowNotifications(false);
      setShowAvatarModal(false);
      setShowUpgradeModal(false);
    }
  };

  const mappedPremiumStatus: 'none' | 'discount_25' | 'discount_50' | 'free_monthly' =
    premiumStatus === 'premium' ? 'free_monthly' : premiumStatus;

  const handleLogout = async () => {
    try {
      const keys = [
        'user_settings','user_progress','user_rules','daily_stats','activity_log',
        'user_avatar','profile_locked','user_achievements','premium_status',
        'journal_trades','journal_notes'
      ];
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
    try { await signOut(); } catch {}
    setShowProfileMenu(false);
    // Send the user directly to login without forcing a full reload
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30"
      role="banner"
      aria-label="Main navigation header"
      onKeyDown={handleKeyDown}
    >
      {/* Skip link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Go to Dashboard"
          >
            <Logo showText subtitle={pageName} frame="card" />
          </Link>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{pageName}</h1>
          </div>
          {/* Desktop Top Nav */}
          <nav
            className="hidden lg:flex items-center gap-2 text-sm ml-2"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/' ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              to="/rules"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/rules'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/rules' ? 'page' : undefined}
            >
              Rules
            </Link>
            <Link
              to="/journal"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/journal'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/journal' ? 'page' : undefined}
            >
              Journal
            </Link>
            <Link
              to="/reports"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/reports'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/reports' ? 'page' : undefined}
            >
              Reports
            </Link>
            <Link
              to="/friends"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/friends'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/friends' ? 'page' : undefined}
            >
              Friends
            </Link>
            <Link
              to="/leaderboard"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/leaderboard'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/leaderboard' ? 'page' : undefined}
            >
              Leaderboard
            </Link>
            <Link
              to="/settings"
              className={`px-2 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                location.pathname==='/settings'?'bg-blue-50 text-blue-700 border border-blue-200':'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={location.pathname==='/settings' ? 'page' : undefined}
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Auth buttons when logged out */}
          {!user && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Link to="/login" className="px-3 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Log in</Link>
              <Link to="/signup" className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Sign up</Link>
            </div>
          )}
          {/* Trial Countdown Chip */}
          {premiumExpiresAt && trialDaysLeft > 0 && (
            <div
              className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700"
              title={`Trial ends on ${premiumExpiresAt.toLocaleDateString()} ${premiumExpiresAt.toLocaleTimeString()}`}
              aria-label={`Trial: ${trialDaysLeft} days left`}
            >
              <Crown className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-semibold">Trial: {trialDaysLeft} day{trialDaysLeft===1?'':'s'} left</span>
            </div>
          )}
          {/* Discipline Score */}
          <div
            className="hidden sm:flex items-center gap-2 relative group"
            title="Discipline Score = % of trades logged as rule‑compliant. It rises when you follow selected rules, and decreases when you record violations."
          >
            <div className="text-right" title="Discipline Score explanation">
              <p className="text-xs text-gray-500 dark:text-gray-300" aria-label="Current discipline score percentage">
                Discipline Score
              </p>
              <p className="text-sm font-bold text-green-600" aria-label={`${progress.disciplineScore} percent discipline score`}>
                {progress.disciplineScore}%
              </p>
            </div>
            <div
              className="w-12 h-12 relative"
              title="Higher arc = higher discipline. Based on compliant vs. violated rules across your trades."
            >
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
            {/* Tooltip bubble */}
            <div
              role="tooltip"
              className="absolute right-0 -top-2 -translate-y-full w-64 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
            >
              <p className="font-semibold mb-1">Discipline Score</p>
              <p>
                Percent of trades logged as rule‑compliant. Increases with compliance and decreases with violations.
              </p>
            </div>
          </div>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell 
              className="h-5 w-5 text-gray-600 dark:text-gray-300" 
              onClick={() => setShowNotifications(true)}
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                aria-label={`${unreadCount} unread notifications`}
                title={`${unreadCount} unread notifications`}
              />
            )}
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
          
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mr-1">
            <span className="truncate max-w-[100px]" title={profile?.display_name || 'Trading Pro'}>{profile?.display_name || 'Trading Pro'}</span>
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
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                View Profile
              </button>
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
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
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
                <span className="text-gray-500 dark:text-gray-300">✕</span>
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