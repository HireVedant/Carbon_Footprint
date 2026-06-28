import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, Chrome, User, CheckCircle2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — no backend
  };

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (password.length < 10) return { level: 2, text: 'Fair', color: 'bg-amber-500' };
    return { level: 3, text: 'Strong', color: 'bg-green-500' };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
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
              Create your account
            </h1>
            <p className="text-sm text-dark-400">
              Start your sustainability journey today
            </p>
          </div>

          {/* Social */}
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-6"
            id="register-google-btn"
          >
            <Chrome className="w-5 h-5" />
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-dark-900/50 text-dark-400 backdrop-blur-sm">
                or register with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="register-name"
              type="text"
              label="Full name"
              placeholder="John Doe"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              id="register-email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-dark-400 hover:text-white transition-colors"
                id="register-toggle-password"
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
                        passwordStrength.level >= level ? passwordStrength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-dark-400">
                  Password strength: <span className="font-medium text-white">{passwordStrength.text}</span>
                </p>
              </motion.div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="register-terms"
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0"
              />
              <span className="text-xs text-dark-400 leading-relaxed">
                I agree to the{' '}
                <Link to="#" className="text-primary-400 hover:text-primary-300">Terms of Service</Link>
                {' '}and{' '}
                <Link to="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link>
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              id="register-submit-btn"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 space-y-2">
            {['AI-powered carbon tracking', 'Personalized insights', 'Community challenges'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-xs text-dark-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-dark-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              id="register-login-link"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/10 blur-3xl rounded-full" />
      </motion.div>
    </div>
  );
}
