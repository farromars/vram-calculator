'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="glass-button p-3 rounded-xl flex items-center gap-2"
      title={t('nav.language')}
    >
      <Languages className="w-5 h-5" />
      <span className="font-medium text-sm">
        {language === 'zh' ? 'EN' : '中文'}
      </span>
    </button>
  );
} 