import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Globe2,
  Heart,
  Users,
  Target,
  Lightbulb,
  Shield,
  Zap,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  CheckCircle2,
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';

const values = [
  {
    icon: Globe2,
    title: 'Planet First',
    description: 'Every decision we make is guided by its impact on the environment. Sustainability isn\'t a feature — it\'s our foundation.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Open methodology, transparent calculations, and privacy-first data handling. Your trust is paramount.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Lightbulb,
    title: 'Innovation Through AI',
    description: 'We leverage cutting-edge AI to make sustainability accessible, accurate, and actionable for everyone.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Real change happens together. We build tools that connect and empower communities for collective impact.',
    color: 'from-primary-500 to-accent-500',
  },
];

const team = [
  { name: 'Alex Rivera', role: 'Founder & CEO', emoji: '🌿' },
  { name: 'Sarah Chen', role: 'Head of AI', emoji: '🧠' },
  { name: 'Marcus Johnson', role: 'Lead Engineer', emoji: '⚡' },
  { name: 'Priya Patel', role: 'Head of Design', emoji: '🎨' },
];

const milestones = [
  { year: '2024', title: 'Founded', description: 'EcoTrack AI was born from a vision to democratize carbon tracking' },
  { year: '2024', title: 'Beta Launch', description: 'Launched to 1,000 early adopters with core tracking features' },
  { year: '2025', title: 'AI Integration', description: 'Introduced machine learning for personalized recommendations' },
  { year: '2025', title: '50K Users', description: 'Reached 50,000 active users across 120 countries' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* ========== HERO ========== */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20" id="about-hero">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] hero-glow opacity-40" />

        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
            >
              <Heart className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">Our Mission</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.1] mb-6"
            >
              Making sustainability
              <br />
              <span className="gradient-text">accessible to all</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-dark-400 leading-relaxed max-w-2xl mx-auto"
            >
              We believe every individual has the power to fight climate change. 
              EcoTrack AI empowers you with the tools and intelligence to understand 
              and reduce your environmental footprint.
            </motion.p>
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
            description="A passionate team of engineers, scientists, and designers united by sustainability."
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card text-center group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4 text-3xl sm:text-4xl group-hover:border-primary-500/40 transition-colors duration-300">
                  {member.emoji}
                </div>
                <h3 className="text-sm sm:text-base font-display font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-xs text-dark-400">{member.role}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[Twitter, Linkedin, Github].map((Icon, j) => (
                    <a
                      key={j}
                      href="#"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-white/10 transition-all duration-300"
                    >
                      <Icon className="w-3 h-3" />
                    </a>
                  ))}
                </div>
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
                  <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-primary-500/30 to-transparent" />
                )}
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                </div>

                <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">{milestone.year}</span>
                <h3 className="text-lg font-display font-bold text-white mt-1 mb-1">{milestone.title}</h3>
                <p className="text-sm text-dark-400">{milestone.description}</p>
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
            className="glass-strong p-10 sm:p-16 text-center relative overflow-hidden rounded-3xl"
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Join the <span className="gradient-text">movement</span>
              </h2>
              <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
                Be part of the community that's redefining how we track and reduce our environmental impact.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary text-base w-full sm:w-auto" id="about-cta-register">
                  Join EcoTrack AI
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
