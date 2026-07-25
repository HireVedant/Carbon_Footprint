/**
 * Indian Public Transport Emission Factors Dataset
 * Source: MoHUA (Ministry of Housing and Urban Affairs) & TERI Reports
 * Units: kg CO2e / passenger-km
 */

export interface TransitModeEntry {
  id: string;
  name: string;
  category: 'METRO' | 'SUBURBAN_RAIL' | 'BUS' | 'AUTO_RICKSHAW' | 'TAXI';
  emissionFactorKgCO2PerKm: number;
  description: string;
}

export interface TransitDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  units: string;
  assumptions: string[];
  modes: Record<string, TransitModeEntry>;
}

export const transitDataset: TransitDataset = {
  datasetVersion: 'MOHUA-TERI-2026.1',
  source: 'Ministry of Housing and Urban Affairs & TERI Urban Mobility Index',
  publicationDate: '2024-09-10',
  updateDate: '2026-01-10',
  units: 'kg CO2e / passenger-km',
  assumptions: [
    'Metro emissions calculated from grid power draw per passenger-km at 70% average capacity',
    'Suburban rail emissions based on Indian Railways traction power mix',
    'Bus emissions account for average urban occupancy (35 passengers/bus)'
  ],
  modes: {
    'metro': {
      id: 'metro',
      name: 'Metro Rail (Delhi, Mumbai, Namma Metro, Kolkata, etc.)',
      category: 'METRO',
      emissionFactorKgCO2PerKm: 0.028,
      description: 'Zero direct tailpipe, high efficiency electric traction'
    },
    'suburban_train': {
      id: 'suburban_train',
      name: 'Suburban / Local Train (Mumbai Local, Kolkata Suburban, etc.)',
      category: 'SUBURBAN_RAIL',
      emissionFactorKgCO2PerKm: 0.022,
      description: 'High passenger capacity mass rapid transit'
    },
    'bus_diesel': {
      id: 'bus_diesel',
      name: 'City Bus (Diesel Non-AC)',
      category: 'BUS',
      emissionFactorKgCO2PerKm: 0.045,
      description: 'Standard municipal city transport'
    },
    'bus_electric': {
      id: 'bus_electric',
      name: 'City Bus (Electric e-Bus)',
      category: 'BUS',
      emissionFactorKgCO2PerKm: 0.018,
      description: 'Grid-powered zero tailpipe municipal electric bus'
    },
    'auto_cng': {
      id: 'auto_cng',
      name: 'Auto Rickshaw (CNG)',
      category: 'AUTO_RICKSHAW',
      emissionFactorKgCO2PerKm: 0.048,
      description: 'Shared/solo 3-wheeler CNG transit'
    },
    'auto_ev': {
      id: 'auto_ev',
      name: 'Electric Auto Rickshaw (e-Rickshaw)',
      category: 'AUTO_RICKSHAW',
      emissionFactorKgCO2PerKm: 0.015,
      description: 'Battery powered 3-wheeler last mile transit'
    },
    'taxi_cng': {
      id: 'taxi_cng',
      name: 'Ride-Hailing / Taxi (CNG / Petrol)',
      category: 'TAXI',
      emissionFactorKgCO2PerKm: 0.092,
      description: 'Cab services (Ola, Uber, local taxis)'
    }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'transport_public',
  displayName: 'MoHUA/TERI Public Transit Emission Factors',
  version: transitDataset.datasetVersion,
  source: transitDataset.source,
  publicationDate: transitDataset.publicationDate,
  updateDate: transitDataset.updateDate,
  units: transitDataset.units,
  category: 'TRANSPORT_PUBLIC',
  status: 'active',
  description: 'Emission factors per passenger-km for metro, suburban rail, bus, auto, and taxi modes in India.',
  assumptions: transitDataset.assumptions,
  license: 'Public Domain (Government of India Open Data)',
  data: transitDataset,
});
