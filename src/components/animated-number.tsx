'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  // 防止 NaN/undefined/Infinity（localStorage 旧版本恢复时可能出现）
  const safeValue = (typeof value === 'number' && isFinite(value)) ? value : 0;

  const spring = useSpring(safeValue, { 
    stiffness: 100, 
    damping: 30, 
    mass: 1 
  });
  
  const display = useTransform(spring, (current) => {
    const safe = isFinite(current) ? current : 0;
    if (format) {
      return format(Math.round(safe * 10) / 10);
    }
    return (Math.round(safe * 10) / 10).toFixed(1);
  });

  useEffect(() => {
    spring.set(safeValue);
  }, [spring, safeValue]);

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
} 