'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Copy, Check, AlertTriangle, Zap } from 'lucide-react';
import {
  computeParallelism,
  formatVRAMSize,
  STRATEGY_LABELS,
  STRATEGY_DESC,
  ParallelismConfig,
} from '@/utils/parallelism-formulas';
import { GPU_DATABASE } from '@/lib/models-data';
import { GPU } from '@/types';

// 从 GPU_DATABASE 中过滤数据中心级 GPU（只保留 HBM/NVLink 系卡，适合多机并行）
const DATACENTER_ARCH = ['Blackwell', 'Hopper', 'Ampere', 'Volta'];
const EXCLUDED_IDS = ['rtx-5090d', 'rtx-4090', 'rtx-4090d', 'rtx-3090', 'pnv5b', 'l40'];

const GPU_OPTIONS = GPU_DATABASE
  .filter(g =>
    DATACENTER_ARCH.includes(g.architecture) &&
    !EXCLUDED_IDS.includes(g.id) &&
    (g.features?.some(f => f.includes('NVLink') || f.includes('HBM')) ?? false)
  )
  .map(g => ({ id: g.id, name: g.name, vram: g.memory, bandwidth: g.bandwidth ?? 0, fp16Tflops: g.fp16Tflops ?? 0, architecture: g.architecture }));

export interface ParallelismAdvisorProps {
  requiredMemoryGB: number;
  isMoE?: boolean;
  seqLen?: number;
  /** 当并行配置或 GPU 发生变化时回调，供父组件同步"性能与内存结果" */
  onConfigChange?: (gpu: GPU, config: ParallelismConfig) => void;
}

