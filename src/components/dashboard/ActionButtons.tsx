import React, { useState } from 'react';
import { RefreshCw, Download, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCalculator } from '../../context/CalculatorContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { generateCarbonReport } from '../../utils/reportGenerator';
import Toast, { ToastProps } from '../ui/Toast';
import { AnimatePresence } from 'framer-motion';

export const ActionButtons: React.FC = () => {
  const navigate  = useNavigate();
  const { results, isCalculated, resetCalculator } = useCalculator();
  const { user, userProfile } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRecalculate = () => {
    resetCalculator();
    navigate('/calculator');
  };

  const handleDownloadReport = async () => {
    if (!isCalculated || !results) {
      showToast('error', 'No report available. Please complete the carbon calculator first.');
      return;
    }

    setIsGenerating(true);
    setToast(null);

    try {
      const reportUser = {
        name:  userProfile?.name || user?.displayName || 'Eco User',
        email: userProfile?.email || user?.email || '',
      };
      // Simulate slight delay for async generation feel
      await new Promise(resolve => setTimeout(resolve, 800));
      generateCarbonReport(results, reportUser);
      showToast('success', 'Report downloaded successfully!');
    } catch (err) {
      showToast('error', 'Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 space-y-3 relative">
      <AnimatePresence>
        {toast && (
          <div className="absolute -top-16 left-0 right-0 z-50">
            <Toast type={toast.type} message={toast.message} />
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-start gap-3">
        <Button
          variant="secondary"
          onClick={handleRecalculate}
          className="w-full sm:w-auto"
          id="action-recalculate"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recalculate Footprint
        </Button>

        <Button
          variant={isCalculated ? 'primary' : 'secondary'}
          onClick={handleDownloadReport}
          disabled={!isCalculated || isGenerating}
          className="w-full sm:w-auto"
          id="action-download-report"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/calculator')}
          className="w-full sm:w-auto"
          id="action-ai-advice"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View AI Advice
        </Button>
      </div>

      {/* "No report" message */}
      {!isCalculated && (
        <p className="text-xs text-dark-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          No report available. Complete the carbon calculator to generate a report.
        </p>
      )}
    </div>
  );
};
