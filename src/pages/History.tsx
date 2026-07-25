import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnifiedUserHistory, UnifiedHistoryItem, softDeleteAssessment, deleteCalculation } from '../firebase/firestore';
import { History as HistoryIcon, Calendar, Leaf, AlertTriangle, Loader2, Trash2, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (item: UnifiedHistoryItem) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        if (item.isV2) {
          await softDeleteAssessment(user.uid, item.id);
        } else {
          await deleteCalculation(item.id, user.uid);
        }
        fetchHistory();
      } catch (err) {
        console.error('Failed to delete report', err);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <HistoryIcon className="text-primary-400 w-8 h-8" />
              Assessment <span className="gradient-text">History</span>
            </h1>
            <p className="text-sm text-dark-400 mt-2">
              Review your past carbon footprint assessments and track your environmental progress over time.
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:opacity-90 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" /> Take New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-strong p-10 rounded-3xl text-center max-w-2xl mx-auto mt-10 space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">No Assessment History Found</h2>
            <p className="text-dark-400 text-sm">
              You haven't completed any carbon footprint assessments yet. Complete an assessment to see your progress tracked here!
            </p>
            <Link
              to="/assessment"
              className="inline-block px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all mt-2"
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
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MemoizedHistoryItem = React.memo(({ item, onDelete }: { item: UnifiedHistoryItem, onDelete: (item: UnifiedHistoryItem) => void }) => {
  return (
    <div className="glass p-6 rounded-2xl flex flex-col group hover:border-primary-500/30 transition-all space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-xs font-semibold text-dark-300">
          <Calendar className="w-4 h-4 text-primary-400" />
          {item.date}
          {item.isV2 && (
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">v2.0</span>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${
          item.ecoScore >= 85 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
          item.ecoScore >= 70 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
          item.ecoScore >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
          item.ecoScore >= 30 ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
          'text-red-400 border-red-500/30 bg-red-500/10'
        }`}>
          Score: {item.ecoScore}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-display font-bold text-white">
            {item.totalTonnesCO2} <span className="text-lg text-dark-400 font-normal">tonnes CO₂e</span>
          </h3>
          <p className="text-xs text-dark-400 mt-0.5">{item.totalKgCO2.toLocaleString()} kg CO₂e/year</p>
        </div>
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Delete Report"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 space-y-2 text-sm text-dark-300">
        <div className="flex justify-between">
          <span>Transport</span>
          <span className="text-white font-medium">{item.breakdown.transport.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Energy</span>
          <span className="text-white font-medium">{item.breakdown.energy.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Food</span>
          <span className="text-white font-medium">{item.breakdown.food.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Waste</span>
          <span className="text-white font-medium">{item.breakdown.waste.toLocaleString()} kg</span>
        </div>
        {item.breakdown.shopping !== undefined && (
          <div className="flex justify-between">
            <span>Shopping</span>
            <span className="text-white font-medium">{item.breakdown.shopping.toLocaleString()} kg</span>
          </div>
        )}
      </div>
    </div>
  );
});
