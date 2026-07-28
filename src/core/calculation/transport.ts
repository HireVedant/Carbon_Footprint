/**
 * Transport Emission Calculator
 * Calculates CO2 emissions from personal vehicles, public transit, and aviation.
 *
 * Sources:
 * - ARAI (Automotive Research Association of India) emission factors
 * - ICAO (International Civil Aviation Organization) carbon calculator
 * - CEA (Central Electricity Authority) for EV grid factors
 *
 * @module core/calculation/transport
 */

import { vehicleDataset, calculateFlightEmission, transitDataset } from '../../data/datasets';
import { TRANSPORT_MODES, TransportEntry } from '../../data/configs/transportConfig';
import type { FlightTripInput, PublicTransitModes } from '../../types/assessment';

/**
 * Calculate transport emission from multi-entry system.
 * Each entry uses its mode's emission factor × daily km × 365 / occupancy.
 *
 * @param entries - Array of transport mode entries from the user
 * @param gridFactor - State grid emission factor for EV calculations (kg CO2/kWh)
 * @returns Annual CO2 emission in kg
 */
export function calculateMultiTransportEmission(
  entries: TransportEntry[],
  gridFactor: number = 0.82
): number {
  let total = 0;
  for (const entry of entries) {
    const mode = TRANSPORT_MODES.find(m => m.id === entry.modeId);
    if (!mode) continue;

    const dailyKm = Math.max(0, entry.dailyKm || 0);
    const occupancy = Math.max(1, entry.occupancy || 1);

    // For EVs, adjust emission factor based on state grid factor
    let emissionFactor = mode.defaultEmissionFactorKgCO2PerKm;
    if (mode.id === 'ev_car' || mode.id === 'two_wheeler_electric') {
      // Electric vehicles use grid factor; adjust proportionally
      // Default factor assumes ~0.82 kg/kWh national avg; scale to actual state grid
      emissionFactor = emissionFactor * (gridFactor / 0.82);
    }

    total += (dailyKm * 365 * emissionFactor) / occupancy;
  }
  return total;
}

/**
 * Calculate transport emission from legacy single-vehicle system.
 * Maintained for backward compatibility with older assessment data.
 *
 * @param vehicleCategoryKey - Key into vehicleDataset.vehicleCategories
 * @param dailyKm - Daily distance in km
 * @param occupancy - Number of passengers (driver + passengers)
 * @param gridFactor - State grid factor for EV calculations
 * @returns Annual CO2 emission in kg
 */
export function calculateLegacyVehicleEmission(
  vehicleCategoryKey: string,
  dailyKm: number,
  occupancy: number,
  gridFactor: number
): number {
  const vCat = vehicleDataset.vehicleCategories[vehicleCategoryKey];
  if (!vCat) return 0;

  const safeDailyKm = Math.max(0, dailyKm || 25);
  const safeOccupancy = Math.max(1, occupancy || 1);

  let kmFactor = vCat.emissionFactorKgCO2PerKm;
  if (vCat.fuelType === 'ELECTRIC') {
    kmFactor = (1 / vCat.averageKmPerLiterOrKWh) * gridFactor;
  }

  return (safeDailyKm * 365 * kmFactor) / safeOccupancy;
}

/**
 * Calculate total aviation emission for all flight trips.
 * Uses ICAO Haversine distance-based calculation.
 *
 * @param flights - Array of flight trip inputs
 * @returns Annual CO2 emission in kg from aviation
 */
export function calculateAviationEmission(flights: FlightTripInput[]): number {
  let total = 0;
  for (const flight of flights) {
    const res = calculateFlightEmission(
      flight.depIata,
      flight.arrIata,
      flight.cabinClass,
      flight.isRoundTrip,
      flight.tripsPerYear
    );
    total += res.totalEmissionKgCO2;
  }
  return total;
}

/**
 * Calculate public transit emission across all modes.
 *
 * @param modes - Public transit mode usage (weekly km for each mode)
 * @returns Annual CO2 emission in kg from public transit
 */
export function calculatePublicTransitEmission(modes: PublicTransitModes): number {
  let total = 0;
  if (modes.metroKmWeekly)
    total += modes.metroKmWeekly * 52 * transitDataset.modes.metro.emissionFactorKgCO2PerKm;
  if (modes.suburbanTrainKmWeekly)
    total += modes.suburbanTrainKmWeekly * 52 * transitDataset.modes.suburban_train.emissionFactorKgCO2PerKm;
  if (modes.busKmWeekly)
    total += modes.busKmWeekly * 52 * transitDataset.modes.bus_diesel.emissionFactorKgCO2PerKm;
  if (modes.autoKmWeekly)
    total += modes.autoKmWeekly * 52 * transitDataset.modes.auto_cng.emissionFactorKgCO2PerKm;
  if (modes.taxiKmWeekly)
    total += modes.taxiKmWeekly * 52 * transitDataset.modes.taxi_cng.emissionFactorKgCO2PerKm;
  return total;
}

/**
 * Calculate total transport sector emission.
 * Combines personal vehicles, aviation, and public transit.
 *
 * @param params - All transport-related assessment answers
 * @param gridFactor - State grid emission factor
 * @returns Total annual transport CO2 emission in kg
 */
export function calculateTotalTransportEmission(params: {
  transportEntries?: TransportEntry[];
  ownsVehicle?: boolean;
  vehicleCategoryKey?: string;
  dailyVehicleKm?: number;
  vehicleOccupancy?: number;
  flightDetails?: FlightTripInput[];
  publicTransitModes?: PublicTransitModes;
}, gridFactor: number): number {
  // Multi-entry transport (preferred)
  let vehicleEmission = 0;
  if (params.transportEntries && params.transportEntries.length > 0) {
    vehicleEmission = calculateMultiTransportEmission(params.transportEntries, gridFactor);
  }
  // Legacy single vehicle (backward compat)
  else if (params.ownsVehicle && params.vehicleCategoryKey) {
    vehicleEmission = calculateLegacyVehicleEmission(
      params.vehicleCategoryKey,
      params.dailyVehicleKm || 25,
      params.vehicleOccupancy || 1,
      gridFactor
    );
  }

  const flightEmission = params.flightDetails
    ? calculateAviationEmission(params.flightDetails)
    : 0;

  const transitEmission = params.publicTransitModes
    ? calculatePublicTransitEmission(params.publicTransitModes)
    : 0;

  return vehicleEmission + flightEmission + transitEmission;
}

/**
 * Get sub-breakdown for transport sector.
 */
export function getTransportSubBreakdown(params: {
  transportEntries?: TransportEntry[];
  ownsVehicle?: boolean;
  vehicleCategoryKey?: string;
  dailyVehicleKm?: number;
  vehicleOccupancy?: number;
  flightDetails?: FlightTripInput[];
  publicTransitModes?: PublicTransitModes;
}, gridFactor: number) {
  let vehicles = 0;
  if (params.transportEntries && params.transportEntries.length > 0) {
    vehicles = calculateMultiTransportEmission(params.transportEntries, gridFactor);
  } else if (params.ownsVehicle && params.vehicleCategoryKey) {
    vehicles = calculateLegacyVehicleEmission(
      params.vehicleCategoryKey,
      params.dailyVehicleKm || 25,
      params.vehicleOccupancy || 1,
      gridFactor
    );
  }

  return {
    vehicles: Math.round(vehicles),
    flights: Math.round(params.flightDetails ? calculateAviationEmission(params.flightDetails) : 0),
    publicTransit: Math.round(params.publicTransitModes ? calculatePublicTransitEmission(params.publicTransitModes) : 0),
  };
}