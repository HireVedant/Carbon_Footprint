import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessment, AssessmentStep } from '../context/AssessmentContext';
import { useAuth } from '../context/AuthContext';
import { saveV2Assessment } from '../firebase/firestore';
import { LocationSelector } from '../components/calculator/LocationSelector';
import { VehicleSelector } from '../components/calculator/VehicleSelector';
import { FlightPlanner } from '../components/calculator/FlightPlanner';
import { ApplianceSelector } from '../components/calculator/ApplianceSelector';
import { ConfidenceBreakdownCard } from '../components/calculator/ConfidenceBadge';
import {
  MapPin, Car, Zap, UtensilsCrossed, Trash2, ShoppingBag,
  ClipboardCheck, Sparkles, Leaf, ChevronLeft, ChevronRight,
  Timer, FileText
} from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

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

  const handleCalculate = async () => {
    setCalculating(true);
    const computedResult = runCalculation();
    if (user) {
      try {
        const docId = await saveV2Assessment(user.uid, answers, computedResult, mode);
        setAssessmentId(docId);
      } catch (err) {
        console.error('Failed to auto-save assessment:', err);
      }
    }
    setCalculating(false);
  };

  // Skip steps in quick mode (waste & shopping are auto-estimated)
  const visibleSteps = mode === 'quick'
    ? STEPS.filter(s => !['waste', 'shopping'].includes(s.key))
    : STEPS;

  const currentVisibleIndex = visibleSteps.findIndex(s => s.key === currentStep);

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
    <div className="min-h-screen pt-24 pb-16 relative flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Calculation In Progress */}
        {calculating && (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
              <Leaf className="w-6 h-6 text-primary-400 absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
                Processing Assessment...
              </h3>
              <p className="text-sm text-dark-400">
                Scientific Calculation Engine v2.0 is processing your answers against CEA, ARAI, and ICAO datasets.
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
              highlight="Footprint"
              description="Scientific assessment powered by CEA, ARAI, and ICAO datasets."
            />

            {/* Total Emission Card */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl text-center space-y-4">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Annual Carbon Footprint</p>
              <p className="text-6xl font-bold text-white">{result.totalTonnesCO2PerYear} <span className="text-2xl text-gray-400 font-normal">tonnes CO₂e/year</span></p>
              <p className="text-sm text-gray-400">{result.totalKgCO2PerYear.toLocaleString()} kg CO₂e · Grid Factor: {result.metadata.gridFactorUsed} kg CO₂/kWh ({result.metadata.state})</p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(result.breakdown).map(([key, value]) => {
                const colors: Record<string, string> = {
                  energy: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  transport: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                  food: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                  waste: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                  shopping: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
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
                className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-sm font-medium"
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
              badge="Scientific Assessment v2.0"
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
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                <Timer className="w-4 h-4" /> Quick Assessment (2-3 min)
              </button>
              <button
                onClick={() => setMode('detailed')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  mode === 'detailed'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:border-gray-600'
                }`}
              >
                <FileText className="w-4 h-4" /> Detailed Assessment (8-10 min)
              </button>
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
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isPast
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 hover:text-gray-300'
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
                    <div className="space-y-6">
                      <VehicleSelector
                        ownsVehicle={!!answers.ownsVehicle}
                        vehicleCategoryKey={answers.vehicleCategoryKey || ''}
                        dailyVehicleKm={answers.dailyVehicleKm || 25}
                        vehicleOccupancy={answers.vehicleOccupancy || 1}
                        onOwnershipChange={(owns) => updateAnswers({ ownsVehicle: owns })}
                        onChange={(u) => updateAnswers(u)}
                      />

                      {/* Public Transit (Quick & Detailed) */}
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white">Public Transit Usage</h3>
                        <p className="text-xs text-gray-400">Approximate weekly kilometers by transit mode.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { key: 'metroKmWeekly', label: 'Metro (km/week)' },
                            { key: 'suburbanTrainKmWeekly', label: 'Local Train (km/week)' },
                            { key: 'busKmWeekly', label: 'City Bus (km/week)' },
                            { key: 'autoKmWeekly', label: 'Auto Rickshaw (km/week)' },
                            { key: 'taxiKmWeekly', label: 'Taxi / Ride-Hail (km/week)' }
                          ].map(tm => (
                            <div key={tm.key}>
                              <label className="block text-xs font-medium text-gray-300 mb-1">{tm.label}</label>
                              <input
                                type="number"
                                min={0}
                                max={500}
                                value={numVal((answers.publicTransitModes as any)?.[tm.key], false)}
                                onChange={(e) => {
                                  updateAnswers({
                                    publicTransitModes: {
                                      ...(answers.publicTransitModes || {}),
                                      [tm.key]: parseNum(e.target.value)
                                    }
                                  });
                                }}
                                className="w-full bg-gray-800/90 border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
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
                  )}

                  {currentStep === 'energy' && (
                    <div className="space-y-6">
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Household Energy</h3>
                            <p className="text-xs text-gray-400">Monthly electricity and cooking fuel usage.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Electricity */}
                          <div className="space-y-3">
                            <label className="block text-xs font-medium text-gray-300">Do you know your monthly kWh?</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/80 rounded-xl border border-gray-700/80">
                              <button type="button" onClick={() => updateAnswers({ electricityKWhKnown: true })}
                                className={`py-2 text-xs font-medium rounded-lg transition-all ${answers.electricityKWhKnown ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                              >Yes, exact kWh</button>
                              <button type="button" onClick={() => updateAnswers({ electricityKWhKnown: false })}
                                className={`py-2 text-xs font-medium rounded-lg transition-all ${!answers.electricityKWhKnown ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                              >No, bill amount</button>
                            </div>

                            {answers.electricityKWhKnown ? (
                              <div>
                                <label className="block text-[11px] text-gray-400 mb-1">Monthly kWh</label>
                                <input type="number" min={0} value={numVal(answers.electricityKWh, false)}
                                  onChange={(e) => updateAnswers({ electricityKWh: parseNum(e.target.value) })}
                                  className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[11px] text-gray-400 mb-1">Monthly Bill (₹)</label>
                                <input type="number" min={0} value={numVal(answers.monthlyBillRupees, false)}
                                  onChange={(e) => updateAnswers({ monthlyBillRupees: parseNum(e.target.value) })}
                                  className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                                />
                              </div>
                            )}
                          </div>

                          {/* Cooking fuel (Hidden for Hostel / PG) */}
                          {['HOSTEL', 'PG'].includes(answers.dwelling || '') ? (
                            <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 flex items-center gap-3">
                              <span className="text-xs text-amber-400">ℹ️ Cooking fuel & solar panel inputs skipped for Hostel/PG residents.</span>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-300">Cooking Fuel</label>
                                <select value={answers.cookingFuel || 'lpg'}
                                  onChange={(e) => updateAnswers({ cookingFuel: e.target.value as any })}
                                  className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                                >
                                  <option value="lpg">LPG Cylinder (14.2 kg)</option>
                                  <option value="png">Piped Natural Gas (PNG)</option>
                                  <option value="induction">Electric Induction</option>
                                  <option value="biomass">Biomass / Firewood</option>
                                </select>

                                <div>
                                  <label className="block text-[11px] text-gray-400 mb-1">Monthly consumption ({answers.cookingFuel === 'lpg' ? 'cylinders' : 'units'})</label>
                                  <input type="number" min={0} step={0.5} value={numVal(answers.cookingFuelConsumptionMonthly)}
                                    onChange={(e) => updateAnswers({ cookingFuelConsumptionMonthly: parseNum(e.target.value, 1) })}
                                    className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                                  />
                                </div>
                              </div>

                              {/* Solar */}
                              <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Solar Panels (kW capacity)</label>
                                <input type="number" min={0} step={0.5} value={numVal(answers.solarInstalledKw, false)}
                                  onChange={(e) => updateAnswers({ solarInstalledKw: parseNum(e.target.value) })}
                                  className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Enter 0 if no solar panels.</p>
                              </div>
                            </>
                          )}

                          {/* Household size */}
                          <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Household Members</label>
                            <input type="number" min={1} max={20} value={numVal(answers.householdMembers)}
                              onChange={(e) => updateAnswers({ householdMembers: parseNum(e.target.value, 1) })}
                              className="w-full bg-gray-800/90 border border-gray-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
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
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Diet & Food Habits</h3>
                          <p className="text-xs text-gray-400">Based on ICAR & EAT-Lancet India dietary benchmarks.</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">Dietary Pattern</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { value: 'vegan', label: 'Plant-Based Vegan' },
                            { value: 'lacto_vegetarian', label: 'Vegetarian (Indian Veg)' },
                            { value: 'eggetarian', label: 'Eggetarian' },
                            { value: 'pescatarian', label: 'Fish / Seafood' },
                            { value: 'chicken_moderate', label: 'Chicken (1-2x/week)' },
                            { value: 'mixed_non_veg', label: 'Mixed Non-Veg' },
                            { value: 'other_diet', label: 'Other' }
                          ].map(d => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => updateAnswers({ dietType: d.value as any })}
                              className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                                answers.dietType === d.value
                                  ? 'border-rose-500 bg-rose-500/10 text-white'
                                  : 'border-gray-700/60 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                              }`}
                            >{d.label}</button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">Food Waste Level</label>
                          <select value={answers.foodWasteLevel || 'MODERATE'}
                            onChange={(e) => updateAnswers({ foodWasteLevel: e.target.value as any })}
                            className="w-full bg-gray-800/90 border border-gray-700 focus:border-rose-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                          >
                            <option value="LOW">Low (&lt; 5% food wasted)</option>
                            <option value="MODERATE">Moderate (5-15% wasted)</option>
                            <option value="HIGH">High (&gt; 15% wasted)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">Dining Out (meals/week)</label>
                          <input type="number" min={0} max={21} value={numVal(answers.diningOutMealsWeekly)}
                            onChange={(e) => updateAnswers({ diningOutMealsWeekly: parseNum(e.target.value, 1) })}
                            className="w-full bg-gray-800/90 border border-gray-700 focus:border-rose-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 'waste' && (
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Waste Management</h3>
                          <p className="text-xs text-gray-400">Based on CPCB municipal solid waste benchmarks.</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { key: 'wasteSegregation', label: 'Do you segregate wet & dry waste?', value: answers.wasteSegregation },
                          { key: 'compostingOrganic', label: 'Do you compost organic / kitchen waste?', value: answers.compostingOrganic },
                          { key: 'recyclingDryWaste', label: 'Do you recycle plastic, paper, and e-waste?', value: answers.recyclingDryWaste }
                        ].map(q => (
                          <div key={q.key} className="flex items-center justify-between bg-gray-800/40 px-4 py-3 rounded-xl">
                            <span className="text-sm text-gray-300">{q.label}</span>
                            <div className="flex gap-2">
                              <button type="button"
                                onClick={() => updateAnswers({ [q.key]: true })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${q.value ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                              >Yes</button>
                              <button type="button"
                                onClick={() => updateAnswers({ [q.key]: false })}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!q.value ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                              >No</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 'shopping' && (
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Shopping & Consumption</h3>
                          <p className="text-xs text-gray-400">Estimate purchases from UNEP lifecycle factors.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Clothing items / month</label>
                          <input type="number" min={0} value={numVal(answers.apparelItemsMonthly)}
                            onChange={(e) => updateAnswers({ apparelItemsMonthly: parseNum(e.target.value, 1) })}
                            className="w-full bg-gray-800/90 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Electronics purchased / year</label>
                          <input type="number" min={0} step={0.5} value={numVal(answers.electronicsItemsYearly)}
                            onChange={(e) => updateAnswers({ electronicsItemsYearly: parseNum(e.target.value, 1) })}
                            className="w-full bg-gray-800/90 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Online parcels / month</label>
                          <input type="number" min={0} value={numVal(answers.onlineParcelsMonthly)}
                            onChange={(e) => updateAnswers({ onlineParcelsMonthly: parseNum(e.target.value, 4) })}
                            className="w-full bg-gray-800/90 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-gray-800/40 px-4 py-3 rounded-xl">
                          <span className="text-sm text-gray-300">Prefer second-hand?</span>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => updateAnswers({ preferSecondHand: true })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${answers.preferSecondHand ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                            >Yes</button>
                            <button type="button" onClick={() => updateAnswers({ preferSecondHand: false })}
                              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!answers.preferSecondHand ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                            >No</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 'review' && (
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
                      <h3 className="text-lg font-semibold text-white">Review Your Answers</h3>
                      <p className="text-xs text-gray-400">Confirm your inputs before running the scientific calculation engine.</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">State:</span> <span className="text-white ml-1">{answers.state}</span></div>
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">Mode:</span> <span className="text-white ml-1 capitalize">{mode}</span></div>
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">Vehicle:</span> <span className="text-white ml-1">{answers.ownsVehicle ? answers.vehicleCategoryKey?.replace(/_/g, ' ') || 'Yes' : 'No'}</span></div>
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">Diet:</span> <span className="text-white ml-1">{answers.dietType?.replace(/_/g, ' ')}</span></div>
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">Flights:</span> <span className="text-white ml-1">{flights.length} routes</span></div>
                        <div className="bg-gray-800/40 p-3 rounded-xl"><span className="text-gray-500">Appliances:</span> <span className="text-white ml-1">{appliances.length} tracked</span></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goPrevVisible}
                disabled={currentVisibleIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-800/80 text-gray-400 border border-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentStep === 'review' ? (
                <button
                  onClick={handleCalculate}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Calculate Footprint
                </button>
              ) : (
                <button
                  onClick={goNextVisible}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
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
