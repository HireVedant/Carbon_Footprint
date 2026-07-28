import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Activity, Award, ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';
import { surface, emerald, fontFamily, water, solar } from '../../design';

export const EmptyDashboard: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: `${emerald[500]}0F` }} aria-hidden="true" />

        {/* Dynamic Graphic Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group" style={{ background: surface.base, border: `1px solid ${surface.border}` }}>
          <ShieldAlert className="w-10 h-10 animate-pulse-subtle" style={{ color: surface.textSecondary }} />
          <Leaf className="w-5 h-5 absolute bottom-3 right-3" style={{ color: emerald[500] }} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
          No Carbon Calculation Found
        </h2>
        
        <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: surface.textSecondary }}>
          It looks like you haven't calculated your carbon footprint yet. Complete our lifestyle survey to unlock real-time ecological insights, score ratings, and personalized AI tips.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8 text-left">
          <div className="p-3.5 rounded-xl flex gap-2" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
            <Leaf className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: emerald[500] }} />
            <div>
              <h4 className="text-xs font-semibold" style={{ color: surface.textPrimary, fontFamily: fontFamily.display }}>Carbon Breakdown</h4>
              <p className="text-[10px] mt-0.5" style={{ color: surface.textSecondary }}>Sectors commuting, power, food and waste.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl flex gap-2" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
            <Activity className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: water.river }} />
            <div>
              <h4 className="text-xs font-semibold" style={{ color: surface.textPrimary, fontFamily: fontFamily.display }}>Eco Score Card</h4>
              <p className="text-[10px] mt-0.5" style={{ color: surface.textSecondary }}>Evaluate points relative to worldwide reference benchmarks.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl flex gap-2" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
            <Award className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: solar.yellow }} />
            <div>
              <h4 className="text-xs font-semibold" style={{ color: surface.textPrimary, fontFamily: fontFamily.display }}>Target Actions</h4>
              <p className="text-[10px] mt-0.5" style={{ color: surface.textSecondary }}>Understand potential reductions and mitigation steps.</p>
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
