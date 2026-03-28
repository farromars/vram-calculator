'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Calculator, Cpu, Zap, History, Star, Users, MessageSquare, Image, HelpCircle } from 'lucide-react';
import { useCalculatorStore } from '@/store/calculator-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZH } from '@/lib/i18n';
import dynamic from 'next/dynamic';
import { GPURecommendations } from '@/components/gpu-recommendations';

const TrainingCalculator = dynamic(
  () => import('@/components/calculators/training-calculator').then(mod => ({ default: mod.TrainingCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const InferenceCalculator = dynamic(
  () => import('@/components/calculators/inference-calculator').then(mod => ({ default: mod.InferenceCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const FineTuningCalculator = dynamic(
  () => import('@/components/calculators/fine-tuning-calculator').then(mod => ({ default: mod.FineTuningCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const GRPOCalculator = dynamic(
  () => import('@/components/calculators/grpo-calculator').then(mod => ({ default: mod.GRPOCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const AdvancedFineTuningCalculator = dynamic(
  () => import('@/components/calculators/advanced-fine-tuning-calculator').then(mod => ({ default: mod.AdvancedFineTuningCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const MultimodalCalculator = dynamic(
  () => import('@/components/calculators/multimodal-calculator').then(mod => ({ default: mod.MultimodalCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const HistoryPanel = dynamic(() => import('@/components/history-panel'), {
  loading: () => null,
});
const ConfigPresetsPanel = dynamic(() => import('@/components/config-presets-panel').then(mod => ({ default: mod.ConfigPresetsPanel })), {
  loading: () => null,
});

export default function Home() {
  const {
    primaryTab, setPrimaryTab,
    activeTab, setActiveTab,
    getCurrentResult,
    history, compareList,
    multimodalConfig, setMultimodalConfig
  } = useCalculatorStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // 初始化语言为中文
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', 'zh');
    }
  }, []);

  // 监听语言切换，重新计算
  useEffect(() => {
    const handleLanguageChange = () => {
      setTimeout(() => {
        if (primaryTab === 'multimodal') {
          useCalculatorStore.getState().calculateMultimodalMemory();
        } else {
          const state = useCalculatorStore.getState();
          switch (activeTab) {
            case 'training': state.calculateTrainingMemory(); break;
            case 'inference': state.calculateInferenceMemory(); break;
            case 'finetuning': state.calculateFineTuningMemory(); break;
            case 'grpo': state.calculateGRPOMemory(); break;
          }
        }
      }, 100);
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [primaryTab, activeTab]);

  const currentResult = getCurrentResult();
  const requiredMemoryGB = currentResult ? currentResult.total : 25;

  const getTabLabel = () => {
    if (primaryTab === 'multimodal') {
      const modeLabels: Record<string, string> = { training: '训练', inference: '推理', finetuning: '微调' };
      return `多模态模型 - ${modeLabels[multimodalConfig.mode] || '推理'}`;
    }
    const tabLabels: Record<string, string> = { training: '训练', inference: '推理', finetuning: '微调', grpo: 'GRPO' };
    return `NLP模型 - ${tabLabels[activeTab] || '推理'}`;
  };

  return (
    <div className="min-h-screen bg-tc-bg-page">
      {/* 顶部导航栏 */}
      <nav className="tc-navbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-tc-text-primary">{ZH.site.title}</h1>
          <span className="text-xs text-tc-text-placeholder hidden md:inline">{ZH.site.subtitle}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/help" className="glass-button flex items-center gap-1.5 text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>{ZH.nav.help}</span>
          </Link>
          <button onClick={() => setShowPresets(true)} className="glass-button flex items-center gap-1.5 text-sm">
            <Star className="w-4 h-4" />
            <span>{ZH.nav.presets}</span>
          </button>
          <button onClick={() => setShowHistory(true)} className="glass-button flex items-center gap-1.5 text-sm relative">
            <History className="w-4 h-4" />
            <span>{ZH.nav.history}</span>
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand text-white text-[10px] rounded-full flex items-center justify-center">
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>
          {compareList.length > 0 && (
            <button onClick={() => setShowHistory(true)} className="glass-button flex items-center gap-1.5 text-sm border-brand text-brand">
              <span>对比 ({compareList.length})</span>
            </button>
          )}
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-[72px] pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面描述 */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-tc-text-secondary text-sm max-w-2xl mx-auto">
              {ZH.site.description}
            </p>
          </motion.div>

          {/* 主分组标签页 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Tabs value={primaryTab} onValueChange={(v) => setPrimaryTab(v as typeof primaryTab)} className="w-full">
              <div className="flex justify-center mb-5">
                <TabsList className="grid w-full max-w-xl grid-cols-3 bg-tc-bg-secondary rounded-lg p-1">
                  <TabsTrigger value="nlp" className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{ZH.tabs.nlp}</span>
                  </TabsTrigger>
                  <TabsTrigger value="multimodal" className="flex items-center gap-2 text-sm">
                    <Image className="w-4 h-4" />
                    <span>{ZH.tabs.multimodal}</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4" />
                    <span>{ZH.tabs.advanced}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* NLP模型组 */}
              <TabsContent value="nlp" className="space-y-5">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
                  <div className="flex justify-center mb-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-tc-bg-secondary rounded-lg p-1">
                      <TabsTrigger value="inference" className="flex items-center gap-1.5 text-sm">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.inference}</span>
                      </TabsTrigger>
                      <TabsTrigger value="finetuning" className="flex items-center gap-1.5 text-sm">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.finetuning}</span>
                      </TabsTrigger>
                      <TabsTrigger value="training" className="flex items-center gap-1.5 text-sm">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.training}</span>
                      </TabsTrigger>
                      <TabsTrigger value="grpo" className="flex items-center gap-1.5 text-sm">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.grpo}</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="inference"><InferenceCalculator /></TabsContent>
                  <TabsContent value="finetuning"><FineTuningCalculator /></TabsContent>
                  <TabsContent value="training"><TrainingCalculator /></TabsContent>
                  <TabsContent value="grpo"><GRPOCalculator /></TabsContent>
                </Tabs>
              </TabsContent>

              {/* 多模态模型组 */}
              <TabsContent value="multimodal" className="space-y-5">
                <Tabs value={multimodalConfig.mode} onValueChange={(v) => setMultimodalConfig({ mode: v as 'training' | 'inference' | 'finetuning' })} className="w-full">
                  <div className="flex justify-center mb-6">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 bg-tc-bg-secondary rounded-lg p-1">
                      <TabsTrigger value="inference" className="flex items-center gap-1.5 text-sm">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.inference}</span>
                      </TabsTrigger>
                      <TabsTrigger value="finetuning" className="flex items-center gap-1.5 text-sm">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.finetuning}</span>
                      </TabsTrigger>
                      <TabsTrigger value="training" className="flex items-center gap-1.5 text-sm">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{ZH.tabs.training}</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="inference"><MultimodalCalculator mode="inference" /></TabsContent>
                  <TabsContent value="finetuning"><MultimodalCalculator mode="finetuning" /></TabsContent>
                  <TabsContent value="training"><MultimodalCalculator mode="training" /></TabsContent>
                </Tabs>
              </TabsContent>

              {/* 高级微调组 */}
              <TabsContent value="advanced" className="space-y-5">
                <AdvancedFineTuningCalculator />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* GPU推荐区域 */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <GPURecommendations
              requiredMemoryGB={requiredMemoryGB}
              title={`${getTabLabel()} 场景 GPU 推荐`}
            />
          </motion.div>

          {/* 功能特色展示 */}
          <motion.div
            className="grid md:grid-cols-3 gap-5 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="tc-card p-6 text-center">
              <div className="w-11 h-11 mx-auto mb-3 bg-brand/10 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-tc-text-primary">{ZH.features.preciseCalc}</h3>
              <p className="text-tc-text-placeholder text-sm leading-relaxed">{ZH.features.preciseCalcDesc}</p>
            </div>
            <div className="tc-card p-6 text-center">
              <div className="w-11 h-11 mx-auto mb-3 bg-brand/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-tc-text-primary">{ZH.features.richModels}</h3>
              <p className="text-tc-text-placeholder text-sm leading-relaxed">{ZH.features.richModelsDesc}</p>
            </div>
            <div className="tc-card p-6 text-center">
              <div className="w-11 h-11 mx-auto mb-3 bg-brand/10 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-tc-text-primary">{ZH.features.smartGPU}</h3>
              <p className="text-tc-text-placeholder text-sm leading-relaxed">{ZH.features.smartGPUDesc}</p>
            </div>
          </motion.div>

          {/* 页脚 */}
          <footer className="text-center mt-14 pt-8 border-t border-tc-border-light">
            <p className="text-sm text-tc-text-placeholder">{ZH.footer.description}</p>
            <p className="text-xs text-tc-text-disabled mt-1">{ZH.footer.features}</p>
            <p className="text-xs text-tc-text-disabled mt-3">{ZH.footer.copyright}</p>
          </footer>
        </div>
      </main>

      {/* 历史记录面板 */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* 配置预设面板 */}
      <ConfigPresetsPanel isOpen={showPresets} onClose={() => setShowPresets(false)} currentType={activeTab} />
    </div>
  );
}
