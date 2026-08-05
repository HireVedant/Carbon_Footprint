import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, BookOpen, CheckCircle2 } from 'lucide-react';
import { TOKENS, staggerContainer, fadeInUp, scaleIn } from '../../../utils/design';
import { cn } from '../../../utils/cn';

interface HeroProps {
  carbonScore: number;
  carbonRating: string;
  sliders: Array<{
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
  }>;
  onNavigate: (path: string) => void;
  onScrollToSimulator: () => void;
}

export const Hero: React.FC<HeroProps> = ({ carbonScore, carbonRating, sliders, onNavigate, onScrollToSimulator }) => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center pt-24 pb-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full opacity-40 animate-bounce"
          style={{ background: TOKENS.color.primary, animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full opacity-30 animate-bounce"
          style={{ background: TOKENS.color.info, animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 rounded-full opacity-50 animate-bounce"
          style={{ background: TOKENS.color.secondary, animationDelay: '2s', animationDuration: '2.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: TOKENS.color.primary }} />
              Open-source carbon intelligence
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.1] mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: TOKENS.text.primary }}>
              <span>Carbon Insight</span>
              <br />
              <span className="gradient-text">
                Emissions Tracking
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: TOKENS.text.secondary }}>
              Track your carbon footprint with{' '}
              <span style={{ color: TOKENS.color.primary }} className="font-medium">real-time simulation</span>,{' '}
              <span style={{ color: TOKENS.color.info }} className="font-medium">scientific accuracy</span>, and{' '}
              <span style={{ color: TOKENS.color.secondary }} className="font-medium">gamified progress</span>.{' '}
              Make data-driven decisions for a sustainable future.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onNavigate('/dashboard')}
                className={cn("btn-primary group")}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Tracking
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={onScrollToSimulator}
                className={cn("btn-ghost group")}
              >
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" style={{ color: TOKENS.color.primary }} />
                  Try Simulator
                </span>
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm"
              style={{ color: TOKENS.text.tertiary }}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: TOKENS.color.primary }} />
                <span>GHG Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: TOKENS.color.info }} />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: TOKENS.color.secondary }} />
                <span>Privacy First</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Interactive Carbon Score Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="relative"
          >
            <div className="glass-eco rounded-3xl p-8 overflow-hidden relative">
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 50%, rgba(13,202,140,0.05) 100%)' }} />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <p className="t-label-lg mb-2" style={{ color: TOKENS.text.tertiary }}>Estimated Annual Footprint</p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-6xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
                      {carbonScore.toLocaleString()}
                    </span>
                    <span className="text-lg mb-2" style={{ color: TOKENS.text.secondary }}>kg CO₂e</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(13,202,140,0.08) 100%)',
                      borderColor: 'rgba(16,185,129,0.25)',
                    }}>
                    <span className="text-2xl font-bold" style={{ color: TOKENS.color.primary }}>{carbonRating}</span>
                    <span className="text-xs" style={{ color: TOKENS.text.secondary }}>Rating</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {sliders.slice(0, 3).map((slider) => (
                    <div key={slider.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${slider.color} text-white shrink-0`}>
                        {slider.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: TOKENS.text.secondary }}>{slider.label}</span>
                          <span className="font-medium" style={{ color: TOKENS.text.primary }}>{slider.value} {slider.unit.split('/')[0]}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${slider.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(slider.value / slider.max) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="text-sm font-medium flex items-center gap-1 mx-auto transition-colors hover:opacity-80"
                    style={{ color: TOKENS.color.primary }}
                  >
                    Open Full Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
