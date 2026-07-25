import React from 'react';
import { INDIAN_STATES_AND_UTS, HOUSING_TYPES } from '../../data/datasets/locations/locations';
import { MapPin, Home, Building2 } from 'lucide-react';

interface LocationSelectorProps {
  location: {
    country: string;
    state: string;
    district: string;
    city: string;
    dwelling: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'HOSTEL' | 'PG' | 'RENTAL';
    isUrban: boolean;
  };
  onChange: (updated: Partial<LocationSelectorProps['location']>) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ location, onChange }) => {
  const currentStateObj = INDIAN_STATES_AND_UTS.find(s => s.state === location.state) || INDIAN_STATES_AND_UTS[0];

  return (
    <div className="space-y-6 bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Location & Household Context</h3>
          <p className="text-xs text-gray-400">Calculations adjust based on state electricity grid factors & climate.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country Badge (Fixed to India) */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Country</label>
          <div className="w-full bg-gray-800/80 border border-emerald-500/30 rounded-xl px-4 py-3 text-white text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-base">🇮🇳</span> India (Fixed Regional Engine)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              India-First
            </span>
          </div>
        </div>

        {/* State / UT Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">State / Union Territory *</label>
          <select
            value={location.state}
            onChange={(e) => {
              const newState = e.target.value;
              const newStateObj = INDIAN_STATES_AND_UTS.find(s => s.state === newState);
              onChange({
                state: newState,
                district: newStateObj?.districts[0] || '',
                city: newStateObj?.majorCities[0] || ''
              });
            }}
            className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          >
            {INDIAN_STATES_AND_UTS.map((st) => (
              <option key={st.state} value={st.state}>
                {st.state} {st.isUT ? '(UT)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">District</label>
          <select
            value={location.district}
            onChange={(e) => onChange({ district: e.target.value })}
            className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          >
            {currentStateObj.districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* City / Town Input */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">City / Town</label>
          <input
            type="text"
            value={location.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="e.g. Mumbai, Bengaluru, Pune"
            className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Urban vs Rural Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Area Type</label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-800/80 rounded-xl border border-gray-700/80">
            <button
              type="button"
              onClick={() => onChange({ isUrban: true })}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                location.isUrban
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Urban / Metro
            </button>
            <button
              type="button"
              onClick={() => onChange({ isUrban: false })}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                !location.isUrban
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Rural / Town
            </button>
          </div>
        </div>

        {/* Housing Dwelling Type */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">Housing Dwelling Type</label>
          <select
            value={location.dwelling}
            onChange={(e) => onChange({ dwelling: e.target.value as any })}
            className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          >
            {HOUSING_TYPES.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label} ({h.description})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
