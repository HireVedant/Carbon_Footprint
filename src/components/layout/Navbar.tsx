import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, LogOut, Sparkles, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import Toast, { ToastProps } from '../ui/Toast';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Define nav links dynamically based on login state
  const navLinks = user
    ? [
        { name: 'Home', path: '/' },
        { name: 'Assessment', path: '/assessment' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Community', path: '/community' },
        { name: 'History', path: '/history' },
        { name: 'About', path: '/about' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Community', path: '/community' },
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
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to log out. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/85 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg shadow-emerald-950/50'
          : 'bg-dark-950/40 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <AnimatePresence>
        {toast && (
          <div className="absolute top-20 right-4 z-50">
            <Toast type={toast.type} message={toast.message} />
          </div>
        )}
      </AnimatePresence>
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/60 group-hover:scale-105 transition-all duration-300"
              whileHover={{ rotate: 12 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-leaf-sway" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                Eco<span className="gradient-text">Track</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase flex items-center gap-1 -mt-1">
                <Sparkles className="w-2.5 h-2.5" /> Sustainable AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/30 p-1.5 rounded-full border border-emerald-500/15">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/25'
                    : 'text-dark-300 hover:text-emerald-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: User Menu / Auth Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!user && (
              <Link
                to="/assessment"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all duration-300"
              >
                <Calculator className="w-3.5 h-3.5" /> Quick Calc
              </Link>
            )}

            {loading ? (
              <div className="w-10 h-10 rounded-full border border-emerald-500/20 bg-emerald-950/40 animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="btn-primary py-2 px-5 text-sm"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-900/50 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-emerald-500/20 bg-dark-950/95 backdrop-blur-2xl rounded-b-2xl"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'text-dark-300 hover:text-emerald-300 hover:bg-emerald-900/20'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {!user && (
                  <>
                    <div className="h-px bg-emerald-500/20 my-3" />
                    <Link
                      to="/login"
                      className="block px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-300 hover:bg-emerald-900/20 transition-colors duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center btn-primary py-2.5 text-sm"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <div className="h-px bg-emerald-500/20 my-3" />
                    <motion.button
                      onClick={handleMobileLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 transition-colors duration-300 text-sm font-medium disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}