import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  Car,
  Utensils,
  Plane,
  Home as HomeIcon,
  HelpCircle,
  RotateCw,
  Award,
  Smartphone,
  Gauge
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { getSEIHomeStats, getSEIHeroStats } from '../services/seiDatasetService';

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
    title: 'AI-Powered Precision',
    description: 'Machine learning models process your commute, energy, and diet to calculate accurate CO2e emissions.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    description: 'Interactive charts track monthly trends, category breakdowns, and personalized reduction targets.',
    color: 'from-teal-400 to-cyan-500',
  },
  {
    icon: TreePine,
    title: 'Virtual Eco-Forest',
    description: 'Watch your digital forest thrive as you log eco-actions and lower your carbon footprint.',
    color: 'from-emerald-400 to-green-500',
  },
  {
    icon: Zap,
    title: 'Smart AI Recommendations',
    description: 'Get tailored high-impact recommendations to cut your footprint by up to 40% with minimal effort.',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    icon: Shield,
    title: 'Privacy & Security First',
    description: 'Your personal data and assessment logs are encrypted and never shared with advertisers.',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Users,
    title: 'Gamified Eco Challenges',
    description: 'Join community challenges, plant real & virtual trees, and climb the sustainability leaderboard.',
    color: 'from-emerald-500 to-emerald-300',
  },
];

const steps = [
  {
    step: '01',
    title: 'Calculate',
    description: 'Answer simple lifestyle questions or drag our interactive sliders to measure your CO2 footprint.',
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'Explore visual breakdowns of housing, transport, diet, and consumption with climate metrics.',
  },
  {
    step: '03',
    title: 'Reduce',
    description: 'Follow AI suggestions, participate in challenges, and track your tree planting offsets.',
  },
];

// Eco Equivalents Data
const ecoEquivalents = [
  {
    icon: Car,
    title: '4,000 Kilometers Driven',
    desc: 'Equal to driving a gasoline car from NYC to Los Angeles.',
    color: 'text-amber-400',
    stat: '4,000 km',
  },
  {
    icon: TreePine,
    title: '45 Trees Planted for 1 Year',
    desc: 'The number of mature trees required to absorb 1 tonne of CO2 in a year.',
    color: 'text-emerald-400',
    stat: '45 Trees',
  },
  {
    icon: Smartphone,
    title: '120,000 Smartphone Charges',
    desc: 'Enough power to charge a smartphone every day for over 320 years.',
    color: 'text-cyan-400',
    stat: '120k Charges',
  },
  {
    icon: Utensils,
    title: '220 Beef Hamburgers',
    desc: 'Emissions produced from the lifecycle of standard beef meal production.',
    color: 'text-rose-400',
    stat: '220 Meals',
  },
];

