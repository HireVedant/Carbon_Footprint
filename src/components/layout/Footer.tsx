import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Linkedin, Mail, Heart, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { subscribeToNewsletter } from '../../services/newsletterService';
import { useAuth } from '../../context/AuthContext';
import Toast, { ToastProps } from '../ui/Toast';
import { AnimatePresence } from 'framer-motion';

const footerLinks = {
  Product: [
    { name: 'Assessment', path: '/assessment' },
    { name: 'Dashboard', path: '/dashboard' },
  ],
  Company: [
    { name: 'About', path: '/about' },
    { name: 'Community', path: '/community' },
  ],
  Legal: [
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ],
};

const socialLinks = [
  { icon: Github,   href: '#', label: 'GitHub' },
  { icon: Twitter,  href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail,     href: '#', label: 'Email' },
];

export default function Footer() {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user]);

  const handleSubscribe = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFeedbackMsg(null);

    const emailToUse = user?.email || emailInput;
    const result = await subscribeToNewsletter(
      emailToUse,
      user?.uid,
      user?.displayName || 'User',
      user?.emailVerified ?? true
    );

    setFeedbackMsg({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setIsSubscribed(true);
      if (!user) setEmailInput('');
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubscribe();
  };

  return (
    <footer className="relative border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-void)' }} id="footer" role="contentinfo">
      <div className="layout-editorial section-editorial">
        {/* Newsletter — editorial layout */}
        <div className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="t-label-sm block mb-4" style={{ color: 'var(--color-primary)' }}>Newsletter</span>
              <h3 className="t-display-md mb-4">
                Stay informed on{' '}
                <span className="gradient-text">climate action</span>
              </h3>
              <p className="t-body max-w-md">
                Weekly AI-powered insights on reducing your carbon footprint. No spam, no fluff — just data-driven environmental intelligence.
              </p>
            </div>
            <div className="lg:pt-8">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  id="footer-email-input"
                  className="input-field flex-1 disabled:opacity-50"
                  value={user?.email || emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !!user || isSubscribed}
                  readOnly={!!user}
                  aria-label="Newsletter email"
                />
                <button
                  className="btn-primary whitespace-nowrap disabled:opacity-50"
                  id="footer-subscribe-btn"
                  onClick={handleSubscribe}
                  disabled={isLoading || isSubscribed}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSubscribed ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Subscribed
                    </span>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              <AnimatePresence>
                {feedbackMsg && (
                  <div className="mt-3">
                    <Toast type={feedbackMsg.type} message={feedbackMsg.text} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="divider-subtle mb-16" />

        {/* Links — minimal grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                <Leaf className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>EcoTrack</span>
            </Link>
            <p className="t-body-sm leading-relaxed mb-3">
              Environmental intelligence for individuals and organizations.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium" style={{ background: 'rgba(52,211,153,0.06)', color: 'var(--color-primary)', border: '1px solid rgba(52,211,153,0.1)' }}>
              <ShieldCheck className="w-3 h-3" /> Carbon Neutral
            </span>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="t-label-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-[13px] transition-colors duration-200 flex items-center gap-1 group"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — minimal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} EcoTrack AI. Built with <Heart className="w-3 h-3 inline" style={{ color: 'var(--color-primary)' }} /> for the planet.
          </span>

          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                id={`footer-social-${social.label.toLowerCase()}`}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
