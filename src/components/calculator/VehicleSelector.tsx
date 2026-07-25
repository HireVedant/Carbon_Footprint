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
    <div className="space-y-5 bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Personal Vehicle</h3>
            <p className="text-xs text-gray-400">ARAI emission benchmarks applied per vehicle class.</p>
          </div>
        </div>
      </div>

      {/* Ownership toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">Do you own or regularly use a personal vehicle?</label>
        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-800/80 rounded-xl border border-gray-700/80">
          <button
            type="button"
            onClick={() => onOwnershipChange(true)}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              ownsVehicle
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >Yes, I own a vehicle</button>
          <button
            type="button"
            onClick={() => onOwnershipChange(false)}
            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              !ownsVehicle
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >No personal vehicle</button>
        </div>
      </div>

      {/* Conditional detail fields — only shown if user owns a vehicle */}
      {ownsVehicle && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Vehicle Category Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Vehicle Class & Fuel Type</label>

            {/* Cars */}
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 flex items-center gap-1.5">
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
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-gray-700/60 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="font-medium block">{cat.className}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">{cat.examples.slice(0, 3).join(', ')}</span>
                </button>
              ))}
            </div>

            {/* Two-Wheelers */}
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 flex items-center gap-1.5">
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
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-gray-700/60 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="font-medium block">{cat.className}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">{cat.examples.slice(0, 3).join(', ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Occupancy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Average daily distance (km)</label>
              <input
                type="number"
                min={1}
                max={500}
                value={dailyVehicleKm}
                onChange={(e) => onChange({ dailyVehicleKm: Math.max(1, parseInt(e.target.value) || 25) })}
                className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Average occupancy (people in car)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={vehicleOccupancy}
                onChange={(e) => onChange({ vehicleOccupancy: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Emission preview */}
          {selectedCategory && (
            <div className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-700/40">
              <div className="text-xs text-gray-400">
                <span className="font-medium text-white">{selectedCategory.className}</span> · {selectedCategory.emissionFactorKgCO2PerKm} kg CO₂/km · {dailyVehicleKm} km/day
              </div>
              <span className="text-sm font-bold text-cyan-400">~{annualEmission.toLocaleString()} kg CO₂/yr</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
