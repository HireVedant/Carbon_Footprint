import React, { useState, useRef, useEffect, useMemo } from 'react';
import { INDIAN_STATES_AND_UTS, HOUSING_TYPES } from '../../data/datasets/locations/locations';
import { MapPin, Home, Building2, ChevronDown } from 'lucide-react';

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

/**
 * Searchable city/town selector with autocomplete.
 * Sources cities from the location dataset's majorCities + a curated fallback list.
 * Narrows suggestions based on the selected state.
 */
function CitySelector({ value, state, onChange }: { value: string; state: string; onChange: (city: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // All Indian cities from dataset + comprehensive additions per state
  const allCities = useMemo(() => {
    const stateObj = INDIAN_STATES_AND_UTS.find(s => s.state === state);
    const datasetCities = stateObj?.majorCities || [];

    // Extended city list per state for better coverage
    const extendedCities: Record<string, string[]> = {
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Amravati', 'Jalgaon', 'Sangli', 'Latur', 'Akola', 'Ahmednagar', 'Dhule', 'Chandrapur', 'Satara', 'Raigad'],
      'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Davangere', 'Ballari', 'Tumakuru', 'Shivamogga', 'Hassan', 'Mandya', 'Udupi', 'Chikkamagaluru', 'Raichur'],
      'Delhi': ['New Delhi', 'Delhi NCR', 'Dwarka', 'Rohini', 'Janakpuri', 'Lajpat Nagar', 'Saket', 'Karol Bagh', 'Connaught Place', 'Defence Colony'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Thanjavur', 'Dindigul', 'Karur', 'Namakkal', 'Kancheepuram'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand', 'Bharuch', 'Junagadh', 'Navsari', 'Porbandar', 'Mehsana'],
      'Uttar Pradesh': ['Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Jhansi', 'Gorakhpur', 'Saharanpur'],
      'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Kharagpur', 'Haldia', 'Darjeeling', 'Malda'],
      'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Ramagundam', 'Secunderabad'],
      'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur', 'Pushkar', 'Mount Abu'],
      'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Palakkad', 'Kottayam', 'Alappuzha', 'Malappuram'],
      'Haryana': ['Gurugram', 'Faridabad', 'Panchkula', 'Ambala', 'Hisar', 'Karnal', 'Panipat', 'Rohtak', 'Sonipat'],
      'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Moga', 'Pathankot'],
      'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna', 'Dewas', 'Rewa'],
      'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Munger', 'Purnia', 'Arrah'],
      'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada', 'Rajahmundry', 'Kadapa'],
      'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Jharsuguda'],
      'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur', 'Nagaon', 'Tinsukia'],
      'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
      'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
      'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
      'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
      'Uttarakhand': ['Dehradun', 'Haridwar', 'Haldwani', 'Rishikesh', 'Nainital', 'Rudrapur', 'Kashipur'],
      'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Chamba'],
      'Chandigarh': ['Chandigarh'],
      'Puducherry': ['Puducherry', 'Karaikal'],
      'Ladakh': ['Leh', 'Kargil'],
    };

    // Merge dataset cities with extended list, deduplicate
    const merged = new Set([...datasetCities, ...(extendedCities[state] || [])]);
    return Array.from(merged).sort();
  }, [state]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!search.trim()) return allCities;
    const q = search.toLowerCase();
    return allCities.filter(c => c.toLowerCase().includes(q));
  }, [search, allCities]);

  // Sync search with value
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleSelect = (city: string) => {
    onChange(city);
    setSearch(city);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => Math.min(prev + 1, filteredCities.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filteredCities.length) {
          handleSelect(filteredCities[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-text-secondary mb-1.5">City / Town</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : (value || '')}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(value || '');
          }}
          placeholder="Search for a city..."
          className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 pr-10 text-text-primary text-sm outline-none transition-all placeholder:text-dark-400"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-text-primary"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && filteredCities.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-surface border border-border shadow-lg"
          role="listbox"
        >
          {filteredCities.map((city, idx) => (
            <button
              key={city}
              type="button"
              role="option"
              aria-selected={city === value}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                city === value
                  ? 'bg-primary-50 text-primary-700'
                  : idx === highlightIndex
                  ? 'bg-panel text-text-primary'
                  : 'text-text-secondary hover:bg-panel'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {isOpen && search && filteredCities.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-surface border border-border shadow-lg p-4 text-center">
          <p className="text-xs text-dark-500">No cities found. You can type a custom name.</p>
          <button
            type="button"
            onClick={() => {
              onChange(search);
              setIsOpen(false);
            }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200 hover:bg-primary-100"
          >
            Use "{search}" as entered
          </button>
        </div>
      )}
    </div>
  );
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ location, onChange }) => {
  const currentStateObj = INDIAN_STATES_AND_UTS.find(s => s.state === location.state) || INDIAN_STATES_AND_UTS[0];

  return (
    <div className="surface-matte space-y-6 p-6 rounded-2xl">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Location & Household Context</h3>
          <p className="text-xs text-dark-500">Calculations adjust based on state electricity grid factors & climate.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Country Badge (Fixed to India) */}
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5">Country</label>
          <div className="w-full bg-surface border border-primary-200 rounded-xl px-4 py-3 text-text-primary text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-base">🇮🇳</span> India (Fixed Regional Engine)
            </span>
            <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              India-First
            </span>
          </div>
        </div>

        {/* State / UT Selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">State / Union Territory *</label>
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
            className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
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
          <label className="block text-xs font-medium text-text-secondary mb-1.5">District</label>
          <select
            value={location.district}
            onChange={(e) => onChange({ district: e.target.value })}
            className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
          >
            {currentStateObj.districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* City / Town — Searchable Dropdown */}
        <CitySelector
          value={location.city}
          state={location.state}
          onChange={(city) => onChange({ city })}
        />
      </div>

      {/* Urban vs Rural Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Area Type</label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-panel rounded-xl border border-border">
            <button
              type="button"
              onClick={() => onChange({ isUrban: true })}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                location.isUrban
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15'
                  : 'text-dark-500 hover:text-text-primary'
              }`}
            >
              Urban / Metro
            </button>
            <button
              type="button"
              onClick={() => onChange({ isUrban: false })}
              className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                !location.isUrban
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15'
                  : 'text-dark-500 hover:text-text-primary'
              }`}
            >
              Rural / Town
            </button>
          </div>
        </div>

        {/* Housing Dwelling Type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Housing Dwelling Type</label>
          <select
            value={location.dwelling}
            onChange={(e) => onChange({ dwelling: e.target.value as any })}
            className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
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