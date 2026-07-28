/**
 * EcoTrack AI — Environmental Equivalent Provider
 *
 * Computes Indian-contextual environmental equivalents dynamically from
 * CO₂ emission values. Every equivalence originates from government or
 * research-backed datasets. Zero hardcoding inside components.
 *
 * Source attributions:
 * - LPG cylinder: MoPNG (14.2 kg net, ~2.988 kg CO₂/kg LPG ≈ 42.4 kg CO₂/cylinder)
 * - Indian household electricity: BEE average ~120 kWh/month × CEA grid factor
 * - Metro trips: DMRC / BEST energy audit data
 * - Petrol consumed: ARAI emission factor (2.37 kg CO₂/litre)
 * - Delhi–Mumbai flight: ICAO Carbon Emissions Calculator
 * - Pune–Mumbai drive: ARAI average car factor
 * - MSRTC trips: Maharashtra state bus emission data
 * - Tree plantation: FSI India (~22 kg CO₂/tree/year absorption)
 * - Rice production: ICAR emission factor for paddy cultivation
 * - Solar units: MNRE average generation (4 kWh/kWp/day in India)
 *
 * @module data/providers/EnvironmentalEquivalentProvider
 */

import type {
  IEnvironmentalEquivalentProvider,
  EnvironmentalEquivalent,
  EnvironmentalEquivalentsSet,
  DatasetMetadata,
  ProviderResponse,
} from '../../types/dataProviders';

// ── Government Dataset Constants ────────────────────────────────────────────
// Every constant below is attributed to a named source.

/** LPG cylinder CO₂ content: 14.2 kg net weight × 2.988 kg CO₂/kg LPG ≈ 42.4 kg CO₂.
 *  Source: Ministry of Petroleum & Natural Gas (MoPNG), India. */
const LPG_KG_CO2_PER_CYLINDER = 42.4;

/** Indian household average electricity: 120 kWh/month.
 *  Source: BEE (Bureau of Energy Efficiency) Household Consumption Survey. */
const INDIAN_HOUSEHOLD_MONTHLY_KWH = 120;

/** CEA national average grid emission factor.
 *  Source: Central Electricity Authority (CEA), India. */
const CEA_GRID_FACTOR = 0.716;

/** Metro trip average distance: 15 km one-way (typical Indian metro commute).
 *  Source: DMRC / Pune Metro ridership data. */
const AVERAGE_METRO_TRIP_KM = 15;

/** Metro emission factor: 0.035 kg CO₂ per passenger-km.
 *  Source: DMRC Energy Audit Report, CPCB Urban Transport Data. */
const METRO_FACTOR_KG_CO2_PER_KM = 0.035;

/** Petrol emission factor: 2.37 kg CO₂ per litre.
 *  Source: ARAI (Automotive Research Association of India), MoEFCC. */
const PETROL_FACTOR_KG_CO2_PER_LITRE = 2.37;

/** Average car fuel economy in India: 15 km/litre.
 *  Source: ARAI Corporate Average Fuel Economy (CAFE) data. */
const AVERAGE_CAR_KM_PER_LITRE = 15;

/** Delhi–Mumbai flight distance: 1,190 km (ICAO Great Circle).
 *  Source: ICAO Carbon Emissions Calculator. */
const DELHI_MUMBAI_FLIGHT_KM = 1190;

/** Flight emission factor economy class: 0.150 kg CO₂ per passenger-km.
 *  Source: ICAO Carbon Emissions Calculator, 2024. */
const FLIGHT_FACTOR_ECONOMY_KG_CO2_PER_KM = 0.150;

/** Pune–Mumbai distance by road: 150 km.
 *  Source: NHAI official route data. */
const PUNE_MUMBAI_ROAD_KM = 150;

/** Average car emission factor for Indian road conditions: 0.17 kg CO₂/km.
 *  Source: ARAI emission testing standards. */
const INDIAN_CAR_FACTOR_KG_CO2_PER_KM = 0.17;

/** MSRTC bus trip average distance: 100 km (intercity average).
 *  Source: Maharashtra State Road Transport Corporation. */
const MSRTC_TRIP_KM = 100;

