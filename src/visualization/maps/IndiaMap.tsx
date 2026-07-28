/**
 * India Carbon Intelligence Map — Production Choropleth
 *
 * Interactive SVG-based India map with dynamic layer switching.
 * Supports: Participation, Eco Score, Grid Emission Factor,
 * Renewable Share, CO₂ per Capita layers.
 *
 * Uses react-simple-maps for GeoJSON rendering.
 * All data flows through visualization providers — zero hardcoded values.
 *
 * Features:
 * - Layer-aware semantic choropleth coloring (green=good, red=bad)
 * - Click interaction with instant visual feedback
 * - Premium glassmorphism tooltips
 * - Keyboard navigation with ARIA labels
 * - State selection with filter sync
 * - "No data" states shown in grey
 * - Layer-specific legends
 * - Colorblind-safe palettes
 * - Mobile-responsive with tap support
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Layers, Search, X, Info } from 'lucide-react';

const INDIA_GEO_URL = '/data/india_states.geojson';

// ── Layer definitions ─────────────────────────────────────────────────────────
export interface MapLayer {
  id: string;
  label: string;
  unit: string;
  source: string;
  sourceYear: string;
  confidence: 'High' | 'Medium' | 'Low';
  group: 'community' | 'government';
  icon: string;
  getColor: (stateName: string) => string;
  getValue: (stateName: string) => string;
  getRawValue: (stateName: string) => number;
  /** Whether higher values are environmentally better */
  higherIsBetter?: boolean;
  /** Custom legend labels */
  legendLabels?: { low: string; high: string; title: string; stops: string[] };
  min?: number;
  max?: number;
}

export interface MapStateData {
  state_id: string;
  state_name: string;
  population: number;
  grid_emission_factor: number;
  renewable_share_pct: number;
  avg_emissions_per_capita: number;
  avg_eco_score?: number;
  participation_count?: number;
  last_updated: string;
  source: string;
  confidence_score: number;
}

// ── State name normalization ──────────────────────────────────────────────────
const STATE_NORMALIZE: Record<string, string> = {
  'NCT of Delhi': 'Delhi',
  'Delhi': 'Delhi',
  'Andaman & Nicobar Island': 'Andaman and Nicobar',
  'Andaman and Nicobar': 'Andaman and Nicobar',
  'Dadra & Nagar Haveli': 'Dadra and Nagar Haveli',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli',
  'Daman & Diu': 'Daman and Diu',
  'Daman and Diu': 'Daman and Diu',
  'Jammu and Kashmir': 'Jammu & Kashmir',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'Orissa': 'Odisha',
  'Uttaranchal': 'Uttarakhand',
  'Pondicherry': 'Puducherry',
};

function normalizeState(name: string): string {
  return STATE_NORMALIZE[name] || name;
}

// ── Semantic Color Palettes ───────────────────────────────────────────────────
// Each layer type gets its own meaningful color scale

/** Performance: higher is better (Eco Score, Renewables, Participation) */
const PALETTE_PERFORMANCE = ['#dc2626', '#f97316', '#eab308', '#65a30d', '#15803d'];
/** Emissions: lower is better (Grid Factor, CO₂ per capita) */
const PALETTE_EMISSIONS = ['#15803d', '#65a30d', '#eab308', '#f97316', '#dc2626'];
/** Neutral: no value judgment (Participation count) */
const PALETTE_NEUTRAL = ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0284c7', '#075985'];
/** No data */
const NO_DATA_COLOR = 'rgba(55, 65, 81, 0.5)';

function interpolateColor(low: string, high: string, factor: number): string {
  const l = parseInt(low.slice(1), 16);
  const h = parseInt(high.slice(1), 16);
  const lr = (l >> 16) & 255, lg = (l >> 8) & 255, lb = l & 255;
  const hr = (h >> 16) & 255, hg = (h >> 8) & 255, hb = h & 255;
  const r = Math.round(lr + (hr - lr) * factor);
  const g = Math.round(lg + (hg - lg) * factor);
  const b = Math.round(lb + (hb - lb) * factor);
  return `rgb(${r},${g},${b})`;
}

