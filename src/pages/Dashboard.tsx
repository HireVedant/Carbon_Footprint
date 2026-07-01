import React from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { InsightCard } from '../components/dashboard/InsightCard';
import { EquivalentCard } from '../components/dashboard/EquivalentCard';
import { CategoryCard } from '../components/dashboard/CategoryCard';
import { ActionButtons } from '../components/dashboard/ActionButtons';
import { EmptyDashboard } from '../components/dashboard/EmptyDashboard';
import { EcoScoreBadge } from '../components/dashboard/EcoScoreBadge';
import { ImprovementPreview } from '../components/dashboard/ImprovementPreview';
import {
  Wind,
  Zap,
  Calendar,
  ShieldCheck,
  TrendingDown,
  Car,
  Utensils,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { results, isCalculated } = useCalculator();

  if (!isCalculated || !results) {
    return (
      <div className="min-h-screen pt-24 pb-16 relative flex items-center justify-center">
        <div className="absolute inset-0 mesh-bg" />
        <EmptyDashboard />
      </div>
    );
  }

  const {
    transportEmissions,
    energyEmissions,
    foodEmissions,
    wasteEmissions,
    totalEmissions,
    annualEstimate,
    ecoScore,
  } = results;

  // Formatting date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Category Tons
  const transportTons = parseFloat((transportEmissions / 1000).toFixed(2));
  const energyTons = parseFloat((energyEmissions / 1000).toFixed(2));
  const foodTons = parseFloat((foodEmissions / 1000).toFixed(2));
  const wasteTons = parseFloat((wasteEmissions / 1000).toFixed(2));

  // Chart 1 & 2: Category contribution & comparison data
  const categoryChartData = {
    labels: ['Transportation', 'Household Energy', 'Diet & Food Sourcing', 'Waste & Shopping'],
    datasets: [
      {
        label: 'Emissions (Tons CO₂/yr)',
        data: [transportTons, energyTons, foodTons, wasteTons],
        backgroundColor: [
          'rgba(59, 130, 246, 0.55)', // Blue
          'rgba(245, 158, 11, 0.55)', // Amber
          'rgba(16, 185, 129, 0.55)', // Emerald
          'rgba(236, 72, 153, 0.55)', // Pink
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  // Chart 3: Historical line chart data (6-month progress visualization)
  // Generates hypothetical historical trend showing carbon emissions reduction
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Current'],
    datasets: [
      {
        label: 'Emissions Trend (Tons CO₂/yr)',
        data: [
          parseFloat((annualEstimate * 1.22).toFixed(2)),
          parseFloat((annualEstimate * 1.18).toFixed(2)),
          parseFloat((annualEstimate * 1.12).toFixed(2)),
          parseFloat((annualEstimate * 1.09).toFixed(2)),
          parseFloat((annualEstimate * 1.04).toFixed(2)),
          annualEstimate,
        ],
        borderColor: 'rgba(16, 185, 129, 1)', // Primary green theme
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Visual background layers */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <DashboardHeader date={formattedDate} />

        {/* Dashboard grid layout */}
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Top Score Summary cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <ProgressRing score={ecoScore} />
            <EcoScoreBadge score={ecoScore} />
            
            {/* Quick Summary overview */}
            <div className="glass p-5 flex flex-col justify-between h-full group hover:border-white/15 transition-all duration-300">
              <div>
                <span className="text-xs font-bold text-dark-400 uppercase tracking-wider block mb-3">Overall Impact</span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2 leading-tight">
                  <span className="gradient-text">{totalEmissions.toLocaleString()}</span> kg CO₂
                </h2>
                <p className="text-[11px] text-dark-400 leading-relaxed mb-4">
                  That is your total yearly carbon footprint. Swapping standard commutes for public transport represents your highest potential reduction path.
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-dark-400">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                <span>Verification standard: WRI GHG Protocol.</span>
              </div>
            </div>
          </div>

          {/* Core KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Wind}
              label="Annual Estimate"
              value={annualEstimate}
              unit="tons CO₂"
              subtitle="Total yearly emissions footprint."
              iconBgColor="bg-primary-500/10"
              iconColor="text-primary-400"
              delay={0.05}
            />
            <StatCard
              icon={Calendar}
              label="Monthly Estimate"
              value={Math.round(totalEmissions / 12).toLocaleString()}
              unit="kg CO₂"
              subtitle="Monthly average carbon footprint."
              iconBgColor="bg-blue-500/10"
              iconColor="text-blue-400"
              delay={0.1}
            />
            <StatCard
              icon={TrendingDown}
              label="Daily Average"
              value={Math.round(totalEmissions / 365).toLocaleString()}
              unit="kg CO₂"
              subtitle="Calculated average daily emission."
              iconBgColor="bg-emerald-500/10"
              iconColor="text-emerald-400"
              delay={0.15}
            />
            <StatCard
              icon={Zap}
              label="Energy Emissions"
              value={energyTons}
              unit="tons CO₂"
              subtitle="Domestic power and appliance total."
              iconBgColor="bg-amber-500/10"
              iconColor="text-amber-400"
              delay={0.2}
            />
          </div>

          {/* Charts Display Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <ChartCard
              type="doughnut"
              title="Category Contribution"
              subtitle="Percentage share of each lifestyle sector in total carbon."
              data={categoryChartData}
            />
            <ChartCard
              type="bar"
              title="Category Comparison"
              subtitle="Emission counts in tons compared across all sectors."
              data={categoryChartData}
            />
            <ChartCard
              type="line"
              title="Historical Trend Tracker"
              subtitle="Simulated progression path tracking carbon mitigation over 6 months."
              data={lineChartData}
            />
          </div>

          {/* Details & Environmental Equivalents Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <CategoryCard results={results} />
            <EquivalentCard results={results} />
          </div>

          {/* AI Insights & Improvement Potential Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <InsightCard results={results} />
            <ImprovementPreview results={results} />
          </div>

          {/* Console Action Navigation Buttons */}
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
