'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Database, BarChart3, Eye } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { TickSlider } from '@/components/ui/tick-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedNumber } from '@/components/animated-number';

import { formatMemorySize } from '@/utils/memory-formulas';
import { getModelById, getModelsByCategoryArchitectureAndVendor, getVendorsForArchitecture } from '@/lib/models-data';
import { MultimodalConfig, PrecisionType, ModalityType, ModelVendor } from '@/types';
import { useCalculatorStore } from '@/store/calculator-store';
import { useLanguage } from '@/contexts/language-context';

interface MultimodalCalculatorProps {
  mode?: 'training' | 'inference' | 'finetuning';
}

export function MultimodalCalculator({ mode = 'inference' }: MultimodalCalculatorProps) {
  const { 
    multimodalConfig: config, 
    setMultimodalConfig: setConfig,
    multimodalResult: memoryResult,
    multimodalLoading: isLoading
  } = useCalculatorStore();
  
  const { t } = useLanguage();
  const [selectedVendor, setSelectedVendor] = useState<ModelVendor>('Qwen');

  // 使用配置中的mode，如果没有则使用props中的mode
  const currentMode = config.mode || mode;

  // 获取当前选中模型信息
  const selectedModel = useMemo(() => 
    getModelById(config.modelId), [config.modelId]
  );

  const handleConfigChange = (key: keyof MultimodalConfig, value: unknown) => {
    setConfig({ [key]: value });
  };

  // 获取该架构下有模型的供应商列表
  const vendors = useMemo(() => getVendorsForArchitecture('multimodal'), []);

  // 按供应商和系列分组多模态模型
  const modelsByCategory = useMemo(() => {
    return getModelsByCategoryArchitectureAndVendor('multimodal', selectedVendor);
  }, [selectedVendor]);

  // 计算图像Token数量
  const numPatches = useMemo(() => {
    return Math.pow(config.imageResolution / config.patchSize, 2);
  }, [config.imageResolution, config.patchSize]);

  const totalImageTokens = useMemo(() => {
    return numPatches * config.numImages * config.batchSize;
  }, [numPatches, config.numImages, config.batchSize]);

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
            <Eye className="w-5 h-5 text-cyan-500" />
          </div>
          <h3 className="text-xl font-semibold">
            {currentMode === 'training' ? t('multimodal.training.config') : 
             currentMode === 'finetuning' ? t('multimodal.finetuning.config') : 
             t('multimodal.inference.config')}
          </h3>
        </div>

        {/* 模态类型选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('multimodal.modality.type')}</label>
          <Select 
            value={config.modalityType} 
            onValueChange={(value: ModalityType) => handleConfigChange('modalityType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-image">{t('multimodal.text.image')}</SelectItem>
              <SelectItem value="text-audio">{t('multimodal.text.audio')}</SelectItem>
              <SelectItem value="text-video">{t('multimodal.text.video')}</SelectItem>
              <SelectItem value="audio-video">{t('multimodal.audio.video')}</SelectItem>
              <SelectItem value="text-audio-video">{t('multimodal.text.audio.video')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 模型选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('multimodal.base.model')}</label>
          
          {/* 供应商选项卡 */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {vendors.map((vendor) => (
              <button
                key={vendor}
                onClick={() => setSelectedVendor(vendor)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedVendor === vendor
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {vendor}
              </button>
            ))}
          </div>

          <Select 
            value={config.modelId} 
            onValueChange={(value) => handleConfigChange('modelId', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {Object.entries(modelsByCategory).map(([category, models]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                    {category}
                  </div>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.params}B)
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          
          {/* 模型信息显示 */}
          {selectedModel && (
            <div className="glass-card p-3 mt-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('multimodal.parameters')}:</span>
                  <span className="ml-2 font-mono">{selectedModel.params}B</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('multimodal.architecture')}:</span>
                  <span className="ml-2 font-mono">{selectedModel.architecture}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('multimodal.hidden.layers')}:</span>
                  <span className="ml-2 font-mono">{selectedModel.hiddenSize}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('multimodal.num.layers')}:</span>
                  <span className="ml-2 font-mono">{selectedModel.numLayers}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 精度配置 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(config.modalityType?.includes('text')) && (
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('multimodal.text.precision')}</label>
              <Select 
                value={config.textPrecision} 
                onValueChange={(value: PrecisionType) => handleConfigChange('textPrecision', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP32">{t('precision.fp32')}</SelectItem>
                  <SelectItem value="FP16">{t('precision.fp16')}</SelectItem>
                  <SelectItem value="BF16">{t('precision.bf16')}</SelectItem>
                  <SelectItem value="FP8">{t('precision.fp8')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(config.modalityType?.includes('image') || config.modalityType?.includes('video')) && (
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('multimodal.vision.precision')}</label>
              <Select 
                value={config.visionPrecision} 
                onValueChange={(value: PrecisionType) => handleConfigChange('visionPrecision', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP32">{t('precision.fp32')}</SelectItem>
                  <SelectItem value="FP16">{t('precision.fp16')}</SelectItem>
                  <SelectItem value="BF16">{t('precision.bf16')}</SelectItem>
                  <SelectItem value="FP8">{t('precision.fp8')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.modalityType?.includes('audio') && (
            <div className="space-y-3">
              <label className="text-sm font-medium">{t('multimodal.audio.precision')}</label>
              <Select 
                value={config.audioPrecision || 'FP16'} 
                onValueChange={(value: PrecisionType) => handleConfigChange('audioPrecision', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FP32">{t('precision.fp32')}</SelectItem>
                  <SelectItem value="FP16">{t('precision.fp16')}</SelectItem>
                  <SelectItem value="BF16">{t('precision.bf16')}</SelectItem>
                  <SelectItem value="FP8">{t('precision.fp8')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* 批量大小和序列长度 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              <span>{t('multimodal.batch.size')}</span>
              <span className="font-mono text-cyan-600">{config.batchSize}</span>
            </label>
            <TickSlider
              value={config.batchSize}
              onChange={(v) => handleConfigChange('batchSize', v)}
              min={1} max={16} step={1}
              ticks={[1,2,4,8,12,16].map(n => ({ value: n, label: String(n) }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              <span>{t('multimodal.sequence.length')}</span>
              <span className="font-mono text-cyan-600">{config.sequenceLength}</span>
            </label>
            <TickSlider
              value={config.sequenceLength}
              onChange={(v) => handleConfigChange('sequenceLength', v)}
              min={512} max={32768} step={512}
              ticks={[1024,4096,8192,16384,32768].map(n => ({ value: n, label: `${n/1024}K` }))}
            />
          </div>
        </div>

        {/* 图像配置 */}
        {(config.modalityType?.includes('image') || config.modalityType?.includes('video')) && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-4 h-4" />
              {t('multimodal.image.config')}
            </h4>
          
          {/* 图像分辨率 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>{t('multimodal.image.resolution')}</span>
              <span className="font-mono text-cyan-600">{config.imageResolution}x{config.imageResolution}</span>
            </label>
            <Select 
              value={config.imageResolution.toString()} 
              onValueChange={(value) => handleConfigChange('imageResolution', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="224">{t('resolution.224')}</SelectItem>
                <SelectItem value="336">{t('resolution.336')}</SelectItem>
                <SelectItem value="448">{t('resolution.448')}</SelectItem>
                <SelectItem value="512">{t('resolution.512')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patch大小 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex justify-between">
              <span>{t('multimodal.patch.size')}</span>
              <span className="font-mono text-cyan-600">{config.patchSize}x{config.patchSize}</span>
            </label>
            <Select 
              value={config.patchSize.toString()} 
              onValueChange={(value) => handleConfigChange('patchSize', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14">{t('patch.14')}</SelectItem>
                <SelectItem value="16">{t('patch.16')}</SelectItem>
                <SelectItem value="32">{t('patch.32')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 每样本图像数量 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              <span>{t('multimodal.num.images')}</span>
              <span className="font-mono text-cyan-600">{config.numImages}</span>
            </label>
            <TickSlider
              value={config.numImages}
              onChange={(v) => handleConfigChange('numImages', v)}
              min={1} max={8} step={1}
              ticks={[1,2,3,4,5,6,7,8].map(n => ({ value: n, label: String(n) }))}
            />
          </div>

          {/* 独立视觉编码器 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('multimodal.vision.encoder')}</label>
            <button
              onClick={() => handleConfigChange('hasVisionEncoder', !config.hasVisionEncoder)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                config.hasVisionEncoder ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                config.hasVisionEncoder ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

            {/* 图像Token统计 */}
            <div className="glass-card p-3 space-y-2">
              <div className="text-xs text-gray-400">{t('multimodal.image.tokens')}:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>{t('multimodal.patches.per.image')}: <span className="font-mono text-cyan-400">{numPatches}</span></div>
                <div>{t('multimodal.total.image.tokens')}: <span className="font-mono text-cyan-400">{totalImageTokens}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 音频配置 */}
        {config.modalityType?.includes('audio') && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.814L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.814a1 1 0 011.617.814zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              {t('multimodal.audio.config')}
            </h4>
            
            {/* 音频采样率 */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex justify-between">
                <span>{t('multimodal.sample.rate')}</span>
                <span className="font-mono text-cyan-600">{config.audioSampleRate || 16000}</span>
              </label>
              <Select 
                value={(config.audioSampleRate || 16000).toString()} 
                onValueChange={(value) => handleConfigChange('audioSampleRate', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16000">{t('samplerate.16k')}</SelectItem>
                  <SelectItem value="22050">{t('samplerate.22k')}</SelectItem>
                  <SelectItem value="44100">{t('samplerate.44k')}</SelectItem>
                  <SelectItem value="48000">{t('samplerate.48k')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 音频窗口长度 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>{t('multimodal.window.length')}</span>
                <span className="font-mono text-cyan-600">{config.audioWindowLength || 30}</span>
              </label>
              <TickSlider
                value={config.audioWindowLength || 30}
                onChange={(v) => handleConfigChange('audioWindowLength', v)}
                min={5} max={120} step={5}
                ticks={[5,10,15,20,30,45,60,90,120].map(n => ({ value: n, label: `${n}s` }))}
              />
            </div>

            {/* 独立音频编码器 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('multimodal.audio.encoder')}</label>
              <button
                onClick={() => handleConfigChange('hasAudioEncoder', !(config.hasAudioEncoder))}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  config.hasAudioEncoder ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  config.hasAudioEncoder ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* 视频配置 */}
        {config.modalityType?.includes('video') && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              {t('multimodal.video.config')}
            </h4>
            
            {/* 视频帧率 */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex justify-between">
                <span>{t('multimodal.frame.rate')}</span>
                <span className="font-mono text-cyan-600">{config.videoFrameRate || 25}</span>
              </label>
              <Select 
                value={(config.videoFrameRate || 25).toString()} 
                onValueChange={(value) => handleConfigChange('videoFrameRate', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">{t('framerate.10')}</SelectItem>
                  <SelectItem value="15">{t('framerate.15')}</SelectItem>
                  <SelectItem value="25">{t('framerate.25')}</SelectItem>
                  <SelectItem value="30">{t('framerate.30')}</SelectItem>
                  <SelectItem value="60">{t('framerate.60')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 视频长度 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>{t('multimodal.video.length')}</span>
                <span className="font-mono text-cyan-600">{config.videoLength || 10}</span>
              </label>
              <TickSlider
                value={config.videoLength || 10}
                onChange={(v) => handleConfigChange('videoLength', v)}
                min={1} max={60} step={1}
                ticks={[1,5,10,15,20,30,45,60].map(n => ({ value: n, label: `${n}s` }))}
              />
            </div>

            {/* 独立视频编码器 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('multimodal.video.encoder')}</label>
              <button
                onClick={() => handleConfigChange('hasVideoEncoder', !(config.hasVideoEncoder))}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  config.hasVideoEncoder ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                  config.hasVideoEncoder ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* 结果面板 */}
      <motion.div
        className="glass-card p-6 relative"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl glass-card">
            <Database className="w-5 h-5 text-cyan-500" />
          </div>
          <h3 className="text-xl font-semibold">
            {currentMode === 'training' ? t('multimodal.memory.requirement') : currentMode === 'finetuning' ? t('multimodal.memory.requirement.finetuning') : t('multimodal.memory.requirement.inference')}
          </h3>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="w-8 h-8 animate-spin text-cyan-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          </div>
        )}

        {memoryResult && (
          <div className="space-y-6">
            {/* 总显存需求 */}
            <div className="text-center glass-card p-4">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                <AnimatedNumber 
                  value={memoryResult.total} 
                  format={(n) => formatMemorySize(n)} 
                />
              </div>
              <div className="text-sm text-gray-400">{t('memory.total.requirement')}</div>
            </div>

            {/* 显存分解 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('memory.breakdown')}
              </h4>
              
              <div className="space-y-4">
                {memoryResult.breakdown.map((item, index) => (
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
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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

            {/* 多模态特性说明 */}
            <div className="glass-card p-4 space-y-2">
              <h4 className="text-sm font-medium text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {config.modalityType?.replace(/-/g, '+').toUpperCase() || t('mode.multimodal')} {t('multimodal.features')}
              </h4>
              <ul className="text-xs text-gray-400 space-y-1">
                {config.modalityType?.includes('text') && <li>• {t('multimodal.features.text')}</li>}
                {config.modalityType?.includes('image') && <li>• {t('multimodal.features.image')}</li>}
                {config.modalityType?.includes('audio') && <li>• {t('multimodal.features.audio')}</li>}
                {config.modalityType?.includes('video') && <li>• {t('multimodal.features.video')}</li>}
                <li>• {t('multimodal.features.attention')}</li>
                {(config.modalityType?.includes('image') || config.modalityType?.includes('video')) && 
                  <li>• {t('multimodal.features.vision.shared')}</li>}
                {config.modalityType?.includes('audio') && 
                  <li>• {t('multimodal.features.audio.spectrum')}</li>}
                <li>• {t('multimodal.features.cache')}</li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 