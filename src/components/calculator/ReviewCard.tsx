import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import { Edit2, Car, Zap, Utensils, Trash2 } from 'lucide-react';

interface ReviewCardProps {
  onJumpToStep: (step: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ onJumpToStep }) => {
  const { inputs } = useCalculator();

  return (
    <div className="space-y-6">
      {/* 1. Transportation */}
      <div className="glass p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Transportation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-dark-400 block">Primary Transport</span>
                  <span className="text-white font-medium capitalize">{inputs.primaryTransport}</span>
                </div>
                {['car', 'bike', 'auto'].includes(inputs.primaryTransport) && (
                  <div>
                    <span className="text-dark-400 block">Fuel Type</span>
                    <span className="text-white font-medium capitalize">{inputs.fuelType}</span>
                  </div>
                )}
                <div>
                  <span className="text-dark-400 block">Daily Distance</span>
                  <span className="text-white font-medium">{inputs.distanceTravelled} km</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Annual Flights</span>
                  <span className="text-white font-medium">{inputs.flightsPerYear} flights</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onJumpToStep(1)}
            className="p-2 rounded-lg bg-white/5 text-dark-300 hover:text-primary-400 hover:bg-white/10 transition-all"
            title="Edit Transportation details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Energy */}
      <div className="glass p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Energy & Appliances</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-dark-400 block">Electricity</span>
                  <span className="text-white font-medium">
                    {inputs.electricityValue} {inputs.electricityType === 'units' ? 'Units' : 'Rs.'} /mo
                  </span>
                </div>
                <div>
                  <span className="text-dark-400 block">Cooking Fuel</span>
                  <span className="text-white font-medium capitalize">{inputs.cookingFuel}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">AC Usage</span>
                  <span className="text-white font-medium capitalize">
                    {inputs.acUsage === 'yes' ? `${inputs.acHours} hrs/day` : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-dark-400 block">Heater Usage</span>
                  <span className="text-white font-medium">{inputs.heaterUsage} hrs/day</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Active Devices</span>
                  <span className="text-white font-medium">{inputs.electronicDevices} devices</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onJumpToStep(2)}
            className="p-2 rounded-lg bg-white/5 text-dark-300 hover:text-primary-400 hover:bg-white/10 transition-all"
            title="Edit Energy details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Food */}
      <div className="glass p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Diet & Food</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-dark-400 block">Diet Type</span>
                  <span className="text-white font-medium capitalize">{inputs.diet}</span>
                </div>
                {inputs.diet === 'non-vegetarian' && (
                  <>
                    <div>
                      <span className="text-dark-400 block">Meat Frequency</span>
                      <span className="text-white font-medium capitalize">{inputs.meatFrequency}</span>
                    </div>
                    <div>
                      <span className="text-dark-400 block">Beef Frequency</span>
                      <span className="text-white font-medium capitalize">{inputs.beefMuttonFrequency}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-dark-400 block">Food Waste</span>
                  <span className="text-white font-medium capitalize">{inputs.foodWaste}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Local/Organic</span>
                  <span className="text-white font-medium capitalize">{inputs.localFood}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onJumpToStep(3)}
            className="p-2 rounded-lg bg-white/5 text-dark-300 hover:text-primary-400 hover:bg-white/10 transition-all"
            title="Edit Food details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Waste */}
      <div className="glass p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Waste & Shopping</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-dark-400 block">Waste Volume</span>
                  <span className="text-white font-medium capitalize">{inputs.dailyWaste}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Segregation</span>
                  <span className="text-white font-medium capitalize">{inputs.wasteSegregation}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Recycling</span>
                  <span className="text-white font-medium capitalize">{inputs.recycling}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Composting</span>
                  <span className="text-white font-medium capitalize">{inputs.composting}</span>
                </div>
                <div>
                  <span className="text-dark-400 block">Clothing Purchase</span>
                  <span className="text-white font-medium capitalize">{inputs.clothesFrequency}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onJumpToStep(4)}
            className="p-2 rounded-lg bg-white/5 text-dark-300 hover:text-primary-400 hover:bg-white/10 transition-all"
            title="Edit Waste details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