/** MSRTC bus emission factor: 0.065 kg CO₂ per passenger-km.
 *  Source: MSRTC Energy Efficiency Report, CPCB. */
const MSRTC_FACTOR_KG_CO2_PER_KM = 0.065;

/** CO₂ absorption by a mature Indian tree: 22 kg CO₂ per year.
 *  Source: FSI (Forest Survey of India), MoEFCC. */
const TREE_ANNUAL_ABSORPTION_KG = 22;

/** CO₂ emitted per kg of rice (paddy) production: 2.7 kg CO₂/kg rice.
 *  Source: ICAR (Indian Council of Agricultural Research), Life Cycle Assessment. */
const RICE_PRODUCTION_KG_CO2_PER_KG = 2.7;

/** 1 kWp solar system average daily generation in India: 4 kWh/day.
 *  Source: MNRE (Ministry of New and Renewable Energy). */
const SOLAR_DAILY_KWH_PER_KWP = 4;

// ── Provider Metadata ──────────────────────────────────────────────────────

const PROVIDER_METADATA: DatasetMetadata = {
  source: 'EcoTrack AI Environmental Equivalents Engine',
  sourceUrl: 'https://ecotrack.ai/methodology/equivalents',
  lastUpdated: '2026-01-15',
  confidence: 'high',
  units: 'varies per equivalent',
  license: 'Open Data — Government of India datasets',
  methodology:
    'All equivalents derived from government-sourced emission factors (CEA, ARAI, MoPNG, MNRE, ICAR, CPCB, FSI) ' +
    'applied to average Indian consumption patterns. Values update dynamically with input CO₂ tonnage.',
};

// ── Provider Implementation ────────────────────────────────────────────────

class EnvironmentalEquivalentProviderImpl implements IEnvironmentalEquivalentProvider {

  getMetadata(): DatasetMetadata {
    return PROVIDER_METADATA;
  }

  computeEquivalents(totalKgCO2PerYear: number): ProviderResponse<EnvironmentalEquivalentsSet> {
    const safeKg = Math.max(0, totalKgCO2PerYear);

    const equivalents: EnvironmentalEquivalent[] = [
      this.buildLPGCylinders(safeKg),
      this.buildHouseholdElectricity(safeKg),
      this.buildMetroTrips(safeKg),
      this.buildPetrolConsumed(safeKg),
      this.buildDelhiMumbaiFlights(safeKg),
      this.buildPuneMumbaiDrives(safeKg),
      this.buildMSRTCTrips(safeKg),
      this.buildTreePlantation(safeKg),
      this.buildRiceProduction(safeKg),
      this.buildSolarUnits(safeKg),
    ];

    return {
      metadata: PROVIDER_METADATA,
      data: {
        totalTonnesCO2: safeKg / 1000,
        equivalents,
      },
    };
  }

  getEquivalent(id: string, totalKgCO2PerYear: number): EnvironmentalEquivalent | null {
    const result = this.computeEquivalents(totalKgCO2PerYear);
    return result.data.equivalents.find(e => e.id === id) ?? null;
  }

  // ── Individual Equivalent Builders ──────────────────────────────────────

  private buildLPGCylinders(kg: number): EnvironmentalEquivalent {
    const value = kg / LPG_KG_CO2_PER_CYLINDER;
    return {
      id: 'lpg_cylinders',
      label: 'LPG Cylinders',
      value: value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString('en-IN'),
      unit: 'cylinders',
      description: `Equivalent to ${value.toFixed(1)} domestic LPG cylinders (14.2 kg each) used for cooking in an Indian household.`,
      source: 'MoPNG — Ministry of Petroleum & Natural Gas, India',
      iconName: 'Flame',
      colorClass: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
      formula: `${kg} kg CO₂ ÷ ${LPG_KG_CO2_PER_CYLINDER} kg CO₂/cylinder`,
    };
  }

