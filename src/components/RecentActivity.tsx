import React from 'react';
import { CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';

export default function RecentActivity() {
  const activities = [
    {
      type: 'completion',
      title: 'Rule completion #12',
      description: 'Followed all trading rules',
      time: '2 hours ago',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      type: 'journal',
      title: 'Journal entry added',
      description: 'Reflected on today\'s trades',
      time: '4 hours ago',
      icon: BookOpen,
      iconColor: 'text-blue-500'
    },
    {
      type: 'growth',
      title: 'Portfolio growth',
      description: '+1.2% from last completion',
      time: '1 day ago',
      icon: TrendingUp,
      iconColor: 'text-purple-500'
    },
    {
      type: 'violation',
      title: 'Rule violation',
      description: 'Exceeded risk limit',
      time: '2 days ago',
      icon: XCircle,
      iconColor: 'text-red-500'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
        View all activity
      </button>
    </div>
  );
}