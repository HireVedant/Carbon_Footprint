/**
 * EcoTrack AI — Home Page
 *
 * Product showcase. Convinces users in under 30 seconds.
 * Flow: Hero → Interactive Simulator → Equivalents → National Stats → Methodology → CTA
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, TreePine, Zap, Car, Plane, Leaf,
  BarChart3, Shield, CheckCircle2, ChevronDown,
  Minus, Plus,
} from 'lucide-react';
import { NationalDataProvider } from '../data/providers/NationalDataProvider';
import { Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend,
);

/* ── Animated Counter ── */
function Counter({ target, suffix = '', prefix = '', decimals = 0 }: {
  target: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);
  return (
    <span ref={ref} className="tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}{suffix}
    </span>
  );
}

/* ── Slider Component ── */
function SimulatorSlider({ label, value, onChange, min, max, step = 1, unit, icon: Icon, color }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit: string;
  icon: React.ElementType; color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
            aria-label={`Decrease ${label}`}
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold w-16 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {value}{unit}
          </span>
          <button
            onClick={() => onChange(Math.min(max, value + step))}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
            aria-label={`Increase ${label}`}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-150" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
          style={{ margin: 0 }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-150 pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, background: 'var(--bg-card)', borderColor: color, boxShadow: `0 0 8px ${color}40` }} />
      </div>
    </div>
  );
}

/* ── National Data ── */
const nationalStats = NationalDataProvider.getNationalStatistics();
const indiaAvg = NationalDataProvider.getIndiaAverageFootprintKg();

/* ── Fade-up animation ── */
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };

