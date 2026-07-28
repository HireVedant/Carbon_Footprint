import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Toast, { ToastProps } from '../components/ui/Toast';

function getLoginErrorMessage(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    default:
      return 'Sign in failed. Please check your credentials and try again.';
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    if (type === 'success') {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('error', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setToast(null);
    try {
      await login(email, password);
      showToast('success', 'Signed in successfully! Redirecting…');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      const code = err?.code || '';
      showToast('error', getLoginErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" aria-hidden="true" />
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden="true" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.08), transparent)' }} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="p-8 sm:p-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)' }}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #2dd4bf)', boxShadow: '0 2px 12px rgba(52,211,153,0.25)' }}>
              <Leaf className="w-4.5 h-4.5" style={{ color: 'var(--bg-primary)' }} />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Eco<span className="gradient-text">Track</span>
              <span className="font-light ml-1" style={{ color: 'var(--text-tertiary)' }}>AI</span>
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Sign in to continue tracking your carbon footprint.
            </p>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && <Toast type={toast.type} message={toast.message} />}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] transition-colors duration-200"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-primary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Remember me</span>
              </label>
              <span className="text-xs cursor-default" style={{ color: 'var(--text-muted)' }} title="Password reset is available via Firebase console">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
              id="login-submit-btn"
            >
              {!isLoading && (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary)' }} id="login-register-link">
              Create one free
            </Link>
          </p>
        </div>

        {/* Subtle bottom glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full blur-2xl opacity-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.15), transparent)' }} aria-hidden="true" />
      </motion.div>
    </div>
  );
}