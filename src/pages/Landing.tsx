import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Utensils, Home, Plane, ShoppingBag,
  BarChart3, Shield, TreePine,
  ChevronDown, ArrowRight, Play,
  Globe, TrendingDown, Award, Target, Sparkles,
  CheckCircle2, BookOpen, Database, Brain, Scale
} from 'lucide-react';
import { subscribeToCommunityStats } from '../services/communityAnalyticsService';
import type { CommunityStats } from '../types/community';

import { Hero } from './landing/components/Hero';
import { Simulator } from './landing/components/Simulator';
import { TOKENS, fadeInUp, staggerContainer, scaleIn } from '../utils/design';
import { cn } from '../utils/cn';
// ─── Animation Variants ────────────────────────────────────────────
// Note: Animation variants and design tokens are imported from src/utils/design.ts

// Animation variants moved to src/utils/design.ts

// ─── Types ─────────────────────────────────────────────────────────
interface SliderConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  color: string;
  weight: number;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface TechFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface MethodologyItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  color: string;
}

// ─── Section Heading ───────────────────────────────────────────────
const SectionHeading: React.FC<{
  badge: string;
  title: string;
  highlight: string;
  description: string;
}> = ({ badge, title, highlight, description }) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-60px" }}
    className="text-center max-w-3xl mx-auto mb-16"
  >
    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-5">
      <Sparkles className="w-3.5 h-3.5" />
      {badge}
    </motion.div>
    <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight mb-5" style={{ color: 'var(--text-primary)' }}>
      {title}{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
        {highlight}
      </span>
    </motion.h2>
    <motion.p variants={fadeInUp} className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
      {description}
    </motion.p>
  </motion.div>
);

// ─── Section Wrapper ───────────────────────────────────────────────
const Section: React.FC<{
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ id, className, style, children }) => (
  <section id={id} className={`relative py-20 md:py-28 overflow-hidden ${className || ''}`} style={style}>
    {children}
  </section>
);

