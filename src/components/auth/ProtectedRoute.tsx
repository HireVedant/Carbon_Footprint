import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasAdminAccess, UserRole } from '../../types/rbac';
import { Leaf, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * RBAC-aware route guard.
 * - Unauthenticated users → redirect to /login
 * - requireAdmin=true + insufficient role → show 403 page (never redirect to admin from public)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin route guard — check role from user profile
  if (requireAdmin) {
    const userRole = (user as any).role as UserRole | undefined;
    if (!hasAdminAccess(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="p-4 bg-red-500/10 rounded-2xl inline-flex">
              <ShieldX className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Access Denied</h2>
            <p className="text-gray-400 text-sm">
              You do not have permission to access the Admin Operations Center.
              Contact the system owner if you believe this is an error.
            </p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all"
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