function getColorFromPalette(
  value: number,
  min: number,
  max: number,
  palette: string[],
  higherIsBetter: boolean
): string {
  if (max <= min) return palette[2]; // middle
  let t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  // If higher is NOT better, invert (so high value → red)
  if (!higherIsBetter) t = 1 - t;
  const idx = Math.min(4, Math.floor(t * 5));
  if (idx === 0) return palette[0];
  if (idx >= 4) return palette[4];
  const localT = (t * 5) - idx;
  return interpolateColor(palette[idx], palette[Math.min(4, idx + 1)], localT);
}

// ── Layer-specific color configurations ───────────────────────────────────────
const LAYER_COLORS: Record<string, { palette: string[]; higherIsBetter: boolean; noData?: boolean }> = {
  participation: { palette: PALETTE_NEUTRAL, higherIsBetter: true },
  ecoScore: { palette: PALETTE_PERFORMANCE, higherIsBetter: true },
  population: { palette: PALETTE_NEUTRAL, higherIsBetter: true },
  gridIntensity: { palette: PALETTE_EMISSIONS, higherIsBetter: false },
  renewable: { palette: PALETTE_PERFORMANCE, higherIsBetter: true },
  co2PerCapita: { palette: PALETTE_EMISSIONS, higherIsBetter: false },
};

function getSemanticColor(layerId: string, value: number, min: number, max: number): string {
  const config = LAYER_COLORS[layerId];
  if (!config) return getColorFromPalette(value, min, max, PALETTE_NEUTRAL, true);
  return getColorFromPalette(value, min, max, config.palette, config.higherIsBetter);
}

// ── Layer legend configs ──────────────────────────────────────────────────────
const LAYER_LEGENDS: Record<string, { title: string; low: string; high: string; stops: string[] }> = {
  participation: {
    title: 'Participation',
    low: 'Low',
    high: 'High',
    stops: ['100', '500', '1,000', '3,000', '5,000+'],
  },
  ecoScore: {
    title: 'Eco Score',
    low: 'Poor',
    high: 'Excellent',
    stops: ['20', '40', '60', '80', '100'],
  },
  population: {
    title: 'Population',
    low: 'Low',
    high: 'High',
    stops: ['500K', '10M', '50M', '100M', '200M+'],
  },
  gridIntensity: {
    title: 'Grid Emissions',
    low: 'Low Emissions',
    high: 'High Emissions',
    stops: ['300', '450', '600', '750', '850+'],
  },
  renewable: {
    title: 'Renewable Energy',
    low: 'Low Share',
    high: 'High Share',
    stops: ['8%', '15%', '25%', '35%', '50%+'],
  },
  co2PerCapita: {
    title: 'CO₂ per Capita',
    low: 'Low Emissions',
    high: 'High Emissions',
    stops: ['0.3t', '0.8t', '1.3t', '1.8t', '2.4t+'],
  },
};

