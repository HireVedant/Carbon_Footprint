import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculator } from '../context/CalculatorContext';
import { ProgressBar } from '../components/calculator/ProgressBar';
import { StepHeader } from '../components/calculator/StepHeader';
import { TransportForm } from '../components/calculator/steps/TransportForm';
import { EnergyForm } from '../components/calculator/steps/EnergyForm';
import { FoodForm } from '../components/calculator/steps/FoodForm';
import { WasteForm } from '../components/calculator/steps/WasteForm';
import { ReviewCard } from '../components/calculator/ReviewCard';
import { NavigationButtons } from '../components/calculator/NavigationButtons';
import { CalculationSummary } from '../components/calculator/CalculationSummary';
import { Sparkles, Leaf } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const stepDetails = [
  {
    title: 'Transportation Commute',
    description: 'Tell us about your daily commute and travel habits.',
  },
  {
    title: 'Household Energy',
    description: 'Provide information on your domestic electricity and cooking fuel.',
  },
  {
    title: 'Diet & Food Sourcing',
    description: 'Share your food consumption habits and waste generation details.',
  },
  {
    title: 'Waste & Consumption',
    description: 'Help us understand your household waste disposal and shopping frequency.',
  },
  {
    title: 'Review Survey Responses',
    description: 'Review your entered data before triggering the carbon footprint engine.',
  },
];

export default function Calculator() {
  const { isCalculated, calculate } = useCalculator();
  const [step, setStep] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      // Step 5: Trigger calculation
      setCalculating(true);
      setTimeout(() => {
        calculate();
        setCalculating(false);
      }, 1500); // Premium calculation delay animation
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const renderStepForm = () => {
    switch (step) {
      case 1:
        return <TransportForm key="transport-form" setIsValid={setIsValid} />;
      case 2:
        return <EnergyForm key="energy-form" setIsValid={setIsValid} />;
      case 3:
        return <FoodForm key="food-form" setIsValid={setIsValid} />;
      case 4:
        return <WasteForm key="waste-form" setIsValid={setIsValid} />;
      case 5:
        return <ReviewCard key="review-card" onJumpToStep={jumpToStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative flex flex-col justify-center">
      {/* Background patterns */}
      <div className="absolute inset-0 mesh-bg" />
      
      {/* Glow ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {!isCalculated && (
          <SectionHeading
            badge="Footprint Survey"
            title="Calculate Your"
            highlight="Carbon Footprint"
            description="Measure your environmental impact in real-time. Answer a few lifestyle questions to see your carbon score."
          />
        )}

        <div className="w-full">
          {calculating ? (
            <div className="max-w-md mx-auto text-center py-20 space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <Leaf className="w-6 h-6 text-primary-400 absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
                  Calculating Footprint...
                </h3>
                <p className="text-sm text-dark-400">
                  Our Carbon Intelligence Engine is processing your answers against standard emission factors.
                </p>
              </div>
            </div>
          ) : isCalculated ? (
            <CalculationSummary />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto glass-strong p-6 sm:p-10 rounded-3xl"
            >
              {/* Wizard Steps Progress bar */}
              <ProgressBar currentStep={step} totalSteps={5} />

              {/* Step Header */}
              <StepHeader
                stepNumber={step}
                title={stepDetails[step - 1].title}
                description={stepDetails[step - 1].description}
              />

              {/* Survey Content Form */}
              <div className="min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepForm()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Wizard Actions */}
              <NavigationButtons
                currentStep={step}
                totalSteps={5}
                onPrev={handlePrev}
                onNext={handleNext}
                isNextDisabled={!isValid && step < 5}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
