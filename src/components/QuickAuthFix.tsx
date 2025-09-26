import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function QuickAuthFix() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resendEmail = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });
      
      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('✅ Confirmation email sent!');
      }
    } catch (err) {
      setMessage('❌ Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      
      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('✅ Password reset email sent!');
      }
    } catch (err) {
      setMessage('❌ Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-blue-900 mb-3">🚀 Quick Auth Fix</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Your Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <button
            onClick={resendEmail}
            disabled={loading}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Sending...' : '📧 Resend Confirmation'}
          </button>
          
          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Sending...' : '🔑 Reset Password'}
          </button>
        </div>
        
        {message && (
          <div className="text-xs p-2 bg-gray-50 rounded border">
            {message}
          </div>
        )}
        
        <div className="text-xs text-gray-600 border-t pt-2">
          <p><strong>Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your email above</li>
            <li>Click "Resend Confirmation"</li>
            <li>Check email (including spam)</li>
            <li>Click confirmation link</li>
            <li>Return and log in</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
