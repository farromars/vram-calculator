/**
 * MCP (Model Context Protocol) 相关类型定义
 */

import { z } from 'zod';

// ===== 基础类型 =====

/**
 * 显存计算模式
 */
export type VRAMCalculationMode = 'inference' | 'training' | 'finetuning' | 'grpo' | 'multimodal';

/**
 * 精度类型
 */
export type PrecisionType = 'fp32' | 'fp16' | 'bf16' | 'int8' | 'int4';

/**
 * 量化类型
 */
export type QuantizationType = 'none' | 'int8' | 'int4';

/**
 * 优化器类型
 */
export type OptimizerType = 'sgd' | 'adam' | 'adamw';

/**
 * 微调方法类型
 */
export type FineTuningMethod = 'full' | 'lora' | 'qlora' | 'prefix';

// ===== 计算参数类型 =====

/**
 * 推理计算参数
 */
export const InferenceParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).describe('序列长度'),
  precision: z.enum(['fp32', 'fp16', 'bf16', 'int8', 'int4']).describe('精度类型'),
  quantization: z.enum(['none', 'int8', 'int4']).describe('量化类型'),
});

export type InferenceParams = z.infer<typeof InferenceParamsSchema>;

/**
 * 训练计算参数
 */
export const TrainingParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).describe('序列长度'),
  precision: z.enum(['fp32', 'fp16', 'bf16']).describe('训练精度'),
  optimizer: z.enum(['sgd', 'adam', 'adamw']).describe('优化器类型'),
  gradientCheckpointing: z.boolean().describe('是否启用梯度检查点'),
});

export type TrainingParams = z.infer<typeof TrainingParamsSchema>;

/**
 * 微调计算参数
 */
export const FineTuningParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).describe('序列长度'),
  precision: z.enum(['fp32', 'fp16', 'bf16']).describe('训练精度'),
  method: z.enum(['full', 'lora', 'qlora', 'prefix']).describe('微调方法'),
  loraRank: z.number().min(1).optional().describe('LoRA rank (仅LoRA/QLoRA)'),
  quantization: z.enum(['none', 'int8', 'int4']).optional().describe('量化类型 (仅QLoRA)'),
});

/**
 * 高级微调计算参数
 */
export const AdvancedFineTuningParamsSchema = z.object({
  modelType: z.enum(['nlp', 'multimodal', 'moe', 'cnn']).describe('模型类型'),
  modelSize: z.number().min(0.001).describe('模型大小(B)'),
  architectureType: z.string().describe('架构类型'),
  precision: z.enum(['fp32', 'fp16', 'bf16', 'int8', 'int4']).describe('训练精度'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).optional().describe('序列长度'),
  learningRate: z.number().min(1e-8).max(1).describe('学习率'),
  optimizer: z.enum(['sgd', 'adam', 'adamw']).describe('优化器类型'),
  trainingEpochs: z.number().min(1).describe('训练轮数'),

  // NLP特有参数
  vocabSize: z.number().optional().describe('词汇表大小'),
  numAttentionHeads: z.number().optional().describe('注意力头数'),
  hiddenSize: z.number().optional().describe('隐藏层维度'),
  numLayers: z.number().optional().describe('层数'),
  loraRank: z.number().optional().describe('LoRA秩'),
  loraAlpha: z.number().optional().describe('LoRA缩放系数'),

  // 多模态特有参数
  imageResolution: z.number().optional().describe('图像分辨率'),
  patchSize: z.number().optional().describe('图像块大小'),
  visionFeatureDim: z.number().optional().describe('视觉特征维度'),

  // MoE特有参数
  numExperts: z.number().optional().describe('专家数量'),
  numActiveExperts: z.number().optional().describe('激活专家数量'),
  expertCapacityFactor: z.number().optional().describe('专家容量因子'),

  // CNN特有参数
  inputImageSize: z.number().optional().describe('输入图像尺寸'),
  kernelSize: z.number().optional().describe('卷积核大小'),

  // 优化参数
  weightDecay: z.number().optional().describe('权重衰减'),
  warmupSteps: z.number().optional().describe('预热步数'),
  gradientClipping: z.number().optional().describe('梯度裁剪'),
  dropoutRate: z.number().optional().describe('Dropout率'),

  // 语言参数
  language: z.enum(['zh', 'en']).optional().describe('界面语言'),
});

export type FineTuningParams = z.infer<typeof FineTuningParamsSchema>;

