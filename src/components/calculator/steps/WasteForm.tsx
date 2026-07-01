import React from 'react';
import { useCalculator } from '../../../context/CalculatorContext';

interface WasteFormProps {
  setIsValid: (valid: boolean) => void;
}

const wasteOptions = [
  { value: 'low', label: 'Low', desc: 'Minimal packaging, small household' },
  { value: 'medium', label: 'Medium', desc: 'Average amount of daily garbage' },
  { value: 'high', label: 'High', desc: 'Multiple bins or bags of trash' },
];

const clothesOptions = [
  { value: 'monthly', label: 'Monthly', desc: 'Regular shopper' },
  { value: 'quarterly', label: 'Quarterly', desc: 'Seasonal purchases' },
  { value: 'annually', label: 'Annually', desc: 'Essential items only' },
  { value: 'rarely', label: 'Rarely', desc: 'Second-hand or very rarely' },
];

export const WasteForm: React.FC<WasteFormProps> = ({ setIsValid }) => {
  const { inputs, updateInputs } = useCalculator();

  const handleSelect = (field: 'dailyWaste' | 'clothesFrequency', value: any) => {
    updateInputs({ [field]: value });
  };

  const handleToggle = (field: 'wasteSegregation' | 'recycling' | 'composting', value: 'yes' | 'no') => {
    updateInputs({ [field]: value });
  };

  React.useEffect(() => {
    setIsValid(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Waste Generation */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          Estimate your household's daily waste generation volume
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {wasteOptions.map((opt) => {
            const isSelected = inputs.dailyWaste === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect('dailyWaste', opt.value)}
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

      {/* Sustainable waste practices */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Segregation */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
            Waste Segregation?
          </label>
          <div className="flex gap-2">
            {['yes', 'no'].map((opt) => {
              const isSelected = inputs.wasteSegregation === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle('wasteSegregation', opt as any)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold capitalize transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                      : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recycling */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
            Do you Recycle plastic/paper?
          </label>
          <div className="flex gap-2">
            {['yes', 'no'].map((opt) => {
              const isSelected = inputs.recycling === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle('recycling', opt as any)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold capitalize transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                      : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Composting */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
            Do you Compost organic waste?
          </label>
          <div className="flex gap-2">
            {['yes', 'no'].map((opt) => {
              const isSelected = inputs.composting === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle('composting', opt as any)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold capitalize transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                      : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clothing Purchases */}
      <div>
        <label className="block text-sm font-semibold text-dark-300 mb-3">
          How frequently do you purchase new clothes?
        </label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {clothesOptions.map((opt) => {
            const isSelected = inputs.clothesFrequency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect('clothesFrequency', opt.value)}
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
