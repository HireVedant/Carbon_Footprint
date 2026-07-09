import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserCalculations, SavedCalculation, deleteCalculation } from '../firebase/firestore';
import { History as HistoryIcon, Calendar, Leaf, AlertTriangle, Loader2, Trash2 } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    if (user) {
      setLoading(true);
      getUserCalculations(user.uid)
        .then(data => setHistory(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (calculationId: string | undefined) => {
    if (!calculationId || !user) return;
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteCalculation(calculationId, user.uid);
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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="text-primary-400 w-8 h-8" />
            Calculation <span className="gradient-text">History</span>
          </h1>
          <p className="text-sm text-dark-400 mt-2">
            Review your past carbon footprint assessments and track your environmental journey.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="glass-strong p-10 rounded-3xl text-center max-w-2xl mx-auto mt-10">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No History Found</h2>
            <p className="text-dark-400 text-sm">
              You haven't completed any carbon footprint calculations yet. Head over to the calculator to get started!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((calc, i) => (
              <div key={calc.calculationId || i} className="glass p-6 rounded-2xl flex flex-col group hover:border-primary-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-dark-300">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    {calc.date}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    calc.ecoScore >= 85 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    calc.ecoScore >= 70 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                    calc.ecoScore >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                    calc.ecoScore >= 30 ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                    'text-red-400 border-red-500/30 bg-red-500/10'
                  }`}>
                    {calc.ecoLabel || `Score: ${calc.ecoScore}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-3xl font-display font-bold text-white">
                    {calc.annualEstimate} <span className="text-lg text-dark-400">Tons</span>
                  </h3>
                  <button 
                    onClick={() => handleDelete(calc.calculationId)}
                    className="p-2 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/10 space-y-2 text-sm text-dark-300">
                  <div className="flex justify-between">
                    <span>Transport</span>
                    <span className="text-white">{Math.round(calc.transportEmission)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy</span>
                    <span className="text-white">{Math.round(calc.energyEmission)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food</span>
                    <span className="text-white">{Math.round(calc.foodEmission)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste</span>
                    <span className="text-white">{Math.round(calc.wasteEmission)} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
