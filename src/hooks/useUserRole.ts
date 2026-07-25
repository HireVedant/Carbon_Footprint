import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/rbac';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UseUserRoleReturn {
  role: UserRole;
  isAdmin: boolean;
  isModerator: boolean;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  refreshRole: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Try Custom Claims first
      const token = await user.getIdTokenResult(forceRefresh);
      if (token.claims.role) {
        setRole(token.claims.role as UserRole);
        setError(null);
        setLoading(false);
        return;
      }

      // 2. Fallback to Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const firestoreRole = (userSnap.data().role as UserRole) || 'user';
        setRole(firestoreRole);
      } else {
        setRole('user');
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user role:', err);
      setError(err.message || 'Failed to fetch role');
      setRole('user'); // Safe fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchRole();
    }
  }, [authLoading, fetchRole]);

  return {
    role,
    isAdmin: role === 'admin' || role === 'owner',
    isModerator: role === 'moderator' || role === 'admin' || role === 'owner',
    isOwner: role === 'owner',
    loading: authLoading || loading,
    error,
    refreshRole: () => fetchRole(true),
  };
}
