import React, { useState } from 'react';
import { Plus, TrendingUp, Target, Calendar, Share2, Crown, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import AnimatedProgressIcon from '../components/AnimatedProgressIcon';
import CompoundingChart from '../components/CompoundingChart';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';

export default function Dashboard() {
  const { settings, progress } = useUser();
  const [showAddCompletion, setShowAddCompletion] = useState(false);

  const targetBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, settings.targetCompletions);
  const progressPercent = (progress.completions / settings.targetCompletions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Trader!</h2>
              <p className="text-blue-100">Keep building your discipline streak</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Upgrade to Pro</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-500/30 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Current Streak</p>
              <p className="text-2xl font-bold">{progress.streak} days</p>
            </div>
            <div className="bg-blue-500/30 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Completions</p>
              <p className="text-2xl font-bold">{progress.completions}/{settings.targetCompletions}</p>
            </div>
            <div className="bg-blue-500/30 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Portfolio</p>
              <p className="text-2xl font-bold">${progress.currentBalance.toFixed(2)}</p>
            </div>
            <div className="bg-blue-500/30 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Discipline</p>
              <p className="text-2xl font-bold">{progress.disciplineScore}%</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Tracker */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Progress Tracker</h3>
                <button
                  onClick={() => setShowAddCompletion(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Completion
                </button>
              </div>
              
              {/* Animated Progress Icon */}
              <div className="flex flex-col items-center space-y-8">
                <AnimatedProgressIcon 
                  size="xl"
                  onComplete={() => {
                    // Handle completion
                    console.log('Completion added!');
                  }}
                  onViolation={() => {
                    // Handle violation
                    console.log('Rule violation!');
                  }}
                />
                
                {/* Clean Progress Summary */}
                <div className="text-center space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {progress.completions}/{settings.targetCompletions}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {settings.targetCompletions - progress.completions} {settings.progressObject}s remaining
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.completions / settings.targetCompletions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click to add completion • Double-click for violation
                  </p>
                </div>
              </div>
            </div>

            {/* Compounding Growth Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Growth Projection</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  {settings.growthPerCompletion}% per completion
                </div>
              </div>
              <CompoundingChart />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivity />

            {/* Next Milestone */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Next Milestone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Target Balance</span>
                  <span className="font-bold text-green-600">${targetBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-bold">{settings.targetCompletions - progress.completions} completions</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{progressPercent.toFixed(1)}% complete</p>
              </div>
            </div>

            {/* Share Progress */}
            <div className="space-y-4">
              {/* Premium Upgrade */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Unlock Premium</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Get advanced analytics, AI coaching, and exclusive features
                </p>
                <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                  Start Free Trial
                </button>
              </div>
              
              {/* Share Progress */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Share Your Progress</h3>
                <p className="text-green-100 text-sm mb-4">
                  Let others know about your trading discipline journey
                </p>
                <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors py-3 rounded-xl">
                  <Share2 className="h-4 w-4" />
                  Create Share Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Completion Modal */}
      {showAddCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Completion</h3>
            <p className="text-gray-600 mb-4">
              Confirm that you've successfully completed your trading rules and discipline requirements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCompletion(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add completion logic here
                  setShowAddCompletion(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}