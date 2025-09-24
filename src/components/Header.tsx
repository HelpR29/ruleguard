import React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, User, Crown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import NotificationPanel from './NotificationPanel';
import AvatarSelector from './AvatarSelector';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState('👤');
  const pageName = pageNames[location.pathname] || 'RuleGuard';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/20">
            <div className="relative">
              <span className="text-white font-bold text-sm tracking-tight">RG</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RuleGuard</h1>
            <p className="text-xs text-gray-500">{pageName}</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{pageName}</h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Discipline Score */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-gray-500">Discipline Score</p>
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

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell 
              className="h-5 w-5 text-gray-600" 
              onClick={() => setShowNotifications(true)}
            />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Crown className="h-5 w-5 text-purple-600" />
          </button>
          
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          
          <button 
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowAvatarModal(true)}
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Profile Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-500">✕</span>
              </button>
            </div>
            <AvatarSelector
              selectedAvatar={userAvatar}
              onAvatarChange={setUserAvatar}
              userAchievements={['week_streak']} // Mock achievements - replace with real data
              premiumStatus="none" // Can be 'none', 'discount_25', 'discount_50', 'free_monthly'
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}