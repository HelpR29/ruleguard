import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, BookOpen, BarChart3, Settings, Trophy } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/rules', icon: Shield, label: 'Rules' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}