import React, { useState } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import { Car, Bike, Train, Bus, User, Navigation, Plane, Footprints } from 'lucide-react';
import Input from '../../ui/Input';

interface TransportFormProps {
  setIsValid: (valid: boolean) => void;
}

const transportOptions = [
  { value: 'walk', label: 'Walk', icon: Footprints },
  { value: 'cycle', label: 'Cycle', icon: Navigation },
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'train', label: 'Train', icon: Train },
  { value: 'auto', label: 'Auto Rickshaw', icon: User },
];

const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
];

export const TransportForm: React.FC<TransportFormProps> = ({ setIsValid }) => {
  const { inputs, updateInputs } = useCalculator();
  const [distanceError, setDistanceError] = useState('');
  const [flightsError, setFlightsError] = useState('');

  const handleTransportSelect = (value: any) => {
    updateInputs({ primaryTransport: value });
    validate(inputs.distanceTravelled, inputs.flightsPerYear);
  };

  const handleFuelSelect = (value: any) => {
    updateInputs({ fuelType: value });
  };

  const validate = (dist: number, flights: number) => {
    let valid = true;

    if (dist === undefined || isNaN(dist) || dist < 0) {
      setDistanceError('Distance must be 0 or a positive number');
      valid = false;
    } else if (dist > 500) {
      setDistanceError('Distance seems very high. Please verify.');
      valid = true; // Warning only, still valid
    } else {
      setDistanceError('');
    }

    if (flights === undefined || isNaN(flights) || flights < 0) {
      setFlightsError('Flights must be 0 or a positive number');
      valid = false;
    } else if (flights > 100) {
      setFlightsError('Flights count seems very high.');
      valid = false;
    } else {
      setFlightsError('');
    }

    setIsValid(valid);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ distanceTravelled: updatedVal });
    validate(updatedVal, inputs.flightsPerYear);
  };

  const handleFlightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ flightsPerYear: updatedVal });
    validate(inputs.distanceTravelled, updatedVal);
  };

  const showFuelSelector = ['car', 'bike', 'auto'].includes(inputs.primaryTransport);

  React.useEffect(() => {
    validate(inputs.distanceTravelled, inputs.flightsPerYear);
  }, []);

  return (
    <div className="space-y-6">
      {/* Primary Transport Mode */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          What is your primary mode of daily transport?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {transportOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = inputs.primaryTransport === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTransportSelect(opt.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08] hover:border-white/20'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-400' : 'text-dark-400'}`} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fuel Type - Conditionally Rendered */}
      {showFuelSelector && (
        <div className="animate-slide-up">
          <label className="block text-sm font-semibold text-dark-300 mb-3">
            What is the vehicle's fuel type?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fuelTypes.map((type) => {
              const isSelected = inputs.fuelType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleFuelSelect(type.value)}
                  className={`p-3 rounded-xl border text-center text-sm font-medium transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Numerical inputs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          id="distanceTravelled"
          label="Average daily distance travelled (km)"
          type="number"
          placeholder="e.g. 15"
          value={inputs.distanceTravelled || ''}
          onChange={handleDistanceChange}
          error={distanceError}
          min="0"
          step="0.5"
        />

        <Input
          id="flightsPerYear"
          label="Number of flights taken per year"
          type="number"
          placeholder="e.g. 2"
          value={inputs.flightsPerYear || ''}
          onChange={handleFlightsChange}
          error={flightsError}
          min="0"
        />
      </div>
    </div>
  );
};