export function ParallelismAdvisor({
  requiredMemoryGB,
  isMoE = false,
  seqLen = 4096,
  onConfigChange,
}: ParallelismAdvisorProps) {
  const [selectedGpuId, setSelectedGpuId] = useState(GPU_OPTIONS[0]?.id ?? '');
  const [gpusPerNode, setGpusPerNode] = useState(8);
  const [nodes, setNodes] = useState<number | null>(null);
  const [copiedVllm, setCopiedVllm] = useState(false);
  const [copiedTrt, setCopiedTrt] = useState(false);

  const selectedGpu = GPU_OPTIONS.find(g => g.id === selectedGpuId) || GPU_OPTIONS[0];

  const autoNodes = useMemo(() => {
    const nodeVRAM = selectedGpu.vram * gpusPerNode;
    return Math.max(1, Math.ceil(requiredMemoryGB / nodeVRAM));
  }, [requiredMemoryGB, selectedGpu.vram, gpusPerNode]);

  const effectiveNodes = nodes !== null ? nodes : autoNodes;

  const config = useMemo(() => computeParallelism({
    requiredGB: requiredMemoryGB,
    gpuVRAM: selectedGpu.vram,
    gpuName: selectedGpu.name,
    gpusPerNode,
    isMoE,
    seqLen,
  }), [requiredMemoryGB, selectedGpu, gpusPerNode, isMoE, seqLen]);

  const overrideConfig = useMemo((): ParallelismConfig => {
    if (nodes === null) return config;
    return {
      ...config,
      pp: effectiveNodes,
      totalGPUs: gpusPerNode * effectiveNodes,
      totalNodes: effectiveNodes,
      totalVRAM: gpusPerNode * effectiveNodes * selectedGpu.vram,
      headroom: gpusPerNode * effectiveNodes * selectedGpu.vram - requiredMemoryGB,
      vllmFlags: [
        `--tensor-parallel-size ${gpusPerNode}`,
        effectiveNodes > 1 ? `--pipeline-parallel-size ${effectiveNodes}` : null,
        `--max-model-len ${seqLen}`,
      ].filter(Boolean).join(' \\\n  '),
      trtllmFlags: [
        'trtllm-build',
        `--tp_size ${gpusPerNode}`,
        effectiveNodes > 1 ? `--pp_size ${effectiveNodes}` : null,
        `--max_seq_len ${seqLen}`,
      ].filter(Boolean).join(' \\\n  '),
    };
  }, [nodes, config, effectiveNodes, gpusPerNode, selectedGpu.vram, requiredMemoryGB, seqLen]);

  // 构造虚拟多节点 GPU 供"性能与内存结果"使用（使用 GPU_DATABASE 中的真实带宽/算力）
  const virtualGpu = useMemo((): GPU => {
    const efficiencyFactor = overrideConfig.totalNodes > 1 ? 0.7 : 0.85; // 跨节点通信损耗
    return {
      id: `parallel-${selectedGpuId}`,
      name: `${selectedGpu.name} × ${overrideConfig.totalGPUs} (${overrideConfig.totalNodes} 节点)`,
      memory: overrideConfig.totalVRAM,
      architecture: selectedGpu.architecture,
      computeCapability: GPU_DATABASE.find(g => g.id === selectedGpuId)?.computeCapability ?? '8.0',
      bandwidth: selectedGpu.bandwidth * overrideConfig.totalGPUs * efficiencyFactor,
      fp16Tflops: selectedGpu.fp16Tflops * overrideConfig.totalGPUs * efficiencyFactor,
      features: ['Multi-Node', overrideConfig.strategy.toUpperCase()],
      price: 0,
    };
  }, [selectedGpuId, selectedGpu, overrideConfig]);

  // 通知父组件
  useEffect(() => {
    onConfigChange?.(virtualGpu, overrideConfig);
  }, [virtualGpu, overrideConfig, onConfigChange]);

  const meetsRequirement = overrideConfig.headroom >= 0;

  const copyToClipboard = (text: string, type: 'vllm' | 'trt') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'vllm') { setCopiedVllm(true); setTimeout(() => setCopiedVllm(false), 2000); }
      else { setCopiedTrt(true); setTimeout(() => setCopiedTrt(false), 2000); }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* 策略说明 */}
      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-700 dark:text-indigo-300">
        <span className="font-semibold">{STRATEGY_LABELS[config.strategy]}：</span>
        {STRATEGY_DESC[config.strategy]}
      </div>

      {/* 配置选项 */}
      <div className="grid grid-cols-1 gap-4">
        {/* GPU 型号 */}
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">GPU 型号</label>
          <div className="flex flex-wrap gap-1.5">
            {GPU_OPTIONS.map(g => (
              <button
                key={g.id}
                onClick={() => { setSelectedGpuId(g.id); setNodes(null); }}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  selectedGpuId === g.id
                    ? 'bg-brand/20 border-brand/50 text-brand font-semibold'
                    : 'bg-white/10 border-white/30 text-gray-700 dark:text-gray-200 hover:border-white/50 hover:bg-white/20'
                }`}
              >
                {g.name}
                <span className="ml-1 opacity-70">{g.vram}G</span>
              </button>
            ))}
          </div>
        </div>

        {/* 每节点卡数 */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">每节点卡数</label>
          <div className="flex gap-2">
            {[4, 8].map(n => (
              <button
                key={n}
                onClick={() => { setGpusPerNode(n); setNodes(null); }}
                className={`px-4 py-1.5 text-sm rounded-lg border transition-all ${
                  gpusPerNode === n
                    ? 'bg-brand/20 border-brand/50 text-brand font-semibold'
                    : 'bg-white/10 border-white/30 text-gray-700 dark:text-gray-200 hover:border-white/50 hover:bg-white/20'
                }`}
              >
                {n} 卡
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 节点数滑块 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">节点数量</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-brand">{effectiveNodes}</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">节点</span>
            {nodes !== null && (
              <button
                onClick={() => setNodes(null)}
                className="text-xs text-gray-500 hover:text-brand transition-colors ml-1"
              >
                重置
              </button>
            )}
          </div>
        </div>
        <input
          type="range"
          min={1} max={16} step={1}
          value={effectiveNodes}
          onChange={e => setNodes(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand"
        />
        {/* 刻度：按百分比精确定位，与滑块 thumb 对齐 */}
        <div className="relative h-6">
          {[1,2,4,6,8,10,12,14,16].map(n => {
            const pct = ((n - 1) / (16 - 1)) * 100;
            return (
              <button
                key={n}
                onClick={() => setNodes(n)}
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                className={`absolute w-6 h-6 rounded-full text-center transition-all text-xs ${
                  n === effectiveNodes
                    ? 'bg-brand text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* 显存结果 */}
      {(() => {
        // 不足时：保守取整；满足时：余量向下取整（保守）
        const shortfallRaw = -overrideConfig.headroom; // > 0 表示不足
        const shortfallGB = Math.floor(shortfallRaw) + 1; // 保守取整为整数
        const extraCards = Math.ceil(shortfallGB / selectedGpu.vram);
        const extraNodes = Math.ceil(extraCards / gpusPerNode);
        const headroomGB = Math.floor(overrideConfig.headroom); // 余量向下取整
        return (
          <div className={`p-4 rounded-xl border ${
            meetsRequirement
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-red-500/10 border-red-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {effectiveNodes} 节点 × {gpusPerNode}×{selectedGpu.name}
                  = <span className="font-mono text-brand">{formatVRAMSize(overrideConfig.totalVRAM)}</span>
                </div>
                <div className={`text-xs font-medium ${meetsRequirement ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {meetsRequirement
                    ? `✅ 满足需求，余量 +${formatVRAMSize(headroomGB)}`
                    : `❌ 显存不足，至少还需 ${shortfallGB} GB（约 ${extraCards} 张 ${selectedGpu.name}，${extraNodes} 节点）`
                  }
                </div>
              </div>
              <div className="text-right text-xs text-gray-600 dark:text-gray-300 space-y-0.5 font-mono">
                <div>TP = {overrideConfig.tp}</div>
                <div>PP = {overrideConfig.pp}</div>
                {isMoE && <div>EP = {gpusPerNode}</div>}
                <div>总 GPU = {overrideConfig.totalGPUs}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 互联警告 */}
      {overrideConfig.warning && (
        <div className="flex gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-700 dark:text-orange-300">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{overrideConfig.warning}</span>
        </div>
      )}

      {/* 启动参数 */}
      <div className="space-y-3">
        <ParamBlock
          title="vLLM 启动参数"
          content={overrideConfig.vllmFlags}
          copied={copiedVllm}
          onCopy={() => copyToClipboard(overrideConfig.vllmFlags, 'vllm')}
        />
        <ParamBlock
          title="TensorRT-LLM 构建参数"
          content={overrideConfig.trtllmFlags}
          copied={copiedTrt}
          onCopy={() => copyToClipboard(overrideConfig.trtllmFlags, 'trt')}
        />
      </div>

      {/* 互联带宽说明 */}
      <div className="text-xs space-y-1 pt-2 border-t border-white/20">
        <div className="font-semibold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          互联带宽建议
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-300">
          <span>🔗 节点内（有 NVLink）</span><span>→ 优先 TP</span>
          <span>🔗 节点内（仅 PCIe）</span><span>→ 优先 PP</span>
          <span>🌐 跨节点</span><span>→ InfiniBand + GPUDirect RDMA</span>
          <span>🤖 MoE 模型</span><span>→ EP+TP，节点内 NVLink</span>
        </div>
      </div>
    </motion.div>
  );
}

// 参数代码块子组件
function ParamBlock({ title, content, copied, onCopy }: {
  title: string;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</span>
        <button
          onClick={onCopy}
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-all ${
            copied
              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-white/20 border border-white/30 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="text-xs font-mono bg-gray-900 dark:bg-black/60 border border-gray-700/50 rounded-lg p-3 overflow-x-auto text-green-300 leading-relaxed whitespace-pre-wrap break-all">
        {content}
      </pre>
    </div>
  );
}
