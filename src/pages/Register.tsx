import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

function getSignupErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Account creation failed. Please try again.';
  }
}

import Toast, { ToastProps } from '../components/ui/Toast';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
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

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { level: 2, text: 'Fair', color: 'bg-amber-500' };
    return { level: 3, text: 'Strong', color: 'bg-green-500' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('error', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      showToast('error', 'Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      await signUp(email, password, name.trim());
      showToast('success', 'Account created! Redirecting to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      const code = err?.code || '';
      showToast('error', getSignupErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(52,211,153,0.04)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(45,212,191,0.04)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="p-8 sm:p-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-3xl)' }}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #2dd4bf)', boxShadow: '0 2px 12px rgba(52,211,153,0.25)' }}>
              <Leaf className="w-5 h-5" style={{ color: 'var(--bg-primary)' }} />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Eco<span className="gradient-text">Track</span>
              <span className="font-light ml-1" style={{ color: 'var(--text-tertiary)' }}>AI</span>
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Start your sustainability journey today
            </p>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && <Toast type={toast.type} message={toast.message} />}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <Input
              id="register-name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="register-email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
                id="register-toggle-password"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.level >= level ? passwordStrength.color : ''
                      }`}
                      style={passwordStrength.level < level ? { background: 'var(--border-subtle)' } : {}}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Password strength:{' '}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{passwordStrength.text}</span>
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isLoading}
              isLoading={isLoading}
              id="register-submit-btn"
            >
              {!isLoading && (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 space-y-2">
            {['AI-powered carbon tracking', 'Personalized insights', 'Gemini AI recommendations'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                {benefit}
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--color-primary)' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--color-primary-hover)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--color-primary)'; }}
              id="register-login-link"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl rounded-full" style={{ background: 'rgba(52,211,153,0.08)' }} />
      </motion.div>
    </div>
  );
}