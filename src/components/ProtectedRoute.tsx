import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A wrapper for routes that require authentication.
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loader while session is being checked
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, but save the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
