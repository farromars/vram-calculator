'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Gpu, Zap, AlertTriangle, CheckCircle, Star, MousePointerClick } from 'lucide-react';
import { AnimatedNumber } from '@/components/animated-number';
import { getGPURecommendations, GPU_DATABASE } from '@/lib/models-data';
import { formatMemorySize, assessMemoryUsage } from '@/utils/memory-formulas';
import { useLanguage } from '@/contexts/language-context';
import { PerformanceMemoryCard } from '@/components/performance-memory-card';
import { GPU, ModelInfo, PrecisionType, QuantizationType } from '@/types';

export interface PerfConfig {
  precision: PrecisionType;
  quantization: QuantizationType;
  batchSize: number;
  sequenceLength: number;
  mode: string;
}

interface GPURecommendationsProps {
  requiredMemoryGB: number;
  title?: string;
  modelInfo?: ModelInfo | null;
  perfConfig?: PerfConfig | null;
}

export function GPURecommendations({ requiredMemoryGB, title, modelInfo, perfConfig }: GPURecommendationsProps) {
  const [selectedGpuId, setSelectedGpuId] = useState<string | null>(null);
  const [gpuCount, setGpuCount] = useState(1);
  const { t } = useLanguage();
  
  const displayTitle = title || t('gpu.recommendations');

  // 所有GPU按显存从大到小排列（不再过滤，让用户自由选择多卡组合）
  const allGpusSorted = useMemo(() => {
    return GPU_DATABASE
      .map(gpu => {
        const totalMem = gpu.memory * gpuCount;
        return {
          ...gpu,
          usage: assessMemoryUsage(requiredMemoryGB, totalMem),
          fitScore: totalMem >= requiredMemoryGB
            ? (100 - ((totalMem - requiredMemoryGB) / totalMem) * 50)
            : Math.max(0, (totalMem / requiredMemoryGB) * 50),
        };
      })
      .sort((a, b) => {
        const aMeets = a.memory * gpuCount >= requiredMemoryGB;
        const bMeets = b.memory * gpuCount >= requiredMemoryGB;
        if (aMeets && !bMeets) return -1;
        if (!aMeets && bMeets) return 1;
        if (aMeets && bMeets) {
          const aOpt = Math.abs(a.usage.utilizationRate - 80);
          const bOpt = Math.abs(b.usage.utilizationRate - 80);
          return aOpt - bOpt;
        }
        return b.memory - a.memory;
      });
  }, [requiredMemoryGB, gpuCount]);

  // 当前选中的GPU
  const activeGpu = useMemo(() => {
    if (selectedGpuId) {
      return GPU_DATABASE.find(g => g.id === selectedGpuId) || null;
    }
    return allGpusSorted[0] || null;
  }, [selectedGpuId, allGpusSorted]);

  const activeGpuId = selectedGpuId || allGpusSorted[0]?.id || null;
  const activeTotalMemory = activeGpu ? activeGpu.memory * gpuCount : 0;

  const handleGpuSelect = (gpuId: string) => {
    setSelectedGpuId(prev => prev === gpuId ? null : gpuId);
  };

  // 构造一个虚拟的"多卡GPU"传给性能卡片
  const activeGpuForPerf = useMemo((): GPU | null => {
    if (!activeGpu) return null;
    if (gpuCount === 1) return activeGpu;
    return {
      ...activeGpu,
      name: `${activeGpu.name} × ${gpuCount}`,
      memory: activeGpu.memory * gpuCount,
      bandwidth: (activeGpu.bandwidth || 0) * gpuCount * 0.85, // 多卡通信损耗约15%
      fp16Tflops: (activeGpu.fp16Tflops || 0) * gpuCount * 0.80, // 多卡并行效率约80%
    };
  }, [activeGpu, gpuCount]);

  const getUtilizationColor = (rate: number) => {
    if (rate <= 70) return 'text-green-500';
    if (rate <= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getUtilizationIcon = (rate: number) => {
    if (rate <= 70) return CheckCircle;
    if (rate <= 90) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl glass-card">
          <Gpu className="w-5 h-5 text-indigo-500" />
        </div>
        <h3 className="text-xl font-semibold">{displayTitle}</h3>
        <div className="ml-auto text-sm text-gray-600">
          {t('gpu.requirement')}: <span className="font-mono text-indigo-600">{formatMemorySize(requiredMemoryGB)}</span>
        </div>
      </div>

      {/* 性能与内存结果卡片 */}
      {activeGpuForPerf && modelInfo && perfConfig && (
        <PerformanceMemoryCard
          gpu={activeGpuForPerf}
          modelInfo={modelInfo}
          perfConfig={perfConfig}
          requiredMemoryGB={requiredMemoryGB}
        />
      )}

      {/* GPU 数量滑块 */}
      <div className="mb-6 p-4 glass-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gpu className="w-4 h-4 text-cyan-500" />
            <span className="font-medium">GPU 数量</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-brand font-mono">{gpuCount}</span>
            <span className="text-sm text-gray-500">卡</span>
            {activeGpu && (
              <span className="text-xs text-gray-400 ml-2">
                (总显存 <span className="font-mono text-brand font-medium">{activeTotalMemory} GB</span>)
              </span>
            )}
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={gpuCount}
          onChange={(e) => setGpuCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <button
              key={n}
              onClick={() => setGpuCount(n)}
              className={`w-6 h-6 rounded-full text-center transition-all ${
                n === gpuCount
                  ? 'bg-brand text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {gpuCount > 1 && (
          <div className="mt-3 text-xs text-gray-500 bg-gray-500/5 p-2.5 rounded-lg">
            💡 多卡并行时，通信开销约 15~20%，实际可用带宽和算力会低于理论值之和。
          </div>
        )}
      </div>

      {/* GPU 推荐列表 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gpu className="w-4 h-4 text-indigo-500" />
          <h4 className="font-medium">GPU 推荐</h4>
          <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
            <MousePointerClick className="w-3 h-3" />
            点击选择显卡查看性能估算
          </span>
        </div>

        <div className="space-y-4">
          {allGpusSorted.map((gpu, index) => {
            const UtilizationIcon = getUtilizationIcon(gpu.usage.utilizationRate);
            const totalMem = gpu.memory * gpuCount;
            const meetsRequirement = totalMem >= requiredMemoryGB;
            const isAutoRecommended = index === 0 && meetsRequirement;
            const isSelected = gpu.id === activeGpuId;
            const utilizationRate = (requiredMemoryGB / totalMem) * 100;
            
            return (
              <motion.div
                key={gpu.id}
                onClick={() => handleGpuSelect(gpu.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand/15 to-indigo-500/15 border-brand/50 ring-2 ring-brand/30'
                    : meetsRequirement
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
                      : 'bg-red-500/5 border-red-200/30 hover:bg-red-500/10'
                }`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
              >
                {/* 标签 */}
                {isAutoRecommended && !selectedGpuId && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t('gpu.best.recommendation')}
                  </div>
                )}
                {isSelected && selectedGpuId && (
                  <div className="absolute -top-2 -right-2 bg-brand text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    已选择
                  </div>
                )}
                {!meetsRequirement && !isSelected && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                    显存不足
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{gpu.name}</h4>
                      <span className="text-xs text-gray-500 font-mono">{gpu.architecture}</span>
                      {gpuCount > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">
                          × {gpuCount} = {totalMem} GB
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">{gpuCount > 1 ? '单卡显存' : '显存容量'}</div>
                        <div className="font-mono font-medium">
                          <AnimatedNumber value={gpu.memory} format={(n) => `${n}GB`} />
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-xs">{gpuCount > 1 ? '总显存利用率' : '显存利用率'}</div>
                        <div className={`font-mono font-medium flex items-center gap-1 ${
                          meetsRequirement ? getUtilizationColor(utilizationRate) : 'text-red-500'
                        }`}>
                          {meetsRequirement
                            ? <><UtilizationIcon className="w-3 h-3" />{utilizationRate.toFixed(1)}%</>
                            : <><AlertTriangle className="w-3 h-3" />{utilizationRate.toFixed(0)}% (超出)</>
                          }
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-xs">显存带宽</div>
                        <div className="font-mono font-medium">
                          {gpu.bandwidth ? `${gpu.bandwidth} GB/s` : '-'}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-xs">FP16 算力</div>
                        <div className="font-mono font-medium">
                          {gpu.fp16Tflops ? `${gpu.fp16Tflops} TFLOPS` : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 特性显示 */}
                    {gpu.features && gpu.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {gpu.features.map((feature, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white/10 rounded-md">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 适合度分数 */}
                  <div className="ml-4 text-center">
                    <div className={`text-2xl font-bold ${isSelected ? 'text-brand' : meetsRequirement ? 'text-indigo-600' : 'text-red-400'}`}>
                      <AnimatedNumber value={gpu.fitScore} format={(n) => n.toFixed(0)} />
                    </div>
                    <div className="text-xs text-gray-500">适合度</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* GPU选择指南 */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          {t('gpu.selection.guide')}
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <div className="font-medium text-green-600 mb-1">✓ {t('gpu.recommended.config')}</div>
            <ul className="space-y-1 text-xs">
              <li>• {t('gpu.memory.utilization.70.90')}</li>
              <li>• {t('gpu.latest.cuda.support')}</li>
              <li>• {t('gpu.cost.effective')}</li>
              {gpuCount > 1 && <li>• 多卡并行建议使用 NVLink 高速互联</li>}
            </ul>
          </div>
          <div>
            <div className="font-medium text-yellow-600 mb-1">⚠️ {t('gpu.precautions')}</div>
            <ul className="space-y-1 text-xs">
              <li>• {t('gpu.reserve.buffer')}</li>
              <li>• {t('gpu.consider.power.cooling')}</li>
              {gpuCount > 1 && <li>• 多卡通信开销约 15~20%，实际吞吐低于线性扩展</li>}
              {gpuCount > 1 && <li>• 需确认框架支持对应的并行策略 (TP/PP/DP)</li>}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
