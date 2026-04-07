'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', icon: Sun, label: '浅色' },
    { value: 'dark', icon: Moon, label: '深色' },
    { value: 'system', icon: Monitor, label: '跟随系统' }
  ] as const;

  return (
    <div className="flex items-center gap-1 glass-card p-1 rounded-xl">
      {themeOptions.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative p-2 rounded-lg transition-all duration-200
            ${theme === value
              ? 'bg-white/30 dark:bg-white/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={label}
        >
          <Icon className="w-4 h-4" />
          {theme === value && (
            <motion.div
              className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg"
              layoutId="theme-indicator"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

// 简单的切换按钮（只在浅色/深色间切换）
export function SimpleThemeToggle() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="glass-button p-3 rounded-xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`切换到${actualTheme === 'light' ? '深色' : '浅色'}模式`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: actualTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {actualTheme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  );
} 