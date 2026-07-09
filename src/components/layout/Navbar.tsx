import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';
import Toast, { ToastProps } from '../ui/Toast';

export default function Navbar() {
  const { user, logout } = useAuth();
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
        { name: 'Community', path: '/community' },
        { name: 'Calculator', path: '/calculator' },
        { name: 'Dashboard', path: '/dashboard' },
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
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-dark-950/80 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'
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
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <span className="text-lg sm:text-xl font-display font-bold hidden sm:inline">
              Eco<span className="gradient-text">Track</span>
              <span className="text-dark-400 font-light ml-1">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-300 hover:text-primary-400 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: User Menu / Auth Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                <UserMenu />
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors duration-300"
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
              className="md:hidden border-t border-white/5 bg-white/5"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-dark-300 hover:text-primary-400 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {!user && (
                  <>
                    <div className="h-px bg-white/10 my-2" />
                    <Link
                      to="/login"
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-primary-400 hover:bg-white/5 transition-colors duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium text-center hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <div className="h-px bg-white/10 my-2" />
                    <motion.button
                      onClick={handleMobileLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-300 text-sm font-medium disabled:opacity-50"
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