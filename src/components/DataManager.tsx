/**
 * Data Manager Component
 * Provides tools for managing user data, resetting, and ensuring consistency
 */

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Trash2, Settings } from 'lucide-react';
import { resetUserData, initializeFreshUser, validateDataConsistency } from '../utils/dataReset';
import { useUser } from '../context/UserContext';

export default function DataManager() {
  const { progress, settings, updateSettings, updateProgress } = useUser();
  const [isResetting, setIsResetting] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleValidateData = () => {
    const result = validateDataConsistency();
    setValidationResult(result);
  };

  const handleResetData = async () => {
    if (!showConfirmReset) {
      setShowConfirmReset(true);
      return;
    }

    setIsResetting(true);
    try {
      // Reset data
      const success = resetUserData();
      if (success) {
        // Initialize fresh user
        initializeFreshUser({
          startingPortfolio: 100,
          targetCompletions: 50,
          growthPerCompletion: 1,
          progressObject: 'beer'
        });

        // Reload the page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
      setShowConfirmReset(false);
    }
  };

  const handleFixInconsistencies = () => {
    // Fix common inconsistencies
    if (progress.completions === 0 && progress.currentBalance !== settings.startingPortfolio) {
      updateProgress({ currentBalance: settings.startingPortfolio });
    }

    if (progress.disciplineScore > 100) {
      updateProgress({ disciplineScore: 100 });
    }

    if (progress.completions > settings.targetCompletions) {
      updateProgress({ completions: settings.targetCompletions });
    }

    // Re-validate
    setTimeout(() => handleValidateData(), 500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Manager</h2>
      </div>

      {/* Current Data Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Progress</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.completions}/{settings.targetCompletions} completions
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ${progress.currentBalance} balance
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ${settings.startingPortfolio} starting
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {settings.growthPerCompletion}% per completion
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.streak} day streak
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.disciplineScore}% discipline
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {/* Validate Data */}
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Validate Data Consistency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Check for data inconsistencies and errors
            </p>
          </div>
          <button
            onClick={handleValidateData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Validate
          </button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className={`p-4 rounded-lg border ${
            validationResult.valid 
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
              : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.valid ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <h4 className={`font-medium ${
                validationResult.valid 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {validationResult.valid ? 'Data is consistent' : 'Issues found'}
              </h4>
            </div>
            
            {!validationResult.valid && validationResult.issues.length > 0 && (
              <div className="space-y-2">
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
                <button
                  onClick={handleFixInconsistencies}
                  className="mt-3 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-sm hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
                >
                  Fix Issues
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reset Data */}
        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Reset All Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Clear all progress and start fresh (cannot be undone)
            </p>
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showConfirmReset
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
            }`}
          >
            {isResetting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {showConfirmReset ? 'Confirm Reset' : 'Reset Data'}
          </button>
        </div>

        {showConfirmReset && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              ⚠️ This will permanently delete all your progress, trades, rules, and settings. 
              This action cannot be undone.
            </p>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
