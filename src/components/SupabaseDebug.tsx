import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, testConnection } from '../lib/supabase';
import { Database, RefreshCw, AlertCircle, CheckCircle, Settings } from 'lucide-react';

export default function SupabaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    
    if (!isSupabaseConfigured()) {
      setConnectionStatus('not-configured');
      setErrorDetails('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are missing');
      return;
    }

    const result = await testConnection();
    if (result.success) {
      setConnectionStatus('connected');
      setErrorDetails('');
    } else {
      setConnectionStatus('error');
      setErrorDetails(result.error || 'Unknown error');
    }
  };

  const resetUserData = async () => {
    setIsResetting(true);
    try {
      // Clear all local storage
      localStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Optionally delete user account (requires confirmation)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Current user:', user.email);
        // Note: Deleting user requires admin privileges or RLS policies
      }
      
      alert('Local data cleared and signed out. You can now create a new account.');
      window.location.reload();
    } catch (error) {
      console.error('Reset error:', error);
      alert('Error during reset: ' + (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  const createTestUser = async () => {
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        alert('Test user creation failed: ' + error.message);
      } else {
        alert(`✅ Test user created!\n\nEmail: ${testEmail}\nPassword: ${testPassword}\n\nYou can now log in with these credentials.`);
      }
    } catch (error) {
      alert('Error creating test user: ' + (error as Error).message);
    }
  };

  const disableEmailConfirmation = async () => {
    alert('To disable email confirmation:\n\n1. Go to your Supabase dashboard\n2. Go to Authentication > Settings\n3. Turn OFF "Enable email confirmations"\n4. Save changes\n\nThen you can sign up without email confirmation!');
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'not-configured':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection...';
      case 'connected':
        return 'Connected to Supabase';
      case 'not-configured':
        return 'Supabase not configured';
      case 'error':
        return 'Connection error';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Database className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Supabase Debug</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>
        
        {errorDetails && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {errorDetails}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <RefreshCw className="h-4 w-4" />
            Recheck
          </button>
          
          {connectionStatus === 'error' && errorDetails.includes('table') && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              <p className="font-medium mb-1">Database Setup Required:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your Supabase dashboard</li>
                <li>Open the SQL Editor</li>
                <li>Copy and run the setup script from: <code>supabase-setup.sql</code></li>
                <li>Click "Recheck" below</li>
              </ol>
            </div>
          )}
          
          {connectionStatus === 'connected' && (
            <>
              <button
                onClick={createTestUser}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                <Settings className="h-4 w-4" />
                Create Test User
              </button>
              
              <button
                onClick={disableEmailConfirmation}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                <Settings className="h-4 w-4" />
                Disable Email Confirmation
              </button>
              
              <button
                onClick={resetUserData}
                disabled={isResetting}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                <AlertCircle className="h-4 w-4" />
                {isResetting ? 'Resetting...' : 'Reset All Data'}
              </button>
            </>
          )}
        </div>
        
        {connectionStatus === 'not-configured' && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <p className="font-medium mb-1">To configure Supabase:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a Supabase project</li>
              <li>Copy your project URL and anon key</li>
              <li>Create a .env file with:</li>
            </ol>
            <code className="block mt-2 text-xs bg-gray-100 p-1 rounded">
              VITE_SUPABASE_URL=your_url<br/>
              VITE_SUPABASE_ANON_KEY=your_key
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
