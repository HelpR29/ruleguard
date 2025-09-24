import React from 'react';
import { Home, FileText, Users, Shield, BarChart3, Settings, X, Search, Tag, Filter } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Rules', count: 24 },
  { icon: Users, label: 'Users', count: 156 },
  { icon: Shield, label: 'Security' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Tag, label: 'Categories' },
  { icon: Filter, label: 'Filters' },
];

const bottomMenuItems = [
  { icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-50 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:z-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/20">
              <div className="relative">
                <span className="text-white font-bold text-sm tracking-tight">RG</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h2 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RuleGuard</h2>
              <p className="text-xs text-gray-500">Rule Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.count && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-1 border-t border-gray-200 pt-4">
          {bottomMenuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* User Profile */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}