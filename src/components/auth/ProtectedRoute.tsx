import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';
import { UserRole } from '../../types/rbac';
import { Leaf, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  requireOwner?: boolean;
  requiredRole?: UserRole;
}

/**
 * RBAC-aware route guard.
 * - Unauthenticated users → redirect to /login
 * - requireAdmin/Moderator/Owner=true + insufficient role → show 403 page
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireModerator = false,
  requireOwner = false,
  requiredRole
}) => {
  const { user, loading: authLoading } = useAuth();
  const { role, isAdmin, isModerator, isOwner, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative">
        <div className="absolute inset-0 mesh-bg opacity-40" />
        <div className="relative text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)]/15 border-t-[var(--primary)] animate-spin" />
            <Leaf className="w-5 h-5 text-[var(--primary)] absolute animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase animate-pulse">
            Verifying Authentication & Access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let hasAccess = true;

  if (requireOwner && !isOwner) hasAccess = false;
  if (requireAdmin && !isAdmin) hasAccess = false;
  if (requireModerator && !isModerator) hasAccess = false;
  if (requiredRole && role !== requiredRole && !isOwner) hasAccess = false;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center space-y-4 p-8 max-w-md surface-elevated rounded-[var(--radius-xl)]">
          <div className="p-4 rounded-2xl inline-flex" style={{ background: 'rgba(200, 90, 50, 0.08)' }}>
            <ShieldX className="w-12 h-12" style={{ color: 'var(--danger)' }} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Access Denied</h2>
          <p className="text-[var(--text-secondary)] text-sm">
            You do not have permission to access this area.
            Contact the system owner if you believe this is an error.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-medium transition-all btn-ghost"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