  private buildHouseholdElectricity(kg: number): EnvironmentalEquivalent {
    const kwhEquiv = kg / CEA_GRID_FACTOR;
    const months = kwhEquiv / INDIAN_HOUSEHOLD_MONTHLY_KWH;
    const value = Math.round(months);
    return {
      id: 'household_electricity',
      label: 'Indian Household Electricity',
      value: value.toLocaleString('en-IN'),
      unit: 'household-months',
      description: `Equivalent to the electricity consumed by ${value} average Indian household${value !== 1 ? 's' : ''} in one month (${INDIAN_HOUSEHOLD_MONTHLY_KWH} kWh/month baseline).`,
      source: 'CEA (Central Electricity Authority), BEE Household Survey',
      iconName: 'Zap',
      colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      formula: `${kg} kg CO₂ ÷ ${CEA_GRID_FACTOR} kg/kWh ÷ ${INDIAN_HOUSEHOLD_MONTHLY_KWH} kWh/month`,
    };
  }

  private buildMetroTrips(kg: number): EnvironmentalEquivalent {
    const tripEmissionKg = AVERAGE_METRO_TRIP_KM * METRO_FACTOR_KG_CO2_PER_KM;
    const value = Math.round(kg / tripEmissionKg);
    return {
      id: 'metro_trips',
      label: 'Metro Trips',
      value: value.toLocaleString('en-IN'),
      unit: 'trips',
      description: `Equivalent to ${value.toLocaleString('en-IN')} one-way metro trips (${AVERAGE_METRO_TRIP_KM} km average commute in Delhi/Pune/Mumbai metro).`,
      source: 'DMRC Energy Audit, Pune Metro, CPCB Urban Transport Data',
      iconName: 'Train',
      colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
      formula: `${kg} kg CO₂ ÷ (${AVERAGE_METRO_TRIP_KM} km × ${METRO_FACTOR_KG_CO2_PER_KM} kg/km)`,
    };
  }

  private buildPetrolConsumed(kg: number): EnvironmentalEquivalent {
    const litres = kg / PETROL_FACTOR_KG_CO2_PER_LITRE;
    const value: string = litres < 10 ? litres.toFixed(1) : Math.round(litres).toLocaleString('en-IN');
    return {
      id: 'petrol_consumed',
      label: 'Petrol Consumed',
      value,
      unit: 'litres',
      description: `Equivalent to burning ${value} litres of petrol in a vehicle (Indian average pump price baseline).`,
      source: 'ARAI (Automotive Research Association of India), MoEFCC',
      iconName: 'Fuel',
      colorClass: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
      formula: `${kg} kg CO₂ ÷ ${PETROL_FACTOR_KG_CO2_PER_LITRE} kg/litre`,
    };
  }

  private buildDelhiMumbaiFlights(kg: number): EnvironmentalEquivalent {
    const flightEmissionKg = DELHI_MUMBAI_FLIGHT_KM * FLIGHT_FACTOR_ECONOMY_KG_CO2_PER_KM;
    const value = (kg / flightEmissionKg).toFixed(1);
    return {
      id: 'delhi_mumbai_flights',
      label: 'Delhi–Mumbai Flights',
      value,
      unit: 'one-way flights',
      description: `Equivalent to ${value} one-way economy flights from Delhi to Mumbai (${DELHI_MUMBAI_FLIGHT_KM} km).`,
      source: 'ICAO Carbon Emissions Calculator',
      iconName: 'Plane',
      colorClass: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
      formula: `${kg} kg CO₂ ÷ (${DELHI_MUMBAI_FLIGHT_KM} km × ${FLIGHT_FACTOR_ECONOMY_KG_CO2_PER_KM} kg/km)`,
    };
  }

  private buildPuneMumbaiDrives(kg: number): EnvironmentalEquivalent {
    const driveEmissionKg = PUNE_MUMBAI_ROAD_KM * INDIAN_CAR_FACTOR_KG_CO2_PER_KM;
    const value = (kg / driveEmissionKg).toFixed(1);
    return {
      id: 'pune_mumbai_drives',
      label: 'Pune–Mumbai Drives',
      value,
      unit: 'one-way drives',
      description: `Equivalent to ${value} one-way drives from Pune to Mumbai (${PUNE_MUMBAI_ROAD_KM} km by car).`,
      source: 'NHAI Route Data, ARAI Car Emission Factors',
      iconName: 'Car',
      colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      formula: `${kg} kg CO₂ ÷ (${PUNE_MUMBAI_ROAD_KM} km × ${INDIAN_CAR_FACTOR_KG_CO2_PER_KM} kg/km)`,
    };
  }

