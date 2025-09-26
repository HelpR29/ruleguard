import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const { signUp } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const navigate = useNavigate();

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (pwd.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) return 'strong';
    return 'medium';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error.message || 'Unable to sign up');
      return;
    }
    // Check if user is immediately signed in or needs email confirmation
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      addToast('success', 'Account created successfully! Welcome to LockIn.');
      navigate('/profile');
    } else {
      addToast('info', 'Account created! Please check your email to confirm your account.');
      navigate('/login', { state: { notice: 'Check your email to confirm your account, then log in.' } });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
            <Logo showText frame="card" />
          </Link>
          <h1 className="text-2xl font-bold mt-3">Create your LockIn account</h1>
          <p className="text-sm text-gray-600 mt-1">Start tracking discipline and invite friends.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2 rounded"/>
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={handlePasswordChange} 
                required 
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2 rounded"
                minLength={6}
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-400' : passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  </div>
                  <p className={`text-xs ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    Password strength: {passwordStrength}
                    {passwordStrength === 'weak' && ' (min 6 characters)'}
                    {passwordStrength === 'medium' && ' (add uppercase, lowercase & numbers for strong)'}
                    {passwordStrength === 'strong' && ' ✓'}
                  </p>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className={`w-full py-2 rounded text-white ${loading? 'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}>
              {loading? 'Creating account...':'Sign up'}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-3">Already have an account? <Link to="/login" className="text-blue-600">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
