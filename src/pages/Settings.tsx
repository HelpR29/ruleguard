import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Download } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Settings() {
  const { settings, updateSettings } = useUser();
  const [activeTab, setActiveTab] = useState('profile');

  const progressObjects = [
    { value: 'beer', emoji: '🍺', label: 'Beer' },
    { value: 'wine', emoji: '🍷', label: 'Wine' },
    { value: 'donut', emoji: '🍩', label: 'Donut' },
    { value: 'diamond', emoji: '💎', label: 'Diamond' },
    { value: 'trophy', emoji: '🏆', label: 'Trophy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm h-fit">
            <nav className="space-y-1">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'trading', icon: Shield, label: 'Trading Settings' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'appearance', icon: Palette, label: 'Appearance' },
                { id: 'export', icon: Download, label: 'Data Export' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your trading name"
                      defaultValue="Trading Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                      defaultValue="trader@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Trading Settings */}
            {activeTab === 'trading' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Starting Portfolio
                      </label>
                      <input
                        type="number"
                        value={settings.startingPortfolio}
                        onChange={(e) => updateSettings({ startingPortfolio: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Completions
                      </label>
                      <input
                        type="number"
                        value={settings.targetCompletions}
                        onChange={(e) => updateSettings({ targetCompletions: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Growth Per Completion (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.growthPerCompletion}
                        onChange={(e) => updateSettings({ growthPerCompletion: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Object</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {progressObjects.map((obj) => (
                      <button
                        key={obj.value}
                        onClick={() => updateSettings({ progressObject: obj.value as any })}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          settings.progressObject === obj.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{obj.emoji}</div>
                        <p className="text-xs font-medium text-gray-700">{obj.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'completions', label: 'Completion Reminders', description: 'Get reminded to log your daily completions' },
                    { id: 'violations', label: 'Rule Violations', description: 'Alerts when rules are broken' },
                    { id: 'reports', label: 'Weekly Reports', description: 'Receive automated performance reports' },
                    { id: 'milestones', label: 'Milestone Achievements', description: 'Celebrate your progress milestones' },
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{notification.label}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'appearance' || activeTab === 'export') && (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'appearance' ? (
                    <Palette className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Download className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                  {activeTab} Settings
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'appearance' 
                    ? 'Customize themes, colors, and layout preferences'
                    : 'Export your trading data and reports'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}