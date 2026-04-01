'use client';

import { useMemo, useState, useEffect } from 'react';import { motion } from 'framer-motion';
import { Brain, Layers, TrendingUp, Lightbulb } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TickSlider } from '@/components/ui/tick-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedNumber } from '@/components/animated-number';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { formatMemorySize } from '@/utils/memory-formulas';
import { getModelById, getModelsByArchitectureAndVendor, getVendorsForArchitecture } from '@/lib/models-data';
import { FineTuningConfig, FineTuningMethod, PrecisionType, QuantizationType, ModelVendor } from '@/types';
import { useCalculatorStore } from '@/store/calculator-store';
import { useLanguage } from '@/contexts/language-context';

export function FineTuningCalculator() {
  const {
    fineTuningConfig: config,
    setFineTuningConfig: setConfig,
    fineTuningResult: memoryResult,
    fineTuningLoading: isLoading,
    calculateFineTuningMemory,
  } = useCalculatorStore();

  const { t } = useLanguage();

  useEffect(() => {
    if (!memoryResult) calculateFineTuningMemory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初始供应商：从当前 baseModel 反查，找不到则默认 DeepSeek
  const initialVendor = useMemo((): ModelVendor => {
    const model = getModelById(config.baseModel);
    return (model?.vendor as ModelVendor) || 'DeepSeek';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedVendor, setSelectedVendor] = useState<ModelVendor>(initialVendor);

  // 获取基础模型信息
  const baseModel = useMemo(() => 
    getModelById(config.baseModel), [config.baseModel]
  );

  const handleConfigChange = (key: keyof FineTuningConfig, value: unknown) => {
    setConfig({ [key]: value });
  };

  // 获取该架构下有模型的供应商列表
  const vendors = useMemo(() => getVendorsForArchitecture('nlp'), []);

  // 按供应商和参数量分组NLP模型
  const modelsBySize = useMemo(() => {
    const nlpModels = getModelsByArchitectureAndVendor('nlp', selectedVendor);
    
    return {
      small: nlpModels.filter(m => m.params <= 3),
      medium: nlpModels.filter(m => m.params > 3 && m.params <= 15),
      large: nlpModels.filter(m => m.params > 15 && m.params <= 50),
      xlarge: nlpModels.filter(m => m.params > 50)
    };
  }, [selectedVendor]);

  const methodDescriptions = {
    'Full': t('finetuning.full.description'),
    'LoRA': t('finetuning.lora.description'),
    'QLoRA': t('finetuning.qlora.description'),
    'Prefix': t('finetuning.prefix.description')
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
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold">{t('finetuning.config')}</h3>
        </div>

        {/* 基础模型选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('base.model')}</label>
          
          {/* 供应商选项卡 */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {vendors.map((vendor) => (
              <button
                key={vendor}
                onClick={() => setSelectedVendor(vendor)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedVendor === vendor
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {vendor}
              </button>
            ))}
          </div>

          <Select 
            value={config.baseModel} 
            onValueChange={(value) => handleConfigChange('baseModel', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                {t('small.model.3b')}
              </div>
              {modelsBySize.small.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.params}B)
                </SelectItem>
              ))}
              
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                {t('medium.model.3.15b')}
              </div>
              {modelsBySize.medium.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.params}B)
                </SelectItem>
              ))}
              
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                {t('large.model.15.50b')}
              </div>
              {modelsBySize.large.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.params}B)
                </SelectItem>
              ))}
              
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                {t('xlarge.model.50b')}
              </div>
              {modelsBySize.xlarge.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.params}B)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* 模型信息显示 */}
          {baseModel && (
            <div className="p-3 bg-white/10 rounded-lg border border-white/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span>{t('parameters')}:</span>
                <span className="font-mono">{baseModel.params}B</span>
              </div>
              <div className="flex justify-between">
                <span>{t('architecture')}:</span>
                <span className="font-mono">{baseModel.architecture}</span>
              </div>
            </div>
          )}
        </div>

        {/* 微调方法选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('finetuning.method')}</label>
          <Select 
            value={config.method} 
            onValueChange={(value: FineTuningMethod) => handleConfigChange('method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full">{t('finetuning.full.params')}</SelectItem>
              <SelectItem value="LoRA">{t('lora.recommended')}</SelectItem>
              <SelectItem value="QLoRA">{t('qlora.large.model.recommended')}</SelectItem>
              <SelectItem value="Prefix">Prefix Tuning</SelectItem>
            </SelectContent>
          </Select>
          
          {/* 方法说明 */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs">
            {methodDescriptions[config.method]}
          </div>
        </div>

        {/* LoRA 特定配置 */}
        {(config.method === 'LoRA' || config.method === 'QLoRA') && (
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-sm font-medium text-purple-600">{t('lora.parameters.config')}</div>
            
            {/* LoRA Rank */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">{t('rank.r')}</label>
                <AnimatedNumber 
                  value={config.loraRank ?? 4} 
                  className="text-sm font-mono text-purple-600"
                />
              </div>
              <Slider
                value={[config.loraRank ?? 4]}
                onValueChange={([value]) => handleConfigChange('loraRank', value)}
                max={128}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 ({t('minimum')})</span>
                <span>128 ({t('maximum')})</span>
              </div>
            </div>

            {/* LoRA Alpha */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">{t('alpha.a')}</label>
                <AnimatedNumber 
                  value={config.loraAlpha ?? 16} 
                  className="text-sm font-mono text-purple-600"
                />
              </div>
              <Slider
                value={[config.loraAlpha ?? 16]}
                onValueChange={([value]) => handleConfigChange('loraAlpha', value)}
                max={128}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>128</span>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              <div>• {t('rank.larger.more.params')}</div>
              <div>• {t('alpha.controls.learning.rate')}</div>
            </div>
          </div>
        )}

        {/* 量化和精度配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">量化方式</label>
            <Select 
              value={config.quantization} 
              onValueChange={(value: QuantizationType) => handleConfigChange('quantization', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">无量化</SelectItem>
                <SelectItem value="INT8">INT8 (4倍压缩)</SelectItem>
                <SelectItem value="INT4">INT4 (8倍压缩)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('training.precision')}</label>
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
        </div>

        {/* 批大小和序列长度 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('batch.size')}</label>
              <AnimatedNumber value={config.batchSize} className="text-sm font-mono text-green-600" />
            </div>
            <TickSlider
              value={config.batchSize}
              onChange={(v) => handleConfigChange('batchSize', v)}
              min={1} max={32} step={1}
              ticks={[1, 8, 16, 32].map(n => ({ value: n, label: String(n) }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('sequence.length')}</label>
              <AnimatedNumber value={config.sequenceLength} className="text-sm font-mono text-purple-600" />
            </div>
            <TickSlider
              value={config.sequenceLength}
              onChange={(v) => handleConfigChange('sequenceLength', v)}
              min={512} max={32768} step={512}
              ticks={[1024, 4096, 8192, 16384, 32768].map(n => ({ value: n, label: `${n / 1024}K` }))}
            />
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
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold">{t('finetuning.memory.requirement')}</h3>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              <AnimatedNumber 
                value={memoryResult?.total || 0} 
                format={formatMemorySize}
              />
            </div>
            <p className="text-sm text-gray-600">总显存需求</p>
          </div>

          {/* 方法效率显示 */}
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-xs text-purple-700 font-medium">
              {t('finetuning.efficiency')}
            </div>
            <div className="text-sm mt-1">
              {config.method === 'Full' && t('finetuning.full.effect.best')}
              {config.method === 'LoRA' && `${t('finetuning.lora.params.percent')}${(((config.loraRank ?? 4) * 2 * 4096) / (baseModel?.params || 7) / 1e9 * 100).toFixed(2)}${t('finetuning.params.to.train')}`}
              {config.method === 'QLoRA' && t('finetuning.qlora.optimal')}
              {config.method === 'Prefix' && t('finetuning.prefix.one.percent')}
            </div>
          </div>
        </div>

        {/* 显存分解 */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">显存分解</h3>
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
                      (<AnimatedNumber value={item.percentage} format={(n) => `${n.toFixed(1)}%`} />)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 微调建议 */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold">{t('finetuning.suggestions')}</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            {config.method === 'Full' && baseModel && baseModel.params > 7 && (
              <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <span>{t('finetuning.large.model.suggestion')}</span>
              </div>
            )}

            {config.method === 'LoRA' && (config.loraRank ?? 4) < 8 && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>{t('finetuning.rank.too.small')}</span>
              </div>
            )}

            {config.method === 'LoRA' && (config.loraRank ?? 4) > 64 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                <span>{t('rank.large.memory.increase')}</span>
              </div>
            )}

            {config.quantization === 'None' && baseModel && baseModel.params > 13 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>{t('large.model.use.quantization')}</span>
              </div>
            )}

            {config.method === 'QLoRA' && config.quantization === 'None' && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span>{t('qlora.needs.quantization')}</span>
              </div>
            )}

            {(config.loraAlpha ?? 16) / (config.loraRank ?? 4) < 1 && (config.method === 'LoRA' || config.method === 'QLoRA') && (
              <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                <span>{t('alpha.rank.ratio.too.small')}</span>
              </div>
            )}
          </div>
        </div>
        </LoadingOverlay>
      </motion.div>
    </div>
  );
} 