import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果焦点在输入框中，不处理快捷键
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const matchesModifiers = 
          (shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey) &&
          (shortcut.shift === undefined || shortcut.shift === event.shiftKey) &&
          (shortcut.alt === undefined || shortcut.alt === event.altKey) &&
          (shortcut.meta === undefined || shortcut.meta === event.metaKey);

        const matchesKey = shortcut.key.toLowerCase() === event.key.toLowerCase();

        if (matchesModifiers && matchesKey) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 预定义的快捷键配置
export const getDefaultShortcuts = (actions: {
  showHistory: () => void;
  showSettings: () => void;
  toggleTheme: () => void;
  switchToTraining: () => void;
  switchToInference: () => void;
  switchToFineTuning: () => void;
  switchToGRPO: () => void;
  switchToMultimodal: () => void;
  switchToNLP: () => void;
  showHelp: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'h',
    ctrl: true,
    action: actions.showHistory,
    description: '打开历史记录'
  },
  {
    key: 's',
    ctrl: true,
    shift: true,
    action: actions.showSettings,
    description: '打开设置面板'
  },
  {
    key: 't',
    ctrl: true,
    action: actions.toggleTheme,
    description: '切换深色/浅色主题'
  },
  {
    key: '1',
    ctrl: true,
    action: actions.switchToTraining,
    description: '切换到训练模式'
  },
  {
    key: '2',
    ctrl: true,
    action: actions.switchToInference,
    description: '切换到推理模式'
  },
  {
    key: '3',
    ctrl: true,
    action: actions.switchToFineTuning,
    description: '切换到微调模式'
  },
  {
    key: '4',
    ctrl: true,
    action: actions.switchToGRPO,
    description: '切换到GRPO模式'
  },
  {
    key: '5',
    ctrl: true,
    action: actions.switchToMultimodal,
    description: '切换到多模态模式'
  },
  {
    key: '6',
    ctrl: true,
    action: actions.switchToNLP,
    description: '切换到NLP模式'
  },
  {
    key: '?',
    action: actions.showHelp,
    description: '显示快捷键帮助'
  },
  {
    key: 'Escape',
    action: () => {
      // 关闭所有打开的面板
      const modals = document.querySelectorAll('[data-modal]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[data-close]') as HTMLElement;
        if (closeButton) closeButton.click();
      });
    },
    description: '关闭打开的面板'
  }
];
