// ─────────────────────────────────────────────────────────────────────────────
// SEI Dataset Service
// Accessor functions for SEI historical survey data.
// Zero network cost — all data is a static import.
// ─────────────────────────────────────────────────────────────────────────────
import { SEI_DATASET } from '../data/seiDataset';
import type {
  SEICaseStudy,
  SEIEmissionDistribution,
  SEIDerivedMetrics,
  SEISurveyStats,
} from '../types/community';
import { Users, FileText, TrendingDown, Leaf, TreePine } from 'lucide-react';

// ── Public Accessors ─────────────────────────────────────────────────────────

/** Returns the full array of 10 SEI case studies. */
export function getSEICaseStudies(): SEICaseStudy[] {
  return SEI_DATASET.caseStudies;
}

/** Returns the emission distribution percentages for chart rendering. */
export function getSEIEmissionDistribution(): SEIEmissionDistribution {
  return SEI_DATASET.emissionDistribution;
}

/** Returns the aggregated survey statistics. */
export function getSEISurveyStats(): SEISurveyStats {
  return SEI_DATASET.surveyStats;
}

/** Returns pre-computed derived metrics from the 10 case studies. */
export function getSEIDerivedMetrics(): SEIDerivedMetrics {
  return SEI_DATASET.derivedMetrics;
}

/**
 * Returns the stat card definitions for the Home and About pages.
 * Replaces hardcoded static arrays.
 */
export function getSEIHomeStats(): Array<{ icon: any; value: string; label: string }> {
  const { derivedMetrics, surveyStats } = SEI_DATASET;
  return [
    { icon: Users, value: `${surveyStats.totalParticipants}+`, label: 'Survey Participants' },
    { icon: FileText, value: `${SEI_DATASET.caseStudies.length}`, label: 'Detailed Case Studies' },
    { icon: TrendingDown, value: `${derivedMetrics.totalAnnualCO2} t`, label: 'Annual CO₂ Analysed' },
    { icon: Leaf, value: '3', label: 'Team Members' },
  ];
}

/**
 * Returns the stat card definitions for the About page.
 */
export function getSEIAboutStats(): Array<{ icon: any; value: string; label: string }> {
  const { derivedMetrics, surveyStats } = SEI_DATASET;
  return [
    { icon: Users, value: `${surveyStats.totalParticipants}+`, label: 'Survey Participants' },
    { icon: TrendingDown, value: `${derivedMetrics.totalAnnualCO2} t`, label: 'Annual CO₂ Analysed' },
    { icon: FileText, value: `${derivedMetrics.averageEcoScore}`, label: 'Average Eco Score' },
    { icon: Leaf, value: '3', label: 'Team Members' },
  ];
}

/**
 * Returns Chart.js-ready data for the SEI emission distribution doughnut.
 */
export function getSEIEmissionChartData() {
  const dist = SEI_DATASET.emissionDistribution;
  return {
    labels: ['Transportation', 'Household Energy', 'Diet & Food', 'Waste & Shopping'],
    datasets: [
      {
        label: 'SEI Community Survey (%)',
        data: [dist.transport, dist.energy, dist.food, dist.waste],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // blue — transport
          'rgba(245, 158, 11, 0.7)',   // amber — energy
          'rgba(16, 185, 129, 0.7)',   // emerald — food
          'rgba(236, 72, 153, 0.7)',   // pink — waste
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
}

/**
 * Returns Chart.js-ready data for the 10 case study bar chart.
 */
export function getSEICaseStudyChartData() {
  const cases = SEI_DATASET.caseStudies;
  return {
    labels: cases.map((c) => c.profile),
    datasets: [
      {
        label: 'Annual CO₂ (tons)',
        data: cases.map((c) => c.annualCO2),
        backgroundColor: cases.map((c) =>
          c.ecoScore >= 85 ? 'rgba(16, 185, 129, 0.7)'  // emerald — eco warrior
          : c.ecoScore >= 70 ? 'rgba(34, 197, 94, 0.7)'  // green — conscious
          : c.ecoScore >= 50 ? 'rgba(245, 158, 11, 0.7)' // amber — average
          : c.ecoScore >= 30 ? 'rgba(249, 115, 22, 0.7)' // orange — high impact
          : 'rgba(239, 68, 68, 0.7)'                     // red — carbon heavy
        ),
        borderColor: cases.map((c) =>
          c.ecoScore >= 85 ? 'rgba(16, 185, 129, 1)'
          : c.ecoScore >= 70 ? 'rgba(34, 197, 94, 1)'
          : c.ecoScore >= 50 ? 'rgba(245, 158, 11, 1)'
          : c.ecoScore >= 30 ? 'rgba(249, 115, 22, 1)'
          : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1.5,
      },
    ],
  };
}

/**
 * Returns the four hero dashboard card values for the Home page.
 * Replaces the hardcoded 2.4 / -18% / 127 / A+ mock values.
 */
export function getSEIHeroStats(): Array<{ value: string; label: string }> {
  const { derivedMetrics, surveyStats } = SEI_DATASET;
  return [
    { value: `${derivedMetrics.averageAnnualCO2} t`, label: 'Avg Annual CO₂' },
    { value: `${derivedMetrics.averageEcoScore}`, label: 'Avg Eco Score' },
    { value: `${derivedMetrics.totalAnnualCO2} t`, label: 'Dataset Total' },
    { value: `${surveyStats.willingToUseEcoTrack}%`, label: 'Would Use EcoTrack' },
  ];
}

/**
 * Returns SEI-sourced community insight strings.
 * These are always shown regardless of live data.
 */
export function getSEIInsights(): Array<{ id: string; text: string; icon: string }> {
  const { surveyStats, emissionDistribution } = SEI_DATASET;
  return [
    {
      id: 'sei-1',
      icon: '🚗',
      text: `${surveyStats.petrolUsers}% of surveyed users rely on petrol vehicles — transportation is the single largest emission source at ${emissionDistribution.transport}%.`,
    },
    {
      id: 'sei-2',
      icon: '♻️',
      text: `${surveyStats.noWasteSegregation}% of participants do not segregate waste, and ${surveyStats.noComposting}% do not compost — two high-impact, low-effort changes.`,
    },
    {
      id: 'sei-3',
      icon: '📱',
      text: `${surveyStats.willingToUseEcoTrack}% of survey respondents said they would actively use EcoTrack AI to monitor their carbon footprint.`,
    },
    {
      id: 'sei-4',
      icon: '💡',
      text: `${surveyStats.lowCarbonAwareness}% had low carbon awareness before the survey — education is the first step toward action.`,
    },
  ];
}
