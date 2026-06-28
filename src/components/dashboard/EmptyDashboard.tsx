import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Activity, Award, ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

export const EmptyDashboard: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="glass-strong p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Dynamic Graphic Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 text-primary-400 mb-6 shadow-lg group hover:scale-105 transition-transform duration-300">
          <ShieldAlert className="w-10 h-10 animate-pulse text-dark-400" />
          <Leaf className="w-5 h-5 text-primary-400 absolute bottom-3 right-3" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
          No Carbon Calculation Found
        </h2>
        
        <p className="text-sm text-dark-400 max-w-md mx-auto mb-8 leading-relaxed">
          It looks like you haven't calculated your carbon footprint yet. Complete our lifestyle survey to unlock real-time ecological insights, score ratings, and personalized AI tips.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8 text-left">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex gap-2">
            <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Carbon Breakdown</h4>
              <p className="text-[10px] text-dark-500 mt-0.5">Sectors commuting, power, food and waste.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex gap-2">
            <Activity className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Eco Score Card</h4>
              <p className="text-[10px] text-dark-500 mt-0.5">Evaluate points relative to worldwide reference benchmarks.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex gap-2">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Target Actions</h4>
              <p className="text-[10px] text-dark-500 mt-0.5">Understand potential reductions and mitigation steps.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/calculator" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              Start Assessment
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link to="/about" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
