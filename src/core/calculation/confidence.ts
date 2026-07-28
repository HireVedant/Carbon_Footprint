/**
 * Confidence Engine
 * Computes precision confidence metrics (%) per category and overall assessment.
 * All confidence scores are COMPUTED — never hardcoded.
 *
 * @module core/calculation/confidence
 */

import type { AssessmentAnswers, CategoryConfidence, AssessmentConfidenceBreakdown } from '../../types/assessment';

/**
 * Calculate confidence for the energy sector.
 */
function calculateEnergyConfidence(answers: AssessmentAnswers): CategoryConfidence {
  let score = 65; // Base estimate
  const rationales: string[] = [];

  if (answers.electricityKWhKnown && answers.electricityKWh && answers.electricityKWh > 0) {
    score += 25;
    rationales.push('Exact monthly electricity consumption (kWh) provided');
  } else {
    rationales.push('Electricity estimated from household size & appliance profile');
  }

  if (answers.state) {
    score += 10;
    rationales.push(`Applied state-specific CEA grid factor for ${answers.state}`);
  }

  score = Math.min(100, score);
  const rating = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'ESTIMATE';
  return { score, rating, rationales };
}

/**
 * Calculate confidence for the transport sector.
 */
function calculateTransportConfidence(answers: AssessmentAnswers): CategoryConfidence {
  let score = 60;
  const rationales: string[] = [];

  if (answers.transportEntries && answers.transportEntries.length > 0) {
    score += 20;
    rationales.push('Multiple transport modes with specific emission factors');
  } else if (answers.ownsVehicle && answers.vehicleCategoryKey) {
    score += 20;
    rationales.push('Vehicle model & fuel class matched in ARAI dataset');
  }

  if (answers.flightDetails && answers.flightDetails.length > 0) {
    score += 5;
    rationales.push('Airport-to-airport Haversine distance engine applied for aviation');
  }

  if (answers.publicTransitModes) {
    score += 5;
    rationales.push('Public transit modes accounted for');
  }

  score = Math.min(100, score);
  const rating = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'ESTIMATE';
  return { score, rating, rationales };
}

/**
 * Calculate confidence for the food sector.
 */
function calculateFoodConfidence(answers: AssessmentAnswers): CategoryConfidence {
  let score = 70;
  const rationales: string[] = [];

  if (answers.dietMix && answers.dietMix.length > 0) {
    score += 15;
    rationales.push('Multi-category diet mix with weighted emission factors');
  } else if (answers.dietType) {
    score += 15;
    rationales.push('Matched to ICAR Indian dietary emission benchmark');
  }

  if (answers.foodWasteLevel) {
    score += 10;
    rationales.push('Food waste & portion factor accounted for');
  }

  score = Math.min(100, score);
  const rating = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'ESTIMATE';
  return { score, rating, rationales };
}

/**
 * Calculate confidence for the waste sector.
 */
function calculateWasteConfidence(answers: AssessmentAnswers): CategoryConfidence {
  let score = 65;
  const rationales: string[] = [];

  if (answers.wasteSegregation) {
    score += 20;
    rationales.push('Waste segregation & composting credit applied');
  } else {
    rationales.push('Based on CPCB municipal per-capita solid waste averages');
  }

  score = Math.min(100, score);
  const rating = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'ESTIMATE';
  return { score, rating, rationales };
}

/**
 * Calculate confidence for the shopping sector.
 */
function calculateShoppingConfidence(answers: AssessmentAnswers): CategoryConfidence {
  let score = 60;
  const rationales: string[] = [];

  if (answers.apparelItemsMonthly || answers.electronicsItemsYearly) {
    score += 25;
    rationales.push('Itemized purchase history provided');
  } else {
    rationales.push('Estimated from monthly consumer spending category');
  }

  score = Math.min(100, score);
  const rating = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'ESTIMATE';
  return { score, rating, rationales };
}

/**
 * Calculate overall assessment confidence.
 * Weighted average: Energy 35%, Transport 30%, Food 15%, Waste 10%, Shopping 10%.
 *
 * @param answers - Complete assessment answers
 * @returns Full confidence breakdown with per-category and overall scores
 */
export function calculateConfidence(answers: AssessmentAnswers): AssessmentConfidenceBreakdown {
  const energy = calculateEnergyConfidence(answers);
  const transport = calculateTransportConfidence(answers);
  const food = calculateFoodConfidence(answers);
  const waste = calculateWasteConfidence(answers);
  const shopping = calculateShoppingConfidence(answers);

  const overallScore = Math.round(
    energy.score * 0.35 +
    transport.score * 0.30 +
    food.score * 0.15 +
    waste.score * 0.10 +
    shopping.score * 0.10
  );

  const overallRating = overallScore >= 85 ? 'HIGH' : overallScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  return {
    overallScore,
    overallRating,
    energy,
    transport,
    food,
    waste,
    shopping,
  };
}