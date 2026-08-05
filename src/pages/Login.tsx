import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Toast, { ToastProps } from '../components/ui/Toast';
import { APP_NAME } from '../constants/app';

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
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      showToast('error', getLoginErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 mesh-bg" aria-hidden="true" />
      <div className="absolute inset-0 grid-bg opacity-[0.12]" aria-hidden="true" />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="p-8 sm:p-10 surface-elevated"
          style={{
            borderRadius: 'var(--radius-2xl)',
          }}
        >
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #2dd4bf 100%)',
                boxShadow: '0 2px 12px rgba(52,211,153,0.25)',
              }}
              aria-hidden="true"
            >
              {/* Leaf icon placeholder — will be replaced in Epic 8 with SVG logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#022c17' }}>
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Eco<span className="gradient-text">Track</span>
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1
              className="text-xl font-semibold mb-1.5"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Sign in to {APP_NAME} to continue tracking your impact.
            </p>
          </div>

          {/* Toast */}
          <AnimatePresence mode="wait">
            {toast && <Toast type={toast.type} message={toast.message} />}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form" noValidate>
            <Input
              id="login-email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            {/* Password field — flex layout eliminates top-[38px] hack */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div
                className="flex items-center gap-0"
                style={{
                  background: 'var(--bg-input, var(--bg-card))',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'border-color 180ms ease, box-shadow 180ms ease',
                }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(52,211,153,0.12)';
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }
                }}
              >
                <span className="pl-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                  <Lock className="w-[18px] h-[18px]" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="px-3 flex-shrink-0 flex items-center justify-center h-full transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password row */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                  aria-label="Remember me"
                />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Remember me
                </span>
              </label>
              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
                title="Password reset is available via Firebase console"
              >
                Forgot password?
              </span>
            </div>

            <div className="pt-1">
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
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-primary)' }}
              id="login-register-link"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Subtle bottom glow */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.12), transparent)' }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}