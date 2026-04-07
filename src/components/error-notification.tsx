'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Wifi, Calculator, Info } from 'lucide-react';
import { AppError } from '@/hooks/use-error-handler';

interface ErrorNotificationProps {
  errors: AppError[];
  onRemoveError: (errorId: string) => void;
  onClearAll: () => void;
}

const getErrorIcon = (type: AppError['type']) => {
  switch (type) {
    case 'validation':
      return <AlertCircle className="w-5 h-5" />;
    case 'calculation':
      return <Calculator className="w-5 h-5" />;
    case 'network':
      return <Wifi className="w-5 h-5" />;
    case 'warning':
      return <Info className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

const getErrorColor = (type: AppError['type']) => {
  switch (type) {
    case 'validation':
      return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    case 'calculation':
      return 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300';
    case 'network':
      return 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300';
    case 'warning':
      return 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    default:
      return 'border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-300';
  }
};

export function ErrorNotification({ errors, onRemoveError, onClearAll }: ErrorNotificationProps) {
  const activeErrors = errors.filter(e => !e.resolved);

  if (activeErrors.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {activeErrors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`glass-card p-4 border-l-4 ${getErrorColor(error.type)} relative group`}
          >
            {/* 错误图标和消息 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getErrorIcon(error.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium">
                    {error.message}
                  </h4>
                  <button
                    onClick={() => onRemoveError(error.id)}
                    className="ml-2 flex-shrink-0 p-1 rounded hover:bg-white/20 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {error.details && (
                  <p className="text-xs mt-1 opacity-75">
                    {error.details}
                  </p>
                )}
                
                <div className="text-xs opacity-50 mt-2">
                  {error.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* 进度条（用于warning类型的自动消失） */}
            {error.type === 'warning' && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 清除所有按钮 */}
      {activeErrors.length > 1 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onClearAll}
          className="w-full glass-button text-sm py-2 mt-2 hover:bg-red-500/20"
        >
          清除所有 ({activeErrors.length})
        </motion.button>
      )}
    </div>
  );
} 