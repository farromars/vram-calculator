'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Layers, TrendingUp, Lightbulb, Settings, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedNumber } from '@/components/animated-number';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
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

  // 初始化计算
  useEffect(() => {
    // 如果没有计算结果，触发初始计算
    if (!memoryResult && !isLoading) {
      calculateAdvancedFineTuningMemory();
    }
  }, [memoryResult, isLoading, calculateAdvancedFineTuningMemory]);

  const handleConfigChange = (key: keyof AdvancedFineTuningConfig, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig); // 修复：使用完整的newConfig而不是覆盖

    // 实时验证配置
    const validation = validateAdvancedFineTuningConfig(newConfig);
    setValidationResult(validation);

    // 生成优化建议
    if (memoryResult) {
      const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(
        newConfig,
        memoryResult
      );
      setOptimizationSuggestions(suggestions);
    }
  };

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
      case 'CNN':
        newConfig.cnnConfig = {
          modelSize: 0.05,
          architectureType: 'ResNet',
          precision: 'FP32',
          quantizationSupport: true,
          batchSize: 64,
          gradientAccumulationSteps: 1,
          learningRate: 1e-3,
          optimizer: 'SGD',
          trainingEpochs: 100,
          inputImageSize: 224,
          kernelSize: 3,
          poolingStrategy: 'MaxPool',
          dataAugmentationStrategy: ['RandomCrop', 'RandomFlip'],
          frozenLayers: 0,
          classificationHeadDim: 1000,
          dropoutRate: 0.2,
          weightDecay: 1e-4,
          lrScheduler: 'StepLR',
          freezeBatchNorm: false,
          mixedPrecisionTraining: true,
          warmupSteps: 0,
          gradientClipping: 1.0,
          labelSmoothing: 0.1
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
        
        <div className="grid grid-cols-4 gap-4">
          {(['NLP', 'Multimodal', 'MoE', 'CNN'] as AdvancedModelType[]).map((type) => (
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
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${
          actualTheme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border-white/20'
            : 'bg-gray-50 border-gray-200'
        } rounded-xl p-6 border`}
      >
        {/* 这里将根据模型类型和配置面板类型渲染不同的配置选项 */}
        {config.modelType === 'NLP' && renderNLPConfig(config, setConfig, activeSection, t, setValidationResult, setOptimizationSuggestions, memoryResult)}
        {config.modelType === 'Multimodal' && renderMultimodalConfig(config, setConfig, activeSection, t, setValidationResult, setOptimizationSuggestions, memoryResult)}
        {config.modelType === 'MoE' && renderMoEConfig(config, setConfig, activeSection, t, setValidationResult, setOptimizationSuggestions, memoryResult)}
        {config.modelType === 'CNN' && renderCNNConfig(config, setConfig, activeSection, t, setValidationResult, setOptimizationSuggestions, memoryResult)}
      </motion.div>

      {/* 计算结果显示 */}
      {memoryResult && (
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
        </motion.div>
      )}

      {/* 加载状态 */}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}

// NLP配置面板渲染函数
function renderNLPConfig(
  config: AdvancedFineTuningConfig,
  setConfig: any,
  activeSection: string,
  t: any,
  setValidationResult: any,
  setOptimizationSuggestions: any,
  memoryResult: any
) {
  const nlpConfig = config.nlpConfig;
  if (!nlpConfig) return null;

  const updateNLPConfig = (key: string, value: any) => {
    const newNLPConfig = { ...nlpConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, nlpConfig: newNLPConfig };
    setConfig(updatedConfig);

    // 实时验证配置
    const validation = validateAdvancedFineTuningConfig(updatedConfig);
    setValidationResult(validation);

    // 生成优化建议
    if (memoryResult) {
      const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(
        updatedConfig,
        memoryResult
      );
      setOptimizationSuggestions(suggestions);
    }
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
          <Slider
            value={[nlpConfig.modelSize]}
            onValueChange={([value]) => updateNLPConfig('modelSize', value)}
            max={175}
            min={0.125}
            step={0.125}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>125M</span>
            <span>175B+</span>
          </div>
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
            <Slider
              value={[nlpConfig.batchSize]}
              onValueChange={([value]) => updateNLPConfig('batchSize', value)}
              max={64}
              min={1}
              step={1}
              className="w-full"
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
            <Slider
              value={[nlpConfig.sequenceLength]}
              onValueChange={([value]) => updateNLPConfig('sequenceLength', value)}
              max={32768}
              min={512}
              step={512}
              className="w-full"
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
            <Slider
              value={[nlpConfig.vocabSize]}
              onValueChange={([value]) => updateNLPConfig('vocabSize', value)}
              max={100000}
              min={30000}
              step={1000}
              className="w-full"
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
            <Slider
              value={[nlpConfig.numAttentionHeads]}
              onValueChange={([value]) => updateNLPConfig('numAttentionHeads', value)}
              max={128}
              min={8}
              step={8}
              className="w-full"
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
            <Slider
              value={[nlpConfig.hiddenSize]}
              onValueChange={([value]) => updateNLPConfig('hiddenSize', value)}
              max={12288}
              min={768}
              step={256}
              className="w-full"
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
            <Slider
              value={[nlpConfig.intermediateSize]}
              onValueChange={([value]) => updateNLPConfig('intermediateSize', value)}
              max={49152}
              min={2048}
              step={512}
              className="w-full"
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
            <Slider
              value={[nlpConfig.numLayers]}
              onValueChange={([value]) => updateNLPConfig('numLayers', value)}
              max={96}
              min={12}
              step={4}
              className="w-full"
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
            <Slider
              value={[nlpConfig.loraRank]}
              onValueChange={([value]) => updateNLPConfig('loraRank', value)}
              max={256}
              min={4}
              step={4}
              className="w-full"
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
            <Slider
              value={[nlpConfig.loraAlpha]}
              onValueChange={([value]) => updateNLPConfig('loraAlpha', value)}
              max={128}
              min={16}
              step={8}
              className="w-full"
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
            <Slider
              value={[nlpConfig.maxGenerationLength]}
              onValueChange={([value]) => updateNLPConfig('maxGenerationLength', value)}
              max={4096}
              min={256}
              step={256}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.temperature')}</label>
              <span className="text-sm font-mono text-cyan-600">
                {nlpConfig.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[nlpConfig.temperature]}
              onValueChange={([value]) => updateNLPConfig('temperature', value)}
              max={1.0}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.top.p')}</label>
              <span className="text-sm font-mono text-pink-600">
                {nlpConfig.topP.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[nlpConfig.topP]}
              onValueChange={([value]) => updateNLPConfig('topP', value)}
              max={0.95}
              min={0.9}
              step={0.01}
              className="w-full"
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
            <Slider
              value={[nlpConfig.warmupSteps]}
              onValueChange={([value]) => updateNLPConfig('warmupSteps', value)}
              max={1000}
              min={0}
              step={50}
              className="w-full"
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
            <Slider
              value={[nlpConfig.gradientClipping]}
              onValueChange={([value]) => updateNLPConfig('gradientClipping', value)}
              max={5.0}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.dropout.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {nlpConfig.dropoutRate.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[nlpConfig.dropoutRate]}
              onValueChange={([value]) => updateNLPConfig('dropoutRate', value)}
              max={0.5}
              min={0.0}
              step={0.01}
              className="w-full"
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
          <Slider
            value={[nlpConfig.gradientAccumulationSteps]}
            onValueChange={([value]) => updateNLPConfig('gradientAccumulationSteps', value)}
            max={128}
            min={1}
            step={1}
            className="w-full"
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
  t: any,
  setValidationResult: any,
  setOptimizationSuggestions: any,
  memoryResult: any
) {
  const multimodalConfig = config.multimodalConfig;
  if (!multimodalConfig) return null;

  const updateMultimodalConfig = (key: string, value: any) => {
    const newMultimodalConfig = { ...multimodalConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, multimodalConfig: newMultimodalConfig };
    setConfig(updatedConfig);

    // 实时验证配置
    const validation = validateAdvancedFineTuningConfig(updatedConfig);
    setValidationResult(validation);

    // 生成优化建议
    if (memoryResult) {
      const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(
        updatedConfig,
        memoryResult
      );
      setOptimizationSuggestions(suggestions);
    }
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
            <Slider
              value={[multimodalConfig.modelSize]}
              onValueChange={([value]) => updateMultimodalConfig('modelSize', value)}
              max={100}
              min={1}
              step={0.5}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.imageResolution]}
              onValueChange={([value]) => updateMultimodalConfig('imageResolution', value)}
              max={1024}
              min={224}
              step={112}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>224×224</span>
              <span>1024×1024</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.patch.size')}</label>
              <AnimatedNumber
                value={multimodalConfig.patchSize}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <Slider
              value={[multimodalConfig.patchSize]}
              onValueChange={([value]) => updateMultimodalConfig('patchSize', value)}
              max={32}
              min={14}
              step={2}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.batchSize]}
              onValueChange={([value]) => updateMultimodalConfig('batchSize', value)}
              max={32}
              min={4}
              step={2}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.sequenceLength]}
              onValueChange={([value]) => updateMultimodalConfig('sequenceLength', value)}
              max={2048}
              min={256}
              step={256}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.trainingEpochs]}
              onValueChange={([value]) => updateMultimodalConfig('trainingEpochs', value)}
              max={30}
              min={3}
              step={1}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.visionFeatureDim]}
              onValueChange={([value]) => updateMultimodalConfig('visionFeatureDim', value)}
              max={1024}
              min={768}
              step={64}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.crossModalAlignmentWeight]}
              onValueChange={([value]) => updateMultimodalConfig('crossModalAlignmentWeight', value)}
              max={1.0}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">图像-文本对比权重</label>
              <span className="text-sm font-mono text-purple-600">
                {multimodalConfig.imageTextContrastWeight.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[multimodalConfig.imageTextContrastWeight]}
              onValueChange={([value]) => updateMultimodalConfig('imageTextContrastWeight', value)}
              max={1.0}
              min={0.1}
              step={0.1}
              className="w-full"
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
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.warmup.steps')}</label>
              <AnimatedNumber
                value={multimodalConfig.warmupSteps}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <Slider
              value={[multimodalConfig.warmupSteps]}
              onValueChange={([value]) => updateMultimodalConfig('warmupSteps', value)}
              max={500}
              min={0}
              step={25}
              className="w-full"
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
            <Slider
              value={[multimodalConfig.gradientClipping]}
              onValueChange={([value]) => updateMultimodalConfig('gradientClipping', value)}
              max={5.0}
              min={0.1}
              step={0.1}
              className="w-full"
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
          <Slider
            value={[multimodalConfig.gradientAccumulationSteps]}
            onValueChange={([value]) => updateMultimodalConfig('gradientAccumulationSteps', value)}
            max={32}
            min={1}
            step={1}
            className="w-full"
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
  t: any,
  setValidationResult: any,
  setOptimizationSuggestions: any,
  memoryResult: any
) {
  const moeConfig = config.moeConfig;
  if (!moeConfig) return null;

  const updateMoEConfig = (key: string, value: any) => {
    const newMoEConfig = { ...moeConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, moeConfig: newMoEConfig };
    setConfig(updatedConfig);

    // 实时验证配置
    const validation = validateAdvancedFineTuningConfig(updatedConfig);
    setValidationResult(validation);

    // 生成优化建议
    if (memoryResult) {
      const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(
        updatedConfig,
        memoryResult
      );
      setOptimizationSuggestions(suggestions);
    }
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
            <Slider
              value={[moeConfig.modelSize]}
              onValueChange={([value]) => updateMoEConfig('modelSize', value)}
              max={1600}
              min={1}
              step={1}
              className="w-full"
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
            <Slider
              value={[moeConfig.numExperts]}
              onValueChange={([value]) => updateMoEConfig('numExperts', value)}
              max={2048}
              min={8}
              step={8}
              className="w-full"
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
            <Slider
              value={[moeConfig.numActiveExperts]}
              onValueChange={([value]) => updateMoEConfig('numActiveExperts', value)}
              max={8}
              min={1}
              step={1}
              className="w-full"
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
            <Slider
              value={[moeConfig.batchSize]}
              onValueChange={([value]) => updateMoEConfig('batchSize', value)}
              max={64}
              min={8}
              step={8}
              className="w-full"
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
            <Slider
              value={[moeConfig.sequenceLength]}
              onValueChange={([value]) => updateMoEConfig('sequenceLength', value)}
              max={8192}
              min={512}
              step={512}
              className="w-full"
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
            <Slider
              value={[moeConfig.trainingEpochs]}
              onValueChange={([value]) => updateMoEConfig('trainingEpochs', value)}
              max={5}
              min={1}
              step={1}
              className="w-full"
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
            <Slider
              value={[moeConfig.expertCapacityFactor]}
              onValueChange={([value]) => updateMoEConfig('expertCapacityFactor', value)}
              max={2.0}
              min={1.0}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">专家特化度</label>
              <span className="text-sm font-mono text-green-600">
                {moeConfig.expertSpecialization.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[moeConfig.expertSpecialization]}
              onValueChange={([value]) => updateMoEConfig('expertSpecialization', value)}
              max={1.0}
              min={0.1}
              step={0.1}
              className="w-full"
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
            <Slider
              value={[moeConfig.loadBalanceLossWeight]}
              onValueChange={([value]) => updateMoEConfig('loadBalanceLossWeight', value)}
              max={0.1}
              min={0.01}
              step={0.001}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.auxiliary.loss.weight')}</label>
              <span className="text-sm font-mono text-orange-600">
                {moeConfig.auxiliaryLossWeight.toFixed(4)}
              </span>
            </div>
            <Slider
              value={[moeConfig.auxiliaryLossWeight]}
              onValueChange={([value]) => updateMoEConfig('auxiliaryLossWeight', value)}
              max={0.01}
              min={0.001}
              step={0.0001}
              className="w-full"
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
          <Slider
            value={[moeConfig.expertParallelism]}
            onValueChange={([value]) => updateMoEConfig('expertParallelism', value)}
            max={8}
            min={1}
            step={1}
            className="w-full"
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
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.regularization')}</label>
              <span className="text-sm font-mono text-green-600">
                {moeConfig.expertRegularization.toFixed(3)}
              </span>
            </div>
            <Slider
              value={[moeConfig.expertRegularization]}
              onValueChange={([value]) => updateMoEConfig('expertRegularization', value)}
              max={0.1}
              min={0.001}
              step={0.001}
              className="w-full"
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
            <Slider
              value={[moeConfig.gradientClipping]}
              onValueChange={([value]) => updateMoEConfig('gradientClipping', value)}
              max={5.0}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.expert.dropout.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {moeConfig.expertDropoutRate.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[moeConfig.expertDropoutRate]}
              onValueChange={([value]) => updateMoEConfig('expertDropoutRate', value)}
              max={0.1}
              min={0.0}
              step={0.01}
              className="w-full"
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
            <Slider
              value={[moeConfig.warmupSteps]}
              onValueChange={([value]) => updateMoEConfig('warmupSteps', value)}
              max={200}
              min={0}
              step={10}
              className="w-full"
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
            <Slider
              value={[moeConfig.gradientAccumulationSteps]}
              onValueChange={([value]) => updateMoEConfig('gradientAccumulationSteps', value)}
              max={16}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('advanced.finetuning.moe')} {activeSection} {t('advanced.finetuning.config')}</div>;
}

function renderCNNConfig(
  config: AdvancedFineTuningConfig,
  setConfig: any,
  activeSection: string,
  t: any,
  setValidationResult: any,
  setOptimizationSuggestions: any,
  memoryResult: any
) {
  const cnnConfig = config.cnnConfig;
  if (!cnnConfig) return null;

  const updateCNNConfig = (key: string, value: any) => {
    const newCNNConfig = { ...cnnConfig, [key]: value };

    // 更新store配置，这会触发防抖计算 - 修复：保留其他配置
    const updatedConfig = { ...config, cnnConfig: newCNNConfig };
    setConfig(updatedConfig);

    // 实时验证配置
    const validation = validateAdvancedFineTuningConfig(updatedConfig);
    setValidationResult(validation);

    // 生成优化建议
    if (memoryResult) {
      const suggestions = OptimizationAdvisor.generateOptimizationSuggestions(
        updatedConfig,
        memoryResult
      );
      setOptimizationSuggestions(suggestions);
    }
  };

  if (activeSection === 'basic') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.cnn.basic.config')}</h4>

        {/* 模型大小和图像尺寸 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.model.size.label')}</label>
              <AnimatedNumber
                value={cnnConfig.modelSize}
                format={(n) => `${n}M`}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <Slider
              value={[cnnConfig.modelSize * 1000]}
              onValueChange={([value]) => updateCNNConfig('modelSize', value / 1000)}
              max={500}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.input.image.size')}</label>
              <span className="text-sm font-mono text-green-600">
                {cnnConfig.inputImageSize}×{cnnConfig.inputImageSize}
              </span>
            </div>
            <Slider
              value={[cnnConfig.inputImageSize]}
              onValueChange={([value]) => updateCNNConfig('inputImageSize', value)}
              max={512}
              min={224}
              step={32}
              className="w-full"
            />
          </div>
        </div>

        {/* 架构和训练参数 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.architecture.type')}</label>
            <Select
              value={cnnConfig.architectureType}
              onValueChange={(value: ModelArchitectureType) => updateCNNConfig('architectureType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ResNet">ResNet</SelectItem>
                <SelectItem value="EfficientNet">EfficientNet</SelectItem>
                <SelectItem value="ConvNeXt">ConvNeXt</SelectItem>
                <SelectItem value="RegNet">RegNet</SelectItem>
                <SelectItem value="DenseNet">DenseNet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.batch.size')}</label>
              <AnimatedNumber
                value={cnnConfig.batchSize}
                className="text-sm font-mono text-purple-600"
              />
            </div>
            <Slider
              value={[cnnConfig.batchSize]}
              onValueChange={([value]) => updateCNNConfig('batchSize', value)}
              max={512}
              min={32}
              step={32}
              className="w-full"
            />
          </div>
        </div>

        {/* 学习率和训练轮数 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.learning.rate')}</label>
              <span className="text-sm font-mono text-orange-600">
                {cnnConfig.learningRate.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(cnnConfig.learningRate)]}
              onValueChange={([value]) => updateCNNConfig('learningRate', Math.pow(10, value))}
              max={-2}
              min={-4}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1e-4</span>
              <span>1e-2</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.training.epochs')}</label>
              <AnimatedNumber
                value={cnnConfig.trainingEpochs}
                className="text-sm font-mono text-red-600"
              />
            </div>
            <Slider
              value={[cnnConfig.trainingEpochs]}
              onValueChange={([value]) => updateCNNConfig('trainingEpochs', value)}
              max={300}
              min={50}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'advanced') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.cnn.advanced.config')}</h4>

        {/* 卷积配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.pooling.strategy')}</label>
            <Select
              value={cnnConfig.poolingStrategy}
              onValueChange={(value) => updateCNNConfig('poolingStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={t('advanced.finetuning.pooling.maxpool')}>MaxPool</SelectItem>
                <SelectItem value={t('advanced.finetuning.pooling.avgpool')}>AvgPool</SelectItem>
                <SelectItem value={t('advanced.finetuning.pooling.adaptive.avgpool')}>AdaptiveAvgPool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">冻结层数</label>
              <AnimatedNumber
                value={cnnConfig.frozenLayers}
                className="text-sm font-mono text-blue-600"
              />
            </div>
            <Slider
              value={[cnnConfig.frozenLayers]}
              onValueChange={([value]) => updateCNNConfig('frozenLayers', value)}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* 分类头配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">分类头维度</label>
              <AnimatedNumber
                value={cnnConfig.classificationHeadDim}
                className="text-sm font-mono text-green-600"
              />
            </div>
            <Slider
              value={[cnnConfig.classificationHeadDim]}
              onValueChange={([value]) => updateCNNConfig('classificationHeadDim', value)}
              max={10000}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.lr.scheduler')}</label>
            <Select
              value={cnnConfig.lrScheduler}
              onValueChange={(value) => updateCNNConfig('lrScheduler', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={t('advanced.finetuning.lr.scheduler.step')}>StepLR</SelectItem>
                <SelectItem value={t('advanced.finetuning.lr.scheduler.cosine')}>CosineAnnealingLR</SelectItem>
                <SelectItem value={t('advanced.finetuning.lr.scheduler.plateau')}>ReduceLROnPlateau</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 数据增强策略 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('advanced.finetuning.data.augmentation.strategy')}</label>
          <div className="grid grid-cols-2 gap-2">
            {['RandomCrop', 'RandomFlip', 'ColorJitter', 'AutoAugment'].map((strategy) => (
              <label key={strategy} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={cnnConfig.dataAugmentationStrategy.includes(strategy as any)}
                  onChange={(e) => {
                    const current = cnnConfig.dataAugmentationStrategy;
                    if (e.target.checked) {
                      updateCNNConfig('dataAugmentationStrategy', [...current, strategy]);
                    } else {
                      updateCNNConfig('dataAugmentationStrategy', current.filter(s => s !== strategy));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{strategy}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 批归一化设置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('advanced.finetuning.batch.normalization')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cnnConfig.freezeBatchNorm}
                onChange={(e) => updateCNNConfig('freezeBatchNorm', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{t('advanced.finetuning.freeze.bn.layers')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">混合精度训练</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cnnConfig.mixedPrecisionTraining}
                onChange={(e) => updateCNNConfig('mixedPrecisionTraining', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">启用AMP</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'optimization') {
    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold mb-4">{t('advanced.finetuning.cnn.optimization.settings')}</h4>

        {/* 正则化配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dropout率</label>
              <span className="text-sm font-mono text-blue-600">
                {cnnConfig.dropoutRate.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[cnnConfig.dropoutRate]}
              onValueChange={([value]) => updateCNNConfig('dropoutRate', value)}
              max={0.5}
              min={0.1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">权重衰减</label>
              <span className="text-sm font-mono text-green-600">
                {cnnConfig.weightDecay.toExponential(1)}
              </span>
            </div>
            <Slider
              value={[Math.log10(cnnConfig.weightDecay)]}
              onValueChange={([value]) => updateCNNConfig('weightDecay', Math.pow(10, value))}
              max={-2}
              min={-4}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* 梯度裁剪和标签平滑 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.clipping')}</label>
              <span className="text-sm font-mono text-purple-600">
                {cnnConfig.gradientClipping.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[cnnConfig.gradientClipping]}
              onValueChange={([value]) => updateCNNConfig('gradientClipping', value)}
              max={5.0}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.label.smoothing')}</label>
              <span className="text-sm font-mono text-orange-600">
                {cnnConfig.labelSmoothing.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[cnnConfig.labelSmoothing]}
              onValueChange={([value]) => updateCNNConfig('labelSmoothing', value)}
              max={0.3}
              min={0.0}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>

        {/* 预热和梯度累积 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">预热步数</label>
              <AnimatedNumber
                value={cnnConfig.warmupSteps}
                className="text-sm font-mono text-cyan-600"
              />
            </div>
            <Slider
              value={[cnnConfig.warmupSteps]}
              onValueChange={([value]) => updateCNNConfig('warmupSteps', value)}
              max={1000}
              min={0}
              step={50}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('advanced.finetuning.gradient.accumulation.steps')}</label>
              <AnimatedNumber
                value={cnnConfig.gradientAccumulationSteps}
                className="text-sm font-mono text-pink-600"
              />
            </div>
            <Slider
              value={[cnnConfig.gradientAccumulationSteps]}
              onValueChange={([value]) => updateCNNConfig('gradientAccumulationSteps', value)}
              max={8}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return <div>{t('advanced.finetuning.cnn')} {activeSection} {t('advanced.finetuning.config')}</div>;
}
