import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Button from '../ui/Button';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isNextDisabled = false,
  isLoading = false,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          className="flex-1 sm:flex-initial"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}

      <Button
        type="button"
        variant="primary"
        onClick={onNext}
        disabled={isNextDisabled}
        isLoading={isLoading}
        className="flex-1 sm:flex-initial"
      >
        {isLastStep ? (
          <>
            Calculate Footprint
            <Check className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};
