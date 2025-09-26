import { useAuth } from '../context/AuthContext';

export default function AuthDebug() {
  const { user, profile, loading } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-300 rounded p-2 text-xs z-50 max-w-xs">
      <div className="font-bold">Auth Debug:</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? `${user.email}` : 'None'}</div>
      <div>Profile: {profile?.display_name || 'No display name'}</div>
      <div>User ID: {user?.id?.slice(0, 8) || 'None'}</div>
    </div>
  );
}
