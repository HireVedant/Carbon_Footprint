/**
 * Scientific Calculation Engine — Barrel Export
 *
 * Usage:
 *   import { calculateEmissions } from '../core/calculation';
 *   const result = calculateEmissions(answers);
 *
 * @module core/calculation
 */

export { calculateEmissions } from './emissions';
export { calculateEcoScore } from './ecoScore';
export { calculateConfidence } from './confidence';
export { generateRecommendations } from './recommendations';

// Sector-specific (for advanced use or testing)
export {
  calculateMultiTransportEmission,
  calculateLegacyVehicleEmission,
  calculateAviationEmission,
  calculatePublicTransitEmission,
  calculateTotalTransportEmission,
  getTransportSubBreakdown,
} from './transport';

export {
  resolveGridFactor,
  estimateMonthlyElectricityKWh,
  calculateElectricityEmission,
  calculateCookingFuelEmission,
  calculateApplianceEmission,
  calculateTotalEnergyEmission,
} from './energy';

export {
  calculateMultiDietEmission,
  calculateLegacyDietEmission,
  calculateTotalFoodEmission,
} from './food';

export { calculateTotalWasteEmission } from './waste';
export { calculateTotalShoppingEmission } from './shopping';