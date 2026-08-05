import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnifiedUserHistory, UnifiedHistoryItem, softDeleteAssessment, deleteCalculation } from '../firebase/firestore';
import { History as HistoryIcon, Calendar, AlertTriangle, Loader2, Trash2, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { surface, emerald, fontFamily, radius, semantic, ecoScore, carbon } from '../design';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = () => {
    if (user) {
      setLoading(true);
      getUnifiedUserHistory(user.uid)
        .then(data => setHistory(data))
        .catch(err => console.error('Failed to load history:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async () => {
    if (!user || !deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.isV2) {
        await softDeleteAssessment(user.uid, deleteTarget.id);
      } else {
        await deleteCalculation(deleteTarget.id, user.uid);
      }
      setDeleteTarget(null);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete report', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
              <HistoryIcon style={{ color: emerald[600] }} className="w-8 h-8" />
              Assessment <span className="gradient-text">History</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: surface.textSecondary }}>
              Review your past carbon footprint assessments and track your environmental progress over time.
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" /> Take New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: emerald[600] }} />
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center max-w-2xl mx-auto mt-10 space-y-4" style={{ background: surface.panel, border: `1px solid ${surface.border}`, borderRadius: radius['2xl'] }}>
            <AlertTriangle className="w-12 h-12 mx-auto" style={{ color: semantic.warning }} />
            <h2 className="text-xl font-bold" style={{ color: surface.textPrimary }}>No Assessment History Found</h2>
            <p className="text-sm" style={{ color: surface.textSecondary }}>
              You haven't completed any carbon footprint assessments yet. Complete an assessment to see your progress tracked here!
            </p>
            <Link
              to="/assessment"
              className="inline-block px-6 py-3 rounded-xl text-sm font-medium transition-all mt-2"
              style={{ background: `${emerald[600]}12`, color: emerald[700], border: `1px solid ${emerald[600]}30` }}
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <MemoizedHistoryItem 
                key={item.id} 
                item={item} 
                onDelete={(item) => setDeleteTarget(item)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => !deleting && setDeleteTarget(null)}
          >
      <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="p-6 rounded-2xl max-w-sm w-full space-y-4"
            style={{ background: surface.panel, border: `1px solid ${surface.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: surface.textPrimary }}>Delete Report</h3>
              <button onClick={() => setDeleteTarget(null)} style={{ color: surface.textSecondary }} className="hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm" style={{ color: surface.textSecondary }}>
              Are you sure you want to delete the assessment from <strong style={{ color: surface.textPrimary }}>{deleteTarget.date}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: surface.base, color: surface.textSecondary, border: `1px solid ${surface.border}` }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{ background: carbon.danger }}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MemoizedHistoryItem = React.memo(({ item, onDelete }: { item: UnifiedHistoryItem, onDelete: (item: UnifiedHistoryItem) => void }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return ecoScore.excellent;
    if (score >= 70) return ecoScore.great;
    if (score >= 50) return ecoScore.amber;
    if (score >= 30) return ecoScore.high;
    return ecoScore.critical;
  };

  return (
    <div className="p-6 rounded-2xl flex flex-col group transition-all space-y-4" style={{ background: surface.panel, border: `1px solid ${surface.border}` }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: surface.textSecondary }}>
          <Calendar className="w-4 h-4" style={{ color: emerald[600] }} />
          {item.date}
          {item.isV2 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${emerald[600]}12`, color: emerald[700], border: `1px solid ${emerald[600]}30` }}>v2.0</span>
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ 
          color: getScoreColor(item.ecoScore),
          border: `1px solid ${getScoreColor(item.ecoScore)}40`,
          background: `${getScoreColor(item.ecoScore)}1A`
        }}>
          Score: {item.ecoScore}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold" style={{ fontFamily: fontFamily.display, color: surface.textPrimary }}>
            {item.totalTonnesCO2} <span className="text-lg font-normal" style={{ color: surface.textSecondary }}>tonnes CO₂e</span>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: surface.textSecondary }}>{item.totalKgCO2.toLocaleString()} kg CO₂e/year</p>
        </div>
        <button
          onClick={() => onDelete(item)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: surface.textSecondary }}
          title="Delete Report"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto pt-4 space-y-2 text-sm" style={{ borderTop: `1px solid ${surface.border}`, color: surface.textSecondary }}>
        <div className="flex justify-between">
          <span>Transport</span>
          <span className="font-medium" style={{ color: surface.textPrimary }}>{item.breakdown.transport.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Energy</span>
          <span className="font-medium" style={{ color: surface.textPrimary }}>{item.breakdown.energy.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Food</span>
          <span className="font-medium" style={{ color: surface.textPrimary }}>{item.breakdown.food.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Waste</span>
          <span className="font-medium" style={{ color: surface.textPrimary }}>{item.breakdown.waste.toLocaleString()} kg</span>
        </div>
        {item.breakdown.shopping !== undefined && (
          <div className="flex justify-between">
            <span>Shopping</span>
            <span className="font-medium" style={{ color: surface.textPrimary }}>{item.breakdown.shopping.toLocaleString()} kg</span>
          </div>
        )}
      </div>
    </div>
  );
});
