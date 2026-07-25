import React, { useState, useMemo } from 'react';
import { aviationDataset, calculateFlightEmission } from '../../data/datasets/transport/airports';
import { Plane, Plus, Trash2, ArrowRight } from 'lucide-react';

export interface FlightTripEntry {
  id: string;
  depIata: string;
  arrIata: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  isRoundTrip: boolean;
  tripsPerYear: number;
}

interface FlightPlannerProps {
  flights: FlightTripEntry[];
  onChange: (flights: FlightTripEntry[]) => void;
}

export const FlightPlanner: React.FC<FlightPlannerProps> = ({ flights, onChange }) => {
  const airports = aviationDataset.airports;

  const addFlight = () => {
    const newFlight: FlightTripEntry = {
      id: `flight_${Date.now()}`,
      depIata: 'DEL',
      arrIata: 'BOM',
      cabinClass: 'ECONOMY',
      isRoundTrip: true,
      tripsPerYear: 1
    };
    onChange([...flights, newFlight]);
  };

  const removeFlight = (id: string) => {
    onChange(flights.filter(f => f.id !== id));
  };

  const updateFlight = (id: string, updates: Partial<FlightTripEntry>) => {
    onChange(flights.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const totalFlightEmission = useMemo(() => {
    return flights.reduce((sum, f) => {
      const res = calculateFlightEmission(f.depIata, f.arrIata, f.cabinClass, f.isRoundTrip, f.tripsPerYear);
      return sum + res.totalEmissionKgCO2;
    }, 0);
  }, [flights]);

  return (
    <div className="space-y-4 bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Flight Routes</h3>
            <p className="text-xs text-gray-400">Airport-to-airport distance calculated via Haversine engine.</p>
          </div>
        </div>
        {flights.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Annual Flight Emissions</p>
            <p className="text-lg font-bold text-cyan-400">{Math.round(totalFlightEmission).toLocaleString()} <span className="text-xs text-gray-400 font-normal">kg CO₂</span></p>
          </div>
        )}
      </div>

      {flights.map((flight, index) => {
        const result = calculateFlightEmission(flight.depIata, flight.arrIata, flight.cabinClass, flight.isRoundTrip, flight.tripsPerYear);
        const depAirport = airports.find(a => a.iata === flight.depIata);
        const arrAirport = airports.find(a => a.iata === flight.arrIata);

        return (
          <div key={flight.id} className="relative bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4 group">
            {/* Route header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Route {index + 1}</span>
              <button
                type="button"
                onClick={() => removeFlight(flight.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                aria-label="Remove flight"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Airport selectors */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Departure</label>
                <select
                  value={flight.depIata}
                  onChange={(e) => updateFlight(flight.id, { depIata: e.target.value })}
                  className="w-full bg-gray-900/80 border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                >
                  {airports.map(a => (
                    <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-center pb-1">
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Arrival</label>
                <select
                  value={flight.arrIata}
                  onChange={(e) => updateFlight(flight.id, { arrIata: e.target.value })}
                  className="w-full bg-gray-900/80 border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                >
                  {airports.map(a => (
                    <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Cabin Class</label>
                <select
                  value={flight.cabinClass}
                  onChange={(e) => updateFlight(flight.id, { cabinClass: e.target.value as any })}
                  className="w-full bg-gray-900/80 border border-gray-600 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-white text-xs outline-none transition-all"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Trip Type</label>
                <div className="grid grid-cols-2 gap-1 bg-gray-900/80 border border-gray-600 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => updateFlight(flight.id, { isRoundTrip: false })}
                    className={`py-2 text-[11px] font-medium rounded-md transition-all ${!flight.isRoundTrip ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >One-way</button>
                  <button
                    type="button"
                    onClick={() => updateFlight(flight.id, { isRoundTrip: true })}
                    className={`py-2 text-[11px] font-medium rounded-md transition-all ${flight.isRoundTrip ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >Round Trip</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Trips / Year</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={flight.tripsPerYear}
                  onChange={(e) => updateFlight(flight.id, { tripsPerYear: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-gray-900/80 border border-gray-600 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-white text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Route summary pill */}
            <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 mt-1">
              <span className="text-xs text-gray-400">
                {depAirport?.city || flight.depIata} → {arrAirport?.city || flight.arrIata} · {result.distanceKm.toLocaleString()} km
              </span>
              <span className="text-sm font-semibold text-cyan-400">
                {Math.round(result.totalEmissionKgCO2).toLocaleString()} kg CO₂/yr
              </span>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addFlight}
        className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Flight Route
      </button>
    </div>
  );
};
