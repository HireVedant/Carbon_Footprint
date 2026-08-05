 import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, LogOut, Calculator } from 'lucide-react';
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
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)',
        WebkitBackdropFilter: 'blur(16px)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: scrolled ? '0 4px 24px rgba(18, 28, 22, 0.06)' : 'none',
      }}
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
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </motion.div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Eco<span style={{ color: 'var(--color-primary)' }}>Track</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200"
                style={{
                  color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isActive(link.path) ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px"
                    style={{ background: 'var(--color-primary)' }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            {!user && (
              <Link
                to="/assessment"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                style={{ background: 'rgba(47, 107, 79, 0.08)', border: '1px solid rgba(47, 107, 79, 0.18)', color: 'var(--color-primary)' }}
              >
                <Calculator className="w-3.5 h-3.5" /> Quick Calc
              </Link>
            )}

            {loading ? (
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl transition-colors duration-300"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
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
              className="md:hidden rounded-b-2xl"
              style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(7,17,14,0.95)', WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)' }}
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                    style={{
                      color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      background: isActive(link.path) ? 'rgba(52,211,153,0.1)' : 'transparent',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}

                {!user && (
                  <>
                    <div className="h-px my-3" style={{ background: 'var(--border-subtle)' }} />
                    <Link
                      to="/login"
                      className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Sign In
                    </Link>
                    <Link to="/register" className="block text-center btn-primary py-2.5 text-sm">
                      Get Started Free
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <div className="h-px my-3" style={{ background: 'var(--border-subtle)' }} />
                    <motion.button
                      onClick={handleMobileLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors duration-300 text-sm font-medium disabled:opacity-50"
                      style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
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