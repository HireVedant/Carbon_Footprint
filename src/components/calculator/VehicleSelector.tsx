import React from 'react';
import { vehicleDataset, VehicleCategory } from '../../data/datasets/transport/vehicles';
import { Car, Bike } from 'lucide-react';

interface VehicleSelectorProps {
  ownsVehicle: boolean;
  vehicleCategoryKey: string;
  dailyVehicleKm: number;
  vehicleOccupancy: number;
  onOwnershipChange: (owns: boolean) => void;
  onChange: (updates: { vehicleCategoryKey?: string; dailyVehicleKm?: number; vehicleOccupancy?: number }) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  ownsVehicle,
  vehicleCategoryKey,
  dailyVehicleKm,
  vehicleOccupancy,
  onOwnershipChange,
  onChange
}) => {
  const categories = vehicleDataset.vehicleCategories;
  const carCategories = Object.entries(categories).filter(([, v]) => v.type === 'CAR');
  const bikeCategories = Object.entries(categories).filter(([, v]) => v.type === 'TWO_WHEELER');
  const selectedCategory = categories[vehicleCategoryKey];

  // Calculate annual emission preview
  const annualEmission = selectedCategory && ownsVehicle
    ? Math.round(dailyVehicleKm * 365 * selectedCategory.emissionFactorKgCO2PerKm / Math.max(1, vehicleOccupancy))
    : 0;

  return (
    <div className="surface-matte space-y-5 p-6 rounded-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Personal Vehicle</h3>
            <p className="text-xs text-dark-500">ARAI emission benchmarks applied per vehicle class.</p>
          </div>
        </div>
      </div>

      {/* Ownership toggle */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">Do you own or regularly use a personal vehicle?</label>
        <div className="grid grid-cols-2 gap-3 p-1 bg-panel rounded-xl border border-border">
          <button
            type="button"
            onClick={() => onOwnershipChange(true)}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              ownsVehicle
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15'
                : 'text-dark-500 hover:text-text-primary'
            }`}
          >Yes, I own a vehicle</button>
          <button
            type="button"
            onClick={() => onOwnershipChange(false)}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              !ownsVehicle
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15'
                : 'text-dark-500 hover:text-text-primary'
            }`}
          >No personal vehicle</button>
        </div>
      </div>

      {/* Conditional detail fields — only shown if user owns a vehicle */}
      {ownsVehicle && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Vehicle Category Selector */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Vehicle Class & Fuel Type</label>

            {/* Cars */}
            <p className="text-[10px] uppercase tracking-wider text-dark-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <Car className="w-3 h-3" /> Cars
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {carCategories.map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ vehicleCategoryKey: key })}
                  className={`text-left p-3 rounded-xl border transition-all text-sm ${
                    vehicleCategoryKey === key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border bg-surface text-text-secondary hover:border-dark-200'
                  }`}
                >
                  <span className="font-medium block">{cat.className}</span>
                  <span className="text-[10px] text-dark-500 block mt-0.5">{cat.examples.slice(0, 3).join(', ')}</span>
                </button>
              ))}
            </div>

            {/* Two-Wheelers */}
            <p className="text-[10px] uppercase tracking-wider text-dark-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <Bike className="w-3 h-3" /> Two-Wheelers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bikeCategories.map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ vehicleCategoryKey: key })}
                  className={`text-left p-3 rounded-xl border transition-all text-sm ${
                    vehicleCategoryKey === key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border bg-surface text-text-secondary hover:border-dark-200'
                  }`}
                >
                  <span className="font-medium block">{cat.className}</span>
                  <span className="text-[10px] text-dark-500 block mt-0.5">{cat.examples.slice(0, 3).join(', ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Occupancy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Average daily distance (km)</label>
              <input
                type="number"
                min={1}
                max={500}
                value={dailyVehicleKm}
                onChange={(e) => onChange({ dailyVehicleKm: Math.max(1, parseInt(e.target.value) || 25) })}
                className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Average occupancy (people in car)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={vehicleOccupancy}
                onChange={(e) => onChange({ vehicleOccupancy: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Emission preview */}
          {selectedCategory && (
            <div className="flex items-center justify-between bg-panel rounded-xl px-4 py-3 border border-border">
              <div className="text-xs text-dark-500">
                <span className="font-medium text-text-primary">{selectedCategory.className}</span> · {selectedCategory.emissionFactorKgCO2PerKm} kg CO₂/km · {dailyVehicleKm} km/day
              </div>
              <span className="text-sm font-bold text-primary-600">~{annualEmission.toLocaleString()} kg CO₂/yr</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};