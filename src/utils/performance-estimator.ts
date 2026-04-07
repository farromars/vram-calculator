import { GPU, ModelInfo, PrecisionType, QuantizationType } from '@/types';
import { getPrecisionBytes, getQuantizationRatio } from './memory-formulas';

/**
 * 性能估算结果
 */
export interface PerformanceEstimate {
  tps: number;           // 生成速度 tokens/sec (decode阶段)
  tpotMs: number;        // 每token延迟 ms
  ttftMs: number;        // 首个令牌时间 ms (prefill阶段)
  throughput: number;    // 总吞吐量 tokens/sec (考虑batch)
  performanceMode: string; // 性能模式描述
}

/**
 * LLM 推理性能估算
 *
 * 核心公式（基于内存带宽受限/计算受限的 LLM 推理分析模型）:
 *
 * Decode 阶段（内存带宽受限 memory-bound）:
 *   TPOT = modelSizeBytes / (bandwidth × MFU) 
 *   TPS = 1 / TPOT
 *
 * Prefill 阶段（计算受限 compute-bound）:
 *   TTFT = 2 × params × inputTokens / (fp16Tflops × 1e12 × MFU)
 *
 * MFU (Model FLOPs Utilization): 实际利用率，消费级GPU约 0.15-0.25, 专业级约 0.3-0.5
 */
export function estimateInferencePerformance(
  gpu: GPU,
  modelInfo: ModelInfo,
  config: {
    precision: PrecisionType;
    quantization: QuantizationType;
    batchSize: number;
    sequenceLength: number;
  }
): PerformanceEstimate {
  const bandwidth = gpu.bandwidth || estimateBandwidth(gpu);
  const fp16Tflops = gpu.fp16Tflops || estimateFp16Tflops(gpu);

  const paramBytes = getPrecisionBytes(config.precision);
  const quantRatio = getQuantizationRatio(config.quantization);
  const modelSizeBytes = modelInfo.params * 1e9 * paramBytes * quantRatio;
  const modelSizeGB = modelSizeBytes / (1024 ** 3);

  // MFU 估算：基于GPU架构和类型
  const mfu = estimateMFU(gpu);

  // === Decode 阶段: 内存带宽受限 ===
  // 每生成一个token需要读取全部模型权重一次
  // TPOT(s) = modelSizeGB / (bandwidth_GB_s × mfu)
  const effectiveBandwidth = bandwidth * mfu;
  const tpotSeconds = modelSizeGB / effectiveBandwidth;
  const tpotMs = tpotSeconds * 1000;
  const tps = 1 / tpotSeconds;

  // === Prefill 阶段: 计算受限 ===
  // FLOPs = 2 × params × input_tokens × batch_size（prefill 时所有请求同时处理）
  const prefillFlops = 2 * modelInfo.params * 1e9 * config.sequenceLength * config.batchSize;
  const effectiveFlops = fp16Tflops * 1e12 * mfu;
  const ttftSeconds = prefillFlops / effectiveFlops;
  const ttftMs = ttftSeconds * 1000;

  // === 总吞吐量 (考虑batch) ===
  // batch推理时，吞吐量近似线性增长（受限于显存）
  const batchEfficiency = Math.min(1.0, 0.85 + 0.15 / config.batchSize);
  const throughput = tps * config.batchSize * batchEfficiency;

  // 性能模式判断
  const computeIntensity = (2 * modelInfo.params * 1e9) / modelSizeBytes;
  const performanceMode = computeIntensity > (fp16Tflops * 1e12 / (bandwidth * 1e9))
    ? '为最低延迟优化'
    : '为最大吞吐优化';

  return {
    tps: Math.round(tps * 10) / 10,
    tpotMs: Math.round(tpotMs * 10) / 10,
    ttftMs: Math.round(ttftMs * 10) / 10,
    throughput: Math.round(throughput * 10) / 10,
    performanceMode,
  };
}

/**
 * 估算 MFU（实际算力利用率）
 * 消费级 GPU: 0.15-0.25
 * 专业级 GPU (A100/H100): 0.3-0.5
 */
function estimateMFU(gpu: GPU): number {
  const arch = gpu.architecture.toLowerCase();
  if (arch.includes('hopper')) return 0.40;
  if (arch.includes('blackwell')) return 0.35;
  if (arch.includes('ada') && gpu.memory >= 24) return 0.30;
  if (arch.includes('ada')) return 0.22;
  if (arch.includes('ampere') && gpu.memory >= 40) return 0.30;
  if (arch.includes('ampere')) return 0.20;
  if (arch.includes('volta')) return 0.25;
  if (arch.includes('turing')) return 0.18;
  return 0.15;
}

/**
 * 回退估算：根据显存大小和架构粗略估算带宽
 */
function estimateBandwidth(gpu: GPU): number {
  if (gpu.memory >= 80) return 2000;
  if (gpu.memory >= 40) return 1000;
  if (gpu.memory >= 24) return 700;
  if (gpu.memory >= 16) return 500;
  if (gpu.memory >= 12) return 400;
  return 300;
}

/**
 * 回退估算：根据显存大小和架构粗略估算FP16算力
 */
function estimateFp16Tflops(gpu: GPU): number {
  if (gpu.memory >= 80) return 300;
  if (gpu.memory >= 40) return 150;
  if (gpu.memory >= 24) return 80;
  if (gpu.memory >= 16) return 50;
  if (gpu.memory >= 12) return 40;
  return 25;
}

/**
 * 获取注意力结构描述
 */
export function getAttentionType(modelInfo: ModelInfo): string {
  const name = modelInfo.name.toLowerCase();
  if (name.includes('deepseek')) return 'MLA';
  if (name.includes('llama') || name.includes('qwen') || name.includes('mistral')) return 'GQA';
  if (name.includes('glm')) return 'MQA';
  return 'MHA';
}

/**
 * 获取位置编码类型
 */
export function getPositionEncoding(modelInfo: ModelInfo): string {
  const name = modelInfo.name.toLowerCase();
  if (name.includes('glm')) return 'Rotary';
  return 'RoPE';
}
