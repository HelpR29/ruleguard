import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Download, Lock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { settings, updateSettings } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  // Profile name + lock
  const [displayName, setDisplayName] = useState<string>(() => {
    try { return localStorage.getItem('display_name') || 'Trading Pro'; } catch { return 'Trading Pro'; }
  });
  const [nameLocked, setNameLocked] = useState<boolean>(() => {
    try { return localStorage.getItem('profile_locked') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('display_name', displayName); } catch {}
  }, [displayName]);
  useEffect(() => {
    try { localStorage.setItem('profile_locked', String(nameLocked)); } catch {}
  }, [nameLocked]);

  // Accent color
  const [accent, setAccent] = useState<string>(() => {
    try { return localStorage.getItem('accent_color') || 'blue'; } catch { return 'blue'; }
  });
  useEffect(() => {
    try { localStorage.setItem('accent_color', accent); } catch {}
    try { document.documentElement.setAttribute('data-accent', accent); } catch {}
  }, [accent]);

  // Density: compact | comfortable | cozy
  const [density, setDensity] = useState<string>(() => {
    try { return localStorage.getItem('ui_density') || 'comfortable'; } catch { return 'comfortable'; }
  });
  useEffect(() => {
    try { localStorage.setItem('ui_density', density); } catch {}
    try { document.documentElement.setAttribute('data-density', density); } catch {}
  }, [density]);

  // Card style: standard | outlined | filled
  const [cardStyle, setCardStyle] = useState<string>(() => {
    try { return localStorage.getItem('ui_card') || 'standard'; } catch { return 'standard'; }
  });
  useEffect(() => {
    try { localStorage.setItem('ui_card', cardStyle); } catch {}
    try { document.documentElement.setAttribute('data-card', cardStyle); } catch {}
  }, [cardStyle]);

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
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${nameLocked ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Your trading name"
                        value={displayName}
                        onChange={(e)=>setDisplayName(e.target.value)}
                        disabled={nameLocked}
                      />
                      <button
                        type="button"
                        onClick={() => setNameLocked(prev => !prev)}
                        className={`px-3 py-2 rounded-lg border ${nameLocked ? 'bg-gray-100 text-gray-700 border-gray-300' : 'hover:bg-gray-50 border-gray-300'}`}
                        title={nameLocked ? 'Name is locked' : 'Lock name after saving'}
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </div>
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

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Theme</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { if (theme !== 'light') toggleTheme(); }}
                        className={`px-3 py-2 rounded-lg border ${theme==='light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        Light
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                        className={`px-3 py-2 rounded-lg border ${theme==='dark' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Accent Color</p>
                    <div className="flex items-center gap-2">
                      {['blue','purple','emerald','amber','rose'].map(c => (
                        <button
                          key={c}
                          onClick={() => setAccent(c)}
                          className={`w-9 h-9 rounded-full border-2 ${accent===c ? 'border-gray-900' : 'border-transparent'}`}
                          style={{ background:
                            c==='blue'? '#3b82f6' : c==='purple'? '#8b5cf6' : c==='emerald'? '#10b981' : c==='amber'? '#f59e0b' : '#f43f5e' }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Density</p>
                    <div className="flex items-center gap-2">
                      {['compact','comfortable','cozy'].map(d => (
                        <button
                          key={d}
                          onClick={() => setDensity(d)}
                          className={`px-3 py-2 rounded-lg border capitalize ${density===d ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Card Style</p>
                    <div className="flex items-center gap-2">
                      {[
                        {k:'standard', label:'Standard'},
                        {k:'outlined', label:'Outlined'},
                        {k:'filled', label:'Filled'}
                      ].map(opt => (
                        <button
                          key={opt.k}
                          onClick={() => setCardStyle(opt.k)}
                          className={`px-3 py-2 rounded-lg border ${cardStyle===opt.k ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">These preferences are saved on this device.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Export placeholder */}
            {activeTab === 'export' && (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                  Data Export
                </h3>
                <p className="text-gray-600">
                  Export your trading data and reports
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}