export type AdvancedFineTuningParams = z.infer<typeof AdvancedFineTuningParamsSchema>;

/**
 * GRPO计算参数
 */
export const GRPOParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  batchSize: z.number().min(1).describe('批次大小'),
  sequenceLength: z.number().min(1).describe('序列长度'),
  precision: z.enum(['fp32', 'fp16', 'bf16']).describe('训练精度'),
  numGenerations: z.number().min(2).describe('偏好组大小'),
  method: z.enum(['lora', 'qlora', 'prefix']).describe('PEFT方法'),
  loraRank: z.number().min(1).optional().describe('LoRA rank'),
  quantization: z.enum(['int8', 'int4']).describe('基础模型量化'),
});

export type GRPOParams = z.infer<typeof GRPOParamsSchema>;

/**
 * 多模态计算参数
 */
export const MultimodalParamsSchema = z.object({
  modelId: z.string().describe('模型ID'),
  batchSize: z.number().min(1).describe('批次大小'),
  textTokens: z.number().min(1).describe('文本Token数量'),
  imageCount: z.number().min(0).describe('图像数量'),
  imageResolution: z.number().min(224).describe('图像分辨率'),
  audioSeconds: z.number().min(0).describe('音频时长(秒)'),
  videoFrames: z.number().min(0).describe('视频帧数'),
  precision: z.enum(['fp32', 'fp16', 'bf16']).describe('精度类型'),
  mode: z.enum(['inference', 'training', 'finetuning']).describe('计算模式'),
});

export type MultimodalParams = z.infer<typeof MultimodalParamsSchema>;

// ===== 计算结果类型 =====

/**
 * 显存计算结果
 */
export interface VRAMCalculationResult {
  totalVRAM: number;
  breakdown: {
    modelWeights: number;
    optimizer?: number;
    gradients?: number;
    activations: number;
    kvCache?: number;
    other: number;
  };
  recommendations: {
    gpus: Array<{
      name: string;
      vram: number;
      utilization: number;
      price?: number;
    }>;
    optimizations: string[];
  };
}

/**
 * GPU推荐参数
 */
export const GPURecommendationParamsSchema = z.object({
  vramRequired: z.number().min(1).describe('所需显存(GB)'),
  budget: z.number().min(0).optional().describe('预算限制'),
  useCase: z.enum(['inference', 'training', 'development']).describe('使用场景'),
  multiGPU: z.boolean().default(false).describe('是否考虑多GPU'),
});

export type GPURecommendationParams = z.infer<typeof GPURecommendationParamsSchema>;

/**
 * 成本分析参数
 */
export const CostAnalysisParamsSchema = z.object({
  gpuName: z.string().describe('GPU名称'),
  hours: z.number().min(0).describe('使用时长(小时)'),
  provider: z.enum(['cloud', 'local']).describe('服务提供商'),
});

export type CostAnalysisParams = z.infer<typeof CostAnalysisParamsSchema>;

// ===== MCP资源类型 =====

/**
 * 模型信息
 */
export interface ModelInfo {
  id: string;
  name: string;
  parameters: number;
  architecture: string;
  category: 'nlp' | 'multimodal' | 'embedding';
  description: string;
  contextLength: number;
  hiddenSize: number;
  numLayers: number;
}

/**
 * GPU规格信息
 */
export interface GPUSpec {
  name: string;
  vram: number;
  architecture: string;
  computeCapability: string;
  price?: {
    msrp: number;
    cloud?: number;
  };
  performance: {
    fp32: number;
    fp16: number;
    int8: number;
  };
}

// ===== MCP提示模板类型 =====

/**
 * 优化建议提示参数
 */
export const OptimizationPromptParamsSchema = z.object({
  calculationResult: z.string().describe('计算结果JSON'),
  targetVRAM: z.number().optional().describe('目标显存限制'),
  useCase: z.string().describe('使用场景描述'),
});

export type OptimizationPromptParams = z.infer<typeof OptimizationPromptParamsSchema>;

/**
 * GPU选择指导提示参数
 */
export const GPUSelectionPromptParamsSchema = z.object({
  requirements: z.string().describe('需求描述'),
  budget: z.number().optional().describe('预算限制'),
  useCase: z.enum(['inference', 'training', 'development']).describe('使用场景'),
});

export type GPUSelectionPromptParams = z.infer<typeof GPUSelectionPromptParamsSchema>;
