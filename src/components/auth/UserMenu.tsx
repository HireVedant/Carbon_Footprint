import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, BarChart3, Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserMenu: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userProfile) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none group p-1 rounded-full border border-white/5 bg-white/5 hover:border-white/10 transition-all duration-300"
      >
        <img
          src={userProfile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
          alt={userProfile.name}
          className="w-8 h-8 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-900 border border-white/10 p-2 shadow-2xl text-left backdrop-blur-xl"
          >
            {/* Header info */}
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <p className="text-xs font-semibold text-white truncate">{userProfile.name}</p>
              <p className="text-[10px] text-dark-400 truncate">{userProfile.email}</p>
              <span className="inline-block mt-1 text-[8px] font-extrabold uppercase bg-primary-500/10 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded">
                {userProfile.userType}
              </span>
            </div>

            {/* Links list */}
            <div className="space-y-0.5">
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <BarChart3 className="w-4 h-4 text-dark-400" />
                Console Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Calendar className="w-4 h-4 text-dark-400" />
                Calculation Logs
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-dark-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <UserIcon className="w-4 h-4 text-dark-400" />
                My Profile
              </Link>
            </div>

            {/* Logout section */}
            <div className="border-t border-white/5 mt-2 pt-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
