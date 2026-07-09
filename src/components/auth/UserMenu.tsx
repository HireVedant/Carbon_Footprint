import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast, { ToastProps } from '../ui/Toast';
import type { UserProfile } from '../../firebase/firestore';

export const UserMenu: React.FC = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const displayProfile = useMemo<UserProfile | null>(() => {
    if (userProfile) return userProfile;
    if (!user) return null;
    return {
      uid: user.uid,
      name: user.displayName || 'Eco User',
      email: user.email || '',
      photo: user.photoURL || '',
      userType: 'Individual',
      createdAt: null,
    };
  }, [user, userProfile]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      setToast({ type: 'error', message: 'Logout failed. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div
        className="w-10 h-10 rounded-full border border-white/10 bg-white/5 animate-pulse"
        aria-label="Loading profile"
      />
    );
  }

  if (!displayProfile) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <AnimatePresence>
        {toast && (
          <div className="absolute top-12 right-0 w-64 z-[60]">
            <Toast type={toast.type} message={toast.message} />
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 focus:outline-none group p-1 rounded-full border border-white/5 bg-white/5 hover:border-white/10 transition-all duration-300 w-10 h-10"
        aria-label="Open profile menu"
      >
        {displayProfile.photo ? (
          <img
            src={displayProfile.photo}
            alt={displayProfile.name}
            className="w-full h-full rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm border border-white/10 group-hover:scale-105 transition-transform">
            {displayProfile.name
              ? displayProfile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-900 border border-white/10 p-2 shadow-2xl text-left backdrop-blur-xl"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <p className="text-xs font-semibold text-white truncate">{displayProfile.name}</p>
              <p className="text-[10px] text-dark-400 truncate">{displayProfile.email}</p>
              <span className="inline-block mt-1 text-[8px] font-extrabold uppercase bg-primary-500/10 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded">
                {displayProfile.userType}
              </span>
            </div>

            <div className="space-y-0.5">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <BarChart3 className="w-4 h-4 text-dark-400" />
                Console Dashboard
              </Link>
            </div>

            <div className="border-t border-white/5 mt-2 pt-1.5">
              <button
                onClick={() => {
                  if (isLoggingOut) return;
                  setIsOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