export default function Home() {
  const { user, loading } = useAuth();

  /* ── Simulator State ── */
  const [commuteKm, setCommuteKm] = useState(25);
  const [meatDays, setMeatDays] = useState(4);
  const [elecBill, setElecBill] = useState(2000);
  const [flights, setFlights] = useState(2);

  /* ── Computed Emissions ── */
  const simulatorData = useMemo(() => {
    const transportCO2 = (commuteKm * 365 * 0.17) / 1000;
    const dietCO2 = ((meatDays * 0.45 + (7 - meatDays) * 0.15) * 52) / 100;
    const energyCO2 = elecBill * 12 * 0.0035;
    const flightCO2 = flights * 0.85;
    const totalCO2 = Number((transportCO2 + dietCO2 + energyCO2 + flightCO2).toFixed(1));
    const totalKg = totalCO2 * 1000;
    const ecoScore = Math.max(10, Math.min(100, Math.round(100 - (totalCO2 / 6) * 80)));
    const diffFromIndia = totalKg - indiaAvg.data;
    const diffPct = Math.round((diffFromIndia / indiaAvg.data) * 100);
    const treesNeeded = Math.round(totalCO2 * 45);
    const carsEquivalent = (totalCO2 / 4.6).toFixed(1);
    const flightsEquivalent = Math.round(totalCO2 / 0.255);

    return {
      transportCO2, dietCO2, energyCO2, flightCO2,
      totalCO2, totalKg, ecoScore, diffFromIndia, diffPct,
      treesNeeded, carsEquivalent, flightsEquivalent,
    };
  }, [commuteKm, meatDays, elecBill, flights]);

  /* ── Chart Data ── */
  const doughnutData = useMemo(() => ({
    labels: ['Transport', 'Energy', 'Food', 'Flights'],
    datasets: [{
      data: [
        Math.round(simulatorData.transportCO2 * 1000),
        Math.round(simulatorData.energyCO2 * 1000),
        Math.round(simulatorData.dietCO2 * 1000),
        Math.round(simulatorData.flightCO2 * 1000),
      ],
      backgroundColor: [
        'rgba(6, 182, 212, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(244, 63, 94, 0.75)',
        'rgba(139, 92, 246, 0.75)',
      ],
      borderColor: ['rgba(6,182,212,1)', 'rgba(245,158,11,1)', 'rgba(244,63,94,1)', 'rgba(139,92,246,1)'],
      borderWidth: 2, hoverOffset: 8,
    }],
  }), [simulatorData]);

  const radarData = useMemo(() => ({
    labels: ['Transport', 'Energy', 'Food', 'Flights'],
    datasets: [
      {
        label: 'You',
        data: [
          Math.round((simulatorData.transportCO2 / simulatorData.totalCO2) * 100) || 0,
          Math.round((simulatorData.energyCO2 / simulatorData.totalCO2) * 100) || 0,
          Math.round((simulatorData.dietCO2 / simulatorData.totalCO2) * 100) || 0,
          Math.round((simulatorData.flightCO2 / simulatorData.totalCO2) * 100) || 0,
        ],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.12)',
        borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#34d399',
      },
      {
        label: 'India Average',
        data: [28, 35, 25, 12],
        borderColor: 'rgba(245,158,11,0.6)',
        backgroundColor: 'rgba(245,158,11,0.05)',
        borderWidth: 1.5, borderDash: [4, 4], pointRadius: 2, pointBackgroundColor: '#f59e0b',
      },
    ],
  }), [simulatorData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111C19', titleColor: '#E8F0EC', bodyColor: '#8A9C94', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
  }), []);

  const radarOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: { beginAtZero: true, max: 60, grid: { color: 'rgba(255,255,255,0.04)' }, angleLines: { color: 'rgba(255,255,255,0.04)' }, pointLabels: { color: '#8A9C94', font: { size: 11 } }, ticks: { display: false } },
    },
    plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: '#8A9C94', font: { size: 10 }, padding: 12, usePointStyle: true } }, tooltip: { backgroundColor: '#111C19', titleColor: '#E8F0EC', bodyColor: '#8A9C94', borderColor: 'rgba(255,255,255,0.07)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
  }), []);

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  /* ── Eco score color ── */
  const scoreColor = simulatorData.ecoScore >= 70 ? '#34d399' : simulatorData.ecoScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ background: 'var(--bg-void)', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" aria-label="Hero">
        <div className="absolute inset-0 mesh-bg" aria-hidden="true" />
        <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 noise-overlay" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-20 blur-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.08), transparent)' }} aria-hidden="true" />

        <motion.div className="layout-editorial relative z-10 w-full py-24" style={{ opacity: heroOpacity, y: heroY }}>
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-6">
              <span className="t-label-lg inline-flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
                Environmental Intelligence Platform
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              What if you could<br />
              <span className="gradient-text">see your carbon impact</span><br />
              in real time?
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="t-body-lg max-w-xl mb-10">
              Drag four sliders. See your footprint instantly. No forms. No signup. Just real-time scientific calculations powered by government-verified datasets.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-12">
              <a href="#simulator" className="btn-primary text-sm px-8 py-3.5">
                Try the Simulator <ArrowRight className="w-4 h-4" />
              </a>
              <Link to={loading ? '#' : (user ? '/assessment' : '/register')}
                className={`btn-ghost text-sm px-8 py-3.5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {user ? 'Full Assessment' : 'Get Started Free'}
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-8">
              {[
                { n: nationalStats.data.totalAnnualEmissionGtCO2, s: ' Gt', l: 'India Annual CO₂' },
                { n: nationalStats.data.renewableSharePercent, s: '%', l: 'Renewable Energy' },
                { n: 2070, s: '', l: 'Net Zero Target' },
              ].map((item) => (
                <div key={item.l}>
                  <div className="t-stat-md" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                    {Number.isInteger(item.n) ? <Counter target={item.n} suffix={item.s} /> : <Counter target={item.n} suffix={item.s} decimals={1} />}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.l}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scroll to explore</span>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </section>

      {/* ═══ INTERACTIVE SIMULATOR ═══════════════════════════════════════ */}
      <section id="simulator" className="section-editorial relative" aria-label="Quick Carbon Simulator">
        <div className="layout-editorial">
          <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12">
            <span className="t-label-lg block mb-3" style={{ color: 'var(--color-primary)' }}>Quick Simulator</span>
            <h2 className="t-display-lg mb-4">Drag. See. <span className="gradient-text">Understand.</span></h2>
            <p className="t-body max-w-2xl">Four sliders. Instant results. No page reload. This is what understanding your carbon footprint should feel like.</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Sliders — Left 3 cols */}
            <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="lg:col-span-3 glass-eco rounded-3xl p-6 sm:p-8 space-y-6">
              <SimulatorSlider label="Daily Commute" value={commuteKm} onChange={setCommuteKm} min={0} max={100} unit=" km" icon={Car} color="#06b6d4" />
              <SimulatorSlider label="Meat Meals / Week" value={meatDays} onChange={setMeatDays} min={0} max={7} unit=" days" icon={Leaf} color="#10b981" />
              <SimulatorSlider label="Monthly Electricity Bill" value={elecBill} onChange={setElecBill} min={0} max={10000} step={100} unit=" ₹" icon={Zap} color="#f59e0b" />
              <SimulatorSlider label="Flights / Year" value={flights} onChange={setFlights} min={0} max={20} unit=" /yr" icon={Plane} color="#8b5cf6" />
            </motion.div>

            {/* Results — Right 2 cols */}
            <motion.div {...fadeUp} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-2 space-y-5">
              {/* Eco Score Ring */}
              <div className="glass-eco rounded-3xl p-6 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Your Estimated Eco Score</p>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="6"
                      strokeDasharray={`${simulatorData.ecoScore * 2.64} 264`}
                      strokeLinecap="round" className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: scoreColor }}>{simulatorData.ecoScore}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {simulatorData.ecoScore >= 70 ? 'Good footprint!' : simulatorData.ecoScore >= 50 ? 'Room to improve' : 'High impact lifestyle'}
                </p>
              </div>

              {/* CO₂ Total */}
              <div className="glass-eco rounded-3xl p-6">
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Estimated Annual CO₂</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{simulatorData.totalCO2}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>tonnes / year</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    simulatorData.diffFromIndia > 0
                      ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {simulatorData.diffFromIndia > 0 ? '+' : ''}{simulatorData.diffPct}% vs India avg
                  </div>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  India average: {(indiaAvg.data / 1000).toFixed(1)}t CO₂e/year
                </p>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-eco rounded-2xl p-4">
                  <div className="h-[140px]">
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                </div>
                <div className="glass-eco rounded-2xl p-4">
                  <div className="h-[140px]">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link to={loading ? '#' : (user ? '/assessment' : '/register')}
                className={`block text-center btn-primary text-sm py-3 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {user ? 'Get Accurate Results' : 'Start Free Assessment'} <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ ENVIRONMENTAL EQUIVALENTS ═════════════════════════════════ */}
      <section className="section-compact relative" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="layout-editorial">
          <motion.div {...fadeUp} viewport={{ once: true }} className="mb-8">
            <span className="t-label-lg block mb-3" style={{ color: 'var(--color-primary)' }}>In Perspective</span>
            <h2 className="t-display-md">That's equivalent to</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: simulatorData.treesNeeded, label: 'Trees needed\nto absorb yearly', icon: TreePine, color: '#10b981' },
              { value: simulatorData.carsEquivalent, label: 'Cars off the\nroad for a year', icon: Car, color: '#06b6d4' },
              { value: simulatorData.flightsEquivalent, label: 'Flights from Delhi\nto Mumbai', icon: Plane, color: '#8b5cf6' },
              { value: Math.round(simulatorData.totalCO2 * 2.3), label: 'Smartphones\ncharged', icon: Zap, color: '#f59e0b' },
            ].map((eq, i) => (
              <motion.div key={eq.label} {...fadeUp} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-eco rounded-2xl p-5 text-center group hover:border-white/15 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${eq.color}12`, border: `1px solid ${eq.color}20` }}>
                  <eq.icon className="w-5 h-5" style={{ color: eq.color }} />
                </div>
                <p className="text-2xl font-bold tabular-nums mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {typeof eq.value === 'number' ? eq.value.toLocaleString() : eq.value}
                </p>
                <p className="text-[10px] leading-tight whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{eq.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NATIONAL STATISTICS ════════════════════════════════════════ */}
      <section className="section-editorial relative" aria-label="India National Statistics">
        <div className="layout-editorial">
          <motion.div {...fadeUp} viewport={{ once: true }} className="mb-12">
            <span className="t-label-lg block mb-3" style={{ color: 'var(--color-primary)' }}>National Intelligence</span>
            <h2 className="t-display-lg mb-4">India's Carbon <span className="gradient-text">Profile</span></h2>
            <p className="t-body max-w-2xl">
              Sourced from Global Carbon Project, IEA India, CEA, and NITI Aayog. These are verified national-level statistics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Per Capita Emissions', value: (nationalStats.data.perCapitaKgCO2PerYear / 1000).toFixed(2), unit: 't CO₂e/yr', note: 'Global avg: 4.7t', confidence: 'Government Data', color: '#06b6d4' },
              { label: 'Total Annual Emissions', value: nationalStats.data.totalAnnualEmissionGtCO2.toFixed(2), unit: 'Gt CO₂', note: '3rd largest globally', confidence: 'Government Data', color: '#f59e0b' },
              { label: 'Renewable Share', value: `${nationalStats.data.renewableSharePercent}`, unit: '%', note: 'Target: 50% by 2030', confidence: 'CEA / MNRE', color: '#10b981' },
              { label: 'Grid Carbon Intensity', value: nationalStats.data.gridAverageFactorKgCO2PerKWh.toFixed(3), unit: 'kg/kWh', note: 'National average', confidence: 'CEA Report', color: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div key={stat.label} {...fadeUp} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-eco rounded-2xl p-6 group hover:border-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${stat.color}12`, color: stat.color, border: `1px solid ${stat.color}20` }}>
                    {stat.confidence}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{stat.value}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.unit}</span>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{stat.note}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} viewport={{ once: true }} className="mt-6 flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            <span>All data sourced from {nationalStats.metadata.source}. Last updated: {nationalStats.metadata.lastUpdated}.</span>
          </motion.div>
        </div>
      </section>

      {/* ═══ METHODOLOGY ════════════════════════════════════════════════ */}
      <section className="section-compact relative" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="layout-editorial">
          <motion.div {...fadeUp} viewport={{ once: true }} className="max-w-3xl">
            <span className="t-label-lg block mb-3" style={{ color: 'var(--color-primary)' }}>How It Works</span>
            <h2 className="t-display-md mb-6">Scientific. <span className="gradient-text">Transparent.</span></h2>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Input Your Lifestyle', desc: 'Commute distance, diet, electricity use, and flights — the four biggest levers of personal carbon emissions.' },
                { step: '02', title: 'Government-Verified Factors', desc: 'CEA grid factors for 36 states, ARAI transport emission coefficients, IPCC dietary impact data.' },
                { step: '03', title: 'Real-Time Calculation', desc: 'Your inputs are multiplied against India-specific scientific factors. No rounding until display. Results in tonnes CO₂e per year.' },
                { step: '04', title: 'Actionable Insights', desc: 'Compare against India average, national benchmarks, and get AI-powered recommendations to reduce your footprint.' },
              ].map((item, i) => (
                <motion.div key={item.step} {...fadeUp} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex gap-5 p-5 rounded-2xl transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-lg font-bold tabular-nums shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{item.step}</span>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════ */}
      <section className="section-editorial relative">
        <div className="layout-editorial">
          <motion.div {...fadeUp} viewport={{ once: true }}
            className="p-10 sm:p-16 text-center relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '28px' }}>
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(52,211,153,0.04)' }} aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Ready to know your number?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                {user
                  ? 'Continue where you left off. Your dashboard is waiting.'
                  : 'Join thousands of Indians measuring and reducing their carbon footprint. Free forever.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={loading ? '#' : (user ? '/assessment' : '/register')}
                  className={`btn-primary text-base px-10 py-3.5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {user ? 'Take Assessment' : 'Get Started Free'} <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#simulator" className="btn-ghost text-base px-10 py-3.5">
                  Try Simulator First
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}