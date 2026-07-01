import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, Chrome, AlertCircle, CheckCircle2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('ecotrack_remember_email', email);
      } else {
        localStorage.removeItem('ecotrack_remember_email');
      }

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = LOGIN_ERROR_MESSAGES[errorCode] || err?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email if it exists
  useEffect(() => {
    const remembered = localStorage.getItem('ecotrack_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-strong p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold">
              Eco<span className="gradient-text">Track</span>
              <span className="text-dark-400 font-light ml-1">AI</span>
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-dark-400">
              Sign in to continue tracking your impact
            </p>
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-6"
            id="login-google-btn"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-dark-900/50 text-dark-400 backdrop-blur-sm">
                or continue with email
              </span>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-400">Login successful! Redirecting...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-[38px] text-dark-400 hover:text-white disabled:opacity-50 transition-colors"
                id="login-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="login-remember"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="text-xs text-dark-400">Remember me</span>
              </label>
              <Link
                to="#"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors disabled-opacity-50"
                id="login-forgot-link"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              id="login-submit-btn"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-dark-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              id="login-register-link"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/10 blur-3xl rounded-full" />
      </motion.div>
    </div>
  );
}
