import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Leaf,
  Brain,
  BarChart3,
  Globe2,
  Zap,
  Shield,
  Users,
  TrendingDown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  TreePine,
  Wind,
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze your lifestyle data to provide accurate carbon footprint calculations.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    description: 'Interactive visualizations that track your progress over time with beautiful charts and insights.',
    color: 'from-primary-500 to-accent-500',
  },
  {
    icon: Globe2,
    title: 'Global Impact Tracking',
    description: 'See how your individual actions contribute to global sustainability goals and climate targets.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Smart Recommendations',
    description: 'Get personalized, actionable suggestions to reduce your carbon footprint based on your habits.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Privacy-First Design',
    description: 'Your data is encrypted and secure. We never sell your personal information to third parties.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Community Challenges',
    description: 'Join challenges with friends and compete on leaderboards to make sustainability fun.',
    color: 'from-teal-500 to-emerald-500',
  },
];

const stats = [
  { icon: Users,       value: '250+',     label: 'Registered Users' },
  { icon: TrendingDown, value: '1,420 kg', label: 'CO₂ Tracked' },
  { icon: TreePine,    value: '85',       label: 'Reports Generated' },
  { icon: Globe2,      value: '3',        label: 'Team Members' },
];

const steps = [
  {
    step: '01',
    title: 'Calculate',
    description: 'Input your daily activities — commute, meals, energy usage — and our AI calculates your footprint.',
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'View detailed breakdowns and trends in your personalized dashboard with actionable insights.',
  },
  {
    step: '03',
    title: 'Reduce',
    description: 'Follow AI-powered recommendations tailored to your lifestyle for maximum impact.',
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex items-center pt-20" id="hero-section">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] hero-glow opacity-50" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">AI-Powered Sustainability Platform</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6"
            >
              Track Your
              <br />
              <span className="gradient-text">Carbon Footprint</span>
              <br />
              With AI Precision
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Harness the power of artificial intelligence to measure, understand,
              and reduce your environmental impact. Join thousands making the planet greener.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="btn-primary text-base w-full sm:w-auto" id="hero-cta-primary">
                Start Tracking Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/calculator" className="btn-secondary text-base w-full sm:w-auto" id="hero-cta-secondary">
                <Leaf className="w-5 h-5 text-primary-400" />
                Try Calculator
              </Link>
            </motion.div>

            {/* Trust Signal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-12 flex items-center justify-center gap-6 text-sm text-dark-500"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-500" /> Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-500" /> No credit card
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <CheckCircle2 className="w-4 h-4 text-primary-500" /> Cancel anytime
              </span>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 sm:mt-20 relative max-w-5xl mx-auto"
          >
            <div className="glass-strong p-4 sm:p-6 rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="bg-dark-900/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 min-h-[300px] sm:min-h-[400px] flex items-center justify-center relative">
                {/* Mock Dashboard UI */}
                <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="glass p-4 text-center">
                    <Wind className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold font-display">2.4</p>
                    <p className="text-xs text-dark-400">Tons CO₂/yr</p>
                  </div>
                  <div className="glass p-4 text-center">
                    <TrendingDown className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold font-display text-green-400">-18%</p>
                    <p className="text-xs text-dark-400">vs. Last Month</p>
                  </div>
                  <div className="glass p-4 text-center">
                    <TreePine className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold font-display">127</p>
                    <p className="text-xs text-dark-400">Trees Saved</p>
                  </div>
                  <div className="glass p-4 text-center">
                    <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-xl sm:text-2xl font-bold font-display">A+</p>
                    <p className="text-xs text-dark-400">Eco Score</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="absolute bottom-4 left-4 right-4 h-24 sm:h-32 hidden sm:flex items-end gap-1 opacity-30">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effects */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary-500/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="section-padding relative" id="stats-section">
        <div className="container-max mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="section-padding relative" id="features-section">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="container-max mx-auto relative">
          <SectionHeading
            badge="Features"
            title="Everything you need for"
            highlight="sustainable living"
            description="Powerful tools designed to make carbon tracking effortless and impactful."
          />

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconColor={feature.color}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section-padding relative" id="how-it-works-section">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="How It Works"
            title="Three steps to a"
            highlight="greener you"
            description="Getting started takes less than a minute. No complicated setup required."
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center group"
              >
                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-500/30 to-transparent" />
                )}

                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20 mb-6 group-hover:border-primary-500/40 transition-colors duration-300">
                  <span className="text-2xl font-display font-bold gradient-text">{step.step}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section-padding relative" id="cta-section">
        <div className="container-max mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-strong p-10 sm:p-16 text-center overflow-hidden rounded-3xl"
          >
            {/* Background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4">
                Ready to make a <span className="gradient-text">difference</span>?
              </h2>
              <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of eco-conscious individuals using AI to build a sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base w-full sm:w-auto" id="cta-register">
                  Get Started — It's Free
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="btn-secondary text-base w-full sm:w-auto" id="cta-learn-more">
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