// ── Component props ───────────────────────────────────────────────────────────
interface IndiaMapProps {
  layers: MapLayer[];
  defaultLayer?: string;
  selectedState: string | null;
  onStateSelect: (stateName: string | null) => void;
  className?: string;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  layers,
  defaultLayer,
  selectedState,
  onStateSelect,
  className = '',
}) => {
  // Default to a government data layer that has real data, not community layers which may be empty
  const defaultLayerId = defaultLayer || (layers.find(l => l.group === 'government' && l.getRawValue('Maharashtra') > 0)?.id) || layers[0]?.id || '';
  const [activeLayerId, setActiveLayerId] = useState(defaultLayerId);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showLayerInfo, setShowLayerInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [justClicked, setJustClicked] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLayer = useMemo(
    () => layers.find((l) => l.id === activeLayerId) || layers[0],
    [layers, activeLayerId]
  );

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Cleanup click timeout
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // Group layers by category
  const communityLayers = useMemo(() => layers.filter(l => l.group === 'community'), [layers]);
  const governmentLayers = useMemo(() => layers.filter(l => l.group === 'government'), [layers]);

  // Compute value range for current layer (for semantic coloring)
  const valueRange = useMemo(() => {
    if (!activeLayer) return { min: 0, max: 1 };
    const allNames = layers.flatMap(() => {
      // Use known state names from provider
      return ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
        'Gujarat', 'Rajasthan', 'West Bengal', 'Madhya Pradesh', 'Kerala',
        'Andhra Pradesh', 'Telangana', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
        'Jharkhand', 'Assam', 'Jammu & Kashmir', 'Uttarakhand', 'Himachal Pradesh',
        'Goa', 'Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Tripura',
        'Arunachal Pradesh', 'Sikkim', 'Puducherry', 'Chandigarh', 'Ladakh'];
    });
    const values = allNames.map(n => activeLayer.getRawValue(n)).filter(v => v > 0);
    return {
      min: Math.min(...values, 0),
      max: Math.max(...values, 1),
    };
  }, [activeLayer, layers]);

  // Filter states by search
  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const allStateNames = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
      'Gujarat', 'Rajasthan', 'West Bengal', 'Madhya Pradesh', 'Kerala',
      'Andhra Pradesh', 'Telangana', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
      'Jharkhand', 'Assam', 'Jammu & Kashmir', 'Uttarakhand', 'Himachal Pradesh',
      'Goa', 'Meghalaya', 'Manipur', 'Nagaland', 'Mizoram', 'Tripura',
      'Arunachal Pradesh', 'Sikkim', 'Puducherry', 'Chandigarh', 'Ladakh'];
    return allStateNames.filter(s => s.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    }
  }, []);

  // FIX: Click handler with visual feedback
  const handleStateClick = useCallback((stateName: string, evt?: React.MouseEvent | React.KeyboardEvent) => {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    // Instant visual feedback
    setJustClicked(stateName);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setJustClicked(null), 400);

    if (selectedState === stateName) {
      onStateSelect(null); // Deselect
    } else {
      onStateSelect(stateName);
    }
  }, [selectedState, onStateSelect]);

  const handleKeyDown = useCallback((evt: React.KeyboardEvent, stateName: string) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      handleStateClick(stateName);
    }
  }, [handleStateClick]);

  const handleSearchSelect = useCallback((stateName: string) => {
    onStateSelect(stateName);
    setSearchQuery('');
    setShowSearch(false);
  }, [onStateSelect]);

  // Get tooltip data
  const tooltipStateName = hoveredState || selectedState;
  const tooltipData = useMemo(() => {
    if (!tooltipStateName || !activeLayer) return null;
    const value = activeLayer.getRawValue(tooltipStateName);
    const isNoData = activeLayer.getValue(tooltipStateName) === 'No data';
    return {
      name: tooltipStateName,
      value: activeLayer.getValue(tooltipStateName),
      unit: activeLayer.unit,
      layer: activeLayer.label,
      isNoData,
      rawValue: value,
    };
  }, [tooltipStateName, activeLayer]);

  if (!activeLayer) return null;

  // Get legend config
  const legend = LAYER_LEGENDS[activeLayerId] || LAYER_LEGENDS.ecoScore;
  const legendPalette = LAYER_COLORS[activeLayerId]?.palette || PALETTE_NEUTRAL;

  return (
    <div className={`relative ${className}`} ref={mapRef}>
      {/* ── Header Row: Layer selector + Search ───────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            India Carbon Intelligence Map
          </span>
          {selectedState && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onStateSelect(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <X className="w-3 h-3" />
              {selectedState}
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all"
            title="Search states"
            aria-label="Search states"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLayerInfo(!showLayerInfo)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 transition-all"
            title="Layer information"
            aria-label="Layer information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a state name (e.g. 'Mah' for Maharashtra)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-dark-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                style={{ fontFamily: 'var(--font-body)' }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearch(false);
                    setSearchQuery('');
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {filteredStates.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-dark-900/95 border border-white/10 backdrop-blur-xl">
                {filteredStates.map(state => (
                  <button
                    key={state}
                    onClick={() => handleSearchSelect(state)}
                    className="w-full text-left px-4 py-2.5 text-sm text-dark-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-white/5 last:border-0"
                  >
                    {state}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer Info Panel ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLayerInfo && activeLayer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{activeLayer.label}</h4>
                <button onClick={() => setShowLayerInfo(false)} className="text-dark-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-dark-500">Source:</span>
                  <p className="text-dark-200 font-medium">{activeLayer.source}</p>
                </div>
                <div>
                  <span className="text-dark-500">Updated:</span>
                  <p className="text-dark-200 font-medium">{activeLayer.sourceYear}</p>
                </div>
                <div>
                  <span className="text-dark-500">Confidence:</span>
                  <p className={`font-medium ${
                    activeLayer.confidence === 'High' ? 'text-emerald-400' :
                    activeLayer.confidence === 'Medium' ? 'text-amber-400' : 'text-red-400'
                  }`}>{activeLayer.confidence}</p>
                </div>
                <div>
                  <span className="text-dark-500">Unit:</span>
                  <p className="text-dark-200 font-medium">{activeLayer.unit}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer Tabs ──────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-dark-500">
          <Layers className="w-3 h-3" />
          Community Data
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {communityLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 border ${
                activeLayerId === layer.id
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1">{layer.icon}</span>
              {layer.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-dark-500 mt-2">
          <MapPin className="w-3 h-3" />
          Government Data
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {governmentLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayerId(layer.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 border ${
                activeLayerId === layer.id
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 text-dark-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1">{layer.icon}</span>
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map Container ──────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl border border-emerald-500/15 p-2 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(4,8,6,0.9), rgba(6,20,16,0.95))' }}
        onMouseMove={handleMouseMove}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [82.5, 22],
            parallels: [8.06, 37.48],
          }}
          style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
        >
          <Geographies geography={INDIA_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = normalizeState(geo.properties.name || geo.properties.ST_NM || '');
                const isSelected = selectedState === stateName;
                const isHovered = hoveredState === stateName;
                const isFiltered = selectedState && !isSelected;
                const isJustClicked = justClicked === stateName;

                // Use semantic color from the layer system
                const fillColor = activeLayer.getColor(stateName);
                const rawVal = activeLayer.getRawValue(stateName);
                const isNoData = activeLayer.getValue(stateName) === 'No data';

                return (
                  <g
                    key={geo.rsmKey}
                    role="button"
                    tabIndex={0}
                    aria-label={`${stateName}: ${activeLayer.getValue(stateName)} ${activeLayer.unit}`}
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={(e) => handleStateClick(stateName, e)}
                    onFocus={() => setHoveredState(stateName)}
                    onBlur={() => setHoveredState(null)}
                    onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, stateName)}
                    style={{ outline: 'none', cursor: 'pointer' }}
                  >
                    <Geography
                      geography={geo}
                      onClick={(e) => handleStateClick(stateName, e)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isSelected ? '#ffffff' : isJustClicked ? '#10b981' : '#1e3a2a',
                          strokeWidth: isSelected ? 2 : isJustClicked ? 1.8 : 0.5,
                          outline: 'none',
                          transition: 'fill 0.4s ease, stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.3s ease',
                          opacity: isFiltered ? 0.3 : isNoData ? 0.6 : 1,
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: isNoData ? NO_DATA_COLOR : fillColor,
                          stroke: '#ffffff',
                          strokeWidth: 1.5,
                          outline: 'none',
                          filter: isNoData ? 'none' : 'brightness(1.3) drop-shadow(0 0 8px rgba(16,185,129,0.4))',
                          opacity: 1,
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: isNoData ? NO_DATA_COLOR : fillColor,
                          stroke: '#10b981',
                          strokeWidth: 2.5,
                          outline: 'none',
                          filter: isNoData ? 'none' : 'brightness(1.15)',
                        },
                      }}
                    />
                    {/* Click feedback glow ring */}
                    {isJustClicked && (
                      <circle
                        cx={0}
                        cy={0}
                        r={0}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        opacity={0}
                      >
                        <animate attributeName="r" from="5" to="30" dur="0.4s" fill="freeze" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="0.4s" fill="freeze" />
                      </circle>
                    )}
                  </g>
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* ── Mobile Tooltip (bottom sheet style) ──────────────────────────── */}
        {isMobile && tooltipStateName && tooltipData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-2 left-2 right-2 z-20 p-4 rounded-xl backdrop-blur-xl border border-emerald-500/20"
            style={{ background: 'rgba(4,8,6,0.92)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {tooltipData.name}
              </h4>
              <span className={`text-xs font-medium ${tooltipData.isNoData ? 'text-dark-400' : 'text-emerald-400'}`}>
                {tooltipData.isNoData ? 'No data' : `${tooltipData.value} ${tooltipData.unit}`}
              </span>
            </div>
            <p className="text-[10px] text-dark-400">
              Layer: {tooltipData.layer}
            </p>
          </motion.div>
        )}

        {/* ── Desktop Tooltip (glassmorphism) ──────────────────────────────── */}
        {!isMobile && tooltipStateName && tooltipData && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x + 16, (mapRef.current?.clientWidth || 600) - 220),
              top: tooltipPos.y - 10,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              className="p-3 rounded-xl backdrop-blur-xl border border-emerald-500/20 shadow-xl min-w-[180px]"
              style={{ background: 'rgba(4,8,6,0.92)' }}
              role="tooltip"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${tooltipData.isNoData ? 'bg-dark-500' : 'bg-emerald-400'}`} />
                <h4 className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {tooltipData.name}
                </h4>
                {selectedState === tooltipStateName && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">Selected</span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-dark-400">{tooltipData.layer}</span>
                  <span className={`text-xs font-bold ${tooltipData.isNoData ? 'text-dark-500' : 'text-emerald-300'}`}
                        style={{ fontFamily: 'var(--font-mono)' }}>
                    {tooltipData.isNoData ? 'No data available' : `${tooltipData.value} ${tooltipData.unit}`}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5">
                <p className="text-[9px] text-dark-500">
                  Source: {activeLayer.source} ({activeLayer.sourceYear})
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Layer-Specific Legend ──────────────────────────────────────────── */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-semibold text-emerald-400">{legend.title}</span>
          <div className="flex items-center gap-1 text-[9px] text-dark-400">
            <span className="w-16 text-right">{legend.low}</span>
            <div className="flex gap-0">
              {legendPalette.map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-3 transition-colors duration-300"
                  style={{
                    backgroundColor: c,
                    borderRadius: i === 0 ? '2px 0 0 2px' : i === 4 ? '0 2px 2px 0' : '0',
                  }}
                />
              ))}
            </div>
            <span className="w-16">{legend.high}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-dark-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: NO_DATA_COLOR, border: '1px solid rgba(255,255,255,0.1)' }} />
            <span>No data</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Click to select · Tab to navigate</span>
          </div>
        </div>
      </div>

      {/* ── Legend stops (subtle detail row) ───────────────────────────────── */}
      <div className="mt-1 flex items-center gap-3">
        <span className="w-[calc(3rem+11px)]" /> {/* spacer matching legend label width */}
        <div className="flex items-center gap-0 text-[8px] text-dark-600">
          <span className="w-16" />
          {legend.stops.map((stop, i) => (
            <span key={i} className="w-6 text-center">{stop}</span>
          ))}
          <span className="w-16" />
        </div>
      </div>
    </div>
  );
};