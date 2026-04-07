'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, BarChart3, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TickSlider } from '@/components/ui/tick-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedNumber } from '@/components/animated-number';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { formatMemorySize, formatPercentage } from '@/utils/memory-formulas';
import { getModelById } from '@/lib/models-data';
import { InferenceConfig, PrecisionType, QuantizationType } from '@/types';
import { useCalculatorStore } from '@/store/calculator-store';
import { useLanguage } from '@/contexts/language-context';
import { ModelSelector } from '@/components/model-selector';

export function InferenceCalculator() {
  const { 
    inferenceConfig: config, 
    setInferenceConfig: setConfig,
    inferenceResult: memoryResult,
    inferenceLoading: isLoading,
    calculateInferenceMemory,
    savedCustomModels,
  } = useCalculatorStore();
  
  const { t } = useLanguage();

  useEffect(() => {
    if (!memoryResult) calculateInferenceMemory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当前选中模型（用于建议提示）
  const selectedModel = useMemo(() => {
    return getModelById(config.modelId) ?? savedCustomModels.find(m => m.id === config.modelId) ?? null;
  }, [config.modelId, savedCustomModels]);

  const handleConfigChange = (key: keyof InferenceConfig, value: unknown) => {
    setConfig({ [key]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
      {/* 配置面板 */}
      <motion.div
        className="glass-card p-6 space-y-6"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl glass-card">
            <Cpu className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold">{t('inference.config')}</h3>
        </div>

        {/* 模型选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('preset.model')}</label>
          <ModelSelector
            value={config.modelId}
            onChange={(id) => handleConfigChange('modelId', id)}
            arch="nlp"
            accentColor="green"
          />
        </div>

        {/* 精度和量化 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('numerical.precision')}</label>
            <Select 
              value={config.precision} 
              onValueChange={(value: PrecisionType) => handleConfigChange('precision', value)}
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
            <label className="text-sm font-medium">{t('quantization.method')}</label>
            <Select 
              value={config.quantization} 
              onValueChange={(value: QuantizationType) => handleConfigChange('quantization', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">{t('no.quantization')}</SelectItem>
                <SelectItem value="INT8">{t('int8.compression')}</SelectItem>
                <SelectItem value="INT4">{t('int4.compression')}</SelectItem>
                <SelectItem value="FP8">{t('fp8.compression')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 批次大小 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('batch.size')}</label>
            <AnimatedNumber 
              value={config.batchSize} 
              className="text-sm font-mono text-green-600"
            />
          </div>
          <TickSlider
            value={config.batchSize}
            onChange={(v) => handleConfigChange('batchSize', v)}
            min={1} max={32} step={1}
            ticks={[1, 8, 16, 32].map(n => ({ value: n, label: String(n) }))}
          />
        </div>

        {/* 序列长度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('sequence.length')}</label>
            <AnimatedNumber 
              value={config.sequenceLength} 
              className="text-sm font-mono text-purple-600"
            />
          </div>
          <TickSlider
            value={config.sequenceLength}
            onChange={(v) => handleConfigChange('sequenceLength', v)}
            min={512} max={32768} step={512}
            ticks={[1024, 4096, 8192, 16384, 32768].map(n => ({ value: n, label: `${n / 1024}K` }))}
          />
        </div>

        {/* 并发用户数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">并发用户数</label>
            <AnimatedNumber 
              value={config.concurrentUsers} 
              className="text-sm font-mono text-orange-600"
            />
          </div>
          <TickSlider
            value={config.concurrentUsers}
            onChange={(v) => handleConfigChange('concurrentUsers', v)}
            min={1} max={32} step={1}
            ticks={[1, 4, 8, 16, 32].map(n => ({ value: n, label: String(n) }))}
          />
        </div>

        {/* KV缓存比例 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('kv.cache.ratio')}</label>
            <AnimatedNumber 
              value={config.kvCacheRatio * 100} 
              format={(n) => `${n.toFixed(0)}%`}
              className="text-sm font-mono text-blue-600"
            />
          </div>
          <Slider
            value={[config.kvCacheRatio]}
            onValueChange={([value]) => handleConfigChange('kvCacheRatio', value)}
            max={1}
            min={0.1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10% ({t('compressed')})</span>
            <span>100% ({t('complete')})</span>
          </div>
        </div>
      </motion.div>

      {/* 结果面板 */}
      <motion.div
        className="space-y-6"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <LoadingOverlay isLoading={isLoading}>
        {/* 总显存需求 */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold">{t('inference.memory.requirement')}</h3>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
              <AnimatedNumber 
                value={memoryResult?.total || 0} 
                format={formatMemorySize}
              />
            </div>
            <p className="text-sm text-gray-600">{t('total.memory.requirement')}</p>
          </div>

          {/* 压缩效果显示 */}
          {config.quantization !== 'None' && (
            <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-xs text-green-700 font-medium">
                {t('quantization.compression.effect')}
              </div>
              <div className="text-sm mt-1">
                {config.quantization === 'INT8' && t('model.size.reduction.75')}
                {config.quantization === 'INT4' && t('model.size.reduction.87.5')}
                {config.quantization === 'FP8' && t('model.size.reduction.75')}
              </div>
            </div>
          )}
        </div>

        {/* 显存分解 */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">{t('memory.breakdown')}</h3>
          </div>
          
          <div className="space-y-4">
            {memoryResult?.breakdown?.map((item, index) => (
              <motion.div
                key={item.label}
                className="space-y-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatedNumber 
                      value={item.value} 
                      format={formatMemorySize}
                      className="font-mono text-xs"
                    />
                    <span className="text-xs text-gray-500">
                      (<AnimatedNumber value={item.percentage} format={formatPercentage} />)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(item.percentage, item.value > 0 ? 0.3 : 0)}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 推理优化建议 */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold">{t('optimization.suggestions')}</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            {config.quantization === 'None' && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>{t('use.int8.quantization')}</span>
              </div>
            )}
            
            {config.kvCacheRatio > 0.7 && config.sequenceLength > 4096 && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>{t('inference.long.sequence.suggestion')}</span>
              </div>
            )}
            
            {config.batchSize > 8 && (
              <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <span>{t('inference.large.batch.suggestion')}</span>
              </div>
            )}

            {selectedModel && selectedModel.params > 30 && config.quantization === 'None' && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span>{t('inference.large.model.suggestion')}</span>
              </div>
            )}
          </div>
        </div>
        </LoadingOverlay>
      </motion.div>
    </div>
  );
} 