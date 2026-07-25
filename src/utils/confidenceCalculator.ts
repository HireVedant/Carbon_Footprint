/**
 * Carbon Calculation Confidence & Rationale Engine
 * Calculates precision confidence metrics (%) per category and overall assessment.
 */

export interface CategoryConfidence {
  score: number; // 0 - 100 %
  rating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
  rationales: string[];
}

export interface AssessmentConfidenceBreakdown {
  overallScore: number;
  overallRating: 'HIGH' | 'MEDIUM' | 'ESTIMATE';
  transport: CategoryConfidence;
  energy: CategoryConfidence;
  food: CategoryConfidence;
  waste: CategoryConfidence;
  shopping: CategoryConfidence;
}

export function calculateAssessmentConfidence(answers: any): AssessmentConfidenceBreakdown {
  // 1. Energy Confidence
  let energyScore = 65; // Base estimate
  const energyRationales: string[] = [];

  if (answers.electricityKWhKnown && answers.electricityKWh > 0) {
    energyScore += 25; // Exact bill provided
    energyRationales.push('Exact monthly electricity bill (kWh) provided');
  } else {
    energyRationales.push('Electricity estimated from household size & appliance profile');
  }

  if (answers.state) {
    energyScore += 10;
    energyRationales.push(`Applied state-specific CEA grid factor for ${answers.state}`);
  }

  energyScore = Math.min(100, energyScore);
  const energyRating = energyScore >= 85 ? 'HIGH' : energyScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  // 2. Transport Confidence
  let transportScore = 60;
  const transportRationales: string[] = [];

  if (answers.ownsVehicle && answers.vehicleCategoryKey) {
    transportScore += 20;
    transportRationales.push('Exact vehicle model & fuel class matched in ARAI dataset');
  }

  if (answers.exactDistanceProvided) {
    transportScore += 15;
    transportRationales.push('Exact daily odometer distance logged');
  } else {
    transportRationales.push('Commute distance based on daily average estimate');
  }

  if (answers.flightDetails && answers.flightDetails.length > 0) {
    transportScore += 5;
    transportRationales.push('Airport-to-airport Haversine distance engine applied for aviation');
  }

  transportScore = Math.min(100, transportScore);
  const transportRating = transportScore >= 85 ? 'HIGH' : transportScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  // 3. Food Confidence
  let foodScore = 70;
  const foodRationales: string[] = [];

  if (answers.dietType) {
    foodScore += 15;
    foodRationales.push('Matched to ICAR Indian dietary emission benchmark');
  }

  if (answers.foodWasteLevel) {
    foodScore += 10;
    foodRationales.push('Food waste & portion factor accounted for');
  }

  foodScore = Math.min(100, foodScore);
  const foodRating = foodScore >= 85 ? 'HIGH' : foodScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  // 4. Waste Confidence
  let wasteScore = 65;
  const wasteRationales: string[] = [];

  if (answers.wasteSegregation) {
    wasteScore += 20;
    wasteRationales.push('Waste segregation & composting credit applied');
  } else {
    wasteRationales.push('Based on CPCB municipal per-capita solid waste averages');
  }

  wasteScore = Math.min(100, wasteScore);
  const wasteRating = wasteScore >= 85 ? 'HIGH' : wasteScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  // 5. Shopping Confidence
  let shoppingScore = 60;
  const shoppingRationales: string[] = [];

  if (answers.purchasesDetailed) {
    shoppingScore += 25;
    shoppingRationales.push('Itemized apparel & electronics purchase history provided');
  } else {
    shoppingRationales.push('Estimated from monthly consumer spending category');
  }

  shoppingScore = Math.min(100, shoppingScore);
  const shoppingRating = shoppingScore >= 85 ? 'HIGH' : shoppingScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  // Weighted Overall Score
  const overallScore = Math.round(
    energyScore * 0.35 +
    transportScore * 0.30 +
    foodScore * 0.15 +
    wasteScore * 0.10 +
    shoppingScore * 0.10
  );

  const overallRating = overallScore >= 85 ? 'HIGH' : overallScore >= 70 ? 'MEDIUM' : 'ESTIMATE';

  return {
    overallScore,
    overallRating,
    energy: { score: energyScore, rating: energyRating, rationales: energyRationales },
    transport: { score: transportScore, rating: transportRating, rationales: transportRationales },
    food: { score: foodScore, rating: foodRating, rationales: foodRationales },
    waste: { score: wasteScore, rating: wasteRating, rationales: wasteRationales },
    shopping: { score: shoppingScore, rating: shoppingRating, rationales: shoppingRationales }
  };
}
