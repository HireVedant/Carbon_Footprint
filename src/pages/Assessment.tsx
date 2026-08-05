import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessment, AssessmentStep } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { saveV2Assessment } from '../firebase/firestore';
import { LocationSelector } from '../components/calculator/LocationSelector';
import { FlightPlanner } from '../components/calculator/FlightPlanner';
import { ApplianceSelector } from '../components/calculator/ApplianceSelector';
import { ConfidenceBreakdownCard } from '../components/calculator/ConfidenceBadge';
import { TRANSPORT_MODES, PUBLIC_TRANSIT_MODES, TransportEntry } from '../data/configs/transportConfig';
import { FOOD_CATEGORIES, DietMixEntry } from '../data/configs/foodConfig';
import {
  MapPin, Car, Zap, UtensilsCrossed, Trash2, ShoppingBag,
  ClipboardCheck, Sparkles, Leaf, ChevronLeft, ChevronRight,
  Timer, FileText, Plus, X, GripVertical
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import { calculateEcoScore } from '../core/calculation/ecoScore';

const STEPS: { key: AssessmentStep; label: string; icon: React.ElementType }[] = [
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'transport', label: 'Transport', icon: Car },
  { key: 'energy', label: 'Energy', icon: Zap },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'waste', label: 'Waste', icon: Trash2 },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { key: 'review', label: 'Review', icon: ClipboardCheck }
];

/** Parses a numeric input value, allowing empty string for backspace/delete support */
function parseNum(val: string, fallback: number = 0): number {
  if (val === '' || val === '-') return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : Math.max(0, n);
}

/** Per-field ceiling limits to prevent absurd inputs causing NaN / Infinity emissions */
const INPUT_CEILINGS: Record<string, number> = {
  dailyVehicleKm: 1_000,        // 1,000 km/day maximum
  electricityKWh: 2_000,        // 2,000 kWh/month maximum
  monthlyBillRupees: 100_000,   // ₹1,00,000 maximum bill
  solarInstalledKw: 500,        // 500 kW rooftop solar maximum
  householdMembers: 30,         // 30 members maximum
  diningOutMealsWeekly: 21,     // 3x/day every day maximum
  apparelItemsMonthly: 20,      // 20 items/month maximum
  electronicsItemsYearly: 50,   // 50 items/year maximum
  onlineParcelsMonthly: 100,    // 100 parcels/month maximum
};

/**
 * parseNum with a field-specific ceiling clamp.
 * Falls back to uncapped parseNum for fields not in INPUT_CEILINGS.
 */
function parseNumClamped(field: string, val: string, fallback: number = 0): number {
  const raw = parseNum(val, fallback);
  const ceiling = INPUT_CEILINGS[field];
  return ceiling !== undefined ? Math.min(raw, ceiling) : raw;
}

/** Returns string representation for controlled input: '' when 0 or undefined */
function numVal(v: number | undefined, showZero: boolean = true): string | number {
  if (v === undefined || v === null) return '';
  if (!showZero && v === 0) return '';
  return v;
}

