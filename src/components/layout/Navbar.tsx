import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, ChevronRight } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Calculator', path: '/calculator' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'About', path: '/about' },
];

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define nav links dynamically based on login state
  const navLinks = user
    ? [
        { name: 'Home', path: '/' },
        { name: 'Calculator', path: '/calculator' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'History', path: '/history' },
        { name: 'About', path: '/about' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleMobileLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-950/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="navbar-logo">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
            </div>
            <span className="text-xl font-display font-bold">
              Eco<span className="gradient-text">Track</span>
              <span className="text-dark-400 font-light ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-link-${link.name.toLowerCase()}`}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary-400'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary-500/10 rounded-lg border border-primary-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="nav-register-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 active:scale-[0.98]"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-menu-btn"
            className="lg:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-dark-950/95 backdrop-blur-2xl border-b border-white/5"
          >
            <div className="px-4 pb-6 pt-2 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    id={`mobile-nav-${link.name.toLowerCase()}`}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  <Link
                    to="/profile"
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      location.pathname === '/profile'
                        ? 'text-primary-400 bg-primary-500/10'
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    My Profile
                  </Link>
                </motion.div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <button
                    onClick={handleMobileLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-base font-semibold transition-all hover:bg-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost text-center w-full py-3 rounded-xl">
                      Sign In
                    </Link>
                    <Link to="/register" className="btn-primary text-center w-full py-3 rounded-xl">
                      Get Started
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
