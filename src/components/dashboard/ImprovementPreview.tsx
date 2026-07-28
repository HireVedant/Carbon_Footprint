import React from 'react';
import { Sparkles, Footprints, Flame, Plus, Plane, Recycle, Leaf, ShoppingBag, Droplets } from 'lucide-react';
import { CalculationResult } from '../../utils/carbonCalculator';
import { AssessmentAnswers } from '../../utils/calculationEngine';
import { surface, emerald, fontFamily, water, solar, semantic } from '../../design';

interface ImprovementPreviewProps {
  results: CalculationResult;
  /** Optional v2 assessment answers for answer-aware recommendations. Falls back to emission-based heuristics if absent. */
  answers?: Partial<AssessmentAnswers>;
}

interface Recommendation {
  title: string;
  description: string;
  reduction: number;
  icon: React.ElementType;
  color: string;
}

export const ImprovementPreview: React.FC<ImprovementPreviewProps> = ({ results, answers }) => {
  const { totalEmissions, transportEmissions, energyEmissions, foodEmissions, wasteEmissions } = results;

  // Derive behavioral signals from v2 answers where available; fall back to emission-based signals
  const dietType = answers?.dietType;
  const isVegetarianOrVegan =
    dietType === 'vegan' ||
    dietType === 'lacto_vegetarian' ||
    (answers as any)?.diet === 'vegetarian' ||
    (answers as any)?.diet === 'vegan';

  // V2: no vehicle = public/walk/cycle; if ownsVehicle is explicitly false, treat as non-driver
  const isNonDriver = answers?.ownsVehicle === false;
  const hasFlights = (answers?.flightDetails?.length ?? 0) > 0;
  const totalFlights = answers?.flightDetails?.reduce((sum, f) => sum + (f.tripsPerYear ?? 1), 0) ?? 0;
  const hasHighFlights = totalFlights > 2;

  // Emission-based thresholds (used when v2 answers are not available)
  const hasHighEnergy = energyEmissions / totalEmissions > 0.3;
  const hasHighWaste = wasteEmissions / totalEmissions > 0.2;
  const isHighMeatConsumer =
    !isVegetarianOrVegan && (
      dietType === 'mixed_non_veg' ||
      dietType === 'chicken_moderate' ||
      // Legacy v1 compat
      (answers as any)?.diet === 'non-vegetarian'
    );

  // Waste behavior signals from v2
  const doesNotCompost = answers?.compostingOrganic === false;
  const doesNotRecycle = answers?.recyclingDryWaste === false;
  const hasHighApparelPurchases = (answers?.apparelItemsMonthly ?? 0) > 3;

  // Build the recommendation pool dynamically based on answers and emissions
  const pool: Recommendation[] = [];

  // --- Transportation recommendations ---
  if (!isNonDriver) {
    pool.push({
      title: 'Active / Shared Commuting',
      description: 'Switching to public transit or carpooling for 3 days/week saves approximately 25% of your vehicle emissions.',
      reduction: Math.round(transportEmissions * 0.25),
      icon: Footprints,
      color: `${water.river}`,
    });
  } else if (transportEmissions > 0) {
    pool.push({
      title: 'Walk or Cycle Short Trips',
      description: 'Walking or cycling for trips under 3 km instead of transit reduces emissions further.',
      reduction: Math.round(transportEmissions * 0.10),
      icon: Footprints,
      color: `${water.river}`,
    });
  }

  // --- Flight recommendations ---
  if (hasFlights) {
    pool.push({
      title: 'Reduce Air Travel',
      description: hasHighFlights
        ? `You have ${totalFlights} annual flight segment(s). Use rail for shorter trips and offset remaining flights.`
        : 'Consider replacing some air travel with rail or video conferencing for shorter routes.',
      reduction: Math.round(transportEmissions * 0.35),
      icon: Plane,
      color: `${water.sky}`,
    });
  }

  // --- Diet recommendations (NEVER for vegetarian/vegan) ---
  if (!isVegetarianOrVegan && isHighMeatConsumer) {
    pool.push({
      title: 'Reduce High-Impact Meat Consumption',
      description: 'Opting for meatless meals twice weekly significantly lowers food emissions. Some meat types carry a high carbon cost.',
      reduction: Math.round(foodEmissions * 0.20),
      icon: Flame,
      color: `${emerald[400]}`,
    });
  }

  // --- Food waste recommendations ---
  const foodWasteLevel = answers?.foodWasteLevel;
  if (foodWasteLevel === 'HIGH' || foodWasteLevel === 'MODERATE' || (!foodWasteLevel && foodEmissions / totalEmissions > 0.25)) {
    pool.push({
      title: 'Reduce Food Waste',
      description: 'Planning meals and storing food properly can cut food waste by half, reducing both emissions and cost.',
      reduction: Math.round(foodEmissions * 0.08),
      icon: Leaf,
      color: `${emerald[400]}`,
    });
  }

  // --- Energy recommendations ---
  if (hasHighEnergy) {
    pool.push({
      title: 'Appliance Power Auditing',
      description: 'Enabling smart plugs and upgrading to BEE 5-star rated appliances and LED lighting can cut energy emissions by ~12%.',
      reduction: Math.round(energyEmissions * 0.12),
      icon: Plus,
      color: `${solar.amber}`,
    });
  }

  // Solar offset recommendation if not already installed
  if (!answers?.solarInstalledKw && energyEmissions > 500) {
    pool.push({
      title: 'Install Rooftop Solar',
      description: 'A 3 kW rooftop solar system offsets ~360 kWh/month from the grid, significantly reducing energy emissions.',
      reduction: Math.round(energyEmissions * 0.30),
      icon: Droplets,
      color: `${water.lake}`,
    });
  }

  // --- Waste recommendations ---
  if (doesNotCompost || (!answers && wasteEmissions > 0)) {
    pool.push({
      title: 'Start Composting',
      description: 'Composting organic kitchen waste diverts methane-generating material from landfills.',
      reduction: Math.round(wasteEmissions * 0.12),
      icon: Recycle,
      color: `${emerald[500]}`,
    });
  }

  if (doesNotRecycle) {
    pool.push({
      title: 'Recycle Paper & Plastic',
      description: 'Separating recyclables diverts waste from landfills and reduces manufacturing emissions.',
      reduction: Math.round(wasteEmissions * 0.15),
      icon: Recycle,
      color: `${emerald[500]}`,
    });
  }

  if (hasHighWaste && hasHighApparelPurchases) {
    pool.push({
      title: 'Reduce Fast Fashion',
      description: 'Buying fewer clothes or choosing second-hand cuts manufacturing and textile emissions significantly.',
      reduction: Math.round(wasteEmissions * 0.10),
      icon: ShoppingBag,
      color: `${semantic.waste}`,
    });
  }

  // Sort by highest reduction potential and take top 3
  const improvements = pool
    .filter((r) => r.reduction > 0)
    .sort((a, b) => b.reduction - a.reduction)
    .slice(0, 3);

  // Fallback if somehow nothing matched
  if (improvements.length === 0) {
    improvements.push({
      title: 'Track & Set Carbon Goals',
      description: 'Set a monthly carbon budget and track your progress with EcoTrack AI to build lasting habits.',
      reduction: Math.round(totalEmissions * 0.05),
      icon: Sparkles,
      color: `${emerald[500]}`,
    });
  }

  return (
    <div className="glass-eco p-6 rounded-3xl hover:border-white/15 transition-all duration-300 h-full flex flex-col justify-between relative">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: emerald[400] }} />
          <h3 className="text-sm font-semibold" style={{ color: surface.textPrimary }}>Improvement Potential</h3>
        </div>
        
        <div className="space-y-3">
          {improvements.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all"
              style={{ background: `${surface.base}30`, border: `1px solid ${surface.border}40` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${surface.base}50`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${surface.base}30`; }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${item.color}14`, color: item.color }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold leading-normal" style={{ color: surface.textPrimary }}>{item.title}</h4>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: surface.textSecondary }}>{item.description}</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end" style={{ borderTop: `1px solid ${surface.border}30` }}>
                <span className="text-[10px] font-semibold sm:hidden" style={{ color: surface.textSecondary }}>Est. Saving</span>
                <div>
                  <p className="text-xs font-bold leading-tight" style={{ color: emerald[400] }}>
                    -{item.reduction.toLocaleString()} <span className="text-[10px] font-normal">kg/yr</span>
                  </p>
                  <span className="text-[9px] block" style={{ color: surface.textSecondary }}>CO₂ reduction</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
