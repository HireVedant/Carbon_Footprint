import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe2,
  Heart,
  Target,
  Lightbulb,
  Shield,
  ArrowRight,
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { getSEIAboutStats } from '../services/seiDatasetService';
import { surface, emerald, fontFamily, radius } from '../design';

const values = [
  {
    icon: Globe2,
    title: 'Planet First',
    description: 'Every decision we make is guided by its impact on the environment. Sustainability isn\'t a feature — it\'s our foundation.',
    color: '#0EA5E9',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Open methodology, transparent calculations, and privacy-first data handling. Your trust is paramount.',
    color: '#8b5cf6',
  },
  {
    icon: Lightbulb,
    title: 'Innovation Through AI',
    description: 'We leverage cutting-edge AI to make sustainability accessible, accurate, and actionable for everyone.',
    color: '#F59E0B',
  },
  {
    icon: Target,
    title: 'Community Driven',
    description: 'Real change happens together. We build tools that connect and empower communities for collective impact.',
    color: '#10b981',
  },
];

// ── Task 2: Updated team members ──────────────────────────────────────────────
const team = [
  {
    name: 'Tanay Daware',
    role: 'Project Lead & Full Stack Developer',
    initials: 'TD',
    color: '#34d399',
  },
  {
    name: 'Vedant Hire',
    role: 'Frontend Developer & UI Designer',
    initials: 'VH',
    color: '#06b6d4',
  },
  {
    name: 'Jeevan Sagale',
    role: 'Backend Developer & Firebase Integration',
    initials: 'JS',
    color: '#8b5cf6',
  },
];

// ── Task 3: Updated statistics ────────────────────────────────────────────────
// Real statistics from SEI report used instead of hardcoded arrays.

// ── Task 4: Updated timeline ──────────────────────────────────────────────────
const milestones = [
  {
    year: 'Jan 2026',
    title: 'Research & Design',
    description: 'Researched Indian emission factors across transport, energy, food, and waste. Designed the scientific calculation methodology.',
  },
  {
    year: 'Feb 2026',
    title: 'Core Calculator',
    description: 'Built the emission calculation engine with CEA grid factors for 36 states and ARAI transport coefficients.',
  },
  {
    year: 'Mar 2026',
    title: 'AI Integration',
    description: 'Integrated Gemini AI for personalized sustainability recommendations and carbon coaching.',
  },
  {
    year: 'Apr 2026',
    title: 'Platform Launch',
    description: 'Launched community leaderboard, India visualizations, and the full environmental intelligence platform.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default function About() {
  const { user, loading } = useAuth();
  const stats = getSEIAboutStats();
  
  return (
    <div className="overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20" id="about-hero">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${emerald[500]}0F` }} />

        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${emerald[500]}14`, border: `1px solid ${emerald[500]}33` }}
            >
              <Heart className="w-4 h-4" style={{ color: emerald[500] }} />
              <span className="text-sm font-medium" style={{ color: emerald[500] }}>Our Mission</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}
            >
              Making sustainability
              <br />
              <span className="gradient-text">accessible to all</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: surface.textSecondary }}
            >
              We believe every individual has the power to fight climate change.
              EcoTrack AI empowers you with the tools and intelligence to understand
              and reduce your environmental footprint.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ========== STATISTICS ========== */}
      <section className="section-padding relative" id="stats-section">
        <div className="container-max mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== VALUES ========== */}
      <section className="section-padding" id="values-section">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="Our Values"
            title="Built on principles that"
            highlight="matter"
            description="These core values guide everything we build and every decision we make."
          />

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                  iconColor={value.color}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TEAM ========== */}
      <section className="section-padding relative" id="team-section">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="container-max mx-auto relative">
          <SectionHeading
            badge="Our Team"
            title="Meet the people"
            highlight="behind EcoTrack"
            description="A passionate team of developers united by sustainability and innovation."
          />

          {/* Three-column grid, centred */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card text-center group w-full sm:w-64"
              >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300" style={{ background: `linear-gradient(135deg, ${member.color}18, ${member.color}08)`, border: `1px solid ${member.color}25` }}>
                   <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: fontFamily.display, color: member.color }}>{member.initials}</span>
                 </div>
                 <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
                   {member.name}
                 </h3>
                 <p className="text-xs leading-relaxed" style={{ color: surface.textSecondary }}>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TIMELINE ========== */}
      <section className="section-padding" id="timeline-section">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="Journey"
            title="Our"
            highlight="story so far"
          />

          <div className="max-w-2xl mx-auto">
            {milestones.map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-8 pb-10 last:pb-0"
              >
                {/* Line */}
                {i < milestones.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${emerald[500]}50, transparent)` }} />
                )}
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${emerald[500]}26`, border: `2px solid ${emerald[500]}` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: emerald[500] }} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: emerald[500] }}>{milestone.year}</span>
                <h3 className="text-lg font-bold mt-1 mb-1" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>{milestone.title}</h3>
                <p className="text-sm" style={{ color: surface.textSecondary }}>{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section-padding" id="about-cta">
        <div className="container-max mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-10 sm:p-16 text-center relative overflow-hidden"
            style={{ background: surface.panel, border: `1px solid ${surface.border}`, borderRadius: '24px' }}
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: `${emerald[500]}0F` }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: `${emerald[500]}08` }} />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
                Join the <span className="gradient-text">movement</span>
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: surface.textSecondary }}>
                Be part of the community that's redefining how we track and reduce our environmental impact.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to={loading ? '#' : (user ? '/dashboard' : '/register')} 
                  className={`btn-primary text-base w-full sm:w-auto ${loading ? 'opacity-70 pointer-events-none' : ''}`} 
                  id="about-cta-register"
                >
                  {user ? 'Go to Dashboard' : 'Join EcoTrack AI'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/calculator" className="btn-secondary text-base w-full sm:w-auto" id="about-cta-calc">
                  Try the Calculator
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
