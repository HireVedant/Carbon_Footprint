import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { viewport } from '../../design/motion';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewport}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="glass text-center p-6 group hover:bg-white/[0.08] rounded-2xl transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-primary-400" aria-hidden="true" />
      </div>
      <p className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 tabular-nums">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-dark-400 font-medium">{label}</p>
    </motion.div>
  );
}