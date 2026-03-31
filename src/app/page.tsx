'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Calculator, Cpu, Zap, History, Users, MessageSquare, Image, HelpCircle } from 'lucide-react';
import { useCalculatorStore } from '@/store/calculator-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZH } from '@/lib/i18n';
import dynamic from 'next/dynamic';
import { GPURecommendations } from '@/components/gpu-recommendations';
import { getModelById } from '@/lib/models-data';

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
const MultimodalCalculator = dynamic(
  () => import('@/components/calculators/multimodal-calculator').then(mod => ({ default: mod.MultimodalCalculator })),
  { loading: () => <div className="tc-card p-8 text-center text-tc-text-placeholder">加载中...</div>, ssr: false }
);
const HistoryPanel = dynamic(() => import('@/components/history-panel'), {
  loading: () => null,
});

export default function Home() {
  const {
    primaryTab, setPrimaryTab,
    activeTab, setActiveTab,
    getCurrentResult,
    history, compareList,
    multimodalConfig, setMultimodalConfig,
    inferenceConfig,
    trainingConfig,
    fineTuningConfig,
    grpoConfig,
  } = useCalculatorStore();

  const [showHistory, setShowHistory] = useState(false);

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

  // 获取当前模型信息和统一的性能估算配置（适配所有场景）
  const { currentModelInfo, currentPerfConfig } = useMemo(() => {
    let modelInfo = null;
    let perfConfig = null;

    if (primaryTab === 'nlp') {
      switch (activeTab) {
        case 'inference':
          modelInfo = getModelById(inferenceConfig.modelId) || null;
          perfConfig = {
            precision: inferenceConfig.precision,
            quantization: inferenceConfig.quantization,
            batchSize: inferenceConfig.batchSize,
            sequenceLength: inferenceConfig.sequenceLength,
            mode: '推理' as const,
          };
          break;
        case 'training':
          modelInfo = getModelById(trainingConfig.modelId) || null;
          perfConfig = {
            precision: trainingConfig.precision,
            quantization: 'None' as const,
            batchSize: trainingConfig.batchSize,
            sequenceLength: trainingConfig.sequenceLength,
            mode: '训练' as const,
          };
          break;
        case 'finetuning':
          modelInfo = getModelById(fineTuningConfig.baseModel) || null;
          perfConfig = {
            precision: fineTuningConfig.precision,
            quantization: fineTuningConfig.quantization,
            batchSize: fineTuningConfig.batchSize,
            sequenceLength: fineTuningConfig.sequenceLength,
            mode: `微调 (${fineTuningConfig.method})` as string,
          };
          break;
        case 'grpo':
          modelInfo = getModelById(grpoConfig.modelId) || null;
          perfConfig = {
            precision: grpoConfig.precision,
            quantization: 'None' as const,
            batchSize: grpoConfig.batchSize,
            sequenceLength: grpoConfig.sequenceLength,
            mode: 'GRPO 训练' as const,
          };
          break;
      }
    } else if (primaryTab === 'multimodal') {
      modelInfo = getModelById(multimodalConfig.modelId) || null;
      const modeLabels: Record<string, string> = { training: '训练', inference: '推理', finetuning: '微调' };
      perfConfig = {
        precision: multimodalConfig.textPrecision,
        quantization: 'None' as const,
        batchSize: multimodalConfig.batchSize,
        sequenceLength: multimodalConfig.sequenceLength,
        mode: `多模态 ${modeLabels[multimodalConfig.mode] || '推理'}` as string,
      };
    }

    return { currentModelInfo: modelInfo, currentPerfConfig: perfConfig };
  }, [
    primaryTab, activeTab,
    inferenceConfig.modelId, inferenceConfig.precision, inferenceConfig.quantization, inferenceConfig.batchSize, inferenceConfig.sequenceLength,
    trainingConfig.modelId, trainingConfig.precision, trainingConfig.batchSize, trainingConfig.sequenceLength,
    fineTuningConfig.baseModel, fineTuningConfig.precision, fineTuningConfig.quantization, fineTuningConfig.method, fineTuningConfig.batchSize, fineTuningConfig.sequenceLength,
    grpoConfig.modelId, grpoConfig.precision, grpoConfig.batchSize, grpoConfig.sequenceLength,
    multimodalConfig.modelId, multimodalConfig.textPrecision, multimodalConfig.batchSize, multimodalConfig.sequenceLength, multimodalConfig.mode,
  ]);

  const getTabLabel = () => {
    if (primaryTab === 'multimodal') {
      const modeLabels: Record<string, string> = { training: '训练', inference: '推理', finetuning: '微调' };
      return `多模态模型 - ${modeLabels[multimodalConfig.mode] || '推理'}`;
    }
    const tabLabels: Record<string, string> = { training: '训练', inference: '推理', finetuning: '微调', grpo: 'GRPO' };
    return `NLP模型 - ${tabLabels[activeTab] || '推理'}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰光晕 */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-400/8 to-cyan-400/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-bl from-purple-400/6 to-pink-400/6 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* 顶部导航栏 */}
      <nav className="tc-navbar">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand to-purple-600 shadow-lg shadow-brand/20 animate-pulse-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gradient">{ZH.site.title}</h1>
          <span className="text-xs text-tc-text-placeholder hidden md:inline">{ZH.site.subtitle}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/help" className="glass-button flex items-center gap-1.5 text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>{ZH.nav.help}</span>
          </Link>
          <button onClick={() => setShowHistory(true)} className="glass-button flex items-center gap-1.5 text-sm relative">
            <History className="w-4 h-4" />
            <span>{ZH.nav.history}</span>
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-brand to-purple-500 text-white text-[10px] rounded-full flex items-center justify-center shadow-sm">
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
            transition={{ duration: 0.5 }}
          >
            <p className="text-tc-text-secondary text-sm max-w-2xl mx-auto leading-relaxed">
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
                <TabsList className="grid w-full max-w-lg grid-cols-2 bg-tc-bg-secondary rounded-lg p-1">
                  <TabsTrigger value="nlp" className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{ZH.tabs.nlp}</span>
                  </TabsTrigger>
                  <TabsTrigger value="multimodal" className="flex items-center gap-2 text-sm">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="w-4 h-4" />
                    <span>{ZH.tabs.multimodal}</span>
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
              modelInfo={currentModelInfo}
              perfConfig={currentPerfConfig}
            />
          </motion.div>

          {/* 功能特色展示 */}
          <motion.div
            className="grid md:grid-cols-3 gap-5 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {[
              { icon: Calculator, title: ZH.features.preciseCalc, desc: ZH.features.preciseCalcDesc, color: 'from-blue-500 to-indigo-600' },
              { icon: Brain, title: ZH.features.richModels, desc: ZH.features.richModelsDesc, color: 'from-indigo-500 to-purple-600' },
              { icon: Cpu, title: ZH.features.smartGPU, desc: ZH.features.smartGPUDesc, color: 'from-purple-500 to-pink-600' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="tc-card p-6 text-center group"
                whileHover={{ y: -4 }}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-tc-text-primary">{item.title}</h3>
                <p className="text-tc-text-placeholder text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 页脚 */}
          <footer className="text-center mt-16 pt-8 border-t border-tc-border-light/50 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            <p className="text-sm text-tc-text-placeholder">{ZH.footer.description}</p>
            <p className="text-xs text-tc-text-disabled mt-1">{ZH.footer.features}</p>
            <p className="text-xs text-tc-text-disabled mt-3">{ZH.footer.copyright}</p>
          </footer>
        </div>
      </main>

      {/* 历史记录面板 */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}
