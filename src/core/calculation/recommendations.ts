/**
 * AI Recommendation Engine
 * Generates region-aware, category-specific sustainability recommendations.
 *
 * @module core/calculation/recommendations
 */

import type { Recommendation, SectorBreakdown } from '../../types/assessment';

/**
 * Generate recommendations based on emission breakdown.
 */
export function generateRecommendations(
  breakdown: SectorBreakdown,
  totalKgCO2: number,
  state: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const percentages = {
    transport: (breakdown.transport / totalKgCO2) * 100,
    energy: (breakdown.energy / totalKgCO2) * 100,
    food: (breakdown.food / totalKgCO2) * 100,
    waste: (breakdown.waste / totalKgCO2) * 100,
    shopping: (breakdown.shopping / totalKgCO2) * 100,
  };

  // Transport
  if (percentages.transport > 30) {
    recommendations.push({
      id: 'transport_ev',
      category: 'transport',
      priority: 'HIGH',
      title: 'Switch to Electric Mobility',
      description: 'Your transport emissions are high. Consider switching to an EV or using public transit.',
      estimatedReductionKgCO2: breakdown.transport * 0.4,
      difficulty: 'HARD',
    });
  }

  // Energy
  if (percentages.energy > 30) {
    recommendations.push({
      id: 'energy_solar',
      category: 'energy',
      priority: 'HIGH',
      title: 'Install Rooftop Solar',
      description: `Solar potential in ${state} is significant. Reduce grid dependency.`,
      estimatedReductionKgCO2: breakdown.energy * 0.6,
      difficulty: 'HARD',
    });
  }

  // Food
  if (percentages.food > 20) {
    recommendations.push({
      id: 'food_plant_based',
      category: 'food',
      priority: 'MEDIUM',
      title: 'Adopt Plant-Based Meals',
      description: 'Reduce meat consumption to lower your dietary footprint.',
      estimatedReductionKgCO2: breakdown.food * 0.3,
      difficulty: 'MODERATE',
    });
  }

  // Waste
  if (percentages.waste > 10) {
    recommendations.push({
      id: 'waste_compost',
      category: 'waste',
      priority: 'MEDIUM',
      title: 'Start Composting',
      description: 'Divert organic waste from landfills to reduce methane emissions.',
      estimatedReductionKgCO2: breakdown.waste * 0.2,
      difficulty: 'EASY',
    });
  }

  return recommendations;
}