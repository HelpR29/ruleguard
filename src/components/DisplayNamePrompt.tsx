import { useEffect, useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function DisplayNamePrompt() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const onboardingComplete = useMemo(() => {
    try { return !!localStorage.getItem('onboarding_complete'); } catch { return false; }
  }, []);

  // Prefill with existing profile name or email prefix
  useEffect(() => {
    if (!displayName && user) {
      const fromProfile = profile?.display_name?.trim();
      if (fromProfile) {
        setDisplayName(fromProfile);
      } else {
        const email = (user as any)?.email || '';
        if (email && email.includes('@')) {
          const prefix = email.split('@')[0];
          const suggestion = prefix.charAt(0).toUpperCase() + prefix.slice(1).slice(0, 24);
          setDisplayName(suggestion);
        }
      }
    }
  }, [user, profile, displayName]);

  // Do not render while auth is loading to avoid flicker
  if (loading) return null;

  // Show when:
  // - user is present
  // - not skipped
  // - onboarding not yet complete
  // - no display_name exists yet in DB profile
  if (!user || isSkipped || onboardingComplete || !!profile?.display_name) {
    return null;
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Try to save to database, but don't fail if it doesn't work
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            user_id: user.id,
            display_name: displayName.trim()
          });

        if (!error) {
          await refreshProfile();
        }
      } catch (dbError) {
        console.log('Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as fallback
      localStorage.setItem('display_name', displayName.trim());
      // Trigger a profile refresh so UI picks up the fallback immediately
      try { await refreshProfile(); } catch {}
      
      // Close the modal regardless of database success
      setIsSkipped(true);
      
    } catch (err) {
      // Even if everything fails, just close the modal
      console.error('Error saving display name:', err);
      setIsSkipped(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => { /* consume backdrop clicks so modal doesn't close */ e.stopPropagation(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsSkipped(true)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
          title="Skip for now"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-bold mb-4">Welcome to LockIn!</h2>
        <p className="text-gray-600 mb-4">
          Please choose a display name to get started.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
