import React, { useState } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import Input from '../../ui/Input';

interface EnergyFormProps {
  setIsValid: (valid: boolean) => void;
}

const cookingFuels = [
  { value: 'lpg', label: 'LPG (Cylinder)', desc: 'Liquefied Petroleum Gas' },
  { value: 'png', label: 'PNG (Piped)', desc: 'Piped Natural Gas' },
  { value: 'electric', label: 'Electric Stove', desc: 'Induction / Electric' },
  { value: 'biomass', label: 'Biomass/Wood', desc: 'Traditional Stove' },
];

export const EnergyForm: React.FC<EnergyFormProps> = ({ setIsValid }) => {
  const { inputs, updateInputs } = useCalculator();
  const [elecError, setElecError] = useState('');
  const [acError, setAcError] = useState('');
  const [heaterError, setHeaterError] = useState('');
  const [devicesError, setDevicesError] = useState('');

  const validate = (
    val: number,
    acUsg: string,
    acHrs: number,
    heatHrs: number,
    devices: number
  ) => {
    let valid = true;

    if (val === undefined || isNaN(val) || val < 0) {
      setElecError('Electricity value must be 0 or a positive number');
      valid = false;
    } else {
      setElecError('');
    }

    if (acUsg === 'yes' && (acHrs === undefined || isNaN(acHrs) || acHrs < 0 || acHrs > 24)) {
      setAcError('AC usage must be between 0 and 24 hours per day');
      valid = false;
    } else {
      setAcError('');
    }

    if (heatHrs === undefined || isNaN(heatHrs) || heatHrs < 0 || heatHrs > 24) {
      setHeaterError('Heater usage must be between 0 and 24 hours per day');
      valid = false;
    } else {
      setHeaterError('');
    }

    if (devices === undefined || isNaN(devices) || devices < 0 || devices > 100) {
      setDevicesError('Devices count must be between 0 and 100');
      valid = false;
    } else {
      setDevicesError('');
    }

    setIsValid(valid);
  };

  const handleElectricityToggle = (type: 'units' | 'bill') => {
    updateInputs({ electricityType: type });
  };

  const handleElectricityValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ electricityValue: updatedVal });
    validate(updatedVal, inputs.acUsage, inputs.acHours, inputs.heaterUsage, inputs.electronicDevices);
  };

  const handleCookingFuelSelect = (fuel: any) => {
    updateInputs({ cookingFuel: fuel });
  };

  const handleAcToggle = (usage: 'yes' | 'no') => {
    const defaultHours = usage === 'yes' ? 4 : 0;
    updateInputs({ acUsage: usage, acHours: defaultHours });
    validate(inputs.electricityValue, usage, defaultHours, inputs.heaterUsage, inputs.electronicDevices);
  };

  const handleAcHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ acHours: updatedVal });
    validate(inputs.electricityValue, inputs.acUsage, updatedVal, inputs.heaterUsage, inputs.electronicDevices);
  };

  const handleHeaterHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ heaterUsage: updatedVal });
    validate(inputs.electricityValue, inputs.acUsage, inputs.acHours, updatedVal, inputs.electronicDevices);
  };

  const handleDevicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const updatedVal = isNaN(val) ? 0 : val;
    updateInputs({ electronicDevices: updatedVal });
    validate(inputs.electricityValue, inputs.acUsage, inputs.acHours, inputs.heaterUsage, updatedVal);
  };

  React.useEffect(() => {
    validate(
      inputs.electricityValue,
      inputs.acUsage,
      inputs.acHours,
      inputs.heaterUsage,
      inputs.electronicDevices
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Electricity section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-dark-300">
          Monthly Electricity Consumption
        </label>
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl max-w-xs">
          <button
            type="button"
            onClick={() => handleElectricityToggle('units')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              inputs.electricityType === 'units'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Units (kWh)
          </button>
          <button
            type="button"
            onClick={() => handleElectricityToggle('bill')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
              inputs.electricityType === 'bill'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Bill (Amount)
          </button>
        </div>
        <Input
          id="electricityValue"
          type="number"
          placeholder={inputs.electricityType === 'units' ? 'e.g. 200' : 'e.g. 1500'}
          value={inputs.electricityValue || ''}
          onChange={handleElectricityValueChange}
          error={elecError}
          min="0"
        />
      </div>

      {/* Cooking Fuel */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          What cooking fuel is primarily used in your household?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {cookingFuels.map((fuel) => {
            const isSelected = inputs.cookingFuel === fuel.value;
            return (
              <button
                key={fuel.value}
                type="button"
                onClick={() => handleCookingFuelSelect(fuel.value)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">{fuel.label}</div>
                <div className="text-xs text-dark-400">{fuel.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* High-power Appliances & AC */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* AC Usage */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-dark-300">
            Do you use Air Conditioning (AC)?
          </label>
          <div className="flex gap-2">
            {['yes', 'no'].map((opt) => {
              const isSelected = inputs.acUsage === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAcToggle(opt as any)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {inputs.acUsage === 'yes' && (
            <div className="animate-slide-up">
              <Input
                id="acHours"
                label="Average AC hours used per day"
                type="number"
                placeholder="e.g. 5"
                value={inputs.acHours || ''}
                onChange={handleAcHoursChange}
                error={acError}
                min="0"
                max="24"
                step="0.5"
              />
            </div>
          )}
        </div>

        {/* Heater & Geyser */}
        <div className="space-y-3">
          <Input
            id="heaterUsage"
            label="Average water heater/geyser usage (hours/day)"
            type="number"
            placeholder="e.g. 1"
            value={inputs.heaterUsage || ''}
            onChange={handleHeaterHoursChange}
            error={heaterError}
            min="0"
            max="24"
            step="0.5"
          />
        </div>
      </div>

      {/* Electronic Devices */}
      <div>
        <Input
          id="electronicDevices"
          label="Total active electronic devices (phone, laptop, TV, etc.) used daily"
          type="number"
          placeholder="e.g. 5"
          value={inputs.electronicDevices || ''}
          onChange={handleDevicesChange}
          error={devicesError}
          min="0"
          max="100"
        />
      </div>
    </div>
  );
};
