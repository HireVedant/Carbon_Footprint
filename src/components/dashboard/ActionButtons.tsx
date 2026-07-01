import React from 'react';
import { RefreshCw, Download, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalculator } from '../../context/CalculatorContext';
import Button from '../ui/Button';

export const ActionButtons: React.FC = () => {
  const navigate = useNavigate();
  const { resetCalculator } = useCalculator();

  const handleRecalculate = () => {
    resetCalculator();
    navigate('/calculator');
  };

  const triggerPlaceholder = (moduleName: string) => {
    alert(`${moduleName} integration is scheduled for future development phases.`);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-start gap-3 mt-8">
      <Button
        variant="secondary"
        onClick={handleRecalculate}
        className="w-full sm:w-auto"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Recalculate Footprint
      </Button>

      <Button
        variant="secondary"
        onClick={() => triggerPlaceholder('Download Report')}
        className="w-full sm:w-auto"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Report
      </Button>

      <Button
        variant="secondary"
        onClick={() => triggerPlaceholder('AI Recommendations Coach')}
        className="w-full sm:w-auto"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        View AI Advice
      </Button>

      <Button
        variant="primary"
        onClick={() => triggerPlaceholder('Progress Tracking & Goals')}
        className="w-full sm:w-auto"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Track Progress
      </Button>
    </div>
  );
};
