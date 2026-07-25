import React, { useState } from 'react';
import { RefreshCw, Download, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { generateCarbonReport } from '../../utils/reportGenerator';
import Toast, { ToastProps } from '../ui/Toast';
import { AnimatePresence, motion } from 'framer-motion';
import { logAuditAction } from '../../services/auditService';

export const ActionButtons: React.FC<{ historyDocs?: any[] }> = ({ historyDocs = [] }) => {
  const navigate = useNavigate();
  const { result: results, answers, isCalculated, resetAssessment } = useAssessment();
  const { user, userProfile } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRecalculate = () => {
    resetAssessment();
    navigate('/assessment');
  };

  const handleDownloadReport = async () => {
    if (!user) {
      showToast('error', 'You must be logged in to download a report.');
      return;
    }

    if (!isCalculated || !results) {
      showToast('error', 'No report available. Please complete the carbon calculator first.');
      return;
    }

    // Security Check: Ensure all history docs belong to the current user
    const hasForeignData = historyDocs.some(doc => doc.userId !== user.uid && doc.userId !== undefined);
    if (hasForeignData) {
      void logAuditAction(user.uid, user.email || '', 'REPORT_GENERATION_FAILURE', 'historyDocs', { reason: 'Data boundary violation attempt' });
      showToast('error', 'Security error: Unauthorized data access prevented.');
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
      
      await generateCarbonReport(results, reportUser, { answers, historyDocs });
      
      showToast('success', 'Report downloaded successfully!');
    } catch (err: any) {
      void logAuditAction(user.uid, user.email || '', 'REPORT_GENERATION_FAILURE', 'generateCarbonReport', { error: err.message || 'Unknown error' });
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

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Button
            variant={isCalculated ? 'primary' : 'secondary'}
            onClick={handleDownloadReport}
            disabled={!isCalculated || isGenerating}
            className={`w-full sm:w-auto transition-all duration-300 ${isCalculated ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 shadow-lg shadow-emerald-500/20 text-white' : ''}`}
            id="action-download-report"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Scientific Report…
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Scientific Report
              </>
            )}
          </Button>
        </motion.div>

        <Button
          variant="secondary"
          onClick={() => navigate('/assessment')}
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

