import React, { useState } from 'react';
import { Plus, TrendingUp, Target, Calendar, Share2, Crown, Star, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import AnimatedProgressIcon, { ProgressGrid } from '../components/AnimatedProgressIcon';
import CompoundingChart from '../components/CompoundingChart';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';

export default function Dashboard() {
  const { settings, progress, updateProgress, updateSettings } = useUser();
  const { addToast } = useToast();
  const [showAddCompletion, setShowAddCompletion] = useState(false);
  const [progressView, setProgressView] = useState<'icon'|'grid'>('icon');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNextGoal, setShowNextGoal] = useState(false);
  const [nextGoalType, setNextGoalType] = useState<'same' | 'increase' | 'custom'>('same');
  const [customTarget, setCustomTarget] = useState(settings.targetCompletions);
  const [customGrowth, setCustomGrowth] = useState(settings.growthPerCompletion);

  const targetBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, settings.targetCompletions);
  const progressPercent = (progress.completions / settings.targetCompletions) * 100;

  const addCompletion = () => {
    // Don't allow completions beyond target
    if (progress.completions >= settings.targetCompletions) {
      return;
    }
    
    const newCompletions = Math.min(progress.completions + 1, settings.targetCompletions);
    const newBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, newCompletions);
    const newDiscipline = Math.min(100, progress.disciplineScore + 1);
    const newStreak = progress.streak + 1;
    updateProgress({
      completions: newCompletions,
      currentBalance: Number(newBalance.toFixed(2)),
      disciplineScore: newDiscipline,
      streak: newStreak,
    });
    
    // Show celebration if goal is reached
    if (newCompletions === settings.targetCompletions) {
      setShowCelebration(true);
    }
  };

  const addViolation = () => {
    const newCompletions = Math.max(progress.completions - 1, 0);
    const newBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, newCompletions);
    const newDiscipline = Math.max(0, progress.disciplineScore - 2);
    updateProgress({
      completions: newCompletions,
      currentBalance: Number(newBalance.toFixed(2)),
      disciplineScore: newDiscipline,
      streak: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              <p className="text-2xl font-bold">${(settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, progress.completions)).toFixed(2)}</p>
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
            <div className="rounded-2xl p-6 shadow-sm card-surface">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Tracker</h3>
                <div className="flex items-center gap-2">
                  <button className="text-xs accent-outline" onClick={() => setProgressView(v => v === 'icon' ? 'grid' : 'icon')}>Switch View</button>
                  {progress.completions < settings.targetCompletions ? (
                    <button
                      onClick={() => setShowAddCompletion(true)}
                      className="flex items-center gap-2 accent-btn"
                    >
                      <Plus className="h-4 w-4" />
                      Add Completion
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Goal Completed!
                    </div>
                  )}
                </div>
              </div>
              
              {progressView === 'icon' ? (
                <div className="flex flex-col items-center space-y-8">
                  <AnimatedProgressIcon 
                    size="xl"
                    onComplete={addCompletion}
                    onViolation={addViolation}
                  />
                    <div className="rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-600 card-surface">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {progress.completions}/{settings.targetCompletions}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {progress.completions >= settings.targetCompletions 
                          ? `All ${settings.progressObject}s completed! 🎉`
                          : `${Math.max(0, settings.targetCompletions - progress.completions)} ${settings.progressObject}s remaining`
                        }
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(progress.completions / settings.targetCompletions) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to add completion • Double-click for violation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <ProgressGrid onComplete={addCompletion} onViolation={addViolation} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click next item for completion • Click completed item for violation
                  </p>
                </div>
              )}
            </div>

            {/* Compounding Growth Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Growth Projection</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Next Milestone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Target Balance</span>
                  <span className="font-bold text-green-600">${targetBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Remaining</span>
                  <span className={`font-bold ${
                    progress.completions >= settings.targetCompletions 
                      ? 'text-green-600' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {progress.completions >= settings.targetCompletions 
                      ? 'Goal Achieved! 🎉' 
                      : `${settings.targetCompletions - progress.completions} completions`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${
                  progress.completions >= settings.targetCompletions
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {progress.completions >= settings.targetCompletions
                    ? 'Congratulations! You\'ve reached your goal!'
                    : `${progressPercent.toFixed(1)}% complete`
                  }
                </p>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Completion</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Confirm that you've successfully completed your trading rules and discipline requirements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddCompletion(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addCompletion();
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

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You've completed your goal of {settings.targetCompletions} {settings.progressObject}s!
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Final Portfolio Value</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                ${targetBalance.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Growth: {(((targetBalance - settings.startingPortfolio) / settings.startingPortfolio) * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowCelebration(false);
                  setShowNextGoal(true);
                }}
                className="w-full accent-btn"
              >
                Set Next Goal
              </button>
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Continue Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Goal Modal */}
      {showNextGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Set Your Next Goal</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Congratulations on completing your goal! What would you like to achieve next?
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="goalType" 
                    value="same"
                    checked={nextGoalType === 'same'}
                    onChange={(e) => setNextGoalType(e.target.value as any)}
                    className="accent-radio"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Same Goal Again</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {settings.targetCompletions} {settings.progressObject}s with {settings.growthPerCompletion}% growth
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="goalType" 
                    value="increase"
                    checked={nextGoalType === 'increase'}
                    onChange={(e) => setNextGoalType(e.target.value as any)}
                    className="accent-radio"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Increase Challenge</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.floor(settings.targetCompletions * 1.5)} {settings.progressObject}s with {settings.growthPerCompletion + 2}% growth
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="goalType" 
                    value="custom"
                    checked={nextGoalType === 'custom'}
                    onChange={(e) => setNextGoalType(e.target.value as any)}
                    className="accent-radio"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Custom Goal</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-300">Target</label>
                        <input 
                          type="number" 
                          value={customTarget}
                          onChange={(e) => setCustomTarget(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          disabled={nextGoalType !== 'custom'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-300">Growth %</label>
                        <input 
                          type="number" 
                          value={customGrowth}
                          onChange={(e) => setCustomGrowth(Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          disabled={nextGoalType !== 'custom'}
                        />
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowNextGoal(false);
                  setShowCelebration(true);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button 
                onClick={() => {
                  // Apply new goal settings
                  let newTarget = settings.targetCompletions;
                  let newGrowth = settings.growthPerCompletion;
                  
                  if (nextGoalType === 'increase') {
                    newTarget = Math.floor(settings.targetCompletions * 1.5);
                    newGrowth = settings.growthPerCompletion + 2;
                  } else if (nextGoalType === 'custom') {
                    newTarget = customTarget;
                    newGrowth = customGrowth;
                  }
                  
                  // Update settings
                  updateSettings({
                    ...settings,
                    targetCompletions: newTarget,
                    growthPerCompletion: newGrowth,
                    startingPortfolio: targetBalance, // Use achieved balance as new starting point
                  });
                  
                  // Reset progress
                  updateProgress({
                    completions: 0,
                    currentBalance: targetBalance,
                    disciplineScore: progress.disciplineScore,
                    streak: progress.streak,
                  });
                  
                  setShowNextGoal(false);
                  addToast('success', `New goal set: ${newTarget} ${settings.progressObject}s with ${newGrowth}% growth!`);
                }}
                className="flex-1 accent-btn"
              >
                Start New Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}