'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Brain, Layers, TrendingUp, Lightbulb, Settings, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TickSlider } from '@/components/ui/tick-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedNumber } from '@/components/animated-number';
import { formatMemorySize } from '@/utils/memory-formulas';
import { 
  AdvancedModelType, 
  AdvancedFineTuningConfig,
  ModelArchitectureType,
  PrecisionType,
  OptimizerType,
  QuantizationType,
  PositionEncodingType,
  LoRATargetModule
} from '@/types';
import { useCalculatorStore } from '@/store/calculator-store';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { validateAdvancedFineTuningConfig, ValidationResult } from '@/utils/hyperparameter-validation';
import { OptimizationAdvisor, OptimizationSuggestion } from '@/utils/optimization-advisor';

export function AdvancedFineTuningCalculator() {
  const {
    advancedFineTuningConfig: config,
    setAdvancedFineTuningConfig: setConfig,
    advancedFineTuningResult: memoryResult,
    advancedFineTuningLoading: isLoading,
    calculateAdvancedFineTuningMemory
  } = useCalculatorStore();

  const { t } = useLanguage();
  const { actualTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<'basic' | 'advanced' | 'optimization'>('basic');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [, startTransition] = useTransition();

  // 初始化计算
  useEffect(() => {
    if (!memoryResult && !isLoading) {
      calculateAdvancedFineTuningMemory();
    }
  }, [memoryResult, isLoading, calculateAdvancedFineTuningMemory]);

  // 延迟执行验证和建议生成（不阻塞渲染）
  useEffect(() => {
    startTransition(() => {
      const validation = validateAdvancedFineTuningConfig(config);
      setValidationResult(validation);
      if (memoryResult) {
        const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(config, memoryResult);
        setOptimizationSuggestions(suggestions);
      }
    });
  }, [config, memoryResult]);

  const handleConfigChange = useCallback((key: keyof AdvancedFineTuningConfig, value: unknown) => {
    setConfig({ ...config, [key]: value });
  }, [config, setConfig]);

  const handleModelTypeChange = (modelType: AdvancedModelType) => {
    // 切换模型类型时重置相应的配置
    const newConfig: Partial<AdvancedFineTuningConfig> = { modelType };
    
    // 清除其他模型类型的配置
    newConfig.nlpConfig = undefined;
    newConfig.multimodalConfig = undefined;
    newConfig.moeConfig = undefined;
    newConfig.cnnConfig = undefined;
    
    // 设置默认配置
    switch (modelType) {
      case 'NLP':
        newConfig.nlpConfig = {
          modelSize: 7.0,
          architectureType: 'LLaMA',
          precision: 'FP16',
          quantizationTech: 'None',
          batchSize: 4,
          sequenceLength: 2048,
          gradientAccumulationSteps: 4,
          learningRate: 2e-5,
          optimizer: 'AdamW',
          trainingEpochs: 3,
          vocabSize: 50000,
          numAttentionHeads: 32,
          hiddenSize: 4096,
          intermediateSize: 11008,
          numLayers: 32,
          positionEncodingType: 'RoPE',
          loraRank: 16,
          loraAlpha: 32,
          loraTargetModules: ['q_proj', 'v_proj'],
          maxGenerationLength: 2048,
          temperature: 0.7,
          topP: 0.9,
          repetitionPenalty: 1.1,
          weightDecay: 0.01,
          warmupSteps: 100,
          gradientClipping: 1.0,
          dropoutRate: 0.1
        };
        break;
      case 'Multimodal':
        newConfig.multimodalConfig = {
          modelSize: 7.0,
          architectureType: 'LLaVA',
          precision: 'FP16',
          quantizationSupport: true,
          batchSize: 8,
          sequenceLength: 1024,
          gradientAccumulationSteps: 4,
          learningRate: 1e-5,
          optimizer: 'AdamW',
          trainingEpochs: 5,
          imageResolution: 336,
          patchSize: 14,
          visionEncoderType: 'ViT',
          textEncoderType: 'BERT',
          modalFusionStrategy: 'Cross-attention',
          visionFeatureDim: 1024,
          crossModalAlignmentWeight: 0.5,
          imageTextContrastWeight: 0.3,
          freezeVisionEncoder: false,
          freezeTextEncoder: false,
          loraVisionEncoder: true,
          loraTextEncoder: true,
          loraFusionLayer: true,
          weightDecay: 0.01,
          warmupSteps: 100,
          gradientClipping: 1.0,
          mixedPrecisionTraining: true
        };
        break;
      case 'MoE':
        newConfig.moeConfig = {
          modelSize: 8.0,
          architectureType: 'Switch Transformer',
          precision: 'BF16',
          quantizationSupport: true,
          batchSize: 16,
          sequenceLength: 2048,
          gradientAccumulationSteps: 2,
          learningRate: 3e-5,
          optimizer: 'AdamW',
          trainingEpochs: 2,
          numExperts: 8,
          numActiveExperts: 2,
          expertCapacityFactor: 1.25,
          loadBalanceLossWeight: 0.01,
          expertDropoutRate: 0.1,
          routingStrategy: 'Top-K',
          expertSpecialization: 0.8,
          auxiliaryLossWeight: 0.001,
          expertParallelism: 2,
          expertInitStrategy: 'Random',
          loraApplicationStrategy: 'Partial Experts',
          weightDecay: 0.01,
          warmupSteps: 50,
          gradientClipping: 1.0,
          expertRegularization: 0.01
        };
        break;
    }
    
    setConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* 模型类型选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          actualTheme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border-white/20'
            : 'bg-gray-50 border-gray-200'
        } rounded-xl p-6 border`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className={`w-5 h-5 ${actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('advanced.finetuning.model.type')}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {(['NLP', 'Multimodal', 'MoE'] as AdvancedModelType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleModelTypeChange(type)}
              className={`p-4 rounded-lg border-2 transition-all ${
                config.modelType === type
                  ? actualTheme === 'dark'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-400'
                    : 'border-blue-600 bg-blue-50 text-blue-700'
                  : actualTheme === 'dark'
                    ? 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-medium">{t(`advanced.finetuning.${type.toLowerCase()}`)}</div>
                <div className={`text-xs mt-1 ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {t(`advanced.finetuning.${type.toLowerCase()}.desc`)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 配置面板切换 */}
      <div className={`flex space-x-1 rounded-lg p-1 ${
        actualTheme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
      }`}>
        {[
          { key: 'basic', label: t('advanced.finetuning.basic.config'), icon: Settings },
          { key: 'advanced', label: t('advanced.finetuning.advanced.config'), icon: Layers },
          { key: 'optimization', label: t('advanced.finetuning.optimization.config'), icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              activeSection === key
                ? actualTheme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white'
                : actualTheme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* 动态配置面板 */}
      <motion.div
        key={`${config.modelType}-${activeSection}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={`${
          actualTheme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border-white/20'
            : 'bg-gray-50 border-gray-200'
        } rounded-xl p-6 border`}
      >
        {/* 这里将根据模型类型和配置面板类型渲染不同的配置选项 */}
        {config.modelType === 'NLP' && renderNLPConfig(config, setConfig, activeSection, t)}
        {config.modelType === 'Multimodal' && renderMultimodalConfig(config, setConfig, activeSection, t)}
        {config.modelType === 'MoE' && renderMoEConfig(config, setConfig, activeSection, t)}
      </motion.div>

      {/* 计算结果显示 */}
      {memoryResult && (
        <div
          className={`${
            actualTheme === 'dark'
              ? 'bg-white/10 backdrop-blur-sm border-white/20'
              : 'bg-gray-50 border-gray-200'
          } rounded-xl p-6 border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={`w-5 h-5 ${actualTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            <h3 className={`text-lg font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('advanced.finetuning.total.vram')}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className={`text-3xl font-bold mb-2 ${
                actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {formatMemorySize(memoryResult.total)}
              </div>
              <div className={`text-sm ${
                actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t('advanced.finetuning.total.vram')}
              </div>
            </div>

            <div className="space-y-2">
              {memoryResult.breakdown.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    {item.label}
                  </span>
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatMemorySize(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 验证结果 */}
          {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
            <div className="mt-6 space-y-3">
              {/* 错误信息 */}
              {validationResult.errors.length > 0 && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">{t('advanced.finetuning.config.errors.title')}</span>
                  </div>
                  <ul className="text-xs text-red-600 dark:text-red-300/90 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 警告信息 */}
              {validationResult.warnings.length > 0 && (
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">{t('advanced.finetuning.config.warnings.title')}</span>
                  </div>
                  <ul className="text-xs text-orange-600 dark:text-orange-300/90 space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 智能优化建议 */}
          {optimizationSuggestions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{t('advanced.finetuning.intelligent.optimization.suggestions')}</span>
              </div>
              <div className="space-y-3">
                {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="border-l-2 border-blue-500 dark:border-blue-400 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.priority === 'high' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                        suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-500/20 text-green-700 dark:text-green-400'
                      }`}>
                        {suggestion.priority === 'high' ? t('advanced.finetuning.priority.high') :
                         suggestion.priority === 'medium' ? t('advanced.finetuning.priority.medium') : t('advanced.finetuning.priority.low')}
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">{suggestion.title}</span>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-300/90 mb-1">{suggestion.description}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">{t('advanced.finetuning.impact')}: {suggestion.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 原有的优化建议 */}
          {memoryResult.advancedMetadata?.optimizationSuggestions && (
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">{t('advanced.finetuning.system.suggestions')}</span>
              </div>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300/90 space-y-1">
                {memoryResult.advancedMetadata.optimizationSuggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// NLP配置面板渲染函数
function renderNLPConfig(
  config: AdvancedFineTuningConfig,
  setConfig: any,
  activeSection: string,
  t: any
) {
  const nlpConfig = config.nlpConfig;
  if (!nlpConfig) return null;

  const updateNLPConfig = (key: string, value: any) => {
    const newNLPConfig = { ...nlpConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, nlpConfig: newNLPConfig };
    setConfig(updatedConfig);
  };

  if (activeSection === 'basic') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.nlp')} {t('advanced.finetuning.basic.config')}</h4>

        {/* 模型大小 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('advanced.finetuning.model.size.label')}</label>
            <AnimatedNumber
              value={nlpConfig.modelSize}
              format={(n) => `${n}B`}
              className="text-sm font-mono text-blue-600"
            />
          </div>
          <TickSlider
            value={nlpConfig.modelSize}
            onChange={(v) => updateNLPConfig('modelSize', v)}
            min={0.125} max={175} step={0.125}
            ticks={[{ value: 0.125, label: "125M" }, { value: 1, label: "1B" }, { value: 7, label: "7B" }, { value: 13, label: "13B" }, { value: 34, label: "34B" }, { value: 70, label: "70B" }, { value: 175, label: "175B" }]}
          />
        </div>

        {/* 架构类型 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('advanced.finetuning.architecture')}</label>
          <Select
            value={nlpConfig.architectureType}
            onValueChange={(value: ModelArchitectureType) => updateNLPConfig('architectureType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Transformer">Transformer</SelectItem>
              <SelectItem value="BERT">BERT</SelectItem>
              <SelectItem value="GPT">GPT</SelectItem>
              <SelectItem value="T5">T5</SelectItem>
              <SelectItem value="LLaMA">LLaMA</SelectItem>
              <SelectItem value="ChatGLM">ChatGLM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 精度和量化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.precision')}</label>
            <Select
              value={nlpConfig.precision}
              onValueChange={(value: PrecisionType) => updateNLPConfig('precision', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FP32">FP32</SelectItem>
                <SelectItem value="FP16">FP16</SelectItem>
                <SelectItem value="BF16">BF16</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.quantization')}</label>
            <Select
              value={nlpConfig.quantizationTech}
              onValueChange={(value: QuantizationType) => updateNLPConfig('quantizationTech', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">{t('advanced.finetuning.option.none')}</SelectItem>
                <SelectItem value="INT8">INT8</SelectItem>
                <SelectItem value="INT4">INT4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 批次大小和序列长度 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.batch.size')}</label>
              <AnimatedNumber
                value={nlpConfig.batchSize}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.batchSize}
              onChange={(v) => updateNLPConfig("batchSize", v)}
              min={1} max={32} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.sequence.length')}</label>
              <AnimatedNumber
                value={nlpConfig.sequenceLength}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.sequenceLength}
              onChange={(v) => updateNLPConfig("sequenceLength", v)}
              min={512} max={32768} step={512}
              ticks={[{ value: 1024, label: "1K" }, { value: 4096, label: "4K" }, { value: 8192, label: "8K" }, { value: 16384, label: "16K" }, { value: 32768, label: "32K" }]}
            />
          </div>
        </div>

        {/* 学习率和优化器 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.learning.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {nlpConfig.learningRate.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(nlpConfig.learningRate)]}
              onValueChange={([value]) => updateNLPConfig('learningRate', Math.pow(10, value))}
              max={-4}
              min={-6}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1e-6</span>
              <span>1e-4</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.optimizer')}</label>
            <Select
              value={nlpConfig.optimizer}
              onValueChange={(value: OptimizerType) => updateNLPConfig('optimizer', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AdamW">AdamW</SelectItem>
                <SelectItem value="Adam">Adam</SelectItem>
                <SelectItem value="SGD">SGD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'advanced') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.nlp')} {t('advanced.finetuning.advanced.config.title')}</h4>

        {/* 模型架构参数 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.vocab.size')}</label>
              <AnimatedNumber
                value={nlpConfig.vocabSize}
                format={(n) => `${(n/1000).toFixed(0)}K`}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.vocabSize}
              onChange={(v) => updateNLPConfig("vocabSize", v)}
              min={30000} max={100000} step={1000}
              ticks={[{ value: 30000, label: "30K" }, { value: 50000, label: "50K" }, { value: 80000, label: "80K" }, { value: 100000, label: "100K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.attention.heads')}</label>
              <AnimatedNumber
                value={nlpConfig.numAttentionHeads}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.numAttentionHeads}
              onChange={(v) => updateNLPConfig("numAttentionHeads", v)}
              min={8} max={128} step={8}
              ticks={[{ value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }, { value: 64, label: "64" }, { value: 96, label: "96" }, { value: 128, label: "128" }]}
            />
          </div>
        </div>

        {/* 关键架构参数 - 这些参数对显存影响最大 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.hidden.size')}</label>
              <AnimatedNumber
                value={nlpConfig.hiddenSize}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.hiddenSize}
              onChange={(v) => updateNLPConfig("hiddenSize", v)}
              min={768} max={12288} step={256}
              ticks={[{ value: 768, label: "768" }, { value: 2048, label: "2K" }, { value: 4096, label: "4K" }, { value: 8192, label: "8K" }, { value: 12288, label: "12K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.intermediate.size')}</label>
              <AnimatedNumber
                value={nlpConfig.intermediateSize}
                className="text-sm font-mono text-orange-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.intermediateSize}
              onChange={(v) => updateNLPConfig("intermediateSize", v)}
              min={2048} max={49152} step={512}
              ticks={[{ value: 2048, label: "2K" }, { value: 4096, label: "4K" }, { value: 11008, label: "11K" }, { value: 28672, label: "28K" }, { value: 49152, label: "49K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.num.layers')}</label>
              <AnimatedNumber
                value={nlpConfig.numLayers}
                className="text-sm font-mono text-red-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.numLayers}
              onChange={(v) => updateNLPConfig("numLayers", v)}
              min={12} max={96} step={4}
              ticks={[{ value: 12, label: "12" }, { value: 24, label: "24" }, { value: 32, label: "32" }, { value: 48, label: "48" }, { value: 64, label: "64" }, { value: 80, label: "80" }, { value: 96, label: "96" }]}
            />
          </div>
        </div>

        {/* LoRA配置 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.lora.rank')}</label>
              <AnimatedNumber
                value={nlpConfig.loraRank}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.loraRank}
              onChange={(v) => updateNLPConfig("loraRank", v)}
              min={4} max={256} step={4}
              ticks={[{ value: 4, label: "4" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }, { value: 64, label: "64" }, { value: 128, label: "128" }, { value: 256, label: "256" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.lora.alpha')}</label>
              <AnimatedNumber
                value={nlpConfig.loraAlpha}
                className="text-sm font-mono text-orange-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.loraAlpha}
              onChange={(v) => updateNLPConfig("loraAlpha", v)}
              min={16} max={128} step={8}
              ticks={[{ value: 16, label: "16" }, { value: 32, label: "32" }, { value: 64, label: "64" }, { value: 96, label: "96" }, { value: 128, label: "128" }]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.position.encoding')}</label>
            <Select
              value={nlpConfig.positionEncodingType}
              onValueChange={(value) => updateNLPConfig('positionEncodingType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Absolute">Absolute</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="RoPE">RoPE</SelectItem>
                <SelectItem value="ALiBi">ALiBi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 生成参数 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.max.generation.length')}</label>
              <AnimatedNumber
                value={nlpConfig.maxGenerationLength}
                className="text-sm font-mono text-red-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.maxGenerationLength}
              onChange={(v) => updateNLPConfig("maxGenerationLength", v)}
              min={256} max={4096} step={256}
              ticks={[{ value: 256, label: "256" }, { value: 1024, label: "1K" }, { value: 4096, label: "4K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.temperature')}</label>
              <span className="text-sm font-mono text-cyan-600">
                {nlpConfig.temperature.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={nlpConfig.temperature}
              onChange={(v) => updateNLPConfig('temperature', v)}
              min={0.1} max={1.0} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.3, label: "0.3" }, { value: 0.5, label: "0.5" }, { value: 0.7, label: "0.7" }, { value: 1.0, label: "1.0" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.top.p')}</label>
              <span className="text-sm font-mono text-pink-600">
                {nlpConfig.topP.toFixed(2)}
              </span>
            </div>
            <TickSlider
              value={nlpConfig.topP}
              onChange={(v) => updateNLPConfig('topP', v)}
              min={0.9} max={0.95} step={0.01}
              ticks={[{ value: 0.90, label: "0.90" }, { value: 0.91, label: "0.91" }, { value: 0.93, label: "0.93" }, { value: 0.95, label: "0.95" }]}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'optimization') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.nlp')} {t('advanced.finetuning.optimization.config.title')}</h4>

        {/* 训练优化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.weight.decay')}</label>
              <span className="text-sm font-mono text-blue-600">
                {nlpConfig.weightDecay.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(nlpConfig.weightDecay)]}
              onValueChange={([value]) => updateNLPConfig('weightDecay', Math.pow(10, value))}
              max={-1}
              min={-4}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1e-4</span>
              <span>1e-1</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.warmup.steps')}</label>
              <AnimatedNumber
                value={nlpConfig.warmupSteps}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <TickSlider
              value={nlpConfig.warmupSteps}
              onChange={(v) => updateNLPConfig("warmupSteps", v)}
              min={0} max={1000} step={50}
              ticks={[{ value: 0, label: "0" }, { value: 100, label: "100" }, { value: 200, label: "200" }, { value: 500, label: "500" }, { value: 1000, label: "1K" }]}
            />
          </div>
        </div>

        {/* 梯度和正则化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.clipping')}</label>
              <span className="text-sm font-mono text-purple-600">
                {nlpConfig.gradientClipping.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={nlpConfig.gradientClipping}
              onChange={(v) => updateNLPConfig("gradientClipping", v)}
              min={0.1} max={5} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.5, label: "0.5" }, { value: 1.0, label: "1.0" }, { value: 2.0, label: "2.0" }, { value: 5.0, label: "5.0" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.dropout.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {nlpConfig.dropoutRate.toFixed(2)}
              </span>
            </div>
            <TickSlider
              value={nlpConfig.dropoutRate}
              onChange={(v) => updateNLPConfig("dropoutRate", v)}
              min={0} max={0.5} step={0.01}
              ticks={[{ value: 0.0, label: "0" }, { value: 0.1, label: "0.1" }, { value: 0.2, label: "0.2" }, { value: 0.3, label: "0.3" }, { value: 0.5, label: "0.5" }]}
            />
          </div>
        </div>

        {/* 梯度累积 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('advanced.finetuning.gradient.accumulation.steps')}</label>
            <AnimatedNumber
              value={nlpConfig.gradientAccumulationSteps}
              className="text-sm font-mono text-red-600"
            />
          </div>
          <TickSlider
              value={nlpConfig.gradientAccumulationSteps}
              onChange={(v) => updateNLPConfig("gradientAccumulationSteps", v)}
              min={1} max={128} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 4, label: "4" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }, { value: 64, label: "64" }, { value: 128, label: "128" }]}
            />
          <div className="text-xs text-gray-500">
            {t('advanced.finetuning.effective.batch.size')}: {nlpConfig.batchSize * nlpConfig.gradientAccumulationSteps}
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('advanced.finetuning.nlp')} {activeSection} {t('advanced.finetuning.config')}</div>;
}

function renderMultimodalConfig(
  config: AdvancedFineTuningConfig,
  setConfig: any,
  activeSection: string,
  t: any
) {
  const multimodalConfig = config.multimodalConfig;
  if (!multimodalConfig) return null;

  const updateMultimodalConfig = (key: string, value: any) => {
    const newMultimodalConfig = { ...multimodalConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, multimodalConfig: newMultimodalConfig };
    setConfig(updatedConfig);
  };

  if (activeSection === 'basic') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.multimodal')} {t('advanced.finetuning.basic.config.title')}</h4>

        {/* 模型大小和架构 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.model.size.label')}</label>
              <AnimatedNumber
                value={multimodalConfig.modelSize}
                format={(n) => `${n}B`}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.modelSize}
              onChange={(v) => updateMultimodalConfig("modelSize", v)}
              min={1} max={100} step={0.5}
              ticks={[{ value: 1, label: "1B" }, { value: 7, label: "7B" }, { value: 13, label: "13B" }, { value: 34, label: "34B" }, { value: 72, label: "72B" }, { value: 100, label: "100B" }]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.architecture.type')}</label>
            <Select
              value={multimodalConfig.architectureType}
              onValueChange={(value: ModelArchitectureType) => updateMultimodalConfig('architectureType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIP">CLIP</SelectItem>
                <SelectItem value="BLIP">BLIP</SelectItem>
                <SelectItem value="LLaVA">LLaVA</SelectItem>
                <SelectItem value="GPT-4V">GPT-4V</SelectItem>
                <SelectItem value="Flamingo">Flamingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 图像配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.image.resolution')}</label>
              <span className="text-sm font-mono text-green-600">
                {multimodalConfig.imageResolution}×{multimodalConfig.imageResolution}
              </span>
            </div>
            <TickSlider
              value={multimodalConfig.imageResolution}
              onChange={(v) => updateMultimodalConfig('imageResolution', v)}
              min={224} max={1024} step={112}
              ticks={[{ value: 224, label: "224" }, { value: 336, label: "336" }, { value: 448, label: "448" }, { value: 672, label: "672" }, { value: 1024, label: "1024" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.patch.size')}</label>
              <AnimatedNumber
                value={multimodalConfig.patchSize}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.patchSize}
              onChange={(v) => updateMultimodalConfig("patchSize", v)}
              min={14} max={32} step={2}
              ticks={[{ value: 14, label: "14" }, { value: 16, label: "16" }, { value: 32, label: "32" }]}
            />
          </div>
        </div>

        {/* 编码器配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.vision.encoder')}</label>
            <Select
              value={multimodalConfig.visionEncoderType}
              onValueChange={(value) => updateMultimodalConfig('visionEncoderType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ViT">ViT</SelectItem>
                <SelectItem value="ConvNext">ConvNext</SelectItem>
                <SelectItem value="ResNet">ResNet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.text.encoder')}</label>
            <Select
              value={multimodalConfig.textEncoderType}
              onValueChange={(value) => updateMultimodalConfig('textEncoderType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BERT">BERT</SelectItem>
                <SelectItem value="RoBERTa">RoBERTa</SelectItem>
                <SelectItem value="T5">T5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 训练参数 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.batch.size')}</label>
              <AnimatedNumber
                value={multimodalConfig.batchSize}
                className="text-sm font-mono text-orange-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.batchSize}
              onChange={(v) => updateMultimodalConfig("batchSize", v)}
              min={1} max={32} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.sequence.length')}</label>
              <AnimatedNumber
                value={multimodalConfig.sequenceLength}
                className="text-sm font-mono text-red-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.sequenceLength}
              onChange={(v) => updateMultimodalConfig("sequenceLength", v)}
              min={256} max={2048} step={256}
              ticks={[{ value: 256, label: "256" }, { value: 1024, label: "1K" }, { value: 2048, label: "2K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.training.epochs')}</label>
              <AnimatedNumber
                value={multimodalConfig.trainingEpochs}
                className="text-sm font-mono text-cyan-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.trainingEpochs}
              onChange={(v) => updateMultimodalConfig("trainingEpochs", v)}
              min={3} max={30} step={1}
              ticks={[{ value: 3, label: "3" }, { value: 5, label: "5" }, { value: 10, label: "10" }, { value: 20, label: "20" }, { value: 30, label: "30" }]}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'advanced') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.multimodal')} {t('advanced.finetuning.advanced.config.title')}</h4>

        {/* 模态融合配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.modal.fusion.strategy')}</label>
            <Select
              value={multimodalConfig.modalFusionStrategy}
              onValueChange={(value) => updateMultimodalConfig('modalFusionStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cross-attention">{t('advanced.finetuning.modal.fusion.cross.attention')}</SelectItem>
                <SelectItem value="Co-attention">{t('advanced.finetuning.modal.fusion.co.attention')}</SelectItem>
                <SelectItem value="Gated fusion">{t('advanced.finetuning.modal.fusion.gated.fusion')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.vision.feature.dim')}</label>
              <AnimatedNumber
                value={multimodalConfig.visionFeatureDim}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.visionFeatureDim}
              onChange={(v) => updateMultimodalConfig("visionFeatureDim", v)}
              min={768} max={1024} step={64}
              ticks={[{ value: 768, label: "768" }, { value: 896, label: "896" }, { value: 1024, label: "1K" }]}
            />
          </div>
        </div>

        {/* 损失权重配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.cross.modal.alignment.weight')}</label>
              <span className="text-sm font-mono text-green-600">
                {multimodalConfig.crossModalAlignmentWeight.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={multimodalConfig.crossModalAlignmentWeight}
              onChange={(v) => updateMultimodalConfig("crossModalAlignmentWeight", v)}
              min={0.1} max={1} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.3, label: "0.3" }, { value: 0.5, label: "0.5" }, { value: 0.8, label: "0.8" }, { value: 1.0, label: "1.0" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">图像-文本对比权重</label>
              <span className="text-sm font-mono text-purple-600">
                {multimodalConfig.imageTextContrastWeight.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={multimodalConfig.imageTextContrastWeight}
              onChange={(v) => updateMultimodalConfig("imageTextContrastWeight", v)}
              min={0.1} max={1} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.3, label: "0.3" }, { value: 0.5, label: "0.5" }, { value: 0.8, label: "0.8" }, { value: 1.0, label: "1.0" }]}
            />
          </div>
        </div>

        {/* 编码器冻结策略 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.vision.encoder.label')}</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={multimodalConfig.freezeVisionEncoder}
                  onChange={(e) => updateMultimodalConfig('freezeVisionEncoder', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{t('advanced.finetuning.freeze')}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={multimodalConfig.loraVisionEncoder}
                  onChange={(e) => updateMultimodalConfig('loraVisionEncoder', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">LoRA</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.text.encoder.label')}</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={multimodalConfig.freezeTextEncoder}
                  onChange={(e) => updateMultimodalConfig('freezeTextEncoder', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{t('advanced.finetuning.freeze')}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={multimodalConfig.loraTextEncoder}
                  onChange={(e) => updateMultimodalConfig('loraTextEncoder', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">LoRA</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'optimization') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.multimodal.optimization.settings')}</h4>

        {/* 训练优化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.weight.decay')}</label>
              <span className="text-sm font-mono text-blue-600">
                {multimodalConfig.weightDecay.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(multimodalConfig.weightDecay)]}
              onValueChange={([value]) => updateMultimodalConfig('weightDecay', Math.pow(10, value))}
              max={-1}
              min={-4}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1e-4</span>
              <span>1e-1</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.warmup.steps')}</label>
              <AnimatedNumber
                value={multimodalConfig.warmupSteps}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <TickSlider
              value={multimodalConfig.warmupSteps}
              onChange={(v) => updateMultimodalConfig("warmupSteps", v)}
              min={0} max={500} step={25}
              ticks={[{ value: 0, label: "0" }, { value: 50, label: "50" }, { value: 100, label: "100" }, { value: 250, label: "250" }, { value: 500, label: "500" }]}
            />
          </div>
        </div>

        {/* 梯度和混合精度 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.clipping')}</label>
              <span className="text-sm font-mono text-purple-600">
                {multimodalConfig.gradientClipping.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={multimodalConfig.gradientClipping}
              onChange={(v) => updateMultimodalConfig("gradientClipping", v)}
              min={0.1} max={5} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.5, label: "0.5" }, { value: 1.0, label: "1.0" }, { value: 2.0, label: "2.0" }, { value: 5.0, label: "5.0" }]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.mixed.precision.training')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={multimodalConfig.mixedPrecisionTraining}
                onChange={(e) => updateMultimodalConfig('mixedPrecisionTraining', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{t('advanced.finetuning.enable.amp')}</span>
            </div>
          </div>
        </div>

        {/* 梯度累积 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('advanced.finetuning.gradient.accumulation.steps')}</label>
            <AnimatedNumber
              value={multimodalConfig.gradientAccumulationSteps}
              className="text-sm font-mono text-red-600"
            />
          </div>
          <TickSlider
              value={multimodalConfig.gradientAccumulationSteps}
              onChange={(v) => updateMultimodalConfig("gradientAccumulationSteps", v)}
              min={1} max={32} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 4, label: "4" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 24, label: "24" }, { value: 32, label: "32" }]}
            />
          <div className="text-xs text-gray-500">
            {t('advanced.finetuning.effective.batch.size.label')}: {multimodalConfig.batchSize * multimodalConfig.gradientAccumulationSteps}
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('advanced.finetuning.multimodal')} {activeSection} {t('advanced.finetuning.config')}</div>;
}

function renderMoEConfig(
  config: AdvancedFineTuningConfig,
  setConfig: any,
  activeSection: string,
  t: any
) {
  const moeConfig = config.moeConfig;
  if (!moeConfig) return null;

  const updateMoEConfig = (key: string, value: any) => {
    const newMoEConfig = { ...moeConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, moeConfig: newMoEConfig };
    setConfig(updatedConfig);
  };

  if (activeSection === 'basic') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.moe.basic.config')}</h4>

        {/* 模型大小和专家配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.model.size.label')}</label>
              <AnimatedNumber
                value={moeConfig.modelSize}
                format={(n) => `${n}B`}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <TickSlider
              value={moeConfig.modelSize}
              onChange={(v) => updateMoEConfig("modelSize", v)}
              min={1} max={1600} step={1}
              ticks={[{ value: 1, label: "1B" }, { value: 100, label: "100B" }, { value: 400, label: "400B" }, { value: 800, label: "800B" }, { value: 1600, label: "1.6T" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.count')}</label>
              <AnimatedNumber
                value={moeConfig.numExperts}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <TickSlider
              value={moeConfig.numExperts}
              onChange={(v) => updateMoEConfig("numExperts", v)}
              min={8} max={2048} step={8}
              ticks={[{ value: 8, label: "8" }, { value: 64, label: "64" }, { value: 256, label: "256" }, { value: 512, label: "512" }, { value: 2048, label: "2K" }]}
            />
          </div>
        </div>

        {/* 激活专家和路由策略 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">激活专家数</label>
              <AnimatedNumber
                value={moeConfig.numActiveExperts}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <TickSlider
              value={moeConfig.numActiveExperts}
              onChange={(v) => updateMoEConfig("numActiveExperts", v)}
              min={1} max={8} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 2, label: "2" }, { value: 4, label: "4" }, { value: 8, label: "8" }]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">路由策略</label>
            <Select
              value={moeConfig.routingStrategy}
              onValueChange={(value) => updateMoEConfig('routingStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top-K">Top-K</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
                <SelectItem value="Expert Choice">Expert Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 训练参数 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.batch.size')}</label>
              <AnimatedNumber
                value={moeConfig.batchSize}
                className="text-sm font-mono text-orange-600"
              />
            </div>
            <TickSlider
              value={moeConfig.batchSize}
              onChange={(v) => updateMoEConfig("batchSize", v)}
              min={1} max={32} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 8, label: "8" }, { value: 16, label: "16" }, { value: 32, label: "32" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.sequence.length')}</label>
              <AnimatedNumber
                value={moeConfig.sequenceLength}
                className="text-sm font-mono text-red-600"
              />
            </div>
            <TickSlider
              value={moeConfig.sequenceLength}
              onChange={(v) => updateMoEConfig("sequenceLength", v)}
              min={512} max={32768} step={512}
              ticks={[{ value: 1024, label: "1K" }, { value: 4096, label: "4K" }, { value: 8192, label: "8K" }, { value: 16384, label: "16K" }, { value: 32768, label: "32K" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.training.epochs')}</label>
              <AnimatedNumber
                value={moeConfig.trainingEpochs}
                className="text-sm font-mono text-cyan-600"
              />
            </div>
            <TickSlider
              value={moeConfig.trainingEpochs}
              onChange={(v) => updateMoEConfig("trainingEpochs", v)}
              min={1} max={5} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }, { value: 5, label: "5" }]}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'advanced') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.moe.advanced.config')}</h4>

        {/* 专家配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.capacity.factor')}</label>
              <span className="text-sm font-mono text-blue-600">
                {moeConfig.expertCapacityFactor.toFixed(2)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.expertCapacityFactor}
              onChange={(v) => updateMoEConfig("expertCapacityFactor", v)}
              min={1} max={2} step={0.05}
              ticks={[{ value: 1.0, label: "1.0" }, { value: 1.25, label: "1.25" }, { value: 1.5, label: "1.5" }, { value: 2.0, label: "2.0" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">专家特化度</label>
              <span className="text-sm font-mono text-green-600">
                {moeConfig.expertSpecialization.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.expertSpecialization}
              onChange={(v) => updateMoEConfig("expertSpecialization", v)}
              min={0.1} max={1} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 0.5, label: "0.5" }, { value: 0.8, label: "0.8" }, { value: 1.0, label: "1.0" }]}
            />
          </div>
        </div>

        {/* 损失权重配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.load.balance.loss.weight')}</label>
              <span className="text-sm font-mono text-purple-600">
                {moeConfig.loadBalanceLossWeight.toFixed(3)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.loadBalanceLossWeight}
              onChange={(v) => updateMoEConfig("loadBalanceLossWeight", v)}
              min={0.01} max={0.1} step={0.001}
              ticks={[{ value: 0.01, label: "0.01" }, { value: 0.05, label: "0.05" }, { value: 0.1, label: "0.1" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.auxiliary.loss.weight')}</label>
              <span className="text-sm font-mono text-orange-600">
                {moeConfig.auxiliaryLossWeight.toFixed(4)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.auxiliaryLossWeight}
              onChange={(v) => updateMoEConfig("auxiliaryLossWeight", v)}
              min={0.001} max={0.01} step={0.0001}
              ticks={[{ value: 0.001, label: "0.001" }, { value: 0.005, label: "0.005" }, { value: 0.01, label: "0.01" }]}
            />
          </div>
        </div>

        {/* 专家策略配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.expert.init.strategy')}</label>
            <Select
              value={moeConfig.expertInitStrategy}
              onValueChange={(value) => updateMoEConfig('expertInitStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Random">{t('advanced.finetuning.option.random.init')}</SelectItem>
                <SelectItem value="Pretrained Inherit">{t('advanced.finetuning.option.pretrained.inherit')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.lora.application.strategy')}</label>
            <Select
              value={moeConfig.loraApplicationStrategy}
              onValueChange={(value) => updateMoEConfig('loraApplicationStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Experts">{t('advanced.finetuning.option.all.experts')}</SelectItem>
                <SelectItem value="Partial Experts">{t('advanced.finetuning.option.partial.experts')}</SelectItem>
                <SelectItem value="Router Only">{t('advanced.finetuning.option.router.only')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 专家并行配置 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('advanced.finetuning.expert.parallelism')}</label>
            <AnimatedNumber
              value={moeConfig.expertParallelism}
              className="text-sm font-mono text-red-600"
            />
          </div>
          <TickSlider
              value={moeConfig.expertParallelism}
              onChange={(v) => updateMoEConfig("expertParallelism", v)}
              min={1} max={8} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 2, label: "2" }, { value: 4, label: "4" }, { value: 8, label: "8" }]}
            />
        </div>
      </div>
    );
  }

  if (activeSection === 'optimization') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.moe.optimization.settings')}</h4>

        {/* 训练优化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">权重衰减</label>
              <span className="text-sm font-mono text-blue-600">
                {moeConfig.weightDecay.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(moeConfig.weightDecay)]}
              onValueChange={([value]) => updateMoEConfig('weightDecay', Math.pow(10, value))}
              max={-1}
              min={-4}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1e-4</span>
              <span>1e-1</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.regularization')}</label>
              <span className="text-sm font-mono text-green-600">
                {moeConfig.expertRegularization.toFixed(3)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.expertRegularization}
              onChange={(v) => updateMoEConfig("expertRegularization", v)}
              min={0.001} max={0.1} step={0.001}
              ticks={[{ value: 0.001, label: "0.001" }, { value: 0.01, label: "0.01" }, { value: 0.1, label: "0.1" }]}
            />
          </div>
        </div>

        {/* 梯度和Dropout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.clipping')}</label>
              <span className="text-sm font-mono text-purple-600">
                {moeConfig.gradientClipping.toFixed(1)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.gradientClipping}
              onChange={(v) => updateMoEConfig("gradientClipping", v)}
              min={0.1} max={5} step={0.1}
              ticks={[{ value: 0.1, label: "0.1" }, { value: 1.0, label: "1.0" }, { value: 5.0, label: "5.0" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.dropout.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {moeConfig.expertDropoutRate.toFixed(2)}
              </span>
            </div>
            <TickSlider
              value={moeConfig.expertDropoutRate}
              onChange={(v) => updateMoEConfig("expertDropoutRate", v)}
              min={0} max={0.1} step={0.01}
              ticks={[{ value: 0.0, label: "0" }, { value: 0.05, label: "0.05" }, { value: 0.1, label: "0.1" }]}
            />
          </div>
        </div>

        {/* 预热和梯度累积 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">预热步数</label>
              <AnimatedNumber
                value={moeConfig.warmupSteps}
                className="text-sm font-mono text-cyan-600"
              />
            </div>
            <TickSlider
              value={moeConfig.warmupSteps}
              onChange={(v) => updateMoEConfig("warmupSteps", v)}
              min={0} max={200} step={10}
              ticks={[{ value: 0, label: "0" }, { value: 50, label: "50" }, { value: 100, label: "100" }, { value: 200, label: "200" }]}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.accumulation.steps')}</label>
              <AnimatedNumber
                value={moeConfig.gradientAccumulationSteps}
                className="text-sm font-mono text-pink-600"
              />
            </div>
            <TickSlider
              value={moeConfig.gradientAccumulationSteps}
              onChange={(v) => updateMoEConfig("gradientAccumulationSteps", v)}
              min={1} max={16} step={1}
              ticks={[{ value: 1, label: "1" }, { value: 4, label: "4" }, { value: 8, label: "8" }, { value: 16, label: "16" }]}
            />
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('advanced.finetuning.moe')} {activeSection} {t('advanced.finetuning.config')}</div>;
}
