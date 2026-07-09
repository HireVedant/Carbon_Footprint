import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Toast({ type, message }: ToastProps) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    }
  };

  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? CheckCircle2 : XCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-4 border ${getStyles()}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {message}
    </motion.div>
  );
}