export default function Assessment() {
  const { user } = useAuth();
  const {
    answers, updateAnswers, result, runCalculation, isCalculated, setAssessmentId,
    mode, setMode, currentStep, setCurrentStep,
    flights, setFlights, appliances, setAppliances, resetAssessment
  } = useAssessment();

  const [calculating, setCalculating] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].key);
    }
  };
  const goPrev = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  const { userProfile } = useAuth();

  const handleCalculate = async () => {
  setCalculating(true);

  const computedResult = runCalculation();

  if (user) {
    try {
      const docId = await saveV2Assessment(
        user.uid,
        answers,
        computedResult,
        mode
      );

      setAssessmentId(docId);

      const { updateCommunityAggregates } = await import(
        '../services/communityAnalyticsService'
      );
      const { collection, getCountFromServer } = await import(
        'firebase/firestore'
      );
      const { db } = await import('../firebase/firebase');

      let totalUsers = 1;

      try {
        const usersCol = collection(db, 'users');
        const countSnap = await getCountFromServer(usersCol);
        totalUsers = countSnap.data().count;
      } catch {
        // Non-fatal fallback
      }

      await updateCommunityAggregates({
        userId: user.uid,
        calculationId: docId,
        displayName: user.displayName || userProfile?.name || 'Eco User',
        transportEmission: computedResult.breakdown.transport || 0,
        energyEmission: computedResult.breakdown.energy || 0,
        foodEmission: computedResult.breakdown.food || 0,
        wasteEmission: computedResult.breakdown.waste || 0,
        totalEmission: computedResult.totalKgCO2PerYear,
        ecoScore: calculateEcoScore(computedResult.totalTonnesCO2PerYear).score,
        ecoLabel: 'Calculated',
        annualEstimate: computedResult.totalTonnesCO2PerYear,
        totalUsers,
      });
    } catch (err) {
      console.error('Failed to auto-save assessment:', err);
      setSaveFailed(true);
    }
  }

  setCalculating(false);
};

  // Skip steps in quick mode (waste & shopping are auto-estimated)
  const visibleSteps = useMemo(
    () => (mode === 'quick' ? STEPS.filter(s => !['waste', 'shopping'].includes(s.key)) : STEPS),
    [mode]
  );

  const currentVisibleIndex = useMemo(
    () => visibleSteps.findIndex(s => s.key === currentStep),
    [visibleSteps, currentStep]
  );

  const goNextVisible = () => {
    if (currentVisibleIndex < visibleSteps.length - 1) {
      setCurrentStep(visibleSteps[currentVisibleIndex + 1].key);
    }
  };
  const goPrevVisible = () => {
    if (currentVisibleIndex > 0) {
      setCurrentStep(visibleSteps[currentVisibleIndex - 1].key);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 relative flex flex-col justify-center">
      <div className="absolute inset-0 mesh-bg opacity-70" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Calculation In Progress */}
        {calculating && (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin shadow-eco-glow" />
              <Leaf className="w-8 h-8 text-primary-600 absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-text-primary flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
                Calculating Your Footprint...
              </h3>
              <p className="text-sm text-dark-500">
                AI Scientific Calculation Engine v2.1 is processing your answers against verified CEA, ARAI, and SEI datasets.
              </p>
            </div>
          </div>
        )}

        {/* Results View */}
        {!calculating && isCalculated && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <SectionHeading
              badge="Assessment Complete"
              title="Your Carbon"
              highlight="Impact Report"
              description="Scientific assessment powered by CEA, ARAI, and ICAO emissions datasets."
            />

            {/* Save Failure Warning Toast */}
            {saveFailed && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span className="flex-1">
                  Your footprint was calculated successfully, but we couldn't save it to the cloud right now.
                  Please check your connection and try again, or take a screenshot of your results.
                </span>
                <button
                  onClick={() => setSaveFailed(false)}
                  aria-label="Dismiss save warning"
                  className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Total Emission Card */}
            <div className="glass-eco p-8 rounded-3xl text-center space-y-4 shadow-eco-glow-lg border border-emerald-200">
              <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Annual Carbon Footprint</p>
              <p className="text-6xl font-extrabold text-text-primary tracking-tight">{result.totalTonnesCO2PerYear} <span className="text-2xl text-emerald-700 font-normal">tonnes CO₂e/year</span></p>
              <p className="text-sm text-dark-500">{result.totalKgCO2PerYear.toLocaleString()} kg CO₂e · Grid Factor: {result.metadata.gridFactorUsed} kg CO₂/kWh ({result.metadata.state})</p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(result.breakdown).map(([key, value]) => {
                const colors: Record<string, string> = {
                  energy: 'text-amber-700 bg-amber-50 border-amber-200',
                  transport: 'text-cyan-700 bg-cyan-50 border-cyan-200',
                  food: 'text-rose-700 bg-rose-50 border-rose-200',
                  waste: 'text-violet-700 bg-violet-50 border-violet-200',
                  shopping: 'text-indigo-700 bg-indigo-50 border-indigo-200'
                };
                return (
                  <div key={key} className={`p-4 rounded-xl border ${colors[key]} text-center`}>
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-1">{key}</p>
                    <p className="text-xl font-bold">{value.toLocaleString()}</p>
                    <p className="text-[10px] opacity-60">kg CO₂ · {result.percentages[key as keyof typeof result.percentages]}%</p>
                  </div>
                );
              })}
            </div>

            {/* Confidence Breakdown */}
            <ConfidenceBreakdownCard confidence={result.confidence} />

            {/* Start New Assessment */}
            <div className="text-center">
              <button
                onClick={resetAssessment}
                className="px-6 py-3 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-all text-sm font-medium"
              >
                Start New Assessment
              </button>
            </div>
          </motion.div>
        )}

        {/* Assessment Form */}
        {!calculating && !isCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <SectionHeading
              badge="Scientific Assessment v2.1"
              title="Calculate Your"
              highlight="Carbon Footprint"
              description="India-first assessment powered by CEA grid factors, ARAI vehicle benchmarks, and ICAO aviation data."
            />

            {/* Mode Selector */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMode('quick')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  mode === 'quick'
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/15'
                    : 'bg-surface text-dark-500 border-border hover:border-primary-300'
                }`}
              >
                <Timer className="w-4 h-4" /> Quick Assessment (2-3 min)
              </button>
              <button
                onClick={() => setMode('detailed')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  mode === 'detailed'
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/15'
                    : 'bg-surface text-dark-500 border-border hover:border-primary-300'
                }`}
              >
                <FileText className="w-4 h-4" /> Detailed Assessment (8-10 min)
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>
                  Step {currentVisibleIndex + 1} of {visibleSteps.length}
                </span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(((currentVisibleIndex) / (visibleSteps.length - 1)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--color-primary), #34d399)' }}
                  initial={false}
                  animate={{ width: `${((currentVisibleIndex) / (visibleSteps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {mode === 'quick' ? '2–3 min total' : '8–10 min total'} · ~{Math.max(1, Math.round((visibleSteps.length - currentVisibleIndex - 1) * (mode === 'quick' ? 0.5 : 1.2)))} min remaining
              </p>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {visibleSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = step.key === currentStep;
                const isPast = idx < currentVisibleIndex;
                return (
                  <button
                    key={step.key}
                    onClick={() => setCurrentStep(step.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/15'
                        : isPast
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'bg-panel text-dark-500 border border-border hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Content */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentStep === 'location' && (
                    <LocationSelector
                      location={{
                        country: 'India',
                        state: answers.state || 'Maharashtra',
                        district: answers.district || '',
                        city: answers.city || '',
                        dwelling: answers.dwelling || 'APARTMENT',
                        isUrban: answers.isUrban !== false
                      }}
                      onChange={(updates) => updateAnswers(updates as any)}
                    />
                  )}

                  {currentStep === 'transport' && (
                    <TransportSection
                      answers={answers}
                      updateAnswers={updateAnswers}
                      mode={mode}
                      flights={flights}
                      setFlights={setFlights}
                    />
                  )}

                  {currentStep === 'energy' && (
                    <div className="space-y-6">
                      <div className="surface-matte p-6 rounded-2xl space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary">Household Energy</h3>
                            <p className="text-xs text-dark-500">Monthly electricity and cooking fuel usage.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Electricity */}
                          <div className="space-y-3">
                            <label className="block text-xs font-medium text-text-secondary">Do you know your monthly kWh?</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-panel rounded-xl border border-border">
                              <button type="button" onClick={() => updateAnswers({ electricityKWhKnown: true })}
                                className={`py-2 text-xs font-medium rounded-lg transition-all ${answers.electricityKWhKnown ? 'bg-primary-600 text-white' : 'text-dark-500 hover:text-text-primary'}`}
                              >Yes, exact kWh</button>
                              <button type="button" onClick={() => updateAnswers({ electricityKWhKnown: false })}
                                className={`py-2 text-xs font-medium rounded-lg transition-all ${!answers.electricityKWhKnown ? 'bg-primary-600 text-white' : 'text-dark-500 hover:text-text-primary'}`}
                              >No, bill amount</button>
                            </div>

                            {answers.electricityKWhKnown ? (
                              <div>
                                <label className="block text-[11px] text-dark-500 mb-1">Monthly kWh</label>
                                <input type="number" min={0} value={numVal(answers.electricityKWh, false)}
                                  onChange={(e) => updateAnswers({ electricityKWh: parseNumClamped('electricityKWh', e.target.value) })}
                                  className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[11px] text-dark-500 mb-1">Monthly Bill (₹)</label>
                                <input type="number" min={0} value={numVal(answers.monthlyBillRupees, false)}
                                  onChange={(e) => updateAnswers({ monthlyBillRupees: parseNumClamped('monthlyBillRupees', e.target.value) })}
                                  className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                                />
                              </div>
                            )}
                          </div>

                          {/* Cooking fuel (Hidden for Hostel / PG) */}
                          {['HOSTEL', 'PG'].includes(answers.dwelling || '') ? (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                              <span className="text-xs text-amber-700">ℹ️ Cooking fuel & solar panel inputs skipped for Hostel/PG residents.</span>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-text-secondary">Cooking Fuel</label>
                                <select value={answers.cookingFuel || 'lpg'}
                                  onChange={(e) => updateAnswers({ cookingFuel: e.target.value as any })}
                                  className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                                >
                                  <option value="lpg">LPG Cylinder (14.2 kg)</option>
                                  <option value="png">Piped Natural Gas (PNG)</option>
                                  <option value="induction">Electric Induction</option>
                                  <option value="biomass">Biomass / Firewood</option>
                                </select>

                                <div>
                                  <label className="block text-[11px] text-dark-500 mb-1">Monthly consumption ({answers.cookingFuel === 'lpg' ? 'cylinders' : 'units'})</label>
                                  <input type="number" min={0} step={0.5} value={numVal(answers.cookingFuelConsumptionMonthly)}
                                    onChange={(e) => updateAnswers({ cookingFuelConsumptionMonthly: parseNum(e.target.value, 1) })}
                                    className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                                  />
                                </div>
                              </div>

                              {/* Solar */}
                              <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Solar Panels (kW capacity)</label>
                                <input type="number" min={0} step={0.5} value={numVal(answers.solarInstalledKw, false)}
                                  onChange={(e) => updateAnswers({ solarInstalledKw: parseNumClamped('solarInstalledKw', e.target.value) })}
                                  className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                                />
                                <p className="text-[10px] text-dark-500 mt-1">Enter 0 if no solar panels.</p>
                              </div>
                            </>
                          )}

                          {/* Household size */}
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">Household Members</label>
                            <input type="number" min={1} max={20} value={numVal(answers.householdMembers)}
                              onChange={(e) => updateAnswers({ householdMembers: parseNumClamped('householdMembers', e.target.value, 1) })}
                              className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Appliances (Detailed mode only) */}
                      {mode === 'detailed' && (
                        <ApplianceSelector appliances={appliances} onChange={setAppliances} />
                      )}
                    </div>
                  )}

                  {currentStep === 'food' && (
                    <FoodSection
                      answers={answers}
                      updateAnswers={updateAnswers}
                    />
                  )}

                  {currentStep === 'waste' && (
                    <div className="surface-matte p-6 rounded-2xl space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2.5 bg-violet-50 rounded-xl text-violet-700">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">Waste Management</h3>
                          <p className="text-xs text-dark-500">Based on CPCB municipal solid waste benchmarks.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'wasteSegregation', label: 'Do you segregate wet & dry waste?', value: answers.wasteSegregation },
                          { key: 'compostingOrganic', label: 'Do you compost organic / kitchen waste?', value: answers.compostingOrganic },
                          { key: 'recyclingDryWaste', label: 'Do you recycle plastic, paper, and e-waste?', value: answers.recyclingDryWaste }
                        ].map(q => (
                          <div key={q.key} className="flex items-center justify-between bg-panel px-4 py-3 rounded-xl">
                            <span className="text-sm text-text-primary">{q.label}</span>
                            <div className="flex gap-2">
                              <button type="button"
                                onClick={() => updateAnswers({ [q.key]: true })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${q.value ? 'bg-primary-600 text-white' : 'bg-surface text-dark-500 hover:text-text-primary'}`}
                              >Yes</button>
                              <button type="button"
                                onClick={() => updateAnswers({ [q.key]: false })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!q.value ? 'bg-primary-600 text-white' : 'bg-surface text-dark-500 hover:text-text-primary'}`}
                              >No</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 'shopping' && (
                    <div className="surface-matte p-6 rounded-2xl space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">Shopping & Consumption</h3>
                          <p className="text-xs text-dark-500">Estimate purchases from UNEP lifecycle factors.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Clothing items / month</label>
                          <input type="number" min={0} value={numVal(answers.apparelItemsMonthly)}
                            onChange={(e) => updateAnswers({ apparelItemsMonthly: parseNumClamped('apparelItemsMonthly', e.target.value, 1) })}
                            className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Electronics purchased / year</label>
                          <input type="number" min={0} step={0.5} value={numVal(answers.electronicsItemsYearly)}
                            onChange={(e) => updateAnswers({ electronicsItemsYearly: parseNumClamped('electronicsItemsYearly', e.target.value, 1) })}
                            className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Online parcels / month</label>
                          <input type="number" min={0} value={numVal(answers.onlineParcelsMonthly)}
                            onChange={(e) => updateAnswers({ onlineParcelsMonthly: parseNumClamped('onlineParcelsMonthly', e.target.value, 4) })}
                            className="w-full bg-surface border border-border focus:border-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-panel px-4 py-3 rounded-xl">
                          <span className="text-sm text-text-primary">Prefer second-hand?</span>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => updateAnswers({ preferSecondHand: true })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${answers.preferSecondHand ? 'bg-primary-600 text-white' : 'bg-surface text-dark-500'}`}
                            >Yes</button>
                            <button type="button" onClick={() => updateAnswers({ preferSecondHand: false })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!answers.preferSecondHand ? 'bg-primary-600 text-white' : 'bg-surface text-dark-500'}`}
                            >No</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 'review' && (
                    <ReviewSection answers={answers} mode={mode} flights={flights} appliances={appliances} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goPrevVisible}
                disabled={currentVisibleIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-surface text-dark-500 border border-border hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentStep === 'review' ? (
                <button
                  onClick={handleCalculate}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white shadow-lg shadow-primary-600/15 hover:bg-primary-700 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Calculate Footprint
                </button>
              ) : (
                <button
                  onClick={goNextVisible}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Transport Section (Multi-Select) ────────────────────────────────────────

function TransportSection({
  answers,
  updateAnswers,
  mode,
  flights,
  setFlights,
}: {
  answers: any;
  updateAnswers: (u: any) => void;
  mode: string;
  flights: any[];
  setFlights: (f: any[]) => void;
}) {
  const entries: TransportEntry[] = answers.transportEntries || [];

  const addEntry = (modeId: string) => {
    const mode = TRANSPORT_MODES.find(m => m.id === modeId);
    if (!mode) return;
    // Check if already added
    if (entries.some(e => e.modeId === modeId)) return;
    const newEntry: TransportEntry = {
      modeId,
      dailyKm: mode.defaultDailyKm,
      occupancy: mode.supportsOccupancy ? 1 : 1,
      label: mode.label,
    };
    updateAnswers({ transportEntries: [...entries, newEntry] });
  };

  const removeEntry = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    updateAnswers({ transportEntries: updated });
  };

  const updateEntry = (idx: number, field: keyof TransportEntry, value: number) => {
    const updated = [...entries];
    updated[idx] = { ...updated[idx], [field]: value };
    updateAnswers({ transportEntries: updated });
  };

  return (
    <div className="space-y-6">
      {/* Personal Transport — Multi-Select */}
      <div className="surface-matte p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="p-2.5 bg-cyan-50 rounded-xl text-cyan-700">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Personal Transport</h3>
            <p className="text-xs text-dark-500">Add all modes of transport you use. Emission factors from ARAI/BEE datasets.</p>
          </div>
        </div>

        {/* Available modes to add */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Add a transport mode:</label>
          <div className="flex flex-wrap gap-2">
            {TRANSPORT_MODES.map(mode => {
              const alreadyAdded = entries.some(e => e.modeId === mode.id);
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => addEntry(mode.id)}
                  disabled={alreadyAdded}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    alreadyAdded
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                      : 'bg-surface text-dark-500 border-border hover:border-primary-300 hover:text-text-primary'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                  {alreadyAdded && <span className="text-emerald-600 ml-1">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Added entries */}
        {entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const mode = TRANSPORT_MODES.find(m => m.id === entry.modeId);
              if (!mode) return null;
              const annualKm = entry.dailyKm * 365;
              const annualEmission = Math.round((annualKm * mode.defaultEmissionFactorKgCO2PerKm) / Math.max(1, entry.occupancy));

              return (
                <div key={`${entry.modeId}-${idx}`} className="bg-panel border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{mode.icon}</span>
                      <span className="text-sm font-medium text-text-primary">{entry.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(idx)}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-600 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-dark-500 mb-1">Daily km</label>
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={entry.dailyKm}
                        onChange={(e) => updateEntry(idx, 'dailyKm', Math.min(INPUT_CEILINGS.dailyVehicleKm, Math.max(0, parseNum(e.target.value))))}
                        className="w-full bg-surface border border-border focus:border-primary-500 rounded-lg px-3 py-2 text-text-primary text-xs outline-none transition-all"
                      />
                    </div>
                    {mode.supportsOccupancy && (
                      <div>
                        <label className="block text-[10px] text-dark-500 mb-1">Passengers</label>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={entry.occupancy}
                          onChange={(e) => updateEntry(idx, 'occupancy', Math.max(1, parseNum(e.target.value, 1)))}
                          className="w-full bg-surface border border-border focus:border-primary-500 rounded-lg px-3 py-2 text-text-primary text-xs outline-none transition-all"
                        />
                      </div>
                    )}
                    <div className="flex items-end">
                      <div className="text-xs text-dark-500">
                        <span className="text-cyan-700 font-bold">~{annualEmission.toLocaleString()}</span> kg CO₂/yr
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-dark-500">No transport modes selected. Click a mode above to add it.</p>
          </div>
        )}
      </div>

      {/* Public Transit */}
      <div className="surface-matte p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Public Transit Usage</h3>
        <p className="text-xs text-dark-500">Approximate weekly kilometers by transit mode.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PUBLIC_TRANSIT_MODES.map(tm => (
            <div key={tm.id}>
              <label className="block text-xs font-medium text-text-secondary mb-1">{tm.icon} {tm.label} (km/week)</label>
              <input
                type="number"
                min={0}
                max={500}
                value={numVal((answers.publicTransitModes as any)?.[tm.weeklyKmKey], false)}
                onChange={(e) => {
                  updateAnswers({
                    publicTransitModes: {
                      ...(answers.publicTransitModes || {}),
                      [tm.weeklyKmKey]: parseNum(e.target.value)
                    }
                  });
                }}
                className="w-full bg-surface border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flights (Detailed only) */}
      {mode === 'detailed' && (
        <FlightPlanner flights={flights} onChange={setFlights} />
      )}
    </div>
  );
}

// ─── Food Section (Multi-Select) ─────────────────────────────────────────────

function FoodSection({
  answers,
  updateAnswers,
}: {
  answers: any;
  updateAnswers: (u: any) => void;
}) {
  const dietMix: DietMixEntry[] = answers.dietMix || [];
  const totalWeight = dietMix.reduce((sum, d) => sum + d.weight, 0);

  const toggleCategory = (foodId: string) => {
    const category = FOOD_CATEGORIES.find(c => c.id === foodId);
    if (!category) return;
    
    const existing = dietMix.find(d => d.foodId === foodId);
    let updated: DietMixEntry[];

    if (existing) {
      // Remove
      updated = dietMix.filter(d => d.foodId !== foodId);
    } else {
      // Add with equal weight
      const newCount = dietMix.length + 1;
      const equalWeight = Math.round((1 / newCount) * 100) / 100;
      const newEntry: DietMixEntry = {
        foodId,
        weight: equalWeight,
        label: category.label,
      };
      updated = [...dietMix, newEntry];
      // Redistribute weights equally
      const redistributeWeight = Math.round((1 / updated.length) * 100) / 100;
      updated = updated.map(d => ({ ...d, weight: redistributeWeight }));
    }

    updateAnswers({ dietMix: updated });
  };

  const updateWeight = (foodId: string, weight: number) => {
    const updated = dietMix.map(d =>
      d.foodId === foodId ? { ...d, weight: Math.max(0, Math.min(1, weight)) } : d
    );
    updateAnswers({ dietMix: updated });
  };

  return (
    <div className="surface-matte p-6 rounded-2xl space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-700">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Diet & Food Habits</h3>
          <p className="text-xs text-dark-500">Select all categories that apply to your diet. Weight them by how much of your diet falls into each category. Based on ICAR & EAT-Lancet benchmarks.</p>
        </div>
      </div>

      {/* Multi-select food categories */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">Select your dietary categories:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FOOD_CATEGORIES.map(cat => {
            const isSelected = dietMix.some(d => d.foodId === cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                  isSelected
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-border bg-surface text-dark-500 hover:border-rose-300'
                }`}
              >
                <span className="text-base mr-1">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
                {isSelected && <span className="ml-1 text-rose-600">✓</span>}
                <p className="text-[10px] text-dark-500 mt-0.5">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weight sliders for selected categories */}
      {dietMix.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-dark-500">Adjust the proportion of your diet that falls into each category:</p>
          {dietMix.map(entry => {
            const category = FOOD_CATEGORIES.find(c => c.id === entry.foodId);
            if (!category) return null;
            const pct = Math.round(entry.weight * 100);
            return (
              <div key={entry.foodId} className="bg-panel rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-primary">{category.icon} {entry.label}</span>
                  <span className="text-xs font-bold text-rose-700">{pct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) => updateWeight(entry.foodId, parseInt(e.target.value) / 100)}
                  className="w-full h-1.5 rounded-full appearance-none bg-dark-100 accent-rose-500"
                />
              </div>
            );
          })}
          <p className="text-[10px] text-dark-500">
            Total: {Math.round(totalWeight * 100)}% · Emissions are weighted by proportion.
          </p>
        </div>
      )}

      {dietMix.length === 0 && (
        <p className="text-xs text-dark-500 text-center py-2">Select at least one dietary category above.</p>
      )}

      {/* Food waste and dining out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Food Waste Level</label>
          <select value={answers.foodWasteLevel || 'MODERATE'}
            onChange={(e) => updateAnswers({ foodWasteLevel: e.target.value as any })}
            className="w-full bg-surface border border-border focus:border-rose-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
          >
            <option value="LOW">{"Low (< 5% food wasted)"}</option>
            <option value="MODERATE">{"Moderate (5-15% wasted)"}</option>
            <option value="HIGH">{"High (> 15% wasted)"}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Dining Out (meals/week)</label>
          <input type="number" min={0} max={21} value={numVal(answers.diningOutMealsWeekly)}
            onChange={(e) => updateAnswers({ diningOutMealsWeekly: parseNumClamped('diningOutMealsWeekly', e.target.value, 1) })}
            className="w-full bg-surface border border-border focus:border-rose-500 rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Review Section ──────────────────────────────────────────────────────────

function ReviewSection({
  answers,
  mode,
  flights,
  appliances,
}: {
  answers: any;
  mode: string;
  flights: any[];
  appliances: any[];
}) {
  const transportEntries: TransportEntry[] = answers.transportEntries || [];
  const dietMix: DietMixEntry[] = answers.dietMix || [];

  const transportSummary = transportEntries.length > 0
    ? transportEntries.map(e => e.label).join(', ')
    : answers.ownsVehicle
    ? answers.vehicleCategoryKey?.replace(/_/g, ' ') || 'Yes'
    : 'No vehicle';

  const foodSummary = dietMix.length > 0
    ? dietMix.map(d => {
        const cat = FOOD_CATEGORIES.find(c => c.id === d.foodId);
        return `${cat?.label || d.foodId} (${Math.round(d.weight * 100)}%)`;
      }).join(', ')
    : answers.dietType?.replace(/_/g, ' ') || 'Not selected';

  return (
    <div className="surface-matte p-6 rounded-2xl space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Review Your Answers</h3>
      <p className="text-xs text-dark-500">Confirm your inputs before running the scientific calculation engine.</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-panel p-3 rounded-xl"><span className="text-dark-500">State:</span> <span className="text-text-primary ml-1">{answers.state}</span></div>
        <div className="bg-panel p-3 rounded-xl"><span className="text-dark-500">Mode:</span> <span className="text-text-primary ml-1 capitalize">{mode}</span></div>
        <div className="bg-panel p-3 rounded-xl col-span-2"><span className="text-dark-500">Transport:</span> <span className="text-text-primary ml-1">{transportSummary}</span></div>
        <div className="bg-panel p-3 rounded-xl col-span-2"><span className="text-dark-500">Diet:</span> <span className="text-text-primary ml-1">{foodSummary}</span></div>
        <div className="bg-panel p-3 rounded-xl"><span className="text-dark-500">Flights:</span> <span className="text-text-primary ml-1">{flights.length} routes</span></div>
        <div className="bg-panel p-3 rounded-xl"><span className="text-dark-500">Appliances:</span> <span className="text-text-primary ml-1">{appliances.length} tracked</span></div>
      </div>
    </div>
  );
}