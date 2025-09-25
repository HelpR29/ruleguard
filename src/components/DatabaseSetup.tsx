/**
 * Database Setup Component
 * UI for managing database configuration and migration
 */

import React, { useState } from 'react';
import { Database, Trash2, Server, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { clearLocalDatabase, setupSupabase, getSupabaseInstructions } from '../utils/databaseSetup';
import { isSupabaseConfigured, testConnection } from '../lib/supabase';
import { hybridDatabase } from '../services/hybridDatabase';
import SyncStatus from './SyncStatus';

interface DatabaseSetupProps {
  userId?: string;
}

export default function DatabaseSetup({ userId = 'demo-user' }: DatabaseSetupProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  const instructions = getSupabaseInstructions();
  const supabaseConfigured = isSupabaseConfigured();

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearLocalDatabase();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Error clearing database. Check console for details.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');

    try {
      const result = await testConnection();
      if (result.success) {
        setConnectionStatus('success');
        setTimeout(() => setConnectionStatus('idle'), 3000);
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Unknown error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const copySchemaToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(instructions.schema);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch (error) {
      console.error('Failed to copy schema:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Database Setup</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Hybrid caching system: localStorage for speed + Supabase for cloud sync
        </p>
      </div>

      {/* Sync Status */}
      <SyncStatus userId={userId} />

      {/* Current Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Storage Type:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              supabaseConfigured 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {supabaseConfigured ? 'Supabase (Cloud)' : 'localStorage (Local)'}
            </span>
          </div>
          
          {supabaseConfigured && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Connection:</span>
              <button
                onClick={handleTestConnection}
                disabled={connectionStatus === 'testing'}
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {connectionStatus === 'testing' && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                {connectionStatus === 'success' && <Check className="h-4 w-4 text-green-600" />}
                {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">
                <strong>Connection Error:</strong> {connectionError}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clear Local Database */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Clear Local Data</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Remove all locally stored data including trades, progress, and settings. This is useful when switching to Supabase.
        </p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isClearing ? 'Clearing...' : 'Clear Local Database'}
          </button>

          {clearSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Database cleared successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Setup */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supabase Setup</h2>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Server className="h-4 w-4" />
            {showInstructions ? 'Hide Instructions' : 'Show Setup Instructions'}
          </button>
        </div>

        {!supabaseConfigured && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Supabase Not Configured</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
                  Set up Supabase to enable cloud sync, backup, and multi-device access.
                </p>
              </div>
            </div>
          </div>
        )}

        {showInstructions && (
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {instructions.title}
              </h3>
              
              <div className="space-y-4">
                {instructions.steps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 whitespace-pre-line">
                        {step.description}
                      </p>
                      {step.step === 1 && (
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2"
                        >
                          Open Supabase <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL Schema */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Database Schema (SQL)</h4>
                <button
                  onClick={copySchemaToClipboard}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  {copiedSchema ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Schema
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
                {instructions.schema}
              </pre>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Important Notes</h4>
                  <ul className="text-yellow-800 dark:text-yellow-200 text-sm mt-2 space-y-1">
                    <li>• After setting up Supabase, restart your application</li>
                    <li>• Your local data will remain until you manually clear it</li>
                    <li>• Row Level Security (RLS) is enabled for data protection</li>
                    <li>• Authentication is required to access your data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How the Hybrid System Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Cache-First Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data is served instantly from localStorage cache for immediate UI response
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Background Sync</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Changes are automatically synced to Supabase in the background
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Offline Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Works perfectly offline, syncs when connection is restored
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Multi-Device Sync</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your data from any device with automatic synchronization
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Benefits of Hybrid Approach</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• ⚡ Instant performance with localStorage caching</li>
            <li>• ☁️ Reliable cloud backup and sync with Supabase</li>
            <li>• 📱 Works offline and syncs when online</li>
            <li>• 🔄 Automatic conflict resolution and data consistency</li>
            <li>• 🛡️ Fallback to local storage if cloud is unavailable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
