import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserCalculations } from '../firebase/firestore';
import { User, Mail, Calendar, Leaf, TrendingUp, LogOut, Loader, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';

interface CalculationRecord {
  annualEstimate: number;
  ecoScore: number;
}

export default function Profile() {
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (authLoading) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        if (user?.uid) {
          const calcs = await getUserCalculations(user.uid);
          setCalculations(calcs as CalculationRecord[]);
        }
      } catch (err: any) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
      setLoggingOut(false);
    }
  };

  const formatDate = (dateStr: string | any) => {
    try {
      const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  // Calculate statistics
  const totalCalculations = calculations.length;
  const averageEmissions =
    totalCalculations > 0
      ? (calculations.reduce((sum, c) => sum + c.annualEstimate, 0) / totalCalculations).toFixed(2)
      : '0';
  const averageEcoScore =
    totalCalculations > 0
      ? Math.round(calculations.reduce((sum, c) => sum + c.ecoScore, 0) / totalCalculations)
      : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
            <Leaf className="w-6 h-6 text-primary-400 absolute animate-pulse" />
          </div>
          <p className="text-dark-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          badge="Account"
          title="Your"
          highlight="Profile"
          description="View your account information and sustainability statistics."
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-8 rounded-3xl"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative">
                <img
                  src={userProfile?.photo || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={user?.displayName || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/30"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/0 to-primary-500/10" />
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {userProfile?.name || user?.displayName || 'User'}
                </h1>
                <p className="text-dark-400 flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <p className="text-sm text-dark-400 flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(userProfile?.createdAt || user?.metadata?.creationTime)}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account Status</h2>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">
                  {user?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="glass p-6 rounded-2xl text-center border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                <Leaf className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-dark-400 mb-1">Total Calculations</p>
              <p className="text-3xl font-bold text-white">{totalCalculations}</p>
            </div>

            <div className="glass p-6 rounded-2xl text-center border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-3">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm text-dark-400 mb-1">Average Emissions</p>
              <p className="text-3xl font-bold text-white">{averageEmissions}t</p>
            </div>

            <div className="glass p-6 rounded-2xl text-center border border-white/10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-3">
                <span className="text-xl font-bold text-emerald-400">{averageEcoScore}</span>
              </div>
              <p className="text-sm text-dark-400 mb-1">Average Eco Score</p>
              <p className="text-3xl font-bold text-white">{averageEcoScore}</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/calculator')}
                variant="primary"
                className="flex-1"
              >
                <Leaf className="w-4 h-4 mr-2" />
                New Calculation
              </Button>
              <Button
                onClick={() => navigate('/history')}
                variant="secondary"
                className="flex-1"
              >
                View History
              </Button>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleLogout}
              disabled={loggingOut}
              variant="secondary"
              className="w-full border-red-500/20 hover:border-red-500/50 hover:text-red-400"
            >
              {loggingOut ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}