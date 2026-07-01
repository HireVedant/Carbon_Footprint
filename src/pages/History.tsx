import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf,
  Trash2,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getUserCalculations,
  deleteCalculation,
  type SavedCalculation,
} from "../firebase/firestore";

import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserCalculations(user.uid);
        setCalculations(data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load your calculation history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [authLoading, user, navigate]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this calculation permanently?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await deleteCalculation(id);

      setCalculations((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete the calculation.");
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function ecoColor(score: number) {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    if (score >= 30) return "text-orange-400";
    return "text-red-400";
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
            <Leaf className="absolute inset-0 m-auto w-6 h-6 text-primary-400 animate-pulse" />
          </div>

          <p className="text-dark-400">
            Loading calculation history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          badge="Track Progress"
          title="Calculation"
          highlight="History"
          description="Review your previous carbon footprint calculations and monitor your environmental impact over time."
        />

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />

            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {calculations.length === 0 ? (
          <div className="glass-strong rounded-3xl p-10 text-center max-w-2xl mx-auto">
            <Leaf className="w-10 h-10 mx-auto text-primary-400 mb-4" />

            <h2 className="text-xl font-semibold mb-2">
              No Calculations Found
            </h2>

            <p className="text-dark-400 mb-8">
              Complete your first carbon footprint assessment to begin tracking
              your environmental impact.
            </p>

            <Button
              variant="primary"
              onClick={() => navigate("/calculator")}
            >
              Start Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {calculations.map((calculation) => (
              <motion.div
                key={calculation.id}
                layout
                className="glass rounded-2xl p-6 border border-white/10"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {formatDate(calculation.date)}
                      </h3>

                      <p
                        className={`font-semibold ${ecoColor(
                          calculation.ecoScore
                        )}`}
                      >
                        Eco Score {calculation.ecoScore}
                      </p>

                      <p className="text-dark-400 text-sm">
                        {calculation.ecoLabel}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div>
                      <p className="text-xs text-dark-400">Transport</p>
                      <p>{calculation.transportEmission.toFixed(2)} kg</p>
                    </div>

                    <div>
                      <p className="text-xs text-dark-400">Energy</p>
                      <p>{calculation.energyEmission.toFixed(2)} kg</p>
                    </div>

                    <div>
                      <p className="text-xs text-dark-400">Food</p>
                      <p>{calculation.foodEmission.toFixed(2)} kg</p>
                    </div>

                    <div>
                      <p className="text-xs text-dark-400">Waste</p>
                      <p>{calculation.wasteEmission.toFixed(2)} kg</p>
                    </div>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">
                      <p className="text-xs text-dark-400">
                        Annual Estimate
                      </p>

                      <p className="font-bold flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-primary-400" />
                        {calculation.annualEstimate.toFixed(2)} t
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(calculation.id)}
                      disabled={deleting === calculation.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition"
                    >
                      {deleting === calculation.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}