// Flashcards for Eco IQ
const climateQuizData = [
  {
    id: 1,
    question: 'Myth or Fact: Turning off standby electronics saves significant carbon emissions?',
    answer: 'FACT! Standby power ("vampire energy") accounts for up to 10% of residential electricity consumption globally.',
    badge: 'Energy Savings',
  },
  {
    id: 2,
    question: 'Myth or Fact: Electric vehicles produce zero lifecycle carbon emissions?',
    answer: 'MYTH! EVs produce 50-70% less lifecycle emissions than gas cars, but manufacturing & battery charging still produce CO2.',
    badge: 'Transport',
  },
  {
    id: 3,
    question: 'Myth or Fact: Eating 1 plant-based meal a day cuts more carbon than driving 10 km less?',
    answer: 'FACT! Plant-based meals save ~2.5 kg CO2e per meal, equivalent to driving over 12 km in a gas car.',
    badge: 'Dietary Impact',
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const stats = getSEIHomeStats();
  const heroStats = getSEIHeroStats();

  // Quick Footprint Simulator State
  const [commuteKm, setCommuteKm] = useState(25);
  const [meatDays, setMeatDays] = useState(4);
  const [elecBill, setElecBill] = useState(80);
  const [flights, setFlights] = useState(1);

  // Live Carbon Calculation Logic
  const transportCO2 = (commuteKm * 365 * 0.17) / 1000; // Tons
  const dietCO2 = ((meatDays * 0.45 + (7 - meatDays) * 0.15) * 52) / 100; // Tons
  const energyCO2 = (elecBill * 12 * 0.0035); // Tons
  const flightCO2 = flights * 0.85; // Tons
  const totalCO2 = Number((transportCO2 + dietCO2 + energyCO2 + flightCO2).toFixed(1));

  const treesNeeded = Math.round(totalCO2 * 45);

  const getCO2Status = (tons: number) => {
    if (tons < 3.5) return { label: 'Low Impact (Eco Champion)', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
    if (tons <= 6.0) return { label: 'Moderate Impact', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
    return { label: 'High Impact (Action Needed)', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' };
  };

  const status = getCO2Status(totalCO2);

  // Active Equivalent Tab State
  const [activeEquiv, setActiveEquiv] = useState(0);

  // Quiz Card Flip States
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  const toggleCard = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="overflow-hidden bg-dark-950 text-white">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center pt-16 pb-20 overflow-hidden" id="hero-section">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-bg opacity-70" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] hero-glow opacity-60 blur-3xl pointer-events-none" />

        {/* Animated Particles & Glow Orbs */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 text-center lg:text-left pt-6">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6 shadow-eco-glow"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Next-Gen AI Carbon Awareness Platform</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.1] mb-6 tracking-tight"
              >
                Track & Reduce Your <br className="hidden sm:inline" />
                <span className="gradient-text">Carbon Footprint</span> <br className="hidden sm:inline" />
                With AI Precision
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg text-dark-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Discover your personal eco-impact in minutes. Harness AI recommendations, plant virtual trees, and join a global movement for a zero-carbon future.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
              >
                <Link
                  to={loading ? '#' : (user ? '/assessment' : '/register')}
                  className={`btn-primary text-base w-full sm:w-auto ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {user ? 'Start Full Assessment' : 'Calculate Your Footprint Free'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#simulator-section" className="btn-secondary text-base w-full sm:w-auto">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  Try Quick Simulator
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-dark-400"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified SEI dataset
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant AI report
                </span>
              </motion.div>
            </div>

            {/* Right Hero Visual / Quick Interactive Simulator Widget */}
            <div className="lg:col-span-6" id="simulator-section">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-eco p-6 sm:p-8 rounded-3xl relative overflow-hidden"
              >
                {/* Glow border background */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Live Footprint Simulator</h3>
                      <p className="text-xs text-dark-300">Drag sliders to test your annual emissions</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 animate-pulse">
                    Interactive
                  </span>
                </div>

                {/* Sliders Container */}
                <div className="space-y-5">
                  {/* Commute Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-200">
                        <Car className="w-3.5 h-3.5 text-emerald-400" /> Daily Commute
                      </span>
                      <span className="text-emerald-400 font-bold">{commuteKm} km / day</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={commuteKm}
                      onChange={(e) => setCommuteKm(Number(e.target.value))}
                      className="eco-range-slider"
                    />
                  </div>

                  {/* Diet Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-200">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" /> Meat Meals
                      </span>
                      <span className="text-amber-400 font-bold">{meatDays} days / week</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={meatDays}
                      onChange={(e) => setMeatDays(Number(e.target.value))}
                      className="eco-range-slider"
                    />
                  </div>

                  {/* Energy Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-200">
                        <HomeIcon className="w-3.5 h-3.5 text-cyan-400" /> Elec. Bill
                      </span>
                      <span className="text-cyan-400 font-bold">${elecBill} / month</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      step="10"
                      value={elecBill}
                      onChange={(e) => setElecBill(Number(e.target.value))}
                      className="eco-range-slider"
                    />
                  </div>

                  {/* Flights Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-200">
                        <Plane className="w-3.5 h-3.5 text-purple-400" /> Flights / Year
                      </span>
                      <span className="text-purple-400 font-bold">{flights} round-trip</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={flights}
                      onChange={(e) => setFlights(Number(e.target.value))}
                      className="eco-range-slider"
                    />
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-dark-300 block mb-0.5">Est. Annual Carbon Output</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                        {totalCO2} <span className="text-sm font-normal text-emerald-400">Tons CO2e</span>
                      </span>
                    </div>
                    <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-1">
                      <TreePine className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs text-emerald-300 font-semibold block">Requires ~{treesNeeded} Trees</span>
                    <span className="text-[10px] text-dark-400">to offset annually</span>
                  </div>
                </div>

                {/* Direct action CTA */}
                <div className="mt-5 text-center">
                  <Link
                    to="/assessment"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all duration-300"
                  >
                    Lock In Full AI Assessment <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== ECO EQUIVALENTS INTERACTIVE HUB ========== */}
      <section className="section-padding relative bg-dark-900/40 border-y border-emerald-500/10">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="Climate Awareness"
            title="Understanding Your Impact:"
            highlight="What Does 1 Tonne CO2 Mean?"
            description="Carbon emissions can feel abstract. Here is what just 1 Tonne of CO2e translates to in everyday life."
          />

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {ecoEquivalents.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeEquiv === idx;
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveEquiv(idx)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-emerald-950/50 border-2 border-emerald-400 shadow-eco-glow-lg'
                      : 'glass-eco hover:border-emerald-500/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-dark-950 flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-2xl font-extrabold font-display block mb-1 ${item.color}`}>{item.stat}</span>
                  <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-dark-300 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== GLOBAL STATS (SEI DATASET) ========== */}
      <section className="section-padding relative" id="stats-section">
        <div className="container-max mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="section-padding relative" id="features-section">
        <div className="absolute inset-0 mesh-bg opacity-50 pointer-events-none" />
        <div className="container-max mx-auto relative">
          <SectionHeading
            badge="Platform Features"
            title="Everything you need for"
            highlight="sustainable living"
            description="Cutting-edge tools designed to make carbon reduction engaging, measurable, and rewarding."
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

      {/* ========== CLIMATE QUIZ / FLASHCARDS SECTION ========== */}
      <section className="section-padding relative bg-emerald-950/20 border-y border-emerald-500/15">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="Test Your Eco IQ"
            title="Interactive Flashcards:"
            highlight="Climate Myths vs Facts"
            description="Click any card below to flip and discover the science behind carbon footprint myths!"
          />

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {climateQuizData.map((quiz) => {
              const isFlipped = !!flippedCards[quiz.id];
              return (
                <div
                  key={quiz.id}
                  onClick={() => toggleCard(quiz.id)}
                  className="perspective-1000 h-64 cursor-pointer"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full transform-style-3d relative"
                  >
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden glass-eco p-6 rounded-2xl flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-400">
                      <div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-4">
                          {quiz.badge}
                        </span>
                        <h4 className="text-lg font-display font-bold text-white leading-snug">
                          {quiz.question}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-4 border-t border-emerald-500/20">
                        <span className="flex items-center gap-1.5">
                          <RotateCw className="w-4 h-4" /> Click to reveal answer
                        </span>
                        <HelpCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-900 to-dark-950 p-6 rounded-2xl flex flex-col justify-between border-2 border-emerald-400 shadow-eco-glow">
                      <div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-400 text-dark-950 inline-block mb-3">
                          Verified Science
                        </span>
                        <p className="text-sm font-medium text-emerald-100 leading-relaxed">
                          {quiz.answer}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-emerald-300 pt-3 border-t border-emerald-500/30">
                        <span className="flex items-center gap-1">
                          <Leaf className="w-4 h-4 text-emerald-400" /> Knowledge power!
                        </span>
                        <span className="text-[10px] text-dark-400">Click to flip back</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section-padding relative" id="how-it-works-section">
        <div className="container-max mx-auto">
          <SectionHeading
            badge="Simple Process"
            title="Three steps to a"
            highlight="greener lifestyle"
            description="Empowering you with AI precision to make measurable environmental progress."
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mt-8">
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
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-500/40 to-transparent pointer-events-none" />
                )}

                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-6 group-hover:border-emerald-400 transition-colors duration-300 shadow-eco-glow">
                  <span className="text-2xl font-display font-bold gradient-text">{step.step}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-dark-300 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section className="section-padding relative" id="cta-section">
        <div className="container-max mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative glass-eco p-10 sm:p-16 text-center overflow-hidden rounded-3xl border border-emerald-500/30 shadow-eco-glow-lg"
          >
            {/* Background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-4">
                Ready to transform your <span className="gradient-text">carbon footprint</span>?
              </h2>
              <p className="text-dark-300 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Start tracking for free today and join thousands of climate heroes taking real action.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={loading ? '#' : (user ? '/dashboard' : '/register')}
                  className={`btn-primary text-base w-full sm:w-auto ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {user ? 'Go to Your Dashboard' : 'Get Started Free Now'}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="btn-secondary text-base w-full sm:w-auto">
                  Learn About Our SEI Model
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