// ─── Format number helper ──────────────────────────────────────────
function formatStat(val: number, decimals = 0): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  if (decimals > 0) return val.toFixed(decimals);
  return val.toLocaleString();
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN LANDING COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const Landing: React.FC = () => {
  const navigate = useNavigate();

  // ─── Live Emissions Calculator State ─────────────────────────────
  const [sliders, setSliders] = useState<SliderConfig[]>([
    { id: 'transport', label: 'Transport', icon: <Car className="w-5 h-5" />, value: 4, min: 0, max: 20, step: 0.5, unit: 'hrs/week', description: 'Driving or commuting time per week', color: 'from-blue-500 to-cyan-500', weight: 0.28 },
    { id: 'diet', label: 'Diet & Food', icon: <Utensils className="w-5 h-5" />, value: 3, min: 0, max: 10, step: 0.5, unit: 'kg CO₂e/day', description: 'Daily food carbon footprint', color: 'from-amber-500 to-orange-500', weight: 0.22 },
    { id: 'energy', label: 'Home Energy', icon: <Home className="w-5 h-5" />, value: 5, min: 0, max: 30, step: 0.5, unit: 'kWh/day', description: 'Electricity and heating usage', color: 'from-violet-500 to-purple-500', weight: 0.25 },
    { id: 'flights', label: 'Air Travel', icon: <Plane className="w-5 h-5" />, value: 1, min: 0, max: 20, step: 0.5, unit: 'flights/year', description: 'Number of flights annually', color: 'from-rose-500 to-pink-500', weight: 0.15 },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingBag className="w-5 h-5" />, value: 2, min: 0, max: 10, step: 0.5, unit: 'hrs/week', description: 'Time spent shopping per week', color: 'from-emerald-500 to-teal-500', weight: 0.10 },
  ]);

  const [carbonScore, setCarbonScore] = useState<number>(0);
  const [carbonRating, setCarbonRating] = useState<string>('');

  useEffect(() => {
    const total = sliders.reduce((acc, s) => acc + s.value * s.weight * 52, 0);
    setCarbonScore(Math.round(total));
    if (total < 4000) setCarbonRating('A+');
    else if (total < 8000) setCarbonRating('A');
    else if (total < 12000) setCarbonRating('B');
    else if (total < 16000) setCarbonRating('C');
    else if (total < 20000) setCarbonRating('D');
    else setCarbonRating('F');
  }, [sliders]);

  const handleSliderChange = (id: string, newValue: number) => {
    setSliders(prev => prev.map(s => s.id === id ? { ...s, value: newValue } : s));
  };

  // ─── Dashboard Preview State ─────────────────────────────────────
  const [activeDashTab, setActiveDashTab] = useState<'overview' | 'emissions' | 'goals'>('overview');

  // ─── FAQ State ───────────────────────────────────────────────────
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // ─── Real Community Stats from Firestore ─────────────────────────
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = subscribeToCommunityStats(setCommunityStats);
    return () => { unsubRef.current?.(); };
  }, []);

  // ─── FAQ Data ────────────────────────────────────────────────────
  const faqItems: FAQItem[] = [
    { question: 'How does EcoTrack calculate carbon emissions?', answer: 'EcoTrack uses industry-standard emission factors from the EPA, IPCC, and DEFRA databases. Our algorithms consider multiple variables including energy consumption, transportation habits, dietary choices, and lifestyle patterns to provide accurate annual CO₂ equivalent estimates.', category: 'General' },
    { question: 'Is my data secure and private?', answer: 'Absolutely. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Firebase Authentication with no third-party tracking. Your personal data is never sold or shared. You can export or delete your data at any time.', category: 'Privacy' },
    { question: 'How accurate are the emission estimates?', answer: 'Our calculations achieve 85-95% accuracy compared to detailed lifecycle assessments. While individual results may vary based on specific circumstances, our methodology follows GHG Protocol standards and is regularly validated against peer-reviewed research.', category: 'Accuracy' },
    { question: 'Can I track my progress over time?', answer: 'Yes! EcoTrack maintains a complete history of your assessments with interactive charts showing your progress. You can see trends, set reduction goals, and track milestones. Historical data is retained indefinitely.', category: 'Features' },
    { question: 'What makes EcoTrack different from other calculators?', answer: 'EcoTrack combines real-time simulation, gamification (badges, trees, ratings), community features, and a scientifically grounded interface. Unlike basic calculators, we provide actionable insights, scenario modeling, and a comprehensive carbon management platform.', category: 'General' },
  ];

  // ─── Tech Features Data ──────────────────────────────────────────
  const techFeatures: TechFeature[] = [
    { icon: <Globe className="w-6 h-6" />, title: 'GHG Protocol Aligned', description: 'Methodology follows the Greenhouse Gas Protocol Corporate Standard for Scope 1, 2, and 3 emissions accounting.', color: 'from-blue-500 to-cyan-500' },
    { icon: <Shield className="w-6 h-6" />, title: 'Privacy-First Architecture', description: 'End-to-end encryption, zero third-party tracking, and full user data control with GDPR compliance.', color: 'from-violet-500 to-purple-500' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Real-time Simulation', description: 'Interactive sliders instantly compute impact changes, helping users understand behavioral trade-offs.', color: 'from-emerald-500 to-teal-500' },
    { icon: <Target className="w-6 h-6" />, title: 'Actionable Insights', description: 'Evidence-based recommendations based on your profile to maximize carbon reduction with minimal lifestyle disruption.', color: 'from-amber-500 to-orange-500' },
  ];

  // ─── Methodology Data ────────────────────────────────────────────
  const methodologyItems: MethodologyItem[] = [
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Government-Backed Datasets',
      description: 'All emission factors sourced from peer-reviewed, government-maintained databases.',
      details: [
        'EPA Emission Factors Hub (2024)',
        'IPCC Fifth Assessment Report',
        'DEFRA/BEIS Conversion Factors (2024)',
        'IEA World Energy Outlook',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'GHG Protocol Standards',
      description: 'Calculations aligned with internationally recognized greenhouse gas accounting frameworks.',
      details: [
        'Scope 1: Direct emissions',
        'Scope 2: Indirect energy emissions',
        'Scope 3: Value chain emissions',
        'GHG Protocol Corporate Standard',
      ],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Transparent Methodology',
      description: 'Every calculation can be traced to its source data and emission factor.',
      details: [
        'Open-source algorithms',
        'Published emission factors',
        'Reproducible calculations',
        'Region-aware factors',
      ],
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Continuous Validation',
      description: 'Regular updates to reflect the latest climate science and emission factor revisions.',
      details: [
        'Annual factor updates',
        'Peer-reviewed sources',
        '85-95% accuracy range',
        'Lifecycle assessment alignment',
      ],
      color: 'from-amber-500 to-orange-500',
    },
  ];

  // ─── Real Stats from Firestore ───────────────────────────────────
  const stats = [
    { icon: <BarChart3 className="w-7 h-7" />, value: communityStats ? formatStat(communityStats.totalReports) : null, label: 'Assessments Completed', color: 'from-blue-500 to-cyan-500', loading: !communityStats },
    { icon: <TrendingDown className="w-7 h-7" />, value: communityStats ? `${communityStats.averageAnnualCO2.toFixed(1)}t` : null, label: 'Avg CO₂ Per User', color: 'from-emerald-500 to-teal-500', loading: !communityStats },
    { icon: <TreePine className="w-7 h-7" />, value: communityStats ? formatStat(Math.round(communityStats.totalCO2Tracked)) : null, label: 'kg CO₂ Tracked', color: 'from-green-500 to-emerald-500', loading: !communityStats },
    { icon: <Award className="w-7 h-7" />, value: communityStats ? communityStats.averageEcoScore.toFixed(0) : null, label: 'Avg Eco Score', color: 'from-violet-500 to-purple-500', loading: !communityStats },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: TOKENS.bg.void }}>
      {/* Ambient Background Glow — Assessment-style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* ═══ HERO SECTION ═══ */}
        <Hero 
          carbonScore={carbonScore}
          carbonRating={carbonRating}
          sliders={sliders}
          onNavigate={navigate}
          onScrollToSimulator={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* ═══ DASHBOARD PREVIEW SECTION ═══ */}
        <Section id="dashboard">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Dashboard Overview"
              title="Your Carbon Story,"
              highlight="Visualized"
              description="A beautiful, interactive dashboard that transforms complex emissions data into actionable insights. Track progress, set goals, and visualize your environmental impact."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={scaleIn}
              className="relative max-w-5xl mx-auto"
            >
              <div className="glass-eco rounded-3xl overflow-hidden">
                {/* Fake window bar */}
                <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: TOKENS.border.subtle, background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex gap-1 px-4 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${TOKENS.border.subtle}` }}>
                      <BarChart3 className="w-4 h-4" style={{ color: TOKENS.color.primary }} />
                      <span className="text-xs" style={{ color: TOKENS.text.tertiary }}>ecotrack.app/dashboard</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* Tabs — Assessment style */}
                  <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {(['overview', 'emissions', 'goals'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveDashTab(tab)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                        style={activeDashTab === tab ? {
                          background: 'linear-gradient(135deg, #166534, #22C55E)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                        } : {
                          color: TOKENS.text.secondary,
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Dashboard stat cards — Assessment glass-eco style */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="col-span-2 md:col-span-1 rounded-2xl p-5 border"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(13,202,140,0.05) 100%)',
                        borderColor: 'rgba(16,185,129,0.2)',
                      }}>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: TOKENS.text.tertiary }}>Carbon Score</p>
                      <p className="text-3xl font-bold" style={{ color: TOKENS.color.primary }}>B+</p>
                      <p className="text-xs mt-1" style={{ color: TOKENS.text.secondary }}>Community benchmark</p>
                    </div>

                    <div className="rounded-2xl p-5 glass-eco">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: TOKENS.text.tertiary }}>Monthly</p>
                      <p className="text-2xl font-bold" style={{ color: TOKENS.text.primary }}>1.2t</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-3 h-3" style={{ color: TOKENS.color.primary }} />
                        <span className="text-xs" style={{ color: TOKENS.color.primary }}>-8% from last month</span>
                      </div>
                    </div>

                    <div className="rounded-2xl p-5 glass-eco">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: TOKENS.text.tertiary }}>Trees</p>
                      <p className="text-2xl font-bold" style={{ color: '#4ade80' }}>24</p>
                      <p className="text-xs mt-1" style={{ color: TOKENS.text.secondary }}>Virtual forest</p>
                    </div>

                    <div className="rounded-2xl p-5 glass-eco">
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: TOKENS.text.tertiary }}>Badges</p>
                      <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>7</p>
                      <p className="text-xs mt-1" style={{ color: TOKENS.text.secondary }}>3 unlocked this month</p>
                    </div>
                  </div>

                  {/* Chart area */}
                  <div className="rounded-2xl p-6 glass-eco">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold" style={{ color: TOKENS.text.primary }}>Emissions Breakdown</h4>
                      <span className="text-xs" style={{ color: TOKENS.text.tertiary }}>Last 12 months</span>
                    </div>
                    <div className="flex items-end gap-2 h-32">
                      {[65, 45, 70, 55, 40, 60, 35, 50, 45, 30, 42, 28].map((height, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-md"
                          style={{ background: 'linear-gradient(to top, rgba(16,185,129,0.3), rgba(16,185,129,0.7))' }}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px]" style={{ color: TOKENS.text.muted }}>
                      <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-10 rounded-3xl blur-3xl -z-10"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(13,202,140,0.02) 100%)' }} />
            </motion.div>
          </div>
        </Section>

        {/* ═══ COMMUNITY STATISTICS — REAL FIRESTORE DATA ═══ */}
        <Section id="stats">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Community Impact"
              title="Real Data,"
              highlight="Real Impact"
              description="All statistics are computed in real-time from actual community activity. No fabricated numbers."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="relative group"
                >
                  <div className="glass-eco p-6 text-center hover:border-primary-200 transition-all duration-500 rounded-2xl relative overflow-hidden">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    {stat.loading ? (
                      <div className="space-y-2">
                        <div className="h-8 w-20 mx-auto rounded-lg animate-pulse" style={{ background: TOKENS.border.subtle }} />
                        <div className="h-4 w-24 mx-auto rounded animate-pulse" style={{ background: TOKENS.border.subtle }} />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: TOKENS.text.primary, fontFamily: 'var(--font-display)' }}>
                          {stat.value}
                        </div>
                        <div className="text-sm" style={{ color: TOKENS.text.secondary }}>{stat.label}</div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {!communityStats && (
              <p className="text-center text-sm mt-6" style={{ color: TOKENS.text.muted }}>
                Loading community statistics...
              </p>
            )}
          </div>
        </Section>

        {/* ═══ SIMULATOR SECTION ═══ */}
        <Section id="simulator" className="relative"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.02), transparent)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Live Simulator"
              title="Explore Your"
              highlight="Carbon Impact"
              description="Adjust lifestyle parameters in real-time and instantly see how each choice affects your annual carbon footprint. No sign-up required."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
            >
              <Simulator
                carbonScore={carbonScore}
                carbonRating={carbonRating}
                sliders={sliders}
                onSliderChange={handleSliderChange}
                onNavigate={navigate}
              />
            </motion.div>
          </div>
        </Section>

        {/* ═══ TECHNOLOGY SECTION ═══ */}
        <Section id="technology">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Technology"
              title="Built for"
              highlight="Accuracy"
              description="Our platform combines scientific rigor with modern web technology to deliver the most accurate carbon tracking experience available."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6"
            >
              {techFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="group glass-eco rounded-2xl p-7 hover:border-primary-200 transition-all duration-500"
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shrink-0 ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: TOKENS.text.primary }}>{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: TOKENS.text.secondary }}>{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ═══ SCIENTIFIC METHODOLOGY — REPLACES TESTIMONIALS ═══ */}
        <Section id="methodology" className="relative"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.02), transparent)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Scientific Rigor"
              title="How EcoTrack"
              highlight="Calculates"
              description="Our emission calculations are grounded in peer-reviewed science and government-maintained datasets. Here's what powers your results."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6"
            >
              {methodologyItems.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  className="group glass-eco rounded-2xl p-7 hover:border-primary-200 transition-all duration-500"
                >
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shrink-0 ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: TOKENS.text.primary }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: TOKENS.text.secondary }}>{item.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-[4.5rem]">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm" style={{ color: TOKENS.text.secondary }}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: TOKENS.color.primary }} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ═══ FAQ SECTION ═══ */}
        <Section id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="FAQ"
              title="Frequently Asked"
              highlight="Questions"
              description="Everything you need to know about EcoTrack's methodology, privacy practices, and capabilities."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="space-y-3"
            >
              {faqItems.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="glass-eco overflow-hidden hover:border-primary-200 transition-all duration-300 rounded-2xl"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <span className="text-sm font-bold" style={{ color: TOKENS.color.primary }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: TOKENS.text.primary }}>{item.question}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: openFAQ === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 shrink-0" style={{ color: TOKENS.text.secondary }} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openFAQ === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="px-6 pb-5 pl-[4.5rem]">
                          <p className="text-sm leading-relaxed" style={{ color: TOKENS.text.secondary }}>{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* ═══ FINAL CTA SECTION ═══ */}
        <Section id="cta">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="glass-eco rounded-3xl p-12 md:p-16 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(13,202,140,0.08) 0%, transparent 70%)' }} />

                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: TOKENS.text.primary, fontFamily: 'var(--font-display)' }}>
                    Ready to Track Your
                    <span className="gradient-text"> Carbon Footprint?</span>
                  </h2>
                  <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: TOKENS.text.secondary }}>
                    Start making data-driven sustainability decisions today. No credit card required. Free forever.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/register')}
                      className="btn-primary group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="btn-ghost"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Section>

        {/* ═══ FOOTER ═══ */}
        <footer className="relative border-t" style={{ borderColor: TOKENS.border.subtle, background: 'rgba(0,0,0,0.15)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <TreePine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: TOKENS.text.primary }}>EcoTrack</h3>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: TOKENS.text.muted }}>Carbon Intelligence</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: TOKENS.text.secondary }}>
                  Empowering individuals and organizations with transparent, science-backed carbon insights for a sustainable future.
                </p>
              </div>

              {[
                { title: 'Product', links: ['Features', 'Dashboard', 'Methodology', 'API Docs'] },
                { title: 'Research', links: ['GHG Protocol', 'Data Sources', 'Emission Factors', 'Whitepaper'] },
                { title: 'Company', links: ['About', 'Privacy', 'Terms', 'Open Source'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: TOKENS.text.primary }}>{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-sm transition-colors" style={{ color: TOKENS.text.secondary }}>
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
              style={{ borderColor: TOKENS.border.subtle }}>
              <p className="text-xs" style={{ color: TOKENS.text.muted }}>
                &copy; 2025 EcoTrack. Built for the planet.
              </p>
              <div className="flex gap-6 text-xs" style={{ color: TOKENS.text.muted }}>
                <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-primary-600 transition-colors">Open Source</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;