/**
 * Default values used throughout the application.
 * Centralized here to avoid magic numbers in components.
 *
 * @module constants/defaults
 */

/** Default state if none selected */
export const DEFAULT_STATE = 'Delhi';

/** Default household members */
export const DEFAULT_HOUSEHOLD_MEMBERS = 1;

/** Default electricity cost per kWh in INR */
export const DEFAULT_ELECTRICITY_COST_PER_KWH = 7.5;

/** Baseline electricity per person per month in India (kWh) */
export const BASELINE_KWH_PER_PERSON_MONTHLY = 120;

/** Solar: 1 kW produces approx this many kWh/month in India */
export const SOLAR_KWH_PER_KW_MONTHLY = 120;

/** Default cooking fuel type */
export const DEFAULT_COOKING_FUEL = 'lpg';

/** Default food waste level */
export const DEFAULT_FOOD_WASTE_LEVEL = 'MODERATE';

/** Default dining out meals per week */
export const DEFAULT_DINING_OUT_WEEKLY = 1;

/** Minimum waste emission floor (kg CO2/year) */
export const MIN_WASTE_EMISSION_KG = 25;

/** Minimum waste emission per day in rural areas (kg) */
export const MIN_DAILY_WASTE_KG = 0.12;

/** App version */
export const APP_VERSION = '2.2.0';

/** Calculator version for metadata */
export const CALCULATOR_VERSION = '2.2.0';