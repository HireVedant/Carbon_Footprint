import React from 'react';
import { useCalculator } from '../../../context/CalculatorContext';

interface FoodFormProps {
  setIsValid: (valid: boolean) => void;
}

const diets = [
  { value: 'vegan', label: 'Vegan', desc: 'No animal products' },
  { value: 'vegetarian', label: 'Vegetarian', desc: 'Dairy/eggs, no meat' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', desc: 'Eat meat, fish, poultry' },
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'never', label: 'Never' },
];

const foodWasteOptions = [
  { value: 'low', label: 'Low', desc: 'Rarely throw away food' },
  { value: 'medium', label: 'Medium', desc: 'Some leftovers discarded' },
  { value: 'high', label: 'High', desc: 'Frequent wasted food' },
];

const localFoodOptions = [
  { value: 'always', label: 'Always', desc: 'Exclusively local produce' },
  { value: 'mostly', label: 'Mostly', desc: 'Prioritize local when buying' },
  { value: 'rarely', label: 'Rarely', desc: 'Usually buy imported/packaged' },
  { value: 'never', label: 'Never', desc: 'No local foods preference' },
];

export const FoodForm: React.FC<FoodFormProps> = ({ setIsValid }) => {
  const { inputs, updateInputs } = useCalculator();

  const handleDietSelect = (diet: any) => {
    if (diet !== 'non-vegetarian') {
      updateInputs({ diet, meatFrequency: 'never', beefMuttonFrequency: 'never' });
    } else {
      updateInputs({ diet, meatFrequency: 'weekly', beefMuttonFrequency: 'occasionally' });
    }
  };

  const handleFrequencySelect = (field: 'meatFrequency' | 'beefMuttonFrequency', value: any) => {
    updateInputs({ [field]: value });
  };

  const handleWasteSelect = (value: any) => {
    updateInputs({ foodWaste: value });
  };

  const handleLocalSelect = (value: any) => {
    updateInputs({ localFood: value });
  };

  React.useEffect(() => {
    setIsValid(true); // Food inputs are multiple choice and always have valid defaults
  }, []);

  const isNonVeg = inputs.diet === 'non-vegetarian';

  return (
    <div className="space-y-6">
      {/* Diet Type */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          What type of diet do you follow?
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {diets.map((d) => {
            const isSelected = inputs.diet === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => handleDietSelect(d.value)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">{d.label}</div>
                <div className="text-xs text-dark-400">{d.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meat Frequencies - Conditionally Rendered */}
      {isNonVeg && (
        <div className="grid sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 animate-slide-up">
          {/* General Meat Frequency */}
          <div>
            <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-3">
              Meat & Poultry consumption frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencies.map((freq) => {
                const isSelected = inputs.meatFrequency === freq.value;
                return (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleFrequencySelect('meatFrequency', freq.value)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                        : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {freq.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beef/Mutton Frequency */}
          <div>
            <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-3">
              Beef & Mutton consumption frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencies.map((freq) => {
                const isSelected = inputs.beefMuttonFrequency === freq.value;
                return (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleFrequencySelect('beefMuttonFrequency', freq.value)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                        : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {freq.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Food Waste */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          How much food waste is generated in your home?
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {foodWasteOptions.map((opt) => {
            const isSelected = inputs.foodWaste === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleWasteSelect(opt.value)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">{opt.label}</div>
                <div className="text-xs text-dark-400">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Local Food Consumption */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          How often do you prioritize local or organic food?
        </label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {localFoodOptions.map((opt) => {
            const isSelected = inputs.localFood === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleLocalSelect(opt.value)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="text-sm font-semibold mb-0.5">{opt.label}</div>
                <div className="text-xs text-dark-400">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
