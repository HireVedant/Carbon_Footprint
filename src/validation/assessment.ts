/**
 * Assessment Input Validation
 * Ensures no invalid data reaches the calculation engine.
 *
 * @module validation/assessment
 */

import type { AssessmentAnswers } from '../types/assessment';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate assessment answers before calculation.
 * Returns empty array if valid.
 */
export function validateAssessment(answers: Partial<AssessmentAnswers>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Household members
  if (answers.householdMembers !== undefined) {
    if (answers.householdMembers < 1 || answers.householdMembers > 20) {
      errors.push({ field: 'householdMembers', message: 'Household members must be 1-20' });
    }
  }

  // Electricity
  if (answers.electricityKWh !== undefined && answers.electricityKWh < 0) {
    errors.push({ field: 'electricityKWh', message: 'Electricity cannot be negative' });
  }
  if (answers.monthlyBillRupees !== undefined && answers.monthlyBillRupees < 0) {
    errors.push({ field: 'monthlyBillRupees', message: 'Monthly bill cannot be negative' });
  }

  // Transport
  if (answers.dailyVehicleKm !== undefined && (answers.dailyVehicleKm < 0 || answers.dailyVehicleKm > 500)) {
    errors.push({ field: 'dailyVehicleKm', message: 'Daily vehicle km must be 0-500' });
  }

  // Food
  if (answers.diningOutMealsWeekly !== undefined && (answers.diningOutMealsWeekly < 0 || answers.diningOutMealsWeekly > 21)) {
    errors.push({ field: 'diningOutMealsWeekly', message: 'Dining out meals per week must be 0-21' });
  }

  // Shopping
  if (answers.apparelItemsMonthly !== undefined && (answers.apparelItemsMonthly < 0 || answers.apparelItemsMonthly > 50)) {
    errors.push({ field: 'apparelItemsMonthly', message: 'Monthly apparel items must be 0-50' });
  }
  if (answers.onlineParcelsMonthly !== undefined && (answers.onlineParcelsMonthly < 0 || answers.onlineParcelsMonthly > 100)) {
    errors.push({ field: 'onlineParcelsMonthly', message: 'Monthly parcels must be 0-100' });
  }

  return errors;
}

/**
 * Check if assessment answers are valid (no errors).
 */
export function isValidAssessment(answers: Partial<AssessmentAnswers>): boolean {
  return validateAssessment(answers).length === 0;
}