  private buildMSRTCTrips(kg: number): EnvironmentalEquivalent {
    const tripEmissionKg = MSRTC_TRIP_KM * MSRTC_FACTOR_KG_CO2_PER_KM;
    const value = Math.round(kg / tripEmissionKg);
    return {
      id: 'msrtc_trips',
      label: 'MSRTC Bus Trips',
      value: value.toLocaleString('en-IN'),
      unit: 'intercity trips',
      description: `Equivalent to ${value.toLocaleString('en-IN')} MSRTC intercity bus trips (${MSRTC_TRIP_KM} km average distance).`,
      source: 'MSRTC Energy Efficiency Report, CPCB',
      iconName: 'Bus',
      colorClass: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
      formula: `${kg} kg CO₂ ÷ (${MSRTC_TRIP_KM} km × ${MSRTC_FACTOR_KG_CO2_PER_KM} kg/km)`,
    };
  }

  private buildTreePlantation(kg: number): EnvironmentalEquivalent {
    const value = Math.round(kg / TREE_ANNUAL_ABSORPTION_KG);
    return {
      id: 'tree_plantation',
      label: 'Tree Plantation',
      value: value.toLocaleString('en-IN'),
      unit: 'mature trees',
      description: `Requires ${value.toLocaleString('en-IN')} mature Indian trees (native species) growing for one year to absorb this amount of CO₂.`,
      source: 'Forest Survey of India (FSI), MoEFCC',
      iconName: 'TreePine',
      colorClass: 'text-green-400 border-green-500/20 bg-green-500/5',
      formula: `${kg} kg CO₂ ÷ ${TREE_ANNUAL_ABSORPTION_KG} kg/tree/year`,
    };
  }

  private buildRiceProduction(kg: number): EnvironmentalEquivalent {
    const value = Math.round(kg / RICE_PRODUCTION_KG_CO2_PER_KG);
    return {
      id: 'rice_production',
      label: 'Rice Production',
      value: value.toLocaleString('en-IN'),
      unit: 'kg of rice',
      description: `Equivalent to the CO₂ emitted from producing ${value.toLocaleString('en-IN')} kg of rice (paddy cultivation lifecycle).`,
      source: 'ICAR (Indian Council of Agricultural Research), Life Cycle Assessment',
      iconName: 'Wheat',
      colorClass: 'text-lime-400 border-lime-500/20 bg-lime-500/5',
      formula: `${kg} kg CO₂ ÷ ${RICE_PRODUCTION_KG_CO2_PER_KG} kg CO₂/kg rice`,
    };
  }

  private buildSolarUnits(kg: number): EnvironmentalEquivalent {
    const kwhEquiv = kg / CEA_GRID_FACTOR;
    const solarDays = kwhEquiv / SOLAR_DAILY_KWH_PER_KWP;
    const value = Math.round(solarDays);
    return {
      id: 'solar_units',
      label: 'Solar Energy Generated',
      value: value.toLocaleString('en-IN'),
      unit: 'solar-kWh-days',
      description: `Equivalent to the electricity a 1 kWp rooftop solar system would generate in ${value.toLocaleString('en-IN')} days under Indian conditions (${SOLAR_DAILY_KWH_PER_KWP} kWh/kWp/day average).`,
      source: 'MNRE (Ministry of New and Renewable Energy), India',
      iconName: 'Sun',
      colorClass: 'text-yellow-300 border-yellow-400/20 bg-yellow-400/5',
      formula: `${kg} kg CO₂ ÷ ${CEA_GRID_FACTOR} kg/kWh ÷ ${SOLAR_DAILY_KWH_PER_KWP} kWh/kWp/day`,
    };
  }
}

// ── Singleton Export ────────────────────────────────────────────────────────

/** Singleton instance of the Environmental Equivalent Provider. */
export const EnvironmentalEquivalentProvider: IEnvironmentalEquivalentProvider =
  new EnvironmentalEquivalentProviderImpl();

export default EnvironmentalEquivalentProvider;