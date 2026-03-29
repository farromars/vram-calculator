'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Activity, Info } from 'lucide-react';
import { GPU, ModelInfo } from '@/types';
import { PerfConfig } from '@/components/gpu-recommendations';
import { estimateInferencePerformance, getAttentionType, getPositionEncoding } from '@/utils/performance-estimator';
import { formatMemorySize } from '@/utils/memory-formulas';

interface PerformanceMemoryCardProps {
  gpu: GPU;
  modelInfo: ModelInfo;
  perfConfig: PerfConfig;
  requiredMemoryGB: number;
}

export function PerformanceMemoryCard({
  gpu,
  modelInfo,
  perfConfig,
  requiredMemoryGB,
}: PerformanceMemoryCardProps) {
  const perf = useMemo(
    () =>
      estimateInferencePerformance(gpu, modelInfo, {
        precision: perfConfig.precision,
        quantization: perfConfig.quantization,
        batchSize: perfConfig.batchSize,
        sequenceLength: perfConfig.sequenceLength,
      }),
    [gpu, modelInfo, perfConfig]
  );

  const utilizationPercent = Math.min(100, (requiredMemoryGB / gpu.memory) * 100);
  const ringColor = utilizationPercent <= 70 ? '#84cc16' : utilizationPercent <= 90 ? '#f59e0b' : '#ef4444';

  // SVG 环形图参数
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - utilizationPercent / 100);

  const precisionLabel = perfConfig.quantization !== 'None' ? perfConfig.quantization : perfConfig.precision;
  const attentionType = getAttentionType(modelInfo);
  const posEncoding = getPositionEncoding(modelInfo);

  return (
    <motion.div
      className="glass-card p-6 mb-4 border-2 border-brand/30 bg-gradient-to-r from-brand/5 to-transparent"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-lg font-semibold mb-5 text-tc-text-primary">性能与内存结果</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：环形图 */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
              <circle
                cx="64" cy="64" r={radius}
                fill="none" stroke="#e5e7eb" strokeWidth="10"
              />
              <motion.circle
                cx="64" cy="64" r={radius}
                fill="none" stroke={ringColor} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: ringColor }}>
                {utilizationPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">显存</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="text-2xl font-bold text-tc-text-primary">
              {formatMemorySize(requiredMemoryGB)}
            </div>
            <div className="text-sm text-brand">
              共 {gpu.memory} GB 显存
            </div>
          </div>
        </div>

        {/* 中间：性能指标 */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-tc-text-primary">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">生成速度: ~{perf.tps} tok/sec</span>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              (约{perf.tpotMs} 毫秒/每token延迟)
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-tc-text-primary">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">首个令牌时间: ~{perf.ttftMs}ms</span>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-tc-text-primary">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">总吞吐量: ~{perf.throughput} tok/sec</span>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          </div>

          <div className="text-sm text-brand mt-1">
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            {perf.performanceMode}
          </div>
        </div>

        {/* 右侧：模型配置信息 */}
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="text-base font-semibold text-tc-text-primary text-center">
            {modelInfo.name}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>权重:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-brand/40 text-brand text-xs font-medium">
              {precisionLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>KV缓存:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-brand/40 text-brand text-xs font-medium">
              {perfConfig.precision}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>注意力结构:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-brand/40 text-brand text-xs font-medium">
              {attentionType}
            </span>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>位置编码:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-brand/40 text-brand text-xs font-medium">
              {posEncoding}
            </span>
          </div>

          <div className="text-sm text-brand mt-1">
            模式: {perfConfig.mode} | 批量: {perfConfig.batchSize}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
