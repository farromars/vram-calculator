'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

function formatKeyCombo(shortcut: KeyboardShortcut) {
  const keys = [];
  
  if (shortcut.ctrl) keys.push('Ctrl');
  if (shortcut.shift) keys.push('Shift');
  if (shortcut.alt) keys.push('Alt');
  if (shortcut.meta) keys.push('Cmd');
  
  // 格式化主按键
  let mainKey = shortcut.key;
  if (mainKey === ' ') mainKey = 'Space';
  if (mainKey === 'Escape') mainKey = 'Esc';
  if (mainKey === '?') mainKey = '?';
  
  keys.push(mainKey);
  
  return keys;
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-modal="keyboard-help"
          />
          
          {/* 帮助面板 */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-glass">
              {/* 标题栏 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl glass-card">
                    <Keyboard className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold">键盘快捷键</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  data-close="true"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 快捷键列表 */}
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  使用以下快捷键可以快速操作计算器：
                </div>
                
                {shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {formatKeyCombo(shortcut).map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-mono bg-white/30 dark:bg-white/20 border border-white/40 dark:border-white/30 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < formatKeyCombo(shortcut).length - 1 && (
                            <span className="mx-1 text-xs text-gray-500">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 底部提示 */}
              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium mb-1">💡 提示</div>
                  <div>快捷键在输入框焦点时会自动禁用，避免冲突。按 <kbd className="px-1 py-0.5 text-xs bg-blue-500/20 rounded">Esc</kbd> 可关闭任何打开的面板。</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 