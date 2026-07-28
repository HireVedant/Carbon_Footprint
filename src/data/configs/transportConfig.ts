/**
 * Transport configuration for the assessment UI.
 * Simplified, user-friendly vehicle categories based on ARAI/BEE emission data.
 * Each entry maps to one or more vehicleDataset keys with a weighted average emission factor.
 */

export interface TransportModeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Grouping for display */
  group: 'personal' | 'public';
  /** Maps to vehicleDataset keys for emission calculation */
  vehicleKeys: string[];
  /** Weighted average emission factor (kg CO2/km) computed from vehicleKeys */
  defaultEmissionFactorKgCO2PerKm: number;
  /** Default km/day for quick estimation */
  defaultDailyKm: number;
  /** Whether occupancy is relevant */
  supportsOccupancy: boolean;
}

/**
 * Simplified transport modes replacing the overly detailed vehicle class list.
 * Users choose a general category; the engine uses representative emission factors.
 */
export const TRANSPORT_MODES: TransportModeOption[] = [
  {
    id: 'car_petrol',
    label: 'Car (Petrol/Diesel)',
    icon: '🚗',
    description: 'Hatchback, Sedan, or SUV running on petrol or diesel',
    group: 'personal',
    vehicleKeys: ['car_hatchback_petrol', 'car_sedan_petrol', 'car_suv_petrol', 'car_hatchback_diesel', 'car_suv_diesel'],
    defaultEmissionFactorKgCO2PerKm: 0.152,
    defaultDailyKm: 25,
    supportsOccupancy: true,
  },
  {
    id: 'car_cng',
    label: 'Car (CNG)',
    icon: '🚙',
    description: 'Factory-fitted CNG vehicle',
    group: 'personal',
    vehicleKeys: ['car_cng'],
    defaultEmissionFactorKgCO2PerKm: 0.098,
    defaultDailyKm: 25,
    supportsOccupancy: true,
  },
  {
    id: 'ev_car',
    label: 'Electric Car',
    icon: '⚡',
    description: 'Battery electric vehicle (BEV)',
    group: 'personal',
    vehicleKeys: ['car_electric'],
    defaultEmissionFactorKgCO2PerKm: 0.095,
    defaultDailyKm: 25,
    supportsOccupancy: true,
  },
  {
    id: 'two_wheeler_petrol',
    label: 'Two-Wheeler (Petrol)',
    icon: '🏍️',
    description: 'Scooter or motorcycle running on petrol',
    group: 'personal',
    vehicleKeys: ['bike_scooter_petrol', 'bike_commuter_petrol', 'bike_performance_petrol'],
    defaultEmissionFactorKgCO2PerKm: 0.055,
    defaultDailyKm: 15,
    supportsOccupancy: false,
  },
  {
    id: 'two_wheeler_electric',
    label: 'Electric Two-Wheeler',
    icon: '🔋',
    description: 'Electric scooter or motorcycle',
    group: 'personal',
    vehicleKeys: ['bike_electric'],
    defaultEmissionFactorKgCO2PerKm: 0.024,
    defaultDailyKm: 15,
    supportsOccupancy: false,
  },
];

export interface PublicTransitModeOption {
  id: string;
  label: string;
  icon: string;
  weeklyKmKey: string;
  emissionFactorKgCO2PerKm: number;
}

export const PUBLIC_TRANSIT_MODES: PublicTransitModeOption[] = [
  { id: 'metro', label: 'Metro', icon: '🚇', weeklyKmKey: 'metroKmWeekly', emissionFactorKgCO2PerKm: 0.035 },
  { id: 'suburban_train', label: 'Local Train', icon: '🚆', weeklyKmKey: 'suburbanTrainKmWeekly', emissionFactorKgCO2PerKm: 0.042 },
  { id: 'bus', label: 'City Bus', icon: '🚌', weeklyKmKey: 'busKmWeekly', emissionFactorKgCO2PerKm: 0.068 },
  { id: 'auto', label: 'Auto Rickshaw', icon: '🛺', weeklyKmKey: 'autoKmWeekly', emissionFactorKgCO2PerKm: 0.092 },
  { id: 'taxi', label: 'Taxi / Ride-Hail', icon: '🚕', weeklyKmKey: 'taxiKmWeekly', emissionFactorKgCO2PerKm: 0.145 },
];

/**
 * A user-entered transport entry.
 * Stored in answers.transportEntries.
 */
export interface TransportEntry {
  modeId: string;
  dailyKm: number;
  occupancy: number; // Only relevant for cars
  label: string; // User-friendly label for display
}