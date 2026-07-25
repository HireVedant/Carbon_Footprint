/**
 * ARAI (Automotive Research Association of India) & BEE Emission Datasets
 * Units: kg CO2e / km
 */

export interface VehicleCategory {
  type: 'CAR' | 'TWO_WHEELER';
  classId: string;
  className: string;
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC';
  averageKmPerLiterOrKWh: number;
  emissionFactorKgCO2PerKm: number;
  examples: string[];
}

export interface VehicleDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  units: string;
  assumptions: string[];
  vehicleCategories: Record<string, VehicleCategory>;
}

export const vehicleDataset: VehicleDataset = {
  datasetVersion: 'ARAI-BEE-2026.1',
  source: 'Automotive Research Association of India (ARAI) & BEE Fuel Economy Ratings',
  publicationDate: '2024-11-15',
  updateDate: '2026-01-10',
  units: 'kg CO2e / km',
  assumptions: [
    'Direct tailpipe CO2 emission values from ARAI test cycles',
    'CNG factor includes well-to-wheel compression energy',
    'EV emissions calculated using national average grid factor (0.716 kg CO2/kWh) unless state-specific grid factor is passed'
  ],
  vehicleCategories: {
    // CARS - PETROL
    'car_hatchback_petrol': {
      type: 'CAR',
      classId: 'car_hatchback_petrol',
      className: 'Compact Hatchback (Petrol)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 18.5,
      emissionFactorKgCO2PerKm: 0.125,
      examples: ['Maruti Swift', 'Hyundai i10', 'Tata Tiago', 'Wagon R']
    },
    'car_sedan_petrol': {
      type: 'CAR',
      classId: 'car_sedan_petrol',
      className: 'Executive Sedan (Petrol)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 15.0,
      emissionFactorKgCO2PerKm: 0.154,
      examples: ['Honda City', 'Hyundai Verna', 'Maruti Dzire', 'Skoda Slavia']
    },
    'car_suv_petrol': {
      type: 'CAR',
      classId: 'car_suv_petrol',
      className: 'Compact / Mid SUV (Petrol)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 12.5,
      emissionFactorKgCO2PerKm: 0.185,
      examples: ['Hyundai Creta', 'Kia Seltos', 'Tata Nexon', 'Mahindra XUV700']
    },

    // CARS - DIESEL
    'car_hatchback_diesel': {
      type: 'CAR',
      classId: 'car_hatchback_diesel',
      className: 'Compact Hatchback (Diesel)',
      fuelType: 'DIESEL',
      averageKmPerLiterOrKWh: 22.0,
      emissionFactorKgCO2PerKm: 0.120,
      examples: ['Altroz Diesel', 'i20 Diesel']
    },
    'car_suv_diesel': {
      type: 'CAR',
      classId: 'car_suv_diesel',
      className: 'Mid / Premium SUV (Diesel)',
      fuelType: 'DIESEL',
      averageKmPerLiterOrKWh: 13.5,
      emissionFactorKgCO2PerKm: 0.198,
      examples: ['Mahindra Thar', 'Scorpio-N', 'Tata Harrier', 'Toyota Fortuner']
    },

    // CARS - CNG
    'car_cng': {
      type: 'CAR',
      classId: 'car_cng',
      className: 'CNG Vehicle (Factory Fitted)',
      fuelType: 'CNG',
      averageKmPerLiterOrKWh: 26.0, // km/kg
      emissionFactorKgCO2PerKm: 0.098,
      examples: ['Maruti Ertiga CNG', 'Tata Punch iCNG', 'Hyundai Aura CNG']
    },

    // CARS - ELECTRIC
    'car_electric': {
      type: 'CAR',
      classId: 'car_electric',
      className: 'Electric Car (EV)',
      fuelType: 'ELECTRIC',
      averageKmPerLiterOrKWh: 7.5, // km/kWh
      emissionFactorKgCO2PerKm: 0.095, // Based on national grid average
      examples: ['Tata Nexon EV', 'MG ZS EV', 'Mahindra XUV400', 'BYD Atto 3']
    },

    // TWO-WHEELERS
    'bike_scooter_petrol': {
      type: 'TWO_WHEELER',
      classId: 'bike_scooter_petrol',
      className: 'Automatic Scooter (110-125cc)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 45.0,
      emissionFactorKgCO2PerKm: 0.051,
      examples: ['Honda Activa', 'TVS Jupiter', 'Suzuki Access', 'Hero Maestro']
    },
    'bike_commuter_petrol': {
      type: 'TWO_WHEELER',
      classId: 'bike_commuter_petrol',
      className: 'Commuter Motorcycle (100-150cc)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 55.0,
      emissionFactorKgCO2PerKm: 0.042,
      examples: ['Hero Splendor', 'Honda Shine', 'Bajaj Pulsar 125', 'TVS Raider']
    },
    'bike_performance_petrol': {
      type: 'TWO_WHEELER',
      classId: 'bike_performance_petrol',
      className: 'Performance / Cruiser Bike (200cc+)',
      fuelType: 'PETROL',
      averageKmPerLiterOrKWh: 30.0,
      emissionFactorKgCO2PerKm: 0.077,
      examples: ['Royal Enfield Classic 350', 'KTM Duke', 'Dominar 400', 'Java 42']
    },
    'bike_electric': {
      type: 'TWO_WHEELER',
      classId: 'bike_electric',
      className: 'Electric Two-Wheeler (EV)',
      fuelType: 'ELECTRIC',
      averageKmPerLiterOrKWh: 30.0, // km/kWh
      emissionFactorKgCO2PerKm: 0.024,
      examples: ['Ola S1 Pro', 'Ather 450X', 'TVS iQube', 'Bajaj Chetak EV']
    }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'transport_vehicles',
  displayName: 'ARAI/BEE Vehicle Emission Benchmarks',
  version: vehicleDataset.datasetVersion,
  source: vehicleDataset.source,
  publicationDate: vehicleDataset.publicationDate,
  updateDate: vehicleDataset.updateDate,
  units: vehicleDataset.units,
  category: 'TRANSPORT_VEHICLES',
  status: 'active',
  description: 'Tailpipe CO₂ emission factors for Indian passenger vehicles by class and fuel type.',
  assumptions: vehicleDataset.assumptions,
  license: 'Public Domain (Government of India Open Data)',
  data: vehicleDataset,
});
