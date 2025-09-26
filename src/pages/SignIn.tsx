import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import SupabaseDebug from '../components/SupabaseDebug';
import QuickAuthFix from '../components/QuickAuthFix';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function SignIn() {
  const { signIn } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from || '/';
  const notice = location.state?.notice;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      console.error('Sign in error:', error);
      // More detailed error messages
      let errorMessage = 'Unable to sign in';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or create an account.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else {
        errorMessage = error.message || 'Unable to sign in';
      }
      setError(errorMessage);
      return;
    }
    // Only skip onboarding if user has proper settings (indicating they completed it before)
    try {
      const existingSettings = localStorage.getItem('user_settings');
      if (existingSettings) {
        localStorage.setItem('onboarding_complete','1');
      }
    } catch {}
    addToast('success', 'Welcome back! Successfully signed in.');
    navigate(redirectTo === '/' ? '/profile' : redirectTo, { replace: true });
  };

  const resendConfirmation = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }
    
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });
      
      if (error) {
        setError('Failed to resend confirmation: ' + error.message);
      } else {
        addToast('success', 'Confirmation email sent! Check your inbox.');
        setError(null);
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
            <Logo showText frame="card" />
          </Link>
          <h1 className="text-2xl font-bold mt-3">Welcome back</h1>
          <p className="text-sm text-gray-600 mt-1">Log in to continue your progress.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Supabase Configuration Status */}
          {!isSupabaseConfigured() && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">⚠️ Supabase Not Configured</p>
              <p className="text-xs text-yellow-700 mt-1">
                Authentication is disabled. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
              </p>
            </div>
          )}
          
          {notice && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{notice}</p>
              <div className="mt-3 space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email to resend confirmation"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded text-sm"
                />
                <button
                  onClick={resendConfirmation}
                  disabled={resendingEmail}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {resendingEmail ? 'Sending...' : '📧 Resend Confirmation Email'}
                </button>
              </div>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-sm mb-1">Email</label>
              <input 
                id="signin-email"
                type="email" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                required 
                autoComplete="email"
                aria-describedby={error ? "signin-error" : undefined}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-sm mb-1">Password</label>
              <input 
                id="signin-password"
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
                aria-describedby={error ? "signin-error" : undefined}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2 rounded"
              />
            </div>
            {error && <p id="signin-error" className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className={`w-full py-2 rounded text-white flex items-center justify-center gap-2 ${loading? 'bg-blue-300 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700'}`}>
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading? 'Signing in...':'Sign in'}
            </button>
          </form>
          
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">No account? <Link to="/signup" className="text-blue-600">Create one</Link></p>
            
            {/* Email confirmation help */}
            <div className="border-t pt-3">
              <p className="text-sm text-gray-700 mb-2">Need to confirm your email?</p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={resendConfirmation}
                  disabled={resendingEmail || !email.trim()}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-300"
                >
                  {resendingEmail ? 'Sending...' : '📧 Resend Confirmation Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug component - remove in production */}
      <SupabaseDebug />
      
      {/* Quick Auth Fix - remove in production */}
      <QuickAuthFix />
    </div>
  );
}
