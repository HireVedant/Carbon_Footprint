import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center relative">
        <div className="absolute inset-0 mesh-bg opacity-40" />
        <div className="relative text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
            <Leaf className="w-5 h-5 text-primary-400 absolute animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-dark-400 tracking-wider uppercase animate-pulse">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page, preserving the attempted location path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
